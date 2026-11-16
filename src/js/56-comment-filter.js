// ════════════════════════════ 评论区：快速拉黑、关键词屏蔽 ════════════════════════════
// 两项都默认关闭。拉黑走 B站自己的黑名单（和卡片工具列的拉黑是同一个接口）；
// 关键词屏蔽只是不显示，不会告诉 B站。

defOpt('x.cmt.block', false, {
  tab: 'comments',
  group: t('評論過濾'),
  label: t('評論區快速拉黑'),
  hint: t(
    '滑鼠移到評論的用戶名那一行，出現「拉黑」；點一下加入 B站黑名單並收起他的評論；誤點的話到 B站的「黑名單」裡移除。需要已登入',
  ),
});
defOpt('x.cmt.words', '', {
  tab: 'comments',
  group: t('評論過濾'),
  type: 'text',
  keep: true,
  label: t('評論含有這些詞就隱藏'),
  hint: t('留空 = 不啟用。每行一個詞；也可以寫 /正則/。評論和樓中樓回覆都會比對'),
  placeholder: t('加微信\n/私信.{0,4}领取/'),
});

defOpt('x.cmt.noGoods', false, {
  tab: 'comments',
  group: t('評論過濾'),
  label: t('隱藏帶貨評論'),
  hint: t('評論裡帶有商品連結（藍色的購物車連結）就整條收起，常見於 UP 主置頂的工商廣告'),
});

function setupCommentFilter() {
  /** 这次会话里拉黑的用户：uid → 昵称 */
  const blockedHere = new Map();
  let patterns = [];

  const shouldHide = (reply) => {
    if (!reply) return false;
    if (blockedHere.has(String(reply.member?.mid ?? reply.mid ?? ''))) return true;
    const text = reply.content?.message || '';
    return patterns.length > 0 && !!text && matchesAny(patterns, text);
  };
  /** 评论组件渲染后：该藏的把整个组件藏掉。组件会被复用，所以不该藏的要恢复 */
  const applyTo = (el) => {
    const hide = el.hasAttribute('data-bga-goods') || shouldHide(el.data);
    if (hide !== el.hasAttribute('data-bga-hidden')) {
      el.toggleAttribute('data-bga-hidden', hide);
      el.style.display = hide ? 'none' : '';
    }
  };
  const COMMENT_TAGS = ['bili-comment-thread-renderer', 'bili-comment-reply-renderer'];
  for (const tag of COMMENT_TAGS) hookLit(tag, applyTo);
  const reapply = () => {
    for (const tag of COMMENT_TAGS) deepQueryAll(tag).forEach((el) => safe(() => applyTo(el), '评论过滤'));
  };

  // ── 带货评论：正文里有商品链接 ──
  // 商品链接（a[data-type="goods"]）在评论数据里看不出来，要等正文渲染出来才有；
  // 正文在评论组件里面隔着几层 shadow DOM，而且比评论本身晚一点才渲染好，所以渲染后隔一会儿再看两次。
  const hasGoodsLink = (thread) => {
    // 楼中楼回复也在主评论的组件里：只看主评论自己的正文
    const main = thread.shadowRoot?.querySelector('bili-comment-renderer')?.shadowRoot;
    if (!main) return false;
    return deepQueryAll('bili-rich-text', main).some((richText) =>
      richText.shadowRoot?.querySelector('a[data-type="goods"]'),
    );
  };
  const checkGoods = (comment) => {
    const hasGoods = !!val('x.cmt.noGoods') && hasGoodsLink(comment);
    if (hasGoods === comment.hasAttribute('data-bga-goods')) return;
    comment.toggleAttribute('data-bga-goods', hasGoods);
    applyTo(comment);
  };
  hookLit('bili-comment-thread-renderer', (thread) => {
    if (!val('x.cmt.noGoods') && !thread.hasAttribute('data-bga-goods')) return;
    for (const delay of [0, 600, 2000]) setTimeout(() => safe(() => checkGoods(thread), '带货评论'), delay);
  });
  store.on('x.cmt.noGoods', () => {
    for (const thread of deepQueryAll('bili-comment-thread-renderer')) safe(() => checkGoods(thread), '带货评论');
  });

  watch('x.cmt.words', (text) => {
    patterns = parseWordList(text);
    if (document.body) reapply();
  });

  // ── 快速拉黑 ──
  const toggleBlock = async (uid, name, block) => {
    if (!loginCsrf()) return void toast(t('要先登入 B站才能拉黑'), 'warn');
    try {
      await setUserBlocked(uid, block);
      if (block) blockedHere.set(uid, name);
      else blockedHere.delete(uid);
      reapply();
      toast(block ? t`已拉黑「${name || uid}」，他的評論已收起` : t`已取消拉黑「${name || uid}」`, 'ok', 3200);
    } catch (error) {
      toast(t`拉黑失敗：${error.message || error}`, 'warn');
    }
  };
  hookLit('bili-comment-user-info', (el) => {
    const info = el.shadowRoot?.querySelector('#info');
    if (!info) return;
    let button = info.querySelector('.bga-cmt-block');
    if (!val('x.cmt.block')) return void button?.remove();
    if (button) return;
    addMarkStyle(el.shadowRoot);
    button = h('span', { class: 'bga-cmt-block', title: t('加入 B站黑名單') }, t('拉黑'));
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      // 组件会被复用到别的评论上：点的时候再取当前的用户
      const member = el.data?.member;
      if (member?.mid) toggleBlock(String(member.mid), member.uname, true);
    });
    info.appendChild(button);
  });
  store.on('x.cmt.block', () => {
    for (const el of deepQueryAll('bili-comment-user-info')) el.requestUpdate?.();
  });
}
