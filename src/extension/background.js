// ════════════════════════════ 后台脚本 ════════════════════════════
// 页面里做不了、必须由扩展自己做的两件事：
//   1. 跨域 GET（图床图片、几个公开的 B站接口）——只允许名单里的地址；
//   2. 点工具栏图标时让当前分页打开设置面板。

const api = globalThis.browser ?? globalThis.chrome;

// 「个人空间 IP 属地」功能已取消（2.3.0），它存过的 App 登录令牌清掉
api.storage.local.remove('secret.accessKey');

// ── 跨域 GET ──
/** 允许代发的地址：图床上的任何文件，以及这几个不需要登录的接口 */
const ALLOWED_URLS = [
  /^https:\/\/[\w-]+\.hdslb\.com\//,
  /^https:\/\/api\.bilibili\.com\/x\/v1\/dm\/list\.so\?/,
  /^https:\/\/api\.bilibili\.com\/x\/player\/(?:pagelist|videoshot)\?/,
  /^https:\/\/api\.bilibili\.com\/x\/web-interface\/(?:view|card)\?/,
];

const toBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  // 分段转：一次塞进 String.fromCharCode 的参数太多会爆栈
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
};

const proxyGet = async ({ url, responseType }) => {
  if (!ALLOWED_URLS.some((pattern) => pattern.test(url))) throw new Error('这个地址不在允许代发的名单里');
  const response = await fetch(url, { credentials: 'omit' });
  if (responseType !== 'blob') return { status: response.status, text: await response.text() };
  return {
    status: response.status,
    type: response.headers.get('content-type') || 'application/octet-stream',
    base64: toBase64(await response.arrayBuffer()),
  };
};

// ── 消息 ──
const HANDLERS = { request: proxyGet };

api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = HANDLERS[message?.op];
  // 只接本扩展的内容脚本从 B站页面发来的消息
  const fromBilibili = sender.id === api.runtime.id && /^https?:\/\/([\w-]+\.)?bilibili\.com\//.test(sender.url || '');
  if (!handler || !fromBilibili) return false;
  handler(message).then(
    (result) => sendResponse({ result }),
    (error) => sendResponse({ error: String(error?.message || error) }),
  );
  return true; // 异步回复
});

// ── 主脚本的登记（Safari） ──
// Chrome 和 Firefox 的 manifest 直接声明 page.js 运行在页面环境（world: "MAIN"）。
// Safari 不认 manifest 里的这个写法，但认动态登记的：那一版的 manifest 只声明桥，page.js 在这里登记。
const registerPageScript = async () => {
  const declared = api.runtime.getManifest().content_scripts;
  if (declared.some((entry) => entry.js.includes('page.js'))) return;
  const existing = await api.scripting.getRegisteredContentScripts({ ids: ['page'] });
  if (existing.length) return;
  const [bridge] = declared;
  await api.scripting.registerContentScripts([
    {
      id: 'page',
      js: ['page.js'],
      matches: bridge.matches,
      excludeMatches: bridge.exclude_matches,
      runAt: 'document_start',
      allFrames: true,
      world: 'MAIN',
    },
  ]);
};
api.runtime.onInstalled.addListener(registerPageScript);
api.runtime.onStartup.addListener(registerPageScript);

// ── 工具栏图标 ──
api.action.onClicked.addListener((tab) => {
  const onBilibili = /^https?:\/\/([\w-]+\.)?bilibili\.com\//.test(tab.url || '');
  if (onBilibili) api.tabs.sendMessage(tab.id, { op: 'menu' }).catch(() => {});
  else api.tabs.create({ url: 'https://www.bilibili.com/' });
});
