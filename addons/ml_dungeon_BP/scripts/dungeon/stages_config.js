// ml_mod 地牢關卡與生怪點組態檔 (Data-Driven Stage Configurations)

export const STAGE_CONFIGS = {
    1: {
        name: "第一關：試煉之地",
        structureName: "test1",
        spawnLocationOffset: { x: 4, y: 1, z: 4 },
        waves: [
            // 第一關第 1 波：在 1 號標記點生成自訂遠程敵人「小白」
            { 
                wave: 1, 
                markerId: "1", 
                mobType: "ml_mod:noob", 
                count: 1, 
                nameTag: "§b[PVP大佬]\n§f甚麼都不知道的小白" 
            }
        ]
    }
};
