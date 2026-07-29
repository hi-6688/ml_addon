import { world, BlockVolume } from "@minecraft/server";
import { STAGE_CONFIGS } from "./stages_config.js";

// 定義自訂維度 ml_mod:dungeon_dim 雙舞台座標
export const STAGE_LOCATIONS = {
    A: { x: 0, y: 64, z: 0 },
    B: { x: 200, y: 64, z: 0 }
};

// 關卡結構最大尺寸上限：64 x 64 x 64 格
export const STRUCTURE_MAX_SIZE = 64;
// 實體掃除半徑
const ENTITY_SWEEP_RADIUS = 60;

export class StageLoader {
    /**
     * 清空指定舞台區域
     */
    static clearStageArea(dimension, baseLoc) {
        try {
            const centerLoc = {
                x: baseLoc.x + STRUCTURE_MAX_SIZE / 2,
                y: baseLoc.y + STRUCTURE_MAX_SIZE / 2,
                z: baseLoc.z + STRUCTURE_MAX_SIZE / 2
            };
            const entities = dimension.getEntities({ location: centerLoc, maxDistance: ENTITY_SWEEP_RADIUS });
            for (const entity of entities) {
                if (entity.typeId !== "minecraft:player") {
                    try { entity.remove(); } catch (e) {}
                }
            }

            try {
                world.structureManager.place("ml_mod:dungeon_clear", dimension, baseLoc);
            } catch (e1) {
                try { world.structureManager.place("dungeon_clear", dimension, baseLoc); } catch (e2) {}
            }
            console.warn(`[StageLoader] 成功於 (${baseLoc.x}, ${baseLoc.y}, ${baseLoc.z}) 清空舞台區域！`);
        } catch (e) {
            console.error(`[StageLoader] 清空舞台失敗: ${e}`);
        }
    }

    /**
     * 在自訂維度加載關卡結構並掃描標記點 (採用 SAPI 暫時性常載區)
     */
    static async loadStage(dimension, stageNumber, baseLoc) {
        const config = STAGE_CONFIGS[stageNumber] || STAGE_CONFIGS[1];
        let structName = config.structureName;

        // 0. 使用 SAPI tickingAreaManager 建立自訂維度的暫時性常載區
        const areaName = `ml_dungeon_${baseLoc.x}`;
        try {
            if (world.tickingAreaManager && typeof world.tickingAreaManager.createTickingArea === "function") {
                await world.tickingAreaManager.createTickingArea(areaName, {
                    dimension: dimension,
                    from: baseLoc,
                    to: { x: baseLoc.x + STRUCTURE_MAX_SIZE - 1, y: baseLoc.y + STRUCTURE_MAX_SIZE - 1, z: baseLoc.z + STRUCTURE_MAX_SIZE - 1 }
                });
            } else {
                dimension.runCommandAsync(`tickingarea add ${baseLoc.x} ${baseLoc.y} ${baseLoc.z} ${baseLoc.x + 63} ${baseLoc.y + 63} ${baseLoc.z + 63} ${areaName}`);
            }
        } catch (e) {
            try {
                dimension.runCommandAsync(`tickingarea add ${baseLoc.x} ${baseLoc.y} ${baseLoc.z} ${baseLoc.x + 63} ${baseLoc.y + 63} ${baseLoc.z + 63} ${areaName}`);
            } catch (err) {}
        }

        // 1. 清空區域
        this.clearStageArea(dimension, baseLoc);

        // 2. 放置結構
        try {
            try {
                world.structureManager.place(`ml_mod:${structName}`, dimension, baseLoc, { includeEntities: true });
            } catch (e1) {
                world.structureManager.place(structName, dimension, baseLoc, { includeEntities: true });
            }
            console.warn(`[StageLoader] 成功在自訂維度放置結構 ${structName} 至 (${baseLoc.x}, ${baseLoc.y}, ${baseLoc.z})！`);
        } catch (e) {
            console.error(`[StageLoader] 放置結構 ${structName} 失敗: ${e}`);
        }

        // 3. 掃描標記點 (使用 ListBlockVolume.getBlockLocationIterator())
        const markerMap = {
            spawn: null,
            1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
        };

        try {
            const scanEnd = STRUCTURE_MAX_SIZE - 1;
            const volume = new BlockVolume(
                baseLoc,
                { x: baseLoc.x + scanEnd, y: baseLoc.y + scanEnd, z: baseLoc.z + scanEnd }
            );

            const targetTypes = ["ml_mod:spawner_marker_spawn"];
            for (let i = 1; i <= 9; i++) {
                targetTypes.push(`ml_mod:spawner_marker_${i}`);
            }

            const foundVolume = dimension.getBlocks(volume, { includeBlockTypes: targetTypes });
            if (foundVolume) {
                let locIterator = null;
                if (typeof foundVolume.getBlockLocationIterator === "function") {
                    locIterator = foundVolume.getBlockLocationIterator();
                } else if (Array.isArray(foundVolume) || typeof foundVolume[Symbol.iterator] === "function") {
                    locIterator = foundVolume;
                }

                if (locIterator) {
                    for (const item of locIterator) {
                        const loc = item.location ? item.location : item;
                        const block = dimension.getBlock(loc);
                        if (!block) continue;
                        const typeId = block.typeId;

                        if (typeId === "ml_mod:spawner_marker_spawn") {
                            markerMap.spawn = { x: loc.x, y: loc.y, z: loc.z };
                            console.warn(`[StageLoader] 🎯 精確獲取玩家出生點標記於 (${loc.x}, ${loc.y}, ${loc.z})`);
                        } else if (typeId.startsWith("ml_mod:spawner_marker_")) {
                            const num = typeId.replace("ml_mod:spawner_marker_", "");
                            if (markerMap[num]) {
                                markerMap[num].push({ x: loc.x, y: loc.y, z: loc.z });
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`[StageLoader] 掃描標記方塊失敗: ${e}`);
        }

        if (!markerMap.spawn) {
            const offset = config.spawnLocationOffset || { x: 2, y: 1, z: 2 };
            markerMap.spawn = {
                x: baseLoc.x + offset.x,
                y: baseLoc.y + offset.y,
                z: baseLoc.z + offset.z
            };
            console.warn(`[StageLoader] 預設回退出生點於 (${markerMap.spawn.x}, ${markerMap.spawn.y}, ${markerMap.spawn.z})`);
        }

        return {
            config,
            baseLoc,
            markerMap
        };
    }
}
