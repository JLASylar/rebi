// ════════════════════════════ 标题屏蔽词（治标题党） ════════════════════════════
// 两种用法：把夸张的词从标题里删掉（影片照常显示）；标题里有某些词就把整张卡片藏起来。
// 只改页面上显示出来的文字，不碰 B站的数据（__INITIAL_STATE__ 等）。

const WORD_LIST_HINT = t('每行一個詞；也可以寫 /正則/。B站標題多為簡體字，請用簡體輸入');

defOpt('x.title.strip', '', {
  tab: 'clean',
  group: t('標題黨'),
  type: 'text',
  keep: true,
  label: t('從標題刪掉這些詞'),
  hint: t`影片照常顯示，只把這些詞從標題裡拿掉。${WORD_LIST_HINT}`,
  placeholder: '震惊\n全网首发\n/一口气看完.*/',
});
defOpt('x.title.hide', '', {
  tab: 'clean',
  group: t('標題黨'),
  type: 'text',
  keep: true,
  label: t('標題含有這些詞就隱藏影片'),
  hint: t`首頁、推薦、搜尋、排行榜、動態裡整張卡片不顯示；正在看的影片不受影響。${WORD_LIST_HINT}`,
  placeholder: t('盘点\n/第[一二三四五六七八九十]+期/'),
});
defOpt('x.title.calm', false, {
  tab: 'clean',
  group: t('標題黨'),
  label: t('收斂誇張標點'),
  hint: t('連續的驚嘆號、問號縮成一個（！！！→！）'),
});

/** 多行文本 → 去掉空行和首尾空白的行列表 */
const linesOf = (text) =>
  String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const TITLE_PRESET = [
  '震惊',
  '炸裂',
  '封神',
  '杀疯了',
  '绝了',
  '逆天',
  '王炸',
  '泪目',
  '破防了',
  '看哭了',
  '惊呆了',
  '全程高能',
  '高能预警',
  '前方高能',
  '全网首发',
  '全网最全',
  '建议收藏',
  '一定要看',
  '万万没想到',
  '细思极恐',
  '太离谱了',
  '/史上最[^，。！？\\s]{1,6}/',
];

ACTIONS.push({
  tab: 'clean',
  group: t('標題黨'),
  label: t('加入常見的標題黨用詞'),
  hint: t('把一組常見的誇張用詞加進「從標題刪掉這些詞」，之後可以自己增刪'),
  button: t('加入'),
  run() {
    const current = linesOf(val('x.title.strip'));
    const missing = TITLE_PRESET.filter((word) => !current.includes(word));
    if (!missing.length) return void toast(t('這些詞都已經在清單裡了'));
    store.set('x.title.strip', [...current, ...missing].join('\n'));
    toast(t`已加入 ${missing.length} 個詞`, 'ok');
  },
});

/**
 * 词表 → 正则数组（都带 g 标志）。
 * 普通的词按字面匹配、不分大小写；写成 /…/ 的当正则用，可以带标志（/abc/i）。写错的正则跳过。
 */
const parseWordList = (text) =>
  linesOf(text)
    .map((line) => {
      const regex = line.match(/^\/(.+)\/([a-z]*)$/);
      try {
        if (regex) {
          const flags = new Set(`${regex[2].replace(/[gy]/g, '')}g`);
          return new RegExp(regex[1], [...flags].join(''));
        }
        return new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      } catch {
        return null;
      }
    })
    .filter(Boolean);

/** 文本是否命中词表里的任何一个 */
const matchesAny = (patterns, text) =>
  patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });

