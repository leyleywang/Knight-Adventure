class CombatSystem {
    constructor(game) {
        this.game = game;
        this.isInBattle = false;
        this.currentEnemy = null;
        
        this.battleLog = [];
        this.playerDefending = false;
        
        this.animationPhase = 0;
        this.animationTimer = 0;
    }
    
    startBattle(enemy) {
        if (this.isInBattle) return false;
        
        this.isInBattle = true;
        this.currentEnemy = {
            ...enemy,
            currentHp: enemy.currentHp,
            maxHp: enemy.maxHp
        };
        
        this.battleLog = [];
        this.playerDefending = false;
        
        this.addLog(`⚔️ 战斗开始！你遇到了 ${this.currentEnemy.name}！`);
        
        if (this.currentEnemy.isBoss) {
            this.addLog(`⚠️ 警告！这是一个BOSS怪物！`);
        }
        
        this.showBattleUI();
        
        return true;
    }
    
    endBattle(victory) {
        this.isInBattle = false;
        
        if (victory) {
            const rewards = this.currentEnemy.getRewards ? 
                this.currentEnemy.getRewards() : 
                { exp: this.currentEnemy.exp, gold: this.currentEnemy.gold, isBoss: this.currentEnemy.isBoss };
            
            const player = this.game.player;
            const leveledUp = player.gainExp(rewards.exp);
            player.addGold(rewards.gold);
            
            this.addLog(`🎉 胜利！你击败了 ${this.currentEnemy.name}！`);
            this.addLog(`💰 获得 ${rewards.gold} 金币，⭐ 获得 ${rewards.exp} 经验值`);
            
            this.updateQuestProgress(this.currentEnemy);
            
            if (rewards.isBoss) {
                this.handleBossDefeat();
            }
            
            if (leveledUp) {
                setTimeout(() => {
                    this.showLevelUpUI();
                }, 1000);
            }
            
            if (this.currentEnemy.getState) {
                this.game.monsterManager.monsters = this.game.monsterManager.monsters.filter(
                    m => m.id !== this.currentEnemy.id || !m.isDead
                );
            }
        } else {
            this.addLog(`💀 你被击败了...`);
        }
        
        setTimeout(() => {
            this.hideBattleUI();
            this.currentEnemy = null;
            this.battleLog = [];
        }, 2000);
    }
    
    updateQuestProgress(enemy) {
        const questManager = this.game.questManager;
        const currentMapId = this.game.mapManager.currentMapId;
        
        const activeQuests = questManager.getActiveQuestsForMap(currentMapId);
        
        for (const quest of activeQuests) {
            if (quest.type === 'kill' && quest.target === enemy.id) {
                questManager.updateQuestProgress(quest.id, 1);
            } else if (quest.type === 'boss' && quest.target === enemy.id && enemy.isBoss) {
                questManager.updateQuestProgress(quest.id, 1);
            }
        }
    }
    
    handleBossDefeat() {
        const currentMapId = this.game.mapManager.currentMapId;
        const mapManager = this.game.mapManager;
        
        mapManager.setBossDefeated(currentMapId);
        
        if (currentMapId === 'castle' && !mapManager.isMapUnlocked('forest')) {
            mapManager.unlockMap('forest');
            this.addLog(`🗝️ 你解锁了新地图：神秘森林！`);
            Utils.showMessage('🗝️ 解锁了新地图：神秘森林！', 3000);
            
            this.game.questManager.activateMapQuests('forest');
        } else if (currentMapId === 'forest' && !mapManager.isMapUnlocked('dungeon')) {
            mapManager.unlockMap('dungeon');
            this.addLog(`🗝️ 你解锁了新地图：黑暗地牢！`);
            Utils.showMessage('🗝️ 解锁了新地图：黑暗地牢！', 3000);
            
            this.game.questManager.activateMapQuests('dungeon');
        }
    }
    
    playerAttack() {
        if (!this.isInBattle || !this.currentEnemy) return;
        
        const player = this.game.player;
        const baseDamage = player.totalAtk;
        const variance = Utils.random(-3, 3);
        const isCritical = Math.random() < 0.1;
        
        let damage = Math.max(1, baseDamage + variance - this.currentEnemy.def);
        
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
            this.addLog(`💥 暴击！你对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害！`, 'critical');
        } else {
            this.addLog(`⚔️ 你对 ${this.currentEnemy.name} 造成了 ${damage} 点伤害`, 'damage');
        }
        
        const actualDamage = this.currentEnemy.currentHp - Math.max(0, this.currentEnemy.currentHp - damage);
        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - damage);
        
        this.updateBattleUI();
        
        if (this.currentEnemy.currentHp <= 0) {
            if (this.game.monsterManager) {
                const originalEnemy = this.game.monsterManager.getMonsterAt(
                    this.currentEnemy.x, 
                    this.currentEnemy.y, 
                    this.game.mapManager.currentMapId
                );
                if (originalEnemy) {
                    originalEnemy.die();
                }
            }
            
            this.endBattle(true);
            return;
        }
        
        setTimeout(() => {
            this.enemyTurn();
        }, 500);
    }
    
    playerDefend() {
        if (!this.isInBattle || !this.currentEnemy) return;
        
        this.playerDefending = true;
        this.addLog(`🛡️ 你举起盾牌进行防御！下次受到的伤害减半`);
        
        setTimeout(() => {
            this.enemyTurn();
        }, 300);
    }
    
    usePotion() {
        if (!this.isInBattle) return;
        
        const player = this.game.player;
        const potions = player.inventory.potions;
        
        const healingPotions = potions.filter(p => {
            const potionData = GameConfig.POTIONS.find(po => po.id === p.id);
            return potionData && potionData.effect === 'heal';
        });
        
        if (healingPotions.length === 0) {
            this.addLog(`❌ 你没有可用的生命药水！`);
            return;
        }
        
        const potionToUse = healingPotions[0];
        const result = player.usePotion(potionToUse.id);
        
        if (result) {
            this.addLog(`🧪 你使用了 ${result.name}，恢复了 ${result.amount} 点生命值！`, 'heal');
            this.updateBattleUI();
        }
        
        setTimeout(() => {
            this.enemyTurn();
        }, 300);
    }
    
    tryFlee() {
        if (!this.isInBattle || !this.currentEnemy) return;
        
        if (this.currentEnemy.isBoss) {
            this.addLog(`❌ 无法从BOSS战斗中逃跑！`);
            return;
        }
        
        const fleeChance = 0.6;
        
        if (Math.random() < fleeChance) {
            this.addLog(`🏃 你成功逃跑了！`);
            setTimeout(() => {
                this.hideBattleUI();
                this.isInBattle = false;
                this.currentEnemy = null;
            }, 500);
        } else {
            this.addLog(`❌ 逃跑失败！`);
            setTimeout(() => {
                this.enemyTurn();
            }, 300);
        }
    }
    
    enemyTurn() {
        if (!this.isInBattle || !this.currentEnemy) return;
        
        const player = this.game.player;
        const enemy = this.currentEnemy;
        
        const baseDamage = enemy.atk;
        const variance = Utils.random(-2, 2);
        
        let damage = Math.max(1, baseDamage + variance);
        
        if (this.playerDefending) {
            damage = Math.floor(damage * 0.5);
            this.playerDefending = false;
        }
        
        const actualDamage = player.takeDamage(damage);
        
        this.addLog(`👊 ${enemy.name} 对你造成了 ${actualDamage} 点伤害`, 'damage');
        
        this.updateBattleUI();
        
        if (player.currentHp <= 0) {
            this.endBattle(false);
            this.showGameOverUI();
        }
    }
    
    calculatePlayerDamage() {
        const player = this.game.player;
        const baseDamage = player.totalAtk;
        const variance = Utils.random(-3, 3);
        const isCritical = Math.random() < 0.1;
        
        let damage = Math.max(1, baseDamage + variance);
        
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
        }
        
        return { damage, isCritical };
    }
    
    calculateEnemyDamage() {
        const enemy = this.currentEnemy;
        if (!enemy) return 0;
        
        const baseDamage = enemy.atk;
        const variance = Utils.random(-2, 2);
        
        return Math.max(1, baseDamage + variance);
    }
    
    addLog(message, type = 'normal') {
        this.battleLog.push({ message, type, timestamp: Date.now() });
        
        const battleLogEl = document.getElementById('battleLog');
        if (battleLogEl) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type}`;
            logEntry.textContent = message;
            battleLogEl.appendChild(logEntry);
            battleLogEl.scrollTop = battleLogEl.scrollHeight;
        }
    }
    
    showBattleUI() {
        const battleModal = document.getElementById('battleModal');
        if (battleModal) {
            battleModal.classList.remove('hidden');
        }
        
        const battleLogEl = document.getElementById('battleLog');
        if (battleLogEl) {
            battleLogEl.innerHTML = '';
        }
        
        this.updateBattleUI();
    }
    
    hideBattleUI() {
        const battleModal = document.getElementById('battleModal');
        if (battleModal) {
            battleModal.classList.add('hidden');
        }
        
        if (this.game.ui) {
            this.game.ui.updateStatusBar();
        }
    }
    
    updateBattleUI() {
        const player = this.game.player;
        const enemy = this.currentEnemy;
        
        if (!enemy) return;
        
        const playerHpBar = document.getElementById('battlePlayerHp');
        const playerHpText = document.getElementById('battlePlayerHpText');
        const enemyHpBar = document.getElementById('battleEnemyHp');
        const enemyHpText = document.getElementById('battleEnemyHpText');
        const enemySprite = document.getElementById('battleEnemySprite');
        const enemyName = document.getElementById('battleEnemyName');
        
        if (playerHpBar) {
            const playerHpPercent = (player.currentHp / player.maxHp) * 100;
            playerHpBar.style.width = `${Math.max(0, playerHpPercent)}%`;
        }
        
        if (playerHpText) {
            playerHpText.textContent = `${Math.max(0, Math.floor(player.currentHp))}/${player.maxHp}`;
        }
        
        if (enemyHpBar) {
            const enemyHpPercent = (enemy.currentHp / enemy.maxHp) * 100;
            enemyHpBar.style.width = `${Math.max(0, enemyHpPercent)}%`;
        }
        
        if (enemyHpText) {
            enemyHpText.textContent = `${Math.max(0, Math.floor(enemy.currentHp))}/${enemy.maxHp}`;
        }
        
        if (enemySprite) {
            enemySprite.textContent = enemy.icon;
        }
        
        if (enemyName) {
            enemyName.textContent = enemy.name;
        }
    }
    
    showLevelUpUI() {
        const player = this.game.player;
        const levelUpModal = document.getElementById('levelUpModal');
        
        if (levelUpModal) {
            document.getElementById('newLevel').textContent = player.level;
            document.getElementById('hpIncrease').textContent = GameConfig.PLAYER.HP_PER_LEVEL;
            document.getElementById('atkIncrease').textContent = GameConfig.PLAYER.ATK_PER_LEVEL;
            document.getElementById('defIncrease').textContent = GameConfig.PLAYER.DEF_PER_LEVEL;
            
            levelUpModal.classList.remove('hidden');
        }
    }
    
    hideLevelUpUI() {
        const levelUpModal = document.getElementById('levelUpModal');
        if (levelUpModal) {
            levelUpModal.classList.add('hidden');
        }
    }
    
    showGameOverUI() {
        const player = this.game.player;
        const gameOverModal = document.getElementById('gameOverModal');
        
        if (gameOverModal) {
            document.getElementById('finalLevel').textContent = player.level;
            document.getElementById('finalGold').textContent = player.gold;
            
            gameOverModal.classList.remove('hidden');
        }
    }
    
    getState() {
        return {
            isInBattle: this.isInBattle,
            currentEnemy: this.currentEnemy ? {
                id: this.currentEnemy.id,
                name: this.currentEnemy.name,
                icon: this.currentEnemy.icon,
                currentHp: this.currentEnemy.currentHp,
                maxHp: this.currentEnemy.maxHp,
                atk: this.currentEnemy.atk,
                def: this.currentEnemy.def,
                exp: this.currentEnemy.exp,
                gold: this.currentEnemy.gold,
                isBoss: this.currentEnemy.isBoss
            } : null,
            battleLog: this.battleLog
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.isInBattle = state.isInBattle || false;
        this.battleLog = state.battleLog || [];
        
        if (state.currentEnemy && this.isInBattle) {
            this.currentEnemy = state.currentEnemy;
        }
    }
}
