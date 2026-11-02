// マドリ: rooms hang from a crane that runs back and forth over the lot; tap to drop one.
// After 8 rooms the family lives there for a day, then the estate agent makes the flyer.
import { W, H, ROOMS, TYPES, pickName, rng, makeBag, pickRequest, size, place, landing, analyze, day, flyer, decode, nameOf, shareText, specialRound, shopOf, buildingName, requestText, oddBanner, roomTitle, rareVerb, themeTag, applyHalloween, halloweenFromQuery, setHalloween, halloweenActive } from './house.js';
import { LANG, UI, pickLang, setLang, saveLang, applyText } from './lang.js';
import { LANGS, LANG_NAMES, LANG_SHORT } from '../lang/meta.js';
import { PAPER, fitView, drawLot, drawHouse, drawRoom, drawCrane, drawGhost, drawFlyer, drawPlanIn } from './render.js';
import { buildScene, isoView, drawScene, drawPers } from './iso.js';

function drawPlan(f) {
  const c = $('#plan');
  const r = c.getBoundingClientRect();
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  c.width = Math.round(r.width * dpr);
  c.height = Math.round(r.height * dpr);
  const x = c.getContext('2d');
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  x.fillStyle = '#fbfaf6';
  x.fillRect(0, 0, r.width, r.height);
  drawPers(x, 0, 0, r.width, r.height, f, drawPlanIn);
}
import { initAnalytics, track, sendRun, intentUrl, canShareImage, pngFile, shareImage, guideLink, afterHtml, moreRow } from './online.js';
import { promoThen, promoArm } from './promo.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#c');
const ctx = canvas.getContext('2d');
const SEEN = 'md.seen';
const ZK = 'md.rare';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

