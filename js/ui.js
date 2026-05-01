class UIManager {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'menu';
    }
    
    initialize() {
        this.setupEventListeners();
        this.updateStatusBar();
    }
    
    setupEventListeners() {
        document.getElementById('newGameBtn')?.addEventListener('click', () => {
            this.game.startNewGame();
        });
        
        document.getElementById('continueGameBtn')?.addEventListener('click', () => {
            if (this.game.saveSystem.hasSaveData()) {
                this.game.loadGame();
            } else {
                Utils.showMessage('📭 没有找到存档数据！', 2000);
            }
        });
        
        document.getElementById('helpBtn')?.addEventListener('click', () => {
            this.showHelpScreen();
        });
        
        document.getElementById('backToMenuBtn')?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        document.getElementById('openShopBtn')?.addEventListener('click', () => {
            this.game.shopSystem.openShop();
        });
        
        document.getElementById('closeShopBtn')?.addEventListener('click', () => {
            this.game.shopSystem.closeShop();
        });
        
        document.getElementById('openQuestBtn')?.addEventListener('click', () => {
            this.game.questSystem.openQuestPanel();
        });
        
        document.getElementById('closeQuestBtn')?.addEventListener('click', () => {
            this.game.questSystem.closeQuestPanel();
        });
        
        document.getElementById('saveGameBtn')?.addEventListener('click', () => {
            this.game.saveGame();
        });
        
        document.getElementById('backToMenuFromGame')?.addEventListener('click', () => {
            this.game.pauseGame();
            this.showMainMenu();
        });
        
        document.getElementById('closeLevelUpBtn')?.addEventListener('click', () => {
            this.game.combatSystem.hideLevelUpUI();
        });
        
        document.getElementById('battleAttackBtn')?.addEventListener('click', () => {
            this.game.combatSystem.playerAttack();
        });
        
        document.getElementById('battleDefendBtn')?.addEventListener('click', () => {
            this.game.combatSystem.playerDefend();
        });
        
        document.getElementById('battlePotionBtn')?.addEventListener('click', () => {
            this.game.combatSystem.usePotion();
        });
        
        document.getElementById('battleFleeBtn')?.addEventListener('click', () => {
            this.game.combatSystem.tryFlee();
        });
        
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            this.game.startNewGame();
        });
        
        document.getElementById('backToMenuFromGameOver')?.addEventListener('click', () => {
            const gameOverModal = document.getElementById('gameOverModal');
            if (gameOverModal) {
                gameOverModal.classList.add('hidden');
            }
            this.showMainMenu();
        });
        
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const attackBtn = document.getElementById('attackBtn');
        const interactBtn = document.getElementById('interactBtn');
        
        if (upBtn) {
            upBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowUp'] = true;
            });
            upBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowUp'] = false;
            });
        }
        
        if (downBtn) {
            downBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowDown'] = true;
            });
            downBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowDown'] = false;
            });
        }
        
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowLeft'] = true;
            });
            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowLeft'] = false;
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowRight'] = true;
            });
            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.game.inputHandler.keys['ArrowRight'] = false;
            });
        }
        
        if (attackBtn) {
            attackBtn.addEventListener('click', () => {
                this.tryAttackNearestEnemy();
            });
        }
        
        if (interactBtn) {
            interactBtn.addEventListener('click', () => {
                this.tryInteract();
            });
        }
    }
    
    tryAttackNearestEnemy() {
        if (this.game.combatSystem.isInBattle) return;
        
        const player = this.game.player;
        const currentMapId = this.game.mapManager.currentMapId;
        const monsters = this.game.monsterManager.getAliveMonstersByMap(currentMapId);
        
        let nearestMonster = null;
        let nearestDistance = Infinity;
        
        for (const monster of monsters) {
            const distance = Utils.distance(
                player.getCenterX(), player.getCenterY(),
                monster.getCenterX(), monster.getCenterY()
            );
            
            if (distance < 60 && distance < nearestDistance) {
                nearestDistance = distance;
                nearestMonster = monster;
            }
        }
        
        if (nearestMonster) {
            this.game.combatSystem.startBattle(nearestMonster);
        } else {
            Utils.showMessage('⚔️ 附近没有敌人可以攻击！', 1500);
        }
    }
    
    tryInteract() {
        const player = this.game.player;
        const currentMap = this.game.mapManager.getCurrentMap();
        
        const npc = currentMap.getNPCAt(player.getCenterX(), player.getCenterY());
        
        if (npc) {
            this.interactWithNPC(npc);
            return;
        }
        
        const portal = currentMap.getPortalAt(player.getCenterX(), player.getCenterY());
        
        if (portal) {
            this.usePortal(portal);
            return;
        }
        
        Utils.showMessage('🔘 附近没有可以互动的对象', 1500);
    }
    
    interactWithNPC(npc) {
        const npcData = npc.npcData;
        const dialogModal = document.getElementById('dialogModal');
        const dialogAvatar = document.getElementById('dialogAvatar');
        const dialogName = document.getElementById('dialogName');
        const dialogText = document.getElementById('dialogText');
        const dialogOptions = document.getElementById('dialogOptions');
        
        if (!dialogModal) return;
        
        dialogAvatar.textContent = npc.icon;
        dialogName.textContent = npcData.name;
        dialogOptions.innerHTML = '';
        
        switch (npcData.type) {
            case 'shop':
                dialogText.textContent = '欢迎光临我的商店，勇敢的骑士！我这里有最好的武器和装备。';
                
                const shopOption = document.createElement('button');
                shopOption.className = 'dialog-option';
                shopOption.textContent = '🏪 打开商店';
                shopOption.addEventListener('click', () => {
                    this.closeDialog();
                    this.game.shopSystem.openShop();
                });
                dialogOptions.appendChild(shopOption);
                break;
                
            case 'quest':
                dialogText.textContent = '我有一些任务需要像你这样勇敢的骑士来完成。完成它们可以获得丰厚的奖励！';
                
                const questOption = document.createElement('button');
                questOption.className = 'dialog-option';
                questOption.textContent = '📜 查看任务列表';
                questOption.addEventListener('click', () => {
                    this.closeDialog();
                    this.game.questSystem.openQuestPanel();
                });
                dialogOptions.appendChild(questOption);
                break;
                
            case 'healer':
                const player = this.game.player;
                const healCost = 20;
                
                if (player.currentHp >= player.maxHp) {
                    dialogText.textContent = '你的生命值已经满了，不需要治疗！';
                } else if (player.gold < healCost) {
                    dialogText.textContent = `你没有足够的金币！治疗需要 ${healCost} 金币。`;
                } else {
                    dialogText.textContent = `我可以治疗你，但需要 ${healCost} 金币。你要治疗吗？`;
                    
                    const healOption = document.createElement('button');
                    healOption.className = 'dialog-option';
                    healOption.textContent = '❤️ 接受治疗';
                    healOption.addEventListener('click', () => {
                        if (player.spendGold(healCost)) {
                            const healed = player.heal(player.maxHp);
                            Utils.showMessage(`❤️ 恢复了 ${healed} 点生命值！`, 2000);
                            this.updateStatusBar();
                        }
                        this.closeDialog();
                    });
                    dialogOptions.appendChild(healOption);
                }
                break;
                
            default:
                dialogText.textContent = '你好，旅行者！祝你冒险顺利！';
        }
        
        const closeOption = document.createElement('button');
        closeOption.className = 'dialog-option';
        closeOption.textContent = '👋 离开';
        closeOption.addEventListener('click', () => {
            this.closeDialog();
        });
        dialogOptions.appendChild(closeOption);
        
        dialogModal.classList.remove('hidden');
    }
    
    closeDialog() {
        const dialogModal = document.getElementById('dialogModal');
        if (dialogModal) {
            dialogModal.classList.add('hidden');
        }
    }
    
    usePortal(portal) {
        const targetMap = portal.targetMap;
        const mapManager = this.game.mapManager;
        
        if (mapManager.isMapUnlocked(targetMap)) {
            const player = this.game.player;
            
            if (mapManager.switchMap(targetMap)) {
                player.x = GameConfig.CANVAS_WIDTH / 2 - player.width / 2;
                player.y = GameConfig.CANVAS_HEIGHT / 2 - player.height / 2;
                
                this.game.monsterManager.clearMap(targetMap);
                
                for (let i = 0; i < 3; i++) {
                    this.game.monsterManager.spawnMonster(targetMap);
                }
                
                const currentMap = mapManager.getCurrentMap();
                document.getElementById('currentMapName').textContent = currentMap.name;
                
                Utils.showMessage(`🗺️ 进入了 ${currentMap.name}`, 2000);
                
                this.updateStatusBar();
            }
        } else {
            Utils.showMessage('🔒 这个地图还没有解锁！', 2000);
        }
    }
    
    showMainMenu() {
        this.currentScreen = 'menu';
        
        document.getElementById('mainMenu')?.classList.remove('hidden');
        document.getElementById('helpScreen')?.classList.add('hidden');
        document.getElementById('gameScreen')?.classList.add('hidden');
    }
    
    showHelpScreen() {
        this.currentScreen = 'help';
        
        document.getElementById('mainMenu')?.classList.add('hidden');
        document.getElementById('helpScreen')?.classList.remove('hidden');
        document.getElementById('gameScreen')?.classList.add('hidden');
    }
    
    showGameScreen() {
        this.currentScreen = 'game';
        
        document.getElementById('mainMenu')?.classList.add('hidden');
        document.getElementById('helpScreen')?.classList.add('hidden');
        document.getElementById('gameScreen')?.classList.remove('hidden');
        
        this.updateStatusBar();
    }
    
    updateStatusBar() {
        const player = this.game.player;
        if (!player) return;
        
        const playerLevel = document.getElementById('playerLevel');
        const healthBar = document.getElementById('healthBar');
        const healthText = document.getElementById('healthText');
        const expBar = document.getElementById('expBar');
        const expText = document.getElementById('expText');
        const goldAmount = document.getElementById('goldAmount');
        const attackPower = document.getElementById('attackPower');
        const defensePower = document.getElementById('defensePower');
        
        if (playerLevel) {
            playerLevel.textContent = player.level;
        }
        
        if (healthBar) {
            const healthPercent = (player.currentHp / player.maxHp) * 100;
            healthBar.style.width = `${Math.max(0, healthPercent)}%`;
        }
        
        if (healthText) {
            healthText.textContent = `${Math.max(0, Math.floor(player.currentHp))}/${player.maxHp}`;
        }
        
        if (expBar) {
            const expPercent = (player.exp / player.expToLevel) * 100;
            expBar.style.width = `${expPercent}%`;
        }
        
        if (expText) {
            expText.textContent = `${player.exp}/${player.expToLevel}`;
        }
        
        if (goldAmount) {
            goldAmount.textContent = player.gold;
        }
        
        if (attackPower) {
            attackPower.textContent = player.totalAtk;
        }
        
        if (defensePower) {
            defensePower.textContent = player.totalDef;
        }
    }
    
    drawPlayer(ctx, player) {
        const x = player.x;
        const y = player.y;
        const size = player.width;
        
        if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText('🛡️', x + size / 2, y + size / 2);
        
        ctx.globalAlpha = 1;
        
        const barY = y - 10;
        const barWidth = size;
        const barHeight = 6;
        
        Utils.drawHealthBar(
            ctx,
            x,
            barY,
            barWidth,
            barHeight,
            player.currentHp,
            player.maxHp,
            false
        );
        
        const levelX = x + size / 2;
        const levelY = barY - 8;
        
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.fillText(`Lv.${player.level}`, levelX, levelY);
    }
    
    drawMonster(ctx, monster) {
        if (monster.isDead) {
            ctx.globalAlpha = Math.max(0, 1 - monster.deathTimer / 2);
        }
        
        const x = monster.x;
        const y = monster.y;
        const size = monster.width;
        
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText(monster.icon, x + size / 2, y + size / 2);
        
        ctx.globalAlpha = 1;
        
        const barY = y - 10;
        const barWidth = size;
        const barHeight = 6;
        
        Utils.drawHealthBar(
            ctx,
            x,
            barY,
            barWidth,
            barHeight,
            monster.currentHp,
            monster.maxHp,
            false
        );
        
        if (monster.isBoss) {
            const bossX = x + size / 2;
            const bossY = barY - 8;
            
            ctx.font = 'bold 10px Arial';
            ctx.fillStyle = '#ff4444';
            ctx.textAlign = 'center';
            ctx.fillText('BOSS', bossX, bossY);
        }
    }
    
    getState() {
        return {
            currentScreen: this.currentScreen
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.currentScreen = state.currentScreen || 'menu';
    }
}
