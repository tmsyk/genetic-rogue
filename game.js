/**
 * Genetic Rogue Ver.13.8 - UI & Auto-Rename
 * Main Logic & UI Controller
 */

// --- UTILS ---
const UTILS = {
    genName: () => {
        // Use Master Data if available
        if (MASTER_DATA.names && MASTER_DATA.names.length > 0) {
            return MASTER_DATA.names[Math.floor(Math.random() * MASTER_DATA.names.length)];
        }
        // Fallback
        const n = ["Alex", "Bell", "Cid", "Dan", "Eve"];
        return n[Math.floor(Math.random() * n.length)] + Math.floor(Math.random() * 99);
    }
};

const Game = {
    helix: 100, floor: 1, maxFloor: 1, floorProgress: 0,
    party: [], roster: [], inventory: [],
    exploring: false, timer: null, currentEnemy: null,
    SAVE_KEY: 'genetic_rogue_v13_8',

    init() {
        UI.init();
        if (!DB || !DB.jobs || Object.keys(DB.jobs).length === 0) {
            alert("DB Init Error"); return;
        }
        UI.showTitleScreen();
    },

    startNewGame(raceId, jobKey, name) {
        this.helix = 100;
        this.floor = 1;
        this.maxFloor = 1;
        this.floorProgress = 0;
        this.party = [];
        this.roster = [];
        this.inventory = [];
        this.currentEnemy = null;

        const c = new Character(jobKey, null, { race: raceId, name: name });
        this.roster.push(c);
        this.party.push(c);

        let starter = DB.createRandomItem(1);
        this.inventory.push(starter);
        c.autoEquip(starter);

        this.save();
        UI.updateAll();
        UI.log("冒険を開始しました", "log-sys");
    },

    // ... (save, load, explore, stop, tick, etc. same as v12.8)
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

    hasSaveData() { return !!localStorage.getItem(this.SAVE_KEY); },

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
        const ename = this.currentEnemy.name;
        const eElem = this.currentEnemy.elem ? `[${MASTER_DATA.elements.find(e=>e.key===this.currentEnemy.elem).name}]` : "";
        UI.log(`遭遇: ${ename} ${eElem} (HP:${this.currentEnemy.hp})`, "log-combat");
    },

    combatRound() {
        const enemy = this.currentEnemy;
        const activeParty = this.party.filter(c=>c.hp>0);
        
        activeParty.forEach(c => {
            if(enemy.hp <= 0) return;
            
            // 属性補正計算
            let elemMod = 1.0;
            let atkElem = c.attackElement;
            if(atkElem && enemy.elem) {
                if(MASTER_DATA.element_chart[atkElem].strong === enemy.elem) elemMod = 1.5;
                else if(MASTER_DATA.element_chart[atkElem].weak === enemy.elem) elemMod = 0.5;
            }

            let dmg = Math.max(1, Math.floor(c.totalStats.str - (enemy.vit/2)));
            // 魔法職ならMAG依存
            if (c.job.type === 'mag' || c.job.type === 'sup') {
                dmg = Math.max(1, Math.floor(c.totalStats.mag - (enemy.mag/2)));
            }

            dmg = Math.floor(dmg * elemMod * (0.9 + Math.random()*0.2));
            enemy.hp -= dmg;
            
            let modText = elemMod > 1 ? "(弱点!)" : (elemMod < 1 ? "(半減)" : "");
            UI.log(`${c.name}の攻撃${modText} -> ${dmg}`);
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
                // 敵の属性攻撃
                let elemMod = 1.0;
                if(enemy.elem) {
                    const defElems = target.defenseElements;
                    for(let de of defElems) {
                        if(MASTER_DATA.element_chart[de].strong === enemy.elem) elemMod *= 0.7;
                        if(MASTER_DATA.element_chart[de].weak === enemy.elem) elemMod *= 1.3;
                    }
                }

                let dmg = Math.max(1, Math.floor(enemy.str - (target.totalStats.vit/2)));
                dmg = Math.floor(dmg * elemMod);
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
            } else {
                UI.log("毒を受けた！（未実装効果）", "log-trap");
            }
        }
    },

    loot() {
        const item = DB.createRandomItem(this.floor);
        
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

    // 雇用時にも名前入力ダイアログを出す
    hire(jobId, isFree=false) {
        if(!isFree && this.helix < MASTER_DATA.config.HIRE_COST) return;
        if (!jobId || !DB.jobs[jobId]) return console.error("Invalid JobID");
        const job = DB.jobs[jobId];
        if ((job.tier !== 1 || job.reqJob) && !isFree) return console.warn("Only Tier 1 allowed");

        // 名前入力ダイアログ表示
        UI.showNameInput((name) => {
            if(!isFree) this.helix -= MASTER_DATA.config.HIRE_COST;
            const c = new Character(jobId, null, { name: name });
            this.roster.push(c);
            if (this.party.length < MASTER_DATA.config.MAX_PARTY) this.party.push(c);
            
            this.save();
            UI.updateAll();
            UI.log(`${c.name} (${c.job.name}) を雇用しました。`);
        });
    },
    
    classChange(charId, newJobId) {
        const c = this.roster.find(x=>x.id===charId);
        if(!c) return;
        if(c.level < 10) return alert("Need Lv 10+");
        if(this.helix < MASTER_DATA.config.CC_COST) return alert("Not enough Helix");
        this.helix -= MASTER_DATA.config.CC_COST;
        c.classChange(newJobId);
        UI.updateAll();
        alert(`${c.name} は転職しました！`);
    },
    
    // 個別売却対応
    sellItem(idx) {
        const item = this.inventory[idx];
        if(!item) return;
        const price = 10 + (item.tier * 10) + (item.rarity * 20);
        this.helix += price;
        this.inventory.splice(idx, 1);
        UI.log(`売却: ${item.name} (+${price}G)`, "log-item");
        this.save();
        UI.updateAll();
        UI.renderInv(UI.invFilter);
    },

    sellTrash() {
        let sold = 0; let gain = 0;
        for(let i=this.inventory.length-1; i>=0; i--) {
            if(this.inventory[i].rarity <= 2) {
                gain += 10 + (this.inventory[i].tier * 5);
                this.inventory.splice(i, 1);
                sold++;
            }
        }
        if(sold > 0) {
            this.helix += gain;
            UI.log(`一括売却: ${sold}個 (+${gain}G)`, "log-item");
            this.save(); UI.updateAll(); UI.renderInv();
        } else {
            alert("売却できるアイテム（コモン以下）がありません。");
        }
    }
};