// Halloween rooms stay out of the 図鑑 outside the period, unless this player already found one.
const RARES = () => TYPES.filter((t) => t.rare && (!t.event || halloweenActive() || zukan().includes(t.id)));
function zukan() {
  try { const a = JSON.parse(store.get(ZK) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
}
function zkCount() {
  const n = zukan().filter((k) => RARES().some((t) => t.id === k)).length;
  const text = `${n}/${RARES().length}`;
  $('#zk-count').textContent = text;
  $('#tz-count').textContent = text;
  $('#t-zukan').hidden = !n;
}
function openZukan() {
  const found = new Set(zukan());
  const list = $('#z-list');
  list.innerHTML = '';
  for (const t of RARES()) {
    const li = document.createElement('li');
    if (found.has(t.id)) {
      const b = document.createElement('b');
      b.textContent = roomTitle(t);
      li.append(b, rareVerb(t));
    } else { li.className = 'no'; li.textContent = UI.unknown; }
    list.append(li);
  }
  $('#z-count').textContent = `${[...found].filter((k) => RARES().some((t) => t.id === k)).length}/${RARES().length}`;
  $('#zukan').hidden = false;
  track('zukan_open');
}

initAnalytics();
$('#hud').classList.add('off');
zkCount();

// --- language ------------------------------------------------------------------------
// The site's guide is in Japanese only, so it shows only in Japanese (as ドットモジ). The lists of other games take the
// language: in another one they offer the games that speak it (site/common/langs.js).
function showLang() {
  applyText();
  $('#title-guide').innerHTML = LANG === 'ja' ? guideLink() : '';
  $('#lang-name').textContent = LANG_SHORT[LANG];
  $('#lang').value = LANG;
  zkCount();
}
$('#lang').innerHTML = LANGS.map((l) => `<option value="${l}">${LANG_NAMES[l]}</option>`).join('');
$('#lang-box').hidden = false;
$('#lang').addEventListener('change', async (e) => {
  const from = LANG;
  saveLang(e.target.value);
  await setLang(e.target.value);
  showLang();
  track('lang_change', { from, to: LANG });
});
const wanted = pickLang();
if (wanted !== 'ja') document.documentElement.classList.add('lang-wait');
const ready = setLang(wanted).then(() => { showLang(); document.documentElement.classList.remove('lang-wait'); });

let cw = 0, ch = 0;
function resize() {
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  cw = r.width; ch = r.height;
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize);
resize();

// --- state ---------------------------------------------------------------------------

const g = {
  mode: 'title', // title | build | live | flyer
  rooms: [], bag: [], idx: 0, piece: null, fall: null, t0: 0, built: 0,
  view: null, viewTop: H + 3, live: null, f: null, shake: 0,
  houses: 0, // own houses finished this page view (the new-game ad comes after 3: promo.js)
};
// The new-game ad's arm (promo.js), once drawn: game_start / game_end carry it as variant.
const armParam = () => { const a = promoArm(); return a ? { variant: a } : {}; };
window.__md = g;

const railFor = (rooms, piece) => Math.max(H, ...rooms.map((r) => r.y + r.h)) + (piece ? piece.h : 2) + 0.9;

function start() {
  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  const q = new URLSearchParams(location.search).get('seed');
  const rand = rng(q ? Number(q) : seed);
  let bag = makeBag(rand);
  let req = pickRequest(rand);
  let name = pickName(rand);
  ({ bag, req, name } = applyHalloween(bag, req, name));
  Object.assign(g, { mode: 'build', rooms: [], bag, req, name, idx: 0, fall: null, live: null, f: null, t0: performance.now(), rand });
  spawn();
  $('#title').hidden = true;
  $('#result').hidden = true;
  $('#cap').hidden = true;
  resize();
  $('#hint').hidden = !!store.get(SEEN);
  const special = specialRound(g.bag);
  const rain = $('#rain');
  rain.hidden = !special;
  if (special) rain.textContent = oddBanner(special);
  hud();
  const shop = shopOf(g.bag);
  track('game_start', { lang: LANG, ...(special === 'rain' ? { rain: 1 } : special ? { odd: special } : {}), ...(special === 'deru' ? { halloween: 1 } : {}), ...(shop ? { shop: shop.id } : {}), ...armParam() });
}

function spawn() {
  const p = g.bag[g.idx];
  const [w, h] = size(p.t, p.rot);
  const fromRight = g.rand() < 0.5;
  g.piece = { t: p.t, rot: p.rot, w, h, x: fromRight ? W - w : 0, dir: fromRight ? -1 : 1, y: 0 };
  g.piece.y = railFor(g.rooms, g.piece) - 0.55 - h;
}

function hud() {
  $('#hud').classList.toggle('off', g.mode === 'title');
  $('#bname').textContent = buildingName(g.name ?? 0);
  $('#req').textContent = UI.client(requestText(g.req ?? 0));
  $('#left').innerHTML = Array.from({ length: ROOMS }, (_, i) => `<i class="${i < g.idx ? 'on' : ''}"></i>`).join('');
  const n = g.bag[g.idx + 1];
  $('#next').classList.toggle('off', g.mode !== 'build' || !n);
  if (n) $('#next b').textContent = nameOf(n);
}

function drop() {
  if (g.mode !== 'build' || g.fall || !g.piece) return;
  const p = g.piece;
  const col = Math.round(p.x);
  const target = place(g.rooms, p, col);
  g.fall = { target, y: p.y, vy: 0 };
  p.x = target.x;
  if (!store.get(SEEN)) { store.set(SEEN, '1'); $('#hint').hidden = true; }
}

function landed() {
  g.rooms.push(g.fall.target);
  g.fall = null;
  g.shake = 0.12;
  g.idx++;
  hud();
  if (g.idx >= ROOMS) {
    g.piece = null;
    g.built = (performance.now() - g.t0) / 1000;
    setTimeout(() => live(g.rooms, true), 500 / PACE);
  } else spawn();
}

// --- living there --------------------------------------------------------------------

const centerOf = (r) => [r.x + r.w / 2, r.y + r.h / 2 - Math.min(0.32, r.h / 2 - 0.22)];
function doorPoint(an, a, b) {
  const d = an.doors.find((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a));
  return d.v ? [d.x, d.y + 0.5] : [d.x + 0.5, d.y];
}
function stepPoints(an, s) {
  const pts = [];
  const e = an.entry;
  const segMid = (seg) => (seg.v ? [seg.x, seg.y + 0.5] : [seg.x + 0.5, seg.y]);
  if (s.out === 'enter') pts.push([e.seg.ox, e.seg.oy], segMid(e.seg));
  pts.push(centerOf(an.rooms[s.path[0]]));
  for (let i = 1; i < s.path.length; i++) {
    pts.push(doorPoint(an, s.path[i - 1], s.path[i]));
    pts.push(centerOf(an.rooms[s.path[i]]));
  }
  if (s.out === 'leave') pts.push(segMid(e.seg), [e.seg.ox, e.seg.oy]);
  return pts;
}

function live(rooms, mine) {
  const an = analyze(rooms);
  const steps = day(an).map((s) => ({ ...s, pts: stepPoints(an, s) }));
  g.mode = 'live';
  g.mine = mine;
  g.rooms = rooms;
  g.live = { an, steps, i: -1, d: 0, wait: 0, fast: false, pos: steps[0].pts[0], alpha: 1, t: 0 };
  g.scene = buildScene(an);
  // the plan rises into 3D first (the builder's own house); a shared one is already standing
  g.rise = mine ? 0 : 1;
  $('#cap').innerHTML = '';
  if (mine) caption('', UI.done);
  $('#result').hidden = true;
  $('#title').hidden = true;
  $('#cap').hidden = false;
  $('#rain').hidden = true;
  resize();
  $('#hint').hidden = true;
  hud();
  if (!mine) nextStep();
}

// Adds a line to the day's log; the list is bottom-aligned, so older lines move up and out of view.
function caption(time, text) {
  const li = document.createElement('li');
  const b = document.createElement('b');
  b.textContent = time;
  li.append(b, text);
  $('#cap').append(li);
}

function nextStep() {
  const L = g.live;
  L.i++;
  if (L.i >= L.steps.length) { L.done = 0.8; return; }
  const s = L.steps[L.i];
  L.d = 0;
  L.wait = 0;
  L.len = 0;
  for (let k = 1; k < s.pts.length; k++) L.len += Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1]);
  caption(s.time, s.text);
  if (s.out === 'enter') L.alpha = 0;
}

