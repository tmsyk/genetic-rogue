/**
 * Genetic Rogue Ver.12.0
 * Main Logic & UI Controller
 */

const Game = {
    helix: 100, floor: 1, maxFloor: 1, floorProgress: 0,
    party: [], roster: [], inventory: [],
    exploring: false, timer: null, currentEnemy: null,
    SAVE_KEY: 'genetic_rogue_v12',

    init() {
        if(localStorage.getItem(this.SAVE_KEY)) {
            this.load();
        } else {
            // 初期データ: Tier1の戦士と僧侶を探して雇用
            // (data_jobs.jsで生成されたJOB_DATAから検索)
            const warriorKey = Object.keys(JOB_DATA).find(k => k.includes("n_") && k.includes("warrior") && JOB_DATA[k].tier === 1);
            const priestKey = Object.keys(JOB_DATA).find(k => k.includes("n_") && k.includes("priest") && JOB_DATA[k].tier === 1);
            
            if(warriorKey) this.hire(warriorKey, true); // true = free
            if(priestKey) this.hire(priestKey, true);
            
            this.save();
        }
        UI.init();
        UI.updateAll();
        UI.log("Genetic Rogue v12 起動", "log-sys");
    },

    save() {
        const data = {
            helix: this.helix, floor: this.floor, maxFloor: this.maxFloor,
            inventory: this.inventory,
            roster: this.roster, partyIds: this.party.map(c=>c.id)
        };
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
    },

    load() {
        try {
            const d = JSON.parse(localStorage.getItem(this.SAVE_KEY));
            if(!d) return;
            this.helix = d.helix; this.maxFloor = d.maxFloor;
            this.inventory = d.inventory || [];
            this.roster = (d.roster||[]).map(x => new Character(null, null, x));
            this.party = [];
            (d.partyIds||[]).forEach(id => {
                const c = this.roster.find(x=>x.id===id);
                if(c) this.party.push(c);
            });
        } catch(e) { console.error(e); }
    },

    // --- Actions ---
    explore(f) {
        if(this.party.length===0) return alert("パーティがいません");
        if(this.party.every(c=>c.hp<=0)) {
             // 全滅状態なら回復させてあげる（テスト用親切設計）
             this.party.forEach(c=>c.hp=c.totalStats.hp);
        }
        this.floor = parseInt(f);
        this.floorProgress = 0;
        this.exploring = true;
        this.currentEnemy = null;
        UI.toggle(true);
        UI.log(`階層 ${this.floor} 探索開始`);
        this.timer = setInterval(()=>this.tick(), 800);
    },

    stop() {
        this.exploring = false;
        clearInterval(this.timer);
        this.party.forEach(c=>c.hp=c.totalStats.hp); // 帰還時回復
        this.currentEnemy = null;
        this.save();
        UI.toggle(false);
        UI.updateAll();
        UI.log("帰還しました。");
    },

    tick() {
        if(this.party.every(c=>c.hp<=0)) {
            UI.log("全滅しました...", "log-defeat");
            this.stop();
            return;
        }

        if(this.currentEnemy) {
            this.combatRound();
        } else {
            // 歩行
            this.floorProgress++;
            if(this.floorProgress >= 30) {
                this.floor++;
                this.floorProgress = 0;
                if(this.floor > this.maxFloor) this.maxFloor = this.floor;
                UI.log(`>>> 階層 ${this.floor} に到達！`, "log-victory");
            }
            UI.updateAll();

            // イベント判定
            const r = Math.random();
            if(r < 0.2) this.trap();
            else if(r < 0.7) this.encounter();
            else this.loot();
        }
        UI.renderParty();
    },

    encounter() {
        // 敵生成
        // data_enemies.js のデータを使用
        const power = 1 + (this.floor * 0.4);
        const base = MONSTER_SPECIES[Math.floor(Math.random()*MONSTER_SPECIES.length)];
        
        // 5階層ごとに強敵（Prefix付き）
        let prefix = MONSTER_PREFIXES[0]; // default empty
        if(this.floor % 5 === 0 && Math.random() < 0.5) {
            prefix = MONSTER_PREFIXES[Math.floor(Math.random()*(MONSTER_PREFIXES.length-1)) + 1];
        }

        this.currentEnemy = {
            name: prefix.name + base.name,
            hp: Math.floor(base.hp * power * prefix.mod),
            maxHp: Math.floor(base.hp * power * prefix.mod),
            str: Math.floor(base.str * power * prefix.mod),
            vit: Math.floor((base.vit||0) * power * prefix.mod),
            agi: Math.floor((base.agi||5) * power),
            exp: Math.floor(10 * power * prefix.mod),
            gold: Math.floor(5 * power)
        };
        UI.log(`遭遇: ${this.currentEnemy.name} (HP:${this.currentEnemy.hp})`, "log-combat");
    },

    combatRound() {
        const enemy = this.currentEnemy;
        const activeParty = this.party.filter(c=>c.hp>0);
        
        // Player Turn
        activeParty.forEach(c => {
            if(enemy.hp <= 0) return;
            // 簡易ダメージ計算: STR - 敵VIT/2
            let dmg = Math.max(1, Math.floor(c.totalStats.str - (enemy.vit/2)));
            // ランダム幅
            dmg = Math.floor(dmg * (0.9 + Math.random()*0.2));
            enemy.hp -= dmg;
            UI.log(`${c.name}の攻撃 -> ${dmg}`);
        });

        // Enemy Turn / Result
        if(enemy.hp <= 0) {
            UI.log("勝利！", "log-victory");
            this.helix += enemy.gold;
            activeParty.forEach(c => c.gainExp(enemy.exp));
            
            // ドロップ判定
            if(Math.random() < 0.3) this.loot();
            
            this.currentEnemy = null;
        } else {
            // 敵の攻撃（ランダムターゲット）
            const target = activeParty[Math.floor(Math.random()*activeParty.length)];
            if(target) {
                let dmg = Math.max(1, Math.floor(enemy.str - (target.totalStats.vit/2)));
                target.hp -= dmg;
                UI.log(`${target.name} に ${dmg} のダメージ`, "log-dmg");
                if(target.hp <= 0) UI.log(`${target.name} は倒れた...`, "log-defeat");
            }
        }
    },

    trap() {
        // data_enemies.js の TRAP_TYPES を使用
        const trap = TRAP_TYPES[Math.floor(Math.random()*TRAP_TYPES.length)];
        const power = 1 + (this.floor * 0.5);
        const dmg = Math.floor(trap.base * power);
        
        UI.log(`罠だ！ ${trap.name} (Lv.${this.floor})`, "log-trap");
        
        // 回避判定 (AGI)
        const maxAgi = Math.max(...this.party.map(c=>c.hp>0?c.totalStats.agi:0));
        const diff = this.floor * 10;
        
        if(maxAgi > diff + (Math.random()*20)) {
            UI.log("回避に成功した！");
        } else {
            if(trap.type === 'dmg') {
                this.party.forEach(c => { if(c.hp>0) c.hp -= dmg; });
                UI.log(`全員に ${dmg} ダメージ！`, "log-dmg");
            }
            if(trap.type === 'status') {
                UI.log("毒を受けた！（未実装効果）", "log-trap");
            }
        }
    },

    loot() {
        // Generate random item
        // data_items.js の ITEM_TEMPLATES を使用
        const keys = Object.keys(ITEM_TEMPLATES);
        const key = keys[Math.floor(Math.random()*keys.length)];
        const tpl = ITEM_TEMPLATES[key];
        
        // 簡易生成（本来はLootSystemクラスなどで詳細に行う）
        const item = {
            id: Math.random().toString(36),
            name: tpl.name,
            kind: tpl.kind,
            slot: tpl.slot,
            stats: {...tpl.base},
            tier: tpl.tier,
            rarity: 1
        };
        // 階層補正
        for(let k in item.stats) item.stats[k] = Math.floor(item.stats[k] * (1 + this.floor*0.2));
        
        this.inventory.push(item);
        UI.log(`獲得: ${item.name}`, "log-item");
        
        // 自動装備チェック
        this.party.forEach(c => c.autoEquip(item));
    },

    hire(jobId, isFree=false) {
        if(!isFree && this.helix < CONFIG.HIRE_COST) return;
        if(!isFree) this.helix -= CONFIG.HIRE_COST;
        
        const c = new Character(jobId);
        this.roster.push(c);
        this.save();
        UI.updateAll();
    },
    
    classChange(charId, newJobId) {
        const c = this.roster.find(x=>x.id===charId);
        if(!c) return;
        
        // 条件チェック（簡易）
        if(c.level < 10) return alert("Lv10以上必要です");
        if(this.helix < CONFIG.CC_COST) return alert("Helix不足");

        this.helix -= CONFIG.CC_COST;
        c.jobKey = newJobId;
        c.level = 1; // Reset Level (Bonus stats logic omitted for brevity)
        
        this.save();
        UI.updateAll();
        alert(`${c.name} は転職しました！`);
    }
};

