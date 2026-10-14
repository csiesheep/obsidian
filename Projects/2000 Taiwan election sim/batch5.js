const {runMany}=require('./sim.js');
const n=parseInt(process.argv[2]||'1000');
const variants=[
 ['v0.2 原樣（小縣市門檻 1/2 顆）',{}],
 ['門檻一律 4 顆（小縣市永遠沒樁腳主）',{threshold:'u4'}],
 ['門檻一律 4 + 爆料必觸發且不能留牌',{threshold:'u4',baoliaoNoSave:true}],
 ['門檻一律 4 + 爆料拿到就要打',{threshold:'u4',baoliaoMustPlay:true}],
 ['小縣市 1/2 + 爆料不能留牌',{baoliaoNoSave:true}],
 ['小縣市 1/2 + 爆料拿到就要打',{baoliaoMustPlay:true}],
];
const rows=[];
for(const [name,o] of variants){const r=runMany(n,o,1000);rows.push({name,wins:r.wins.join(' / '),votes:r.votes.join(' / '),turnout:r.turnout,margin:r.margin,xp:r.xingpiao,shouyi:r.shouyi,fanfu:r.fanfu,steal:r.stealOk,adv:r.perGame.adverts});}
console.log('| 變體 | 勝率 陳/宋/連 | 平均票塊 陳/宋/連 | 投票率 | 勝差 | 興票案/授意說/反覆 | 搶成功 | 廣告/局 |');
console.log('|---|---|---|---|---|---|---|---|');
for(const r of rows)console.log(`| ${r.name} | ${r.wins} | ${r.votes} | ${r.turnout} | ${r.margin} | ${r.xp} / ${r.shouyi} / ${r.fanfu} | ${r.steal} | ${r.adv} |`);