function along(pts, d) {
  for (let k = 1; k < pts.length; k++) {
    const l = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    if (d <= l || k === pts.length - 1) {
      const t = l ? Math.min(1, d / l) : 1;
      return [pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * t, pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * t];
    }
    d -= l;
  }
  return pts[0];
}

// Cells per second. A long walk goes faster (√ of the distance past 2.5 cells), so crossing
// the whole house takes about 1.4 s instead of 2.8 s (2026-10-21).
const walkSpeed = (len) => 3.6 * Math.max(1, Math.sqrt(len / 2.5));

function stepLive(dt) {
  const L = g.live;
  dt *= PACE;
  if (g.rise < 1) {
    g.rise = Math.min(1, g.rise + dt / 1.5);
    if (g.rise >= 1) nextStep();
    return;
  }
  L.t += dt;
  const k = L.fast ? 3 : 1;
  if (L.done != null) {
    L.done -= dt * k;
    if (L.done <= 0) showFlyer();
    return;
  }
  const s = L.steps[L.i];
  if (L.d < L.len) {
    L.d = Math.min(L.len, L.d + dt * walkSpeed(L.len) * k);
    L.pos = along(s.pts, L.d);
    if (s.out === 'enter') L.alpha = Math.min(1, L.d / 0.6);
    if (s.out === 'leave') L.alpha = Math.max(0, Math.min(1, (L.len - L.d) / 0.6));
  } else {
    L.wait += dt * k;
    if (L.wait > (s.stuck ? 1.6 : 1.1) * 0.76) nextStep();
  }
}

// --- the flyer -----------------------------------------------------------------------

