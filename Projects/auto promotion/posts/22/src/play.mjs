// Headless Chrome (temp profile, muted) plays softserve.nog.cc via CDP mouse events.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT=process.argv[2]; const PLAN=JSON.parse(process.argv[3]||'[]'); // [{turns, radius, period}]
fs.mkdirSync(OUT,{recursive:true});
const W=430,H=880,DPR=2,PORT=9333+Math.floor(Math.random()*500);
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'ss-'));
const chrome=spawn(CHROME,[`--remote-debugging-port=${PORT}`,`--user-data-dir=${prof}`,'--headless=new','--mute-audio','--no-first-run','--no-default-browser-check','--enable-unsafe-swiftshader','--use-angle=swiftshader',`--window-size=${W},${H}`],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt; for(let i=0;i<50;i++){try{const l=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); tgt=l.find(t=>t.type==='page'); if(tgt)break;}catch{} await sleep(200);}
const ws=new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=1; const wait=new Map(); ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data); if(m.id&&wait.has(m.id)){const w=wait.get(m.id);wait.delete(m.id); m.error?w.rej(new Error(JSON.stringify(m.error))):w.res(m.result);}});
const send=(method,params={})=>new Promise((res,rej)=>{const i=id++;wait.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:DPR,mobile:false});
await send('Emulation.setLocaleOverride',{locale:'ja-JP'}); await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate',{url:'https://softserve.nog.cc/'}); await sleep(6000);
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(path.join(OUT,n),Buffer.from(r.data,'base64'));};
const ev=async(js)=>(await send('Runtime.evaluate',{expression:js,returnByValue:true})).result.value;
await ev(`(()=>{const s=document.querySelector('select.language-select'); const o=[...s.options].find(o=>/日本語/.test(o.text)); s.value=o.value; s.dispatchEvent(new Event('change',{bubbles:true}));})()`); await sleep(800); await shot('00_home.png');
console.log(await ev(`document.body.innerText.slice(0,500)`));
// find the control area center
const info=await ev(`(()=>{const els=[...document.querySelectorAll('[aria-label]')].map(e=>{const r=e.getBoundingClientRect();return {l:e.getAttribute('aria-label'),x:r.x,y:r.y,w:r.width,h:r.height,tag:e.tagName,cls:e.className}});return els})()`);
console.log(JSON.stringify(info));
const area=info.find(e=>/操作|旋转|巻く/.test(e.l))||{x:0,y:H*0.7,w:W,h:H*0.3};
const cx=area.x+area.w/2, cy=area.y+area.h/2;
let k=0;
for(const p of PLAN){
  const m=(type,x,y)=>send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:1,pointerType:'mouse'});
  await m('mouseMoved',cx,cy); await m('mousePressed',cx,cy);
  const shotEvery=p.shots?Math.max(1,Math.round(p.turns*p.period/16/p.shots)):0; const steps=Math.round(p.turns*p.period/16); const R=p.radius;
  // ease out from center to the circle
  for(let i=1;i<=10;i++){await m('mouseMoved',cx+R*i/10,cy); await sleep(16);}
  for(let i=0;i<=steps;i++){const a=2*Math.PI*p.turns*i/steps; await m('mouseMoved',cx+R*Math.cos(a),cy+R*Math.sin(a)); await sleep(16);
    if(shotEvery && i%shotEvery===0 && i>0) await shot(`r${k}_mid_${i}.png`);}
  await m('mouseReleased',cx+R,cy); await sleep(2500); await shot(`r${k}_end.png`);
  console.log('round',k,JSON.stringify(p),await ev(`document.querySelector('#result-screen')?.innerText`));
  // press "again"
  await ev(`[...document.querySelectorAll('button')].find(b=>/もう一回|再玩一次|Play again/.test(b.innerText))?.click()`); await sleep(1500); k++;
}
ws.close(); chrome.kill();
