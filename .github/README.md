# Re:Bi 比利重啟

把 B站調回你想要的樣子：寬一點、乾淨一點、安靜一點。

網站：<https://rebi.appleking.net/> · 隱私說明：<https://rebi.appleking.net/privacy/>

Re:Bi 是獨立開發的工具，與嗶哩嗶哩沒有隸屬或合作關係。

## 功能

- **寬屏版面**：播放器撐滿視窗寬度，導航欄可以讓到播放器下面，控制欄平時收起、靠近才出現。選集可以顯示每一集的封面。
- **大寶鑑首頁**：打開首頁就是一整幅海報，官方榜單的影片輪流登場。
- **導航欄**：整條換成同一套圓角方磚，每個頁面都一樣；搜尋建議與熱搜、消息／動態／收藏／歷史的預覽、從頭像打開的個人卡片，左右兩邊都能收起。
- **淨化**：隱藏廣告和推廣卡片，去掉網址裡的追蹤參數，淡化標題黨用詞。
- **評論區**：顯示 IP 屬地和性別，給用戶寫備註，一鍵拉黑。
- **播放**：自訂快捷鍵、截圖、逐幀、記住倍速、畫面旋轉與鏡像、響度均衡。
- **直播**：畫面鋪滿頁面，收起禮物欄、榜單和側邊按鈕，檢查彈幕有沒有真的發出。
- 彈幕查詢、首頁推薦過濾、封面快速保存。

每項功能都有自己的開關。介面有五種語言：简体中文、繁體中文、粵語、English、日本語。

Re:Bi 不收集任何資料，沒有伺服器，也不含統計或廣告程式碼。

## 安裝

- **Chrome**：[Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/pbgbghbolgmdjbmahdnfnpdijoenpfaj)
- **Microsoft Edge**：[Edge 擴充功能商店](https://microsoftedge.microsoft.com/addons/detail/gnnfaglbmagigkagbpgpnmagmcmnlich)
- **Firefox**：[Firefox 附加元件](https://addons.mozilla.org/firefox/addon/re-bi-%E6%AF%94%E5%88%A9%E9%87%8D%E5%95%9F/)
- **Safari**：即將上架，見[網站的安裝區](https://rebi.appleking.net/#install)。
- **油猴腳本**（Tampermonkey／Violentmonkey）：[安裝 `rebi.user.js`](https://raw.githubusercontent.com/JLASylar/rebi/main/dist/rebi.user.js)，或到 [Greasy Fork](https://greasyfork.org/scripts/605751)。

## 建置

只需要 Python 3.9 以上，沒有其他相依套件。

```
python3 tools/build.py          # 油猴腳本 → dist/rebi.user.js
python3 tools/build.py --ext    # 連同擴充功能 → dist/extension/<chrome|firefox|safari>/
```

建置會把 `src/js/NN-*.js` 按檔名順序接起來、去掉註釋，再嵌入樣式（`src/css/`）和譯文表（`src/i18n/`）。成品不做壓縮混淆。

| 路徑 | 內容 |
|---|---|
| `src/product.json` | 名稱、版本、各語言的名稱與簡介 |
| `src/js/` | 頁面腳本，一個模組一個檔案 |
| `src/css/` | 樣式，由 `<html data-bga>` 上的記號開關 |
| `src/i18n/` | 譯文表，以繁體中文原文為鍵 |
| `src/platform/` | 儲存與請求層：腳本管理器一份，擴充功能一份 |
| `src/extension/` | manifest 範本、橋接與背景腳本、圖示 |
| `tools/build.py` | 建置腳本 |

## 致謝

寬屏版面的思路來自 posthumz 的 [Wider Bilibili](https://github.com/posthumz/wider-bilibili)。

導航欄的線條圖示來自 [Tabler Icons](https://github.com/tabler/tabler-icons)（MIT License，Copyright (c) 2020-2024 Paweł Kuna）。

## 授權

原始碼公開，採用 [PolyForm Noncommercial License 1.0.0](../LICENSE)：

- 個人使用、學習、研究、修改、非營利的分享，都可以，不用問。
- **不可以用於商業用途**：不能販售，也不能放進營利的產品或服務。需要商業授權請聯絡作者。
- 散布或修改時要保留授權檔裡的著作權聲明。
