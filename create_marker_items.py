import os
import json

BP_ITEMS_DIR = r"c:\Users\a0900\.gemini\antigravity-ide\scratch\my_minecraft_addon\stylized_damage_BP\items"
os.makedirs(BP_ITEMS_DIR, exist_ok=True)

markers = [str(i) for i in range(1, 10)] + ["spawn"]

for m in markers:
    item_id = f"ml_mod:spawner_marker_{m}"
    texture_name = f"ml_mod_marker_{m}"
    
    item_json = {
        "format_version": "1.20.80",
        "minecraft:item": {
            "description": {
                "identifier": item_id,
                "menu_category": {
                    "category": "construction",
                    "group": "itemGroup.name.construction"
                }
            },
            "components": {
                "minecraft:icon": texture_name,
                "minecraft:block_placer": {
                    "block": item_id
                }
            }
        }
    }
    
    file_path = os.path.join(BP_ITEMS_DIR, f"spawner_marker_{m}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(item_json, f, indent=4, ensure_ascii=False)
    print(f"Updated BP Item Schema icon: {file_path}")

print("ALL BP ITEMS SCHEMA FIXED!")
