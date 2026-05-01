class Player {
    constructor() {
        this.reset();
    }
    
    reset() {
        const config = GameConfig.PLAYER;
        this.x = config.START_X;
        this.y = config.START_Y;
        this.width = 32;
        this.height = 32;
        this.speed = config.SPEED;
        this.direction = 'down';
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        this.maxHp = config.START_HP;
        this.currentHp = config.START_HP;
        this.baseAtk = config.START_ATK;
        this.baseDef = config.START_DEF;
        this.level = config.START_LEVEL;
        this.exp = config.START_EXP;
        this.expToLevel = config.EXP_TO_LEVEL;
        this.gold = config.START_GOLD;
        
        this.totalAtk = this.baseAtk;
        this.totalDef = this.baseDef;
        
        this.equipment = {
            weapon: null,
            armor: null,
            shield: null
        };
        
        this.inventory = {
            weapons: [],
            armors: [],
            shields: [],
            potions: []
        };
        
        this.buffs = {
            atk: 0,
            def: 0,
            atkDuration: 0,
            defDuration: 0
        };
        
        this.isDefending = false;
        this.isAttacking = false;
        this.attackCooldown = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
        
        this.updateStats();
    }
    
    updateStats() {
        let weaponAtk = 0;
        let armorDef = 0;
        let shieldDef = 0;
        
        if (this.equipment.weapon) {
            const weapon = GameConfig.WEAPONS.find(w => w.id === this.equipment.weapon);
            if (weapon) weaponAtk = weapon.atk;
        }
        
        if (this.equipment.armor) {
            const armor = GameConfig.ARMORS.find(a => a.id === this.equipment.armor);
            if (armor) armorDef = armor.def;
        }
        
        if (this.equipment.shield) {
            const shield = GameConfig.SHIELDS.find(s => s.id === this.equipment.shield);
            if (shield) shieldDef = shield.def;
        }
        
        this.totalAtk = this.baseAtk + weaponAtk + this.buffs.atk;
        this.totalDef = this.baseDef + armorDef + shieldDef + this.buffs.def;
    }
    
    move(dx, dy, obstacles = []) {
        const newX = this.x + dx * this.speed;
        const newY = this.y + dy * this.speed;
        
        if (dx > 0) this.direction = 'right';
        else if (dx < 0) this.direction = 'left';
        else if (dy > 0) this.direction = 'down';
        else if (dy < 0) this.direction = 'up';
        
        let canMoveX = true;
        let canMoveY = true;
        
        const playerRect = {
            x: newX,
            y: this.y,
            width: this.width,
            height: this.height
        };
        
        for (const obstacle of obstacles) {
            if (Utils.collision(playerRect, obstacle)) {
                canMoveX = false;
                break;
            }
        }
        
        playerRect.x = this.x;
        playerRect.y = newY;
        
        for (const obstacle of obstacles) {
            if (Utils.collision(playerRect, obstacle)) {
                canMoveY = false;
                break;
            }
        }
        
        if (canMoveX) {
            this.x = newX;
        }
        if (canMoveY) {
            this.y = newY;
        }
        
        this.x = Utils.clamp(this.x, 0, GameConfig.CANVAS_WIDTH - this.width);
        this.y = Utils.clamp(this.y, 0, GameConfig.CANVAS_HEIGHT - this.height);
        
        this.isMoving = dx !== 0 || dy !== 0;
        if (this.isMoving) {
            this.animationTimer++;
            if (this.animationTimer > 8) {
                this.animationFrame = (this.animationFrame + 1) % 4;
                this.animationTimer = 0;
            }
        }
    }
    
    update(dt) {
        if (this.buffs.atkDuration > 0) {
            this.buffs.atkDuration -= dt;
            if (this.buffs.atkDuration <= 0) {
                this.buffs.atk = 0;
                this.buffs.atkDuration = 0;
                this.updateStats();
            }
        }
        
        if (this.buffs.defDuration > 0) {
            this.buffs.defDuration -= dt;
            if (this.buffs.defDuration <= 0) {
                this.buffs.def = 0;
                this.buffs.defDuration = 0;
                this.updateStats();
            }
        }
        
        if (this.invulnerable) {
            this.invulnerableTimer -= dt;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return 0;
        
        let actualDamage = Math.max(1, damage - this.totalDef);
        
        if (this.isDefending) {
            actualDamage = Math.floor(actualDamage * 0.5);
        }
        
        this.currentHp = Math.max(0, this.currentHp - actualDamage);
        
        this.invulnerable = true;
        this.invulnerableTimer = 1;
        
        return actualDamage;
    }
    
    heal(amount) {
        const oldHp = this.currentHp;
        this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
        return this.currentHp - oldHp;
    }
    
    gainExp(amount) {
        this.exp += amount;
        let leveledUp = false;
        
        while (this.exp >= this.expToLevel) {
            this.levelUp();
            leveledUp = true;
        }
        
        return leveledUp;
    }
    
    levelUp() {
        this.exp -= this.expToLevel;
        this.level++;
        
        const hpIncrease = GameConfig.PLAYER.HP_PER_LEVEL;
        const atkIncrease = GameConfig.PLAYER.ATK_PER_LEVEL;
        const defIncrease = GameConfig.PLAYER.DEF_PER_LEVEL;
        
        this.maxHp += hpIncrease;
        this.currentHp = this.maxHp;
        this.baseAtk += atkIncrease;
        this.baseDef += defIncrease;
        
        this.expToLevel = Math.floor(this.expToLevel * GameConfig.PLAYER.EXP_MULTIPLIER);
        
        this.updateStats();
        
        return {
            level: this.level,
            hpIncrease,
            atkIncrease,
            defIncrease
        };
    }
    
    addGold(amount) {
        this.gold += amount;
    }
    
    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
    
    equipItem(itemType, itemId) {
        let category;
        
        if (['weapons', 'armors', 'shields'].includes(itemType)) {
            category = itemType.slice(0, -1);
        } else if (['weapon', 'armor', 'shield'].includes(itemType)) {
            category = itemType;
        } else {
            return false;
        }
        
        const pluralCategory = category + 's';
        let itemList;
        
        switch (category) {
            case 'weapon':
                itemList = GameConfig.WEAPONS;
                break;
            case 'armor':
                itemList = GameConfig.ARMORS;
                break;
            case 'shield':
                itemList = GameConfig.SHIELDS;
                break;
        }
        
        const hasItem = this.inventory[pluralCategory].includes(itemId);
        const itemExists = itemList.find(item => item.id === itemId);
        
        if (!hasItem || !itemExists) {
            return false;
        }
        
        this.equipment[category] = itemId;
        this.updateStats();
        
        return true;
    }
    
    buyItem(itemType, itemId, price) {
        if (!this.spendGold(price)) {
            return false;
        }
        
        let pluralType;
        
        if (['weapons', 'armors', 'shields', 'potions'].includes(itemType)) {
            pluralType = itemType;
        } else if (['weapon', 'armor', 'shield', 'potion'].includes(itemType)) {
            pluralType = itemType + 's';
        } else {
            this.addGold(price);
            return false;
        }
        
        if (['weapons', 'armors', 'shields'].includes(pluralType)) {
            if (this.inventory[pluralType].includes(itemId)) {
                this.addGold(price);
                return false;
            }
            this.inventory[pluralType].push(itemId);
        } else if (pluralType === 'potions') {
            const potionIndex = this.inventory.potions.findIndex(p => p.id === itemId);
            if (potionIndex >= 0) {
                this.inventory.potions[potionIndex].count++;
            } else {
                this.inventory.potions.push({ id: itemId, count: 1 });
            }
        }
        
        return true;
    }
    
    usePotion(potionId) {
        const potionIndex = this.inventory.potions.findIndex(p => p.id === potionId);
        if (potionIndex < 0 || this.inventory.potions[potionIndex].count <= 0) {
            return null;
        }
        
        const potion = GameConfig.POTIONS.find(p => p.id === potionId);
        if (!potion) return null;
        
        let result = null;
        
        switch (potion.effect) {
            case 'heal':
                const healedAmount = this.heal(potion.value);
                result = { type: 'heal', amount: healedAmount, name: potion.name };
                break;
                
            case 'buff_atk':
                this.buffs.atk = potion.value;
                this.buffs.atkDuration = potion.duration;
                this.updateStats();
                result = { type: 'buff_atk', amount: potion.value, duration: potion.duration, name: potion.name };
                break;
                
            case 'buff_def':
                this.buffs.def = potion.value;
                this.buffs.defDuration = potion.duration;
                this.updateStats();
                result = { type: 'buff_def', amount: potion.value, duration: potion.duration, name: potion.name };
                break;
        }
        
        if (result) {
            this.inventory.potions[potionIndex].count--;
            if (this.inventory.potions[potionIndex].count <= 0) {
                this.inventory.potions.splice(potionIndex, 1);
            }
        }
        
        return result;
    }
    
    getCenterX() {
        return this.x + this.width / 2;
    }
    
    getCenterY() {
        return this.y + this.height / 2;
    }
    
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    getState() {
        return {
            x: this.x,
            y: this.y,
            maxHp: this.maxHp,
            currentHp: this.currentHp,
            baseAtk: this.baseAtk,
            baseDef: this.baseDef,
            totalAtk: this.totalAtk,
            totalDef: this.totalDef,
            level: this.level,
            exp: this.exp,
            expToLevel: this.expToLevel,
            gold: this.gold,
            equipment: Utils.deepClone(this.equipment),
            inventory: Utils.deepClone(this.inventory),
            buffs: Utils.deepClone(this.buffs)
        };
    }
    
    loadState(state) {
        this.x = state.x || GameConfig.PLAYER.START_X;
        this.y = state.y || GameConfig.PLAYER.START_Y;
        this.maxHp = state.maxHp || GameConfig.PLAYER.START_HP;
        this.currentHp = state.currentHp || this.maxHp;
        this.baseAtk = state.baseAtk || GameConfig.PLAYER.START_ATK;
        this.baseDef = state.baseDef || GameConfig.PLAYER.START_DEF;
        this.totalAtk = state.totalAtk || this.baseAtk;
        this.totalDef = state.totalDef || this.baseDef;
        this.level = state.level || GameConfig.PLAYER.START_LEVEL;
        this.exp = state.exp || GameConfig.PLAYER.START_EXP;
        this.expToLevel = state.expToLevel || GameConfig.PLAYER.EXP_TO_LEVEL;
        this.gold = state.gold || GameConfig.PLAYER.START_GOLD;
        this.equipment = state.equipment ? Utils.deepClone(state.equipment) : { weapon: null, armor: null, shield: null };
        this.inventory = state.inventory ? Utils.deepClone(state.inventory) : { weapons: [], armors: [], shields: [], potions: [] };
        this.buffs = state.buffs ? Utils.deepClone(state.buffs) : { atk: 0, def: 0, atkDuration: 0, defDuration: 0 };
        
        this.updateStats();
    }
}
