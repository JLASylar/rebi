// ════════════════════════════ 设置 ════════════════════════════

// ── 存储：本页的改动立即通知本页的监听者；别的分页的改动由平台层转过来 ──
const storeListeners = new Map();
const notifyStore = (key, value) => {
  for (const listener of storeListeners.get(key) || []) safe(() => listener(value), `监听 ${key}`);
};

const store = {
  get(key, fallback) {
    try {
      const value = platform.storage.get(key);
      return value === undefined ? fallback : value;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      platform.storage.set(key, value);
    } catch (error) {
      warn(error);
    }
    notifyStore(key, value);
  },
  del(key) {
    try {
      platform.storage.remove(key);
    } catch (error) {
      warn(error);
    }
    notifyStore(key, undefined);
  },
  /** 值变化时回调（被删除时收到 undefined） */
  on(key, listener) {
    if (!storeListeners.has(key)) {
      storeListeners.set(key, []);
      try {
        platform.storage.subscribe(key, (value) => notifyStore(key, value));
      } catch {
        // 平台不支持跨分页通知：只在本页生效
      }
    }
    storeListeners.get(key).push(listener);
  },
};

// ── 选项登记：设置面板由这张表自动生成 ──
/**
 * @typedef {object} OptionMeta
 * @property {string} tab                             所在分页
 * @property {string} [group]                         分组标题
 * @property {string} label
 * @property {string} [hint]
 * @property {'bool'|'num'|'select'|'text'} [type]    缺省按默认值推断：数字 → num，其余 → bool
 * @property {boolean} [reload]                       改动后要重新整理页面才生效
 * @property {boolean} [keep]                         「还原默认」时保留（屏蔽词这类自己攒的内容）
 * @property {string} [unit]
 * @property {number} [step]
 * @property {[string, string][]} [choices]           select 的 [值, 文字]
 * @property {string} [placeholder]
 */
const OPTS = {};
/** 面板分页：[id, 标题] */
const TABS = [];
/** 面板里的操作按钮：{ tab, group, label, hint, button, run } */
const ACTIONS = [];

/** @param {string} key @param {*} def @param {OptionMeta} meta */
const defOpt = (key, def, meta) => {
  OPTS[key] = { key, def, type: typeof def === 'number' ? 'num' : 'bool', ...meta };
};
const val = (key) => store.get(key, OPTS[key]?.def);
/** 立即以当前值调用一次，之后每次变化再调用 */
const watch = (key, onValue) => {
  onValue(val(key));
  store.on(key, (value) => onValue(value === undefined ? OPTS[key].def : value));
};

// ── 选项 → 样式：<html data-bga="记号 记号 …"> ──
// src/css/ 里的规则都以 :root[data-bga~="记号"] 开头，记号在才生效。
// 这样样式表是静态的，先后顺序无关紧要，开关一个选项只是增删一个记号。
const TOKEN_ATTR = 'data-bga';
const tokens = new Set();
const rootQueue = [];

/** <html> 出现后执行（脚本在 document-start 运行时它可能还不存在） */
const onRoot = (run) => {
  if (document.documentElement) run(document.documentElement);
  else rootQueue.push(run);
};
if (!document.documentElement) {
  new MutationObserver((_, observer) => {
    if (!document.documentElement) return;
    observer.disconnect();
    for (const run of rootQueue.splice(0)) run(document.documentElement);
  }).observe(document, { childList: true });
}

const flag = (token, on) => {
  if (on) tokens.add(token);
  else tokens.delete(token);
  onRoot((root) => root.setAttribute(TOKEN_ATTR, [...tokens].join(' ')));
};
const hasFlag = (token) => tokens.has(token);
/** 布尔选项开着时挂上记号；invert = 关着时挂 */
const reflect = (key, token, invert = false) => watch(key, (value) => flag(token, invert ? !value : !!value));
/** 写一个挂在 <html> 上的 CSS 变量；value 为 null 时移除 */
const setRootVar = (name, value) => {
  onRoot((root) => {
    if (value == null) root.style.removeProperty(name);
    else root.style.setProperty(name, value);
  });
};

// ── 快捷键登记：面板的「快捷鍵」页由这张表生成 ──
// 改过的键位存在 x.keys：{ id: 组合 }，空字符串 = 停用。
const HOTKEYS = [];
/**
 * @param {string} id
 * @param {string} def  例如 'Alt+Shift+KeyW'（用 KeyboardEvent.code，不受输入法和 ⌥ 影响）
 * @param {{group: string, label: string, hint?: string, when?: () => boolean, repeat?: boolean, run: () => void}} meta
 */
const defKey = (id, def, meta) => {
  HOTKEYS.push({ id, def, ...meta });
};
const keyMap = () => {
  const map = store.get('x.keys');
  return map && typeof map === 'object' ? map : {};
};
const keyOf = (hotkey) => {
  const custom = keyMap()[hotkey.id];
  return typeof custom === 'string' ? custom : hotkey.def;
};
/** 键盘事件 → 'Ctrl+Alt+Shift+Meta+Code'；只按了修饰键时返回空字符串 */
const comboOf = (event) => {
  if (!event.code || /^(Shift|Control|Alt|Meta|OS)(Left|Right)?$/.test(event.code)) return '';
  const modifiers = [
    event.ctrlKey && 'Ctrl',
    event.altKey && 'Alt',
    event.shiftKey && 'Shift',
    event.metaKey && 'Meta',
  ];
  return [...modifiers.filter(Boolean), event.code].join('+');
};

const KEY_NAMES = {
  Space: t('空白鍵'),
  Period: '.',
  Comma: ',',
  Slash: '/',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  BracketLeft: '[',
  BracketRight: ']',
  Minus: '-',
  Equal: '=',
  Backquote: '`',
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓',
  Enter: 'Enter',
  Tab: 'Tab',
};
const MAC_MODIFIERS = { Ctrl: '⌃', Alt: '⌥', Shift: '⇧', Meta: '⌘' };
/** 组合键的显示文字：Mac 上用符号（⌥⇧W），其他系统用 Alt+Shift+W */
const comboText = (combo) => {
  if (!combo) return '';
  const parts = combo.split('+');
  const code = parts.pop();
  const key = KEY_NAMES[code] || code.replace(/^Key|^Digit/, '').replace(/^Numpad/, t('數字鍵盤 '));
  const modifiers = parts.map((name) => (IS_MAC ? MAC_MODIFIERS[name] : `${name === 'Meta' ? 'Win' : name}+`));
  return modifiers.join('') + key;
};
/** 面板正在录入新键位：这时所有快捷键都不响应 */
let keyCapturing = false;
