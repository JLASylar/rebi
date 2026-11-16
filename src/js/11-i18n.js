// ════════════════════════════ 语言 ════════════════════════════
// 源码里的界面文字都是繁体，写成 t('文字') 或 t`文字 ${变量}`；其他语言的译文在 src/i18n/<语言>.json，
// 键就是繁体原文（带变量的把变量写成 {0}、{1}…）。查不到译文就显示原文。
// 改语言要重新整理页面：各模块登记选项时就已经取了文字。

/** 语言选单的顺序；显示的名字是各语言自己的写法，不翻译 */
const LANGUAGES = [
  ['zh-Hans', '简体中文'],
  ['zh-Hant', '繁體中文'],
  ['yue', '粵語'],
  ['en', 'English'],
  ['ja', '日本語'],
];

/** 选「自動」时按浏览器的语言偏好挑；都对不上就用英文 */
const browserLanguage = () => {
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language || '']) {
    if (/^yue/i.test(tag)) return 'yue';
    if (/^zh-(?:TW|HK|MO|Hant)/i.test(tag)) return 'zh-Hant';
    if (/^zh/i.test(tag)) return 'zh-Hans';
    if (/^ja/i.test(tag)) return 'ja';
    if (/^en/i.test(tag)) return 'en';
  }
  return 'en';
};

const LANGUAGE = (() => {
  let chosen;
  try {
    chosen = platform.storage.get('x.lang');
  } catch {
    // 读不了设置就按浏览器的语言
  }
  return LANGUAGES.some(([id]) => id === chosen) ? chosen : browserLanguage();
})();
const DICTIONARY = I18N[LANGUAGE] || {};

/**
 * 取当前语言的文字。两种写法：
 *   t('已加入稍後再看')            固定文字
 *   t`已加入 ${count} 個詞`        带变量；译文里用 {0}、{1} 标变量的位置，顺序可以调
 *   t('[按鈕]播放')               同一个词在别的语言里要分开译时，前面加 [说明]；显示原文时会去掉
 */
const t = (text, ...values) => {
  const key = Array.isArray(text) ? text.reduce((whole, part, index) => `${whole}{${index - 1}}${part}`) : text;
  const translated = DICTIONARY[key] ?? key.replace(/^\[[^\]]*\]/, '');
  return values.length ? translated.replace(/\{(\d+)\}/g, (_, index) => String(values[index])) : translated;
};

/** 显示用的产品名：中文界面带中文名 */
const PRODUCT = /^(?:en|ja)$/.test(LANGUAGE) ? BUILD.name : `${BUILD.name} ${t('比利重啟')}`;

/** 大数字的简写（1.2萬 / 12K），写法跟着界面语言 */
const COMPACT_NUMBER = new Intl.NumberFormat({ yue: 'zh-Hant' }[LANGUAGE] || LANGUAGE, {
  notation: 'compact',
  maximumFractionDigits: 1,
});
