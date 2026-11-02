// Open each saved result URL (the game's own share link) in headless Chrome and capture the whole canvas.
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe';
const W=430,H=1100,PORT=9900+Math.floor(Math.random()*90);
const prof=fs.mkdtempSync(path.join(os.tmpdir(),'omr-'));
const chrome=spawn(CHROME,[`--remote-debugging-port=${PORT}`,`--user-data-dir=${prof}`,'--headless=new','--mute-audio','--no-first-run','--enable-unsafe-swiftshader','--use-angle=swiftshader',`--window-size=${W},${H}`],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt; for(let i=0;i<50;i++){try{const l=await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); tgt=l.find(t=>t.type==='page'); if(tgt)break;}catch{} await sleep(200);}
const ws=new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=1; const wait=new Map(); ws.addEventListener('message',ev=>{const m=JSON.parse(ev.data); if(m.id&&wait.has(m.id)){const w=wait.get(m.id);wait.delete(m.id); m.error?w.rej(new Error(JSON.stringify(m.error))):w.res(m.result);}});
const send=(method,params={})=>new Promise((res,rej)=>{const i=id++;wait.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
await send('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:2,mobile:false}); await send('Page.enable'); await send('Runtime.enable');
const ev=async js=>(await send('Runtime.evaluate',{expression:js,returnByValue:true})).result.value;
for(const d of process.argv.slice(2)){
  const url=JSON.parse(fs.readFileSync(path.join(d,'result.json'),'utf8'))[3];
  await send('Page.navigate',{url}); await sleep(14000);
  await ev(`window.scrollTo(0,document.querySelector('canvas').getBoundingClientRect().top+scrollY-4)`); await sleep(1500);
  const r=await ev(`(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()`);
  const s=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:W,height:H,scale:1}});
  fs.writeFileSync(path.join(d,'final.png'),Buffer.from(s.data,'base64')); console.log(d,r);
}
ws.close(); chrome.kill();
