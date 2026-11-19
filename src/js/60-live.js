// ════════════════════════════ 直播 ════════════════════════════
// 界面净化（样式在 src/css/live.css）、直播流地址、弹幕发送结果检查。

defOpt('x.live.noMcdn', true, { tab: 'live', group: t('畫質'), label: t('直播停用 P2P / 第三方 CDN'), reload: true });
defOpt('x.live.forceHighest', false, {
  tab: 'live',
  group: t('畫質'),
  label: t('強制最高畫質（真・原畫）'),
  hint: t('連續載入失敗時會自動退回播放器選擇的畫質'),
  reload: true,
});
defOpt('x.live.noGiftFull', true, {
  tab: 'live',
  group: t('介面'),
  label: t('網頁全屏 / 全屏時隱藏禮物欄'),
  hint: t('滑鼠移到畫面底部時不再彈出禮物列'),
});
defOpt('x.live.noGift', false, {
  tab: 'live',
  group: t('介面'),
  label: t('平時也隱藏禮物欄'),
  hint: t('播放器下方整條禮物 / 包裹列'),
});
defOpt('x.live.noRank', true, {
  tab: 'live',
  group: t('介面'),
  label: t('隱藏榜單'),
  hint: t('聊天區上方的高能榜 / 大航海、標題列的人氣榜、禮物星球等入口'),
});
defOpt('x.live.noAds', true, {
  tab: 'live',
  group: t('介面'),
  label: t('隱藏直播區廣告與活動'),
  hint: t('播放器下方的活動輪播、分區頁橫幅、小橙車、活動入口、播放器內的活動浮層'),
});
defOpt('x.live.cleanUI', true, {
  tab: 'live',
  group: t('介面'),
  label: t('隱藏直播間雜項'),
  hint: t('進場歡迎條、播放器角標'),
});
defOpt('x.live.noSidebar', true, {
  tab: 'live',
  group: t('介面'),
  label: t('隱藏直播間右側的浮動按鈕'),
  hint: t('貼在視窗右邊的「實驗室」「關注」那一條'),
});
defOpt('x.live.fill', true, {
  tab: 'live',
  group: t('版面'),
  label: t('直播畫面鋪滿頁面'),
  hint: t('去掉左右留白：畫面佔滿聊天欄以外的寬度和導航欄以下的高度，主播資訊浮在畫面上（滑鼠移到畫面才顯示），禮物欄往下捲才看得到。不是網頁全螢幕，頁面照常捲動'),
});
defOpt('x.live.sendCheck', true, {
  tab: 'live',
  group: t('彈幕'),
  label: t('檢查彈幕是否真的發出'),
  hint: t('B站對被攔截的彈幕也回報「成功」；這裡會提示是系統攔截還是主播屏蔽詞'),
  reload: true,
});
defOpt('autoCopy', true, {
  tab: 'live',
  group: t('彈幕'),
  label: t('被攔截時自動複製內容'),
  hint: t('方便修改後重發'),
});
defOpt('x.live.sendOkToast', false, { tab: 'live', group: t('彈幕'), label: t('發送成功也提示') });

// ── 直播流地址 ──
/** P2P 边缘节点，形如 xy1x2x3x4xy.mcdn.bilivideo.cn:4483 */
const LIVE_P2P_NODE = /[xy0-9]+\.mcdn\.bilivideo\.cn:\d+/;
/** 第三方 CDN 在真正的地址前面套了一段：….smtcdns.net/<主机>.bilivideo.com/… */
const LIVE_PROXY_PREFIX = /[\w.]+\.smtcdns\.net\/(?=[\w-]+\.bilivideo\.com\/)/;
/** 画质写在流名的后缀里：live_<主播>_<流号>_1500、_bluray、_prohevc…；去掉后缀就是源流 */
const LIVE_QUALITY_SUFFIX = /(live-bvc\/\d+\/live_\d+_\d+)_\w+/;
const LIVE_HEVC_SUFFIX = /(\d+)_(?:mini|pro)hevc/g;

const toSourceStream = (url) => {
  if (!LIVE_QUALITY_SUFFIX.test(url)) return url;
  return url.replace(LIVE_QUALITY_SUFFIX, '$1').replace(LIVE_HEVC_SUFFIX, '$1');
};

function tuneLiveStream() {
  const avoidP2P = val('x.live.noMcdn');
  let forceSource = val('x.live.forceHighest');
  if (!avoidP2P && !forceSource) return;

  // 源流不是每个直播间都有：短时间内连着失败 5 次，就退回播放器自己选的画质
  let failures = 0;
  setInterval(() => {
    failures = Math.floor(failures / 2);
  }, 10000);
  const noteFailure = () => {
    failures += 1;
    if (failures < 5 || !forceSource) return;
    failures = 0;
    forceSource = false;
    toast(t('最高畫質不可用，已退回播放器選擇的畫質'), 'warn');
  };

  hookFetch((url) => {
    if (avoidP2P && LIVE_P2P_NODE.test(url)) return { block: 'reject' };
    let target = url;
    if (avoidP2P) target = target.replace(LIVE_PROXY_PREFIX, '');
    if (forceSource) target = toSourceStream(target);
    const isSegment = /\.(?:m3u8|m4s)/.test(url);
    return {
      url: target === url ? undefined : target,
      after:
        forceSource && isSegment
          ? (response) => {
              if (response.status === 403 || response.status === 404) noteFailure();
            }
          : undefined,
    };
  });
}

// ── 弹幕发送结果 ──
/** 发弹幕的接口对被拦下的弹幕也回报成功，只在 msg 里留一个字母 */
const BLOCKED_REASONS = {
  f: t('系統攔截（全站敏感詞）'),
  k: t('主播 / 房管屏蔽詞'),
};

/** 从发送接口的返回里取出刚才发的那句话 */
const sentDanmakuText = (result) => {
  try {
    return JSON.parse(result?.data?.mode_info?.extra || '{}').content || '';
  } catch {
    return '';
  }
};

function checkDanmakuSend() {
  const SEND_API = 'api.live.bilibili.com/msg/send';
  hookFetch((url) => {
    if (!url.includes(SEND_API)) return null;
    return {
      after: async (response) => {
        const result = await response.clone().json();
        if (result.code !== 0) {
          toast(t`彈幕發送失敗：${result.message || result.msg || result.code}`, 'warn');
          return response;
        }
        const reason = BLOCKED_REASONS[result.msg];
        if (!reason) {
          if (val('x.live.sendOkToast')) toast(t('彈幕已發出'), 'ok', 1800);
          return response;
        }
        const text = sentDanmakuText(result);
        const copied = val('autoCopy') && text && copyNow(text);
        toast(t`彈幕沒有發出：${reason}${copied ? t(' · 內容已複製') : ''}`, 'warn', 4500);
        // 让页面也知道没发出去：把这次响应改成失败
        const failed = { ...result, code: -101, message: reason };
        return new W.Response(JSON.stringify(failed), { status: response.status, headers: response.headers });
      },
    };
  });
}

function setupLive() {
  if (!PAGE.live) return;
  reflect('x.live.cleanUI', 'live-clean');
  reflect('x.live.noSidebar', 'live-no-sidebar');
  reflect('x.live.fill', 'live-fill');
  reflect('x.live.noRank', 'live-no-rank');
  reflect('x.live.noAds', 'live-no-ads');
  reflect('x.live.noGift', 'live-no-gift');
  reflect('x.live.noGiftFull', 'live-no-gift-full');
  tuneLiveStream();
  if (val('x.live.sendCheck')) checkDanmakuSend();
}
