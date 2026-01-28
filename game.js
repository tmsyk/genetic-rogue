/**
 * Genetic Rogue Ver.12.1 - Fixed
 * Main Logic & UI Controller
 */

// --- UTILS ---
const UTILS = {
    genName: () => {
        const n = ["アレク","ベル","シド","ダン","イヴ","フェイ","ジン","ハル","イアン","ジェイ","カイ","レオ","ミナ","ノア","オロ","ピオ"];
        return n[Math.floor(Math.random()*n.length)] + Math.floor(Math.random()*99);
    }
};

const Game = {
    helix: 100, floor: 1, maxFloor: 1, floorProgress: 0,
    party: [], roster: [], inventory: [],
    exploring: false, timer: null, currentEnemy: null,
    SAVE_KEY: 'genetic_rogue_v12_1',

    init() {
        if(localStorage.getItem(this.SAVE_KEY)) {
            this.load();
        } else {
            // 初期データ: Tier1の戦士と僧侶を探して雇用
            // DB.jobsのキーは "n_1_warrior" のような形式
            const warriorKey = Object.keys(DB.jobs).find(k => k.includes("n_") && k.includes("warrior") && DB.jobs[k].tier === 1);
            const priestKey = Object.keys(DB.jobs).find(k => k.includes("n_") && k.includes("priest") && DB.jobs[k].tier === 1);
            
            if(warriorKey) this.hire(warriorKey, true); 
            if(priestKey) this.hire(priestKey, true);
            
            this.save();
        }
        UI.init();
        UI.updateAll();
        UI.log("Genetic Rogue ver0.12.1 起動", "log-sys");
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
        this.party.forEach(c=>c.hp=c.totalStats.hp);
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
            this.floorProgress++;
            if(this.floorProgress >= 30) {
                this.floor++;
                this.floorProgress = 0;
                if(this.floor > this.maxFloor) this.maxFloor = this.floor;
                UI.log(`>>> 階層 ${this.floor} に到達！`, "log-victory");
            }
            UI.updateAll();

            const r = Math.random();
            if(r < 0.2) this.trap();
            else if(r < 0.7) this.encounter();
            else this.loot();
        }
        UI.renderParty();
    },

    encounter() {
        this.currentEnemy = DB.createEnemy(this.floor, this.floor % 5 === 0);
        UI.log(`遭遇: ${this.currentEnemy.name} (HP:${this.currentEnemy.hp})`, "log-combat");
    },

    combatRound() {
        const enemy = this.currentEnemy;
        const activeParty = this.party.filter(c=>c.hp>0);
        
        activeParty.forEach(c => {
            if(enemy.hp <= 0) return;
            let dmg = Math.max(1, Math.floor(c.totalStats.str - (enemy.vit/2)));
            dmg = Math.floor(dmg * (0.9 + Math.random()*0.2));
            enemy.hp -= dmg;
            UI.log(`${c.name}の攻撃 -> ${dmg}`);
        });

        if(enemy.hp <= 0) {
            UI.log("勝利！", "log-victory");
            this.helix += enemy.gold;
            activeParty.forEach(c => c.gainExp(enemy.exp));
            if(Math.random() < 0.3) this.loot();
            this.currentEnemy = null;
        } else {
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
        const trap = DB.getRandomTrap();
        const power = 1 + (this.floor * 0.5);
        const dmg = Math.floor(trap.base * power);
        
        UI.log(`罠だ！ ${trap.name} (Lv.${this.floor})`, "log-trap");
        
        const maxAgi = Math.max(...this.party.map(c=>c.hp>0?c.totalStats.agi:0));
        const diff = this.floor * 10;
        
        if(maxAgi > diff + (Math.random()*20)) {
            UI.log("回避に成功した！");
        } else {
            if(trap.type === 'dmg') {
                this.party.forEach(c => { if(c.hp>0) c.hp -= dmg; });
                UI.log(`全員に ${dmg} ダメージ！`, "log-dmg");
            }
            else {
                UI.log("毒を受けた！（未実装効果）", "log-trap");
            }
        }
    },

    loot() {
        const item = DB.createRandomItem(this.floor);
        this.inventory.push(item);
        UI.log(`獲得: ${item.name}`, "log-item");
        this.party.forEach(c => c.autoEquip(item));
    },

    hire(jobId, isFree=false) {
        if(!isFree && this.helix < MASTER_DATA.config.HIRE_COST) return;
        
        // IDチェック
        if (!jobId || !DB.jobs[jobId]) {
             console.error("Job ID not found or invalid:", jobId);
             return;
        }
        
        const job = DB.jobs[jobId];
        const baseJobDef = MASTER_DATA.jobs.find(def => def.id === job.baseId);
        const isBaseTier1 = baseJobDef ? (baseJobDef.tier === 1) : true;

        if ((job.tier !== 1 || !isBaseTier1) && !isFree) {
            console.warn("Only pure Tier 1 jobs can be hired directly.");
            return;
        }

        if(!isFree) this.helix -= MASTER_DATA.config.HIRE_COST;
        
        const c = new Character(jobId);
        this.roster.push(c);
        this.save();
        UI.updateAll();
        if (c.job) {
            UI.log(`${c.name} (${c.job.name}) を雇用しました。`);
        }
    },
    
    classChange(charId, newJobId) {
        const c = this.roster.find(x=>x.id===charId);
        if(!c) return;
        
        if(c.level < 10) return alert("Lv10以上必要です");
        if(this.helix < MASTER_DATA.config.CC_COST) return alert("Helix不足");

        this.helix -= MASTER_DATA.config.CC_COST;
        c.jobKey = newJobId;
        c.level = 1; 
        
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
        this.name = UTILS.genName();
        this.level = 1; this.exp = 0; this.maxExp = 100;
        this.hp = 100;
        
        this.baseStats = {...MASTER_DATA.config.BASE_STATS};
        for(let k in this.baseStats) this.baseStats[k] = Math.floor(this.baseStats[k] * (0.9 + Math.random()*0.2));
        
        this.equipment = {main_hand:null, body:null, accessory:null};
        
        this.personality = "凡人";
        this.elements = [];
        
        // Default Race
        const races = Object.keys(MASTER_DATA.races);
        this.race = races[Math.floor(Math.random()*races.length)];
    }

    get job() { return DB.getJob(this.jobKey); }

    get totalStats() {
        const s = {...this.baseStats};
        const job = this.job;
        const raceMod = MASTER_DATA.races[this.race] ? MASTER_DATA.races[this.race].mod : null;

        for(let k in s) {
            let m = (job && job.mod) ? (job.mod.all || job.mod[k] || 1.0) : 1.0;
            if (raceMod && raceMod[k]) m *= raceMod[k];
            s[k] = Math.floor(s[k] * m);
        }
        for(let k in this.equipment) {
            const it = this.equipment[k];
            if(it) {
                for(let st in it.stats) s[st] = (s[st]||0) + it.stats[st];
            }
        }
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
            this.hp = this.totalStats.hp;
            UI.log(`${this.name} Level Up! (Lv.${this.level})`);
        }
    }
    
    canEquip(item) {
        return true;
    }

    autoEquip(item) {
        if(!item.slot) return;
        const cur = this.equipment[item.slot];
        const curScore = cur ? Object.values(cur.stats).reduce((a,b)=>a+b,0) : 0;
        const newScore = Object.values(item.stats).reduce((a,b)=>a+b,0);
        
        if(newScore > curScore) {
            this.equipment[item.slot] = item;
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
        
        // 閉じるボタンのイベント設定（修正版）
        document.querySelectorAll('.close-modal').forEach(b => {
            b.onclick = () => this.closeModal();
        });
        
        // キーボードイベント（Escキーで閉じる）
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape') this.closeModal();
        });
        
        // タブ切り替え処理の修正
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tabId = e.target.getAttribute('data-tab');
                if(tabId) this.switchTab(tabId);
            };
        });
    },

    updateAll() {
        document.getElementById('helix-display').innerText = Game.helix;
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
            const jobData = DB.getJob(char.jobKey);
            const jobName = jobData ? jobData.name : char.jobKey;
            div.innerHTML = `
                <div class="char-header">${char.name} <span class="job-label">${jobName}</span></div>
                <div>Lv.${char.level} HP:${Math.floor(char.hp)}</div>
                <div style="font-size:10px; color:#888;">ATK:${char.totalStats.str}</div>
            `;
            c.appendChild(div);
        });
    },
    
    openModal(id, fn) { 
        document.getElementById(id).style.display='flex'; 
        if(fn) fn(); 
    },
    
    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(e => e.style.display='none');
    },
    
    // Fixed switchTab logic
    switchTab(mode) {
        this.currentTab = mode;
        document.querySelectorAll('.tab-content').forEach(e => e.style.display = 'none');
        const target = document.getElementById('tab-lab-' + mode);
        if(target) target.style.display = 'block';
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if(btn.getAttribute('data-tab') === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        });

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
            const jobData = DB.getJob(c.jobKey);
            const jobName = jobData ? jobData.name : c.jobKey;
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
        // Only pure Tier 1 jobs
        Object.values(DB.jobs).filter(j => {
            if (j.tier !== 1) return false;
            if (j.reqJob) return false;
            const baseJobDef = MASTER_DATA.jobs.find(def => def.id === j.baseId);
            return baseJobDef && baseJobDef.tier === 1;
        }).forEach(j => {
            const div = document.createElement('div');
            div.className = "list-item";
            div.innerHTML = `${j.name}`;
            div.onclick = () => Game.hire(j.id);
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
                const jobData = DB.getJob(c.jobKey);
                const jobName = jobData ? jobData.name : c.jobKey;
                div.innerHTML = `${c.name} (${jobName})`;
                div.onclick = () => { this.selChar = c; this.renderClass(); };
                el.appendChild(div);
            });
            return;
        }

        const currentJob = DB.getJob(this.selChar.jobKey);
        if(!currentJob) return;

        const nextJobs = Object.keys(DB.jobs).filter(k => {
            const j = DB.jobs[k];
            return j.tier === currentJob.tier + 1 && j.lineage === currentJob.lineage;
        });

        if(nextJobs.length === 0) el.innerHTML = "<div>転職可能な職業がありません</div>";

        nextJobs.forEach(k => {
            const job = DB.jobs[k];
            const div = document.createElement('div');
            div.className = "list-item";
            div.innerHTML = `${job.name} (T${job.tier})`;
            div.onclick = () => { Game.classChange(this.selChar.id, k); this.selChar=null; this.renderClass(); };
            el.appendChild(div);
        });
        
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

window.onload = () => Game.init();