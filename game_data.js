/**
 * Genetic Rogue Ver.6 - Game Data
 * - Expanded Enemies
 * - Affix Data
 */

// --- 1. JOB DATA (Keep existing) ---
const LINEAGE_TYPES = {
    "warrior": { type: "phy", stats: { hp: 1.2, atk: 1.2, def: 1.0 } },
    "martial": { type: "phy", stats: { hp: 1.3, atk: 1.2, agi: 1.2 } },
    "shadow":  { type: "spd", stats: { agi: 1.4, luc: 1.5, dex: 1.2 } },
    "magic":   { type: "mag", stats: { mag: 1.4, int: 1.2, hp: 0.8 } },
    "holy":    { type: "sup", stats: { def: 1.2, int: 1.3, mag: 1.0 } },
    "monster": { type: "spe", stats: { hp: 1.4, atk: 1.3, luc: 1.1 } },
    "tech":    { type: "tec", stats: { dex: 1.4, int: 1.2, hp: 1.1 } },
    "special": { type: "spe", stats: { luc: 1.6, int: 1.2 } }
};

const JOB_DATA = {
    // 戦士系
    "warrior": { name: "戦士", tier: 1, lineage: "warrior", equip: ["sw", "ax"] },
    "mercenary": { name: "傭兵", tier: 1, lineage: "warrior", equip: ["sw", "sp"] },
    "knight": { name: "騎士", tier: 2, lineage: "warrior", equip: ["sw", "sp"], stats_mod: { def: 1.5 } },
    "gladiator": { name: "重戦士", tier: 2, lineage: "warrior", equip: ["ax"] },
    "paladin": { name: "聖騎士", tier: 3, lineage: "warrior", equip: ["sw"], stats_mod: { def: 1.8, mag: 1.2 } },
    "general": { name: "将軍", tier: 3, lineage: "warrior", equip: ["sw"] },
    "cyborg": { name: "サイボーグ", tier: 4, lineage: "warrior", equip: ["dv", "ax"], stats_mod: { hp: 2.5, def: 2.0 } },
    "war_god": { name: "軍神", tier: 5, lineage: "warrior", equip: ["all"], stats_mod: { hp: 3.0, atk: 3.0 } },
    // 魔法系
    "mage": { name: "魔法使い", tier: 1, lineage: "magic", equip: ["st"] },
    "sorcerer": { name: "魔術師", tier: 2, lineage: "magic", equip: ["st"], stats_mod: { mag: 1.8 } },
    "sage": { name: "賢者", tier: 3, lineage: "magic", equip: ["st"], stats_mod: { mag: 2.0, int: 2.0 } },
    "psionicist": { name: "サイキッカー", tier: 4, lineage: "magic", equip: ["dv"], stats_mod: { mag: 2.4, int: 2.2 } },
    // 影系
    "thief": { name: "盗賊", tier: 1, lineage: "shadow", equip: ["dg"] },
    "ninja": { name: "忍者", tier: 2, lineage: "shadow", equip: ["sw", "dg"], stats_mod: { agi: 1.8 } },
    "sniper": { name: "狙撃手", tier: 3, lineage: "shadow", equip: ["gun"], stats_mod: { dex: 2.5 } },
    "ghost": { name: "ゴースト", tier: 4, lineage: "shadow", equip: ["dv"], stats_mod: { int: 2.5, agi: 2.2 } },
    // 聖職系
    "priest": { name: "僧侶", tier: 1, lineage: "holy", equip: ["st"] },
    "bishop": { name: "司祭", tier: 2, lineage: "holy", equip: ["st"] },
    "angel": { name: "天使", tier: 5, lineage: "holy", equip: ["sp"], stats_mod: { int: 3.0, mag: 2.5 } },
    // 技術系
    "mechanic": { name: "整備士", tier: 1, lineage: "tech", equip: ["ax"] },
    "gunner": { name: "ガンマン", tier: 2, lineage: "tech", equip: ["gun"] },
    "android": { name: "アンドロイド", tier: 4, lineage: "tech", equip: ["dv"], stats_mod: { hp: 2.0, def: 2.0 } },
    // 特殊
    "merchant": { name: "商人", tier: 1, lineage: "special", equip: ["dg"] },
    "ceo": { name: "CEO", tier: 4, lineage: "special", equip: ["dv"], stats_mod: { luc: 2.5 } }
};
// 補完処理
Object.keys(JOB_DATA).forEach(k => {
    if(!JOB_DATA[k].stats_mod) JOB_DATA[k].stats_mod = LINEAGE_TYPES[JOB_DATA[k].lineage].stats;
});

