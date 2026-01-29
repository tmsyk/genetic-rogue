/**
 * Genetic Rogue Ver.13.18 - Skill-Based Class Change & UI
 * Main Logic & UI Controller
 */

// --- UTILS ---
const UTILS = {
    genName: () => {
        if (typeof MASTER_DATA !== 'undefined' && MASTER_DATA.names && MASTER_DATA.names.length > 0) {
            return MASTER_DATA.names[Math.floor(Math.random() * MASTER_DATA.names.length)];
        }
        const n = ["アレク", "ベル", "シド", "ダン", "イヴ", "フェイ", "ジン"];
        return n[Math.floor(Math.random() * n.length)] + Math.floor(Math.random() * 99);
    }
};

const Game = {
    helix: 100, floor: 1, maxFloor: 1, floorProgress: 0,
    party: [], roster: [], inventory: [],
    exploring: false, timer: null, currentEnemy: null,
    speed: 800,
    SAVE_KEY: 'genetic_rogue_v13_17',

    init() {
        UI.init();
        if (typeof DB === 'undefined' || !DB.jobs || Object.keys(DB.jobs).length === 0) {
            if(typeof DB !== 'undefined') DB.init();
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
        UI.log("システム起動。冒険を開始します。", "log-sys");
        UI.logDetail(`[INFO] New Game Started. Leader: ${c.name}`);
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
            this.roster = (d.roster||[]).map(x => {
                const c = new Character(null, null, x);
                c.validateHp(); 
                return c;
            });
            this.party = [];
            (d.partyIds||[]).forEach(id => {
                const c = this.roster.find(x=>x.id===id);
                if(c) this.party.push(c);
            });
            UI.updateAll();
            UI.log("データロード完了。", "log-sys");
            UI.logDetail(`[INFO] Data Loaded. Floor: ${this.floor}`);
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
        
        UI.toggleExplore(true);
        UI.log(`階層 ${this.floor} の探索を開始します`, "log-sys");
        UI.logDetail(`[EXPLORE] Start Floor ${this.floor}`);
        UI.updateEnemyInfo(null);
        
        if(this.timer) clearInterval(this.timer);
        this.timer = setInterval(()=>this.tick(), this.speed);
    },

    stop() {
        this.exploring = false;
        clearInterval(this.timer);
        this.party.forEach(c=>c.hp=c.totalStats.hp);
        this.currentEnemy = null;
        this.save();
        UI.toggleExplore(false);
        UI.updateAll();
        UI.log("拠点に帰還しました", "log-sys");
        UI.logDetail("[EXPLORE] Return to base. All HP restored.");
    },
    
    changeSpeed() {
        const speeds = [800, 400, 100];
        const labels = ["標準", "高速", "超高速"];
        let idx = speeds.indexOf(this.speed);
        idx = (idx + 1) % speeds.length;
        this.speed = speeds[idx];
        const btn = document.getElementById('btn-speed');
        if(btn) btn.innerText = `速度: ${labels[idx]}`;
        if(this.exploring) {
            clearInterval(this.timer);
            this.timer = setInterval(()=>this.tick(), this.speed);
        }
    },

    tick() {
        if(this.party.every(c=>c.hp<=0)) {
            UI.log("パーティが全滅しました...", "log-defeat");
            UI.logDetail("[DEFEAT] Party wiped out.");
            this.stop();
            return;
        }

        if(this.currentEnemy) {
            this.combatRound();
        } else {
            this.floorProgress++;
            const maxStep = MASTER_DATA.config.FLOOR_STEP_MAX || 30;

            if(this.floorProgress >= maxStep) {
                this.floor++;
                this.floorProgress = 0;
                if(this.floor > this.maxFloor) this.maxFloor = this.floor;
                UI.log(`>>> 階層 ${this.floor} に到達！`, "log-victory");
                UI.logDetail(`[PROGRESS] Reached Floor ${this.floor}`);
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
        const isBoss = (this.floor % 10 === 0);
        this.currentEnemy = DB.createEnemy(this.floor, isBoss); 
        
        if (isBoss) {
            this.currentEnemy.name = "★" + this.currentEnemy.name + "★";
            this.currentEnemy.hp = Math.floor(this.currentEnemy.hp * 2.0);
            this.currentEnemy.str = Math.floor(this.currentEnemy.str * 1.3);
            this.currentEnemy.exp *= 5;
            this.currentEnemy.gold *= 5;
            this.currentEnemy.isBoss = true;
            UI.log(`警告！フロアボス ${this.currentEnemy.name} が現れた！`, "log-elite");
        }
        
        this.currentEnemy.maxHp = this.currentEnemy.hp;
        
        const ename = this.currentEnemy.name;
        const eElem = this.currentEnemy.elem ? `[${MASTER_DATA.elements.find(e=>e.key===this.currentEnemy.elem).name}]` : "";
        
        if(!isBoss) UI.log(`遭遇: ${ename} ${eElem} (HP:${this.currentEnemy.hp})`, "log-combat");
        UI.logDetail(`[ENCOUNTER] ${ename} (Tier:${this.currentEnemy.tier}) appeared.`);
        UI.updateEnemyInfo(this.currentEnemy);
    },

    combatRound() {
        const enemy = this.currentEnemy;
        const activeParty = this.party.filter(c=>c.hp>0);
        
        activeParty.forEach(c => {
            if(enemy.hp <= 0) return;
            
            let elemMod = 1.0;
            let atkElem = c.attackElement;
            if(atkElem && enemy.elem) {
                if(MASTER_DATA.element_chart[atkElem].strong === enemy.elem) elemMod = 1.5;
                else if(MASTER_DATA.element_chart[atkElem].weak === enemy.elem) elemMod = 0.5;
            }

            let dmg = Math.max(1, Math.floor(c.totalStats.str - (enemy.vit/2)));
            if (c.job.type === 'mag' || c.job.type === 'sup') {
                dmg = Math.max(1, Math.floor(c.totalStats.mag - (enemy.mag/2)));
            }

            dmg = Math.floor(dmg * elemMod * (0.9 + Math.random()*0.2));
            enemy.hp -= dmg;
            
            let modText = elemMod > 1 ? "(弱点!)" : (elemMod < 1 ? "(半減)" : "");
            UI.log(`${c.name}の攻撃${modText} -> ${dmg}`);
            UI.logDetail(`[ATK] ${c.name} -> ${enemy.name}: ${dmg} (Elem:${elemMod})`);
        });

        UI.updateEnemyInfo(enemy);

        if(enemy.hp <= 0) {
            UI.log(`${enemy.name}を倒した！`, "log-victory");
            UI.logDetail(`[WIN] ${enemy.name} defeated. +${enemy.gold}G`);
            this.helix += enemy.gold;
            const exp = enemy.exp || 10;
            activeParty.forEach(c => {
                c.gainExp(exp);
                c.gainJobExp(Math.floor(exp * 0.5));
            });
            if(enemy.isBoss || Math.random() < 0.3) this.loot();
            this.currentEnemy = null;
        } else {
            const target = activeParty[Math.floor(Math.random()*activeParty.length)];
            if(target) {
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
                UI.logDetail(`[DEF] ${enemy.name} -> ${target.name}: ${dmg}`);
                if(target.hp <= 0) {
                     UI.log(`${target.name} は倒れた...`, "log-defeat");
                     UI.logDetail(`[DEAD] ${target.name} is down.`);
                }
            }
        }
    },

    trap() {
        const trap = DB.getRandomTrap();
        const power = 1 + (this.floor * 0.5);
        const dmg = Math.floor(trap.base * power);
        
        UI.log(`罠だ！ ${trap.name} (Lv.${this.floor})`, "log-trap");
        
        const maxAgi = Math.max(...this.party.map(c=>c.hp>0?c.totalStats.agi:0));
        
        if(maxAgi > (this.floor * 10) + (Math.random()*20)) {
            UI.log("回避に成功した！");
            UI.logDetail(`[TRAP] Evaded ${trap.name} (AGI check pass)`);
        } else {
            if(trap.type === 'dmg') {
                this.party.forEach(c => { if(c.hp>0) c.hp -= dmg; });
                UI.log(`全員に ${dmg} ダメージ！`, "log-dmg");
                UI.logDetail(`[TRAP] Triggered ${trap.name}: ${dmg} dmg to all`);
            } else {
                UI.log("毒を受けた！（未実装効果）", "log-trap");
            }
        }
    },

    loot() {
        const item = DB.createRandomItem(this.floor);
        UI.logItem(`[獲得] ${item.name} (Tier:${item.tier})`, item.rarity);
        
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
        if (!jobId || !DB.jobs[jobId]) return console.error("Invalid JobID");
        const job = DB.jobs[jobId];
        
        if ((job.tier !== 1 || job.reqJob) && !isFree) return console.warn("Only Tier 1 allowed");

        UI.showNameInput((name) => {
            if(!isFree) this.helix -= MASTER_DATA.config.HIRE_COST;
            const races = Object.keys(MASTER_DATA.races);
            const raceId = races[Math.floor(Math.random()*races.length)];
            
            const c = new Character(jobId, null, { name: name, race: raceId });
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
        if(c.level < 10) return alert("Lv10以上必要です");
        if(this.helix < MASTER_DATA.config.CC_COST) return alert("Helix不足");
        this.helix -= MASTER_DATA.config.CC_COST;
        c.classChange(newJobId);
        UI.updateAll();
        alert(`${c.name} は転職しました！`);
    },
    
    breed(p1Id, p2Id) {
        const p1 = this.roster.find(c=>c.id===p1Id);
        const p2 = this.roster.find(c=>c.id===p2Id);
        if(!p1 || !p2) return;
        
        const cost = (p1.level + p2.level) * 100;
        if(this.helix < cost) return alert(`Helix不足。必要: ${cost}`);
        
        this.helix -= cost;
        
        UI.showNameInput((name) => {
            const c = new Character(p1.jobKey, [p1, p2], { name: name });
            this.roster.push(c);
            if (this.party.length < MASTER_DATA.config.MAX_PARTY) this.party.push(c);
            this.save();
            UI.updateAll();
            UI.log(`配合完了！ ${c.name} が誕生しました。`, "log-lvlup");
            UI.breedState = null;
            UI.renderLab();
        });
    },

    sellItem(idx) {
        const item = this.inventory[idx];
        if(!item) return;
        const price = 10 + (item.tier*10) + (item.rarity*20);
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
            this.validateHp();
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
            const p1s = parents[0].totalStats;
            const p2s = parents[1].totalStats;
            for(let k in this.baseStats) {
                const bonus = Math.floor((p1s[k] + p2s[k]) * 0.05);
                this.baseStats[k] += bonus;
            }
        } else {
            this.pedigree = { f: null, m: null };
        }
        
        this.hp = this.totalStats.hp;
    }

    get job() { return DB.getJob(this.jobKey); }

    get totalStats() {
        const s = {...this.baseStats};
        const job = this.job;
        const raceMod = MASTER_DATA.races[this.race] ? MASTER_DATA.races[this.race].mod : null;

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
            if (passiveMul[k]) m *= passiveMul[k];
            s[k] = Math.floor(s[k] * m);
        }
        for(let k in this.equipment) {
            const it = this.equipment[k];
            if(it) { for(let st in it.stats) s[st] = (s[st]||0) + it.stats[st]; }
        }
        for(let k in s) s[k] += Math.floor((s[k]*0.1) * (this.level-1));
        return s;
    }
    
    validateHp() {
        const max = this.totalStats.hp;
        if (this.hp > max) {
            this.hp = max;
        }
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
            UI.log(`${this.name} Level Up! (Lv.${this.level})`, "log-lvlup");
            UI.logDetail(`[GROWTH] ${this.name} -> Lv.${this.level}`);
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
        if (mSkill) {
            if (!this.learnedSkills.includes(mSkill)) {
                this.learnedSkills.push(mSkill);
                UI.log(`${this.name}は${this.job.name}を極めた！ スキル「${mSkill}」習得！`, "log-lvlup");
            } else {
                UI.log(`${this.name}は${this.job.name}を極めた！`, "log-lvlup");
            }
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
            this.validateHp();
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
        this.validateHp();
        return true;
    }

    unequip(slot) {
        if(this.equipment[slot]) {
            Game.inventory.push(this.equipment[slot]);
            this.equipment[slot] = null;
            this.validateHp();
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
    currentTab: 'enemy', 
    currentLabTab: 'roster',
    breedState: null, // null, 'p1', 'p2'
    breedParents: [null, null],
    selChar: null,
    equipChar: null,
    invFilter: 'all', 

    init() {
        const bind = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
        bind('btn-explore', () => {
             const sel = document.getElementById('floor-select');
             Game.explore(sel ? sel.value : 1);
        });
        bind('btn-return', () => Game.stop());
        bind('btn-lab', () => this.openModal('modal-lab', () => this.renderLab()));
        bind('btn-inv', () => this.openModal('modal-inv', () => this.renderInv()));
        bind('btn-settings', () => this.openModal('modal-settings'));
        bind('btn-help', () => this.openModal('modal-rules'));
        bind('btn-sell-trash', () => Game.sellTrash());
        bind('act-breed', () => UI.startBreedMode());
        document.querySelectorAll('.close-modal').forEach(b => { b.onclick = () => this.closeModal(); });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                const tabId = e.target.getAttribute('data-tab');
                if(tabId) this.switchLabTab(tabId);
            };
        });
        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.onclick = (e) => {
                const txt = btn.getAttribute('onclick');
                const match = txt.match(/'([^']+)'/);
                if(match) this.switchSubTab(match[1]);
            };
        });
        const tt = document.createElement('div');
        tt.id = 'ui-tooltip';
        tt.className = 'item-tooltip';
        document.body.appendChild(tt);
    },

    toggleExplore(isExplore) {
        const explBtn = document.getElementById('btn-explore');
        const retBtn = document.getElementById('btn-return');
        if(isExplore) {
            explBtn.disabled = true; explBtn.classList.add('disabled'); retBtn.disabled = false;
        } else {
            explBtn.disabled = false; explBtn.classList.remove('disabled'); retBtn.disabled = true;
        }
    },

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
                <p style="color:#888; margin-bottom:40px;">Ver.13.18</p>
                <div style="display:flex; flex-direction:column; gap:20px; width:200px; margin:0 auto;">
                    <button id="title-load" style="padding:15px; font-weight:bold; font-size:16px; ${loadStyle}" ${loadDisabled}>続きから</button>
                    <button id="title-new" style="padding:15px; font-size:16px;">はじめから</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('title-load').onclick = () => { if(Game.load()) modal.remove(); else alert("ロード失敗"); };
        document.getElementById('title-new').onclick = () => { if(hasData && !confirm("データを上書きしますか？")) return; modal.remove(); this.showCharMake(); };
    },

    showNameInput(callback) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.style.zIndex = '200';
        modal.innerHTML = `
            <div class="modal-box" style="width:300px;">
                <div class="modal-header"><h3>名前入力</h3></div>
                <div class="modal-body" style="text-align:center;">
                    <input type="text" id="input-char-name" value="${UTILS.genName()}" style="padding:8px; font-size:16px; width:80%; margin-bottom:10px; background:#333; color:#fff; border:1px solid #666;">
                    <button id="btn-name-random" style="margin-bottom:20px;">ランダム生成</button>
                    <button id="btn-name-ok" class="primary" style="width:100%; padding:10px;">決定</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('btn-name-random').onclick = () => { document.getElementById('input-char-name').value = UTILS.genName(); };
        document.getElementById('btn-name-ok').onclick = () => {
            const name = document.getElementById('input-char-name').value || UTILS.genName();
            modal.remove(); callback(name);
        };
    },

    showCharMake() {
        this.showNameInput((name) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.display = 'flex';
            const jobOptions = Object.values(DB.jobs).filter(j => j.tier === 1 && !j.reqJob).map(j => `<option value="${j.id}">${j.name}</option>`).join('');
            const raceOptions = Object.keys(MASTER_DATA.races).map(k => `<option value="${k}">${MASTER_DATA.races[k].name}</option>`).join('');
            modal.innerHTML = `
                <div class="modal-box">
                    <div class="modal-header"><h3>キャラクター作成: ${name}</h3></div>
                    <div class="modal-body">
                        <div style="margin-bottom:10px;"><label>種族:</label><select id="cm-race">${raceOptions}</select></div>
                        <div style="margin-bottom:10px;"><label>職業:</label><select id="cm-job">${jobOptions}</select></div>
                        <div id="cm-preview" style="background:#1a1a1a; padding:10px; margin-bottom:10px;"></div>
                        <button id="cm-start" class="primary" style="width:100%;">冒険を始める</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            const updatePreview = () => {
                const r = document.getElementById('cm-race').value;
                const j = document.getElementById('cm-job').value;
                const rd = MASTER_DATA.races[r];
                const jd = DB.jobs[j];
                const calc = (stat) => Math.floor(5 * (rd.mod[stat]||1) * (jd.mod[stat]||1));
                let html = "<div style='font-size:12px;'>";
                html += `HP: ${calc('hp')*10} | STR: ${calc('str')} | VIT: ${calc('vit')}<br>MAG: ${calc('mag')} | INT: ${calc('int')} | AGI: ${calc('agi')} | LUC: ${calc('luc')}`;
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
        const maxStep = MASTER_DATA.config.FLOOR_STEP_MAX || 30;
        const progPct = Math.floor((Game.floorProgress / maxStep) * 100);
        const fp = document.getElementById('floor-progress-text');
        if(fp) fp.innerText = `Progress: ${progPct}% (${Game.floorProgress}/${maxStep})`;
        else { const fpOld = document.getElementById('floor-progress'); if(fpOld) fpOld.innerText = `(${Game.floorProgress}/${maxStep})`; }
        
        const fs = document.getElementById('floor-select');
        if(fs && fs.options.length < Game.maxFloor) {
            fs.innerHTML = "";
            for(let i=1; i<=Game.maxFloor; i++) {
                const opt = document.createElement('option');
                opt.value = i; opt.innerText = `${i}F`;
                if(i===Game.maxFloor) opt.selected = true;
                fs.appendChild(opt);
            }
        }
        this.renderParty();
        if(document.getElementById('modal-lab').style.display === 'flex') this.renderLab();
    },

    renderParty() {
        const c = document.getElementById('party-container'); c.innerHTML = "";
        Game.party.forEach(char => {
            const div = document.createElement('div');
            div.className = "char-card";
            div.style.padding = "12px"; 
            if(char.hp<=0) div.classList.add("dead");
            const s = char.totalStats;
            const hpPct = Math.max(0, Math.min(100, (char.hp / s.hp) * 100));
            const expPct = Math.min(100, (char.exp / char.maxExp) * 100);
            const raceName = MASTER_DATA.races[char.race] ? MASTER_DATA.races[char.race].name : "不明";
            let elemHtml = "";
            if (char.elements && char.elements.length > 0) {
                elemHtml = char.elements.map(e => {
                    const elData = MASTER_DATA.elements.find(x => x.key === e);
                    return elData ? `<span style="color:${elData.color}; margin-right:2px; font-weight:bold;">${elData.name}</span>` : "";
                }).join("");
            }
            if (elemHtml === "") elemHtml = "<span style='color:#666;'>無</span>";
            let equipHtml = '<div style="margin-top:8px; padding-top:4px; border-top:1px solid #444; font-size:12px; line-height:1.4;">';
            const slotNames = { main_hand:"主", off_hand:"副", head:"頭", body:"体", accessory1:"飾1", accessory2:"飾2" };
            let hasEquip = false;
            for(let slot in char.equipment) {
                let item = char.equipment[slot];
                if(item) {
                    hasEquip = true;
                    let color = item.rarity >= 3 ? 'var(--info-color)' : '#ccc';
                    if (item.rarity >= 4) color = 'var(--accent-color)';
                    equipHtml += `<div style="display:flex; justify-content:space-between;"><span style="color:#888; font-size:11px; width:15px;">${slotNames[slot]||slot.substr(0,1)}</span><span style="color:${color}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px;">${item.name}</span></div>`;
                }
            }
            if(!hasEquip) equipHtml += '<div style="color:#666; font-size:11px;">装備なし</div>';
            equipHtml += '</div>';

            div.innerHTML = `
                <div class="char-header" style="font-size:16px; margin-bottom:4px;">${char.name} <span class="job-label" style="font-size:12px; padding:2px 6px;">${char.job.name}</span></div>
                <div style="font-size:13px; color:#ddd; margin-bottom:6px;">Lv.${char.level} <span style="color:#888;">|</span> ${raceName} <span style="color:#888;">|</span> ${elemHtml}</div>
                <div class="bar-wrap" style="height:8px; background:#444;"><div class="bar-val hp-bar" style="width:${hpPct}%"></div></div>
                <div style="text-align:right; font-size:11px; margin-bottom:2px;">HP: ${Math.floor(char.hp)} / ${s.hp}</div>
                <div class="bar-wrap" style="height:4px; background:#444;"><div class="bar-val exp-bar" style="width:${expPct}%"></div></div>
                ${equipHtml}
            `;
            div.onclick = () => UI.showCharDetail(char);
            c.appendChild(div);
        });
    },

    switchSubTab(tabName) {
        this.currentTab = tabName;
        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.getAttribute('onclick').includes(tabName)) btn.classList.add('active');
        });
        const contents = document.querySelectorAll('#sub-info-panel .sub-tab-content > div');
        contents.forEach(div => div.style.display = 'none');
        const target = document.getElementById(`sub-content-${tabName}`);
        if(target) target.style.display = 'block';
    },

    updateEnemyInfo(enemy) {
        const el = document.getElementById('enemy-info-display');
        if(!el) return;
        if(!enemy || enemy.hp <= 0) return el.innerHTML = '<div style="margin-top:20px; color:#444;">NO SIGNAL</div>';
        const hpPct = Math.floor((enemy.hp / enemy.maxHp) * 100);
        const elemName = enemy.elem ? MASTER_DATA.elements.find(e=>e.key===enemy.elem).name : "無";
        const elemColor = enemy.elem ? MASTER_DATA.elements.find(e=>e.key===enemy.elem).color : "#888";
        el.innerHTML = `
            <div style="font-size:14px; font-weight:bold; color:var(--danger-color);">${enemy.name}</div>
            <div style="font-size:10px; margin-bottom:5px;">Tier: ${enemy.tier}</div>
            <div style="display:flex; align-items:center; gap:5px; margin-bottom:5px;"><span style="font-size:10px; color:#aaa;">属性:</span><span style="color:${elemColor}; border:1px solid ${elemColor}; padding:0 4px; border-radius:3px; font-size:10px;">${elemName}</span></div>
            <div class="bar-wrap" style="height:10px; background:#333;"><div class="bar-val enemy-hp-bar" style="width:${hpPct}%"></div></div>
            <div style="text-align:right; font-size:10px;">${enemy.hp} / ${enemy.maxHp}</div>
        `;
    },
    
    log(msg, type='') {
        const p = document.getElementById('log-list');
        if(!p) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerText = msg;
        p.appendChild(entry);
        p.scrollTop = p.scrollHeight;
    },

    logDetail(msg) {
        const p = document.getElementById('battle-log-list');
        if(!p) return;
        const d = document.createElement('div');
        d.innerText = msg;
        p.prepend(d);
        if(p.children.length > 50) p.lastChild.remove();
    },

    logItem(msg, rarity) {
        const p = document.getElementById('item-log-list');
        if(!p) return;
        const d = document.createElement('div');
        d.innerHTML = `<span class="rar-${rarity}">${msg}</span>`;
        p.prepend(d);
        if(p.children.length > 50) p.lastChild.remove();
        this.log(msg.replace(/<[^>]*>/g, ''), 'log-item');
    },

    openModal(id, fn) { document.getElementById(id).style.display='flex'; if(fn) fn(); },
    closeModal() { document.querySelectorAll('.modal-overlay').forEach(e => e.style.display='none'); },

    switchLabTab(mode) {
        this.currentLabTab = mode;
        this.breedState = null; 
        this.breedParents = [null, null];
        document.querySelectorAll('.tab-content').forEach(e => e.style.display = 'none');
        document.getElementById('tab-lab-' + mode).style.display = 'block';
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if(btn.getAttribute('data-tab') === mode) btn.classList.add('active'); else btn.classList.remove('active');
        });
        this.renderLab();
    },
    renderLab() {
        if(this.currentLabTab === 'roster') this.renderRoster();
        else if(this.currentLabTab === 'hire') this.renderHire();
        else if(this.currentLabTab === 'class') this.renderClass();
    },
    
    startBreedMode() {
        this.breedState = 'p1';
        this.breedParents = [null, null];
        this.renderRoster();
    },
    
    renderRoster() {
        const el = document.getElementById('lab-list'); el.innerHTML = "";
        const breedBtn = document.getElementById('act-breed');
        if (breedBtn) {
            if (this.breedState) {
                breedBtn.innerText = "配合中止";
                breedBtn.onclick = () => { this.breedState = null; this.renderRoster(); };
                breedBtn.classList.add('danger');
            } else {
                breedBtn.innerText = "配合";
                breedBtn.onclick = () => this.startBreedMode();
                breedBtn.classList.remove('danger');
            }
        }
        if (this.breedState) {
            const msg = document.createElement('div');
            msg.style.padding = "5px"; msg.style.color = "var(--accent-color)";
            msg.innerText = this.breedState === 'p1' ? "【配合】1人目の親を選択してください" : "【配合】2人目の親を選択してください";
            el.appendChild(msg);
        }

        Game.roster.forEach(c => {
            const div = document.createElement('div'); 
            let styleClass = "list-item";
            let canSelect = true;

            if (this.breedState) {
                if (c.level < 30) { styleClass += " disabled"; canSelect = false; }
                if (this.breedParents[0] === c) styleClass += " selected";
            } else {
                if (Game.party.find(x=>x.id===c.id)) styleClass += " selected";
            }
            div.className = styleClass;
            div.innerHTML = `${c.name} (${c.job.name}) Lv.${c.level}`;
            
            div.onclick = () => {
                if (this.breedState) {
                    if (!canSelect) return alert("Lv30以上のキャラクターしか配合できません");
                    if (this.breedState === 'p1') {
                        this.breedParents[0] = c; this.breedState = 'p2'; this.renderRoster();
                    } else if (this.breedState === 'p2') {
                        if (this.breedParents[0] === c) return alert("同じキャラクターは選択できません");
                        this.breedParents[1] = c;
                        if (confirm(`${this.breedParents[0].name} と ${c.name} で配合しますか？`)) Game.breed(this.breedParents[0].id, c.id);
                        else { this.breedState = null; this.renderRoster(); }
                    }
                } else {
                    const inPt = Game.party.find(x=>x.id===c.id);
                    if(inPt) Game.party = Game.party.filter(x=>x.id!==c.id);
                    else if(Game.party.length < 6) Game.party.push(c);
                    Game.save(); UI.updateAll(); this.renderRoster();
                }
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
    
    // ★修正: Skill-Based Class Change Logic in Render
    renderClass() {
        const el = document.getElementById('cc-job-list'); el.innerHTML = "";
        
        const rosterDiv = document.getElementById('cc-char-list');
        if(rosterDiv) {
            rosterDiv.innerHTML = "";
            Game.roster.forEach(c => {
                const div = document.createElement('div');
                div.className = `list-item ${this.selChar===c?'selected':''}`;
                div.innerHTML = `<div>${c.name}</div><div style="font-size:10px;">${c.job.name}</div>`;
                div.onclick = () => { this.selChar = c; this.renderClass(); };
                rosterDiv.appendChild(div);
            });
        }

        if(!this.selChar) { el.innerHTML = "<div style='padding:10px; color:#666;'>左のリストから選択</div>"; return; }

        const cJob = DB.getJob(this.selChar.jobKey);
        
        // ★ New Logic: Filter based on skills
        const nextJobs = Object.values(DB.jobs).filter(j => {
            if (j.id === cJob.id) return false; // Current job
            if (j.tier !== cJob.tier + 1) return false; // Must be next tier? Or relax to any tier? Let's stick to +1 for now.
            // If job has a required job, check if char has that job's master skill.
            if (j.reqJob) {
                 const reqJobData = Object.values(DB.jobs).find(x => x.baseId === j.reqJob);
                 if (reqJobData && reqJobData.masterSkill) {
                     if (!this.selChar.learnedSkills.includes(reqJobData.masterSkill)) return false;
                 }
            } else {
                // If no requirement, it's a base job (tier 1), but we filter by tier+1 so this case is rare unless lateral change allowed.
                // If we want to allow switching to other Tier 1 jobs, we can allow it if level > 10.
                if (j.tier === 1 && this.selChar.level >= 10) return true;
                return false;
            }
            
            // Element check
            if (j.reqEl && j.reqEl.length > 0) {
                 // Check if char has ONE of the required elements
                 // Character elements are usually inherited or set.
                 // Current logic has empty elements array in constructor. Let's assume elements come from elsewhere or just ignore for now?
                 // Wait, game doesn't seem to set char.elements in constructor except empty.
                 // We will skip element check strictly or check if char has inherent element.
                 // If we want strict element check, we need to implement element acquiring.
            }
            
            return true;
        });

        if(nextJobs.length===0) el.innerHTML = "<div style='padding:10px; color:#666;'>転職可能な上位職がありません</div>";

        nextJobs.forEach(j => {
            const div = document.createElement('div'); div.className = "list-item";
            div.innerHTML = `${j.name} (T${j.tier})`;
            div.onclick = () => { Game.classChange(this.selChar.id, j.id); this.selChar=null; this.renderClass(); };
            el.appendChild(div);
        });
        
        const back = document.createElement('div');
        back.style.marginTop = "10px";
        back.innerHTML = "<button onclick='UI.selChar=null; UI.renderClass()'>選択解除</button>";
        el.appendChild(back);
    },
    
    // ★ Helper for Class Change from Detail
    openClassChange(charId) {
        this.closeModal(); // Close detail
        this.switchLabTab('class'); // Switch main UI to Lab > Class
        this.openModal('modal-lab'); // Open Lab modal
        // Auto select character
        this.selChar = Game.roster.find(c => c.id === charId);
        this.renderClass();
    },

    renderInv(filter = 'all') {
        this.invFilter = filter;
        const cList = document.getElementById('equip-char-list'); 
        cList.innerHTML = "";
        
        Game.roster.forEach(c => {
            let el = document.createElement('div');
            el.className = `list-item ${this.equipChar===c?'selected':''}`;
            const inPt = Game.party.find(p=>p.id===c.id) ? "[PT]" : "";
            el.innerHTML = `<div>${c.name} <span style="font-size:9px; color:#aaa;">${inPt}</span></div><div style="font-size:10px;">${c.job.name}</div>`;
            el.onclick = () => { this.equipChar = c; this.renderInv(this.invFilter); };
            cList.appendChild(el);
        });

        const iList = document.getElementById('inv-list');
        iList.innerHTML = "";
        
        if(!this.equipChar) { iList.innerHTML = "<div style='padding:10px; color:#666;'>キャラクターを選択してください</div>"; return; }

        const filters = {all:'すべて', weapon:'武器', armor:'防具', accessory:'装飾'};
        let fHtml = '<div style="display:flex; gap:5px; margin-bottom:5px;">';
        for(let k in filters) {
            let active = k===filter ? 'color:var(--accent-color); border-color:var(--accent-color);' : '';
            fHtml += `<button style="font-size:10px; padding:2px 5px; ${active}" onclick="UI.renderInv('${k}')">${filters[k]}</button>`;
        }
        iList.innerHTML = fHtml + '</div>';

        let eqHtml = '<div style="background:#222; padding:5px; margin-bottom:10px;">';
        const slotNames = { main_hand:"主", off_hand:"副", head:"頭", body:"体", accessory1:"飾1", accessory2:"飾2" };
        for(let s in this.equipChar.equipment) {
            let it = this.equipChar.equipment[s];
            let name = it ? `<span class="rar-${it.rarity}">${it.name}</span>` : "なし";
            let btn = it ? `<button style="font-size:9px;" onclick="UI.doUnequip('${s}')">外す</button>` : "";
            eqHtml += `<div style="font-size:10px; display:flex; justify-content:space-between; margin-bottom:2px;">
                <span style="color:#888; width:20px;">${slotNames[s]||s}</span>
                <span>${name} ${btn}</span>
            </div>`;
        }
        iList.innerHTML += eqHtml + '</div>';

        let items = Game.inventory.filter(i => filter==='all' || i.type===filter);
        if(items.length===0) iList.innerHTML += "<div style='padding:10px; color:#666;'>アイテムなし</div>";
        
        items.forEach(item => {
            const idx = Game.inventory.indexOf(item);
            const div = document.createElement('div');
            const check = this.equipChar.canEquip(item);
            
            let stats = "";
            const statMap = {str:"腕", vit:"耐", mag:"魔", int:"知", agi:"速", luc:"運", dex:"器"};
            for(let k in item.stats) if(item.stats[k]) stats += `${statMap[k]||k}:${item.stats[k]} `;
            const rarClass = `rar-${item.rarity}`; 
            
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
                    UI.hideTooltip();
                };
                div.onmouseenter = (e) => UI.showItemCompare(e, item, this.equipChar);
                div.onmousemove = (e) => UI.moveTooltip(e);
                div.onmouseleave = () => UI.hideTooltip();
            }
            iList.appendChild(div);
        });
    },
    
    showItemCompare(e, newItem, char) {
        const tt = document.getElementById('ui-tooltip');
        if(!tt || !char) return;

        let targetSlot = newItem.slot;
        if (newItem.slot === 'accessory') {
            if (!char.equipment.accessory1) targetSlot = 'accessory1';
            else if (!char.equipment.accessory2) targetSlot = 'accessory2';
            else targetSlot = 'accessory1';
        }
        const currentItem = char.equipment[targetSlot];

        let html = `<div class="tooltip-header">装備比較 [${newItem.slot}]</div>`;
        html += `<div class="diff-grid" style="margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:5px;">`;
        html += `<div></div><div style="color:#aaa;">現在</div><div style="color:#fff;">変更後</div>`;
        html += `<div>名前</div><div style="text-align:right; font-size:10px;">${currentItem ? currentItem.name : "なし"}</div><div style="text-align:right; font-size:10px; color:var(--accent-color);">${newItem.name}</div>`;
        html += `</div>`;

        html += `<div class="diff-grid">`;
        const statKeys = ['str', 'vit', 'mag', 'int', 'agi', 'luc', 'dex'];
        const statNames = {str:"腕力", vit:"耐久", mag:"魔力", int:"知力", agi:"素早", luc:"運", dex:"器用"};

        statKeys.forEach(key => {
            const curVal = currentItem ? (currentItem.stats[key] || 0) : 0;
            const newVal = newItem.stats[key] || 0;
            const diff = newVal - curVal;

            if (curVal !== 0 || newVal !== 0) {
                let diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                let diffClass = diff > 0 ? "diff-plus" : (diff < 0 ? "diff-minus" : "diff-zero");
                if (diff === 0) diffStr = "-";

                html += `<div class="diff-label">${statNames[key]}</div>`;
                html += `<div class="diff-current">${curVal}</div>`;
                html += `<div class="diff-val ${diffClass}">${diffStr}</div>`;
            }
        });
        html += `</div>`;

        tt.innerHTML = html;
        tt.style.display = 'block';
        this.moveTooltip(e);
    },

    moveTooltip(e) {
        const tt = document.getElementById('ui-tooltip');
        if(tt && tt.style.display === 'block') {
            let x = e.pageX + 15;
            let y = e.pageY + 15;
            if (x + 220 > window.innerWidth) x -= 240;
            if (y + 200 > window.innerHeight) y -= 200;
            tt.style.left = x + 'px';
            tt.style.top = y + 'px';
        }
    },

    hideTooltip() {
        const tt = document.getElementById('ui-tooltip');
        if(tt) tt.style.display = 'none';
    },

    // ★修正: Add Class Change Button to Detail Modal
    showCharDetail(c) {
        const s = c.totalStats;
        const html = `
            <div class="detail-header"><h2>${c.name}</h2><div>Lv.${c.level} ${c.job.name}</div></div>
            <div class="detail-sections">
                <div><h4>ステータス</h4>
                <div class="detail-row"><span class="detail-label">HP</span> <span>${Math.floor(c.hp)} / ${s.hp}</span></div>
                <div class="detail-row"><span class="detail-label">STR</span> <span>${s.str}</span></div>
                <div class="detail-row"><span class="detail-label">VIT</span> <span>${s.vit}</span></div>
                <div class="detail-row"><span class="detail-label">MAG</span> <span>${s.mag}</span></div>
                <div class="detail-row"><span class="detail-label">INT</span> <span>${s.int}</span></div>
                <div class="detail-row"><span class="detail-label">AGI</span> <span>${s.agi}</span></div>
                <div class="detail-row"><span class="detail-label">LUC</span> <span>${s.luc}</span></div>
                </div>
                <div>
                    <button onclick="UI.openEquipFor('${c.id}')" style="width:100%; margin-bottom:5px;">装備変更</button>
                    <button onclick="UI.openClassChange('${c.id}')" style="width:100%;">転職</button>
                </div>
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