// ════════════════════════════ 播放页舞台 ════════════════════════════
// 版面规则在 src/css/stage.css（整体做法的说明也在那里）。这里做样式表做不了的几件事：
//   1. 量出播放器的实际高度，写进 --bga-stage，顶栏和下方内容据此让位；
//   2. 让播放器容器一直保持 B站「网页全屏」的样式；
//   3. 把弹幕输入栏并进控制栏；
//   4. 小窗：拖动改位置、拖左边缘改宽度，并记住。

defOpt('自动高度', true, {
  tab: 'video',
  group: t('播放器'),
  label: t('自動高度'),
  hint: t('播放器跟隨影片比例，上下不留黑邊'),
});
defOpt('预留高度', 96, {
  tab: 'video',
  group: t('播放器'),
  label: t('預留高度'),
  hint: t('播放器下方露出多少頁面內容；大於 0 時導航欄常駐。不會超過視窗高度的 25%'),
  unit: 'px',
});
defOpt('导航栏下置', true, { tab: 'video', group: t('導航欄'), label: t('導航欄放在播放器下方') });
defOpt('粘性导航栏', true, {
  tab: 'video',
  group: t('導航欄'),
  label: t('導航欄吸頂'),
  hint: t('向下捲動時導航欄固定在視窗頂部'),
});
defOpt('紧凑控件间距', true, {
  tab: 'video',
  group: t('控制欄'),
  label: t('緊湊控制欄'),
  hint: t('按鈕收到圖示大小、間距收緊，省下的寬度都給彈幕輸入框'),
});
defOpt('显示观看信息', true, { tab: 'video', group: t('控制欄'), label: t('顯示在看人數 / 彈幕數') });
defOpt('隐藏控件', true, {
  tab: 'video',
  group: t('控制欄'),
  label: t('平時隱藏控制欄'),
  hint: t('滑鼠移到播放器底部才顯示'),
});
defOpt('暂停显示控件', false, { tab: 'video', group: t('控制欄'), label: t('暫停時一直顯示控制欄') });
defOpt('小窗样式', true, {
  tab: 'video',
  group: '小窗',
  label: t('小窗可調整'),
  hint: t('拖小窗左邊緣改寬度，拖小窗本身改位置，並記住'),
});

/** 这些路径一定是播放页；其他路径要等页面出来、确认有播放器才算 */
const PLAYER_PATH = /^\/(video|bangumi\/play|list|medialist|cheese\/play)\//;
/**
 * 活动页（/festival/…，部分影片会被 B站转到这里）有自己的一套版面：上面是活动头图，播放器在页面中间的格子里。
 * 播放页的舞台版面是按普通播放页的结构写的，套上去导航栏会跑到页面中间，所以这类页面不启用。
 */
const isFestivalPage = () => PATH.startsWith('/festival/') || !!document.querySelector('.festival-video-player');

/**
 * 预留高度：播放器下面要露出多少页面。
 * 「預留高度」大于 0 时，在它之上再加一条导航栏的高度（所以导航栏常驻）；
 * 等于 0 时，导航栏在上面就只留它的位置，在下面就一点不留——播放器占满整个视窗。
 */
const updateKeep = () => {
  const extra = val('预留高度');
  const navOnTop = !val('导航栏下置');
  let keep = '0px';
  if (extra > 0) keep = `calc(var(--bga-nav) + ${extra}px)`;
  else if (navOnTop) keep = 'var(--bga-nav)';
  setRootVar('--bga-keep', keep);
};

/** 把播放器的实际高度写进 --bga-stage */
const trackStageHeight = (container) => {
  const measure = () => {
    if (container.dataset.screen === 'mini' || fullscreenElement()) return;
    // 画面比例还不知道（加载中、换下一个影片）时量到的高度不作数，沿用上一次的
    const video = container.querySelector('.bpx-player-video-wrap > video');
    if (video && video.videoWidth === 0 && !hasFlag('fill-stage')) return;
    const height = Math.round(container.getBoundingClientRect().height);
    setRootVar('--bga-stage', height > 0 && height <= window.innerHeight ? `${height}px` : null);
  };
  new ResizeObserver(measure).observe(container);
};

/**
 * 容器的 data-screen 一直保持 'web'：B站的样式表据此按全宽排控制栏。
 * 小窗（'mini'）由 B站自己切换，不动它。
 */
const pinWebLayout = (container) => {
  const pin = () => {
    const screen = container.dataset.screen;
    if (screen !== 'web' && screen !== 'mini') container.dataset.screen = 'web';
  };
  new MutationObserver(pin).observe(container, { attributes: true, attributeFilter: ['data-screen'] });
  pin();
};

/**
 * 弹幕输入栏并进控制栏中间（B站自己在全屏时也是这么放的）。
 * 退出全屏时 B站会把它搬回播放器下面，所以要一直盯着。
 */
const dockDanmakuBar = async (container) => {
  const locate = () => {
    const bar = container.querySelector('.bpx-player-sending-bar');
    const slot = container.querySelector('.bpx-player-control-bottom-center');
    // 输入栏里的东西是陆续建出来的，等弹幕那一组出现再搬
    return bar?.querySelector('.bpx-player-dm-root') && slot ? { bar, slot } : null;
  };
  try {
    await waitFor(locate, '弹幕输入栏', 30000, 200);
  } catch {
    return void warn('没找到弹幕输入栏，控制栏保持原样');
  }

  const dock = () => {
    const found = locate();
    if (!found) return;
    if (found.bar.parentElement !== found.slot) found.slot.append(found.bar);
    flag('dm-docked', true);
  };
  dock();
  const origin = container.querySelector('.bpx-player-sending-area');
  if (origin) new MutationObserver(dock).observe(origin, { childList: true });
  new MutationObserver(dock).observe(container, { attributes: true, attributeFilter: ['data-screen'] });
};

