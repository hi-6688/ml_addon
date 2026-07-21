import os
import json

def generate_marker_items():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bp_items_dir = os.path.join(base_dir, "addons", "ml_dungeon_BP", "items")
    os.makedirs(bp_items_dir, exist_ok=True)

    items = [
        ("spawner_marker_1", "ml_mod_marker_1"),
        ("spawner_marker_2", "ml_mod_marker_2"),
        ("spawner_marker_3", "ml_mod_marker_3"),
        ("spawner_marker_4", "ml_mod_marker_4"),
        ("spawner_marker_5", "ml_mod_marker_5"),
        ("spawner_marker_6", "ml_mod_marker_6"),
        ("spawner_marker_7", "ml_mod_marker_7"),
        ("spawner_marker_8", "ml_mod_marker_8"),
        ("spawner_marker_9", "ml_mod_marker_9"),
        ("spawner_marker_spawn", "ml_mod_marker_spawn")
    ]

    for item_id, icon_id in items:
        item_json = {
            "format_version": "1.20.80",
            "minecraft:item": {
                "description": {
                    "identifier": f"ml_mod:{item_id}",
                    "menu_category": {
                        "category": "construction"
                    }
                },
                "components": {
                    "minecraft:icon": icon_id,
                    "minecraft:block_placer": {
                        "block": f"ml_mod:{item_id}"
                    }
                }
            }
        }
        
        file_path = os.path.join(bp_items_dir, f"{item_id}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(item_json, f, indent=2, ensure_ascii=False)
        print(f"Generated Marker Item: {file_path}")

    print("ALL 10 MARKER ITEMS RE-GENERATED IN ADDONS/!")

if __name__ == "__main__":
    generate_marker_items()
