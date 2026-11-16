// ════════════════════════════ 字体 ════════════════════════════

defOpt('x.font', true, {
  tab: 'general',
  group: t('字體'),
  label: t('使用系統字體'),
  hint: t('Mac 上用蘋方 / San Francisco，Windows 上用微軟雅黑，並開啟字體平滑'),
});
defOpt('x.tabularNums', true, {
  tab: 'general',
  group: t('字體'),
  label: t('等寬數字'),
  hint: t('播放時間、播放量等數字等寬顯示，跳動時不抖動'),
});

/** B站加载鸿蒙字体用的样式表 */
const isHarmonyFontSheet = (node) => node.localName === 'link' && /\/jinkela\/long\/font\//.test(node.href || '');

function setupTypography() {
  reflect('x.font', 'font');
  reflect('x.tabularNums', 'tabular');
  const setFontFaces = toggleStyle(STYLES.fontface, 'fontface');
  watch('x.font', (on) => setFontFaces(!!on));
  if (!val('x.font')) return;

  // 鸿蒙字体的样式表一出现就移除，免得白下载
  const removeSheets = (nodes) => {
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE && isHarmonyFontSheet(node)) node.remove();
    }
  };
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) removeSheets(mutation.addedNodes);
  });
  onRoot((root) => observer.observe(root, { childList: true, subtree: true }));
  ready().then(() => {
    removeSheets(document.querySelectorAll('link[href*="/jinkela/long/font/"]'));
    setTimeout(() => observer.disconnect(), 10000);
  });
}
