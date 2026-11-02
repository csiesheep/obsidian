// Headless Chrome (temp profile, muted, zh-TW) plays se-n.com/madori via CDP taps. No posting, no sharing.
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT=process.argv[2]; const N=+process.argv[3]||3; const GAP=+process.argv[4]||1400;
fs.mkdirSync(OUT,{recursive:true});
const W=430,H=880,DPR=2,PORT=9333+Math.floor(Math.random()*500);
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'md-'));
const chrome=spawn(CHROME,[`--remote-debugging-port=${PORT}`,`--user-data-dir=${prof}`,'--headless=new','--mute-audio','--no-first-run','--no-default-browser-check','--enable-unsafe-swiftshader','--use-angle=swiftshader','--lang=zh-TW',`--window-size=${W},${H}`],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt; for(let i=0;i<50;i++){try{const l=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); tgt=l.find(t=>t.type==='page'); if(tgt)break;}catch{} await sleep(200);}
const ws=new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=1; const wait=new Map(); ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data); if(m.id&&wait.has(m.id)){const w=wait.get(m.id);wait.delete(m.id); m.error?w.rej(new Error(JSON.stringify(m.error))):w.res(m.result);}});
const send=(method,params={})=>new Promise((res,rej)=>{const i=id++;wait.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:DPR,mobile:false});
await send('Emulation.setLocaleOverride',{locale:'zh-TW'}); await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate',{url:'https://se-n.com/madori/'}); await sleep(5000);
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(path.join(OUT,n),Buffer.from(r.data,'base64'));};
const ev=async(js)=>(await send('Runtime.evaluate',{expression:js,returnByValue:true})).result.value;
const tap=async(x,y)=>{for(const type of ['mousePressed','mouseReleased']) await send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1});};
await shot('00_title.png'); console.log('TITLE', await ev(`document.body.innerText.slice(0,300)`));
const visText=`[...document.querySelectorAll('body *')].filter(e=>e.offsetParent&&e.children.length===0&&e.innerText?.trim()).map(e=>e.innerText.trim()).join(' | ')`;
const clickText=re=>ev(`(()=>{const b=[...document.querySelectorAll('button,a,[role=button]')].find(b=>b.offsetParent&&${re}.test(b.innerText));if(b){b.click();return b.innerText}return null})()`);
console.log('start', await clickText('/開始|はじめる|Start/')); await sleep(1500);
for(let k=0;k<N;k++){
  for(let t=0;t<30;t++){
    const done=await ev(`(()=>{const t=${visText};return /再蓋一棟|儲存圖片/.test(t)})()`); if(done) break;
    const building=await ev(`(()=>{const t=${visText};return !/再蓋一棟|儲存圖片|其他遊戲/.test(t)})()`); if(!building){await sleep(800); continue;}
    await tap(W/2,H*0.45); await sleep(GAP + Math.round(Math.random()*500));
    if(t===3) await shot(`h${k}_mid.png`);
  }
  await sleep(2500); await shot(`h${k}_flyer.png`);
  console.log('HOUSE',k, await ev(visText));
  const urls=await ev(`(()=>{try{return [...document.querySelectorAll('canvas')].filter(c=>c.offsetParent).map(c=>c.toDataURL('image/png'))}catch(e){return [String(e)]}})()`);
  urls.forEach((u,i)=>{ if(u.startsWith('data:')) fs.writeFileSync(path.join(OUT,`h${k}_canvas${i}.png`),Buffer.from(u.split(',')[1],'base64')); else console.log(u); });
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:2400,deviceScaleFactor:DPR,mobile:false}); await sleep(800); await shot(`h${k}_full.png`);
  await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:DPR,mobile:false}); await sleep(500);
  const cv=await ev(`(()=>{const c=[...document.querySelectorAll('canvas')].filter(c=>c.offsetParent);return c.map(x=>x.width+'x'+x.height)})()`); console.log('canvases',cv);
  const w=await clickText('/住住看/'); console.log('watch',w);
  if(w){ for(const t of [2,5,9,14]){ await sleep(t===2?2000:(t===5?3000:(t===9?4000:5000))); await shot(`h${k}_live_${t}.png`);} console.log('LIVE',k,await ev(visText)); await ev(`history.back()`); await sleep(1500); }
  console.log('again', await clickText('/再蓋一棟|もう一度|Again/')); await sleep(1500);
}
ws.close(); chrome.kill();
