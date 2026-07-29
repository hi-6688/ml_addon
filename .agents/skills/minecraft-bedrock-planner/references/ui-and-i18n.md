# 表單 UI 與 i18n 本地化規範 (UI & i18n Guide)

> 本指南基於微軟 Learn 官方 `@minecraft/server-ui` 規範編寫。

---

## 1. 表單 UI 類型
* **ActionFormData**：按鈕式選單。
* **ModalFormData**：表單與輸入框（滑桿、切換按鈕、文字框）。
* **MessageFormData**：雙選擇對話框（確認/取消）。

## 2. i18n 本地化 (`.lang` 檔案)
* 資源包文字放於 `RP/texts/zh_TW.lang` 與 `RP/texts/en_US.lang`。
* 格式為：`tile.ml_mod:spawner_marker.name=地牢生成點標記`。
