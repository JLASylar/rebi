// ════════════════════════════ 设置面板 ════════════════════════════
// 面板的内容不是手写的：各模块用 defOpt / ACTIONS / defKey 登记，这里按登记表生成。
// 样式在 src/css/panel.css 和 ui.css；备注、弹幕查询、快捷键三页的内容在 82～86 号文件。

defOpt('x.ui.theme', 'auto', {
  tab: 'general',
  group: t('設定面板'),
  type: 'select',
  label: t('外觀'),
  choices: [
    ['auto', t('跟隨系統')],
    ['light', t('淺色')],
    ['dark', t('深色')],
  ],
});
defOpt('x.lang', 'auto', {
  tab: 'general',
  group: t('設定面板'),
  type: 'select',
  label: t('語言'),
  hint: t('「自動」會跟隨瀏覽器的語言'),
  choices: [['auto', t('自動')], ...LANGUAGES],
  reload: true,
});
defOpt('x.ui.accent', 'pink', {
  tab: 'general',
  group: t('設定面板'),
  type: 'select',
  label: t('強調色'),
  choices: [
    ['pink', t('B站粉')],
    ['blue', t('B站藍')],
    ['graphite', t('石墨')],
  ],
});

TABS.push(['keys', t('快捷鍵')]);

/** 分页图标（16×16 的线条图，脚本自己画的简单几何形） */
const TAB_ICONS = {
  general:
    '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1"/>',
  home: '<path d="M2.5 7.4L8 2.6l5.5 4.8V13a.6.6 0 01-.6.6H9.8V9.9H6.2v3.7H3.1a.6.6 0 01-.6-.6z"/>',
  video: '<rect x="1.6" y="3" width="12.8" height="9" rx="2"/><path d="M6.8 5.8v3.4l3-1.7z"/>',
  feed: '<rect x="2" y="2" width="5" height="5" rx="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2"/><rect x="2" y="9" width="5" height="5" rx="1.2"/><rect x="9" y="9" width="5" height="5" rx="1.2"/>',
  clean: '<path d="M8 1.6l5 2v4c0 3.2-2.1 5.6-5 6.8-2.9-1.2-5-3.6-5-6.8v-4z"/><path d="M5.8 8l1.6 1.6 2.9-3"/>',
  live: '<circle cx="8" cy="8" r="1.6"/><path d="M4.9 4.9a4.4 4.4 0 000 6.2M11.1 4.9a4.4 4.4 0 010 6.2M2.8 2.8a7.3 7.3 0 000 10.4M13.2 2.8a7.3 7.3 0 010 10.4"/>',
  comments:
    '<path d="M2 3.6a1.6 1.6 0 011.6-1.6h8.8A1.6 1.6 0 0114 3.6v6a1.6 1.6 0 01-1.6 1.6H7.2L4 14v-2.8h-.4A1.6 1.6 0 012 9.6z"/>',
  memo: '<path d="M10.6 2.2l3.2 3.2-7.6 7.6-3.6.4.4-3.6z"/><path d="M9 3.8l3.2 3.2"/>',
  danmaku: '<circle cx="7" cy="7" r="4.4"/><path d="M10.3 10.3L14 14"/>',
  keys: '<rect x="1.6" y="3.6" width="12.8" height="8.8" rx="2"/><path d="M4.4 6.6h.01M7 6.6h.01M9.6 6.6h.01M11.8 6.6h.01M4.4 9.4h7.2"/>',
};

/** 面板元素；第一次打开时才建 */
let panel = null;
/** 开关面板的函数；面板装好之后才有（快捷键据此判断能不能用） */
let panelToggle = null;

/** 改了要重新整理才生效的东西之后调用：标题栏出现「重新整理以套用」 */
const markPanelDirty = () => panel?.setAttribute('data-dirty', '');

/** 取分页里某个分组的卡片，没有就建一个 */
const groupCard = (page, name) => {
  let group = page.querySelector(`.bga-group[data-name="${CSS.escape(name)}"]`);
  if (!group) {
    group = page.appendChild(
      h('section', { class: 'bga-group', dataset: { name } }, h('h3', {}, name), h('div', { class: 'bga-card' })),
    );
  }
  return group.lastElementChild;
};

/** 一行：左边标题和说明，右边控件 */
const panelRow = ({ label, hint, tag, control, block = false }) =>
  h(
    'div',
    { class: `bga-row${block ? ' bga-col' : ''}` },
    h(
      'div',
      { class: 'bga-text' },
      h('div', { class: 'bga-label' }, label, tag || null),
      hint ? h('div', { class: 'bga-hint' }, hint) : null,
    ),
    control,
  );

