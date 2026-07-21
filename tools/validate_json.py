import os
import json
import sys

def validate_json_files():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    addons_dir = os.path.join(base_dir, "addons")
    
    directories = [
        os.path.join(addons_dir, "ml_dungeon_BP"),
        os.path.join(addons_dir, "ml_dungeon_RP"),
        os.path.join(addons_dir, "ml_damage_BP"),
        os.path.join(addons_dir, "ml_damage_RP")
    ]
    has_errors = False
    
    print("[Validator] Beginning JSON validation for all subpacks in addons/...")
    
    for directory in directories:
        if not os.path.exists(directory):
            print(f"Warning: Directory {directory} not found. Skipping.")
            continue
            
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".json"):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            json.load(f)
                    except json.JSONDecodeError as e:
                        print(f"[ERROR] Invalid JSON: {file_path} - {e}")
                        has_errors = True
                    except Exception as e:
                        print(f"[ERROR] Exception reading {file_path}: {e}")
                        has_errors = True
                        
    if not has_errors:
        print("[Validator] SUCCESS: ALL JSON FILES IN ADDONS ARE VALID!")
        sys.exit(0)
    else:
        print("[Validator] FAILED: SOME JSON FILES HAVE ERRORS!")
        sys.exit(1)

if __name__ == "__main__":
    validate_json_files()
