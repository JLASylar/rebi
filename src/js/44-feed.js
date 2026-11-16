// ════════════════════════════ 首页推荐过滤 / 封面替换（治封面党） ════════════════════════════
// 过滤：按播放量、时长、发布天数、UP 主、横竖屏，把首页推荐里不想看的卡片藏起来。
// 封面替换：不显示 UP 主上传的封面，换成影片的第一帧或随机一帧。

defOpt('x.feed.minView', 0, {
  tab: 'clean',
  group: t('首頁推薦過濾'),
  label: t('播放量低於這個數就隱藏'),
  hint: t('0 = 不限'),
  unit: t('次'),
  step: 1000,
});
defOpt('x.feed.minDur', 0, {
  tab: 'clean',
  group: t('首頁推薦過濾'),
  label: t('短於這個長度就隱藏'),
  hint: t('0 = 不限'),
  unit: t('秒'),
  step: 10,
});
defOpt('x.feed.maxDur', 0, {
  tab: 'clean',
  group: t('首頁推薦過濾'),
  label: t('長於這個長度就隱藏'),
  hint: t('0 = 不限'),
  unit: t('分'),
  step: 5,
});
defOpt('x.feed.maxAge', 0, {
  tab: 'clean',
  group: t('首頁推薦過濾'),
  label: t('發布超過這麼多天就隱藏'),
  hint: t('0 = 不限'),
  unit: t('天'),
  step: 30,
});
defOpt('x.feed.noPortrait', false, {
  tab: 'clean',
  group: t('首頁推薦過濾'),
  label: t('隱藏豎屏影片'),
  hint: t('要逐個查影片資料，卡片會晚一點才消失'),
});
defOpt('x.feed.keepFollowed', true, { tab: 'clean', group: t('首頁推薦過濾'), label: t('已關注的 UP 主不過濾') });
defOpt('x.feed.ups', '', {
  tab: 'clean',
  group: t('首頁推薦過濾'),
  type: 'text',
  keep: true,
  label: t('隱藏這些 UP 主的影片'),
  hint: t('每行一個，寫 UP 主名稱或 UID'),
  placeholder: t('某某官方\n12345678'),
});
defOpt('x.cover.mode', 'off', {
  tab: 'clean',
  group: t('封面黨（激進）'),
  type: 'select',
  label: t('替換影片封面'),
  hint: t(
    '不顯示 UP 主上傳的封面，改用影片的第一幀或隨機一幀。每張卡片要多查一次資料，封面會晚一點才換；查得太多可能被 B站暫時限流。封面工具列的保存 / 放大仍是原封面',
  ),
  choices: [
    ['off', t('關')],
    ['first', t('第一幀')],
    ['random', t('隨機一幀')],
  ],
});

const FEED_OPTION_KEYS = [
  'x.feed.minView',
  'x.feed.minDur',
  'x.feed.maxDur',
  'x.feed.maxAge',
  'x.feed.noPortrait',
  'x.feed.keepFollowed',
  'x.feed.ups',
  'x.cover.mode',
];

// ── 影片资料 ──
/**
 * 查一个影片的画面尺寸和第一帧。全页共用一份缓存，同时最多 3 个请求，免得被限流。
 * @returns {Promise<{dimension: object, firstFrame: string} | null>} 查不到返回 null（不缓存，下次再查）
 */
