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

const CSV_JOBS = `id,name,tier,type,equip_types,lineage,mod_hp,mod_str,mod_vit,mod_mag,mod_int,mod_agi,mod_luc,req_job,req_hp,req_str,req_vit,req_mag,req_int,req_agi,req_luc
warrior,戦士,1,phy,sw,ax,ha,sh,warrior,1.2,1.2,1.1,0.5,0.8,0.9,1,,,,,,,,
mage,魔法使い,1,mag,st,dg,ro,ac,magic,0.8,0.6,0.8,1.5,1.4,1,1,,,,,,,,
thief,盗賊,1,spd,dg,bow,la,ac,shadow,0.9,1.2,0.8,0.8,1.2,1.5,1.5,,,,,,,,
priest,僧侶,1,sup,st,ro,sh,ac,holy,1,0.8,1.2,1.2,1.3,0.9,1.2,,,,,,,,
merchant,商人,1,spe,dg,la,ac,special,1,0.8,0.8,1,1.2,1,1.8,,,,,,,,
monk,武闘家,1,phy,kn,la,ac,martial,1.3,1.1,0.9,0.8,1,1.3,1,,,,,,,,
hunter,狩人,1,tec,bow,dg,la,ac,shadow,1,1.1,1,0.5,1.2,1.3,1.1,,,,,,,,
knight,騎士,2,tnk,sw,sp,ha,sh,warrior,1.4,1.2,1.4,0.6,1,0.8,1,warrior,100,20,20,,,,
samurai,侍,2,phy,sw,bow,la,martial,1.2,1.5,1,0.6,1.1,1.2,1,monk,,30,,,,,
sorcerer,魔術師,2,mag,st,dg,ro,magic,0.7,0.5,0.7,1.7,1.5,1,1,mage,,,20,30,,,
bard,吟遊詩人,2,sup,ins,dg,la,special,1,0.9,0.9,1.2,1.2,1.1,1.5,merchant,,,,,,20,20
ninja,忍者,2,spd,sw,dg,to,la,shadow,0.9,1.3,0.8,1,1.2,1.6,1.2,thief,,,,,20,30,
gunner,ガンマン,2,tec,gun,la,ac,tech,1.1,1.2,1,0.5,1.4,1.2,1.1,hunter,,,,,,25,
paladin,聖騎士,3,tnk,sw,ha,sh,warrior,1.5,1.3,1.8,1,1.2,0.8,1,knight,200,40,40,20,,,
sage,賢者,3,mag,st,ro,ac,magic,0.8,0.5,0.8,2,2,1,1,sorcerer,,,,50,40,,
assassin,暗殺者,3,spd,dg,bow,la,shadow,0.9,1.5,0.7,0.8,1.3,1.8,1.3,ninja,,40,,,20,50,
dragoon,竜騎士,3,phy,sp,ha,la,warrior,1.4,1.6,1.2,0.8,1,1.2,1,knight,250,50,30,,,,
sniper,狙撃手,3,tec,gun,la,to,tech,1,1.6,0.9,0.5,1.5,1.3,1.2,gunner,,40,,,20,,
hero,英雄,4,phy,sw,ax,sp,ha,warrior,1.5,1.8,1.5,1,1.2,1.2,1.5,paladin,400,80,60,40,40,40,40
cyborg,サイボーグ,4,tnk,dv,ax,gun,ha,tech,1.8,1.6,2,0.5,1.5,1,0.8,sniper,500,70,70,,,,
demon,魔神,4,mag,st,dv,ro,magic,1.2,1,1,3,1.5,1.2,0.5,sage,,20,20,100,60,,
marine,宇宙海兵,4,phy,gun,sw,ha,tech,1.5,1.8,1.5,0.5,1.2,1.2,1,sniper,400,80,50,,,,
psycho,超能力者,4,mag,dv,ro,ac,magic,0.8,0.5,0.8,2.5,2.5,1.2,1,sage,,,,90,90,,
jester,遊び人,2,spe,dg,ins,la,special,1,0.8,0.8,1,1,1,3,merchant,,,,,,,50`;

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
fire,火,#e74c3c,water,wind
water,水,#3498db,earth,fire
wind,風,#2ecc71,fire,earth
earth,土,#d35400,wind,water
light,光,#f1c40f,dark,dark
dark,闇,#9b59b6,light,light`;

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

