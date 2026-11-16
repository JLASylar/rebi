// ════════════════════════════ 宽屏 ════════════════════════════
// 内容区拉宽，两侧按「左右邊距」留白。样式在 src/css/base.css 和 pages.css；
// 播放页的做法不一样（播放器铺满视窗宽度），见 22-stage.js。
//
// 选项的键名是中文的：早期版本的设置存在这些键下面，不能改。

TABS.push(['general', t('通用')], ['home', t('首頁')], ['video', t('播放頁')], ['feed', t('動態 · 空間')]);

defOpt('左右边距', 30, {
  tab: 'general',
  group: t('版面'),
  label: t('左右邊距'),
  hint: t('所有頁面內容區兩側的留白，不會超過視窗寬度的 15%'),
  unit: 'px',
});
defOpt('粘性侧栏', false, {
  tab: 'feed',
  group: t('動態頁'),
  label: t('側欄吸頂'),
  hint: t('側欄內容較長時可能顯示不全'),
});
defOpt('x.hideGoods', true, { tab: 'feed', group: t('動態頁'), label: t('隱藏帶貨動態') });

function setupDynamicPage() {
  flag('page-dynamic', true);
  reflect('粘性侧栏', 'aside-sticky');
  // 右栏并到左栏下面，把宽度让给动态
  waitFor(() => document.querySelector('[class^="bili-dyn-home"] > aside.right'), '动态页右栏')
    .then((right) => right.parentElement.querySelector(':scope > aside.left')?.append(right))
    .catch(() => {});
}

function setupWide() {
  watch('左右边距', (px) => setRootVar('--bga-gutter-size', `${px}px`));
  if (PAGE.t || PAGE.space) reflect('x.hideGoods', 'no-goods');

  if (PAGE.home) flag('page-home', true);
  else if (PAGE.opus) flag('page-opus', true);
  else if (PAGE.read) return;
  else if (PAGE.www) setupStage().catch((error) => warn('播放页舞台', error));
  else if (PAGE.t) setupDynamicPage();
  else if (PAGE.space) flag('page-space', true);
  else if (PAGE.search) flag('page-search', true);
  else if (PAGE.message) flag('page-message', true);
}
