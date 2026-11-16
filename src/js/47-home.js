// ════════════════════════════ 首页主题 ════════════════════════════
// 極簡：只有影片列表（原来的样子）。
// 大寶鑑：最上面一整幅海报，B站官方榜单里的影片轮流登场；右下是关注的 UP 主的更新；往下卷是原来的影片列表。
//
// 海报层挂在 <body> 上、绝对定位盖住被撑高的头图，不往 B站（Vue 管着）的结构里插节点。样式在 css/home.css。

defOpt('x.home.theme', 'plain', {
  tab: 'home',
  group: t('首頁主題'),
  type: 'select',
  label: t('主題'),
  hint: t('極簡：只有影片列表。大寶鑑：最上面是整幅海報的影片推薦，右下是你關注的更新，往下滑才是影片列表'),
  choices: [
    ['plain', t('極簡')],
    ['hero', t('大寶鑑')],
  ],
});
defOpt('x.home.source', 'popular', {
  tab: 'home',
  group: t('大寶鑑'),
  type: 'select',
  label: t('海報的推薦來源'),
  choices: [
    ['popular', t('綜合熱門')],
    ['weekly', t('每週必看')],
    ['ranking', t('排行榜')],
    ['precious', t('入站必刷')],
  ],
});
defOpt('x.home.side', 'all', {
  tab: 'home',
  group: t('大寶鑑'),
  type: 'select',
  label: t('右下角的關注更新'),
  hint: t('要登入 B站；沒登入時改放同一來源的其他影片'),
  choices: [
    ['all', t('全部動態')],
    ['video', t('只看影片')],
    ['off', t('不顯示')],
  ],
});
defOpt('x.home.interval', 8, {
  tab: 'home',
  group: t('大寶鑑'),
  label: t('海報多久換一張'),
  hint: t('滑鼠停在海報上時暫停；系統開了「減少動態效果」就不自動換'),
  unit: t('秒'),
  step: 1,
});
defOpt('x.home.noSwipe', false, {
  tab: 'home',
  group: t('影片列表'),
  label: t('不顯示左上角那塊大的輪播推薦'),
});

const HERO_SIZE = 8;
const HERO_ICONS = {
  play: '<path d="M5 2.6v12.8a.6.6 0 00.92.5l10-6.4a.6.6 0 000-1L5.92 2.1A.6.6 0 005 2.6z"/>',
  later: '<circle cx="9" cy="9" r="6.6"/><path d="M9 5.2V9l2.6 1.7"/>',
  previous: '<path d="M11 3.5L5.5 9l5.5 5.5"/>',
  next: '<path d="M7 3.5L12.5 9 7 14.5"/>',
};
const SOURCE_NAMES = { popular: t('綜合熱門'), weekly: t('每週必看'), ranking: t('排行榜'), precious: t('入站必刷') };

// ── 取资料 ──
const apiData = async (path) => {
  const result = await dm.getJSON(`https://api.bilibili.com${path}`);
  if (result?.code !== 0) throw new Error(result?.message || t`錯誤碼 ${result?.code}`);
  return result.data;
};

/** 某个官方榜单里的影片（接口返回的原样） */
const fetchSourceVideos = async (source) => {
  if (source === 'weekly') {
    const latest = (await apiData('/x/web-interface/popular/series/list')).list[0].number;
    return (await apiData(`/x/web-interface/popular/series/one?number=${latest}`)).list;
  }
  if (source === 'ranking') return (await apiData('/x/web-interface/ranking/v2?rid=0&type=all')).list;
  if (source === 'precious') return (await apiData('/x/web-interface/popular/precious')).list;
  return (await apiData('/x/web-interface/popular?ps=30&pn=1')).list;
};

