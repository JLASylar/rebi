// ════════════════════════════ 影片卡片：封面保存 / 放大、一键拉黑、本页打开 ════════════════════════════
// 鼠标移到影片卡片上，封面左上角出现一个小工具列。样式在 src/css/cards.css。

defOpt('x.card.save', true, {
  tab: 'general',
  group: t('影片卡片'),
  label: t('封面快速保存'),
  hint: t('滑鼠移到影片卡片上，封面左上角出現工具列，點「↓」下載原尺寸封面'),
});
defOpt('x.card.zoom', true, {
  tab: 'general',
  group: t('影片卡片'),
  label: t('封面懸浮放大'),
  hint: t('滑鼠停在工具列的放大鏡上，顯示大圖'),
});
defOpt('x.card.block', true, {
  tab: 'general',
  group: t('影片卡片'),
  label: t('一鍵拉黑 UP 主'),
  hint: t('點工具列的「⊘」直接加入 B站黑名單，再點一次取消；需要已登入'),
});
defOpt('x.card.sameTab', true, {
  tab: 'general',
  group: t('影片卡片'),
  label: t('影片在本頁打開'),
  hint: t('點影片卡片不再開新分頁；按住 ⌘ / Ctrl 或用中鍵點仍然開新分頁'),
});

// ── 下载 ──
/** B站图片地址：补上协议，去掉 @ 后面的裁切参数，得到原图 */
const coverBase = (src) =>
  String(src || '')
    .replace(/^\/\//, 'https://')
    .replace(/^http:/, 'https:')
    .replace(/@.*$/, '');

/** 文件名里不能有的字符换成空格，并限制长度 */
const safeFileName = (name) =>
  String(name || 'bilibili')
    .replace(/[\\/:*?"<>|\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

/** 把一个 Blob 存成文件（触发浏览器下载） */
const saveBlob = (blob, name, extension) => {
  const link = h('a', {
    href: URL.createObjectURL(blob),
    download: `${safeFileName(name)}.${extension}`,
    style: 'display:none',
  });
  (fullscreenElement() || document.body).appendChild(link);
  link.click();
  // 大文件（4K 截图）Safari 开始读取得晚，地址别太早回收
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 60000);
};

/** 下载一张图。先用页面的 fetch；图床不允许跨域读取时走平台层 */
const saveImage = async (url, name) => {
  let blob;
  try {
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) throw new Error(String(response.status));
    blob = await response.blob();
  } catch {
    blob = (await platform.request({ url, responseType: 'blob' })).blob;
  }
  if (!(blob instanceof Blob)) throw new Error(t('下載失敗'));
  const extension = (url.match(/\.(jpe?g|png|webp|gif|avif)$/i)?.[1] || 'jpg').toLowerCase();
  saveBlob(blob, name, extension);
};

/** 保存正在看的这个影片的封面（快捷键用） */
const saveCurrentCover = async () => {
  const state = W.__INITIAL_STATE__;
  const cover =
    state?.videoData?.pic || state?.epInfo?.cover || document.querySelector('meta[property="og:image"]')?.content;
  const url = coverBase(cover);
  if (!url) return void toast(t('找不到這個影片的封面'), 'warn');
  try {
    const title = (state?.videoData?.title || document.title).slice(0, 60);
    await saveImage(url, `${title} ${state?.videoData?.bvid || ''}`);
    toast(t('封面已保存'), 'ok', 1500);
  } catch (error) {
    toast(t`封面保存失敗：${error.message || error}`, 'warn');
  }
};

// ── 拉黑 ──
/** 网页登录态里的校验码；没登录就是空字符串 */
const loginCsrf = () => document.cookie.match(/(?:^|;\s*)bili_jct=([^;]+)/)?.[1] || '';

/** 把一个用户加入 / 移出 B站黑名单；不成功就抛错 */
const setUserBlocked = async (uid, block) => {
  const response = await fetch('https://api.bilibili.com/x/relation/modify', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // act：5 = 拉黑，6 = 取消拉黑
    body: new URLSearchParams({ fid: uid, act: block ? '5' : '6', re_src: '11', csrf: loginCsrf() }).toString(),
  });
  const result = await response.json();
  if (result?.code !== 0) throw new Error(result?.message || t`錯誤碼 ${result?.code}`);
};

// ── 卡片 ──
const CARD_SELECTOR =
  '.bili-video-card, .video-page-card-small, .video-card, .rank-item, .small-item, .bili-dyn-card-video';
const CARD_ICONS = {
  save: '<path d="M8 2.2v8M4.8 7.2L8 10.4l3.2-3.2M3 13.4h10"/>',
  zoom: '<circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2L13.6 13.6M5.2 7h3.6M7 5.2v3.6"/>',
  block: '<circle cx="8" cy="8" r="5.6"/><path d="M4.1 4.1l7.8 7.8"/>',
};

