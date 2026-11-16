// ════════════════════════════ 设置面板：弹幕查询页 ════════════════════════════
// 按关键字列出当前影片的弹幕，点「反查」由弹幕里的哈希算出发送者的 UID（引擎在 62-danmaku.js）。

function renderDanmakuPage(page) {
  const card = groupCard(page, t('查詢'));
  if (!(PAGE.www && document.getElementById('bilibili-player'))) {
    card.appendChild(h('div', { class: 'bga-empty' }, t('請在影片 / 番劇播放頁打開這一頁。')));
    return;
  }

  const MAX_ROWS = 500;
  const keywordInput = h('input', { class: 'bga-input', type: 'search', placeholder: t('關鍵字（留空列出全部彈幕）') });
  const searchButton = h('button', { type: 'button', class: 'bga-btn bga-primary' }, t('搜尋'));
  const resolveAllButton = h('button', { type: 'button', class: 'bga-btn', hidden: true }, t('反查全部發送者'));
  const status = h('div', { class: 'bga-hint', style: 'padding:0 14px 8px' }, '');
  const results = h('div', { class: 'bga-list', style: 'max-height:340px' });
  /** 每次搜索换一个新的；旧的标成已取消，正在跑的反查就会停下 */
  let signal = { cancelled: false };

  /** 把「发送者」那一格从按钮换成反查的结果 */
  const resolveSender = async (cell, hash) => {
    cell.textContent = t('反查中…');
    const uid = await dm.crack(hash, 1e8, signal);
    if (!cell.isConnected) return;
    if (!uid) {
      cell.textContent = t('查不到');
      cell.title = t('UID 超過 11 位（2022 年後註冊的 16 位 UID）無法由彈幕反查');
      return;
    }
    const note = memo.get(uid);
    cell.replaceChildren(
      h(
        'a',
        { href: `https://space.bilibili.com/${uid}`, target: '_blank', rel: 'noopener' },
        note ? `${uid}（${note}）` : uid,
      ),
    );
  };

  /** 时间戳 → 当地日期 2024-03-01 */
  const localDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Date(timestamp - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const jumpTo = (second) => {
    const video = mainVideo();
    if (video) video.currentTime = second;
  };

  const resultTable = (rows) => {
    const senderCells = [];
    const tbody = h('tbody');
    for (const row of rows) {
      const sender = h('td', {});
      sender.appendChild(
        h('button', { type: 'button', class: 'bga-link', onclick: () => resolveSender(sender, row.hash) }, t('反查')),
      );
      senderCells.push([sender, row.hash]);
      tbody.appendChild(
        h(
          'tr',
          {},
          h(
            'td',
            {},
            h(
              'button',
              { type: 'button', class: 'bga-link', title: t('跳到這個時間'), onclick: () => jumpTo(row.second) },
              dm.fmt(row.second),
            ),
          ),
          h('td', { class: 'bga-dm-text' }, row.text),
          h('td', {}, localDate(row.ts)),
          sender,
        ),
      );
    }
    const head = h(
      'thead',
      {},
      h('tr', {}, ...[t('時間'), t('彈幕'), t('日期'), t('發送者')].map((title) => h('th', {}, title))),
    );
    return { table: h('table', {}, head, tbody), senderCells };
  };

  /** 逐条反查所有还没查过的发送者；换了一次搜索就停 */
  const resolveAll = async (senderCells) => {
    const mySignal = signal;
    resolveAllButton.disabled = true;
    let done = 0;
    for (const [cell, hash] of senderCells) {
      if (mySignal.cancelled) break;
      done += 1;
      resolveAllButton.textContent = t`反查中 ${done}/${senderCells.length}`;
      if (!cell.querySelector('a')) await resolveSender(cell, hash);
    }
    resolveAllButton.disabled = false;
    resolveAllButton.textContent = t('反查全部發送者');
  };

  const search = async () => {
    signal.cancelled = true;
    signal = { cancelled: false };
    searchButton.disabled = true;
    resolveAllButton.hidden = true;
    status.textContent = t('載入彈幕中…');
    results.replaceChildren();
    try {
      const rows = await dm.search(keywordInput.value.trim());
      const shown = rows.slice(0, MAX_ROWS);
      const truncated = rows.length > shown.length ? t`，只顯示前 ${shown.length} 條（加關鍵字縮小範圍）` : '';
      status.textContent = t`共 ${rows.length} 條${truncated}。點時間跳轉，點「反查」取得發送者（結果是 CRC32 對應的最小 UID；16 位新 UID 查不到或可能對應到別人）。`;
      if (!rows.length) {
        results.replaceChildren(h('div', { class: 'bga-empty' }, t('沒有符合的彈幕')));
        return;
      }
      const { table, senderCells } = resultTable(shown);
      results.replaceChildren(table);
      resolveAllButton.hidden = false;
      resolveAllButton.onclick = () => resolveAll(senderCells);
    } catch (error) {
      status.textContent = t`查詢失敗：${error.message || error}`;
    } finally {
      searchButton.disabled = false;
    }
  };

  searchButton.addEventListener('click', search);
  keywordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') search();
  });
  card.append(
    h(
      'div',
      { class: 'bga-row' },
      h('div', { class: 'bga-bar', style: 'flex:1' }, keywordInput, searchButton, resolveAllButton),
    ),
    status,
    h('div', { class: 'bga-row bga-col', style: 'padding:0' }, results),
  );
}
