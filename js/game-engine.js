class GameEngine {
    constructor(game) {
        this.game = game;
        this.canvas = null;
        this.ctx = null;
        this.minimapCanvas = null;
        this.minimapCtx = null;
        
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        this.animationId = null;
        
        this.initialize();
    }
    
    initialize() {
        this.canvas = document.getElementById('gameCanvas');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
        
        if (this.minimapCanvas) {
            this.minimapCtx = this.minimapCanvas.getContext('2d');
        }
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        if (!this.animationId) {
            this.gameLoop();
        }
    }
    
    stop() {
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.frameCount++;
        
        if (!this.isPaused && !this.game.combatSystem.isInBattle) {
            this.update(this.deltaTime);
        }
        
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update(dt) {
        try {
            const inputHandler = this.game.inputHandler;
            const player = this.game.player;
            const mapManager = this.game.mapManager;
            const monsterManager = this.game.monsterManager;
            
            if (!mapManager) {
                console.error('GameEngine: mapManager is undefined');
                return;
            }
            
            const currentMap = mapManager.getCurrentMap();
            if (!currentMap) {
                console.error('GameEngine: currentMap is undefined, mapId:', mapManager.currentMapId);
                return;
            }
            
            const { dx, dy } = inputHandler.getMovementDirection();
            const obstacles = currentMap.getObstacles();
            
            if (dx !== 0 || dy !== 0) {
                player.move(dx, dy, obstacles);
            }
            
            player.update(dt);
            
            if (monsterManager) {
                monsterManager.update(
                    dt,
                    player,
                    mapManager.currentMapId,
                    obstacles
                );
            }
            
            this.checkMonsterCollisions();
            
            if (this.game.ui) {
                this.game.ui.updateStatusBar();
            }
        } catch (error) {
            console.error('GameEngine update error:', error);
        }
    }
    
    checkMonsterCollisions() {
        const player = this.game.player;
        const mapManager = this.game.mapManager;
        const monsterManager = this.game.monsterManager;
        const combatSystem = this.game.combatSystem;
        
        if (combatSystem.isInBattle) return;
        
        const monsters = monsterManager.getAliveMonstersByMap(mapManager.currentMapId);
        
        for (const monster of monsters) {
            const distance = Utils.distance(
                player.getCenterX(), player.getCenterY(),
                monster.getCenterX(), monster.getCenterY()
            );
            
            if (distance < 30) {
                combatSystem.startBattle(monster);
                break;
            }
        }
    }
    
    render() {
        if (!this.ctx) return;
        
        try {
            const ctx = this.ctx;
            const mapManager = this.game.mapManager;
            const player = this.game.player;
            const monsterManager = this.game.monsterManager;
            
            if (!mapManager) {
                console.error('GameEngine render: mapManager is undefined');
                return;
            }
            
            const currentMap = mapManager.getCurrentMap();
            if (!currentMap) {
                console.error('GameEngine render: currentMap is undefined');
                return;
            }
            
            ctx.clearRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
            
            currentMap.draw(ctx);
            
            if (monsterManager) {
                const monsters = monsterManager.getMonstersByMap(mapManager.currentMapId);
                for (const monster of monsters) {
                    if (this.game.ui) {
                        this.game.ui.drawMonster(ctx, monster);
                    }
                }
            }
            
            if (this.game.ui) {
                this.game.ui.drawPlayer(ctx, player);
            }
            
            this.renderMinimap();
        } catch (error) {
            console.error('GameEngine render error:', error);
        }
    }
    
    renderMinimap() {
        if (!this.minimapCtx) return;
        
        const ctx = this.minimapCtx;
        const mapManager = this.game.mapManager;
        const currentMap = mapManager.getCurrentMap();
        const player = this.game.player;
        const monsterManager = this.game.monsterManager;
        
        const minimapWidth = this.minimapCanvas.width;
        const minimapHeight = this.minimapCanvas.height;
        
        ctx.clearRect(0, 0, minimapWidth, minimapHeight);
        
        const monsters = monsterManager.getAliveMonstersByMap(mapManager.currentMapId);
        
        currentMap.drawMinimap(
            ctx,
            minimapWidth,
            minimapHeight,
            player.getCenterX(),
            player.getCenterY(),
            monsters
        );
    }
    
    getFps() {
        return this.fps;
    }
    
    getState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            frameCount: this.frameCount
        };
    }
    
    loadState(state) {
        if (!state) return;
        
        this.isRunning = state.isRunning || false;
        this.isPaused = state.isPaused || false;
        this.frameCount = state.frameCount || 0;
    }
}
