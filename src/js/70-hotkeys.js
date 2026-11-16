// ════════════════════════════ 快捷键 ════════════════════════════
// 这里登记每个动作和它的预设键位；键位都可以在面板的「快捷鍵」页改。

/** 点一下播放器上的某个控件；它不存在或被藏起来时提示 missing */
const clickControl = (selector, missing) => {
  const control = document.querySelector(selector);
  if (!control || getComputedStyle(control).display === 'none') return void toast(missing, 'warn', 2000);
  control.click();
};

// ── 通用 ──
defKey('panel', 'Alt+Shift+KeyW', {
  group: t('通用'),
  label: t('開關設定面板'),
  when: () => IS_TOP && !!panelToggle,
  run: () => panelToggle(),
});

// ── 播放页 ──
/** 播放页的快捷键：有播放器时才响应 */
const playerKey = (id, combo, meta) => defKey(id, combo, { group: t('播放頁'), when: hasPlayer, ...meta });
const seekStep = () => Number(val('x.seek.step')) || 5;

playerKey('pod', 'KeyL', {
  label: t('選集浮層'),
  hint: t('合集 / 分 P 清單，全螢幕下也可以用'),
  run: () => clickControl('.bpx-player-ctrl-eplist, .bga-pod-btn', t('這個影片沒有選集')),
});
playerKey('pip', 'KeyP', {
  label: t('畫中畫'),
  run: () => clickControl('.bpx-player-ctrl-pip', t('找不到畫中畫按鈕')),
});
playerKey('fit', 'KeyC', {
  label: t('裁切模式'),
  hint: t('畫面填滿播放器'),
  run: () => toast(toggleVideoFit() ? t('裁切模式：開') : t('裁切模式：關'), 'info', 1200),
});
playerKey('subtitle', 'KeyV', {
  label: t('字幕開關'),
  run: () =>
    clickControl(
      '.bpx-player-ctrl-subtitle .bpx-player-ctrl-btn-icon, .bpx-player-ctrl-subtitle',
      t('這個影片沒有字幕'),
    ),
});
playerKey('playPause', 'KeyS', { label: t('播放 / 暫停'), run: togglePlay });
playerKey('seekBack', 'KeyA', {
  label: t('快退'),
  hint: t('秒數在「播放頁 → 播放」裡設定'),
  repeat: true,
  run: () => seekBy(-seekStep()),
});
playerKey('seekFwd', 'KeyD', { label: t('快進'), repeat: true, run: () => seekBy(seekStep()) });
playerKey('frameBack', 'Comma', { label: t('上一幀'), hint: t('會先暫停'), repeat: true, run: () => stepFrame(-1) });
playerKey('frameFwd', 'Period', { label: t('下一幀'), repeat: true, run: () => stepFrame(1) });
playerKey('shot', 'Shift+KeyS', { label: t('截圖'), hint: t('以影片原始解析度存成 PNG'), run: screenshot });
playerKey('dmToggle', 'Shift+KeyD', {
  label: t('彈幕開關'),
  run: () => clickControl('.bpx-player-dm-switch input.bui-danmaku-switch-input', t('找不到彈幕開關')),
});
playerKey('rotate', 'Shift+KeyR', { label: t('畫面旋轉 90°'), run: rotateVideo });
playerKey('mirror', 'Shift+KeyM', { label: t('畫面鏡像'), run: mirrorVideo });
playerKey('copyLink', 'Shift+KeyC', {
  label: t('複製乾淨連結'),
  hint: t('不帶任何追蹤參數的影片網址'),
  run: copyCleanLink,
});
playerKey('saveCover', '', { label: t('保存目前影片的封面'), run: saveCurrentCover });
playerKey('toViewAll', '', {
  label: t('所有開著的影片分頁加入稍後再看'),
  when: () => IS_TOP,
  run: requestWatchLaterAll,
});
playerKey('rateUp', 'Shift+Period', { label: t('加速 0.25×'), repeat: true, run: () => stepRate(0.25) });
playerKey('rateDown', 'Shift+Comma', { label: t('減速 0.25×'), repeat: true, run: () => stepRate(-0.25) });
playerKey('rateReset', 'Shift+Slash', { label: t('回到 1× 倍速'), run: () => stepRate(0) });
playerKey('dmSearch', '', {
  label: t('打開彈幕查詢'),
  when: () => IS_TOP && hasPlayer() && !!panelToggle,
  run: () => {
    if (!document.querySelector('#bga-panel:popover-open')) panelToggle();
    document.querySelector('#bga-panel .bga-tab[data-tab="danmaku"]')?.click();
    document.querySelector('#bga-panel .bga-page[data-active] input[type=search]')?.focus();
  },
});

