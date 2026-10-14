const {runMany}=require('./sim.js');
const n=parseInt(process.argv[2]||'400');
const variants=[
 ['baseline',{}],
 ['soong移動要付費',{soongFree:false}],
 ['袋子起始8',{bagInit:8}],
 ['連發8張',{lien8:true}],
 ['搶:非樁腳主免檢定',{stealCheck:'carried'}],
 ['媒體優勢也免搶的檢定',{mediaSteal:true}],
 ['背書換全部無色塊',{endorse:'all'}],
 ['樁腳主門檻固定4',{threshold:4}],
 ['議題衰減每人-1',{issueDecay:'all'}],
 ['無色塊可用CP放',{greyCP:true}],
 ['宋起始-5',{adj:'0,-5,0'}],
 ['宋起始-5 陳+3',{adj:'3,-5,0'}],
 ['宋-5 連+3',{adj:'0,-5,3'}],
];
const rows=[];
for(const [name,o] of variants){const r=runMany(n,o,1000);rows.push({name,wins:r.wins.join(' / '),votes:r.votes.join(' / '),turnout:r.turnout,margin:r.margin,xp:r.xingpiao,steal:r.stealOk,adv:r.perGame.adverts,trig:r.perGame.triggers});}
console.log('| 變體 | 勝率 陳/宋/連 | 平均票塊 陳/宋/連 | 投票率 | 勝差 | 興票案 | 搶成功 | 廣告/局 | 觸發/局 |');
console.log('|---|---|---|---|---|---|---|---|---|');
for(const r of rows)console.log(`| ${r.name} | ${r.wins} | ${r.votes} | ${r.turnout} | ${r.margin} | ${r.xp} | ${r.steal} | ${r.adv} | ${r.trig} |`);
