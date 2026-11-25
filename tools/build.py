#!/usr/bin/env python3
"""把 src/ 组装成可安装的成品。

    python3 tools/build.py          油猴版        → dist/rebi.user.js
    python3 tools/build.py --ext    另外生成扩展  → dist/extension/<chrome|firefox|safari|safari-store>/（safari-store 不带下载，上架用）

源码结构：
    src/product.json            名称、版本、各语言的名称和说明（油猴头部和扩展 manifest 共用）
    src/userscript-header.txt   油猴头部模板
    src/platform/<目标>.js      平台层：存储、跨域请求、剪贴板、菜单（油猴 / 扩展各一份，接口相同）
    src/css/*.css               样式，按文件名并入成品，脚本里用 STYLES.<文件名> 取
    src/i18n/<语言>.json        译文表：{ 繁体原文: 译文 }，并入成品成为 I18N（python3 tools/build.py --keys 列出全部原文）
    src/js/NN-*.js              逻辑，按文件名顺序拼接，整体包在一个函数里
    src/extension/              扩展专用：manifest 模板、桥接脚本、后台脚本

成品里不留注释；src/ 里的注释照写，那是给维护的人看的。
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
DIST = ROOT / 'dist'
JSC = Path('/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc')
USERSCRIPT = DIST / 'rebi.user.js'


# ── 去注释 ─────────────────────────────────────────────────────────────────────

REGEX_MAY_FOLLOW = set('(,=:[!&|?{};+-*%<>~^\n')
REGEX_KEYWORDS = ('return', 'typeof', 'case', 'in', 'of', 'delete', 'void', 'throw', 'new', 'else', 'do')


def strip_js_comments(source: str) -> str:
    """去掉 JS 里的注释。逐字符扫描，分清代码、字符串、模板字符串（含 ${}）和正则字面量。"""
    out = []
    stack = []  # 模板字符串嵌套：'tpl' = 在模板文本里；数字 = ${ } 里的花括号深度
    i, n = 0, len(source)

    def previous_char() -> str:
        j = len(out) - 1
        while j >= 0 and out[j] in ' \t':
            j -= 1
        return out[j] if j >= 0 else '\n'

    def previous_word() -> str:
        match = re.search(r'([A-Za-z_$]+)$', ''.join(out[-12:]).rstrip())
        return match.group(1) if match else ''

    while i < n:
        char = source[i]
        if stack and stack[-1] == 'tpl':
            if char == '\\':
                out.append(source[i:i + 2])
                i += 2
            elif char == '`':
                stack.pop()
                out.append(char)
                i += 1
            elif source.startswith('${', i):
                stack.append(0)
                out.append('${')
                i += 2
            else:
                out.append(char)
                i += 1
            continue

        if char in '\'"':
            j = i + 1
            while source[j] != char:
                j += 2 if source[j] == '\\' else 1
            out.append(source[i:j + 1])
            i = j + 1
            continue
        if char == '`':
            stack.append('tpl')
            out.append(char)
            i += 1
            continue
        if stack and isinstance(stack[-1], int):
            if char == '{':
                stack[-1] += 1
            elif char == '}':
                if stack[-1] == 0:
                    stack.pop()
                    out.append(char)
                    i += 1
                    continue
                stack[-1] -= 1
        if source.startswith('//', i):
            end = source.find('\n', i)
            i = n if end < 0 else end
            continue
        if source.startswith('/*', i):
            i = source.index('*/', i) + 2
            continue
        if char == '/' and (previous_char() in REGEX_MAY_FOLLOW or previous_word() in REGEX_KEYWORDS):
            j, in_class = i + 1, False
            while True:
                c = source[j]
                if c == '\\':
                    j += 2
                    continue
                if c == '[':
                    in_class = True
                elif c == ']':
                    in_class = False
                elif c == '/' and not in_class:
                    break
                elif c == '\n':
                    raise SystemExit(f'正则字面量未闭合：{source[i:i + 60]!r}')
                j += 1
            out.append(source[i:j + 1])
            i = j + 1
            continue
        out.append(char)
        i += 1

    text = ''.join(out)
    text = re.sub(r'[ \t]+\n', '\n', text)   # 注释去掉后留下的行尾空白
    text = re.sub(r'\n{3,}', '\n\n', text)   # 连续空行压成一行
    text = re.sub(r'\{\n\n', '{\n', text)
    return text.strip('\n') + '\n'


def strip_css_comments(source: str) -> str:
    text = re.sub(r'/\*.*?\*/', '', source, flags=re.S)
    text = re.sub(r'[ \t]+\n', '\n', text)
    text = re.sub(r'\n{2,}', '\n', text)
    return text.strip()


# ── 组装 ───────────────────────────────────────────────────────────────────────

def as_template_literal(text: str) -> str:
    escaped = text.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    return f'`{escaped}`'


def css_table() -> str:
    """src/css/*.css → const STYLES = { 文件名: `…` }（不叫 CSS：那是浏览器自带的全局对象）"""
    entries = []
    for path in sorted((SRC / 'css').glob('*.css')):
        name = path.stem.replace('-', '_')
        entries.append(f'  {name}: {as_template_literal(strip_css_comments(path.read_text(encoding="utf-8")))},')
    return 'const STYLES = {\n' + '\n'.join(entries) + '\n};\n'


# ── 语言 ───────────────────────────────────────────────────────────────────────

LANGUAGES = ('zh-Hans', 'yue', 'en', 'ja')   # 繁体是源码里的原文，不需要译文表
T_CALL = re.compile(r"""\bt\(\s*('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\bt(`(?:\\.|[^`\\])*`)""")


def template_key(body: str) -> str:
    """模板字符串的内容 → 译文表的键：${…} 依次换成 {0}、{1}…"""
    out, i, index = [], 0, 0
    while i < len(body):
        if body.startswith('${', i):
            depth, i = 1, i + 2
            while depth:
                depth += {'{': 1, '}': -1}.get(body[i], 0)
                i += 1
            out.append('{%d}' % index)
            index += 1
        elif body[i] == '\\':
            out.append({'n': '\n'}.get(body[i + 1], body[i + 1]))
            i += 2
        else:
            out.append(body[i])
            i += 1
    return ''.join(out)


def i18n_keys() -> list:
    """源码里所有 t('…') / t`…` 的原文，按出现顺序、不重复。"""
    keys = {}

    def collect(code: str) -> None:
        for match in T_CALL.finditer(code):
            quoted, template = match.groups()
            if template:
                keys[template_key(template[1:-1])] = True
                collect(template[1:-1])   # ${ } 里面还可能有 t( )
            else:
                keys[json.loads('"' + quoted[1:-1].replace("\\'", "'").replace('"', '\\"') + '"')] = True

    for path in sorted((SRC / 'js').glob('[0-9][0-9]-*.js')):
        collect(strip_js_comments(path.read_text(encoding='utf-8')))
    return list(keys)


def i18n_table() -> str:
    """src/i18n/<语言>.json → const I18N = { 语言: { 原文: 译文 } }。缺译文或有多余的键就停。"""
    keys = i18n_keys()
    table, problems = {}, []
    for language in LANGUAGES:
        path = SRC / 'i18n' / f'{language}.json'
        entries = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
        problems += [f'{language} 缺译文：{key!r}' for key in keys if key not in entries]
        problems += [f'{language} 多余的键：{key!r}' for key in entries if key not in keys]
        for key, text in entries.items():
            if sorted(re.findall(r'\{\d+\}', key)) != sorted(re.findall(r'\{\d+\}', text)):
                problems.append(f'{language} 变量对不上：{key!r} → {text!r}')
        # 译文和原文一样的不用带进成品
        table[language] = {key: entries[key] for key in keys if key in entries and entries[key] != key}
    if problems:
        raise SystemExit('\n'.join(problems[:40]) + f'\n共 {len(problems)} 处译文问题')
    return f'const I18N = {json.dumps(table, ensure_ascii=False, separators=(",", ":"))};\n'


def read_all(directory: Path, pattern: str) -> list:
    return [path.read_text(encoding='utf-8') for path in sorted(directory.glob(pattern))]


def wrap(code: str, guard: str = '') -> str:
    """去注释，整体包进一个函数（各文件共用这一个作用域）。guard 是放在最前面的一句话。"""
    lines = ([guard] if guard else []) + strip_js_comments(code).splitlines()
    indented = '\n'.join(('  ' + line if line else '') for line in lines)
    return f"(function () {{\n  'use strict';\n\n{indented}\n}})();\n"


def page_script(target: str, product: dict, download: bool = True) -> str:
    """页面里运行的主脚本：构建信息、样式表、平台层、各模块。
    download=False：不带影片下载（Mac App Store 审核规则 5.2.3 不允许从第三方网站下载影音，商店版拿掉）"""
    build_info = {key: product[key] for key in ('name', 'version', 'author', 'homepage')} | {'target': target, 'download': download}
    parts = [f'const BUILD = {json.dumps(build_info, ensure_ascii=False)};\n', css_table(), i18n_table()]
    parts.append((SRC / 'platform' / f'{target}.js').read_text(encoding='utf-8'))
    parts += read_all(SRC / 'js', '[0-9][0-9]-*.js')
    # 扩展版：浏览器不认 world: "MAIN" 时这份脚本会被放进隔离环境（那里有扩展接口），此时什么都不做，
    # 由 bridge.js 改用 <script> 标签把它送进页面
    guard = "if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) return;" if target == 'extension' else ''
    return wrap('\n'.join(parts), guard)


def userscript_header(product: dict) -> str:
    template = (SRC / 'userscript-header.txt').read_text(encoding='utf-8')
    locales = product['locales']
    default = locales[product['defaultLocale']]
    # 管理器按浏览器语言挑 @name:xx / @description:xx，没有对应的就用不带后缀的那一行
    localized = []
    for field in ('name', 'description'):
        for locale, texts in locales.items():
            if locale != product['defaultLocale']:
                localized.append(f'// @{field + ":" + locale.replace("_", "-"):<12} {texts[field]}')
    values = product | {'name': default['name'], 'description': default['description'], 'localized': '\n'.join(localized)}
    for key, value in values.items():
        template = template.replace('{{' + key + '}}', str(value))
    return template.rstrip('\n') + '\n\n'


def check_syntax(path: Path) -> None:
    """用系统自带的 jsc 确认拼出来的文件语法没问题；有问题就停。"""
    if not JSC.exists():
        return
    script = (
        f"try {{ new Function(readFile({json.dumps(str(path))})); }} "
        "catch (e) { print('语法错误: ' + e + ' @' + e.line); quit(1); }"
    )
    if subprocess.run([str(JSC), '-e', script]).returncode:
        raise SystemExit(f'{path.relative_to(ROOT)} 语法检查没过')


def build_userscript(product: dict) -> None:
    DIST.mkdir(exist_ok=True)
    USERSCRIPT.write_text(userscript_header(product) + page_script('userscript', product), encoding='utf-8')
    check_syntax(USERSCRIPT)
    print(f'{USERSCRIPT.relative_to(ROOT)}  {USERSCRIPT.stat().st_size} 字节')


def build_extension(product: dict) -> None:
    """扩展版，每家浏览器一个目录，内容只有 manifest 不同：
        page.js        主脚本（和油猴版同一份模块，平台层换成 platform/extension.js）
        bridge.js      隔离环境里的桥
        background.js  后台脚本
    """
    ext_src = SRC / 'extension'
    base = json.loads((ext_src / 'manifest.json').read_text(encoding='utf-8'))
    base.update(version=product['version'], default_locale=product['defaultLocale'])
    shared = {
        'bridge.js': strip_js_comments((ext_src / 'bridge.js').read_text(encoding='utf-8')),
        'background.js': strip_js_comments((ext_src / 'background.js').read_text(encoding='utf-8')),
    }
    full = page_script('extension', product)
    # safari-store：上架 Mac App Store 用（tools/safari-store.sh），和 safari 一样但不带下载；
    # safari 目录给本机试用版（tools/build-safari.sh），保留下载
    variants = {'chrome': 'chrome', 'firefox': 'firefox', 'safari': 'safari', 'safari-store': 'safari'}
    for browser, manifest_name in variants.items():
        page = page_script('extension', product, download=False) if browser == 'safari-store' else full
        scripts = {'page.js': page} | shared
        out = DIST / 'extension' / browser
        if out.exists():
            shutil.rmtree(out)
        out.mkdir(parents=True)
        for name, code in scripts.items():
            (out / name).write_text(code, encoding='utf-8')
            check_syntax(out / name)
        # 名称和说明按浏览器语言显示：manifest 里写 __MSG_xx__，文字在 _locales/<语言>/messages.json
        for locale, texts in product['locales'].items():
            messages = {key: {'message': text} for key, text in texts.items()}
            (out / '_locales' / locale).mkdir(parents=True)
            (out / '_locales' / locale / 'messages.json').write_text(
                json.dumps(messages, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        if (ext_src / 'icons').is_dir():
            shutil.copytree(ext_src / 'icons', out / 'icons')
        manifest = base | json.loads((ext_src / f'manifest.{manifest_name}.json').read_text(encoding='utf-8'))
        (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'{out.relative_to(ROOT)}/')


def main() -> None:
    if '--keys' in sys.argv:
        print(json.dumps(i18n_keys(), ensure_ascii=False, indent=0))
        return
    product = json.loads((SRC / 'product.json').read_text(encoding='utf-8'))
    build_userscript(product)
    if '--ext' in sys.argv:
        build_extension(product)


if __name__ == '__main__':
    main()
