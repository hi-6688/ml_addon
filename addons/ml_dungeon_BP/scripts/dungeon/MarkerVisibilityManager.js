import { world, system, EquipmentSlot } from "@minecraft/server";

export class MarkerVisibilityManager {
    static init() {
        const markerBlockTypes = [
            "ml_mod:spawner_marker_1",
            "ml_mod:spawner_marker_2",
            "ml_mod:spawner_marker_3",
            "ml_mod:spawner_marker_4",
            "ml_mod:spawner_marker_5",
            "ml_mod:spawner_marker_6",
            "ml_mod:spawner_marker_7",
            "ml_mod:spawner_marker_8",
            "ml_mod:spawner_marker_9",
            "ml_mod:spawner_marker_spawn"
        ];

        const blockToParticleMap = {
            "ml_mod:spawner_marker_1": "ml_mod:marker_particle_1",
            "ml_mod:spawner_marker_2": "ml_mod:marker_particle_2",
            "ml_mod:spawner_marker_3": "ml_mod:marker_particle_3",
            "ml_mod:spawner_marker_4": "ml_mod:marker_particle_4",
            "ml_mod:spawner_marker_5": "ml_mod:marker_particle_5",
            "ml_mod:spawner_marker_6": "ml_mod:marker_particle_6",
            "ml_mod:spawner_marker_7": "ml_mod:marker_particle_7",
            "ml_mod:spawner_marker_8": "ml_mod:marker_particle_8",
            "ml_mod:spawner_marker_9": "ml_mod:marker_particle_9",
            "ml_mod:spawner_marker_spawn": "ml_mod:marker_particle_spawn"
        };

        const isHoldingMarker = (player) => {
            const equippable = player.getComponent("minecraft:equippable");
            if (!equippable) return false;
            let mainhand = null;
            try {
                mainhand = equippable.getEquipment(EquipmentSlot.Mainhand);
            } catch (e) {
                try { mainhand = equippable.getEquipment("Mainhand"); } catch (e2) {}
            }
            return mainhand && markerBlockTypes.includes(mainhand.typeId);
        };

        // 大範圍廣域視野掃描 (半徑 16 格，完美覆蓋整座副本場景)
        const updateAndRenderMarkersNearPlayer = (player) => {
            const pDim = player.dimension;
            const pPos = player.location;
            const px = Math.floor(pPos.x);
            const py = Math.floor(pPos.y);
            const pz = Math.floor(pPos.z);

            const minX = px - 16;
            const maxX = px + 16;
            const minY = Math.max(pDim.heightRange.min, py - 8);
            const maxY = Math.min(pDim.heightRange.max, py + 12);
            const minZ = pz - 16;
            const maxZ = pz + 16;

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    for (let z = minZ; z <= maxZ; z++) {
                        try {
                            const block = pDim.getBlock({ x, y, z });
                            if (!block) continue;
                            const particleId = blockToParticleMap[block.typeId];
                            if (particleId) {
                                pDim.spawnParticle(particleId, { x: x + 0.5, y: y + 0.5, z: z + 0.5 });
                            }
                        } catch (e) {
                            // 防護區塊未載入拋錯
                        }
                    }
                }
            }
        };

        // 1. 切換手持物品瞬間發射
        world.afterEvents.playerItemHeldChange?.subscribe((event) => {
            if (markerBlockTypes.includes(event.itemStack?.typeId)) {
                updateAndRenderMarkersNearPlayer(event.player);
            }
        });

        // 2. 僅在手持標記物時進行大範圍 16 格半徑補給發射 (每 4 ticks = 0.2s)
        system.runInterval(() => {
            try {
                for (const player of world.getAllPlayers()) {
                    if (isHoldingMarker(player)) {
                        updateAndRenderMarkersNearPlayer(player);
                    }
                }
            } catch (err) {}
        }, 4);

        console.warn("[Scripting] Wide-Range (R=16) MarkerVisibilityManager Ready!");
    }
}
