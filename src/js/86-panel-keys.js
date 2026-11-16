// ════════════════════════════ 设置面板：快捷键页 ════════════════════════════
// 点一下键位按钮，再按下新的组合。Esc 取消，Delete 停用，右键还原预设。

/** 存一个键位：和预设一样就不存；combo 为空字符串表示停用 */
const saveHotkey = (hotkey, combo) => {
  const custom = { ...keyMap() };
  if (combo === hotkey.def) delete custom[hotkey.id];
  else custom[hotkey.id] = combo;
  if (Object.keys(custom).length) store.set('x.keys', custom);
  else store.del('x.keys');
};

function renderKeysPage(page) {
  const repaints = [];

  const keyButton = (hotkey) => {
    const button = h('button', { type: 'button', class: 'bga-btn bga-key' }, '');
    const paint = () => {
      const combo = keyOf(hotkey);
      button.textContent = comboText(combo) || t('未設定');
      button.toggleAttribute('data-off', !combo);
    };
    repaints.push(paint);
    paint();

    button.addEventListener('click', () => {
      if (keyCapturing) return;
      keyCapturing = true;
      button.textContent = t('按下按鍵…');
      button.setAttribute('data-rec', '');

      const finish = () => {
        keyCapturing = false;
        button.removeAttribute('data-rec');
        window.removeEventListener('keydown', onKey, true);
        document.removeEventListener('pointerdown', onPointerDown, true);
        panel.removeEventListener('toggle', finish);
        paint();
      };
      const onKey = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.code === 'Escape') return finish();
        const noModifier = !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
        if (noModifier && (event.code === 'Backspace' || event.code === 'Delete')) {
          saveHotkey(hotkey, '');
          return finish();
        }
        const combo = comboOf(event);
        if (!combo) return; // 只按了修饰键：继续等
        const taken = HOTKEYS.find((other) => other !== hotkey && keyOf(other) === combo);
        if (taken) toast(t`${comboText(combo)} 已經給「${taken.label}」用了`, 'warn');
        else saveHotkey(hotkey, combo);
        finish();
      };
      // Safari 点按钮不给它焦点，靠 blur 结束录入会卡死：改成点别处、面板关闭都结束
      const onPointerDown = (event) => {
        if (event.target !== button) finish();
      };
      window.addEventListener('keydown', onKey, true);
      document.addEventListener('pointerdown', onPointerDown, true);
      panel.addEventListener('toggle', finish);
    });
    return button;
  };

  for (const hotkey of HOTKEYS) {
    const row = panelRow({ label: hotkey.label, hint: hotkey.hint, control: keyButton(hotkey) });
    row.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      saveHotkey(hotkey, hotkey.def);
      toast(t`「${hotkey.label}」已還原預設`);
    });
    groupCard(page, hotkey.group).appendChild(row);
  }
  store.on('x.keys', () => repaints.forEach((paint) => paint()));

  page.appendChild(
    h(
      'div',
      { class: 'bga-hint', style: 'margin:14px 12px 0' },
      t(
        '點按鈕後按下新的按鍵組合。Esc 取消，Delete 停用，右鍵還原預設。打字時單鍵快捷鍵不會觸發；和 B站原有按鍵相同時，以這裡的為準。',
      ),
    ),
  );
}
