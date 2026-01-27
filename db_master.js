/**
 * Genetic Rogue - Master Database (CSV Loader Version)
 * スプレッドシート等で管理しているCSVデータをここに貼り付けるだけで反映されます。
 */

// ==========================================
// 1. CSVデータ貼り付けエリア
// ==========================================

const CSV_JOBS = `id,name,tier,type,equip_types,lineage,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc
warrior,戦士,1,phy,"sw,ax,ha,sh",warrior,1.2,1.2,1.1,0.5,0.8,0.9,1.0
mage,魔法使い,1,mag,"st,dg,ro,ac",magic,0.8,0.6,0.8,1.5,1.4,1.0,1.0
thief,盗賊,1,spd,"dg,bow,la,ac",shadow,0.9,1.2,0.8,0.8,1.2,1.5,1.5
priest,僧侶,1,sup,"st,ro,sh,ac",holy,1.0,0.8,1.2,1.2,1.3,0.9,1.2
merchant,商人,1,spe,"dg,la,ac",special,1.0,0.8,0.8,1.0,1.2,1.0,1.8
monk,武闘家,1,phy,"kn,la,ac",martial,1.3,1.1,0.9,0.8,1.0,1.3,1.0
hunter,狩人,1,tec,"bow,dg,la,ac",shadow,1.0,1.1,1.0,0.5,1.2,1.3,1.1
knight,騎士,2,tnk,"sw,sp,ha,sh",warrior,1.4,1.2,1.4,0.6,1.0,0.8,1.0
samurai,侍,2,phy,"sw,bow,la",martial,1.2,1.5,1.0,0.6,1.1,1.2,1.0
sorcerer,魔術師,2,mag,"st,dg,ro",magic,0.7,0.5,0.7,1.7,1.5,1.0,1.0
bard,吟遊詩人,2,sup,"ins,dg,la",special,1.0,0.9,0.9,1.2,1.2,1.1,1.5
ninja,忍者,2,spd,"sw,dg,to,la",shadow,0.9,1.3,0.8,1.0,1.2,1.6,1.2
gunner,ガンマン,2,tec,"gun,la,ac",tech,1.1,1.2,1.0,0.5,1.4,1.2,1.1
paladin,聖騎士,3,tnk,"sw,ha,sh",warrior,1.5,1.3,1.8,1.0,1.2,0.8,1.0
sage,賢者,3,mag,"st,ro,ac",magic,0.8,0.5,0.8,2.0,2.0,1.0,1.0
assassin,暗殺者,3,spd,"dg,bow,la",shadow,0.9,1.5,0.7,0.8,1.3,1.8,1.3
dragoon,竜騎士,3,phy,"sp,ha,la",warrior,1.4,1.6,1.2,0.8,1.0,1.2,1.0
sniper,狙撃手,3,tec,"gun,la,to",tech,1.0,1.6,0.9,0.5,1.5,1.3,1.2
hero,英雄,4,phy,"sw,ax,sp,ha",warrior,1.5,1.8,1.5,1.0,1.2,1.2,1.5
cyborg,サイボーグ,4,tnk,"dv,ax,gun,ha",tech,1.8,1.6,2.0,0.5,1.5,1.0,0.8
demon,魔神,4,mag,"st,dv,ro",magic,1.2,1.0,1.0,3.0,1.5,1.2,0.5
marine,宇宙海兵,4,phy,"gun,sw,ha",tech,1.5,1.8,1.5,0.5,1.2,1.2,1.0
psycho,超能力者,4,mag,"dv,ro,ac",magic,0.8,0.5,0.8,2.5,2.5,1.2,1.0
jester,遊び人,2,spe,"dg,ins,la",special,1.0,0.8,0.8,1.0,1.0,1.0,3.0`;

