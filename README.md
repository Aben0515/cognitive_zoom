# 🔍 Cognitive Zoom (認知縮放) — DSH 技能插件

> **像 Google Maps 一樣，對話內容可以用滾輪「無段放大縮小」**：
> 縮到最小只剩 1 句話總結；放到最大可以看到底層 Syscall、記憶體對齊與組合語言。

本專案為 **DeepSeek Harness (DSH) 原生技能插件**。
安裝後，DSH 的 AI 代理人將具備「認知縮放（Multi-resolution Content Rendering）」能力：
一次性生成五層階層 AST，並以純 Node 腳本編譯出單一獨立、可無段縮放的可互動 HTML 卡片，透過 DSH 原生 `present` 交付給使用者。

- **不需要額外 API Key**：直接調用 DSH 當前會話模型。
- **純 Node.js 原生**：零外部建置工具（No Webpack/Vite），腳本直接運行。
- **單一獨立 HTML 視圖**：Marked、DOMPurify、Highlight.js 完全內嵌，隨開即用。

---

## 📦 安裝至 DeepSeek Harness (DSH)

### 方式一：從 GitHub 安裝（發布後推薦）
在 DSH 插件市集搜尋或直接輸入 GitHub 來源：
```bash
github:Aben0515/cognitive_zoom
```

### 方式二：本機開發模式（Local Link）
若欲在本機開發調試，只需編輯 DSH 配置檔 `~/.dsh/profiles/desktop/package.json`：
1. 在 `dependencies` 加入本機路徑：
   ```json
   "dependencies": {
     "cognitive-zoom-dsh": "link:C:\\Users\\yuana\\Desktop\\DSH\\plugin\\cognitive-zoom-dsh"
   }
   ```
2. 在 `dsh.profile.bundles` 清單加入套件名稱：
   ```json
   "bundles": [
     ...,
     "cognitive-zoom-dsh"
   ]
   ```
3. 重啟 DSH 即可在可用技能清單中看見 `cognitive-zoom`！

---

## 💬 在 DSH 中使用

直接在 DSH 對話框輸入：
> 請用認知縮放解說：什麼是 epoll？跟 select 差在哪？

或：
> 簡要回答並給我深入選項：Python 字典的底層實作是什麼？

AI 將會：
1. 在對話中直接給出 **L0 衛星視角（一句話總結）** 與 **L1 城市視角（重點卡片 + 行動指引）**。
2. 背景產生完整的 5 層 AST。
3. 自動呼叫 `scripts/render.mjs` 編譯出 `zoom-viewer.html`。
4. 調用 DSH 原生 `present` 工具，在回覆下方展示**可互動視圖卡片**！

---

## ⌨️ 互動視圖操作特性

- **認知滑桿 (Cognitive Slider)**：固定於右上角，0.0 至 4.0 連續滑動。
- **Ctrl + 滾輪**：以游標為錨點進行無段縮放（位移飄移 < 1px）。
- **Alt + 滾輪**：局部縮放（只縮放游標所在的子樹）。
- **快捷鍵**：鍵盤數字 `0`–`4`、`+` / `-`。
- **語法高亮**：內建 Highlight.js 支援 C、Rust、Python、x86asm。
- **深淺色主題**：右上角一鍵切換。

---

## 🧪 測試驗證

```bash
cd cognitive-zoom-dsh
npm test
```
執行 Node.js 驗證腳本，測試 AST 結構驗證與獨立 HTML 模板編譯。

---

## 📄 開源授權

本專案採用 [MIT License](LICENSE) 授權。
