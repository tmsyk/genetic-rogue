/**
 * Genetic Rogue - Master Database (Full Version)
 * スプレッドシート等で管理しているCSVデータをここに貼り付けるだけで反映されます。
 */

// ==========================================
// 1. CSVデータ定義
// ==========================================
const CSV_RACES = `id,name,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc
human,人間,1,1,1,1,1,1,1
elf,エルフ,0.8,0.8,0.8,1.3,1.2,1.1,1
dwarf,ドワーフ,1.2,1.1,1.3,0.8,0.9,0.7,1
beast,獣人,1.1,1.2,1,0.6,0.7,1.3,1
halfling,小人,0.7,0.7,0.7,1,1.1,1.4,1.4
dark_elf,ダークエルフ,0.9,0.9,0.8,1.4,1.1,1.2,0.7
orc,オーク,1.4,1.3,1.1,0.5,0.5,0.8,0.8
gnome,ノーム,0.7,0.6,0.9,1.2,1.5,0.8,1.1
fairy,妖精,0.5,0.4,0.4,1.5,1.2,1.5,1.5
dragonewt,竜人,1.3,1.4,1.3,0.9,0.8,0.7,0.8
goblin,ゴブリン,0.8,0.7,0.8,0.6,0.8,1.2,1.3
undead,アンデッド,1.5,1.2,0.5,0.8,0.5,0.5,0.5
automaton,機械人形,1.2,1.3,1.5,0.1,1.3,0.6,0.5
angel,天使,0.9,0.9,0.9,1.3,1.2,1.1,1.2
demon,悪魔,1.2,1.2,1.1,1.2,1,0.9,0.6
slime,スライム,1.5,0.8,1.5,0.5,0.4,0.5,1
alien,異星人,0.8,0.6,0.7,1.5,1.6,0.9,0.8
giant,巨人,1.7,1.6,1.4,0.4,0.4,0.4,0.6
cyborg,サイボーグ,1.1,1.3,1.2,0.4,1.2,1,0.8
phantom,幽霊,0.6,0.5,0.1,1.4,1,1.3,1`;

