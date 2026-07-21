# Minecraft Bedrock Addon Project

此專案為 Minecraft 基岩版 (Bedrock Edition) Addon 的開發工作區。

## 目錄結構
- `behavior_pack/`: 行為包 (Behavior Pack)，負責遊戲邏輯、實體、配方、腳本等。
- `resource_pack/`: 資源包 (Resource Pack)，負責貼圖、模型、音效、語言等外觀資源。

## 自動產生的 UUID
- 行為包 UUID: `2b6ecdf7-7534-41ca-90ca-20d8a78ad30c`
- 資源包 UUID: `32135e27-0ed8-4aca-b17e-ef17fe6004aa`

## 部署與測試
若要在 Windows 10/11 的 Minecraft 載入此 Addon，可以將這兩個資料夾複製（或建立符號連結）到遊戲的開發目錄：
- 行為包部署路徑: `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_behavior_packs\my_behavior_pack`
- 資源包部署路徑: `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_resource_packs\my_resource_pack`
