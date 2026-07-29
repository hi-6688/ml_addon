import { world, system } from "@minecraft/server";
import { ActionFormData, CustomForm, ObservableString } from "@minecraft/server-ui";
import { MarkerVisibilityManager } from "./dungeon/MarkerVisibilityManager.js";
import { SaveManager } from "./dungeon/SaveManager.js";
import { stageManager } from "./dungeon/StageManager.js";
import { StageLoader, STAGE_LOCATIONS } from "./dungeon/StageLoader.js";


// 0. 在 system.beforeEvents.startup 中呼叫 dimensionRegistry 註冊自訂維度 ml_mod:dungeon_dim
system.beforeEvents.startup.subscribe((event) => {
    try {
        if (event.dimensionRegistry && typeof event.dimensionRegistry.registerCustomDimension === "function") {
            event.dimensionRegistry.registerCustomDimension("ml_mod:dungeon_dim");
            console.warn("[ml_mod] 🚀 成功於 startup 註冊自訂維度 ml_mod:dungeon_dim！");
        }
    } catch (e) {
        console.error(`[ml_mod] 註冊自訂維度失敗: ${e}`);
    }
});

// 1. 初始化標記方塊半徑 16 格粒子管理器
MarkerVisibilityManager.init();

// 2. 註冊基礎設定 (死亡不掉落)
system.run(() => {
    try {
        const overworld = world.getDimension("minecraft:overworld");
        overworld.runCommandAsync("gamerule keepInventory true");
        console.warn("[ml_mod] 成功啟用死亡不掉落 (keepInventory = true)");
    } catch (e) {
        console.error("[ml_mod] 啟用遊戲規則失敗:", e);
    }
});

/**
 * 彈出基於 DDUI (CustomForm + ObservableString) 的地牢測試控制台
 */
function openDungeonTestDDUI(player) {
    const currentStage = SaveManager.getCurrentStage(player);
    
    // 1. 建立 Observable 響應式字串 (加入 \n 顯式換行避免 Bedrock 行高重疊壓字)
    const titleText = new ObservableString("§l§gml_mod 地牢測試控制台");
    const statusText = new ObservableString(`§7當前進度: §eStage ${currentStage}\n§7(結構: test1.mcstructure)`);

    // 2. 建立 DDUI CustomForm
    const form = new CustomForm(player, titleText);

    // 3. 綁定動態標籤
    form.label(statusText);

    // 4. 按鈕 1：傳送至地牢自訂維度結構 (移除按鈕不支援的 raw § 色彩符號)
    form.button("進入 / 傳送至自訂維度地牢 (Stage " + currentStage + ")", () => {
        player.sendMessage(`§b[DDUI 測試] 正在加載自訂維度結構並傳送至地牢出生點...`);
        stageManager.startSession(player);
    });

    // 5. 按鈕 2：清空結構 (測試 StageLoader.clearStageArea 清空功能)
    form.button("清空結構 (測試清空舞台 A & B 區域)", () => {
        try {
            const dungeonDim = world.getDimension("ml_mod:dungeon_dim");
            StageLoader.clearStageArea(dungeonDim, STAGE_LOCATIONS.A);
            StageLoader.clearStageArea(dungeonDim, STAGE_LOCATIONS.B);
            statusText.setData("§c結構狀態: 舞台區域已成功清空還原！");
            player.sendMessage("§a[地牢系統] 成功觸發清空結構！已清空舞台 A (0,64,0) 與 舞台 B (200,64,0) 區域！");
        } catch (e) {
            player.sendMessage(`§c[地牢系統] 清空結構失敗: ${e}`);
        }
    });

    // 6. 按鈕 3：離開 / 返回主世界出生點
    form.button("離開地牢 / 返回主世界出生點", () => {
        try {
            const overworld = world.getDimension("minecraft:overworld");
            const playerSpawn = player.getSpawnPoint();
            let targetLoc;
            
            if (playerSpawn && playerSpawn.dimension.id === "minecraft:overworld") {
                targetLoc = { x: playerSpawn.x, y: playerSpawn.y, z: playerSpawn.z };
            } else {
                const defSpawn = world.getDefaultSpawnLocation();
                let safeY = defSpawn.y;
                if (safeY > 320 || safeY < -64) {
                    safeY = 65; // BDS 預設出生點 Y 為 32767 (異常高空)，自動修修正為安全地面 Y=65
                }
                targetLoc = { x: defSpawn.x, y: safeY, z: defSpawn.z };
            }

            player.teleport(targetLoc, { dimension: overworld, rotation: { x: 0, y: -45 } });
            player.sendMessage(`§a[維度系統] 已將你安全傳送回主世界出生點 (${targetLoc.x}, ${targetLoc.y}, ${targetLoc.z})！`);
        } catch (e) {
            player.sendMessage(`§c[維度系統] 傳送失敗: ${e}`);
        }
    });

    // 7. 顯示 DDUI 表單
    form.show().then(() => {});
}

// 3. 監聽玩家使用自訂測試物品 ml_mod:dungeon_tester
world.afterEvents.itemUse.subscribe((event) => {
    const { itemStack, source: player } = event;
    if (!player || player.typeId !== "minecraft:player") return;

    if (itemStack.typeId === "ml_mod:dungeon_tester") {
        system.run(() => {
            openDungeonTestDDUI(player);
        });
    }
});

// 4. 監聽 ScriptEvent 指令開啟選單 (/scriptevent ml_mod:dungeon)
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, sourceEntity } = event;

    let player = sourceEntity;
    if (!player || player.typeId !== "minecraft:player") {
        const players = world.getAllPlayers();
        if (players.length > 0) player = players[0];
    }
    if (!player) return;

    if (id === "ml_mod:dungeon" || id === "ml_mod:menu" || id === "ml_mod:test") {
        system.run(() => {
            openDungeonTestDDUI(player);
        });
    }
});

console.warn("[Scripting] ml_mod System & DDUI Dungeon Tester Loaded Successfully!");