const CSV_JOBS = `id,name,tier,type,equip_types,lineage,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc,req_job,master_skill,req_hp,req_str,req_vit,req_mag,req_int,req_agi,req_luc,req_el
primitive,原始人,1,phy,hm,sp,la,warrior,1.3,1.3,1.2,0.4,0.4,1.1,1,none,野生の勘,0,0,0,0,0,0,0,
villager,村人,1,sup,hm,dg,ro,special,1,0.9,0.9,0.9,0.9,0.9,1,none,生活の知恵,0,0,0,0,0,0,0,
slave,奴隷,1,phy,hm,no,no,warrior,1.5,1.2,1.2,0.5,0.5,0.8,0.5,none,労働力,0,0,0,0,0,0,0,
warrior,戦士,1,phy,sw,ax,ha,sh,warrior,1.2,1.2,1.1,0.5,0.8,0.9,1,none,戦士の魂,0,10,0,0,0,0,0,
mage,魔法使い,1,mag,st,dg,ro,ac,magic,0.8,0.6,0.8,1.5,1.4,1,1,none,魔道知識,0,0,0,10,0,0,0,
thief,盗賊,1,spd,dg,bow,la,ac,shadow,0.9,1.2,0.8,0.8,1.2,1.5,1.5,none,盗賊の目,0,0,0,0,0,10,0,
priest,僧侶,1,sup,st,ro,sh,ac,holy,1,0.8,1.2,1.2,1.3,0.9,1.2,none,祈りの心,0,0,0,0,10,0,0,
merchant,商人,1,spe,dg,la,ac,special,1,0.8,0.8,1,1.2,1,1.8,none,商売勘,0,0,0,0,0,0,10,
monk,武闘家,1,phy,kn,la,ac,martial,1.3,1.1,0.9,0.8,1,1.3,1,none,武術の心得,15,0,0,0,0,0,0,
hunter,狩人,1,tec,bow,dg,la,ac,shadow,1,1.1,1,0.5,1.2,1.3,1.1,none,狩人の勘,0,0,0,0,0,10,0,
noble,貴族,2,sup,sw,ac,ro,special,1,0.9,0.9,1,1.2,1,1.5,villager,ノブレスオブリージュ,15,0,0,0,30,0,40,
mercenary,傭兵,2,phy,sw,ax,la,warrior,1.3,1.3,1.1,0.5,0.8,1,0.9,warrior,傭兵の意地,15,25,0,0,0,0,0,
knight,騎士,2,tnk,sw,sp,ha,sh,warrior,1.4,1.2,1.4,0.6,1,0.8,1,warrior,騎士道,100,20,20,0,0,0,0,
fencer,剣士,2,phy,sw,dg,la,warrior,1.1,1.2,0.9,0.8,1,1.4,1,warrior,剣の舞,15,0,0,0,0,30,0,wind
gladiator,重戦士,2,phy,ax,hm,ha,warrior,1.5,1.4,1.2,0.4,0.6,0.8,0.8,warrior,闘技場の覇者,20,40,30,0,0,0,0,earth
cleric,神官,2,sup,st,hm,ro,holy,1,0.7,1.1,1.3,1.4,0.8,1.1,priest,聖なる祈り,20,0,0,30,30,0,0,light
druid,ドルイド,2,mag,st,wh,ro,magic,1.1,0.8,1,1.4,1.2,0.9,1,mage,自然の守り,15,0,0,30,20,0,0,earth;wind
sorcerer,魔術師,2,mag,st,dg,ro,magic,0.7,0.5,0.7,1.7,1.5,1,1,mage,魔力循環,20,0,0,30,0,0,0,fire;ice;thunder
brawler,喧嘩屋,2,phy,kn,hm,la,martial,1.4,1.3,1.2,0.5,0.7,1.1,1.1,monk,喧嘩殺法,15,30,0,0,0,0,0,earth
boxer,拳闘士,2,phy,kn,no,la,martial,1.5,1.4,1.2,0.4,0.6,1.2,0.8,brawler,ボクシング,15,35,0,0,0,30,0,wind
samurai,侍,2,phy,sw,bow,la,martial,1.2,1.5,1,0.6,1.1,1.2,1,monk,侍魂,30,0,0,0,0,0,0,fire
ninja,忍者,2,spd,sw,dg,to,la,shadow,0.9,1.3,0.8,1,1.2,1.6,1.2,thief,忍びの歩法,20,0,0,0,0,30,0,wind;dark
bard,吟遊詩人,2,sup,ins,dg,la,special,1,0.9,0.9,1.2,1.2,1.1,1.5,merchant,歌の力,20,0,0,20,0,0,0,wind
dancer,踊り子,2,sup,dg,wh,la,special,0.9,0.8,0.8,1.1,1,1.5,1.4,merchant,魅惑の舞,15,0,0,0,0,30,30,water
blacksmith,鍛冶屋,2,spe,hm,ax,la,tech,1.3,1.3,1.3,0.6,1.2,0.7,1,merchant,職人魂,20,30,30,0,0,0,0,fire
cook,料理人,2,sup,dg,hm,la,special,1.1,1,1.1,0.8,1,0.9,1.1,merchant,調理技術,10,0,0,0,0,0,0,fire;water
student,学生,2,tec,kn,dg,la,tech,0.9,0.8,0.8,1,1.5,1,1.1,human,学習能力,10,0,0,0,20,0,0,
soldier,兵士,2,tec,gun,kn,la,tech,1.2,1.1,1.1,0.5,1,1.1,1,hunter,軍隊格闘,10,20,0,0,0,0,0,
gunner,ガンマン,2,tec,gun,la,ac,tech,1.1,1.2,1,0.5,1.4,1.2,1.1,hunter,射撃技術,25,0,0,0,0,0,0,fire
medic,衛生兵,2,sup,gun,dv,la,tech,1.1,0.9,1,1,1.3,1,1,soldier,応急処置,15,0,0,0,30,0,30,light
mechanic,整備士,2,tec,hm,dv,la,tech,1,0.9,1,0.6,1.6,0.9,1,merchant,メンテナンス,15,0,0,0,30,0,0,thunder
builder,建築家,2,spe,hm,ax,la,tech,1.2,1.1,1.2,0.6,1.2,0.8,0.9,student,建築学,15,20,20,0,30,0,0,earth
scout,スカウト,2,spd,dg,bow,la,shadow,0.9,1,0.9,0.7,1.2,1.4,1.3,thief,偵察眼,15,0,0,0,0,30,0,wind
witch,魔女,2,mag,st,dg,ro,magic,0.8,0.5,0.7,1.6,1.4,1.1,1.2,mage,魔女の秘薬,20,0,0,40,20,0,0,dark
shaman,呪術師,2,mag,st,wh,ro,magic,1,0.6,0.9,1.5,1.1,0.8,0.7,mage,呪いの言葉,20,0,0,35,0,0,0,dark
esper,エスパー,2,mag,dv,st,la,magic,0.8,0.6,0.7,1.5,1.3,1,1.1,student,超能力覚醒,15,0,0,30,30,0,0,
guard,衛兵,2,tnk,sp,ha,sh,warrior,1.4,1.2,1.3,0.4,0.8,0.7,0.9,mercenary,門番の誇り,15,30,30,0,0,0,0,
magic_knight,魔法剣士,3,phy,sw,st,la,warrior,1.3,1.4,1.1,1.4,1.2,1.1,1,knight,魔法剣,30,40,0,40,0,0,0,fire;ice
paladin,聖騎士,3,tnk,sw,ha,sh,warrior,1.5,1.3,1.8,1,1.2,0.8,1,knight,聖なる加護,200,40,40,20,0,0,0,light
berserker,狂戦士,3,phy,ax,sw,la,warrior,1.8,1.9,0.8,0.2,0.3,1.3,0.6,gladiator,バーサーク,30,70,0,0,0,0,0,fire
dark_knight,暗黒騎士,3,phy,sw,sp,ha,warrior,1.6,1.7,1.4,1,0.8,1,0.6,knight,暗黒の力,30,60,50,0,0,0,0,dark
runeknight,ルーンナイト,3,phy,sw,bk,ha,warrior,1.4,1.5,1.3,1.3,1.3,1,1,magic_knight,ルーンの守り,30,50,0,50,40,0,0,wind;earth
high_priest,司教,3,sup,st,bk,ro,holy,1,0.6,1.1,1.6,1.6,0.9,1.2,cleric,慈愛の光,30,0,0,50,50,0,0,light
sage,賢者,3,mag,st,ro,ac,magic,0.8,0.5,0.8,2,2,1,1,sorcerer,賢者の知恵,50,0,0,40,40,0,0,light;earth
necromancer,死霊術師,3,mag,st,sc,ro,shadow,0.9,0.7,0.8,1.8,1.5,0.8,0.6,sorcerer,死の支配,30,0,0,60,30,0,0,dark
geomancer,風水師,3,mag,hm,st,ro,magic,1.1,1,1,1.5,1.4,1,1.4,druid,大地の力,30,0,0,40,40,0,0,earth
cryomancer,氷術師,3,mag,st,dg,ro,magic,0.9,0.6,0.9,1.8,1.4,1,1,sorcerer,絶対零度,30,0,0,50,30,0,0,ice
master_monk,拳聖,3,phy,kn,la,ac,martial,1.5,1.6,1.3,0.8,1.2,1.4,1,monk,無の境地,40,50,0,0,0,50,0,
karate_master,空手家,3,phy,kn,no,la,martial,1.6,1.7,1.3,0.5,0.8,1.3,0.9,boxer,空手,30,60,0,0,0,40,0,earth
grappler,グラップラー,3,phy,kn,la,ac,martial,1.6,1.5,1.4,0.4,0.7,1.2,1,brawler,締め技,30,50,40,0,0,0,0,
sumo,力士,3,tnk,no,no,no,martial,2.5,1.8,1.5,0.5,0.5,0.6,1,grappler,綱取,30,80,80,0,0,0,0,earth
assassin,暗殺者,3,spd,dg,bow,la,shadow,0.9,1.5,0.7,0.8,1.3,1.8,1.3,ninja,暗殺術,40,0,0,0,20,50,0,dark
assassin_master,暗殺頭領,3,spd,dg,kat,la,shadow,1,1.5,0.9,0.8,1.5,1.7,1.1,ninja,影の支配者,30,0,0,0,30,60,0,dark
ninja_master,上忍,3,spd,kat,dg,la,shadow,1,1.4,1,1.2,1.3,1.7,1.2,ninja,空蝉,30,30,0,30,0,50,0,wind;dark
pirate,海賊,3,phy,sw,gun,la,warrior,1.3,1.4,1.2,0.6,0.9,1.2,1.5,thief,略奪者,30,40,0,0,0,0,30,water
inventor,発明家,3,tec,gun,dv,la,tech,0.8,0.7,0.8,0.8,2,0.9,1.3,mechanic,ひらめき,30,0,0,0,70,0,0,thunder
alchemist,錬金術師,3,spe,st,dv,ro,tech,0.9,0.8,0.9,1.4,1.8,1,1.2,magician,等価交換,30,0,0,40,60,0,0,fire;water
beast_tamer,魔物使い,3,spe,wh,bow,la,special,1.2,1.1,1.1,1,1,1.2,1.4,hunter,野性の心,25,0,0,0,0,0,40,earth
yakuza,極道,3,phy,kat,dg,su,warrior,1.4,1.5,1.3,0.5,1.1,1.1,1.3,mercenary,仁義,30,50,40,0,0,0,0,fire
spy,工作員,3,spd,gun,dg,su,tech,1,1.2,0.9,0.8,1.6,1.5,1.3,scout,潜入工作,30,0,0,0,50,50,0,wind
professor,教授,3,tec,bk,dv,la,tech,0.8,0.5,0.7,1.2,2.2,0.8,1,student,論理的思考,30,0,0,0,80,0,0,
genetics_eng,遺伝子工学士,3,spe,dv,dv,la,tech,1,0.7,0.8,1,1.8,1,1,medic,遺伝子操作,30,0,0,0,70,0,0,water
commando,特殊部隊,3,tec,gun,kn,su,tech,1.4,1.5,1.3,0.5,1.2,1.3,1,soldier,サバイバル,30,50,0,0,0,40,0,earth
general,将軍,3,sup,sw,sp,ha,warrior,1.6,1.5,1.5,0.6,1.5,0.9,1.2,knight,指揮官の威厳,40,60,50,0,40,0,0,
exorcist,祓魔師,3,mag,gun,bk,ro,holy,1,1,1,1.5,1.5,1.1,1,priest,浄化の炎,30,0,0,40,40,0,0,fire;light
gambler,賭博師,3,spe,dg,ac,la,special,1,0.8,0.8,0.5,1,1.1,2,merchant,イカサマ,30,0,0,0,0,0,80,
idol,アイドル,3,sup,mic,ac,la,special,0.9,0.7,0.8,1.3,1,1.4,1.8,dancer,輝く笑顔,30,0,0,30,0,50,50,light
maid,メイド,3,sup,dg,hm,ro,special,1.2,1.1,1,1,1.1,1.3,1.3,cook,奉仕の心,30,0,0,0,0,40,40,water
vampire,吸血鬼,3,mag,sc,dg,ro,shadow,1.5,1.4,1.5,1.6,1.2,1.4,0.8,necromancer,吸血,20,40,40,50,0,0,0,dark
werewolf,人狼,3,phy,kn,ax,la,martial,1.8,1.7,1.4,0.4,0.6,1.6,0.8,brawler,獣の血,30,60,0,0,0,50,0,earth
hacker,ハッカー,3,tec,dv,gn,la,tech,0.8,0.5,0.6,1,2.4,1.1,1.2,student,電子の海,40,0,0,0,80,0,0,thunder
dragoon,竜騎士,3,phy,sp,ha,la,warrior,1.4,1.6,1.2,0.8,1,1.2,1,knight,竜の血,25,0,50,30,0,0,0,fire
sniper,狙撃手,3,tec,gun,la,to,tech,1,1.6,0.9,0.5,1.5,1.3,1.2,gunner,狙撃の極意,40,0,0,0,0,0,0,wind
elementalist,精霊使い,3,mag,st,wh,ro,magic,1,0.8,0.9,1.7,1.3,1.1,1,shaman,精霊の加護,30,0,0,50,40,0,0,fire;ice;wind;earth
curse_maker,呪い師,3,mag,st,dg,ro,shadow,0.8,0.6,0.7,1.6,1.4,0.9,2,shaman,呪詛,30,0,0,50,40,0,60,dark
spaceman,宇宙飛行士,3,tec,gun,su,su,tech,1.2,1.1,1.2,0.5,1.4,1,1.1,pilot,無重力適応,30,0,40,0,40,0,0,ice
merchant_baron,豪商,3,spe,dg,ac,la,special,1.2,1,1.1,0.5,1.5,0.8,2.2,merchant,財力,30,0,0,0,50,0,60,
slime_lord,スライムロード,3,tnk,hm,sh,no,special,2.5,1.2,2,1,0.8,0.5,1,student,液状化,20,0,50,0,0,0,0,water
golem_master,ゴーレム使い,3,tec,hm,dv,ha,tech,1.2,1.3,1.4,0.8,1.4,0.6,0.8,blacksmith,人形操作,30,40,40,0,40,0,0,earth
dual_wielder,二刀流,3,spd,sw,kat,la,warrior,1.2,1.5,1,0.6,1,1.6,1.1,fencer,二刀流,30,40,0,0,0,50,40,wind
heavy_gunner,重砲兵,3,tec,gn,ha,su,tech,1.4,1.4,1.5,0.5,1,0.6,1,gunner,重火器の心得,30,50,50,0,0,0,0,fire
chariot,戦車兵,3,tnk,gn,ha,su,tech,1.8,1.5,1.8,0.4,1,0.6,0.8,soldier,キャタピラ,30,50,60,0,0,0,0,earth
influencer,インフルエンサー,3,spe,dv,ac,la,special,0.8,0.6,0.7,0.8,1.2,1.2,2.2,idol,拡散力,30,0,0,0,40,0,70,
streamer,配信者,3,spe,dv,mic,la,tech,0.9,0.6,0.8,0.8,1.4,1.1,1.8,student,ライブ配信,25,0,0,0,50,0,50,thunder
samurai_archer,弓取り,3,tec,bow,kat,la,martial,1.2,1.3,1,0.6,1,1.3,1.1,samurai,騎射,30,40,0,0,0,40,50,wind
grid_walker,電脳遊戯者,3,spd,dv,kn,su,tech,1,1.1,0.9,1,1.5,1.8,1.2,hacker,ゲーマー,30,0,0,0,50,60,50,thunder
star_gazer,星読み,3,mag,st,dv,ro,magic,0.9,0.5,0.8,1.6,1.5,1,1.4,astrologer,占星術,30,0,0,50,60,0,0,light
puppet_master,人形使い,3,tec,wh,dv,ro,tech,1,0.8,0.9,1.2,1.6,1.1,1,mechanic,人形劇,30,0,0,40,60,0,60,thunder
executioner,処刑人,3,phy,ax,sw,la,shadow,1.6,1.7,1.2,0.4,0.8,1.1,0.5,mercenary,断頭,30,60,0,0,0,0,0,dark
monk_soldier,僧兵,3,phy,sp,hm,ro,holy,1.5,1.4,1.3,1.1,1,1,1,monk,金剛力,30,40,40,0,30,0,0,earth
astrologer,占星術師,3,mag,st,dv,ro,magic,0.9,0.5,0.8,1.8,1.6,0.9,1.5,witch,星の導き,30,0,0,60,50,0,0,light
kamikaze,特攻隊,3,phy,kn,sw,la,warrior,1.2,2,0.5,0.5,0.5,1.5,0.5,mercenary,特攻精神,30,70,0,0,0,50,0,fire
aquanaut,アクアノート,3,phy,sp,gun,su,tech,1.3,1.2,1.3,0.8,1.1,1,1,soldier,水中行動,30,30,40,0,0,0,0,water
sylphid,シルフィード,3,mag,st,bow,ro,magic,0.8,0.5,0.7,1.6,1.4,1.5,1.1,druid,風の精霊,25,0,0,40,0,50,0,wind
salamander,サラマンダー,3,phy,kn,sw,la,martial,1.4,1.6,1.1,1,0.6,1.2,0.8,brawler,火蜥蜴,30,50,0,20,0,0,0,fire
gnome_lord,ノームロード,3,tnk,hm,ax,ha,warrior,1.7,1.5,1.6,0.5,1,0.5,1,gladiator,大地の王,40,60,60,0,0,0,0,earth
undine,ウンディーネ,3,sup,st,wh,ro,holy,1.1,0.6,1,1.4,1.3,1,1.2,cleric,水の癒し,30,0,0,40,0,0,0,water
raijin,雷神,3,phy,hm,st,ha,warrior,1.5,1.7,1.3,1.2,0.8,1.4,1,monk,雷撃,40,60,0,30,0,40,0,thunder
fujin,風神,3,spd,dg,sc,la,shadow,1.2,1.4,1,1.2,0.9,1.8,1.1,ninja,烈風,30,50,0,30,0,70,0,wind
hero,英雄,4,phy,sw,ax,sp,ha,warrior,1.5,1.8,1.5,1,1.2,1.2,1.5,paladin,英雄の証,40,0,80,60,40,40,40,light
cyborg,サイボーグ,4,tnk,dv,ax,gun,ha,tech,1.8,1.6,2,0.5,1.5,1,0.8,sniper,機械化ボディ,50,0,70,70,0,0,0,thunder
demon,魔神,4,mag,st,dv,ro,magic,1.2,1,1,3,1.5,1.2,0.5,sage,魔神の契約,20,20,10,0,60,0,0,dark
marine,宇宙海兵,4,phy,gun,sw,ha,tech,1.5,1.8,1.5,0.5,1.2,1.2,1,sniper,強化骨格,40,0,80,50,0,0,0,earth
psycho,超能力者,4,mag,dv,ro,ac,magic,0.8,0.5,0.8,2.5,2.5,1.2,1,sage,超感覚,90,90,0,0,0,0,0,
samurai_lord,剣豪,4,phy,kat,sw,ha,warrior,1.5,1.9,1.2,0.6,1.1,1.5,1.1,samurai,心眼,40,70,0,0,0,60,0,
archmage,大魔導士,4,mag,st,bk,ro,magic,0.9,0.6,0.9,2.4,2,1,1,sorcerer,魔道の極み,50,0,0,90,70,0,0,fire;ice;thunder
phantom_thief,怪盗,4,spd,dg,gun,su,shadow,1,1.2,1,1,1.8,1.8,1.8,thief,神出鬼没,50,0,0,0,60,80,60,wind;dark
android,アンドロイド,4,tec,dv,gun,su,tech,1.6,1.6,1.8,0.5,2,1.2,0.8,mechanic,AI演算,40,0,60,0,80,0,0,thunder
bio_soldier,強化兵士,4,phy,gn,kn,su,tech,1.9,1.8,1.7,0.4,1,1.4,0.7,commando,ドーピング,40,70,70,0,0,0,0,earth
nano_healer,ナノ医術師,4,sup,dv,gun,su,tech,1.1,0.8,1.2,1.2,2.2,1.1,1,high_priest,ナノ再生,40,0,0,0,80,0,0,light;thunder
plasma_gunner,重火器兵,4,tec,gn,ax,ha,tech,1.5,1.6,1.6,0.8,1.1,0.9,1,sniper,火力支援,40,60,0,0,0,0,70,thunder;fire
shadow_stalker,影の追跡者,4,spd,kat,dg,su,shadow,1.1,1.5,1,0.8,1.5,2,1.2,assassin,影渡り,40,0,0,0,50,80,0,dark
ceo,ＣＥＯ,4,spe,dv,ac,su,special,1,0.8,0.9,0.5,2.5,1,2.5,merchant,買収,60,0,0,0,90,0,90,
pilot,パイロット,4,tec,dv,gun,su,tech,1.2,1,1.1,0.5,1.6,1.4,1.4,inventor,操縦技術,40,0,0,0,60,60,70,thunder
net_diver,電脳探偵,4,tec,dv,kat,su,tech,0.9,1.2,0.8,1.2,2.3,1.5,1.3,hacker,ダイブ,40,0,0,0,80,0,0,thunder
chronomancer,時魔道士,4,mag,st,bk,ro,magic,1,0.6,0.9,2.2,2.1,1.4,1.1,sage,時の歯車,40,0,0,80,70,60,0,wind
lich,リッチ,4,mag,sc,st,ro,shadow,1.2,0.8,0.5,2.5,2,0.8,0.5,necromancer,不死の王,50,0,0,90,80,0,0,dark
beast_king,獣王,4,phy,kn,ax,la,martial,2,2,1.8,0.5,0.8,1.6,1,werewolf,百獣の王,40,80,70,0,0,50,0,earth
weapon_master,武器王,4,phy,all,all,ha,warrior,1.6,1.8,1.5,0.5,1,1.3,1,gladiator,達人の技,50,80,0,0,0,0,80,
spaceman,宇宙飛行士,3,tec,gun,su,su,tech,1.2,1.1,1.2,0.5,1.4,1,1.1,pilot,無重力適応,30,0,40,0,40,0,0,ice
space_pirate,宇宙海賊,4,spd,gn,sw,su,shadow,1.4,1.6,1.3,0.6,1.2,1.5,1.8,pirate,宇宙の狼,40,60,0,0,0,50,60,ice;dark
king,王,4,sup,sw,ac,ha,special,1.5,1.5,1.5,1,1.5,1,2,general,王者の風格,50,60,60,0,60,0,80,
princess,姫,4,sup,dg,ac,ro,special,0.8,0.5,0.8,1.5,1.5,1.2,2.5,idol,王家の血筋,50,0,0,50,50,0,90,light
mad_scientist,狂科学者,4,tec,dv,po,la,tech,0.9,0.7,0.8,1.2,2.3,1.2,0.6,professor,マッドサイエンス,50,0,0,0,90,0,0,thunder;dark
biollante,植物兵器,4,phy,wh,ax,no,martial,2.2,1.8,2,0.8,0.5,0.6,0.5,druid,光合成,40,60,80,40,0,0,0,earth;light
prophet,預言者,4,sup,st,bk,ro,holy,0.8,0.5,0.8,1.8,2,1,1.8,astrologer,予知夢,50,0,0,70,90,0,70,light
time_traveler,時間旅行者,4,spe,gun,dv,su,special,1,1,1,1.5,1.5,2,2,chronomancer,タイムリープ,40,0,0,60,60,80,80,wind;light
terra_former,惑星開拓者,4,tec,hm,dv,su,tech,1.5,1.5,1.6,0.8,1.5,1,1,builder,テラフォーミング,40,60,60,0,60,0,0,earth
super_star,スーパースター,4,sup,mic,ac,su,special,1,0.8,1,1.2,1.2,1.5,2.5,influencer,オーラ,50,0,0,40,40,0,90,light
space_cowboy,宇宙カウボーイ,4,tec,gn,wh,su,tech,1.3,1.4,1.2,0.6,1.2,1.6,1.5,gunner,早撃ち,40,50,0,0,40,60,70,ice
dictator,独裁者,4,sup,gun,sw,ha,special,1.4,1.4,1.3,0.8,1.8,1,1.5,general,独裁,50,60,0,0,70,0,70,
cyber_samurai,電脳侍,4,phy,kat,dv,su,warrior,1.5,1.8,1.4,0.6,1.4,1.8,1,samurai_lord,サイバー刀法,50,80,0,0,50,70,0,thunder
sniper_elite,精鋭狙撃手,4,tec,gn,dg,su,tech,1.1,1.5,1,0.5,1.3,1.4,1.3,sniper,ワンショット,50,0,0,0,50,60,90,wind
deep_diver,深海探査員,4,tec,hm,dv,su,tech,1.3,1.2,1.4,0.6,1.5,1,1,aquanaut,深海適応,40,50,60,0,60,0,0,water
blitz_lancer,電撃槍兵,4,phy,sp,gn,ha,warrior,1.5,1.6,1.3,1,0.8,1.5,1,guard,迅雷,40,70,50,0,0,50,0,thunder
frost_giant,氷の巨人,4,phy,ax,hm,no,martial,2.2,2,1.8,0.8,0.5,0.6,0.8,gnome_lord,氷砕,50,90,80,0,0,0,0,ice
storm_bringer,ストームブリンガー,4,mag,st,sc,ro,magic,1,0.8,0.9,2.2,1.8,1.5,1,sylphid,嵐の呼び声,40,0,0,80,0,60,0,wind
valkyrie,戦乙女,5,phy,sp,sw,ha,holy,1.8,1.8,1.6,1.5,1.4,1.6,1.5,paladin,戦乙女の加護,50,80,60,60,60,0,0,light
dragon_lord,竜王,5,phy,sw,ax,ha,warrior,2.5,2.2,2,1.5,1.2,1.2,1,dragoon,竜王の覇気,50,90,80,50,0,0,0,fire;dark
messiah,救世主,5,sup,st,ro,ac,holy,1.5,1,1.5,2,2,1.2,2,high_priest,救済,60,0,60,80,80,0,80,light
avatar,アバター,5,tec,dv,gn,su,tech,2,1.5,1.5,2.5,3,2,1.5,hacker,リンク接続,60,0,0,100,100,100,0,light;thunder
destroyer,破壊神,5,phy,ax,hm,ha,warrior,3,3,2.5,0.5,0.5,1,0.5,berserker,破壊衝動,60,120,100,0,0,0,0,fire;dark
god_hand,武神,5,phy,kn,la,ac,martial,2.2,2.5,2,1,1.5,2.2,1.2,master_monk,神の拳,60,100,80,0,50,80,0,
trickster,トリックスター,5,spe,dg,ac,su,special,1.5,1.5,1.2,1.5,1.8,2.5,3,phantom_thief,運命操作,60,0,0,50,80,100,100,
deus_ex_machina,機械仕掛けの神,5,tec,all,all,su,tech,2.5,2,2.5,2,3,1.5,1,android,デウス・エクス,60,80,80,80,100,0,0,thunder;light
grim_reaper,死神,5,spd,sc,dg,ro,shadow,1.2,2,1,2,1.5,2.5,0.5,assassin_master,魂の収穫,60,80,0,60,0,90,0,dark
ancient_king,古代王,5,sup,sw,ac,ha,special,2,2,2,1.5,2,1.5,2,king,王の威光,60,80,80,50,80,0,80,light
void_walker,虚空の旅人,5,spd,dv,st,ro,shadow,1.2,1.2,1.2,2.5,2,2.5,1.5,time_traveler,虚数空間,60,0,0,80,80,100,0,dark
ai_god,ＡＩ神,5,tec,all,all,su,tech,2,1.5,2,3,3.5,2,1,avatar,シンギュラリティ,70,0,0,120,120,0,0,light;thunder
quantum_mage,量子魔術師,5,mag,dv,st,su,tech,1.1,0.6,1,3,3,1.5,1.2,chronomancer,量子もつれ,60,0,0,100,100,0,0,light
leviathan,リヴァイアサン,5,phy,sp,wh,no,special,2.5,2.2,2.2,1.5,1,1.2,1,aquanaut,津波,60,100,100,60,0,0,0,water
fenrir,フェンリル,5,spd,kn,dg,no,shadow,2,2.5,1.5,1,1,2.5,1,werewolf,氷狼牙,60,110,0,0,0,110,0,ice`;