const videoInfo = (() => {
  const MAX_PARALLEL = 3;
  const cache = new Map();
  const waiting = [];
  let running = 0;

  const fetchInfo = async (bvid) => {
    try {
      const result = await dm.getJSON(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
      if (result?.code !== 0) return null;
      // 只留用得到的两项，整份资料很大
      return { dimension: result.data.dimension, firstFrame: result.data.pages?.[0]?.first_frame || '' };
    } catch {
      return null;
    }
  };
  const pump = () => {
    while (running < MAX_PARALLEL && waiting.length) {
      const [bvid, resolve] = waiting.shift();
      running += 1;
      fetchInfo(bvid).then((info) => {
        running -= 1;
        if (!info) cache.delete(bvid);
        resolve(info);
        setTimeout(pump, 150);
      });
    }
  };

  return (bvid) => {
    if (!cache.has(bvid)) {
      cache.set(
        bvid,
        new Promise((resolve) => {
          waiting.push([bvid, resolve]);
          pump();
        }),
      );
    }
    return cache.get(bvid);
  };
})();

// ── 读卡片上的文字 ──
/** 「12.3万」「1.2亿」「4567」→ 数字 */
const parseCount = (text) => {
  const match = String(text || '')
    .replace(/,/g, '')
    .match(/([\d.]+)\s*([万亿萬億]?)/);
  if (!match) return NaN;
  const unit = { 万: 1e4, 萬: 1e4, 亿: 1e8, 億: 1e8 }[match[2]] || 1;
  return parseFloat(match[1]) * unit;
};

/** 「12:34」「1:02:03」→ 秒 */
const parseDuration = (text) => {
  const parts = String(text || '')
    .trim()
    .split(':')
    .map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return NaN;
  return parts.reduce((total, part) => total * 60 + part, 0);
};

/** 「· 3天前」「昨天」「11-9」「2024-3-1」→ 距今多少天 */
const parseAgeDays = (text) => {
  const date = String(text || '')
    .replace(/^[\s·]+/, '')
    .trim();
  if (!date) return NaN;
  if (/刚刚|分钟前|小时前|今天/.test(date)) return 0;
  if (/昨天/.test(date)) return 1;
  const daysAgo = date.match(/(\d+)\s*天前/);
  if (daysAgo) return Number(daysAgo[1]);

  const parts = date.match(/^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})$/);
  if (!parts) return NaN;
  const now = new Date();
  const published = new Date(parts[1] ? Number(parts[1]) : now.getFullYear(), Number(parts[2]) - 1, Number(parts[3]));
  // 没写年份、算出来却在未来：其实是去年的
  if (!parts[1] && published > now) published.setFullYear(published.getFullYear() - 1);
  return Math.floor((now - published) / 86400000);
};

const BVID_IN_URL = /\/video\/(BV[0-9A-Za-z]+)/;
const bvidOfCard = (card) => (card.querySelector('a[href*="/video/BV"]')?.href || '').match(BVID_IN_URL)?.[1] || '';

