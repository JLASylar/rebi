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
