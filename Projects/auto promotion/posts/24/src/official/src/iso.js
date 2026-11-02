// The finished house in 3D: the plan tilts up and the walls rise (t = 0 is the flat plan,
// t = 1 the bird's-eye view from the road's south-west corner). Black lines on white like
// the plan; colour only where it means something (water, the torii, the temple roof).
// Painter's order: floors first, then walls, furniture and the family by depth (x + y).
import { W, TYPES, labelOf } from './house.js';
import { UI } from './lang.js';
import { INK, RED, FONT } from './render.js';

const CA = 0.82, SA = 0.47, ZK = 0.92;
const WATER = '#a9d6e6';
const lerp = (a, b, t) => a + (b - a) * t;

// b: the part of the world to fit, { x0, x1, y0, y1 } in cells (the house, not the whole lot).
export function isoView(cw, ch, t, b, maxZ, pad = 0.06) {
  const raw = (x, y, z) => [lerp(x, (x - y) * CA, t), lerp(-y, -(x + y) * SA - z * ZK, t)];
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [0, maxZ]) {
    const [a, b] = raw(x, y, z);
    x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b);
  }
  const s = Math.min(cw / (x1 - x0), ch / (y1 - y0)) * (1 - pad * 2);
  const ox = cw / 2 - s * (x0 + x1) / 2, oy = ch / 2 - s * (y0 + y1) / 2;
  const P = (x, y, z = 0) => { const [a, b] = raw(x, y, z); return [ox + a * s, oy + b * s]; };
  return { P, s, t };
}

const id = (r) => TYPES[r.t].id;

function quad(ctx, pts, fill, stroke = INK, lw = 1.2) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}

const line = (ctx, a, b, color = INK, lw = 1) => {
  ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
};

// A box seen from the south-west: back faces never show, so draw west, south, then the top.
function box(ctx, P, x0, y0, x1, y1, z0, z1, fill = '#fff', top = fill, lw = 1.2) {
  quad(ctx, [P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1)], fill, INK, lw);
  quad(ctx, [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)], fill, INK, lw);
  quad(ctx, [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], top, INK, lw);
}

// --- the scene ---------------------------------------------------------------------------

export function buildScene(an) {
  const { rooms, owner, top } = an;
  const at = (x, y) => (x < 0 || x >= W || y < 0 || y >= top ? -2 : owner[x][y]);
  const indoor = (o) => o >= 0 && !TYPES[rooms[o].t].out;
  const tallWall = (o) => (o >= 0 ? TYPES[rooms[o].t].opt?.wall : 0);
  const kind = (o) => (o >= 0 ? id(rooms[o]) : null);
  const gaps = new Set(an.gaps.flat().map(([x, y]) => `${x},${y}`));
  const doorAt = new Map(an.doors.map((d) => [`${d.v ? 'v' : 'h'}${d.x},${d.y}`, d]));
  if (an.entry) doorAt.set(`${an.entry.seg.v ? 'v' : 'h'}${an.entry.seg.x},${an.entry.seg.y}`, { entry: an.entry.kind });
  const items = [];
  let maxZ = 1.3;

  // walls on every unit edge with an indoor room on at least one side
  const wall = (v, x, y, a, b) => {
    if (a === b || (!indoor(a) && !indoor(b))) return;
    const tall = (o) => o >= 0 && TYPES[rooms[o].t].kit === 'tall';
    if ((tall(a) || tall(b)) && (!indoor(a) || !indoor(b))) return;
    const both = indoor(a) && indoor(b);
    const tera = tallWall(a) || tallWall(b);
    const beran = (kind(a) === 'beran' && !indoor(b)) || (kind(b) === 'beran' && !indoor(a));
    // outside on the low side (south or west) faces the viewer: cut down so the inside shows
    const front = !indoor(a);
    let h = both ? 0.5 : front ? 0.16 : 0.95;
    if (tera) h = both ? 0.95 : front ? 0.4 : 0.95;
    if (beran) h = 0.28;
    const d = doorAt.get(`${v ? 'v' : 'h'}${x},${y}`);
    const window_ = !both && !front && !d && !beran && !tera;
    const p = (u) => (v ? [x, y + u] : [x + u, y]);
    const pieces = d && d.entry !== 'window' ? [[0, 0.2], [0.8, 1]] : [[0, 1]];
    for (const [u0, u1] of pieces) {
      const [xa, ya] = p(u0), [xb, yb] = p(u1);
      items.push({
        key: (xa + xb + ya + yb) / 2 - 0.01,
        draw(ctx, P, s) {
          quad(ctx, [P(xa, ya, 0), P(xb, yb, 0), P(xb, yb, h), P(xa, ya, h)], '#fff', INK, 1.1);
          line(ctx, P(xa, ya, h), P(xb, yb, h), INK, Math.max(1.8, s * 0.045));
          if (window_ && h > 0.8) quad(ctx, [P(...p(0.28), 0.42), P(...p(0.72), 0.42), P(...p(0.72), 0.78), P(...p(0.28), 0.78)], '#fff', INK, 1);
          if (d?.entry === 'window') quad(ctx, [P(...p(0.2), 0.08), P(...p(0.8), 0.08), P(...p(0.8), 0.14), P(...p(0.2), 0.14)], null, INK, 1);
        },
      });
    }
  };
  for (let x = 0; x <= W; x++) for (let y = 0; y < top; y++) wall(true, x, y, at(x - 1, y), at(x, y));
  for (let y = 0; y <= top; y++) for (let x = 0; x < W; x++) wall(false, x, y, at(x, y - 1), at(x, y));

  // what stands in each room
  for (const r of rooms) {
    const k = id(r), x0 = r.x, y0 = r.y, x1 = r.x + r.w, y1 = r.y + r.h, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const long = r.w >= r.h;
    const put = (key, draw) => items.push({ key, draw });
    if (k === 'ldk') {
      if (long) put(x0 + 0.8 + y1 - 0.3, (c, P) => box(c, P, x0 + 0.08, y1 - 0.5, x0 + 1.5, y1 - 0.08, 0, 0.42));
      else put(x1 - 0.3 + y0 + 0.8, (c, P) => box(c, P, x1 - 0.5, y0 + 0.08, x1 - 0.08, y0 + 1.5, 0, 0.42));
      put(cx + cy - 0.2, (c, P) => box(c, P, cx - 0.35, cy - 0.45, cx + 0.35, cy + 0.05, 0, 0.3));
    } else if (k === 'yo' || k === 'li') {
      put(cx + cy, (c, P) => { box(c, P, x0 + 0.15, y0 + 0.55, x0 + 1.1, y1 - 0.12, 0, 0.24); box(c, P, x0 + 0.3, y1 - 0.45, x0 + 0.95, y1 - 0.2, 0.24, 0.32); });
    } else if (k === 'wa') {
      put(cx + cy, (c, P) => box(c, P, cx - 0.32, cy - 0.25, cx + 0.32, cy + 0.25, 0, 0.16));
    } else if (k === 'wc') {
      put(cx + cy + 0.2, (c, P) => { box(c, P, cx - 0.16, y1 - 0.25, cx + 0.16, y1 - 0.1, 0, 0.36); box(c, P, cx - 0.13, y1 - 0.58, cx + 0.13, y1 - 0.25, 0, 0.18); });
    } else if (k === 'bath') {
      put(cx + cy + 0.2, (c, P) => box(c, P, x0 + 0.1, y1 - 0.55, x1 - 0.1, y1 - 0.1, 0, 0.3, '#fff', WATER));
    } else if (k === 'oshi') {
      put(cx + cy, (c, P) => {
        box(c, P, x0 + 0.08, y0 + 0.08, x1 - 0.08, y1 - 0.08, 0, 0.72);
        line(c, P(cx, y0 + 0.08, 0.05), P(cx, y0 + 0.08, 0.67));
      });
    } else if (k === 'kai') {
      // stairs to nowhere
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = i / n, b = (i + 1) / n, z = ((i + 1) / n) * 0.95;
        if (r.h >= r.w) put(x0 + 0.5 + y0 + a * r.h + 0.05, (c, P) => box(c, P, x0 + 0.06, y0 + a * r.h, x1 - 0.06, y0 + b * r.h, 0, z));
        else put(x0 + a * r.w + y0 + 0.5 + 0.05, (c, P) => box(c, P, x0 + a * r.w, y0 + 0.06, x0 + b * r.w, y1 - 0.06, 0, z));
      }
    } else if (TYPES[r.t].rare || TYPES[r.t].shop) rareItems(r, put, (z) => { maxZ = Math.max(maxZ, z); });
  }

  // floors
  const floors = (ctx, P, s) => {
    quad(ctx, [P(-1.6, -1, 0), P(W + 1.6, -1, 0), P(W + 1.6, 0, 0), P(-1.6, 0, 0)], '#dcd9d0', null);
    ctx.setLineDash([s * 0.3, s * 0.25]);
    line(ctx, P(-1.6, -0.5, 0), P(W + 1.6, -0.5, 0), '#fff', Math.max(1.5, s * 0.04));
    ctx.setLineDash([]);
    quad(ctx, [P(0, 0, 0), P(W, 0, 0), P(W, top, 0), P(0, top, 0)], '#ebe8df', '#b9b5ab', 1);
    for (const r of rooms) {
      const k = id(r);
      const fill = TYPES[r.t].fill || { beran: '#e6e4de', gen: '#e4e1d9' }[k] || '#fff';
      quad(ctx, [P(r.x, r.y), P(r.x + r.w, r.y), P(r.x + r.w, r.y + r.h), P(r.x, r.y + r.h)], fill, '#9d998f', 1);
      ctx.strokeStyle = k === 'pool' ? '#7fb7c9' : '#c8c4ba';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (k === 'wa') for (let cx = 0; cx < r.w; cx++) for (let cy = 0; cy < r.h; cy++) {
        const bx = r.x + cx, by = r.y + cy;
        for (const [a, b] of (cx + cy) % 2 ? [[[bx + 0.5, by], [bx + 0.5, by + 1]]] : [[[bx, by + 0.5], [bx + 1, by + 0.5]]]) { ctx.moveTo(...P(...a)); ctx.lineTo(...P(...b)); }
        ctx.moveTo(...P(bx, by)); ctx.lineTo(...P(bx + 1, by)); ctx.lineTo(...P(bx + 1, by + 1));
      } else if (k === 'yo' || k === 'ldk' || k === 'li') for (let i = 1; i < r.w * 3; i++) { ctx.moveTo(...P(r.x + i / 3, r.y)); ctx.lineTo(...P(r.x + i / 3, r.y + r.h)); }
      else if (k === 'bath' || k === 'pool' || k === 'onsen') for (let i = 1; i < 4; i++) { ctx.moveTo(...P(r.x + (i * r.w) / 4, r.y)); ctx.lineTo(...P(r.x + (i * r.w) / 4, r.y + r.h)); }
      else if (k === 'roka') for (let i = 1; i < 4; i++) {
        if (r.h >= r.w) { ctx.moveTo(...P(r.x + i / 4, r.y)); ctx.lineTo(...P(r.x + i / 4, r.y + r.h)); }
        else { ctx.moveTo(...P(r.x, r.y + i / 4)); ctx.lineTo(...P(r.x + r.w, r.y + i / 4)); }
      }
      ctx.stroke();
      // the hallway's runner
      if (k === 'roka') {
        const [a0, b0, a1, b1] = r.h >= r.w ? [r.x + 0.3, r.y + 0.12, r.x + 0.7, r.y + r.h - 0.12] : [r.x + 0.12, r.y + 0.3, r.x + r.w - 0.12, r.y + 0.7];
        quad(ctx, [P(a0, b0), P(a1, b0), P(a1, b1), P(a0, b1)], '#e9b9a8', '#c98b78', 1);
      }
    }
    for (const g of an.gaps) for (const [x, y] of g) quad(ctx, [P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)], '#2b2b2e', null);
  };
  items.sort((a, b) => b.key - a.key);
  const bounds = {
    x0: Math.min(...rooms.map((r) => r.x)) - 0.5, x1: Math.max(...rooms.map((r) => r.x + r.w)) + 0.5,
    y0: -1, y1: Math.max(...rooms.map((r) => r.y + r.h)) + 0.4,
  };
  return { an, items, floors, maxZ, gaps, bounds };
}

