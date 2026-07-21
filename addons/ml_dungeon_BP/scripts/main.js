import { world, system, BlockVolume, BlockPermutation, MolangVariableMap } from "@minecraft/server";
import { StageManager } from "./dungeon/StageManager.js";
import { SaveManager } from "./dungeon/SaveManager.js";
import { MarkerVisibilityManager } from "./dungeon/MarkerVisibilityManager.js";
import { ActionFormData } from "@minecraft/server-ui";

console.warn("ml_mod System Loaded Successfully!");

const CUSTOM_DIM_ID = "mymod:custom_dimension";
const DUNGEON_DIM_ID = "ml_mod:dungeon_dim";

// 實例化地牢總控管理器
const dungeonManager = new StageManager();

// 1. 註冊自訂維度 (必須於 startup 事件中註冊)
system.beforeEvents.startup.subscribe((event) => {
    try {
        event.dimensionRegistry.registerCustomDimension(CUSTOM_DIM_ID);
        event.dimensionRegistry.registerCustomDimension(DUNGEON_DIM_ID);
        console.warn(`[ml_mod] 成功註冊自訂維度: ${CUSTOM_DIM_ID} 與 ${DUNGEON_DIM_ID}`);
    } catch (e) {
        console.error(`[ml_mod] 註冊自訂維度失敗: ${e}`);
    }
});

// 初始化地牢管理器與遊戲規則與標記方塊動態可見性
system.run(() => {
    try {
        dungeonManager.init();
        MarkerVisibilityManager.init();
        
        // 自動開啟死亡不掉落 keepInventory
        if (world.gameRules) {
            world.gameRules.keepInventory = true;
        }
        const overworld = world.getDimension("overworld");
        overworld.runCommand("gamerule keepInventory true");
        console.warn("[ml_mod] 成功啟用死亡不掉落 (keepInventory = true)");
    } catch (e) {}
});

// 輔助函式：鋪設安全落腳平台 (使用 BlockVolume 類別)
function ensurePlatform(dim) {
    try {
        const volume = new BlockVolume({ x: -5, y: 64, z: -5 }, { x: 5, y: 64, z: 5 });
        dim.fillBlocks(volume, BlockPermutation.resolve("minecraft:quartz_block"));
        dim.setBlockType({ x: 0, y: 64, z: 0 }, "minecraft:sea_lantern");
        console.warn(`[Custom Dimension] 成功於 (0, 64, 0) 建置 11x11 石英平台！`);
    } catch (e) {
        console.error(`[Custom Dimension] 建置平台失敗: ${e}`);
    }
}