class Character {
    constructor(jobKey, parents, data) {
        if(data && data.id) { 
            if (!data.equipment.head) data.equipment.head = null;
            if (!data.equipment.accessory1) data.equipment.accessory1 = data.equipment.accessory;
            if (!data.equipment.accessory2) data.equipment.accessory2 = null;
            delete data.equipment.accessory;
            if (data.jobExp === undefined) data.jobExp = 0;
            if (!data.learnedSkills) data.learnedSkills = [];
            if (!data.masteredJobs) data.masteredJobs = [];
            Object.assign(this, data); 
            return; 
        }

        this.id = Math.random().toString(36);
        this.jobKey = jobKey;
        this.name = (data && data.name) ? data.name : UTILS.genName();
        this.level = 1; this.exp = 0; this.maxExp = 100;
        this.hp = 100;
        this.jobExp = 0; this.learnedSkills = []; this.masteredJobs = [];
        this.baseStats = {...MASTER_DATA.config.BASE_STATS};
        for(let k in this.baseStats) this.baseStats[k] = Math.floor(this.baseStats[k] * (0.9 + Math.random()*0.2));
        
        this.equipment = { main_hand: null, off_hand: null, head: null, body: null, accessory1: null, accessory2: null };
        this.personality = "凡人";
        this.elements = [];
        
        const races = Object.keys(MASTER_DATA.races);
        if (data && data.race) { this.race = data.race; } 
        else if (parents) { this.race = Math.random()<0.5?parents[0].race:parents[1].race; }
        else { this.race = races[Math.floor(Math.random()*races.length)]; }

        if (parents) {
            this.pedigree = {
                f: { name: parents[0].name, race: MASTER_DATA.races[parents[0].race].name, job: parents[0].job.name },
                m: { name: parents[1].name, race: MASTER_DATA.races[parents[1].race].name, job: parents[1].job.name }
            };
            const pSkills = [...new Set([...parents[0].learnedSkills, ...parents[1].learnedSkills])];
            for (let i = pSkills.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pSkills[i], pSkills[j]] = [pSkills[j], pSkills[i]];
            }
            this.learnedSkills = pSkills.slice(0, 4);
        } else {
            this.pedigree = { f: null, m: null };
        }
    }

    get job() { return DB.getJob(this.jobKey); }

    get totalStats() {
        const s = {...this.baseStats};
        const job = this.job;
        const raceMod = MASTER_DATA.races[this.race] ? MASTER_DATA.races[this.race].mod : null;

        // Passive Skills
        let passiveMul = { hp:1, str:1, vit:1, mag:1, int:1, agi:1, luc:1 };
        this.learnedSkills.forEach(skName => {
            const skData = MASTER_DATA.skills.data[skName];
            if(skData && skData.mod) {
                for(let k in skData.mod) if(passiveMul[k]) passiveMul[k] *= skData.mod[k];
            }
        });

        for(let k in s) {
            let m = (job && job.mod) ? (job.mod.all || job.mod[k] || 1.0) : 1.0;
            if (raceMod && raceMod[k]) m *= raceMod[k];
            m *= passiveMul[k];
            s[k] = Math.floor(s[k] * m);
        }
        for(let k in this.equipment) {
            const it = this.equipment[k];
            if(it) { for(let st in it.stats) s[st] = (s[st]||0) + it.stats[st]; }
        }
        for(let k in s) s[k] += Math.floor((s[k]*0.1) * (this.level-1));
        return s;
    }
    
    get attackElement() {
        if(this.equipment.main_hand && this.equipment.main_hand.elem) return this.equipment.main_hand.elem;
        if(this.elements.length > 0) return this.elements[0];
        return null;
    }

    get defenseElements() {
        let elems = [];
        for(let k in this.equipment) {
            if(this.equipment[k] && this.equipment[k].elem) elems.push(this.equipment[k].elem);
        }
        return elems;
    }

    gainExp(v) {
        this.exp += v;
        if(this.exp >= this.maxExp) {
            this.level++; this.exp=0; this.maxExp*=1.2;
            this.hp = this.totalStats.hp;
            UI.log(`${this.name} Level Up! (Lv.${this.level})`);
        }
    }

    gainJobExp(amount) {
        if (this.masteredJobs.includes(this.jobKey)) return;
        this.jobExp += amount;
        const maxJobExp = this.job.maxJobExp || 1000;
        if (this.jobExp >= maxJobExp) {
            this.jobExp = maxJobExp;
            this.masterJob();
        }
    }

    masterJob() {
        if (this.masteredJobs.includes(this.jobKey)) return;
        this.masteredJobs.push(this.jobKey);
        const mSkill = this.job.masterSkill;
        if (mSkill && !this.learnedSkills.includes(mSkill)) {
            this.learnedSkills.push(mSkill);
            UI.log(`${this.name}は${this.job.name}を極めた！ スキル「${mSkill}」を習得！`, "log-lvlup");
        } else {
            UI.log(`${this.name}は${this.job.name}を極めた！`, "log-lvlup");
        }
    }
    
    canEquip(item) {
        if (!item || !item.kind) return { ok: false, reason: "無効" };
        const job = this.job;
        if (job && job.equip && !job.equip.includes(item.kind) && item.kind !== 'ac') return { ok: false, reason: "職不可" };
        if (item.req) {
            const stats = this.totalStats;
            for (let key in item.req) {
                if ((stats[key] || 0) < item.req[key]) return { ok: false, reason: `${key.toUpperCase()}不足` };
            }
        }
        return { ok: true, reason: "" };
    }

    autoEquip(item) {
        if(!item.slot) return false;
        const check = this.canEquip(item);
        if(!check.ok) return false;

        let targetSlot = item.slot;
        if (item.slot === 'accessory') {
            if (!this.equipment.accessory1) targetSlot = 'accessory1';
            else if (!this.equipment.accessory2) targetSlot = 'accessory2';
            else targetSlot = 'accessory1';
        }

        const cur = this.equipment[targetSlot];
        const curScore = cur ? Object.values(cur.stats).reduce((a,b)=>a+b,0) : 0;
        const newScore = Object.values(item.stats).reduce((a,b)=>a+b,0);
        
        if(newScore > curScore) {
            if(cur) Game.inventory.push(cur);
            this.equipment[targetSlot] = item;
            UI.log(`${this.name}が${item.name}を装備`, "log-equip");
            return true;
        }
        return false;
    }
    
    equip(item) {
        const check = this.canEquip(item);
        if(!check.ok) { UI.log(`装備不可: ${check.reason}`, "log-err"); return false; }
        let targetSlot = item.slot;
        if (item.slot === 'accessory') {
            if (!this.equipment.accessory1) targetSlot = 'accessory1';
            else if (!this.equipment.accessory2) targetSlot = 'accessory2';
            else targetSlot = 'accessory1';
        }
        if (this.equipment[targetSlot]) Game.inventory.push(this.equipment[targetSlot]);
        this.equipment[targetSlot] = item;
        return true;
    }

    unequip(slot) {
        if(this.equipment[slot]) {
            Game.inventory.push(this.equipment[slot]);
            this.equipment[slot] = null;
        }
    }
    
    classChange(newJobKey) {
        this.jobKey = newJobKey;
        this.jobExp = 0;
        this.level = 1; this.maxExp = 100; this.hp = this.totalStats.hp;
    }
}

