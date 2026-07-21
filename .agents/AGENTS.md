# ml_addon 專案 AI 開發規範 (Project AI Rules)

本檔案定義了 Antigravity AI Agent 在本專案中**必須嚴格遵守的開發規則與架構記憶**。

---

## 核心架構識別

- **專案根目錄**：`my_minecraft_addon/`
- **所有 Add-on 原始碼**：放在 `addons/` 目錄下，分為 4 個子模組：
  - `addons/ml_dungeon_BP`（地牢行為包）
  - `addons/ml_dungeon_RP`（地牢資源包）
  - `addons/ml_damage_BP`（傷害數字行為包）
  - `addons/ml_damage_RP`（傷害數字資源包）
- **工具腳本**：放在 `tools/` 目錄下，**不屬於 Add-on 原始碼**。

---

## 命名空間鐵律

> 所有識別符（方塊、物品、粒子、維度、結構）**必須**以 `ml_mod:` 開頭！

| 項目 | 正確 | 錯誤 |
| :--- | :--- | :--- |
| 標記方塊 | `ml_mod:spawner_marker_1` | `spawner_marker_1` |
| 自訂維度 | `ml_mod:dungeon_dim` | `dungeon_dim` |
| 結構讀取 | `ml_mod:test1` | `test1` |

---

## 雙舞台座標 (不可更改)

| 舞台 | X | Y | Z |
| :--- | :--- | :--- | :--- |
| **舞台 A** | `0` | `64` | `0` |
| **舞台 B** | `200` | `64` | `0` |

---

## 標記方塊系統規則

- `spawner_marker_spawn`：玩家傳送出生點（每個結構**只能有 1 個**）。
- `spawner_marker_1~9`：生怪波次座標點（可以有多個，系統會輪詢）。
- 標記方塊**永遠不會被系統刪除或替換為空氣**（這是設計決策）。
- 感應粒子顯示半徑 = **16 格**。

---

## 關卡設計鐵律

- 新增關卡：**只編輯 `stages_config.js`**，不修改核心 `StageLoader.js` / `StageManager.js` / `StageCombat.js`。
- 結構檔統一存放：`addons/ml_dungeon_BP/structures/ml_mod/{名稱}.mcstructure`。
- Wave 9 (`markerId: "9"`) 慣例為 BOSS 出現位置。

---

## Git 提交規範

- 所有 Git 提交訊息使用**繁體中文**。
- 格式範例：`功能: 新增第三關關卡配置與 BOSS 波次`、`修復: 修正玩家死亡後標記方塊被清除的問題`。

---

## 開發文件位置

- **地牢系統完整開發定義書**：[`docs/DUNGEON_SPEC.md`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/docs/DUNGEON_SPEC.md)
- **版本更新日誌**：[`CHANGELOG.md`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/CHANGELOG.md)
