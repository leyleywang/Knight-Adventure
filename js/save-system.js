class SaveSystem {
    constructor(game) {
        this.game = game;
        this.saveKey = GameConfig.SAVE_KEY;
    }
    
    saveGame() {
        try {
            const saveData = this.createSaveData();
            const jsonString = JSON.stringify(saveData);
            localStorage.setItem(this.saveKey, jsonString);
            
            Utils.showMessage('💾 游戏已保存！', 2000);
            
            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            Utils.showMessage('❌ 保存游戏失败！', 2000);
            return false;
        }
    }
    
    createSaveData() {
        const playerState = this.game.player.getState();
        const mapState = this.game.mapManager.getState();
        const monsterState = this.game.monsterManager.getState();
        const questState = this.game.questSystem.getState();
        const uiState = this.game.ui.getState();
        
        const saveData = {
            version: 1,
            timestamp: Date.now(),
            player: playerState,
            maps: mapState,
            monsters: monsterState,
            quests: questState,
            ui: uiState
        };
        
        return saveData;
    }
    
    loadGame() {
        try {
            const saveData = this.getSaveData();
            
            if (!saveData) {
                Utils.showMessage('📭 没有找到存档数据！', 2000);
                return false;
            }
            
            this.applySaveData(saveData);
            
            Utils.showMessage('📖 游戏已加载！', 2000);
            
            return true;
        } catch (error) {
            console.error('加载游戏失败:', error);
            Utils.showMessage('❌ 加载游戏失败！', 2000);
            return false;
        }
    }
    
    getSaveData() {
        try {
            const jsonString = localStorage.getItem(this.saveKey);
            
            if (!jsonString) {
                return null;
            }
            
            const saveData = JSON.parse(jsonString);
            
            return saveData;
        } catch (error) {
            console.error('读取存档数据失败:', error);
            return null;
        }
    }
    
    applySaveData(saveData) {
        if (saveData.player) {
            this.game.player.loadState(saveData.player);
        }
        
        if (saveData.maps) {
            this.game.mapManager.loadState(saveData.maps);
        }
        
        if (saveData.monsters) {
            this.game.monsterManager.loadState(saveData.monsters);
        }
        
        if (saveData.quests) {
            this.game.questSystem.loadState(saveData.quests);
        }
        
        if (saveData.ui) {
            this.game.ui.loadState(saveData.ui);
        }
        
        const currentMap = this.game.mapManager.getCurrentMap();
        if (currentMap) {
            document.getElementById('currentMapName').textContent = currentMap.name;
        }
        
        this.game.ui.updateStatusBar();
    }
    
    hasSaveData() {
        try {
            const jsonString = localStorage.getItem(this.saveKey);
            return jsonString !== null && jsonString !== undefined;
        } catch (error) {
            console.error('检查存档数据失败:', error);
            return false;
        }
    }
    
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            Utils.showMessage('🗑️ 存档已删除！', 2000);
            return true;
        } catch (error) {
            console.error('删除存档失败:', error);
            Utils.showMessage('❌ 删除存档失败！', 2000);
            return false;
        }
    }
    
    getSaveInfo() {
        try {
            const saveData = this.getSaveData();
            
            if (!saveData) {
                return null;
            }
            
            const date = new Date(saveData.timestamp);
            const dateStr = date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                date: dateStr,
                playerLevel: saveData.player?.level || 1,
                playerGold: saveData.player?.gold || 0,
                currentMap: saveData.maps?.currentMapId || 'castle'
            };
        } catch (error) {
            console.error('获取存档信息失败:', error);
            return null;
        }
    }
    
    autoSave() {
        const autoSaveInterval = 60000;
        
        setInterval(() => {
            if (this.game.isRunning && !this.game.combatSystem.isInBattle) {
                this.saveGame();
            }
        }, autoSaveInterval);
    }
}
