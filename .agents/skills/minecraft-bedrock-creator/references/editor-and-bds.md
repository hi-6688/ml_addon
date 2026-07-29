# 編輯器與 BDS 伺服器配置 (Editor & BDS Guide)

> 本指南基於微軟 Learn 官方 BDS 伺服器與 Debugger 規範編寫。

---

## 1. BDS 伺服器配置 (Bedrock Dedicated Server)
* 配置文件位於 `bds_server/server.properties`。
* 允許玩家與 API 實驗性功能：在 `permissions.json` 配置腳本全權與管理員權限。

## 2. Debugger 斷點對接 (`mojang/minecraft-debugger`)
* 設定 `.vscode/launch.json` 對接 `127.0.0.1:19144` 斷點對話埠。
* 可以單步執行 (Step-over / Step-into) 追蹤 `StageCombat.js` 或 `StageManager.js` 的狀態變化。
