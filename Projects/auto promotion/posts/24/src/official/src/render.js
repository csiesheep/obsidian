// Drawing the plan: a real-estate floor plan in black lines on paper (walls, door swings,
// tatami, the bathtub), the crane, the family walking, and the flyer (1200×630).
import { W, H, TYPES, labelOf, SQM, themeTag } from './house.js';
import { FONT, UI, LANG } from './lang.js';
import { CJK } from '../lang/meta.js';

export { FONT };

export const INK = '#1b1b1d';
export const PAPER = '#f5f3ee';
export const RED = '#d23a2c';
const FAINT = '#c9c6bd';

// view: { s: px per cell, ox: screen x of world x = 0, oy: screen y of world y = 0 (the road's edge) }
const X = (v, x) => v.ox + x * v.s;
const Y = (v, y) => v.oy - y * v.s;

export function fitView(cw, ch, minY, maxY, pad = 0.35) {
  const s = Math.min(cw / (W + pad * 2), ch / (maxY - minY + pad * 2));
  return { s, ox: (cw - W * s) / 2, oy: (ch - (maxY - minY) * s) / 2 + maxY * s };
}

const wallW = (v) => Math.max(2, v.s * 0.07);

export function drawLot(ctx, v, top = H) {
  // road
  ctx.fillStyle = '#e3e0d8';
  ctx.fillRect(X(v, -2), Y(v, 0), (W + 4) * v.s, v.s * 0.9);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = Math.max(1.5, v.s * 0.04);
  ctx.setLineDash([v.s * 0.3, v.s * 0.25]);
  ctx.beginPath();
  ctx.moveTo(X(v, -2), Y(v, -0.45));
  ctx.lineTo(X(v, W + 2), Y(v, -0.45));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#8d8a82';
  ctx.font = `${Math.round(v.s * 0.2)}px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(UI.road, X(v, 0.08), Y(v, -0.72));
  // lot line and grid
  ctx.fillStyle = FAINT;
  for (let x = 0; x <= W; x++) for (let y = 0; y <= H; y++) {
    ctx.beginPath();
    ctx.arc(X(v, x), Y(v, y), Math.max(1, v.s * 0.025), 0, Math.PI * 2);
    ctx.fill();
  }
  // north (away from the road)
  const nx = X(v, W) - v.s * 0.28, ny = Y(v, H) + v.s * 0.48;
  ctx.fillStyle = '#8d8a82';
  ctx.beginPath();
  ctx.moveTo(nx, ny - v.s * 0.22); ctx.lineTo(nx - v.s * 0.09, ny + v.s * 0.04); ctx.lineTo(nx + v.s * 0.09, ny + v.s * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.font = `bold ${Math.round(v.s * 0.18)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('N', nx, ny + v.s * 0.2);
  ctx.strokeStyle = '#a9a59b';
  ctx.lineWidth = 1;
  ctx.setLineDash([v.s * 0.12, v.s * 0.1]);
  ctx.strokeRect(X(v, 0), Y(v, H), W * v.s, H * v.s);
  ctx.setLineDash([]);
  void top;
}

function label(ctx, v, cx, cy, lines, size) {
  ctx.font = `bold ${Math.round(size)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lh = size * 1.15;
  const w = Math.max(...lines.map((l, i) => { ctx.font = `${i ? '' : 'bold '}${Math.round(i ? size * 0.82 : size)}px ${FONT}`; return ctx.measureText(l).width; }));
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillRect(cx - w / 2 - 3, cy - (lines.length * lh) / 2, w + 6, lines.length * lh);
  ctx.fillStyle = INK;
  lines.forEach((l, i) => {
    ctx.font = `${i ? '' : 'bold '}${Math.round(i ? size * 0.82 : size)}px ${FONT}`;
    ctx.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lh);
  });
}

// One room at world (x, y) — r = { t, w, h, x, y }.
export function drawRoom(ctx, v, r, opts = {}) {
  const id = TYPES[r.t].id;
  const x0 = X(v, r.x), y0 = Y(v, r.y + r.h), w = r.w * v.s, h = r.h * v.s;
  const s = v.s;
  ctx.fillStyle = TYPES[r.t].fill || { beran: '#ecebe6' }[id] || '#fff';
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = '#b8b4aa';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (id === 'wa') {
    // tatami: each cell is two mats, the direction alternating
    for (let cx = 0; cx < r.w; cx++) for (let cy = 0; cy < r.h; cy++) {
      const px = x0 + cx * s, py = y0 + cy * s;
      ctx.rect(px + 2, py + 2, s - 4, s - 4);
      if ((cx + cy) % 2) { ctx.moveTo(px + s / 2, py + 2); ctx.lineTo(px + s / 2, py + s - 2); }
      else { ctx.moveTo(px + 2, py + s / 2); ctx.lineTo(px + s - 2, py + s / 2); }
    }
  } else if (id === 'yo' || id === 'ldk' || id === 'li') {
    for (let i = 1; i < r.w * 4; i++) { ctx.moveTo(x0 + (i * s) / 4, y0 + 3); ctx.lineTo(x0 + (i * s) / 4, y0 + h - 3); }
  } else if (id === 'beran') {
    const n = Math.round((r.w > r.h ? r.w : r.h) * 7);
    for (let i = 1; i < n; i++) {
      if (r.w > r.h) { ctx.moveTo(x0 + (i * w) / n, y0 + 3); ctx.lineTo(x0 + (i * w) / n, y0 + h - 3); }
      else { ctx.moveTo(x0 + 3, y0 + (i * h) / n); ctx.lineTo(x0 + w - 3, y0 + (i * h) / n); }
    }
  } else if (id === 'gen') {
    for (let i = -4; i < 8; i++) { ctx.moveTo(x0 + (i * s) / 5, y0 + h); ctx.lineTo(x0 + (i * s) / 5 + s * 0.6, y0 + h - s * 0.6); }
  }
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, w, h);
  ctx.clip();
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(1.2, s * 0.03);
  if (id === 'ldk') {
    // kitchen counter with a sink and two burners along the far wall
    const long = r.w >= r.h;
    const cw = long ? s * 1.5 : s * 0.42, ch = long ? s * 0.42 : s * 1.5;
    const kx = x0 + 3, ky = y0 + 3;
    ctx.fillStyle = '#fff';
    ctx.fillRect(kx, ky, cw, ch);
    ctx.strokeRect(kx, ky, cw, ch);
    ctx.strokeRect(kx + (long ? s * 0.12 : s * 0.08), ky + (long ? s * 0.08 : s * 0.12), s * 0.26, s * 0.26);
    for (const k of [0.85, 1.2]) {
      ctx.beginPath();
      ctx.arc(kx + (long ? s * k : s * 0.21), ky + (long ? s * 0.21 : s * k), s * 0.1, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (id === 'wc') {
    ctx.strokeRect(x0 + s * 0.34, y0 + s * 0.08, s * 0.32, s * 0.12);
    ctx.beginPath();
    ctx.ellipse(x0 + s * 0.5, y0 + s * 0.36, s * 0.12, s * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (id === 'bath') {
    ctx.beginPath();
    ctx.roundRect(x0 + s * 0.12, y0 + s * 0.1, s * 0.76, s * 0.42, s * 0.12);
    ctx.stroke();
  } else if (id === 'kai') {
    const long = r.h >= r.w;
    const n = 8;
    ctx.beginPath();
    for (let i = 1; i < n; i++) {
      if (long) { ctx.moveTo(x0, y0 + (i * h) / n); ctx.lineTo(x0 + w, y0 + (i * h) / n); }
      else { ctx.moveTo(x0 + (i * w) / n, y0); ctx.lineTo(x0 + (i * w) / n, y0 + h); }
    }
    ctx.stroke();
    ctx.strokeStyle = RED;
    ctx.beginPath();
    if (long) { ctx.moveTo(x0 + w / 2, y0 + h - s * 0.2); ctx.lineTo(x0 + w / 2, y0 + s * 0.2); ctx.lineTo(x0 + w / 2 - s * 0.12, y0 + s * 0.36); }
    else { ctx.moveTo(x0 + s * 0.2, y0 + h / 2); ctx.lineTo(x0 + w - s * 0.2, y0 + h / 2); ctx.lineTo(x0 + w - s * 0.36, y0 + h / 2 - s * 0.12); }
    ctx.stroke();
  } else if (id === 'haka') {
    // three gravestones seen from above, and the path between them
    const n = 3, long = r.w >= r.h;
    for (let i = 0; i < n; i++) {
      const cx = long ? x0 + ((i + 0.5) * w) / n : x0 + w / 2, cy = long ? y0 + h * 0.4 : y0 + ((i + 0.5) * h) / n;
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - s * 0.17, cy - s * 0.12, s * 0.34, s * 0.24);
      ctx.strokeRect(cx - s * 0.17, cy - s * 0.12, s * 0.34, s * 0.24);
      ctx.strokeRect(cx - s * 0.1, cy - s * 0.07, s * 0.2, s * 0.14);
    }
  } else if (id === 'tera') {
    // the altar at the back and a row of cushions
    ctx.strokeRect(x0 + w * 0.3, y0 + s * 0.12, w * 0.4, s * 0.3);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) ctx.strokeRect(x0 + w * (0.22 + i * 0.22), y0 + h * (0.55 + j * 0.2), s * 0.24, s * 0.24);
  } else if (id === 'tower') {
    ctx.beginPath();
    ctx.moveTo(x0 + 4, y0 + 4); ctx.lineTo(x0 + w - 4, y0 + h - 4);
    ctx.moveTo(x0 + w - 4, y0 + 4); ctx.lineTo(x0 + 4, y0 + h - 4);
    ctx.stroke();
    ctx.strokeRect(x0 + s * 0.3, y0 + s * 0.3, s * 0.4, s * 0.4);
  } else if (id === 'pool') {
    ctx.strokeStyle = '#7fb7c9';
    ctx.beginPath();
    const long = r.w >= r.h;
    for (let i = 1; i < 4; i++) {
      if (long) { ctx.moveTo(x0 + 6, y0 + (i * h) / 4); ctx.lineTo(x0 + w - 6, y0 + (i * h) / 4); }
      else { ctx.moveTo(x0 + (i * w) / 4, y0 + 6); ctx.lineTo(x0 + (i * w) / 4, y0 + h - 6); }
    }
    ctx.stroke();
  } else if (id === 'wheel') {
    const long = r.w >= r.h, n = 6;
    ctx.beginPath();
    if (long) { ctx.moveTo(x0 + s * 0.2, y0 + h / 2); ctx.lineTo(x0 + w - s * 0.2, y0 + h / 2); }
    else { ctx.moveTo(x0 + w / 2, y0 + s * 0.2); ctx.lineTo(x0 + w / 2, y0 + h - s * 0.2); }
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      ctx.beginPath();
      const t = (i + 0.5) / n;
      ctx.arc(long ? x0 + s * 0.2 + t * (w - s * 0.4) : x0 + w / 2, long ? y0 + h / 2 : y0 + s * 0.2 + t * (h - s * 0.4), s * 0.07, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (id === 'torii') {
    ctx.fillStyle = RED;
    ctx.fillRect(x0 + s * 0.12, y0 + s * 0.42, s * 0.76, s * 0.12);
    ctx.fillRect(x0 + s * 0.22, y0 + s * 0.38, s * 0.12, s * 0.2);
    ctx.fillRect(x0 + s * 0.66, y0 + s * 0.38, s * 0.12, s * 0.2);
  } else if (id === 'roka') {
    // a hallway: boards along it and a runner down the middle
    const long = r.h >= r.w;
    ctx.strokeStyle = '#b8b4aa';
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      if (long) { ctx.moveTo(x0 + (i * w) / 4, y0 + 2); ctx.lineTo(x0 + (i * w) / 4, y0 + h - 2); }
      else { ctx.moveTo(x0 + 2, y0 + (i * h) / 4); ctx.lineTo(x0 + w - 2, y0 + (i * h) / 4); }
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(210,58,44,0.16)';
    if (long) ctx.fillRect(x0 + w * 0.3, y0 + s * 0.12, w * 0.4, h - s * 0.24);
    else ctx.fillRect(x0 + s * 0.12, y0 + h * 0.3, w - s * 0.24, h * 0.4);
  } else if (TYPES[r.t].shop) {
    // a shop: a striped awning along the road side (the bottom of the plan) and a counter behind it
    const col = TYPES[r.t].opt.color;
    const n = r.w * 5, bh = s * 0.16;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i % 2 ? '#fff' : col;
      ctx.fillRect(x0 + (i * w) / n, y0 + h - bh, w / n + 0.5, bh);
    }
    ctx.strokeRect(x0 + s * 0.12, y0 + s * 0.12, w - s * 0.24, s * 0.22);
  } else if (id === 'oshi') {
    ctx.setLineDash([s * 0.08, s * 0.06]);
    ctx.beginPath();
    ctx.moveTo(x0 + 3, y0 + 3); ctx.lineTo(x0 + w - 3, y0 + h - 3);
    ctx.moveTo(x0 + w - 3, y0 + 3); ctx.lineTo(x0 + 3, y0 + h - 3);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.strokeStyle = INK;
  ctx.lineWidth = wallW(v);
  ctx.strokeRect(x0, y0, w, h);

  if (opts.label !== false) drawLabel(ctx, v, r);
}

export function drawLabel(ctx, v, r) {
  const id = TYPES[r.t].id;
  const s = v.s, x0 = X(v, r.x), y0 = Y(v, r.y + r.h), w = r.w * s, h = r.h * s;
  const big = r.w * r.h >= 4;
  const lines = [labelOf(r)];
  if (['ldk', 'wa', 'yo', 'li'].includes(id)) lines.push(UI.area(r.w * r.h * 2, id === 'wa', Math.round(r.w * r.h * SQM)));
  const cx = x0 + w / 2, cy = y0 + h / 2 + (id === 'bath' ? s * 0.26 : id === 'wc' ? s * 0.33 : id === 'ldk' && r.w >= r.h ? s * 0.18 : 0);
  // a narrow, tall room (1 wide, 3+ long: 縦の流しそうめん・万里の長城・ボウリング場): stack the name vertically
  if (r.w === 1 && r.h >= 3 && lines.length === 1 && lines[0].length > 2 && !CJK.has(LANG)) {
    // letters: turned sideways, reading bottom to top
    let sz = s * 0.36;
    ctx.font = `bold ${Math.round(sz)}px ${FONT}`;
    while (sz > 6 && ctx.measureText(lines[0]).width > h * 0.88) { sz *= 0.9; ctx.font = `bold ${Math.round(sz)}px ${FONT}`; }
    const tw = ctx.measureText(lines[0]).width;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillRect(-tw / 2 - 3, -sz / 2 - 3, tw + 6, sz + 6);
    ctx.fillStyle = INK;
    ctx.fillText(lines[0], 0, 1);
    ctx.restore();
    return;
  }
  if (r.w === 1 && r.h >= 3 && lines.length === 1 && lines[0].length > 2) {
    const chars = [...lines[0]];
    const sz = Math.min(s * 0.4, (h * 0.88) / (chars.length * 1.12));
    const lh = sz * 1.12;
    ctx.font = `bold ${Math.round(sz)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillRect(cx - sz / 2 - 3, cy - (chars.length * lh) / 2, sz + 6, chars.length * lh);
    ctx.fillStyle = INK;
    chars.forEach((ch, i) => ctx.fillText(ch === 'ー' ? '｜' : ch, cx, cy + (i - (chars.length - 1) / 2) * lh));
    return;
  }
  let size = s * (big ? 0.24 : r.w * r.h >= 2 ? 0.2 : 0.19);
  ctx.font = `bold ${Math.round(size)}px ${FONT}`;
  while (size > 6 && ctx.measureText(lines[0]).width > w * 0.9) { size *= 0.9; ctx.font = `bold ${Math.round(size)}px ${FONT}`; }
  label(ctx, v, cx, cy, lines, size);
}

// A door in a shared wall: a gap with the leaf and its swing, opening into `into`.
function door(ctx, v, seg, sign, color = INK) {
  const s = v.s, d = 0.6, a = (1 - d) / 2;
  const p = (t, n) => seg.v ? [X(v, seg.x + n), Y(v, seg.y + t)] : [X(v, seg.x + t), Y(v, seg.y + n)];
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = wallW(v) + 2;
  ctx.beginPath();
  ctx.moveTo(...p(a, 0)); ctx.lineTo(...p(1 - a, 0));
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.2, s * 0.028);
  const [hx, hy] = p(a, 0);
  const [tx, ty] = p(a, d * sign);
  ctx.beginPath();
  ctx.moveTo(hx, hy); ctx.lineTo(tx, ty);
  ctx.stroke();
  ctx.setLineDash([s * 0.05, s * 0.05]);
  ctx.beginPath();
  const r = d * s;
  const [ex, ey] = p(1 - a, 0);
  const a0 = Math.atan2(ty - hy, tx - hx), a1 = Math.atan2(ey - hy, ex - hx);
  let da = a1 - a0;
  while (da > Math.PI) da -= Math.PI * 2;
  while (da < -Math.PI) da += Math.PI * 2;
  ctx.arc(hx, hy, r, a0, a0 + da, da < 0);
  ctx.stroke();
  ctx.setLineDash([]);
}

