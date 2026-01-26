/**
 * Genetic Rogue Ver.11.3
 * - Fixed Settings Button visibility
 * - New Save Key (Fixed) + Migration Logic
 * - Auto-Data Correction for old saves
 */

// --- 1. DATA DEFINITIONS ---

const ELEMENTS = {
    fire:  { name: "火", color: "#e74c3c" },
    water: { name: "水", color: "#3498db" },
    wind:  { name: "風", color: "#2ecc71" },
    earth: { name: "土", color: "#d35400" },
    light: { name: "光", color: "#f1c40f" },
    dark:  { name: "闇", color: "#9b59b6" }
};

const ELEMENT_CHART = {
    fire: { weak: 'water', strong: 'wind' },
    wind: { weak: 'fire', strong: 'earth' },
    earth: { weak: 'wind', strong: 'water' },
    water: { weak: 'earth', strong: 'fire' },
    light: { weak: 'dark', strong: 'dark' },
    dark: { weak: 'light', strong: 'light' }
};

const LINEAGE = {
    warrior: { hp: 1.5, atk: 1.5, def: 1.2, agi: 0.8, mag: 0.2, int: 0.6, luc: 1.0, color:"#e74c3c" },
    martial: { hp: 1.4, atk: 1.3, def: 0.9, agi: 1.5, mag: 0.5, int: 1.0, luc: 1.0, color:"#d35400" },
    shadow:  { hp: 0.9, atk: 1.2, def: 0.7, agi: 1.7, mag: 0.6, int: 1.3, luc: 1.6, color:"#8e44ad" },
    magic:   { hp: 0.7, atk: 0.3, def: 0.6, agi: 1.0, mag: 1.8, int: 1.6, luc: 1.0, color:"#3498db" },
    holy:    { hp: 1.1, atk: 0.7, def: 1.2, agi: 0.9, mag: 1.4, int: 1.5, luc: 1.2, color:"#f1c40f" },
    tech:    { hp: 1.2, atk: 1.0, def: 1.1, agi: 1.2, mag: 0.5, int: 1.6, luc: 1.1, color:"#1abc9c" },
    special: { hp: 1.0, atk: 0.8, def: 0.8, agi: 1.0, mag: 1.0, int: 1.3, luc: 2.0, color:"#2ecc71" }
};

const PERSONALITY_DATA = {
    "勇敢": { hp:1.2, atk:1.2 }, "冷静": { int:1.2, def:1.2 }, "臆病": { agi:1.3, def:0.8 },
    "豪快": { atk:1.3, mag:0.7 }, "天才": { mag:1.2, int:1.2, hp:0.8 }, "幸運": { luc:1.5 },
    "堅実": { def:1.2, hp:1.2, agi:0.8 }, "凡人": {}
};

const SKILL_POOL = {
    phy: ["剛腕", "連撃", "鉄壁", "カウンター", "急所突き", "粉砕", "底力", "闘争本能", "受け流し", "鬼神"],
    mag: ["魔力集中", "瞑想", "炎の知識", "マナ効率", "詠唱短縮", "属性強化", "結界", "精神統一", "古代の知恵", "魔神"],
    spd: ["早業", "回避", "不意打ち", "残像", "軽業", "目利き", "二刀流の極意", "隠密", "俊足", "神速"],
    tnk: ["挑発", "かばう", "忍耐", "リジェネ", "重装甲", "不屈", "ガーディアン", "自己修復", "城塞", "金剛"],
    sup: ["祈り", "祝福", "慈愛", "応急手当", "加護", "薬の知識", "聖なる光", "献身", "女神の瞳", "奇跡"]
};

// atkType: 'phy'(Physical) or 'mag'(Magical)
// curve: 'early'(早熟), 'avg'(普通), 'late'(晩成)
const JOB_DATA = {
    // T1
    warrior:   { name:"戦士", tier:1, type:"phy", atkType:"phy", curve:"avg", equip:["sw","ax","ha","la","sh","ac"], lineage:"warrior" },
    mage:      { name:"魔法使い", tier:1, type:"mag", atkType:"mag", curve:"late", equip:["st","dg","ro","ac"], lineage:"magic" },
    thief:     { name:"盗賊",   tier:1, type:"spd", atkType:"phy", curve:"early", equip:["dg","bow","la","to","ac"], lineage:"shadow" },
    priest:    { name:"僧侶",  tier:1, type:"sup", atkType:"mag", curve:"avg", equip:["st","ro","sh","ac"], lineage:"holy" },
    merchant:  { name:"商人",tier:1, type:"spe", atkType:"phy", curve:"early", equip:["dg","la","ac"], lineage:"special" },
    monk:      { name:"武闘家",    tier:1, type:"phy", atkType:"phy", curve:"avg", equip:["kn","la","ac"], lineage:"martial" },
    hunter:    { name:"狩人",  tier:1, type:"tec", atkType:"phy", curve:"avg", equip:["bow","dg","la","to","ac"], lineage:"shadow" },
    
    // T2
    knight:    { name:"騎士",  tier:2, type:"tnk", atkType:"phy", curve:"avg", equip:["sw","sp","ha","la","sh","ac"], lineage:"warrior", mod:{def:1.4} },
    samurai:   { name:"侍", tier:2, type:"phy", atkType:"phy", curve:"late", equip:["sw","bow","la","ac"], lineage:"martial", mod:{atk:1.5} },
    sorcerer:  { name:"魔術師",tier:2, type:"mag", atkType:"mag", curve:"late", equip:["st","dg","ro","ac"], lineage:"magic", mod:{mag:1.7} },
    bard:      { name:"吟遊詩人", tier:2, type:"sup", atkType:"mag", curve:"early", equip:["ins","dg","la","ro","ac"], lineage:"special", mod:{luc:1.5} },
    ninja:     { name:"忍者",   tier:2, type:"spd", atkType:"phy", curve:"early", equip:["sw","dg","to","la","ac"], lineage:"shadow", mod:{agi:1.6}, reqEl:['wind','dark'] },
    gunner:    { name:"ガンマン",  tier:2, type:"tec", atkType:"phy", curve:"avg", equip:["gun","la","ac"], lineage:"tech", mod:{dex:1.5} },
    
    // T3
    paladin:   { name:"聖騎士", tier:3, type:"tnk", atkType:"phy", curve:"late", equip:["sw","ha","sh","ac"], lineage:"warrior", mod:{def:1.8, mag:1.2}, reqEl:['light'] },
    sage:      { name:"賢者",    tier:3, type:"mag", atkType:"mag", curve:"late", equip:["st","ro","ac"], lineage:"magic", mod:{mag:2.0, int:2.0}, reqEl:['light','earth','water','fire','wind'] },
    assassin:  { name:"暗殺者",tier:3, type:"spd", atkType:"phy", curve:"early", equip:["dg","bow","to","la","ac"], lineage:"shadow", mod:{atk:2.2, agi:1.5}, reqEl:['dark'] },
    dragoon:   { name:"竜騎士", tier:3, type:"phy", atkType:"phy", curve:"late", equip:["sp","ha","la","ac"], lineage:"warrior", mod:{atk:2.0, hp:1.5}, reqEl:['fire'] },
    sniper:    { name:"狙撃手",  tier:3, type:"tec", atkType:"phy", curve:"avg", equip:["gun","la","to","ac"], lineage:"tech", mod:{atk:2.0, dex:2.0} },
    
    // T4
    hero:      { name:"英雄",    tier:4, type:"phy", atkType:"phy", curve:"late", equip:["sw","ax","sp","ha","la","sh","ac"], lineage:"warrior", mod:{all:1.3, atk:2.5}, reqEl:['light'] },
    cyborg:    { name:"サイボーグ",  tier:4, type:"tnk", atkType:"phy", curve:"avg", equip:["dv","ax","gun","ha","ac"], lineage:"tech", mod:{hp:2.5, def:2.0} },
    demon:     { name:"魔神",   tier:4, type:"mag", atkType:"mag", curve:"late", equip:["st","dv","ro","ac"], lineage:"magic", mod:{mag:3.0, hp:2.0}, reqEl:['dark'] },
    marine:    { name:"宇宙海兵",tier:4, type:"phy", atkType:"phy", curve:"avg", equip:["gun","sw","ha","dv","ac"], lineage:"tech", mod:{atk:2.5, def:1.5} },
    psycho:    { name:"超能力者",  tier:4, type:"mag", atkType:"mag", curve:"late", equip:["dv","ro","ac"], lineage:"magic", mod:{mag:2.5, int:2.5} },
    
    // Special
    jester:    { name:"遊び人",  tier:2, type:"spe", atkType:"phy", curve:"early", equip:["dg","ins","la","ro","ac"], lineage:"special", mod:{luc:3.0, hp:0.5} }
};

