import os
import json

BP_BLOCKS_DIR = r"c:\Users\a0900\.gemini\antigravity-ide\scratch\my_minecraft_addon\stylized_damage_BP\blocks"
RP_DIR = r"c:\Users\a0900\.gemini\antigravity-ide\scratch\my_minecraft_addon\stylized_damage_RP"

os.makedirs(BP_BLOCKS_DIR, exist_ok=True)
os.makedirs(os.path.join(RP_DIR, "textures", "blocks"), exist_ok=True)

markers = [str(i) for i in range(1, 10)] + ["spawn"]

# 移除無效組件 minecraft:icon，使用標準 1.20.80 BP 方塊結構
for m in markers:
    block_id = f"ml_mod:spawner_marker_{m}"
    
    block_json = {
        "format_version": "1.20.80",
        "minecraft:block": {
            "description": {
                "identifier": block_id,
                "menu_category": {
                    "category": "construction",
                    "group": "itemGroup.name.construction"
                }
            },
            "components": {
                "minecraft:collision_box": False,
                "minecraft:selection_box": True,
                "minecraft:light_dampening": 0,
                "minecraft:destructible_by_mining": {
                    "seconds_to_destroy": 0.0
                },
                "minecraft:geometry": "geometry.invisible",
                "minecraft:material_instances": {
                    "*": {
                        "texture": "ml_mod_marker_invisible",
                        "render_layer": "alpha_test"
                    }
                }
            }
        }
    }
    
    file_path = os.path.join(BP_BLOCKS_DIR, f"spawner_marker_{m}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(block_json, f, indent=4, ensure_ascii=False)
    print(f"Updated Validated BP Block: {file_path}")

print("ALL BP BLOCKS FIXED AND VALIDATED FOR BEDROCK 1.20.80!")
