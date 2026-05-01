class GameMap {
    constructor(mapData) {
        this.id = mapData.id;
        this.name = mapData.name;
        this.icon = mapData.icon;
        this.description = mapData.description;
        this.difficulty = mapData.difficulty;
        this.unlocked = mapData.unlocked;
        this.requiredLevel = mapData.requiredLevel;
        this.defeatedBoss = mapData.defeatedBoss;
        
        this.width = GameConfig.CANVAS_WIDTH;
        this.height = GameConfig.CANVAS_HEIGHT;
        this.tileSize = GameConfig.TILE_SIZE;
        
        this.obstacles = [];
        this.npcs = [];
        this.decorations = [];
        this.mapPortals = [];
        
        this.generateMap();
    }
    
    generateMap() {
        this.obstacles = [];
        this.decorations = [];
        this.mapPortals = [];
        
        switch (this.id) {
            case 'castle':
                this.generateCastleMap();
                break;
            case 'forest':
                this.generateForestMap();
                break;
            case 'dungeon':
                this.generateDungeonMap();
                break;
            default:
                this.generateDefaultMap();
        }
    }
    
    generateCastleMap() {
        const groundColor = GameConfig.COLORS.GROUND;
        const wallColor = GameConfig.COLORS.WALL;
        
        for (let x = 0; x < this.width; x += this.tileSize) {
            this.obstacles.push({
                x: x,
                y: 0,
                width: this.tileSize,
                height: this.tileSize * 2,
                type: 'wall',
                color: wallColor
            });
            this.obstacles.push({
                x: x,
                y: this.height - this.tileSize * 2,
                width: this.tileSize,
                height: this.tileSize * 2,
                type: 'wall',
                color: wallColor
            });
        }
        
        for (let y = this.tileSize * 2; y < this.height - this.tileSize * 2; y += this.tileSize) {
            this.obstacles.push({
                x: 0,
                y: y,
                width: this.tileSize,
                height: this.tileSize,
                type: 'wall',
                color: wallColor
            });
            this.obstacles.push({
                x: this.width - this.tileSize,
                y: y,
                width: this.tileSize,
                height: this.tileSize,
                type: 'wall',
                color: wallColor
            });
        }
        
        for (let i = 0; i < 5; i++) {
            const pillarX = Utils.random(100, 600);
            const pillarY = Utils.random(150, 350);
            
            this.obstacles.push({
                x: pillarX,
                y: pillarY,
                width: this.tileSize * 1.5,
                height: this.tileSize * 1.5,
                type: 'pillar',
                color: '#78909c'
            });
        }
        
        this.decorations.push({
            x: 100,
            y: 100,
            icon: '👴',
            type: 'npc',
            npcData: {
                id: 'shopkeeper',
                name: '神秘商人',
                type: 'shop'
            }
        });
        
        this.decorations.push({
            x: 600,
            y: 100,
            icon: '🧙‍♂️',
            type: 'npc',
            npcData: {
                id: 'quest_master',
                name: '任务大师',
                type: 'quest'
            }
        });
        
        this.decorations.push({
            x: 350,
            y: 80,
            icon: '👩‍⚕️',
            type: 'npc',
            npcData: {
                id: 'healer',
                name: '治疗师',
                type: 'healer'
            }
        });
        
        if (GameConfig.MAPS.find(m => m.id === 'forest')?.unlocked) {
            this.mapPortals.push({
                x: this.width - 80,
                y: this.height / 2 - 25,
                width: 50,
                height: 50,
                targetMap: 'forest',
                icon: '🌲',
                label: '森林入口'
            });
        }
    }
    
    generateForestMap() {
        const grassColor = GameConfig.COLORS.GRASS;
        const darkGrassColor = GameConfig.COLORS.DARK_GRASS;
        const treeColor = GameConfig.COLORS.TREE;
        
        for (let i = 0; i < 15; i++) {
            const treeX = Utils.random(80, 650);
            const treeY = Utils.random(150, 400);
            
            this.obstacles.push({
                x: treeX,
                y: treeY,
                width: this.tileSize * 2,
                height: this.tileSize * 2,
                type: 'tree',
                color: treeColor,
                icon: '🌲'
            });
        }
        
        for (let i = 0; i < 8; i++) {
            const rockX = Utils.random(100, 650);
            const rockY = Utils.random(120, 420);
            
            this.obstacles.push({
                x: rockX,
                y: rockY,
                width: this.tileSize,
                height: this.tileSize,
                type: 'rock',
                color: GameConfig.COLORS.STONE,
                icon: '🪨'
            });
        }
        
        this.decorations.push({
            x: 80,
            y: 80,
            icon: '🏰',
            type: 'portal_back',
            targetMap: 'castle',
            label: '返回城堡'
        });
        
        this.decorations.push({
            x: 600,
            y: 80,
            icon: '🧝',
            type: 'npc',
            npcData: {
                id: 'forest_guide',
                name: '森林精灵',
                type: 'quest'
            }
        });
        
        if (GameConfig.MAPS.find(m => m.id === 'dungeon')?.unlocked) {
            this.mapPortals.push({
                x: this.width - 80,
                y: this.height / 2 - 25,
                width: 50,
                height: 50,
                targetMap: 'dungeon',
                icon: '🏚️',
                label: '地牢入口'
            });
        }
    }
    
    generateDungeonMap() {
        const stoneColor = GameConfig.COLORS.DARK_STONE;
        const darkStoneColor = '#37474f';
        
        for (let x = 0; x < this.width; x += this.tileSize * 2) {
            this.obstacles.push({
                x: x,
                y: 0,
                width: this.tileSize * 2,
                height: this.tileSize,
                type: 'wall',
                color: stoneColor
            });
            this.obstacles.push({
                x: x,
                y: this.height - this.tileSize,
                width: this.tileSize * 2,
                height: this.tileSize,
                type: 'wall',
                color: stoneColor
            });
        }
        
        for (let y = this.tileSize; y < this.height - this.tileSize; y += this.tileSize) {
            this.obstacles.push({
                x: 0,
                y: y,
                width: this.tileSize,
                height: this.tileSize,
                type: 'wall',
                color: stoneColor
            });
            this.obstacles.push({
                x: this.width - this.tileSize,
                y: y,
                width: this.tileSize,
                height: this.tileSize,
                type: 'wall',
                color: stoneColor
            });
        }
        
        for (let i = 0; i < 6; i++) {
            const torchX = Utils.random(100, 650);
            const torchY = Utils.random(100, 400);
            
            this.decorations.push({
                x: torchX,
                y: torchY,
                icon: '🔥',
                type: 'torch',
                color: '#ff5722'
            });
        }
        
        for (let i = 0; i < 4; i++) {
            const spikeX = Utils.random(120, 600);
            const spikeY = Utils.random(150, 350);
            
            this.obstacles.push({
                x: spikeX,
                y: spikeY,
                width: this.tileSize * 1.5,
                height: this.tileSize * 1.5,
                type: 'spike',
                color: '#455a64',
                icon: '⚔️'
            });
        }
        
        this.decorations.push({
            x: 80,
            y: 80,
            icon: '🌲',
            type: 'portal_back',
            targetMap: 'forest',
            label: '返回森林'
        });
        
        this.decorations.push({
            x: 650,
            y: 80,
            icon: '👻',
            type: 'npc',
            npcData: {
                id: 'dungeon_keeper',
                name: '地牢守护者',
                type: 'quest'
            }
        });
    }
    
    generateDefaultMap() {
        for (let x = 0; x < this.width; x += this.tileSize) {
            for (let y = 0; y < this.height; y += this.tileSize) {
                if (x === 0 || x === this.width - this.tileSize || 
                    y === 0 || y === this.height - this.tileSize) {
                    this.obstacles.push({
                        x: x,
                        y: y,
                        width: this.tileSize,
                        height: this.tileSize,
                        type: 'wall',
                        color: GameConfig.COLORS.WALL
                    });
                }
            }
        }
    }
    
    getObstacles() {
        return this.obstacles;
    }
    
    getNPCs() {
        return this.decorations.filter(d => d.type === 'npc');
    }
    
    getPortals() {
        return [...this.mapPortals, ...this.decorations.filter(d => d.type === 'portal_back')];
    }
    
    checkCollision(rect) {
        for (const obstacle of this.obstacles) {
            if (Utils.collision(rect, obstacle)) {
                return true;
            }
        }
        return false;
    }
    
    getNPCAt(x, y) {
        for (const npc of this.getNPCs()) {
            const distance = Utils.distance(x, y, npc.x + 16, npc.y + 16);
            if (distance < 40) {
                return npc;
            }
        }
        return null;
    }
    
    getPortalAt(x, y) {
        for (const portal of this.getPortals()) {
            const portalRect = {
                x: portal.x,
                y: portal.y,
                width: portal.width,
                height: portal.height
            };
            
            const playerRect = {
                x: x - 16,
                y: y - 16,
                width: 32,
                height: 32
            };
            
            if (Utils.collision(playerRect, portalRect)) {
                return portal;
            }
        }
        return null;
    }
    
    draw(ctx) {
        this.drawBackground(ctx);
        this.drawDecorations(ctx);
        this.drawPortals(ctx);
    }
    
    drawBackground(ctx) {
        let bgColor;
        
        switch (this.id) {
            case 'castle':
                bgColor = GameConfig.COLORS.GROUND;
                break;
            case 'forest':
                bgColor = GameConfig.COLORS.GRASS;
                break;
            case 'dungeon':
                bgColor = GameConfig.COLORS.DARK_STONE;
                break;
            default:
                bgColor = GameConfig.COLORS.BACKGROUND;
        }
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.globalAlpha = 0.1;
        for (let x = 0; x < this.width; x += this.tileSize) {
            for (let y = 0; y < this.height; y += this.tileSize) {
                if ((x + y) % (this.tileSize * 2) === 0) {
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
            }
        }
        ctx.globalAlpha = 1;
        
        for (const obstacle of this.obstacles) {
            if (obstacle.icon) {
                ctx.font = `${Math.min(obstacle.width, obstacle.height)}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(obstacle.icon, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
            } else {
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        }
    }
    
    drawDecorations(ctx) {
        for (const decoration of this.decorations) {
            if (decoration.icon) {
                const size = 32;
                
                if (decoration.type === 'npc') {
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                    ctx.beginPath();
                    ctx.arc(decoration.x + size / 2, decoration.y + size / 2, 25, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.font = `${size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(decoration.icon, decoration.x + size / 2, decoration.y + size / 2);
                
                if (decoration.label) {
                    Utils.drawTextWithOutline(
                        ctx,
                        decoration.label,
                        decoration.x + size / 2,
                        decoration.y + size + 10,
                        '#ffd700',
                        '#000',
                        11
                    );
                }
            }
        }
    }
    
    drawPortals(ctx) {
        for (const portal of this.mapPortals) {
            ctx.fillStyle = 'rgba(138, 43, 226, 0.3)';
            ctx.beginPath();
            ctx.arc(
                portal.x + portal.width / 2,
                portal.y + portal.height / 2,
                Math.max(portal.width, portal.height) / 2 + 5,
                0, Math.PI * 2
            );
            ctx.fill();
            
            ctx.font = `${Math.min(portal.width, portal.height)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(portal.icon, portal.x + portal.width / 2, portal.y + portal.height / 2);
            
            Utils.drawTextWithOutline(
                ctx,
                portal.label,
                portal.x + portal.width / 2,
                portal.y + portal.height + 15,
                '#e0e0e0',
                '#000',
                11
            );
        }
    }
    
    drawMinimap(ctx, minimapWidth, minimapHeight, playerX, playerY, monsters = []) {
        const scaleX = minimapWidth / this.width;
        const scaleY = minimapHeight / this.height;
        
        let bgColor;
        switch (this.id) {
            case 'castle':
                bgColor = '#5d4037';
                break;
            case 'forest':
                bgColor = '#2e7d32';
                break;
            case 'dungeon':
                bgColor = '#37474f';
                break;
            default:
                bgColor = '#424242';
        }
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, minimapWidth, minimapHeight);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        for (const obstacle of this.obstacles) {
            ctx.fillRect(
                obstacle.x * scaleX,
                obstacle.y * scaleY,
                obstacle.width * scaleX,
                obstacle.height * scaleY
            );
        }
        
        for (const monster of monsters) {
            if (monster.isDead) continue;
            
            const color = monster.isBoss ? '#ff4444' : '#ff9800';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(
                monster.getCenterX() * scaleX,
                monster.getCenterY() * scaleY,
                monster.isBoss ? 4 : 2,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        for (const portal of this.getPortals()) {
            ctx.fillStyle = '#9c27b0';
            ctx.beginPath();
            ctx.arc(
                (portal.x + portal.width / 2) * scaleX,
                (portal.y + portal.height / 2) * scaleY,
                3,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(
            playerX * scaleX,
            playerY * scaleY,
            4,
            0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
            playerX * scaleX,
            playerY * scaleY,
            6,
            0, Math.PI * 2
        );
        ctx.stroke();
    }
    
    getState() {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            description: this.description,
            difficulty: this.difficulty,
            unlocked: this.unlocked,
            requiredLevel: this.requiredLevel,
            defeatedBoss: this.defeatedBoss
        };
    }
    
    static fromState(state) {
        return new GameMap(state);
    }
}

class MapManager {
    constructor() {
        this.maps = {};
        this.currentMapId = 'castle';
        
        this.initializeMaps();
    }
    
    initializeMaps() {
        for (const mapData of GameConfig.MAPS) {
            this.maps[mapData.id] = new GameMap(mapData);
        }
    }
    
    getCurrentMap() {
        return this.maps[this.currentMapId];
    }
    
    getMap(mapId) {
        return this.maps[mapId];
    }
    
    switchMap(mapId) {
        if (!this.maps[mapId]) return false;
        
        if (!this.maps[mapId].unlocked) return false;
        
        this.currentMapId = mapId;
        return true;
    }
    
    unlockMap(mapId) {
        if (this.maps[mapId]) {
            this.maps[mapId].unlocked = true;
            
            GameConfig.MAPS.forEach(configMap => {
                if (configMap.id === mapId) {
                    configMap.unlocked = true;
                }
            });
            
            return true;
        }
        return false;
    }
    
    isMapUnlocked(mapId) {
        return this.maps[mapId]?.unlocked || false;
    }
    
    setBossDefeated(mapId) {
        if (this.maps[mapId]) {
            this.maps[mapId].defeatedBoss = true;
            
            GameConfig.MAPS.forEach(configMap => {
                if (configMap.id === mapId) {
                    configMap.defeatedBoss = true;
                }
            });
            
            return true;
        }
        return false;
    }
    
    getAvailableMaps(playerLevel) {
        const available = [];
        
        for (const mapId in this.maps) {
            const map = this.maps[mapId];
            available.push({
                id: map.id,
                name: map.name,
                icon: map.icon,
                description: map.description,
                difficulty: map.difficulty,
                unlocked: map.unlocked,
                requiredLevel: map.requiredLevel,
                canAccess: map.unlocked && playerLevel >= map.requiredLevel,
                defeatedBoss: map.defeatedBoss
            });
        }
        
        return available;
    }
    
    getState() {
        const state = {
            currentMapId: this.currentMapId,
            maps: {}
        };
        
        for (const mapId in this.maps) {
            state.maps[mapId] = this.maps[mapId].getState();
        }
        
        return state;
    }
    
    loadState(state) {
        this.currentMapId = state.currentMapId || 'castle';
        
        if (state.maps) {
            for (const mapId in state.maps) {
                const mapState = state.maps[mapId];
                
                if (this.maps[mapId]) {
                    this.maps[mapId].unlocked = mapState.unlocked;
                    this.maps[mapId].defeatedBoss = mapState.defeatedBoss;
                }
            }
        }
    }
}