// ── 选项控件：每种类型一个，返回 { el, reset, block? } ──
const switchControl = (option, commit) => {
  const input = h('input', { type: 'checkbox', class: 'bga-switch', role: 'switch', 'aria-label': option.label });
  input.checked = !!val(option.key);
  input.addEventListener('change', () => commit(input.checked));
  store.on(option.key, (value) => {
    input.checked = !!(value === undefined ? option.def : value);
  });
  return {
    el: input,
    reset() {
      input.checked = option.def;
      commit(option.def);
    },
  };
};

const numberControl = (option, commit) => {
  const input = h('input', { type: 'number', min: '0', inputmode: 'numeric', 'aria-label': option.label });
  input.value = String(val(option.key));
  const setValue = (number) => {
    const value = Math.max(0, Math.round(number));
    input.value = String(value);
    commit(value);
  };
  const step = option.step || (option.def >= 50 ? 8 : 2);
  const nudge = (direction) => setValue((Number(input.value) || 0) + direction * step);

  input.addEventListener('input', () => {
    if (input.value !== '' && Number.isFinite(Number(input.value)))
      commit(Math.max(0, Math.round(Number(input.value))));
  });
  input.addEventListener('blur', () => {
    if (input.value === '') setValue(option.def);
  });
  store.on(option.key, (value) => {
    if (document.activeElement !== input) input.value = String(value === undefined ? option.def : value);
  });
  const el = h(
    'span',
    { class: 'bga-num' },
    h('button', { type: 'button', 'aria-label': t('減少'), onclick: () => nudge(-1) }, '−'),
    input,
    option.unit ? h('i', {}, option.unit) : null,
    h('button', { type: 'button', 'aria-label': t('增加'), onclick: () => nudge(1) }, '+'),
  );
  return { el, reset: () => setValue(option.def) };
};

/**
 * 选项少、字也短：一排分段按钮，一眼看全；多了（超过 4 个，或者字加起来太长）：下拉菜单，
 * 不然分段按钮会把左边的说明文字挤成一字一行（2026-11-24 「右下角放什麼」7 个选项就这样）。
 */
const SEGMENT_MAX = 4;
const SEGMENT_MAX_CHARS = 16;
const selectControl = (option, commit) => {
  const chars = option.choices.reduce((sum, [, text]) => sum + String(text).length, 0);
  if (option.choices.length > SEGMENT_MAX || chars > SEGMENT_MAX_CHARS) return dropdownControl(option, commit);
  const buttons = option.choices.map(([value, text]) => h('button', { type: 'button', dataset: { value } }, text));
  const paint = (current) => {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.value === String(current)));
  };
  const choose = (value) => {
    commit(value);
    paint(value);
  };
  option.choices.forEach(([value], index) => buttons[index].addEventListener('click', () => choose(value)));
  paint(val(option.key));
  store.on(option.key, (value) => paint(value === undefined ? option.def : value));
  return {
    el: h('span', { class: 'bga-seg', role: 'group', 'aria-label': option.label }, buttons),
    reset: () => choose(option.def),
  };
};

const dropdownControl = (option, commit) => {
  const select = h(
    'select',
    { class: 'bga-select', 'aria-label': option.label },
    option.choices.map(([value, text]) => h('option', { value }, text)),
  );
  const paint = (current) => (select.value = String(current));
  select.addEventListener('change', () => commit(select.value));
  paint(val(option.key));
  store.on(option.key, (value) => paint(value === undefined ? option.def : value));
  return {
    el: select,
    reset: () => {
      commit(option.def);
      paint(option.def);
    },
  };
};

const textControl = (option, commit) => {
  const textarea = h('textarea', { spellcheck: 'false', 'aria-label': option.label });
  textarea.value = String(val(option.key) ?? '');
  if (option.placeholder) textarea.placeholder = option.placeholder;
  textarea.addEventListener('change', () => commit(textarea.value.trim() || option.def));
  store.on(option.key, (value) => {
    if (document.activeElement !== textarea) textarea.value = String(value === undefined ? option.def : value);
  });
  return {
    el: textarea,
    block: true,
    reset() {
      textarea.value = option.def;
      commit(option.def);
    },
  };
};

const OPTION_CONTROLS = { bool: switchControl, num: numberControl, select: selectControl, text: textControl };

/** 一个选项的那一行。右键 = 还原预设 */
const optionRow = (option) => {
  // 和预设值一样就不存，存储里只留改过的
  const commit = (value) => {
    if (value === option.def) store.del(option.key);
    else store.set(option.key, value);
    if (option.reload) markPanelDirty();
  };
  const control = OPTION_CONTROLS[option.type](option, commit);
  const reloadTag = option.reload
    ? h('span', { class: 'bga-tag', title: t('重新整理頁面後生效'), 'aria-label': t('重新整理頁面後生效') }, '↻')
    : null;
  const row = panelRow({
    label: option.label,
    hint: option.hint,
    tag: reloadTag,
    control: control.el,
    block: control.block,
  });
  row.addEventListener('contextmenu', (event) => {
    if (event.target.closest('input[type=number], textarea')) return; // 输入框里右键是要粘贴
    event.preventDefault();
    control.reset();
    toast(t`「${option.label}」已還原預設`);
  });
  return row;
};

