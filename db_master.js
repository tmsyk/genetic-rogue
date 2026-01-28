/**
 * Genetic Rogue - Master Database (Full Version)
 * スプレッドシート等で管理しているCSVデータをここに貼り付けるだけで反映されます。
 */

// ==========================================
// 1. CSVデータ定義
// ==========================================

// 種族定義
const CSV_RACES = `id,name,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc
human,人間,1.0,1.0,1.0,1.0,1.0,1.0,1.0
elf,エルフ,0.8,0.8,0.8,1.2,1.2,1.1,1.0
dwarf,ドワーフ,1.2,1.1,1.2,0.8,0.9,0.8,1.0
beast,獣人,1.1,1.2,1.0,0.7,0.8,1.2,1.0
halfling,小人,0.8,0.8,0.8,1.0,1.0,1.3,1.3`;

// 属性定義
const CSV_ELEMENTS = `key,name,color,weak,strong
fire,火,#e74c3c,water,wind
water,水,#3498db,earth,fire
wind,風,#2ecc71,fire,earth
earth,土,#d35400,wind,water
light,光,#f1c40f,dark,dark
dark,闇,#9b59b6,light,light`;

// 系統定義
const CSV_LINEAGE = `id,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc,color
warrior,1.5,1.5,1.2,0.2,0.6,0.8,1.0,#e74c3c
martial,1.4,1.3,0.9,0.5,1.0,1.5,1.0,#d35400
shadow,0.9,1.2,0.7,0.6,1.3,1.7,1.6,#8e44ad
magic,0.7,0.3,0.6,1.8,1.6,1.0,1.0,#3498db
holy,1.1,0.7,1.2,1.4,1.5,0.9,1.2,#f1c40f
tech,1.2,1.0,1.1,0.5,1.6,1.2,1.1,#1abc9c
special,1.0,0.8,0.8,1.0,1.0,1.0,2.0,#2ecc71`;

// 個性定義
const CSV_PERSONALITY = `name,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc
勇敢,1.2,1.2,1.0,1.0,1.0,1.0,1.0
冷静,1.0,1.0,1.1,1.0,1.2,1.0,1.0
臆病,1.0,1.0,0.9,1.0,1.0,1.3,1.0
豪快,1.0,1.3,1.0,0.7,1.0,1.0,1.0
天才,0.9,1.0,1.0,1.2,1.2,1.0,1.0
幸運,1.0,1.0,1.0,1.0,1.0,1.0,1.5
堅実,1.1,1.0,1.2,1.0,1.0,0.8,1.0
凡人,1.0,1.0,1.0,1.0,1.0,1.0,1.0
野心家,1.0,1.1,1.0,1.0,1.0,1.0,1.1
慎重,1.0,1.0,1.3,1.0,1.0,0.8,1.0
短気,1.0,1.4,0.8,1.0,1.0,1.0,1.0
慈悲,1.0,1.0,1.0,1.1,1.3,1.0,1.0`;

// スキル定義
const CSV_SKILLS = `name,type,desc
剛腕,phy,物理攻撃力+10%
連撃,phy,20%の確率で2回攻撃
鉄壁,phy,防御力+15%
カウンター,phy,回避時50%で反撃
急所突き,phy,クリティカル率+10%
粉砕,phy,敵の防御を貫通する
底力,phy,HP減少時に攻撃UP
闘争本能,phy,ターン経過で攻撃UP
受け流し,phy,物理ダメージ軽減
鬼神,phy,攻撃大幅UP防御DOWN
魔力集中,mag,魔法攻撃力+10%
瞑想,mag,ターン終了時MP回復
炎の知識,mag,火属性ダメージ+20%
マナ効率,mag,スキル発動率UP
詠唱短縮,mag,行動速度+10%
属性強化,mag,弱点ダメージUP
結界,mag,魔法ダメージ軽減
精神統一,mag,状態異常耐性UP
古代の知恵,mag,経験値獲得量UP
魔神,mag,魔法大幅UPHP減少
早業,spd,命中率+20%
回避,spd,回避率+10%
不意打ち,spd,戦闘開始時先制攻撃
残像,spd,回避時次ターン攻撃UP
軽業,spd,トラップ回避率UP
目利き,spd,ドロップ率UP
二刀流の極意,spd,サブ武器補正UP
隠密,spd,敵に狙われにくくなる
俊足,spd,逃走成功率UP
神速,spd,稀に2回行動
挑発,tnk,敵の攻撃を引きつける
かばう,tnk,瀕死の味方をかばう
忍耐,tnk,HP30%以下で防御UP
リジェネ,tnk,毎ターンHP回復
重装甲,tnk,物理ダメージ-10%
不屈,tnk,致死ダメージを一度耐える
ガーディアン,tnk,味方全体の防御UP
自己修復,tnk,状態異常を自然治癒
城塞,tnk,防御大幅UP回避DOWN
金剛,tnk,全ダメージ軽減
祈り,sup,味方全体のHP回復
祝福,sup,味方の攻撃力UP
慈愛,sup,回復効果+20%
応急手当,sup,戦闘終了時HP回復
加護,sup,状態異常耐性UP
薬の知識,sup,アイテム効果UP
聖なる光,sup,アンデッドに大ダメージ
献身,sup,自分のHPを分け与える
女神の瞳,sup,隠し通路発見率UP
奇跡,sup,稀にダメージ無効化`;

