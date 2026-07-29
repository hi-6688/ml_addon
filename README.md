# 🏰 ml_addon - Minecraft Bedrock Addon 開發工作區

本專案為 Minecraft 基岩版 (Bedrock Edition) 自訂地牢與傷害特效 Add-on 的完整開發工作區。

---

## 🛠️ 1. 開發環境與軟體版本 (Environment & Toolchain)

| 項目 / 工具 | 當前配置版本 | 說明 |
| :--- | :--- | :--- |
| **作業系統 (OS)** | Windows (x64) | 開發與 BDS 測試環境 |
| **Node.js** | `v24.14.0` | JavaScript / TypeScript 工具鏈環境 |
| **npm** | `11.9.0` | 套件管理 |
| **Python** | `3.11.8` | 打包自動化 (`pack_all.py`) 與 JSON 校驗工具 (`tools/validate_json.py`) |
| **Git** | `2.53.0` | 版本控制系統 |

---

## 🎮 2. Minecraft & Script API (SAPI) 版本配置

本專案強烈依賴 Mojang 官方 **Script API (SAPI)**，其權威宣告位於各模組 Behavior Pack 的 [`manifest.json`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/addons/ml_dungeon_BP/manifest.json)。

| SAPI 模組 / 引擎 | 宣告版本 | 官方文檔定義與說明 |
| :--- | :--- | :--- |
| **`min_engine_version`** | `[1, 21, 0]` | 最小基岩版引擎相容需求 |
| **`@minecraft/server`** | `2.8.0` | **Stable 正式發布版**（在 1.26.30 中已將 `DimensionRegistry` 自訂維度註冊等 API 自 Beta 畢業至 Stable） |
| **`@minecraft/server-ui`** | `2.1.0` | **Stable 正式發布版**（`CustomForm`、`MessageBox` 等介面 API 正式發布） |
| **Beta API 相容性** | `version-beta` | 若腳本使用未畢業之實驗性 API（如 `2.9.0-beta`），manifest 需標註 `-beta` 且地圖須開啟「Beta APIs」選項 |
| **Script Debugger** | Port `19144` | BDS 偵錯模式開啟，支援 VS Code 按 F5 單步斷點偵錯 |
| **雙 MCP 自動化** | `minecraft-creator-tools` / `Blockbench MCP` | MCT 用於 Schema 校驗與實機連線測試；Blockbench 用於 3D 模型與像素貼圖生成 |

---

## 🔑 3. 本地環境變數模板 (`.env.example`)

為維護資訊安全與本地隱私，`.env` 為個人隱蔽檔案（已列入 `.gitignore` 不提交 Git）。本專案提供 `.env.example` 範本，初次下載專案後請複製一份為 `.env` 進行本地配置：

```bash
copy .env.example .env
```

### 變數配置說明
| 變數名稱 | 預設範例 | 說明 |
| :--- | :--- | :--- |
| `SAPI_SERVER_VERSION` | `"2.8.0"` | SAPI 核心模組 `@minecraft/server` 相容版本 |
| `BDS_DEBUGGER_PORT` | `19144` | VS Code F5 斷點偵錯連接埠 |
| `PACK_OUTPUT_DIR` | `"./out"` | 自動打包檔 (`.mcaddon`) 輸出目錄 |
| `NAMESPACE` | `"ml_mod"` | 專案預設命名空間 |

---

## 📦 4. 專案目錄結構與獨立模組

- **`addons/`**：核心 Behavior Pack 與 Resource Pack 原始碼資料夾
  - `ml_dungeon_BP` & `ml_dungeon_RP`：地牢副本、維度 (`ml_mod:dungeon_dim`) 與標記方塊/物品模組（版本 `v1.6.3`）。
  - `ml_damage_BP` & `ml_damage_RP`：動態傷害數字浮動與暴擊特效獨立模組（版本 `v1.1.5`）。
- **`bds_server/`**：本地 Minecraft Bedrock Dedicated Server 測試伺服器。
- **`docs/`**：專案開發規格書與官方參考庫索引
  - [`docs/DUNGEON_SPEC.md`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/docs/DUNGEON_SPEC.md)：地牢規格與標記點系統完整文檔。
  - [`docs/OFFICIAL_REPOS.md`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/docs/OFFICIAL_REPOS.md)：微軟/Mojang 官方庫指南與 F5 除錯設定。
- **`scratch/`**：微軟官方 Learn 與 Mojang 原生代碼對照庫。
- **`tools/`**：自動化腳本 (`pack_all.py` 一鍵打包、`validate_json.py` 校驗)。

---

## 🚀 5. 打包與驗證

一鍵打包總發布包與子模組包至 `out/` 目錄：
```bash
python pack_all.py
```
一鍵自動校驗所有 JSON 語意格式：
```bash
python tools/validate_json.py
```

更詳細的版本變更請參考 [`CHANGELOG.md`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/CHANGELOG.md)。
