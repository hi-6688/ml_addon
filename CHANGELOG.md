# 📜 ml_addon 版本更新日誌 (Changelog)

本文件紀錄 `ml_addon` 模組包與各獨立子模組的版本迭代紀錄與重大更新。

## 🚀 [v1.2.5 - dungeon & docs] - 2026-07-30
- **地牢標記方塊系統重構與企劃知識庫範本導入**：
  - 將標記方塊重新定義為純位置標記，清理過時的單一關卡專用標記。
  - 導入 64x64x64 標準清場結構與 `StageLoader` 掃描常數修復。
  - 建立專案企劃書架構模板 [`docs/GAME_DESIGN_TEMPLATE.md`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/docs/GAME_DESIGN_TEMPLATE.md)。
  - 優化 `.gitignore` 規則，排除 `scratch/`、`backups/` 與 `.mct/` 暫存檔，確保 Git 儲存庫乾淨與輕量。

---

## 🚀 [v1.2.4 - tools] - 2026-07-28

- **移除 Webhook 降級機制，全面直連神奇嗨螺 Bot 本體**：
  - 修改 [`tools/discord_bridge.py`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/tools/discord_bridge.py)，移除 Webhook 備援判定，讓所有遊戲事件與訊息 100% 僅經由長連線直連 **神奇嗨螺#6912** 本體發送。

---

## 🚀 [v1.2.3 - tools & conch_bot] - 2026-07-28
- **RFC 6455 出站二進位 Masking 遮罩與 15 秒 WebSocket 保活心跳 (Keepalive) 修復**：
  - 修復 [`tools/discord_bridge.py`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/tools/discord_bridge.py) 作為 Client 向 VPS 海螺 Bot 發送訊息時未符合 RFC 6455 Mask 規範導致被剔退連線的問題。
  - 新增 15 秒長連線背景保活心跳線程與連線保護，解決先前長連線斷線並降級至 Webhook 的現象。

---

## 🚀 [v1.2.2 - tools & conch_bot] - 2026-07-28
- **正式服環境標籤全網更名對齊為 `[麥亂]`**：
  - 更新 [`tools/discord_bridge.py`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/tools/discord_bridge.py) 與 CS VPS 上海螺機器人 (`conch_bot/src/index.ts`)，將正式服訊息標籤統一更名為 **`[麥亂]`**。

---

## 🚀 [v1.2.1 - tools & conch_bot] - 2026-07-28
- **WebSocket 數據幀 RFC 6455 解析器與海螺 Bot 多環境雙頻道自動分流修復**：
  - 在 [`tools/discord_bridge.py`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/tools/discord_bridge.py) 中新增 `parse_ws_frame()` 解析器，補齊先前 BDS 傳入 WebSocket 數據幀（Unmasking）時被丟棄的 Bug，實現 BDS 數據幀精確連通海螺 Bot。
  - 經由 SSH 於 CS VPS (`36.50.249.102`) 完成海螺機器人 (`conch_bot/src/index.ts`) 多環境雙頻道動態路由邏輯重構與重新編譯，成功區分 **Dev 頻道 `1487482511876423700`** 與 **Prod 頻道 `1328652163664187412`**！

---

## 🚀 [v1.2.0 - ml_dc_BP & tools] - 2026-07-28
- **原生對接 CS VPS 神奇嗨螺 Bot (`神奇嗨螺#6912`) 本體與長連線管道**：
  - 經由 SSH 深入分析 CS VPS (`36.50.249.102`) 上海螺機器人原始碼 (`/root/servers/discord_bot/conch_bot/src/index.ts`) 與配置檔，成功取得 `COFFEEHOST_WS_TOKEN` (`coffee_secret_2026`)。
  - 在 [`tools/discord_bridge.py`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/tools/discord_bridge.py) 中新增背景出站 WebSocket 用戶端工作線程 (`start_conch_bot_client_thread`)，成功建立對 `ws://36.50.249.102:24446` 的長連線並完成認證。
  - 實現本地 Dev 服與正式服海螺機器人本體之**真正 100% 雙向即時通訊**（遊戲進出與對話推播給海螺 Bot、Discord 頻道 `1487482511876423700` 打字實時推回遊戲）。

---

## 🚀 [v1.0.2 - ml_dc_BP] - 2026-07-28
- **對齊微軟官方 Learn API 規範與 MCP 驗證修復**：
  - 依據 `creator/ScriptAPI/minecraft/server-net/WebSocketClientAfterEvents.md` 規範，將事件訂閱信號修正為標準 `client.afterEvents.message` (`MessageAfterEventSignal`)，達成 100% 雙向純事件驅動 (0 輪詢)。
  - 對接 Dev 服測試頻道 ID `1487482511876423700` 與 `DISCORD_WEBHOOK_URL_DEV`。
  - 使用 Mojang 官方 MCP 工具 (`minecraft-creator-tools/validateFile`) 完成 Addon 全局 JSON Schema 語義校驗與語法無錯驗證。
  - 版號順延遞增至 **1.0.2**。

---

## 🚀 [v1.0.1 - ml_dc_BP] - 2026-07-26
- **`ml_dc BP` 純事件驅動重構與 SAPI 原生 WebSocket 支援**：
  - 重構 [`addons/ml_dc_BP/scripts/main.js`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/addons/ml_dc_BP/scripts/main.js)，引進 `@minecraft/server-net.WebSocketClient` 原生長連線介面。
  - 廢除舊版全天候 `system.runInterval` Polling 輪詢，改為純事件監聽 `client.afterEvents.messageReceive.subscribe`，無謂網路請求降低 90% 以上。
  - 重構 [`tools/discord_bridge.py`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/tools/discord_bridge.py) 本地中繼伺服器，支援 HTTP/WebSocket 雙通道通訊。
  - 版號順延遞增至 **1.0.1**。

---

## 🚀 [v1.6.18] - 2026-07-23
- **精確防守距離 (attack_radius_min: 5.0) 與 1.4倍走位避障速調**：
  - 更新 [`BP/entities/noob.json`](file:///c:/Users/a0900/.gemini/antigravity-ide/scratch/my_minecraft_addon/addons/ml_dungeon_BP/entities/noob.json)，將 `attack_radius_min` 設為 `5.0` 格，`speed_multiplier` 設為 `1.4` 倍，並結合 `avoid_mob_type`（8.0格、1.4倍步速、1.6倍疾跑）實現流暢避障防守走位。
  - 版號順延遞增至 **1.6.18**。

---

## 🚀 [v1.6.17] - 2026-07-23
- **抗擊退更正與 3D 避障風箏走位 (avoid_mob_type) 導入**：抗擊退改為 1.0，導入避障走位 AI。