/** 从一张卡片上读出封面、影片、UP 主 */
const readCard = (card) => {
  const isCover = (img) =>
    /hdslb\.com\/bfs\//.test(img.currentSrc || img.src || '') && img.getBoundingClientRect().width > 60;
  const img = [...card.querySelectorAll('img')].find(isCover);
  const videoLink = card.matches('a[href*="/video/"]')
    ? card
    : card.querySelector('a[href*="/video/BV"], a[href*="/video/av"]');
  const upLink = card.querySelector('a[href*="space.bilibili.com/"]');
  const textOf = (selector) => card.querySelector(selector)?.textContent || '';
  return {
    img,
    cover: img ? coverBase(img.currentSrc || img.src) : '',
    bvid: videoLink?.href.match(BVID_IN_URL)?.[1] || '',
    uid: upLink?.href.match(/space\.bilibili\.com\/(\d+)/)?.[1] || '',
    title: (
      textOf('.bili-video-card__info--tit, .title, .video-name, .bili-dyn-card-video__title') ||
      img?.alt ||
      ''
    ).trim(),
    upName: (
      textOf('.bili-video-card__info--author, .upname .name, .up-name__text, .up-name') ||
      upLink?.textContent ||
      ''
    ).trim(),
  };
};

function setupCards() {
  if (!IS_TOP || !(PAGE.www || PAGE.search || PAGE.t || PAGE.space)) return;

  // ── 本页打开：点到带 target=_blank 的影片链接时把 target 去掉（按着修饰键、用中键的不管）──
  const PLAYABLE = /bilibili\.com\/(video\/|bangumi\/play\/|list\/|medialist\/|festival\/)/;
  document.addEventListener(
    'click',
    (event) => {
      const plainClick = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
      if (!val('x.card.sameTab') || !plainClick) return;
      const link = event.target.closest?.('a[target="_blank"]');
      if (link && PLAYABLE.test(link.href)) link.removeAttribute('target');
    },
    true,
  );

  // ── 工具列 ──
  const toolButton = (action, label) => {
    const button = h('button', { type: 'button', 'aria-label': label, title: label, dataset: { act: action } });
    button.append(svgIcon(CARD_ICONS[action]));
    return button;
  };
  const saveButton = toolButton('save', t('保存封面'));
  const zoomButton = toolButton('zoom', t('放大封面'));
  const blockButton = toolButton('block', t('拉黑 UP 主'));
  const toolbar = h('div', { id: 'bga-card-tools' }, saveButton, zoomButton, blockButton);
  const zoomBox = h('div', { id: 'bga-card-zoom' }, h('img', { alt: '', referrerpolicy: 'no-referrer' }));

  /** 这次会话里拉黑过的：uid → 名字 */
  const blocked = new Map();
  let currentCard = null;
  let hideTimer = 0;

  const paintBlockButton = (uid) => blockButton.toggleAttribute('data-active', !!uid && blocked.has(uid));
  const hideToolbar = () => {
    currentCard = null;
    toolbar.removeAttribute('data-on');
    zoomBox.removeAttribute('data-on');
  };
  const hideToolbarSoon = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideToolbar, 160);
  };
  const showToolbar = (card) => {
    clearTimeout(hideTimer);
    if (currentCard === card && toolbar.hasAttribute('data-on')) return;
    const data = readCard(card);
    if (!data.img) return hideToolbar();
    currentCard = card;
    saveButton.hidden = !val('x.card.save');
    zoomButton.hidden = !val('x.card.zoom');
    blockButton.hidden = !val('x.card.block') || !(data.uid || data.bvid);
    if ([saveButton, zoomButton, blockButton].every((button) => button.hidden)) return hideToolbar();
    paintBlockButton(data.uid);
    const cover = data.img.getBoundingClientRect();
    toolbar.style.left = `${Math.round(cover.left + 6)}px`;
    toolbar.style.top = `${Math.round(cover.top + 6)}px`;
    if (!toolbar.isConnected) document.body.append(toolbar, zoomBox);
    toolbar.setAttribute('data-on', '');
  };

  document.addEventListener(
    'mouseover',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('#bga-card-tools')) return void clearTimeout(hideTimer);
      if (!(val('x.card.save') || val('x.card.zoom') || val('x.card.block'))) return;
      const card = target.closest(CARD_SELECTOR);
      if (card) showToolbar(card);
      else if (currentCard) hideToolbarSoon();
    },
    true,
  );
  window.addEventListener('scroll', () => currentCard && hideToolbar(), { passive: true, capture: true });
  for (const type of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(type, hideToolbar);

  // ── 放大：鼠标停在放大镜上才出现，免得和 B站自己的悬浮预览抢 ──
  const ZOOM_MAX_WIDTH = 960;
  const ZOOM_MIN_ROOM = 420; // 卡片旁边至少要有这么宽，大图才放在旁边
  const EDGE = 12;
  zoomButton.addEventListener('mouseenter', () => {
    const data = currentCard && readCard(currentCard);
    if (!data?.cover) return;
    const cover = data.img.getBoundingClientRect();
    // 放在卡片旁边空间较大的一侧，大小按那一侧的空间定，不盖住卡片；两侧都太窄才居中盖在上面
    const onRight = window.innerWidth - cover.right >= cover.left;
    const room = (onRight ? window.innerWidth - cover.right : cover.left) - 2 * EDGE;
    const beside = room >= ZOOM_MIN_ROOM;
    const width = Math.round(Math.min(ZOOM_MAX_WIDTH, beside ? room : window.innerWidth * 0.6));
    const height = Math.round((width * 9) / 16);
    let left = Math.max(EDGE, (window.innerWidth - width) / 2);
    if (beside) left = onRight ? cover.right + EDGE : cover.left - width - EDGE;
    const centered = cover.top + cover.height / 2 - height / 2;
    const top = Math.min(Math.max(EDGE, centered), Math.max(EDGE, window.innerHeight - height - EDGE));
    zoomBox.style.cssText = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${width}px;aspect-ratio:16/9;`;
    zoomBox.firstElementChild.src = `${data.cover}@1280w.webp`;
    zoomBox.setAttribute('data-on', '');
  });
  zoomButton.addEventListener('mouseleave', () => zoomBox.removeAttribute('data-on'));
  zoomButton.addEventListener('click', () => {
    const data = currentCard && readCard(currentCard);
    if (data?.cover) window.open(data.cover, '_blank', 'noopener');
  });

  // ── 保存 ──
  saveButton.addEventListener('click', async () => {
    const data = currentCard && readCard(currentCard);
    if (!data?.cover) return;
    saveButton.setAttribute('data-busy', '');
    try {
      await saveImage(data.cover, `${data.title.slice(0, 60)} ${data.bvid}`);
      toast(t('封面已保存'), 'ok', 1500);
    } catch (error) {
      toast(t`封面保存失敗：${error.message || error}`, 'warn');
    } finally {
      saveButton.removeAttribute('data-busy');
    }
  });

  // ── 拉黑 ──
  /** 页面上这位 UP 主的所有卡片变灰 / 恢复 */
  const markCardsOf = (uid, isBlocked) => {
    const spaceLink = new RegExp(`space\\.bilibili\\.com/${uid}(?:[/?#]|$)`);
    for (const link of document.querySelectorAll(`a[href*="space.bilibili.com/${uid}"]`)) {
      if (spaceLink.test(link.href)) link.closest(CARD_SELECTOR)?.toggleAttribute('data-bga-up-blocked', isBlocked);
    }
  };
  /** 卡片上没写 UP 主时，按影片去查 */
  const ownerOf = async (bvid) => {
    const owner = (await dm.getJSON(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`))?.data?.owner;
    return { uid: owner?.mid ? String(owner.mid) : '', upName: owner?.name || '' };
  };
  blockButton.addEventListener('click', async () => {
    const card = currentCard;
    const data = card && readCard(card);
    if (!data) return;
    if (!loginCsrf()) return void toast(t('要先登入 B站才能拉黑'), 'warn');
    blockButton.setAttribute('data-busy', '');
    try {
      let { uid, upName } = data;
      if (!uid && data.bvid) {
        const owner = await ownerOf(data.bvid);
        uid = owner.uid;
        upName ||= owner.upName;
      }
      if (!uid) throw new Error(t('找不到 UP 主'));
      const block = !blocked.has(uid);
      await setUserBlocked(uid, block);
      if (block) blocked.set(uid, upName);
      else blocked.delete(uid);
      markCardsOf(uid, block);
      // 卡片上没有 UP 主链接的，上面那一步标不到它
      if (!data.uid) card.toggleAttribute('data-bga-up-blocked', block);
      paintBlockButton(uid);
      const who = upName || uid;
      toast(block ? t`已拉黑「${who}」，再點一次 ⊘ 可取消` : t`已取消拉黑「${who}」`, 'ok', 3200);
    } catch (error) {
      toast(t`拉黑失敗：${error.message || error}`, 'warn');
    } finally {
      blockButton.removeAttribute('data-busy');
    }
  });
}
