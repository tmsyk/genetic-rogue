/**
 * Genetic Rogue - Database Manager
 */

const DB = {
    jobs: {},
    items: [],
    
    init() {
        this.generateJobs();
        console.log(`[DB] Initialized. Jobs: ${Object.keys(this.jobs).length}`);
    },

    generateJobs() {
        const ranks = MASTER_DATA.job_ranks;
        const elements = MASTER_DATA.elements;
        const allElements = [{key:null, name:"", mod:{}}].concat(elements);

        MASTER_DATA.jobs.forEach(base => {
            ranks.forEach(rank => {
                allElements.forEach(el => {
                    if(rank.tier === 1 && el.key !== null) return; 
                    if(rank.tier === 5 && el.key === null) return; 

                    const uniqueId = `${el.key||'n'}_${rank.tier}_${base.id}`;
                    
                    const name = `${el.name}${rank.prefix}${base.name}`;
                    
                    let mod = { all: rank.mod };
                    if(el.key) mod.mag = (mod.mag||0) + 0.2; 

                    let reqJob = base.reqJob; 
                    if (!reqJob && rank.tier > 1) {
                        reqJob = base.id; // Fallback to base requirement
                    }

                    this.jobs[uniqueId] = {
                        id: uniqueId,
                        name: name,
                        tier: rank.tier,
                        type: base.type,
                        equip: base.equip,
                        lineage: base.lineage,
                        mod: mod,
                        reqEl: el.key ? [el.key] : null,
                        reqJob: reqJob,
                        reqStats: base.reqStats, // Pass requirements
                        baseId: base.id
                    };
                });
            });
        });
    },

    getJob(id) { 
        return this.jobs[id] || this.jobs[Object.keys(this.jobs)[0]]; 
    },
    
    createRandomItem(floor) {
        // アイテムのTier制限
        const maxTier = Math.min(5, Math.ceil(floor / 5));
        
        // アイテム種別、素材をランダム選択
        // ※実際にはここでTierに基づいた素材フィルタリングなどを入れるとさらに良い
        const types = Object.keys(MASTER_DATA.items.types);
        const typeKey = types[Math.floor(Math.random() * types.length)];
        const typeData = MASTER_DATA.items.types[typeKey];
        
        // 素材の選択（Tierフィルタリング）
        // 階層以下のTierの素材のみ抽選対象にする
        const materials = MASTER_DATA.items.materials.filter(m => m.tier <= maxTier);
        
        // フィルタ結果が空ならTier1素材を使う（フォールバック）
        const pool = materials.length > 0 ? materials : MASTER_DATA.items.materials.filter(m => m.tier === 1);

        let totalW = pool.reduce((a,b)=>a+b.w, 0);
        let r = Math.random() * totalW;
        let mat = pool[0];
        for(let m of pool) {
            r -= m.w;
            if(r <= 0) { mat = m; break; }
        }
        
        let rarity = 1;
        const rRoll = Math.random() + (floor * 0.01);
        if(rRoll > 0.98) rarity = 5;
        else if(rRoll > 0.90) rarity = 4;
        else if(rRoll > 0.70) rarity = 3;
        else if(rRoll > 0.40) rarity = 2;
        
        rarity = Math.min(rarity, maxTier + 2); 

        let item = {
            uid: Math.random().toString(36).substr(2),
            name: `${mat.name}${typeData.name}`,
            kind: typeKey,
            slot: typeData.slot,
            stats: { ...typeData.base },
            rarity: rarity,
            tier: Math.max(1, mat.tier), 
            elem: mat.elem || null
        };

        for(let k in mat.mod) {
            if(k==='all') ['str','vit','mag','int','agi','luc'].forEach(s => item.stats[s] = (item.stats[s]||0) + mat.mod.all);
            else item.stats[k] = (item.stats[k]||0) + mat.mod[k];
        }

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
        
        // 階層補正
        for(let k in item.stats) item.stats[k] = Math.ceil(item.stats[k] * (1 + floor * 0.1));

        return item;
    },

    createEnemy(floor, isElite=false) {
        // 敵のTier制限ロジック
        const maxTier = Math.max(1, Math.ceil(floor / 5)); // 5階層ごとにTierキャップ解放
        
        // 現在のTier以下の敵のみ抽出
        let candidates = MASTER_DATA.enemies.species.filter(e => e.tier <= maxTier);
        
        // 候補がない場合はTier 1を出す（安全策）
        if (candidates.length === 0) {
            candidates = MASTER_DATA.enemies.species.filter(e => e.tier === 1);
        }

        const base = candidates[Math.floor(Math.random() * candidates.length)];
        
        const prefixes = MASTER_DATA.enemies.prefixes;
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

DB.init();