// --- 2. BASE ITEM DATA ---
const ITEM_TEMPLATES = {
    // Weapons
    "w01": { name: "錆びた剣", type: "weapon", slot: "main_hand", base: { atk: 5 }, rar: 1 },
    "w02": { name: "鋼の剣", type: "weapon", slot: "main_hand", base: { atk: 12 }, rar: 2 },
    "w03": { name: "バトルアクス", type: "weapon", slot: "main_hand", base: { atk: 18, agi: -3 }, rar: 2 },
    "w04": { name: "魔導士の杖", type: "weapon", slot: "main_hand", base: { mag: 10, int: 5 }, rar: 2 },
    "w05": { name: "ビームサーベル", type: "weapon", slot: "main_hand", base: { atk: 30, agi: 5 }, rar: 3 },
    "w06": { name: "プラズマライフル", type: "weapon", slot: "main_hand", base: { atk: 45, dex: 10 }, rar: 4 },
    // Offhand
    "o01": { name: "木の盾", type: "armor", slot: "off_hand", base: { def: 3 }, rar: 1 },
    "o02": { name: "タワーシールド", type: "armor", slot: "off_hand", base: { def: 10, agi: -5 }, rar: 2 },
    "o03": { name: "魔導書", type: "weapon", slot: "off_hand", base: { mag: 8 }, rar: 2 },
    // Armor
    "b01": { name: "旅人の服", type: "armor", slot: "body", base: { def: 2 }, rar: 1 },
    "b02": { name: "チェーンメイル", type: "armor", slot: "body", base: { def: 12, agi: -2 }, rar: 2 },
    "b03": { name: "ナノスーツ", type: "armor", slot: "body", base: { def: 25, hp: 50 }, rar: 4 },
    // Accessory
    "a01": { name: "リング", type: "accessory", slot: "accessory", base: { luc: 2 }, rar: 1 },
    "a02": { name: "アミュレット", type: "accessory", slot: "accessory", base: { int: 5 }, rar: 2 }
};

// --- 3. AFFIX DATA (New) ---
const AFFIX_DATA = {
    // Prefix (前につく)
    prefix: [
        { name: "鋭利な", stats: { atk: 5 }, rar: 1 },
        { name: "硬い", stats: { def: 5 }, rar: 1 },
        { name: "機敏な", stats: { agi: 5 }, rar: 1 },
        { name: "知的な", stats: { int: 5 }, rar: 1 },
        { name: "幸運の", stats: { luc: 5 }, rar: 1 },
        { name: "猛火の", stats: { atk: 10, mag: 5 }, rar: 2 },
        { name: "氷結の", stats: { mag: 10, int: 5 }, rar: 2 },
        { name: "金剛の", stats: { def: 10, hp: 20 }, rar: 2 },
        { name: "英雄の", stats: { atk: 15, def: 10, hp: 50 }, rar: 3 },
        { name: "魔神の", stats: { atk: 25, mag: 25, hp: -20 }, rar: 3 }
    ],
    // Title (二つ名: レジェンダリー用)
    titles: [
        { name: "ドラゴンスレイヤー", stats: { atk: 50, def: 20 }, rar: 4 },
        { name: "ゴッドイーター", stats: { atk: 80, mag: 50 }, rar: 5 },
        { name: "守護神", stats: { def: 100, hp: 500 }, rar: 5 },
        { name: "ラグナロク", stats: { atk: 100, mag: 100, agi: 20 }, rar: 5 }
    ]
};

// --- 4. ENEMY DATA (Expanded) ---
const ENEMY_DATA = [
    // Tier 1 (1-5F)
    { id: "e1_1", name: "スライム", tier: 1, stats: { hp:30, atk:8, def:2, exp:10, gold:5 } },
    { id: "e1_2", name: "大ネズミ", tier: 1, stats: { hp:25, atk:10, def:1, exp:12, gold:8 } },
    { id: "e1_3", name: "巨大スズメバチ", tier: 1, stats: { hp:20, atk:15, def:0, exp:14, gold:10 } },
    { id: "e1_4", name: "コボルド", tier: 1, stats: { hp:40, atk:9, def:3, exp:15, gold:12 } },
    { id: "e1_5", name: "ゾンビ", tier: 1, stats: { hp:60, atk:12, def:0, exp:18, gold:5 } },
    
    // Tier 2 (6-10F)
    { id: "e2_1", name: "オーク", tier: 2, stats: { hp:100, atk:20, def:10, exp:30, gold:25 } },
    { id: "e2_2", name: "リザードマン", tier: 2, stats: { hp:120, atk:18, def:12, exp:35, gold:30 } },
    { id: "e2_3", name: "ガーゴイル", tier: 2, stats: { hp:80, atk:15, def:25, exp:40, gold:35 } },
    { id: "e2_4", name: "ダークナイト", tier: 2, stats: { hp:150, atk:25, def:20, exp:50, gold:50 } },
    { id: "e2_5", name: "ウィッチ", tier: 2, stats: { hp:70, atk:30, def:5, exp:45, gold:40 } },

    // Tier 3 (11-15F)
    { id: "e3_1", name: "キメラ", tier: 3, stats: { hp:250, atk:40, def:20, exp:80, gold:60 } },
    { id: "e3_2", name: "アイアンゴーレム", tier: 3, stats: { hp:400, atk:50, def:50, exp:100, gold:80 } },
    { id: "e3_3", name: "アサシン", tier: 3, stats: { hp:180, atk:60, def:10, exp:90, gold:100 } },
    { id: "e3_4", name: "ヴァンパイア", tier: 3, stats: { hp:300, atk:45, def:25, exp:120, gold:150 } },

    // Tier 4 (16-20F)
    { id: "e4_1", name: "機動兵器プロト", tier: 4, stats: { hp:600, atk:80, def:60, exp:250, gold:200 } },
    { id: "e4_2", name: "サイバー・ニンジャ", tier: 4, stats: { hp:400, atk:100, def:30, exp:280, gold:250 } },
    { id: "e4_3", name: "レーザータレット", tier: 4, stats: { hp:300, atk:120, def:20, exp:240, gold:180 } },

    // Tier 5 (21F+)
    { id: "e5_1", name: "ヴォイド・ドラゴン", tier: 5, stats: { hp:2000, atk:200, def:100, exp:1000, gold:1000 } },
    { id: "e5_2", name: "AI神のアバター", tier: 5, stats: { hp:3000, atk:150, def:150, exp:2000, gold:2000 } }
];