// 職業マスタ
const CSV_JOBS = `id,name,tier,type,equip_types,lineage,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc,req_job,req_hp,req_str,req_vit,req_mag,req_int,req_agi,req_luc
warrior,戦士,1,phy,"sw,ax,ha,sh",warrior,1.2,1.2,1.1,0.5,0.8,0.9,1.0,,,,,,,,
mage,魔法使い,1,mag,"st,dg,ro,ac",magic,0.8,0.6,0.8,1.5,1.4,1.0,1.0,,,,,,,,
thief,盗賊,1,spd,"dg,bow,la,ac",shadow,0.9,1.2,0.8,0.8,1.2,1.5,1.5,,,,,,,,
priest,僧侶,1,sup,"st,ro,sh,ac",holy,1.0,0.8,1.2,1.2,1.3,0.9,1.2,,,,,,,,
merchant,商人,1,spe,"dg,la,ac",special,1.0,0.8,0.8,1.0,1.2,1.0,1.8,,,,,,,,
monk,武闘家,1,phy,"kn,la,ac",martial,1.3,1.1,0.9,0.8,1.0,1.3,1.0,,,,,,,,
hunter,狩人,1,tec,"bow,dg,la,ac",shadow,1.0,1.1,1.0,0.5,1.2,1.3,1.1,,,,,,,,
knight,騎士,2,tnk,"sw,sp,ha,sh",warrior,1.4,1.2,1.4,0.6,1.0,0.8,1.0,warrior,100,20,20,,,,
samurai,侍,2,phy,"sw,bow,la",martial,1.2,1.5,1.0,0.6,1.1,1.2,1.0,monk,,30,,,,,
sorcerer,魔術師,2,mag,"st,dg,ro",magic,0.7,0.5,0.7,1.7,1.5,1.0,1.0,mage,,,20,30,,,
bard,吟遊詩人,2,sup,"ins,dg,la",special,1.0,0.9,0.9,1.2,1.2,1.1,1.5,merchant,,,,,,20,20
ninja,忍者,2,spd,"sw,dg,to,la",shadow,0.9,1.3,0.8,1.0,1.2,1.6,1.2,thief,,,,,20,30,
gunner,ガンマン,2,tec,"gun,la,ac",tech,1.1,1.2,1.0,0.5,1.4,1.2,1.1,hunter,,,,,,25,
paladin,聖騎士,3,tnk,"sw,ha,sh",warrior,1.5,1.3,1.8,1.0,1.2,0.8,1.0,knight,200,40,40,20,,,
sage,賢者,3,mag,"st,ro,ac",magic,0.8,0.5,0.8,2.0,2.0,1.0,1.0,sorcerer,,,,50,40,,
assassin,暗殺者,3,spd,"dg,bow,la",shadow,0.9,1.5,0.7,0.8,1.3,1.8,1.3,ninja,,40,,,20,50,
dragoon,竜騎士,3,phy,"sp,ha,la",warrior,1.4,1.6,1.2,0.8,1.0,1.2,1.0,knight,250,50,30,,,,
sniper,狙撃手,3,tec,"gun,la,to",tech,1.0,1.6,0.9,0.5,1.5,1.3,1.2,gunner,,40,,,20,,
hero,英雄,4,phy,"sw,ax,sp,ha",warrior,1.5,1.8,1.5,1.0,1.2,1.2,1.5,paladin,400,80,60,40,40,40,40
cyborg,サイボーグ,4,tnk,"dv,ax,gun,ha",tech,1.8,1.6,2.0,0.5,1.5,1.0,0.8,sniper,500,70,70,,,,
demon,魔神,4,mag,"st,dv,ro",magic,1.2,1.0,1.0,3.0,1.5,1.2,0.5,sage,,20,20,100,60,,
marine,宇宙海兵,4,phy,"gun,sw,ha",tech,1.5,1.8,1.5,0.5,1.2,1.2,1.0,sniper,400,80,50,,,,
psycho,超能力者,4,mag,"dv,ro,ac",magic,0.8,0.5,0.8,2.5,2.5,1.2,1.0,sage,,,,90,90,,
jester,遊び人,2,spe,"dg,ins,la",special,1.0,0.8,0.8,1.0,1.0,1.0,3.0,merchant,,,,,,,50`;

