import { world } from "@minecraft/server";

// 獨立暴擊與傷害數字動態發射器
world.afterEvents.entityHurt.subscribe((event) => {
    const hurtEntity = event.hurtEntity;
    const damage = event.damage;
    const damageSource = event.damageSource;

    if (!hurtEntity || !hurtEntity.isValid) return;

    try {
        const dim = hurtEntity.dimension;
        const headPos = hurtEntity.getHeadLocation ? hurtEntity.getHeadLocation() : hurtEntity.location;
        const particlePos = {
            x: headPos.x + (Math.random() - 0.5) * 0.4,
            y: headPos.y + 0.5 + (Math.random() - 0.5) * 0.2,
            z: headPos.z + (Math.random() - 0.5) * 0.4
        };

        // 判斷是否為暴擊或重度傷害 (> 5 點傷害)
        const isCrit = damage >= 5 || damageSource.cause === "entityAttack";
        const particleId = isCrit ? "ml_mod:damage_crit" : "ml_mod:damage_normal";

        dim.spawnParticle(particleId, particlePos);
    } catch (e) {}
});

console.warn("[Scripting] Independent Damage Popups System Activated!");
