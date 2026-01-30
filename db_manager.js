/**
 * Genetic Rogue - Database Manager (Ver.13.19 - Direct Load)
 */

const DB = {
    jobs: {},
    items: [],

    init() {
        this.generateJobs();
        console.log(`[DB] Initialized. Jobs: ${Object.keys(this.jobs).length}`);
    },

    generateJobs() {
        // ★修正: ループによる自動生成をやめ、CSVデータをそのままロードする
        // これにより「属性ごとの重複」や「意図しないランク」の生成を防ぐ
        MASTER_DATA.jobs.forEach(job => {

            // ★追加: 前提ジョブIDから「必要なスキル(reqSkill)」を特定する
            // 転職条件をジョブIDではなく、そのジョブで習得するマスタースキルに変更するため
            let reqSkill = null;
            if (job.reqJob) {
                const parentJob = MASTER_DATA.jobs.find(j => j.id === job.reqJob);
                if (parentJob && parentJob.masterSkill) {
                    reqSkill = parentJob.masterSkill;
                }
            }

            // IDをキーとして登録
            this.jobs[job.id] = {
                ...job,
                // 基本プロパティの補完
                maxJobExp: job.tier * 500,
                // 属性要件の処理（CSVにあれば）
                reqEl: job.reqEl || null,
                // ★追加: 転職条件スキル
                reqSkill: reqSkill
            };
        });
    },

    getJob(id) {
        return this.jobs[id] || this.jobs[Object.keys(this.jobs)[0]];
    },

    createRandomItem(floor) {
        const maxTier = Math.max(1, Math.min(5, Math.ceil(floor / 5)));
        const types = Object.keys(MASTER_DATA.items.types);
        const typeKey = types[Math.floor(Math.random() * types.length)];
        const typeData = MASTER_DATA.items.types[typeKey];

        // Tierフィルタリング
        const materials = MASTER_DATA.items.materials.filter(m => m.tier <= maxTier);
        const matPool = materials.length > 0 ? materials : MASTER_DATA.items.materials.filter(m => m.tier === 1);

        let totalW = matPool.reduce((a, b) => a + b.w, 0);
        let r = Math.random() * totalW;
        let mat = matPool[0];
        for (let m of matPool) {
            r -= m.w;
            if (r <= 0) { mat = m; break; }
        }

        let rarity = 1;
        const rRoll = Math.random() + (floor * 0.01);
        if (rRoll > 0.98) rarity = 5;
        else if (rRoll > 0.90) rarity = 4;
        else if (rRoll > 0.70) rarity = 3;
        else if (rRoll > 0.40) rarity = 2;
        rarity = Math.min(rarity, maxTier + 2);

        let item = {
            uid: Math.random().toString(36).substr(2),
            name: `${mat.name}${typeData.name}`,
            kind: typeData.kind,
            slot: typeData.slot,
            stats: { ...typeData.base },
            rarity: rarity,
            tier: Math.max(1, mat.tier),
            elem: mat.elem || typeData.elem || null
        };

        for (let k in mat.mod) {
            if (k === 'all') ['str', 'vit', 'mag', 'int', 'agi', 'luc'].forEach(s => item.stats[s] = (item.stats[s] || 0) + mat.mod.all);
            else item.stats[k] = (item.stats[k] || 0) + mat.mod[k];
        }

        if (rarity > 2) {
            const affixes = MASTER_DATA.items.affixes.filter(a => a.tier <= rarity);
            if (affixes.length > 0) {
                const aff = affixes[Math.floor(Math.random() * affixes.length)];
                item.name = `${aff.name} ${item.name}`;
                for (let k in aff.stats) {
                    if (k === 'all') ['str', 'vit', 'mag', 'int', 'agi', 'luc'].forEach(s => item.stats[s] = (item.stats[s] || 0) + aff.stats.all);
                    else item.stats[k] = (item.stats[k] || 0) + aff.stats[k];
                }
            }
        }

        // Balance: Reduced floor multiplier from 0.1 to 0.05
        for (let k in item.stats) item.stats[k] = Math.ceil(item.stats[k] * (1 + floor * 0.05));

        return item;
    },

    createEnemy(floor, isElite = false) {
        const maxTier = Math.max(1, Math.min(5, Math.ceil(floor / 5)));
        let candidates = MASTER_DATA.enemies.species.filter(e => e.tier <= maxTier);
        if (candidates.length === 0) candidates = MASTER_DATA.enemies.species.filter(e => e.tier === 1);
        const base = candidates[Math.floor(Math.random() * candidates.length)];
        const prefixes = MASTER_DATA.enemies.prefixes;
        let prefix = isElite ? prefixes[Math.floor(Math.random() * prefixes.length)] : prefixes[0];
        // Balance: Increased enemy scale multiplier from 0.4 to 0.6 per floor level equivalent
        let scale = 1 + (floor - 1) * 0.6;
        if (isElite) scale *= 1.5;

        return {
            name: prefix.name + base.name,
            hp: Math.floor(base.hp * scale * (prefix.mod || 1)),
            str: Math.floor((base.str || 0) * scale * (prefix.mod || 1)),
            mag: Math.floor((base.mag || 0) * scale * (prefix.mod || 1)),
            vit: Math.floor((base.vit || 0) * scale * (prefix.mod || 1)),
            agi: Math.floor((base.agi || 10) * scale),
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