const TRAP_DATA = [
    { name: "スパイク床", tier:1, type:"dmg", diff:10, dmg:20, msg:"鋭い棘が飛び出した！" },
    { name: "毒の矢", tier:1, type:"status", status:"psn", diff:15, msg:"毒矢が飛んできた！" },
    { name: "睡眠ガス", tier:2, type:"status", status:"slp", diff:20, msg:"催眠ガスが噴射された！" },
    { name: "落とし穴", tier:3, type:"floor", val:-1, diff:30, dmg:30, msg:"床が抜け落ちた！" }
];

const ITEM_TEMPLATES = {
    w1: { name:"錆びた剣", kind:"sw", type:"weapon", slot:"main_hand", base:{atk:3}, tier:1 },
    w2: { name:"鉄の剣", kind:"sw", type:"weapon", slot:"main_hand", base:{atk:8}, tier:1 },
    w3: { name:"鋼の斧", kind:"ax", type:"weapon", slot:"main_hand", base:{atk:15, agi:-2}, tier:2, req:{atk:20} }, // Req Str
    w4: { name:"ビームサーベル", kind:"sw", type:"weapon", slot:"main_hand", base:{atk:45, int:5}, tier:4 },
    w5: { name:"ウォーハンマー", kind:"ax", type:"weapon", slot:"main_hand", base:{atk:25, agi:-5}, tier:3, req:{atk:40} },
    st1: { name:"樫の杖", kind:"st", type:"weapon", slot:"main_hand", base:{mag:5}, tier:1 },
    st2: { name:"ルーンスタッフ", kind:"st", type:"weapon", slot:"main_hand", base:{mag:15}, tier:2 },
    kn1: { name:"レザーナックル", kind:"kn", type:"weapon", slot:"main_hand", base:{atk:5, agi:2}, tier:1 },
    
    a1: { name:"ボロ服", kind:"la", type:"armor", slot:"body", base:{def:1}, tier:1 },
    a2: { name:"革の鎧", kind:"la", type:"armor", slot:"body", base:{def:5}, tier:1 },
    a3: { name:"プレートメイル", kind:"ha", type:"armor", slot:"body", base:{def:15, agi:-3}, tier:2, req:{def:20} }, // Req VIT
    a4: { name:"ナノスーツ", kind:"la", type:"armor", slot:"body", base:{def:30, hp:50}, tier:4 },
    ro1: { name:"ローブ", kind:"ro", type:"armor", slot:"body", base:{def:2, mag:2}, tier:1 },
    
    ac1: { name:"リング", kind:"ac", type:"accessory", slot:"accessory", base:{luc:2}, tier:1 }
};

const AFFIX_DATA = [
    { name:"錆びた", tier:1, type:"bad", stats:{atk:-3, def:-1}, w:30 },
    { name:"鋭利な", tier:1, type:"good", stats:{atk:3}, w:40 },
    { name:"英雄の", tier:4, type:"legend", stats:{all:5, atk:20}, w:5 }
];

const ENEMY_BASE = [
    { name:"スライム", hp:20, atk:5, def:2, exp:10, gold:5, elem: 'water' },
    { name:"ネズミ", hp:15, atk:7, def:1, exp:12, gold:7, elem: 'earth' },
    { name:"ゴブリン", hp:30, atk:8, def:3, exp:15, gold:10, elem: 'earth' },
    { name:"オーク", hp:60, atk:15, def:5, exp:25, gold:20, elem: 'fire' },
    { name:"ゴーレム", hp:150, atk:30, def:20, exp:80, gold:50, elem: 'earth' },
    { name:"ウィルオウィスプ", hp:40, atk:25, def:0, exp:40, gold:30, elem: 'fire' },
    { name:"ドラゴン", hp:500, atk:80, def:30, exp:300, gold:200, elem: 'fire' }
];

const ENEMY_PREFIXES = [
    { name: "狂暴な", mod: { atk: 1.5, exp: 1.5 } },
    { name: "巨大な", mod: { hp: 2.0, atk: 1.2, exp: 2.0 } },
    { name: "神速の", mod: { agi: 2.0, exp: 1.5 } },
    { name: "硬い", mod: { def: 2.0, exp: 1.5 } }
];

const CONFIG = {
    MAX_PARTY: 6,
    BREED_MIN_LV: 30, 
    HIRE_COST: 30, CC_COST: 100,
    MAX_LEVEL: 50,
    BASE_STATS: { hp:50, atk:5, def:5, agi:5, mag:5, int:5, luc:5 },
    FLOOR_STEP_MAX: 30
};

