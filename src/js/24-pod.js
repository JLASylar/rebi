// ════════════════════════════ 选集浮层 ════════════════════════════
// 点控制栏的「选集」，合集 / 分 P 列表浮在播放器右侧，不用往下卷。样式和做法说明在 src/css/pod.css。

defOpt('x.pod', true, {
  tab: 'video',
  group: '選集',
  label: '選集浮層',
  hint: '點控制欄的「选集」，合集 / 分 P 清單直接浮在播放器右側，不用往下捲；全螢幕下也一樣。再點一次收起',
});
defOpt('x.pod.autoClose', true, { tab: 'video', group: '選集', label: '選好一集後自動收起' });
defOpt('x.pod.thumb', false, {
  tab: 'video',
  group: '選集',
  label: t('選集顯示縮圖'),
  hint: t('合集顯示每一集的封面，分 P 影片每一段都顯示影片的主封面；捲到哪裡才載入哪裡'),
});
defOpt('x.pod.width', 380, { tab: 'video', group: '選集', label: '浮層寬度', unit: 'px', step: 20 });

function setupPod(container) {
  /** 页面上的列表原件（不算全屏时放进播放器里的副本） */
  const pagePod = () => [...document.querySelectorAll('.video-pod')].find((el) => !el.closest('.bga-pod-fs')) || null;

  /**
   * 把当前这一集滚到列表中间，返回这次滚了多少像素。
   * 长列表的条目要滚到附近才算出真实高度，所以得反复定位，直到不再偏。
   */
  const centerCurrent = (pod) => {
    const body = pod?.querySelector('.video-pod__body');
    const current = body?.querySelector('.active, [class*="item-active"], .on');
    if (!body || !current) return 0;
    const offset = current.getBoundingClientRect().top - body.getBoundingClientRect().top;
    const delta = offset - (body.clientHeight - current.offsetHeight) / 2;
    const before = body.scrollTop;
    body.style.scrollBehavior = 'auto';
    body.scrollTop = before + delta;
    return body.scrollTop === before ? 0 : delta;
  };
  const centerSoon = (getPod, tries = 10) =>
    requestAnimationFrame(() => {
      if (Math.abs(centerCurrent(getPod())) > 4 && tries > 0) setTimeout(() => centerSoon(getPod, tries - 1), 60);
    });

  // ── 缩图 ──
  // 不往条目里插节点（那是 Vue 管的）：条目卷进视窗时，往一张样式表里写一条「这个 data-key 的缩图地址」，
  // 条目的 ::before 拿它当背景。全屏时的副本是克隆出来的，data-key 相同，同一条规则也管得到。
  const thumbRules = h('style', { class: 'bga-pod-thumbs' });
  const thumbDone = new Set();
  let thumbSource = { bvid: '', urls: new Map() };
  /** data-key → 图片地址：合集的 key 是 BV 号（各集自己的封面），分 P 的 key 是 cid（影片的主封面） */
  const thumbUrls = () => {
    const data = W.__INITIAL_STATE__?.videoData;
    if (!data || data.bvid === thumbSource.bvid) return thumbSource.urls;
    const urls = new Map();
    for (const section of data.ugc_season?.sections || []) {
      for (const episode of section.episodes || []) {
        if (episode.bvid && episode.arc?.pic) urls.set(String(episode.bvid), episode.arc.pic);
      }
    }
    // 分 P：各段的第一帧多半是黑画面，一律用影片的主封面
    for (const page of data.pages || []) {
      if (page.cid && data.pic) urls.set(String(page.cid), data.pic);
    }
    thumbSource = { bvid: data.bvid, urls };
    return urls;
  };
  const addThumb = (item) => {
    const key = item.dataset.key;
    if (!key || thumbDone.has(key)) return;
    const address = String(thumbUrls().get(key) || '').replace(/^(https?:)?\/\//, 'https://');
    // 只收 B站图床的地址，别让奇怪的字符进样式表
    if (!/^https:\/\/[\w.-]+\.hdslb\.com\/[\w./-]+$/.test(address)) return;
    thumbDone.add(key);
    thumbRules.append(`[data-key="${key.replace(/[^\w-]/g, '')}"]{--bga-thumb:url("${address}@192w_120h_1c.webp")}\n`);
  };
  const thumbWatcher = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      addThumb(entry.target);
      thumbWatcher.unobserve(entry.target);
    }
  });
  /** 列表是 B站陆续建出来的（换一集还会重建），所以开浮层时、以及定时都对一遍 */
  const watchThumbs = () => {
    if (!val('x.pod.thumb')) return;
    if (!thumbRules.isConnected) document.head.append(thumbRules);
    for (const item of document.querySelectorAll('.video-pod__body [data-key]')) {
      if (!thumbDone.has(item.dataset.key)) thumbWatcher.observe(item);
    }
  };
  watch('x.pod.thumb', (on) => {
    flag('pod-thumb', !!on);
    watchThumbs();
  });

  // ── 全屏：播放器里放一份副本，点击转发给页面上的原件 ──
  let copyHost = null;
  const closeCopy = () => {
    copyHost?.remove();
    copyHost = null;
  };
  /** 副本里被点的元素 → 原件里同一位置的元素 */
  const originalOf = (clicked) => {
    const copy = copyHost.firstElementChild;
    const path = [];
    for (let node = clicked; node && node !== copy; node = node.parentElement) {
      path.unshift([...node.parentElement.children].indexOf(node));
    }
    let target = pagePod();
    for (const index of path) target = target?.children[index];
    return target;
  };
  const onCopyClick = (event) => {
    event.stopPropagation();
    const target = originalOf(event.target);
    if (!target) return;
    try {
      // 不构造带 view 的 MouseEvent：Tampermonkey Safari 版沙箱里的 window 是代理对象，传进去会抛 TypeError
      if (typeof target.click === 'function') target.click();
      else target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    } catch {
      // 原件已经不在了
    }
    const pickedEpisode = event.target.closest('.video-pod__body [class*="item"]') && !event.target.closest('button');
    if (pickedEpisode && val('x.pod.autoClose')) setTimeout(closeCopy, 180);
    else setTimeout(() => copyHost && renderCopy(), 350);
  };
  const renderCopy = () => {
    const source = pagePod();
    if (!source) return closeCopy();
    const scrollTop = copyHost?.querySelector('.video-pod__body')?.scrollTop;
    if (!copyHost) {
      copyHost = h('div', { class: 'bga-pod-fs' });
      copyHost.addEventListener('click', onCopyClick);
      // 这些事件别漏给播放器（滚轮调音量、双击全屏、键盘快捷键…）
      for (const type of ['wheel', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'keydown']) {
        copyHost.addEventListener(type, (event) => event.stopPropagation());
      }
      container.appendChild(copyHost);
    }
    copyHost.replaceChildren(source.cloneNode(true));
    const body = copyHost.querySelector('.video-pod__body');
    if (body && scrollTop != null) body.scrollTop = scrollTop;
    else centerSoon(() => copyHost);
    watchThumbs();
  };

  // ── 开合 ──
  const isOpen = () => (fullscreenElement() ? !!copyHost : hasFlag('pod-open'));
  const setOpen = (open) => {
    if (open && !(val('x.pod') && pagePod())) return;
    if (fullscreenElement()) {
      flag('pod-open', false);
      return open ? renderCopy() : closeCopy();
    }
    closeCopy();
    flag('pod-open', open);
    if (open) {
      watchThumbs();
      centerSoon(pagePod);
    }
  };

  watch('x.pod', (on) => {
    flag('pod', !!on);
    if (!on) setOpen(false);
  });
  watch('x.pod.width', (width) => setRootVar('--bga-pod-width', `${Math.max(240, width)}px`));

  // 点「选集」：开合浮层，不让播放器弹它自己的小菜单
  container.addEventListener(
    'click',
    (event) => {
      const button = event.target.closest?.('.bpx-player-ctrl-eplist, .bga-pod-btn');
      if (!button || !val('x.pod') || !pagePod() || event.target.closest('.bpx-player-ctrl-eplist-menu-wrap')) return;
      event.stopPropagation();
      setOpen(!isOpen());
    },
    true,
  );
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false);
  });
  // 在浮层里选好一集：收起
  document.addEventListener(
    'click',
    (event) => {
      if (!hasFlag('pod-open') || !val('x.pod.autoClose')) return;
      const episode = event.target.closest?.('.video-pod__body [class*="item"]');
      if (episode && !event.target.closest('button, .video-pod__header')) setTimeout(() => setOpen(false), 180);
    },
    true,
  );
  // 页面卷过播放器大半：收起
  window.addEventListener(
    'scroll',
    () => {
      if (hasFlag('pod-open') && window.scrollY > container.offsetHeight * 0.6) setOpen(false);
    },
    { passive: true },
  );
  // 进出全屏：两种浮层都收起
  for (const type of ['fullscreenchange', 'webkitfullscreenchange']) {
    document.addEventListener(type, () => {
      closeCopy();
      flag('pod-open', false);
    });
  }

  // 合集影片的控制栏没有自带的「选集」按钮：补一个。播放器会重建控制栏，所以定时看一眼
  const syncButton = () => {
    if (document.hidden) return;
    const group = container.querySelector('.bpx-player-control-bottom-right');
    if (!group) return;
    const native = group.querySelector('.bpx-player-ctrl-eplist');
    const mine = group.querySelector('.bga-pod-btn');
    const nativeVisible = native && getComputedStyle(native).display !== 'none';
    const needed = val('x.pod') && pagePod() && !nativeVisible;
    if (needed && !mine) {
      group.prepend(
        h('div', { class: 'bpx-player-ctrl-btn bga-pod-btn', role: 'button', 'aria-label': '选集' }, '选集'),
      );
    } else if (!needed && mine) {
      mine.remove();
    }
    if (isOpen() && !pagePod()) setOpen(false);
    watchThumbs();
  };
  syncButton();
  setInterval(syncButton, 2500);
}
