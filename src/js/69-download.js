// ════════════════════════════ 影片下载 ════════════════════════════
// 影片页工具列多一个「下載」：列出这部影片 B站现在肯给的每一档清晰度，选一档就在浏览器里下载、合成 MP4。
// 取流用网页播放器同一个接口（带登录状态），所以能下载的清晰度和网页上能看的一样：
// 没登录最高 480P，登录后 1080P，1080P 60 帧、4K 这些要大会员。不做任何绕过。
// 1080P 以上只有音画分开的格式：两段都下载完，交给 68-mp4.js 合成一个普通的 MP4。

// Mac App Store 版不带下载（构建时 BUILD.download = false，见 tools/build.py）：选项和按钮都不出现
const DOWNLOAD_BUILT = BUILD.download !== false;
if (DOWNLOAD_BUILT) defOpt('x.dl', true, {
  tab: 'video',
  group: t('下載'),
  label: t('影片下載'),
  hint: t('影片頁工具列多一個「下載」，選清晰度後在瀏覽器裡下載並合成 MP4；能下載的清晰度和網頁上能看的一樣'),
});
if (DOWNLOAD_BUILT) defOpt('x.dl.codec', 'avc', {
  tab: 'video',
  group: t('下載'),
  type: 'select',
  label: t('優先的編碼'),
  hint: t('AVC 幾乎所有播放器都能開；HEVC、AV1 檔案小一些，但舊的裝置可能播不了。影片沒有這種編碼時自動換別的'),
  choices: [
    ['avc', 'AVC (H.264)'],
    ['hevc', 'HEVC (H.265)'],
    ['av1', 'AV1'],
  ],
});

const CODEC_IDS = { avc: 7, hevc: 12, av1: 13 };
const CODEC_NAMES = { 7: 'AVC', 12: 'HEVC', 13: 'AV1' };
/** 分段下载：每段 4 MB，同时 4 段 */
const DL_CHUNK = 4 * 1024 * 1024;
const DL_PARALLEL = 4;

/** 这一页正在放的影片：BV 号、cid、标题、第几 P */
const currentVideo = async () => {
  const state = W.__INITIAL_STATE__ || {};
  const bvid = location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/)?.[1] || state.videoData?.bvid;
  if (!bvid) throw new Error(t('這個頁面找不到影片 BV 號'));
  const cid = await dm.cid();
  const pages = state.videoData?.bvid === bvid ? state.videoData.pages || [] : [];
  const part = Math.max(1, parseInt(new URLSearchParams(location.search).get('p') || '1', 10) || 1);
  const title = (state.videoData?.bvid === bvid && state.videoData.title) || document.querySelector('h1')?.textContent || bvid;
  const partTitle = pages.length > 1 ? pages[part - 1]?.part || '' : '';
  return { bvid, cid, title: String(title).trim(), part: pages.length > 1 ? part : 0, partTitle };
};

/** 向 B站要这一 P 的所有清晰度（音画分开的格式），再加上登录 / 大会员状态，用来说明缺的那几档 */
const fetchStreams = async (video) => {
  const query = `bvid=${encodeURIComponent(video.bvid)}&cid=${video.cid}&qn=127&fnval=4048&fnver=0&fourk=1`;
  const [play, nav] = await Promise.all([
    dm.getJSON(`https://api.bilibili.com/x/player/playurl?${query}`),
    dm.getJSON('https://api.bilibili.com/x/web-interface/nav').catch(() => null),
  ]);
  if (play?.code !== 0) throw new Error(play?.message || t`錯誤碼 ${play?.code}`);
  const data = play.data || {};
  if (!data.dash) throw new Error(t('這部影片沒有可下載的格式'));
  const names = new Map((data.support_formats || []).map((format) => [format.quality, format.new_description || format.display_desc]));
  const order = [CODEC_IDS[val('x.dl.codec')] || 7, 7, 12, 13];
  const byQuality = new Map();
  for (const stream of data.dash.video || []) {
    const list = byQuality.get(stream.id) || [];
    list.push(stream);
    byQuality.set(stream.id, list);
  }
  const qualities = [...byQuality.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([quality, list]) => {
      const stream = order.map((codec) => list.find((item) => item.codecid === codec)).find(Boolean) || list[0];
      return { quality, name: names.get(quality) || String(quality), stream, codec: CODEC_NAMES[stream.codecid] || stream.codecs };
    });
  // 网页上列着、这次却没给的清晰度：没登录是要登录，登录了就是要大会员
  const given = new Set(byQuality.keys());
  const locked = (data.accept_quality || [])
    .filter((quality) => !given.has(quality) && quality > (qualities[0]?.quality || 0))
    .map((quality) => names.get(quality) || String(quality));
  const audio = [...(data.dash.audio || [])].sort((a, b) => b.bandwidth - a.bandwidth)[0] || null;
  return {
    qualities,
    audio,
    locked,
    login: !!nav?.data?.isLogin,
    vip: !!nav?.data?.vipStatus,
    duration: Number(data.dash.duration) || Number(data.timelength) / 1000 || 0,
  };
};

