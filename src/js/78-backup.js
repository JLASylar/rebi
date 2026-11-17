// ════════════════════════════ 设置的还原、导出、导入 ════════════════════════════
// 导出的是一个 JSON 文件：{ app, version, data: { 存储键: 值 } }。换浏览器、换电脑时用。

/** 选项登记表之外、也算「设置」的存储键 */
const EXTRA_SETTING_KEYS = ['x.keys', '小窗右', '小窗下', '小窗宽度', 'x.rate.value', 'biliUsers'];
const BACKUP_APP_ID = 'bilibili-great-again';
/** 1.9.0 导出的文件用的是旧标识，照样认 */
const BACKUP_APP_IDS = [BACKUP_APP_ID, 'wider-bilibili'];

const exportSettings = () => {
  const data = {};
  for (const key of [...Object.keys(OPTS), ...EXTRA_SETTING_KEYS]) {
    const value = store.get(key);
    if (value !== undefined) data[key] = value;
  }
  const json = JSON.stringify({ app: BACKUP_APP_ID, version: VERSION, data }, null, 2);
  saveBlob(
    new Blob([json], { type: 'application/json' }),
    `bilibili-settings-${new Date().toISOString().slice(0, 10)}`,
    'json',
  );
};

/** 读一个导出文件：文件里有的项目覆盖现有的，其余不动。返回导入了多少项 */
const importSettings = (text) => {
  const backup = JSON.parse(text);
  const valid = BACKUP_APP_IDS.includes(backup?.app) && backup.data && typeof backup.data === 'object';
  if (!valid) throw new Error(t('不是這個腳本匯出的設定檔'));
  const known = new Set([...Object.keys(OPTS), ...EXTRA_SETTING_KEYS]);
  let count = 0;
  for (const [key, value] of Object.entries(backup.data)) {
    if (!known.has(key)) continue;
    store.set(key, value);
    count += 1;
  }
  return count;
};

/** 让用户选一个文件，读成文本；没选（按了取消）就是 null */
const pickTextFile = (accept) =>
  new Promise((resolve) => {
    const input = h('input', { type: 'file', accept, style: 'display:none' });
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.remove();
      resolve(file ? await file.text() : null);
    });
    input.addEventListener('cancel', () => {
      input.remove();
      resolve(null);
    });
    (panel || document.body).appendChild(input);
    input.click();
  });

/** 还原要按两次：第一次只是「上膛」，5 秒内再按才执行 */
let resetArmedUntil = 0;
const resetArmed = () => Date.now() < resetArmedUntil;

ACTIONS.push({
  tab: 'general',
  group: t('設定面板'),
  label: t('還原全部預設值'),
  hint: () =>
    resetArmed() ? t('再按一次確認。備註不會被清除') : t('所有開關、數值、快捷鍵回到預設；屏蔽詞和備註保留'),
  button: () => (resetArmed() ? t('確認還原') : t('還原')),
  run() {
    if (!resetArmed()) {
      resetArmedUntil = Date.now() + 5000;
      return;
    }
    resetArmedUntil = 0;
    for (const option of Object.values(OPTS)) {
      if (!option.keep) store.del(option.key);
    }
    for (const key of ['小窗右', '小窗下', '小窗宽度', 'x.keys']) store.del(key);
    toast(t('已還原預設，重新整理後完全生效'), 'ok');
    markPanelDirty();
  },
});

ACTIONS.push({
  tab: 'general',
  group: t('設定面板'),
  label: t('匯出全部設定'),
  hint: t('所有開關、數值、快捷鍵、屏蔽詞和用戶備註存成一個 JSON 檔'),
  button: t('匯出'),
  run: exportSettings,
});

