# 📜 ml_addon 版本更新日誌 (Changelog)

本文件紀錄 `ml_addon` 模組包與各獨立子模組的版本迭代紀錄與重大更新。

---

## 🚀 [v1.0.0] - 2026-07-21 (微軟官方規範重構與雙模組首發正式版)

### 📦 專案模組劃分
- **`ml_addon.mcaddon`**：總整合發布包（一鍵包含全套模組）。
- **`ml_dungeon`**：地牢副本、維度與創作者標記點獨立模組。
- **`ml_damage`**：傷害數字動態浮動與暴擊特效獨立模組。

### 🏰 地牢與標記方塊系統 (`ml_dungeon v1.0.0`)
- **自訂維度**：成功註冊與隔離自訂維度 `ml_mod:dungeon_dim`。
- **雙緩衝副本加載器**：實現舞台 A / B (`STAGE_LOCATIONS`) Ping-Pong 無縫結構加載與清空。
- **波次與出生點標記方塊**：
  - 新增 `spawner_marker_1` ~ `spawner_marker_9` (1~9 波刷怪點) 與 `spawner_marker_spawn` (出生點)。
  - 方塊採完全透明與零碰撞 (`collision_box: false`) 設計，零阻擋穿透。
  - 手持時於 16 格半徑內發射 2D Billboard 相機轉向數字粒子。
  - 地牢加載時精確將玩家傳送至出生點原點，且不銷毀標記方塊本體。
- **結構檔案對齊**：地牢結構存放對齊微軟規範 `structures/ml_mod/test1.mcstructure`。

### 💥 傷害數字視效系統 (`ml_damage v1.0.0`)
- **傷害浮動粒子**：玩家與怪物受傷時動態顯示 `damage_normal` 與 `damage_crit` 特效粒子。
- **獨立拔插**：可單獨導出 `.mcaddon` 安裝至生存世界或任何其他地圖。

### 🛠️ 工具與自動化 (`tools/`)
- 新增 `pack_all.py` 一鍵自動生成總整合包與獨立子包。
- 新增 `tools/validate_json.py` 語法自動校驗工具。
- 專案全面建立 Git 版本控制與標準 `.gitignore`。