class Character {
    constructor(jobKey, parents, data) {
        if(data) { Object.assign(this, data); return; }
        this.id = Math.random().toString(36);
        this.jobKey = jobKey;
        this.name = this.genName();
        this.level = 1; this.exp = 0; this.maxExp = 100;
        this.hp = 100;
        
        // data_core.js の CONFIG.BASE_STATS を使用
        this.baseStats = {...CONFIG.BASE_STATS};
        // 個体差
        for(let k in this.baseStats) this.baseStats[k] = Math.floor(this.baseStats[k] * (0.9 + Math.random()*0.2));
        
        this.equipment = {main_hand:null, body:null, accessory:null};
    }

    genName() {
        const n = ["アレク","ベル","シド","ダン","イヴ","フェイ","ジン","ハル","イアン","ジェイ"];
        return n[Math.floor(Math.random()*n.length)] + Math.floor(Math.random()*99);
    }
    
    get totalStats() {
        const s = {...this.baseStats};
        // Job補正 (JOB_DATA[this.jobKey].mod)
        const job = JOB_DATA[this.jobKey];
        if(job && job.mod) {
            for(let k in s) {
                let m = job.mod.all || job.mod[k] || 1.0;
                s[k] = Math.floor(s[k] * m);
            }
        }
        
        // 装備補正
        for(let k in this.equipment) {
            const it = this.equipment[k];
            if(it) {
                for(let st in it.stats) s[st] = (s[st]||0) + it.stats[st];
            }
        }
        // レベル補正
        for(let k in s) {
            s[k] += Math.floor((s[k]*0.1) * (this.level-1));
        }
        return s;
    }

