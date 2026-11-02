import * as L from './logic.mjs';
const fl=[{gap:0.12,push:0.35,v:6},{gap:0.12,push:0.35,v:4.3}];
const run=p=>L.simulate({knob:0.55,lowAt:6,stir:[0.2,5.0],foldAt:10.5,flicks:fl,...p});
console.log('--- foldAt sweep (author recipe otherwise)');
for(let f=5;f<=20.01;f+=0.5){const r=run({foldAt:f});console.log(f.toFixed(1),r.kind,r.score,r.name.replace('／',' '));}
let best=null,n=0,cnt={},ge88=0,ge78=0;
for(const knob of [0.3,0.4,0.5,0.55,0.6,0.7,0.8,0.9,1])for(let se=1;se<=12;se+=1)for(const low of [null,4,6,8,10])for(let f=4;f<=18;f+=0.5){
 if(low!=null&&low<se-3)continue;
 const r=run({knob,stir:[0.2,se],lowAt:low,foldAt:f});n++;
 const k=r.name.split('／')[1];cnt[k]=(cnt[k]||0)+1; if(r.score>=88)ge88++; if(r.score>=78)ge78++;
 if(!best||r.score>best.r.score)best={r,knob,se,low,f};}
console.log('N',n,'>=88',ge88,'>=78',ge78);console.log('best',best.r.score,best.r.name,best.knob,best.se,best.low,best.f);
console.log(Object.entries(cnt).sort((a,b)=>b[1]-a[1]));
