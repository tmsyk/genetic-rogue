/**
 * Genetic Rogue - Game Data
 * * 1. JOB_DATA: 職業データ (系統とTierに基づく定義)
 * 2. ITEM_DATA: アイテムデータ (装備スロット定義付き)
 * 3. ENEMY_DATA: 敵データ
 */

// --- 1. JOB DATA (Lineages & Tiers) ---

// 系統ごとのステータス傾向定義
const LINEAGE_TYPES = {
    "warrior": { type: "phy", stats: { hp: 1.2, atk: 1.2, def: 1.0 } }, // 戦士系
    "martial": { type: "phy", stats: { hp: 1.3, atk: 1.2, agi: 1.2 } }, // 武道系
    "shadow":  { type: "spd", stats: { agi: 1.4, luc: 1.5, dex: 1.2 } }, // 影系
    "magic":   { type: "mag", stats: { mag: 1.4, int: 1.2, hp: 0.8 } },  // 魔道系
    "holy":    { type: "sup", stats: { def: 1.2, int: 1.3, mag: 1.0 } }, // 聖系
    "monster": { type: "spe", stats: { hp: 1.4, atk: 1.3, luc: 1.1 } },  // 異形系
    "tech":    { type: "tec", stats: { dex: 1.4, int: 1.2, hp: 1.1 } },  // 技術系
    "special": { type: "spe", stats: { luc: 1.6, int: 1.2 } }            // 特殊系
};

