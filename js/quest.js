class QuestSystem {
    constructor(game) {
        this.game = game;
        this.quests = [];
        this.currentTab = 'active';
        this.isOpen = false;
        
        this.initializeQuests();
    }
    
    initializeQuests() {
        this.quests = Utils.deepClone(GameConfig.QUESTS);
    }
    
    getQuestById(questId) {
        return this.quests.find(q => q.id === questId);
    }
    
    getActiveQuests() {
        return this.quests.filter(q => q.active && !q.completed);
    }
    
    getCompletedQuests() {
        return this.quests.filter(q => q.completed);
    }
    
    getActiveQuestsForMap(mapId) {
        return this.quests.filter(q => q.active && !q.completed && q.map === mapId);
    }
    
    activateMapQuests(mapId) {
        for (const quest of this.quests) {
            if (quest.map === mapId && !quest.active) {
                quest.active = true;
                Utils.showMessage(`📜 新任务解锁：${quest.title}`, 3000);
            }
        }
    }
    
    updateQuestProgress(questId, amount = 1) {
        const quest = this.getQuestById(questId);
        if (!quest || quest.completed) return false;
        
        quest.currentCount = Math.min(quest.currentCount + amount, quest.targetCount);
        
        if (quest.currentCount >= quest.targetCount) {
            this.completeQuest(questId);
        }
        
        return true;
    }
    
    completeQuest(questId) {
        const quest = this.getQuestById(questId);
        if (!quest || quest.completed) return false;
        
        quest.completed = true;
        quest.active = false;
        
        const player = this.game.player;
        
        if (quest.rewards.gold) {
            player.addGold(quest.rewards.gold);
        }
        
        if (quest.rewards.exp) {
            player.gainExp(quest.rewards.exp);
        }
        
        if (quest.rewards.item) {
            this.giveQuestItem(quest.rewards.item);
        }
        
        Utils.showMessage(`🎉 任务完成：${quest.title}！`, 3000);
        
        return true;
    }
    
    giveQuestItem(itemId) {
        const player = this.game.player;
        
        const weapon = GameConfig.WEAPONS.find(w => w.id === itemId);
        const armor = GameConfig.ARMORS.find(a => a.id === itemId);
        const shield = GameConfig.SHIELDS.find(s => s.id === itemId);
        const potion = GameConfig.POTIONS.find(p => p.id === itemId);
        
        if (weapon && !player.inventory.weapons.includes(itemId)) {
            player.inventory.weapons.push(itemId);
            Utils.showMessage(`⚔️ 获得稀有武器：${weapon.name}！`, 3000);
            return;
        }
        
        if (armor && !player.inventory.armors.includes(itemId)) {
            player.inventory.armors.push(itemId);
            Utils.showMessage(`🛡️ 获得稀有盔甲：${armor.name}！`, 3000);
            return;
        }
        
        if (shield && !player.inventory.shields.includes(itemId)) {
            player.inventory.shields.push(itemId);
            Utils.showMessage(`🛡️ 获得稀有盾牌：${shield.name}！`, 3000);
            return;
        }
        
        if (potion) {
            const potionIndex = player.inventory.potions.findIndex(p => p.id === itemId);
            if (potionIndex >= 0) {
                player.inventory.potions[potionIndex].count++;
            } else {
                player.inventory.potions.push({ id: itemId, count: 1 });
            }
            Utils.showMessage(`🧪 获得：${potion.name}！`, 3000);
        }
    }
    
    openQuestPanel() {
        this.isOpen = true;
        this.currentTab = 'active';
        this.renderQuests();
        this.showQuestUI();
    }
    
    closeQuestPanel() {
        this.isOpen = false;
        this.hideQuestUI();
    }
    
    switchTab(tab) {
        if (['active', 'completed'].includes(tab)) {
            this.currentTab = tab;
            this.renderQuests();
        }
    }
    
    renderQuests() {
        const questListEl = document.getElementById('questList');
        if (!questListEl) return;
        
        questListEl.innerHTML = '';
        
        let questsToRender;
        if (this.currentTab === 'active') {
            questsToRender = this.getActiveQuests();
        } else {
            questsToRender = this.getCompletedQuests();
        }
        
        if (questsToRender.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.style.textAlign = 'center';
            emptyEl.style.color = '#d4a574';
            emptyEl.style.padding = '40px';
            emptyEl.textContent = this.currentTab === 'active' ? 
                '📜 暂无进行中的任务' : 
                '✅ 暂无已完成的任务';
            questListEl.appendChild(emptyEl);
            return;
        }
        
        for (const quest of questsToRender) {
            const questEl = document.createElement('div');
            questEl.className = `quest-item ${quest.completed ? 'completed' : ''}`;
            
            const progressPercent = (quest.currentCount / quest.targetCount) * 100;
            
            let rewardText = '';
            if (quest.rewards.gold) {
                rewardText += `💰 ${quest.rewards.gold} `;
            }
            if (quest.rewards.exp) {
                rewardText += `⭐ ${quest.rewards.exp} `;
            }
            if (quest.rewards.item) {
                rewardText += `🎁 稀有装备`;
            }
            
            questEl.innerHTML = `
                <div class="quest-header">
                    <div class="quest-title">${quest.title}</div>
                    <div class="quest-status ${quest.completed ? 'completed' : 'active'}">
                        ${quest.completed ? '已完成' : '进行中'}
                    </div>
                </div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${quest.currentCount}/${quest.targetCount}</div>
                </div>
                <div class="quest-rewards">
                    <span>奖励：${rewardText}</span>
                </div>
            `;
            
            questListEl.appendChild(questEl);
        }
        
        const tabs = document.querySelectorAll('.quest-tab');
        tabs.forEach(tab => {
            const tabName = tab.dataset.tab;
            tab.classList.toggle('active', tabName === this.currentTab);
            
            tab.onclick = () => {
                this.switchTab(tabName);
            };
        });
    }
    
    showQuestUI() {
        const questModal = document.getElementById('questModal');
        if (questModal) {
            questModal.classList.remove('hidden');
        }
    }
    
    hideQuestUI() {
        const questModal = document.getElementById('questModal');
        if (questModal) {
            questModal.classList.add('hidden');
        }
    }
    
    getState() {
        return {
            quests: Utils.deepClone(this.quests),
            isOpen: this.isOpen,
            currentTab: this.currentTab
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        if (state.quests) {
            this.quests = Utils.deepClone(state.quests);
        }
        
        this.isOpen = state.isOpen || false;
        this.currentTab = state.currentTab || 'active';
    }
}