const secureUrl = (url) => String(url || '').replace(/^(?:https?:)?\/\//, 'https://');
const countText = (count) => {
  if (!(count >= 0)) return '';
  return count >= 1e4 ? COMPACT_NUMBER.format(count) : String(count);
};
const clockText = (seconds) => {
  const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
  if (!parts[0]) parts.shift();
  return parts.map((part, index) => (index ? String(part).padStart(2, '0') : part)).join(':');
};
const dateText = (timestamp) => new Date(timestamp * 1000).toLocaleDateString('zh-TW');

/** 榜单里的一条 → 右下角卡片要的样子 */
const cardOfVideo = (video) => ({
  link: `https://www.bilibili.com/video/${video.bvid}`,
  cover: secureUrl(video.pic),
  title: video.title,
  note: [video.owner?.name, countText(video.stat?.view) && t`${countText(video.stat.view)} 次播放`]
    .filter(Boolean)
    .join(' · '),
});

/** 关注动态里的一条 → 卡片；认不出的类型返回 null */
const cardOfDynamic = (item) => {
  const author = item.modules?.module_author || {};
  const content = item.modules?.module_dynamic || {};
  const major = content.major || {};
  const body = major.archive || major.pgc || major.article || major.opus || major.draw || major.live_rcmd;
  if (!body && !content.desc?.text) return null;
  const cover = body?.cover || body?.covers?.[0] || body?.pics?.[0]?.url || body?.items?.[0]?.src || author.face || '';
  const title = body?.title || body?.summary?.text || content.desc?.text || '';
  if (!cover || !title) return null;
  return {
    link: secureUrl(body?.jump_url) || `https://t.bilibili.com/${item.id_str}`,
    cover: secureUrl(cover),
    title: title.trim().split('\n')[0],
    note: [author.name, author.pub_time].filter(Boolean).join(' · '),
  };
};

/** 关注的更新；没登录或出错返回 null */
const fetchFollowCards = async (onlyVideo) => {
  if (!loginCsrf()) return null;
  try {
    const type = onlyVideo ? 'video' : 'all';
    const data = await apiData(`/x/polymer/web-dynamic/v1/feed/all?type=${type}&page=1&timezone_offset=-480`);
    const cards = (data.items || []).map(cardOfDynamic).filter(Boolean);
    return cards.length ? cards : null;
  } catch (error) {
    warn('读关注动态失败', error);
    return null;
  }
};

// ── 海报层 ──
/** 建海报层；返回 { element, destroy } */
const buildHero = (videos, side) => {
  const slides = videos.slice(0, HERO_SIZE);
  const sourceName = SOURCE_NAMES[val('x.home.source')] || SOURCE_NAMES.popular;
  let current = -1;

  const layers = [h('img', { class: 'bga-hero-bg', alt: '' }), h('img', { class: 'bga-hero-bg', alt: '' })];
  const info = h('div', { class: 'bga-hero-info' });
  const dots = h(
    'div',
    { class: 'bga-hero-dots' },
    slides.map((video, index) => h('button', { type: 'button', title: video.title, onclick: () => show(index) })),
  );
  const iconButton = (icon, title, onclick) => {
    const button = h('button', { class: 'bga-hero-round', type: 'button', title, onclick });
    button.append(svgIcon(HERO_ICONS[icon], 18));
    return button;
  };

  const renderInfo = (video) => {
    const play = h('a', {
      class: 'bga-hero-play',
      href: `https://www.bilibili.com/video/${video.bvid}`,
      target: '_blank',
    });
    play.append(svgIcon(HERO_ICONS.play, 18), t('[按鈕]播放'));
    const description = String(video.desc || '').trim();
    const tags = [
      video.tname && h('span', {}, video.tname),
      video.rcmd_reason?.content && h('span', {}, video.rcmd_reason.content),
      h('span', {}, t`${countText(video.stat?.view)} 次播放`),
      video.stat?.like > 0 && h('span', {}, t`${countText(video.stat.like)} 讚`),
    ];
    info.replaceChildren(
      h(
        'div',
        { class: 'bga-hero-meta' },
        h('b', {}, sourceName),
        h('a', { href: `https://space.bilibili.com/${video.owner?.mid}`, target: '_blank' }, video.owner?.name || ''),
        h('span', {}, dateText(video.pubdate)),
        h('span', {}, clockText(video.duration)),
      ),
      h('h2', { class: 'bga-hero-title' }, video.title),
      h('div', { class: 'bga-hero-tags' }, tags),
      description.length > 1 ? h('p', { class: 'bga-hero-desc' }, description) : '',
      h(
        'div',
        { class: 'bga-hero-actions' },
        play,
        iconButton('later', t('稍後再看'), () => addToWatchLater(video.bvid)),
        iconButton('previous', t('上一部'), () => show(current - 1)),
        iconButton('next', t('下一部'), () => show(current + 1)),
      ),
    );
    // 重新触发入场动画
    info.style.animation = 'none';
    void info.offsetWidth;
    info.style.animation = '';
  };

  function show(index) {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;
    current = next;
    const video = slides[current];
    // 两层海报轮流用：新的一张载入好再淡入，免得闪一下空白
    const incoming = layers.find((layer) => !layer.hasAttribute('data-on')) || layers[0];
    const outgoing = layers.find((layer) => layer !== incoming);
    incoming.onload = () => {
      incoming.toggleAttribute('data-on', true);
      outgoing.toggleAttribute('data-on', false);
    };
    incoming.src = `${secureUrl(video.pic)}@1920w_1080h_1c.webp`;
    renderInfo(video);
    [...dots.children].forEach((dot, at) => dot.toggleAttribute('data-on', at === current));
  }

  const element = h(
    'section',
    { id: 'bga-hero', class: 'bga-ui', 'aria-label': t('推薦影片') },
    layers,
    h('div', { class: 'bga-hero-shade' }),
    h('div', { class: 'bga-hero-left' }, info, dots),
    side && buildHeroSide(side),
  );
  element.style.setProperty('--bga-hero-interval', `${Math.max(3, Number(val('x.home.interval')) || 8)}s`);

  // 进度点的填充动画跑完就换下一张；暂停动画也就暂停了轮播
  dots.addEventListener('animationend', (event) => {
    if (event.animationName === 'bga-hero-fill') show(current + 1);
  });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let hovering = false;
  const updatePaused = () =>
    element.toggleAttribute(
      'data-paused',
      hovering || reducedMotion.matches || document.hidden || scrollY > innerHeight * 0.6,
    );
  element.addEventListener('mouseenter', () => ((hovering = true), updatePaused()));
  element.addEventListener('mouseleave', () => ((hovering = false), updatePaused()));
  const abort = new AbortController();
  document.addEventListener('visibilitychange', updatePaused, { signal: abort.signal });
  addEventListener('scroll', updatePaused, { passive: true, signal: abort.signal });
  updatePaused();
  show(0);

  return {
    element,
    destroy() {
      abort.abort();
      element.remove();
    },
  };
};

/** 右下角那一排卡片 */
function buildHeroSide({ title, link, cards }) {
  const row = h(
    'div',
    { class: 'bga-hero-row' },
    cards
      .slice(0, 18)
      .map((card) =>
        h(
          'a',
          { class: 'bga-hero-card', href: card.link, target: '_blank', title: card.title },
          h('img', { src: `${card.cover}@480w_270h_1c.webp`, alt: '', loading: 'lazy' }),
          h('b', {}, card.title),
          h('small', {}, card.note),
        ),
      ),
  );
  const pageButton = (icon, label, direction) => {
    const button = h('button', {
      class: 'bga-hero-round',
      type: 'button',
      title: label,
      onclick: () => row.scrollBy({ left: direction * row.clientWidth, behavior: 'smooth' }),
    });
    button.append(svgIcon(HERO_ICONS[icon], 18));
    return button;
  };
  return h(
    'div',
    { class: 'bga-hero-side' },
    h(
      'div',
      { class: 'bga-hero-side-head' },
      h('span', {}, link ? h('a', { href: link, target: '_blank' }, `${title} ›`) : title),
      pageButton('previous', t('往前'), -1),
      pageButton('next', t('往後'), 1),
    ),
    row,
  );
}

// ── 菜单栏：往下卷收起，往上卷出现 ──
const watchNavScroll = (signal) => {
  let lastY = scrollY;
  addEventListener(
    'scroll',
    () => {
      const y = scrollY;
      if (Math.abs(y - lastY) < 6) return;
      flag('home-nav-hidden', y > lastY && y > 80);
      flag('home-nav-over-hero', y < innerHeight - 70);
      lastY = y;
    },
    { passive: true, signal },
  );
  flag('home-nav-over-hero', scrollY < innerHeight - 70);
};

function setupHome() {
  reflect('x.home.noSwipe', 'home-no-swipe');
  if (!PAGE.home || !IS_TOP) return;

  let hero = null;
  let abort = null;
  let generation = 0;

  const unmount = () => {
    generation += 1;
    hero?.destroy();
    abort?.abort();
    hero = abort = null;
    for (const token of ['home-hero', 'home-nav-hidden', 'home-nav-over-hero']) flag(token, false);
  };

  const mount = async () => {
    unmount();
    if (val('x.home.theme') !== 'hero') return;
    const mine = generation;
    flag('home-hero', true);
    abort = new AbortController();
    watchNavScroll(abort.signal);
    try {
      const sideMode = val('x.home.side');
      const [videos, follow] = await Promise.all([
        fetchSourceVideos(val('x.home.source')),
        sideMode === 'off' ? null : fetchFollowCards(sideMode === 'video'),
      ]);
      if (mine !== generation) return;
      if (!videos?.length) throw new Error(t('來源是空的'));
      let side = null;
      if (follow) side = { title: t('關注更新'), link: 'https://t.bilibili.com/', cards: follow };
      else if (sideMode !== 'off') side = { title: t('更多推薦'), cards: videos.slice(HERO_SIZE).map(cardOfVideo) };
      hero = buildHero(videos, side?.cards.length ? side : null);
      document.body.append(hero.element);
    } catch (error) {
      if (mine !== generation) return;
      warn('大寶鑑载入失败', error);
      unmount();
      toast(t`大寶鑑載入失敗：${error.message || error}`, 'warn');
    }
  };

  for (const key of ['x.home.theme', 'x.home.source', 'x.home.side', 'x.home.interval']) store.on(key, mount);
  mount();
}
