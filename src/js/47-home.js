// ════════════════════════════ 首页主题 ════════════════════════════
// 極簡：只有影片列表（原来的样子）。
// 大寶鑑：最上面一整幅海报，B站官方榜单里的影片轮流登场；右下是关注的 UP 主的更新；往下卷是原来的影片列表。
//
// 海报层挂在 <body> 上、绝对定位盖住被撑高的头图，不往 B站（Vue 管着）的结构里插节点。样式在 css/home.css。

defOpt('x.home.theme', 'plain', {
  tab: 'home',
  group: t('首頁主題'),
  type: 'select',
  label: t('主題'),
  hint: t('極簡：只有影片列表。大寶鑑：最上面是整幅海報的影片推薦，右下是你關注的更新，往下滑才是影片列表'),
  choices: [
    ['plain', t('極簡')],
    ['hero', t('大寶鑑')],
  ],
});
defOpt('x.home.source', 'popular', {
  tab: 'home',
  group: t('大寶鑑'),
  type: 'select',
  label: t('海報的推薦來源'),
  choices: [
    ['popular', t('綜合熱門')],
    ['weekly', t('每週必看')],
    ['ranking', t('排行榜')],
    ['precious', t('入站必刷')],
    ['follow', t('我關注的')],
  ],
  hint: t('「我關注的」是你關注的 UP 主最近的投稿，要登入 B站；沒登入時改用綜合熱門'),
});
defOpt('x.home.preview', false, {
  tab: 'home',
  group: t('大寶鑑'),
  label: t('海報上預覽播放'),
  hint: t('換到一部影片時，海報變成這部影片的畫面，在首頁直接無聲播放；點「播放」才進影片頁。系統開了「減少動態效果」時不播'),
});
defOpt('x.home.previewSound', false, {
  tab: 'home',
  group: t('大寶鑑'),
  label: t('預覽有聲音'),
  hint: t('瀏覽器規定網頁要先被點過一下才能自己出聲：剛打開首頁時先無聲，點過頁面任何地方之後的預覽就有聲音。海報上的喇叭按鈕可以隨時切換'),
});
defOpt('x.home.previewStay', true, {
  tab: 'home',
  group: t('大寶鑑'),
  label: t('滑鼠停在海報上就繼續看'),
  hint: t('預覽播放中，滑鼠在海報上停一秒半：不再換下一部，換成清楚一點的畫面接著播到結束，播完才換。點畫面在影片頁從同一個時間點接著看'),
});
defOpt('x.home.side', 'all', {
  tab: 'home',
  group: t('大寶鑑'),
  type: 'select',
  label: t('右下角放什麼'),
  hint: t('關注的動態要登入 B站，沒登入時改放海報同一來源的其他影片。和海報選同一個來源時，右下接著放海報沒輪到的那些'),
  choices: [
    ['all', t('關注的全部動態')],
    ['video', t('關注的影片')],
    ['popular', t('綜合熱門')],
    ['weekly', t('每週必看')],
    ['ranking', t('排行榜')],
    ['precious', t('入站必刷')],
    ['off', t('不顯示')],
  ],
});
defOpt('x.home.interval', 8, {
  tab: 'home',
  group: t('大寶鑑'),
  label: t('海報多久換一張'),
  hint: t('滑鼠停在播放那一排按鈕上時暫停；系統開了「減少動態效果」就不自動換'),
  unit: t('秒'),
  step: 1,
});
defOpt('x.home.quality', 'original', {
  tab: 'home',
  group: t('大寶鑑'),
  type: 'select',
  label: t('海報畫質'),
  hint: t('原圖最清楚，每張約 0.2–1 MB；再清楚也不會超過 UP 主上傳的封面'),
  choices: [
    ['original', t('原圖')],
    ['compact', t('壓縮')],
  ],
});
defOpt('x.home.count', 16, {
  tab: 'home',
  group: t('大寶鑑'),
  label: t('海報輪流放幾部影片'),
  hint: t('最少 4 部，最多 30 部'),
  unit: t('部'),
  step: 1,
});
defOpt('x.home.noSwipe', false, {
  tab: 'home',
  group: t('影片列表'),
  label: t('不顯示左上角那塊大的輪播推薦'),
});
defOpt('x.home.noFloor', false, {
  tab: 'home',
  group: t('影片列表'),
  label: t('不顯示直播、番劇等推薦卡'),
  hint: t('影片列表中間帶「直播」「番劇」「綜藝」這類角標的卡片'),
});