const CSV_SKILLS = `name,type,desc
剛腕,phy,物理攻撃力+10%
連撃,phy,20%の確率で2回攻撃
鉄壁,phy,防御力+15%
カウンター,phy,回避時50%で反撃
急所突き,phy,クリティカル率+10%
粉砕,phy,敵の防御を貫通する
底力,phy,HP減少時に攻撃UP
闘争本能,phy,ターン経過で攻撃UP
受け流し,phy,物理ダメージ軽減
鬼神,phy,攻撃大幅UP防御DOWN
魔力集中,mag,魔法攻撃力+10%
瞑想,mag,ターン終了時MP回復
炎の知識,mag,火属性ダメージ+20%
マナ効率,mag,スキル発動率UP
詠唱短縮,mag,行動速度+10%
属性強化,mag,弱点ダメージUP
結界,mag,魔法ダメージ軽減
精神統一,mag,状態異常耐性UP
古代の知恵,mag,経験値獲得量UP
魔神,mag,魔法大幅UPHP減少
早業,spd,命中率+20%
回避,spd,回避率+10%
不意打ち,spd,戦闘開始時先制攻撃
残像,spd,回避時次ターン攻撃UP
軽業,spd,トラップ回避率UP
目利き,spd,ドロップ率UP
二刀流の極意,spd,サブ武器補正UP
隠密,spd,敵に狙われにくくなる
俊足,spd,逃走成功率UP
神速,spd,稀に2回行動
挑発,tnk,敵の攻撃を引きつける
かばう,tnk,瀕死の味方をかばう
忍耐,tnk,HP30%以下で防御UP
リジェネ,tnk,毎ターンHP回復
重装甲,tnk,物理ダメージ-10%
不屈,tnk,致死ダメージを一度耐える
ガーディアン,tnk,味方全体の防御UP
自己修復,tnk,状態異常を自然治癒
城塞,tnk,防御大幅UP回避DOWN
金剛,tnk,全ダメージ軽減
祈り,sup,味方全体のHP回復
祝福,sup,味方の攻撃力UP
慈愛,sup,回復効果+20%
応急手当,sup,戦闘終了時HP回復
加護,sup,状態異常耐性UP
薬の知識,sup,アイテム効果UP
聖なる光,sup,アンデッドに大ダメージ
献身,sup,自分のHPを分け与える
女神の瞳,sup,隠し通路発見率UP
奇跡,sup,稀にダメージ無効化`;

// ==========================================
// 2. CSVパーサーとデータ変換ロジック
// ==========================================

const DataParser = {
    parse(csvText) {
        if(!csvText) return [];
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!row) continue;
            const obj = {};
            headers.forEach((header, index) => {
                let value = row[index] ? row[index].replace(/^"|"$/g, '') : '';
                if (!isNaN(value) && value !== '') value = Number(value);
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
                reqStats: reqStats
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
            data[s.name] = { desc: s.desc };
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
        { tier: 1, prefix: "見習い", mod: 0.8 },
        { tier: 1, prefix: "", mod: 1.0 },
        { tier: 2, prefix: "熟練", mod: 1.2 },
        { tier: 2, prefix: "上級", mod: 1.3 },
        { tier: 3, prefix: "達人", mod: 1.5 },
        { tier: 3, prefix: "王宮", mod: 1.6 },
        { tier: 4, prefix: "伝説の", mod: 2.0 },
        { tier: 4, prefix: "覚醒", mod: 2.2 },
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