// 2. 官方正規指令介面：監聽 /scriptevent 事件
// 用法範例：
// /scriptevent mymod:dim
// /scriptevent mymod:tp dim
// /scriptevent mymod:tp overworld
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, message, sourceEntity } = event;

    let player = sourceEntity;
    if (!player || player.typeId !== "minecraft:player") {
        const players = world.getAllPlayers();
        if (players.length > 0) player = players[0];
    }
    if (!player) return;

    // 處理 /scriptevent ml_mod:dungeon 彈出選單
    if (id === "ml_mod:dungeon" || id === "ml_mod:menu") {
        system.run(() => {
            const currentStage = SaveManager.getCurrentStage(player);
            const form = new ActionFormData();
            form.title("§l§gml_mod 地牢冒險");
            form.body(`§7歡迎來到地牢系統！\n§e當前存檔進度: §cStage ${currentStage}`);
            form.button(`§a進入地牢 (Stage ${currentStage})`, "textures/ui/play_icon");
            form.button("§c重置存檔進度 (從 Stage 1 開始)", "textures/ui/refresh_light");
            form.button("§7返回主世界", "textures/ui/cancel");

            form.show(player).then(response => {
                if (response.canceled) return;
                const selection = response.selection;
                if (selection === 0) {
                    dungeonManager.startSession(player);
                } else if (selection === 1) {
                    SaveManager.resetSave();
                    player.sendMessage("§c[ml_mod] 存檔進度已成功重置為 Stage 1！");
                } else if (selection === 2) {
                    const overworld = world.getDimension("minecraft:overworld");
                    player.teleport({ x: 0, y: 66, z: 0 }, { dimension: overworld });
                }
            });
        });
    } else if (id === "ml_mod:next") {
        system.run(() => {
            dungeonManager.proceedToNextStage(player);
        });
    } else if (id === "ml_mod:reset") {
        system.run(() => {
            SaveManager.resetSave();
            player.sendMessage("§c[ml_mod] 存檔進度已成功重置為 Stage 1！");
        });
    }

    // 處理 /scriptevent mymod:dim 或 /scriptevent mymod:tp
    if (id === "mymod:dim" || id === "mymod:tp") {
        const target = message ? message.trim().toLowerCase() : "dim";
        
        // 取得操作目標實體 (預設為發送指令的玩家)
        let player = sourceEntity;
        if (!player || player.typeId !== "minecraft:player") {
            // 若由伺服器控制台觸發，尋找世界中第一個玩家
            const players = world.getAllPlayers();
            if (players.length > 0) player = players[0];
        }

        if (!player) {
            console.warn("[Custom Dimension] 找不到目標玩家可進行傳送");
            return;
        }

        // 遵循防禦性守則：將傳送與地塊生成寫入操作包裹於 system.run 中
        system.run(() => {
            try {
                if (target === "dim" || target === "custom_dimension" || id === "mymod:dim") {
                    const customDim = world.getDimension(CUSTOM_DIM_ID);
                    if (customDim) {
                        ensurePlatform(customDim);
                        player.teleport({ x: 0, y: 66, z: 0 }, { dimension: customDim });
                        player.sendMessage("§a[維度系統] 已透過正規指令將你傳送至自訂維度 (mymod:custom_dimension)！");
                    } else {
                        player.sendMessage("§c[維度系統] 找不到自訂維度，請確認實驗性功能已啟用！");
                    }
                } else if (target === "overworld" || target === "home") {
                    const overworld = world.getDimension("minecraft:overworld");
                    player.teleport({ x: 0, y: 66, z: 0 }, { dimension: overworld });
                    player.sendMessage("§a[維度系統] 已將你傳送回主世界！");
                }
            } catch (e) {
                console.error(`[Custom Dimension] 指令執行失敗: ${e}`);
            }
        });
    }
});

