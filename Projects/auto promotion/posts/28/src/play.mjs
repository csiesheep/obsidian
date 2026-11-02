// Headless Chrome (temp profile, muted) plays piko2game.com/takoyaki with CDP pointer events, like a player's mouse.
// The page's own app.js is served with one added read-only line (window.__T) so the script can find the holes on screen
// and read how each ball is cooking. No posting, no sharing, no Discord.
// usage: node play.mjs <outDir> '<plan json>'
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2]; const PLAN = { heat: 1, pour: 1.15, oil: true, tako: 1, gu: ['tenkasu', 'negi', 'beni'], extra: [], roll: 'smart', target: 1.0, maxCook: 120, sauce: 3, mayo: true, nori: true, katsuo: true, noRoll: false, ...JSON.parse(process.argv[3] || '{}') };
fs.mkdirSync(OUT, { recursive: true });
const W = 430, H = 900, DPR = 2, PORT = 9333 + Math.floor(Math.random() * 500);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'tk-'));
const chrome = spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, '--headless=new', '--mute-audio', '--no-first-run', '--no-default-browser-check', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', `--window-size=${W},${H}`], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tgt; for (let i = 0; i < 50; i++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); tgt = l.find((t) => t.type === 'page'); if (tgt) break; } catch {} await sleep(200); }
const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 1; const wait = new Map(); const evHandlers = [];
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && wait.has(m.id)) { const w = wait.get(m.id); wait.delete(m.id); m.error ? w.rej(new Error(JSON.stringify(m.error))) : w.res(m.result); } else if (m.method) for (const h of evHandlers) h(m); });
const send = (method, params = {}) => new Promise((res, rej) => { const i = id++; wait.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const HOOKED = fs.readFileSync(path.join(HERE, 'site/tako_hooked.js'));
evHandlers.push(async (m) => {
  if (m.method === 'Fetch.requestPaused') {
    const u = m.params.request.url;
    if (/\/takoyaki\/app\.js/.test(u)) await send('Fetch.fulfillRequest', { requestId: m.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/javascript' }], body: HOOKED.toString('base64') });
    else if (/\/ad\/|googlesyndication|\/api\/visit/.test(u)) await send('Fetch.failRequest', { requestId: m.params.requestId, errorReason: 'BlockedByClient' }); // no ads, and my test runs do not add to the play counter
    else await send('Fetch.continueRequest', { requestId: m.params.requestId });
  }
  if (m.method === 'Page.javascriptDialogOpening') await send('Page.handleJavaScriptDialog', { accept: true });
});
await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: false });
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'https://piko2game.com/takoyaki/' }); await sleep(7000);
const ev = async (js) => { const r = await send('Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(js.slice(0, 80) + ' :: ' + JSON.stringify(r.exceptionDetails).slice(0, 400)); return r.result.value; };
let shotN = 0; const shot = async (n) => { const r = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(OUT, `${String(shotN++).padStart(2, '0')}_${n}.png`), Buffer.from(r.data, 'base64')); };
const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, pointerType: 'mouse' });
const click = (sel) => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return false; e.click(); return true})()`);
// screen position of a world point / object
await ev(`window.__scr=(o,dy=0)=>{const v=(o.isVector3?o.clone():o.getWorldPosition(new THREE.Vector3())); v.y+=dy; v.project(__T.camera); const r=__T.cv.getBoundingClientRect(); return [r.left+(v.x+1)/2*r.width, r.top+(1-v.y)/2*r.height]}; 1`);
const holeXY = (i, dy = 0) => ev(`(()=>{const b=__T.balls[${i}]; const v=new THREE.Vector3(b.h.x,${dy},b.h.z); __T.pan.localToWorld(v); return __scr(v)})()`);
const ballXY = (i) => ev(`__scr(__T.balls[${i}].ball, 0)`);
const log = [];
const L = (...a) => { const s = a.join(' '); console.log(s); log.push(s); };

await shot('title');
await click('#startBtn'); await sleep(1500);
await click(`.hb[data-h="${PLAN.heat}"]`); await sleep(200);
const N = 8; const T0 = Date.now(); const el = () => ((Date.now() - T0) / 1000).toFixed(1);
// 1. oil: grab the brush on the table, trace small circles over every hole
if (PLAN.oil) {
  const [ox, oy] = await ev('__scr(__T.oilProp, 0.6)'); await mouse('mousePressed', ox, oy); await sleep(80);
  for (let i = 0; i < N; i++) { const [hx, hy] = await holeXY(i); for (let k = 0; k < 10; k++) { const a = k * 0.9; await mouse('mouseMoved', hx + Math.cos(a) * 8, hy + Math.sin(a) * 5); await sleep(25); } }
  await mouse('mouseReleased', ox, oy); await sleep(300);
  L('oil', JSON.stringify(await ev('__T.balls.map(b=>+(b.oil||0).toFixed(2))')));
}
// 2. batter: grab the pitcher, hold over each hole for PLAN.pour seconds
{
  const [bx, by] = await ev('__scr(__T.batterProp, 0.6)'); await mouse('mousePressed', bx, by); await sleep(80);
  const pours = Array.isArray(PLAN.pour) ? PLAN.pour : Array(N).fill(PLAN.pour);
  for (let i = 0; i < N; i++) { const [hx, hy] = await holeXY(i); const t1 = Date.now(); let k = 0; while ((Date.now() - t1) / 1000 < 8 && (await ev(`__T.balls[${i}].fill`)) < pours[i]) { k++; await mouse('mouseMoved', hx + Math.sin(k) * 2, hy + Math.cos(k) * 2); await sleep(30); } if (i === 3) await shot('pour'); }
  await mouse('mouseReleased', bx, by); await sleep(300);
  L('fill', JSON.stringify(await ev('__T.balls.map(b=>+b.fill.toFixed(2))')));
}
// 3. fillings: pick the tool, tap each hole
const tapHole = async (i) => { const [hx, hy] = await holeXY(i); await mouse('mousePressed', hx, hy); await sleep(30); await mouse('mouseReleased', hx, hy); await sleep(60); };
if (PLAN.tako) { await click('.tool[data-t="tako"]'); for (let i = 0; i < N; i++) for (let k = 0; k < (Array.isArray(PLAN.tako) ? PLAN.tako[i] : PLAN.tako); k++) await tapHole(i); }
for (const g of [...PLAN.gu, ...PLAN.extra]) { await click(`.tool[data-t="${g}"]`); for (let i = 0; i < N; i++) await tapHole(i); }
await click('.tool.on'); // tap the selected tool again = put it down
await shot('filled');
L('items', JSON.stringify(await ev('__T.balls.map(b=>b.items)')), 't', el());
// 4. roll: wait until the bottom has set, then turn each ball so the least-cooked side faces down
const st = () => ev(`__T.balls.map(b=>{let s=0,n=0,mx=0,lo=9,un=0,ov=0;if(b.dn)for(let i=0;i<b.dn.length;i++)if(!b.cap[i]){const d=b.dn[i];s+=d;n++;mx=Math.max(mx,d);lo=Math.min(lo,d);if(d<0.75)un++;if(d>1.3)ov++}return {un:n?+(un/n).toFixed(2):1,ov:n?+(ov/n).toFixed(2):0,sec0:+b.sec[0].toFixed(2),ff:+(b.formFrac??0).toFixed(2),avg:n?+(s/n).toFixed(2):0,mx:+mx.toFixed(2),lo:+(n?lo:0).toFixed(2),round:+(b.round??0).toFixed(2),started:!!b.started}})`);
// best rotation for ball i: try 8 world rotations, score = (unset part that would face down) or (low doneness facing down)
await ev(`window.__best=(i)=>{const b=__T.balls[i]; const n=b.ball.geometry.attributes.normal, C=[[0,1],[0,-1],[1,1],[1,-1],[0,2],[1,2]]; let best=null;
  for(const [ax,s] of C){const q=new THREE.Quaternion().setFromAxisAngle(ax?__T.AZ:__T.AX, s*Math.PI/2).multiply(b.ball.quaternion); const e=new THREE.Matrix4().makeRotationFromQuaternion(q).elements; let sc=0,w=0;
    for(let k=0;k<n.count;k+=3){const wy=e[1]*n.getX(k)+e[5]*n.getY(k)+e[9]*n.getZ(k); if(wy<-0.3){const ww=wy*wy; w+=ww; sc+= ww*(b.cap&&b.cap[k]? -3 : (b.dn?b.dn[k]:0));}}
    sc/=Math.max(w,1e-6); if(!best||sc<best.sc) best={ax,s,sc};}
  return best}; 1`);
const PX = (Math.PI / 2) / 0.028; // pixels for a quarter turn
const dragBall = async (i, ax, s) => { // ax 0 = drag up/down (front-back), 1 = drag left/right
  const [x, y] = await ballXY(i); const dir = s; const tot = 14 + PX * Math.abs(s);
  await mouse('mousePressed', x, y); await sleep(20);
  const steps = 10; for (let k = 1; k <= steps; k++) { const d = tot * k / steps * Math.sign(dir); await mouse('mouseMoved', ax ? x - d : x, ax ? y : y + d); await sleep(18); }
  await mouse('mouseReleased', ax ? x - tot * Math.sign(dir) : x, ax ? y : y + tot * Math.sign(dir)); await sleep(40);
};
// rotation: drag down = +AX; drag right = -AZ (so drag left = +AZ). dragBall(ax=1, s) drags left for s>0 → +AZ. Matches __best (ax 1 = AZ).
let cookStart = Date.now(); const ct = () => (Date.now() - cookStart) / 1000;
if (!PLAN.noRoll) {
  while (true) { const s = await st(); if (s.every((b) => b.sec0 >= (PLAN.firstTurn ?? 0.4)) || ct() > 60) break; await sleep(300); }
  L('first turn at', el(), JSON.stringify((await st()).map((b) => b.sec0)));
  await click('#pickBtn'); await sleep(200);
  let shotRoll = false, rounds = 0;
  while (ct() < PLAN.maxCook) {
    const s = await st(); rounds++;
    const ok = (b) => b.ff >= 0.95 && (b.un <= (PLAN.under ?? 0.08) || b.ov >= 0.08); const allDone = s.every(ok);
    if (allDone) break;
    for (let i = 0; i < N; i++) {
      if (ok(s[i])) continue;
      const bst = await ev(`__best(${i})`);
      if (bst.s === 2) { await dragBall(i, bst.ax, 1); await dragBall(i, bst.ax, 1); } else await dragBall(i, bst.ax, bst.s);
    }
    if (!shotRoll && rounds >= 2) { shotRoll = true; await shot('rolling'); }
    await sleep(PLAN.rollGap ?? 1500);
  }
  L('rolled', rounds, 'rounds; cook', ct().toFixed(0), 's');
} else { await sleep((PLAN.wait ?? 40) * 1000); await click('#pickBtn'); await sleep(200); }
L('state', JSON.stringify(await st()));
await shot('cooked');
// 5. plate: carry each ball to the plate
const plateXY0=()=>plateXY; const plateXY = await ev(`__scr(new THREE.Vector3(0,0,${(2*2.55+1.4)/2+4}))`);
L('carryBtn', await click('#carryBtn'), await ev('__T.tool')); await sleep(200); L('plateXY', JSON.stringify(plateXY0()));
for (let i = 0; i < N; i++) {
  const made = await ev(`!!__T.balls[${i}].made && !__T.balls[${i}].onPlate`); if (!made) continue;
  const [x, y] = await ballXY(i); await mouse('mousePressed', x, y); await sleep(30);
  const tx = plateXY[0] + ((i % 4) - 1.5) * 30, ty = plateXY[1] - 25;
  for (let k = 1; k <= 8; k++) { await mouse('mouseMoved', x + (tx - x) * k / 8, y + (ty - y) * k / 8); await sleep(25); }
  await mouse('mouseReleased', tx, ty); await sleep(150);
}
L('onPlate', JSON.stringify(await ev('__T.balls.map(b=>[!!b.onPlate,!!b.lifting])'))); for (let w = 0; w < 30; w++) { if ((await ev('__T.stage')) === 'top') break; await sleep(300); }
L('stage', await ev('__T.stage')); await sleep(1500);
// 6. toppings
const ballsOnPlate = async () => { const out = []; for (let i = 0; i < N; i++) if (await ev(`!!__T.balls[${i}].made`)) out.push(await ev(`__scr(__T.balls[${i}].ball, 0)`)); return out; };
if (PLAN.sauce) { await click('.tool[data-t="sauce"]'); const P = await ballsOnPlate(); for (const [x, y] of P) for (let r = 0; r < PLAN.sauce; r++) { await mouse('mousePressed', x - 14, y - 10 + r * 6); for (let k = 0; k <= 8; k++) { await mouse('mouseMoved', x - 14 + k * 3.5, y - 10 + r * 6 + Math.sin(k) * 3); await sleep(20); } await mouse('mouseReleased', x + 14, y); } }
if (PLAN.ketchup) { await click('.tool[data-t="ketchup"]'); const P = await ballsOnPlate(); for (const [x, y] of P) { await mouse('mousePressed', x - 12, y); for (let k = 0; k <= 8; k++) { await mouse('mouseMoved', x - 12 + k * 3, y + Math.sin(k) * 4); await sleep(20); } await mouse('mouseReleased', x + 12, y); } }
if (PLAN.mayo) { await click('.tool[data-t="mayo"]'); const P = await ballsOnPlate(); const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let r = 0; r < 4; r++) { const yy = y0 + (y1 - y0) * r / 3; await mouse('mousePressed', x0 - 10, yy); for (let k = 0; k <= 20; k++) { await mouse('mouseMoved', x0 - 10 + (x1 - x0 + 20) * k / 20, yy + (k % 2 ? 6 : -6)); await sleep(25); } await mouse('mouseReleased', x1 + 10, yy); } }
for (const t of [PLAN.nori && 'nori', PLAN.katsuo && 'katsuo'].filter(Boolean)) { await click(`.tool[data-t="${t}"]`); const P = await ballsOnPlate(); for (const [x, y] of P) { await mouse('mousePressed', x, y - 4); await sleep(30); await mouse('mouseReleased', x, y - 4); await sleep(130); } }
await sleep(800); await shot('topped');
L('sauce', JSON.stringify(await ev('__T.balls.map(b=>+(b.sauceAmt||0).toFixed(2))')));
await click('#nextBtn'); await sleep(4000); await shot('result');
const res = await ev(`({rank:document.querySelector('#rankName')?.textContent, name:document.querySelector('#takoName')?.textContent, score:document.querySelector('#scoreNum')?.textContent, comments:[...document.querySelectorAll('#comments li')].map(l=>l.textContent)})`);
L('RESULT', JSON.stringify(res));
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify({ plan: PLAN, res, log }, null, 1));
ws.close(); chrome.kill();
