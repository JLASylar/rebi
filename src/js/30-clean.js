// ════════════════════════════ 净化：页面 ════════════════════════════
// 广告、黑白滤镜、片尾充电名单、专栏复制、网址里的追踪参数、裁切模式。样式在 src/css/clean.css。
// 拦上报、停用 P2P 这些动网络的在 32-network.js。

TABS.push(['clean', t('淨化')], ['live', t('直播')]);

defOpt('x.noGray', true, { tab: 'clean', group: t('頁面'), label: t('去掉全站黑白濾鏡') });
defOpt('x.noAds', true, {
  tab: 'clean',
  group: t('頁面'),
  label: t('隱藏廣告'),
  hint: t('首頁推廣卡片、播放頁右欄的廣告位與推廣卡片、「檢測到廣告攔截」提示'),
});
defOpt('x.noElec', true, {
  tab: 'clean',
  group: t('頁面'),
  label: t('跳過片尾充電名單'),
  hint: t('頁面載入完成後才清空名單，不一定每次都生效'),
  reload: true,
});
defOpt('x.articleCopy', true, { tab: 'clean', group: t('頁面'), label: t('專欄允許複製'), reload: true });
defOpt('x.end.noRelated', false, {
  tab: 'clean',
  group: t('頁面'),
  label: t('片尾不顯示相關推薦'),
  hint: t('影片播完後那一排「相關推薦」影片；重播等按鈕還在'),
});
defOpt('x.cleanUrl', true, {
  tab: 'clean',
  group: t('隱私'),
  label: t('清理網址追蹤參數'),
  hint: t('spm_id_from、vd_source、share_* 等'),
  reload: true,
});
defOpt('x.noReport', true, {
  tab: 'clean',
  group: t('隱私'),
  label: t('攔截資料上報'),
  hint: t('data.bilibili.com / cm.bilibili.com、Sentry、瀏覽器指紋'),
  reload: true,
});
defOpt('x.noP2P', true, {
  tab: 'clean',
  group: t('播放'),
  label: t('停用 P2P CDN 與 WebRTC'),
  hint: t('不替 B站上傳流量；影片位址換回官方 CDN'),
  reload: true,
});
defOpt('x.fitMode', true, {
  tab: 'clean',
  group: t('播放'),
  label: t('播放器設定加入「裁切模式」'),
  hint: t('在播放器的齒輪選單裡，讓畫面填滿播放器'),
  reload: true,
});

// ── 网址里的追踪参数 ──
// B站在站内跳转和分享链接上挂的来源标记。去掉不影响打开页面。
const TRACKING_PARAMS = new Set([
  'vd_source',
  'from_source',
  'from_spmid',
  'spmid',
  'csource',
  'msource',
  'bsource',
  'trackid',
  'refer_from',
  'plat_id',
  'unique_k',
  'bbid',
  'buvid',
  'mid',
  'up_id',
  'timestamp',
  'session_id',
  'launch_id',
  'live_from',
  'is_story_h5',
  '-Arouter',
]);
/** 以这些开头的也是：spm_id_from、share_source、share_medium、share_plat… */
const TRACKING_PREFIXES = ['spm', 'share'];
const isTrackingParam = (name) =>
  TRACKING_PARAMS.has(name) || TRACKING_PREFIXES.some((prefix) => name.startsWith(prefix));

/** 去掉网址里的追踪参数。解析不了、或者没有可去的参数时原样返回 */
const cleanUrl = (address) => {
  if (!address) return address;
  let url;
  try {
    url = new URL(address, location.href);
  } catch {
    return address;
  }
  const tracked = [...url.searchParams.keys()].filter(isTrackingParam);
  if (!tracked.length) return address;
  for (const name of tracked) url.searchParams.delete(name);
  return url.toString();
};

/** 地址栏：现在的网址清一次，之后页面每次改地址（pushState / replaceState）都先清再写 */
const keepAddressBarClean = () => {
  const history = W.history;
  const nativeReplace = history.replaceState;
  for (const method of ['pushState', 'replaceState']) {
    const native = history[method];
    history[method] = function (state, title, url, ...rest) {
      return native.call(this, state, title, cleanUrl(url), ...rest);
    };
  }
  const cleaned = cleanUrl(location.href);
  if (cleaned !== location.href) safe(() => nativeReplace.call(history, history.state, '', cleaned), '清理地址栏');
};