// 3. 雙重相容性：亦保留聊天欄 !dim / !overworld 快捷發送方式
let isChatSubscribed = false;
world.afterEvents.playerSpawn.subscribe(() => {
    if (isChatSubscribed) return;
    isChatSubscribed = true;

    try {
        world.beforeEvents.chatSend.subscribe((chatEvent) => {
            const msg = chatEvent.message.trim().toLowerCase();
            const sender = chatEvent.sender;

            if (msg === "!ml_mod" || msg === "!dungeon") {
                chatEvent.cancel = true;
                system.run(() => {
                    const currentStage = SaveManager.getCurrentStage(sender);
                    const form = new ActionFormData();
                    form.title("§l§gml_mod 地牢冒險");
                    form.body(`§7歡迎來到地牢系統！\n§e當前存檔進度: §cStage ${currentStage}`);
                    form.button(`§a進入地牢 (Stage ${currentStage})`, "textures/ui/play_icon");
                    form.button("§c重置存檔進度 (從 Stage 1 開始)", "textures/ui/refresh_light");
                    form.button("§7返回主世界", "textures/ui/cancel");

                    form.show(sender).then(response => {
                        if (response.canceled) return;
                        const selection = response.selection;
                        if (selection === 0) {
                            dungeonManager.startSession(sender);
                        } else if (selection === 1) {
                            SaveManager.resetSave();
                            sender.sendMessage("§c[ml_mod] 存檔進度已成功重置為 Stage 1！");
                        } else if (selection === 2) {
                            const overworld = world.getDimension("minecraft:overworld");
                            sender.teleport({ x: 0, y: 66, z: 0 }, { dimension: overworld });
                        }
                    });
                });
            } else if (msg === "!dim" || msg === "!tp_dim") {
                chatEvent.cancel = true;
                system.run(() => {
                    try {
                        const customDim = world.getDimension(CUSTOM_DIM_ID);
                        if (customDim) {
                            ensurePlatform(customDim);
                            sender.teleport({ x: 0, y: 66, z: 0 }, { dimension: customDim });
                            sender.sendMessage("§a[維度系統] 已將你傳送至自訂維度 (mymod:custom_dimension)！");
                        }
                    } catch (e) {
                        sender.sendMessage(`§c[維度系統] 傳送失敗: ${e}`);
                    }
                });
            } else if (msg === "!overworld" || msg === "!tp_home") {
                chatEvent.cancel = true;
                system.run(() => {
                    try {
                        const overworld = world.getDimension("minecraft:overworld");
                        sender.teleport({ x: 0, y: 66, z: 0 }, { dimension: overworld });
                        sender.sendMessage("§a[維度系統] 已將你傳送回主世界！");
                    } catch (e) {
                        sender.sendMessage(`§c[維度系統] 傳送失敗: ${e}`);
                    }
                });
            }
        });
    } catch (e) {}
});


