class Monster {
    constructor(config, mapId, spawnX = null, spawnY = null) {
        this.id = config.id;
        this.name = config.name;
        this.icon = config.icon;
        this.baseHp = config.hp;
        this.currentHp = config.hp;
        this.maxHp = config.hp;
        this.atk = config.atk;
        this.def = config.def;
        this.exp = config.exp;
        this.gold = config.gold;
        this.type = config.type;
        this.isBoss = config.isBoss || false;
        
        this.mapId = mapId;
        
        this.width = 32;
        this.height = 32;
        this.x = spawnX || Utils.random(50, GameConfig.CANVAS_WIDTH - 82);
        this.y = spawnY || Utils.random(50, GameConfig.CANVAS_HEIGHT - 82);
        
        this.speed = this.isBoss ? 1 : 1.5;
        this.direction = 'down';
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        this.moveTimer = 0;
        this.moveDirection = { dx: 0, dy: 0 };
        this.moveDuration = 0;
        this.idleTimer = 0;
        
        this.aggroRange = this.isBoss ? 200 : 120;
        this.aggroed = false;
        this.targetPlayer = null;
        
        this.attackCooldown = 0;
        this.attackRange = 40;
        this.isAttacking = false;
        
        this.isDead = false;
        this.deathTimer = 0;
    }
    
    update(dt, player, obstacles = []) {
        if (this.isDead) {
            this.deathTimer += dt;
            return;
        }
        
        const distanceToPlayer = Utils.distance(
            this.getCenterX(), this.getCenterY(),
            player.getCenterX(), player.getCenterY()
        );
        
        if (distanceToPlayer < this.aggroRange) {
            this.aggroed = true;
            this.targetPlayer = player;
        }
        
        if (this.aggroed && this.targetPlayer) {
            this.chasePlayer(dt, obstacles);
            
            if (distanceToPlayer < this.attackRange && this.attackCooldown <= 0) {
                this.attack();
            }
        } else {
            this.randomMovement(dt, obstacles);
        }
        
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt;
        }
        
