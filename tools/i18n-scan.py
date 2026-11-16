#!/usr/bin/env python3
"""列出 src/js、src/platform 里所有带中文的字符串字面量（注释除外），做翻译时用来核对有没有漏。

    python3 tools/i18n-scan.py            全部列出
    python3 tools/i18n-scan.py --missing  只列没包在 t( ) / t` ` 里、也不在登记表字段里的
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from build import SRC, strip_js_comments  # noqa: E402

LITERAL = re.compile(r"'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|`(?:\\.|[^`\\])*`")
CJK = re.compile(r'[぀-ヿ一-鿿]')
FIELD = re.compile(r'\b(label|hint|group|unit|placeholder|button)\s*:\s*$')

only_missing = '--missing' in sys.argv
for path in sorted(list((SRC / 'js').glob('*.js')) + list((SRC / 'platform').glob('*.js'))):
    code = strip_js_comments(path.read_text(encoding='utf-8'))
    for match in LITERAL.finditer(code):
        text = match.group(0)
        if not CJK.search(text):
            continue
        before = code[max(0, match.start() - 40):match.start()]
        wrapped = bool(re.search(r'\bt\(\s*$', before)) or before.endswith('t') and text[0] == '`'
        if only_missing and (wrapped or FIELD.search(before)):
            continue
        print(f'{path.name}: {text}')
