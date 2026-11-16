// ════════════════════════════ 播放器：手动操作 ════════════════════════════
// 给快捷键和面板按钮调用的动作：倍速、快退快进、逐帧、截图、旋转镜像、复制干净链接、稍后再看。
// 自动发生的行为（记住倍速、默认弹幕、播完之后…）在 66-playback.js。

defOpt('x.rate.remember', true, {
  tab: 'video',
  group: t('播放'),
  label: t('記住倍速'),
  hint: t('換影片、重新整理後沿用上次調的倍速'),
});
defOpt('x.dm.default', 'keep', {
  tab: 'video',
  group: t('播放'),
  type: 'select',
  label: t('彈幕預設'),
  choices: [
    ['keep', t('不變')],
    ['on', t('開')],
    ['off', t('關')],
  ],
});
defOpt('x.sub.default', 'keep', {
  tab: 'video',
  group: t('播放'),
  type: 'select',
  label: t('字幕預設'),
  hint: t('影片有字幕時才有作用'),
  choices: [
    ['keep', t('不變')],
    ['on', t('開')],
    ['off', t('關')],
  ],
});
defOpt('x.seek.step', 5, { tab: 'video', group: t('播放'), label: t('快退 / 快進的秒數'), unit: t('秒'), step: 1 });
defOpt('x.wheelVolume', true, {
  tab: 'video',
  group: t('播放'),
  label: t('全螢幕時滾輪調音量'),
  hint: t('滑鼠在畫面上滾動，每格 5%'),
});
defOpt('x.end.exitFs', false, {
  tab: 'video',
  group: t('播放'),
  label: t('播完自動退出全螢幕'),
  hint: t('後面沒有接著播下一個影片時才退出'),
});
defOpt('x.shot.copy', false, {
  tab: 'video',
  group: t('播放'),
  label: t('截圖同時複製到剪貼簿'),
  hint: t('截圖一律會下載成 PNG；這項再多複製一份'),
});
defOpt('x.loud', false, {
  tab: 'video',
  group: t('播放'),
  label: t('響度均衡'),
  hint: t('把太大聲的地方壓低、整體音量拉高，各影片聽起來差不多大聲。如果開了以後沒聲音，關掉並重新整理'),
  reload: true,
});
defOpt('x.pod.order', 'normal', {
  tab: 'video',
  group: t('選集'),
  type: 'select',
  label: t('合集播放順序'),
  hint: t('一集播完後接著播哪一集'),
  choices: [
    ['normal', t('正常')],
    ['reverse', t('倒序')],
    ['random', t('隨機')],
  ],
});
defOpt('x.cleanShare', true, {
  tab: 'clean',
  group: t('隱私'),
  label: t('複製連結時去掉追蹤參數'),
  hint: t('B站「分享 → 複製連結」得到的網址不再帶 vd_source、share_source 等'),
});

// ── 找播放器 ──
/** 正在放的那个 <video>（不算 Safari 全屏用的隐形替身） */
const mainVideo = () => document.querySelector('#bilibili-player video:not(.bga-fs-decoy)');
const hasPlayer = () => PAGE.www && !!document.querySelector('#bilibili-player video');
/** B站播放器对外的接口对象；页面还没建好时是 null */
const biliPlayer = () => {
  try {
    return W.player || null;
  } catch {
    return null;
  }
};
const currentBvid = () => location.pathname.match(BVID_IN_URL)?.[1] || W.__INITIAL_STATE__?.bvid || '';
/** 网址里的分 P 号（?p=3），没有就是空字符串 */
const currentPart = () => new URLSearchParams(location.search).get('p') || '';
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// ── 倍速 ──
/** 脚本自己改倍速之后的一小段时间里，「倍速变了」不算用户调的（见 66-playback.js 的记住倍速） */
let rateQuietUntil = 0;

/** 优先走播放器自己的接口（界面上的倍速标签会跟着变），不行再直接改 <video> */
const setRate = (rate) => {
  const video = mainVideo();
  if (!video) return;
  rateQuietUntil = Date.now() + 600;
  try {
    biliPlayer()?.setPlaybackRate?.(rate);
  } catch {
    // 接口不可用：下面直接改
  }
  if (Math.abs(video.playbackRate - rate) > 0.001) video.playbackRate = rate;
};

/** 倍速加减 delta；delta 为 0 表示回到 1 倍 */
const stepRate = (delta) => {
  const video = mainVideo();
  if (!video) return;
  const rate = delta === 0 ? 1 : clamp(Math.round((video.playbackRate + delta) * 100) / 100, 0.25, 4);
  setRate(rate);
  if (val('x.rate.remember')) store.set('x.rate.value', rate);
  toast(t`倍速 ${rate}×`, 'info', 1200, 'rate');
};

// ── 播放、跳转 ──
const pauseVideo = (video) => {
  try {
    const player = biliPlayer();
    if (player?.pause) player.pause();
    else video.pause();
  } catch {
    video.pause();
  }
};
const playVideo = (video) => {
  try {
    const player = biliPlayer();
    if (player?.play) player.play();
    else video.play();
  } catch {
    video.play();
  }
};
const togglePlay = () => {
  const video = mainVideo();
  if (!video) return;
  if (video.paused) playVideo(video);
  else pauseVideo(video);
};

const seekBy = (seconds) => {
  const video = mainVideo();
  if (!video || !Number.isFinite(video.duration)) return;
  video.currentTime = clamp(video.currentTime + seconds, 0, Math.max(0, video.duration - 0.05));
};

