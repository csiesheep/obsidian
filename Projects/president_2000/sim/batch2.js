const {runMany}=require('./sim.js');
const n=parseInt(process.argv[2]||'400');
const variants=[
 ['搶免檢定 + 門檻4',{stealCheck:'carried',threshold:4}],
 ['搶免檢定 + 宋付移動費',{stealCheck:'carried',soongFree:false}],
 ['門檻4 + 宋付移動費',{threshold:4,soongFree:false}],
 ['門檻4 + 宋付移動費 + 搶免檢定',{threshold:4,soongFree:false,stealCheck:'carried'}],
 ['門檻4 + 媒體免搶檢定',{threshold:4,mediaSteal:true}],
 ['門檻4 + 宋付移動費 + 宋-5',{threshold:4,soongFree:false,adj:'0,-5,0'}],
 ['門檻4 + 宋付移動費 + 媒體免搶檢定',{threshold:4,soongFree:false,mediaSteal:true}],
 ['門檻4 + 宋付移動費 + 連發8張',{threshold:4,soongFree:false,lien8:true}],
];
const rows=[];
for(const [name,o] of variants){const r=runMany(n,o,1000);rows.push({name,wins:r.wins.join(' / '),votes:r.votes.join(' / '),turnout:r.turnout,margin:r.margin,xp:r.xingpiao,steal:r.stealOk,adv:r.perGame.adverts,trig:r.perGame.triggers});}
console.log('| 變體 | 勝率 陳/宋/連 | 平均票塊 陳/宋/連 | 投票率 | 勝差 | 興票案 | 搶成功 | 廣告/局 | 觸發/局 |');
console.log('|---|---|---|---|---|---|---|---|---|');
for(const r of rows)console.log(`| ${r.name} | ${r.wins} | ${r.votes} | ${r.turnout} | ${r.margin} | ${r.xp} | ${r.steal} | ${r.adv} | ${r.trig} |`);
