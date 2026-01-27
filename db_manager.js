/**
 * Genetic Rogue - Database Manager
 * マスタデータを元に、ゲーム内で使用する大量のデータを動的に展開・管理します。
 */

const DB = {
    jobs: {},
    items: [],
    
    // 初期化：マスタデータから全パターンを展開
    init() {
        this.generateJobs();
        this.generateItems(); // テンプレート生成
        console.log(`[DB] Initialized. Jobs: ${Object.keys(this.jobs).length}, ItemTemplates: ${this.items.length}`);
    },

    // --- Job Generation ---
    generateJobs() {
        const ranks = MASTER_DATA.job_ranks;
        const elements = MASTER_DATA.elements;
        // 無属性を追加
        const allElements = [{key:null, name:"", mod:{}}].concat(elements);

        MASTER_DATA.jobs.forEach(base => {
            ranks.forEach(rank => {
                allElements.forEach(el => {
                    // フィルタリング（数調整）
                    if(rank.tier === 1 && el.key !== null) return; // T1は無属性のみ
                    if(rank.tier === 5 && el.key === null) return; // T5は属性必須

                    const id = `${el.key||'n'}_${rank.tier}_${base.id}`;
                    const name = `${el.name}${rank.prefix}${base.name}`;
                    
                    let mod = { all: rank.mod };
                    if(el.key) mod.mag = (mod.mag||0) + 0.2; // 属性ボーナス例

                    // Job Tree Logic
                    let reqJob = null;
                    if(rank.tier > 1) reqJob = base.id; // ベース職が必要

                    this.jobs[id] = {
                        id: id,
                        name: name,
                        tier: rank.tier,
                        type: base.type,
                        equip: base.equip,
                        lineage: base.lineage,
                        mod: mod,
                        reqEl: el.key ? [el.key] : null,
                        reqJob: reqJob,
                        baseId: base.id
                    };
                });
            });
        });
    },

    getJob(id) { return this.jobs[id] || this.jobs[Object.keys(this.jobs)[0]]; },
    
    // --- Item Generation Logic (Loot) ---
    generateItems() {
        // マスタデータからテンプレートを展開してメモリに持つ（ここでは定義のみ）
        // 実際にはLootSystemで都度生成する
    },

    // ランダムなアイテムを生成して返す
    createRandomItem(floor) {
        const maxTier = Math.min(5, Math.ceil(floor / 5));
        
        // 1. タイプ抽選
        const types = Object.keys(MASTER_DATA.items.types);
        const typeKey = types[Math.floor(Math.random() * types.length)];
        const typeData = MASTER_DATA.items.types[typeKey];

        // 2. 素材抽選 (Floorに応じてTier重み付けも可能だが、簡易的に全素材から)
        const materials = MASTER_DATA.items.materials;
        // 重み付け抽選
        let totalW = materials.reduce((a,b)=>a+b.w, 0);
        let r = Math.random() * totalW;
        let mat = materials[0];
        for(let m of materials) {
            r -= m.w;
            if(r <= 0) { mat = m; break; }
        }

        // 3. レアリティ・Affix
        let rarity = 1;
        const rRoll = Math.random() + (floor * 0.01);
        if(rRoll > 0.98) rarity = 5;
        else if(rRoll > 0.90) rarity = 4;
        else if(rRoll > 0.70) rarity = 3;
        else if(rRoll > 0.40) rarity = 2;
        
        rarity = Math.min(rarity, maxTier + 2); // 階層キャップ

        // 4. データ構築
        let item = {
            uid: Math.random().toString(36).substr(2),
            name: `${mat.name}${typeData.name}`,
            kind: typeKey,
            slot: typeData.slot,
            stats: { ...typeData.base },
            rarity: rarity,
            tier: Math.max(1, mat.tier), // 素材Tierに依存
            elem: mat.elem || null
        };

        // ステータス合算
        for(let k in mat.mod) {
            if(k==='all') ['str','vit','mag','int','agi','luc'].forEach(s => item.stats[s] = (item.stats[s]||0) + mat.mod.all);
            else item.stats[k] = (item.stats[k]||0) + mat.mod[k];
        }

        // Affix付与 (Rare以上)
        if(rarity > 2) {
            const affixes = MASTER_DATA.items.affixes.filter(a => a.tier <= rarity);
            if(affixes.length > 0) {
                const aff = affixes[Math.floor(Math.random()*affixes.length)];
                item.name = `${aff.name} ${item.name}`;
                for(let k in aff.stats) {
                    if(k==='all') ['str','vit','mag','int','agi','luc'].forEach(s => item.stats[s] = (item.stats[s]||0) + aff.stats.all);
                    else item.stats[k] = (item.stats[k]||0) + aff.stats[k];
                }
            }
        }
        
        // Floor Scaling
        for(let k in item.stats) item.stats[k] = Math.ceil(item.stats[k] * (1 + floor * 0.1));

        return item;
    },

    // --- Enemy Generation ---
    createEnemy(floor, isElite=false) {
        const species = MASTER_DATA.enemies.species;
        const prefixes = MASTER_DATA.enemies.prefixes;
        
        let base = species[Math.floor(Math.random() * species.length)];
        // Floorが進むと強い敵が出やすくするならここでフィルタリング

        let prefix = isElite ? prefixes[Math.floor(Math.random() * prefixes.length)] : prefixes[0];
        let scale = 1 + (floor - 1) * 0.4;
        if(isElite) scale *= 1.5;

        return {
            name: prefix.name + base.name,
            hp: Math.floor(base.hp * scale * (prefix.mod || 1)),
            str: Math.floor((base.str||0) * scale * (prefix.mod || 1)),
            mag: Math.floor((base.mag||0) * scale * (prefix.mod || 1)),
            vit: Math.floor((base.vit||0) * scale * (prefix.mod || 1)),
            agi: Math.floor((base.agi||10) * scale),
            exp: Math.floor(base.exp * scale),
            gold: Math.floor(base.gold * scale),
            elem: base.elem
        };
    },

    getRandomTrap() {
        return MASTER_DATA.traps[Math.floor(Math.random() * MASTER_DATA.traps.length)];
    }
};

// Initialize DB immediately
DB.init();