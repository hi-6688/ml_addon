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
        try {
            this.dimension = world.getDimension("ml_mod:dungeon_dim");
        } catch (e) {
            console.error(`[StageManager] 無法獲取自訂維度 ml_mod:dungeon_dim: ${e}`);
        }

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
     * 開始或開啟地牢挑戰
     */
    startSession(player) {
        if (!this.dimension) {
            try {
                this.dimension = world.getDimension("ml_mod:dungeon_dim");
            } catch (e) {}
        }

        this.isSessionActive = true;
        this.currentStage = SaveManager.getCurrentStage(player);
        this.currentArea = "A";

        const baseLoc = STAGE_LOCATIONS[this.currentArea];
        world.sendMessage(`§b[地牢系統] 正在為您載入 Stage ${this.currentStage} ...`);

        // 1. 先將玩家傳送至舞台 A
        player.teleport({ x: baseLoc.x + 4, y: baseLoc.y + 2, z: baseLoc.z + 4 }, { dimension: this.dimension });

        // 2. 載入當前關卡結構與標記點
        this.currentStageData = StageLoader.loadStage(this.dimension, this.currentStage, baseLoc);

        // 3. 再次精確傳送至掃描到的出生點
        const spawnPt = this.currentStageData.markerMap.spawn;
        player.teleport({ x: spawnPt.x + 0.5, y: spawnPt.y + 1, z: spawnPt.z + 0.5 }, { dimension: this.dimension });

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
    onStageCleared() {
        const nextStageNum = this.currentStage + 1;
        SaveManager.saveStageProgress(nextStageNum);

        const nextArea = this.currentArea === "A" ? "B" : "A";
        const nextBaseLoc = STAGE_LOCATIONS[nextArea];

        // 1. 幕後在另一個舞台預載下一關 (如果下關配置存在)
        if (STAGE_CONFIGS[nextStageNum]) {
            world.sendMessage(`§a[系統幕後] 正在舞台 ${nextArea} 預載 Stage ${nextStageNum} ...`);
            this.nextStageData = StageLoader.loadStage(this.dimension, nextStageNum, nextBaseLoc);
        }

        // 2. 在當前關卡出口生成一個過場傳送區或提示選單
        world.sendMessage(`§e[通關提示] 輸入 §b/scriptevent ml_mod:next§e 或踩踏傳送區進入下一關！`);
    }

    /**
     * 玩家確認前往下一關
     */
    proceedToNextStage(player) {
        if (!this.nextStageData) {
            this.currentStage++;
            const nextArea = this.currentArea === "A" ? "B" : "A";
            const nextBaseLoc = STAGE_LOCATIONS[nextArea];
            this.nextStageData = StageLoader.loadStage(this.dimension, this.currentStage, nextBaseLoc);
        }

        this.currentArea = this.currentArea === "A" ? "B" : "A";
        this.currentStage++;
        this.currentStageData = this.nextStageData;
        this.nextStageData = null;

        // 一瞬間將玩家傳送至新舞台的 spawn 點
        const spawnPt = this.currentStageData.markerMap.spawn;
        player.teleport({ x: spawnPt.x + 0.5, y: spawnPt.y + 1, z: spawnPt.z + 0.5 }, { dimension: this.dimension });

        world.sendMessage(`§g[進入關卡] 歡迎來到 Stage ${this.currentStage} !`);
        this.startCombatForCurrentStage();
    }

    /**
     * 重試當前關卡
     */
    retryCurrentStage(player) {
        const baseLoc = STAGE_LOCATIONS[this.currentArea];
        this.currentStageData = StageLoader.loadStage(this.dimension, this.currentStage, baseLoc);
        const spawnPt = this.currentStageData.markerMap.spawn;

        if (player && player.isValid) {
            player.teleport({ x: spawnPt.x + 0.5, y: spawnPt.y + 1, z: spawnPt.z + 0.5 }, { dimension: this.dimension });
        }

        this.startCombatForCurrentStage();
    }
}
