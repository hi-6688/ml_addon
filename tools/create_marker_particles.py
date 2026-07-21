import os
import json

def generate_marker_particles():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    particles_dir = os.path.join(base_dir, "addons", "ml_dungeon_RP", "particles")
    os.makedirs(particles_dir, exist_ok=True)

    marker_configs = [
        ("marker_particle_1", [0.0, 0.0]),
        ("marker_particle_2", [0.2, 0.0]),
        ("marker_particle_3", [0.4, 0.0]),
        ("marker_particle_4", [0.6, 0.0]),
        ("marker_particle_5", [0.8, 0.0]),
        ("marker_particle_6", [0.0, 0.5]),
        ("marker_particle_7", [0.2, 0.5]),
        ("marker_particle_8", [0.4, 0.5]),
        ("marker_particle_9", [0.6, 0.5]),
        ("marker_particle_spawn", [0.8, 0.5]),
    ]

    for p_name, uv_origin in marker_configs:
        particle_json = {
            "format_version": "1.10.0",
            "particle_effect": {
                "description": {
                    "identifier": f"ml_mod:{p_name}",
                    "basic_render_parameters": {
                        "material": "particles_blend",
                        "texture": "textures/particle/numbers"
                    }
                },
                "components": {
                    "minecraft:emitter_rate_instant": {
                        "num_particles": 1
                    },
                    "minecraft:emitter_lifetime_once": {
                        "active_time": 0.5
                    },
                    "minecraft:particle_lifetime_expression": {
                        "max_lifetime": 0.5
                    },
                    "minecraft:particle_appearance_billboard": {
                        "size": [0.45, 0.45],
                        "facing_camera_mode": "rotate_xyz",
                        "uv": {
                            "texture_width": 256,
                            "texture_height": 256,
                            "uv": [uv_origin[0] * 256, uv_origin[1] * 256],
                            "uv_size": [51.2, 128]
                        }
                    }
                }
            }
        }

        file_path = os.path.join(particles_dir, f"{p_name}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(particle_json, f, indent=2)
        print(f"Updated Particle: {file_path}")

    print("ALL PARTICLES UPDATED IN ADDONS/!")

if __name__ == "__main__":
    generate_marker_particles()