function showFlyer() {
  const f = flyer(g.rooms, g.req, g.name);
  g.f = f;
  g.mode = 'flyer';
  drawFlyer($('#flyer'), f, (c, x, y, w, h) => drawPers(c, x, y, w, h, f, drawPlanIn));
  $('#f-name').textContent = f.name;
  $('#f-theme').textContent = themeTag(f);
  $('#f-theme').hidden = !f.theme;
  $('#f-limited').hidden = !f.limited;
  $('#f-head').textContent = f.head.text;
  $('#f-req').textContent = UI.client(f.request.text);
  const stamp = document.createElement('span');
  stamp.className = f.ok ? 'ok' : 'ng';
  stamp.textContent = f.ok ? UI.ok : UI.ng;
  $('#f-req').append(stamp);
  $('#f-madori').textContent = f.madori.replace(/\+/g, '+\u200b'); // breaks after a +, not inside a name
  $('#f-madori').classList.toggle('long', f.madori.length > 9);
  const [rent0, rent, rent1] = UI.rent(f.rent);
  $('#f-rent0').textContent = rent0;
  $('#f-rent').textContent = rent;
  $('#f-rent1').textContent = rent1;
  $('#f-sub').textContent = [UI.sub2(f.sqm), f.age.text, f.access.text].join(UI.sep);
  $('#f-bul').innerHTML = '';
  for (const b of f.bullets) { const li = document.createElement('li'); li.textContent = b.text; $('#f-bul').append(li); }
  $('#f-bul').hidden = !f.bullets.length;
  $('#r-mine').hidden = !g.mine;
  $('#r-theirs').hidden = g.mine;
  $('#r-post').href = intentUrl(shareText(f), f.code);
  // ほかのゲームの1行をシェアのすぐ下に（2026-10-22。結果の下の一覧は y=934 で画面の外）。日本語のほかは、その言語のあるゲームだけ（site/common/langs.js）。
  $('#r-after').innerHTML = afterHtml(LANG);
  $('#r-row').innerHTML = g.mine ? moreRow('result', LANG) : '';
  $('#result').classList.toggle('with-row', g.mine);
  $('#result').hidden = false;
  $('#result').scrollTop = 0;
  drawPlan(f);
  const found = zukan();
  const fresh = g.mine ? f.an.rooms.map((r) => TYPES[r.t]).filter((t) => t.rare && !found.includes(t.id)) : [];
  if (fresh.length) store.set(ZK, JSON.stringify([...found, ...new Set(fresh.map((t) => t.id))]));
  $('#zk-new').hidden = !fresh.length;
  $('#zk-new').textContent = fresh.length ? UI.newRare(roomTitle(fresh[0])) : '';
  zkCount();
  if (g.mine) {
    sendRun(f, Math.round(g.built * 10) / 10);
    g.houses++;
    track('game_end', { result: f.head.key, quirks: f.quirks.length, lang: LANG, ...armParam() });
  }
}

function saveImage(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// 「Xでポスト」もチラシの画像を付ける（2026-10-21「文字だけだと面白くない」）。
// スマホ: 共有シートに本文と画像を渡す（X を選ぶと画像つきの投稿画面）。共有できない端末と PC: 画像を保存してから投稿画面を開く。
// PNG は押した瞬間に同期で作る（iOS は待つと共有シートを開かない）。
$('#r-post').addEventListener('click', (e) => {
  const f = g.f;
  if (!f) return;
  const file = pngFile($('#flyer'), `madori-${f.code}.png`);
  if (canShareImage()) {
    e.preventDefault();
    track('share_click', { placement: 'result', method: 'sheet_image' });
    shareImage(shareText(f), f.code, file).then((r) => {
      if (r === 'shared') track('share_complete', { method: 'sheet_image' });
      else if (r === 'fail') { saveImage(file); location.href = $('#r-post').href; }
    });
    return;
  }
  saveImage(file);
  track('share_click', { placement: 'result', method: 'intent' });
  track('image_save', { placement: 'post' });
});
$('#r-img').addEventListener('click', () => {
  const f = g.f;
  if (!f) return;
  saveImage(pngFile($('#flyer'), `madori-${f.code}.png`));
  track('image_save', { placement: 'result' });
});
$('#go').addEventListener('click', start);
$('#r-zukan').addEventListener('click', openZukan);
$('#t-zukan').addEventListener('click', openZukan);
$('#z-close').addEventListener('click', () => { $('#zukan').hidden = true; });
$('#again').addEventListener('click', () => promoThen({ lang: LANG, houses: g.houses, track, next: start }));
$('#mine').addEventListener('click', () => { track('shared_play'); start(); });
$('#watch').addEventListener('click', () => live(g.rooms, false));

$('#stage').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (g.mode === 'build') drop();
});
// 住んでいる間は、画面のどこでも押しているあいだ3倍速（2026-10-21。前は上の絵だけで、タップで切り替え）。
document.addEventListener('pointerdown', () => { if (g.mode === 'live') g.live.fast = true; });
for (const t of ['pointerup', 'pointercancel']) addEventListener(t, () => { if (g.live) g.live.fast = false; });
addEventListener('blur', () => { if (g.live) g.live.fast = false; });
addEventListener('contextmenu', (e) => { if (g.mode === 'live') e.preventDefault(); });