ACTIONS.push({
  tab: 'general',
  group: t('設定面板'),
  label: t('匯入設定'),
  hint: t('讀取「匯出全部設定」存的檔案，覆蓋檔案裡有的項目，其餘不動'),
  button: t('選擇檔案'),
  run() {
    // 不等选文件的结果：选文件的窗口开着时，这一行的按钮不该一直是停用状态
    pickTextFile('.json,application/json').then((text) => {
      if (text == null) return;
      try {
        toast(t`已匯入 ${importSettings(text)} 項設定，重新整理後完全生效`, 'ok');
        markPanelDirty();
      } catch (error) {
        toast(t`匯入失敗：${error.message || t('JSON 格式錯誤')}`, 'warn');
      }
    });
  },
});

// ── 诊断信息 ──
// 版面出问题而开发者看不到现场时用：把当时的页面状态整理成一段文字复制出来。
// 只有版面信息（记号、尺寸、样式、叠在一起的元素），不含 cookie、账号、设置里的屏蔽词和备注。
const describeElement = (element) => {
  const style = getComputedStyle(element);
  const box = element.getBoundingClientRect();
  return {
    el: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}.${String(element.className?.baseVal ?? element.className).slice(0, 60)}`,
    box: [box.x, box.y, box.width, box.height].map(Math.round).join(','),
    position: style.position,
    overflow: style.overflow,
    display: style.display,
    opacity: style.opacity,
    transform: style.transform,
    font: `${style.fontSize}/${style.lineHeight} ${style.fontFamily.slice(0, 40)}`,
    pointerEvents: style.pointerEvents,
    zIndex: style.zIndex,
  };
};

const collectDiagnostics = () => {
  const report = {
    version: VERSION,
    target: BUILD.target,
    agent: navigator.userAgent,
    page: location.host + location.pathname,
    viewport: [innerWidth, innerHeight, devicePixelRatio, Math.round(scrollY)].join(','),
    tokens: document.documentElement.getAttribute(TOKEN_ATTR),
    htmlClass: document.documentElement.className,
    visibility: document.visibilityState,
    styles: ownStyles.map((style) => `${style.dataset.bgaStyle}:${style.isConnected ? 1 : 0}`).join(' '),
    otherStyles: [...document.querySelectorAll('style:not([data-bga-style])')].length,
  };
  const search = document.querySelector('.nav-search-input');
  if (search) {
    const box = search.getBoundingClientRect();
    const chain = [];
    for (let element = search; element && chain.length < 7; element = element.parentElement) chain.push(describeElement(element));
    report.search = {
      placeholder: search.placeholder.length,
      value: search.value.length,
      chain,
      // 输入框中间偏上那一点从上到下叠着哪些元素（截断时多半是有东西盖在这里）
      stackUpper: document.elementsFromPoint(box.x + 40, box.y + 5).slice(0, 8).map(describeElement),
      stackLower: document.elementsFromPoint(box.x + 40, box.y + box.height - 4).slice(0, 4).map((element) => describeElement(element).el),
      children: [...(search.parentElement?.children || [])].map(describeElement),
    };
  }
  const player = document.querySelector('#bilibili-player .bpx-player-container');
  if (player) {
    const box = player.getBoundingClientRect();
    report.player = {
      container: describeElement(player),
      screen: player.dataset.screen,
      stackCenter: document.elementsFromPoint(box.x + box.width / 2, box.y + box.height * 0.4).slice(0, 6).map((element) => describeElement(element).el),
    };
  }
  const hero = document.getElementById('bga-hero');
  if (hero) report.hero = { ...describeElement(hero), paused: hero.hasAttribute('data-paused'), slides: hero.querySelectorAll('.bga-hero-dots button').length };
  return JSON.stringify(report);
};

ACTIONS.push({
  tab: 'general',
  group: t('設定面板'),
  label: t('複製診斷資訊'),
  hint: t('版面出問題時按一下，把複製到的文字貼給開發者。只有版面資訊，不含帳號和你的設定內容'),
  button: t('複製'),
  run() {
    toast(copyNow(collectDiagnostics()) ? t('診斷資訊已複製') : t('複製失敗'), 'ok');
  },
});

