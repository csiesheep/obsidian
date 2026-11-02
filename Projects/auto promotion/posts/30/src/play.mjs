// Headless Chrome (temp profile, muted) plays taiwanese-simulator.tw like a player: types a year, presses 出生,
// presses 快轉, and at every choice clicks one of the buttons. Blocks /api/log and the Cloudflare beacon so my
// test lives do not go into the game's statistics. No sharing, no posting.
// usage: node play.mjs <outDir> <year> <pick: first|last|random|N>
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const [OUT, YEAR, PICK = 'random'] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const W = 430, H = 900, DPR = 2, PORT = 9333 + Math.floor(Math.random() * 500);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-'));
const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, '--headless=new', '--mute-audio', '--no-first-run', '--no-default-browser-check', `--window-size=${W},${H}`], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tgt; for (let i = 0; i < 50; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); tgt = l.find((t) => t.type === 'page'); if (tgt) break; } catch {} await sleep(200); }
const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 1; const wait = new Map(); const hs = [];
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && wait.has(m.id)) { const w = wait.get(m.id); wait.delete(m.id); m.error ? w.rej(new Error(JSON.stringify(m.error))) : w.res(m.result); } else if (m.method) for (const h of hs) h(m); });
const send = (method, params = {}) => new Promise((res, rej) => { const i = id++; wait.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
let blocked = 0;
hs.push(async (m) => {
  if (m.method === 'Fetch.requestPaused') { const u = m.params.request.url;
    if (/\/api\/log|cloudflareinsights/.test(u)) { blocked++; await send('Fetch.failRequest', { requestId: m.params.requestId, errorReason: 'BlockedByClient' }); }
    else await send('Fetch.continueRequest', { requestId: m.params.requestId }); }
  if (m.method === 'Page.javascriptDialogOpening') await send('Page.handleJavaScriptDialog', { accept: true });
});
await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: true });
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'https://taiwanese-simulator.tw/' }); await sleep(5000);
const ev = async (js) => { const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(js.slice(0, 80) + ' :: ' + JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; };
let n = 0; const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, `${String(n++).padStart(2, '0')}_${name}.png`), Buffer.from(r.data, 'base64')); };
const vis = (sel) => `(()=>{const e=document.querySelector('${sel}');return !!e && !e.hidden && e.offsetParent!==null})()`;
await shot('home');
await ev(`(()=>{const i=document.querySelector('#year'); i.value='${YEAR}'; i.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('#yearform').requestSubmit(); return 1})()`);
await sleep(2500); await shot('born');
const choices = []; const clicks = []; let lastShot = Date.now(); let guard = 0; const T0 = Date.now();
const VISBTN = `[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect(); if(!(r.width>0&&r.height>0)||b.disabled) return false; const x=r.left+r.width/2,y=r.top+r.height/2; if(y<0||y>innerHeight){b.scrollIntoView({block:'center'}); const r2=b.getBoundingClientRect(); const e=document.elementFromPoint(r2.left+r2.width/2,r2.top+r2.height/2); return !!e&&(e===b||b.contains(e));} const e=document.elementFromPoint(x,y); return !!e&&(e===b||b.contains(e))})`;
while (guard++ < 4000 && Date.now() - T0 < 540000) {
  if (await ev(`(()=>{const e=document.querySelector('#end');return !!e&&!e.hidden&&e.innerText.length>50})()`)) break;
  const btns = await ev(`${VISBTN}.map((b,i)=>({i,id:b.id,t:b.innerText.trim().slice(0,40),inChoice:!!b.closest('#mChoices')}))`);
  const ch = btns.filter((b) => b.inChoice);
  if (ch.length) {
    const c = await ev(`(()=>({meta:document.querySelector('#mMeta').innerText,title:document.querySelector('#mTitle').innerText,text:document.querySelector('#mText').innerText,ctx:document.querySelector('#mCtx').innerText,opts:[...document.querySelectorAll('#mChoices button')].map(b=>b.innerText)}))()`);
    let k = PICK === 'first' ? 0 : PICK === 'last' ? ch.length - 1 : PICK === 'random' ? Math.floor(Math.random() * ch.length) : Math.min(+PICK, ch.length - 1);
    if (process.env.LIVEON && /你活到了今天/.test(c.title)) k = 0; if (process.env.STOP && /你活到了今天/.test(c.title)) k = ch.length - 1;
    c.picked = k; choices.push(c); if (/你活到了今天/.test(c.title)) await shot('today'); if (choices.length <= 8) await shot('choice' + choices.length);
    await ev(`document.querySelectorAll('#mChoices button')[${k}].click()`); await sleep(700); continue;
  }
  const pref = (b) => b.id === 'aboutX' || b.id === 'charX' || b.id === 'achX' || b.id === 'pastX' ? 0 : /開始這一生/.test(b.t) ? 1 : b.id === 'ff' ? 2 : b.id === 'next' ? 3 : /看這一生|結局|繼續|好|知道了|下一步/.test(b.t) ? 4 : 99;
  const best = btns.filter((b) => pref(b) < 99).sort((a, b) => pref(a) - pref(b))[0];
  if (best) { if (clicks.length < 400) clicks.push(best.t || best.id); if (/開始這一生/.test(best.t)) await shot('birthcard'); await ev(`(()=>{const L=${VISBTN}; const b=L.find(x=>${JSON.stringify(best.id)}?x.id===${JSON.stringify(best.id)}:x.innerText.trim().slice(0,40)===${JSON.stringify(best.t)}); if(b) b.click(); return !!b})()`); }
  else if (guard % 25 === 0) console.log('no button:', JSON.stringify(btns).slice(0, 300));
  await sleep(350);
  if (Date.now() - lastShot > 15000) { await shot('play'); lastShot = Date.now(); }
}
await sleep(2000); await shot('end');
const endText = await ev(`document.querySelector('#end').innerText`);
const feed = await ev(`document.querySelector('#feed').innerText`);
for (let i = 0; i < 9; i++) { await shot('reel' + i); const ok = await ev(`(()=>{const b=document.querySelector('#reelNext'); if(!b||b.offsetParent===null) return false; b.click(); return true})()`); if (!ok) break; await sleep(900); }
await ev(`(()=>{const b=document.querySelector('#reelPause'); return 1})()`);
for (const h of ['你這一屆','口頭禪','你滿意的事','你後悔的事','國小同班','成就']) {
  const ok = await ev(`(()=>{const e=[...document.querySelectorAll('#end h1,#end h2,#end h3,#end h4')].find(x=>x.innerText.includes(${JSON.stringify(h)})); if(!e) return false; e.scrollIntoView({block:'start'}); scrollBy(0,-20); return true})()`);
  if (ok) { await sleep(600); await shot('sec_' + h); }
}
await ev(`scrollTo(0,0)`); await sleep(500); await shot('endtop');
// full-page end screenshot
const hgt = await ev(`document.documentElement.scrollHeight`);
const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: Math.min(hgt, 8000), scale: 1 } });
fs.writeFileSync(path.join(OUT, `zz_endfull.png`), Buffer.from(r.data, 'base64'));
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify({ year: YEAR, pick: PICK, blocked, clicks, choices, endText, feed }, null, 1));
console.log('done', YEAR, 'choices', choices.length, 'blocked', blocked); console.log(endText.slice(0, 1500));
ws.close(); chrome.kill(); process.exit(0);
