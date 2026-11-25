// ════════════════════════════ Re:Bi 导航栏 ════════════════════════════
// 整条导航栏是脚本自己的节点（.bga-nav），B站原来那条用样式藏起来。版面和动画在 src/css/nav.css。
//
// 为什么不再改造 B站的导航栏（2026-11-19 之前的做法）：主站、首页、直播页是三套不同的结构；下拉面板由 B站自己定位，
// 我们一改版面它就跑位；页面先给一条占位导航栏、随后才挂上正式的，样式要等正式的出来才对得上，所以会闪一下。
// 自己画一条，全站一个规格，位置和面板都由我们说了算；记号在 document-start 就挂上，原版从第一帧起就不显示。
//
// 节点放在哪：<body> 的第一个子节点。<body> 本身不归 B站的任何应用管（它们各自挂在 body 里面的容器上），
// 不会碰到「往挂载点里加节点、整条导航栏变空」的问题。
//   · 一般页面：fixed 在视窗顶部，盖在原导航栏留出的那 64px 上；
//   · 播放页（舞台版面）：留在文档流里，接替 #biliMainHeader 原来的位置（在播放器下面 / 上面、吸顶），见 nav.css。
//
// 不拖慢页面（打开网页、影片、直播的速度不能因为这条导航栏变差）：
//   · 导航栏本身只是一小段节点，建好就挂，不等任何请求；
//   · 账号信息用上次存下来的先画出来，真正的请求等页面载入完、浏览器闲下来再发，一分钟内不重复要；
//   · 关注 / 粉丝数、预览面板、搜索建议都是用到才要。
// 数据都来自 B站自己的接口（只读的 GET，带登录态），存下来的只有昵称、头像、等级这些，留在本机。

defOpt('x.nav.card', true, {
  tab: 'general',
  group: t('導航欄'),
  label: t('使用 Re:Bi 的導航欄'),
  hint: t('整條導航欄換成同一套方磚，每個頁面都一樣；個人卡片從頭像打開。關閉後回到原本的導航欄'),
  reload: true,
});
defOpt('x.nav.peek', true, {
  tab: 'general',
  group: t('導航欄'),
  label: t('滑過入口時顯示預覽'),
  hint: t('滑鼠停在消息、動態、收藏、歷史上，直接看到最近的內容'),
});
/** 右边可以个别关掉的入口：选项键的后半 → [界面上的名字, 图示, 地址] */
const NAV_ENTRIES = [
  ['message', t('消息'), 'mail', 'https://message.bilibili.com/'],
  ['dynamic', t('動態'), 'windmill', 'https://t.bilibili.com/'],
  ['fav', t('收藏'), 'star', ''],
  ['history', t('歷史'), 'clock', 'https://www.bilibili.com/history'],
];
for (const [name, label] of NAV_ENTRIES) {
  defOpt(`x.nav.${name}`, true, { tab: 'general', group: t('導航欄右側的入口'), label });
}

/** 图示：Tabler Icons（MIT 许可）的线条图，24 格 */
const NAV_ICONS = {
  home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="M21 21l-6 -6"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  chevron: '<path d="M15 6l-6 6l6 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6l9 -6"/>',
  windmill:
    '<path d="M12 12c2.76 0 5 -2.01 5 -4.5s-2.24 -4.5 -5 -4.5v9z"/><path d="M12 12c0 2.76 2.01 5 4.5 5s4.5 -2.24 4.5 -5h-9z"/><path d="M12 12c-2.76 0 -5 2.01 -5 4.5s2.24 4.5 5 4.5v-9z"/><path d="M12 12c0 -2.76 -2.01 -5 -4.5 -5s-4.5 2.24 -4.5 5h9z"/>',
  logout:
    '<path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M9 12h12l-3 -3"/><path d="M18 15l3 -3"/>',
  star: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
  video:
    '<path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z"/><rect x="3" y="6" width="12" height="12" rx="2"/>',
  bookmark: '<path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z"/>',
  crown: '<path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"/>',
  shield: '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>',
  moon: '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>',
  flame: '<path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z"/>',
};
const navIcon = (name) =>
  svgIcon(
    `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${NAV_ICONS[name]}</g>`,
    24,
  );

