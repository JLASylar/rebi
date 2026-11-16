// ════════════════════════════ 播放器：自动行为 ════════════════════════════
// 记住倍速、弹幕 / 字幕默认、全屏滚轮调音量、播完之后做什么、响度均衡、复制链接时去掉追踪参数。
// 选项在 64-player.js 里登记。

/** 只关心主影片的媒体事件。媒体事件不冒泡，所以在 document 上用捕获阶段听 */
const onMainVideo = (type, handler) => {
  document.addEventListener(
    type,
    (event) => {
      if (event.target instanceof HTMLVideoElement && event.target === mainVideo()) handler(event);
    },
    true,
  );
};
const onFullscreenChange = (handler) => {
  for (const type of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(type, handler);
};
const exitFullscreen = () => {
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen;
  try {
    Promise.resolve(exit?.call(document)).catch(() => {});
  } catch {
    // 已经不在全屏
  }
};

// ── 复制链接时去掉追踪参数 ──
// B站的「分享 → 复制链接」两种写法都有（剪贴板接口 / 选中文本后 execCommand），两边都接。
function cleanCopiedLinks() {
  const BILI_LINK = /https?:\/\/[^\s"'<>，。]*(?:bilibili\.com|b23\.tv)\/[^\s"'<>，。]*/g;
  const cleanText = (text) => (typeof text === 'string' ? text.replace(BILI_LINK, (link) => cleanUrl(link)) : text);

  safe(() => {
    const clipboard = W.navigator.clipboard;
    if (!clipboard?.writeText) return;
    const nativeWrite = clipboard.writeText.bind(clipboard);
    clipboard.writeText = (text) => nativeWrite(val('x.cleanShare') ? cleanText(text) : text);
  }, '剪贴板');

  document.addEventListener(
    'copy',
    (event) => {
      if (!val('x.cleanShare') || !event.clipboardData) return;
      const field = document.activeElement;
      const inField = field && /^(TEXTAREA|INPUT)$/.test(field.tagName) && typeof field.selectionStart === 'number';
      const selected = inField
        ? field.value.slice(field.selectionStart, field.selectionEnd)
        : String(window.getSelection() || '');
      const cleaned = cleanText(selected);
      if (!selected || cleaned === selected) return;
      event.clipboardData.setData('text/plain', cleaned);
      event.preventDefault();
    },
    true,
  );
}

// ── 记住倍速 ──
/** 返回「把记住的倍速套到当前影片上」的函数，别处（弹幕开关就绪后）也要调用一次 */
function rememberRate() {
  const applyRate = () => {
    if (!val('x.rate.remember')) return;
    const rate = Number(store.get('x.rate.value', 1));
    const video = mainVideo();
    if (video && rate > 0 && Math.abs(video.playbackRate - rate) > 0.001) setRate(rate);
  };

  // 用户在播放器上调了倍速：记下来
  onMainVideo('ratechange', ({ target: video }) => {
    if (!val('x.rate.remember') || Date.now() < rateQuietUntil) return;
    // 换影片时播放器自己会把倍速重设成 1，那不算用户调的：只认已经在播的时候发生的变化
    if (video.readyState < 3 || video.currentTime < 1) return;
    store.set('x.rate.value', video.playbackRate);
  });
  for (const type of ['loadstart', 'emptied']) {
    onMainVideo(type, () => {
      rateQuietUntil = Date.now() + 3000;
    });
  }

  // 只在换了影片时套用（载入完一次，随后第一次开始播再一次）。之后暂停、拖动、缓冲都不再动——
  // 否则别的分页改了倍速，这个分页一暂停再播就会被带着变。
  let pending = false;
  onMainVideo('loadedmetadata', () => {
    pending = true;
    applyRate();
  });
  onMainVideo('playing', () => {
    if (!pending) return;
    pending = false;
    applyRate();
    setTimeout(applyRate, 600);
  });
  return applyRate;
}

// ── 弹幕 / 字幕默认 ──
const DANMAKU_SWITCH = '.bpx-player-dm-switch input.bui-danmaku-switch-input';

const applyDanmakuDefault = () => {
  const mode = val('x.dm.default');
  const input = document.querySelector(DANMAKU_SWITCH);
  if (mode !== 'keep' && input && input.checked !== (mode === 'on')) input.click();
};
const applySubtitleDefault = () => {
  const mode = val('x.sub.default');
  const menu = document.querySelector('.bpx-player-ctrl-subtitle');
  if (mode === 'keep' || !menu || getComputedStyle(menu).display === 'none') return;
  const active = menu.querySelector('.bpx-player-ctrl-subtitle-language-item.bpx-state-active');
  if (mode === 'on' && !active) menu.querySelector('.bpx-player-ctrl-subtitle-language-item')?.click();
  if (mode === 'off' && active) menu.querySelector('.bpx-player-ctrl-subtitle-close-switch')?.click();
};

/** 每个影片套用一次默认值；applyRate 是 rememberRate() 返回的函数 */
function applyDefaultsPerVideo(applyRate) {
  // 切画质、换线路也会触发 loadedmetadata：同一个影片不重复套用，免得把用户刚手动改的又改回去
  const videoKey = () => `${currentBvid()}|${currentPart()}|${location.pathname}`;
  let appliedKey = '';
  const applyDefaults = () => {
    const key = videoKey();
    if (key === appliedKey) {
      // 还是同一个影片（切了画质）：横过来的画面要按新尺寸重算缩放
      if (turn.degrees % 180) applyTurn();
      return;
    }
    appliedKey = key;
    resetTurn();
    safe(applyDanmakuDefault, '默认弹幕');
    safe(applySubtitleDefault, '默认字幕');
  };

  let timer = 0;
  onMainVideo('loadedmetadata', () => {
    clearTimeout(timer);
    timer = setTimeout(applyDefaults, 1500);
  });
  // 页面刚打开时播放器的控件比影片晚出来：等弹幕开关出现再套一次
  waitFor(() => document.querySelector(DANMAKU_SWITCH), '弹幕开关', 30000, 300)
    .then(() =>
      setTimeout(() => {
        applyDefaults();
        applyRate();
      }, 800),
    )
    .catch(() => {});
}

// ── 全屏时滚轮调音量 ──
function wheelVolume() {
  /** 鼠标在这些东西上滚动时不调音量：控制栏、各种菜单、选集浮层、设置面板 */
  const SCROLLABLE_UI = [
    '.bpx-player-control-wrap',
    '.bpx-player-sending-area',
    '.bpx-player-contextmenu',
    '.bpx-player-ending-panel',
    '.bga-pod-fs',
    '#bga-panel',
    '[class*="-menu"]',
    '[class*="setting-wrap"]',
  ].join(',');
  const STEP = 0.05;

  // 触控板 / Magic Mouse 一次滑动会带出一长串惯性事件：
  // 攒够 30 才算一格，每 80ms 最多走一格，停 200ms 就清零
  let accumulated = 0;
  let lastEventAt = 0;
  let lastStepAt = 0;

  const changeVolume = (video, direction) => {
    const player = biliPlayer();
    let current = video.volume;
    try {
      if (player?.getVolume) current = player.getVolume();
    } catch {
      // 用 <video> 自己的音量
    }
    const next = clamp(Math.round((current + direction * STEP) * 100) / 100, 0, 1);
    try {
      if (player?.setVolume) player.setVolume(next);
      else video.volume = next;
      if (next > 0 && video.muted) {
        if (player?.setMuted) player.setMuted(false);
        else video.muted = false;
      }
    } catch {
      video.volume = next;
    }
    toast(t`音量 ${Math.round(next * 100)}%`, 'info', 900, 'vol');
  };

  const onWheel = (event) => {
    if (!val('x.wheelVolume') || event.ctrlKey || event.metaKey) return;
    const fullscreen = fullscreenElement();
    const target = event.target;
    const overVideo =
      fullscreen &&
      target instanceof Element &&
      fullscreen.contains(target) &&
      target.closest('.bpx-player-video-area');
    if (!overVideo || target.closest(SCROLLABLE_UI)) return;
    const video = mainVideo();
    if (!video) return;
    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();
    if (now - lastEventAt > 200) accumulated = 0;
    lastEventAt = now;
    accumulated += event.deltaY;
    if (Math.abs(accumulated) < 30 || now - lastStepAt < 80) return;
    const direction = accumulated < 0 ? 1 : -1;
    accumulated = 0;
    lastStepAt = now;
    changeVolume(video, direction);
  };

  // 监听只在全屏期间挂着：非被动的 wheel 监听会拖慢平时的页面滚动
  let listening = false;
  onFullscreenChange(() => {
    const wanted = !!fullscreenElement();
    if (wanted === listening) return;
    listening = wanted;
    if (wanted) document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    else document.removeEventListener('wheel', onWheel, { capture: true });
  });
}

// ── 播完之后 ──
function afterPlaybackEnds() {
  /** 合集列表里的各集（不算全屏时放进播放器里的副本） */
  const episodes = () =>
    [...document.querySelectorAll('.video-pod__body .simple-base-item')].filter((row) => !row.closest('.bga-pod-fs'));
  const isCurrent = (row) => row.classList.contains('active') || !!row.querySelector('.active');

  /** 按「合集播放順序」决定下一集；返回 true 表示已经处理，不用播放器自己接着播 */
  const playNextInOrder = () => {
    const order = val('x.pod.order');
    if (order === 'normal') return false;
    const rows = episodes();
    const current = rows.findIndex(isCurrent);
    // 倒序播到第一集就停：不拦的话播放器会自己接着播第二集，然后又被倒回第一集，来回跳
    if (order === 'reverse' && current === 0) return true;

    let next = -1;
    if (order === 'reverse') {
      next = current - 1;
    } else if (rows.length > 1) {
      do {
        next = Math.floor(Math.random() * rows.length);
      } while (next === current);
    }
    if (current < 0 || !rows[next]) return false;
    (rows[next].querySelector('.title') || rows[next]).click();
    return true;
  };

  onMainVideo('ended', (event) => {
    if (playNextInOrder()) {
      // 拦在播放器自己的「播下一个」前面
      event.stopImmediatePropagation();
      return;
    }
    if (!val('x.end.exitFs') || !fullscreenElement()) return;
    // 等一下再退：如果播放器接着播下一个影片了，就不退
    setTimeout(() => {
      if (mainVideo()?.ended && fullscreenElement()) exitFullscreen();
    }, 1500);
  });
}

// ── 响度均衡 ──
// <video> → 压缩器 → 增益 → 输出。接上以后拆不掉，所以这个开关要重新整理才生效。
function normalizeLoudness() {
  const wired = new WeakSet();
  let audio = null;
  let userActed = false;

  const wire = (video) => {
    // 两个前提：
    //   用户已经在页面上点过 / 按过键——否则音频环境起不来，接上去就没声音；
    //   影片走的是 MSE（blob 地址）——直接播跨域地址的话，接上去只会输出静音。
    const usesMse = String(video.currentSrc || video.src || '').startsWith('blob:');
    if (!userActed || wired.has(video) || !usesMse) return;
    try {
      audio ||= new (W.AudioContext || W.webkitAudioContext)();
      if (audio.state !== 'running') {
        audio
          .resume()
          .then(() => wire(video))
          .catch(() => {});
        return;
      }
      wired.add(video);
      const compressor = audio.createDynamicsCompressor();
      compressor.threshold.value = -30;
      compressor.knee.value = 20;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      const gain = audio.createGain();
      gain.gain.value = 1.6;
      audio.createMediaElementSource(video).connect(compressor);
      compressor.connect(gain);
      gain.connect(audio.destination);
    } catch (error) {
      wired.add(video);
      warn('响度均衡', error);
      toast(t('響度均衡啟用失敗（播放器已經佔用了音訊處理）'), 'warn');
    }
  };

  for (const type of ['play', 'playing']) onMainVideo(type, (event) => wire(event.target));
  const onUserAction = () => {
    userActed = true;
    try {
      if (audio && audio.state !== 'running') audio.resume();
    } catch {
      // 下次播放时再试
    }
    const video = mainVideo();
    if (video && !video.paused) wire(video);
  };
  for (const type of ['pointerdown', 'keydown']) document.addEventListener(type, onUserAction, true);
}

function setupPlayback() {
  cleanCopiedLinks();
  if (!IS_TOP || !PAGE.www) return;

  // 「把所有开着的影片分页加入稍后再看」：收到请求（15 秒内的才算数）就把自己加进去
  store.on('x.wl.req', (request) => {
    if (request && PAGE.video && Date.now() - (request.t || 0) < 15000) addSelfToWatchLater();
  });

  applyDefaultsPerVideo(rememberRate());
  wheelVolume();
  afterPlaybackEnds();
  if (val('x.loud')) normalizeLoudness();

  // 横过来的画面：全屏切换、窗口大小变化后按新尺寸重算缩放
  onFullscreenChange(() => {
    if (turn.degrees % 180) setTimeout(applyTurn, 300);
  });
  window.addEventListener('resize', () => {
    if (turn.degrees % 180) applyTurn();
  });
}