function setupTitles() {
  if (!IS_TOP || !(PAGE.www || PAGE.search || PAGE.t || PAGE.space)) return;

  /** 标题元素。里面可能还有子元素（搜索页的关键词高亮） */
  const TITLE_SELECTOR = [
    '.bili-video-card__info--tit',
    '.video-page-card-small .title',
    '.video-card .video-name',
    '.rank-item .info .title',
    '.bili-dyn-card-video__title',
    '.small-item .title',
    '.bpx-player-ending-related-item-title',
    '.video-page-operator-card-small .title',
    'h1.video-title',
  ].join(',');
  /** 整张隐藏时藏哪一层：按从外到内的顺序，取第一个找得到的 */
  const CARD_SELECTORS = [
    '.feed-card',
    '.bili-feed-card',
    '.video-list-item',
    '.bili-dyn-list__item',
    '.video-page-card-small',
    '.video-page-operator-card-small',
    '.video-card',
    '.rank-item',
    '.small-item',
    '.bpx-player-ending-related-item',
    '.bili-video-card',
  ];

  let stripPatterns = [];
  let hidePatterns = [];
  let calmPunctuation = false;

  /** 标题按当前设置改写后的样子；没什么可改就原样返回 */
  const rewrite = (title) => {
    let text = title;
    for (const pattern of stripPatterns) {
      pattern.lastIndex = 0;
      text = text.replace(pattern, '');
    }
    if (calmPunctuation) text = text.replace(/([!！])[!！]+/g, '$1').replace(/([?？])[?？]+/g, '$1');
    if (text === title) return title;
    // 删完以后收拾一下：空括号、连续的空白、开头剩下的标点
    text = text
      .replace(/【\s*】|\[\s*\]|（\s*）|\(\s*\)|「\s*」|《\s*》/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^[\s，,、。:：|｜\-—·]+/, '')
      .trimEnd();
    // 整个标题都被删光了：宁可不改
    return text.trim() ? text : title;
  };
  const rewriting = () => stripPatterns.length > 0 || calmPunctuation;

  /**
   * 改过的文本节点：节点 → { original 原文, shown 改后显示的文字 }。
   * B站重新渲染把文字换掉时（节点现在的文字 ≠ shown），就把新文字当原文重新算。
   */
  const rewritten = new WeakMap();
  const originalOf = (node) => {
    const record = rewritten.get(node);
    return record && record.shown === node.nodeValue ? record.original : node.nodeValue;
  };
  const textNodesIn = (el) => {
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  };

  const cardOf = (title) => {
    for (const selector of CARD_SELECTORS) {
      const card = title.closest(selector);
      if (!card) continue;
      // 搜索页等：卡片外面还包了一层只装它自己的格子，要藏的是那个格子
      const wrapper = card.parentElement;
      const isSoleChild = wrapper && wrapper !== document.body && wrapper.childElementCount === 1;
      return selector === '.bili-video-card' && isSoleChild ? wrapper : card;
    }
    return null;
  };

  const processTitle = (title) => {
    const nodes = textNodesIn(title);

    // 整张隐藏（正在看的影片的大标题不藏）
    const fullTitle = nodes.map(originalOf).join('');
    if (hidePatterns.length && !title.matches('h1') && fullTitle.trim()) {
      const card = cardOf(title);
      const shouldHide = matchesAny(hidePatterns, fullTitle);
      if (card && shouldHide !== card.hasAttribute('data-bga-title-hidden'))
        card.toggleAttribute('data-bga-title-hidden', shouldHide);
    }

    // 改写文字
    for (const node of nodes) {
      const original = originalOf(node);
      const shown = rewriting() ? rewrite(original) : original;
      if (shown !== node.nodeValue) node.nodeValue = shown;
      if (shown !== original) rewritten.set(node, { original, shown });
      else rewritten.delete(node);
    }

    // 悬停提示（title 属性）也跟着改；原文记在 data-bga-title 里
    if (title.hasAttribute('title')) {
      const current = title.getAttribute('title');
      const remembered = title.dataset.bgaTitle;
      const original = remembered && rewrite(remembered) === current ? remembered : current;
      const shown = rewriting() ? rewrite(original) : original;
      if (shown !== current) {
        title.dataset.bgaTitle = original;
        title.setAttribute('title', shown);
      }
    }
  };

  let scanQueued = false;
  const scan = () => {
    scanQueued = false;
    if (!document.body) return;
    for (const title of document.querySelectorAll(TITLE_SELECTOR)) safe(() => processTitle(title), '标题屏蔽词');
  };
  const queueScan = () => {
    if (scanQueued) return;
    scanQueued = true;
    setTimeout(scan, 400);
  };

  let observer = null;
  let wasActive = false;
  const applySettings = () => {
    stripPatterns = parseWordList(val('x.title.strip'));
    hidePatterns = parseWordList(val('x.title.hide'));
    calmPunctuation = !!val('x.title.calm');
    const active = rewriting() || hidePatterns.length > 0;

    if (!hidePatterns.length) {
      for (const card of document.querySelectorAll('[data-bga-title-hidden]'))
        card.removeAttribute('data-bga-title-hidden');
    }
    if (active && !observer) {
      observer = pageObserver(queueScan);
      bodyReady().then(() => observer?.observe(document.body, { childList: true, subtree: true, characterData: true }));
    }
    if (!active && observer) {
      observer.disconnect();
      observer = null;
    }
    // 设置变了：改过的标题按原文重算一遍（全关时就是恢复原样）
    if (active || wasActive) bodyReady().then(scan);
    wasActive = active;
  };

  for (const key of ['x.title.strip', 'x.title.hide', 'x.title.calm']) store.on(key, applySettings);
  applySettings();
}
