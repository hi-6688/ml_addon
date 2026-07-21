import os
import json

def generate_blocks_and_rp():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bp_blocks_dir = os.path.join(base_dir, "addons", "ml_dungeon_BP", "blocks")
    rp_textures_dir = os.path.join(base_dir, "addons", "ml_dungeon_RP", "textures", "blocks")
    rp_dir = os.path.join(base_dir, "addons", "ml_dungeon_RP")

    os.makedirs(bp_blocks_dir, exist_ok=True)
    os.makedirs(rp_textures_dir, exist_ok=True)

    markers = [f"spawner_marker_{i}" for i in range(1, 10)] + ["spawner_marker_spawn"]

    for marker in markers:
        bp_block_json = {
            "format_version": "1.20.80",
            "minecraft:block": {
                "description": {
                    "identifier": f"ml_mod:{marker}"
                },
                "components": {
                    "minecraft:geometry": "geometry.invisible",
                    "minecraft:material_instances": {
                        "*": {
                            "texture": "marker_invisible",
                            "render_layer": "alpha_test"
                        }
                    },
                    "minecraft:collision_box": false,
                    "minecraft:selection_box": {
                        "origin": [-8, 0, -8],
                        "size": [16, 16, 16]
                    },
                    "minecraft:light_dampening": 0,
                    "minecraft:destructible_by_mining": {
                        "seconds_to_destroy": 0.1
                    }
                }
            }
        }
        
        file_path = os.path.join(bp_blocks_dir, f"{marker}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(bp_block_json, f, indent=2, ensure_ascii=False)
        print(f"Generated BP Block: {file_path}")

    print("ALL ML_MOD MARKER BLOCKS RE-GENERATED SUCCESSFULLY IN ADDONS/!")

if __name__ == "__main__":
    generate_blocks_and_rp()