/** 海报轮流放几部：按选项，限制在 4–30 */
const heroSize = () => Math.min(30, Math.max(4, Math.round(Number(val('x.home.count')) || 16)));
const HERO_ICONS = {
  play: '<path d="M5 2.6v12.8a.6.6 0 00.92.5l10-6.4a.6.6 0 000-1L5.92 2.1A.6.6 0 005 2.6z"/>',
  later: '<circle cx="9" cy="9" r="6.6"/><path d="M9 5.2V9l2.6 1.7"/>',
  previous: '<path d="M11 3.5L5.5 9l5.5 5.5"/>',
  next: '<path d="M7 3.5L12.5 9 7 14.5"/>',
  sound: '<path d="M3 7v4h3l4 3.5v-11L6 7H3z"/><path d="M12.5 6.2a4 4 0 010 5.6M14.6 4.2a7 7 0 010 9.6"/>',
  muted: '<path d="M3 7v4h3l4 3.5v-11L6 7H3z"/><path d="M12.5 7l4 4M16.5 7l-4 4"/>',
};
/** 各个榜单在 B站上的页面（右下那排的标题点进去） */
const SOURCE_LINKS = {
  popular: 'https://www.bilibili.com/v/popular/all',
  weekly: 'https://www.bilibili.com/v/popular/weekly',
  ranking: 'https://www.bilibili.com/v/popular/rank/all',
  precious: 'https://www.bilibili.com/v/popular/history',
};
const SOURCE_NAMES = {
  popular: t('綜合熱門'),
  weekly: t('每週必看'),
  ranking: t('排行榜'),
  precious: t('入站必刷'),
  follow: t('我關注的'),
};

// ── 取资料 ──
const apiData = async (path) => {
  const result = await dm.getJSON(`https://api.bilibili.com${path}`);
  if (result?.code !== 0) throw new Error(result?.message || t`錯誤碼 ${result?.code}`);
  return result.data;
};

/** 「1.2万」「3456」→ 数字；认不出就 NaN */
const countValue = (text) => {
  const match = String(text ?? '').replace(/,/g, '').match(/^([\d.]+)\s*(万|萬|亿|億)?/);
  if (!match) return NaN;
  return Number(match[1]) * ({ 万: 1e4, 萬: 1e4, 亿: 1e8, 億: 1e8 }[match[2]] || 1);
};
/** 「12:34」「1:02:03」→ 秒 */
const clockValue = (text) =>
  String(text || '')
    .split(':')
    .reduce((total, part) => total * 60 + (Number(part) || 0), 0);

/** 关注的 UP 主最近的投稿，整理成和榜单一样的样子（海报只用得到这几个字段） */
const fetchFollowVideos = async () => {
  const pages = [];
  let offset = '';
  // 一页大约十几条，翻到够数为止（最多三页）
  for (let page = 1; page <= 3 && pages.length < heroSize(); page += 1) {
    const query = `type=video&page=${page}&timezone_offset=-480${offset ? `&offset=${encodeURIComponent(offset)}` : ''}`;
    const data = await apiData(`/x/polymer/web-dynamic/v1/feed/all?${query}`);
    for (const item of data.items || []) {
      const archive = item.modules?.module_dynamic?.major?.archive;
      const author = item.modules?.module_author || {};
      if (!archive?.bvid) continue;
      pages.push({
        bvid: archive.bvid,
        pic: archive.cover,
        title: archive.title,
        desc: archive.desc,
        duration: clockValue(archive.duration_text),
        pubdate: Number(author.pub_ts) || 0,
        owner: { mid: author.mid, name: author.name },
        stat: { view: countValue(archive.stat?.play) },
      });
    }
    offset = data.offset;
    if (!data.has_more || !offset) break;
  }
  return pages;
};

