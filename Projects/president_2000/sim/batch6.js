const {runMany}=require('./sim.js');
const n=1000;
for(const [name,o] of [['v0.2 發 7 出 4 留 1 棄 2',{}],['1960 形狀：發 5 出 4 留 1 無棄（後期發 6 留 2）',{deal5:true}]]){
  const r=runMany(n,o,1000);
  console.log(`| ${name} | ${r.wins.join(' / ')} | ${r.votes.join(' / ')} | ${r.turnout} | ${r.margin} | ${r.xingpiao} / ${r.shouyi} / ${r.fanfu} | ${r.perGame.triggers} | ${r.perGame.preempts} | ${r.perGame.events} |`);
}
