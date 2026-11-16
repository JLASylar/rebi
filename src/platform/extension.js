// ════════════════════════════ 平台层：浏览器扩展 ════════════════════════════
// 这份脚本运行在页面自己的环境里（manifest 里的 world: "MAIN"）：只有这样才装得上 fetch / XHR 钩子、
// 读得到 B站的全局变量。代价是这里够不着扩展的接口（存储、跨域请求），
// 所以另有一个运行在隔离环境里的桥（extension/bridge.js），两边通过一条 MessageChannel 通信。
//
// 设置必须能同步读（document-start 时各模块就要按设置决定装哪些钩子），而扩展的存储只能异步读。
// 做法：在页面自己的 localStorage 里留一份「镜像」，启动时先同步读镜像；
// 桥把真正的存储内容送到后，再以它为准更新镜像，并通知有变化的项。
// 镜像里只放开关、数字和很短的字符串——页面上的其他脚本也读得到 localStorage，
// 屏蔽词、备注这些自己攒的内容不放进去，令牌更是根本不进页面。

const platform = (() => {
  const MIRROR_KEY = 'bga:settings';
  const MIRROR_MAX_STRING = 32;

  /** 当前已知的全部设置：键 → 值 */
  let values = {};
  try {
    values = JSON.parse(localStorage.getItem(MIRROR_KEY) || '{}') || {};
  } catch {
    // 镜像读不了：先按预设值跑，等桥送来真正的设置
  }
  const subscribers = new Map();
  const replies = new Map();
  let nextRequestId = 1;
  let menuAction = null;

  const mirrorable = (value) =>
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    (typeof value === 'string' && value.length <= MIRROR_MAX_STRING);
  const saveMirror = () => {
    try {
      const small = Object.fromEntries(Object.entries(values).filter(([, value]) => mirrorable(value)));
      localStorage.setItem(MIRROR_KEY, JSON.stringify(small));
    } catch {
      // 存不了镜像：下次启动头几十毫秒用预设值，不影响别的
    }
  };
  const same = (a, b) => a === b || JSON.stringify(a) === JSON.stringify(b);
  const notify = (key, value) => {
    for (const onChange of subscribers.get(key) || []) onChange(value);
  };

  // ── 和桥连上 ──
  let port = null;
  const outbox = [];
  const send = (message) => {
    if (port) port.postMessage(message);
    else outbox.push(message);
  };
  /** 发一个要等回复的请求 */
  const ask = (message) =>
    new Promise((resolve, reject) => {
      const id = nextRequestId++;
      replies.set(id, { resolve, reject });
      send({ ...message, id });
    });

  let markReady;
  const ready = new Promise((resolve) => {
    markReady = resolve;
  });
  /** 启动时镜像里的值和真正的存储不一致的那些键（之前在别的网域改过设置，这个网域的镜像还是旧的） */
  const staleKeys = [];

  const onBridgeMessage = ({ data }) => {
    if (data.op === 'init') {
      const changed = [...new Set([...Object.keys(values), ...Object.keys(data.values)])].filter(
        (key) => !same(values[key], data.values[key]),
      );
      // 本该在镜像里却对不上的才算「镜像过期」；屏蔽词这类不进镜像的，每次启动都是这时候才拿到，不算
      staleKeys.push(...changed.filter((key) => data.values[key] === undefined || mirrorable(data.values[key])));
      values = data.values;
      saveMirror();
      for (const key of changed) notify(key, values[key]);
      markReady();
    } else if (data.op === 'change') {
      // 别的分页（或这个分页自己刚才）改了设置。和手上的一样就不用通知
      if (same(values[data.key], data.value)) return;
      if (data.value === undefined) delete values[data.key];
      else values[data.key] = data.value;
      saveMirror();
      notify(data.key, data.value);
    } else if (data.op === 'menu') {
      menuAction?.();
    } else if (data.op === 'reply') {
      const waiting = replies.get(data.id);
      replies.delete(data.id);
      if (data.error) waiting?.reject(new Error(data.error));
      else waiting?.resolve(data.result);
    }
  };

  // 桥可能比这份脚本晚一点点才开始听：隔一会儿再打一次招呼，直到它应答
  const greet = () => {
    if (port) return;
    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      if (!port) {
        port = channel.port1;
        for (const message of outbox.splice(0)) port.postMessage(message);
      }
      onBridgeMessage(event);
    };
    window.postMessage({ bga: 'hello' }, '*', [channel.port2]);
    setTimeout(greet, 200);
  };
  greet();

  return {
    page: window,
    ready,
    staleKeys,

    storage: {
      get: (key) => values[key],
      set(key, value) {
        values[key] = value;
        saveMirror();
        send({ op: 'set', key, value });
      },
      remove(key) {
        delete values[key];
        saveMirror();
        send({ op: 'remove', key });
      },
      subscribe(key, onChange) {
        if (!subscribers.has(key)) subscribers.set(key, []);
        subscribers.get(key).push(onChange);
      },
    },

    /**
     * 跨域 GET，由后台脚本代发；只允许图床图片和几个公开的 B站接口（名单在 extension/background.js）。
     * @param {{url: string, responseType?: 'text'|'blob'}} options
     * @returns {Promise<{status: number, text?: string, blob?: Blob}>}
     */
    async request({ url, responseType = 'text' }) {
      const result = await ask({ op: 'request', url, responseType });
      if (responseType !== 'blob') return result;
      const bytes = Uint8Array.from(atob(result.base64), (char) => char.charCodeAt(0));
      return { status: result.status, blob: new Blob([bytes], { type: result.type }) };
    },

    copy: (text) => navigator.clipboard.writeText(text),

    /** 点浏览器工具栏上的扩展图标时执行 */
    addMenu(_label, run) {
      menuAction = run;
    },
  };
})();
