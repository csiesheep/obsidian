const {runMany}=require('./sim.js');
const n=parseInt(process.argv[2]||'400');
const variants=[
 ['門檻4 + 宋移動固定1CP',{threshold:4,soongFree:'flat1'}],
 ['門檻4 + 宋移動半價',{threshold:4,soongFree:'half'}],
 ['門檻4 + 宋移動固定1CP + 連發8張',{threshold:4,soongFree:'flat1',lien8:true}],
 ['門檻4 + 宋付移動費 + 連發8張 (再跑一次, 不同種子)',{threshold:4,soongFree:false,lien8:true}],
 ['門檻4 + 宋付移動費 (1000局)',{threshold:4,soongFree:false}],
];
const rows=[];
for(const [name,o] of variants){const nn=name.includes('1000')?1000:n;const r=runMany(nn,o,name.includes('種子')?5000:1000);rows.push({name,wins:r.wins.join(' / '),votes:r.votes.join(' / '),turnout:r.turnout,margin:r.margin,xp:r.xingpiao,steal:r.stealOk,adv:r.perGame.adverts,trig:r.perGame.triggers,leads:r.leads.join(' / ')});}
console.log('| 變體 | 勝率 陳/宋/連 | 平均票塊 陳/宋/連 | 領先縣市 | 投票率 | 勝差 | 興票案 | 搶成功 | 廣告/局 | 觸發/局 |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for(const r of rows)console.log(`| ${r.name} | ${r.wins} | ${r.votes} | ${r.leads} | ${r.turnout} | ${r.margin} | ${r.xp} | ${r.steal} | ${r.adv} | ${r.trig} |`);
