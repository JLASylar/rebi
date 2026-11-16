// ════════════════════════════ 净化：网络 ════════════════════════════
// 拦截数据上报、停用 P2P。这些都要赶在 B站的脚本运行之前装好（document-start）。

/**
 * 把页面的一个全局变量钉死成 value：B站的脚本之后再给它赋值也不生效，也不报错。
 * （用访问器而不是只读属性：严格模式下给只读属性赋值会抛错，反而弄坏 B站的脚本。）
 */
const pinGlobal = (name, value) => {
  try {
    delete W[name];
    Object.defineProperty(W, name, { get: () => value, set() {}, configurable: false });
  } catch {
    // 已经被定义成不可改的了
  }
};

/**
 * 黑洞：怎么用都不报错的对象。读任何属性、调用它、new 它，得到的都还是它自己。
 * 用来顶替不想让它工作的 SDK，B站的代码照常调用，只是什么都不会发生。
 */
const blackhole = () => {
  const hole = new Proxy(function () {}, {
    get(_target, key) {
      if (key === 'then') return undefined; // 不是 Promise：await 它立刻拿到它自己
      if (key === Symbol.toPrimitive) return () => '';
      return hole;
    },
    set: () => true,
    apply: () => hole,
    construct: () => hole,
  });
  return hole;
};

// ── 数据上报 ──
function blockReporting() {
  const REPORT_HOST = /(?:^|[/.])(?:data|cm)\.bilibili\.com/;
  hookFetch((url) => (REPORT_HOST.test(url) ? { block: 'hang' } : null));
  hookXHR((url) => (REPORT_HOST.test(url) ? { block: true } : null));
  safe(() => {
    W.navigator.sendBeacon = () => true;
  }, 'sendBeacon');

  // 埋点 SDK 和 Sentry：换成黑洞
  const hole = blackhole();
  for (const name of ['MReporter', 'MReporterInstance', 'ReporterPb', 'ReporterPbInstance', 'Sentry'])
    pinGlobal(name, hole);

  // 浏览器指纹：采集器换成空壳，它的配置读不到
  pinGlobal('__biliUserFp__', { init() {}, queryUserLog: () => [] });
  pinGlobal('__USER_FP_CONFIG__', undefined);
  pinGlobal('__MIRROR_CONFIG__', undefined);
}

// ── P2P ──
/** 页面里出现过的 B站自营 CDN 主机（upos-…​.bilivideo.com）；没找到就用一个固定的镜像 */
let uposHost = '';
const officialHost = () => {
  uposHost ||= document.head?.innerHTML.match(/\bupos-[\w-]+\.bilivideo\.com/)?.[0] || '';
  return uposHost || 'upos-sz-mirrorcoso1.bilivideo.com';
};

/** P2P 节点和第三方 CDN 的地址怎么换回 B站自己的 CDN */
const P2P_ROUTES = [
  // 运营商边缘节点（P2P）：主机换成自营 CDN
  { suffix: '.mcdn.bilivideo.cn', host: () => officialHost() },
  // 第三方 CDN：原始主机写在 xy_usource 参数里
  { suffix: '.szbdyd.com', host: (url) => url.searchParams.get('xy_usource') },
];

/** 影片地址如果指向 P2P 节点或第三方 CDN，换回官方 CDN；其他地址原样返回 */
const toOfficialCdn = (address) => {
  let url;
  try {
    url = new URL(address);
  } catch {
    return address; // 不是绝对地址
  }
  const route = P2P_ROUTES.find(({ suffix }) => url.hostname.endsWith(suffix));
  const host = route?.host(url);
  if (!host) return address;
  url.host = host;
  url.port = '443';
  return url.toString();
};

/** 把一个对象里所有的地址字符串就地换成官方 CDN（首屏的播放信息是一棵嵌套很深的对象） */
const rewriteCdnUrls = (node, depth = 0) => {
  if (!node || typeof node !== 'object' || depth > 12) return;
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (typeof value === 'string') {
      if (value.startsWith('http')) node[key] = toOfficialCdn(value);
    } else {
      rewriteCdnUrls(value, depth + 1);
    }
  }
};

function disableP2P() {
  // WebRTC：B站只用它在观众之间互传影片分片。换成空壳，连不出去。
  // 这几个类故意做得「不完整」：B站的 P2P 组件在它们上面初始化失败，播放器就退回普通的 CDN 下载。
  class InertPeerConnection {
    addEventListener() {}
    createDataChannel() {}
    close() {}
  }
  class InertDataChannel {}
  pinGlobal('RTCPeerConnection', InertPeerConnection);
  pinGlobal('webkitRTCPeerConnection', InertPeerConnection);
  pinGlobal('RTCDataChannel', InertDataChannel);
  pinGlobal('webkitRTCDataChannel', InertDataChannel);
  // B站自己的 P2P 组件
  pinGlobal('PCDNLoader', class {});
  pinGlobal(
    'BPP2PSDK',
    class {
      on() {}
    },
  );
  pinGlobal('SeederSDK', class {});

  if (!(PAGE.video || PAGE.bangumi)) return;
  // 影片地址有三个来源：首屏数据、之后的接口请求、直接赋给 <video> 的 src
  onGlobal('__playinfo__', (info) => rewriteCdnUrls(info));
  hookXHR((url) => {
    const official = toOfficialCdn(url);
    return official === url ? null : { url: official };
  });
  safe(() => {
    const media = W.HTMLMediaElement.prototype;
    const native = Object.getOwnPropertyDescriptor(media, 'src');
    if (!native?.set) return;
    Object.defineProperty(media, 'src', {
      ...native,
      set(value) {
        native.set.call(this, typeof value === 'string' ? toOfficialCdn(value) : value);
      },
    });
  }, '影片地址');
}

function setupNetwork() {
  if (val('x.noReport')) blockReporting();
  if (val('x.noP2P')) disableP2P();
}
