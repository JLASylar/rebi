// ════════════════════════════ 桥（隔离环境里的内容脚本） ════════════════════════════
// 主脚本 page.js 运行在页面自己的环境里，够不着扩展的接口。这个脚本运行在隔离环境里，替它转手：
//   设置的读写          ↔ 扩展的存储（storage.local）
//   跨域请求            ↔ 后台脚本（background.js）
//   点工具栏图标        →  打开设置面板
// 两边用一条 MessageChannel 通信：page.js 在 document-start 建好通道，把一端递过来。

(() => {
  const api = globalThis.browser ?? globalThis.chrome;
  /** 以这个开头的存储键只归后台脚本用，不送进页面 */
  const SECRET_PREFIX = 'secret.';
  const isSecret = (key) => key.startsWith(SECRET_PREFIX);

  let port = null;

  /** page.js 发来的消息 */
  const onPageMessage = async ({ data }) => {
    if (data.op === 'set') {
      if (!isSecret(data.key)) api.storage.local.set({ [data.key]: data.value });
    } else if (data.op === 'remove') {
      if (!isSecret(data.key)) api.storage.local.remove(data.key);
    } else if (data.id) {
      // 要回复的请求：转给后台脚本
      try {
        const reply = await api.runtime.sendMessage(data);
        port.postMessage({ op: 'reply', id: data.id, result: reply?.result, error: reply?.error });
      } catch (error) {
        port.postMessage({ op: 'reply', id: data.id, error: String(error?.message || error) });
      }
    }
  };

  const connect = async (pagePort) => {
    port = pagePort;
    port.onmessage = onPageMessage;
    const stored = await api.storage.local.get(null);
    const values = Object.fromEntries(Object.entries(stored).filter(([key]) => !isSecret(key)));
    port.postMessage({ op: 'init', values });
  };

  // 只认第一次招呼：page.js 在页面的任何脚本之前运行，第一条一定是它发的
  window.addEventListener('message', (event) => {
    if (port || event.source !== window || event.data?.bga !== 'hello' || !event.ports[0]) return;
    event.stopImmediatePropagation();
    connect(event.ports[0]);
  });

  // 设置变了（任何分页改的，包括这一页自己）：告诉 page.js
  api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !port) return;
    for (const [key, change] of Object.entries(changes)) {
      if (!isSecret(key)) port.postMessage({ op: 'change', key, value: change.newValue });
    }
  });

  // 点了工具栏上的扩展图标：只有顶层页面有面板
  api.runtime.onMessage.addListener((message) => {
    if (message?.op === 'menu' && window.top === window) port?.postMessage({ op: 'menu' });
  });

  // 浏览器不认 manifest 里的 world: "MAIN" 时，page.js 会被放进隔离环境（它发现后什么都不做）。
  // 等一会儿还没收到招呼，就改用 <script> 标签把它送进页面——晚一点，但能用。
  setTimeout(() => {
    if (port) return;
    const script = document.createElement('script');
    script.src = api.runtime.getURL('page.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  }, 400);
})();
