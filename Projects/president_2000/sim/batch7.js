const {runMany}=require('./sim.js');
const n=1000;
for(const [name,o] of [
 ['1960 形狀 + 陳起始動能 2',{deal5:true,chenMom:2}],
 ['1960 形狀 + 陳動能衰減改捨去',{deal5:true,chenCeil:false}],
 ['1960 形狀 + 陳動能 2 + 捨去',{deal5:true,chenMom:2,chenCeil:false}],
 ['1960 形狀 + 連發 6（前期）',{deal5:true,lien8:true}],
]){
  const r=runMany(n,o,1000);
  console.log(`| ${name} | ${r.wins.join(' / ')} | ${r.votes.join(' / ')} | ${r.turnout} | ${r.margin} | ${r.xingpiao} / ${r.shouyi} / ${r.fanfu} | ${r.perGame.triggers} | ${r.perGame.preempts} |`);
}
