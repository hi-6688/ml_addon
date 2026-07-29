# 開發環境與工具鏈指南 (Setup & Tooling Guide)

> 本指南基於微軟 Learn 官方文件與 Mojang 權威規範編寫。

---

## 1. 專案結構與 `manifest.json` 宣告

基岩版 Add-on 必須包含行為包 (BP) 與資源包 (RP)，且 UUID 必須唯一。

### 標準行為包 `manifest.json` 範例 (SAPI 2.8.0)
```json
{
  "format_version": 2,
  "header": {
    "name": "ml_dungeon_BP",
    "description": "Dungeon Behavior Pack",
    "uuid": "4c9e83bd-47ba-4a37-b673-8a39e8020a5c",
    "version": [1, 2, 5],
    "min_engine_version": [1, 20, 0]
  },
  "modules": [
    {
      "type": "data",
      "uuid": "b2f34e6a-1122-4455-8899-aabbccddeeff",
      "version": [1, 2, 5]
    },
    {
      "type": "script",
      "language": "javascript",
      "uuid": "f29b0f7e-7cda-48c0-82cb-23b6b19a123f",
      "version": [1, 2, 5],
      "entry": "scripts/main.js"
    }
  ],
  "dependencies": [
    {
      "module_name": "@minecraft/server",
      "version": "1.10.0"
    }
  ]
}
```

---

## 2. VS Code 工具鏈與 JSON Schemas 整合

為了獲得官方最高等級的語彙檢查與提示，在 `.vscode/settings.json` 中需配置微軟官方 Schemas：

```json
{
  "json.schemas": [
    {
      "fileMatch": ["/addons/*/blocks/*.json"],
      "url": "https://raw.githubusercontent.com/microsoft/minecraft-json-schemas/main/dts/behavior/block/1.20.0.json"
    }
  ]
}
```

---

## 3. MCP 工具鏈 (`minecraft-creator-tools`)

使用 MCP 工具可自動校驗與連線：
* `validateContent`: 檢查特定 JSON 是否符合官方規範。
* `runCommandInMinecraft`: 發送 `/reload` 熱重載。
