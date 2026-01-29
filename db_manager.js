/**
 * Genetic Rogue - Database Manager (Ver.13.9 - Balanced Loot)
 * アイテムドロップのTier確率制御を実装
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
                    // 基本的な生成フィルタ
                    if(rank.tier === 1 && el.key !== null) return; 
                    if(rank.tier === 5 && el.key === null) return; 

                    let suffix = rank.prefix ? `_${rank.prefix}` : "";
                    const uniqueId = `${el.key||'n'}_${rank.tier}_${base.id}${suffix}`;
                    
                    const name = `${el.name}${rank.prefix}${base.name}`;
                    
                    let mod = { all: rank.mod };
                    if(el.key) mod.mag = (mod.mag||0) + 0.2; 

                    let reqJob = base.reqJob; 
                    if (!reqJob && rank.tier > 1) {
                        reqJob = base.id; 
                    }

                    // 属性要件の継承
                    let reqEl = base.reqEl ? [...base.reqEl] : [];
                    if (el.key) reqEl.push(el.key);

                    this.jobs[uniqueId] = {
                        id: uniqueId,
                        name: name,
                        tier: rank.tier,
                        type: base.type,
                        equip: base.equip,
                        lineage: base.lineage,
                        mod: mod,
                        reqEl: reqEl.length > 0 ? reqEl : null,
                        reqJob: reqJob,
                        reqStats: base.reqStats, 
                        baseId: base.id,
                        maxJobExp: rank.tier * 500,
                        masterSkill: base.masterSkill
                    };
                });
            });
        });
    },

    getJob(id) { 
        return this.jobs[id] || this.jobs[Object.keys(this.jobs)[0]]; 
    },
    
    // ★修正: バランス調整されたアイテム生成ロジック
    createRandomItem(floor) {
        // 1. ドロップTierの決定
        // 基本的なTier上限: 10階層ごとに+1 (1F=2, 10F=2, 11F=3...)
        let maxAllowedTier = Math.ceil(floor / 10) + 1;
        
        // ハードコードによる制限 (SF/神話級のロック)
        if (floor < 30) maxAllowedTier = Math.min(maxAllowedTier, 3);
        if (floor < 50) maxAllowedTier = Math.min(maxAllowedTier, 4);
        maxAllowedTier = Math.min(maxAllowedTier, 5); // 最大5

        // 重み付けテーブルの作成
        const targetTier = Math.max(1, Math.ceil(floor / 10)); // 適正Tier
        const tierWeights = [];
        
        for (let t = 1; t <= maxAllowedTier; t++) {
            let weight = 0;
            if (t === targetTier) weight = 70;      // 適正: 高確率
            else if (t < targetTier) weight = 20;   // 格下: 中確率
            else if (t === targetTier + 1) weight = 9; // 格上(レア): 低確率
            else weight = 1;                        // それ以上: 極低確率
            
            tierWeights.push({ tier: t, weight: weight });
        }
        
        // 抽選実行
        let totalW = tierWeights.reduce((a, b) => a + b.weight, 0);
        let r = Math.random() * totalW;
        let selectedTier = 1;
        for (let tw of tierWeights) {
            r -= tw.weight;
            if (r <= 0) {
                selectedTier = tw.tier;
                break;
            }
        }

        // 2. アイテム種別(Type)の抽選
        // selectedTier 以下のアイテム種別から選ぶ (例: Tier1ならビームサーベルは出ない)
        const typePool = Object.values(MASTER_DATA.items.types).filter(t => t.tier <= selectedTier);
        
        // 安全策: 候補がない場合はTier 1を使う
        const finalTypePool = typePool.length > 0 ? typePool : Object.values(MASTER_DATA.items.types).filter(t => t.tier === 1);
        const typeData = finalTypePool[Math.floor(Math.random() * finalTypePool.length)];

        // 3. 素材(Material)の抽選
        // selectedTier と一致する素材を優先的に選ぶ
        let matPool = MASTER_DATA.items.materials.filter(m => m.tier === selectedTier);
        
        // なければ下位Tierも含めて再検索
        if (matPool.length === 0) {
            matPool = MASTER_DATA.items.materials.filter(m => m.tier <= selectedTier);
        }
        // それでもなければTier 1
        if (matPool.length === 0) {
            matPool = MASTER_DATA.items.materials.filter(m => m.tier === 1);
        }

        // 素材の重み付け抽選 (spawn_weightを使用)
        let matTotalW = matPool.reduce((a,b)=>a+b.w, 0);
        let matR = Math.random() * matTotalW;
        let mat = matPool[0];
        for(let m of matPool) {
            matR -= m.w;
            if(matR <= 0) { mat = m; break; }
        }

        // 4. レアリティ決定 (階層補正付き)
        // 階層が深いほどレアが出やすくなる微補正
        let rarity = 1;
        const rarityRoll = Math.random();
        const floorBonus = Math.min(0.2, floor * 0.005); // 最大20%の補正
        
        if (rarityRoll < (0.01 + floorBonus)) rarity = 5; // Legend
        else if (rarityRoll < (0.06 + floorBonus)) rarity = 4; // Epic
        else if (rarityRoll < (0.18 + floorBonus)) rarity = 3; // Rare
        else if (rarityRoll < (0.45 + floorBonus)) rarity = 2; // Uncommon
        else rarity = 1; // Common

        // レアリティの上限は (Tier + 1) または 5
        rarity = Math.min(rarity, selectedTier + 2, 5);

        // 5. データ構築
        let item = {
            uid: Math.random().toString(36).substr(2),
            name: `${mat.name}${typeData.name}`,
            kind: typeData.kind,
            slot: typeData.slot,
            stats: { ...typeData.base },
            rarity: rarity,
            tier: Math.max(typeData.tier, mat.tier), 
            elem: mat.elem || typeData.elem || null
        };

        // 素材補正の適用
        for(let k in mat.mod) {
            if(k==='all') ['str','vit','mag','int','agi','luc'].forEach(s => item.stats[s] = (item.stats[s]||0) + mat.mod.all);
            else item.stats[k] = (item.stats[k]||0) + mat.mod[k];
        }

        // レアリティによるAffix付与 (Rare以上)
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
        
        // 階層によるスケーリング（微量）
        for(let k in item.stats) item.stats[k] = Math.ceil(item.stats[k] * (1 + floor * 0.1));

        return item;
    },

    createEnemy(floor, isElite=false) {
        // 敵のTier制限 (10階層ごとにキャップ解放イメージ)
        const maxTier = Math.max(1, Math.min(5, Math.ceil(floor / 10))); 
        
        let candidates = MASTER_DATA.enemies.species.filter(e => e.tier <= maxTier);
        if (candidates.length === 0) candidates = MASTER_DATA.enemies.species.filter(e => e.tier === 1);
        
        const base = candidates[Math.floor(Math.random() * candidates.length)];
        const prefixes = MASTER_DATA.enemies.prefixes;
        let prefix = isElite ? prefixes[Math.floor(Math.random() * prefixes.length)] : prefixes[0];
        
        // ステータス倍率
        let scale = 1 + (floor - 1) * 0.2; // 以前より少し緩やかに
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