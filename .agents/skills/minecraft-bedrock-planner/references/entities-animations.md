# 自定義實體與幾何動畫規範 (Entities & Animations Guide)

> 本指南基於微軟 Learn 官方文件與 Mojang 原生實體規範編寫。

---

## 1. 實體 Behavior JSON 規範

* **命名空間**：所有 Identifier 必須以 `ml_mod:` 開頭（例如 `ml_mod:skeleton_archer`）。
* **格式版本**：推薦使用 `format_version: "1.20.0"`。

```json
{
  "format_version": "1.20.0",
  "minecraft:entity": {
    "description": {
      "identifier": "ml_mod:noob",
      "is_spawnable": true,
      "is_summonable": true
    },
    "components": {
      "minecraft:health": {
        "value": 20,
        "max": 20
      },
      "minecraft:movement": {
        "value": 0.25
      }
    }
  }
}
```

---

## 2. Blockbench 幾何模型 (.geo.json)

* **格式版本**：`format_version: "1.12.0"`。
* **模型結構**：幾何模型檔案放置於 `RP/models/entity/` 或 `RP/models/blocks/`。
* **MCP 生成**：可調用 MCP 工具 `designModel` 與 `getModelTemplates` 自動生成結構。