const sideOf = (seg, r) => (seg.v ? (r.x >= seg.x ? 1 : -1) : (r.y >= seg.y ? 1 : -1));

// The whole house. opts: { gaps: 'mark' (hatch the enclosed gaps red), circle: quirk.at, entry: true }
export function drawHouse(ctx, v, an, opts = {}) {
  const { rooms } = an;
  for (const r of rooms) drawRoom(ctx, v, r, { label: false });
  for (const d of an.doors) door(ctx, v, d, sideOf(d, rooms[d.b]));
  const e = an.entry;
  if (e && opts.entry !== false) {
    const r = rooms[e.room];
    if (e.kind === 'window') {
      // a window on the road side: three thin lines in the wall
      const seg = e.seg;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = wallW(v) + 1;
      ctx.beginPath();
      ctx.moveTo(X(v, seg.x + 0.15), Y(v, seg.y)); ctx.lineTo(X(v, seg.x + 0.85), Y(v, seg.y));
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      for (const k of [-0.05, 0, 0.05]) {
        ctx.beginPath();
        ctx.moveTo(X(v, seg.x + 0.15), Y(v, seg.y + k)); ctx.lineTo(X(v, seg.x + 0.85), Y(v, seg.y + k));
        ctx.stroke();
      }
    } else door(ctx, v, e.seg, sideOf(e.seg, r));
    // the entrance triangle, just outside
    const { ox, oy } = e.seg;
    const s = v.s * 0.16;
    const dir = e.seg.v ? [ox < e.seg.x ? 1 : -1, 0] : [0, oy < e.seg.y ? 1 : -1];
    const cx = X(v, ox), cy = Y(v, oy);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(cx + dir[0] * s, cy - dir[1] * s);
    ctx.lineTo(cx - dir[0] * s * 0.6 - dir[1] * s * 0.8, cy + dir[1] * s * 0.6 - dir[0] * s * 0.8);
    ctx.lineTo(cx - dir[0] * s * 0.6 + dir[1] * s * 0.8, cy + dir[1] * s * 0.6 + dir[0] * s * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  for (const r of rooms) drawLabel(ctx, v, r);
  if (opts.gaps === 'mark') for (const g of an.gaps) markGap(ctx, v, g);
  if (opts.circle) circle(ctx, v, an, opts.circle);
}

function markGap(ctx, v, cells) {
  ctx.save();
  ctx.beginPath();
  for (const [x, y] of cells) ctx.rect(X(v, x), Y(v, y + 1), v.s, v.s);
  ctx.clip();
  ctx.strokeStyle = RED;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = -30; i < 60; i++) { ctx.moveTo(X(v, i * 0.2), Y(v, -1)); ctx.lineTo(X(v, i * 0.2 + 12), Y(v, 11)); }
  ctx.stroke();
  ctx.restore();
  const [cx, cy] = center(cells);
  ctx.fillStyle = RED;
  ctx.font = `bold ${Math.round(v.s * 0.42)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', X(v, cx), Y(v, cy));
}

const center = (cells) => [cells.reduce((s, c) => s + c[0], 0) / cells.length + 0.5, cells.reduce((s, c) => s + c[1], 0) / cells.length + 0.5];

// The flyer's red ring around what the headline is about.
function circle(ctx, v, an, at) {
  let cx, cy, rx, ry;
  if (at.cells) {
    [cx, cy] = center(at.cells);
    const xs = at.cells.map((c) => c[0]), ys = at.cells.map((c) => c[1]);
    rx = (Math.max(...xs) - Math.min(...xs) + 1) * 0.5 + 0.35;
    ry = (Math.max(...ys) - Math.min(...ys) + 1) * 0.5 + 0.35;
  } else if (at.room != null && an.rooms[at.room]) {
    const r = an.rooms[at.room];
    cx = r.x + r.w / 2; cy = r.y + r.h / 2; rx = r.w / 2 + 0.35; ry = r.h / 2 + 0.35;
  } else return;
  ctx.strokeStyle = RED;
  ctx.lineWidth = Math.max(2.5, v.s * 0.07);
  ctx.beginPath();
  ctx.ellipse(X(v, cx), Y(v, cy), rx * v.s * 1.05, ry * v.s, -0.12, 0.25, Math.PI * 2 + 0.05);
  ctx.stroke();
}

// The crane: a rail along the top, a trolley, and the room hanging from its cable.
export function drawCrane(ctx, v, railY, piece) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, v.s * 0.05);
  ctx.beginPath();
  ctx.moveTo(X(v, -0.3), Y(v, railY)); ctx.lineTo(X(v, W + 0.3), Y(v, railY));
  ctx.stroke();
  if (!piece) return;
  const cx = X(v, piece.x + piece.w / 2);
  ctx.fillStyle = INK;
  ctx.fillRect(cx - v.s * 0.22, Y(v, railY) - v.s * 0.08, v.s * 0.44, v.s * 0.2);
  ctx.lineWidth = Math.max(1.2, v.s * 0.025);
  ctx.beginPath();
  ctx.moveTo(cx, Y(v, railY) + v.s * 0.1);
  ctx.lineTo(cx, Y(v, piece.y + piece.h) - v.s * 0.12);
  ctx.moveTo(cx, Y(v, piece.y + piece.h) - v.s * 0.12);
  ctx.lineTo(X(v, piece.x + 0.1), Y(v, piece.y + piece.h));
  ctx.moveTo(cx, Y(v, piece.y + piece.h) - v.s * 0.12);
  ctx.lineTo(X(v, piece.x + piece.w - 0.1), Y(v, piece.y + piece.h));
  ctx.stroke();
  drawRoom(ctx, v, piece);
}

// Where it will land: a dashed outline on the stack.
export function drawGhost(ctx, v, r) {
  ctx.strokeStyle = '#8d8a82';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([v.s * 0.1, v.s * 0.08]);
  ctx.strokeRect(X(v, r.x) + 2, Y(v, r.y + r.h) + 2, r.w * v.s - 4, r.h * v.s - 4);
  ctx.setLineDash([]);
}

export function drawPerson(ctx, v, wx, wy, t, alpha = 1) {
  const s = v.s;
  const x = X(v, wx), y = Y(v, wy);
  const bob = Math.sin(t * 14) * s * 0.02;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = RED;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.08 + bob, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - s * 0.08 + bob, s * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.globalAlpha = 1;
}

// --- the flyer -----------------------------------------------------------------------

// Japanese and Chinese break anywhere (not before closing punctuation); the others at spaces and after +.
function wrap(ctx, text, width) {
  const cjk = CJK.has(LANG);
  const parts = cjk ? [...text] : text.split(/(?<=[ +])/); // + : the layout line (2LDK+Ferris wheel+…)
  const lines = [];
  let line = '';
  for (const p of parts) {
    if (ctx.measureText((line + p).trimEnd()).width > width && line && !(cjk && '。、）」・，！？：；'.includes(p))) { lines.push(line.trimEnd()); line = p; }
    else line += p;
  }
  if (line) lines.push(line.trimEnd());
  return lines;
}

export function drawFlyer(canvas, f, art) {
  const ctx = canvas.getContext('2d');
  const CW = 1200, CH = 630;
  canvas.width = CW;
  canvas.height = CH;
  ctx.fillStyle = '#fbfaf6';
  ctx.fillRect(0, 0, CW, CH);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, CW - 28, CH - 28);

  // picture on the left
  art(ctx, 24, 24, 610, CH - 48);

  // copy on the right
  const L = 660, R = CW - 44, TW = R - L;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 28px ${FONT}`;
  const badge = Math.max(92, ctx.measureText(UI.newBuild).width + 36);
  let lim = 0;
  if (f.limited && UI.limited) {
    ctx.font = `bold 22px ${FONT}`;
    lim = Math.max(72, ctx.measureText(UI.limited).width + 28);
  }
  ctx.fillStyle = RED;
  ctx.fillRect(L, 52, badge, 44);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = `bold 28px ${FONT}`;
  ctx.fillText(UI.newBuild, L + badge / 2, 84);
  if (lim) {
    const x = L + badge + 8;
    ctx.fillStyle = '#2b2430';
    ctx.fillRect(x, 52, lim, 44);
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText(UI.limited, x + lim / 2, 82);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `bold 40px ${FONT}`;
  const nameX = L + badge + (lim ? 8 + lim : 0) + 18;
  let nameSize = 40;
  while (ctx.measureText(f.name).width > R - nameX && nameSize > 22) { nameSize -= 2; ctx.font = `bold ${nameSize}px ${FONT}`; }
  ctx.fillText(f.name, nameX, 88);

  ctx.fillStyle = RED;
  let size = 42;
  let lines;
  // words (not CJK) take more lines at the same size: shrink to 2 lines down to 32px first, so the bullets still fit
  const most = (sz) => (CJK.has(LANG) || sz <= 32 ? 3 : 2);
  do { ctx.font = `bold ${size}px ${FONT}`; lines = wrap(ctx, f.head.text, TW); size -= 2; } while (lines.length > most(size + 2) && size > 26);
  let y = 160;
  // テーマ揃いの見出し (2026-10-23): a small red-framed tag above the headline, when the house has a theme
  if (f.theme) {
    const tag = themeTag(f);
    // in the gap between the name (baseline 88) and the headline, so the headline moves down only 18px
    // and the bullets below keep their room
    const headFont = ctx.font;
    ctx.font = `bold 20px ${FONT}`;
    const tw = ctx.measureText(tag).width;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(L - 6, 112, tw + 12, 27);
    ctx.fillText(tag, L, 132);
    ctx.font = headFont;
    y += 18;
  }
  for (const l of lines) { ctx.fillText(l, L, y); y += (size + 2) * 1.28; }

  y += 6;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
  y += 52;
  ctx.fillStyle = INK;
  // 家賃 7.9 万円 (another language: e.g. Rent ¥79,000 /mo): the label, the figure in red, the unit
  const [rent0, rentN, rent1] = UI.rent(f.rent);
  const rentParts = [[`24px ${FONT}`, rent0, 8, 0], [`bold 54px ${FONT}`, rentN, 6, 2], [`bold 26px ${FONT}`, rent1, 0, 0]];
  const rentW = rentParts.reduce((w, [font, t, gap]) => { ctx.font = font; return w + ctx.measureText(t).width + gap; }, 0);
  const drawRent = (x, y) => {
    rentParts.forEach(([font, t, gap, dy], i) => {
      ctx.font = font;
      if (i === 1) ctx.fillStyle = RED;
      ctx.fillText(t, x, y + dy);
      x += ctx.measureText(t).width + gap;
    });
  };
  const room = TW - rentW - 28;
  let ms = 50;
  ctx.font = `bold ${ms}px ${FONT}`;
  while (ctx.measureText(f.madori).width > room && ms > 26) { ms -= 2; ctx.font = `bold ${ms}px ${FONT}`; }
  if (ctx.measureText(f.madori).width <= room) {
    ctx.fillText(f.madori, L, y);
    drawRent(L + ctx.measureText(f.madori).width + 28, y);
    y += 40;
  } else {
    // 間取りが 26px でも入らない（レア部屋が並ぶ）ときは、間取りだけで幅いっぱい（最大2行・最小22px）に
    // 描き、家賃は次の行に下ろす。あとの箇条書きは既存の CH-74 判定で切れる。
    y -= 16; // the line above was spaced for 50px; this one is 26px
    let msz = 26;
    let mlines;
    ctx.font = `bold ${msz}px ${FONT}`;
    mlines = wrap(ctx, f.madori, TW);
    while (mlines.length > 2 && msz > 22) { msz -= 2; ctx.font = `bold ${msz}px ${FONT}`; mlines = wrap(ctx, f.madori, TW); }
    for (const l of mlines) { ctx.fillText(l, L, y); y += msz * 1.28; }
    y += 24; // 家賃の数字（54px）が上の行に食い込まないように
    drawRent(L, y);
    y += 40;
  }
  ctx.fillStyle = INK;
  ctx.font = `24px ${FONT}`;
  // 専有面積 ／ 築年数 ／ 駅徒歩: one line if it fits, else broken between the parts (2026-10-22)
  const subs = [];
  for (const p of [UI.sub2(f.sqm), f.age.text, f.access.text]) {
    const joined = subs.length ? subs[subs.length - 1] + UI.sep + p : p;
    if (subs.length && ctx.measureText(joined).width <= TW) subs[subs.length - 1] = joined;
    else subs.push(p);
  }
  subs.forEach((l, i) => { if (i) y += 32; ctx.fillText(l, L, y); });
  y += 20;
  ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
  y += 40;
  for (const b of f.bullets) {
    // 25px; a line that doesn't fit at the bottom gets one more try at 21px (long words in other languages)
    let sz = 25, lh = 34, ls;
    ctx.font = `${sz}px ${FONT}`;
    ls = wrap(ctx, b.text, TW - 30);
    // the last line ends above the footer (a line of its own: 8px more room than one squeezed next to it)
    const over = () => y + (ls.length - 1) * lh > CH - (ls.length > 1 ? 76 : 66);
    if (over()) { sz = 21; lh = 28; ctx.font = `${sz}px ${FONT}`; ls = wrap(ctx, b.text, TW - 30); }
    if (over()) break;
    ctx.fillStyle = RED;
    ctx.fillText('●', L, y);
    ctx.fillStyle = INK;
    for (const l of ls) { ctx.fillText(l, L + 30, y); y += lh; }
    y += 8;
  }
  ctx.fillStyle = '#8d8a82';
  ctx.font = `bold 22px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(UI.footer, R, CH - 40);
  ctx.textAlign = 'left';
}

// The plan alone, fitted into w × h (the inset of the flyer's picture).
export function drawPlanIn(ctx, w, h, f, pad = 0.15) {
  const v = fitView(w, h, -0.95, f.an.top + 0.1, pad);
  drawLot(ctx, v);
  drawHouse(ctx, v, f.an, { gaps: 'mark', circle: f.head.at });
}
