// ════════════════════════════ 评论区：IP 属地、性别 ════════════════════════════
// B站的接口返回里本来就带评论者的属地和性别，只是网页版不显示。这里把它们补到界面上。
// 备注在 52-memo.js。

TABS.push(['comments', t('評論區')], ['memo', t('備註')]);

defOpt('x.ip', true, {
  tab: 'comments',
  group: t('IP 屬地'),
  label: t('評論顯示 IP 屬地'),
  hint: t('影片、動態、專欄、番劇、直播等頁面的評論與回覆'),
  reload: true,
});
defOpt('x.ip.article', true, { tab: 'comments', group: t('IP 屬地'), label: t('專欄作者顯示 IP 屬地'), reload: true });
defOpt('locationReplacements', '{}', {
  tab: 'comments',
  group: t('IP 屬地'),
  type: 'text',
  label: t('屬地文字替換'),
  hint: t('JSON 鍵值對，例如 {"IP属地：":""} 可去掉前綴'),
});
defOpt('x.gender', true, {
  tab: 'comments',
  group: t('用戶標記'),
  label: t('評論顯示性別'),
  hint: t('資料來自評論介面，未公開性別的用戶不顯示'),
  reload: true,
});

/** 评论组件各自有 shadow root，页面的样式进不去：给每个 shadow root 补一份标记样式 */
const addMarkStyle = (shadowRoot) => {
  if (!shadowRoot || shadowRoot.querySelector('style[data-bga-style]')) return;
  const style = document.createElement('style');
  style.dataset.bgaStyle = 'marks';
  style.textContent = STYLES.marks;
  shadowRoot.appendChild(style);
};

// ── 属地文字 ──
/** 「屬地文字替換」选项 → [原文, 替换成] 的列表。选项的文字没变就用上次解析的结果 */
const locationReplacements = (() => {
  let source = null;
  let pairs = [];
  return () => {
    const text = val('locationReplacements') || '{}';
    if (text === source) return pairs;
    source = text;
    try {
      pairs = Object.entries(JSON.parse(text));
    } catch {
      pairs = [];
      warn(t('屬地文字替換不是合法 JSON，已忽略'));
    }
    return pairs;
  };
})();

/** 从一条评论的数据里取出属地文字（没有就是空字符串） */
const locationOf = (reply) => {
  let text = reply?.reply_control?.location;
  if (!text) return '';
  for (const [from, to] of locationReplacements()) text = text.replaceAll(from, String(to));
  return text;
};

// ── 新版评论（Lit 组件）──
/** 属地：写在每条评论底部那排按钮里，发布时间的后面 */
const showCommentLocation = () => {
  hookLit('bili-comment-action-buttons-renderer', (el) => {
    const pubdate = el.shadowRoot?.querySelector('#pubdate');
    if (!pubdate) return;
    const text = locationOf(el.data);
    let node = el.shadowRoot.querySelector('#location');
    if (!text) return void node?.remove();
    if (!node) {
      node = h('div', { id: 'location' });
      pubdate.insertAdjacentElement('afterend', node);
    }
    if (node.textContent !== text) node.textContent = text;
  });
};

/** 性别：写在评论者昵称的后面 */
const showCommentGender = () => {
  hookLit('bili-comment-user-info', (el) => {
    const info = el.shadowRoot?.querySelector('#info');
    const member = el.data?.member;
    if (!info || !member) return;
    addMarkStyle(el.shadowRoot);
    let mark = info.querySelector('.bga-gender');
    const male = member.sex === '男';
    if (!male && member.sex !== '女') return void mark?.remove();
    if (!mark) {
      mark = h('span', { class: 'bga-gender' });
      const name = info.querySelector('#user-name');
      if (name) name.insertAdjacentElement('afterend', mark);
      else info.appendChild(mark);
    }
    mark.textContent = male ? '♂' : '♀';
    mark.dataset.s = male ? 'm' : 'f';
    mark.title = t`性別：${male ? t('男') : t('女')}`;
  });
};

// ── 旧版评论（bbComment）：活动页、小黑屋，以及动态页的旧版式 ──
// 旧版评论的每一条是拼出来的 HTML 字符串。在拼好之后、插入页面之前，往时间那里补上属地。

