const {runMany}=require('./sim.js');
const n=1000;
console.log('| 變體 | 勝率 陳/宋/連 | 票塊 | 領先縣市 | 投票率 | 勝差 | 興票案/授意說/反覆 | 觸發/局 | 封鎖/局 | 事件/局 |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for(const [name,o] of [
 ['v0.3：1960 形狀 + 10 新事件 + 5 地方',{}],
 ['v0.3 + 陳起始動能 2',{chenMom:2}],
 ['v0.3 + 陳動能 2 + 衰減捨去',{chenMom:2,chenCeil:false}],
 ['v0.3 + 連起始 +2',{adj:'0,0,2'}],
 ['v0.3 + 陳起始 −2',{adj:'-2,0,0'}],
 ['v0.3 + 陳 −2 + 連 +2',{adj:'-2,0,2'}],
]){
  const r=runMany(n,o,1000);
  console.log(`| ${name} | ${r.wins.join(' / ')} | ${r.votes.join(' / ')} | ${r.leads.join(' / ')} | ${r.turnout} | ${r.margin} | ${r.xingpiao} / ${r.shouyi} / ${r.fanfu} | ${r.perGame.triggers} | ${r.perGame.preempts} | ${r.perGame.events} |`);
}
