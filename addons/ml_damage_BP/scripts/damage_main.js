import { world, TextPrimitive } from "@minecraft/server";

// 傷害數字懸浮指示器系統 (大範圍高拉升動態縮放)
world.afterEvents.entityHurt.subscribe((event) => {
    const hurtEntity = event.hurtEntity;
    const damage = event.damage;
    const damageSource = event.damageSource;

    if (!hurtEntity || !hurtEntity.isValid) return;

    try {
        const dim = hurtEntity.dimension;
        const damager = damageSource.damagingEntity;

        let spawnPos = null;
        let distance = 3.0; // 預設距離

        if (damager && damager.getHeadLocation) {
            const pHead = damager.getHeadLocation();
            const viewDir = damager.getViewDirection();
            const eLoc = hurtEntity.location;
            const eHead = hurtEntity.getHeadLocation ? hurtEntity.getHeadLocation() : eLoc;

            const dx = eLoc.x - pHead.x;
            const dy = eLoc.y - pHead.y;
            const dz = eLoc.z - pHead.z;
            distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            let hitLocation = null;
            const projectile = damageSource.damagingProjectile;
            if (projectile) {
                try { hitLocation = projectile.location; } catch (e) {}
            }

            if (!hitLocation) {
                let intersectY = eLoc.y + (eHead.y - eLoc.y) / 2;
                const horizontalLenSq = viewDir.x * viewDir.x + viewDir.z * viewDir.z;
                if (horizontalLenSq > 0.001) {
                    const t = (dx * viewDir.x + dz * viewDir.z) / horizontalLenSq;
                    if (t > 0) {
                        const projectedY = pHead.y + viewDir.y * t;
                        intersectY = Math.max(eLoc.y, Math.min(projectedY, eHead.y + 0.15));
                    }
                }
                hitLocation = { x: eLoc.x, y: intersectY, z: eLoc.z };
            }

            let entityRadius = 0.3;
            try {
                const aabb = hurtEntity.getAABB();
                if (aabb && aabb.extent) {
                    entityRadius = Math.max(aabb.extent.x, aabb.extent.z);
                }
            } catch (e) {}

            const maxOffset = entityRadius + 0.25;
            const offsetDistance = Math.max(0.0, Math.min(maxOffset, distance - 0.3));

            spawnPos = {
                x: hitLocation.x - (viewDir.x * offsetDistance) + (Math.random() - 0.5) * 0.2,
                y: hitLocation.y + 0.1,
                z: hitLocation.z - (viewDir.z * offsetDistance) + (Math.random() - 0.5) * 0.2
            };
        } else {
            const headPos = hurtEntity.getHeadLocation ? hurtEntity.getHeadLocation() : hurtEntity.location;
            spawnPos = {
                x: headPos.x + (Math.random() - 0.5) * 0.4,
                y: headPos.y + 0.4,
                z: headPos.z + (Math.random() - 0.5) * 0.4
            };
        }

        const formattedDamage = Math.round(damage * 10) / 10;
        const displayText = `§c-${formattedDamage}`;

        const shape = new TextPrimitive(spawnPos, displayText);

        // 近距離保持精緻小巧 (0.8x)，隨著距離快速拉升至最高 5.0x 補償遠距離視覺
        const dynamicScale = Math.min(5.0, Math.max(0.8, 0.8 + (distance - 2.0) * 0.35));

        shape.depthTest = false;      // 穿透遮擋 (永遠可見)
        shape.useRotation = false;    // 面向玩家視角 (Billboard 效果)
        shape.scale = dynamicScale;   // 動態拉升縮放
        shape.timeLeft = 0.8;         // 原生倒數 0.8 秒銷毀

        world.primitiveShapesManager.addText(shape, dim);

    } catch (e) {
        console.error("[Damage Indicator] Error creating TextPrimitive:", e);
    }
});

console.warn("[Scripting] Wide Dynamic Scale TextPrimitive Damage Popups Activated!");
