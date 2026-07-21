import os
import json

RP_DIR = r"c:\Users\a0900\.gemini\antigravity-ide\scratch\my_minecraft_addon\stylized_damage_RP"
PARTICLE_DIR = os.path.join(RP_DIR, "particles")
os.makedirs(PARTICLE_DIR, exist_ok=True)

markers = [str(i) for i in range(1, 10)] + ["spawn"]

for m in markers:
    particle_id = f"ml_mod:marker_particle_{m}"
    texture_path = f"textures/blocks/marker_{m}"
    
    particle_json = {
        "format_version": "1.10.0",
        "particle_effect": {
            "description": {
                "identifier": particle_id,
                "basic_render_parameters": {
                    "material": "particles_blend",
                    "texture": texture_path
                }
            },
            "components": {
                "minecraft:emitter_lifetime_once": {
                    "active_time": 0.5
                },
                "minecraft:emitter_rate_instant": {
                    "num_particles": 1
                },
                "minecraft:particle_lifetime_expression": {
                    "max_lifetime": 0.5
                },
                "minecraft:particle_appearance_billboard": {
                    "size": [0.45, 0.45],
                    "facing_camera_mode": "rotate_xyz",
                    "uv": {
                        "texture_width": 16,
                        "texture_height": 16,
                        "uv": [0, 0],
                        "uv_size": [16, 16]
                    }
                }
            }
        }
    }
    
    file_path = os.path.join(PARTICLE_DIR, f"marker_particle_{m}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(particle_json, f, indent=4, ensure_ascii=False)
    print(f"Updated Seamless 0.5s Particle: {file_path}")

print("ALL PARTICLES UPDATED FOR SEAMLESS 0.5s DISPLAY!")
