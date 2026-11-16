// ════════════════════════════ 用户备注 ════════════════════════════
// 给 B站用户记一句备注，显示在评论区昵称旁、空间页，以及页面上指向他空间首页的文字链接后面。
// 数据是一个数组 [{ id, nickname, avatar, memo }]，存在 biliUsers 下，可以在面板里导入导出。

defOpt('x.memo', true, {
  tab: 'memo',
  group: t('顯示'),
  label: t('顯示用戶備註'),
  hint: t('評論區用戶名旁、空間頁，以及頁面上指向該用戶空間首頁的連結'),
  reload: true,
});
defOpt('x.memo.mode', 'after', {
  tab: 'memo',
  group: t('顯示'),
  type: 'select',
  label: t('顯示方式'),
  choices: [
    ['after', t('暱稱後加標籤')],
    ['replace', t('只顯示備註')],
  ],
});

const memo = {
  /** uid（字符串）→ { id, nickname, avatar, memo } */
  map: new Map(),

  list() {
    const users = store.get('biliUsers', []);
    return Array.isArray(users) ? users : [];
  },
  /** 从存储重建索引 */
  refresh() {
    memo.map = new Map(
      memo
        .list()
        .filter((user) => user?.id && user.memo)
        .map((user) => [String(user.id), user]),
    );
  },
  get(uid) {
    return memo.map.get(String(uid))?.memo || '';
  },
  /** text 为空 = 删除这条备注 */
  set(uid, text, nickname = '', avatar = '') {
    const id = String(uid);
    const previous = memo.map.get(id);
    const users = memo.list().filter((user) => String(user.id) !== id);
    if (text) {
      users.unshift({
        id,
        nickname: nickname || previous?.nickname || '',
        avatar: avatar || previous?.avatar || '',
        memo: text,
      });
    }
    store.set('biliUsers', users);
  },

  /**
   * 在点击的位置弹出一个小编辑框。
   * @param {Event|Element|null} anchor 弹在哪：事件（取鼠标位置）或元素（贴着它）；没有就居中
   */
  edit(uid, nickname = '', avatar = '', anchor = null) {
    document.getElementById('bga-memo-pop')?.remove();
    const current = memo.get(uid);
    const input = h('input', {
      type: 'text',
      maxlength: '40',
      placeholder: t('輸入備註'),
      value: current,
      'aria-label': t('備註'),
    });
    const close = () => popover.hidePopover();
    const save = () => {
      const text = input.value.trim();
      if (text !== current) {
        memo.set(uid, text, nickname, avatar);
        toast(text ? t('備註已儲存') : t('備註已刪除'), 'ok', 1800);
      }
      close();
    };
    const remove = () => {
      input.value = '';
      save();
    };
    const popover = h(
      'div',
      { id: 'bga-memo-pop', class: 'bga-ui', popover: 'auto', role: 'dialog', 'aria-label': t('編輯備註') },
      h('div', { class: 'bga-mp-title' }, t('備註'), h('span', {}, nickname || `UID ${uid}`)),
      input,
      h(
        'div',
        { class: 'bga-mp-btns' },
        current ? h('button', { type: 'button', class: 'bga-mp-del', onclick: remove }, t('刪除')) : null,
        h('button', { type: 'button', onclick: close }, t('取消')),
        h('button', { type: 'button', class: 'bga-mp-ok', onclick: save }, t('儲存')),
      ),
    );
    popover.dataset.accent = val('x.ui.accent');
    popover.dataset.theme = val('x.ui.theme');
    popover.addEventListener('toggle', (event) => {
      if (event.newState === 'closed') popover.remove();
    });
    // 输入框里的按键别漏给播放器当快捷键
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') save();
    });
    for (const type of ['keyup', 'keypress']) input.addEventListener(type, (event) => event.stopPropagation());

    document.body.appendChild(popover);
    popover.showPopover();
    placeNear(popover, anchor);
    input.focus();
    input.select();
  },
};

/** 把弹出框放到锚点下方（放不下就放上方），不超出视窗；没有锚点就居中 */
const placeNear = (popover, anchor) => {
  const width = popover.offsetWidth;
  const height = popover.offsetHeight;
  const MARGIN = 8;
  let rect = null;
  if (anchor?.getBoundingClientRect) rect = anchor.getBoundingClientRect();
  else if (anchor?.clientX != null)
    rect = { left: anchor.clientX, top: anchor.clientY - 10, bottom: anchor.clientY + 10 };

  let x = (window.innerWidth - width) / 2;
  let y = (window.innerHeight - height) / 2;
  if (rect) {
    x = Math.min(Math.max(MARGIN, rect.left), window.innerWidth - width - MARGIN);
    const fitsBelow = rect.bottom + MARGIN + height <= window.innerHeight;
    y = fitsBelow ? rect.bottom + MARGIN : Math.max(MARGIN, rect.top - height - MARGIN);
  }
  popover.style.left = `${Math.round(x)}px`;
  popover.style.top = `${Math.round(y)}px`;
};

const memoBadge = (text) => h('span', { class: 'bga-memo', title: t('點擊修改備註') }, text);