const CSV_ITEMS = `id,name,kind,type,slot,base_str,base_vit,base_mag,base_int,base_agi,base_luc,base_dex,tier,req_stat,req_val,element
w1,ショートソード,sw,weapon,main_hand,5,0,0,0,0,0,2,1,,,none
w2,ロングソード,sw,weapon,main_hand,10,0,0,0,0,0,3,1,,,none
w3,ブロードソード,sw,weapon,main_hand,15,2,0,0,-2,0,4,2,str,10,none
w4,バスタードソード,sw,weapon,main_hand,22,0,0,0,-3,0,5,2,str,20,none
w5,ミスリルソード,sw,weapon,main_hand,30,0,5,0,5,0,5,3,,,none
w6,フレイムタン,sw,weapon,main_hand,35,0,10,0,0,0,5,3,mag,20,fire
w7,アイスブランド,sw,weapon,main_hand,35,0,10,0,0,0,5,3,mag,20,ice
w8,クリスタルソード,sw,weapon,main_hand,45,0,15,0,2,5,10,3,,,none
w9,高周波ブレード,sw,weapon,main_hand,60,0,0,5,10,0,15,4,dex,50,thunder
w10,ビームサーベル,sw,weapon,main_hand,75,0,10,10,5,0,10,4,int,40,light
w11,プラズマカッター,sw,weapon,main_hand,85,0,0,15,5,0,10,4,dex,60,thunder
w12,フォトンブレード,sw,weapon,main_hand,95,0,20,10,10,0,15,5,int,80,light
w13,エクスカリバー,sw,weapon,main_hand,120,20,30,20,10,10,10,5,str,100,light
w14,ラグナロク,sw,weapon,main_hand,150,0,50,0,20,0,20,5,,,dark
w15,アポカリプス,sw,weapon,main_hand,180,-20,20,0,0,-10,0,5,,,dark
w16,さびた剣,sw,weapon,main_hand,2,0,0,0,-1,-5,0,1,,,none
w17,訓練用の剣,sw,weapon,main_hand,3,0,0,0,0,0,1,1,,,none
w18,エストック,sw,weapon,main_hand,18,0,0,0,5,0,8,2,dex,20,none
w19,クレイモア,sw,weapon,main_hand,28,5,0,0,-5,0,0,2,str,30,none
w20,ドラゴンキラー,sw,weapon,main_hand,50,10,0,0,0,5,5,3,str,50,none
kat1,打刀,kat,weapon,main_hand,12,0,0,0,5,0,5,1,dex,10,none
kat2,脇差,kat,weapon,main_hand,8,0,0,0,8,2,8,1,agi,15,none
kat3,野太刀,kat,weapon,main_hand,25,0,0,0,-5,0,5,2,str,25,none
kat4,菊一文字,kat,weapon,main_hand,40,0,5,5,10,5,10,3,dex,40,none
kat5,村正,kat,weapon,main_hand,65,-10,10,0,15,0,15,4,,,dark
kat6,レーザーカタナ,kat,weapon,main_hand,80,0,0,15,20,0,20,4,int,50,light
kat7,正宗,kat,weapon,main_hand,130,10,20,20,30,20,30,5,,,light
kat8,童子切安綱,kat,weapon,main_hand,140,5,0,0,10,10,10,5,,,none
dg1,ナイフ,dg,weapon,main_hand,3,0,0,0,3,0,3,1,,,none
dg2,ダガー,dg,weapon,main_hand,6,0,0,0,5,0,5,1,,,none
dg3,ポイズンダガー,dg,weapon,main_hand,10,0,5,0,5,0,5,2,,,dark
dg4,アサシンダガー,dg,weapon,main_hand,15,0,0,0,10,5,10,2,agi,30,dark
dg5,マインゴーシュ,dg,weapon,main_hand,12,5,0,0,5,0,10,2,dex,25,none
dg6,ソードブレイカー,dg,weapon,main_hand,20,5,0,0,10,0,15,3,dex,40,none
dg7,ヒートナイフ,dg,weapon,main_hand,40,0,10,5,15,0,15,4,int,30,fire
dg8,粒子ナイフ,dg,weapon,main_hand,55,0,0,15,25,0,20,4,dex,60,light
dg9,神殺しの短剣,dg,weapon,main_hand,100,0,30,0,50,30,50,5,,,dark
sp1,スピア,sp,weapon,main_hand,8,0,0,0,2,0,2,1,,,none
sp2,パルチザン,sp,weapon,main_hand,15,0,0,0,3,0,4,2,str,15,none
sp3,ハルバード,sp,weapon,main_hand,22,0,0,0,0,0,0,2,str,25,none
sp4,トライデント,sp,weapon,main_hand,20,0,5,0,5,0,5,2,,,ice
sp5,ホーリーランス,sp,weapon,main_hand,45,5,15,10,5,5,5,3,int,30,light
sp6,ドリルスピア,sp,weapon,main_hand,60,10,0,5,-5,0,10,4,str,60,earth
sp7,レーザーランス,sp,weapon,main_hand,80,0,10,20,10,0,10,4,int,50,light
sp8,グングニル,sp,weapon,main_hand,140,0,40,30,30,30,30,5,,,wind
sp9,ロンギヌス,sp,weapon,main_hand,160,20,50,20,10,0,10,5,,,light
ax1,ハンドアクス,ax,weapon,main_hand,10,0,0,0,-2,0,2,1,,,none
ax2,トマホーク,ax,weapon,main_hand,14,0,0,0,2,0,5,2,dex,15,wind
ax3,バトルアクス,ax,weapon,main_hand,25,0,0,0,-5,0,0,2,str,30,none
ax4,グレートアクス,ax,weapon,main_hand,35,5,0,0,-10,0,0,3,str,50,none
ax5,ドワーフの斧,ax,weapon,main_hand,45,10,0,0,-5,0,5,3,vit,40,earth
ax6,ビームアクス,ax,weapon,main_hand,70,0,0,10,0,0,10,4,int,40,light
ax7,グラビティアクス,ax,weapon,main_hand,90,10,10,20,-20,0,0,4,str,80,dark
ax8,パンゲアブレイカー,ax,weapon,main_hand,180,30,0,0,-30,0,0,5,,,earth
hm1,クラブ,hm,weapon,main_hand,6,0,0,0,-1,0,0,1,,,none
hm2,メイス,hm,weapon,main_hand,12,0,5,2,0,0,0,1,str,10,none
hm3,ウォーハンマー,hm,weapon,main_hand,28,0,0,0,-5,0,0,2,str,35,none
hm4,モーニングスター,hm,weapon,main_hand,24,0,0,0,-2,0,5,2,,,none
hm5,ジャッジメント,hm,weapon,main_hand,50,0,15,15,0,0,0,3,int,40,thunder
hm6,インパクトハンマー,hm,weapon,main_hand,75,10,0,15,-10,0,10,4,str,60,earth
hm7,ミョルニル,hm,weapon,main_hand,150,20,50,0,10,20,10,5,,,thunder
sc1,草刈り鎌,sc,weapon,main_hand,5,0,0,0,2,0,5,1,,,none
sc2,大鎌,sc,weapon,main_hand,20,0,5,0,0,-5,10,2,,,none
sc3,死神の鎌,sc,weapon,main_hand,45,0,20,10,5,-10,15,3,mag,30,dark
sc4,プラズマサイズ,sc,weapon,main_hand,85,0,10,20,15,0,20,4,int,60,thunder
sc5,クロノスサイズ,sc,weapon,main_hand,140,0,40,40,30,0,30,5,,,dark
wh1,革の鞭,wh,weapon,main_hand,6,0,0,0,2,0,8,1,,,none
wh2,チェーンウィップ,wh,weapon,main_hand,15,0,0,0,0,0,12,2,dex,20,none
wh3,ローズウィップ,wh,weapon,main_hand,30,0,10,0,5,5,15,3,,,earth
wh4,モノフィラメント,wh,weapon,main_hand,70,0,0,15,10,0,30,4,dex,80,none
kn1,バンテージ,kn,weapon,main_hand,3,0,0,0,2,0,2,1,,,none
kn2,レザーナックル,kn,weapon,main_hand,8,0,0,0,3,0,5,1,,,none
kn3,アイアンナックル,kn,weapon,main_hand,15,2,0,0,0,0,5,2,,,none
kn4,カイザーナックル,kn,weapon,main_hand,35,5,0,0,5,5,10,3,str,40,none
kn5,パワードフィスト,kn,weapon,main_hand,65,10,0,10,5,0,15,4,str,60,thunder
kn6,ゴッドハンド,kn,weapon,main_hand,120,30,30,30,30,30,30,5,,,light
bw1,ショートボウ,bw,weapon,main_hand,8,0,0,0,2,0,5,1,,,none
bw2,ロングボウ,bw,weapon,main_hand,15,0,0,0,0,0,8,2,str,15,none
bw3,クロスボウ,bw,weapon,main_hand,25,0,0,0,-5,0,10,2,str,20,none
bw4,エルフの弓,bw,weapon,main_hand,30,0,10,5,10,5,15,3,dex,40,wind
bw5,コンパウンドボウ,bw,weapon,main_hand,50,0,0,5,5,0,20,3,,,none
bw6,アルテミス,bw,weapon,main_hand,110,0,30,20,20,20,40,5,,,light
gn1,ハンドガン,gn,weapon,main_hand,20,0,0,0,0,0,15,2,dex,10,none
gn2,ショットガン,gn,weapon,main_hand,35,0,0,0,-5,0,10,2,str,20,none
gn3,スナイパーライフル,gn,weapon,main_hand,50,0,0,10,-5,5,30,3,dex,50,none
gn4,アサルトライフル,gn,weapon,main_hand,40,0,0,0,5,0,20,3,dex,30,none
gn5,レーザーガン,gn,weapon,main_hand,60,0,10,20,0,0,25,4,int,40,light
gn6,プラズマライフル,gn,weapon,main_hand,80,0,10,25,0,0,20,4,int,60,thunder
gn7,レールガン,gn,weapon,main_hand,100,0,0,30,-10,0,40,4,str,70,thunder
gn8,反物質砲,gn,weapon,main_hand,200,0,0,50,-20,0,50,5,,,dark
st1,木の杖,st,weapon,main_hand,2,0,5,2,0,0,0,1,,,earth
st2,樫の杖,st,weapon,main_hand,5,0,10,5,0,0,0,2,,,earth
st3,マジックスタッフ,st,weapon,main_hand,8,0,20,10,0,0,0,2,int,20,none
st4,ルビーロッド,st,weapon,main_hand,15,0,30,10,0,0,0,3,mag,30,fire
st5,賢者の杖,st,weapon,main_hand,20,0,40,30,0,0,0,3,int,50,none
st6,フォースロッド,st,weapon,main_hand,30,0,60,40,5,0,5,4,int,60,light
st7,カドゥケウス,st,weapon,main_hand,50,20,100,80,10,20,10,5,,,light
bk1,古い魔導書,bk,weapon,off_hand,0,0,5,5,0,0,0,1,int,10,none
bk2,炎のグリモワール,bk,weapon,off_hand,0,0,15,5,0,0,0,2,mag,20,fire
bk3,死霊の書,bk,weapon,off_hand,0,-10,25,15,0,-5,0,3,mag,40,dark
bk4,アカシックレコード,bk,weapon,off_hand,0,0,50,100,20,50,0,5,,,light
sh1,木の盾,sh,armor,off_hand,0,3,0,0,0,0,0,1,,,none
sh2,バックラー,sh,armor,off_hand,0,5,0,0,2,0,0,1,,,none
sh3,カイトシールド,sh,armor,off_hand,0,10,0,0,-1,0,0,2,str,15,none
sh4,タワーシールド,sh,armor,off_hand,0,20,0,0,-10,0,0,2,str,30,none
sh5,マジックシールド,sh,armor,off_hand,0,12,10,5,0,0,0,3,,,none
sh6,ミラーシールド,sh,armor,off_hand,0,18,5,0,0,5,0,3,,,light
sh7,エネルギーシールド,sh,armor,off_hand,0,30,0,20,0,0,0,4,int,40,thunder
sh8,アイギス,sh,armor,off_hand,10,60,30,30,0,20,0,5,,,light
hl1,バンダナ,hat,armor,head,0,1,0,0,1,1,0,1,,,none
hl2,革の帽子,hat,armor,head,0,2,0,0,0,0,1,1,,,none
hl3,アイアンヘルム,hl,armor,head,0,5,0,0,-1,0,0,2,vit,10,none
hl4,フルヘルム,hl,armor,head,0,10,0,0,-3,0,0,2,str,20,none
hl5,ウィザードハット,hat,armor,head,0,2,5,5,0,0,0,2,,,none
hl6,羽根突き帽子,hat,armor,head,0,3,0,2,3,5,5,3,,,wind
hl7,ミスリルヘルム,hl,armor,head,0,15,5,0,0,0,0,3,,,none
hl8,暗視ゴーグル,hat,armor,head,0,2,0,15,0,0,20,4,int,30,none
hl9,タクティカルバイザー,hat,armor,head,2,5,0,20,5,0,15,4,,,none
hl10,光輪,hat,armor,head,10,20,30,30,10,10,0,5,,,light
a1,ボロの服,ro,armor,body,0,1,0,0,0,0,0,1,,,none
a2,旅人の服,ro,armor,body,0,3,0,0,1,1,0,1,,,none
a3,レザーアーマー,la,armor,body,0,5,0,0,2,0,2,1,,,none
a4,ハードレザー,la,armor,body,0,8,0,0,1,0,1,2,,,none
a5,チェーンメイル,ha,armor,body,0,12,0,0,-2,0,0,2,str,15,none
a6,プレートメイル,ha,armor,body,0,20,0,0,-10,0,0,2,str,30,none
a7,ローブ,ro,armor,body,0,2,5,5,0,0,0,2,,,none
a8,シルクのローブ,ro,armor,body,0,4,10,8,2,0,0,3,,,none
a9,忍び装束,la,armor,body,2,10,0,5,10,5,5,3,agi,30,dark
a10,ドラゴンメイル,ha,armor,body,5,30,0,0,-5,0,0,3,str,50,fire
a11,ナノスーツ,su,armor,body,5,25,0,10,10,0,10,4,,,none
a12,強化外骨格,su,armor,body,20,40,0,0,-10,0,10,4,str,60,earth
a13,光学迷彩スーツ,su,armor,body,0,15,0,20,30,10,10,4,int,50,wind
a14,神の衣,ro,armor,body,10,50,50,50,20,20,0,5,,,light
a15,アダマンアーマー,ha,armor,body,10,80,0,0,-20,0,0,5,,,earth
ac1,鉄の指輪,ac,accessory,accessory,0,2,0,0,0,0,0,1,,,none
ac2,力の指輪,ac,accessory,accessory,5,0,0,0,0,0,0,2,,,none
ac3,守りの指輪,ac,accessory,accessory,0,5,0,0,0,0,0,2,,,none
ac4,知恵の指輪,ac,accessory,accessory,0,0,0,5,0,0,0,2,,,none
ac5,疾風の指輪,ac,accessory,accessory,0,0,0,0,5,0,0,2,,,wind
ac6,アミュレット,ac,accessory,accessory,0,0,5,0,0,0,0,2,,,none
ac7,パワーベルト,ac,accessory,accessory,10,5,0,0,-2,0,0,3,,,none
ac8,盗賊の七つ道具,dv,accessory,accessory,0,0,0,5,5,5,20,3,,,none
ac9,魔除け,ac,accessory,accessory,0,0,10,10,0,10,0,3,,,light
ac10,加速装置,dv,accessory,accessory,0,0,0,0,20,-5,0,4,,,thunder
ac11,エナジーパック,dv,accessory,accessory,0,0,20,0,0,0,0,4,,,thunder
ac12,賢者の石,ac,accessory,accessory,10,10,20,20,0,0,0,5,,,none
ac13,ドラゴンハート,ac,accessory,accessory,30,30,10,0,0,0,0,5,,,fire
ac14,オメガチップ,dv,accessory,accessory,20,20,20,20,20,20,20,5,,,light
w21,竹槍,sp,weapon,main_hand,4,0,0,0,1,0,1,1,,,earth
w22,青銅の剣,sw,weapon,main_hand,7,0,0,0,0,0,2,1,,,none
w23,石の斧,ax,weapon,main_hand,9,0,0,0,-3,0,0,1,,,earth
w24,サバイバルナイフ,dg,weapon,main_hand,5,1,0,0,2,0,4,1,,,none
w25,スリング,bw,weapon,main_hand,4,0,0,0,1,0,5,1,,,none
w26,警棒,hm,weapon,main_hand,6,1,0,0,0,0,2,1,,,none
w27,十手,kat,weapon,main_hand,5,2,0,0,0,0,5,1,,,none
w28,シミター,sw,weapon,main_hand,13,0,0,0,2,0,4,2,,,none
w29,グラディウス,sw,weapon,main_hand,11,1,0,0,1,0,3,2,,,none
w30,フランベルジュ,sw,weapon,main_hand,26,0,0,0,-2,0,3,3,str,25,fire
w31,ツヴァイハンダー,sw,weapon,main_hand,32,3,0,0,-8,0,0,3,str,40,none
w32,斬馬刀,kat,weapon,main_hand,38,0,0,0,-5,0,5,3,str,45,none
w33,忍者刀,kat,weapon,main_hand,22,0,5,0,10,0,8,3,agi,30,dark
w34,ランス,sp,weapon,main_hand,28,5,0,0,-5,0,0,3,str,35,none
w35,偃月刀,sp,weapon,main_hand,32,0,0,0,-2,0,5,3,str,30,none
w36,ウォーピック,ax,weapon,main_hand,22,0,0,0,0,0,2,2,,,none
w37,バルディッシュ,ax,weapon,main_hand,38,0,0,0,-8,0,0,3,str,45,none
w38,スレッジハンマー,hm,weapon,main_hand,40,5,0,0,-15,0,0,3,str,50,earth
w39,フレイル,hm,weapon,main_hand,26,0,0,0,0,0,5,3,,,none
w40,ブラッドサイズ,sc,weapon,main_hand,35,0,10,0,0,-5,10,3,,,dark
w41,クナイ,dg,weapon,main_hand,10,0,0,5,8,0,15,2,,,none
w42,バタフライナイフ,dg,weapon,main_hand,8,0,0,0,5,2,8,2,,,none
w43,セラミックナイフ,dg,weapon,main_hand,25,0,0,5,10,0,10,3,,,none
w44,コンバットボウ,bw,weapon,main_hand,20,0,0,0,2,0,10,2,,,none
w45,大弓,bw,weapon,main_hand,35,0,0,0,-5,0,5,3,str,30,none
w46,リボルバー,gn,weapon,main_hand,25,0,0,0,0,2,12,2,,,none
w47,マシンガン,gn,weapon,main_hand,30,0,0,0,-2,0,25,3,dex,30,none
w48,バズーカ,gn,weapon,main_hand,65,0,0,0,-20,0,5,4,str,50,fire
w49,火炎放射器,gn,weapon,main_hand,50,0,20,0,-10,0,5,4,,,fire
w50,スタンロッド,hm,weapon,main_hand,30,0,10,10,0,0,5,3,,,thunder
w51,ショックグローブ,kn,weapon,main_hand,25,0,10,5,5,0,10,3,,,thunder
w52,ドラゴンクロー,kn,weapon,main_hand,45,5,0,0,10,0,5,4,,,fire
w53,ルーンブレード,sw,weapon,main_hand,40,0,20,10,0,0,5,3,mag,30,light
w54,アサシンブレード,sw,weapon,main_hand,35,0,0,0,15,10,15,3,dex,40,dark
w55,聖なるナイフ,dg,weapon,main_hand,20,0,10,10,5,5,5,3,,,light
w56,妖刀村雨,kat,weapon,main_hand,55,-5,15,0,10,0,10,4,,,ice
w57,エンシェントボウ,bw,weapon,main_hand,60,0,20,20,5,5,15,4,,,light
w58,ガトリングガン,gn,weapon,main_hand,70,0,0,0,-15,0,40,4,str,60,none
w59,ニュートロンガン,gn,weapon,main_hand,90,0,0,40,0,0,20,5,int,80,light
w60,ブラックホール砲,gn,weapon,main_hand,150,0,50,100,-30,0,0,5,,,dark
w61,チェーンソー,sw,weapon,main_hand,50,0,0,0,-10,-5,10,3,,,none
w62,ライトセーバー,sw,weapon,main_hand,85,0,10,15,10,0,10,4,int,40,light
w63,ヒートホーク,ax,weapon,main_hand,75,0,0,20,0,0,5,4,,,fire
w64,パイルバンカー,sp,weapon,main_hand,100,0,0,10,-10,0,5,4,str,70,earth
w65,ドリルナックル,kn,weapon,main_hand,55,5,0,5,-5,0,5,3,,,earth
w66,マジックハンド,dv,weapon,main_hand,10,0,0,20,0,0,30,3,,,none
w67,ボウガン,bw,weapon,main_hand,18,0,0,0,0,0,8,2,,,none
w68,吹き矢,bw,weapon,main_hand,5,0,0,0,5,5,10,1,,,dark
w69,チャクラム,dg,weapon,main_hand,15,0,5,0,5,0,10,2,,,none
w70,ブーメラン,dg,weapon,main_hand,12,0,0,0,5,5,10,2,,,wind
w71,手裏剣セット,dg,weapon,main_hand,18,0,0,5,10,0,20,2,,,none
w72,風魔手裏剣,dg,weapon,main_hand,35,0,5,10,15,0,15,3,,,dark
w73,くない改,dg,weapon,main_hand,25,0,0,10,10,0,10,3,,,none
w74,鎖鎌,sc,weapon,main_hand,28,0,0,0,10,0,15,3,,,none
w75,蛇腹剣,sw,weapon,main_hand,42,0,0,0,5,0,15,3,dex,35,none
w76,エストック改,sw,weapon,main_hand,30,0,0,0,8,0,10,3,,,none
w77,マンゴーシュ,dg,weapon,main_hand,15,8,0,0,5,0,5,2,,,none
w78,トライデント改,sp,weapon,main_hand,35,0,10,0,5,0,5,3,,,ice
w79,薙刀,sp,weapon,main_hand,30,0,0,0,5,0,5,3,,,none
w80,青龍刀,sw,weapon,main_hand,38,5,0,0,0,0,5,3,,,none
w81,方天画戟,sp,weapon,main_hand,55,0,0,0,5,0,10,4,,,none
w82,如意棒,st,weapon,main_hand,60,10,10,10,10,10,10,4,,,earth
w83,鉄扇,hm,weapon,main_hand,20,5,10,5,0,0,0,3,,,wind
w84,三節棍,st,weapon,main_hand,30,0,0,0,5,0,15,3,,,none
w85,ヌンチャク,hm,weapon,main_hand,18,0,0,0,10,0,10,2,,,none
w86,トンファー,hm,weapon,main_hand,15,10,0,0,5,0,5,2,,,none
w87,金砕棒,hm,weapon,main_hand,60,0,0,0,-10,0,0,4,str,60,earth
w88,木刀,kat,weapon,main_hand,10,0,0,0,2,0,2,1,,,none
w89,竹刀,kat,weapon,main_hand,5,0,0,0,5,0,5,1,,,none
w90,模造刀,kat,weapon,main_hand,8,0,0,0,0,0,0,1,,,none
w91,名刀「虎徹」,kat,weapon,main_hand,50,0,0,0,5,5,5,3,,,none
w92,名刀「兼定」,kat,weapon,main_hand,55,0,0,0,5,0,10,3,,,none
w93,大太刀,kat,weapon,main_hand,65,5,0,0,-5,0,5,4,,,none
w94,くない・影,dg,weapon,main_hand,40,0,10,10,20,0,20,4,,,dark
w95,仕込み杖,sw,weapon,main_hand,25,0,5,5,0,5,10,3,,,none
w96,レイピア,sw,weapon,main_hand,16,0,0,0,5,0,8,2,,,none
w97,フルーレ,sw,weapon,main_hand,14,0,0,0,5,0,10,2,,,none
w98,サーベル,sw,weapon,main_hand,22,0,0,0,2,0,5,2,,,none
w99,カットラス,sw,weapon,main_hand,24,2,0,0,0,5,0,2,,,none
w100,ファルシオン,sw,weapon,main_hand,26,0,0,0,0,0,2,2,,,none
a16,作業着,la,armor,body,0,2,0,0,0,0,2,1,,,none
a17,学生服,la,armor,body,0,3,0,1,0,0,0,1,,,none
a18,礼服,ro,armor,body,0,2,0,2,0,5,0,2,,,none
a19,道着,la,armor,body,2,5,0,0,5,0,0,2,,,none
a20,バトルドレス,la,armor,body,0,15,0,0,5,0,5,3,,,none
a21,スケイルメイル,ha,armor,body,0,10,0,0,-1,0,0,2,,,none
a22,ブリガンダイン,ha,armor,body,0,14,0,0,0,0,0,2,,,none
a23,スプリントメイル,ha,armor,body,0,16,0,0,-3,0,0,2,,,none
a24,フィールドアーマー,ha,armor,body,0,25,0,0,-5,0,0,3,,,none
a25,ゴシックアーマー,ha,armor,body,0,35,0,0,-8,0,0,3,,,dark
a26,聖騎士の鎧,ha,armor,body,5,40,10,10,-5,0,0,4,str,50,light
a27,暗黒騎士の鎧,ha,armor,body,10,45,0,0,-5,-10,0,4,str,55,dark
a28,ウィザードローブ,ro,armor,body,0,5,15,10,0,0,0,3,int,30,none
a29,司祭のローブ,ro,armor,body,0,8,10,20,0,0,0,3,int,30,light
a30,大賢者のローブ,ro,armor,body,0,10,30,30,0,0,0,4,int,60,light
a31,迷彩服,la,armor,body,0,8,0,0,5,0,5,2,,,earth
a32,防弾チョッキ,la,armor,body,0,15,0,0,-2,0,0,3,,,none
a33,SWATベスト,la,armor,body,0,20,0,0,0,0,5,3,,,none
a34,宇宙服,su,armor,body,0,15,0,10,-5,0,0,3,,,ice
a35,ダイビングスーツ,su,armor,body,0,10,0,0,0,0,5,2,,,ice
a36,防火服,su,armor,body,0,12,0,0,-5,0,0,2,,,fire
a37,ハザードスーツ,su,armor,body,0,15,0,5,-5,0,0,3,,,dark
a38,ステルススーツ,su,armor,body,0,10,0,10,20,0,10,4,,,wind
a39,サイバースーツ,su,armor,body,5,20,0,15,10,0,10,4,,,thunder
a40,グラビティスーツ,su,armor,body,10,50,0,20,-10,0,0,5,,,earth
a41,ふんどし,la,armor,body,5,0,0,0,5,5,0,1,,,none
a42,ビキニアーマー,la,armor,body,0,8,0,0,5,10,0,2,,,none
a43,着物,ro,armor,body,0,3,5,0,0,2,0,2,,,none
a44,十二単,ro,armor,body,0,10,10,0,-10,5,0,3,,,none
a45,メイド服,ro,armor,body,0,5,0,0,5,5,5,2,,,none
a46,執事服,ro,armor,body,0,5,0,5,5,0,5,2,,,none
a47,きぐるみ,la,armor,body,10,5,0,0,-5,10,0,2,,,none
a48,拘束衣,la,armor,body,20,5,0,0,-20,-10,0,3,,,dark
a49,ボーンアーマー,ha,armor,body,5,15,0,0,-2,0,0,2,,,dark
a50,ミスリルメイル,ha,armor,body,0,25,5,0,0,0,0,3,,,none
sh9,お盆,sh,armor,off_hand,0,1,0,0,0,1,0,1,,,none
sh10,鍋の蓋,sh,armor,off_hand,0,2,0,0,0,0,0,1,,,none
sh11,ラウンドシールド,sh,armor,off_hand,0,8,0,0,0,0,0,2,,,none
sh12,ヒーターシールド,sh,armor,off_hand,0,12,0,0,-2,0,0,2,,,none
sh13,スパイクシールド,sh,armor,off_hand,5,10,0,0,-2,0,0,2,,,none
sh14,ボーンシールド,sh,armor,off_hand,2,12,0,0,-1,0,0,2,,,dark
sh15,ドラゴンシールド,sh,armor,off_hand,0,25,0,0,-5,0,0,3,,,fire
sh16,フレイムシールド,sh,armor,off_hand,0,15,5,0,0,0,0,3,,,fire
sh17,アイスシールド,sh,armor,off_hand,0,15,5,0,0,0,0,3,,,ice
sh18,ダイヤの盾,sh,armor,off_hand,0,35,0,0,-5,5,0,4,,,none
sh19,源氏の盾,sh,armor,off_hand,0,30,0,0,0,5,5,4,,,none
sh20,ビームシールド,sh,armor,off_hand,0,40,0,10,0,0,0,4,,,light
sh21,フォースフィールド,sh,armor,off_hand,0,50,0,20,0,0,0,5,,,thunder
sh22,次元の盾,sh,armor,off_hand,0,60,20,20,0,0,0,5,,,dark
sh23,バックラー改,sh,armor,off_hand,0,8,0,0,3,0,0,2,,,none
sh24,パルマ,sh,armor,off_hand,0,6,0,0,1,0,0,1,,,none
sh25,ホプロン,sh,armor,off_hand,0,15,0,0,-3,0,0,2,,,none
sh26,スクトゥム,sh,armor,off_hand,0,22,0,0,-8,0,0,3,,,none
sh27,ライオットシールド,sh,armor,off_hand,0,20,0,0,-2,0,0,3,,,none
sh28,セラミックシールド,sh,armor,off_hand,0,25,0,0,-1,0,0,3,,,none
hl11,ニット帽,hat,armor,head,0,1,0,0,0,0,0,1,,,none
hl12,野球帽,hat,armor,head,0,1,0,0,0,1,0,1,,,none
hl13,ヘルメット,hl,armor,head,0,4,0,0,0,0,0,1,,,none
hl14,ハチマキ,hat,armor,head,2,0,0,0,0,0,0,1,,,none
hl15,ターバン,hat,armor,head,0,2,0,0,0,0,0,1,,,none
hl16,サークレット,hat,armor,head,0,1,5,0,0,0,0,2,,,none
hl17,ティアラ,hat,armor,head,0,1,2,5,0,2,0,2,,,none
hl18,眼帯,hat,armor,head,2,0,0,0,0,0,5,2,,,none
hl19,ガスマスク,hl,armor,head,0,3,0,0,-1,0,0,2,,,wind
hl20,フルフェイス,hl,armor,head,0,6,0,0,-2,0,0,2,,,none
hl21,グレートヘルム,hl,armor,head,0,12,0,0,-4,0,0,3,,,none
hl22,ドラゴンヘルム,hl,armor,head,2,18,0,0,-2,0,0,3,,,fire
hl23,源氏の兜,hl,armor,head,2,15,0,0,0,5,0,4,,,none
hl24,リボン,hat,armor,head,0,5,5,5,5,10,0,4,,,light
hl25,猫耳,hat,armor,head,0,1,0,0,5,5,0,2,,,none
hl26,スカルヘルム,hl,armor,head,0,10,0,10,-5,-5,0,3,,,dark
hl27,王冠,hat,armor,head,0,5,10,10,0,10,0,4,,,none
hl28,ヘッドセット,dv,armor,head,0,2,0,10,0,0,5,3,,,thunder
hl29,スキャンバイザー,dv,armor,head,0,3,0,15,0,0,10,4,,,thunder
hl30,脳波インターフェース,dv,armor,head,0,0,10,30,0,0,0,5,,,thunder
ac15,ガラスの指輪,ac,accessory,accessory,0,0,0,0,0,1,0,1,,,none
ac16,銅の指輪,ac,accessory,accessory,0,1,0,0,0,0,0,1,,,none
ac17,銀の指輪,ac,accessory,accessory,0,0,2,2,0,0,0,2,,,none
ac18,金の指輪,ac,accessory,accessory,0,0,0,0,0,5,0,2,,,none
ac19,プラチナリング,ac,accessory,accessory,0,2,2,2,0,2,0,3,,,none
ac20,炎の指輪,ac,accessory,accessory,2,0,5,0,0,0,0,3,,,fire
ac21,氷の指輪,ac,accessory,accessory,0,2,5,0,0,0,0,3,,,ice
ac22,雷の指輪,ac,accessory,accessory,0,0,5,0,5,0,0,3,,,thunder
ac23,命の指輪,ac,accessory,accessory,0,20,0,0,0,0,0,3,,,light
ac24,魔力の指輪,ac,accessory,accessory,0,0,20,0,0,0,0,3,,,none
ac25,巨人の指輪,ac,accessory,accessory,10,10,0,0,-5,0,0,3,,,earth
ac26,ペガサスの靴,ac,accessory,accessory,0,0,0,0,10,0,0,3,,,wind
ac27,エルメスの靴,ac,accessory,accessory,0,0,0,0,20,0,0,4,,,wind
ac28,ロザリオ,ac,accessory,accessory,0,0,5,5,0,5,0,2,,,light
ac29,タリスマン,ac,accessory,accessory,0,0,10,5,0,0,0,3,,,dark
ac30,スカーフ,ac,accessory,accessory,0,0,0,0,2,1,0,1,,,wind
ac31,マント,ac,accessory,accessory,0,2,0,0,2,0,0,2,,,none
ac32,スパイクブーツ,ac,accessory,accessory,2,2,0,0,0,0,0,2,,,earth
ac33,安全靴,ac,accessory,accessory,0,5,0,0,-1,0,0,2,,,earth
ac34,ロケットブーツ,dv,accessory,accessory,0,0,0,0,15,0,0,4,,,fire
ac35,反重力装置,dv,accessory,accessory,0,0,0,0,30,0,0,5,,,wind
ac36,IDカード,dv,accessory,accessory,0,0,0,5,0,0,0,2,,,none
ac37,古代の石版,ac,accessory,accessory,0,0,10,10,0,0,0,3,,,earth
ac38,幸運のコイン,ac,accessory,accessory,0,0,0,0,0,10,0,2,,,none
ac39,呪いの人形,ac,accessory,accessory,10,0,10,0,0,-20,0,3,,,dark
ac40,天使の羽,ac,accessory,accessory,0,10,0,0,10,10,0,4,,,light
ac41,悪魔の尻尾,ac,accessory,accessory,10,0,10,0,10,0,0,4,,,dark
ac42,ブラックボックス,dv,accessory,accessory,0,0,0,50,0,0,0,5,,,dark
ac43,聖杯,ac,accessory,accessory,0,100,50,0,0,20,0,5,,,light
ac44,ソロモンの指輪,ac,accessory,accessory,20,20,20,20,20,20,20,5,,,none
ac45,サングラス,ac,accessory,accessory,0,0,0,0,0,2,2,1,,,light
ac46,懐中時計,ac,accessory,accessory,0,0,0,5,0,0,2,2,,,none
ac47,コンパス,ac,accessory,accessory,0,0,0,2,0,5,0,1,,,none
ac48,ランタン,ac,accessory,accessory,0,0,0,0,0,2,0,1,,,fire
ac49,救急キット,dv,accessory,accessory,0,10,0,5,0,0,5,2,,,none
ac50,工具セット,dv,accessory,accessory,0,0,0,5,0,0,10,2,,,none
ac51,双眼鏡,ac,accessory,accessory,0,0,0,0,0,0,5,1,,,wind
ac52,通信機,dv,accessory,accessory,0,0,0,10,0,0,0,3,,,thunder
ac53,ホログラム発生器,dv,accessory,accessory,0,0,0,0,10,5,0,3,,,light
ac54,学習装置,dv,accessory,accessory,0,0,0,20,0,0,0,4,,,none
ac55,翻訳機,dv,accessory,accessory,0,0,0,15,0,0,0,3,,,none
ac56,USBメモリ,dv,accessory,accessory,0,0,0,5,0,0,0,1,,,none
ac57,ハードディスク,dv,accessory,accessory,0,0,0,10,0,0,0,2,,,none
ac58,CPUコア,dv,accessory,accessory,0,0,0,20,0,0,0,3,,,thunder
ac59,AIチップ,dv,accessory,accessory,0,0,0,30,0,0,0,4,,,thunder
ac60,量子コンピュータ,dv,accessory,accessory,0,0,0,50,0,0,0,5,,,light
ac61,手錠,ac,accessory,accessory,0,5,0,0,-5,0,0,1,,,none
ac62,勲章,ac,accessory,accessory,2,2,0,2,0,5,0,3,,,none
ac63,勾玉,ac,accessory,accessory,0,0,5,5,0,5,0,2,,,none
ac64,鏡,ac,accessory,accessory,0,0,5,0,0,0,0,1,,,light
ac65,水晶玉,ac,accessory,accessory,0,0,10,5,0,0,0,2,,,ice
ac66,香水,ac,accessory,accessory,0,0,0,0,0,5,0,2,,,none
ac67,リボンタイ,ac,accessory,accessory,0,0,0,0,0,2,0,1,,,none
ac68,ネクタイ,ac,accessory,accessory,0,0,0,2,0,0,0,1,,,none
ac69,マフラー,ac,accessory,accessory,0,1,0,0,1,0,0,1,,,ice
ac70,手袋,ac,accessory,accessory,0,1,0,0,0,0,2,1,,,none`;

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
ドラゴン,500,80,30,50,15,300,200,fire,4
ヴァンパイア,200,40,15,30,20,150,100,dark,4
エンジェル,300,50,40,60,25,250,150,light,5`;

const CSV_ELEMENTS = `key,name,color,weak,strong
fire,火,#e74c3c,water,ice
ice,氷,#a29bfe,fire,wind
wind,風,#2ecc71,ice,earth
earth,土,#d35400,wind,thunder
thunder,雷,#f1c40f,earth,water
water,水,#3498db,thunder,fire
light,光,#ecf0f1,dark,dark
dark,闇,#2c3e50,light,light`;

