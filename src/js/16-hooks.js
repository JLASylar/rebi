// ════════════════════════════ 页面钩子 ════════════════════════════
// 网络请求、评论组件、全局变量。各模块共用一层包装，不各自去套 fetch / XHR。
// 钩子必须在 document-start 同步装好，晚了 B站的脚本已经拿到原函数。

// ── fetch ──
const fetchHooks = [];

/** fetch 的第一个参数可以是字符串、URL 或 Request */
const urlOfFetchInput = (input) => {
  if (typeof input === 'string') return input;
  if (typeof input?.href === 'string') return input.href;
  return input?.url;
};

/**
 * @param {(url: string, args: any[]) => (null | {block?: 'hang'|'reject', url?: string, after?: (response: Response) => any})} hook
 *   block: 'hang' 让请求永远不返回，'reject' 让它失败；
 *   url:   换一个地址去请求（只对字符串形式的调用有效）；
 *   after: 拿到响应后调用，可以返回一个新的 Response 顶替原来的。
 */
const hookFetch = (hook) => {
  fetchHooks.push(hook);
  if (fetchHooks.length > 1 || typeof W.fetch !== 'function') return;

  const nativeFetch = W.fetch;
  W.fetch = function (...args) {
    const afters = [];
    let url;
    try {
      url = urlOfFetchInput(args[0]);
    } catch {
      // 取不到地址就不处理
    }
    if (typeof url === 'string') {
      for (const run of fetchHooks) {
        let verdict;
        try {
          verdict = run(url, args);
        } catch (error) {
          warn(error);
        }
        if (!verdict) continue;
        if (verdict.block === 'reject') return Promise.reject(new TypeError('blocked'));
        if (verdict.block) return new Promise(() => {});
        if (verdict.url && typeof args[0] === 'string') {
          url = verdict.url;
          args[0] = url;
        }
        if (verdict.after) afters.push(verdict.after);
      }
    }
    let pending = nativeFetch.apply(this, args);
    for (const after of afters) {
      pending = pending.then(async (response) => {
        try {
          return (await after(response)) || response;
        } catch (error) {
          warn(error);
          return response;
        }
      });
    }
    return pending;
  };
};

// ── XMLHttpRequest ──
const xhrHooks = [];

/** 在这个 XHR 实例上改写响应：rewrite(原文) 返回新文本，返回 undefined 表示不改 */
const rewriteXhrResponse = (xhr, rewrite) => {
  const proto = W.XMLHttpRequest.prototype;
  const nativeText = Object.getOwnPropertyDescriptor(proto, 'responseText');
  const nativeResponse = Object.getOwnPropertyDescriptor(proto, 'response');
  if (!nativeText?.get || !nativeResponse?.get) return;

  let ran = false;
  let rewritten;
  let parsed;
  const rewriteOnce = (raw) => {
    if (!ran) {
      ran = true;
      try {
        rewritten = rewrite(raw);
      } catch (error) {
        warn(error);
      }
    }
    return typeof rewritten === 'string' ? rewritten : undefined;
  };
  const readText = () => {
    const raw = nativeText.get.call(xhr);
    if (xhr.readyState !== 4 || typeof raw !== 'string') return raw;
    return rewriteOnce(raw) ?? raw;
  };

  Object.defineProperty(xhr, 'responseText', { configurable: true, get: readText });
  Object.defineProperty(xhr, 'response', {
    configurable: true,
    get() {
      const type = xhr.responseType;
      if (type === '' || type === 'text') return readText();
      const raw = nativeResponse.get.call(xhr);
      if (type !== 'json' || xhr.readyState !== 4 || raw == null) return raw;
      const text = rewriteOnce(JSON.stringify(raw));
      if (text === undefined) return raw;
      try {
        parsed ??= W.JSON.parse(text);
        return parsed;
      } catch {
        return raw;
      }
    },
  });
};

/**
 * @param {(url: string, xhr: XMLHttpRequest) => (null | {block?: boolean, url?: string, rewrite?: (text: string) => (string|undefined)})} hook
 */