// 職業リスト (IDをキーとする)
const JOB_DATA = {
    // === A. 戦士の系譜 (Physical / Tank) ===
    "warrior":      { name: "戦士", tier: 1, lineage: "warrior", equip: ["sw", "ax"] },
    "mercenary":    { name: "傭兵", tier: 1, lineage: "warrior", equip: ["sw", "sp"] },
    "gatekeeper":   { name: "門番", tier: 1, lineage: "warrior", equip: ["sp", "ax"], stats_mod: { hp: 1.4, def: 1.3 } },
    "knight":       { name: "騎士", tier: 2, lineage: "warrior", equip: ["sw", "sp"], stats_mod: { def: 1.5 } },
    "gladiator":    { name: "重戦士", tier: 2, lineage: "warrior", equip: ["ax"] },
    "barbarian":    { name: "蛮族", tier: 2, lineage: "warrior", equip: ["ax"] },
    "heavy_knight": { name: "重騎士", tier: 3, lineage: "warrior", equip: ["ax", "sp"], stats_mod: { def: 2.0, agi: 0.5 } },
    "paladin":      { name: "聖騎士", tier: 3, lineage: "warrior", equip: ["sw"], stats_mod: { def: 1.8, mag: 1.2 } },
    "general":      { name: "将軍", tier: 3, lineage: "warrior", equip: ["sw"] },
    "cyborg":       { name: "サイボーグ", tier: 4, lineage: "warrior", equip: ["dv", "ax"], stats_mod: { hp: 2.5, def: 2.0 } },
    "war_god":      { name: "軍神", tier: 5, lineage: "warrior", equip: ["all"], stats_mod: { hp: 3.0, atk: 3.0 } },

    // === B. 武道の系譜 (Speed / Technique) ===
    "brawler":      { name: "格闘家", tier: 1, lineage: "martial", equip: ["dg"] },
    "monk":         { name: "武闘家", tier: 2, lineage: "martial", equip: ["dg"] },
    "samurai":      { name: "侍", tier: 2, lineage: "martial", equip: ["sw"] },
    "master_monk":  { name: "拳聖", tier: 3, lineage: "martial", equip: ["dg"], stats_mod: { atk: 2.0, agi: 1.8 } },
    "sword_saint":  { name: "剣聖", tier: 3, lineage: "martial", equip: ["sw"], stats_mod: { atk: 2.5 } },
    "nano_brawler": { name: "ナノ格闘家", tier: 4, lineage: "martial", equip: ["dv"], stats_mod: { agi: 2.5 } },
    "asura":        { name: "阿修羅", tier: 5, lineage: "martial", equip: ["all"], stats_mod: { atk: 3.5, agi: 2.5 } },

    // === C. 影の系譜 (Speed / Luck) ===
    "thief":        { name: "盗賊", tier: 1, lineage: "shadow", equip: ["dg"] },
    "ninja":        { name: "忍者", tier: 2, lineage: "shadow", equip: ["sw", "dg"], stats_mod: { agi: 1.8, mag: 1.2 } },
    "assassin":     { name: "暗殺者", tier: 2, lineage: "shadow", equip: ["dg", "bow"] },
    "master_ninja": { name: "上忍", tier: 3, lineage: "shadow", equip: ["sw"], stats_mod: { agi: 2.4 } },
    "sniper":       { name: "狙撃手", tier: 3, lineage: "shadow", equip: ["gun"], stats_mod: { dex: 2.5 } },
    "ghost":        { name: "ゴースト", tier: 4, lineage: "shadow", equip: ["dv"], stats_mod: { int: 2.5, agi: 2.2 } },
    "grim_reaper":  { name: "死神", tier: 5, lineage: "shadow", equip: ["ax"], stats_mod: { atk: 2.8, mag: 2.5 } },

    // === D. 魔道の系譜 (Magic) ===
    "mage":         { name: "魔法使い", tier: 1, lineage: "magic", equip: ["st"] },
    "sorcerer":     { name: "魔術師", tier: 2, lineage: "magic", equip: ["st"], stats_mod: { mag: 1.8 } },
    "necromancer":  { name: "死霊術師", tier: 2, lineage: "magic", equip: ["st"], stats_mod: { mag: 1.6, hp: 1.2 } },
    "sage":         { name: "賢者", tier: 3, lineage: "magic", equip: ["st"], stats_mod: { mag: 2.0, int: 2.0 } },
    "archmage":     { name: "大魔導士", tier: 3, lineage: "magic", equip: ["st"], stats_mod: { mag: 2.5 } },
    "psionicist":   { name: "サイキッカー", tier: 4, lineage: "magic", equip: ["dv"], stats_mod: { mag: 2.4, int: 2.2 } },
    "demon_lord":   { name: "魔神", tier: 5, lineage: "magic", equip: ["st"], stats_mod: { mag: 3.5, hp: 2.5 } },

    // === E. 聖なる系譜 (Support) ===
    "priest":       { name: "僧侶", tier: 1, lineage: "holy", equip: ["st"] },
    "bishop":       { name: "司祭", tier: 2, lineage: "holy", equip: ["st"] },
    "saint":        { name: "聖女", tier: 3, lineage: "holy", equip: ["st"], stats_mod: { int: 2.2, mag: 1.8 } },
    "medic":        { name: "衛生兵", tier: 4, lineage: "holy", equip: ["dv"], stats_mod: { int: 2.0, def: 1.8 } },
    "angel":        { name: "天使", tier: 5, lineage: "holy", equip: ["sp"], stats_mod: { int: 3.0, mag: 2.5 } },

    // === F. 異形の系譜 (Monster) ===
    "villager":     { name: "村人", tier: 1, lineage: "monster", equip: ["all"] },
    "tamer":        { name: "魔物使い", tier: 2, lineage: "monster", equip: ["whip"] },
    "dragonewt":    { name: "竜人", tier: 3, lineage: "monster", equip: ["ax"], stats_mod: { hp: 2.2, atk: 2.0 } },
    "bio_weapon":   { name: "生体兵器", tier: 4, lineage: "monster", equip: ["none"], stats_mod: { hp: 3.0, atk: 2.5 } },
    "dragon_lord":  { name: "竜王", tier: 5, lineage: "monster", equip: ["all"], stats_mod: { hp: 3.5, atk: 3.0 } },

    // === G. 技術の系譜 (Tech) ===
    "mechanic":     { name: "整備士", tier: 1, lineage: "tech", equip: ["ax"] },
    "gunner":       { name: "ガンマン", tier: 2, lineage: "tech", equip: ["gun"] },
    "hacker":       { name: "ハッカー", tier: 3, lineage: "tech", equip: ["dv"], stats_mod: { int: 2.2 } },
    "android":      { name: "アンドロイド", tier: 4, lineage: "tech", equip: ["dv"], stats_mod: { hp: 2.0, def: 2.0 } },
    "ai_god":       { name: "AI神", tier: 5, lineage: "tech", equip: ["dv"], stats_mod: { int: 4.0 } },

    // === H. 特殊 (Special) ===
    "merchant":     { name: "商人", tier: 1, lineage: "special", equip: ["dg"] },
    "millionaire":  { name: "大富豪", tier: 2, lineage: "special", equip: ["all"] },
    "ceo":          { name: "CEO", tier: 4, lineage: "special", equip: ["dv"], stats_mod: { luc: 2.5 } }
};

// データの補完処理（stats_modがない場合にLineageのデフォルトを適用）
Object.keys(JOB_DATA).forEach(key => {
    const job = JOB_DATA[key];
    const base = LINEAGE_TYPES[job.lineage].stats;
    if (!job.stats_mod) job.stats_mod = {};
    // ベースステータスと個別補正をマージ
    for (let k in base) {
        if (!job.stats_mod[k]) job.stats_mod[k] = base[k];
    }
});