const CSV_ITEMS = `id,name,kind,type,slot,base_str,base_vit,base_mag,base_int,base_agi,base_luc,base_dex,tier,req_stat,req_val
w1,ショートソード,sw,weapon,main_hand,5,0,0,0,0,0,0,1,,
w2,ロングソード,sw,weapon,main_hand,10,0,0,0,0,0,0,2,,
w3,バスタードソード,sw,weapon,main_hand,20,0,0,0,-2,0,0,2,str,15
w4,ビームサーベル,sw,weapon,main_hand,45,0,0,5,0,0,0,4,,
ax1,ハンドアクス,ax,weapon,main_hand,8,0,0,0,-1,0,0,1,,
ax2,バトルアクス,ax,weapon,main_hand,25,0,0,0,-5,0,0,3,str,40
sp1,スピア,sp,weapon,main_hand,6,0,0,0,2,0,0,1,,
sp2,ハルバード,sp,weapon,main_hand,18,0,0,0,0,0,0,2,,
dg1,ナイフ,dg,weapon,main_hand,3,0,0,0,3,0,0,1,,
dg2,アサシンダガー,dg,weapon,main_hand,12,0,0,0,0,5,0,2,,
bw1,ショートボウ,bow,weapon,main_hand,5,0,0,0,0,0,3,1,,
gn1,ハンドガン,gun,weapon,main_hand,15,0,0,0,0,0,5,2,,
st1,ロッド,st,weapon,main_hand,0,0,5,0,0,0,0,1,,
st2,マジックスタッフ,st,weapon,main_hand,0,0,15,5,0,0,0,2,,
kn1,バンテージ,kn,weapon,main_hand,2,0,0,0,5,0,0,1,,
kn2,アイアンナックル,kn,weapon,main_hand,10,0,0,0,3,0,0,2,,
a1,ボロの服,la,armor,body,0,1,0,0,0,0,0,1,,
a2,レザーアーマー,la,armor,body,0,5,0,0,0,0,0,1,,
a3,プレートメイル,ha,armor,body,0,15,0,0,-3,0,0,2,vit,20
a4,ナノスーツ,la,armor,body,0,30,0,0,0,0,0,4,,
ro1,ローブ,ro,armor,body,0,2,2,0,0,0,0,1,,
sh1,バックラー,sh,armor,off_hand,0,2,0,0,1,0,0,1,,
sh2,タワーシールド,sh,armor,off_hand,0,10,0,0,-5,0,0,2,,
ac1,リング,ac,accessory,accessory,0,0,0,0,0,2,0,1,,
ac2,アミュレット,ac,accessory,accessory,0,0,0,3,0,0,0,1,,
ac3,パワーベルト,ac,accessory,accessory,5,0,0,0,0,0,0,2,,`;

const CSV_MATERIALS = `name,tier,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc,element,spawn_weight
鉄の,1,2,0,0,0,0,0,,40
銅の,1,0,0,2,0,0,0,,30
革の,1,0,0,0,0,2,0,,30
鋼の,2,5,5,0,0,0,0,,20
銀の,2,0,0,5,5,0,0,,20
ミスリルの,3,0,0,10,0,5,0,,10
アダマンタイトの,3,10,10,0,0,0,0,,10
オリハルコンの,4,5,5,5,5,5,5,,5
炎の,2,5,0,0,0,0,0,fire,10
氷の,2,0,0,5,0,0,0,water,10
風の,2,0,0,0,0,5,0,wind,10
大地の,2,0,5,0,0,0,0,earth,10
光の,3,0,0,0,10,0,0,light,5
闇の,3,10,0,0,0,0,0,dark,5
竜の,4,20,20,0,0,0,0,fire,2
神の,5,20,20,20,20,20,20,light,1`;

const CSV_ENEMIES = `name,hp,str,def,mag,agi,exp,gold,element
スライム,20,5,2,0,5,10,5,water
ネズミ,15,7,1,0,10,12,7,earth
ゴブリン,30,8,3,0,8,15,10,earth
オーク,60,15,5,0,6,25,20,fire
スケルトン,50,12,10,0,5,30,15,dark
ウィザード,40,5,2,20,8,40,30,fire
ゴーレム,150,30,20,0,2,80,50,earth
リザードマン,80,18,8,0,12,60,40,water
ハーピー,60,12,5,5,20,50,35,wind
ドラゴン,500,80,30,50,15,300,200,fire
ヴァンパイア,200,40,15,30,20,150,100,dark
エンジェル,300,50,40,60,25,250,150,light`;

// ==========================================
// 2. CSVパーサーとデータ変換ロジック
// ==========================================

