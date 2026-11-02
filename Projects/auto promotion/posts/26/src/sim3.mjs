import * as L from './logic.mjs';
const fl=[{gap:0.12,push:0.35,v:6},{gap:0.12,push:0.35,v:4.3}];
const run=p=>L.simulate({knob:0.55,lowAt:6,stir:[0.2,5.0],foldAt:10.5,flicks:fl,...p});
let lo=null,hi=null;for(let f=9;f<=12.5;f+=0.05){const r=run({foldAt:f});if(r.score>=78){lo??=f;hi=f;}}
console.log('>=78 window',lo?.toFixed(2),hi?.toFixed(2));
let best={s:0},n=0,c88=0,c78=0;const R=(a,b)=>a+Math.random()*(b-a);
const T=Date.now();
while(Date.now()-T<90000){n++;
 const v1=R(2.5,8),v2=R(2.5,8),p={knob:R(0.35,0.9),stir:[0.2,R(2,9)],lowAt:R(2,10),lowKnob:R(0,0.4),foldAt:R(6,14),flicks:[{gap:0.12,push:R(0.1,0.7),v:v1},{gap:0.12,push:R(0.1,0.7),v:v2}],speed:R(15,45),finishDelay:R(0,0.6)};
 if(p.lowAt<p.stir[1]-2)continue;
 const r=run(p);if(r.score>=88)c88++;if(r.score>=78)c78++;if(r.score>best.s)best={s:r.score,r,p};}
console.log('random N',n,'>=78',c78,'>=88',c88);console.log(best.s,best.r.name,best.r.worst,JSON.stringify(best.p));
