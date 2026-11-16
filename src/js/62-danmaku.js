// ════════════════════════════ 弹幕查询（关键字 → 弹幕 → 发送者） ════════════════════════════
// 弹幕文件里不写发送者的 UID，只写它的 CRC32。UID 是纯数字，所以可以反过来枚举数字串找出它。
// 查询界面在设置面板的「彈幕查詢」页（80-panel.js），这里只是引擎。

TABS.push(['danmaku', t('彈幕查詢')]);

/** CRC32 查表（多项式 0xEDB88320） */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let value = n;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[n] = value;
  }
  return table;
})();

const dm = {
  /** 已经反查过的：hash → UID（查不到的记成空字符串） */
  cache: new Map(),

  /** 字符串的 CRC32 寄存器值（还没做最后的取反） */
  crc(text) {
    let register = 0xffffffff;
    for (let i = 0; i < text.length; i++)
      register = (register >>> 8) ^ CRC_TABLE[(register ^ text.charCodeAt(i)) & 0xff];
    return register >>> 0;
  },

  /**
   * 由 CRC32 反查 UID。
   * 做法：CRC32 的最后 4 步查表可以从结果倒推出来，于是只需枚举 UID 的「前缀」（去掉末三位），
   * 末三位由倒推的表项直接算出。枚举到 limit（默认 1e8，即最多 11 位的 UID），分片执行不卡界面。
   * @returns {Promise<string>} 找不到返回空字符串
   */
  async crack(hash, limit = 1e8, signal = { cancelled: false }) {
    if (dm.cache.has(hash)) return dm.cache.get(hash);
    const target = parseInt(hash, 16);
    if (Number.isNaN(target)) return '';
    const found = (uid) => {
      dm.cache.set(hash, uid);
      return uid;
    };

    // 倒推最后 4 步用到的表项下标
    let remainder = (target ^ 0xffffffff) >>> 0;
    const steps = [0, 0, 0, 0];
    for (let i = 3; i >= 0; i--) {
      const topByte = remainder >>> (i * 8);
      const index = CRC_TABLE.findIndex((entry) => entry >>> 24 === topByte);
      if (index < 0) return '';
      steps[3 - i] = index;
      remainder = (remainder ^ (CRC_TABLE[index] >>> ((3 - i) * 8))) >>> 0;
    }

    /** 已知前缀，推出末三位数字；推出来的不是数字就说明前缀不对 */
    const lastThreeDigits = (prefix) => {
      let register = dm.crc(prefix);
      let digits = '';
      for (const step of [2, 1, 0]) {
        const code = (register & 0xff) ^ steps[step];
        if (code < 48 || code > 57) return null;
        digits += code - 48;
        register = (CRC_TABLE[steps[step]] ^ (register >>> 8)) >>> 0;
      }
      return digits;
    };

    // 不足 4 位的 UID 没有「前缀 + 末三位」，直接试
    for (let n = 0; n < 1000; n++) {
      if ((dm.crc(String(n)) ^ 0xffffffff) >>> 0 === target >>> 0) return found(String(n));
    }

    let prefix = 0;
    while (prefix < limit) {
      if (signal.cancelled) return '';
      const sliceEnd = Math.min(prefix + 400000, limit);
      for (; prefix < sliceEnd; prefix++) {
        const text = String(prefix);
        // 先只看前缀的最后一步查表对不对得上，对得上再去推末三位
        let register = 0xffffffff;
        let index = 0;
        for (let i = 0; i < text.length; i++) {
          index = (register ^ text.charCodeAt(i)) & 0xff;
          register = (register >>> 8) ^ CRC_TABLE[index];
        }
        if (index !== steps[3]) continue;
        const tail = lastThreeDigits(text);
        if (tail !== null) return found(text + tail);
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return found('');
  },

  /** 先用页面的 fetch（带登录态）；被跨域规则挡住再走平台层 */
  async getText(url) {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) return await response.text();
    } catch {
      // 换平台层再试
    }
    return (await platform.request({ url })).text;
  },
  async getJSON(url) {
    return JSON.parse(await dm.getText(url));
  },

  /** 当前页面正在放的那一 P 的 cid（弹幕按 cid 存） */
  async cid() {
    const state = W.__INITIAL_STATE__;
    if (PAGE.bangumi && state?.epInfo?.cid) return state.epInfo.cid;
    const query = new URLSearchParams(location.search);
    const bvid =
      location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/)?.[1] ||
      query.get('bvid') ||
      state?.videoData?.bvid ||
      state?.bvid;
    if (!bvid) throw new Error(t('這個頁面找不到影片 BV 號'));
    const pages = (await dm.getJSON(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`))?.data;
    if (!Array.isArray(pages) || !pages.length) throw new Error(t('取得分 P 列表失敗'));
    const part = Math.max(1, parseInt(query.get('p') || state?.p || '1', 10) || 1);
    return (pages[part - 1] || pages[0]).cid;
  },

  /** 取当前影片的弹幕，按出现时间排序；keyword 非空时只留包含它的（不分大小写） */
  async search(keyword) {
    const cid = await dm.cid();
    const xml = await dm.getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`);
    const needle = (keyword || '').toLowerCase();
    const results = [];
    for (const node of new DOMParser().parseFromString(xml, 'text/xml').getElementsByTagName('d')) {
      const text = node.textContent || '';
      if (needle && !text.toLowerCase().includes(needle)) continue;
      // p 属性：出现时间(秒),模式,字号,颜色,发送时间戳,弹幕池,发送者哈希,弹幕 ID
      const fields = (node.getAttribute('p') || '').split(',');
      results.push({
        second: parseFloat(fields[0]) || 0,
        ts: (parseInt(fields[4], 10) || 0) * 1000,
        hash: fields[6] || '',
        text,
      });
    }
    return results.sort((a, b) => a.second - b.second);
  },

  /** 秒数 → 12:34 或 01:02:03 */
  fmt(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const two = (n) => String(n).padStart(2, '0');
    const hours = Math.floor(total / 3600);
    const clock = `${two(Math.floor((total % 3600) / 60))}:${two(total % 60)}`;
    return hours ? `${two(hours)}:${clock}` : clock;
  },
};