const DataParser = {
    // CSV文字列をオブジェクトの配列に変換
    parse(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            // ダブルクォート内のカンマを無視して分割する正規表現
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!row) continue;

            const obj = {};
            headers.forEach((header, index) => {
                let value = row[index] ? row[index].replace(/^"|"$/g, '') : ''; // クォート削除
                // 数値変換
                if (!isNaN(value) && value !== '') {
                    value = Number(value);
                }
                obj[header] = value;
            });
            result.push(obj);
        }
        return result;
    },

    // 職業データの変換（equip_typesを配列に、mod_xxをオブジェクトに）
    convertJobs(rawJobs) {
        return rawJobs.map(job => {
            const equip = typeof job.equip_types === 'string' ? job.equip_types.split(',') : [];
            const mod = {
                // all is handled by logic if needed, but here we set specific
                str: job.mod_str || 1.0,
                vit: job.mod_vit || 1.0,
                mag: job.mod_mag || 1.0,
                int: job.mod_int || 1.0,
                agi: job.mod_agi || 1.0,
                luc: job.mod_luc || 1.0,
                hp: job.mod_hp || 1.0
            };
            return {
                id: job.id,
                name: job.name,
                tier: job.tier,
                type: job.type,
                equip: equip,
                lineage: job.lineage,
                mod: mod
            };
        });
    },

    // アイテムデータの変換
    convertItems(rawItems) {
        const items = {};
        rawItems.forEach(item => {
            const base = {
                str: item.base_str || 0,
                vit: item.base_vit || 0,
                mag: item.base_mag || 0,
                int: item.base_int || 0,
                agi: item.base_agi || 0,
                luc: item.base_luc || 0,
                dex: item.base_dex || 0
            };
            
            // 装備条件
            let req = null;
            if (item.req_stat && item.req_val) {
                req = {};
                req[item.req_stat] = item.req_val;
            }

            items[item.id] = {
                name: item.name,
                kind: item.kind,
                slot: item.slot,
                type: item.type, // weapon, armor, etc
                base: base,
                tier: item.tier,
                req: req
            };
        });
        return items;
    },
    
    // 素材データの変換
    convertMaterials(rawMats) {
        return rawMats.map(mat => {
            const mod = {};
            ['str','vit','mag','int','agi','luc'].forEach(stat => {
                const key = `mod_${stat}`;
                if(mat[key]) mod[stat] = mat[key];
            });
            // all stats check? logic handles it usually, but let's stick to explicit
            return {
                name: mat.name,
                tier: mat.tier,
                mod: mod,
                elem: mat.element || null,
                w: mat.spawn_weight || 10
            };
        });
    },
    
    // 敵データの変換
    convertEnemies(rawEnemies) {
        return rawEnemies.map(e => ({
            name: e.name,
            hp: e.hp,
            str: e.str || 0,
            def: e.def || 0,
            mag: e.mag || 0,
            vit: e.def || 0, // map def to vit
            agi: e.agi || 10,
            exp: e.exp,
            gold: e.gold,
            elem: e.element || null
        }));
    }
};

// ==========================================
// 3. MASTER_DATA 構築
// ==========================================

// パース実行
const RAW_JOBS = DataParser.parse(CSV_JOBS);
const RAW_ITEMS = DataParser.parse(CSV_ITEMS);
const RAW_MATS = DataParser.parse(CSV_MATERIALS);
const RAW_ENEMIES = DataParser.parse(CSV_ENEMIES);