    gainExp(v) {
        this.exp += v;
        if(this.exp >= this.maxExp) {
            this.level++;
            this.exp = 0;
            this.maxExp *= 1.2;
            this.hp = this.totalStats.hp; // 全回復
            UI.log(`${this.name} Level Up! (Lv.${this.level})`);
        }
    }
    
    autoEquip(item) {
        if(!item.slot) return;
        // 簡易ロジック: ステータス合計値が高ければ装備
        const cur = this.equipment[item.slot];
        const curScore = cur ? Object.values(cur.stats).reduce((a,b)=>a+b,0) : 0;
        const newScore = Object.values(item.stats).reduce((a,b)=>a+b,0);
        
        if(newScore > curScore) {
            this.equipment[item.slot] = item;
            // 古い装備は消滅（簡易実装）またはインベントリに戻す処理が必要
            UI.log(`${this.name}が${item.name}を装備`, "log-equip");
        }
    }
}

// --- UI Controller ---
const UI = {
    currentTab: 'roster',
    selChar: null,

    init() {
        document.getElementById('btn-explore').onclick = ()=>Game.explore(1);
        document.getElementById('btn-return').onclick = ()=>Game.stop();
        document.getElementById('btn-lab').onclick = ()=>this.openModal('modal-lab', ()=>this.renderLab());
        
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.onclick = (e) => this.switchTab(e.target.dataset.tab);
        });
    },

    updateAll() {
        document.getElementById('helix-display').innerText = Game.helix;
        // floor-displayが無い場合のエラー回避
        const fd = document.getElementById('floor-display');
        if(fd) fd.innerText = Game.floor;
        
        this.renderParty();
        if(document.getElementById('modal-lab').style.display === 'flex') this.renderLab();
    },

    renderParty() {
        const c = document.getElementById('party-container');
        c.innerHTML = "";
        Game.party.forEach(char => {
            const div = document.createElement('div');
            div.className = "char-card";
            const jobName = JOB_DATA[char.jobKey] ? JOB_DATA[char.jobKey].name : char.jobKey;
            div.innerHTML = `
                <div class="char-header">${char.name} <span class="job-label">${jobName}</span></div>
                <div>Lv.${char.level} HP:${Math.floor(char.hp)}</div>
                <div style="font-size:10px; color:#888;">ATK:${char.totalStats.str}</div>
            `;
            c.appendChild(div);
        });
    },
    
    // Lab UI Logic
    openModal(id, fn) { document.getElementById(id).style.display='flex'; if(fn)fn(); },
    
    switchTab(t) {
        this.currentTab = t;
        document.querySelectorAll('.tab-content').forEach(e=>e.style.display='none');
        document.getElementById('tab-lab-'+t).style.display='block';
        this.renderLab();
    },

    renderLab() {
        if(this.currentTab === 'roster') this.renderRoster();
        if(this.currentTab === 'hire') this.renderHire();
        if(this.currentTab === 'class') this.renderClass();
    },

    renderRoster() {
        const el = document.getElementById('lab-list');
        el.innerHTML = "";
        Game.roster.forEach(c => {
            const div = document.createElement('div');
            div.className = "list-item";
            const inPt = Game.party.find(x=>x.id===c.id);
            const jobName = JOB_DATA[c.jobKey] ? JOB_DATA[c.jobKey].name : c.jobKey;
            div.innerHTML = `${c.name} (${jobName}) ${inPt?'[PT]':''}`;
            div.onclick = () => {
                if(inPt) Game.party = Game.party.filter(x=>x.id!==c.id);
                else if(Game.party.length < 6) Game.party.push(c);
                Game.save();
                this.updateAll();
            };
            el.appendChild(div);
        });
    },

    renderHire() {
        const el = document.getElementById('guild-list');
        el.innerHTML = "";
        // Only Tier 1 jobs for hire
        Object.keys(JOB_DATA).filter(k => JOB_DATA[k].tier === 1 && k.includes('n_')).forEach(k => {
            const job = JOB_DATA[k];
            const div = document.createElement('div');
            div.className = "list-item";
            div.innerHTML = `${job.name}`;
            div.onclick = () => Game.hire(k);
            el.appendChild(div);
        });
    },
    
    renderClass() {
        const el = document.getElementById('cc-job-list');
        el.innerHTML = "";
        if(!this.selChar) {
            Game.roster.forEach(c => {
                const div = document.createElement('div');
                div.className = "list-item";
                const jobName = JOB_DATA[c.jobKey] ? JOB_DATA[c.jobKey].name : c.jobKey;
                div.innerHTML = `${c.name} (${jobName})`;
                div.onclick = () => { this.selChar = c; this.renderClass(); };
                el.appendChild(div);
            });
            return;
        }

        // Show Next Tier Jobs
        const currentJob = JOB_DATA[this.selChar.jobKey];
        if(!currentJob) return;

        const nextJobs = Object.keys(JOB_DATA).filter(k => {
            const j = JOB_DATA[k];
            // Simple logic: same lineage, next tier
            return j.tier === currentJob.tier + 1 && j.lineage === currentJob.lineage;
        });

        if(nextJobs.length === 0) el.innerHTML = "<div>転職可能な職業がありません</div>";

        nextJobs.forEach(k => {
            const job = JOB_DATA[k];
            const div = document.createElement('div');
            div.className = "list-item";
            div.innerHTML = `${job.name} (T${job.tier})`;
            div.onclick = () => { Game.classChange(this.selChar.id, k); this.selChar=null; this.renderClass(); };
            el.appendChild(div);
        });
        
        // Back Button
        const back = document.createElement('div');
        back.innerHTML = "<button onclick='UI.selChar=null; UI.renderClass()'>戻る</button>";
        el.appendChild(back);
    },

    toggle(on) {},
    log(msg, type) {
        const p = document.getElementById('log-list');
        p.innerHTML += `<div class="log-entry ${type}">${msg}</div>`;
        document.getElementById('log-panel').scrollTop = 99999;
    }
};

// Start
window.onload = () => Game.init();