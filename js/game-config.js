const GameConfig = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 500,
    TILE_SIZE: 32,
    FPS: 60,
    
    PLAYER: {
        START_X: 400,
        START_Y: 250,
        SPEED: 4,
        START_HP: 100,
        START_ATK: 10,
        START_DEF: 5,
        START_EXP: 0,
        START_GOLD: 50,
        START_LEVEL: 1,
        EXP_TO_LEVEL: 100,
        HP_PER_LEVEL: 20,
        ATK_PER_LEVEL: 5,
        DEF_PER_LEVEL: 3,
        EXP_MULTIPLIER: 1.5
    },
    
    COLORS: {
        BACKGROUND: '#1a252f',
        GROUND: '#3e2723',
        WALL: '#5d4037',
        TREE: '#2e7d32',
        WATER: '#1976d2',
        ROAD: '#795548',
        GRASS: '#4caf50',
        DARK_GRASS: '#388e3c',
        STONE: '#78909c',
        DARK_STONE: '#546e7a'
    },
    
    WEAPONS: [
        { id: 'wooden_sword', name: '木剑', icon: '🗡️', atk: 5, price: 100, description: '基础的木制武器' },
        { id: 'iron_sword', name: '铁剑', icon: '⚔️', atk: 12, price: 250, description: '坚固的铁制武器' },
        { id: 'steel_sword', name: '钢剑', icon: '🗡️', atk: 20, price: 500, description: '锋利的钢制长剑' },
        { id: 'flame_sword', name: '火焰剑', icon: '🔥', atk: 30, price: 1000, description: '附魔火焰的神秘武器' },
        { id: 'holy_sword', name: '圣光剑', icon: '✨', atk: 45, price: 2000, description: '传说中的神圣武器' }
    ],
    
    ARMORS: [
        { id: 'cloth_armor', name: '布甲', icon: '👕', def: 3, price: 80, description: '基础的布制护甲' },
        { id: 'leather_armor', name: '皮甲', icon: '🦺', def: 8, price: 200, description: '轻便的皮革护甲' },
        { id: 'iron_armor', name: '铁甲', icon: '🛡️', def: 15, price: 450, description: '坚固的铁制护甲' },
        { id: 'steel_armor', name: '钢甲', icon: '⚜️', def: 25, price: 900, description: '精良的钢制护甲' },
        { id: 'holy_armor', name: '圣光护甲', icon: '🌟', def: 40, price: 1800, description: '神圣祝福的护甲' }
    ],
    
    SHIELDS: [
        { id: 'wooden_shield', name: '木盾', icon: '🪵', def: 2, price: 60, description: '基础的木制盾牌' },
        { id: 'iron_shield', name: '铁盾', icon: '🛡️', def: 6, price: 180, description: '坚固的铁制盾牌' },
        { id: 'steel_shield', name: '钢盾', icon: '⚔️', def: 12, price: 400, description: '精良的钢制盾牌' },
        { id: 'royal_shield', name: '皇家盾', icon: '👑', def: 20, price: 800, description: '皇家卫队专用盾牌' }
    ],
    
    POTIONS: [
        { id: 'small_potion', name: '小型生命药水', icon: '🧪', effect: 'heal', value: 30, price: 30, description: '恢复30点生命值' },
        { id: 'medium_potion', name: '中型生命药水', icon: '🧪', effect: 'heal', value: 70, price: 70, description: '恢复70点生命值' },
        { id: 'large_potion', name: '大型生命药水', icon: '🧪', effect: 'heal', value: 150, price: 150, description: '恢复150点生命值' },
        { id: 'power_potion', name: '力量药水', icon: '💪', effect: 'buff_atk', value: 10, duration: 30, price: 100, description: '临时增加10点攻击力30秒' },
        { id: 'shield_potion', name: '护盾药水', icon: '🛡️', effect: 'buff_def', value: 8, duration: 30, price: 80, description: '临时增加8点防御力30秒' }
    ],
    
    MONSTERS: {
        castle: [
            { id: 'skeleton', name: '骷髅', icon: '💀', hp: 40, atk: 8, def: 2, exp: 20, gold: 15, type: 'normal' },
            { id: 'ghost', name: '幽灵', icon: '👻', hp: 30, atk: 12, def: 1, exp: 25, gold: 20, type: 'normal' },
            { id: 'rat', name: '巨型老鼠', icon: '🐀', hp: 25, atk: 5, def: 1, exp: 10, gold: 8, type: 'normal' },
            { id: 'castle_guard', name: '城堡守卫', icon: '👹', hp: 80, atk: 15, def: 5, exp: 50, gold: 40, type: 'boss', isBoss: true }
        ],
        forest: [
            { id: 'goblin', name: '哥布林', icon: '👺', hp: 35, atk: 10, def: 3, exp: 25, gold: 20, type: 'normal' },
            { id: 'orc', name: '兽人', icon: '👹', hp: 60, atk: 14, def: 6, exp: 40, gold: 35, type: 'normal' },
            { id: 'wolf', name: '恶狼', icon: '🐺', hp: 45, atk: 12, def: 4, exp: 30, gold: 25, type: 'normal' },
            { id: 'spider', name: '巨型蜘蛛', icon: '🕷️', hp: 50, atk: 11, def: 3, exp: 35, gold: 28, type: 'normal' },
            { id: 'forest_troll', name: '森林巨魔', icon: '🧌', hp: 120, atk: 20, def: 10, exp: 100, gold: 80, type: 'boss', isBoss: true }
        ],
        dungeon: [
            { id: 'demon', name: '恶魔', icon: '😈', hp: 70, atk: 18, def: 8, exp: 50, gold: 45, type: 'normal' },
            { id: 'vampire', name: '吸血鬼', icon: '🧛', hp: 80, atk: 20, def: 6, exp: 55, gold: 50, type: 'normal' },
            { id: 'skeleton_warrior', name: '骷髅战士', icon: '☠️', hp: 65, atk: 16, def: 10, exp: 45, gold: 40, type: 'normal' },
            { id: 'dark_mage', name: '黑暗法师', icon: '🧙', hp: 55, atk: 25, def: 4, exp: 60, gold: 55, type: 'normal' },
            { id: 'dragon', name: '远古巨龙', icon: '🐉', hp: 200, atk: 30, def: 15, exp: 200, gold: 200, type: 'boss', isBoss: true }
        ]
    },
    
    MAPS: [
        { 
            id: 'castle', 
            name: '城堡', 
            icon: '🏰', 
            description: '古老的城堡，有骷髅和幽灵出没',
            difficulty: 'easy',
            unlocked: true,
            requiredLevel: 1,
            defeatedBoss: false
        },
        { 
            id: 'forest', 
            name: '神秘森林', 
            icon: '🌲', 
            description: '危险的森林，藏有哥布林和巨魔',
            difficulty: 'medium',
            unlocked: false,
            requiredLevel: 5,
            defeatedBoss: false
        },
        { 
            id: 'dungeon', 
            name: '黑暗地牢', 
            icon: '🏚️', 
            description: '最深的地牢，有恶魔和巨龙守护',
            difficulty: 'hard',
            unlocked: false,
            requiredLevel: 10,
            defeatedBoss: false
        }
    ],
    
    QUESTS: [
        {
            id: 'kill_rats',
            title: '清除鼠患',
            description: '城堡里有太多老鼠了，消灭10只巨型老鼠',
            type: 'kill',
            target: 'rat',
            targetCount: 10,
            currentCount: 0,
            rewards: { gold: 50, exp: 30 },
            completed: false,
            active: true,
            map: 'castle'
        },
        {
            id: 'kill_skeletons',
            title: '骷髅猎手',
            description: '消灭15只骷髅，保护城堡的安全',
            type: 'kill',
            target: 'skeleton',
            targetCount: 15,
            currentCount: 0,
            rewards: { gold: 100, exp: 80 },
            completed: false,
            active: true,
            map: 'castle'
        },
        {
            id: 'defeat_castle_boss',
            title: '击败城堡守卫',
            description: '找到并击败城堡深处的守卫BOSS',
            type: 'boss',
            target: 'castle_guard',
            targetCount: 1,
            currentCount: 0,
            rewards: { gold: 200, exp: 150, item: 'iron_sword' },
            completed: false,
            active: true,
            map: 'castle'
        },
        {
            id: 'kill_goblins',
            title: '哥布林清剿',
            description: '在森林中消灭20只哥布林',
            type: 'kill',
            target: 'goblin',
            targetCount: 20,
            currentCount: 0,
            rewards: { gold: 150, exp: 120 },
            completed: false,
            active: false,
            map: 'forest'
        },
        {
            id: 'defeat_forest_troll',
            title: '巨魔猎人',
            description: '击败森林深处的巨魔BOSS',
            type: 'boss',
            target: 'forest_troll',
            targetCount: 1,
            currentCount: 0,
            rewards: { gold: 300, exp: 200, item: 'steel_sword' },
            completed: false,
            active: false,
            map: 'forest'
        },
        {
            id: 'kill_demons',
            title: '恶魔清除计划',
            description: '在地牢中消灭15只恶魔',
            type: 'kill',
            target: 'demon',
            targetCount: 15,
            currentCount: 0,
            rewards: { gold: 250, exp: 200 },
            completed: false,
            active: false,
            map: 'dungeon'
        },
        {
            id: 'defeat_dragon',
            title: '屠龙勇士',
            description: '击败远古巨龙，成为传奇骑士！',
            type: 'boss',
            target: 'dragon',
            targetCount: 1,
            currentCount: 0,
            rewards: { gold: 500, exp: 500, item: 'holy_sword' },
            completed: false,
            active: false,
            map: 'dungeon'
        }
    ],
    
    NPCS: [
        { id: 'shopkeeper', name: '神秘商人', icon: '👴', x: 100, y: 100, type: 'shop' },
        { id: 'quest_master', name: '任务大师', icon: '🧙‍♂️', x: 600, y: 100, type: 'quest' },
        { id: 'healer', name: '治疗师', icon: '👩‍⚕️', x: 350, y: 80, type: 'healer' }
    ],
    
    SAVE_KEY: 'knight_adventure_save'
};

Object.freeze(GameConfig);
