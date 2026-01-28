/**
 * Genetic Rogue Ver.12.2 - Title & CharMake (Fixed)
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
    SAVE_KEY: 'genetic_rogue_v12_2', // Version Key Update

    init() {
        UI.init();
        // いきなりロードせず、タイトル画面を表示
        UI.showTitleScreen();
    },

    // 新規ゲーム開始
    startNewGame(raceId, jobKey) {
        this.helix = 100;
        this.floor = 1;
        this.maxFloor = 1;
        this.floorProgress = 0;
        this.party = [];
        this.roster = [];
        this.inventory = [];
        this.currentEnemy = null;

        // 最初のキャラクター生成 (指定された種族・職業)
        const c = new Character(jobKey, null, { race: raceId });
        this.roster.push(c);
        this.party.push(c);

        // おまけアイテム (修正: LootSystem -> DB.createRandomItem)
        let starter = DB.createRandomItem(1);
        if(!starter) starter = { uid: "starter", name:"粗末な剣", kind:"sw", type:"weapon", slot:"main_hand", stats:{atk:2}, rarity:1 };
        this.inventory.push(starter);
        c.autoEquip(starter);

        this.save();
        UI.updateAll();
        UI.log("Genetic Rogue 開始", "log-sys");
        UI.log(`${c.name} が冒険の準備を整えました。`, "log-sys");
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
            if(!d) return false;
            this.helix = d.helix; this.maxFloor = d.maxFloor;
            this.inventory = d.inventory || [];
            this.roster = (d.roster||[]).map(x => new Character(null, null, x));
            this.party = [];
            (d.partyIds||[]).forEach(id => {
                const c = this.roster.find(x=>x.id===id);
                if(c) this.party.push(c);
            });
            UI.updateAll();
            UI.log("データをロードしました。", "log-sys");
            return true;
        } catch(e) { 
            console.error(e); 
            return false;
        }
    },

    hasSaveData() {
        return !!localStorage.getItem(this.SAVE_KEY);
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
        
        // 自動装備ロジック
        let isEquipped = false;
        for (const char of this.party) {
            if (char.autoEquip(item)) {
                isEquipped = true;
                break; 
            }
        }

        if (!isEquipped) {
            this.inventory.push(item);
            UI.log(`獲得: ${item.name}`, "log-item");
        }
    },

    hire(jobId, isFree=false) {
        if(!isFree && this.helix < MASTER_DATA.config.HIRE_COST) return;
        
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
    },
    
    sellTrash() {
        let sold = 0;
        let gain = 0;
        for(let i=this.inventory.length-1; i>=0; i--) {
            if(this.inventory[i].rarity <= 2) {
                gain += 10 + (this.inventory[i].tier * 5);
                this.inventory.splice(i, 1);
                sold++;
            }
        }
        if(sold > 0) {
            this.helix += gain;
            UI.log(`売却: ${sold}個 (+${gain} Helix)`, "log-item");
            this.save();
            UI.updateAll();
            UI.renderInv();
        } else {
            alert("売却できるアイテム（コモン以下）がありません。");
        }
    }
};

class Character {
    constructor(jobKey, parents, data) {
        // ロード時またはオプション指定時
        if(data && data.id) { 
            Object.assign(this, data); 
            return; 
        }

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
        
        // Race initialization
        const races = Object.keys(MASTER_DATA.races);
        if (data && data.race) {
            this.race = data.race;
        } else {
            // Default random
            this.race = races[Math.floor(Math.random()*races.length)];
        }
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
        if(!item.slot) return false;
        
        const cur = this.equipment[item.slot];
        const curScore = cur ? Object.values(cur.stats).reduce((a,b)=>a+b,0) : 0;
        const newScore = Object.values(item.stats).reduce((a,b)=>a+b,0);
        
        if(newScore > curScore) {
            if(cur) Game.inventory.push(cur);
            this.equipment[item.slot] = item;
            UI.log(`${this.name}が${item.name}を装備`, "log-equip");
            return true;
        }
        return false;
    }
    
    unequip(slot) {
        if(this.equipment[slot]) {
            Game.inventory.push(this.equipment[slot]);
            this.equipment[slot] = null;
        }
    }
}

// --- UI Controller ---
const UI = {
    currentTab: 'roster',
    selChar: null,

    init() {
        const bind = (id, fn) => {
            const el = document.getElementById(id);
            if(el) el.onclick = fn;
        };

        bind('btn-explore', () => Game.explore(1));
        bind('btn-return', () => Game.stop());
        bind('btn-lab', () => this.openModal('modal-lab', () => this.renderLab()));
        bind('btn-inv', () => this.openModal('modal-inv', () => this.renderInv()));
        bind('btn-settings', () => this.openModal('modal-settings'));
        bind('btn-help', () => this.openModal('modal-rules'));
        bind('btn-sell-trash', () => Game.sellTrash());
        
        document.querySelectorAll('.close-modal').forEach(b => {
            b.onclick = () => this.closeModal();
        });
        
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape') this.closeModal();
        });
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tabId = e.target.getAttribute('data-tab');
                if(tabId) this.switchTab(tabId);
            };
        });
    },

    // タイトル画面表示（新規追加）
    showTitleScreen() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'modal-title';
        modal.style.display = 'flex';
        
        const hasData = Game.hasSaveData();
        const loadDisabled = hasData ? '' : 'disabled';
        const loadStyle = hasData ? 'background:var(--accent-color); color:#000;' : 'opacity:0.5; cursor:not-allowed;';

        modal.innerHTML = `
            <div class="modal-box" style="text-align:center; padding:40px;">
                <h1 style="color:var(--accent-color); font-size:32px; margin-bottom:10px;">🧬 Genetic Rogue</h1>
                <p style="color:#888; margin-bottom:40px;">Ver.12.2</p>
                
                <div style="display:flex; flex-direction:column; gap:20px; width:200px; margin:0 auto;">
                    <button id="title-load" style="padding:15px; font-weight:bold; font-size:16px; ${loadStyle}" ${loadDisabled}>続きから (Load)</button>
                    <button id="title-new" style="padding:15px; font-size:16px;">はじめから (New Game)</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('title-load').onclick = () => {
            if(Game.load()) {
                modal.remove();
            } else {
                alert("セーブデータの読み込みに失敗しました");
            }
        };
        document.getElementById('title-new').onclick = () => {
            if(hasData) {
                if(!confirm("セーブデータが存在します。上書きして新規開始しますか？")) return;
            }
            modal.remove();
            this.showCharMake();
        };
    },

    // キャラクター作成画面（新規追加）
    showCharMake() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';

        // 選択可能な職業リスト (Tier 1 & No Req)
        const jobOptions = Object.values(DB.jobs)
            .filter(j => j.tier === 1 && !j.reqJob && MASTER_DATA.jobs.find(def => def.id === j.baseId).tier === 1)
            .map(j => `<option value="${j.id}">${j.name}</option>`)
            .join('');

        const raceOptions = Object.keys(MASTER_DATA.races)
            .map(k => `<option value="${k}">${MASTER_DATA.races[k].name}</option>`)
            .join('');

        modal.innerHTML = `
            <div class="modal-box">
                <div class="modal-header"><h3>キャラクター作成</h3></div>
                <div class="modal-body">
                    <div style="margin-bottom:15px;">
                        <label>種族:</label>
                        <select id="cm-race" style="padding:5px; background:#222; color:#fff; border:1px solid #444;">
                            ${raceOptions}
                        </select>
                    </div>
                    <div style="margin-bottom:15px;">
                        <label>職業:</label>
                        <select id="cm-job" style="padding:5px; background:#222; color:#fff; border:1px solid #444;">
                            ${jobOptions}
                        </select>
                    </div>
                    <div id="cm-preview" style="background:#1a1a1a; border:1px solid #333; padding:10px; border-radius:4px; margin-bottom:20px;">
                        <!-- Preview -->
                    </div>
                    <button id="cm-start" class="primary" style="width:100%; padding:15px;">冒険を始める</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const updatePreview = () => {
            const r = document.getElementById('cm-race').value;
            const j = document.getElementById('cm-job').value;
            const raceData = MASTER_DATA.races[r];
            const jobData = DB.jobs[j];
            
            let html = "<h4 style='color:var(--accent-color); margin:0 0 5px 0;'>ステータス補正プレビュー</h4>";
            html += `<div style="font-size:12px; line-height:1.6;">`;
            html += `HP: x${raceData.mod.hp}<br>`;
            html += `STR: x${raceData.mod.str}<br>`;
            html += `MAG: x${raceData.mod.mag}<br>`;
            html += `AGI: x${raceData.mod.agi}<br>`;
            html += `</div>`;
            document.getElementById('cm-preview').innerHTML = html;
        };
        
        document.getElementById('cm-race').onchange = updatePreview;
        document.getElementById('cm-job').onchange = updatePreview;
        document.getElementById('cm-start').onclick = () => {
            const r = document.getElementById('cm-race').value;
            const j = document.getElementById('cm-job').value;
            Game.startNewGame(r, j);
            modal.remove();
        };
        
        updatePreview();
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
            if(char.hp <= 0) div.classList.add("dead");
            
            const jobData = DB.getJob(char.jobKey);
            const jobName = jobData ? jobData.name : char.jobKey;
            const raceName = MASTER_DATA.races[char.race] ? MASTER_DATA.races[char.race].name : "不明";
            const stats = char.totalStats;
            
            const hpPct = Math.max(0, Math.min(100, (char.hp / stats.hp) * 100));
            const expPct = Math.min(100, (char.exp / char.maxExp) * 100);
            
            let equipHtml = '<div class="equip-grid">';
            for(let slot in char.equipment) {
                let item = char.equipment[slot];
                let iname = item ? item.name : "-";
                let style = item ? `color:var(--accent-color);` : `color:#666;`;
                equipHtml += `<div class="equip-slot" style="${style}">${slot.substr(0,4)}: ${iname}</div>`;
            }
            equipHtml += '</div>';

            div.innerHTML = `
                <div class="char-header">
                    <span>${char.name}</span> 
                    <span class="job-label">${jobName}</span>
                </div>
                <div style="font-size:10px; color:#888;">${raceName} Lv.${char.level}</div>
                
                <div class="bar-wrap"><div class="bar-val hp-bar" style="width:${hpPct}%"></div></div>
                <div style="text-align:right; font-size:9px;">HP: ${Math.floor(char.hp)}/${stats.hp}</div>
                <div class="bar-wrap" style="height:2px;"><div class="bar-val exp-bar" style="width:${expPct}%"></div></div>
                
                <div class="stat-grid">
                    <div class="stat-val">STR:<span>${stats.str}</span></div>
                    <div class="stat-val">MAG:<span>${stats.mag}</span></div>
                    <div class="stat-val">VIT:<span>${stats.vit}</span></div>
                    <div class="stat-val">AGI:<span>${stats.agi}</span></div>
                </div>
                ${equipHtml}
            `;
            div.onclick = () => UI.showCharDetail(char);
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
        
        // Filter: Tier 1 & Base Job & No Requirement
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
            el.innerHTML = "キャラクターを選択してください";
            const rosterDiv = document.getElementById('cc-char-list');
            rosterDiv.innerHTML = "";
            Game.roster.forEach(c => {
                const div = document.createElement('div');
                div.className = `list-item ${this.selChar===c?'selected':''}`;
                const jobData = DB.getJob(c.jobKey);
                const jobName = jobData ? jobData.name : c.jobKey;
                div.innerHTML = `<div>${c.name}</div><div style="font-size:10px;">Lv${c.level} ${jobName}</div>`;
                div.onclick = () => { this.selChar = c; this.renderClass(); };
                rosterDiv.appendChild(div);
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
    
    renderInv() {
        const cList = document.getElementById('equip-char-list'); 
        cList.innerHTML = "";
        
        Game.party.forEach(c => {
            let el = document.createElement('div');
            el.className = `list-item ${this.equipChar===c?'selected':''}`;
            el.innerHTML = `<div>${c.name}</div><div style="font-size:10px;">${c.job.name}</div>`;
            el.onclick = () => { this.equipChar = c; this.renderInv(); };
            cList.appendChild(el);
        });

        const iList = document.getElementById('inv-list');
        iList.innerHTML = "";
        
        if(!this.equipChar) {
            iList.innerHTML = "キャラクターを選択してください";
            return;
        }
        
        const head = document.createElement('div');
        head.style.marginBottom = "10px";
        head.style.borderBottom = "1px solid #333";
        for(let slot in this.equipChar.equipment) {
            let item = this.equipChar.equipment[slot];
            let name = item ? `<span style="color:var(--accent-color)">${item.name}</span>` : "なし";
            let btn = item ? `<button style="font-size:9px; margin-left:5px;" onclick="UI.doUnequip('${slot}')">外す</button>` : "";
            head.innerHTML += `<div style="font-size:11px; margin-bottom:2px;">${slot.substr(0,4)}: ${name} ${btn}</div>`;
        }
        iList.appendChild(head);

        if(Game.inventory.length === 0) {
            iList.innerHTML += "<div>アイテムがありません</div>";
            return;
        }

        Game.inventory.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = "list-item";
            
            const check = this.equipChar.canEquip(item);
            const style = check ? "" : "opacity:0.5; cursor:not-allowed;";
            
            let stats = "";
            for(let k in item.stats) if(item.stats[k]!==0) stats += `${k}:${item.stats[k]} `;

            div.style = style;
            div.innerHTML = `
                <div style="font-weight:bold; color:var(--info-color)">${item.name}</div>
                <div style="font-size:10px; color:#888;">${item.type} [${item.slot}]</div>
                <div style="font-size:10px;">${stats}</div>
            `;
            if(check) {
                div.onclick = () => {
                    this.equipChar.equip(item);
                    Game.inventory.splice(idx, 1);
                    this.renderInv();
                    this.renderParty(); 
                };
            }
            iList.appendChild(div);
        });
    },

    doUnequip(slot) {
        this.equipChar.unequip(slot);
        this.renderInv();
        this.renderParty();
    },
    
    showCharDetail(c) {
        const s = c.totalStats;
        const jobName = c.job ? c.job.name : "Unknown";
        const raceName = MASTER_DATA.races[c.race] ? MASTER_DATA.races[c.race].name : "Unknown";
        
        let eqHtml = "";
        for(let slot in c.equipment) {
            let item = c.equipment[slot];
            eqHtml += `<div class="detail-eq-row">
                <span style="color:#888; font-size:11px; width:60px;">${slot}</span>
                <span style="color:${item?'#fff':'#666'}">${item?item.name:'Empty'}</span>
            </div>`;
        }

        const html = `
            <div class="detail-header">
                <h2>${c.name}</h2>
                <div class="detail-meta">${raceName} ${jobName} Lv.${c.level}</div>
            </div>
            <div class="detail-sections">
                <div>
                    <h4 style="color:#888; border-bottom:1px solid #333; margin-bottom:5px;">ステータス</h4>
                    <div class="detail-row"><span class="detail-label">HP</span> <span>${Math.floor(c.hp)} / ${s.hp}</span></div>
                    <div class="detail-row"><span class="detail-label">STR</span> <span>${s.str}</span></div>
                    <div class="detail-row"><span class="detail-label">VIT</span> <span>${s.vit}</span></div>
                    <div class="detail-row"><span class="detail-label">MAG</span> <span>${s.mag}</span></div>
                    <div class="detail-row"><span class="detail-label">INT</span> <span>${s.int}</span></div>
                    <div class="detail-row"><span class="detail-label">AGI</span> <span>${s.agi}</span></div>
                    <div class="detail-row"><span class="detail-label">LUC</span> <span>${s.luc}</span></div>
                </div>
                <div>
                    <h4 style="color:#888; border-bottom:1px solid #333; margin-bottom:5px;">装備</h4>
                    ${eqHtml}
                    <div style="margin-top:10px; text-align:right;">
                        <button onclick="UI.openEquipFor('${c.id}')" style="font-size:10px; padding:4px 8px;">装備変更</button>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('detail-content').innerHTML = html;
        this.openModal('modal-char-detail');
    },
    
    openEquipFor(charId) {
        this.closeModal(); 
        this.equipChar = Game.party.find(c=>c.id===charId); 
        this.openModal('modal-inv', ()=>this.renderInv());
    },

    toggle(on) {
        document.getElementById('btn-explore').disabled = on;
        document.getElementById('btn-return').disabled = !on;
    },
    log(msg, type) {
        const p = document.getElementById('log-list');
        p.innerHTML += `<div class="log-entry ${type}">${msg}</div>`;
        document.getElementById('log-panel').scrollTop = 99999;
    }
};

window.onload = () => Game.init();