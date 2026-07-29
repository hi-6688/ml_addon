import { world, system } from "@minecraft/server";
import { StageLoader, STAGE_LOCATIONS } from "./StageLoader.js";
import { StageCombat } from "./StageCombat.js";
import { SaveManager } from "./SaveManager.js";
import { STAGE_CONFIGS } from "./stages_config.js";

export class StageManager {
    constructor() {
        this.dimension = null;
        this.currentStage = 1;
        this.currentArea = "A"; // 當前活躍舞台 (A 或 B)
        this.currentStageData = null;
        this.nextStageData = null;
        this.combatInstance = null;

        this.isSessionActive = false;
    }

    init() {
        // 監聽玩家死亡重試
        world.afterEvents.entityDie.subscribe(event => {
            if (!this.isSessionActive) return;
            const deadEntity = event.deadEntity;
            if (deadEntity.typeId === "minecraft:player") {
                world.sendMessage("§c[挑戰失敗] 玩家於關卡中陣亡！正在重新重置當前關卡...");
                system.runTimeout(() => {
                    this.retryCurrentStage(deadEntity);
                }, 60);
            }
        });
    }

    /**
     * 獲取地牢專屬自訂維度 ml_mod:dungeon_dim
     */
    getDungeonDimension() {
        try {
            const dim = world.getDimension("ml_mod:dungeon_dim");
            if (dim) {
                console.warn(`[StageManager] 🎯 成功取得自訂維度: ${dim.id}`);
                return dim;
            }
        } catch (e) {
            console.error(`[StageManager] 嘗試獲取 ml_mod:dungeon_dim: ${e}`);
        }
        return world.getDimension("ml_mod:dungeon_dim");
    }

    /**
     * 開始地牢挑戰 (傳送至自訂維度 ml_mod:dungeon_dim 舞台，面向西北 -45°)
     */
    async startSession(player) {
        this.dimension = this.getDungeonDimension();

        this.isSessionActive = true;
        this.currentStage = SaveManager.getCurrentStage(player);
        this.currentArea = "A";

        const baseLoc = STAGE_LOCATIONS[this.currentArea];
        world.sendMessage(`§b[地牢系統] 正在自訂維度 ml_mod:dungeon_dim 為您載入 Stage ${this.currentStage} ...`);

        // 1. 預先傳送玩家至自訂維度與舞台起點，鎖定面向西北方 (Yaw = -45°)
        player.teleport(
            { x: baseLoc.x + 4, y: baseLoc.y + 2, z: baseLoc.z + 4 },
            { dimension: this.dimension, rotation: { x: 0, y: -45 } }
        );

        // 2. 異步加載關卡結構與標記點 (使用 SAPI 暫時性常載區)
        this.currentStageData = await StageLoader.loadStage(this.dimension, this.currentStage, baseLoc);

        // 3. 精確傳送至出生點標記 (spawner_marker_spawn)，固定面向西北方 (Yaw = -45°)
        const spawnPt = this.currentStageData.markerMap.spawn;
        player.teleport(
            { x: spawnPt.x + 0.5, y: spawnPt.y + 1, z: spawnPt.z + 0.5 },
            { dimension: this.dimension, rotation: { x: 0, y: -45 } }
        );

        // 4. 啟動戰鬥系統
        this.startCombatForCurrentStage();
    }

    startCombatForCurrentStage() {
        if (this.combatInstance) {
            this.combatInstance.destroy();
        }

        this.combatInstance = new StageCombat(
            this.dimension,
            this.currentStageData,
            () => this.onStageCleared(),
            () => {}
        );

        this.combatInstance.startCombat();
    }

    /**
     * 當前關卡通關處置 (雙舞台 Ping-Pong 幕後預載下一關)
     */
    async onStageCleared() {
        const nextStageNum = this.currentStage + 1;
        SaveManager.saveStageProgress(nextStageNum);

        const nextArea = this.currentArea === "A" ? "B" : "A";
        const nextBaseLoc = STAGE_LOCATIONS[nextArea];

        if (STAGE_CONFIGS[nextStageNum]) {
            world.sendMessage(`§a[系統幕後] 正在舞台 ${nextArea} 預載 Stage ${nextStageNum} ...`);
            this.nextStageData = await StageLoader.loadStage(this.dimension, nextStageNum, nextBaseLoc);
        }

        world.sendMessage(`§e[通關提示] 輸入 §b/scriptevent ml_mod:next§e 或踩踏傳送區進入下一關！`);
    }

    /**
     * 玩家確認前往下一關
     */
    async proceedToNextStage(player) {
        if (!this.nextStageData) {
            this.currentStage++;
            const nextArea = this.currentArea === "A" ? "B" : "A";
            const nextBaseLoc = STAGE_LOCATIONS[nextArea];
            this.nextStageData = await StageLoader.loadStage(this.dimension, this.currentStage, nextBaseLoc);
        }

        this.currentArea = this.currentArea === "A" ? "B" : "A";
        this.currentStage++;
        this.currentStageData = this.nextStageData;
        this.nextStageData = null;

        const spawnPt = this.currentStageData.markerMap.spawn;
        player.teleport(
            { x: spawnPt.x + 0.5, y: spawnPt.y + 1, z: spawnPt.z + 0.5 },
            { dimension: this.dimension, rotation: { x: 0, y: -45 } }
        );

        world.sendMessage(`§g[進入關卡] 歡迎來到 Stage ${this.currentStage} !`);
        this.startCombatForCurrentStage();
    }

    /**
     * 重試當前關卡
     */
    async retryCurrentStage(player) {
        const baseLoc = STAGE_LOCATIONS[this.currentArea];
        this.currentStageData = await StageLoader.loadStage(this.dimension, this.currentStage, baseLoc);
        const spawnPt = this.currentStageData.markerMap.spawn;

        if (player && player.isValid) {
            player.teleport(
                { x: spawnPt.x + 0.5, y: spawnPt.y + 1, z: spawnPt.z + 0.5 },
                { dimension: this.dimension, rotation: { x: 0, y: -45 } }
            );
        }

        this.startCombatForCurrentStage();
    }
}

export const stageManager = new StageManager();
stageManager.init();