const CSV_LINEAGE = `id,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc,color
warrior,1.5,1.5,1.2,0.2,0.6,0.8,1,#e74c3c
martial,1.4,1.3,0.9,0.5,1,1.5,1,#d35400
shadow,0.9,1.2,0.7,0.6,1.3,1.7,1.6,#8e44ad
magic,0.7,0.3,0.6,1.8,1.6,1,1,#3498db
holy,1.1,0.7,1.2,1.4,1.5,0.9,1.2,#f1c40f
tech,1.2,1,1.1,0.5,1.6,1.2,1.1,#1abc9c
special,1,0.8,0.8,1,1,1,2,#2ecc71`;

const CSV_PERSONALITY = `name,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc
勇敢,1.2,1.2,1,1,1,1,1
冷静,1,1,1.1,1,1.2,1,1
臆病,1,1,0.9,1,1,1.3,1
豪快,1,1.3,1,0.7,1,1,1
天才,0.9,1,1,1.2,1.2,1,1
幸運,1,1,1,1,1,1,1.5
堅実,1.1,1,1.2,1,1,0.8,1
凡人,1,1,1,1,1,1,1
野心家,1,1.1,1,1,1,1,1.1
慎重,1,1,1.3,1,1,0.8,1
短気,1,1.4,0.8,1,1,1,1
慈悲,1,1,1,1.1,1.3,1,1
怠惰,1.3,0.8,1.1,0.8,0.8,0.6,1
狡猾,0.9,0.9,0.9,1.1,1.4,1.1,1.1
冷酷,1,1.3,0.9,1.2,1.1,1.1,0.7
虚弱,0.6,0.6,0.6,1.5,1.5,0.9,0.9
愚鈍,1.5,1.4,1.4,0.5,0.5,0.6,0.8
貪欲,1,1,0.9,0.9,1,1.1,1.4
狂気,0.8,1.5,0.7,1.5,0.4,1.4,0.5
頑固,1.2,1.1,1.6,0.7,0.8,0.6,1`;