/** 某个官方榜单里的影片（接口返回的原样） */
const fetchSourceVideos = async (source) => {
  if (source === 'follow') {
    // 没登录就没有关注可看：退回综合热门
    if (loginCsrf()) {
      const videos = await fetchFollowVideos();
      if (videos.length) return videos;
    }
    return fetchSourceVideos('popular');
  }
  if (source === 'weekly') {
    const latest = (await apiData('/x/web-interface/popular/series/list')).list[0].number;
    return (await apiData(`/x/web-interface/popular/series/one?number=${latest}`)).list;
  }
  if (source === 'ranking') return (await apiData('/x/web-interface/ranking/v2?rid=0&type=all')).list;
  if (source === 'precious') return (await apiData('/x/web-interface/popular/precious')).list;
  return (await apiData('/x/web-interface/popular?ps=50&pn=1')).list;
};

const secureUrl = (url) => String(url || '').replace(/^(?:https?:)?\/\//, 'https://');
const countText = (count) => {
  if (!(count >= 0)) return '';
  return count >= 1e4 ? COMPACT_NUMBER.format(count) : String(count);
};
const clockText = (seconds) => {
  const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
  if (!parts[0]) parts.shift();
  return parts.map((part, index) => (index ? String(part).padStart(2, '0') : part)).join(':');
};
const dateText = (timestamp) => new Date(timestamp * 1000).toLocaleDateString('zh-TW');

/** 榜单里的一条 → 右下角卡片要的样子 */
const cardOfVideo = (video) => ({
  link: `https://www.bilibili.com/video/${video.bvid}`,
  cover: secureUrl(video.pic),
  title: video.title,
  note: [video.owner?.name, countText(video.stat?.view) && t`${countText(video.stat.view)} 次播放`]
    .filter(Boolean)
    .join(' · '),
});

/** 关注动态里的一条 → 卡片；认不出的类型返回 null */
const cardOfDynamic = (item) => {
  const author = item.modules?.module_author || {};
  const content = item.modules?.module_dynamic || {};
  const major = content.major || {};
  const body = major.archive || major.pgc || major.article || major.opus || major.draw || major.live_rcmd;
  if (!body && !content.desc?.text) return null;
  const cover = body?.cover || body?.covers?.[0] || body?.pics?.[0]?.url || body?.items?.[0]?.src || author.face || '';
  const title = body?.title || body?.summary?.text || content.desc?.text || '';
  if (!cover || !title) return null;
  return {
    link: secureUrl(body?.jump_url) || `https://t.bilibili.com/${item.id_str}`,
    cover: secureUrl(cover),
    title: title.trim().split('\n')[0],
    note: [author.name, author.pub_time].filter(Boolean).join(' · '),
  };
};

/** 关注的更新；没登录或出错返回 null */
const fetchFollowCards = async (onlyVideo) => {
  if (!loginCsrf()) return null;
  try {
    const type = onlyVideo ? 'video' : 'all';
    const data = await apiData(`/x/polymer/web-dynamic/v1/feed/all?type=${type}&page=1&timezone_offset=-480`);
    const cards = (data.items || []).map(cardOfDynamic).filter(Boolean);
    return cards.length ? cards : null;
  } catch (error) {
    warn('读关注动态失败', error);
    return null;
  }
};

// ── 海报层 ──
/** 建海报层；返回 { element, destroy } */
const buildHero = (videos, side) => {
  const slides = videos.slice(0, heroSize());
  const sourceName = SOURCE_NAMES[val('x.home.source')] || SOURCE_NAMES.popular;
  let current = -1;

  const layers = [h('img', { class: 'bga-hero-bg', alt: '' }), h('img', { class: 'bga-hero-bg', alt: '' })];
  const preview = createHeroPreview({
    // 认真看的时候播完了：换下一部
    onEnded: () => show(current + 1),
    onState: () => syncPreviewUi(),
  });
  // 喇叭：预览在播时才出现；点了当场开 / 关声音，并记住
  const soundOn = svgIcon(HERO_ICONS.sound, 18);
  const soundOff = svgIcon(HERO_ICONS.muted, 18);
  const soundButton = h('button', { class: 'bga-hero-round bga-hero-sound', type: 'button' }, soundOn, soundOff);
  soundButton.addEventListener('click', () => preview.setSound(!preview.sounding));
  const watchBar = h('div', { class: 'bga-hero-watchbar' }, h('i'));
  // 停在海报上时出现的提示：一条 1.5 秒填满的小胶囊，填满就进入「继续看」——让人知道发生了什么、还要等多久
  const armHint = h('div', { class: 'bga-hero-arm' }, h('span', {}, t('停住就繼續看')), h('i'));
  const info = h('div', { class: 'bga-hero-info' });
  const dots = h(
    'div',
    { class: 'bga-hero-dots' },
    slides.map((video, index) => h('button', { type: 'button', title: video.title, onclick: () => show(index) })),
  );
  const iconButton = (icon, title, onclick) => {
    const button = h('button', { class: 'bga-hero-round', type: 'button', title, onclick });
    button.append(svgIcon(HERO_ICONS[icon], 18));
    return button;
  };

  const renderInfo = (video) => {
    const play = h('a', {
      class: 'bga-hero-play',
      href: `https://www.bilibili.com/video/${video.bvid}`,
      target: '_blank',
    });
    play.append(svgIcon(HERO_ICONS.play, 18), t('[按鈕]播放'));
    const description = String(video.desc || '').trim();
    const tags = [
      video.tname && h('span', {}, video.tname),
      video.rcmd_reason?.content && h('span', {}, video.rcmd_reason.content),
      // 关注来源的播放数是「1.2万」这种文字，换算不出来时就不显示
      countText(video.stat?.view) && h('span', {}, t`${countText(video.stat.view)} 次播放`),
      video.stat?.like > 0 && h('span', {}, t`${countText(video.stat.like)} 讚`),
    ];
    const metaBits = [
      h('b', {}, sourceName),
      h('a', { href: `https://space.bilibili.com/${video.owner?.mid}`, target: '_blank' }, video.owner?.name || ''),
      video.pubdate > 0 && h('span', {}, dateText(video.pubdate)),
      video.duration > 0 && h('span', {}, clockText(video.duration)),
    ];
    info.replaceChildren(
      h('div', { class: 'bga-hero-meta' }, metaBits),
      h('h2', { class: 'bga-hero-title' }, video.title),
      h('div', { class: 'bga-hero-tags' }, tags),
      description.length > 1 ? h('p', { class: 'bga-hero-desc' }, description) : '',
      h(
        'div',
        { class: 'bga-hero-actions' },
        play,
        iconButton('later', t('稍後再看'), () => addToWatchLater(video.bvid)),
        iconButton('previous', t('上一部'), () => show(current - 1)),
        iconButton('next', t('下一部'), () => show(current + 1)),
        soundButton,
      ),
    );
    // 重新触发入场动画
    info.style.animation = 'none';
    void info.offsetWidth;
    info.style.animation = '';
  };

  function show(index) {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;
    current = next;
    setWatching(false);
    const video = slides[current];
    // 两层海报轮流用：新的一张载入好再淡入，免得闪一下空白
    const incoming = layers.find((layer) => !layer.hasAttribute('data-on')) || layers[0];
    const outgoing = layers.find((layer) => layer !== incoming);
    incoming.onload = () => {
      incoming.toggleAttribute('data-on', true);
      outgoing.toggleAttribute('data-on', false);
    };
    // 压缩档是图床转的 WebP，尺寸不变但压得很狠（实测有的从 879 KB 压到 44 KB），铺满整屏时发糊；默认取原图
    const cover = secureUrl(video.pic);
    incoming.src = val('x.home.quality') === 'compact' ? `${cover}@1920w_1080h_1c.webp` : cover;
    renderInfo(video);
    [...dots.children].forEach((dot, at) => dot.toggleAttribute('data-on', at === current));
    preview.load(video);
  }

  const element = h(
    'section',
    { id: 'bga-hero', class: 'bga-ui', 'aria-label': t('推薦影片') },
    layers,
    preview.element,
    h('div', { class: 'bga-hero-shade' }),
    h('div', { class: 'bga-hero-left' }, info, dots),
    side && buildHeroSide(side),
    watchBar,
    armHint,
  );
  element.style.setProperty('--bga-hero-interval', `${Math.max(3, Number(val('x.home.interval')) || 8)}s`);

  // 进度点的填充动画跑完就换下一张；暂停动画也就暂停了轮播
  dots.addEventListener('animationend', (event) => {
    if (event.animationName === 'bga-hero-fill') show(current + 1);
  });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // 只有停在「播放」那一排按钮上才暂停：免得正要点的时候换了下一部。停在海报别处照常轮播
  let hovering = false;
  // 认真看：预览在播时滑鼠在海报上停住一会儿 → 不再轮播，换清楚的画面播到结束。直到换片（手动或播完）才退出
  // 计的是「滑鼠在海报上待了多久」，不是「停着不动多久」：只要人还在海报上，轻轻挪动也不重新计时。
  // 预览还没开始播时就进来的，等预览播起来再开始计（第一版只在滑鼠移动时才计，人先进来、预览后播起来就永远不触发）。
  const DWELL = 1500;
  let watching = false;
  let dwell = 0;
  let pointerOnPoster = false;
  const disarm = () => {
    clearTimeout(dwell);
    dwell = 0;
    element.removeAttribute('data-arming');
  };
  const arm = () => {
    if (dwell || watching || !pointerOnPoster || !preview.playing || !val('x.home.previewStay')) return;
    element.toggleAttribute('data-arming', true);
    dwell = setTimeout(() => {
      dwell = 0;
      element.removeAttribute('data-arming');
      if (pointerOnPoster && preview.playing) setWatching(true);
    }, DWELL);
  };
  // 影片画面播起来以后（预览或继续看）：滑鼠 2.5 秒不动，左边的标题、按钮、进度点和最上面的导航栏都收起来，
  // 画面全让出来；滑鼠一动、换片、卷离海报就回来
  let idle = 0;
  const setIdle = (on) => {
    element.toggleAttribute('data-idle', on);
    flag('home-hero-idle', on);
  };
  const wake = () => {
    setIdle(false);
    clearTimeout(idle);
    if (preview.playing && scrollY < innerHeight * 0.6) idle = setTimeout(() => setIdle(true), 2500);
  };
  function setWatching(on) {
    disarm();
    if (on === watching) return;
    watching = on;
    element.toggleAttribute('data-watching', on);
    preview.setWatching(on);
    wake();
    updatePaused();
  }
  function syncPreviewUi() {
    const live = preview.playing;
    const was = element.hasAttribute('data-previewing');
    element.toggleAttribute('data-previewing', live);
    if (live && !was) {
      arm();
      wake();
    }
    if (!live && was) {
      disarm();
      wake();
    }
    soundOn.style.display = preview.sounding ? '' : 'none';
    soundOff.style.display = preview.sounding ? 'none' : '';
    soundButton.title = preview.sounding ? t('關閉聲音') : t('開啟聲音');
    watchBar.firstChild.style.transform = `scaleX(${preview.progress})`;
  }
  const updatePaused = () => {
    const away = reducedMotion.matches || document.hidden || scrollY > innerHeight * 0.6;
    element.toggleAttribute('data-paused', hovering || watching || away);
    // 卷走了、切到别的分页：预览也停，回来接着放
    preview.setActive(!away);
  };
  /** 滑鼠在不在「海报本身」上：只有按钮那一排、进度点、右下那排卡片不算（标题、简介上面也算，范围大一点才好触发） */
  const onPoster = (target) => !target.closest?.('.bga-hero-side, .bga-hero-actions, .bga-hero-dots');
  element.addEventListener('mouseover', (event) => {
    hovering = !!event.target.closest?.('.bga-hero-actions');
    updatePaused();
  });
  element.addEventListener('pointermove', (event) => {
    wake();
    const now = onPoster(event.target);
    if (now === pointerOnPoster) return;
    pointerOnPoster = now;
    if (now) arm();
    else disarm();
  });
  element.addEventListener('mouseleave', () => {
    pointerOnPoster = false;
    disarm();
    hovering = false;
    updatePaused();
  });
  // 认真看的时候点画面：到影片页从同一个时间点接着看
  element.addEventListener('click', (event) => {
    // 用派发那一刻的路径判断，不用 event.target：点喇叭时它会当场换掉自己的图示，
    // 冒泡到这里时 target 已经不在文档里，closest() 找不到按钮，就误当成点了画面、开了新分页
    const path = event.composedPath();
    const onControl = path.some((node) => node instanceof Element && node.matches('a, button, .bga-hero-side, .bga-hero-actions, .bga-hero-dots'));
    if (!watching || onControl) return;
    const time = Math.floor(preview.time);
    window.open(`https://www.bilibili.com/video/${slides[current].bvid}/${time > 0 ? `?t=${time}` : ''}`, '_blank', 'noopener');
    preview.setActive(false);
  });
  const abort = new AbortController();
  document.addEventListener('visibilitychange', updatePaused, { signal: abort.signal });
  addEventListener('scroll', updatePaused, { passive: true, signal: abort.signal });
  addEventListener('scroll', wake, { passive: true, signal: abort.signal });
  updatePaused();
  show(0);

  return {
    element,
    destroy() {
      abort.abort();
      clearTimeout(idle);
      flag('home-hero-idle', false);
      preview.stop();
      element.remove();
    },
  };
};

/**
 * 海报上的预览：换到一部影片、停留一会儿后，用 B站给网页播放器的 MP4（html5 平台，单个文件带声音）在海报图上播放。
 * 只在「海報上預覽播放」开着、没开「减少动态效果」时启用。等一会儿再要：快速切换时不会每一张都去要一次。
 *
 * 两种状态：
 *   · 预览：低清晰度（qn 32），播完停在最后一帧，跟着海报轮播换；
 *   · 认真看（setWatching(true)）：换成清楚的版本（qn 80，B站给多少算多少）从同一个时间点接着播，播完调 onEnded。
 * 声音：浏览器只许「用户点过页面之后」自己出声。开了「預覽有聲音」就先试有声，被挡就退回无声（喇叭按钮可以手动开，
 * 那一下点击本身就满足了浏览器的要求）。
 */
function createHeroPreview({ onEnded, onState }) {
  const makeVideo = () => {
    const element = h('video', { class: 'bga-hero-video', muted: true, playsinline: true, preload: 'none', 'aria-hidden': 'true' });
    element.muted = true;
    element.addEventListener('timeupdate', () => element === video && state());
    element.addEventListener('volumechange', () => element === video && state());
    element.addEventListener('ended', () => element === video && watching && onEnded?.());
    return element;
  };
  // 容器里平时只有一个 <video>；换清楚的版本时临时多一个，等它播起来再换掉旧的（中间不露出底下的海报图）
  const box = h('div', { class: 'bga-hero-media' });
  let video = makeVideo();
  box.append(video);
  const WAIT = 1200;
  const VIDEO_HOST = /^https:\/\/[\w.-]+\.(bilivideo\.(com|cn)|akamaized\.net|hdslb\.com)\//;
  let timer = 0;
  let token = 0;
  let active = true;
  let watching = false;
  let item = null;
  let cid = 0;
  const enabled = () => val('x.home.preview') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = () => onState?.();

  const stop = () => {
    clearTimeout(timer);
    token += 1;
    watching = false;
    for (const extra of [...box.children].filter((element) => element !== video)) extra.remove();
    video.removeAttribute('data-on');
    video.pause();
    video.removeAttribute('src');
    video.load();
    state();
  };
  const cidOf = async (entry) => {
    if (entry.cid) return entry.cid;
    return (await apiData(`/x/player/pagelist?bvid=${encodeURIComponent(entry.bvid)}`))?.[0]?.cid;
  };
  /**
   * 向 B站要这一部的 MP4；qn 是想要的清晰度，B站按登录状态给不超过它的最好的一档（返回 quality 是实际给的）。
   * 这条路（html5 平台、单个文件带声音）最高就是 1080P；再往上（1080P+、4K）只有音画分开的格式，要在浏览器里合成，不做。
   */
  const sourceOf = async (quality) => {
    const play = await apiData(
      `/x/player/playurl?bvid=${encodeURIComponent(item.bvid)}&cid=${cid}&qn=${quality}&fnval=1&platform=html5&high_quality=1`,
    );
    const url = secureUrl(play?.durl?.[0]?.url);
    return VIDEO_HOST.test(url) ? { url, quality: Number(play.quality) || 0 } : null;
  };
  // 登录了：预览一开始就要最清楚的那一档，认真看时不用再换（换的那一下会卡）；没登录还是先要小的，省流量
  const BEST = 120;
  let shown = 0;
  /** 先照设置试有声；浏览器不让（还没点过页面）就无声播 */
  const playNow = async () => {
    if (!active) return;
    video.muted = !val('x.home.previewSound');
    try {
      await video.play();
    } catch (error) {
      if (video.muted || error?.name !== 'NotAllowedError') throw error;
      video.muted = true;
      await video.play();
    }
    state();
  };
  const start = async (mine) => {
    try {
      cid = await cidOf(item);
      if (mine !== token || !cid) return;
      const source = await sourceOf(loginCsrf() ? BEST : 32);
      if (mine !== token || !source) return;
      shown = source.quality;
      video.src = source.url;
      video.onplaying = () => mine === token && (video.toggleAttribute('data-on', true), state());
      await playNow();
    } catch (error) {
      // 拿不到就留着海报图，不打扰
      log('大寶鑑预览没放成', error?.message || error);
    }
  };

  return {
    element: box,
    stop,
    load(next) {
      stop();
      item = next;
      if (!enabled() || !item?.bvid) return;
      const mine = token;
      timer = setTimeout(() => start(mine), WAIT);
    },
    setActive(on) {
      if (on === active) return;
      active = on;
      if (!video.getAttribute('src')) return;
      if (on) playNow().catch(() => {});
      else video.pause();
      state();
    },
    /** 认真看：换清楚的版本，从同一个时间点接着播 */
    async setWatching(on) {
      watching = on;
      if (!on || !video.getAttribute('src')) return;
      const mine = token;
      try {
        const source = await sourceOf(BEST);
        // 已经是最清楚的那一档（登录时预览就是）：不换，免得卡一下
        if (mine !== token || !watching || !source || source.quality <= shown) return;
        // 新的一层在旧的下面载入；播起来了才盖上去、把旧的拿掉。旧的继续放，画面不断
        const sharp = makeVideo();
        // 接上之前新的一层不出声，免得两层同时有声音
        sharp.muted = true;
        sharp.preload = 'auto';
        box.prepend(sharp);
        sharp.addEventListener(
          'loadedmetadata',
          // 载入要一两秒：往后多跳一点，接上时不会倒回去
          () => mine === token && (sharp.currentTime = Math.min(sharp.duration || Infinity, video.currentTime + 1.5)),
          { once: true },
        );
        sharp.addEventListener(
          'playing',
          () => {
            if (mine !== token) return void sharp.remove();
            const old = video;
            video = sharp;
            sharp.toggleAttribute('data-on', true);
            box.append(sharp);
            sharp.muted = old.muted;
            old.pause();
            old.remove();
            state();
          },
          { once: true },
        );
        sharp.addEventListener('playing', () => (shown = source.quality), { once: true });
        sharp.src = source.url;
        if (active) await sharp.play();
      } catch (error) {
        log('大寶鑑换清楚的画面没成', error?.message || error);
      }
    },
    setSound(on) {
      store.set('x.home.previewSound', on);
      // 这是用户自己点的：浏览器允许当场出声
      video.muted = !on;
      if (on && video.paused && active && video.getAttribute('src')) video.play().catch(() => {});
      state();
    },
    get playing() {
      return video.hasAttribute('data-on') && !!video.getAttribute('src');
    },
    get sounding() {
      return !video.muted;
    },
    get time() {
      return video.currentTime || 0;
    },
    get progress() {
      return watching && video.duration ? Math.min(1, video.currentTime / video.duration) : 0;
    },
  };
}

/** 右下角那一排卡片 */
function buildHeroSide({ title, link, cards }) {
  const row = h(
    'div',
    { class: 'bga-hero-row' },
    cards
      .slice(0, 18)
      .map((card) =>
        h(
          'a',
          { class: 'bga-hero-card', href: card.link, target: '_blank', title: card.title },
          h('img', { src: `${card.cover}@480w_270h_1c.webp`, alt: '', loading: 'lazy' }),
          h('b', {}, card.title),
          h('small', {}, card.note),
        ),
      ),
  );
  const pageButton = (icon, label, direction) => {
    const button = h('button', {
      class: 'bga-hero-round',
      type: 'button',
      title: label,
      onclick: () => row.scrollBy({ left: direction * row.clientWidth, behavior: 'smooth' }),
    });
    button.append(svgIcon(HERO_ICONS[icon], 18));
    return button;
  };
  return h(
    'div',
    { class: 'bga-hero-side' },
    h(
      'div',
      { class: 'bga-hero-side-head' },
      h('span', {}, link ? h('a', { href: link, target: '_blank' }, `${title} ›`) : title),
      pageButton('previous', t('往前'), -1),
      pageButton('next', t('往後'), 1),
    ),
    row,
  );
}

// ── 菜单栏：往下卷收起，往上卷出现 ──
const watchNavScroll = (signal) => {
  let lastY = scrollY;
  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      if (Math.abs(y - lastY) < 6) return;
      flag('home-nav-hidden', y > lastY && y > 80);
      flag('home-nav-over-hero', y < innerHeight - 70);
      lastY = y;
    },
    { passive: true, signal },
  );
  flag('home-nav-over-hero', scrollY < innerHeight - 70);
};

