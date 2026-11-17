// ════════════════════════════ DOM 工具 ════════════════════════════

/** 建元素：h('div', { class: 'x', onclick: fn, dataset: { a: 1 } }, 子节点…) */
const h = (tag, props = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(props)) {
    if (name === 'class') el.className = value;
    else if (name === 'style') el.style.cssText = value;
    else if (name === 'dataset') Object.assign(el.dataset, value);
    else if (name.startsWith('on') && typeof value === 'function') el.addEventListener(name.slice(2), value);
    else if (value !== false && value != null) el.setAttribute(name, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child != null && child !== false) el.append(child);
  }
  return el;
};

/**
 * 建一个 SVG 图标。inner 是脚本里写死的图形（<path>、<circle>…），用 XML 解析器解析后搬进页面，
 * 不经过 innerHTML（扩展商店的检查不喜欢 innerHTML，页面开了 Trusted Types 时也会被挡）。
 */
const svgIcon = (inner, size = 16) => {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" aria-hidden="true">${inner}</svg>`;
  return document.importNode(new DOMParser().parseFromString(source, 'image/svg+xml').documentElement, true);
};

// ── 样式 ──
/** 挂一个 <style>。document-start 时连 <html> 都可能还没有，等它出现再挂 */
const ownStyles = [];
const addStyle = (css, name = '') => {
  const style = document.createElement('style');
  style.dataset.bgaStyle = name;
  style.textContent = css;
  ownStyles.push(style);
  onRoot((root) => (document.head || root).appendChild(style));
  return style;
};
/**
 * 样式表和 <html> 上的记号被页面弄丢了就补回去。
 * Safari 的脚本管理器在页面刚打开时注入得特别早，那时挂上去的东西有时会随着文档重建一起消失：
 * 脚本还在跑、面板也打得开，但版面完全是原样。载入的几个节点上各查一次，另外盯着 <html> 有没有被换掉。
 */
const restoreStyles = () => {
  const root = document.documentElement;
  if (!root) return;
  for (const style of ownStyles) {
    if (!style.isConnected) (document.head || root).appendChild(style);
  }
  const wanted = [...tokens].join(' ');
  if (root.getAttribute(TOKEN_ATTR) !== wanted) root.setAttribute(TOKEN_ATTR, wanted);
};
const guardStyles = () => {
  new MutationObserver(restoreStyles).observe(document, { childList: true });
  document.addEventListener('DOMContentLoaded', restoreStyles);
  addEventListener('load', restoreStyles);
  addEventListener('pageshow', restoreStyles);
  for (const delay of [0, 100, 400, 1500, 4000]) setTimeout(restoreStyles, delay);
};
/**
 * 可开关的样式表，给没法用记号控制的规则用（@font-face 等）。
 * 用 media 切换：样式表还没挂上时也有效，disabled 属性做不到。
 */
const toggleStyle = (css, name = '') => {
  const style = addStyle(css, name);
  return (on) => {
    style.media = on ? 'all' : 'not all';
  };
};

// ── 等待 ──
const ready = () =>
  new Promise((resolve) => {
    if (document.readyState !== 'loading') resolve();
    else document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
  });
const bodyReady = () =>
  new Promise((resolve) => {
    if (document.body) return resolve();
    new MutationObserver((_, observer) => {
      if (!document.body) return;
      observer.disconnect();
      resolve();
    }).observe(document, { childList: true, subtree: true });
  });
/** 轮询直到 probe() 返回真值；超时则 reject */
const waitFor = (probe, description = '元素', timeout = 15000, interval = 100) =>
  new Promise((resolve, reject) => {
    const first = probe();
    if (first) return resolve(first);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const found = probe();
      if (found) {
        clearInterval(timer);
        resolve(found);
      } else if (Date.now() - startedAt > timeout) {
        clearInterval(timer);
        reject(new Error(`${description}等待超时`));
      }
    }, interval);
  });
/** 等 parent 的直接子元素里出现带 className 的那个 */
const observeChild = (className, parent) =>
  new Promise((resolve) => {
    const find = () => [...parent.children].find((child) => child.classList.contains(className));
    const existing = find();
    if (existing) return resolve(existing);
    const observer = new MutationObserver(() => {
      const child = find();
      if (!child) return;
      observer.disconnect();
      resolve(child);
    });
    observer.observe(parent, { childList: true });
  });

/**
 * 给「扫整页卡片」的功能用的 MutationObserver：
 * 播放器、直播播放器和脚本自己界面里的变动（弹幕、进度条…）一律忽略，免得播放时反复扫全页。
 */
const OWN_UI =
  '#bilibili-player, #live-player, #bga-panel, .bga-toasts, #bga-card-tools, #bga-card-zoom, #bga-memo-pop';
const pageObserver = (onChange) =>
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const el = mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
      if (el && !el.closest(OWN_UI)) return void onChange();
    }
  });

const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;

// ── 复制 ──
/**
 * 在用户手势里同步复制。
 * Safari 里异步的 navigator.clipboard 和管理器的剪贴板接口都可能不生效，所以先用「选中文本框 + execCommand」。
 */
const copyNow = (text) => {
  try {
    const box = h('textarea', { style: 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0' });
    box.value = text;
    (document.querySelector('#bga-panel:popover-open') || document.body).appendChild(box);
    box.focus();
    box.select();
    const copied = document.execCommand('copy');
    box.remove();
    if (copied) return true;
  } catch {
    // 换下一种办法
  }
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 换下一种办法
  }
  try {
    platform.copy(text);
    return true;
  } catch {
    return false;
  }
};

// ── 提示条 ──
/**
 * @param {string} message
 * @param {'info'|'ok'|'warn'} [kind]
 * @param {number} [duration] 毫秒
 * @param {string} [key] 同一个 key 的提示就地更新，不叠成一串（音量、倍速这类连续变化的）
 */
const toast = (() => {
  let box = null;
  return (message, kind = 'info', duration = 3200, key = '') => {
    if (!document.body) return;
    box ||= h('div', { class: 'bga-toasts bga-ui', dataset: { accent: store.get('x.ui.accent', 'pink') } });
    // 全屏时挂进全屏元素，否则看不到
    const fullscreen = fullscreenElement();
    const host = fullscreen && fullscreen.tagName !== 'VIDEO' ? fullscreen : document.body;
    if (box.parentElement !== host) host.appendChild(box);

    let item = key ? [...box.children].find((child) => child.dataset.key === key) : null;
    if (item) {
      item.textContent = message;
      clearTimeout(item.bgaTimer);
    } else {
      item = box.appendChild(h('div', { class: `bga-toast bga-toast-${kind}`, dataset: key ? { key } : {} }, message));
      requestAnimationFrame(() => item.classList.add('bga-in'));
    }
    const shown = item;
    shown.bgaTimer = setTimeout(() => {
      shown.classList.remove('bga-in');
      delete shown.dataset.key;
      setTimeout(() => shown.remove(), 400);
    }, duration);
  };
})();