// --- 3. LOGIC ---

const LootSystem = {
    generate(floor) {
        if (Math.random() > (0.05 + floor * 0.005)) return null;
        const maxTier = Math.min(5, Math.ceil(floor / 5));
        const templates = Object.values(ITEM_TEMPLATES).filter(t => t.tier <= maxTier);
        if(templates.length === 0) return null;
        const tpl = templates[Math.floor(Math.random() * templates.length)];

        let rarity = 2; 
        const rRoll = Math.random() + (floor * 0.01);
        if (rRoll > 0.95) rarity = 5; else if (rRoll > 0.85) rarity = 4; else if (rRoll > 0.60) rarity = 3; else if (rRoll < 0.20) rarity = 1;
        rarity = Math.min(rarity, maxTier + 2);

        let item = { 
            uid: Math.random().toString(36).substr(2), 
            name: tpl.name, kind: tpl.kind, type: tpl.type, slot: tpl.slot, 
            stats: { ...tpl.base }, rarity: rarity, req: tpl.req 
        };

        if (rarity !== 2) {
            const pool = AFFIX_DATA.filter(a => rarity === 1 ? a.type === "bad" : a.tier <= rarity - 1);
            if (pool.length > 0) {
                const affix = pool[Math.floor(Math.random() * pool.length)];
                item.name = `${affix.name}${item.name}`;
                for(let k in affix.stats) {
                    if(k === 'all') ['atk','def','agi','mag','int','luc'].forEach(s => item.stats[s] = (item.stats[s]||0) + affix.stats.all);
                    else item.stats[k] = (item.stats[k]||0) + affix.stats[k];
                }
            }
        }
        return item;
    }
};

class Character {
    constructor(jobKey, parents=null, fromLoad=null) {
        if(fromLoad) {
            Object.assign(this, fromLoad);
            this.migrate(); // データの補正を行う
            return;
        }

        this.id = Math.random().toString(36).substr(2, 9);
        this.jobKey = jobKey;
        this.name = this.genName();
        this.level = 1;
        this.exp = 0;
        this.maxExp = 100;
        this.generation = parents ? Math.max(parents[0].generation, parents[1].generation)+1 : 1;
        
        const pKeys = Object.keys(PERSONALITY_DATA);
        this.personality = pKeys[Math.floor(Math.random()*pKeys.length)];
        this.skills = [];
        this.elements = parents ? this.inheritElements(parents[0], parents[1]) : this.genElements();
        this.bonusStats = {}; 
        this.equipment = { main_hand: null, off_hand: null, head: null, body: null, accessory: null };
        this.status = {};
        
        this.baseStats = {};
        for(let k in CONFIG.BASE_STATS) {
            let base = CONFIG.BASE_STATS[k];
            if(parents) base = (parents[0].baseStats[k] + parents[1].baseStats[k]) / 2 * 1.1;
            this.baseStats[k] = Math.floor(base * (0.9 + Math.random()*0.2));
            this.bonusStats[k] = 0;
        }
        this.hp = this.totalStats.hp;
    }

    // データ補正用メソッド (Migration)
    migrate() {
        if (!this.elements) this.elements = this.genElements();
        if (!this.skills) this.skills = [];
        if (!this.equipment) this.equipment = { main_hand: null, off_hand: null, head: null, body: null, accessory: null };
        if (!this.bonusStats) this.bonusStats = {};
        if (!this.baseStats) {
             // Emergency base stats
             this.baseStats = {};
             for(let k in CONFIG.BASE_STATS) this.baseStats[k] = CONFIG.BASE_STATS[k];
        }
    }

    genName() {
        const n = ["アレク","ベル","シド","ダン","イヴ","フェイ","ジン","ハル","イアン","ジェイ","カイ","レオ"];
        return n[Math.floor(Math.random()*n.length)] + Math.floor(Math.random()*99);
    }

    genElements() {
        if(Math.random() < 0.3) {
            const keys = Object.keys(ELEMENTS);
            return [keys[Math.floor(Math.random() * keys.length)]];
        }
        return [];
    }

    inheritElements(p1, p2) {
        const pool = [...new Set([...p1.elements, ...p2.elements])];
        if(pool.length === 0) return [];
        let guarantee = Math.max(1, Math.floor((p1.elements.length + p2.elements.length) / 2));
        guarantee = Math.min(guarantee, pool.length);
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const childEls = pool.slice(0, guarantee);
        for(let i = guarantee; i < pool.length; i++) {
            let chance = 0.2 / Math.pow(2, childEls.length);
            if(Math.random() < chance) childEls.push(pool[i]);
        }
        return childEls;
    }

    get job() { return JOB_DATA[this.jobKey]; }
    get breedCost() { return 100 + (this.level * 5); }

    get totalStats() {
        let s = {};
        let mod = this.job.mod || {};
        let lineage = LINEAGE[this.job.lineage];
        let pers = PERSONALITY_DATA[this.personality] || {};

        let curveMult = 1.0;
        let progress = this.level / CONFIG.MAX_LEVEL;
        
        if (this.job.curve === 'early') curveMult = 1.5 - progress; 
        else if (this.job.curve === 'late') curveMult = 0.5 + progress;

        for(let k in CONFIG.BASE_STATS) {
            let val = (this.baseStats[k] || 10) + (this.bonusStats[k] || 0);
            let growthBase = (CONFIG.BASE_STATS[k] * 0.2); 
            let multipliers = (lineage[k] || 1.0) * (mod[k] || mod.all || 1.0) * (pers[k] || 1.0);
            let gainedStats = growthBase * multipliers * (this.level - 1) * curveMult;
            val += gainedStats;
            s[k] = Math.floor(val);
        }
        for(let slot in this.equipment) {
            let item = this.equipment[slot];
            if(item) { for(let k in item.stats) s[k] = (s[k]||0) + item.stats[k]; }
        }
        return s;
    }

    get battleStats() {
        const s = this.totalStats;
        const isMag = this.job.atkType === 'mag';
        let pAtk = s.atk; 
        let mAtk = s.mag; 
        let def = s.def; 
        let mDef = s.int;
        return { pAtk: pAtk, mAtk: mAtk, def: def, mDef: mDef, hit: s.agi * 1.5 + s.luc * 0.5, crit: s.luc * 0.2 + (s.dex || 0) * 0.1, isMag: isMag };
    }