// ── 直播 ──
/** 直播播放器对外的接口对象。播放器有时在 iframe 里，接口挂在顶层窗口上 */
const livePlayer = () => {
  try {
    return W.livePlayer || W.top.livePlayer;
  } catch {
    return W.livePlayer;
  }
};
const hasLivePlayer = () => PAGE.live && !!livePlayer()?.setFullscreenStatus;
/** setFullscreenStatus 的参数：0 普通、1 网页全屏、2 全屏 */
const LIVE_SCREEN = { normal: 0, web: 1, full: 2 };
const liveScreen = () => {
  if (document.body.classList.contains('player-full-win')) return LIVE_SCREEN.web;
  if (fullscreenElement() || document.body.classList.contains('fullscreen-fix')) return LIVE_SCREEN.full;
  return LIVE_SCREEN.normal;
};
/** 已经在这个模式里就退回普通，否则进入 */
const toggleLiveScreen = (mode) => livePlayer().setFullscreenStatus(liveScreen() === mode ? LIVE_SCREEN.normal : mode);

defKey('liveWeb', 'KeyW', {
  group: t('直播'),
  label: t('網頁全屏'),
  when: hasLivePlayer,
  run: () => toggleLiveScreen(LIVE_SCREEN.web),
});
defKey('liveFull', 'KeyF', {
  group: t('直播'),
  label: t('全螢幕'),
  when: hasLivePlayer,
  run: () => toggleLiveScreen(LIVE_SCREEN.full),
});
defKey('liveChat', 'KeyH', {
  group: t('直播'),
  label: t('收起 / 展開聊天'),
  hint: t('網頁全屏或全螢幕時才有作用'),
  when: hasLivePlayer,
  run: () => {
    if (liveScreen() === LIVE_SCREEN.normal) return void toast(t('先進入網頁全屏或全螢幕，才能收起聊天'), 'info', 2000);
    document.getElementById('aside-area-toggle-btn')?.click();
  },
});

function setupHotkeys() {
  /** 焦点在输入框里：这时不带修饰键的单键是在打字，不当快捷键 */
  const isTyping = (event) => {
    const target = event.composedPath?.()[0] || event.target;
    if (target?.nodeType !== Node.ELEMENT_NODE) return false;
    return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
  };
  const applies = (hotkey) => {
    try {
      return !hotkey.when || !!hotkey.when();
    } catch {
      return false;
    }
  };

  // 挂在 window 的捕获阶段，而且 document-start 就装：比 B站播放器自己的按键处理先拿到事件
  window.addEventListener(
    'keydown',
    (event) => {
      if (keyCapturing || event.isComposing) return;
      const combo = comboOf(event);
      if (!combo) return;
      if (isTyping(event) && !(event.altKey || event.ctrlKey || event.metaKey)) return;
      // 面板开着时只认「開關設定面板」。用「面板是否打开」判断而不是看焦点：Safari 点按钮不会把焦点移过去
      const panelOpen = !!document.querySelector('#bga-panel:popover-open');

      for (const hotkey of HOTKEYS) {
        if (keyOf(hotkey) !== combo) continue;
        if (panelOpen && hotkey.id !== 'panel') continue;
        if (!applies(hotkey)) continue;
        event.preventDefault();
        event.stopImmediatePropagation();
        // 按住不放时只有标了 repeat 的动作连续触发
        if (!event.repeat || hotkey.repeat) safe(() => hotkey.run(), `快捷键 ${hotkey.id}`);
        return;
      }
    },
    true,
  );
}
