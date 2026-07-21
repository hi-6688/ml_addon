// ml_mod 地牢關卡與生怪點組態檔 (Data-Driven Stage Configurations)

export const STAGE_CONFIGS = {
    1: {
        name: "第一關：試煉之地",
        structureName: "test1", // 使用用戶提供的最新 test1.mcstructure 結構檔
        spawnLocationOffset: { x: 4, y: 1, z: 4 },
        waves: [
            // 波次 1：在 1 號與 2 號標記點刷怪
            { wave: 1, markerId: "1", mobType: "minecraft:zombie", count: 2, nameTag: "§c地牢殭屍" },
            { wave: 1, markerId: "2", mobType: "minecraft:skeleton", count: 2, nameTag: "§e地牢骷髏" },
            // 波次 2：第 1 波清空後，在 9 號標記點刷出 BOSS
            { wave: 2, markerId: "9", mobType: "minecraft:wither_skeleton", count: 1, nameTag: "§4[BOSS] 地牢領主", isBoss: true }
        ]
    },
    2: {
        name: "第二關：深淵試煉",
        structureName: "test1",
        spawnLocationOffset: { x: 4, y: 1, z: 4 },
        waves: [
            { wave: 1, markerId: "1", mobType: "minecraft:husk", count: 3, nameTag: "§c沙漠流浪者" },
            { wave: 1, markerId: "3", mobType: "minecraft:spider", count: 2, nameTag: "§a毒蜘蛛" },
            { wave: 2, markerId: "9", mobType: "minecraft:warden", count: 1, nameTag: "§4[BOSS] 盲目守衛", isBoss: true }
        ]
    }
};
