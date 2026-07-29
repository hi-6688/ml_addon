---
name: minecraft-bedrock-creator
description: 整合微軟官方 Minecraft Bedrock Creator 的 Add-on 正規開發規範與 Script API 除錯指南。當需要開發基岩版附加包、設定 manifest.json、編寫 JavaScript/TypeScript 腳本 API、配置 JSON Schemas 語意校驗，或進行本地熱重載與斷點除錯時使用。
license: Apache-2.0
metadata:
  version: "1.0"
  author: Antigravity
---

# 麥塊基岩版官方 Creator 開發規範與 Script API 指南

本技能包為 Minecraft 基岩版（Bedrock Edition）Add-on 開發與 Script API 編寫的官方正規指南，深度整合 **MCP 工具鏈 (`minecraft-creator-tools`)**、**`mojang/minecraft-debugger` 除錯工具** 與 **Blockbench 幾何模型/貼圖工具**，引導 AI 助手在開發與修復時遵循最防禦且高效的架構。

---

## 🛠️ 三大工具鏈功能整合指引

1. **MCP 工具鏈 (`minecraft-creator-tools`)**：
   * **內容與 Schema 驗證**：`validateContent` / `validateFile` / `getEffectiveContentSchema`（語意與結構靜態檢查）。
   * **內容生成**：`createMinecraftContent` / `createProject` / `addItem`（自動生成標準相容結構）。
   * **遊戲連線與熱重載**：`connectToMinecraftSession` / `runCommandInMinecraft`（發送 `/reload` 或遊戲測試指令）。
2. **Debugger 工具 (`mojang/minecraft-debugger`)**：
   * **斷點對接**：透過 `launch.json` 對接 BDS 或遊戲端 SAPI 腳本實時偵錯。
   * **防崩潰保護鎖**：`beforeEvents` 唯讀狀態下，寫入 API 必須包裹在 `system.run(() => { ... })` 中。
3. **Blockbench 幾何模型與貼圖工具**：
   * **3D 模型生成**：使用 MCP `designModel` 與 `getModelTemplates` 自動生成 `.geo.json` 模型。
   * **像素貼圖繪製**：使用 MCP `writeImageFileFromPixelArt` / `writeImageFile` 產生資源包 `.png` 貼圖。

---

## 1. 開發與除錯思考模型決策樹 (Official Docs First Decision Tree)

當收到開發、修改或除錯 Minecraft Bedrock Add-on 的請求時，AI 必須遵循「**官方文檔優先 (Official Docs First)**」決策樹：

```mermaid
graph TD
    A[收到 Add-on 開發/修改/Debug 需求] --> B[0. 優先查閱微軟官方 Learn 文檔與 Local Reference 規範]
    B --> C{第一階段: 需求與模組分類}
    
    C -- 方塊/物品/實體 JSON 結構 --> D[1. 內容設計與範本選取]
    D --> D1[查閱 blocks-items-recipes.md / entities-animations.md]
    D1 --> D2[使用 MCP getEffectiveContentSchema 確認官方最新 Schema]
    D2 --> D3[使用 MCP createMinecraftContent 生成符合官方標準的 JSON]
    
    C -- 模型/貼圖/Blockbench 設計 --> E[2. 3D 模型與像素貼圖生成]
    E --> E1[查閱官方 Blockbench 幾何規範 .geo.json]
    E1 --> E2[使用 MCP designModel / writeImageFileFromPixelArt 生成資產]
    
    C -- SAPI 腳本邏輯 (JS/TS) --> F[3. 腳本編寫與防禦架構]
    F --> F1[查閱 script-api-core.md 官方 API 規範與 2.8.0 邊界]
    F1 --> F2[遵守 ReadOnly 保護鎖: 寫入操作包裹在 system.run]
    F2 --> F3[所有識別符遵循 ml_mod: 命名空間]
    
    C -- 測試與 Bug 除錯 --> G[4. 除錯與熱重載驗證 (Debugger-First)]
    G --> G1[使用 MCP validateContent / validateFile 進行官方 Schema 檢查]
    G1 --> G2{靜態校驗是否通過?}
    G2 -- 否 --> G3[對照官方 Schema 錯誤日誌修復] --> G1
    G2 -- 是 --> G4[部署至 BDS / 測試環境]
    G4 --> G5[使用 MCP runCommandInMinecraft 執行 /reload]
    G5 --> G6{執行是否拋出異常/邏輯錯誤?}
    G6 -- 否 --> H[完成交付]
    G6 -- 是 --> G7[⚡️ 啟動 Debugger: 查閱官方 SAPI 偵錯指南 / Attach 斷點除錯] --> F
```