function setupNavCard() {
  // 只在有 B站导航栏可替换的站点上出现：这些页面本来就给导航栏留了位置
  const supported = PAGE.www || PAGE.search || PAGE.t || PAGE.space || PAGE.live;
  if (!supported || !val('x.nav.card')) return;
  flag('nav-own', true);

  const SPACE = 'https://space.bilibili.com/';
  const CALM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
  /** B站图床的图片，裁成 width × height；别的来源一律不要 */
  const picture = (address, width, height = width) => {
    const secure = String(address || '').replace(/^(https?:)?\/\//, 'https://');
    return /^https:\/\/[\w.-]+\.hdslb\.com\/[\w./-]+$/.test(secure) ? `${secure}@${width}w_${height}h_1c.webp` : '';
  };
  /** 只收 B站自己的链接 */
  const safeLink = (address, fallback) => {
    const full = String(address || '').replace(/^\/\//, 'https://');
    return /^https:\/\/[\w.-]+\.bilibili\.com\//.test(full) ? full : fallback;
  };
  /** 页面载入完、浏览器闲下来再做；有的页面 load 事件来得很晚，最多等 4 秒 */
  const whenIdle = (run) => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 3000 });
      else setTimeout(run, 600);
    };
    if (document.readyState === 'complete') return void start();
    window.addEventListener('load', start, { once: true });
    setTimeout(start, 4000);
  };
  const fresh = new Map();
  /** 同一份数据 ttl 毫秒内只要一次 */
  const cached = (key, ttl, load) => {
    const hit = fresh.get(key);
    if (hit && Date.now() - hit.time < ttl) return hit.promise;
    const promise = load().catch((error) => {
      fresh.delete(key);
      throw error;
    });
    fresh.set(key, { time: Date.now(), promise });
    return promise;
  };
  const api = async (url) => {
    const result = await dm.getJSON(url);
    if (result?.code !== 0) throw new Error(result?.message || `code ${result?.code}`);
    return result.data ?? result.result;
  };

  /** 当前页面属于哪个入口（高亮用） */
  const section = PAGE.live ? 'live' : PAGE.home ? 'home' : /^\/(anime|bangumi)\b/.test(PATH) ? 'anime' : '';

  // ── 左：回首页、常用入口、更多、收起 ──
  const tileLink = (id, label, href, icon) =>
    h(
      'a',
      { class: `bga-nav-t${icon ? ' bga-nav-i' : ''}${section === id ? ' bga-on' : ''}`, href, title: icon ? label : null },
      icon ? navIcon(icon) : label,
    );
  const home = tileLink('home', t('首頁'), 'https://www.bilibili.com/', 'home');
  const leftLinks = h(
    'div',
    { class: 'bga-nav-fold' },
    tileLink('anime', t('番劇'), 'https://www.bilibili.com/anime/'),
    tileLink('live', t('直播'), 'https://live.bilibili.com/'),
  );
  const MORE_LINKS = [
    [t('熱門'), 'https://www.bilibili.com/v/popular/all'],
    [t('排行榜'), 'https://www.bilibili.com/v/popular/rank/all'],
    [t('遊戲中心'), 'https://game.bilibili.com/platform/'],
    [t('會員購'), 'https://show.bilibili.com/platform/home.html'],
    [t('漫畫'), 'https://manga.bilibili.com/'],
    [t('賽事'), 'https://www.bilibili.com/match/home/'],
    [t('課堂'), 'https://www.bilibili.com/cheese/'],
  ];
  const menu = h(
    'div',
    { class: 'bga-nav-pop bga-nav-menu', role: 'menu', hidden: true },
    MORE_LINKS.map(([label, href]) =>
      h('a', { class: 'bga-nav-row', role: 'menuitem', href, target: '_blank', rel: 'noopener' }, label),
    ),
  );
  const more = h(
    'button',
    { type: 'button', class: 'bga-nav-t bga-nav-i', title: t('更多'), 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
    navIcon('dots'),
  );
  leftLinks.append(more);
  const foldLeft = h('button', { type: 'button', class: 'bga-nav-arrow' }, navIcon('chevron'));
  const leftTile = h('div', { class: 'bga-nav-tile bga-nav-left' }, home, leftLinks, foldLeft);

  // ── 中：搜索（建议 / 热搜面板在下面「搜索建议」一段）──
  const input = h('input', {
    class: 'bga-nav-input',
    type: 'search',
    name: 'keyword',
    autocomplete: 'off',
    maxlength: '100',
    placeholder: t('搜尋影片、UP 主'),
    'aria-label': t('搜尋'),
  });
  if (PAGE.search) input.value = new URLSearchParams(location.search).get('keyword') || '';
  const suggest = h('div', { class: 'bga-nav-pop bga-nav-suggest', role: 'listbox', hidden: true });
  const searchForm = h(
    'form',
    { class: 'bga-nav-tile bga-nav-search', role: 'search' },
    input,
    h('button', { type: 'submit', class: 'bga-nav-t bga-nav-i', title: t('搜尋') }, navIcon('search')),
    suggest,
  );
  const search = (keyword) => {
    const words = String(keyword || '').trim();
    if (!words) return void input.focus();
    const target = `https://search.bilibili.com/all?keyword=${encodeURIComponent(words)}`;
    // 搜索页上直接换关键词；其他页面和 B站原来一样开新分页
    if (PAGE.search) location.assign(target);
    else window.open(target, '_blank', 'noopener');
    suggest.hidden = true;
  };

  // ── 右：收起、入口、头像 ──
  const entryLinks = {};
  const rightLinks = h('div', { class: 'bga-nav-fold' });
  for (const [name, label, icon, href] of NAV_ENTRIES) {
    // 动态只标「有新的」，不标数字
    const badge = h('b', { class: `bga-nav-badge${name === 'dynamic' ? ' bga-nav-dot' : ''}`, hidden: true });
    const link = h(
      'a',
      { class: 'bga-nav-t bga-nav-i', href: href || SPACE, 'aria-label': label, target: '_blank', rel: 'noopener' },
      navIcon(icon),
      badge,
    );
    entryLinks[name] = { link, badge };
    rightLinks.append(link);
    watch(`x.nav.${name}`, (on) => (link.hidden = !on));
  }
  const face = h('img', { class: 'bga-nav-face', alt: '', decoding: 'async', hidden: true });
  const avatar = h(
    'button',
    { type: 'button', class: 'bga-nav-t bga-nav-i bga-nav-me', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
    face,
    h('span', { class: 'bga-nav-login' }, t('登入')),
    h('b', { class: 'bga-nav-badge bga-nav-dot', hidden: true }),
  );
  const foldRight = h('button', { type: 'button', class: 'bga-nav-arrow' }, navIcon('chevron'));
  const rightTile = h('div', { class: 'bga-nav-tile bga-nav-right' }, foldRight, rightLinks, avatar);

  // ── 浮层：更多、个人卡片、入口预览 ──
  const card = h('div', { class: 'bga-nav-pop bga-nav-card', role: 'dialog', 'aria-label': t('個人卡片'), hidden: true });
  const peek = h('div', { class: 'bga-nav-pop bga-nav-peek', hidden: true });

  const bar = h('nav', { class: 'bga-nav', 'aria-label': t('導航欄') }, leftTile, searchForm, rightTile, menu, card, peek);

  // ── 收起 / 展开（会记住，各页共用）──
  const FOLDS = [
    { key: 'x.nav.leftClosed', button: foldLeft, tile: leftTile },
    { key: 'x.nav.rightClosed', button: foldRight, tile: rightTile },
  ];
  for (const fold of FOLDS) {
    const apply = (closed) => {
      fold.tile.classList.toggle('bga-closed', !!closed);
      fold.button.title = closed ? t('展開') : t('收起');
      fold.button.setAttribute('aria-expanded', String(!closed));
    };
    apply(store.get(fold.key));
    store.on(fold.key, apply);
    fold.button.addEventListener('click', () => {
      closePops();
      store.set(fold.key, !store.get(fold.key));
    });
  }

  // ── 点开的浮层：更多、个人卡片（同时只开一个）──
  const POPS = [
    { pop: menu, trigger: more },
    { pop: card, trigger: avatar },
  ];
  const setPop = (target, open) => {
    for (const { pop, trigger } of POPS) {
      const show = pop === target && open;
      pop.hidden = !show;
      trigger.setAttribute('aria-expanded', String(show));
    }
    if (open) {
      closePeek();
      suggest.hidden = true;
      syncDirection();
    }
  };
  const closePops = () => setPop(null, false);
  more.addEventListener('click', (event) => {
    event.stopPropagation();
    setPop(menu, menu.hidden);
  });
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !menu.contains(event.target)) closePops();
    else if (!card.hidden && !card.contains(event.target) && !avatar.contains(event.target)) closePops();
    if (!searchForm.contains(event.target)) suggest.hidden = true;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closePops();
    closePeek();
  });

  // ── 账号 ──
  const ACCOUNT_KEY = 'x.nav.account';
  const ACCOUNT_TTL = 60000;
  let account = null;
  const unread = { message: 0, dynamic: 0, parts: null };
  const setBadge = (badge, count) => {
    badge.hidden = !count;
    badge.textContent = badge.classList.contains('bga-nav-dot') ? '' : count > 99 ? '99+' : String(count || '');
  };

  /** 数字从 0 数上去（系统开了「减少动态效果」就直接到位） */
  const countUp = (node, value) => {
    const show = (current) => (node.textContent = COMPACT_NUMBER.format(current));
    if (CALM.matches || value < 2) return void show(value);
    const begin = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - begin) / 650);
      show(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1 && node.isConnected) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ── 深浅色 ──
  // B站自己的做法（看它导航栏脚本得知，2026-11-19 登录后实测）：主题记在 cookie theme_style（light / dark，
  // 域 .bilibili.com，一年），只有登录时才认；页面按它载入对应的样式表。这里写同一个 cookie 再重新载入。
  const isDark = () => /(?:^|;\s*)theme_style=dark(?:;|$)/.test(document.cookie);
  const switchTheme = () => {
    document.cookie = `theme_style=${isDark() ? 'light' : 'dark'}; domain=.bilibili.com; path=/; max-age=31536000`;
    location.reload();
  };
  const themeButton = () => {
    const dark = isDark();
    return h(
      'button',
      { type: 'button', class: 'bga-nav-act', onclick: switchTheme, title: t('切換後會重新載入頁面') },
      navIcon(dark ? 'moon' : 'sun'),
      dark ? t('深色') : t('淺色'),
    );
  };
  // ── 登出 ──
  // 和 B站自己的「退出登录」走同一个地址：带上防伪令牌（cookie bili_jct）用表单提交，整页跳转过去再回到当前页面。
  // 要点两下：第一下只是把按钮变成「再按一次確認」，三秒内没按第二下就恢复。
  const logoutButton = () => {
    const label = h('span', {}, t('登出'));
    let armed = 0;
    const button = h('button', { type: 'button', class: 'bga-nav-act' }, navIcon('logout'), label);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!armed) {
        button.classList.add('bga-hot');
        label.textContent = t('再按一次確認');
        armed = setTimeout(() => {
          armed = 0;
          button.classList.remove('bga-hot');
          label.textContent = t('登出');
        }, 3000);
        return;
      }
      clearTimeout(armed);
      const token = document.cookie.match(/(?:^|;\s*)bili_jct=([0-9a-f]+)/)?.[1] || '';
      store.del(ACCOUNT_KEY);
      const form = h(
        'form',
        { method: 'post', action: 'https://passport.bilibili.com/login/exit/v2', hidden: true },
        h('input', { type: 'hidden', name: 'biliCSRF', value: token }),
        h('input', { type: 'hidden', name: 'gourl', value: location.href }),
      );
      document.body.append(form);
      form.submit();
    });
    return button;
  };

  const cardRow = (icon, label, href, note, hot) =>
    h(
      'a',
      { class: 'bga-nav-row', href, target: '_blank', rel: 'noopener' },
      navIcon(icon),
      h('span', { class: 'bga-nav-label' }, label),
      note ? h('span', { class: `bga-nav-note${hot ? ' bga-hot' : ''}` }, note) : null,
    );
  const renderCard = () => {
    if (!account || card.hidden) return;
    const { name, mid, level, exp, next, coins, bcoin, vip, stat } = account;
    const space = `${SPACE}${mid}`;
    const full = !Number.isFinite(next) || next <= exp;
    // 「歷史」那一行右边：稍后再看有几部（点这几个字去稍后再看）
    const later = Number.isFinite(account.later)
      ? h(
          'a',
          { href: 'https://www.bilibili.com/watchlater/', target: '_blank', rel: 'noopener', onclick: (event) => event.stopPropagation() },
          t`稍後再看 ${account.later}`,
        )
      : '';
    const figure = (value, label, href) => {
      const figureNode = h('b', {}, '–');
      if (stat) countUp(figureNode, value);
      return h('a', { class: 'bga-nav-stat', href, target: '_blank', rel: 'noopener' }, figureNode, h('span', {}, label));
    };
    card.replaceChildren(
      h(
        'div',
        { class: 'bga-nav-head' },
        h(
          'a',
          { class: 'bga-nav-id', href: space, target: '_blank', rel: 'noopener' },
          h('img', { class: 'bga-nav-face', alt: '', src: picture(account.face, 128) || null }),
          h(
            'span',
            { class: 'bga-nav-who' },
            h('b', {}, name),
            h('span', {}, [`LV${level}`, vip, t`硬幣 ${coins}`, t`B幣 ${bcoin}`].filter(Boolean).join(' · ')),
          ),
        ),
        // 我们自己的图示：点了开 Re:Bi 的设置
        h('button', {
          type: 'button',
          class: 'bga-nav-duo',
          title: t`${PRODUCT} 設定`,
          'aria-label': t`${PRODUCT} 設定`,
          onclick: (event) => {
            event.stopPropagation();
            closePops();
            // 等这一下点击走完再开：面板是点外面就收起的那种
            setTimeout(() => panelToggle?.(), 0);
          },
        }),
      ),
      h(
        'div',
        { class: 'bga-nav-level' },
        h('span', { class: 'bga-nav-track' }, h('i', { style: `width:${full ? 100 : Math.round((exp / next) * 100)}%` })),
        h('span', {}, full ? t('已滿級') : t`距 LV${level + 1} 還差 ${next - exp}`),
      ),
      h(
        'div',
        { class: 'bga-nav-stats' },
        figure(stat?.following, t('關注'), `${space}/fans/follow`),
        figure(stat?.follower, t('粉絲'), `${space}/fans/fans`),
        figure(stat?.dynamic, t('動態'), `${space}/dynamic`),
      ),
      h(
        'div',
        { class: 'bga-nav-list' },
        cardRow('user', t('個人空間'), space),
        cardRow('mail', t('消息'), 'https://message.bilibili.com/', unread.message ? t`${unread.message} 則未讀` : '', true),
        cardRow('windmill', t('動態'), 'https://t.bilibili.com/', unread.dynamic ? t('有更新') : '', true),
        cardRow('star', t('收藏'), `${space}/favlist`),
        cardRow('clock', t('歷史'), 'https://www.bilibili.com/history', later),
        cardRow('video', t('投稿管理'), 'https://member.bilibili.com/platform/upload-manager/article'),
      ),
      h('div', { class: 'bga-nav-foot' }, themeButton(), logoutButton()),
    );
  };
  const renderBar = () => {
    const source = account && picture(account.face, 96);
    if (source && face.getAttribute('src') !== source) face.src = source;
    face.hidden = !source;
    avatar.classList.toggle('bga-in', !!account);
    avatar.title = account ? account.name : t('登入');
    if (account) entryLinks.fav.link.href = `${SPACE}${account.mid}/favlist`;
    setBadge(entryLinks.message.badge, account ? unread.message : 0);
    setBadge(entryLinks.dynamic.badge, account && unread.dynamic ? 1 : 0);
    // 右边收起时入口看不到：有未读就在头像上点一下
    setBadge(avatar.querySelector('.bga-nav-dot'), account && (unread.message || unread.dynamic) ? 1 : 0);
  };
  /** 关注 / 粉丝 / 动态数：打开卡片时才要 */
  const loadStat = async () => {
    if (!account || account.stat) return;
    const stat = await cached('stat', 60000, () => api('https://api.bilibili.com/x/web-interface/nav/stat'));
    if (!account) return;
    account.stat = { following: number(stat?.following), follower: number(stat?.follower), dynamic: number(stat?.dynamic_count) };
    renderCard();
  };
  /** 稍后再看有几部：也是打开卡片时才要 */
  const loadLater = async () => {
    if (!account || Number.isFinite(account.later)) return;
    const list = await cached('later', 60000, () => api('https://api.bilibili.com/x/v2/history/toview'));
    if (!account) return;
    account.later = number(list?.count);
    renderCard();
  };
  avatar.addEventListener('click', async (event) => {
    event.stopPropagation();
    // 还不知道有没有登录（第一次来、请求还排着队）：现在就问，问清楚了才决定是开卡片还是去登录
    if (!account && !settled) await loadAccount().catch((error) => warn('导航栏：账号信息', error));
    // 只有 B站明确说「没登录」才带去登录页；请求失败（断网、被风控）就什么都不做，免得把已登录的人送去登录
    if (!account && !settled) return;
    if (!account) return void location.assign(`https://passport.bilibili.com/login?gourl=${encodeURIComponent(location.href)}`);
    setPop(card, card.hidden);
    if (card.hidden) return;
    renderCard();
    loadStat().catch((error) => warn('导航栏：关注数', error));
    loadLater().catch((error) => warn('导航栏：稍后再看', error));
  });

  /** 已经向 B站问过登录状态了（问之前不显示「登入」，免得已登录的人看到它闪一下） */
  let settled = false;
  /** 同时只发一个登录状态的请求（点头像和排队的那次可能撞在一起） */
  let asking = null;
  const loadAccount = () => (asking ||= askAccount().finally(() => (asking = null)));
  const askAccount = async () => {
    const reply = await dm.getJSON('https://api.bilibili.com/x/web-interface/nav');
    const info = reply?.data;
    // 0 = 已登录，-101 = 没登录；别的（-352 风控之类）都当作「没问到」
    if (reply?.code !== 0 && reply?.code !== -101) throw new Error(`nav code ${reply?.code}`);
    settled = true;
    avatar.classList.add('bga-known');
    if (!info?.isLogin) {
      account = null;
      store.del(ACCOUNT_KEY);
      return void renderBar();
    }
    account = {
      name: String(info.uname || ''),
      mid: number(info.mid),
      face: info.face,
      level: number(info.level_info?.current_level),
      exp: number(info.level_info?.current_exp),
      next: Number(info.level_info?.next_exp),
      coins: number(info.money),
      bcoin: number(info.wallet?.bcoin_balance),
      vip: info.vipStatus ? String(info.vip_label?.text || '') : '',
      stat: account?.stat || null,
    };
    store.set(ACCOUNT_KEY, { time: Date.now(), data: { ...account, stat: null } });
    renderBar();
    renderCard();
  };
  const loadUnread = async () => {
    if (!account || document.hidden) return;
    const counts = await Promise.allSettled([
      dm.getJSON('https://api.bilibili.com/x/msgfeed/unread'),
      dm.getJSON('https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread'),
      dm.getJSON('https://api.bilibili.com/x/web-interface/dynamic/entrance'),
    ]);
    const [feed, chat, entrance] = counts.map((result) => (result.status === 'fulfilled' ? result.value?.data : null));
    unread.parts = {
      reply: number(feed?.reply),
      at: number(feed?.at),
      like: number(feed?.like),
      system: number(feed?.sys_msg),
      chat: number(chat?.follow_unread) + number(chat?.unfollow_unread),
    };
    unread.message = Object.values(unread.parts).reduce((sum, count) => sum + count, 0) + number(feed?.up);
    unread.dynamic = number(entrance?.update_info?.item?.count);
    renderBar();
    renderCard();
  };
  // 先用上次存下来的画出头像；真正的请求等页面闲下来再发，一分钟内不重复
  const remembered = store.get(ACCOUNT_KEY);
  if (remembered?.data?.mid) {
    account = { ...remembered.data, stat: null };
    renderBar();
  }
  whenIdle(() => {
    const recent = remembered?.data?.mid && Date.now() - number(remembered.time) < ACCOUNT_TTL;
    Promise.resolve(recent ? null : loadAccount())
      .then(loadUnread)
      .catch((error) => warn('导航栏：账号信息', error));
  });
  setInterval(() => loadUnread().catch(() => {}), 120000);

  // ── 入口预览：滑鼠停在消息 / 动态 / 收藏 / 历史上 ──
  const mediaRow = ({ href, cover, title, note }) =>
    h(
      'a',
      { class: 'bga-nav-media', href, target: '_blank', rel: 'noopener', title },
      h('img', { class: 'bga-nav-cover', alt: '', loading: 'lazy', decoding: 'async', src: picture(cover, 192, 120) || null }),
      h('span', { class: 'bga-nav-text' }, h('b', {}, title), h('span', {}, note)),
    );
  const clock = (seconds) => {
    const total = Math.max(0, Math.round(number(seconds)));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };
  const video = (bvid) => `https://www.bilibili.com/video/${encodeURIComponent(bvid)}/`;
  const PEEKS = {
    message: {
      title: t('消息'),
      more: 'https://message.bilibili.com/',
      async rows() {
        const parts = unread.parts || {};
        return [
          [t('回覆我的'), 'reply', 'https://message.bilibili.com/#/reply'],
          [t('@ 我的'), 'at', 'https://message.bilibili.com/#/at'],
          [t('收到的讚'), 'like', 'https://message.bilibili.com/#/love'],
          [t('系統通知'), 'system', 'https://message.bilibili.com/#/system'],
          [t('我的訊息'), 'chat', 'https://message.bilibili.com/#/whisper'],
        ].map(([label, key, href]) => cardRow('mail', label, href, parts[key] ? String(parts[key]) : '', true));
      },
    },
    dynamic: {
      title: t('動態'),
      more: 'https://t.bilibili.com/',
      async rows() {
        const feed = await cached('dynamic', 60000, () =>
          api('https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?type=video&page=1'),
        );
        return (feed?.items || []).slice(0, 8).flatMap((item) => {
          const archive = item?.modules?.module_dynamic?.major?.archive;
          const author = item?.modules?.module_author;
          if (!archive?.title) return [];
          return mediaRow({
            href: safeLink(archive.jump_url, archive.bvid ? video(archive.bvid) : 'https://t.bilibili.com/'),
            cover: archive.cover,
            title: String(archive.title),
            note: [author?.name, author?.pub_time, archive.duration_text].filter(Boolean).join(' · '),
          });
        });
      },
    },
    fav: {
      title: t('收藏'),
      more: () => `${SPACE}${account.mid}/favlist`,
      async rows() {
        const folders = await cached('folders', 300000, () =>
          api(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${account.mid}`),
        );
        const folder = folders?.list?.[0];
        if (!folder?.id) return [];
        const list = await cached('fav', 60000, () =>
          api(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${number(folder.id)}&ps=8&pn=1&platform=web`),
        );
        return (list?.medias || []).slice(0, 8).flatMap((media) =>
          media?.bvid
            ? mediaRow({
                href: video(media.bvid),
                cover: media.cover,
                title: String(media.title || ''),
                note: [media.upper?.name, clock(media.duration)].filter(Boolean).join(' · '),
              })
            : [],
        );
      },
    },
    history: {
      title: t('歷史'),
      more: 'https://www.bilibili.com/history',
      async rows() {
        const list = await cached('history', 60000, () =>
          api('https://api.bilibili.com/x/web-interface/history/cursor?ps=8&type=archive'),
        );
        return (list?.list || []).slice(0, 8).flatMap((entry) => {
          const bvid = entry?.history?.bvid;
          if (!bvid) return [];
          const watched = number(entry.progress) < 0 ? t('已看完') : `${clock(entry.progress)} / ${clock(entry.duration)}`;
          return mediaRow({
            href: video(bvid),
            cover: entry.cover,
            title: String(entry.title || ''),
            note: [entry.author_name, watched].filter(Boolean).join(' · '),
          });
        });
      },
    },
  };
  let peekName = '';
  let peekTimer = 0;
  const closePeek = () => {
    clearTimeout(peekTimer);
    peekName = '';
    peek.hidden = true;
  };
  const openPeek = async (name) => {
    if (!account || !val('x.nav.peek') || peekName === name) return;
    closePops();
    suggest.hidden = true;
    peekName = name;
    const view = PEEKS[name];
    const body = h('div', { class: 'bga-nav-peek-body' }, [1, 2, 3].map(() => h('div', { class: 'bga-nav-ghost' })));
    const more = typeof view.more === 'function' ? view.more() : view.more;
    peek.replaceChildren(
      h(
        'div',
        { class: 'bga-nav-peek-head' },
        h('b', {}, view.title),
        h('a', { href: more, target: '_blank', rel: 'noopener' }, t('看全部')),
      ),
      body,
    );
    // 面板的右边对着这个入口，不超出导航栏右边
    const box = entryLinks[name].link.getBoundingClientRect();
    const frame = bar.getBoundingClientRect();
    peek.style.right = `${Math.max(16, Math.round(frame.right - box.right - 150))}px`;
    peek.hidden = false;
    syncDirection();
    try {
      const rows = await view.rows();
      if (peekName !== name) return;
      body.replaceChildren(...(rows.length ? rows : [h('p', { class: 'bga-nav-empty' }, t('沒有內容'))]));
    } catch (error) {
      warn(`导航栏：${name} 预览`, error);
      if (peekName === name) body.replaceChildren(h('p', { class: 'bga-nav-empty' }, t('載入失敗')));
    }
  };
  const schedule = (run, delay) => {
    clearTimeout(peekTimer);
    peekTimer = setTimeout(run, delay);
  };
  for (const [name] of NAV_ENTRIES) {
    const { link } = entryLinks[name];
    link.addEventListener('pointerenter', () => schedule(() => openPeek(name), 180));
    link.addEventListener('pointerleave', () => schedule(closePeek, 260));
    link.addEventListener('focus', () => schedule(() => openPeek(name), 0));
  }
  peek.addEventListener('pointerenter', () => clearTimeout(peekTimer));
  peek.addEventListener('pointerleave', () => schedule(closePeek, 260));

  // ── 搜索建议 / 热搜 ──
  let suggestRun = 0;
  let picked = -1;
  const suggestRows = () => [...suggest.querySelectorAll('.bga-nav-row')];
  const showSuggest = (title, words, ranked) => {
    picked = -1;
    if (!words.length) return void (suggest.hidden = true);
    // 热搜十条排成两栏，建议排一栏
    suggest.classList.toggle('bga-two', ranked);
    suggest.replaceChildren(
      ...(title ? [h('div', { class: 'bga-nav-peek-head' }, h('b', {}, title))] : []),
      ...words.map((word, index) =>
        h(
          'button',
          { type: 'button', class: 'bga-nav-row', role: 'option', tabindex: '-1', dataset: { word } },
          ranked ? h('i', { class: `bga-nav-rank${index < 3 ? ' bga-hot' : ''}` }, String(index + 1)) : navIcon('search'),
          h('span', { class: 'bga-nav-label' }, word),
        ),
      ),
    );
    suggest.hidden = false;
    syncDirection();
  };
  const loadSuggest = async () => {
    const run = ++suggestRun;
    const term = input.value.trim();
    try {
      if (!term) {
        const square = await cached('hot', 300000, () => api('https://api.bilibili.com/x/web-interface/search/square?limit=10'));
        if (run !== suggestRun || document.activeElement !== input) return;
        const words = (square?.trending?.list || []).map((entry) => String(entry?.show_name || entry?.keyword || '')).filter(Boolean);
        return void showSuggest(t('熱搜'), words.slice(0, 10), true);
      }
      // 用 B站导航栏自己用的那个接口：它带登录态，会把你关注的 UP 主排在最前面
      // （s.search.bilibili.com 那个旧接口不认登录，1.1.0 用了它，关注的人就不出来了）
      const result = await cached(`suggest:${term}`, 60000, () =>
        api(`https://api.bilibili.com/x/web-interface/suggest?highlight=0&term=${encodeURIComponent(term)}`),
      );
      if (run !== suggestRun || document.activeElement !== input) return;
      const tags = result?.result?.tag || result?.tag || [];
      showSuggest('', tags.map((entry) => String(entry?.value || '')).filter(Boolean).slice(0, 10), false);
    } catch (error) {
      // 拿不到建议不影响搜索本身
      if (run === suggestRun) suggest.hidden = true;
    }
  };
  let suggestTimer = 0;
  input.addEventListener('focus', loadSuggest);
  // 焦点离开搜索框就收起（稍等一下，点建议的那一下要先生效）
  input.addEventListener('blur', () => setTimeout(() => document.activeElement === input || (suggest.hidden = true), 160));
  input.addEventListener('input', () => {
    clearTimeout(suggestTimer);
    suggestTimer = setTimeout(loadSuggest, 160);
  });
  input.addEventListener('keydown', (event) => {
    // 页面的快捷键别抢输入框里的按键
    event.stopPropagation();
    const rows = suggest.hidden ? [] : suggestRows();
    if (event.key === 'Escape') return void (suggest.hidden ? input.blur() : (suggest.hidden = true));
    if (!rows.length || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    picked = (picked + (event.key === 'ArrowDown' ? 1 : -1) + rows.length + (picked < 0 && event.key === 'ArrowUp' ? 1 : 0)) % rows.length;
    rows.forEach((row, index) => row.classList.toggle('bga-on', index === picked));
    input.value = rows[picked].dataset.word;
  });
  for (const type of ['keyup', 'keypress']) input.addEventListener(type, (event) => event.stopPropagation());
  suggest.addEventListener('mousedown', (event) => event.preventDefault()); // 点建议时输入框别失焦
  suggest.addEventListener('click', (event) => {
    const row = event.target.closest('.bga-nav-row');
    if (!row) return;
    input.value = row.dataset.word;
    search(row.dataset.word);
  });
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    search(input.value);
  });
  searchForm.addEventListener('click', (event) => event.target === searchForm && input.focus());

  // ── 光斑：滑鼠在方砖上时，底下跟着一团很淡的光 ──
  let glowQueued = false;
  bar.addEventListener(
    'pointermove',
    (event) => {
      if (glowQueued || CALM.matches) return;
      const tile = event.target.closest?.('.bga-nav-tile');
      if (!tile) return;
      glowQueued = true;
      requestAnimationFrame(() => {
        glowQueued = false;
        const box = tile.getBoundingClientRect();
        tile.style.setProperty('--bga-mx', `${Math.round(event.clientX - box.left)}px`);
        tile.style.setProperty('--bga-my', `${Math.round(event.clientY - box.top)}px`);
      });
    },
    { passive: true },
  );

  // ── 位置 ──
  /** 导航栏在视窗下半（播放页、还没卷上去）：浮层朝上开 */
  const syncDirection = () => bar.classList.toggle('bga-up', bar.getBoundingClientRect().top > window.innerHeight * 0.5);
  /** 首页最上面导航栏叠在头图上：不要底色 */
  const syncTop = () => flag('nav-clear', PAGE.home && window.scrollY < 72);
  let scrollQueued = false;
  window.addEventListener(
    'scroll',
    () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        syncDirection();
        syncTop();
      });
    },
    { passive: true },
  );

  const NATIVE_BARS = '.bili-header, .link-navbar, #biliMainHeader, #bili-header-container, #internationalHeader';
  let retired = false;
  const mount = () => {
    if (retired) return;
    if (bar.parentElement !== document.body || document.body.firstElementChild !== bar) document.body.prepend(bar);
    syncDirection();
    syncTop();
  };
  bodyReady().then(() => {
    mount();
    // B站重建页面时可能把我们挤到后面：隔一会儿对一遍（只在页面可见时）
    setInterval(() => document.hidden || mount(), 2000);
    // 这个页面压根没有 B站的导航栏（少数活动页、内嵌页）：我们也不出现，免得盖住内容
    setTimeout(() => {
      if (document.querySelector(NATIVE_BARS)) return;
      retired = true;
      bar.remove();
      flag('nav-own', false);
    }, 6000);
  });
}
