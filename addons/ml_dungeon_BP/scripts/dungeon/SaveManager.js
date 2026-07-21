import { world } from "@minecraft/server";

const SAVE_KEY_STAGE = "ml_mod:current_stage";
const SAVE_KEY_SLOT = "ml_mod:active_slot";

export class SaveManager {
    /**
     * 獲取當前解鎖的關卡號碼 (預設為 1)
     */
    static getCurrentStage(player) {
        try {
            const savedStage = world.getDynamicProperty(SAVE_KEY_STAGE);
            if (typeof savedStage === "number" && savedStage >= 1) {
                return savedStage;
            }
        } catch (e) {
            console.error(`[SaveManager] 讀取存檔失敗: ${e}`);
        }
        return 1;
    }

    /**
     * 更新並保存關卡進度
     */
    static saveStageProgress(stageNumber) {
        try {
            world.setDynamicProperty(SAVE_KEY_STAGE, stageNumber);
            console.warn(`[SaveManager] 成功寫入存檔！當前關卡已更新為: Stage ${stageNumber}`);
            return true;
        } catch (e) {
            console.error(`[SaveManager] 寫入存檔失敗: ${e}`);
            return false;
        }
    }

    /**
     * 重置存檔為第一關
     */
    static resetSave() {
        try {
            world.setDynamicProperty(SAVE_KEY_STAGE, 1);
            console.warn(`[SaveManager] 存檔已重置為 Stage 1！`);
            return true;
        } catch (e) {
            console.error(`[SaveManager] 重置存檔失敗: ${e}`);
            return false;
        }
    }
}