const CSV_SKILLS = `name,type,desc,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc,
剛腕,phy,物理攻撃力+10%,,1.1,,,,,,
連撃,phy,AGI+10%,,,,,,,1.1,
鉄壁,phy,防御力+15%,,,1.15,,,,,
カウンター,phy,回避時50%で反撃,,,,,,,,
急所突き,phy,クリティカル率+10%,,,,,,,,
粉砕,phy,敵の防御を貫通する,,,,,,,,
底力,phy,HP+20%,1.2,,,,,,,
闘争本能,phy,ターン経過で攻撃UP,,,,,,,,
受け流し,phy,物理ダメージ軽減,,,,,,,,
鬼神,phy,攻撃大幅UP防御DOWN,,1.3,0.8,,,,,
魔力集中,mag,魔法攻撃力+10%,,,,1.1,,,,
瞑想,mag,INT+10%,,,,,1.1,,,
炎の知識,mag,火属性ダメージ+20%,,,,,,,,
マナ効率,mag,スキル発動率UP,,,,,,,,
詠唱短縮,mag,行動速度+10%,,,,,,,,
属性強化,mag,弱点ダメージUP,,,,,,,,
結界,mag,魔法ダメージ軽減,,,,,,,,
精神統一,mag,状態異常耐性UP,,,,,,,,
古代の知恵,mag,経験値獲得量UP,,,,,,,,
魔神,mag,魔法大幅UPHP減少,0.8,,,1.3,,,,
早業,spd,命中率+20%,,,,,,,,
回避,spd,回避率+10%,,,,,,,,
不意打ち,spd,戦闘開始時先制攻撃,,,,,,,,
残像,spd,回避時次ターン攻撃UP,,,,,,,,
軽業,spd,AGI+15%,,,,,,,1.15,
目利き,spd,ドロップ率UP,,,,,,,,
二刀流の極意,spd,サブ武器補正UP,,,,,,,,
隠密,spd,敵に狙われにくくなる,,,,,,,,
俊足,spd,逃走成功率UP,,,,,,,,
神速,spd,稀に2回行動,,,,,,,,
挑発,tnk,敵の攻撃を引きつける,,,,,,,,
かばう,tnk,瀕死の味方をかばう,,,,,,,,
忍耐,tnk,HP30%以下で防御UP,,,,,,,,
リジェネ,tnk,毎ターンHP回復,,,,,,,,
重装甲,tnk,物理ダメージ-10%,,,,,,,,
不屈,tnk,致死ダメージを一度耐える,,,,,,,,
ガーディアン,tnk,味方全体の防御UP,,,,,,,,
自己修復,tnk,状態異常を自然治癒,,,,,,,,
城塞,tnk,防御大幅UP回避DOWN,,,1.5,,,,,
金剛,tnk,全ダメージ軽減,,,,,,,,
祈り,sup,味方全体のHP回復,,,,,,,,
祝福,sup,味方の攻撃力UP,,,,,,,,
慈愛,sup,回復効果+20%,,,,,,,,
応急手当,sup,戦闘終了時HP回復,,,,,,,,
加護,sup,状態異常耐性UP,,,,,,,,
薬の知識,sup,アイテム効果UP,,,,,,,,
聖なる光,sup,アンデッドに大ダメージ,,,,,,,,
献身,sup,自分のHPを分け与える,,,,,,,,
女神の瞳,sup,LUC+20%,,,,,,,1.2,
奇跡,sup,稀にダメージ無効化,,,,,,,,
戦士の魂,passive,物理攻撃力10%UP,,1.1,,,,,,
魔道知識,passive,魔法攻撃力10%UP,,,,1.1,,,,
盗賊の目,passive,運10%UP,,,,,,,1.1,
祈りの心,passive,耐久力10%UP,,,1.1,,,,,
商売勘,passive,運20%UP,,,,,,,1.2,
武術の心得,passive,HP10%UP,1.1,,,,,,,
狩人の勘,passive,器用さUP(AGI+5%),,,,,,,1.05,
騎士道,passive,耐久力15%UP,,,1.15,,,,,
侍魂,passive,物理攻撃力15%UP,,1.15,,,,,,
魔力循環,passive,魔法攻撃力15%UP,,,,1.15,,,,
歌の力,passive,全ステータス微増,1.02,1.02,1.02,1.02,1.02,1.02,1.02,
忍びの歩法,passive,素早さ15%UP,,,,,,,1.15,
射撃技術,passive,命中率UP,,,,,,,,
聖なる加護,passive,耐久と魔防UP,,,1.1,,1.1,,,
賢者の知恵,passive,魔力と知力UP,,,,1.1,1.1,,,
暗殺術,passive,クリティカルUP,,,,,,,,
竜の血,passive,HPと攻撃UP,1.1,1.1,,,,,,
狙撃の極意,passive,攻撃力20%UP,,1.2,,,,,,
英雄の証,passive,全ステータス10%UP,1.1,1.1,1.1,1.1,1.1,1.1,1.1,
機械化ボディ,passive,耐久力20%UP,,,1.2,,,,,
魔神の契約,passive,魔力30%UP,,,,1.3,,,,
強化骨格,passive,攻撃と耐久UP,,1.1,1.1,,,,,
超感覚,passive,魔力と素早さUP,,,,1.1,,1.1,,
遊び心,passive,運30%UP,,,,,,,1.3,
水中行動,passive,水属性耐性とAGIUP,1,1,1,1,1,1.15,1,
風の精霊,passive,風属性魔法威力UP,1,1,1,1.1,1.1,1.1,1,
火蜥蜴,passive,火属性耐性とSTRUP,1.1,1.1,1,1,1,1,1,
大地の王,passive,土属性耐性とVIT大幅UP,1.2,1.1,1.2,1,1,0.8,1,
水の癒し,passive,毎ターンHP回復(中),1,1,1,1,1,1,1,
雷撃,passive,雷属性物理ダメージUP,1,1.15,1,1,1,1.1,1,
烈風,passive,風属性物理ダメージUP,1,1,1,1,1,1.2,1.05,
深海適応,passive,水圧耐性(VIT大幅UP),1.1,1,1.2,1,1.1,1,1,
迅雷,passive,AGI大幅UPとクリティカル,1,1.1,1,1,1,1.2,1.1,
氷砕,passive,氷属性物理威力極大UP,1.1,1.3,1.1,1,1,0.8,1,
嵐の呼び声,passive,風・雷魔法威力大幅UP,1,1,1,1.2,1.1,1.1,1,
津波,passive,水属性威力極大UP,1.3,1.2,1.2,1.1,1,1,1,
氷狼牙,passive,AGI極大UPと即死効果,1.1,1.2,1,1,1,1.3,1.1,
絶対零度,passive,氷属性魔法威力大幅UP,1,1,1,1.2,1.1,1,1,`;