// person: { x, y, alpha, walking, t } in world cells. circle: quirk.at (a red ring on the floor).
export function drawScene(ctx, view, scene, opts = {}) {
  const { P, s } = view;
  scene.floors(ctx, P, s);
  const items = [...scene.items];
  if (opts.person) {
    const p = opts.person;
    items.push({
      key: p.x + p.y,
      draw(c) {
        c.globalAlpha = p.alpha ?? 1;
        const bob = p.walking ? Math.abs(Math.sin(p.t * 9)) * 0.06 : 0;
        const [fx, fy] = P(p.x, p.y, bob), [hx, hy] = P(p.x, p.y, 0.62 + bob);
        line(c, [fx - s * 0.06, fy], [hx, hy + s * 0.14], RED, Math.max(2, s * 0.07));
        line(c, [fx + s * 0.06, fy], [hx, hy + s * 0.14], RED, Math.max(2, s * 0.07));
        c.fillStyle = RED; c.strokeStyle = '#fff'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(hx, hy, Math.max(4, s * 0.13), 0, Math.PI * 2); c.fill(); c.stroke();
        c.globalAlpha = 1;
      },
    });
    items.sort((a, b) => b.key - a.key);
  }
  for (const it of items) it.draw(ctx, P, s);
  // labels and annotations on top
  if (opts.labels !== false && view.t > 0.6) {
    ctx.globalAlpha = Math.min(1, (view.t - 0.6) / 0.3);
    for (const r of scene.an.rooms) {
      const [x, y] = P(r.x + r.w / 2, r.y + 0.22, 0);
      tag(ctx, x, y, labelOf(r), Math.max(10, s * 0.2));
    }
    for (const g of scene.an.gaps) {
      const cx = g.reduce((a, c) => a + c[0], 0) / g.length + 0.5, cy = g.reduce((a, c) => a + c[1], 0) / g.length + 0.5;
      const [x, y] = P(cx, cy, 0);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(s * 0.42)}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', x, y);
    }
    ctx.globalAlpha = 1;
  }
  if (opts.circle) ring(ctx, view, scene.an, opts.circle);
}