/** 一个操作按钮的那一行。说明和按钮文字可以是函数（每次操作后重新取） */
const actionRow = (action) => {
  const textOf = (value) => (typeof value === 'function' ? value() : value) || '';
  const hint = h('div', { class: 'bga-hint' });
  const button = h('button', { type: 'button', class: 'bga-btn' });
  const paint = () => {
    button.textContent = textOf(action.button) || t('執行');
    hint.textContent = textOf(action.hint);
    hint.hidden = !hint.textContent;
  };
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await action.run();
    } finally {
      button.disabled = false;
      paint();
    }
  });
  paint();
  return h(
    'div',
    { class: 'bga-row' },
    h('div', { class: 'bga-text' }, h('div', { class: 'bga-label' }, action.label), hint),
    button,
  );
};

/** 「通用」页最下面：版本、作者、致谢 */
const aboutCard = () => {
  const link = (href, text) => h('a', { href, target: '_blank', rel: 'noopener' }, text);
  return h(
    'div',
    { class: 'bga-about' },
    h('div', {}, `${PRODUCT} ${VERSION} · `, link(BUILD.homepage, `@${BUILD.author}`)),
    h(
      'div',
      {},
      t('寬屏版面的構想來自 posthumz 的 '),
      link('https://github.com/posthumz/wider-bilibili', 'Wider Bilibili'),
      t('，在此致謝。'),
    ),
  );
};

function buildPanel() {
  if (panel) return panel;
  addStyle(STYLES.panel, 'panel');

  // ── 分页 ──
  const pages = {};
  const tabButtons = [];
  const title = h('h2', {}, '');
  const body = h('div', { class: 'bga-body' });
  const tabTitle = (id) => TABS.find(([tabId]) => tabId === id)?.[1] || '';
  const selectedTab = () =>
    tabButtons.find((button) => button.getAttribute('aria-selected') === 'true')?.dataset.tab || TABS[0][0];

  const selectTab = (id) => {
    if (search.value) {
      search.value = '';
      applySearch();
    }
    for (const button of tabButtons) button.setAttribute('aria-selected', String(button.dataset.tab === id));
    for (const [pageId, page] of Object.entries(pages)) page.toggleAttribute('data-active', pageId === id);
    title.textContent = tabTitle(id);
    body.scrollTop = 0;
    try {
      sessionStorage.setItem('bga-tab', id); // 这个分页里下次打开还停在这一页
    } catch {
      // 存不了就每次从第一页开始
    }
  };

  for (const [id, name] of TABS) {
    pages[id] = body.appendChild(h('div', { class: 'bga-page', role: 'tabpanel' }));
    const button = h('button', {
      type: 'button',
      class: 'bga-tab',
      role: 'tab',
      dataset: { tab: id },
      onclick: () => selectTab(id),
    });
    button.append(svgIcon(TAB_ICONS[id] || ''), name);
    tabButtons.push(button);
  }

  // ── 内容：选项、操作按钮、三个专门的页 ──
  for (const option of Object.values(OPTS)) {
    if (pages[option.tab]) groupCard(pages[option.tab], option.group || '').appendChild(optionRow(option));
  }
  for (const action of ACTIONS) {
    if (pages[action.tab]) groupCard(pages[action.tab], action.group || '').appendChild(actionRow(action));
  }
  safe(() => renderMemoPage(pages.memo), '备注页');
  safe(() => renderDanmakuPage(pages.danmaku), '弹幕查询页');
  safe(() => renderKeysPage(pages.keys), '快捷键页');
  groupCard(pages.general, t('關於')).appendChild(aboutCard());

  // ── 搜索：输入后所有分页一起显示，只留命中的行 ──
  const search = h('input', {
    class: 'bga-input bga-search',
    type: 'search',
    placeholder: t('搜尋設定'),
    'aria-label': t('搜尋設定'),
  });
  const noResults = body.appendChild(
    h('div', { class: 'bga-empty bga-search-empty', hidden: true }, t('沒有符合的設定')),
  );
  const applySearch = () => {
    const query = search.value.trim().toLowerCase();
    if (!query) {
      panel.removeAttribute('data-q');
      for (const el of body.querySelectorAll('[data-miss]')) el.removeAttribute('data-miss');
      title.textContent = tabTitle(selectedTab());
      return;
    }
    panel.setAttribute('data-q', '');
    title.textContent = t('搜尋結果');
    let hits = 0;
    for (const group of body.querySelectorAll('.bga-group')) {
      const groupMatches = group.dataset.name.toLowerCase().includes(query);
      let anyRow = false;
      for (const row of group.querySelectorAll('.bga-row')) {
        const text = row.querySelector('.bga-text')?.textContent.toLowerCase() || '';
        const matches = !!text && (groupMatches || text.includes(query));
        row.toggleAttribute('data-miss', !matches);
        if (matches) {
          anyRow = true;
          hits += 1;
        }
      }
      group.toggleAttribute('data-miss', !anyRow);
    }
    noResults.hidden = hits > 0;
    body.scrollTop = 0;
  };
  search.addEventListener('input', applySearch);

  // ── 外框 ──
  const panelKey = h('kbd', {}, '');
  const paintPanelKey = () => {
    panelKey.textContent = comboText(keyOf(HOTKEYS.find((hotkey) => hotkey.id === 'panel'))) || t('未設定');
  };
  paintPanelKey();
  store.on('x.keys', paintPanelKey);

  const closeButton = h('button', {
    type: 'button',
    class: 'bga-close',
    'aria-label': t('關閉'),
    onclick: () => panel.hidePopover(),
  });
  closeButton.append(svgIcon('<path d="M2 2l8 8M10 2l-8 8"/>', 12));

  panel = h(
    'div',
    { id: 'bga-panel', class: 'bga-ui', popover: 'auto', role: 'dialog', 'aria-label': t`${PRODUCT} 設定` },
    h(
      'nav',
      { class: 'bga-side', role: 'tablist' },
      h(
        'div',
        { class: 'bga-brand' },
        h('b', {}, PRODUCT),
        h(
          'span',
          {},
          h('a', { href: BUILD.homepage, target: '_blank', rel: 'noopener' }, `@${BUILD.author}`),
          ` ${VERSION}`,
        ),
      ),
      search,
      tabButtons,
      h('div', { class: 'bga-side-foot' }, panelKey, t(' 開關面板'), h('br'), t('右鍵任一項還原預設')),
    ),
    h(
      'div',
      { class: 'bga-main' },
      h(
        'div',
        { class: 'bga-head' },
        title,
        h('button', { type: 'button', class: 'bga-reload', onclick: () => location.reload() }, t('重新整理以套用')),
        closeButton,
      ),
      body,
    ),
  );

  watch('x.ui.theme', (theme) => panel.setAttribute('data-theme', theme));
  watch('x.ui.accent', (accent) => {
    panel.setAttribute('data-accent', accent);
    document.querySelector('.bga-toasts')?.setAttribute('data-accent', accent);
  });
  document.body.appendChild(panel);

  let initialTab = TABS[0][0];
  try {
    initialTab = sessionStorage.getItem('bga-tab') || initialTab;
  } catch {
    // 读不了就从第一页开始
  }
  selectTab(pages[initialTab] ? initialTab : TABS[0][0]);
  return panel;
}