    canEquip(item) {
        if (!this.job.equip.includes(item.kind) && item.kind !== 'ac') return { ok: false, reason: "職業不可" };
        if (item.req) {
            const s = this.totalStats;
            for(let key in item.req) {
                if (s[key] < item.req[key]) return { ok: false, reason: `${key.toUpperCase()}不足` };
            }
        }
        return { ok: true };
    }

    equip(item) {
        const check = this.canEquip(item);
        if (!check.ok) { return false; } 
        if(this.equipment[item.slot]) Game.inventory.push(this.equipment[item.slot]);
        this.equipment[item.slot] = item;
        this.hp = Math.min(this.hp, this.totalStats.hp);
        Game.save();
        return true;
    }
    unequip(slot) {
        if(this.equipment[slot]) {
            Game.inventory.push(this.equipment[slot]);
            this.equipment[slot] = null;
            Game.save();
        }
    }

    getItemScore(item) {
        if (!item) return 0;
        if (!this.canEquip(item).ok) return -1;
        let s = 0;
        if (this.job.atkType === 'mag') {
            s += (item.stats.mag || 0) * 1.5;
            s += (item.stats.int || 0) * 1.0;
            s += (item.stats.atk || 0) * 0.2;
        } else {
            s += (item.stats.atk || 0) * 1.5;
            s += (item.stats.def || 0) * 0.5;
            s += (item.stats.mag || 0) * 0.1;
        }
        s += (item.stats.def || 0) * 1.0;
        s += (item.stats.hp || 0) * 0.2;
        s += (item.stats.agi || 0) * 0.8;
        s += (item.stats.luc || 0) * 0.5;
        return s;
    }

    gainExp(v) {
        if(this.level >= CONFIG.MAX_LEVEL) return null;
        this.exp += Math.floor(v);
        if(this.exp >= this.maxExp) {
            let oldStats = this.totalStats;
            this.level++;
            this.exp -= this.maxExp;
            this.maxExp = Math.floor(this.maxExp * 1.2);
            let newStats = this.totalStats;
            this.hp = this.totalStats.hp;
            let diffs = [];
            for(let k in oldStats) {
                let d = newStats[k] - oldStats[k];
                if(d > 0) diffs.push(`${k.toUpperCase()}+${d}`);
            }
            if(this.level % 5 === 0 && this.skills.length < 10) this.learnSkill();
            return diffs;
        }
        return null;
    }

    learnSkill() {
        let type = this.job.type === 'tnk' ? 'tnk' : (this.job.type === 'spd' ? 'spd' : (this.job.type === 'mag' ? 'mag' : (this.job.type === 'sup' ? 'sup' : 'phy')));
        let pool = SKILL_POOL[type] || SKILL_POOL['phy'];
        for(let s of pool) {
            if(!this.skills.includes(s)) {
                this.skills.push(s);
                return s;
            }
        }
        return null;
    }

    classChange(newJobKey) {
        let s = this.totalStats;
        for(let k in CONFIG.BASE_STATS) this.bonusStats[k] = (this.bonusStats[k] || 0) + Math.floor(s[k] * 0.1);
        this.jobKey = newJobKey;
        this.level = 1; this.maxExp = 100; this.hp = this.totalStats.hp;
        Game.save();
    }
}

// --- GAME ENGINE ---

