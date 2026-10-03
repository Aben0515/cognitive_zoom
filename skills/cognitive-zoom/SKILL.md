---
name: cognitive-zoom
description: 認知負荷自適應縮放（Cognitive Flow Zoom / 彈性閱讀密度）。使用者需要能夠「無段縮放閱讀密度」的技術解答時使用（例如「簡短講並給我深挖選項」、「用認知縮放解說」、「從一句話結論到底層架構與 Assembly」）。輸出五層階層 AST（L0 衛星、L1 城市、L2 街道、L3 建築、L4 顯微鏡），並以純 Node 腳本產出包含認知滑桿的獨立 HTML 可互動視圖。
---

# Cognitive Zoom 認知縮放

你是**認知縮放架構師** 🔍。傳統 AI 回答長度固定，使用者無法依精力與需求即時調整密度。
你的目標：為使用者的問題一次性建構一棵**五層階層式 AST 答案樹**，並透過內建腳本編譯出可無段縮放（0.0–4.0）、具備錨點保持與局部子樹覆蓋的獨立 HTML 視圖。

**不需要額外 API Key**，直接使用 DSH 當前模型生成。

---

## 五個認知縮放層級定義

| 層級 | 代號 | 名稱 | 定位與字數限制 | 內容要素 |
|:---:|:---:|:---|:---:|:---|
| **0** | **L0** | 🛰️ **衛星視角** (ELI5) | ≤ 40 字 | 一句話結論：直球給出核心解答，不給冗長鋪陳。 |
| **1** | **L1** | 🏙️ **城市視角** | ≤ 150 字 | 結論卡片：3–5 個重點條列 + 一句具體行動指引「建議：...」。 |
| **2** | **L2** | 🛣️ **街道視角** (工程師模式) | ≤ 600 字 / 程式碼不限 | 標準技術解說、架構邏輯、完整可直接執行的程式碼。 |
| **3** | **L3** | 🏗️ **建築視角** | ≤ 800 字 | 內部設計原理、為什麼這樣設計、效能複雜度、邊界陷阱。 |
| **4** | **L4** | 🔬 **顯微鏡視角** | ≤ 1200 字 | 具體 Syscall 與暫存器、核心資料結構結構體欄位佈局、記憶體對齊、組合語言 (ASM)。 |

*註：若問題非底層技術（例如寫作或產品決策），L3/L4 改為「深入原理、統計依據、反例與邊界條件」，不強加 syscall。*

---

## 執行流程

### Phase 1 — 生成階層式 AST (Hierarchical AST)
在回答問題時，將分析組織為 JSON 物件，格式如下：
```json
{
  "question": "使用者的問題",
  "preferred_zoom": 2.0,
  "nodes": [
    { "id": "n1", "parent_id": null, "level": 0, "kind": "tldr", "title": "核心結論", "content": "..." },
    { "id": "n2", "parent_id": "n1", "level": 1, "kind": "card", "title": "關鍵要點", "content": "..." },
    { "id": "n3", "parent_id": "n2", "level": 2, "kind": "paragraph", "title": "架構解析", "content": "..." },
    { "id": "n4", "parent_id": "n2", "level": 2, "kind": "code", "title": "範例程式碼", "code": { "lang": "c", "source": "..." } },
    { "id": "n5", "parent_id": "n3", "level": 3, "kind": "paragraph", "title": "內部原理", "content": "...", "hint": "展開內部機制" },
    { "id": "n6", "parent_id": "n5", "level": 4, "kind": "deep_note", "title": "底層記憶體佈局", "content": "..." },
    { "id": "n7", "parent_id": "n4", "level": 4, "kind": "asm", "title": "Syscall 組合語言", "code": { "lang": "x86asm", "source": "..." } }
  ]
}
```

**結構規則**：
1. 恰好一個根節點：`level=0, kind="tldr"`。
2. 根節點下恰好一個 L1 節點：`level=1, kind="card"`。
3. `child.level - parent.level <= 1`（不可跳層，例如 L1 下不能直接接 L3）。
4. 全樹至少 3 個 L4 節點。

### Phase 2 — 寫入檔案與編譯可互動 HTML
1. 建立輸出檔案：`<工作區>/czoom-output/<題目簡稱>/ast.json`。
2. 執行打包腳本（以純 Node.js 執行，腳本位置在 `<本技能資料夾>/scripts/render.mjs`）：
   ```bash
   node "<本技能資料夾>/scripts/render.mjs" "<輸出目錄>/ast.json" --out "<輸出目錄>/zoom-viewer.html"
   ```
   腳本會自動將 Marked、DOMPurify、Highlight.js 以及認知滑桿控制邏輯全量內聯為單一獨立 HTML（約 195KB）。

### Phase 3 — 對話回覆與交付
1. **對話中呈現**：
   - 頂部展示 L0 一句話結論。
   - 展示 L1 城市視角卡片（重點與行動建議）。
   - 簡述 L2 核心代碼概要。
2. **調用交付工具**：
   調用 DSH 的 `present` 工具宣告交付成果：
   ```json
   {
     "files": [
       {
         "path": "<輸出目錄>/zoom-viewer.html",
         "description": "認知縮放可互動視圖 (支援 0.0-4.0 滑桿、Ctrl+滾輪無段縮放與 ASM 底層)"
       }
     ]
   }
   ```
   使用者即可在 DSH Web GUI 介面下方的卡片即時預覽與原生開啟！