function setupPanel() {
  /**
   * 面板挂在哪：平时是 <body>；全屏时页面上的弹层点不到（点击会落到全屏元素上），要挂进全屏元素里。
   */
  const host = () => {
    const fullscreen = fullscreenElement();
    return fullscreen && fullscreen.tagName !== 'VIDEO' ? fullscreen : document.body;
  };

  let shielded = false;
  const show = () => {
    const el = buildPanel();
    if (!shielded) {
      shielded = true;
      // 面板在播放器里面时，别让点击和按键冒泡到播放器（否则会触发播放 / 暂停和它的快捷键）
      const SHIELDED_EVENTS = [
        'click',
        'dblclick',
        'mousedown',
        'mouseup',
        'pointerdown',
        'pointerup',
        'contextmenu',
        'wheel',
        'keydown',
        'keyup',
        'keypress',
      ];
      for (const type of SHIELDED_EVENTS) el.addEventListener(type, (event) => event.stopPropagation());
    }
    const target = host();
    if (el.parentElement !== target) target.appendChild(el);
    el.showPopover();
  };
  const toggle = () => {
    if (buildPanel().matches(':popover-open')) panel.hidePopover();
    else show();
  };

  // 进出全屏：把面板搬到新的宿主里；原来开着的话接着开着
  for (const type of ['fullscreenchange', 'webkitfullscreenchange']) {
    document.addEventListener(type, () => {
      const target = host();
      if (!panel || panel.parentElement === target) return;
      const wasOpen = panel.matches(':popover-open');
      target.appendChild(panel);
      if (!wasOpen) return;
      try {
        panel.showPopover();
      } catch {
        // 搬动时已经被浏览器关掉：下次按快捷键再开
      }
    });
  }

  try {
    platform.addMenu(t('設定'), show);
  } catch {
    // 平台没有菜单：用快捷键开
  }
  panelToggle = toggle;
  // 留一个入口给测试脚本和控制台用
  W.__bga = { open: show, version: VERSION };
}
