---
name: minecraft-bedrock-creator
description: 整合微軟官方 Minecraft Bedrock Creator 的 Add-on 正規開發規範與 Script API 除錯指南。當需要開發基岩版附加包、設定 manifest.json、編寫 JavaScript/TypeScript 腳本 API、配置 JSON Schemas 語意校驗，或進行本地熱重載與斷點除錯時使用。
license: Apache-2.0
metadata:
  version: "1.0"
  author: Antigravity
---

# 麥塊基岩版官方 Creator 開發規範與 Script API 指南

本技能包採用 **「計畫與操作解耦架構 (Two-Phase Architecture: Planning vs. Execution)」**，將「計畫決策層」與「工具操作層」明確分離，確保 AI 在開發 Bedrock Add-on 時能先做嚴謹計畫、再進行精密工具操作。

---

## 🎯 兩階段核心架構 (Two-Phase Architecture)

```mermaid
graph TD
    subgraph 階段一: 計畫與決策層 (Planning Layer)
        A[1. 收到需求] --> B[2. 查閱微軟 Learn 官方文檔與 Reference 規範]
        B --> C[3. 確定架構鐵律: ml_mod: 命名空間 / SAPI 2.8.0 / ReadOnly 保護]
        C --> D[4. 制定開發與修復計畫]
    end

    subgraph 階段二: 操作與執行工具層 (Execution Layer)
        D --> E{5. 選擇執行工具鏈}
        E -- 內容生成 --> F1[MCP createMinecraftContent / addItem]
        E -- 3D模型與貼圖 --> F2[Blockbench & MCP designModel / writeImageFile]
        E -- 靜態校驗 --> F3[MCP validateContent / validateFile]
        E -- 熱重載測試 --> F4[MCP runCommandInMinecraft 發送 /reload]
        E -- 斷點偵錯 --> F5[Debugger: Attach mojang/minecraft-debugger]
    end
```

---

## 📋 階段一：計畫與決策層 (Phase 1: Planning Layer)

在執行任何程式碼寫入或工具調用前，**必須先完成計畫與決策**：

1. **官方文檔優先 (Official Docs First)**：
   * 查閱微軟 Learn 官方文檔或本地 `references/` 規範（如 `script-api-core.md`、`blocks-items-recipes.md`），確定正式的 Component Schema 與 API 方法簽名。
2. **防禦性架構決策**：
   * **命名空間**：所有識別符必須強制使用 `ml_mod:` 前綴。
   * **ReadOnly 保護鎖**：在 SAPI `beforeEvents` 監聽器中，所有改寫操作必須決策為包裹在 `system.run(() => { ... })` 中。
   * **版號 Policy**：確定小版號順延規則，更新 `CHANGELOG.md`。

---

## ⚡️ 階段二：操作與執行工具層 (Phase 2: Execution Layer)

當計畫與架構確定後，進入**工具連線與具體操作階段**：

### 1. 內容生成與 Schema 校驗工具
* **範本與 Schema 檢索**：調用 MCP `getEffectiveContentSchema` 取得官方最新 Schema。
* **標準檔生成**：調用 MCP `createMinecraftContent` / `addItem` 生成相容的 JSON 檔案。
* **靜態校驗**：調用 MCP `validateContent` 或 `validateFile` 進行語意與結構靜態檢查。

### 2. Blockbench 幾何模型與貼圖繪繪工具
* **3D 幾何模型**：調用 MCP `designModel` 與 `getModelTemplates` 自動生成 Blockbench 相容的 `.geo.json` 模型。
* **像素貼圖繪製**：調用 MCP `writeImageFileFromPixelArt` / `writeImageFile` 生成資源包 `.png` 貼圖。

### 3. 熱重載與連線測試工具
* **會話連線**：調用 MCP `connectToMinecraftSession` / `listMinecraftSessions` 連線測試。
* **熱重載**：修改 `.js` 腳本後，調用 MCP `runCommandInMinecraft` 發送 `/reload`，避免無故重啟 BDS 伺服器。

### 4. 斷點與崩潰偵錯工具 (Debugger-First)
* **對接偵錯**：透過 `.vscode/launch.json` 對接 `mojang/minecraft-debugger` VS Code 插件進行實時斷點與單步執行 (Step-through)。
* **日誌分析**：讀取 BDS SAPI 崩潰 Stack Trace，定位精確變數並修正。



---

## 3. 本地知識分類索引 (References)

詳細的官方 API 規範、Schema 設定與專案實作指南，已依據微軟 Creator 官網架構分類存於以下本地參考文件中：

* **[開發環境與工具鏈指南](references/setup-tooling.md)**：包含本機開發路徑、`manifest.json` UUID 與 dependencies 設定，以及 **`@minecraft/bedrock-schemas` 的 VS Code 整合配置**。
* **[自定義實體與幾何動畫規範](references/entities-animations.md)**：自定義實體的 Behavior JSON 元件、Blockbench 幾何結構與動畫控制器狀態機。
* **[自定義方塊、物品與配方規範](references/blocks-items-recipes.md)**：方塊屬性、Permutations、自定義物品組件、合成配方與戰利品表宣告。
* **[Script API 腳本核心開發規範](references/script-api-core.md)**：包含 `@minecraft/server` API 開發、**Beta 與 Stable 版本的硬性劃分邊界**、監聽訂閱（`subscribe`/`unsubscribe`）的資源清理指引。
* **[表單 UI 與 i18n 本地化規範](references/ui-and-i18n.md)**：`@minecraft/server-ui` 三大表單模版與 RawMessage 多語言防崩潰地雷指南。
* **[編輯器與 BDS 伺服器配置](references/editor-and-bds.md)**：`@minecraft/server-editor` 可視化編輯器擴充開發與專用伺服器設定。