const Game = {
    helix: 100, floor: 1, maxFloor: 1, floorProgress: 0,
    party: [], roster: [], inventory: [],
    exploring: false, timer: null,
    currentEnemy: null,

    // SAVE KEY CONSTANT (Unified)
    SAVE_KEY: 'genetic_rogue_save_unified',

    init() {
        // Try unified key first
        if(localStorage.getItem(this.SAVE_KEY)) {
            this.load(this.SAVE_KEY);
        } 
        // Migration from v11
        else if(localStorage.getItem('genetic_rogue_v11_save')) {
            console.log("Migrating from v11...");
            this.load('genetic_rogue_v11_save');
            this.save(); // Save to new key immediately
        }
        // Migration from v10
        else if(localStorage.getItem('genetic_rogue_v10_save')) {
            console.log("Migrating from v10...");
            this.load('genetic_rogue_v10_save');
            this.save();
        }
        else {
            ["warrior","thief","priest"].forEach(j => this.roster.push(new Character(j)));
            this.roster.forEach(c => this.party.push(c));
            let starter = LootSystem.generate(1);
            if(!starter) starter = { uid: "starter", name:"粗末な剣", kind:"sw", type:"weapon", slot:"main_hand", stats:{atk:2}, rarity:1 };
            this.inventory.push(starter);
            this.save();
        }
        UI.init();
        UI.updateAll();
        UI.log("Genetic Rogue Ver.11.3 起動。", "log-sys");
    },

    save(manual=false) {
        const data = {
            helix: this.helix, maxFloor: this.maxFloor, inventory: this.inventory,
            roster: this.roster, partyIds: this.party.map(c => c.id),
            version: 11.3
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
        if(manual) UI.log("データをセーブしました。", "log-sys");
    },

    load(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if(!data) return;
            this.helix = data.helix || 0; 
            this.maxFloor = data.maxFloor || 1; 
            this.inventory = data.inventory || [];
            
            // Hydrate Characters with Migration
            this.roster = (data.roster || []).map(d => new Character(null, null, d));
            this.party = [];
            (data.partyIds || []).forEach(id => {
                const c = this.roster.find(x => x.id === id);
                if(c) this.party.push(c);
            });
            UI.log("データをロードしました。", "log-sys");
        } catch(e) {
            console.error("Save data corrupt", e);
            // Don't alert, just start fresh if corrupt to avoid loops, or let init handle fallback
        }
    },

    resetSave() {
        if(confirm("本当に全データを削除しますか？")) {
            localStorage.removeItem(this.SAVE_KEY);
            localStorage.removeItem('genetic_rogue_v11_save'); // Clean old
            localStorage.removeItem('genetic_rogue_v10_save'); // Clean old
            location.reload();
        }
    },

    explore(startFloor) {
        if(this.party.length===0) return alert("パーティがいません");
        if(this.party.every(c => c.hp <= 0)) {
            this.party.forEach(c => c.hp = c.totalStats.hp);
            UI.updateAll();
        }
        
        this.floor = parseInt(startFloor);
        this.floorProgress = 0;
        this.exploring = true;
        this.currentEnemy = null; // 安全のためリセット
        UI.toggle(true);
        UI.log(`階層 ${this.floor} の探索を開始します`);
        this.timer = setInterval(() => this.tick(), 1000);
    },

    stop() {
        this.exploring = false;
        clearInterval(this.timer);
        this.party.forEach(c => { 
            c.hp = c.totalStats.hp;
            c.status = {}; 
        });
        this.currentEnemy = null; // リセット
        this.save();
        UI.toggle(false);
        UI.updateAll();
        UI.log("拠点に帰還しました。全メンバーのHPを全回復しました。");
    },

    tick() {
        if(this.party.every(c => c.hp <= 0)) {
            this.exploring = false;
            clearInterval(this.timer);
            UI.log("全滅しました... 最高到達階層リセット。", "log-defeat");
            this.maxFloor = 1; this.floor = 1;
            this.party.forEach(c => { c.hp = c.totalStats.hp; c.status = {}; });
            this.currentEnemy = null;
            this.save();
            UI.toggle(false);
            UI.updateAll();
            return;
        }

        // 状態異常処理
        this.party.forEach(c => {
            if(c.hp > 0 && c.status.psn) { c.hp -= Math.ceil(c.totalStats.hp * 0.05); c.status.psn--; if(c.status.psn<=0) delete c.status.psn; }
            if(c.status.slp) { c.status.slp--; if(c.status.slp<=0) delete c.status.slp; }
        });

        // 戦闘中は歩数を進めない
        if (this.currentEnemy) {
            this.combat();
        } else {
            this.floorProgress++;
            if(this.floorProgress > CONFIG.FLOOR_STEP_MAX) {
                this.floor++;
                this.floorProgress = 0;
                if(this.floor > this.maxFloor) this.maxFloor = this.floor;
                UI.log(`>>> 階層 ${this.floor} へ進んだ`, "log-victory");
            }
            UI.updateHeader();

            const r = Math.random();
            if (r < 0.2) this.trap();
            else if (r < 0.8) this.combat(); // 新規戦闘
            else this.event();
        }

        UI.renderParty();
    },

    autoEquip(item) {
        if(!item) return;
        let equippedBy = null;
        for(let c of this.party) {
            if(c.canEquip(item).ok) {
                let currentItem = c.equipment[item.slot];
                let currentScore = currentItem ? c.getItemScore(currentItem) : 0;
                let newScore = c.getItemScore(item);
                if(newScore > currentScore) {
                    c.equip(item);
                    equippedBy = c.name;
                    break;
                }
            }
        }
        if(equippedBy) {
            UI.log(`[自動装備] ${equippedBy} は ${item.name} を装備！`, "log-equip");
        } else {
            this.inventory.push(item);
            UI.log(`戦利品: ${item.name}`, "log-item");
        }
    },

    trap() {
        const activeParty = this.party.filter(c => c.hp > 0 && !c.status.slp);
        if(activeParty.length === 0) return;
        const tier = Math.min(4, Math.ceil(this.floor / 5));
        const pool = TRAP_DATA.filter(t => t.tier <= tier);
        const trap = pool[Math.floor(Math.random() * pool.length)];
        UI.log(`！ ${trap.msg}`, "log-trap");
        
        const detector = activeParty.reduce((p, c) => {
            const s = c.totalStats;
            const val = Math.max(s.int, s.agi);
            return (val > p.val) ? {char:c, val:val} : p;
        }, {val:0});
        if (detector.val < trap.diff) { this.triggerTrap(trap); return; }
        const disarmer = activeParty.reduce((p, c) => {
            const s = c.totalStats;
            let val = Math.max(s.dex||0, s.agi, s.luc);
            if (['thief','ninja','hunter','assassin'].includes(c.jobKey)) val += 20; 
            return (val > p.val) ? {char:c, val:val} : p;
        }, {val:0});
        if ((disarmer.val + Math.random()*10) >= trap.diff) { 
            UI.log(`${disarmer.char.name}が解除成功！`, "log-trap-ok"); 
            let diff = disarmer.char.gainExp(5);
            if(diff) UI.log(`${disarmer.char.name} LvUp! [${diff.join(', ')}]`, "log-lvlup");
        } 
        else { UI.log(`${disarmer.char.name}は失敗した！`, "log-trap"); this.triggerTrap(trap); }
    },

    triggerTrap(trap) {
        if(trap.type === "dmg") {
            this.party.forEach(c => { if(c.hp>0){ c.hp-=trap.dmg; UI.log(`${c.name}に${trap.dmg}ダメ`,"log-dmg"); } });
        } else if (trap.type === "status") {
            this.party.forEach(c => { if(c.hp>0){ c.status[trap.status]=3; UI.log(`${c.name}は${trap.status==='psn'?'毒':'眠り'}を受けた`,"log-trap"); } });
        } else if (trap.type === "floor") {
            this.floor = Math.max(1, this.floor + trap.val); this.floorProgress = 0; UI.log(`階層${this.floor}へ落ちた！`,"log-trap");
        }
    },

    combat(isForce=false) {
        const activeParty = this.party.filter(c => c.hp > 0);
        if(activeParty.length === 0) return;
        
        let enemy;

        if (this.currentEnemy) {
            enemy = this.currentEnemy;
        } else {
            // 新規敵生成
            let scale = 1 + (this.floor - 1) * 0.4;
            let isElite = !isForce && (this.floor % 5 === 0);
            if(isElite) scale *= 1.5;
            
            let eBase = ENEMY_BASE[Math.min(ENEMY_BASE.length-1, Math.floor((this.floor-1)/2))];
            let prefix = isElite ? ENEMY_PREFIXES[Math.floor(Math.random()*ENEMY_PREFIXES.length)] : null;
            
            enemy = {
                name: (prefix ? prefix.name : "") + eBase.name,
                hp: Math.floor(eBase.hp * scale * (prefix ? prefix.mod.hp || 1 : 1)),
                atk: Math.floor(eBase.atk * scale * (prefix ? prefix.mod.atk || 1 : 1)),
                def: Math.floor(eBase.def * scale * (prefix ? prefix.mod.def || 1 : 1)), 
                agi: Math.floor(scale * 10 * (prefix ? prefix.mod.agi || 1 : 1)), 
                exp: Math.floor(eBase.exp * scale * (prefix ? prefix.mod.exp || 1 : 1)),
                gold: Math.floor(eBase.gold * scale),
                elem: eBase.elem
            };
            this.currentEnemy = enemy; // 戦闘開始
            
            let eElemName = ELEMENTS[enemy.elem] ? ELEMENTS[enemy.elem].name : "無";
            UI.log(`遭遇: ${enemy.name} (${eElemName}) HP:${enemy.hp}`, isElite?"log-elite":"log-combat");
        }

        // プレイヤー攻撃処理
        activeParty.forEach(c => {
            if(enemy.hp <= 0) return;
            if(c.status.slp) return;
            
            const stats = c.battleStats;
            let dmg = 0;
            let hitChance = 0.8 + (stats.hit / (enemy.agi * 2));
            if (Math.random() > hitChance) {
                UI.log(`${c.name}の攻撃は外れた`, "log-dmg");
                return;
            }

            if (stats.isMag) {
                dmg = Math.max(1, stats.mAtk - (enemy.def * 0.8)); 
            } else {
                dmg = Math.max(1, stats.pAtk - enemy.def);
            }
            
            dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));

            let mod = 1.0;
            if (enemy.elem && c.elements.length > 0) {
                let bestMod = 1.0;
                c.elements.forEach(el => {
                    if (ELEMENT_CHART[el].strong === enemy.elem) bestMod = 1.5;
                    else if (ELEMENT_CHART[el].weak === enemy.elem && bestMod < 1.0) bestMod = 0.5;
                });
                mod = bestMod;
            }
            dmg = Math.floor(dmg * mod);
            let weakLog = mod > 1.0 ? "(弱点!)" : (mod < 1.0 ? "(半減)" : "");

            if(Math.random() < (stats.crit / 100)) { dmg *= 2; UI.log("クリティカル！", "stat-bonus"); }
            
            enemy.hp -= dmg;
            UI.log(`${c.name}の攻撃${weakLog} -> ${dmg} ダメージ`);
        });

        // 敵のターンまたは戦闘終了判定
        if(enemy.hp > 0) {
            let target = activeParty[Math.floor(Math.random() * activeParty.length)];
            let s = target.battleStats;
            let dmg = Math.max(1, Math.floor(enemy.atk - s.def));
            target.hp -= dmg;
            UI.log(`${target.name}は ${dmg} ダメージ受けた`, "log-dmg");
            if(target.hp <= 0) UI.log(`${target.name} は倒れた...`, "log-defeat");
        } else {
            UI.log(`勝利！ +${enemy.gold}G`);
            this.helix += enemy.gold;
            this.party.forEach(c => { 
                if(c.hp>0) {
                    let diff = c.gainExp(enemy.exp);
                    if(diff) {
                        UI.log(`${c.name} LvUp! [${diff.join(', ')}]`, "log-lvlup");
                    }
                } 
            });
            let item = LootSystem.generate(this.floor);
            this.autoEquip(item);
            this.currentEnemy = null; // 戦闘終了
        }
    },

    event() { let g = 5 + this.floor; this.helix += g; UI.log(`${g} Helixを発見`); },

    hire(targetJob) {
        if(this.helix < CONFIG.HIRE_COST) return;
        this.helix -= CONFIG.HIRE_COST;
        let key = targetJob;
        if (!key) {
            let keys = Object.keys(JOB_DATA).filter(k=>JOB_DATA[k].tier===1);
            key = keys[Math.floor(Math.random()*keys.length)];
        }
        let c = new Character(key);
        this.roster.push(c);
        UI.log(`雇用: ${c.name}`);
        this.save();
        UI.updateAll();
    },

    breed(id1, id2) {
        let p1 = this.roster.find(c=>c.id===id1);
        let p2 = this.roster.find(c=>c.id===id2);
        let cost = p1.breedCost + p2.breedCost;
        if(this.helix < cost) return alert("Helix不足");
        if(p1.level < CONFIG.BREED_MIN_LV || p2.level < CONFIG.BREED_MIN_LV) return alert("親はLv30以上必要です");
        this.helix -= cost;
        let c = new Character(p1.jobKey, [p1,p2]);
        this.roster.push(c);
        UI.log(`誕生: ${c.name} (属性:${c.elements.map(e=>ELEMENTS[e].name).join(',')})`);
        this.save();
        UI.updateAll();
    },
    
    classChange(charId, jobKey) {
        if(this.helix < CONFIG.CC_COST) return;
        let c = this.roster.find(x=>x.id===charId);
        if(c.level < 10) return alert("Lv10以上必要です");
        this.helix -= CONFIG.CC_COST;
        c.classChange(jobKey);
        UI.log(`${c.name} は ${JOB_DATA[jobKey].name} に転職した！`);
        this.save();
        UI.updateAll();
    }
};

