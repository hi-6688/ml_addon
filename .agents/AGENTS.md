# ml_addon 專案 AI 開發規範 (Project AI Rules)

本檔案為 AI Agent 在本專案中的**最高權限記憶與開發規範**。

---

## 🛑 核心三大鐵律 (Core Constraints)

1. **命名空間鐵律**：所有識別符（方塊、物品、粒子、維度、結構）**必須**以 `ml_mod:` 開頭。
2. **優先熱重載 Policy**：修改 `.js` 腳本時優先進行 `/reload` 熱重載，禁止無故重啟 BDS 伺服器（除非修改 `manifest.json` 或伺服器設定）。
3. **版號遞增限制**：未獲提示禁止擅改大/中版號，版號修改**只能在小版號 (Patch Version) 順延往上加**（例如 `1.2.6` ➔ `1.2.7` ➔ `1.2.8` ➔ `1.2.9` ➔ `1.2.10` ➔ `1.2.11`...，雙位數亦同）。

---

## ⚙️ Git 提交與 Changelog 維護規範

### 1. Git 提交訊息
- 所有 Git 提交訊息使用**繁體中文**。
- 格式範例：`功能: 新增第三關關卡配置與 BOSS 波次`、`修復: 修正玩家死亡後標記方塊被清除的問題`。

### 2. CHANGELOG 維護規範 (Changelog Protocol)
- **維護時機 (When)**：每次進行小版號遞增、完成新功能開發或修正重大 Bug 時。
- **寫法格式 (How)**：必須在 [`CHANGELOG.md`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/CHANGELOG.md) 檔案頂部追加最新 `## 🚀 [v1.X.X] - YYYY-MM-DD` 條目，使用繁體中文清晰條列異動重點。

---

## 📚 專案文件與權威庫索引 (Documentation Index)

- 🏰 [**地牢與標記系統完整開發定義書**](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/docs/DUNGEON_SPEC.md)：地牢雙舞台座標、關卡設計規範與標記方塊系統邏輯。
- 🎮 [**遊戲企劃書標準架構模板**](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/docs/GAME_DESIGN_TEMPLATE.md)：多人共用遊戲企劃與 GDD 模組化規範。
- 📝 [**版本更新日誌**](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/CHANGELOG.md)：歷史版本修復與功能變更完整紀錄。
- 📖 [**專案環境與 SAPI 說明**](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/README.md)：系統工具鏈 (Node.js/Python)、SAPI `@minecraft/server: 2.8.0` 版本與 `.env` 本地設定指南。
- ⚡️ **微軟官方開發規範與檢索**：已整合至全域技能包 `minecraft-bedrock-creator`。