// アイテムマスタ (tierを追加)
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

// 素材マスタ
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

// 敵マスタ
const CSV_ENEMIES = `name,hp,str,def,mag,agi,exp,gold,element,tier
スライム,20,5,2,0,5,10,5,water,1
ネズミ,15,7,1,0,10,12,7,earth,1
ゴブリン,30,8,3,0,8,15,10,earth,1
オーク,60,15,5,0,6,25,20,fire,2
スケルトン,50,12,10,0,5,30,15,dark,2
ウィザード,40,5,2,20,8,40,30,fire,2
ゴーレム,150,30,20,0,2,80,50,earth,3
リザードマン,80,18,8,0,12,60,40,water,3
ハーピー,60,12,5,5,20,50,35,wind,3
ヴァンパイア,200,40,15,30,20,150,100,dark,4
エンジェル,300,50,40,60,25,250,150,light,4
ドラゴン,500,80,30,50,15,300,200,fire,5`;

// ==========================================
// 2. CSVパーサーとデータ変換ロジック
// ==========================================

const DataParser = {
    parse(csvText) {
        if(!csvText) return [];
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!row) continue;
            const obj = {};
            headers.forEach((header, index) => {
                let value = row[index] ? row[index].replace(/^"|"$/g, '') : '';
                if (!isNaN(value) && value !== '') value = Number(value);
                obj[header] = value;
            });
            result.push(obj);
        }
        return result;
    },

    convertRaces(rawRaces) {
        const races = {};
        rawRaces.forEach(r => {
            races[r.id] = {
                id: r.id, name: r.name,
                mod: { hp:r.mod_hp, str:r.mod_str, vit:r.mod_vit, mag:r.mod_mag, int:r.mod_int, agi:r.mod_agi, luc:r.mod_luc }
            };
        });
        return races;
    },

    convertJobs(rawJobs) {
        return rawJobs.map(job => {
            const equip = typeof job.equip_types === 'string' ? job.equip_types.split(',') : [];
            const mod = {
                str: job.mod_str || 1.0,
                vit: job.mod_vit || 1.0,
                mag: job.mod_mag || 1.0,
                int: job.mod_int || 1.0,
                agi: job.mod_agi || 1.0,
                luc: job.mod_luc || 1.0,
                hp: job.mod_hp || 1.0
            };
            
            // ステータス要件の抽出
            const reqStats = {};
            ['hp', 'str', 'vit', 'mag', 'int', 'agi', 'luc'].forEach(stat => {
                const key = `req_${stat}`;
                if (job[key] && job[key] > 0) {
                    reqStats[stat] = job[key];
                }
            });

            return {
                id: job.id,
                name: job.name,
                tier: job.tier,
                type: job.type,
                equip: equip,
                lineage: job.lineage,
                mod: mod,
                reqJob: job.req_job || null,
                reqStats: reqStats
            };
        });
    },

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
            let req = null;
            if (item.req_stat && item.req_val) {
                req = {}; req[item.req_stat] = item.req_val;
            }
            items[item.id] = {
                name: item.name,
                kind: item.kind,
                slot: item.slot,
                type: item.type,
                base: base,
                tier: item.tier || 1, // Tierがない場合は1
                req: req
            };
        });
        return items;
    },
    
    convertMaterials(rawMats) {
        return rawMats.map(mat => {
            const mod = {};
            ['str','vit','mag','int','agi','luc'].forEach(stat => {
                const key = `mod_${stat}`;
                if(mat[key]) mod[stat] = mat[key];
            });
            return {
                name: mat.name,
                tier: mat.tier,
                mod: mod,
                elem: mat.element || null,
                w: mat.spawn_weight || 10
            };
        });
    },
    
    convertEnemies(rawEnemies) {
        return rawEnemies.map(e => ({
            name: e.name,
            hp: e.hp,
            str: e.str || 0,
            def: e.def || 0,
            mag: e.mag || 0,
            vit: e.def || 0,
            agi: e.agi || 10,
            exp: e.exp,
            gold: e.gold,
            elem: e.element || null,
            tier: e.tier || 1
        }));
    },

    convertElements(rawElements) {
        const result = [];
        const chart = {};
        rawElements.forEach(e => {
            result.push({ key: e.key, name: e.name, color: e.color });
            chart[e.key] = { weak: e.weak, strong: e.strong };
        });
        return { list: result, chart: chart };
    },

    convertPersonality(rawPers) {
        const result = {};
        rawPers.forEach(p => {
            const mod = {};
            ['hp','str','vit','mag','int','agi','luc'].forEach(stat => {
                const key = `mod_${stat}`;
                if(p[key]) mod[stat] = p[key];
            });
            result[p.name] = mod;
        });
        return result;
    },

    convertSkills(rawSkills) {
        const data = {};
        const pool = { phy:[], mag:[], spd:[], tnk:[], sup:[] };
        
        rawSkills.forEach(s => {
            data[s.name] = { desc: s.desc };
            if(pool[s.type]) pool[s.type].push(s.name);
        });
        return { data: data, pool: pool };
    },

    convertLineage(rawLin) {
        const result = {};
        rawLin.forEach(l => {
            const mod = {
                hp: l.mod_hp,
                str: l.mod_str,
                vit: l.mod_vit,
                mag: l.mod_mag,
                int: l.mod_int,
                agi: l.mod_agi,
                luc: l.mod_luc,
                color: l.color
            };
            result[l.id] = mod;
        });
        return result;
    }
};

