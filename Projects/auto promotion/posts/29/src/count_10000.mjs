import { createLife, SPEC } from 'file:///C:/Users/sheep/code/china_life/engine/life.js';
import { diseaseFor, causeOf } from 'file:///C:/Users/sheep/code/china_life/src/dying.js';
import D from 'file:///C:/Users/sheep/code/china_life/data/build/diseases.js';
import fs from 'node:fs';
const periods = fs.readFileSync('C:/Users/sheep/code/china_life/data/periods.csv','utf8').split('\n').slice(1).map(l=>l.split(',')[0]).filter(Boolean).filter(p=>!p.startsWith('prc'));
const N=10000; const cause={}, name={}, byId={}; let named=0; const hl=[];
for(let i=0;i<N;i++){const p=periods[i%periods.length];const seed=7000001+i*7919;
 const g=createLife({seed,period_id:p,policy:'auto',consistency:'v17',birthCap:SPEC.birthCap}); while(!g.done) g.step(); const r=g.result();
 const c=causeOf(r); cause[c]=(cause[c]||0)+1;
 const d=diseaseFor(r,seed,D); if(!d) continue; named++; name[d.name]=(name[d.name]||0)+1; byId[d.id]=(byId[d.id]||0)+1;
 if(d.name==='霍亂') hl.push([d.id,seed,p,r.sex,r.status,r.birth_year,r.death_year,r.death_age]);
}
console.log('periods',periods.length,'N',N,'named',named);
console.log(Object.entries(cause).sort((a,b)=>b[1]-a[1]).map(x=>x.join(' ')).join(', '));
console.log(Object.entries(name).sort((a,b)=>b[1]-a[1]).slice(0,20).map((x,i)=>(i+1)+'.'+x.join(' ')).join('\n'));
console.log('huoluan gu',byId.dz_huoluan_gu,'new',byId.dz_huoluan,'jiaoqi',byId.dz_jiaoqi,'shanghan',byId.dz_shanghan);
console.log(hl.filter(x=>x[0]==='dz_huoluan').map(x=>x.join(' ')).join('\n'));
console.log(hl.filter(x=>x[0]==='dz_huoluan_gu').slice(0,8).map(x=>x.join(' ')).join('\n'));
