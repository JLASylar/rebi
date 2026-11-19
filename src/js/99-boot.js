// ════════════════════════════ 启动 ════════════════════════════
// 钩子类（网络、组件、全局变量）必须在 document-start 同步装好；界面类等 DOM 就绪。

// 样式表全是静态规则，靠 <html> 上的记号生效，先后顺序无关紧要。
// 面板的样式到第一次打开面板时才加；评论区标记的样式由评论模块加（还要注入各个 shadow root）。
function boot() {
  const BOOT_STYLES = ['base', 'stage', 'nav', 'pod', 'pages', 'typography', 'clean', 'player', 'live', 'cards', 'home', 'ui'];
  for (const name of BOOT_STYLES) addStyle(STYLES[name], name);
  guardStyles();

  safe(setupNetwork, '网络');
  safe(setupTypography, '字体');
  safe(setupLiveTextGuard, '全屏点击');
  if (IS_TOP) safe(setupSearchRelayout, '搜索框重排');
  if (IS_TOP) safe(setupWide, '宽屏');
  if (IS_TOP) safe(setupNavCard, '卡片式导航栏');
  safe(setupClean, '净化');
  safe(setupComments, '评论区');
  safe(setupMemo, '备注');
  safe(setupCommentFilter, '评论过滤');
  safe(setupLive, '直播');
  safe(setupTitles, '标题屏蔽词');
  safe(setupDynFilter, '动态过滤');
  safe(setupPlayback, '播放器');
  bodyReady().then(() => safe(setupFeed, '首页过滤'));
  bodyReady().then(() => safe(setupHome, '首页主题'));
  bodyReady().then(() => safe(setupCards, '影片卡片'));
  safe(setupHotkeys, '快捷键');
  if (IS_TOP) bodyReady().then(() => safe(setupPanel, '设置面板'));
  log(`${VERSION} 已加载`, IS_TOP ? '' : '(iframe)');

  // 扩展版：这个网域的设置镜像是旧的（之前在别的网域改过设置），启动时用的是旧值。
  // 大多数选项收到真正的设置后已经当场改过来了；只有要重新整理才生效的那些需要提醒一下。
  platform.ready.then(() => {
    if (!IS_TOP || !platform.staleKeys?.some((key) => OPTS[key]?.reload)) return;
    bodyReady().then(() => toast(t('設定已同步，重新整理後完全生效'), 'info', 5000));
  });
}

// 油猴版和扩展版同时装着时，同一个页面只让先到的那一份运行，免得每件事都做两遍。
// 记号挂在页面自己的 window 上，两边都看得到。
if (W.__bgaRunning) {
  warn(`${W.__bgaRunning} 已经在这个页面运行，这一份（${BUILD.target}）不再启动`);
} else {
  W.__bgaRunning = BUILD.target;
  boot();
}