// ==========================================
// 3. MASTER_DATA 構築
// ==========================================

const RAW_JOBS = DataParser.parse(CSV_JOBS);
const RAW_ITEMS = DataParser.parse(CSV_ITEMS);
const RAW_MATS = DataParser.parse(CSV_MATERIALS);
const RAW_ENEMIES = DataParser.parse(CSV_ENEMIES);
const RAW_ELEMENTS = DataParser.parse(CSV_ELEMENTS);
const parsedElements = DataParser.convertElements(RAW_ELEMENTS);
const RAW_PERSONALITY = DataParser.parse(CSV_PERSONALITY);
const parsedPersonality = DataParser.convertPersonality(RAW_PERSONALITY);
const RAW_SKILLS = DataParser.parse(CSV_SKILLS);
const parsedSkills = DataParser.convertSkills(RAW_SKILLS);
const RAW_LINEAGE = DataParser.parse(CSV_LINEAGE);
const parsedLineage = DataParser.convertLineage(RAW_LINEAGE);
const RAW_RACES = DataParser.parse(CSV_RACES);
const parsedRaces = DataParser.convertRaces(RAW_RACES);

const MASTER_DATA = {
    config: {
        MAX_PARTY: 6,
        BREED_MIN_LV: 30,
        HIRE_COST: 100, // ★コストを100に変更
        CC_COST: 100,
        MAX_LEVEL: 99,
        BASE_STATS: { hp:50, str:5, vit:5, mag:5, int:5, agi:5, luc:5 },
        FLOOR_STEP_MAX: 30
    },
    elements: parsedElements.list,
    element_chart: parsedElements.chart,
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
            { name:"錆びた", tier:1, type:"bad", stats:{str:-3, vit:-1}, w:30 },
            { name:"鋭利な", tier:1, type:"good", stats:{str:3}, w:40 },
            { name:"頑丈な", tier:1, type:"good", stats:{vit:3}, w:40 },
            { name:"知的な", tier:2, type:"good", stats:{int:5}, w:30 },
            { name:"英雄の", tier:4, type:"legend", stats:{all:5, str:20}, w:5 }
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
    personality: parsedPersonality,
    skills: parsedSkills,
    lineages: parsedLineage,
    races: parsedRaces
};