// --- UI Controller ---
const UI = {
    currentTab: 'roster',
    selChar: null,
    equipChar: null,
    invFilter: 'all', 

    init() {
        const bind = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
        bind('btn-explore', () => Game.explore(document.getElementById('floor-select').value));
        bind('btn-return', () => Game.stop());
        bind('btn-lab', () => this.openModal('modal-lab', () => this.renderLab()));
        bind('btn-inv', () => this.openModal('modal-inv', () => this.renderInv()));
        bind('btn-settings', () => this.openModal('modal-settings'));
        bind('btn-help', () => this.openModal('modal-rules'));
        bind('btn-sell-trash', () => Game.sellTrash());
        document.querySelectorAll('.close-modal').forEach(b => { b.onclick = () => this.closeModal(); });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tabId = e.target.getAttribute('data-tab');
                if(tabId) this.switchTab(tabId);
            };
        });
    },

    showTitleScreen() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'modal-title';
        modal.style.display = 'flex';
        const hasData = Game.hasSaveData();
        modal.innerHTML = `
            <div class="modal-box" style="text-align:center; padding:40px;">
                <h1 style="color:var(--accent-color); font-size:32px; margin-bottom:10px;">🧬 Genetic Rogue</h1>
                <p style="color:#888; margin-bottom:40px;">Ver.13.7</p>
                <div style="display:flex; flex-direction:column; gap:20px; width:200px; margin:0 auto;">
                    <button id="title-load" style="padding:15px;" ${hasData?'':'disabled'}>続きから</button>
                    <button id="title-new" style="padding:15px;">はじめから</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('title-load').onclick = () => {
            if(Game.load()) modal.remove(); else alert("ロード失敗");
        };
        document.getElementById('title-new').onclick = () => {
            if(hasData && !confirm("データを上書きしますか？")) return;
            modal.remove();
            this.showCharMake();
        };
    },

    // 名前入力ダイアログ
    showNameInput(callback) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.style.zIndex = '200'; // 上に表示
        
        modal.innerHTML = `
            <div class="modal-box" style="width:300px;">
                <div class="modal-header"><h3>名前入力</h3></div>
                <div class="modal-body" style="text-align:center;">
                    <input type="text" id="input-char-name" value="${UTILS.genName()}" style="padding:8px; font-size:16px; width:80%; margin-bottom:10px; background:#333; color:#fff; border:1px solid #666;">
                    <button id="btn-name-random" style="margin-bottom:20px;">ランダム生成</button>
                    <button id="btn-name-ok" class="primary" style="width:100%; padding:10px;">決定</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('btn-name-random').onclick = () => {
            document.getElementById('input-char-name').value = UTILS.genName();
        };
        document.getElementById('btn-name-ok').onclick = () => {
            const name = document.getElementById('input-char-name').value || UTILS.genName();
            modal.remove();
            callback(name);
        };
    },

    showCharMake() {
        // キャラメイクでも名前入力を挟む
        this.showNameInput((name) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.display = 'flex';
            
            const jobOptions = Object.values(DB.jobs)
                .filter(j => j.tier === 1 && !j.reqJob)
                .map(j => `<option value="${j.id}">${j.name}</option>`)
                .join('');
            const raceOptions = Object.keys(MASTER_DATA.races)
                .map(k => `<option value="${k}">${MASTER_DATA.races[k].name}</option>`)
                .join('');

            modal.innerHTML = `
                <div class="modal-box">
                    <div class="modal-header"><h3>キャラクター作成: ${name}</h3></div>
                    <div class="modal-body">
                        <div style="margin-bottom:10px;"><label>種族:</label><select id="cm-race">${raceOptions}</select></div>
                        <div style="margin-bottom:10px;"><label>職業:</label><select id="cm-job">${jobOptions}</select></div>
                        <div id="cm-preview" style="background:#1a1a1a; padding:10px; margin-bottom:10px;"></div>
                        <button id="cm-start" class="primary" style="width:100%;">冒険を始める</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const updatePreview = () => {
                const r = document.getElementById('cm-race').value;
                const j = document.getElementById('cm-job').value;
                const rd = MASTER_DATA.races[r];
                const jd = DB.jobs[j];
                // 計算 (Base=5) * RaceMod * JobMod
                const calc = (stat) => Math.floor(5 * (rd.mod[stat]||1) * (jd.mod[stat]||1));
                
                let html = "<div style='font-size:12px;'>";
                html += `HP: ${calc('hp')*10} | STR: ${calc('str')} | VIT: ${calc('vit')}<br>`;
                html += `MAG: ${calc('mag')} | INT: ${calc('int')} | AGI: ${calc('agi')} | LUC: ${calc('luc')}`;
                html += "</div>";
                document.getElementById('cm-preview').innerHTML = html;
            };
            
            document.getElementById('cm-race').onchange = updatePreview;
            document.getElementById('cm-job').onchange = updatePreview;
            document.getElementById('cm-start').onclick = () => {
                const r = document.getElementById('cm-race').value;
                const j = document.getElementById('cm-job').value;
                Game.startNewGame(r, j, name);
                modal.remove();
            };
            updatePreview();
        });
    },

    updateAll() {
        document.getElementById('helix-display').innerText = Game.helix;
        const lh = document.getElementById('lab-helix-display'); if(lh) lh.innerText = Game.helix;
        document.getElementById('floor-display').innerText = Game.floor;
        document.getElementById('floor-progress').innerText = `(${Game.floorProgress}/30)`;
        this.renderParty();
        if(document.getElementById('modal-lab').style.display === 'flex') this.renderLab();
    },

    renderParty() {
        const c = document.getElementById('party-container'); c.innerHTML = "";
        Game.party.forEach(char => {
            const div = document.createElement('div');
            div.className = "char-card";
            if(char.hp<=0) div.classList.add("dead");
            const s = char.totalStats;
            const hpPct = (char.hp / s.hp) * 100;
            div.innerHTML = `
                <div class="char-header">${char.name} <span class="job-label">${char.job.name}</span></div>
                <div style="font-size:10px; color:#888;">Lv.${char.level}</div>
                <div class="bar-wrap"><div class="bar-val hp-bar" style="width:${hpPct}%"></div></div>
                <div style="text-align:right; font-size:9px;">${Math.floor(char.hp)}/${s.hp}</div>
            `;
            div.onclick = () => UI.showCharDetail(char);
            c.appendChild(div);
        });
    },
    
    // Improved Inv Render
    renderInv(filter = 'all') {
        this.invFilter = filter;
        const iList = document.getElementById('inv-list'); iList.innerHTML = "";
        
        if(!this.equipChar) { iList.innerHTML = "キャラクターを選択してください"; return; }

        // Filter UI
        const filters = {all:'すべて', weapon:'武器', armor:'防具', accessory:'装飾'};
        let fHtml = '<div style="display:flex; gap:5px; margin-bottom:5px;">';
        for(let k in filters) {
            let active = k===filter ? 'color:var(--accent-color); border-color:var(--accent-color);' : '';
            fHtml += `<button style="font-size:10px; padding:2px 5px; ${active}" onclick="UI.renderInv('${k}')">${filters[k]}</button>`;
        }
        iList.innerHTML = fHtml + '</div>';

        // Current Equip
        let eqHtml = '<div style="background:#222; padding:5px; margin-bottom:10px;">';
        for(let s in this.equipChar.equipment) {
            let it = this.equipChar.equipment[s];
            let name = it ? `<span class="rar-${it.rarity}">${it.name}</span>` : "なし";
            let btn = it ? `<button style="font-size:9px;" onclick="UI.doUnequip('${s}')">外す</button>` : "";
            eqHtml += `<div style="font-size:10px; display:flex; justify-content:space-between;"><span>${s.substr(0,3)}</span><span>${name} ${btn}</span></div>`;
        }
        iList.innerHTML += eqHtml + '</div>';

        // Items
        let items = Game.inventory.filter(i => filter==='all' || i.type===filter);
        if(items.length===0) iList.innerHTML += "<div>アイテムなし</div>";
        
        items.forEach(item => {
            const idx = Game.inventory.indexOf(item);
            const div = document.createElement('div');
            const check = this.equipChar.canEquip(item);
            
            // 日本語ステータス変換
            let stats = "";
            const statMap = {str:"腕力", vit:"耐久", mag:"魔力", int:"知力", agi:"素早", luc:"運", dex:"器用"};
            for(let k in item.stats) if(item.stats[k]) stats += `${statMap[k]||k}:${item.stats[k]} `;

            // レアリティ色
            const rarClass = `rar-${item.rarity}`; // CSSで定義済み想定

            div.className = "list-item";
            if(!check.ok) div.style.opacity = "0.5";

            div.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span class="${rarClass}" style="font-weight:bold;">${item.name}</span>
                    <button style="font-size:9px;" onclick="event.stopPropagation(); UI.sellItem(${idx})">売却</button>
                </div>
                <div style="font-size:9px; color:#aaa;">${stats} ${item.elem ? `[${MASTER_DATA.elements.find(e=>e.key===item.elem).name}]` : ''}</div>
                ${!check.ok ? `<div style="color:red; font-size:9px;">${check.reason}</div>` : ''}
            `;
            if(check.ok) {
                div.onclick = () => { 
                    this.equipChar.equip(item); 
                    Game.inventory.splice(idx,1); 
                    this.renderInv(filter); this.renderParty(); 
                };
            }
            iList.appendChild(div);
        });
    },
    
    sellItem(idx) {
        const item = Game.inventory[idx];
        if(!item) return;
        const price = 10 + (item.tier*10) + (item.rarity*20);
        Game.helix += price;
        Game.inventory.splice(idx,1);
        UI.log(`${item.name}を売却 (+${price}G)`, "log-item");
        Game.save(); UI.updateAll();
        // インベントリ画面が開いていれば更新
        if(document.getElementById('modal-inv').style.display === 'flex') this.renderInv(this.invFilter);
    },

    // ... (Other UI methods: openModal, closeModal, switchTab, renderLab, renderRoster, renderHire, renderClass)
    // 省略部分はVer12.7と同じ
    openModal(id, fn) { document.getElementById(id).style.display='flex'; if(fn) fn(); },
    closeModal() { document.querySelectorAll('.modal-overlay').forEach(e => e.style.display='none'); },
    switchTab(mode) {
        this.currentTab = mode;
        document.querySelectorAll('.tab-content').forEach(e => e.style.display = 'none');
        document.getElementById('tab-lab-' + mode).style.display = 'block';
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if(btn.getAttribute('data-tab') === mode) btn.classList.add('active'); else btn.classList.remove('active');
        });
        this.renderLab();
    },
    renderLab() {
        if(this.currentTab === 'roster') this.renderRoster();
        else if(this.currentTab === 'hire') this.renderHire();
        else if(this.currentTab === 'class') this.renderClass();
    },
    renderRoster() {
        const el = document.getElementById('lab-list'); el.innerHTML = "";
        Game.roster.forEach(c => {
            const div = document.createElement('div'); div.className = "list-item";
            div.innerHTML = `${c.name} (${c.job.name})`;
            div.onclick = () => {
                const inPt = Game.party.find(x=>x.id===c.id);
                if(inPt) Game.party = Game.party.filter(x=>x.id!==c.id);
                else if(Game.party.length < 6) Game.party.push(c);
                Game.save(); UI.updateAll(); this.renderRoster();
            };
            el.appendChild(div);
        });
    },
    renderHire() {
        const el = document.getElementById('guild-list'); el.innerHTML = "";
        Object.values(DB.jobs).filter(j => j.tier === 1 && !j.reqJob).forEach(j => {
            const div = document.createElement('div'); div.className = "list-item";
            div.innerHTML = j.name;
            div.onclick = () => Game.hire(j.id);
            el.appendChild(div);
        });
    },
    renderClass() {
        const el = document.getElementById('cc-job-list'); el.innerHTML = "";
        if(!this.selChar) return el.innerHTML = "キャラを選択";
        const cJob = DB.getJob(this.selChar.jobKey);
        Object.values(DB.jobs).filter(j => j.tier === cJob.tier + 1 && j.lineage === cJob.lineage).forEach(j => {
            const div = document.createElement('div'); div.className = "list-item";
            div.innerHTML = `${j.name} (T${j.tier})`;
            div.onclick = () => { Game.classChange(this.selChar.id, j.id); this.selChar=null; this.renderClass(); };
            el.appendChild(div);
        });
    },
    showCharDetail(c) {
        // ... (Same as before)
        this.openEquipFor(c.id); // Placeholder to just open equip for now or show details
        // Detailed implementation omitted for brevity, use previous logic
        const s = c.totalStats;
        const html = `
            <div class="detail-header"><h2>${c.name}</h2><div>Lv.${c.level} ${c.job.name}</div></div>
            <div class="detail-sections">
                <div><h4>Status</h4>
                STR:${s.str} VIT:${s.vit} MAG:${s.mag} INT:${s.int} AGI:${s.agi} LUC:${s.luc}
                </div>
                <div><button onclick="UI.openEquipFor('${c.id}')">装備変更</button></div>
            </div>`;
        document.getElementById('detail-content').innerHTML = html;
        this.openModal('modal-char-detail');
    },
    openEquipFor(charId) {
        this.closeModal();
        this.equipChar = Game.roster.find(c=>c.id===charId);
        this.openModal('modal-inv', ()=>this.renderInv());
    },
    doUnequip(slot) {
        if(this.equipChar) {
            this.equipChar.unequip(slot);
            Game.save(); this.renderInv(this.invFilter);
        }
    }
};

window.onload = () => Game.init();