// 4. 監聽實體受傷事件 (傷害跳字)
world.afterEvents.entityHurt.subscribe((event) => {
    const hurtEntity = event.hurtEntity;
    const damageSource = event.damageSource;
    const damageAmount = event.damage;

    // 排除自然環境傷害，僅在攻擊者是玩家時觸發
    const damager = damageSource.damagingEntity;
    if (!damager || damager.typeId !== "minecraft:player") return;

    // 1. 取得玩家視角朝向的單位向量
    const viewDir = damager.getViewDirection();

    // 2. 取得玩家與怪物的幾何座標資訊
    const pHead = damager.getHeadLocation();     // 玩家頭部 (相機起點)
    const eLoc = hurtEntity.location;           // 怪物腳部 (地面點)
    const eHead = hurtEntity.getHeadLocation();   // 怪物頭部 (眼高點)

    let hitLocation = null;

    // 情況 A：如果是投射物傷害（如箭矢、雪球、藥水），優先取得投射物的接觸點座標
    const projectile = damageSource.damagingProjectile;
    if (projectile) {
        try {
            hitLocation = projectile.location;
        } catch (e) {}
    }

    const dx = eLoc.x - pHead.x;
    const dy = eLoc.y - pHead.y;
    const dz = eLoc.z - pHead.z;

    // 情況 B：近戰攻擊，利用玩家視線與怪物垂直中心軸的幾何投影計算精確的「打擊點高度」
    if (!hitLocation) {
        // 預設高度為怪物中心點
        let intersectY = eLoc.y + (eHead.y - eLoc.y) / 2;

        const horizontalLookLenSq = viewDir.x * viewDir.x + viewDir.z * viewDir.z;
        if (horizontalLookLenSq > 0.001) {
            // 計算玩家視線在水平面上最接近怪物中心軸的距離參數 t
            const t = (dx * viewDir.x + dz * viewDir.z) / horizontalLookLenSq;
            if (t > 0) {
                // 計算在該距離下，視線高度的 Y 座標
                const projectedY = pHead.y + viewDir.y * t;
                // 限制打擊點在怪物腳底與頭頂之上 0.15 格之間
                intersectY = Math.max(eLoc.y, Math.min(projectedY, eHead.y + 0.15));
            }
        }

        // 打擊點 X, Z 軸使用怪物中心，Y 軸使用動態計算出的精確打擊高度
        hitLocation = {
            x: eLoc.x,
            y: intersectY,
            z: eLoc.z
        };
    }

    // 3. 計算基準生成座標（根據距離與怪物碰撞箱半徑動態計算偏移，防止嵌入模型內部，且貼身時避免數字穿過相機）
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // 取得怪物的半徑 (AABB)
    let entityRadius = 0.3; // 預設使用普通怪物半徑 (如殭屍)
    try {
        const aabb = hurtEntity.getAABB();
        if (aabb && aabb.extent) {
            // 取 X 與 Z 軸半寬度的最大值作為碰撞箱半徑
            entityRadius = Math.max(aabb.extent.x, aabb.extent.z);
        }
    } catch (e) {}

    // 將數字推至怪物碰撞箱邊緣外 0.25 格，並限制在「距離 - 0.3 格」以保留安全距離防止數字穿過玩家相機
    const maxOffset = entityRadius + 0.25;
    const offsetDistance = Math.max(0.0, Math.min(maxOffset, distance - 0.3));

    const baseSpawnLoc = {
        x: hitLocation.x - (viewDir.x * offsetDistance),
        y: hitLocation.y + 0.05, // 僅固定微調 0.05 格防與地面重疊，Y 軸不朝相機方向拉近，避免低頭打腳時數字被拉高
        z: hitLocation.z - (viewDir.z * offsetDistance)
    };

    // 4. 計算與視線垂直的水平「右向量」（確保不論玩家從哪一個視角看，數字排列方向永遠垂直於視線）
    // 2D 投影垂直向量公式：(x, z) 垂直的右向量為 (-z, x)
    const horizontalLen = Math.sqrt(viewDir.x * viewDir.x + viewDir.z * viewDir.z);
    const rightX = horizontalLen > 0.01 ? -viewDir.z / horizontalLen : 1;
    const rightZ = horizontalLen > 0.01 ? viewDir.x / horizontalLen : 0;

    // 5. 傷害數值取整並轉換為字串以拆分位數
    const damageVal = Math.round(damageAmount);
    const damageStr = damageVal.toString();
    const len = damageStr.length;

    // 依據是否暴擊，動態決定粒子ID與字體間距
    // 暴擊判定：1. 玩家跳斬/下落攻擊 (damager.isFalling) 2. 單次傷害大於等於 10 點
    const isFallingCrit = Boolean(damager.isFalling && !damager.isInWater && !damager.isClimbing);
    const isHighDamageCrit = damageAmount >= 10;
    const isCrit = isFallingCrit || isHighDamageCrit;

    const realParticleDistance = Math.max(0.4, distance - offsetDistance);
    const scaleFactor = Math.min(25.0, realParticleDistance);
    let particleId = isCrit ? "mymod:damage_crit" : "mymod:damage_normal";
    let spacing = (isCrit ? 0.125 : 0.075) * scaleFactor; // 暴擊或普通傷害間距比例

    const startOffset = -((len - 1) / 2) * spacing;

    // 6. 遍歷字元並發射對應的粒子
    for (let i = 0; i < len; i++) {
        const char = damageStr[i];
        const digit = parseInt(char, 10);
        if (isNaN(digit)) continue; // 安全檢測

        // 將數字展開位移投影至水平右向量
        const digitOffset = startOffset + (i * spacing);
        const particleLocation = {
            x: baseSpawnLoc.x + rightX * digitOffset,
            y: baseSpawnLoc.y,
            z: baseSpawnLoc.z + rightZ * digitOffset
        };

        // 傳送 MoLang 變數（指定渲染的幀 index）
        const variableMap = new MolangVariableMap();
        variableMap.setFloat("variable.frame_index", digit);

        try {
            hurtEntity.dimension.spawnParticle(particleId, particleLocation, variableMap);
        } catch (error) {
            console.error(`無法發射傷害跳字粒子 (位數 ${i}): ${error}`);
        }
    }
});