---

## 2. ⚡️ 核心開發與除錯守則

AI 在編寫或修改程式時，必須嚴格遵守以下四條防禦性核心守則：

### 🛑 守則一：官方文檔優先 (Official Docs First)
在進行任何 JSON 修改或 SAPI 腳本編寫前，**必須先查閱官方 Learn 文件或本地 `references/` 規範**，確定該版本的組件語法 (Component Schema) 與 API 方法簽名，禁止憑空猜測欄位名稱。

### 🛑 守則二：除錯優先 (Debugger-First Logic)
當程式碼執行不如預期、拋出異常或邏輯卡死時，**絕對禁止盲目猜測並無意義地頻繁修改程式碼**。
AI 必須優先指引人類配置並啟動 **`mojang/minecraft-debugger`** VS Code 插件，進行真實的斷點檢查與單步執行（Step-through），找出精確出錯的變數或事件上下文。

### 🛑 守則三：唯讀事件保護鎖與延遲調度 (ReadOnly Event Guard)
在 `@minecraft/server` 的 `beforeEvents`（如 `playerBreakBlock`、`chatSend`）事件監聽器中，遊戲引擎會將世界狀態鎖定為唯讀。在此監聽器內直接調用任何會改變世界狀態的 API（例如 `entity.teleport`、`world.sendMessage`、spawnEntity 等）會引發嚴重的執行期崩潰。
* **解決方案**：AI 必須將所有寫入操作包裹在 `system.run(() => { ... })` 中，將其延遲到下一個 Tick 執行，從而繞過唯讀保護鎖，杜絕崩潰。

### 🛑 守則四：MCP 靜態校驗與熱重載 Policy
* 生成或修改 JSON/腳本後，先調用 MCP `validateContent` 或 `validateFile` 進行語意檢查。
* 修改 `.js` 腳本時，使用 MCP `runCommandInMinecraft` 發送 `/reload` 進行熱重載，避免無故重啟 BDS 伺服器。


---

## 3. 本地知識分類索引 (References)

詳細的官方 API 規範、Schema 設定與專案實作指南，已依據微軟 Creator 官網架構分類存於以下本地參考文件中：

* **[開發環境與工具鏈指南](references/setup-tooling.md)**：包含本機開發路徑、`manifest.json` UUID 與 dependencies 設定，以及 **`@minecraft/bedrock-schemas` 的 VS Code 整合配置**。
* **[自定義實體與幾何動畫規範](references/entities-animations.md)**：自定義實體的 Behavior JSON 元件、Blockbench 幾何結構與動畫控制器狀態機。
* **[自定義方塊、物品與配方規範](references/blocks-items-recipes.md)**：方塊屬性、Permutations、自定義物品組件、合成配方與戰利品表宣告。
* **[Script API 腳本核心開發規範](references/script-api-core.md)**：包含 `@minecraft/server` API 開發、**Beta 與 Stable 版本的硬性劃分邊界**、監聽訂閱（`subscribe`/`unsubscribe`）的資源清理指引。
* **[表單 UI 與 i18n 本地化規範](references/ui-and-i18n.md)**：`@minecraft/server-ui` 三大表單模版與 RawMessage 多語言防崩潰地雷指南。
* **[編輯器與 BDS 伺服器配置](references/editor-and-bds.md)**：`@minecraft/server-editor` 可視化編輯器擴充開發與專用伺服器設定。