        if (this.isMoving) {
            this.animationTimer++;
            if (this.animationTimer > 10) {
                this.animationFrame = (this.animationFrame + 1) % 4;
                this.animationTimer = 0;
            }
        }
    }
    
    chasePlayer(dt, obstacles) {
        if (!this.targetPlayer) return;
        
        const dx = this.targetPlayer.getCenterX() - this.getCenterX();
        const dy = this.targetPlayer.getCenterY() - this.getCenterY();
        
        let moveX = 0;
        let moveY = 0;
        
        if (Math.abs(dx) > 5) {
            moveX = dx > 0 ? 1 : -1;
        }
        if (Math.abs(dy) > 5) {
            moveY = dy > 0 ? 1 : -1;
        }
        
        if (moveX !== 0 || moveY !== 0) {
            const speed = this.isBoss ? this.speed * 0.8 : this.speed;
            const newX = this.x + moveX * speed;
            const newY = this.y + moveY * speed;
            
            let canMoveX = true;
            let canMoveY = true;
            
            const monsterRect = {
                x: newX,
                y: this.y,
                width: this.width,
                height: this.height
            };
            
            for (const obstacle of obstacles) {
                if (Utils.collision(monsterRect, obstacle)) {
                    canMoveX = false;
                    break;
                }
            }
            
            monsterRect.x = this.x;
            monsterRect.y = newY;
            
            for (const obstacle of obstacles) {
                if (Utils.collision(monsterRect, obstacle)) {
                    canMoveY = false;
                    break;
                }
            }
            
            if (canMoveX) {
                this.x = newX;
                if (moveX > 0) this.direction = 'right';
                else this.direction = 'left';
            }
            if (canMoveY) {
                this.y = newY;
                if (moveY > 0) this.direction = 'down';
                else this.direction = 'up';
            }
            
            this.x = Utils.clamp(this.x, 0, GameConfig.CANVAS_WIDTH - this.width);
            this.y = Utils.clamp(this.y, 0, GameConfig.CANVAS_HEIGHT - this.height);
            
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }
    
    randomMovement(dt, obstacles) {
        if (this.idleTimer > 0) {
            this.idleTimer -= dt;
            this.isMoving = false;
            return;
        }
        
        if (this.moveDuration > 0) {
            this.moveDuration -= dt;
            
            const newX = this.x + this.moveDirection.dx * this.speed * 0.5;
            const newY = this.y + this.moveDirection.dy * this.speed * 0.5;
            
            let canMoveX = true;
            let canMoveY = true;
            
            const monsterRect = {
                x: newX,
                y: this.y,
                width: this.width,
                height: this.height
            };
            
            for (const obstacle of obstacles) {
                if (Utils.collision(monsterRect, obstacle)) {
                    canMoveX = false;
                    break;
                }
            }
            
            monsterRect.x = this.x;
            monsterRect.y = newY;
            
            for (const obstacle of obstacles) {
                if (Utils.collision(monsterRect, obstacle)) {
                    canMoveY = false;
                    break;
                }
            }
            
            if (canMoveX && this.moveDirection.dx !== 0) {
                this.x = newX;
            }
            if (canMoveY && this.moveDirection.dy !== 0) {
                this.y = newY;
            }
            
            this.x = Utils.clamp(this.x, 0, GameConfig.CANVAS_WIDTH - this.width);
            this.y = Utils.clamp(this.y, 0, GameConfig.CANVAS_HEIGHT - this.height);
            
            if (this.moveDirection.dx > 0) this.direction = 'right';
            else if (this.moveDirection.dx < 0) this.direction = 'left';
            else if (this.moveDirection.dy > 0) this.direction = 'down';
            else if (this.moveDirection.dy < 0) this.direction = 'up';
            
            this.isMoving = true;
        } else {
            const rand = Math.random();
            
            if (rand < 0.3) {
                this.idleTimer = Utils.randomFloat(1, 3);
                this.isMoving = false;
            } else {
                const directions = [
                    { dx: 0, dy: -1 },
                    { dx: 0, dy: 1 },
                    { dx: -1, dy: 0 },
                    { dx: 1, dy: 0 },
                    { dx: 0, dy: 0 }
                ];
                
                this.moveDirection = Utils.pickRandom(directions);
                this.moveDuration = Utils.randomFloat(0.5, 2);
                
                if (this.moveDirection.dx === 0 && this.moveDirection.dy === 0) {
                    this.isMoving = false;
                } else {
                    this.isMoving = true;
                }
            }
        }
    }
    
    attack() {
        if (!this.targetPlayer) return null;
        
        this.isAttacking = true;
        this.attackCooldown = this.isBoss ? 1.5 : 1;
        
        const damage = this.calculateDamage();
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 300);
        
        return damage;
    }
    
    calculateDamage() {
        const baseDamage = this.atk;
        const variance = Utils.random(-2, 2);
        return Math.max(1, baseDamage + variance);
    }
    
    takeDamage(damage) {
        if (this.isDead) return 0;
        
        const actualDamage = Math.max(1, damage - this.def);
        this.currentHp = Math.max(0, this.currentHp - actualDamage);
        
        if (this.currentHp <= 0) {
            this.die();
        }
        
        return actualDamage;
    }
    
    die() {
        this.isDead = true;
        this.deathTimer = 0;
    }
    
    getRewards() {
        const bonusGold = this.isBoss ? Utils.random(20, 50) : 0;
        
        return {
            exp: this.exp,
            gold: this.gold + bonusGold,
            isBoss: this.isBoss
        };
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
            id: this.id,
            name: this.name,
            icon: this.icon,
            maxHp: this.maxHp,
            currentHp: this.currentHp,
            atk: this.atk,
            def: this.def,
            exp: this.exp,
            gold: this.gold,
            type: this.type,
            isBoss: this.isBoss,
            mapId: this.mapId,
            x: this.x,
            y: this.y,
            isDead: this.isDead,
            deathTimer: this.deathTimer
        };
    }
    
    static fromState(state) {
        const monsterConfig = {
            id: state.id,
            name: state.name,
            icon: state.icon,
            hp: state.maxHp,
            atk: state.atk,
            def: state.def,
            exp: state.exp,
            gold: state.gold,
            type: state.type,
            isBoss: state.isBoss
        };
        
        const monster = new Monster(monsterConfig, state.mapId, state.x, state.y);
        monster.currentHp = state.currentHp;
        monster.isDead = state.isDead;
        monster.deathTimer = state.deathTimer;
        
        return monster;
    }
}

