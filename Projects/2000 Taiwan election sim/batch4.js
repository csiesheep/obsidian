const {runMany}=require('./sim.js');
const n=parseInt(process.argv[2]||'1000');
const variants=[
 ['v0.2 原樣（門檻4、宋跨區1CP、爆料必觸發）',{}],
 ['v0.2 但爆料不必觸發',{baoliaoMust:false}],
 ['v0.2 + 連發8張',{lien8:true}],
 ['v0.2 + 宋付全額移動費',{soongFree:false}],
 ['v0.2 + 宋起始-3',{adj:'0,-3,0'}],
 ['v0.2 + 連起始+3',{adj:'0,0,3'}],
];
const rows=[];
for(const [name,o] of variants){const r=runMany(n,o,1000);rows.push({name,wins:r.wins.join(' / '),votes:r.votes.join(' / '),leads:r.leads.join(' / '),turnout:r.turnout,margin:r.margin,xp:r.xingpiao,shouyi:r.shouyi,fanfu:r.fanfu,steal:r.stealOk,adv:r.perGame.adverts,trig:r.perGame.triggers});}
console.log('| 變體 | 勝率 陳/宋/連 | 平均票塊 陳/宋/連 | 領先縣市 | 投票率 | 勝差 | 興票案/授意說/反覆 | 搶成功 | 廣告/局 | 觸發/局 |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for(const r of rows)console.log(`| ${r.name} | ${r.wins} | ${r.votes} | ${r.leads} | ${r.turnout} | ${r.margin} | ${r.xp} / ${r.shouyi} / ${r.fanfu} | ${r.steal} | ${r.adv} | ${r.trig} |`);
