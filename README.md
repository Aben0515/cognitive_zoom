# 🔍 Cognitive Zoom (認知縮放) — DSH 技能插件

> **像 Google Maps 一樣縮放閱讀密度**：
> 縮到最小只剩 1 句話結論；放到最大可以看到底層 Syscall、記憶體對齊與組合語言。

本專案是 **DeepSeek Harness (DSH)** 的技能插件。安裝後，DSH 的 AI 會用五層密度回答技術問題，你可以用滑桿或 Ctrl + 滾輪決定要看到多深。

- **不需要額外 API Key**：直接使用 DSH 當前會話的模型。
- **純 Node.js**：沒有建置步驟，腳本直接執行。
- **零外部 CDN**：匯出的 HTML 內嵌 Marked、DOMPurify、Highlight.js、Mermaid，離線也能開。

## 五層密度

| 層級 | 名稱 | 內容 |
|---|---|---|
| L0 | 🛰️ 衛星 | 一句話結論（≤ 40 字） |
| L1 | 🏙️ 城市 | 3–5 個重點 + 行動建議 |
| L2 | 🛣️ 街道 | 標準解說 + 可執行的程式碼 |
| L3 | 🏗️ 建築 | 設計原理、複雜度、邊界與陷阱 |
| L4 | 🔬 顯微鏡 | Syscall 與暫存器、struct 欄位與對齊、組合語言 |

各層的詳細定義見 [`density-rubric.md`](skills/cognitive-zoom/references/density-rubric.md)。

---

## 📦 安裝

### 方式一：從 GitHub 安裝

在 DSH 的插件市集輸入 GitHub 來源：

```
github:Aben0515/cognitive_zoom
```

指定版本（tag）：

```
github:Aben0515/cognitive_zoom#v0.1.1
```

> **更新**：從 GitHub 安裝會釘在安裝當下的 commit。DSH 桌面版目前只有開關，沒有更新按鈕，要更新請先「卸載」再用上面的來源重新安裝，然後重啟 DSH。

### 方式二：本機開發（Local Link）

編輯 DSH 設定檔 `~/.dsh/profiles/desktop/package.json`：

1. 在 `dependencies` 加入本機路徑（改成你自己的路徑）：
   ```json
   "dependencies": {
     "cognitive-zoom-dsh": "link:/path/to/cognitive_zoom"
   }
   ```
2. 在 `dsh.profile.bundles` 加入套件名稱：
   ```json
   "bundles": [
     "cognitive-zoom-dsh"
   ]
   ```
3. 重啟 DSH。

---

## 💬 使用方式

直接在 DSH 對話框輸入，例如：

> 請用認知縮放解說：什麼是 epoll？跟 select 差在哪？

> 簡要回答並給我深入選項：Python 字典的底層實作是什麼？

### 預設：對話內嵌

AI 直接在對話框內輸出完整五層：

- L0、L1、L2 直接顯示。
- L3、L4 以原生 `<details>` 摺疊，點開即可展開。
- 不會彈出外部網頁或側邊欄卡片。

插件同時在 DSH 頂部標題列加入**認知縮放滑桿**（L0–L4，整數）：

- **拖動滑桿**：L3 / L4 摺疊區塊依等級自動展開或收合（≥ 3 展開 L3，≥ 4 展開 L4）。
- **Ctrl + 滾輪**：在 DSH 內每次切換一級。

### 可選：匯出互動式 HTML

只有在你明確要求「匯出成檔案」或「下載 HTML」時，AI 才會產生獨立視圖：

1. AI 把五層內容寫成 AST（`ast.json`，格式見 [`ast-schema.md`](skills/cognitive-zoom/references/ast-schema.md)）。
2. 執行：
   ```bash
   node skills/cognitive-zoom/scripts/render.mjs ast.json --out zoom-viewer.html
   ```
3. 透過 DSH 的 `present` 工具交付。

互動視圖操作：

| 操作 | 效果 |
|---|---|
| 右上角滑桿 | 0.0–4.0 連續縮放（步進 0.05），小數部分控制下一層的淡入 |
| Ctrl + 滾輪 | 以游標位置為錨點縮放，每次 0.25 |
| Alt + 滾輪 | 只縮放游標所在的子樹，每次 0.5 |
| 鍵盤 `0`–`4` | 直接跳到該層級 |
| 鍵盤 `+` / `-` | 縮放 0.5 |
| 主題按鈕 | 深色 / 淺色切換 |

可先開啟預編譯範例：[`sample-viewer.html`](skills/cognitive-zoom/examples/sample-viewer.html)。

---

## 🗂️ 專案結構

```
.
├── package.json              # DSH 插件清單
├── cordis.patch.yml          # 註冊 skills/ 與前端 client
├── lib/
│   ├── index.js              # 入口，供 DSH 解析套件路徑
│   └── client.js             # DSH 頂部標題列的縮放滑桿與 Ctrl+滾輪
└── skills/cognitive-zoom/
    ├── SKILL.md              # 技能指令（教 AI 輸出五層格式）
    ├── scripts/              # render.mjs（AST → HTML）、validate.mjs、測試
    ├── assets/               # HTML 模板與內建的 vendor 函式庫
    ├── references/           # 密度規範、AST schema
    └── examples/             # 範例 AST 與預編譯 HTML
```

---

## 🧪 測試

```bash
npm test
```

執行 `render.test.mjs`，驗證 AST 結構檢查與 HTML 編譯。需要 Node.js ≥ 20，不需要 `npm install`。

---

## 📄 授權

[MIT License](LICENSE)