// --- frame -------------------------------------------------------------------------

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (g.mode === 'build' && g.piece) {
    const p = g.piece;
    if (g.fall) {
      const F = g.fall;
      F.vy += 70 * dt;
      F.y -= F.vy * dt;
      if (F.y <= F.target.y) landed();
      else p.y = F.y;
    } else {
      const speed = (2.1 + g.idx * 0.28) * 1.2;
      p.x += p.dir * speed * dt;
      const max = W - p.w;
      if (p.x > max) { p.x = max; p.dir = -1; }
      if (p.x < 0) { p.x = 0; p.dir = 1; }
    }
  }
  if (g.mode === 'live') stepLive(dt);
  g.shake = Math.max(0, g.shake - dt);
  draw();
  requestAnimationFrame(frame);
}

// After the last room: the rise into 3D, the day and the pause before the flyer all run at this
// speed (1 / 0.7: 2026-10-21, about 14 s → 10 s).
const PACE = 1 / 0.7;

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function draw() {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, cw, ch);
  let top;
  if (g.mode === 'live' || g.mode === 'flyer') top = (g.live?.an.top ?? H) + 0.2;
  else top = railFor(g.rooms, g.piece) + 0.3;
  g.viewTop += (top - g.viewTop) * 0.12;
  const v = fitView(cw, ch, -0.95, g.viewTop, 0.25);
  if (g.shake) v.oy += Math.sin(g.shake * 90) * g.shake * 14;
  drawLot(ctx, v);
  if ((g.mode === 'live' || g.mode === 'flyer') && g.scene) {
    const L = g.live;
    const e = g.rise < 1 ? easeInOut(g.rise) : 1;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, cw, ch);
    const iv = isoView(cw, ch, e, g.scene.bounds, 1 + (g.scene.maxZ - 1) * e);
    let person = null;
    if (g.mode === 'live' && L.i >= 0 && L.i < L.steps.length) {
      const s = L.steps[L.i];
      const stuck = s.stuck && L.d >= L.len ? Math.sin(L.t * 40) * 0.05 : 0;
      person = { x: L.pos[0] + stuck, y: L.pos[1], alpha: L.alpha, walking: L.d < L.len, t: L.t };
    }
    drawScene(ctx, iv, g.scene, { person });
    return;
  }
  const an = g.rooms.length ? analyze(g.rooms) : null;
  if (an) drawHouse(ctx, v, an, { entry: false });
  if (g.mode === 'build' && g.piece) {
    const p = g.piece;
    if (!g.fall) {
      const col = Math.round(p.x);
      drawGhost(ctx, v, { x: col, y: landing(g.rooms, col, p.w), w: p.w, h: p.h });
    }
    if (g.fall) { drawCrane(ctx, v, railFor(g.rooms, p), null); drawRoom(ctx, v, p); }
    else drawCrane(ctx, v, railFor(g.rooms, p), p);
  } else drawCrane(ctx, v, railFor(g.rooms, null), null);
}
requestAnimationFrame(frame);

// Read before a shared house strips the query. `?event=halloween` / `?event=off` (also `?halloween=1`).
const forcedEvent = halloweenFromQuery(location.search);
if (forcedEvent !== null) setHalloween(forcedEvent);

// A shared house (?h=…): show its flyer first, with a way to build your own.
const code = new URLSearchParams(location.search).get('h');
const shared = code && decode(code);
if (shared) {
  history.replaceState(null, '', location.pathname);
  $('#title').hidden = true;
}
// after the language has loaded (its words go on the flyer)
if (shared) ready.then(() => {
  g.rooms = shared.rooms;
  g.req = shared.req;
  g.name = shared.name;
  g.live = { an: analyze(shared.rooms) };
  g.mine = false;
  showFlyer();
  track('shared_view', { result: g.f.head.key, lang: LANG });
});