// グローバルオブジェクトとして公開
const MASTER_DATA = {
    config: {
        MAX_PARTY: 6,
        BREED_MIN_LV: 30,
        HIRE_COST: 30, CC_COST: 100,
        MAX_LEVEL: 99,
        BASE_STATS: { hp:50, str:5, vit:5, mag:5, int:5, agi:5, luc:5 },
        FLOOR_STEP_MAX: 30
    },

    elements: [
        { key: "fire",  name: "火", color: "#e74c3c" },
        { key: "water", name: "水", color: "#3498db" },
        { key: "wind",  name: "風", color: "#2ecc71" },
        { key: "earth", name: "土", color: "#d35400" },
        { key: "light", name: "光", color: "#f1c40f" },
        { key: "dark",  name: "闇", color: "#9b59b6" }
    ],

    // 変換済みデータをセット
    jobs: DataParser.convertJobs(RAW_JOBS),
    
    job_ranks: [
        { tier: 1, prefix: "見習い", mod: 0.8 },
        { tier: 1, prefix: "", mod: 1.0 },
        { tier: 2, prefix: "熟練", mod: 1.2 },
        { tier: 2, prefix: "上級", mod: 1.3 },
        { tier: 3, prefix: "達人", mod: 1.5 },
        { tier: 3, prefix: "王宮", mod: 1.6 },
        { tier: 4, prefix: "伝説の", mod: 2.0 },
        { tier: 4, prefix: "覚醒", mod: 2.2 },
        { tier: 5, prefix: "神話の", mod: 3.0 }
    ],

    items: {
        types: DataParser.convertItems(RAW_ITEMS),
        materials: DataParser.convertMaterials(RAW_MATS),
        affixes: [
            { name:"錆びた", tier:1, type:"bad", stats:{atk:-3, def:-1}, w:30 },
            { name:"鋭利な", tier:1, type:"good", stats:{atk:3}, w:40 },
            { name:"頑丈な", tier:1, type:"good", stats:{def:3}, w:40 },
            { name:"知的な", tier:2, type:"good", stats:{int:5}, w:30 },
            { name:"英雄の", tier:4, type:"legend", stats:{all:5, atk:20}, w:5 }
        ]
    },

    enemies: {
        species: DataParser.convertEnemies(RAW_ENEMIES),
        prefixes: [
            { name: "", mod: 1.0 },
            { name: "強い", mod: 1.2 },
            { name: "狂暴な", mod: 1.5 },
            { name: "巨大な", mod: 2.0 },
            { name: "エリート", mod: 2.5 },
            { name: "キング", mod: 3.0 },
            { name: "エンシェント", mod: 5.0 }
        ]
    },

    traps: [
        { name: "スパイク", type: "dmg", base: 20 },
        { name: "毒矢", type: "status", status: "psn", base: 10 },
        { name: "落とし穴", type: "floor", base: 1 },
        { name: "爆発", type: "dmg", base: 50 },
        { name: "警報", type: "summon", base: 0 }
    ],

    personality: {
        "勇敢": { hp:1.2, str:1.2 }, "冷静": { int:1.2, vit:1.1 }, "臆病": { agi:1.3, vit:0.9 },
        "豪快": { str:1.3, mag:0.7 }, "天才": { mag:1.2, int:1.2, hp:0.8 }, "幸運": { luc:1.5 },
        "堅実": { vit:1.2, hp:1.1 }, "凡人": {}, "野心家": { str:1.1, luc:1.1 },
        "慎重": { vit:1.3, agi:0.8 }, "短気": { str:1.4, vit:0.8 }, "慈悲": { int:1.3, mag:1.1 }
    },
    
    // Lineage data for colors/growth (kept as object for lookup)
    lineages: {
        warrior: { hp: 1.5, atk: 1.5, def: 1.2, agi: 0.8, mag: 0.2, int: 0.6, luc: 1.0, color:"#e74c3c" },
        martial: { hp: 1.4, atk: 1.3, def: 0.9, agi: 1.5, mag: 0.5, int: 1.0, luc: 1.0, color:"#d35400" },
        shadow:  { hp: 0.9, atk: 1.2, def: 0.7, agi: 1.7, mag: 0.6, int: 1.3, luc: 1.6, color:"#8e44ad" },
        magic:   { hp: 0.7, atk: 0.3, def: 0.6, agi: 1.0, mag: 1.8, int: 1.6, luc: 1.0, color:"#3498db" },
        holy:    { hp: 1.1, atk: 0.7, def: 1.2, agi: 0.9, mag: 1.4, int: 1.5, luc: 1.2, color:"#f1c40f" },
        tech:    { hp: 1.2, atk: 1.0, def: 1.1, agi: 1.2, mag: 0.5, int: 1.6, luc: 1.1, color:"#1abc9c" },
        special: { hp: 1.0, atk: 0.8, def: 0.8, agi: 1.0, mag: 1.0, int: 1.3, luc: 2.0, color:"#2ecc71" }
    }
};