import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [base, out] = process.argv.slice(2); const port = 9990, prof = 'C:/Users/sheep/AppData/Local/Temp/cpY_' + port;
const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
try { let tabs; for (let i = 0; i < 100; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {} await sleep(200); }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map(); const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  const ev = async e => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.result.value;
  const shot = async f => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(`${out}/${f}`, Buffer.from(r.result.data, 'base64')); };
  // 出生頁
  await send('Page.navigate', { url: `${base}/?internal=1` }); await sleep(2500); await shot('game_home.png');
  for (const s of [2, 17]) {
    await send('Page.navigate', { url: `${base}/?seed=${s}&policy=manual&speed=fast&autostart=1&cv=v13&internal=1` });
    await sleep(1500); await shot(`game_birth_${s}.png`);
    for (let i = 0; i < 120; i++) { await sleep(250); const v = await ev(`(()=>{const b=document.querySelector('[data-role=decision]');return !!(b&&!b.hidden&&b.offsetParent!==null)})()`); if (v) break; }
    await sleep(900); await shot(`game_dec_${s}.png`);
    console.log(s, await ev(`document.querySelector('[data-role=decision]')?.innerText.slice(0,200)`));
  }
  ws.close();
} finally { ch.kill(); await sleep(300); try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }
