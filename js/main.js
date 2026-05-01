class KnightAdventureGame {
    constructor() {
        this.player = null;
        this.mapManager = null;
        this.monsterManager = null;
        this.shopSystem = null;
        this.questSystem = null;
        this.combatSystem = null;
        this.ui = null;
        this.saveSystem = null;
        this.inputHandler = null;
        this.gameEngine = null;
        
        this.isRunning = false;
        this.isInitialized = false;
        
        this.initialize();
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        this.player = new Player();
        this.mapManager = new MapManager();
        this.monsterManager = new MonsterManager();
        this.shopSystem = new ShopSystem(this);
        this.questSystem = new QuestSystem(this);
        this.combatSystem = new CombatSystem(this);
        this.ui = new UIManager(this);
        this.saveSystem = new SaveSystem(this);
        this.inputHandler = new InputHandler(this);
        this.gameEngine = new GameEngine(this);
        
        this.isInitialized = true;
        
        this.ui.initialize();
        
        this.ui.showMainMenu();
        
        console.log('⚔️ 骑士冒险记 - 游戏已初始化！');
    }
    
    startNewGame() {
        this.player.reset();
        
        this.mapManager = new MapManager();
        
        this.monsterManager.clearAll();
        
        this.combatSystem.isInBattle = false;
        this.combatSystem.currentEnemy = null;
        this.combatSystem.battleLog = [];
        this.combatSystem.hideBattleUI();
        
        this.questSystem.initializeQuests();
        
        const currentMapId = this.mapManager.currentMapId;
        
        const safeSpawnAreas = [
            { x: 50, y: 50, width: 100, height: 100 },
            { x: GameConfig.CANVAS_WIDTH - 150, y: 50, width: 100, height: 100 },
            { x: 50, y: GameConfig.CANVAS_HEIGHT - 150, width: 100, height: 100 },
            { x: GameConfig.CANVAS_WIDTH - 150, y: GameConfig.CANVAS_HEIGHT - 150, width: 100, height: 100 }
        ];
        
        for (let i = 0; i < 5; i++) {
            const spawnArea = Utils.pickRandom(safeSpawnAreas);
            const spawnX = Utils.random(spawnArea.x, spawnArea.x + spawnArea.width);
            const spawnY = Utils.random(spawnArea.y, spawnArea.y + spawnArea.height);
            this.monsterManager.spawnMonster(currentMapId, spawnX, spawnY);
        }
        
        const currentMap = this.mapManager.getCurrentMap();
        if (currentMap) {
            document.getElementById('currentMapName').textContent = currentMap.name;
        }
        
        this.ui.showGameScreen();
        
        this.gameEngine.start();
        this.isRunning = true;
        
        this.saveSystem.autoSave();
        
        Utils.showMessage('🎮 开始新的冒险！', 2000);
    }
    
    loadGame() {
        if (!this.saveSystem.hasSaveData()) {
            Utils.showMessage('📭 没有找到存档数据！', 2000);
            return false;
        }
        
        const success = this.saveSystem.loadGame();
        
        if (success) {
            const currentMapId = this.mapManager.currentMapId;
            const monstersInMap = this.monsterManager.getAliveMonstersByMap(currentMapId);
            
            if (monstersInMap.length === 0) {
                for (let i = 0; i < 3; i++) {
                    this.monsterManager.spawnMonster(currentMapId);
                }
            }
            
            this.ui.showGameScreen();
            
            this.gameEngine.start();
            this.isRunning = true;
            
            this.saveSystem.autoSave();
            
            return true;
        }
        
        return false;
    }
    
    saveGame() {
        return this.saveSystem.saveGame();
    }
    
    pauseGame() {
        if (this.gameEngine.isRunning) {
            this.gameEngine.pause();
            this.isRunning = false;
        }
    }
    
    resumeGame() {
        if (!this.gameEngine.isRunning && this.isInitialized) {
            this.gameEngine.resume();
            this.isRunning = true;
        }
    }
    
    quitGame() {
        this.pauseGame();
        this.ui.showMainMenu();
    }
    
    getState() {
        return {
            version: 1,
            player: this.player ? this.player.getState() : null,
            maps: this.mapManager ? this.mapManager.getState() : null,
            monsters: this.monsterManager ? this.monsterManager.getState() : null,
            quests: this.questSystem ? this.questSystem.getState() : null,
            combat: this.combatSystem ? this.combatSystem.getState() : null,
            ui: this.ui ? this.ui.getState() : null,
            timestamp: Date.now()
        };
    }
    
    loadState(state) {
        if (!state) return false;
        
        try {
            if (state.player && this.player) {
                this.player.loadState(state.player);
            }
            
            if (state.maps && this.mapManager) {
                this.mapManager.loadState(state.maps);
            }
            
            if (state.monsters && this.monsterManager) {
                this.monsterManager.loadState(state.monsters);
            }
            
            if (state.quests && this.questSystem) {
                this.questSystem.loadState(state.quests);
            }
            
            if (state.combat && this.combatSystem) {
                this.combatSystem.loadState(state.combat);
            }
            
            if (state.ui && this.ui) {
                this.ui.loadState(state.ui);
            }
            
            return true;
        } catch (error) {
            console.error('加载游戏状态失败:', error);
            return false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new KnightAdventureGame();
    
    console.log('🎮 骑士冒险记 - 游戏已加载！');
    console.log('📖 使用说明：');
    console.log('   - 方向键 / WASD：移动');
    console.log('   - 空格键：攻击');
    console.log('   - Enter 键：互动');
    console.log('   - S 键：保存游戏');
});
