# 自定義方塊、物品與配方規範 (Blocks, Items & Recipes Guide)

> 本指南基於微軟 Learn 官方文件與 Mojang Component 規範編寫。

---

## 1. 自定義標記方塊 (Marker Block)
* 所有標記方塊使用 `ml_mod:` 命名空間（如 `ml_mod:spawner_marker_spawn`）。
* 使用 Permutations 來定義同一個方塊的多種變體狀態。

## 2. 自定義物品 (Custom Items)
* 物品 Component 使用 `minecraft:display_name` 與 `minecraft:icon`。
* 對應資源包 `textures/item_texture.json` 定義貼圖映射。

## 3. 戰利品表 (Loot Tables)
* 檔案放置於 `BP/loot_tables/`。
* 控制怪獸死亡掉落物品與機率分布。