// --- 2. ITEM DATA (With Slots) ---
const ITEM_DATA = {
    // === Main Hand (Weapons) ===
    "w01": { name: "錆びた剣", type: "weapon", slot: "main_hand", stat: { atk: 5 }, rarity: "Common" },
    "w02": { name: "鋼の剣", type: "weapon", slot: "main_hand", stat: { atk: 12, agi: 2 }, rarity: "Uncommon" },
    "w03": { name: "魔導士の杖", type: "weapon", slot: "main_hand", stat: { mag: 10, int: 5 }, rarity: "Uncommon" },
    "w04": { name: "バトルアクス", type: "weapon", slot: "main_hand", stat: { atk: 18, agi: -2 }, rarity: "Rare" },
    "w05": { name: "ビームサーベル", type: "weapon", slot: "main_hand", stat: { atk: 30, agi: 5 }, rarity: "Rare" },
    "w06": { name: "プラズマライフル", type: "weapon", slot: "main_hand", stat: { atk: 45, dex: 10 }, rarity: "Legendary" },
    "w07": { name: "村正", type: "weapon", slot: "main_hand", stat: { atk: 50, luc: -5 }, rarity: "Legendary" },

    // === Off Hand (Shields / Sub) ===
    "o01": { name: "木の盾", type: "armor", slot: "off_hand", stat: { def: 3 }, rarity: "Common" },
    "o02": { name: "鉄の盾", type: "armor", slot: "off_hand", stat: { def: 8 }, rarity: "Uncommon" },
    "o03": { name: "魔導書", type: "weapon", slot: "off_hand", stat: { mag: 8 }, rarity: "Rare" },
    "o04": { name: "エネルギーシールド", type: "armor", slot: "off_hand", stat: { def: 20 }, rarity: "Legendary" },

    // === Head (Helm) ===
    "h01": { name: "革の帽子", type: "armor", slot: "head", stat: { def: 2 }, rarity: "Common" },
    "h02": { name: "鉄の兜", type: "armor", slot: "head", stat: { def: 6 }, rarity: "Uncommon" },
    "h03": { name: "照準ゴーグル", type: "armor", slot: "head", stat: { dex: 8, atk: 2 }, rarity: "Rare" },
    "h04": { name: "脳波コントローラー", type: "armor", slot: "head", stat: { int: 15, mag: 10 }, rarity: "Legendary" },

    // === Body (Armor) ===
    "b01": { name: "ボロ布", type: "armor", slot: "body", stat: { def: 1 }, rarity: "Common" },
    "b02": { name: "革の鎧", type: "armor", slot: "body", stat: { def: 5 }, rarity: "Common" },
    "b03": { name: "プレートメイル", type: "armor", slot: "body", stat: { def: 15, agi: -2 }, rarity: "Uncommon" },
    "b04": { name: "ナノスーツ", type: "armor", slot: "body", stat: { def: 25, hp: 50, agi: 5 }, rarity: "Rare" },
    "b05": { name: "パワードスーツ", type: "armor", slot: "body", stat: { def: 40, atk: 10 }, rarity: "Legendary" },

    // === Accessory ===
    "a01": { name: "お守り", type: "accessory", slot: "accessory", stat: { luc: 5 }, rarity: "Common" },
    "a02": { name: "力の指輪", type: "accessory", slot: "accessory", stat: { atk: 5 }, rarity: "Uncommon" },
    "a03": { name: "拡張チップ:SPD", type: "accessory", slot: "accessory", stat: { agi: 10 }, rarity: "Rare" },
    "a04": { name: "インプラント:AI", type: "accessory", slot: "accessory", stat: { int: 20 }, rarity: "Legendary" }
};


// --- 3. ENEMY DATA ---
const ENEMY_DATA = [
    // Tier 1
    { id: "e1_1", name: "スライム", tier: 1, stats: { hp:30, atk:6, def:2, exp:10, gold:5 }, drop: ["w01", "b01"] },
    { id: "e1_2", name: "大ネズミ", tier: 1, stats: { hp:25, atk:8, def:1, exp:12, gold:8 }, drop: ["h01", "a01"] },
    { id: "e1_3", name: "ゴブリン", tier: 1, stats: { hp:40, atk:7, def:3, exp:15, gold:12 }, drop: ["w01", "o01"] },
    // Tier 2
    { id: "e2_1", name: "オーク", tier: 2, stats: { hp:80, atk:15, def:8, exp:30, gold:25 }, drop: ["w02", "b02"] },
    { id: "e2_2", name: "スケルトン", tier: 2, stats: { hp:60, atk:18, def:5, exp:28, gold:20 }, drop: ["h02", "o02"] },
    // Tier 3
    { id: "e3_1", name: "キメラ", tier: 3, stats: { hp:150, atk:30, def:15, exp:80, gold:60 }, drop: ["w03", "b03"] },
    { id: "e3_2", name: "魔導兵器", tier: 3, stats: { hp:200, atk:25, def:30, exp:90, gold:70 }, drop: ["w04", "a02"] },
    // Tier 4 (SF)
    { id: "e4_1", name: "警備ドローン", tier: 4, stats: { hp:300, atk:50, def:40, exp:200, gold:150 }, drop: ["w05", "h03"] },
    { id: "e4_2", name: "サイバーデーモン", tier: 4, stats: { hp:350, atk:60, def:30, exp:250, gold:200 }, drop: ["b04", "a03"] },
    // Tier 5 (Legend)
    { id: "e5_1", name: "ドラゴン", tier: 5, stats: { hp:1000, atk:100, def:80, exp:1000, gold:500 }, drop: ["w06", "o04", "b05"] }
];