// ── 评论区 ──
const showCommentMemo = () => {
  hookLit('bili-comment-user-info', (el) => {
    const info = el.shadowRoot?.querySelector('#info');
    const member = el.data?.member;
    if (!info || !member) return;
    addMarkStyle(el.shadowRoot);
    const name = info.querySelector('#user-name');
    const text = memo.get(member.mid || '');
    let badge = info.querySelector('.bga-memo');
    let adder = info.querySelector('.bga-memo-add');
    // 组件会被复用到别的评论上，所以点击时从 el.data 取当前的用户，不能用闭包里的 member
    const onEdit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const current = el.data?.member;
      if (current) memo.edit(String(current.mid), current.uname, current.avatar, event);
    };

    if (text) {
      adder?.remove();
      if (!badge) {
        badge = memoBadge(text);
        badge.addEventListener('click', onEdit);
        if (name) name.insertAdjacentElement('afterend', badge);
        else info.appendChild(badge);
      }
      if (badge.textContent !== text) badge.textContent = text;
    } else {
      badge?.remove();
      if (!adder) {
        adder = h('span', { class: 'bga-memo-add', title: t('給這位用戶加備註') }, t('備註'));
        adder.addEventListener('click', onEdit);
        info.appendChild(adder);
      }
    }
    if (name) name.style.display = text && val('x.memo.mode') === 'replace' ? 'none' : '';
  });

  const rerender = () => {
    for (const el of deepQueryAll('bili-comment-user-info')) {
      try {
        el.requestUpdate?.();
      } catch {
        // 组件已经卸载
      }
    }
  };
  store.on('biliUsers', () => {
    memo.refresh();
    rerender();
    scanMemoLinks();
  });
  store.on('x.memo.mode', rerender);
};

// ── 页面上的用户链接 ──
/** 指向空间首页的链接（不含 /video、/dynamic 这些子页） */
const SPACE_HOME = /space\.bilibili\.com\/(\d+)\/?(?:[?#]|$)/;

/** 给页面上（shadow DOM 之外）指向已备注用户空间首页的文字链接补上备注标签。只查一次 DOM，不随备注数量变慢 */
function scanMemoLinks() {
  if (!document.body) return;
  for (const badge of document.querySelectorAll('.bga-memo[data-bga-link]')) {
    if (!memo.get(badge.dataset.bgaLink)) badge.remove();
  }
  if (!memo.map.size) return;

  for (const link of document.querySelectorAll('a[href*="space.bilibili.com/"]')) {
    const uid = link.href.match(SPACE_HOME)?.[1];
    const user = uid && memo.map.get(uid);
    if (!user) continue;
    // 只标文字链接：头像链接、脚本自己界面里的链接都跳过
    const isOwnUi = link.closest('#bga-panel, #bga-memo-pop');
    const isImageLink = link.querySelector('img, picture, svg, .bili-avatar');
    if (isOwnUi || isImageLink || !link.textContent.trim()) continue;

    const next = link.nextElementSibling;
    if (next?.classList.contains('bga-memo')) {
      if (next.textContent !== user.memo) next.textContent = user.memo;
      continue;
    }
    const badge = memoBadge(user.memo);
    badge.dataset.bgaLink = uid;
    badge.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const latest = memo.map.get(uid);
      memo.edit(uid, latest?.nickname, latest?.avatar, event);
    });
    link.insertAdjacentElement('afterend', badge);
  }
}

// ── 空间页 ──
const spaceUid = () => (location.origin + location.pathname).match(/space\.bilibili\.com\/(\d+)(?:\/|$)/)?.[1];

/** 空间页头图里放昵称的那一行（新旧两版空间页的结构不同） */
const spaceNameRow = async () => {
  const header = await waitFor(() => document.querySelector('#biliMainHeader'), '顶栏', 20000);
  const isNewLayout = header.tagName === 'HEADER';
  const card = await waitFor(
    () => document.querySelector(isNewLayout ? '#app .upinfo__main' : '#app .h-inner'),
    'UP 主信息',
    20000,
  );
  return card.querySelector(isNewLayout ? '.upinfo-detail__top' : '.h-basic div');
};

const showSpaceMemo = async () => {
  const uid = spaceUid();
  const row = uid && (await spaceNameRow());
  if (!row) return;
  const nickname = () => {
    const shown = row.querySelector('.nickname, #h-name')?.textContent;
    return (shown || document.title.replace(/的个人空间.*$/, '')).trim();
  };
  const button = row.appendChild(h('button', { type: 'button', class: 'bga-pill bga-space-memo' }));
  const paint = () => {
    const text = memo.get(uid);
    button.textContent = text ? t`備註：${text}` : t('＋ 備註');
  };
  button.addEventListener('click', () => memo.edit(uid, nickname(), '', button));
  store.on('biliUsers', () => {
    memo.refresh();
    paint();
  });
  paint();
};

function setupMemo() {
  memo.refresh();
  // 扩展版里备注数据是异步送到的：到了再建一次索引
  platform.ready.then(() => memo.refresh());
  if (!val('x.memo')) return;

  showCommentMemo();
  if (!IS_TOP) return;
  if (PAGE.space) ready().then(() => showSpaceMemo().catch(() => {}));
  bodyReady().then(() => {
    scanMemoLinks();
    // 节流而不是防抖：页面一直在变（播放中）时也保证每 500ms 至多扫一次，而不是永远等不到
    let pending = 0;
    pageObserver(() => {
      if (!memo.map.size || pending) return;
      pending = setTimeout(() => {
        pending = 0;
        scanMemoLinks();
      }, 500);
    }).observe(document.body, { childList: true, subtree: true });
  });
}
