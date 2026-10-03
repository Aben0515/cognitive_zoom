# 📋 Cognitive Zoom DSH 插件 — 給 Claude 的 GitHub 發布與交接說明 (HANDOFF.md)

> **致接手的 Claude**：
> 本資料夾 `cognitive-zoom-dsh/` 已將「腦洞十四：認知負荷自適應縮放（Cognitive Flow Zoom）」完整打包為 **DeepSeek Harness (DSH) 原生技能插件**（架構與 `agent-senate-dsh` 及 `@tt-a1i/archify-dsh` 完全一致）。
> 
> 使用者指示：**「把這個 plug in 做成可以直接在 DSH 插件輸指令安裝的樣子、放上 GitHub 的部分我給 Claude 做」**。
> 本文件說明此插件的架構、運作原理、以及如何協助使用者建立 GitHub 倉庫並完成發布與安裝。

---

## 1. 專案檔案清單與功能

```
cognitive-zoom-dsh/
├── package.json               # DSH npm 插件清單。name="cognitive-zoom-dsh"；dsh.bundle.patch 指向 cordis.patch.yml
├── cordis.patch.yml           # 告訴 DSH：使用 @deepseek-ai/dsh-skill-filesystem 將 skills/ 註冊為技能
├── lib/index.js               # 入口模組；匯出 resolveCognitiveZoomSkillRoot 供 DSH 解析套件路徑
├── LICENSE                    # MIT License
├── README.md                  # 面向使用者的完整安裝與使用手冊
├── HANDOFF.md                 # 本交接文件
└── skills/cognitive-zoom/
    ├── SKILL.md               # ★ DSH 技能指令：教導 AI 如何建構五層 AST 並透過 render.mjs 產出獨立 HTML
    ├── scripts/
    │   ├── render.mjs         # ★ 純 Node 渲染器：將 AST JSON 編譯為 100% 內聯獨立 HTML 視圖 (~195KB)
    │   ├── render.test.mjs    # 單元測試 (node test)
    │   └── validate.mjs       # AST 結構與不可跳層規則校驗器
    ├── assets/
    │   ├── viewer.template.html # 包含認知滑桿、Ctrl+滾輪無段淡入、錨點保持之單檔 HTML 模板
    │   └── vendor/            # 內建 marked, DOMPurify, highlight.js, github-dark.css (完全零外部 CDN)
    ├── references/
    │   ├── density-rubric.md  # L0–L4 各層詳細字數與內容定義
    │   └── ast-schema.md      # AST JSON Schema 規範
    └── examples/
        ├── sample-epoll.json  # 範例輸入資料 (epoll vs select 五層真實細節)
        └── sample-viewer.html # 預編譯的示範交付物 (可直接以瀏覽器打開預覽)
```

---

## 2. DSH 原生運作機制

### 不需要額外 API Key，使用 DSH 當前模型
與需要使用者自備 API Key 的外掛不同，DSH 技能插件是直接運行在 DSH 會話內部的：
1. 當使用者在 DSH 說「用認知縮放解說：...」時，DSH 載入 `skills/cognitive-zoom/SKILL.md`。
2. DSH 當前會話模型（如 Gemini / DeepSeek）遵循 `SKILL.md` 規範，直接生成五層 AST 物件，寫入 `<工作目錄>/ast.json`。
3. Agent 呼叫 `node <skill_dir>/scripts/render.mjs ast.json --out zoom-viewer.html`。
4. Agent 調用 DSH 原生工具 `present`：
   ```json
   {
     "files": [
       {
         "path": "zoom-viewer.html",
         "description": "認知縮放可互動視圖"
       }
     ]
   }
   ```
5. **DSH Web GUI 介面立即在訊息下方彈出該視圖卡片**，使用者可點擊預覽或直接使用右上角滑桿無段放大縮小！

---

## 3. GitHub 發布指引（請 Claude 協助使用者執行）

請引導使用者在終端機中將此目錄發布為獨立的 GitHub 倉庫：

```bash
# 1. 進入插件目錄
cd C:\Users\yuana\Desktop\DSH\plugin\cognitive-zoom-dsh

# 2. 初始化 Git 倉庫
git init -b main

# 3. 提交所有檔案
git add .
git commit -m "feat: initial release of cognitive-zoom-dsh v0.1.0"

# 4. 關聯到使用者在 GitHub 上建立的新倉庫 (建議名稱: cognitive-zoom-dsh)
git remote add origin https://github.com/<使用者名稱>/cognitive-zoom-dsh.git
git push -u origin main
```

---

## 4. DSH 安裝指令（發布後讓使用者在 DSH 安裝）

倉庫推送到 GitHub 後，使用者即可在 DSH 中透過以下三種方式之一安裝：

### 方式 A：在 DSH 市集 / 插件指令直接安裝（最簡便）
在 DSH 介面或命令行輸入：
```bash
github:<使用者名稱>/cognitive-zoom-dsh
```

### 方式 B：本機 Link 開發模式（發布前即可立即測試）
在 DSH 桌面設定檔 `C:\Users\yuana\.dsh\profiles\desktop\package.json`：
```json
{
  "dependencies": {
    "cognitive-zoom-dsh": "link:C:\\Users\\yuana\\Desktop\\DSH\\plugin\\cognitive-zoom-dsh"
  },
  "dsh": {
    "profile": {
      "bundles": [
        ...,
        "cognitive-zoom-dsh"
      ]
    }
  }
}
```
存檔並重啟 DSH，技能即刻生效！

---

## 5. 測試與驗證

本套件包含完整的 Node.js 原生測試，不需要任何 `npm install` 即可直接執行：

```bash
cd cognitive-zoom-dsh
npm test
```
驗收輸出應為：
```
Running DSH Cognitive Zoom Node.js render & validation tests...
✔ All DSH render tests passed! HTML size: 196.1 KB
```

亦可直接雙擊打開 `skills/cognitive-zoom/examples/sample-viewer.html`，體驗流暢的無段縮放與深色主題！
