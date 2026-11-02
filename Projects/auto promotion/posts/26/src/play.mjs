// Headless Chrome (temp profile, muted) plays yorimichi-games.com/omurice via CDP mouse events. No posting, no sharing.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT=process.argv[2]; const PLAN=JSON.parse(process.argv[3]||'{}');
fs.mkdirSync(OUT,{recursive:true});
const W=430,H=900,DPR=2,PORT=9333+Math.floor(Math.random()*500);
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'om-'));
const chrome=spawn(CHROME,[`--remote-debugging-port=${PORT}`,`--user-data-dir=${prof}`,'--headless=new','--mute-audio','--no-first-run','--no-default-browser-check','--enable-unsafe-swiftshader','--use-angle=swiftshader',`--window-size=${W},${H}`],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt; for(let i=0;i<50;i++){try{const l=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); tgt=l.find(t=>t.type==='page'); if(tgt)break;}catch{} await sleep(200);}
const ws=new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=1; const wait=new Map(); ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data); if(m.id&&wait.has(m.id)){const w=wait.get(m.id);wait.delete(m.id); m.error?w.rej(new Error(JSON.stringify(m.error))):w.res(m.result);}});
const send=(method,params={})=>new Promise((res,rej)=>{const i=id++;wait.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:DPR,mobile:false});
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate',{url:'https://yorimichi-games.com/omurice/'}); await sleep(6000);
const ev=async(js)=>(await send('Runtime.evaluate',{expression:js,returnByValue:true,awaitPromise:true})).result.value;
await ev(`(()=>{const c=document.querySelector('canvas');c.scrollIntoView({block:'start'});return 1})()`); await sleep(800);
const rect=await ev(`(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()`);
console.log('rect',rect);
const cx=x=>rect[0]+x/540*rect[2], cy=y=>rect[1]+y/960*rect[3];
const clip={x:rect[0],y:Math.max(0,rect[1]),width:rect[2],height:Math.min(rect[3],H-Math.max(0,rect[1])),scale:1};
let shotN=0; const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png',clip}); fs.writeFileSync(path.join(OUT,`${String(shotN++).padStart(2,'0')}_${n}.png`),Buffer.from(r.data,'base64'));};
const mouse=(type,x,y,b=1)=>send('Input.dispatchMouseEvent',{type,x:cx(x),y:cy(y),button:'left',buttons:type==='mouseReleased'?0:b,clickCount:1});
const tap=async(x,y)=>{await mouse('mousePressed',x,y);await mouse('mouseReleased',x,y);};
const T0=()=>performance.now();
const P={stirEnd:5,lowAt:6,foldAt:10.4,flickPx:1.0,flickMs:170,...PLAN};
await shot('ready');
await tap(270,400); const t0=T0(); const el=()=> (T0()-t0)/1000;
// stir: spiral with chopsticks
await mouse('mousePressed',270,400); let k=0; let shotStir=false;
while(el()<P.stirEnd){k++; const a=k*0.5, rr=40+60*Math.abs(Math.sin(k*0.07)); await mouse('mouseMoved',270+Math.cos(a)*rr*1.6,400+Math.sin(a)*rr*0.9); await sleep(30); if(!shotStir&&el()>2.5){shotStir=true;await shot('stir');}}
await mouse('mouseReleased',270,400);
if(P.lowAt<99) while(el()<P.lowAt) await sleep(50);
if(P.lowAt<99){ await mouse('mousePressed',452,866); await mouse('mouseMoved',430,890); await mouse('mouseMoved',412,906); await mouse('mouseReleased',412,906); }
while(el()<P.foldAt-0.6) await sleep(50);
await shot('wait');
await tap(200,880); await sleep(150);
while(el()<P.foldAt) await sleep(30);
await mouse('mousePressed',270,330); for(let i=1;i<=10;i++){await mouse('mouseMoved',270,330+i*16);await sleep(25);} await mouse('mouseReleased',270,490);
console.log('folded at',el().toFixed(2)); await sleep(400); await shot('fold');
// roll: flick down, then Enter
const u=rect[3]*0.42; let done=false;
for(let f=0;f<6&&!done;f++){
  const y0=500; await mouse('mousePressed',270,y0);
  const steps=6, dy=P.flickPx*u/rect[3]*960; for(let i=1;i<=steps;i++){await mouse('mouseMoved',270,y0+dy*i/steps); await sleep(P.flickMs/steps);}
  await sleep(150); for(let i=steps-1;i>=0;i--){await mouse('mouseMoved',270,y0+dy*i/steps); await sleep(90);} await mouse('mouseReleased',270,y0);
  await sleep(P.settleMs||1300); if(f===0) await shot('roll');
  await send('Input.dispatchKeyEvent',{type:'keyDown',code:'Enter',key:'Enter',windowsVirtualKeyCode:13}); await send('Input.dispatchKeyEvent',{type:'keyUp',code:'Enter',key:'Enter',windowsVirtualKeyCode:13});
  for(let w=0;w<3&&!done;w++){ await sleep(500); if(await ev(`!!window.__lastModal`)) done=true; }
  if(!done){ const plateNow=await ev(`(()=>{try{return document.querySelector('canvas')?1:0}catch(e){return 0}})()`); }
  if(f>=1 && !done){ await sleep(5500); if(await ev(`!!window.__lastModal`)) done=true; }
}
await sleep(2500); await shot('plate');
for(let w=0;w<20;w++){ if(await ev(`!!window.__lastModal`)) break; await sleep(500);}
await sleep(2200); await shot('result');
const res=await ev(`JSON.stringify(window.__lastModal||null)`); console.log('RESULT',res, 'elapsed',el().toFixed(1));
fs.writeFileSync(path.join(OUT,'result.json'),res||'null');
ws.close(); chrome.kill();