function setupHome() {
  reflect('x.home.noSwipe', 'home-no-swipe');
  reflect('x.home.noFloor', 'home-no-floor');
  if (!PAGE.home || !IS_TOP) return;

  let hero = null;
  let abort = null;
  let generation = 0;

  const unmount = () => {
    generation += 1;
    hero?.destroy();
    abort?.abort();
    hero = abort = null;
    for (const token of ['home-hero', 'home-nav-hidden', 'home-nav-over-hero']) flag(token, false);
  };

  // 取榜单失败时隔一会儿再试（刚打开浏览器时偶尔第一次拿不到），试完还不行才提示
  const RETRY_DELAYS = [1200, 4000];

  const mount = async (attempt = 0) => {
    unmount();
    if (val('x.home.theme') !== 'hero') return;
    const mine = generation;
    flag('home-hero', true);
    abort = new AbortController();
    watchNavScroll(abort.signal);
    try {
      const source = val('x.home.source');
      // 右下放什么可以选：关注的动态，或者任何一个榜单
      const sideMode = val('x.home.side');
      const sideFollows = sideMode === 'all' || sideMode === 'video';
      const sideList = !sideFollows && sideMode !== 'off' && sideMode !== source && SOURCE_LINKS[sideMode];
      const [videos, follow, listed] = await Promise.all([
        fetchSourceVideos(source),
        sideFollows ? fetchFollowCards(sideMode === 'video') : null,
        sideList ? fetchSourceVideos(sideMode).catch(() => null) : null,
      ]);
      if (mine !== generation) return;
      if (!videos?.length) throw new Error(t('來源是空的'));
      // 海报轮流放的那几部不再出现在右下
      const onPoster = new Set(videos.slice(0, heroSize()).map((video) => video.bvid));
      const fresh = (list) => list.filter((video) => !onPoster.has(video.bvid)).map(cardOfVideo);
      let side = null;
      const notOnPoster = (card) => ![...onPoster].some((bvid) => card.link.includes(bvid));
      if (follow?.some(notOnPoster)) side = { title: t('關注更新'), link: 'https://t.bilibili.com/', cards: follow.filter(notOnPoster) };
      else if (listed?.length) side = { title: SOURCE_NAMES[sideMode], link: SOURCE_LINKS[sideMode], cards: fresh(listed) };
      // 和海报同一个来源、关注拿不到（没登录）、榜单拿不到：接着放海报没轮到的
      else if (sideMode !== 'off') side = { title: t('更多推薦'), cards: fresh(videos.slice(heroSize())) };
      hero = buildHero(videos, side?.cards.length ? side : null);
      document.body.append(hero.element);
    } catch (error) {
      if (mine !== generation) return;
      warn('大寶鑑载入失败', error);
      if (attempt < RETRY_DELAYS.length) {
        // 记号先留着（头图位置保持撑开），到点再试；这期间设置变了会换代，这次重试就作废
        setTimeout(() => mine === generation && mount(attempt + 1), RETRY_DELAYS[attempt]);
        return;
      }
      unmount();
      toast(t`大寶鑑載入失敗：${error.message || error}`, 'warn');
    }
  };

  // 「預覽有聲音」不在这里：它由喇叭按钮当场切换，改了不用重建海报
  for (const key of ['x.home.theme', 'x.home.source', 'x.home.side', 'x.home.interval', 'x.home.count', 'x.home.quality', 'x.home.preview']) store.on(key, () => mount());
  mount();

  // Safari 刚打开时，管理器的设置可能晚一点才读得到，而且不一定会发变更通知：
  // 启动后再对几次，设置是大寶鑑而海报没挂上（也没在载入）就补挂
  const ensure = () => {
    if (val('x.home.theme') === 'hero' && !hasFlag('home-hero')) mount();
  };
  for (const delay of [300, 1000, 3000]) setTimeout(ensure, delay);
  addEventListener('pageshow', ensure);
  document.addEventListener('visibilitychange', () => document.hidden || ensure());
}
