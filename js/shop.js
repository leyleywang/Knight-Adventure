class ShopSystem {
    constructor(game) {
        this.game = game;
        this.currentTab = 'weapons';
        this.isOpen = false;
    }
    
    openShop() {
        this.isOpen = true;
        this.currentTab = 'weapons';
        this.renderShop();
        this.showShopUI();
    }
    
    closeShop() {
        this.isOpen = false;
        this.hideShopUI();
    }
    
    switchTab(tab) {
        if (['weapons', 'armor', 'potions'].includes(tab)) {
            this.currentTab = tab;
            this.renderShop();
        }
    }
    
    getItemsForTab(tab) {
        switch (tab) {
            case 'weapons':
                return GameConfig.WEAPONS;
            case 'armor':
                return [...GameConfig.ARMORS, ...GameConfig.SHIELDS];
            case 'potions':
                return GameConfig.POTIONS;
            default:
                return [];
        }
    }
    
    canBuyItem(item) {
        const player = this.game.player;
        
        if (!player.spendGold(item.price)) {
            return false;
        }
        
        player.addGold(item.price);
        return true;
    }
    
    isItemOwned(item, itemType) {
        const player = this.game.player;
        
        if (itemType === 'weapons') {
            return player.inventory.weapons.includes(item.id);
        } else if (itemType === 'armor' && GameConfig.ARMORS.some(a => a.id === item.id)) {
            return player.inventory.armors.includes(item.id);
        } else if (itemType === 'armor' && GameConfig.SHIELDS.some(s => s.id === item.id)) {
            return player.inventory.shields.includes(item.id);
        }
        
        return false;
    }
    
    buyItem(item, itemType) {
        const player = this.game.player;
        
        if (!this.canBuyItem(item)) {
            Utils.showMessage('💰 金币不足！', 2000);
            return false;
        }
        
        if (itemType === 'potions') {
            const success = player.buyItem('potions', item.id, item.price);
            if (success) {
                Utils.showMessage(`🧪 购买了 ${item.name}！`, 2000);
                this.renderShop();
                this.game.ui.updateStatusBar();
            }
            return success;
        }
        
        if (this.isItemOwned(item, itemType)) {
            Utils.showMessage('❌ 你已经拥有这个物品了！', 2000);
            return false;
        }
        
        let category;
        if (itemType === 'weapons') {
            category = 'weapons';
        } else if (GameConfig.ARMORS.some(a => a.id === item.id)) {
            category = 'armors';
        } else if (GameConfig.SHIELDS.some(s => s.id === item.id)) {
            category = 'shields';
        }
        
        const success = player.buyItem(category, item.id, item.price);
        
        if (success) {
            Utils.showMessage(`🎉 购买了 ${item.name}！`, 2000);
            this.renderShop();
            this.game.ui.updateStatusBar();
        }
        
        return success;
    }
    
    getEquippedItem(category) {
        const player = this.game.player;
        return player.equipment[category];
    }
    
    renderShop() {
        const shopItemsEl = document.getElementById('shopItems');
        const shopGoldEl = document.getElementById('shopGold');
        
        if (!shopItemsEl || !shopGoldEl) return;
        
        const player = this.game.player;
        shopGoldEl.textContent = player.gold;
        
        const items = this.getItemsForTab(this.currentTab);
        shopItemsEl.innerHTML = '';
        
        for (const item of items) {
            const isOwned = this.isItemOwned(item, this.currentTab);
            const canAfford = player.gold >= item.price;
            
            const itemEl = document.createElement('div');
            itemEl.className = `shop-item ${isOwned ? 'owned' : ''}`;
            itemEl.style.position = 'relative';
            
            let statsText = '';
            if (item.atk) {
                statsText = `⚔️ 攻击力 +${item.atk}`;
            } else if (item.def) {
                statsText = `🛡️ 防御力 +${item.def}`;
            } else if (item.effect === 'heal') {
                statsText = `❤️ 恢复 ${item.value} 生命`;
            } else if (item.effect === 'buff_atk') {
                statsText = `⚔️ 攻击力 +${item.value} (${item.duration}秒)`;
            } else if (item.effect === 'buff_def') {
                statsText = `🛡️ 防御力 +${item.value} (${item.duration}秒)`;
            }
            
            itemEl.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-stats">${statsText}</div>
                <div class="shop-item-price" style="color: ${canAfford ? '#ffd700' : '#ff4444'}">
                    💰 ${item.price}
                </div>
            `;
            
            if (!isOwned) {
                itemEl.addEventListener('click', () => {
                    this.buyItem(item, this.currentTab);
                });
                itemEl.style.cursor = 'pointer';
            } else {
                itemEl.style.opacity = '0.6';
                itemEl.style.cursor = 'not-allowed';
            }
            
            shopItemsEl.appendChild(itemEl);
        }
        
        const tabs = document.querySelectorAll('.shop-tab');
        tabs.forEach(tab => {
            const tabName = tab.dataset.tab;
            tab.classList.toggle('active', tabName === this.currentTab);
            
            tab.onclick = () => {
                this.switchTab(tabName);
            };
        });
    }
    
    showShopUI() {
        const shopModal = document.getElementById('shopModal');
        if (shopModal) {
            shopModal.classList.remove('hidden');
        }
    }
    
    hideShopUI() {
        const shopModal = document.getElementById('shopModal');
        if (shopModal) {
            shopModal.classList.add('hidden');
        }
    }
    
    getState() {
        return {
            isOpen: this.isOpen,
            currentTab: this.currentTab
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.isOpen = state.isOpen || false;
        this.currentTab = state.currentTab || 'weapons';
    }
}
