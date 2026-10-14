const {runMany}=require('./sim.js');
const n=1000;
console.log('| 變體 | 勝率 陳/宋/連 | 票塊 | 投票率 | 勝差 | 興票案/授意說/反覆 | 觸發/局 |');
console.log('|---|---|---|---|---|---|---|');
for(const [name,o] of [
 ['v0.3（爆料連自己打也生效）',{}],
 ['v0.3 + 陳 −2 連 +2',{adj:'-2,0,2'}],
 ['v0.3 + 陳 −2 連 +2（另一組種子）',{adj:'-2,0,2',seed:5000}],
 ['v0.3 + 陳 −1 連 +2',{adj:'-1,0,2'}],
 ['v0.3 + 陳 −2 連 +3',{adj:'-2,0,3'}],
]){
  const r=runMany(n,o,o.seed||1000);
  console.log(`| ${name} | ${r.wins.join(' / ')} | ${r.votes.join(' / ')} | ${r.turnout} | ${r.margin} | ${r.xingpiao} / ${r.shouyi} / ${r.fanfu} | ${r.perGame.triggers} |`);
}