/**
 * @param {string} html     一条评论的 HTML
 * @param {string} location 属地文字
 * @param {boolean} inline  true：时间在 <span class="time"> 里，属地接在里面；
 *                          false：时间在 <span class="reply-time"> 里，属地另起一个 span 跟在后面
 */
const stampLocation = (html, location, inline) => {
  const opening = `<span class="${inline ? 'time' : 'reply-time'}">`;
  const start = html.indexOf(opening);
  if (start < 0) return html;
  const closing = '</span>';
  const end = html.indexOf(closing, start + opening.length);
  if (end < 0) return html;
  if (inline) return `${html.slice(0, end)}&nbsp;&nbsp;${location}${html.slice(end)}`;
  const after = end + closing.length;
  return `${html.slice(0, after)}<span class="reply-location">${location}</span>${html.slice(after)}`;
};

const showLegacyCommentLocation = () => {
  // 活动页的评论把时间放在 .time 里；动态页和话题页用 .reply-time
  const inline = PAGE.www && PATH !== '/blackboard/feed-topic.html';
  onGlobal('bbComment', (bbComment) => {
    const proto = bbComment?.prototype;
    if (!proto || proto.__bgaPatched) return;
    proto.__bgaPatched = true;
    for (const builder of ['_createListCon', '_createSubReplyItem']) {
      const native = proto[builder];
      if (typeof native !== 'function') continue;
      proto[builder] = function (item, ...rest) {
        const html = native.call(this, item, ...rest);
        try {
          const location = locationOf(item).replace(/[<>&]/g, '');
          return location && typeof html === 'string' ? stampLocation(html, location, inline) : html;
        } catch {
          return html;
        }
      };
    }
  });
};

// ── 专栏 / 图文的作者属地 ──
const ARTICLE_INFO_API = 'https://api.bilibili.com/x/article/viewinfo';
const articleLocation = async (articleId) => {
  try {
    const response = await fetch(`${ARTICLE_INFO_API}?id=${articleId}`, { credentials: 'include' });
    return (await response.json())?.data?.location || '';
  } catch {
    return '';
  }
};

/** 旧版专栏页（/read/cv123）：属地写在发布时间后面 */
const showReadPageLocation = async (articleId) => {
  const location = await articleLocation(articleId);
  if (!location) return;
  const published = await waitFor(() => document.querySelector('.article-detail .publish-text'), '专栏发布时间').catch(
    () => null,
  );
  if (!published || published.parentElement?.querySelector('.bga-article-location')) return;
  published.insertAdjacentElement('afterend', h('span', { class: 'bga-article-location' }, `${location} · `));
};

/** 图文页（/opus/…）：专栏的编号在首屏数据里；作者栏会被重新渲染，所以属地要随时补回去 */
const showOpusPageLocation = () => {
  onGlobal('__INITIAL_STATE__', async (state) => {
    const basic = state?.detail?.basic;
    const isArticle = basic?.article_type === 0;
    if (!basic?.rid_str || !isArticle) return;
    const location = await articleLocation(basic.rid_str);
    if (!location) return;
    const text = `${location} · `;
    const paint = () => {
      const published = document.querySelector('.opus-module-author__pub');
      if (!published) return;
      let node = published.querySelector('.bga-article-location');
      if (!node) {
        node = h('span', { class: 'bga-article-location' });
        published.prepend(node);
      }
      if (node.textContent !== text) node.textContent = text;
    };
    await bodyReady();
    new MutationObserver(paint).observe(document.body, { childList: true, subtree: true });
    paint();
  });
};

function setupComments() {
  if (IS_TOP) addStyle(STYLES.marks, 'marks');

  if (val('x.ip')) {
    showCommentLocation();
    const hasLegacyComments = PAGE.t || (PAGE.www && /^\/(blackboard|blackroom)\//.test(PATH));
    if (hasLegacyComments) showLegacyCommentLocation();
  }
  if (val('x.gender')) showCommentGender();

  if (val('x.ip.article') && IS_TOP) {
    const articleId = PAGE.read && PATH.match(/\/cv(\d+)/)?.[1];
    if (articleId) showReadPageLocation(articleId);
    else if (PAGE.read || PAGE.opus) showOpusPageLocation();
  }
}
