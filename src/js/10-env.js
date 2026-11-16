// ════════════════════════════ 环境 ════════════════════════════

/** 页面自己的 window */
const W = platform.page;

const IS_TOP = (() => {
  try {
    return window.top === window.self;
  } catch {
    return false;
  }
})();
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);
const IS_SAFARI = /Safari\//.test(navigator.userAgent) && !/Chrome|Chromium|Edg\//.test(navigator.userAgent);
const VERSION = BUILD.version;

// 国际版的路径带语言前缀（/zh-Hant/video/…），判断页面类型前先去掉
const LOCALE_PREFIX = /^\/(?:zh-Hans|zh-Hant|en|ja|th|ar|pt|es|id|ms|ru|tr|vi)(?=\/|$)/;
const HOST = location.host;
const PATH = location.pathname.replace(LOCALE_PREFIX, '') || '/';

const ON_WWW = HOST === 'www.bilibili.com';
const PAGE = {
  www: ON_WWW,
  home: ON_WWW && PATH === '/',
  read: ON_WWW && PATH.startsWith('/read'),
  opus: ON_WWW && PATH.startsWith('/opus'),
  video: ON_WWW && PATH.startsWith('/video/'),
  bangumi: ON_WWW && PATH.startsWith('/bangumi/play/'),
  t: HOST === 't.bilibili.com',
  space: HOST === 'space.bilibili.com',
  message: HOST === 'message.bilibili.com',
  search: HOST === 'search.bilibili.com',
  live: HOST === 'live.bilibili.com',
};

// ── 日志 ──
const LOG_TAG = [`%c${BUILD.name}`, 'color:#fb7299;font-weight:bold'];
const log = (...args) => console.info(...LOG_TAG, ...args);
const warn = (...args) => console.warn(...LOG_TAG, ...args);

/** 各模块互不拖累：一个模块抛错只记一条警告，其余照常运行 */
const safe = (run, name) => {
  try {
    return run();
  } catch (error) {
    warn(`模块出错：${name || run.name}`, error);
    return undefined;
  }
};