/**
 * 片尾充电名单：页面完成初始化之后把名单清空，播放器就不会在片尾放它。
 * 不能更早：首屏数据（__INITIAL_STATE__）是 Vue 的响应式数据，也是服务端渲染水合的依据，
 * 在它赋值时就改会造成水合不一致，B站整页重渲染、导航栏被清空。同样的原因，广告位数据不碰，只用样式藏。
 */
const skipChargeList = () => {
  const clear = () => {
    const list = W.__INITIAL_STATE__?.elecFullInfo?.list;
    if (Array.isArray(list) && list.length) W.__INITIAL_STATE__.elecFullInfo.list = [];
  };
  const later = () => setTimeout(() => safe(clear, '充电名单'), 1500);
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
};

/** 专栏 / 图文：复制时 B站会拦下来或在后面加一段出处，这里不让它的处理函数收到复制事件 */
const allowArticleCopy = () => {
  ready().then(() => {
    try {
      if (W.original) W.original.reprint = '1';
    } catch {
      // 旧版专栏页才有这个变量
    }
    const article = document.querySelector('.article-holder, .opus-module-content');
    article?.classList.remove('unable-reprint');
    article?.addEventListener('copy', (event) => event.stopImmediatePropagation(), true);
  });
};

// ── 裁切模式 ──
let fitCheckbox = null;
const setVideoFit = (on) => {
  flag('video-fit', on);
  if (fitCheckbox) fitCheckbox.checked = on;
};
/** 切换裁切模式，返回切换后的状态 */
const toggleVideoFit = () => {
  setVideoFit(!hasFlag('video-fit'));
  return hasFlag('video-fit');
};

/** 在播放器的齿轮菜单里加一个「裁切模式」开关 */
const addFitSwitch = () => {
  waitFor(() => document.querySelector('.bpx-player-ctrl-setting-menu-left'), '播放器设置菜单', 60000, 300)
    .then((menu) => {
      if (menu.querySelector('.bga-fit-switch')) return;
      // 照着 B站自己的开关（「镜像画面」）复制一个：结构、类名带来的样式都跟着播放器走
      const model = menu.querySelector('.bui-switch');
      if (!model) return;
      const item = model.cloneNode(true);
      item.className = 'bga-fit-switch bui bui-switch';
      // 行的排版是按原开关自己的类名写的，复制品换了类名就没有了：从原开关上读过来
      const layout = getComputedStyle(model);
      for (const property of ['display', 'alignItems', 'width', 'height', 'lineHeight'])
        item.style[property] = layout[property];
      item.querySelector('.bui-switch-name').textContent = t('裁切模式');
      const input = item.querySelector('input');
      input.setAttribute('aria-label', t('裁切模式'));
      input.checked = hasFlag('video-fit');
      input.addEventListener('change', () => setVideoFit(input.checked));
      menu.insertBefore(item, menu.querySelector('.bpx-player-ctrl-setting-more'));
      fitCheckbox = input;

      // 面板的高度是播放器建菜单时写死在 style 里的：清掉，改用「原高度 + 一行」的下限
      const panel = menu.closest('.bui-panel-item');
      const rowHeight = parseFloat(layout.height) || 32;
      const panelHeight = parseFloat(panel?.style.height) || 140;
      setRootVar('--bga-setting-height', `${panelHeight + rowHeight}px`);
      if (panel) panel.style.height = '';
      flag('fit-switch', true);
    })
    .catch(() => {});
};

function setupClean() {
  reflect('x.noGray', 'no-gray');
  reflect('x.noAds', 'no-ads');
  reflect('x.end.noRelated', 'end-no-related');
  if (!IS_TOP) return;

  if (PAGE.www && val('x.noElec')) skipChargeList();
  if ((PAGE.read || PAGE.opus) && val('x.articleCopy')) allowArticleCopy();
  if (val('x.cleanUrl')) keepAddressBarClean();
  if ((PAGE.video || PAGE.bangumi) && val('x.fitMode')) addFitSwitch();
}
