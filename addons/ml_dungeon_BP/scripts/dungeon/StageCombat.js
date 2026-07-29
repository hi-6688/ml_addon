import { world, system, ItemStack, EquipmentSlot } from "@minecraft/server";
import { SaveManager } from "./SaveManager.js";



export class StageCombat {
    constructor(dimension, stageData, onStageCleared, onPlayerDied) {
        this.dimension = dimension;
        this.stageData = stageData;
        this.onStageCleared = onStageCleared;
        this.onPlayerDied = onPlayerDied;

        this.currentWave = 1;
        this.activeMobCount = 0;
        this.activeEntities = [];
        this.isCleared = false;
        this.isActive = false;

        this._setupEvents();
    }

    startCombat() {
        this.isActive = true;
        this.isCleared = false;
        this.currentWave = 1;
        console.warn(`[StageCombat] 開始關卡 ${this.stageData.config.name} 的戰鬥！`);
        this.spawnWave(this.currentWave);
    }

    spawnWave(waveIndex) {
        const config = this.stageData.config;
        const waveItems = config.waves.filter(w => w.wave === waveIndex);

        if (waveItems.length === 0) {
            // 所有波次皆已結束 -> 通關！
            this.handleStageCleared();
            return;
        }

        console.warn(`[StageCombat] 觸發第 ${waveIndex} 波生怪！`);
        let spawnedTotal = 0;

        for (const item of waveItems) {
            const points = this.stageData.markerMap[item.markerId] || [];
            if (points.length === 0) {
                // 若找不到對應號碼標記方塊，預設在舞台中心生怪
                const fallbackLoc = {
                    x: this.stageData.baseLoc.x + 10,
                    y: this.stageData.baseLoc.y + 1,
                    z: this.stageData.baseLoc.z + 10
                };
                points.push(fallbackLoc);
            }

            for (let i = 0; i < item.count; i++) {
                const spawnPt = points[i % points.length];
                try {
                    const mob = this.dimension.spawnEntity(item.mobType, spawnPt);
                    if (item.nameTag) {
                        mob.nameTag = item.nameTag;
                    }
                    try {
                        const equippable = mob.getComponent("minecraft:equippable");
                        if (equippable) {
                            equippable.setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:bow", 1));
                        }
                    } catch (eqErr) {
                        console.warn(`[StageCombat] 手持弓裝備自動配發失敗: ${eqErr}`);
                    }
                    this.activeEntities.push(mob);
                    spawnedTotal++;
                } catch (e) {

                    console.error(`[StageCombat] 生怪失敗: ${e}`);
                }
            }
        }

        this.activeMobCount += spawnedTotal;
        world.sendMessage(`§a[地牢通知] 第 §e${waveIndex}§a 波敵對生物已生成！剩餘數量: §c${this.activeMobCount}`);
    }

    _setupEvents() {
        // 監聽實體死亡事件
        this.dieSub = world.afterEvents.entityDie.subscribe(event => {
            if (!this.isActive || this.isCleared) return;

            const deadEntity = event.deadEntity;
            const index = this.activeEntities.findIndex(e => e.id === deadEntity.id);

            if (index !== -1) {
                this.activeEntities.splice(index, 1);
                this.activeMobCount = Math.max(0, this.activeMobCount - 1);
                
                world.sendMessage(`§7[擊殺] 敵對生物已被消滅！剩餘怪物: §c${this.activeMobCount}`);

                if (this.activeMobCount === 0) {
                    // 當前波次清空，進行下一波次
                    this.currentWave++;
                    system.runTimeout(() => {
                        this.spawnWave(this.currentWave);
                    }, 40); // 2 秒後觸發下一波
                }
            }
        });
    }

    handleStageCleared() {
        if (this.isCleared) return;
        this.isCleared = true;
        this.isActive = false;

        world.sendMessage(`§g§l[通關成功] 恭喜通過 ${this.stageData.config.name}！進度已自動保存！`);
        
        // 觸發外部通關回呼（進入下一個 Stage 預載）
        if (this.onStageCleared) {
            this.onStageCleared();
        }
    }

    destroy() {
        this.isActive = false;
        if (this.dieSub) {
            world.afterEvents.entityDie.unsubscribe(this.dieSub);
        }
    }
}
