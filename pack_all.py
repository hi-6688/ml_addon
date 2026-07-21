import os
import zipfile

def zip_folder_to_mcpack(folder_path, output_zip):
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                abs_file = os.path.join(root, file)
                rel_file = os.path.relpath(abs_file, folder_path)
                zipf.write(abs_file, rel_file)

def create_mcaddon(mcpack_files, output_mcaddon):
    with zipfile.ZipFile(output_mcaddon, 'w', zipfile.ZIP_DEFLATED) as zip_out:
        for pack_file in mcpack_files:
            if os.path.exists(pack_file):
                zip_out.write(pack_file, os.path.basename(pack_file))
                print(f"  + Added subpack: {os.path.basename(pack_file)}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    addons_dir = os.path.join(base_dir, "addons")

    # 1. 定義子模組
    dungeon_bp = os.path.join(addons_dir, "ml_dungeon_BP")
    dungeon_rp = os.path.join(addons_dir, "ml_dungeon_RP")
    damage_bp = os.path.join(addons_dir, "ml_damage_BP")
    damage_rp = os.path.join(addons_dir, "ml_damage_RP")

    # 2. 生成臨時 .mcpack 壓縮檔
    tmp_dungeon_bp = os.path.join(base_dir, "ml_dungeon_BP.mcpack")
    tmp_dungeon_rp = os.path.join(base_dir, "ml_dungeon_RP.mcpack")
    tmp_damage_bp = os.path.join(base_dir, "ml_damage_BP.mcpack")
    tmp_damage_rp = os.path.join(base_dir, "ml_damage_RP.mcpack")

    print("[Packager] Packing subpacks into .mcpack ...")
    zip_folder_to_mcpack(dungeon_bp, tmp_dungeon_bp)
    zip_folder_to_mcpack(dungeon_rp, tmp_dungeon_rp)
    zip_folder_to_mcpack(damage_bp, tmp_damage_bp)
    zip_folder_to_mcpack(damage_rp, tmp_damage_rp)

    # 3. 打包生成總整合包 ml_addon.mcaddon (Master Bundle)
    print("\n[Packager] Generating Master Bundle: ml_addon.mcaddon ...")
    master_addon = os.path.join(base_dir, "ml_addon.mcaddon")
    create_mcaddon([tmp_dungeon_bp, tmp_dungeon_rp, tmp_damage_bp, tmp_damage_rp], master_addon)

    # 4. 打包生成獨立子發布包
    print("\n[Packager] Generating Individual Subpack Addons ...")
    create_mcaddon([tmp_dungeon_bp, tmp_dungeon_rp], os.path.join(base_dir, "ml_dungeon.mcaddon"))
    create_mcaddon([tmp_damage_bp, tmp_damage_rp], os.path.join(base_dir, "ml_damage.mcaddon"))

    # 清理中間檔
    for tmp in [tmp_dungeon_bp, tmp_dungeon_rp, tmp_damage_bp, tmp_damage_rp]:
        if os.path.exists(tmp):
            os.remove(tmp)

    print("\n[Packager] Packaging Completed Successfully!")
    print(f"  - Master Bundle: {master_addon}")
    print(f"  - Dungeon Addon: {os.path.join(base_dir, 'ml_dungeon.mcaddon')}")
    print(f"  - Damage Addon:  {os.path.join(base_dir, 'ml_damage.mcaddon')}")

if __name__ == "__main__":
    main()
