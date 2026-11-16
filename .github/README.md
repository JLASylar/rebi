# Re:Bi

Make bilibili.com look the way you want: a little wider, a little cleaner, a little quieter.
把 B站調回你想要的樣子：寬一點、乾淨一點、安靜一點。

Website / 網站: <https://rebi.appleking.net/> · Privacy / 隱私: <https://rebi.appleking.net/privacy/>

Re:Bi is an independent tool and is not affiliated with Bilibili.

## What it does

- **Widescreen layout** — the player fills the window width; the navigation bar can sit below the player; controls hide until you need them.
- **Showcase home page** — the home page opens to a full poster of videos from the official charts.
- **Cleanup** — hide ads and promoted cards, strip tracking parameters from links, tone down clickbait words.
- **Comments** — show IP location and gender, add notes to users, block in one click.
- **Playback** — custom shortcuts, screenshots, frame stepping, remembered speed, rotate and mirror, loudness equalization.
- **Live** — hide the gift bar and rankings, check whether your danmaku was really sent.
- Danmaku lookup, home recommendation filters, quick cover saving.

Every feature has its own switch. The interface is available in 简体中文, 繁體中文, 粵語, English and 日本語.

Re:Bi collects no data, has no server and contains no analytics or advertising code.

## Install

- **Userscript** (Tampermonkey / Violentmonkey): [install `rebi.user.js`](https://raw.githubusercontent.com/JLASylar/rebi/main/dist/rebi.user.js)
- **Microsoft Edge**: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/gnnfaglbmagigkagbpgpnmagmcmnlich)
- **Chrome, Firefox, Safari**: coming soon, see the [website](https://rebi.appleking.net/#install).

## Build

Python 3.9+ only, no dependencies.

```
python3 tools/build.py          # userscript → dist/rebi.user.js
python3 tools/build.py --ext    # also the extensions → dist/extension/<chrome|firefox|safari>/
```

The build concatenates `src/js/NN-*.js` in file-name order, strips comments, and embeds the CSS (`src/css/`) and the translation tables (`src/i18n/`). Nothing is minified.

| Path | Contents |
|---|---|
| `src/product.json` | name, version, localized names and descriptions |
| `src/js/` | the page script, one module per file |
| `src/css/` | styles, switched on by tokens on `<html data-bga>` |
| `src/i18n/` | translations keyed by the Traditional Chinese source text |
| `src/platform/` | storage / request layer: one for userscript managers, one for extensions |
| `src/extension/` | manifest templates, bridge and background scripts, icons |
| `tools/build.py` | the build script |

## Thanks

The idea of the widescreen layout comes from [Wider Bilibili](https://github.com/posthumz/wider-bilibili) by posthumz.

## License

[MIT](../LICENSE)