class MonsterManager {
    constructor() {
        this.monsters = [];
        this.spawnTimer = 0;
        this.spawnInterval = 5;
        this.maxMonstersPerMap = 8;
    }
    
    spawnMonster(mapId, x = null, y = null) {
        const mapMonsters = GameConfig.MONSTERS[mapId];
        if (!mapMonsters || mapMonsters.length === 0) return null;
        
        const normalMonsters = mapMonsters.filter(m => !m.isBoss);
        const bossMonsters = mapMonsters.filter(m => m.isBoss);
        
        const currentMapMonsters = this.monsters.filter(m => m.mapId === mapId && !m.isDead);
        const hasBossOnMap = currentMapMonsters.some(m => m.isBoss);
        
        let monsterConfig;
        
        if (normalMonsters.length > 0 && !hasBossOnMap && Math.random() < 0.05 && bossMonsters.length > 0) {
            monsterConfig = Utils.pickRandom(bossMonsters);
        } else {
            monsterConfig = Utils.pickRandom(normalMonsters);
        }
        
        if (!monsterConfig) return null;
        
        const monster = new Monster(monsterConfig, mapId, x, y);
        this.monsters.push(monster);
        
        return monster;
    }
    
    update(dt, player, currentMapId, obstacles = []) {
        const currentMapMonsters = this.monsters.filter(m => m.mapId === currentMapId);
        
        for (const monster of currentMapMonsters) {
            monster.update(dt, player, obstacles);
        }
        
        this.monsters = this.monsters.filter(m => !m.isDead || m.deathTimer < 2);
        
        const aliveCount = this.monsters.filter(m => m.mapId === currentMapId && !m.isDead).length;
        if (aliveCount < this.maxMonstersPerMap) {
            this.spawnTimer += dt;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                
                const safeAreas = [
                    { x: 50, y: 50, width: 100, height: 100 },
                    { x: GameConfig.CANVAS_WIDTH - 150, y: 50, width: 100, height: 100 },
                    { x: 50, y: GameConfig.CANVAS_HEIGHT - 150, width: 100, height: 100 }
                ];
                
                const spawnArea = Utils.pickRandom(safeAreas);
                const spawnX = Utils.random(spawnArea.x, spawnArea.x + spawnArea.width);
                const spawnY = Utils.random(spawnArea.y, spawnArea.y + spawnArea.height);
                
                let canSpawn = true;
                const spawnRect = { x: spawnX, y: spawnY, width: 32, height: 32 };
                
                for (const obstacle of obstacles) {
                    if (Utils.collision(spawnRect, obstacle)) {
                        canSpawn = false;
                        break;
                    }
                }
                
                if (canSpawn) {
                    this.spawnMonster(currentMapId, spawnX, spawnY);
                }
            }
        }
    }
    
    getMonstersByMap(mapId) {
        return this.monsters.filter(m => m.mapId === mapId);
    }
    
    getAliveMonstersByMap(mapId) {
        return this.monsters.filter(m => m.mapId === mapId && !m.isDead);
    }
    
    getMonsterAt(x, y, mapId) {
        for (const monster of this.monsters) {
            if (monster.mapId !== mapId || monster.isDead) continue;
            
            const distance = Utils.distance(
                x, y,
                monster.getCenterX(), monster.getCenterY()
            );
            
            if (distance < 25) {
                return monster;
            }
        }
        return null;
    }
    
    clearMap(mapId) {
        this.monsters = this.monsters.filter(m => m.mapId !== mapId);
    }
    
    clearAll() {
        this.monsters = [];
        this.spawnTimer = 0;
    }
    
    getState() {
        return {
            monsters: this.monsters.map(m => m.getState()),
            spawnTimer: this.spawnTimer
        };
    }
    
    loadState(state) {
        this.monsters = [];
        if (state.monsters) {
            for (const monsterState of state.monsters) {
                this.monsters.push(Monster.fromState(monsterState));
            }
        }
        this.spawnTimer = state.spawnTimer || 0;
    }
}