const hookXHR = (hook) => {
  xhrHooks.push(hook);
  if (xhrHooks.length > 1) return;

  const nativeOpen = W.XMLHttpRequest.prototype.open;
  W.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    // 同一个对象被重新 open：先撤掉上一次装的响应改写
    try {
      delete this.responseText;
      delete this.response;
    } catch {
      // 没装过
    }
    let target = url;
    if (typeof target === 'string') {
      for (const run of xhrHooks) {
        let verdict;
        try {
          verdict = run(target, this);
        } catch (error) {
          warn(error);
        }
        if (!verdict) continue;
        if (verdict.block) this.send = function () {};
        if (verdict.url) target = verdict.url;
        if (verdict.rewrite) safe(() => rewriteXhrResponse(this, verdict.rewrite), '改写 XHR 响应');
      }
    }
    return nativeOpen.call(this, method, target, ...rest);
  };
};

// ── 评论区组件 ──
// B站评论区是 Lit 写的自定义元素（层层 shadow DOM）。在组件每次 update() 之后回调，就能往它渲染好的内容里加东西。
const litHooks = new Map();
let litDefinePatched = false;

/** 穿透 shadow DOM 找出所有某标签的元素 */
const deepQueryAll = (tag, scope = document, found = []) => {
  for (const el of scope.querySelectorAll('*')) {
    if (el.localName === tag) found.push(el);
    if (el.shadowRoot) deepQueryAll(tag, el.shadowRoot, found);
  }
  return found;
};

const patchLitComponent = (tag, constructor) => {
  const proto = constructor?.prototype;
  if (!proto || typeof proto.update !== 'function' || Object.hasOwn(proto, '__bgaPatched')) return;
  const nativeUpdate = proto.update;
  proto.update = function (...args) {
    const result = nativeUpdate.apply(this, args);
    for (const run of litHooks.get(tag) || []) {
      try {
        run(this);
      } catch (error) {
        warn(`评论组件 ${tag}`, error);
      }
    }
    return result;
  };
  Object.defineProperty(proto, '__bgaPatched', { value: true });
};

/** onRender(el) 在该组件每次渲染后调用；el.data 是 B站传给组件的数据 */
const hookLit = (tag, onRender) => {
  if (!litHooks.has(tag)) litHooks.set(tag, []);
  litHooks.get(tag).push(onRender);
  const registry = W.customElements;
  if (!registry) return;

  if (!litDefinePatched) {
    litDefinePatched = true;
    const nativeDefine = registry.define;
    registry.define = function (name, constructor, ...rest) {
      if (litHooks.has(name)) safe(() => patchLitComponent(name, constructor), '评论组件补丁');
      return nativeDefine.call(this, name, constructor, ...rest);
    };
  }
  // Safari 上脚本偶尔晚于 B站注册组件：补打补丁，并处理已经渲染出来的元素
  const defined = registry.get(tag);
  if (!defined) return;
  patchLitComponent(tag, defined);
  ready().then(() => {
    for (const el of deepQueryAll(tag)) safe(() => onRender(el), `评论组件 ${tag}`);
  });
};

// ── 全局变量 ──
// B站用 __INITIAL_STATE__、__playinfo__ 之类的全局变量传首屏数据。多个模块可以订阅同一个变量。
const globalWatchers = new Map();

/** 变量出现（被赋值）时调用 onValue(值)；已经有值就立即调用 */
const onGlobal = (name, onValue) => {
  if (W[name] !== undefined) return void safe(() => onValue(W[name]), `全局变量 ${name}`);
  if (globalWatchers.has(name)) return void globalWatchers.get(name).push(onValue);

  const watchers = [onValue];
  globalWatchers.set(name, watchers);
  const announce = (value) => {
    for (const run of watchers) safe(() => run(value), `全局变量 ${name}`);
  };
  let current;
  try {
    Object.defineProperty(W, name, {
      configurable: true,
      enumerable: true,
      get: () => current,
      set: (value) => {
        current = value;
        announce(value);
      },
    });
  } catch {
    // 已经被别人定义成不可改：等页面就绪后看一眼
    ready().then(() => {
      if (W[name] !== undefined) announce(W[name]);
    });
  }
};
