import { spawn } from 'node:child_process'; import fs from 'node:fs';
const [base, out] = process.argv.slice(2); const port = 9989, prof = 'C:/Users/sheep/AppData/Local/Temp/cpX_' + port;
const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
try { let tabs; for (let i = 0; i < 100; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {} await sleep(200); }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pend = new Map(); const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const ev = async e => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result.result.value;
  const res = {};
  for (const s of [612, 17, 160, 51698, 2]) {
    await send('Page.navigate', { url: `${base}/?seed=${s}&policy=auto&speed=instant&autostart=1&cv=v13&internal=1` });
    for (let i = 0; i < 40; i++) { await sleep(400); if (await ev('document.body.dataset.screen') === 'end') break; }
    const r = await ev(`(async()=>{const t=document.querySelector('[data-role=chronicle-toggle]');if(t&&t.getAttribute('aria-expanded')!=='true'){t.click();await new Promise(r=>setTimeout(r,300))}
      const s=document.querySelector('[data-role=share-story]'); if(s){s.click(); for(let i=0;i<30&&!window.__storyCard;i++) await new Promise(r=>setTimeout(r,200));}
      const L=window.__lastLife;
      return JSON.stringify({card:(window.__storyCard||{}).lines, log:[...document.querySelectorAll('[data-role=log] li')].filter(li=>/choice|payoff|event|death|dying|family|status|exam|policy/.test(li.dataset.kind||'')).map(li=>(li.dataset.kind||'')+'|'+li.textContent.replace(/\s+/g,' ').slice(0,90)).slice(0,60), era:L.period_id, born:L.birth_year, age:L.death_age});})()`);
    res[s] = JSON.parse(r);
    const c = await send('Runtime.evaluate', { expression: `window.__storyCard && window.__storyCard.canvas ? window.__storyCard.canvas.toDataURL('image/png') : null`, returnByValue: true });
    const d = c.result.result.value; if (d) fs.writeFileSync(`${out}/card_${s}.png`, Buffer.from(d.split(',')[1], 'base64'));
  }
  fs.writeFileSync(`${out}/lives.json`, JSON.stringify(res, null, 1)); console.log('ok');
  ws.close();
} finally { ch.kill(); await sleep(300); try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }
