# 📚 官方權威參考庫、雙 MCP 與 Debugger 指南 (Official Specs, Dual MCP & Debugger Guide)

本檔案記載專案本地複製的微軟與 Mojang 官方倉庫、雙 MCP 工具伺服器 (MCT & Blockbench MCP) 以及 **Minecraft Script Debugger** 斷點偵錯設定指引。

---

## 一、官方參考庫位置與用途

1. **微軟官方 Learn 開發文件與 JSON Schemas**：
   - **本地路徑**：`scratch/minecraft-creator/`
   - **核心用途**：
     - 查閱最新 Block / Item / Entity / Dimension 的組件宣告結構。
     - 查閱 Script API 函式庫官方文檔與範例。
     - 查閱 `mojang/minecraft-debugger` (19144 埠) 斷點設定與 VS Code `launch.json` 指南。

2. **Mojang 官方 Bedrock 原生資源與行為包原始碼**：
   - **本地路徑**：`scratch/bedrock-samples/`
   - **核心用途**：
     - 比對 Mojang 官方原生物品、方塊 JSON。
     - 參照幾何模型 (`.geo.json`)、材質動畫控制器與完整 Behavior / Resource Pack 結構。

---

## 二、雙 MCP 自動化工具鏈分工 (Dual MCP Servers)

### 1. 🛠️ `minecraft-creator-tools` (MCT 創作者工具 MCP)
- **核心定位**：微軟官方 Add-on 結構、 Schema 校驗與遊戲實機調試。
- **主要工具與時機**：
  - `validateContent` / `validateFile`：驗證方塊、物品 JSON 的語意與結構是否相容最新版本。
  - `addItem` / `createMinecraftContent`：自動生成標準 Add-on 內容樣板。
  - `runCommandInMinecraft` / `connectToMinecraftSession`：對連線中的 BDS 測試伺服器進行實機測試與指令操控。

### 2. 🧊 `Blockbench MCP` (Blockbench 3D 模型與幾何動畫 MCP)
- **核心定位**：3D 方塊/實體幾何模型繪製、UV 貼圖與動畫控制器生成。
- **主要工具與時機**：
  - `designModel` / `getModelTemplates`：設計自訂方塊與怪物的 3D 幾何模型（`.geo.json`）。
  - `writeImageFileFromPixelArt` / `writeImageFile`：繪製 16x16 / 32x32 像素材質貼圖 (.png)。
  - `designStructure`：自動產出結構與動畫檔。

---

## 三、🐞 Minecraft Script Debugger 斷點偵錯使用指引

`minecraft-debugger` 是 Mojang 官方提供的 VS Code F5 斷點偵錯插件 (Debug Adapter)，設定與使用 4 步驟如下：

### 1. BDS 伺服器通訊埠設定 ([server.properties](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/bds_server/server.properties))
```properties
script-debugger-enable=true
script-debugger-auto-attach=disabled
```

### 2. VS Code 偵錯啟動檔 ([.vscode/launch.json](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/.vscode/launch.json))
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "minecraft-js",
      "request": "attach",
      "name": "Attach to Minecraft Bedrock BDS Debugger",
      "mode": "listen",
      "localRoot": "${workspaceFolder}/addons/ml_dungeon_BP/scripts",
      "port": 19144
    }
  ]
}
```

### 3. 斷點偵錯操作流程
1. 在 VS Code 安裝擴充套件 **`Minecraft Script Debugger`** (Mojang 發行)。
2. 啟動 `bedrock_server.exe`。
3. 在需要偵錯的 `.js` 行號左側設定**紅點 (Breakpoint)**。
4. 按下 **`F5`** 鍵連線，遊戲內觸發該段程式碼時會**自動暫停遊戲**，供開發者進行單步執行與變數觀察。

---

## 四、協同開發作業流程

AI Agent 在開發功能時：
1. **官方庫檢索**：先搜尋 `scratch/minecraft-creator/` 與 `scratch/bedrock-samples/` 確定寫法。
2. **模型與貼圖設計**：調用 **Blockbench MCP**（`designModel` / `writeImageFileFromPixelArt`）產出 `.geo.json` 與 `.png`。
3. **組件與 Schema 校驗**：調用 **MCT MCP**（`validateContent` / `validateFile`）校驗 JSON 正確性。
4. **腳本斷點偵錯**：若遇到非同步死鎖，開啟 **Minecraft Debugger (F5)** 進行斷點偵錯。