function tag(ctx, x, y, text, size) {
  ctx.font = `bold ${Math.round(size)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 8;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(x - w / 2, y - size * 0.62, w, size * 1.24);
  ctx.strokeStyle = INK; ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2, y - size * 0.62, w, size * 1.24);
  ctx.fillStyle = INK;
  ctx.fillText(text, x, y + 1);
}

function ring(ctx, view, an, at) {
  let cx, cy, rx, ry;
  if (at.cells) {
    const xs = at.cells.map((c) => c[0]), ys = at.cells.map((c) => c[1]);
    cx = (Math.min(...xs) + Math.max(...xs) + 1) / 2; cy = (Math.min(...ys) + Math.max(...ys) + 1) / 2;
    rx = (Math.max(...xs) - Math.min(...xs) + 1) / 2 + 0.3; ry = (Math.max(...ys) - Math.min(...ys) + 1) / 2 + 0.3;
  } else if (an.rooms[at.room]) {
    const r = an.rooms[at.room];
    cx = r.x + r.w / 2; cy = r.y + r.h / 2; rx = r.w / 2 + 0.3; ry = r.h / 2 + 0.3;
  } else return;
  ctx.strokeStyle = RED;
  ctx.lineWidth = Math.max(2.5, view.s * 0.07);
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const a = 0.3 + (i / 60) * (Math.PI * 2 - 0.15);
    const [x, y] = view.P(cx + rx * 1.1 * Math.cos(a), cy + ry * 1.1 * Math.sin(a), 0.05);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
}

// The flyer's picture: the 3D house, with the plan as an inset in the corner (as estate flyers do).
export function drawPers(ctx, x, y, w, h, f, drawPlanInset) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x, y);
  const scene = buildScene(f.an);
  const view = isoView(w, h, 1, scene.bounds, scene.maxZ, 0.03);
  drawScene(ctx, view, scene, { circle: f.head.at });
  // the plan in the top-left corner, where the back of the lot is empty
  const iw = w * 0.32, ih = h * 0.36;
  ctx.fillStyle = '#fff';
  ctx.fillRect(6, 6, iw, ih);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(6, 6, iw, ih);
  ctx.translate(6, 6);
  ctx.beginPath();
  ctx.rect(0, 0, iw, ih);
  ctx.clip();
  drawPlanInset(ctx, iw, ih, f);
  ctx.restore();
}

// --- rare rooms (src/rare.js `kit`) ------------------------------------------------------

const STONE = '#b9b5ab', DARK = '#3a3a3f', GOLD = '#c9a23a', WOOD = '#b98a55';

// a flat polygon on the plane z (an ellipse or circle)
function ell(c, P, cx, cy, z, rx, ry, fill, stroke = INK, lw = 1.2, n = 28) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push(P(cx + rx * Math.cos(a), cy + ry * Math.sin(a), z)); }
  quad(c, pts, fill, stroke, lw);
}

// a hip roof over [x0, x1] × [y0, y1] from the eaves at zE to the ridge at zR
function roof(c, P, x0, y0, x1, y1, zE, zR, color = DARK, e = 0.2) {
  const long = x1 - x0 >= y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const half = long ? (x1 - x0) * 0.22 : (y1 - y0) * 0.22;
  const R0 = long ? P(cx - half, cy, zR) : P(cx, cy - half, zR), R1 = long ? P(cx + half, cy, zR) : P(cx, cy + half, zR);
  const A = P(x0 - e, y0 - e, zE), B = P(x1 + e, y0 - e, zE), C = P(x1 + e, y1 + e, zE), D = P(x0 - e, y1 + e, zE);
  const faces = long ? [[D, C, R1, R0], [B, C, R1], [A, D, R0], [A, B, R1, R0]] : [[D, C, R1], [B, C, R1, R0], [A, D, R1, R0], [A, B, R0]];
  for (const f of faces) quad(c, f, color, '#fff', 1.2);
  line(c, R0, R1, '#fff', 1.4);
}

const dot = (c, [x, y], r, color) => { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };

// The outline of a set of screen points (a convex hull), filled: domes, saucers and cones.
function hull(c, pts, fill, stroke = INK, lw = 1.2) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  quad(c, [...lo.slice(0, -1), ...hi.slice(0, -1)], fill, stroke, lw);
}
// A half ellipsoid on z0: radii rx, ry, height hz (a dome); `full` makes it a whole ellipsoid (a saucer).
function dome(c, P, cx, cy, z0, rx, ry, hz, fill, full = false) {
  const pts = [];
  for (let i = 0; i <= 8; i++) for (let j = 0; j < 24; j++) {
    const t = ((full ? -1 : 0) + (i / 8) * (full ? 2 : 1)) * (Math.PI / 2), a = (j / 24) * Math.PI * 2;
    pts.push(P(cx + rx * Math.cos(t) * Math.cos(a), cy + ry * Math.cos(t) * Math.sin(a), z0 + hz * Math.sin(t)));
  }
  hull(c, pts, fill);
}
// A cone from the circle (cx, cy, z0, rad) up to the point at z1.
const cone = (c, P, cx, cy, z0, rad, z1, fill) => {
  const pts = [P(cx, cy, z1)];
  for (let j = 0; j < 24; j++) { const a = (j / 24) * Math.PI * 2; pts.push(P(cx + rad * Math.cos(a), cy + rad * Math.sin(a), z0)); }
  hull(c, pts, fill);
};

function rareItems(r, put, raise) {
  const t = TYPES[r.t], o = t.opt || {};
  const x0 = r.x, y0 = r.y, x1 = r.x + r.w, y1 = r.y + r.h, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const long = r.w >= r.h;
  const key = cx + cy;
  switch (t.kit) {
    case 'haka':
      for (let i = 0; i < 3; i++) {
        const gx = long ? x0 + ((i + 0.5) * r.w) / 3 : cx, gy = long ? cy + 0.1 : y0 + ((i + 0.5) * r.h) / 3;
        put(gx + gy, (c, P) => { box(c, P, gx - 0.22, gy - 0.17, gx + 0.22, gy + 0.17, 0, 0.1, STONE, STONE); box(c, P, gx - 0.12, gy - 0.07, gx + 0.12, gy + 0.09, 0.1, 0.75, '#8d8a82', '#a9a59b'); });
      }
      break;
    case 'roof':
      raise(2.1);
      put(key + 0.4, (c, P) => {
        if (o.chimney) { box(c, P, x1 - 0.45, y1 - 0.45, x1 - 0.2, y1 - 0.2, 0.95, 2.6, '#fff'); raise(2.7); }
        roof(c, P, x0, y0, x1, y1, 0.95, 1.9, o.color, 0.28);
        if (!o.chimney) { const [ax, ay] = P(cx, cy, 2.0); dot(c, [ax, ay], 3, GOLD); }
      });
      break;
    case 'tall': {
      const Z = o.z;
      raise(Z + 1);
      put(key, (c, P, s) => {
        box(c, P, x0 + 0.12, y0 + 0.12, x1 - 0.12, y1 - 0.12, 0, Z);
        if (o.stripes) for (let z = 0.6; z < Z - 0.4; z += 1.1) box(c, P, x0 + 0.12, y0 + 0.12, x1 - 0.12, y1 - 0.12, z, z + 0.5, RED, RED, 1);
        if (o.windows) for (let z = 0.7; z < Z - 0.3; z += 0.55) {
          quad(c, [P(x0 + 0.12, y0 + 0.3, z), P(x0 + 0.12, y0 + 0.7, z), P(x0 + 0.12, y0 + 0.7, z + 0.3), P(x0 + 0.12, y0 + 0.3, z + 0.3)], '#fff', INK, 1);
          quad(c, [P(x0 + 0.3, y0 + 0.12, z), P(x0 + 0.7, y0 + 0.12, z), P(x0 + 0.7, y0 + 0.12, z + 0.3), P(x0 + 0.3, y0 + 0.12, z + 0.3)], '#fff', INK, 1);
        }
        if (o.stripes) {
          box(c, P, x0 + 0.22, y0 + 0.22, x1 - 0.22, y1 - 0.22, Z, Z + 0.4, '#fff', '#f5d76a');
          roof(c, P, x0 + 0.2, y0 + 0.2, x1 - 0.2, y1 - 0.2, Z + 0.4, Z + 0.75, RED, 0.06);
        } else {
          line(c, P(cx, cy, Z), P(cx, cy, Z + 0.8), INK, 2);
          dot(c, P(cx, cy, Z + 0.85), Math.max(2.5, s * 0.06), RED);
        }
      });
      break;
    }
    case 'water':
      if (o.rocks) for (const [u, v] of [[0.15, 0.2], [0.85, 0.3], [0.3, 0.88], [0.75, 0.82]]) {
        const gx = x0 + u * r.w, gy = y0 + v * r.h;
        put(gx + gy, (c, P) => box(c, P, gx - 0.16, gy - 0.12, gx + 0.16, gy + 0.12, 0, 0.22, STONE, STONE));
      }
      else if (o.rods) {
        // a fishing pond: rods on the rim, floats and fish below the surface
        put(key, (c, P) => {
          for (const [dx, dy] of [[0.2, 0.2], [0.8, 0.35], [0.5, 0.8]]) {
            const fx = x0 + dx * r.w, fy = y0 + dy * r.h;
            ell(c, P, fx, fy, 0.02, 0.13, 0.06, '#e07b39', null, 1);
          }
        });
        for (const u of [0.22, 0.5, 0.78]) {
          const gx = x0 + u * r.w, gy = y0 + 0.05;
          put(gx + gy, (c, P) => {
            box(c, P, gx - 0.1, gy - 0.02, gx + 0.1, gy + 0.14, 0, 0.22, WOOD, WOOD, 1);
            line(c, P(gx, gy + 0.06, 0.22), P(gx - 0.12, gy + 0.75, 1.45), '#6b4f2e', 2.6);
            line(c, P(gx - 0.12, gy + 0.75, 1.45), P(gx - 0.12, gy + 0.8, 0.03), '#555', 1);
            dot(c, P(gx - 0.12, gy + 0.8, 0.03), 4, RED);
          });
        }
      }
      else if (o.croc) {
        // a crocodile on the surface: long body, eyes and a jagged back
        const G = '#5c8a3a';
        put(key + 2, (c, P) => ell(c, P, cx, cy, 0.01, r.w * 0.45, r.h * 0.42, '#86bccb', '#5aa7c4', 1.5));
        put(key + 0.2, (c, P) => {
          box(c, P, cx - 0.7, cy - 0.18, cx + 0.7, cy + 0.18, 0.02, 0.12, G, '#4a7030');
          box(c, P, cx - 1.0, cy - 0.14, cx - 0.7, cy + 0.14, 0.02, 0.1, G, '#4a7030');
          for (const [lx, ly] of [[-0.45, -0.26], [0.4, -0.26], [-0.45, 0.26], [0.4, 0.26]]) box(c, P, cx + lx - 0.06, cy + ly - 0.06, cx + lx + 0.06, cy + ly + 0.06, 0.02, 0.08, G, G, 1);
          box(c, P, cx + 0.7, cy - 0.08, cx + 1.0, cy + 0.08, 0.02, 0.1, G, G);
          dot(c, P(cx - 0.62, cy - 0.1, 0.18), 3, '#f2c230'); dot(c, P(cx - 0.62, cy + 0.1, 0.18), 3, '#f2c230');
          dot(c, P(cx - 0.62, cy - 0.1, 0.18), 1.4, INK); dot(c, P(cx - 0.62, cy + 0.1, 0.18), 1.4, INK);
          for (let i = 0; i < 5; i++) {
            const u = cx - 0.6 + i * 0.3;
            line(c, P(u, cy - 0.18, 0.12), P(u + 0.1, cy - 0.18, 0.24), G, 2);
            line(c, P(u + 0.1, cy - 0.18, 0.24), P(u + 0.2, cy - 0.18, 0.12), G, 2);
          }
        });
      }
      else put(x0 + 0.1 + cy, (c, P) => { box(c, P, x0 + 0.1, cy - 0.04, x0 + 0.16, cy + 0.04, 0, 0.5); box(c, P, x0 + 0.1, cy + 0.3, x0 + 0.16, cy + 0.38, 0, 0.5); });
      break;
    case 'wheel': {
      const R = 1.25, zc = R + 0.25;
      raise(zc + R + 0.3);
      put(key + 0.3, (c, P) => {
        const pt = (a, rr = R) => (long ? P(cx + rr * Math.cos(a), cy, zc + rr * Math.sin(a)) : P(cx, cy + rr * Math.cos(a), zc + rr * Math.sin(a)));
        const foot = (d) => (long ? P(cx + d, cy, 0) : P(cx, cy + d, 0));
        line(c, foot(-0.7), P(cx, cy, zc), INK, 2.2);
        line(c, foot(0.7), P(cx, cy, zc), INK, 2.2);
        c.strokeStyle = INK; c.lineWidth = 2;
        c.beginPath();
        for (let i = 0; i <= 48; i++) { const [px, py] = pt((i / 48) * Math.PI * 2); i ? c.lineTo(px, py) : c.moveTo(px, py); }
        c.stroke();
        for (let i = 0; i < 8; i++) line(c, P(cx, cy, zc), pt((i / 8) * Math.PI * 2), INK, 1);
        for (let i = 0; i < 8; i++) {
          const [px, py] = pt((i / 8) * Math.PI * 2 + 0.2);
          c.fillStyle = i % 2 ? '#fff' : RED; c.strokeStyle = INK; c.lineWidth = 1.2;
          c.beginPath(); c.roundRect(px - 5, py, 10, 9, 2); c.fill(); c.stroke();
        }
      });
      break;
    }
    case 'torii':
      raise(1.5);
      put(key, (c, P) => {
        const L = long ? (u, w = 0.06) => [x0 + u - w, cy - w, x0 + u + w, cy + w] : (u, w = 0.06) => [cx - w, y0 + u - w, cx + w, y0 + u + w];
        for (const u of [0.22, 0.78]) { const [a, b, cc, d] = L(u); box(c, P, a, b, cc, d, 0, 1.15, RED, RED, 1); }
        const [a, b] = L(0.04, 0.07), [, , cc, d] = L(0.96, 0.07);
        box(c, P, a, b, cc, d, 0.92, 1, RED, RED, 1);
        box(c, P, a - 0.04, b - 0.02, cc + 0.04, d + 0.02, 1.15, 1.27, INK, INK, 1);
      });
      break;
    case 'taki':
      raise(2);
      put(key + 0.6, (c, P) => {
        const [a0, b0, a1, b1] = long ? [x1 - 0.35, y0, x1, y1] : [x0, y1 - 0.35, x1, y1];
        box(c, P, a0, b0, a1, b1, 0, 1.8, STONE, STONE);
        const n = 5;
        for (let i = 0; i < n; i++) {
          const u = 0.15 + (i / (n - 1)) * 0.7;
          if (long) line(c, P(a0, y0 + u * r.h, 1.75), P(a0, y0 + u * r.h, 0.05), '#5aa7c4', 2.4);
          else line(c, P(x0 + u * r.w, b0, 1.75), P(x0 + u * r.w, b0, 0.05), '#5aa7c4', 2.4);
        }
      });
      break;
    case 'rows':
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const gx = x0 + ((i + 0.5) * r.w) / 4, gy = y0 + ((j + 0.5) * r.h) / 4;
        put(gx + gy, (c, P) => { line(c, P(gx - 0.06, gy, 0), P(gx - 0.1, gy, 0.22), '#5c8a3a', 1.6); line(c, P(gx + 0.06, gy, 0), P(gx + 0.1, gy, 0.22), '#5c8a3a', 1.6); line(c, P(gx, gy, 0), P(gx, gy, 0.26), '#5c8a3a', 1.6); });
      }
      break;
    case 'animals': {
      const n = o.n || 1;
      if (o.kind === 'penguin') put(key + 2, (c, P) => ell(c, P, cx + (long ? 0.35 : 0), cy + (long ? 0 : 0.35), 0.01, long ? 0.4 : 0.3, long ? 0.3 : 0.4, '#a9d6e6', '#5aa7c4', 1.2));
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n;
        const gx = long ? x0 + u * r.w : cx, gy = long ? cy : y0 + u * r.h;
        if (o.kind === 'cow') put(gx + gy, (c, P) => {
          for (const [dx, dy] of [[-0.22, -0.1], [0.22, -0.1], [-0.22, 0.1], [0.22, 0.1]]) box(c, P, gx + dx - 0.03, gy + dy - 0.03, gx + dx + 0.03, gy + dy + 0.03, 0, 0.22);
          box(c, P, gx - 0.3, gy - 0.15, gx + 0.3, gy + 0.15, 0.22, 0.5);
          box(c, P, gx + 0.3, gy - 0.09, gx + 0.46, gy + 0.09, 0.36, 0.56);
          dot(c, P(gx - 0.1, gy - 0.15, 0.4), 3, INK); dot(c, P(gx + 0.1, gy - 0.15, 0.32), 2.5, INK);
        });
        else if (o.kind === 'elephant') { raise(1.6); put(gx + gy, (c, P) => {
          const G = '#a8a7a2';
          for (const [dx, dy] of [[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]]) box(c, P, gx + dx - 0.08, gy + dy - 0.08, gx + dx + 0.08, gy + dy + 0.08, 0, 0.45, G, G);
          box(c, P, gx - 0.5, gy - 0.32, gx + 0.5, gy + 0.32, 0.45, 1.1, G, G);
          box(c, P, gx - 0.75, gy - 0.22, gx - 0.45, gy + 0.22, 0.75, 1.25, G, G);
          line(c, P(gx - 0.75, gy, 0.85), P(gx - 0.85, gy, 0.2), INK, 3);
          quad(c, [P(gx - 0.62, gy - 0.22, 0.85), P(gx - 0.5, gy - 0.48, 0.75), P(gx - 0.5, gy - 0.48, 1.25), P(gx - 0.62, gy - 0.22, 1.25)], G, INK, 1);
        }); }
        else if (o.kind === 'penguin') put(gx + gy, (c, P, s) => {
          box(c, P, gx - 0.09, gy - 0.12, gx + 0.05, gy - 0.04, 0, 0.03, '#f2a23a', '#f2a23a', 1);
          box(c, P, gx - 0.1, gy - 0.1, gx + 0.1, gy + 0.1, 0.03, 0.5, '#2b2b2e', '#2b2b2e');
          quad(c, [P(gx - 0.05, gy - 0.1, 0.08), P(gx + 0.05, gy - 0.1, 0.08), P(gx + 0.05, gy - 0.1, 0.38), P(gx - 0.05, gy - 0.1, 0.38)], '#fff', '#fff', 1);
          const hr = Math.max(3.5, s * 0.1);
          dot(c, P(gx, gy, 0.62), hr, '#2b2b2e');
          dot(c, P(gx - 0.05, gy - 0.07, 0.65), Math.max(1.2, hr * 0.3), '#fff');
          box(c, P, gx - 0.16, gy - 0.16, gx - 0.06, gy - 0.08, 0.58, 0.63, '#f2a23a', '#f2a23a', 1);
        });
        else put(gx + gy, (c, P) => {
          box(c, P, gx - 0.1, gy - 0.07, gx + 0.1, gy + 0.07, 0.04, 0.2);
          box(c, P, gx - 0.13, gy - 0.04, gx - 0.05, gy + 0.04, 0.18, 0.3);
          dot(c, P(gx - 0.09, gy, 0.33), 2.5, RED);
        });
      }
      break;
    }
    case 'dohyo':
      raise(1.9);
      put(key, (c, P) => {
        box(c, P, x0 + 0.1, y0 + 0.1, x1 - 0.1, y1 - 0.1, 0, 0.18, '#d8c79e', '#e8d9b5');
        ell(c, P, cx, cy, 0.18, r.w * 0.33, r.h * 0.33, null, '#fff', 3);
        for (const [a, b] of [[x0 + 0.15, y0 + 0.15], [x1 - 0.15, y0 + 0.15]]) line(c, P(a, b, 0.18), P(a, b, 1.4), INK, 1.5);
        roof(c, P, x0 + 0.15, y0 + 0.15, x1 - 0.15, y1 - 0.15, 1.4, 1.85, DARK, 0.1);
      });
      break;
    case 'hut':
      raise(1.4);
      put(key, (c, P, s) => {
        box(c, P, x0 + 0.15, y0 + 0.15, x1 - 0.15, y1 - 0.15, 0, 0.6, '#fff');
        quad(c, [P(x0 + 0.15, y0 + 0.35, 0), P(x0 + 0.15, y0 + 0.65, 0), P(x0 + 0.15, y0 + 0.65, o.lamp ? 0.45 : 0.3), P(x0 + 0.15, y0 + 0.35, o.lamp ? 0.45 : 0.3)], '#fff', INK, 1);
        roof(c, P, x0 + 0.15, y0 + 0.15, x1 - 0.15, y1 - 0.15, 0.6, 1.0, o.color, 0.1);
        if (o.lamp) dot(c, P(x0 + 0.15, cy, 0.66), Math.max(3, s * 0.07), RED);
      });
      break;
    case 'castle':
      raise(3.6);
      put(key + 0.3, (c, P) => {
        box(c, P, x0 + 0.05, y0 + 0.05, x1 - 0.05, y1 - 0.05, 0, 0.45, STONE, STONE);
        let z = 0.45;
        for (const [inset, h] of [[0.2, 0.6], [0.45, 0.5], [0.65, 0.45]]) {
          box(c, P, x0 + inset, y0 + inset, x1 - inset, y1 - inset, z, z + h);
          roof(c, P, x0 + inset, y0 + inset, x1 - inset, y1 - inset, z + h, z + h + 0.35, DARK, 0.18);
          z += h + 0.3;
        }
        dot(c, P(cx, cy, z + 0.1), 3.5, GOLD);
      });
      break;
    case 'slide':
      raise(1.5);
      put(key, (c, P) => {
        if (long) {
          box(c, P, x0 + 0.1, cy - 0.2, x0 + 0.35, cy + 0.2, 0, 1.2);
          quad(c, [P(x0 + 0.35, cy - 0.18, 1.2), P(x1 - 0.1, cy - 0.18, 0.08), P(x1 - 0.1, cy + 0.18, 0.08), P(x0 + 0.35, cy + 0.18, 1.2)], '#f2c230', INK, 1.2);
        } else {
          box(c, P, cx - 0.2, y1 - 0.35, cx + 0.2, y1 - 0.1, 0, 1.2);
          quad(c, [P(cx - 0.18, y1 - 0.35, 1.2), P(cx - 0.18, y0 + 0.1, 0.08), P(cx + 0.18, y0 + 0.1, 0.08), P(cx + 0.18, y1 - 0.35, 1.2)], '#f2c230', INK, 1.2);
        }
      });
      break;
    case 'cabinet':
      raise(1.3);
      put(key, (c, P) => {
        box(c, P, x0 + 0.2, y0 + 0.2, x1 - 0.2, y1 - 0.25, 0, o.vent ? 0.95 : 1.1, o.color, '#fff');
        if (!o.vent) {
          quad(c, [P(x0 + 0.3, y0 + 0.2, 0.55), P(x1 - 0.3, y0 + 0.2, 0.55), P(x1 - 0.3, y0 + 0.2, 0.95), P(x0 + 0.3, y0 + 0.2, 0.95)], '#fff', INK, 1);
          for (let i = 0; i < 3; i++) dot(c, P(x0 + 0.38 + i * 0.12, y0 + 0.2, 0.75), 2.5, ['#5aa7c4', '#f2c230', '#5c8a3a'][i]);
        } else quad(c, [P(x0 + 0.42, y0 + 0.2, 0.1), P(x1 - 0.42, y0 + 0.2, 0.1), P(x1 - 0.42, y0 + 0.2, 0.75), P(x0 + 0.42, y0 + 0.2, 0.75)], '#fff', INK, 1);
      });
      break;
    case 'booth':
      raise(1.5);
      put(key, (c, P) => {
        box(c, P, x0 + 0.22, y0 + 0.22, x1 - 0.22, y1 - 0.22, 0, 1.2, '#eef6f0', o.color);
        for (const z of [0.3, 0.75]) line(c, P(x0 + 0.22, y0 + 0.22, z), P(x1 - 0.22, y0 + 0.22, z), o.color, 2);
        if (o.sign) quad(c, [P(x0 + 0.22, y0 + 0.22, 0.9), P(x1 - 0.22, y0 + 0.22, 0.9), P(x1 - 0.22, y0 + 0.22, 1.05), P(x0 + 0.22, y0 + 0.22, 1.05)], o.sign, INK, 1);
        box(c, P, x0 + 0.18, y0 + 0.18, x1 - 0.18, y1 - 0.18, 1.2, 1.32, o.color, o.color);
      });
      break;
    case 'station':
      raise(1.4);
      put(key, (c, P) => {
        const [p0, p1] = long ? [[x0, y0 + 0.55, x1, y1], [x0, y0, x1, y0 + 0.5]] : [[x0 + 0.55, y0, x1, y1], [x0, y0, x0 + 0.5, y1]];
        box(c, P, p0[0], p0[1], p0[2], p0[3], 0, 0.25, '#fff');
        if (long) { box(c, P, x0 + 0.2, y0 + 0.05, x1 - 0.2, y0 + 0.45, 0.05, 0.62, '#fff', '#fff'); for (let i = 0; i < 5; i++) quad(c, [P(x0 + 0.35 + i * 0.5, y0 + 0.05, 0.3), P(x0 + 0.65 + i * 0.5, y0 + 0.05, 0.3), P(x0 + 0.65 + i * 0.5, y0 + 0.05, 0.5), P(x0 + 0.35 + i * 0.5, y0 + 0.05, 0.5)], '#cfe8f1', INK, 1); line(c, P(x0 + 0.2, y0 + 0.05, 0.22), P(x1 - 0.2, y0 + 0.05, 0.22), '#4f9a62', 3); }
        else { box(c, P, x0 + 0.05, y0 + 0.2, x0 + 0.45, y1 - 0.2, 0.05, 0.62, '#fff', '#fff'); line(c, P(x0 + 0.05, y0 + 0.2, 0.22), P(x0 + 0.05, y1 - 0.2, 0.22), '#4f9a62', 3); }
        const sx = long ? cx : (x0 + x1) / 2 + 0.2, sy = long ? y1 - 0.2 : cy;
        line(c, P(sx, sy, 0.25), P(sx, sy, 1.0), INK, 1.5);
        box(c, P, sx - 0.3, sy - 0.03, sx + 0.3, sy + 0.03, 1.0, 1.25, '#fff');
      });
      break;
    case 'heli':
      put(key - 0.5, (c, P) => {
        ell(c, P, cx, cy, 0.01, r.w * 0.4, r.h * 0.4, null, '#fff', 3);
        const h = (a, b, cc, d) => line(c, P(cx + a, cy + b, 0.01), P(cx + cc, cy + d, 0.01), '#fff', 4);
        h(-0.25, -0.35, -0.25, 0.35); h(0.25, -0.35, 0.25, 0.35); h(-0.25, 0, 0.25, 0);
      });
      break;
    case 'safe':
      put(key, (c, P, s) => {
        box(c, P, x0 + 0.15, y0 + 0.15, x1 - 0.15, y1 - 0.15, 0, 0.85, '#8d8a82', '#a9a59b');
        ell(c, P, cx, y0 + 0.15, 0.45, 0.12, 0.001, null, '#fff', 2, 12);
        dot(c, P(cx, y0 + 0.15, 0.45), Math.max(3, s * 0.08), '#fff');
      });
      break;
    case 'shelves':
      for (let i = 0; i < 3; i++) {
        const u = (i + 0.5) / 3;
        const [a0, b0, a1, b1] = long ? [x0 + 0.2, y0 + u * r.h - 0.12, x1 - 0.2, y0 + u * r.h + 0.12] : [x0 + u * r.w - 0.12, y0 + 0.2, x0 + u * r.w + 0.12, y1 - 0.2];
        put((a0 + a1) / 2 + (b0 + b1) / 2, (c, P) => {
          box(c, P, a0, b0, a1, b1, 0, 1.0, '#fff');
          for (const z of [0.33, 0.66]) line(c, P(a0, b0, z), P(a1, b0, z), INK, 1);
          for (let k = 0; k < 10; k++) { const f = a0 + ((k + 0.5) / 10) * (a1 - a0); line(c, P(f, b0, 0.38), P(f, b0, 0.6), ['#d23a2c', '#4f9a62', '#5aa7c4'][k % 3], 2); }
        });
      }
      break;
    case 'cinema':
      raise(1.6);
      put(x1 + y1 - 0.2, (c, P) => {
        if (long) quad(c, [P(x0 + 0.2, y1 - 0.15, 0.3), P(x1 - 0.2, y1 - 0.15, 0.3), P(x1 - 0.2, y1 - 0.15, 1.3), P(x0 + 0.2, y1 - 0.15, 1.3)], '#fff', INK, 3);
        else quad(c, [P(x1 - 0.15, y0 + 0.2, 0.3), P(x1 - 0.15, y1 - 0.2, 0.3), P(x1 - 0.15, y1 - 0.2, 1.3), P(x1 - 0.15, y0 + 0.2, 1.3)], '#fff', INK, 3);
      });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        const gx = x0 + ((i + 0.5) * r.w) / 3, gy = y0 + 0.3 + j * 0.5;
        put(gx + gy, (c, P) => { box(c, P, gx - 0.15, gy - 0.12, gx + 0.15, gy + 0.12, 0, 0.18, RED, RED); box(c, P, gx - 0.15, gy - 0.12, gx + 0.15, gy - 0.05, 0.18, 0.4, RED, RED); });
      }
      break;
    case 'fountain':
      raise(1.4);
      put(key, (c, P) => {
        ell(c, P, cx, cy, 0, 0.42, 0.42, STONE);
        ell(c, P, cx, cy, 0.18, 0.42, 0.42, '#a9d6e6');
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; line(c, P(cx, cy, 1.05), P(cx + 0.3 * Math.cos(a), cy + 0.3 * Math.sin(a), 0.22), '#5aa7c4', 1.5); }
        line(c, P(cx, cy, 0.18), P(cx, cy, 1.1), '#5aa7c4', 2.5);
      });
      break;
    case 'pyramid':
      raise(2);
      put(key, (c, P) => {
        const A = P(x0 + 0.08, y0 + 0.08), B = P(x1 - 0.08, y0 + 0.08), C = P(x1 - 0.08, y1 - 0.08), D = P(x0 + 0.08, y1 - 0.08), T = P(cx, cy, 1.8);
        quad(c, [A, D, T], '#e8d9b5', INK, 1.2);
        quad(c, [A, B, T], '#f1e6c8', INK, 1.2);
        void C;
      });
      break;
    case 'bell':
      raise(1.7);
      put(key, (c, P) => {
        for (const [a, b] of [[x0 + 0.15, y0 + 0.15], [x1 - 0.15, y0 + 0.15], [x0 + 0.15, y1 - 0.15]]) line(c, P(a, b, 0), P(a, b, 1.05), INK, 2);
        box(c, P, cx - 0.17, cy - 0.17, cx + 0.17, cy + 0.17, 0.45, 0.95, '#7d6b45', '#7d6b45');
        roof(c, P, x0 + 0.15, y0 + 0.15, x1 - 0.15, y1 - 0.15, 1.05, 1.45, DARK, 0.12);
      });
      break;
    case 'sushi':
      put(key, (c, P) => {
        const [a0, b0, a1, b1] = long ? [x0 + 0.15, cy - 0.25, x1 - 0.15, cy + 0.25] : [cx - 0.25, y0 + 0.15, cx + 0.25, y1 - 0.15];
        box(c, P, a0, b0, a1, b1, 0, 0.42, '#fff', '#e3e0d8');
        for (let k = 0; k < 6; k++) { const u = (k + 0.5) / 6; const p = long ? P(a0 + u * (a1 - a0), b0 + 0.1, 0.44) : P(a0 + 0.1, b0 + u * (b1 - b0), 0.44); dot(c, p, 4, ['#d23a2c', '#f2c230', '#fff'][k % 3]); }
      });
      break;
    case 'yatai':
      raise(1.4);
      put(key, (c, P) => {
        box(c, P, x0 + 0.15, y0 + 0.25, x1 - 0.15, y1 - 0.25, 0.12, 0.55, '#c99a63', '#e3d2b5');
        for (const a of [x0 + 0.3, x1 - 0.3]) ell(c, P, a, y0 + 0.25, 0.12, 0.12, 0.001, null, INK, 2, 12);
        for (const a of [x0 + 0.17, x1 - 0.17]) line(c, P(a, y0 + 0.27, 0.55), P(a, y0 + 0.27, 1.1), INK, 1.5);
        quad(c, [P(x0 + 0.17, y0 + 0.27, 0.85), P(x1 - 0.17, y0 + 0.27, 0.85), P(x1 - 0.17, y0 + 0.27, 1.05), P(x0 + 0.17, y0 + 0.27, 1.05)], RED, INK, 1);
        box(c, P, x0 + 0.1, y0 + 0.2, x1 - 0.1, y1 - 0.2, 1.1, 1.16, DARK, DARK);
      });
      break;
    case 'buddha':
      raise(2.4);
      put(key, (c, P) => {
        const B = '#9a9572';
        box(c, P, x0 + 0.2, y0 + 0.2, x1 - 0.2, y1 - 0.2, 0, 0.3, STONE, STONE);
        box(c, P, cx - 0.6, cy - 0.45, cx + 0.6, cy + 0.45, 0.3, 0.75, B, B);
        box(c, P, cx - 0.42, cy - 0.3, cx + 0.42, cy + 0.3, 0.75, 1.55, B, B);
        box(c, P, cx - 0.25, cy - 0.22, cx + 0.25, cy + 0.22, 1.55, 2.05, B, B);
        dot(c, P(cx, cy, 2.12), 4, B);
      });
      break;
    case 'windmill':
      raise(3.2);
      put(key, (c, P) => {
        box(c, P, cx - 0.25, cy - 0.25, cx + 0.25, cy + 0.25, 0, 2.0, '#fff');
        roof(c, P, cx - 0.25, cy - 0.25, cx + 0.25, cy + 0.25, 2.0, 2.35, RED, 0.05);
        const hub = [cx, cy - 0.3, 1.9];
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          const tip = P(hub[0] + Math.cos(a) * 1.0, hub[1], hub[2] + Math.sin(a) * 1.0);
          const mid = P(hub[0] + Math.cos(a + 0.25) * 0.9, hub[1], hub[2] + Math.sin(a + 0.25) * 0.9);
          quad(c, [P(...hub), tip, mid], '#fff', INK, 1.2);
        }
        dot(c, P(...hub), 3, INK);
      });
      break;
    case 'rock':
      raise(1.2);
      put(key, (c, P) => {
        box(c, P, x0 + 0.1, y0 + 0.15, x1 - 0.12, y1 - 0.1, 0, 0.55, STONE, '#cfcbc1');
        box(c, P, x0 + 0.22, y0 + 0.28, x1 - 0.25, y1 - 0.22, 0.55, 0.95, STONE, '#cfcbc1');
      });
      break;
    case 'store':
      raise(1.4);
      put(x1 + y1 - 0.2, (c, P) => {
        if (long) { box(c, P, x0 + 0.1, y1 - 0.25, x1 - 0.1, y1 - 0.1, 0, 0.75, '#fff'); for (const [z, col] of [[0.98, '#4f9a62'], [1.08, '#f2c230'], [1.18, '#5aa7c4']]) line(c, P(x0, y1, z), P(x1, y1, z), col, 4); }
        else { box(c, P, x1 - 0.25, y0 + 0.1, x1 - 0.1, y1 - 0.1, 0, 0.75, '#fff'); for (const [z, col] of [[0.98, '#4f9a62'], [1.08, '#f2c230'], [1.18, '#5aa7c4']]) line(c, P(x1, y0, z), P(x1, y1, z), col, 4); }
      });
      put(key - 0.2, (c, P) => box(c, P, cx - 0.35, cy - 0.15, cx + 0.35, cy + 0.15, 0, 0.45, '#fff'));
      break;
    case 'hole':
      put(key - 0.4, (c, P) => { ell(c, P, cx, cy, 0.01, 0.38, 0.38, '#000', '#555', 2); });
      break;
    case 'lanes':
      put(key - 0.5, (c, P) => {
        for (let i = 1; i < 3; i++) {
          if (long) line(c, P(x0 + 0.1, y0 + i / 3, 0.01), P(x1 - 0.1, y0 + i / 3, 0.01), '#b98a55', 2);
          else line(c, P(x0 + i / 3, y0 + 0.1, 0.01), P(x0 + i / 3, y1 - 0.1, 0.01), '#b98a55', 2);
        }
      });
      for (let i = 0; i < 3; i++) {
        const gx = long ? x1 - 0.35 : x0 + (i + 0.5) / 3, gy = long ? y0 + (i + 0.5) / 3 : y1 - 0.35;
        put(gx + gy, (c, P) => { for (const d of [-0.07, 0, 0.07]) box(c, P, gx + d - 0.025, gy - 0.025, gx + d + 0.025, gy + 0.025, 0, 0.2, '#fff', '#fff', 1); });
      }
      put(x0 + y0 + 0.6, (c, P) => dot(c, P(long ? x0 + 0.5 : x0 + 0.5, long ? y0 + 0.5 : y0 + 0.5, 0.1), 5, RED));
      break;
    case 'jail':
      raise(1.4);
      put(key, (c, P) => {
        for (let i = 0; i <= 5; i++) {
          const u = i / 5;
          line(c, P(x0 + u, y0, 0), P(x0 + u, y0, 1.1), '#7a776f', 2.2);
          line(c, P(x1, y0 + u, 0), P(x1, y0 + u, 1.1), '#7a776f', 2.2);
          line(c, P(x0 + u, y1, 0), P(x0 + u, y1, 1.1), '#a9a59b', 1.2);
          line(c, P(x0, y0 + u, 0), P(x0, y0 + u, 1.1), '#a9a59b', 1.2);
        }
        box(c, P, x0, y0, x1, y1, 1.1, 1.18, '#8d8a82', '#8d8a82');
      });
      break;
    case 'kamidana': {
      // a big shrine shelf high on the back wall: shelf, miniature shrine with a roof, mirror,
      // a thick shimenawa rope with white shide, and sakaki in vases at both ends.
      // (a, b): a along the room's long side, b out from the back wall.
      const L = long ? r.w : r.h;
      const W = (a, b) => (long ? [x0 + a, y1 - b] : [x1 - b, y0 + a]);
      const B = (c, P, a0, a1, b0, b1, z0, z1, f, t = f, lw) => {
        const [p, q] = W(a0, b0), [u, v] = W(a1, b1);
        box(c, P, Math.min(p, u), Math.min(q, v), Math.max(p, u), Math.max(q, v), z0, z1, f, t, lw);
      };
      const Q = (P, a, b, z) => P(...W(a, b), z);
      raise(1.95);
      put(key + 0.6, (c, P, s) => {
        B(c, P, 0.12, L - 0.12, 0.04, 0.5, 1.0, 1.08, WOOD, '#d8b27a');
        for (const a of [0.3, L - 0.3]) B(c, P, a - 0.04, a + 0.04, 0.04, 0.35, 0.8, 1.0, '#8a6a45');
        const m = L / 2;
        B(c, P, m - 0.42, m + 0.42, 0.06, 0.4, 1.08, 1.14, '#e8d9b5');
        B(c, P, m - 0.3, m + 0.3, 0.08, 0.36, 1.14, 1.5, '#d9b98a', '#d9b98a');
        const [ra, rb] = W(m - 0.36, 0.04), [rc, rd] = W(m + 0.36, 0.42);
        roof(c, P, Math.min(ra, rc), Math.min(rb, rd), Math.max(ra, rc), Math.max(rb, rd), 1.5, 1.82, '#5b4630', 0.06);
        dot(c, Q(P, m, 0.37, 1.3), Math.max(3, s * 0.07), GOLD);
        for (const a of [0.28, L - 0.28]) {
          B(c, P, a - 0.06, a + 0.06, 0.18, 0.3, 1.08, 1.24, '#fff');
          line(c, Q(P, a, 0.24, 1.24), Q(P, a, 0.24, 1.42), '#3f7a3a', 2);
          for (const [da, dz] of [[0, 0.3], [-0.08, 0.22], [0.08, 0.22], [-0.04, 0.36], [0.05, 0.34]]) dot(c, Q(P, a + da, 0.24, 1.2 + dz), Math.max(3, s * 0.06), '#3f7a3a');
        }
        // shimenawa: a thick sagging rope along the front edge of the shelf, with shide hanging
        const N = 10, pts = [];
        for (let i = 0; i <= N; i++) { const a = 0.15 + (i / N) * (L - 0.3); pts.push(Q(P, a, 0.52, 1.02 - 0.08 * Math.sin((i / N) * Math.PI))); }
        c.strokeStyle = '#8a6a2e'; c.lineWidth = Math.max(5, s * 0.1); c.lineCap = 'round';
        c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
        c.strokeStyle = '#e0c878'; c.lineWidth = Math.max(3, s * 0.06);
        c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
        c.lineCap = 'butt';
        for (const u of [0.25, 0.45, 0.55, 0.75]) {
          const a = 0.15 + u * (L - 0.3), z = 1.02 - 0.08 * Math.sin(u * Math.PI);
          const zz = [z, z - 0.1, z - 0.16, z - 0.26, z - 0.32, z - 0.42];
          const pp = zz.map((q, k) => Q(P, a + (k % 2 ? 0.07 : -0.03), 0.53, q));
          const path = () => { c.beginPath(); pp.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); };
          c.lineJoin = 'miter';
          path(); c.strokeStyle = '#6b635c'; c.lineWidth = Math.max(5, s * 0.1); c.stroke();
          path(); c.strokeStyle = '#fff'; c.lineWidth = Math.max(3, s * 0.065); c.stroke();
          c.lineJoin = 'round';
        }
      });
      break;
    }
    case 'cave':
      raise(1.6);
      put(key, (c, P) => {
        for (const [dx, dy, wd, ht] of [[0.15, 0.1, 0.7, 1.0], [0.05, 0.6, 0.35, 0.6], [0.6, 0.6, 0.35, 0.7]]) box(c, P, x0 + dx, y0 + dy, x0 + dx + wd, y0 + dy + ht, 0, 1.1, '#6b635c', '#575049');
        ell(c, P, cx, cy + 0.15, 0, 0.34, 0.26, '#000', '#222', 2);
        for (const [ux, uy] of [[0.25, 0.3], [0.45, 0.22], [0.65, 0.3], [0.55, 0.75], [0.35, 0.85]]) {
          const ix = x0 + ux, iy = y0 + uy;
          quad(c, [P(ix - 0.05, iy, 1.1), P(ix + 0.05, iy, 1.1), P(ix, iy + 0.18, 0.7)], '#8d8a82', INK, 1);
        }
      });
      break;
    case 'crossing':
      raise(1.4);
      put(key, (c, P) => {
        if (long) {
          for (const v of [0.32, 0.68]) line(c, P(x0, y0 + v, 0.02), P(x1, y0 + v, 0.02), '#8d8a82', 2);
          for (let i = 0; i <= 8; i++) { const u = x0 + (i / 8) * r.w; line(c, P(u, y0 + 0.2, 0.01), P(u, y0 + 0.8, 0.01), '#6b635c', 2); }
          for (const gx of [x0 + 0.1, x1 - 0.1]) {
            box(c, P, gx - 0.07, y0 + 0.2, gx + 0.07, y0 + 0.8, 0, 0.9, '#e3e0d8', '#e3e0d8');
            dot(c, P(gx, y0 + 0.2, 0.95), 3, RED);
          }
          const by = y0 + 0.5;
          for (let i = 0; i < 8; i++) { const u = x0 + 0.1 + (i / 8) * (r.w - 0.2); box(c, P, u, by - 0.04, u + (r.w - 0.2) / 8, by + 0.04, 0.8, 0.86, i % 2 ? '#f2c230' : '#2b2b2e', i % 2 ? '#f2c230' : '#2b2b2e'); }
        } else {
          for (const v of [0.32, 0.68]) line(c, P(x0 + v, y0, 0.02), P(x0 + v, y1, 0.02), '#8d8a82', 2);
          for (let i = 0; i <= 8; i++) { const u = y0 + (i / 8) * r.h; line(c, P(x0 + 0.2, u, 0.01), P(x0 + 0.8, u, 0.01), '#6b635c', 2); }
          for (const gy of [y0 + 0.1, y1 - 0.1]) {
            box(c, P, x0 + 0.2, gy - 0.07, x0 + 0.8, gy + 0.07, 0, 0.9, '#e3e0d8', '#e3e0d8');
            dot(c, P(x0 + 0.2, gy, 0.95), 3, RED);
          }
          const bx = x0 + 0.5;
          for (let i = 0; i < 8; i++) { const u = y0 + 0.1 + (i / 8) * (r.h - 0.2); box(c, P, bx - 0.04, u, bx + 0.04, u + (r.h - 0.2) / 8, 0.8, 0.86, i % 2 ? '#f2c230' : '#2b2b2e', i % 2 ? '#f2c230' : '#2b2b2e'); }
        }
      });
      break;
    case 'ballot': {
      // a polling station: three booths with dividers on the back wall, a big white ballot box with a
      // slot and a red 投票 label in front, and an election poster board on the side.
      const L = long ? r.w : r.h, D = long ? r.h : r.w;
      const W = (a, b) => (long ? [x0 + a, y1 - b] : [x1 - b, y0 + a]);
      const B = (c, P, a0, a1, b0, b1, z0, z1, f, t = f, lw) => {
        const [p, q] = W(a0, b0), [u, v] = W(a1, b1);
        box(c, P, Math.min(p, u), Math.min(q, v), Math.max(p, u), Math.max(q, v), z0, z1, f, t, lw);
      };
      const Q = (P, a, b, z) => P(...W(a, b), z);
      raise(1.4);
      put(key + 1, (c, P) => {
        const n = 3, bw = (L - 0.3) / n;
        for (let i = 0; i < n; i++) {
          const a = 0.15 + i * bw;
          B(c, P, a, a + bw, 0.05, 0.1, 0, 0.95, '#fff');
          B(c, P, a + 0.05, a + bw - 0.05, 0.1, 0.42, 0.62, 0.67, '#e3e0d8', '#fff');
        }
        for (let i = 0; i <= n; i++) { const a = 0.15 + i * bw; B(c, P, a - 0.025, a + 0.025, 0.05, 0.55, 0, 0.95, '#fff', '#f2f0ea'); }
        for (let i = 0; i < n; i++) line(c, Q(P, 0.15 + (i + 0.5) * bw - 0.12, 0.07, 1.1), Q(P, 0.15 + (i + 0.5) * bw + 0.12, 0.07, 1.1), '#5aa7c4', 3);
      });
      // poster board (選挙ポスター掲示板) near the road on one side
      put(key - 0.2, (c, P) => {
        const a0 = L - 0.8, a1 = L - 0.12, b = D - 0.25;
        for (const a of [a0 + 0.06, a1 - 0.06]) B(c, P, a - 0.03, a + 0.03, b - 0.03, b + 0.03, 0, 0.45, '#8d8a82');
        const cols = ['#d23a2c', '#5aa7c4', '#f2c230', '#4f9a62', '#e07b39', '#9a7ec8'];
        quad(c, [Q(P, a0, b, 0.45), Q(P, a1, b, 0.45), Q(P, a1, b, 1.05), Q(P, a0, b, 1.05)], '#fff', INK, 1.2);
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
          const u0 = a0 + 0.05 + i * (a1 - a0 - 0.1) / 3, u1 = u0 + (a1 - a0 - 0.1) / 3 - 0.04, z0 = 0.5 + j * 0.27;
          quad(c, [Q(P, u0, b, z0), Q(P, u1, b, z0), Q(P, u1, b, z0 + 0.23), Q(P, u0, b, z0 + 0.23)], cols[i + j * 3], INK, 0.8);
        }
      });
      // the ballot box
      put(key - 0.4, (c, P, s) => {
        const a0 = 0.25, a1 = 1.0, b0 = D - 0.75, b1 = D - 0.2;
        B(c, P, a0, a1, b0, b1, 0, 0.12, '#8d8a82');
        B(c, P, a0 + 0.03, a1 - 0.03, b0 + 0.03, b1 - 0.03, 0.12, 0.85, '#fff', '#f4f4f2');
        line(c, Q(P, a0 + 0.2, (b0 + b1) / 2, 0.86), Q(P, a1 - 0.2, (b0 + b1) / 2, 0.86), INK, Math.max(3, s * 0.06));
        // red label on the side facing the road
        const fb = b1 - 0.03, la0 = a0 + 0.12, la1 = a1 - 0.12;
        quad(c, [Q(P, la0, fb, 0.32), Q(P, la1, fb, 0.32), Q(P, la1, fb, 0.66), Q(P, la0, fb, 0.66)], RED, RED, 1);
        const [tx, ty] = Q(P, (la0 + la1) / 2, fb, 0.49);
        c.fillStyle = '#fff'; c.font = `bold ${Math.max(8, Math.round(s * 0.2))}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(UI.vote, tx, ty);
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      });
      break;
    }
    case 'court':
      raise(2.2);
      put(key + 0.5, (c, P) => {
        box(c, P, x0 + 0.3, y1 - 0.6, x1 - 0.3, y1 - 0.1, 0, 1.0, WOOD, '#8a6a45');
        box(c, P, x0 + 0.36, y1 - 0.68, x1 - 0.36, y1 - 0.05, 1.0, 1.26, '#8a6a45', '#8a6a45');
        box(c, P, cx - 0.14, y1 - 0.4, cx + 0.14, y1 - 0.28, 1.26, 1.34, '#6b5a3c', '#6b5a3c');
        box(c, P, cx + 0.2, y1 - 0.45, cx + 0.45, y1 - 0.35, 1.26, 1.36, '#4a3a22', '#4a3a22', 1);
        line(c, P(cx + 0.32, y1 - 0.4, 1.36), P(cx + 0.32, y1 - 0.15, 1.36), '#4a3a22', 2);
        dot(c, P(cx, y1 - 0.6, 0.65), 6, GOLD);
        box(c, P, x0 + 0.15, cy - 0.4, x0 + 0.6, cy + 0.4, 0, 0.5, WOOD, '#8a6a45');
        box(c, P, x1 - 0.6, cy - 0.4, x1 - 0.15, cy + 0.4, 0, 0.5, WOOD, '#8a6a45');
        for (let j = 0; j < 2; j++) { const by = y0 + 0.2 + j * 0.34; box(c, P, x0 + 0.2, by, x1 - 0.2, by + 0.18, 0, 0.3, '#9d6b4a', '#9d6b4a'); }
      });
      break;
    case 'base':
      raise(1.1);
      put(key, (c, P) => {
        box(c, P, x0 + 0.18, y0 + 0.18, x1 - 0.18, y1 - 0.18, 0, 0.55, '#c9a06a', '#a88452');
        line(c, P(x0 + 0.18, y0 + 0.18, 0.55), P(x1 - 0.18, y1 - 0.18, 0.55), '#8a6a45', 1);
        quad(c, [P(cx - 0.13, y0 + 0.18, 0), P(cx + 0.13, y0 + 0.18, 0), P(cx + 0.13, y0 + 0.18, 0.32), P(cx - 0.13, y0 + 0.18, 0.32)], '#2b2b2e', INK, 1);
        line(c, P(cx + 0.1, cy + 0.1, 0.55), P(cx + 0.1, cy + 0.1, 1.45), INK, 2);
        quad(c, [P(cx + 0.1, cy + 0.1, 1.45), P(cx + 0.55, cy + 0.1, 1.3), P(cx + 0.1, cy + 0.1, 1.12)], RED, INK, 1.2);
      });
      break;
    case 'rocket':
      // kept to about the height of the windmill/ferris wheel (3.3) so the flyer doesn't zoom out:
      // a stubby rocket on four legs next to a lattice gantry.
      raise(3.3);
      put(key + 0.5, (c, P) => {
        const gx0 = x1 - 0.55, gy0 = y1 - 0.55, gx1 = x1 - 0.2, gy1 = y1 - 0.2, GZ = 2.6;
        for (const [a, b] of [[gx0, gy0], [gx1, gy0], [gx0, gy1], [gx1, gy1]]) line(c, P(a, b, 0), P(a, b, GZ), '#6b635c', 2);
        for (let z = 0; z < GZ; z += 0.4) {
          line(c, P(gx0, gy0, z), P(gx1, gy0, z + 0.4), '#6b635c', 1); line(c, P(gx0, gy0, z), P(gx0, gy1, z + 0.4), '#6b635c', 1);
          line(c, P(gx0, gy0, z), P(gx1, gy0, z), '#6b635c', 1); line(c, P(gx0, gy0, z), P(gx0, gy1, z), '#6b635c', 1);
        }
        line(c, P(gx0, gy0, 1.9), P(cx + 0.1, cy + 0.1, 1.9), '#6b635c', 2.5);
        for (const [dx, dy] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) line(c, P(cx + dx, cy + dy, 0), P(cx + dx * 0.6, cy + dy * 0.6, 0.5), '#8d8a82', 2.5);
        box(c, P, cx - 0.24, cy - 0.24, cx + 0.24, cy + 0.24, 0.45, 2.45, '#fff', '#fff');
        box(c, P, cx - 0.245, cy - 0.245, cx + 0.245, cy + 0.245, 1.55, 1.7, RED, RED, 1);
        dot(c, P(cx - 0.24, cy, 2.0), 3.5, '#5aa7c4');
        quad(c, [P(cx - 0.24, cy - 0.24, 2.45), P(cx + 0.24, cy - 0.24, 2.45), P(cx, cy, 3.1)], RED, INK, 1);
        quad(c, [P(cx - 0.24, cy - 0.24, 2.45), P(cx - 0.24, cy + 0.24, 2.45), P(cx, cy, 3.1)], '#b8322a', INK, 1);
        for (const sgn of [-1, 1]) {
          quad(c, [P(cx + sgn * 0.24, cy - 0.24, 0.45), P(cx + sgn * 0.45, cy - 0.24, 0.3), P(cx + sgn * 0.24, cy - 0.24, 1.05)], RED, INK, 1);
          quad(c, [P(cx - 0.24, cy + sgn * 0.24, 0.45), P(cx - 0.24, cy + sgn * 0.45, 0.3), P(cx - 0.24, cy + sgn * 0.24, 1.05)], RED, INK, 1);
        }
        for (const [dx, dz] of [[0, 0.3], [-0.1, 0.18], [0.1, 0.18]]) dot(c, P(cx + dx, cy - 0.1, dz), 4, '#f2c230');
      });
      break;
    case 'somen':
      raise(1.2);
      put(key, (c, P) => {
        const ax = long ? x0 + 0.08 : cx - 0.13, ay = long ? cy - 0.13 : y0 + 0.08;
        const bx = long ? x1 - 0.08 : cx + 0.13, by = long ? cy + 0.13 : y1 - 0.08;
        for (const u of [0.22, 0.5, 0.78]) {
          const sx = long ? x0 + u * r.w : cx, sy = long ? cy : y0 + u * r.h;
          box(c, P, sx - 0.06, sy - 0.06, sx + 0.06, sy + 0.06, 0, 0.42, '#9d6b4a', '#9d6b4a');
        }
        quad(c, [P(ax, ay, 0.42), P(bx, by, 0.36), P(bx, by, 0.5), P(ax, ay, 0.56)], '#4f8a3a', INK, 1.2);
        quad(c, [P(ax, ay, 0.52), P(bx, by, 0.46), P(bx, by, 0.54), P(ax, ay, 0.6)], '#a9d6e6', null);
        for (let i = 0; i < 6; i++) {
          const u = 0.14 + (i / 5) * 0.72;
          const nx = long ? x0 + u * r.w : cx, ny = long ? cy : y0 + u * r.h;
          dot(c, P(nx, ny, 0.56), 2, '#fff');
        }
      });
      break;
    case 'greatwall':
      raise(1.7);
      put(key, (c, P) => {
        const wx0 = long ? x0 + 0.1 : cx - 0.22, wy0 = long ? cy - 0.22 : y0 + 0.1;
        const wx1 = long ? x1 - 0.1 : cx + 0.22, wy1 = long ? cy + 0.22 : y1 - 0.1;
        box(c, P, wx0, wy0, wx1, wy1, 0, 0.7, STONE, '#cfcbc1');
        const n = Math.max(2, Math.round(long ? r.w : r.h));
        for (let i = 0; i < n; i++) {
          const u0 = i / n, u1 = (i + 0.6) / n;
          if (long) box(c, P, wx0 + u0 * (wx1 - wx0), wy0, wx0 + u1 * (wx1 - wx0), wy1, 0.7, 0.94, STONE, STONE);
          else box(c, P, wx0, wy0 + u0 * (wy1 - wy0), wx1, wy0 + u1 * (wy1 - wy0), 0.7, 0.94, STONE, STONE);
        }
        const tx = long ? x0 + 0.28 : cx, ty = long ? cy : y0 + 0.28;
        box(c, P, tx - 0.2, ty - 0.2, tx + 0.2, ty + 0.2, 0, 1.1, STONE, '#cfcbc1');
        box(c, P, tx - 0.2, ty - 0.2, tx + 0.2, ty + 0.2, 1.1, 1.26, '#cfcbc1', '#cfcbc1');
      });
      break;
    // --- added 2026-10-22 ---
    case 'busstop':
      raise(1.6);
      put(key, (c, P, s) => {
        box(c, P, x0 + 0.5, y0 + 0.2, x1 - 0.12, y0 + 0.4, 0, 0.22, WOOD, '#d8b27a');
        box(c, P, x0 + 0.2, y0 + 0.4, x0 + 0.3, y0 + 0.5, 0, 0.1, '#8d8a82');
        line(c, P(x0 + 0.25, y0 + 0.45, 0.1), P(x0 + 0.25, y0 + 0.45, 1.25), INK, 2);
        ell(c, P, x0 + 0.25, y0 + 0.45, 1.3, 0.001, 0.2, '#fff', INK, 1.2, 20);
        const [tx, ty] = P(x0 + 0.25, y0 + 0.45, 1.3);
        dot(c, [tx, ty], Math.max(4, s * 0.12), '#fff');
        dot(c, [tx, ty], Math.max(2.5, s * 0.08), '#5aa7c4');
        quad(c, [P(x0 + 0.25, y0 + 0.37, 0.55), P(x0 + 0.25, y0 + 0.53, 0.55), P(x0 + 0.25, y0 + 0.53, 0.85), P(x0 + 0.25, y0 + 0.37, 0.85)], '#fff', INK, 1);
      });
      break;
    case 'moai':
      raise(1.9);
      put(key, (c, P) => {
        const M = '#8d8a82', T = '#a9a59b';
        box(c, P, x0 + 0.2, y0 + 0.25, x1 - 0.2, y1 - 0.2, 0, 0.25, M, T);
        box(c, P, x0 + 0.28, y0 + 0.3, x1 - 0.28, y1 - 0.3, 0.25, 1.65, M, T);
        box(c, P, x0 + 0.24, y0 + 0.26, x1 - 0.24, y0 + 0.36, 1.18, 1.3, M, T);
        box(c, P, cx - 0.07, y0 + 0.18, cx + 0.07, y0 + 0.3, 0.75, 1.15, M, T, 1);
        for (const d of [-0.16, 0.16]) quad(c, [P(cx + d - 0.06, y0 + 0.3, 1.05), P(cx + d + 0.06, y0 + 0.3, 1.05), P(cx + d + 0.06, y0 + 0.3, 1.14), P(cx + d - 0.06, y0 + 0.3, 1.14)], INK, INK, 1);
        line(c, P(cx - 0.14, y0 + 0.3, 0.6), P(cx + 0.14, y0 + 0.3, 0.6), INK, 2);
      });
      break;
    case 'kamakura':
      raise(1.2);
      put(key, (c, P) => {
        ell(c, P, cx, cy, 0.01, 0.48, 0.48, '#fff', '#a9a59b', 1);
        dome(c, P, cx, cy, 0, 0.42, 0.42, 1.0, '#e6eef4');
        ell(c, P, cx - 0.1, y0 + 0.11, 0.18, 0.15, 0.001, '#2b2b2e', INK, 1, 16);
        quad(c, [P(cx - 0.25, y0 + 0.1, 0), P(cx + 0.05, y0 + 0.1, 0), P(cx + 0.05, y0 + 0.1, 0.3), P(cx - 0.25, y0 + 0.1, 0.3)], '#2b2b2e', INK, 1);
        dot(c, P(cx - 0.1, y0 + 0.1, 0.12), 3, '#f2a23a');
      });
      break;
    case 'dome':
      // a planetarium: round walls, a grey dome with stars, a projector inside the door
      raise(2.4);
      put(key, (c, P, s) => {
        box(c, P, x0 + 0.15, y0 + 0.15, x1 - 0.15, y1 - 0.15, 0, 0.85, '#fff');
        dome(c, P, cx, cy, 0.85, r.w * 0.42, r.h * 0.42, 1.2, '#8d93a8');
        for (const [a, t] of [[3.6, 0.4], [4.2, 0.9], [4.9, 0.55], [3.9, 1.2], [5.3, 1.0], [4.5, 0.25]]) {
          const rr = Math.cos(t * 0.9);
          dot(c, P(cx + r.w * 0.42 * rr * Math.cos(a), cy + r.h * 0.42 * rr * Math.sin(a), 0.85 + 1.2 * Math.sin(t * 0.9)), Math.max(2, s * 0.05), '#f5d76a');
        }
        quad(c, [P(cx - 0.25, y0 + 0.15, 0), P(cx + 0.25, y0 + 0.15, 0), P(cx + 0.25, y0 + 0.15, 0.6), P(cx - 0.25, y0 + 0.15, 0.6)], '#2f3448', INK, 1);
      });
      break;
    case 'karaoke':
      raise(1.5);
      put(key + 0.3, (c, P, s) => {
        quad(c, [P(x0 + 0.15, y1 - 0.08, 0.4), P(x1 - 0.15, y1 - 0.08, 0.4), P(x1 - 0.15, y1 - 0.08, 0.9), P(x0 + 0.15, y1 - 0.08, 0.9)], '#2b2b2e', INK, 1.2);
        for (let i = 0; i < 4; i++) line(c, P(x0 + 0.25 + i * 0.13, y1 - 0.09, 0.48), P(x0 + 0.25 + i * 0.13, y1 - 0.09, 0.55 + 0.08 * ((i * 7) % 4)), ['#d23a2c', '#f2c230', '#5aa7c4', '#4f9a62'][i], 3);
        dot(c, P(cx, cy, 1.25), Math.max(4, s * 0.1), '#e3e0d8');
        line(c, P(cx, cy, 1.33), P(cx, cy, 1.5), INK, 1);
      });
      put(key - 0.2, (c, P) => {
        box(c, P, x0 + 0.12, y0 + 0.12, x1 - 0.12, y0 + 0.35, 0, 0.25, '#9a7ec8', '#b9a3df');
        line(c, P(x1 - 0.3, cy, 0), P(x1 - 0.3, cy, 0.7), INK, 1.5);
        dot(c, P(x1 - 0.3, cy, 0.72), 3.5, INK);
      });
      break;
    case 'dojo':
      raise(1.5);
      put(key + 0.5, (c, P) => {
        // kamiza: a shelf on the back wall, a scroll, a drum
        box(c, P, x0 + 0.5, y1 - 0.3, x1 - 0.5, y1 - 0.08, 0, 0.3, WOOD, '#d8b27a');
        quad(c, [P(cx - 0.18, y1 - 0.08, 0.4), P(cx + 0.18, y1 - 0.08, 0.4), P(cx + 0.18, y1 - 0.08, 0.92), P(cx - 0.18, y1 - 0.08, 0.92)], '#fff', INK, 1);
        line(c, P(cx, y1 - 0.09, 0.5), P(cx, y1 - 0.09, 0.82), INK, 2.5);
        box(c, P, x0 + 0.12, y1 - 0.55, x0 + 0.45, y1 - 0.15, 0, 0.42, '#9d6b4a', '#e8d9b5');
      });
      put(key - 0.3, (c, P) => {
        // a rack of wooden swords on the side wall
        box(c, P, x1 - 0.12, y0 + 0.3, x1 - 0.06, y0 + 1.3, 0.3, 0.36, '#8a6a45');
        for (let i = 0; i < 4; i++) line(c, P(x1 - 0.1, y0 + 0.45 + i * 0.25, 0.05), P(x1 - 0.1, y0 + 0.45 + i * 0.25, 0.85), '#b98a55', 2.5);
      });
      break;
    case 'merry':
      raise(2.4);
      put(key, (c, P, s) => {
        const R = Math.min(r.w, r.h) * 0.44;
        ell(c, P, cx, cy, 0, R, R, '#e3e0d8');
        ell(c, P, cx, cy, 0.14, R, R, '#fff');
        line(c, P(cx, cy, 0.14), P(cx, cy, 1.55), GOLD, 3);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 0.5, hx = cx + R * 0.72 * Math.cos(a), hy = cy + R * 0.72 * Math.sin(a), hz = 0.45 + 0.12 * (i % 2);
          line(c, P(hx, hy, 0.14), P(hx, hy, 1.5), GOLD, 1.5);
          box(c, P, hx - 0.14, hy - 0.06, hx + 0.14, hy + 0.06, hz, hz + 0.14, i % 2 ? '#fff' : '#f2c6c0', i % 2 ? '#fff' : '#f2c6c0', 1);
          box(c, P, hx + 0.08, hy - 0.04, hx + 0.16, hy + 0.04, hz + 0.14, hz + 0.3, i % 2 ? '#fff' : '#f2c6c0', i % 2 ? '#fff' : '#f2c6c0', 1);
        }
        cone(c, P, cx, cy, 1.5, R + 0.05, 2.15, RED);
        const pts = [];
        for (let j = 0; j < 12; j++) { const a = (j / 12) * Math.PI * 2; pts.push(P(cx + (R + 0.05) * Math.cos(a), cy + (R + 0.05) * Math.sin(a), 1.5)); }
        pts.forEach((q, j) => { if (j % 2) dot(c, q, Math.max(2, s * 0.05), '#fff'); });
        dot(c, P(cx, cy, 2.2), 3.5, GOLD);
      });
      break;
    case 'coaster':
      raise(2.4);
      put(key, (c, P) => {
        const L = long ? r.w : r.h, at = (u, z, d = 0) => (long ? P(x0 + u, cy + d, z) : P(cx + d, y0 + u, z));
        const zf = (u) => 0.35 + 1.55 * Math.max(0, Math.sin((u / L) * Math.PI * 1.5 + 0.2)) ** 1.4;
        for (let u = 0.25; u < L; u += 0.5) for (const d of [-0.12, 0.12]) line(c, at(u, 0, d), at(u, zf(u), d), '#6b635c', 2);
        for (let u = 0.2; u < L - 0.1; u += 0.2) line(c, at(u, zf(u), -0.14), at(u, zf(u), 0.14), '#6b635c', 1.2);
        for (const d of [-0.12, 0.12]) {
          c.strokeStyle = RED; c.lineWidth = 3.5; c.beginPath();
          for (let i = 0; i <= 40; i++) { const u = 0.1 + (i / 40) * (L - 0.2); const [px, py] = at(u, zf(u), d); i ? c.lineTo(px, py) : c.moveTo(px, py); }
          c.stroke();
        }
        const u = L * 0.62, z = zf(u);
        box(c, P, ...(long ? [x0 + u - 0.22, cy - 0.15, x0 + u + 0.22, cy + 0.15] : [cx - 0.15, y0 + u - 0.22, cx + 0.15, y0 + u + 0.22]), z, z + 0.2, '#f2c230', '#f2c230', 1);
      });
      break;
    case 'aquarium':
      raise(1.6);
      put(key + 0.4, (c, P, s) => {
        const [a0, b0, a1, b1] = long ? [x0 + 0.12, y1 - 0.75, x1 - 0.12, y1 - 0.1] : [x1 - 0.75, y0 + 0.12, x1 - 0.1, y1 - 0.12];
        box(c, P, a0, b0, a1, b1, 0, 1.25, 'rgba(90,167,196,0.45)', 'rgba(169,214,230,0.85)');
        for (const [u, v, z, col] of [[0.25, 0.4, 0.4, '#e07b39'], [0.6, 0.5, 0.8, '#f2c230'], [0.8, 0.3, 0.55, '#e07b39'], [0.4, 0.6, 1.0, '#d23a2c']]) {
          const fx = a0 + u * (a1 - a0), fy = b0 + v * (b1 - b0);
          dot(c, P(fx, fy, z), Math.max(3, s * 0.07), col);
          dot(c, P(fx + 0.1, fy, z), Math.max(2, s * 0.045), col);
        }
        for (let i = 0; i < 3; i++) line(c, P(a0 + 0.2 + i * 0.4, b0 + 0.1, 0), P(a0 + 0.2 + i * 0.4, b0 + 0.1, 0.5 + 0.2 * i), '#4f8a3a', 2);
      });
      put(key - 0.4, (c, P) => box(c, P, x0 + 0.3, y0 + 0.25, x0 + 1.2, y0 + 0.45, 0, 0.2, '#fff'));
      break;
    case 'escalator':
      raise(1.6);
      put(key, (c, P) => {
        const L = long ? r.w : r.h, at = (u, z, d) => (long ? P(x0 + u, cy + d, z) : P(cx + d, y0 + u, z));
        const zf = (u) => Math.min(1.1, Math.max(0, (u - 0.25) / (L - 0.5)) * 1.1);
        quad(c, [at(0.1, 0, -0.32), at(L - 0.1, 1.1, -0.32), at(L - 0.1, 1.1, 0.32), at(0.1, 0, 0.32)], '#c9c6bd', INK, 1.2);
        for (let i = 1; i < 10; i++) { const u = 0.1 + (i / 10) * (L - 0.2); line(c, at(u, zf(u) + 0.01, -0.3), at(u, zf(u) + 0.01, 0.3), '#8d8a82', 1); }
        for (const d of [-0.36, 0.36]) {
          quad(c, [at(0.1, 0, d), at(L - 0.1, 1.1, d), at(L - 0.1, 1.45, d), at(0.1, 0.35, d)], '#e3e0d8', INK, 1);
          line(c, at(0.1, 0.35, d), at(L - 0.1, 1.45, d), INK, 3);
        }
      });
      break;
    case 'ufo':
      raise(2.6);
      put(key - 0.6, (c, P) => {
        ell(c, P, cx, cy, 0.01, r.w * 0.4, r.h * 0.4, null, '#f2c230', 3);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; dot(c, P(cx + r.w * 0.4 * Math.cos(a), cy + r.h * 0.4 * Math.sin(a), 0.01), 3, '#f2c230'); }
      });
      put(key + 0.2, (c, P, s) => {
        const z = 1.55;
        const beam = [P(cx, cy, z)];
        for (let j = 0; j < 16; j++) { const a = (j / 16) * Math.PI * 2; beam.push(P(cx + 0.55 * Math.cos(a), cy + 0.55 * Math.sin(a), 0.02)); }
        hull(c, beam, 'rgba(245,215,106,0.35)', null);
        dome(c, P, cx, cy, z, 0.85, 0.85, 0.16, '#b9b5ab', true);
        dome(c, P, cx, cy, z + 0.12, 0.34, 0.34, 0.32, 'rgba(169,214,230,0.95)');
        for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; dot(c, P(cx + 0.7 * Math.cos(a), cy + 0.7 * Math.sin(a), z), Math.max(2, s * 0.05), i % 2 ? RED : '#f2c230'); }
      });
      break;
    case 'ashiyu':
      raise(1.1);
      put(key, (c, P) => {
        box(c, P, x0 + 0.12, y0 + 0.12, x1 - 0.12, y1 - 0.12, 0, 0.28, WOOD, WATER);
        box(c, P, x0 + 0.12, y0 + 0.12, x1 - 0.12, y0 + 0.24, 0, 0.32, '#8a6a45', '#d8b27a', 1);
        for (const u of [0.3, 0.5, 0.7]) {
          c.strokeStyle = '#a9a59b'; c.lineWidth = 1.4; c.beginPath();
          for (let i = 0; i <= 8; i++) { const [px, py] = P(x0 + u + 0.05 * Math.sin(i * 1.3), cy, 0.35 + i * 0.07); i ? c.lineTo(px, py) : c.moveTo(px, py); }
          c.stroke();
        }
      });
      break;
    case 'bridge':
      raise(1.4);
      put(key + 0.6, (c, P) => {
        // the gorge below, dark and deep
        const [g0, h0, g1, h1] = long ? [x0 + 0.4, y0 + 0.08, x1 - 0.4, y1 - 0.08] : [x0 + 0.08, y0 + 0.4, x1 - 0.08, y1 - 0.4];
        quad(c, [P(g0, h0, 0.01), P(g1, h0, 0.01), P(g1, h1, 0.01), P(g0, h1, 0.01)], '#3a4a3a', null);
        line(c, long ? P((g0 + g1) / 2 - 0.4, cy, 0.01) : P(cx, (h0 + h1) / 2 - 0.4, 0.01), long ? P((g0 + g1) / 2 + 0.4, cy, 0.01) : P(cx, (h0 + h1) / 2 + 0.4, 0.01), '#5aa7c4', 2);
      });
      put(key, (c, P) => {
        const L = long ? r.w : r.h, at = (u, z, d) => (long ? P(x0 + u, cy + d, z) : P(cx + d, y0 + u, z));
        const sag = (u) => 0.45 - 0.18 * Math.sin((u / L) * Math.PI);
        for (let i = 0; i < 14; i++) { const u = 0.15 + ((i + 0.5) / 14) * (L - 0.3); quad(c, [at(u - 0.07, sag(u), -0.2), at(u + 0.07, sag(u), -0.2), at(u + 0.07, sag(u), 0.2), at(u - 0.07, sag(u), 0.2)], '#b98a55', '#6b4f2e', 1); }
        for (const d of [-0.22, 0.22]) {
          for (const u of [0.15, L - 0.15]) line(c, at(u, 0, d), at(u, 1.0, d), '#6b4f2e', 2.5);
          c.strokeStyle = '#8a6a45'; c.lineWidth = 1.5; c.beginPath();
          for (let i = 0; i <= 20; i++) { const u = 0.15 + (i / 20) * (L - 0.3); const [px, py] = at(u, sag(u) + 0.5 + 0.05 * Math.sin((u / L) * Math.PI), d); i ? c.lineTo(px, py) : c.moveTo(px, py); }
          c.stroke();
        }
      });
      break;
    case 'shop': {
      // 店舗付き住宅: what the shop sells inside, then a striped awning and a sign on the road side (south)
      const col = o.color, K = o.kind;
      raise(1.6);
      put(key + 0.3, (c, P, s) => {
        if (K === 'kissa') {
          box(c, P, x0 + 0.15, y1 - 0.35, x1 - 0.15, y1 - 0.1, 0, 0.45, WOOD, '#d8b27a');
          for (const u of [0.35, 0.75, 1.15]) if (x0 + u < x1 - 0.2) { dot(c, P(x0 + u, y1 - 0.22, 0.52), 3, '#fff'); dot(c, P(x0 + u, y1 - 0.22, 0.52), 1.6, '#6b4f2e'); }
          for (const u of long ? [0.5, 1.4] : [0.5]) {
            const tx = long ? x0 + u : cx, ty = long ? y0 + 0.45 : y0 + 0.4 + u * 0.5;
            line(c, P(tx, ty, 0), P(tx, ty, 0.35), INK, 1.5);
            ell(c, P, tx, ty, 0.35, 0.18, 0.18, '#fff');
            dot(c, P(tx, ty, 0.37), 2.5, '#6b4f2e');
          }
        } else if (K === 'dagashi') {
          const n = Math.round((long ? r.w : r.h) * 2);
          box(c, P, x0 + 0.1, y1 - 0.3, x1 - 0.1, y1 - 0.08, 0, 0.8, '#fff');
          for (let i = 0; i < n * 3; i++) dot(c, P(x0 + 0.2 + ((i % n) + 0.5) * ((r.w - 0.4) / n), y1 - 0.3, 0.2 + Math.floor(i / n) * 0.22), 3, ['#d23a2c', '#f2c230', '#5aa7c4', '#4f9a62', '#e07b39'][i % 5]);
          box(c, P, x0 + 0.3, y0 + 0.3, x0 + 0.75, y0 + 0.6, 0, 0.35, '#f2c230', '#fff');
          for (const u of [0.38, 0.52, 0.66]) dot(c, P(x0 + u, y0 + 0.45, 0.37), 2.5, ['#d23a2c', '#5aa7c4', '#4f9a62'][Math.round(u * 10) % 3]);
        } else if (K === 'nazo') {
          box(c, P, x0 + 0.22, y0 + 0.4, x1 - 0.22, y1 - 0.15, 0, 0.42, col, '#8a6fae');
          dot(c, P(cx, cy + 0.12, 0.6), Math.max(5, s * 0.14), 'rgba(169,214,230,0.9)');
          c.fillStyle = '#f5d76a'; c.font = `bold ${Math.max(9, Math.round(s * 0.3))}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
          const [qx, qy] = P(x0 + 0.22, cy + 0.1, 0.22); c.fillText('?', qx, qy);
          c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        } else if (K === 'yaoya') {
          const L = long ? r.w : r.h;
          for (let i = 0; i < Math.round(L * 1.5); i++) {
            const u = 0.15 + i * 0.6, w = 0.5;
            if (u + w > L - 0.1) break;
            const [a0, b0, a1, b1] = long ? [x0 + u, y0 + 0.2, x0 + u + w, y0 + 0.55] : [x0 + 0.2, y0 + u, x0 + 0.55, y0 + u + w];
            box(c, P, a0, b0, a1, b1, 0, 0.3, '#c99a63', '#c99a63', 1);
            const fc = ['#4f9a62', '#e07b39', '#d23a2c'][i % 3];
            for (const [p, q] of [[0.25, 0.3], [0.5, 0.6], [0.75, 0.35], [0.4, 0.75], [0.65, 0.8]]) dot(c, P(a0 + p * (a1 - a0), b0 + q * (b1 - b0), 0.33), Math.max(3, s * 0.07), fc);
          }
          box(c, P, x0 + 0.15, y1 - 0.3, x1 - 0.15, y1 - 0.1, 0, 0.55, '#c99a63', '#d8b27a');
        } else if (K === 'tokoya') {
          box(c, P, x0 + 0.3, y1 - 0.15, x1 - 0.2, y1 - 0.08, 0.35, 0.95, '#cfe8f1', '#cfe8f1');
          box(c, P, x0 + 0.38, y0 + 0.45, x1 - 0.28, y1 - 0.25, 0, 0.3, '#5aa7c4', '#7fb7c9');
          box(c, P, x0 + 0.38, y1 - 0.35, x1 - 0.28, y1 - 0.25, 0.3, 0.7, '#5aa7c4', '#7fb7c9', 1);
          // the barber's pole at the front corner
          const px = x0 + 0.12, py = y0 + 0.12;
          for (let i = 0; i < 6; i++) box(c, P, px - 0.06, py - 0.06, px + 0.06, py + 0.06, 0.25 + i * 0.12, 0.37 + i * 0.12, ['#d23a2c', '#fff', '#5aa7c4'][i % 3], '#fff', 1);
          dot(c, P(px, py, 1.02), 4, '#e3e0d8');
        } else if (K === 'takoyaki') {
          box(c, P, x0 + 0.15, y0 + 0.3, x1 - 0.15, y0 + 0.75, 0, 0.45, '#fff', '#2b2b2e');
          for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) dot(c, P(x0 + 0.3 + i * 0.2, y0 + 0.42 + j * 0.2, 0.46), Math.max(3, s * 0.07), '#c9762c');
          line(c, P(x1 - 0.25, y1 - 0.2, 0), P(x1 - 0.25, y1 - 0.2, 0.9), INK, 1.5);
          dot(c, P(x1 - 0.25, y1 - 0.2, 0.95), Math.max(5, s * 0.13), RED);
        }
      });
      // the awning: stripes sloping out over the road side, on two thin poles, with the sign above
      put(x0 + y0 + 0.25, (c, P, s) => {
        const a0 = x0 + 0.04, a1 = x1 - 0.04, n = r.w * 4;
        for (const a of [a0 + 0.04, a1 - 0.04]) line(c, P(a, y0 - 0.32, 0), P(a, y0 - 0.32, 0.7), INK, 1.2);
        for (let i = 0; i < n; i++) {
          const u0 = a0 + (i / n) * (a1 - a0), u1 = a0 + ((i + 1) / n) * (a1 - a0);
          quad(c, [P(u0, y0, 0.98), P(u1, y0, 0.98), P(u1, y0 - 0.34, 0.72), P(u0, y0 - 0.34, 0.72)], i % 2 ? '#fff' : col, INK, 0.8);
        }
        quad(c, [P(a0, y0, 0.98), P(a1, y0, 0.98), P(a1, y0, 1.36), P(a0, y0, 1.36)], col, INK, 1.2);
        const txt = labelOf(r);
        let sz = Math.max(8, Math.round(s * 0.26));
        c.font = `bold ${sz}px ${FONT}`;
        // the name on the sign, sheared to lie along the wall
        const [l0x, l0y] = P(a0, y0, 1.17), [l1x, l1y] = P(a1, y0, 1.17);
        while (sz > 7 && c.measureText(txt).width > (l1x - l0x) * 0.9) { sz -= 1; c.font = `bold ${sz}px ${FONT}`; }
        const [tx, ty] = P((a0 + a1) / 2, y0, 1.17);
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.save(); c.translate(tx, ty); c.transform(1, (l1y - l0y) / Math.max(1, l1x - l0x), 0, 1, 0, 0);
        c.fillText(txt, 0, 1); c.restore();
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      });
      break;
    }
    case 'ido':
      put(key, (c, P) => {
        ell(c, P, cx, cy, 0.02, 0.42, 0.42, STONE, '#8d8a82', 2);
        ell(c, P, cx, cy, 0.05, 0.26, 0.26, '#1a2830', '#0e161c', 1.5);
        box(c, P, cx + 0.16, cy + 0.16, cx + 0.36, cy + 0.36, 0, 0.2, WOOD, WOOD);
      });
      break;
    case 'akazu':
      raise(1.6);
      put(key, (c, P) => {
        box(c, P, x0 + 0.12, y0 + 0.12, x1 - 0.12, y1 - 0.12, 0, 1.15, '#2a2430', '#1c1822');
        box(c, P, cx - 0.22, y0 + 0.12, cx + 0.22, y0 + 0.26, 0, 0.9, '#4a3a28', '#6b4f2e');
        for (const dx of [-0.1, 0, 0.1]) box(c, P, cx + dx - 0.03, y0 + 0.14, cx + dx + 0.03, y0 + 0.2, 0.55, 0.95, '#f4f0e4', '#f4f0e4', 0.6);
        line(c, P(x0 + 0.35, y0 + 0.4, 1.2), P(x1 - 0.35, y1 - 0.35, 1.2), '#6b4f2e', 3);
        line(c, P(x1 - 0.35, y0 + 0.4, 1.2), P(x0 + 0.35, y1 - 0.35, 1.2), '#6b4f2e', 3);
      });
      break;
    case 'ofuda':
      raise(1.35);
      put(key, (c, P) => {
        box(c, P, x0 + 0.12, y0 + 0.16, x1 - 0.12, y1 - 0.16, 0, 0.9, '#f4efe2', '#e7e0cc');
        for (let i = 0; i < 4; i++) {
          const u = 0.18 + i * 0.2;
          box(c, P, x0 + u - 0.05, y1 - 0.14, x0 + u + 0.05, y1 - 0.05, 0.35, 1.2, '#f7f3e6', '#e6e0cc', 0.8);
        }
      });
      break;
    case 'obake':
      raise(2.2);
      put(key + 0.4, (c, P) => {
        roof(c, P, x0, y0, x1, y1, 0.95, 1.75, '#2a2430', 0.22);
        box(c, P, x1 - 0.45, y1 - 0.45, x1 - 0.22, y1 - 0.22, 0.95, 2.15, '#3a3a3f', '#3a3a3f');
        box(c, P, x0 + 0.25, y0 + 0.28, x0 + 0.55, y0 + 0.48, 0.4, 0.75, '#e07b39', '#f2c230');
        ell(c, P, cx, cy + 0.15, 0.55, 0.28, 0.2, '#fff', '#e4e4e4', 1.2);
        dot(c, P(cx - 0.08, cy + 0.15, 0.72), 2.4, INK);
        dot(c, P(cx + 0.08, cy + 0.15, 0.72), 2.4, INK);
      });
      break;
    case 'butsuma':
      raise(1.3);
      put(key, (c, P) => {
        const altar = long ? [cx - 0.55, y1 - 0.42, cx + 0.55, y1 - 0.1] : [x1 - 0.42, cy - 0.4, x1 - 0.1, cy + 0.4];
        box(c, P, altar[0], altar[1], altar[2], altar[3], 0, 0.32, '#3a3228', '#5b4630');
        box(c, P, cx - 0.16, cy - 0.12, cx + 0.16, cy + 0.12, 0.32, 0.85, '#6b4f2e', '#8a6a45');
        line(c, P(cx, cy - 0.35, 0.05), P(cx, cy - 0.35, 0.55), '#c45a4a', 2);
        dot(c, P(cx, cy - 0.35, 0.6), 3, '#9a9a9a');
      });
      break;
    case 'kagami':
      raise(1.45);
      put(key, (c, P) => {
        box(c, P, cx - 0.28, y1 - 0.18, cx + 0.28, y1 - 0.06, 0.1, 0.18, WOOD, WOOD);
        box(c, P, cx - 0.22, y1 - 0.16, cx + 0.22, y1 - 0.08, 0.18, 1.25, '#d5dee6', '#eef3f6');
        dot(c, P(cx - 0.06, cy, 0.4), 5, RED);
        dot(c, P(cx + 0.08, y1 - 0.12, 0.7), 3.5, '#fff');
      });
      break;
    case 'maze':
      raise(0.5);
      put(key, (c, P) => {
        const G = '#4f8a3a';
        for (const [a, b, y] of [[0.1, 1.4, 0.45], [0.7, 1.9, 1.25], [0.4, 1.1, 1.7]]) box(c, P, x0 + a, y0 + y - 0.06, x0 + b, y0 + y + 0.06, 0, 0.42, G, G);
        for (const [a, b, x] of [[0.45, 1.35, 1.4], [0.1, 1.0, 0.7], [0.95, 1.85, 0.3]]) box(c, P, x0 + x - 0.06, y0 + a, x0 + x + 0.06, y0 + b, 0, 0.42, G, G);
      });
      break;
  }
}
