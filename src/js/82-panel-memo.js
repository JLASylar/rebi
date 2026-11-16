// ════════════════════════════ 设置面板：备注管理页 ════════════════════════════
// 列出所有备注，可以搜索、改、删、按 UID 新增，以及导入导出 JSON。

/** 别的备注脚本导出的 JSON 字段名不一样：把一条记录整理成 { id, nickname, avatar, memo }；不能用就返回 null */
const normalizeMemoRecord = (record) => {
  const id = String(record?.id ?? record?.uid ?? record?.mid ?? '');
  const text = String(record?.memo ?? record?.remark ?? '').trim();
  if (!/^\d+$/.test(id) || !text) return null;
  return { id, nickname: record.nickname || record.name || '', avatar: record.avatar || record.face || '', memo: text };
};

/** 把一份导入的 JSON 并进现有的备注（同一个用户以导入的为准）。返回导入了多少条 */
const importMemos = (text) => {
  const parsed = JSON.parse(text);
  const records = [parsed, parsed?.biliUsers, parsed?.users].find(Array.isArray);
  if (!records) throw new Error(t('格式不對'));
  const merged = new Map(memo.list().map((user) => [String(user.id), user]));
  let count = 0;
  for (const record of records) {
    const user = normalizeMemoRecord(record);
    if (!user) continue;
    // 导入的记录里没有昵称 / 头像时，保留原来的
    const existing = merged.get(user.id);
    merged.set(user.id, {
      ...user,
      nickname: user.nickname || existing?.nickname || '',
      avatar: user.avatar || existing?.avatar || '',
    });
    count += 1;
  }
  store.set('biliUsers', [...merged.values()]);
  return count;
};

function renderMemoPage(page) {
  const card = groupCard(page, t('備註清單'));
  const searchInput = h('input', { class: 'bga-input', type: 'search', placeholder: t('搜尋暱稱、備註或 UID') });
  const uidInput = h('input', {
    class: 'bga-input',
    type: 'text',
    inputmode: 'numeric',
    placeholder: 'UID',
    style: 'max-width:150px',
  });
  const memoInput = h('input', { class: 'bga-input', type: 'text', placeholder: t('備註') });
  const list = h('div', { class: 'bga-list' });

  /** 「刪除」要点两次：第一次变成「確認刪除」，3 秒内再点才删 */
  const deleteButton = (user) => {
    const button = h('button', { type: 'button', class: 'bga-link' }, t('刪除'));
    button.addEventListener('click', () => {
      if (button.dataset.armed) return void memo.set(user.id, '');
      button.dataset.armed = '1';
      button.textContent = t('確認刪除');
      setTimeout(() => {
        if (!button.isConnected) return;
        delete button.dataset.armed;
        button.textContent = t('刪除');
      }, 3000);
    });
    return button;
  };

  const userRow = (user) => {
    const avatar = user.avatar
      ? h('img', {
          src: `${coverBase(user.avatar)}@64w_64h.webp`,
          alt: '',
          loading: 'lazy',
          referrerpolicy: 'no-referrer',
        })
      : h('span', { class: 'bga-ava' });
    const editor = h('input', { class: 'bga-input', type: 'text', value: user.memo || '', 'aria-label': t('備註') });
    editor.addEventListener('change', () => memo.set(user.id, editor.value.trim(), user.nickname, user.avatar));
    return h(
      'div',
      { class: 'bga-user' },
      avatar,
      h(
        'div',
        {},
        h(
          'a',
          { href: `https://space.bilibili.com/${user.id}`, target: '_blank', rel: 'noopener' },
          user.nickname || t('（未知暱稱）'),
        ),
        h('small', {}, user.id),
      ),
      editor,
      deleteButton(user),
    );
  };

  const render = () => {
    const query = searchInput.value.trim().toLowerCase();
    const users = memo
      .list()
      .filter((user) => !query || `${user.nickname} ${user.memo} ${user.id}`.toLowerCase().includes(query));
    if (users.length) return void list.replaceChildren(...users.map(userRow));
    const message = query
      ? t('沒有符合的備註')
      : t('還沒有備註。在評論區把滑鼠移到用戶名那一行點「備註」，或在空間頁點「＋ 備註」。');
    list.replaceChildren(h('div', { class: 'bga-empty' }, message));
  };

  /** 按 UID 新增：顺便查一下昵称和头像，查不到也照样保存 */
  const addByUid = async () => {
    const uid = uidInput.value.trim();
    const text = memoInput.value.trim();
    if (!/^\d+$/.test(uid)) return void toast(t('UID 只能是數字'), 'warn');
    if (!text) return void toast(t('請輸入備註'), 'warn');
    let profile = null;
    try {
      profile = (await dm.getJSON(`https://api.bilibili.com/x/web-interface/card?mid=${uid}`))?.data?.card;
    } catch {
      // 查不到昵称：只存 UID 和备注
    }
    memo.set(uid, text, profile?.name || '', profile?.face || '');
    uidInput.value = '';
    memoInput.value = '';
  };

  const exportMemos = () => {
    const json = JSON.stringify(memo.list(), null, 2);
    saveBlob(
      new Blob([json], { type: 'application/json' }),
      `bilibili-memo-${new Date().toISOString().slice(0, 10)}`,
      'json',
    );
  };
  const importFromFile = () => {
    pickTextFile('.json,application/json').then((text) => {
      if (text == null) return;
      try {
        toast(t`已匯入 ${importMemos(text)} 筆備註`, 'ok');
      } catch (error) {
        toast(t`匯入失敗：${error.message || t('JSON 格式錯誤')}`, 'warn');
      }
    });
  };

  searchInput.addEventListener('input', render);
  memoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addByUid();
  });
  store.on('biliUsers', () => {
    memo.refresh();
    render();
  });

  card.append(
    h(
      'div',
      { class: 'bga-row' },
      h(
        'div',
        { class: 'bga-bar', style: 'flex:1' },
        searchInput,
        h('button', { type: 'button', class: 'bga-btn', onclick: importFromFile }, t('匯入 JSON')),
        h('button', { type: 'button', class: 'bga-btn', onclick: exportMemos }, t('匯出')),
      ),
    ),
    h('div', { class: 'bga-row bga-col', style: 'padding:0' }, list),
    h(
      'div',
      { class: 'bga-row' },
      h(
        'div',
        { class: 'bga-bar', style: 'flex:1' },
        uidInput,
        memoInput,
        h('button', { type: 'button', class: 'bga-btn bga-primary', onclick: addByUid }, t('新增')),
      ),
    ),
  );
  render();
}
