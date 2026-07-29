# Script API 腳本核心開發規範 (Script API Core Guide)

> 本指南基於微軟 Learn 官方 Script API (`@minecraft/server` v2.8.0) 規範編寫。

---

## 1. 唯讀事件保護鎖 (ReadOnly Event Guard)

在 `beforeEvents`（如 `world.beforeEvents.playerBreakBlock`）回調函數中，遊戲引擎會鎖定世界為唯讀狀態。

### 🛑 錯誤做法 (崩潰風險)
```javascript
world.beforeEvents.playerBreakBlock.subscribe((ev) => {
    ev.player.teleport({ x: 0, y: 100, z: 0 }); // ❌ 會拋出 ReadOnly 異常並引發 BDS 崩潰
});
```

### ✅ 正確做法 (使用 system.run 包裹)
```javascript
import { world, system } from "@minecraft/server";

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
    system.run(() => {
        ev.player.teleport({ x: 0, y: 100, z: 0 }); // ✅ 延遲至下一個 Tick 執行，安全通過
    });
});
```

---

## 2. 資源清理與取消訂閱 (Unsubscribe)

動態生成事件監聽器時，務必在不需要時呼叫 `.unsubscribe()`，避免記憶體洩漏與重複觸發。