function setupFeed() {
  if (!IS_TOP || !(PAGE.www || PAGE.search)) return;

  // ════ 首页推荐过滤 ════
  let rules = null;
  const loadRules = () => {
    rules = {
      minViews: Number(val('x.feed.minView')) || 0,
      minSeconds: Number(val('x.feed.minDur')) || 0,
      maxSeconds: (Number(val('x.feed.maxDur')) || 0) * 60,
      maxAgeDays: Number(val('x.feed.maxAge')) || 0,
      noPortrait: !!val('x.feed.noPortrait'),
      keepFollowed: !!val('x.feed.keepFollowed'),
      blockedUps: new Set(linesOf(val('x.feed.ups'))),
    };
    rules.active = !!(
      rules.minViews ||
      rules.minSeconds ||
      rules.maxSeconds ||
      rules.maxAgeDays ||
      rules.noPortrait ||
      rules.blockedUps.size
    );
  };

  /** 判断过的卡片 → 当时它放的是哪个影片（B站会复用卡片元素换内容） */
  const judged = new WeakMap();
  const filterCard = (card) => {
    const bvid = bvidOfCard(card);
    if (!bvid || judged.get(card) === bvid) return;
    judged.set(card, bvid);
    // 藏的是卡片在网格里占的那一格
    const cell = card.closest('.feed-card') || card.closest('.bili-feed-card') || card;
    const setHidden = (hidden) => {
      // 异步结果回来时卡片可能已经换成别的影片了
      if (judged.get(card) === bvid) cell.toggleAttribute('data-bga-feed-hidden', hidden);
    };
    const textOf = (selector) => card.querySelector(selector)?.textContent || '';

    const upName = textOf('.bili-video-card__info--author').trim();
    const upUid =
      (card.querySelector('a[href*="space.bilibili.com/"]')?.href || '').match(/space\.bilibili\.com\/(\d+)/)?.[1] ||
      '';
    if (rules.blockedUps.has(upName) || (upUid && rules.blockedUps.has(upUid))) return setHidden(true);
    if (rules.keepFollowed && /已关注/.test(textOf('.bili-video-card__info--icon-text'))) return setHidden(false);

    const views = parseCount(textOf('.bili-video-card__stats--item'));
    const seconds = parseDuration(textOf('.bili-video-card__stats__duration'));
    const ageDays = parseAgeDays(textOf('.bili-video-card__info--date'));
    const filteredOut =
      (rules.minViews && views < rules.minViews) ||
      (rules.minSeconds && seconds < rules.minSeconds) ||
      (rules.maxSeconds && seconds > rules.maxSeconds) ||
      (rules.maxAgeDays && ageDays > rules.maxAgeDays);
    if (filteredOut) return setHidden(true);
    setHidden(false);

    // 横竖屏卡片上看不出来，要查影片资料
    if (!rules.noPortrait) return;
    videoInfo(bvid).then((info) => {
      const size = info?.dimension;
      if (!size?.width) return;
      const [width, height] = size.rotate ? [size.height, size.width] : [size.width, size.height];
      if (height > width) setHidden(true);
    });
  };

  // ════ 封面替换 ════
  const COVER_CARDS = '.bili-video-card, .video-page-card-small, .video-card, .rank-item';
  const MAX_FRAMES = 120; // 随机帧是 blob 地址，放太多占内存
  const FRAMES_AFTER_PRUNE = 80;
  /** bvid → Promise<blob 地址> */
  const randomFrames = new Map();

  /** 从播放器进度条预览用的雪碧图里随机裁一格出来 */
  const cutRandomFrame = async (bvid) => {
    const sheet = (await dm.getJSON(`https://api.bilibili.com/x/player/videoshot?bvid=${bvid}&index=1`))?.data;
    const perImage = (sheet?.img_x_len || 0) * (sheet?.img_y_len || 0);
    const total = Math.min(sheet?.index?.length || perImage, (sheet?.image?.length || 0) * perImage);
    if (!perImage || !total || !sheet.img_x_size) throw new Error('没有预览图');
    // 避开片头片尾：从中间 80% 里挑
    const pick = Math.min(total - 1, Math.floor(total * (0.1 + Math.random() * 0.8)));
    const imageIndex = Math.floor(pick / perImage);
    const cellIndex = pick % perImage;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('预览图加载失败'));
      image.src = String(sheet.image[imageIndex])
        .replace(/^\/\//, 'https://')
        .replace(/^http:/, 'https:');
    });
    const canvas = document.createElement('canvas');
    canvas.width = sheet.img_x_size;
    canvas.height = sheet.img_y_size;
    const sourceX = (cellIndex % sheet.img_x_len) * sheet.img_x_size;
    const sourceY = Math.floor(cellIndex / sheet.img_x_len) * sheet.img_y_size;
    canvas
      .getContext('2d')
      .drawImage(image, sourceX, sourceY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) throw new Error('画布导出失败');
    return URL.createObjectURL(blob);
  };

  const releaseFrame = (pending) => pending.then((url) => URL.revokeObjectURL(url)).catch(() => {});
  /** 超过上限时，把页面上已经不用的随机帧释放掉 */
  const pruneRandomFrames = () => {
    if (randomFrames.size <= MAX_FRAMES) return;
    const inUse = new Set(
      [...document.querySelectorAll('img[data-bga-cover]')].map((img) => img.dataset.bgaCover.split(':')[1]),
    );
    for (const [bvid, pending] of randomFrames) {
      if (randomFrames.size <= FRAMES_AFTER_PRUNE) break;
      if (inUse.has(bvid)) continue;
      randomFrames.delete(bvid);
      releaseFrame(pending);
    }
  };
  const randomFrame = (bvid) => {
    if (!randomFrames.has(bvid)) randomFrames.set(bvid, cutRandomFrame(bvid));
    pruneRandomFrames();
    return randomFrames.get(bvid);
  };
  const firstFrame = async (bvid) => {
    const frame = (await videoInfo(bvid))?.firstFrame;
    return frame ? `${coverBase(frame)}@672w_378h_1c.webp` : '';
  };

  const replaceCover = async (card) => {
    const mode = val('x.cover.mode');
    const bvid = bvidOfCard(card) || (card.matches('a') ? card.href.match(BVID_IN_URL)?.[1] || '' : '');
    const img = [...card.querySelectorAll('img')].find((el) =>
      /hdslb\.com\/bfs\/archive\//.test(el.currentSrc || el.src || ''),
    );
    // 记号「模式:影片」：这张图已经按当前模式换过就不重复处理
    const mark = `${mode}:${bvid}`;
    if (!bvid || !img || img.dataset.bgaCover === mark) return;
    img.dataset.bgaCover = mark;
    img.style.removeProperty('content');

    let url = '';
    if (mode === 'random') url = await randomFrame(bvid).catch(() => '');
    if (!url) url = await firstFrame(bvid).catch(() => '');
    // 等结果的工夫，卡片可能换了影片，或者设置改了
    if (!url || img.dataset.bgaCover !== mark || val('x.cover.mode') !== mode) return;
    // 不改 src：那是 B站前端管的，而且 <picture> 里的 <source> 比它优先。用 content 换掉显示出来的图
    img.style.setProperty('content', `url("${url}")`, 'important');
    img.style.setProperty('object-fit', 'cover', 'important');
  };

  const restoreCovers = () => {
    for (const img of document.querySelectorAll('img[data-bga-cover]')) {
      img.style.removeProperty('content');
      img.style.removeProperty('object-fit');
      delete img.dataset.bgaCover;
    }
    for (const pending of randomFrames.values()) releaseFrame(pending);
    randomFrames.clear();
  };

  // ════ 扫描 ════
  const filtering = () => PAGE.home && rules.active;
  const replacingCovers = () => val('x.cover.mode') !== 'off';

  let scanQueued = false;
  const scan = () => {
    scanQueued = false;
    if (filtering()) {
      for (const card of document.querySelectorAll('.bili-video-card')) safe(() => filterCard(card), '首页过滤');
    }
    if (replacingCovers()) {
      // 只处理视窗附近的卡片，往下卷到了再换
      const horizon = window.innerHeight * 1.6;
      for (const card of document.querySelectorAll(COVER_CARDS)) {
        const rect = card.getBoundingClientRect();
        if (rect.width > 60 && rect.bottom > -200 && rect.top < horizon) replaceCover(card).catch(() => {});
      }
    }
  };
  const queueScan = () => {
    if (scanQueued) return;
    scanQueued = true;
    setTimeout(scan, 250);
  };

  let observer = null;
  const applySettings = () => {
    loadRules();
    // 设置变了：之前的判断全部作废，重新来
    for (const cell of document.querySelectorAll('[data-bga-feed-hidden]'))
      cell.removeAttribute('data-bga-feed-hidden');
    for (const card of document.querySelectorAll('.bili-video-card')) judged.delete(card);
    if (!replacingCovers()) restoreCovers();

    const active = filtering() || replacingCovers();
    if (active && !observer) {
      observer = pageObserver(queueScan);
      observer.observe(document.body, { childList: true, subtree: true });
      window.addEventListener('scroll', queueScan, { passive: true });
    }
    if (!active && observer) {
      observer.disconnect();
      observer = null;
      window.removeEventListener('scroll', queueScan);
    }
    if (active) queueScan();
  };

  for (const key of FEED_OPTION_KEYS) store.on(key, applySettings);
  applySettings();
}