// ==========================================
// 2. CSVパーサーとデータ変換ロジック
// ==========================================

const DataParser = {
    // 修正: 空のフィールドも正しく読み取れるパーサー
    parse(csvText) {
        if(!csvText) return [];
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            // ダブルクォート内のカンマを無視し、空フィールドも維持するスプリット処理
            const row = [];
            let current = '';
            let inQuote = false;
            
            for(let j=0; j<line.length; j++) {
                const char = line[j];
                if(char === '"') {
                    inQuote = !inQuote;
                } else if(char === ',' && !inQuote) {
                    row.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            row.push(current); // 最後の列を追加

            if (row.length === 0 || (row.length === 1 && row[0] === '')) continue;

            const obj = {};
            headers.forEach((header, index) => {
                let value = row[index] ? row[index].replace(/^"|"$/g, '') : ''; // クォート削除
                if (value !== '' && !isNaN(value)) {
                    value = Number(value); // 数値変換
                }
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
                reqStats: reqStats,
                reqEl: job.req_el ? job.req_el.split(';') : null // ★追加: 属性要件のパース
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
                tier: item.tier || 1,
                req: req,
                elem: item.element || null // ★属性追加
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
            // パッシブ補正値の読み込み
            const mod = {};
            ['hp','str','vit','mag','int','agi','luc'].forEach(stat => {
                const key = `mod_${stat}`;
                if(s[key] && s[key] > 0) mod[stat] = s[key];
            });

            data[s.name] = { 
                desc: s.desc, 
                type: s.type,
                mod: mod // ★追加
            };
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
        HIRE_COST: 100,
        CC_COST: 100,
        MAX_LEVEL: 99,
        BASE_STATS: { hp:50, str:5, vit:5, mag:5, int:5, agi:5, luc:5 },
        FLOOR_STEP_MAX: 30
    },
    elements: parsedElements.list,
    element_chart: parsedElements.chart,
    jobs: DataParser.convertJobs(RAW_JOBS),
    job_ranks: [
        { tier: 1, prefix: "", mod: 1.0 },
        { tier: 2, prefix: "熟練", mod: 1.2 },
        { tier: 3, prefix: "達人", mod: 1.5 },
        { tier: 4, prefix: "伝説の", mod: 2.0 },
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