/** 一条流可以从哪些地址下载：主地址 + 备用；PCDN（mcdn）放最后，那种节点时快时断 */
const streamUrls = (stream) =>
  [stream.baseUrl || stream.base_url, ...(stream.backupUrl || stream.backup_url || [])]
    .filter(Boolean)
    .map(secureUrl)
    .sort((a, b) => /mcdn|szbdyd/.test(a) - /mcdn|szbdyd/.test(b));

/**
 * 分段下载一条流，返回整份内容的 ArrayBuffer。
 * 文件多大事先不知道（跨域时拿不到 Content-Range）：一段一段往后要，回来的比要的短、或者 416 就是到底了。
 */
const downloadStream = async (urls, onBytes, signal) => {
  const pieces = [];
  let end = Infinity;
  let next = 0;
  let total = 0;
  const fetchPiece = async (index) => {
    const from = index * DL_CHUNK;
    for (let attempt = 0; attempt < urls.length * 2; attempt++) {
      if (signal.aborted) throw new DOMException('aborted', 'AbortError');
      const url = urls[attempt % urls.length];
      try {
        const response = await fetch(url, { headers: { Range: `bytes=${from}-${from + DL_CHUNK - 1}` }, signal });
        if (response.status === 416) return null;
        if (response.status !== 206 && response.status !== 200) throw new Error(`HTTP ${response.status}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        // 不认 Range、整份回传的服务器：直接当成全部
        if (response.status === 200) return { whole: bytes };
        return bytes;
      } catch (error) {
        if (error?.name === 'AbortError') throw error;
        await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
      }
    }
    throw new Error(t('下載中斷，請稍後再試'));
  };
  const worker = async () => {
    while (next < end) {
      const index = next++;
      const bytes = await fetchPiece(index);
      if (bytes?.whole) {
        pieces.length = 0;
        pieces[0] = bytes.whole;
        end = 0;
        onBytes(bytes.whole.length - total);
        total = bytes.whole.length;
        return;
      }
      if (!bytes || bytes.length < DL_CHUNK) end = Math.min(end, index + 1);
      if (bytes?.length) {
        pieces[index] = bytes;
        total += bytes.length;
        onBytes(bytes.length);
      }
    }
  };
  await Promise.all(Array.from({ length: DL_PARALLEL }, worker));
  const used = pieces.filter(Boolean);
  const out = new Uint8Array(used.reduce((sum, piece) => sum + piece.length, 0));
  let at = 0;
  for (const piece of used) out.set(piece, at), (at += piece.length);
  return out.buffer;
};

const formatBytes = (bytes) =>
  bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${Math.max(0.1, bytes / 1024 ** 2).toFixed(1)} MB`;

const DL_ICON = '<path d="M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';

function setupDownload() {
  if (!PAGE.video || !DOWNLOAD_BUILT) return;
  let popover = null;
  let job = null; // 正在进行的下载：{ abort, render }

  const close = () => {
    if (job) return; // 下载中不收起：进度要看得到
    popover?.remove();
    popover = null;
  };
  let anchor = null;
  /** 贴在按钮下方；下面放不下就放上方 */
  const place = (button = anchor) => {
    if (!popover || !button) return;
    anchor = button;
    const rect = button.getBoundingClientRect();
    const width = popover.offsetWidth || 320;
    const height = popover.offsetHeight || 200;
    popover.style.left = `${Math.max(12, Math.min(innerWidth - width - 12, rect.right - width))}px`;
    const below = rect.bottom + 8;
    popover.style.top = `${below + height > innerHeight - 12 && rect.top - height - 8 > 12 ? rect.top - height - 8 : below}px`;
  };

  const row = (title, detail, onclick, disabled = false) =>
    h(
      'button',
      { class: 'bga-dl-row', type: 'button', disabled, onclick },
      h('span', { class: 'bga-dl-name' }, title),
      h('span', { class: 'bga-dl-detail' }, detail),
    );

  const start = async (video, info, choice) => {
    const audioOnly = choice === 'audio';
    const streams = audioOnly ? [info.audio] : [choice.stream, info.audio].filter(Boolean);
    const estimate = streams.reduce((sum, stream) => sum + ((stream.bandwidth || 0) * info.duration) / 8, 0);
    const controller = new AbortController();
    let received = 0;
    let phase = t('下載中');
    const bar = h('div', { class: 'bga-dl-bar' }, h('i'));
    const status = h('div', { class: 'bga-dl-status' });
    const render = () => {
      const ratio = estimate ? Math.min(0.99, received / estimate) : 0;
      bar.firstChild.style.width = `${(ratio * 100).toFixed(1)}%`;
      status.textContent = `${phase} · ${formatBytes(received)}${estimate ? ` / ≈${formatBytes(estimate)}` : ''}`;
    };
    job = { abort: () => controller.abort() };
    popover.replaceChildren(
      h('div', { class: 'bga-dl-head' }, audioOnly ? t('下載音訊') : t`下載 ${choice.name}`),
      bar,
      status,
      h('button', { class: 'bga-dl-cancel', type: 'button', onclick: () => controller.abort() }, t('取消')),
    );
    place();
    render();
    try {
      const buffers = await Promise.all(
        streams.map((stream) =>
          downloadStream(
            streamUrls(stream),
            (bytes) => {
              received += bytes;
              render();
            },
            controller.signal,
          ),
        ),
      );
      phase = t('合成中');
      render();
      // 让「合成中」先画出来再开始算
      await new Promise((resolve) => setTimeout(resolve, 30));
      const tracks = buffers.map((buffer) => MP4.readTrack(buffer));
      const blob = new Blob(MP4.build(tracks), { type: audioOnly ? 'audio/mp4' : 'video/mp4' });
      const name = [video.title, video.part ? `P${video.part} ${video.partTitle}` : '', `[${video.bvid}]`, audioOnly ? '' : choice.name]
        .filter(Boolean)
        .join(' ');
      saveBlob(blob, name, audioOnly ? 'm4a' : 'mp4');
      toast(t`已交給瀏覽器下載：${formatBytes(blob.size)}`, 'ok', 4000);
    } catch (error) {
      if (error?.name === 'AbortError') toast(t('已取消下載'), 'info');
      else {
        warn('下载失败', error);
        toast(t`下載失敗：${error?.message || error}`, 'warn', 5000);
      }
    } finally {
      job = null;
      close();
    }
  };

  const open = async (button) => {
    if (popover) return job ? null : close();
    popover = h('div', { class: 'bga-dl bga-ui', dataset: { accent: store.get('x.ui.accent', 'pink') } }, h('div', { class: 'bga-dl-head' }, t('讀取清晰度…')));
    document.body.appendChild(popover);
    place(button);
    try {
      const video = await currentVideo();
      const info = await fetchStreams(video);
      if (!popover) return;
      const size = (stream) => (info.duration ? `≈${formatBytes((((stream?.bandwidth || 0) + (info.audio?.bandwidth || 0)) * info.duration) / 8)}` : '');
      const notes = [];
      if (info.locked.length) {
        notes.push(info.login ? t`${info.locked.join('、')} 需要大會員` : t`登入後可下載更高畫質（${info.locked.join('、')}）`);
      }
      if (info.duration > 3600) notes.push(t('影片很長：檔案會很大，瀏覽器需要足夠的記憶體'));
      popover.replaceChildren(
        h('div', { class: 'bga-dl-head' }, t('下載')),
        ...info.qualities.map((choice) => row(choice.name, `${choice.codec} · ${size(choice.stream)}`, () => start(video, info, choice))),
        info.audio && row(t('只要音訊'), `M4A · ${info.duration ? `≈${formatBytes((info.audio.bandwidth * info.duration) / 8)}` : ''}`, () => start(video, info, 'audio')),
        ...notes.map((note) => h('div', { class: 'bga-dl-note' }, note)),
      );
      place(button);
    } catch (error) {
      popover?.replaceChildren(h('div', { class: 'bga-dl-note' }, t`讀取失敗：${error?.message || error}`));
    }
  };

  // 点别处收起
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (popover && !event.composedPath().some((node) => node === popover || node?.classList?.contains?.('bga-dl-btn'))) close();
    },
    true,
  );
  // 卷动时跟着按钮走
  addEventListener('scroll', () => place(), { passive: true });
  addEventListener('resize', () => place());

  // 工具列是 B站的 Vue 画的（服务端先出 HTML，浏览器里再「水合」接管）。水合完成前往里插东西，
  // Vue 对不上就放弃接管，后面的懒加载图片、评论区全都出不来——所以等它挂载完才插。
  // 挂载完的记号：评论区（水合之后才建）出来了；最多等 15 秒。
  const started = Date.now();
  const hydrated = () => !!document.querySelector('bili-comments, #commentapp .bili-comment') || Date.now() - started > 15000;
  // 换一 P、换影片都可能重画工具列：定时看一眼按钮还在不在
  const sync = () => {
    if (document.hidden || !hydrated()) return;
    const bar = document.querySelector('.video-toolbar-right');
    const mine = document.querySelector('.bga-dl-btn');
    if (!val('x.dl')) return mine?.remove();
    if (!bar || (mine && mine.parentElement === bar)) return;
    mine?.remove();
    const button = h(
      'div',
      { class: 'video-toolbar-right-item bga-dl-btn', role: 'button', tabindex: '0', title: t('下載這部影片') },
      svgIcon(DL_ICON),
      h('span', {}, t('下載')),
    );
    button.addEventListener('click', () => open(button));
    button.addEventListener('keydown', (event) => event.key === 'Enter' && open(button));
    bar.prepend(button);
  };
  watch('x.dl', sync);
  setInterval(sync, 2000);
}
