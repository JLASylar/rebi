// ════════════════════════════ 平台层：用户脚本管理器（Tampermonkey 等） ════════════════════════════
// 其余代码只通过 platform 接触管理器的接口。扩展版换成 platform/extension.js，接口相同。

const platform = {
  /** 页面自己的 window：钩子要装在它上面，B站的全局变量也从它读 */
  page: typeof unsafeWindow === 'undefined' ? window : unsafeWindow,

  /** 设置何时可读。管理器的存储是同步的，一开始就绪 */
  ready: Promise.resolve(),

  storage: {
    get: (key) => GM_getValue(key),
    set: (key, value) => GM_setValue(key, value),
    remove: (key) => GM_deleteValue(key),
    /** 别的分页改了这一项时回调（本页自己改的不回调） */
    subscribe(key, onChange) {
      GM_addValueChangeListener(key, (_key, _oldValue, value, remote) => {
        if (remote) onChange(value);
      });
    },
  },

  /**
   * 跨域 GET（不受页面同源限制）：图床图片、弹幕文件。
   * @param {{url: string, responseType?: 'text'|'blob'}} options
   * @returns {Promise<{status: number, text?: string, blob?: Blob}>}
   */
  request({ url, responseType = 'text' }) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        responseType: responseType === 'blob' ? 'blob' : undefined,
        timeout: 30000,
        onload: (response) => {
          const result = { status: response.status };
          if (responseType === 'blob') result.blob = response.response;
          else result.text = response.responseText;
          resolve(result);
        },
        onerror: () => reject(new Error(`请求失败：${url}`)),
        ontimeout: () => reject(new Error(`请求超时：${url}`)),
      });
    });
  },

  /** 写剪贴板。只作兜底：用户手势里优先用页面自己的复制 */
  copy: (text) => GM_setClipboard(text, 'text'),

  /** 在管理器的菜单里加一项 */
  addMenu: (label, run) => GM_registerMenuCommand(label, run),
};

// 「个人空间 IP 属地」功能已取消（2.3.0）。它用过的 App 登录令牌留在存储里没有用处，清掉。
// 键名 aceess_key 是当初的拼写。
if (GM_getValue('aceess_key') !== undefined) GM_deleteValue('aceess_key');
