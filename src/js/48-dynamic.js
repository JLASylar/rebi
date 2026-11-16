// ════════════════════════════ 动态过滤 ════════════════════════════
// 在动态列表接口的返回里把不想看的条目拿掉，页面收到的就是过滤后的列表。
// 改的是之后发出的网络请求的结果，不是首屏的 __INITIAL_STATE__（那个不能碰，见 30-clean.js）。

defOpt('x.dyn.noForward', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏轉發') });
defOpt('x.dyn.noLive', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏直播通知') });
defOpt('x.dyn.noReserve', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏預約（直播 / 影片預約）') });
defOpt('x.dyn.noCharge', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏充電專屬') });
defOpt('x.dyn.noArticle', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏專欄') });
defOpt('x.dyn.words', '', {
  tab: 'feed',
  group: t('動態過濾'),
  type: 'text',
  keep: true,
  label: t('內容含有這些詞就隱藏'),
  hint: t('每行一個詞；也可以寫 /正則/。比對動態文字、影片標題和被轉發的內容。改動後往下捲載入的新動態開始生效'),
  placeholder: t('抽奖\n/互动抽奖|转发抽奖/'),
});

/** 一组常见的广告 / 带货用语，给「內容含有這些詞就隱藏」起个头 */
const DYNAMIC_AD_PRESET = [
  '恰饭',
  '金主爸爸',
  '优惠券',
  '领券',
  '满减',
  '到手价',
  '补贴价',
  '限时折扣',
  '专属福利',
  '旗舰店',
  '直播间下单',
  '团购价',
  '同款链接',
  '评论区置顶链接',
  '/(?:淘宝|天猫|京东|拼多多|抖音商城)(?:搜索?|下单|领券)/',
  '/[戳点]我?(?:领取|下单|购买|抢购)/',
  '/双\\s?(?:11|十一|12|十二)|6\\s?18(?:大促|活动|预售)?/',
];

ACTIONS.push({
  tab: 'feed',
  group: t('動態過濾'),
  label: t('加入常見的廣告用詞'),
  hint: t('把一組常見的帶貨、促銷用語加進上面的清單，補足只靠商品卡片認不出來的廣告動態；之後可以自己增刪'),
  button: t('加入'),
  run() {
    const current = linesOf(val('x.dyn.words'));
    const missing = DYNAMIC_AD_PRESET.filter((word) => !current.includes(word));
    if (!missing.length) return void toast(t('這些詞都已經在清單裡了'));
    store.set('x.dyn.words', [...current, ...missing].join('\n'));
    toast(t`已加入 ${missing.length} 個詞`, 'ok');
  },
});

/** 当前的过滤条件 */
const dynamicRules = () => ({
  forward: val('x.dyn.noForward'),
  live: val('x.dyn.noLive'),
  reserve: val('x.dyn.noReserve'),
  charge: val('x.dyn.noCharge'),
  article: val('x.dyn.noArticle'),
  words: parseWordList(val('x.dyn.words')),
});
const hasDynamicRules = (rules) =>
  !!(rules.forward || rules.live || rules.reserve || rules.charge || rules.article || rules.words.length);

/** 一条动态里所有能读的文字：正文、影片 / 图文 / 专栏的标题和简介、预约标题，以及被转发的那一条 */
const dynamicText = (item, depth = 0) => {
  if (!item || depth > 2) return '';
  const content = item.modules?.module_dynamic || {};
  const major = content.major || {};
  return [
    content.desc?.text,
    major.archive?.title,
    major.archive?.desc,
    major.opus?.title,
    major.opus?.summary?.text,
    major.article?.title,
    major.article?.desc,
    major.pgc?.title,
    major.common?.title,
    major.common?.desc,
    content.additional?.reserve?.title,
    dynamicText(item.orig, depth + 1),
  ]
    .filter(Boolean)
    .join('\n');
};

/** 这条动态该不该拿掉 */
const isUnwantedDynamic = (item, rules) => {
  const type = String(item?.type || '');
  const content = item?.modules?.module_dynamic || {};
  if (rules.forward && type === 'DYNAMIC_TYPE_FORWARD') return true;
  if (rules.live && type.startsWith('DYNAMIC_TYPE_LIVE')) return true;
  if (rules.article && type === 'DYNAMIC_TYPE_ARTICLE') return true;
  if (rules.reserve && content.additional?.type === 'ADDITIONAL_TYPE_RESERVE') return true;
  const fansOnly = item?.basic?.is_only_fans || content.major?.type === 'MAJOR_TYPE_BLOCKED' || content.major?.blocked;
  if (rules.charge && fansOnly) return true;
  if (!rules.words.length) return false;
  const text = dynamicText(item);
  return !!text && matchesAny(rules.words, text);
};

/**
 * 过滤动态列表接口的返回。
 * @param {string} body 接口返回的 JSON 文本
 * @returns {string|undefined} 过滤后的 JSON 文本；不需要改时返回 undefined
 */
const filterDynamics = (body) => {
  const rules = dynamicRules();
  if (!hasDynamicRules(rules)) return undefined;
  const response = JSON.parse(body);
  const items = response?.data?.items;
  if (!Array.isArray(items)) return undefined;

  const kept = items.filter((item) => {
    try {
      return !isUnwantedDynamic(item, rules);
    } catch {
      return true; // 判断出错就留着
    }
  });
  if (kept.length === items.length) return undefined;
  // 整页都被滤掉的话，页面会以为到底了、不再往下加载：至少留一条
  if (!kept.length) kept.push(items.at(-1));
  response.data.items = kept;
  return JSON.stringify(response);
};

function setupDynFilter() {
  if (!(PAGE.t || PAGE.space || PAGE.www)) return;
  const FEED_API = /\/x\/polymer\/web-dynamic\/v1\/feed\/(?:all|space)\b/;
  const wanted = (url) => FEED_API.test(url) && hasDynamicRules(dynamicRules());

  // B站有的页面用 fetch，有的用 XHR，两边都接
  hookFetch((url) => {
    if (!wanted(url)) return null;
    return {
      after: async (response) => {
        const filtered = filterDynamics(await response.clone().text());
        if (typeof filtered !== 'string') return response;
        return new W.Response(filtered, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      },
    };
  });
  hookXHR((url) => (wanted(url) ? { rewrite: filterDynamics } : null));
}
