class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.keyPressCallbacks = [];
        
        this.initialize();
    }
    
    initialize() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }
    
    handleKeyDown(e) {
        const key = e.key;
        this.keys[key] = true;
        
        switch (key) {
            case ' ':
                e.preventDefault();
                this.onAttackKey();
                break;
                
            case 'Enter':
                e.preventDefault();
                this.onInteractKey();
                break;
                
            case 'i':
            case 'I':
                this.onInventoryKey();
                break;
                
            case 's':
            case 'S':
                this.onSaveKey();
                break;
                
            case 'Escape':
                this.onEscapeKey();
                break;
                
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'w':
            case 'W':
            case 'a':
            case 'A':
            case 's':
            case 'S':
            case 'd':
            case 'D':
                e.preventDefault();
                break;
        }
        
        this.triggerKeyPressCallbacks(key);
    }
    
    handleKeyUp(e) {
        const key = e.key;
        this.keys[key] = false;
    }
    
    isKeyPressed(key) {
        return this.keys[key] === true;
    }
    
    getMovementDirection() {
        let dx = 0;
        let dy = 0;
        
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            dy = -1;
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            dy = 1;
        }
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            dx = -1;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            dx = 1;
        }
        
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        return { dx, dy };
    }
    
    onAttackKey() {
        if (this.game.combatSystem.isInBattle) {
            return;
        }
        
        this.game.ui.tryAttackNearestEnemy();
    }
    
    onInteractKey() {
        if (this.game.combatSystem.isInBattle) {
            return;
        }
        
        this.game.ui.tryInteract();
    }
    
    onInventoryKey() {
        if (this.game.combatSystem.isInBattle) {
            return;
        }
        
        Utils.showMessage('🎒 背包功能开发中...', 2000);
    }
    
    onSaveKey() {
        if (this.game.combatSystem.isInBattle) {
            return;
        }
        
        this.game.saveGame();
    }
    
    onEscapeKey() {
        const shopModal = document.getElementById('shopModal');
        const questModal = document.getElementById('questModal');
        const dialogModal = document.getElementById('dialogModal');
        const inventoryModal = document.getElementById('inventoryModal');
        
        if (shopModal && !shopModal.classList.contains('hidden')) {
            this.game.shopSystem.closeShop();
            return;
        }
        
        if (questModal && !questModal.classList.contains('hidden')) {
            this.game.questSystem.closeQuestPanel();
            return;
        }
        
        if (dialogModal && !dialogModal.classList.contains('hidden')) {
            this.game.ui.closeDialog();
            return;
        }
        
        if (inventoryModal && !inventoryModal.classList.contains('hidden')) {
            inventoryModal.classList.add('hidden');
            return;
        }
        
        if (this.game.ui.currentScreen === 'game' && !this.game.combatSystem.isInBattle) {
            Utils.showMessage('📋 按菜单按钮返回主菜单', 2000);
        }
    }
    
    registerKeyPressCallback(key, callback) {
        this.keyPressCallbacks.push({ key, callback });
    }
    
    triggerKeyPressCallbacks(key) {
        for (const callbackData of this.keyPressCallbacks) {
            if (callbackData.key === key) {
                callbackData.callback();
            }
        }
    }
    
    getState() {
        return {
            keys: Utils.deepClone(this.keys)
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.keys = state.keys ? Utils.deepClone(state.keys) : {};
    }
}