// ── 小窗 ──
const MINI_KEYS = { right: '小窗右', bottom: '小窗下', width: '小窗宽度' };
const MINI_DEFAULTS = { right: 52, bottom: 8, width: 320 };
const MINI_MIN_WIDTH = 180;

/** 按住拖动：onMove 每次移动调用，onDrop 松手调用 */
const trackDrag = (onMove, onDrop) => {
  const abort = new AbortController();
  const finish = () => {
    abort.abort();
    onDrop();
  };
  window.addEventListener('pointermove', onMove, { signal: abort.signal });
  window.addEventListener('pointerup', finish, { signal: abort.signal });
  window.addEventListener('pointercancel', finish, { signal: abort.signal });
};

const setupMini = (container) => {
  const applyMini = (name, value) => setRootVar(`--bga-mini-${name}`, `${value ?? MINI_DEFAULTS[name]}px`);
  for (const [name, key] of Object.entries(MINI_KEYS)) {
    applyMini(name, store.get(key));
    store.on(key, (value) => applyMini(name, value));
  }
  ACTIONS.push({
    tab: 'video',
    group: '小窗',
    label: t('小窗位置與寬度'),
    hint: t('回到右下角、預設寬度'),
    button: t('重設'),
    run() {
      for (const key of Object.values(MINI_KEYS)) store.del(key);
      toast(t('小窗已重設'));
    },
  });

  // 拖左边缘改宽度：右边不动
  const grip = h('div', { class: 'bga-mini-grip' });
  grip.addEventListener('mousedown', (event) => event.stopPropagation()); // 别触发 B站自己的拖动
  grip.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !hasFlag('mini')) return;
    event.preventDefault();
    event.stopPropagation();
    const rightEdge = container.getBoundingClientRect().right;
    let width;
    trackDrag(
      (move) => {
        width = Math.round(Math.max(MINI_MIN_WIDTH, rightEdge - move.clientX));
        applyMini('width', width);
      },
      () => {
        if (width) store.set(MINI_KEYS.width, width);
      },
    );
  });

  // 拖小窗本身改位置：记的是离视窗右边、底边的距离，不让它跑出视窗
  const startMove = (event) => {
    if (event.button !== 0 || !hasFlag('mini') || event.target.closest('.bga-mini-grip, .bpx-player-mini-close'))
      return;
    const box = container.getBoundingClientRect();
    const grabX = box.right - event.clientX;
    const grabY = box.bottom - event.clientY;
    let right;
    let bottom;
    trackDrag(
      (move) => {
        right = Math.round(
          Math.min(Math.max(0, window.innerWidth - move.clientX - grabX), window.innerWidth - box.width),
        );
        bottom = Math.round(
          Math.min(Math.max(0, window.innerHeight - move.clientY - grabY), window.innerHeight - box.height),
        );
        applyMini('right', right);
        applyMini('bottom', bottom);
      },
      () => {
        if (right === undefined) return;
        store.set(MINI_KEYS.right, right);
        store.set(MINI_KEYS.bottom, bottom);
      },
    );
  };

  // 小窗的遮罩层要到第一次进入小窗时才建出来
  const videoArea = container.querySelector('.bpx-player-video-area');
  if (!videoArea) return;
  observeChild('bpx-player-mini-warp', videoArea).then((layer) => {
    layer.append(grip);
    layer.addEventListener('pointerdown', startMove);
  });
};

/** 已经全屏时点全屏按钮：直接退出，不依赖播放器自己的判断 */
const fixFullscreenButton = (container) => {
  container.addEventListener(
    'click',
    (event) => {
      if (!fullscreenElement() || !event.target.closest?.('.bpx-player-ctrl-full')) return;
      event.stopPropagation();
      event.preventDefault();
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen;
      try {
        Promise.resolve(exit?.call(document)).catch(() => {});
      } catch {
        // 已经不在全屏
      }
    },
    true,
  );
};

async function setupStage() {
  // 确定是播放页的路径，一开始就挂上记号，样式从第一帧起生效，不闪一下原版面
  flag('page-player', PLAYER_PATH.test(PATH));
  reflect('导航栏下置', 'nav-top', true);
  reflect('粘性导航栏', 'nav-sticky');
  reflect('自动高度', 'fill-stage', true);
  reflect('紧凑控件间距', 'compact');
  reflect('显示观看信息', 'viewers');
  reflect('隐藏控件', 'quiet');
  reflect('暂停显示控件', 'pause-controls');
  reflect('小窗样式', 'mini');
  watch('预留高度', updateKeep);
  store.on('导航栏下置', updateKeep);

  await ready();
  if (!document.getElementById('bilibili-player') || isFestivalPage()) return void flag('page-player', false);
  flag('page-player', true);

  // 每次都从文档里找：B站重新渲染时会把 #bilibili-player 整个换掉，抓着旧节点会永远等不到
  const container = await waitFor(
    () => document.querySelector('#bilibili-player .bpx-player-container'),
    '播放器容器',
    30000,
  );
  trackStageHeight(container);
  pinWebLayout(container);
  dockDanmakuBar(container);
  fixFullscreenButton(container);
  safe(() => setupMini(container), '小窗');
  safe(() => setupPod(container), '选集浮层');
  log('播放页舞台已启用');
}
