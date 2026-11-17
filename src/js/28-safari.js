// ════════════════════════════ Safari：全屏暂停时右下角点不动 ════════════════════════════
// 元素全屏且影片暂停时，WebKit 会在整个网页上盖一层原生的「原况文字」识别图层
// （它取全屏元素里面积最大的 <video> 当主影片，暂停 250ms 后开始识别），这一层会吃掉右下角的点击。
// 对策：放一个面积更大、一直在播放的隐形 <video> 当「主影片」，识别就不会启动。

if (IS_SAFARI) {
  defOpt('x.safari.liveText', false, {
    tab: 'video',
    group: 'Safari',
    label: t('全螢幕暫停時保留原況文字'),
    hint: t('開啟後可以在全螢幕暫停的畫面上框選文字，但暫停時右下角的按鈕（選集、小窗、退出全螢幕）會點不動'),
  });
}

function setupLiveTextGuard() {
  if (!IS_SAFARI) return;
  let decoy = null;

  const removeDecoy = () => {
    if (!decoy) return;
    try {
      decoy.srcObject?.getTracks().forEach((track) => track.stop());
    } catch {
      // 流已经停了
    }
    decoy.remove();
    decoy = null;
  };

  const createDecoy = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    canvas.getContext('2d').fillRect(0, 0, 2, 2);

    const video = document.createElement('video');
    video.className = 'bga-fs-decoy';
    video.muted = true;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.tabIndex = -1;
    video.setAttribute('aria-hidden', 'true');
    // 比全屏元素四边各大 2px，保证面积最大
    video.style.cssText = [
      'position:absolute!important',
      'left:-2px!important',
      'top:-2px!important',
      'width:calc(100% + 4px)!important',
      'height:calc(100% + 4px)!important',
      'opacity:0!important',
      'pointer-events:none!important',
      'z-index:-1!important',
    ].join(';');
    video.srcObject = canvas.captureStream();
    return video;
  };

  const sync = () => {
    const fullscreen = fullscreenElement();
    const wanted =
      fullscreen &&
      !val('x.safari.liveText') &&
      fullscreen.tagName !== 'VIDEO' &&
      fullscreen.querySelector('video:not(.bga-fs-decoy)');
    if (!wanted) return removeDecoy();
    if (decoy?.parentElement === fullscreen) return;
    removeDecoy();
    try {
      decoy = createDecoy();
      fullscreen.append(decoy);
      decoy.play()?.catch(() => {});
    } catch {
      removeDecoy();
    }
  };

  for (const type of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(type, sync, true);
  store.on('x.safari.liveText', sync);
}

// ════════════════════════════ Safari：导航栏搜索框的提示文字只露出下半截 ════════════════════════════
// 现象：页面刚载入后，搜索框里的提示文字偶尔只画出下半截，一直留着，直到输入框的样式被重新计算。
// 查到的事实（真 Safari、document-start 注入、全新视窗重新整理，约三四次出现一次）：
//   · 输入框和外层的尺寸、行高、字号都正常，没有东西盖在上面——是输入框内部那一层的排版没跟上；
//   · 把我们的样式表逐张关掉都还会出现，全部关掉才不出现：不是哪条规则，而是「页面自己的样式表到达之前
//     已经有样式表在场」这件事本身，让 WebKit 在页面样式到达后漏掉了对输入框内部的重排；
//   · 给输入框增删一个类名（触发一次样式重算）就立刻恢复。
// 对策：输入框出现后的头几秒每一帧催一次重算（画坏最多停留一帧），之后每两秒再催一次保底。
// 输入框有焦点时不动它。
function setupSearchRelayout() {
  if (!IS_SAFARI) return;
  const NUDGE_CLASS = 'bga-relayout';
  const BURST_MS = 6000;
  const nudge = () => {
    const input = document.querySelector('.nav-search-input');
    if (!input || document.activeElement === input) return;
    input.classList.add(NUDGE_CLASS);
    void input.offsetHeight;
    input.classList.remove(NUDGE_CLASS);
  };
  let burstUntil = 0;
  let running = false;
  const frame = () => {
    nudge();
    if (performance.now() < burstUntil) requestAnimationFrame(frame);
    else running = false;
  };
  const burst = () => {
    burstUntil = performance.now() + BURST_MS;
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  };
  burst();
  for (const type of ['DOMContentLoaded', 'load', 'pageshow']) addEventListener(type, burst, true);
  document.addEventListener('visibilitychange', () => document.hidden || burst());
  // 页面的样式表陆续到达：每到一张再催几秒（load 事件不冒泡，用捕获听）
  document.addEventListener('load', (event) => event.target?.localName === 'link' && burst(), true);
  setInterval(nudge, 2000);
}

