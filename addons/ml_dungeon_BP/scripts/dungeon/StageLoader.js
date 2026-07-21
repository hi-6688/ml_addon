import { world, BlockVolume, BlockPermutation } from "@minecraft/server";
import { STAGE_CONFIGS } from "./stages_config.js";

// 定義雙舞台座標
export const STAGE_LOCATIONS = {
    A: { x: 0, y: 64, z: 0 },
    B: { x: 200, y: 64, z: 0 }
};

export class StageLoader {
    /**
     * 清空指定舞台區域 (使用 air.mcstructure 及 Entity Sweep)
     */
    static clearStageArea(dimension, baseLoc) {
        try {
            // 1. 掃除範圍內的殘留實體 (怪物/掉落物/箭矢/經驗球，排除玩家)
            const entities = dimension.getEntities({ location: baseLoc, maxDistance: 64 });
            for (const entity of entities) {
                if (entity.typeId !== "minecraft:player") {
                    try { entity.remove(); } catch (e) {}
                }
            }

            // 2. 極速覆蓋清空 64x64x64 方塊區域
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
     * 幕後加載關卡結構並掃描 1~9 號標記點
     */
    static loadStage(dimension, stageNumber, baseLoc) {
        const config = STAGE_CONFIGS[stageNumber] || STAGE_CONFIGS[1];
        let structName = config.structureName;

        // 1. 先進行區域清空
        this.clearStageArea(dimension, baseLoc);

        // 2. 放置關卡結構 (支援帶 namespace 的路徑規則 ml_mod:test1 或 test1)
        try {
            try {
                world.structureManager.place(`ml_mod:${structName}`, dimension, baseLoc, { includeEntities: true });
            } catch (e1) {
                world.structureManager.place(structName, dimension, baseLoc, { includeEntities: true });
            }
            console.warn(`[StageLoader] 成功放置結構 ${structName} 至 (${baseLoc.x}, ${baseLoc.y}, ${baseLoc.z})！`);
        } catch (e) {
            console.error(`[StageLoader] 放置結構 ${structName} 失敗: ${e}`);
        }

        // 3. 掃描 64x64x64 區域內的標記方塊 (ml_mod:spawner_marker_1~9 以及 spawn)
        const markerMap = {
            spawn: null,
            1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
        };

        try {
            const volume = new BlockVolume(
                baseLoc,
                { x: baseLoc.x + 63, y: baseLoc.y + 63, z: baseLoc.z + 63 }
            );

            // 搜集所有自訂標記方塊 identifier
            const targetTypes = ["ml_mod:spawner_marker_spawn"];
            for (let i = 1; i <= 9; i++) {
                targetTypes.push(`ml_mod:spawner_marker_${i}`);
            }

            const foundBlocks = dimension.getBlocks(volume, { includeBlockTypes: targetTypes });
            for (const block of foundBlocks) {
                const typeId = block.typeId;
                const loc = { x: block.location.x, y: block.location.y, z: block.location.z };

                if (typeId === "ml_mod:spawner_marker_spawn") {
                    markerMap.spawn = loc;
                } else {
                    const num = typeId.replace("ml_mod:spawner_marker_", "");
                    if (markerMap[num]) {
                        markerMap[num].push(loc);
                    }
                }

                // 保留標記方塊本體，不替換為空氣
            }
        } catch (e) {
            console.error(`[StageLoader] 掃描標記方塊失敗: ${e}`);
        }

        // 如果結構中沒有擺放 spawn 標記，則回退使用 offset 計算
        if (!markerMap.spawn) {
            const offset = config.spawnLocationOffset || { x: 2, y: 1, z: 2 };
            markerMap.spawn = {
                x: baseLoc.x + offset.x,
                y: baseLoc.y + offset.y,
                z: baseLoc.z + offset.z
            };
        }

        return {
            config,
            baseLoc,
            markerMap
        };
    }
}