// --- UI CONTROLLER ---
const UI = {
    sel: [], equipChar: null, ccChar: null,

    init() {
        document.getElementById('btn-explore').onclick = () => Game.explore(document.getElementById('floor-select').value);
        document.getElementById('btn-return').onclick = () => Game.stop();
        document.getElementById('btn-lab').onclick = () => this.openModal('modal-lab', this.renderLabRoster);
        document.getElementById('btn-inv').onclick = () => this.openModal('modal-inv', this.renderInv);
        document.getElementById('btn-settings').onclick = () => this.openModal('modal-settings');
        document.getElementById('btn-help').onclick = () => this.openModal('modal-rules');
        document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display='none'));

        document.getElementById('act-breed').onclick = () => { if(this.sel.length===2){ Game.breed(this.sel[0], this.sel[1]); this.sel=[]; this.renderLabRoster(); }};
        document.getElementById('act-party').onclick = () => { this.sel.forEach(id => {
            let c = Game.roster.find(x=>x.id===id);
            let idx = Game.party.indexOf(c);
            idx>-1 ? Game.party.splice(idx,1) : (Game.party.length<CONFIG.MAX_PARTY && Game.party.push(c));
        }); this.sel=[]; this.renderLabRoster(); };

        document.getElementById('hire-cost').innerText = CONFIG.HIRE_COST;
    },

    updateAll() { this.updateHeader(); this.renderParty(); },
    updateHeader() {
        document.getElementById('helix-display').innerText = Game.helix;
        document.getElementById('floor-display').innerText = Game.floor;
        document.getElementById('floor-progress').innerText = `(${Game.floorProgress}/${CONFIG.FLOOR_STEP_MAX})`;
        document.getElementById('max-floor').innerText = Game.maxReachedFloor || Game.maxFloor;
        const sel = document.getElementById('floor-select');
        const currentOpt = parseInt(sel.value);
        sel.innerHTML = "";
        for(let i=1; i<=Game.maxFloor; i+=5) {
            let opt = document.createElement('option');
            opt.value = i; opt.innerText = `${i}F`;
            if(i === 1 || i === currentOpt) opt.selected = true;
            sel.appendChild(opt);
        }
        if(Game.maxFloor % 5 !== 1) {
            let opt = document.createElement('option');
            opt.value = Game.maxFloor; opt.innerText = `${Game.maxFloor}F`;
            sel.appendChild(opt);
        }
    },
    toggle(on) {
        document.getElementById('btn-explore').disabled = on;
        document.getElementById('btn-return').disabled = !on;
        document.getElementById('floor-select').disabled = on;
    },
    log(msg, type='') {
        let d = document.getElementById('log-list');
        d.innerHTML += `<div class="log-entry ${type}">${msg}</div>`;
        document.getElementById('log-panel').scrollTop = 99999;
    },

    renderParty() {
        const d = document.getElementById('party-container'); d.innerHTML = "";
        Game.party.forEach(c => {
            let s = c.totalStats;
            let hpP = (c.hp / s.hp) * 100;
            if(c.hp <= 0) hpP = 0;
            let expP = (c.exp / c.maxExp) * 100;
            
            let badges = "";
            if(c.status.psn) badges += `<span class="status-badge st-psn">毒</span>`;
            if(c.status.slp) badges += `<span class="status-badge st-slp">眠</span>`;

            let elems = c.elements.map(e => `<span class="elem-icon el-${e}" title="${ELEMENTS[e].name}"></span>`).join('');

            let items = "";
            for(let k in c.equipment) {
                if(c.equipment[k]) items += `<div class="equip-slot equip-active rar-${c.equipment[k].rarity}">${k.substr(0,2)}: ${c.equipment[k].name}</div>`;
                else items += `<div class="equip-slot">${k.substr(0,2)}: -</div>`;
            }
            let skills = c.skills.map(sk => `<span class="skill-tag">${sk}</span>`).join('');

            const card = document.createElement('div');
            card.className = `char-card ${c.hp<=0 ? 'dead' : ''}`;
            card.style.borderLeft = `3px solid ${LINEAGE[c.job.lineage].color || '#fff'}`;
            card.innerHTML = `
                <div class="char-header">
                    <span>${badges}${c.name} ${elems}</span> <span class="job-label">${c.job.name} Lv${c.level}</span>
                </div>
                <div class="personality-label">${c.personality}</div>
                <div class="bar-container">
                    <div class="bar-row">
                        <span style="width:20px;">HP</span>
                        <div class="bar-wrap"><div class="bar-val hp-bar" style="width:${hpP}%"></div></div>
                    </div>
                    <div class="bar-row">
                        <span style="width:20px;">EXP</span>
                        <div class="bar-wrap"><div class="bar-val exp-bar" style="width:${expP}%"></div></div>
                    </div>
                </div>
                <div class="stat-grid">
                    <div class="stat-val">STR: <span>${s.atk}</span></div>
                    <div class="stat-val">VIT: <span>${s.def}</span></div>
                    <div class="stat-val">MAG: <span>${s.mag}</span></div>
                    <div class="stat-val">HP: <span>${c.hp}/${s.hp}</span></div>
                </div>
                <div class="skill-list">${skills}</div>
                <div class="equip-grid">${items}</div>
            `;
            card.onclick = (e) => {
                UI.showCharDetail(c);
            };
            d.appendChild(card);
        });
    },

    openModal(id, fn) { document.getElementById(id).style.display = 'flex'; this.sel = []; if(fn) fn.call(this); },
    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById('tab-'+tabName).style.display = 'block';
        event.target.classList.add('active');
        if(tabName==='lab-roster') this.renderLabRoster();
        if(tabName==='lab-hire') this.renderGuild();
        if(tabName==='lab-class') this.renderClassChange();
    },

    renderLabRoster() {
        const d = document.getElementById('lab-list'); d.innerHTML = "";
        Game.roster.forEach(c => {
            let sel = this.sel.includes(c.id);
            let inPt = Game.party.includes(c);
            let el = document.createElement('div');
            el.className = `list-item ${sel?'selected':''}`;
            if(inPt) el.style.borderRight = "3px solid var(--accent-color)";
            
            let elems = c.elements.map(e => `<span class="elem-icon el-${e}"></span>`).join('');
            
            el.innerHTML = `
                <div style="font-weight:bold;">${c.name} ${elems}</div>
                <div style="font-size:10px; color:#888;">${c.job.name} Lv${c.level}</div>
            `;
            el.onclick = () => {
                sel ? this.sel=this.sel.filter(x=>x!==c.id) : this.sel.push(c.id);
                this.renderLabRoster();
                const btn = document.getElementById('act-breed');
                if(this.sel.length === 2) {
                    let p1 = Game.roster.find(x=>x.id===this.sel[0]);
                    let p2 = Game.roster.find(x=>x.id===this.sel[1]);
                    btn.innerText = `配合 (${p1.breedCost + p2.breedCost}G)`;
                    btn.disabled = false;
                } else {
                    btn.innerText = "配合";
                    btn.disabled = true;
                }
                document.getElementById('act-party').disabled = this.sel.length===0;
            };
            d.appendChild(el);
        });
    },
    renderGuild() {
        const d = document.getElementById('guild-list'); d.innerHTML = "";
        Object.keys(JOB_DATA).filter(k=>JOB_DATA[k].tier===1).forEach(k => {
            let job = JOB_DATA[k];
            let el = document.createElement('div');
            el.className = 'list-item';
            el.innerHTML = `<div>${job.name}</div><div style="font-size:10px;">${job.type}</div>`;
            el.onclick = () => { Game.hire(k); this.updateAll(); };
            d.appendChild(el);
        });
    },
    renderClassChange() {
        const cList = document.getElementById('cc-char-list'); cList.innerHTML = "";
        Game.roster.forEach(c => {
            let el = document.createElement('div');
            el.className = `list-item ${this.ccChar===c?'selected':''}`;
            el.innerHTML = `<div>${c.name}</div><div style="font-size:10px;">Lv${c.level} ${c.job.name}</div>`;
            el.onclick = () => { this.ccChar = c; this.renderClassChange(); };
            cList.appendChild(el);
        });
        const jList = document.getElementById('cc-job-list'); jList.innerHTML = "";
        if(!this.ccChar) { jList.innerHTML = "キャラを選択"; return; }
        Object.keys(JOB_DATA).forEach(k => {
            let job = JOB_DATA[k];
            let el = document.createElement('div');
            el.className = 'list-item';
            
            let lvReq = this.ccChar.level >= 10;
            let elReq = true;
            if(job.reqEl) {
                elReq = job.reqEl.some(r => this.ccChar.elements.includes(r));
            }
            let costReq = Game.helix >= CONFIG.CC_COST;
            
            let can = lvReq && elReq && costReq;
            if(!can) el.classList.add('disabled');
            
            let reqText = job.reqEl ? `[属性:${job.reqEl.map(e=>ELEMENTS[e].name).join(',')}]` : "";
            
            el.innerHTML = `<div>${job.name} ${reqText}</div><div style="font-size:10px;">Tier ${job.tier}</div>`;
            if(can) el.onclick = () => { Game.classChange(this.ccChar.id, k); this.renderClassChange(); };
            jList.appendChild(el);
        });
    },
    renderInv() {
        const cList = document.getElementById('equip-char-list'); cList.innerHTML = "";
        Game.party.forEach(c => {
            let el = document.createElement('div');
            el.className = `list-item ${this.equipChar===c?'selected':''}`;
            el.innerHTML = `<div>${c.name}</div><div style="font-size:10px;">${c.job.name}</div>`;
            el.onclick = () => { this.equipChar = c; this.renderInv(); };
            cList.appendChild(el);
        });
        const iList = document.getElementById('inv-list'); iList.innerHTML = "";
        const head = document.getElementById('inv-header');
        if(!this.equipChar) { iList.innerHTML="キャラを選択してください"; return; }
        
        let eqHtml = "";
        for(let slot in this.equipChar.equipment) {
            let item = this.equipChar.equipment[slot];
            eqHtml += `<div style="font-size:11px; margin-bottom:2px;"><span style="color:#666; display:inline-block; width:60px;">${slot.substr(0,4)}:</span>${item ? `<span class="rar-${item.rarity}">${item.name}</span> <button style="font-size:9px;" onclick="UI.doUnequip('${slot}')">外す</button>` : '空'}</div>`;
        }
        head.innerHTML = eqHtml;
        if(Game.inventory.length===0) iList.innerHTML = "アイテムがありません";
        Game.inventory.forEach((item, idx) => {
            if (!item) return; 
            
            const check = this.equipChar.canEquip(item);
            const err = check.ok ? "" : `<span class="err-msg">${check.reason}</span>`;
            const cls = check.ok ? "" : "disabled";

            let el = document.createElement('div');
            el.className = `list-item ${cls}`;
            let stats = Object.keys(item.stats).map(k=>`${k}:${item.stats[k]}`).join(' ');
            el.innerHTML = `<div class="rar-${item.rarity}" style="font-weight:bold;">${item.name}</div><div style="font-size:10px; color:#888;">${item.type} [${item.slot}]</div><div style="font-size:10px;">${stats}</div>${err}`;
            if(check.ok) {
                el.onclick = () => { 
                    if(this.equipChar.equip(item)) {
                        Game.inventory.splice(idx,1); 
                        this.renderInv(); 
                        this.renderParty();
                        if(document.getElementById('modal-char-detail').style.display === 'flex') {
                            this.showCharDetail(this.equipChar);
                        }
                    }
                };
            }
            iList.appendChild(el);
        });
    },
    doUnequip(slot) { 
        this.equipChar.unequip(slot); 
        this.renderInv(); 
        this.renderParty();
        if(document.getElementById('modal-char-detail').style.display === 'flex') {
            this.showCharDetail(this.equipChar);
        }
    },

    showCharDetail(c) {
        const s = c.totalStats;
        const b = c.battleStats;
        const elems = c.elements.map(e => `<span class="elem-icon el-${e}"></span> ${ELEMENTS[e].name}`).join(', ') || "なし";
        
        const openEquip = () => {
            document.getElementById('modal-char-detail').style.display='none';
            this.equipChar = c;
            this.openModal('modal-inv', this.renderInv);
        };
        window.openEquipFromDetail = openEquip;

        let equipRows = "";
        for(let slot in c.equipment) {
            let item = c.equipment[slot];
            let name = item ? `<span class="rar-${item.rarity}">${item.name}</span>` : "装備なし";
            let stats = item ? Object.keys(item.stats).map(k=>`${k.toUpperCase()}:${item.stats[k]}`).join(' ') : "";
            equipRows += `
            <div class="detail-eq-row">
                <span style="color:#888; font-size:11px; width:80px;">${slot}</span>
                <div>${name} <span style="font-size:10px; color:#aaa; margin-left:5px;">${stats}</span></div>
            </div>`;
        }

        let skills = c.skills.length ? c.skills.map(sk => `<span class="skill-tag" style="font-size:12px; padding:3px 6px;">${sk}</span>`).join(' ') : "なし";

        const content = `
            <div class="detail-header">
                <div class="detail-title">
                    <h2>${c.name}</h2>
                    <div class="detail-meta">${c.job.name} (${c.job.atkType==="mag"?"魔法":"物理"}) Lv.${c.level} | ${c.personality} | 世代:${c.generation}</div>
                </div>
            </div>
            <div class="detail-sections">
                <div>
                    <h4 style="color:#888; border-bottom:1px solid #333;">基礎ステータス</h4>
                    <div class="detail-row"><span class="detail-label">HP</span> <span>${c.hp} / ${s.hp}</span></div>
                    <div class="detail-row"><span class="detail-label">STR (腕力)</span> <span>${s.atk}</span></div>
                    <div class="detail-row"><span class="detail-label">VIT (耐久)</span> <span>${s.def}</span></div>
                    <div class="detail-row"><span class="detail-label">MAG (魔力)</span> <span>${s.mag}</span></div>
                    <div class="detail-row"><span class="detail-label">INT (知力)</span> <span>${s.int}</span></div>
                    <div class="detail-row"><span class="detail-label">AGI (素早)</span> <span>${s.agi}</span></div>
                    <div class="detail-row"><span class="detail-label">LUC (運)</span> <span>${s.luc}</span></div>
                    <div class="detail-row"><span class="detail-label">属性</span> <span>${elems}</span></div>
                    <br>
                    <h4 style="color:#888; border-bottom:1px solid #333;">戦闘パラメータ</h4>
                    <div class="detail-row"><span class="detail-label">物理攻撃力</span> <span>${b.pAtk}</span></div>
                    <div class="detail-row"><span class="detail-label">魔法攻撃力</span> <span>${b.mAtk}</span></div>
                    <div class="detail-row"><span class="detail-label">防御力</span> <span>${b.def}</span></div>
                    <div class="detail-row"><span class="detail-label">命中率</span> <span>${Math.floor(b.hit)}</span></div>
                    <div class="detail-row"><span class="detail-label">クリティカル</span> <span>${Math.floor(b.crit)}%</span></div>
                </div>
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #444;">
                        <h4>装備</h4>
                        <button onclick="openEquipFromDetail()" style="padding:2px 8px; font-size:10px;">変更</button>
                    </div>
                    ${equipRows}
                    <h4 style="margin:15px 0 10px 0; border-bottom:1px solid #444;">習得スキル</h4>
                    <div style="line-height:1.8;">${skills}</div>
                </div>
            </div>
        `;
        document.getElementById('detail-content').innerHTML = content;
        this.openModal('modal-char-detail');
    }
};

window.onload = () => Game.init();