/** 逐帧：先暂停，再走一帧（按 30 帧 / 秒算） */
const stepFrame = (direction) => {
  const video = mainVideo();
  if (!video) return;
  if (!video.paused) pauseVideo(video);
  seekBy(direction / 30);
};

// ── 截图 ──
const screenshot = async () => {
  const video = mainVideo();
  if (!video?.videoWidth) return void toast(t('影片還沒載入，無法截圖'), 'warn', 2000);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const pendingBlob = new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(t('無法取得畫面')))), 'image/png');
    });

    // 复制必须在按键这一下里同步发起：Safari 等不到图片编码完成就不认这次手势了。
    // 所以把「还没完成的图片」直接交给剪贴板，由它自己等。
    let pendingCopy = null;
    if (val('x.shot.copy')) {
      try {
        pendingCopy = navigator.clipboard.write([new W.ClipboardItem({ 'image/png': pendingBlob })]);
      } catch {
        // 浏览器不支持：只下载
      }
    }

    const second = Math.floor(video.currentTime);
    const stamp = `${String(Math.floor(second / 60)).padStart(2, '0')}m${String(second % 60).padStart(2, '0')}s`;
    const title = document.title.replace(/_哔哩哔哩.*$/, '').slice(0, 60);
    saveBlob(await pendingBlob, `${title} ${currentBvid()} ${stamp}`, 'png');

    const copied = pendingCopy
      ? await pendingCopy.then(
          () => true,
          () => false,
        )
      : false;
    const size = `${canvas.width}×${canvas.height}`;
    toast(copied ? t`截圖已保存並複製（${size}）` : t`截圖已保存（${size}）`, 'ok', 1800);
  } catch (error) {
    toast(t`截圖失敗：${error.message || error}`, 'warn');
  }
};

// ── 旋转 / 镜像 ──
// 只用 CSS 变换，不动播放器的状态；换影片时复位（见 66-playback.js）。
const turn = { degrees: 0, mirrored: false };

const applyTurn = () => {
  const video = mainVideo();
  // 转 90° / 270° 后宽高对调：算一个缩放比例，让转过来的画面仍然完整地放进播放器
  let scale = 1;
  if (turn.degrees % 180 && video?.videoWidth) {
    const box = video.parentElement.getBoundingClientRect();
    const fit = Math.min(box.width / video.videoWidth, box.height / video.videoHeight);
    const shownWidth = video.videoWidth * fit;
    const shownHeight = video.videoHeight * fit;
    scale = Math.min(box.width / shownHeight, box.height / shownWidth);
  }
  const active = turn.degrees !== 0 || turn.mirrored;
  const transform = `rotate(${turn.degrees}deg) scale(${scale.toFixed(4)})${turn.mirrored ? ' scaleX(-1)' : ''}`;
  setRootVar('--bga-turn', active ? transform : null);
  flag('turned', active);
};
const resetTurn = () => {
  if (!turn.degrees && !turn.mirrored) return;
  turn.degrees = 0;
  turn.mirrored = false;
  applyTurn();
};
const rotateVideo = () => {
  turn.degrees = (turn.degrees + 90) % 360;
  applyTurn();
  toast(turn.degrees ? t`畫面旋轉 ${turn.degrees}°` : t('畫面旋轉：還原'), 'info', 1200, 'turn');
};
const mirrorVideo = () => {
  turn.mirrored = !turn.mirrored;
  applyTurn();
  toast(turn.mirrored ? t('畫面鏡像：開') : t('畫面鏡像：關'), 'info', 1200, 'turn');
};

// ── 复制干净的链接 ──
const copyCleanLink = () => {
  const bvid = currentBvid();
  const part = currentPart();
  const url = bvid
    ? `https://www.bilibili.com/video/${bvid}/${part && part !== '1' ? `?p=${part}` : ''}`
    : cleanUrl(location.href).replace(/#.*$/, '');
  const copied = copyNow(url);
  toast(copied ? t('已複製乾淨連結') : t('複製失敗'), copied ? 'ok' : 'warn', 1500);
};

// ── 稍后再看 ──
/** 把一个影片加入稍后再看，结果用提示条告诉用户 */
const addToWatchLater = async (bvid) => {
  const csrf = loginCsrf();
  if (!csrf) return void toast(t('要先登入 B站才能加入稍後再看'), 'warn');
  try {
    const response = await fetch('https://api.bilibili.com/x/v2/history/toview/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ bvid, csrf }).toString(),
    });
    const result = await response.json();
    if (result?.code !== 0) throw new Error(result?.message || t`錯誤碼 ${result?.code}`);
    toast(t('已加入稍後再看'), 'ok', 2000);
  } catch (error) {
    toast(t`加入稍後再看失敗：${error.message || error}`, 'warn');
  }
};

const addSelfToWatchLater = async () => {
  const bvid = currentBvid();
  if (bvid) await addToWatchLater(bvid);
};

/**
 * 「把所有开着的影片分页加入稍后再看」：往共用的存储里写一个请求，
 * 每个开着影片页的分页收到存储变化后，各自把自己加进去（见 66-playback.js）。
 */
const requestWatchLaterAll = () => {
  store.set('x.wl.req', { t: Date.now(), n: Math.random() });
  if (!PAGE.video) toast(t('已通知所有開著的影片分頁'));
};

ACTIONS.push({
  tab: 'video',
  group: t('稍後再看'),
  label: t('把所有開著的影片分頁加入稍後再看'),
  hint: t('每個開著影片頁的分頁各自把自己加入；需要已登入'),
  button: t('加入'),
  run: requestWatchLaterAll,
});
