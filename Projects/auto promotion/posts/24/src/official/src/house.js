// The house: rooms dropped onto the lot, and everything read off the finished plan
// (doors, the way in, enclosed gaps, routes, the flyer's copy, the day of living there).
// Pure functions, no DOM, so sim/ can run thousands of houses in node.
//
// Coordinates are cells (1 cell = 2 帖 ≈ 1.82 m square). x grows to the right, y grows away
// from the road: the road runs along y = 0 and rooms slide in from the far side (large y)
// until they hit the stack, like a falling-block game seen from above.

import { RARE, RARE_V1, RARE_V2, SHOPS, THEMES, THEME_MIN, HALLOWEEN, HALLOWEEN_CLASSIC } from './rare.js';

export const W = 6;
export const H = 6;
export const ROOMS = 8;
export const SQM = 3.31; // ㎡ per cell

export const TYPES = [
  { id: 'ldk', name: 'LDK', w: 3, h: 2 },
  { id: 'wa', name: '和室', w: 2, h: 2 },
  { id: 'yo', name: '洋室', w: 2, h: 2 },
  { id: 'wc', name: 'トイレ', w: 1, h: 1 },
  { id: 'bath', name: '浴室', w: 1, h: 1 },
  { id: 'gen', name: '玄関', w: 1, h: 1 },
  { id: 'kai', name: '階段', w: 1, h: 2 },
  { id: 'oshi', name: '押入れ', w: 1, h: 1 },
  { id: 'beran', name: 'ベランダ', w: 2, h: 1 },
  // RARE is split around `li` so the original 38 rare rooms keep their TYPES indices (9..46)
  // and `li` stays 47 — those indices are baked into shared `?h=` codes and must never move.
  // The 15 rooms added on 2026-10-21 land after `li` (48..62).
  // 2026-10-22: `roka` (63, the hallway of 「廊下だらけ」), the six shops of 店舗付き住宅 (64..69), then the
  // 13 rare rooms added that day (70..82). Anything new goes on the end; nothing above ever moves.
  // 2026-10-24: halloween rooms (83..88). `event: 'halloween'` keeps them out of the ordinary rare chain.
  ...RARE.slice(0, RARE_V1).map((r) => ({ ...r, rare: true })),
  { id: 'li', name: 'リビング', w: 2, h: 2 },
  ...RARE.slice(RARE_V1, RARE_V2).map((r) => ({ ...r, rare: true })),
  { id: 'roka', name: '廊下', w: 1, h: 3 },
  ...SHOPS.map((r) => ({ ...r, shop: true })),
  ...RARE.slice(RARE_V2).map((r) => ({ ...r, rare: true })),
  ...HALLOWEEN.map((r) => ({ ...r, rare: true, event: 'halloween' })),
];
// The rare-room chain: RARE_CHAIN[0] of houses get a first rare room, and each later one is
// conditional on the one before (RARE_CHAIN[1] on the first, [2] on the second, [3] on the third).
// At most 4 rare rooms, and never the same kind twice in one house.
export const RARE_CHAIN = [0.5, 0.55, 0.4, 0.3];
// 「リビングの雨」: LIVING_RAIN_P of houses turn most non-rare, non-LDK rooms into living rooms.
export const LIVING_RAIN_P = 0.05;
export const LIVING_RAIN_BIAS = 0.7;
// 「変な組み合わせ回」: LIVING_RAIN_P..LIVING_RAIN_P+ODD_P of houses come out as one of these
// combinations of rooms, none of which an ordinary house can produce (5+ of one kind, 3+ rare kinds).
// Each: id, banner (shown while building) and either rooms (fixed ids) or make(r2) (draws from r2).
// 2026-10-22: 7 → 11 patterns (廊下だらけ・トイレだらけ・個室だらけ・LDKだらけ) and ODD_P 0.04 → 0.05.
export const ODD_P = 0.05;
// テーマで固めた変な回: shuffle all of one theme's rooms, then draw `extras` more (with repeats) from it.
const oddTheme = (r2, id, extras) => {
  const pool = THEMES.find((t) => t.id === id).rooms;
  const ids = [...pool];
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  for (let k = 0; k < extras; k++) ids.push(pool[Math.floor(r2() * pool.length)]);
  return ids;
};
export const ODD_ROUNDS = [
  { id: 'mizu', banner: '水まわり祭り', rooms: ['wc', 'wc', 'wc', 'bath', 'bath', 'bath', 'gen', 'yo'] },
  { id: 'rare', banner: 'レア部屋しかない', make: (r2) => {
    const ids = RARE.map((r) => r.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(r2() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    return ids.slice(0, ROOMS);
  } },
  { id: 'oshi', banner: '押入れの国', rooms: ['oshi', 'oshi', 'oshi', 'oshi', 'oshi', 'oshi', 'oshi', 'ldk'] },
  { id: 'kai', banner: '階段だらけ', rooms: ['kai', 'kai', 'kai', 'kai', 'kai', 'ldk', 'wc', 'gen'] },
  { id: 'gen', banner: '玄関だらけ', rooms: ['gen', 'gen', 'gen', 'gen', 'gen', 'ldk', 'wc', 'bath'] },
  { id: 'wa', banner: '和室づくし', rooms: ['wa', 'wa', 'wa', 'wa', 'wa', 'bath', 'bath', 'gen'] },
  { id: 'beran', banner: 'ベランダ天国', rooms: ['beran', 'beran', 'beran', 'beran', 'beran', 'beran', 'ldk', 'gen'] },
  { id: 'roka', banner: '廊下だらけ', rooms: ['roka', 'roka', 'roka', 'roka', 'roka', 'yo', 'wc', 'gen'] },
  { id: 'wc', banner: 'トイレだらけ', rooms: ['wc', 'wc', 'wc', 'wc', 'wc', 'wc', 'ldk', 'gen'] },
  { id: 'yo', banner: '個室だらけ', rooms: ['yo', 'yo', 'yo', 'yo', 'yo', 'yo', 'wc', 'gen'] },
  { id: 'ldk', banner: 'LDKだらけ', rooms: ['ldk', 'ldk', 'ldk', 'ldk', 'ldk', 'wc', 'bath', 'gen'] },
  // テーマで固めた変な回 (2026-10-23): all of one theme's rare rooms, then the rest drawn (with repeats)
  // from the same theme. make(r2) uses only r2, like the 「レア部屋しかない」 round.
  { id: 'zoo', banner: '動物しかいない', make: (r2) => oddTheme(r2, 'zoo', 2) },
  { id: 'park', banner: '遊園地しかない', make: (r2) => oddTheme(r2, 'park', 3) },
  { id: 'temple', banner: '寺しかない', make: (r2) => oddTheme(r2, 'temple', 2) },
  { id: 'water', banner: '水だらけ', rooms: ['pool', 'onsen', 'taki', 'tsuribori', 'wani', 'ashiyu', 'sento', 'bath'] },
];
// 店舗付き住宅: SHOP_P of ordinary houses (not rain, not odd) turn one ordinary extra room into a shop.
export const SHOP_P = 0.04;
// 築年数・駅徒歩: realistic most of the time (築1〜40年, 駅徒歩1〜18分), a joke in *_JOKE_P of flyers.
export const AGE_JOKE_P = 0.04;
export const WALK_JOKE_P = 0.04;
export const AGE_JOKES = [
  { id: 'age-today', text: '築0日（さっき完成）' },
  { id: 'age-samurai', text: '築300年（武家屋敷）' },
  { id: 'age-heian', text: '築1200年（平安時代）' },
  { id: 'age-future', text: '築−3年（未来から来た）' },
  { id: 'age-earth', text: '築46億年（地球と同い年）' },
];
export const WALK_JOKES = [
  { id: 'walk-in', text: '駅徒歩0分（駅の中）' },
  { id: 'walk-far', text: '駅徒歩180分' },
  { id: 'walk-run', text: '駅徒歩1分（全力疾走）' },
  { id: 'walk-days', text: '駅徒歩3日' },
  { id: 'walk-swim', text: '駅徒歩40分（泳いで）' },
];
const T = Object.fromEntries(TYPES.map((t, i) => [t.id, i]));

// --- the words -------------------------------------------------------------------------
// Japanese is written inline here and in rare.js. Another language is a table from
// lang/<code>.js (setText); tr(key, ja, ...args) gives the Japanese string, or that table's
// q[key](...args). A key missing from a table throws (tests/madori.test.mjs runs every language).
let TX = null;
export function setText(table) { TX = table; }
export const textTable = () => TX;
const word = (v, k, a) => {
  if (typeof v === 'function') return v(...a);
  if (typeof v !== 'string') throw new Error(`madori: no '${k}' in lang/${TX.lang}.js`);
  return v;
};
const tr = (k, ja, ...a) => (TX ? word(TX.q[k], k, a) : ja);
const dt = (k, ja, ...a) => (TX ? word(TX.day[k], k, a) : ja);
const txEntry = (t) => (t.rare ? TX.rare[t.id] : TX.shop[t.id]); // a rare room or a shop in the table
export const roomName = (t) => (TX ? (t.rare || t.shop ? txEntry(t).name : TX.rooms[t.id]) : t.name);
// A name standing alone (the plan, 図鑑, the layout line): capitalized in languages with `caps`.
const cap = (x) => (TX?.caps ? x.charAt(0).toUpperCase() + x.slice(1) : x);
export const roomTitle = (t) => cap(roomName(t));
// The name in the plan: a shorter form where the table has one (`label`), for small rooms.
export const roomLabel = (t) => cap((TX && (t.rare || t.shop ? txEntry(t).label : TX.label?.[t.id])) || roomName(t));
export const rareVerb = (t) => (TX ? txEntry(t).verb : t.verb);
const rareText = (t, q) => (TX ? txEntry(t).text(q) : t.text(q));
export const requestText = (i) => (TX ? TX.req[REQUESTS[i].id] : REQUESTS[i].text);
export const buildingName = (i) => (TX ? TX.names[i] : NAMES[i]);
export const oddBanner = (id) => (TX ? TX.odd[id] : id === 'rain' ? 'リビングの雨' : id === 'deru' ? '出る物件' : ODD_ROUNDS.find((o) => o.id === id).banner);
const CORE = ['ldk', 'wa', 'yo', 'wc', 'bath', 'gen'];
const EXTRA = [['kai', 2], ['oshi', 2], ['beran', 1.5], ['wc', 1.6], ['gen', 1], ['bath', 1], ['ldk', 0.7], ['wa', 0.5], ['yo', 0.5]];

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const pick = (rand, list) => list[Math.floor(rand() * list.length)];
function weighted(rand, list) {
  let r = rand() * list.reduce((s, [, w]) => s + w, 0);
  for (const [v, w] of list) if ((r -= w) < 0) return v;
  return list[list.length - 1][0];
}

// One odd combination rebuilt from r2 alone (the shared rand is never drawn again).
function oddBag(r2, pattern) {
  const ids = pattern.rooms ? [...pattern.rooms] : pattern.make(r2);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(r2() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.map((id) => {
    const t = T[id];
    const sq = TYPES[t].w === TYPES[t].h;
    return { t, rot: sq ? 0 : r2() < 0.5 ? 1 : 0 };
  });
}

// The last room of a kind the family can't live without (ldk, gen, wc, bath) is never swapped
// out for a rare room, and the last bedroom stays until the fourth rare room (`allowBedroom`
// is true only for that one). Already-rare rooms are skipped, so each rare kind appears once.
function replaceable(ids, allowBedroom) {
  const counts = Object.fromEntries(TYPES.map((t) => [t.id, 0]));
  for (const id of ids) counts[id]++;
  for (let i = ids.length - 1; i >= 0; i--) {
    const id = ids[i];
    if (TYPES[T[id]].rare || TYPES[T[id]].shop) continue;
    if (id === 'ldk' || id === 'gen' || id === 'wc' || id === 'bath') {
      if (counts[id] === 1) continue;
    }
    if ((id === 'wa' || id === 'yo') && !allowBedroom && counts.wa + counts.yo === 1) continue;
    return i;
  }
  return -1;
}

// Where the shop goes: the last of the extras (stairs, closet, balcony), else a second toilet, entrance,
// bath or LDK, else a second bedroom. -1 when every room is one the family needs (then no shop).
function shopSpot(ids) {
  const n = (k) => ids.filter((x) => x === k).length;
  const ok = [
    (k) => ['kai', 'oshi', 'beran'].includes(k),
    (k) => ['wc', 'gen', 'bath', 'ldk'].includes(k) && n(k) > 1,
    (k) => (k === 'wa' || k === 'yo') && n('wa') + n('yo') > 1,
  ];
  for (const f of ok) for (let i = ids.length - 1; i >= 0; i--) if (f(ids[i])) return i;
  return -1;
}

// The 8 rooms of one game: the six a house needs, two extras, and now and then a chain of rare
// rooms (up to 4, each a distinct kind) swapped in for the least-essential rooms at the end.
export function makeBag(rand) {
  const ids = [...CORE];
  if (rand() < 0.22) ids.splice(Math.floor(rand() * ids.length), 1);
  while (ids.length < ROOMS) ids.push(weighted(rand, EXTRA));
  const rares = TYPES.filter((t) => t.rare && !t.event);
  // d1 and d2 are always drawn (a no-rare house still consumes exactly two draws here, like the
  // old two RARE_P checks); further draws happen only after a hit.
  let n = 0;
  const chosen = [];
  const swap = (k) => {
    const i = replaceable(ids, k === 3);
    if (i < 0) return n;
    const pool = rares.filter((r) => !chosen.includes(r.id));
    const rare = pick(rand, pool);
    chosen.push(rare.id);
    ids[i] = rare.id;
    return n + 1;
  };
  const d1 = rand();
  if (d1 < RARE_CHAIN[0]) n = swap(0);
  const d2 = rand();
  if (n === 1 && d2 < RARE_CHAIN[1]) n = swap(1);
  for (let k = 2; k <= 3; k++) {
    if (n === k && rand() < RARE_CHAIN[k]) n = swap(k);
    else break;
  }
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const bag = ids.map((id) => {
    const t = T[id];
    const sq = TYPES[t].w === TYPES[t].h;
    return { t, rot: sq ? 0 : rand() < 0.5 ? 1 : 0 };
  });
  // 「リビングの雨」と「変な組み合わせ回」: a fresh rng keyed on the bag (not the shared rand), so the
  // ordinary bag, the request, the name and the placement stay exactly as before. The first draw decides:
  // under LIVING_RAIN_P it's the living rain (unchanged), under LIVING_RAIN_P + ODD_P it's one of the odd
  // combinations, otherwise an ordinary house. Rain and odd never both happen.
  const r2 = rng(hash(bag.map((r) => TYPES[r.t].id + r.rot).join('')));
  const x = r2();
  if (x < LIVING_RAIN_P) {
    const LI = T['li'];
    let replaced = false;
    for (const r of bag) {
      const t = TYPES[r.t];
      if (t.rare || t.id === 'ldk') continue;
      if (r2() < LIVING_RAIN_BIAS) { r.t = LI; r.rot = 0; replaced = true; }
    }
    if (!replaced) {
      const first = bag.find((r) => { const t = TYPES[r.t]; return !t.rare && t.id !== 'ldk'; });
      if (first) { first.t = LI; first.rot = 0; }
    }
  } else if (x < LIVING_RAIN_P + ODD_P) {
    return oddBag(r2, ODD_ROUNDS[Math.floor(r2() * ODD_ROUNDS.length)]);
  } else {
    // 店舗付き住宅: yet another rng keyed on the bag, so a house without a shop is exactly as before.
    // The shop takes the place of the least-essential room (as a rare room would), keeping its turn.
    const r3 = rng(hash('shop' + bag.map((r) => TYPES[r.t].id + r.rot).join('')));
    if (r3() < SHOP_P) {
      const i = shopSpot(bag.map((r) => TYPES[r.t].id));
      if (i >= 0) {
        const t = T[SHOPS[Math.floor(r3() * SHOPS.length)].id];
        bag[i] = { t, rot: TYPES[t].w === TYPES[t].h ? 0 : r3() < 0.5 ? 1 : 0 };
      }
    }
  }
  return bag;
}

// The shop of a 店舗付き住宅 (its TYPES entry), or null.
export function shopOf(rooms) {
  const r = rooms.find((x) => TYPES[x.t].shop);
  return r ? TYPES[r.t] : null;
}

export function livingRain(bag) {
  return bag.some((r) => TYPES[r.t].id === 'li');
}

// Which odd combination a bag is, read from its rooms alone (each combination is impossible in an
// ordinary house: five or more of one kind, or three or more rare kinds). null for an ordinary bag.
export function oddRound(bag) {
  const counts = Object.fromEntries(TYPES.map((t) => [t.id, 0]));
  for (const r of bag) counts[TYPES[r.t].id]++;
  // 「レア部屋しかない」回は 8 部屋すべてレア。通常回はチェーンで最大 4 つまでなので、
  // レア 4 つの通常回を誤って「レア部屋しかない」と見なさないよう、全体がレアのときだけ。
  const rareRooms = bag.reduce((s, r) => s + (TYPES[r.t].rare ? 1 : 0), 0);
  if (rareRooms === ROOMS) {
    // テーマで固めた変な回 (2026-10-23): 8 部屋すべてレアで、全部が同じテーマならその id。
    // 既存の「レア部屋しかない」回は 8 種が全部別々（全 66 種から）なので、1 テーマ（5〜6 種）に収まらず、
    // ここで誤って zoo/park/temple に判定されることはない。
    for (const th of THEMES) {
      if (!['zoo', 'park', 'temple'].includes(th.id)) continue;
      if (bag.every((r) => th.rooms.includes(TYPES[r.t].id))) return th.id;
    }
    return 'rare';
  }
  // 水だらけ (2026-10-23): 7 種の水まわりレア部屋のうち 6 種以上。通常回はレアが最大 4 つなので、
  // 6 種以上は起こり得ない（mizu 判定より前に置く）。
  const water = ['pool', 'onsen', 'taki', 'tsuribori', 'wani', 'ashiyu', 'sento'];
  if (water.filter((k) => counts[k]).length >= 6) return 'water';
  if (counts.wc >= 6) return 'wc';
  if (counts.wc + counts.bath >= 6) return 'mizu';
  if (counts.oshi >= 5) return 'oshi';
  if (counts.kai >= 5) return 'kai';
  if (counts.gen >= 5) return 'gen';
  if (counts.wa >= 5) return 'wa';
  if (counts.beran >= 5) return 'beran';
  if (counts.roka >= 5) return 'roka';
  if (counts.yo >= 5) return 'yo';
  if (counts.ldk >= 5) return 'ldk';
  return null;
}

// 'rain' | an odd combination id | 'deru' (a halloween house) | null.
export function specialRound(bag) {
  if (livingRain(bag)) return 'rain';
  // A halloween room wins the banner even if the dressed house also looks like an odd round
  // (eight rares). Odd rounds themselves never contain event rooms.
  if (bag.some((r) => TYPES[r.t].event)) return 'deru';
  return oddRound(bag);
}

// --- 出る物件 (halloween, 2026-10-24 .. 2026-11-01 JST) ---------------------------------
// Generation only. A shared ?h= still shows its rooms, headline and badge after the period,
// because those live in the house, not in the clock. Ordinary makeBag never draws these rooms,
// and a miss (or a date outside the window) returns the same bag, request and name.
export const HALLOWEEN_P = 0.4;
export const HALLOWEEN_START = Date.parse('2026-10-24T00:00:00+09:00');
export const HALLOWEEN_END = Date.parse('2026-11-02T00:00:00+09:00');
let clock = () => Date.now();
let forceHalloween = null;
export function setClock(fn) { clock = typeof fn === 'function' ? fn : (() => Date.now()); }
// true / false forces the event on or off (preview `?event=`, tests). null follows the clock.
export function setHalloween(v) { forceHalloween = v; }
export function halloweenActive(now = clock()) {
  if (forceHalloween === true) return true;
  if (forceHalloween === false) return false;
  return now >= HALLOWEEN_START && now < HALLOWEEN_END;
}
// `?event=halloween` (or on / 1) forces the event. `?event=off` (or 0) forces it off.
// `?halloween=1` / `?halloween=0` do the same. null → follow the clock.
export function halloweenFromQuery(search) {
  const q = search instanceof URLSearchParams ? search : new URLSearchParams(String(search).replace(/^\?/, ''));
  const v = (q.get('event') || q.get('halloween') || '').toLowerCase();
  if (v === 'halloween' || v === 'on' || v === '1') return true;
  if (v === 'off' || v === '0') return false;
  return null;
}

function dressHalloween(bag, rH) {
  const ids = bag.map((r) => TYPES[r.t].id);
  const pool = HALLOWEEN.map((r) => r.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rH() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const nEvent = rH() < 0.62 ? 2 : 3;
  let placed = 0;
  for (let k = 0; k < nEvent && pool.length; k++) {
    let i = replaceable(ids, false);
    if (i < 0) i = replaceable(ids, true);
    if (i < 0) break;
    ids[i] = pool.pop();
    placed++;
  }
  // Sometimes one of the existing spooky rooms (graveyard, hole, cell, cave) comes along,
  // so the headline can pair a new room with one players already know.
  if (placed && rH() < 0.5) {
    const have = new Set(ids);
    const classic = HALLOWEEN_CLASSIC.filter((k) => !have.has(k));
    let i = replaceable(ids, false);
    if (i < 0) i = replaceable(ids, true);
    if (i >= 0 && classic.length) ids[i] = classic[Math.floor(rH() * classic.length)];
  }
  if (!placed) return null;
  return bag.map((r, i) => {
    if (TYPES[r.t].id === ids[i]) return r;
    const t = T[ids[i]];
    const sq = TYPES[t].w === TYPES[t].h;
    return { t, rot: sq ? 0 : rH() < 0.5 ? 1 : 0 };
  });
}

// { bag, req, name, hit }. hit houses get a halloween request and a halloween building name.
// Rain and odd rounds are left alone (they already have their own banner).
export function applyHalloween(bag, req, name) {
  if (!halloweenActive()) return { bag, req, name, hit: false };
  if (livingRain(bag) || oddRound(bag)) return { bag, req, name, hit: false };
  const rH = rng(hash('hw26' + bag.map((r) => TYPES[r.t].id + r.rot).join('')));
  if (rH() >= HALLOWEEN_P) return { bag, req, name, hit: false };
  const dressed = dressHalloween(bag, rH);
  // Nowhere to put a halloween room (the house is already essentials and rares): same as a miss.
  if (!dressed) return { bag, req, name, hit: false };
  const hwReq = REQUESTS.length - REQ_POOL;
  const hwName = NAMES.length - NAME_POOL;
  return {
    bag: dressed,
    req: REQ_POOL + Math.floor(rH() * hwReq),
    name: NAME_POOL + Math.floor(rH() * hwName),
    hit: true,
  };
}

export function size(t, rot) {
  const { w, h } = TYPES[t];
  return rot ? [h, w] : [w, h];
}

// Height of the stack under columns [x, x + w).
export function landing(rooms, x, w) {
  let y = 0;
  for (const r of rooms) if (r.x < x + w && x < r.x + r.w) y = Math.max(y, r.y + r.h);
  return y;
}

export const maxCol = (piece) => W - size(piece.t, piece.rot)[0];

export function place(rooms, piece, col) {
  const [w, h] = size(piece.t, piece.rot);
  const x = Math.max(0, Math.min(W - w, col));
  return { t: piece.t, rot: piece.rot, x, y: landing(rooms, x, w), w, h };
}

// A finished house as a short code for the share link: 2 base-36 characters per room.
// Each room packs `t*12 + rot*6 + x` into 2 base-36 digits (0..'zz' = 1295), so the type
// index t is limited to t <= 107 (floor((1295 - 6 - 5) / 12)) — TYPES stays well under it.
// The client's request (1 character) and the building's name (2) go first, then the rooms.
export function encode(rooms, req = 0, name = 0) {
  return req.toString(36) + name.toString(36).padStart(2, '0') + rooms.map((r) => (r.t * 12 + r.rot * 6 + r.x).toString(36).padStart(2, '0')).join('');
}

// { rooms, req } or null.
export function decode(code) {
  if (typeof code !== 'string' || !/^[0-9a-z]{5,43}$/.test(code) || code.length % 2 === 0) return null;
  const req = parseInt(code[0], 36), name = parseInt(code.slice(1, 3), 36);
  if (req >= REQUESTS.length || name >= NAMES.length) return null;
  const rooms = [];
  for (let i = 3; i < code.length; i += 2) {
    const n = parseInt(code.slice(i, i + 2), 36);
    // n = t*12 + rot*6 + x (2 base-36 digits, max 1295 → t <= 107)
    const t = Math.floor(n / 12), rot = Math.floor((n % 12) / 6), x = n % 6;
    if (t >= TYPES.length) return null;
    rooms.push(place(rooms, { t, rot }, x));
  }
  return { rooms, req, name };
}

// --- the client's request (from Madrino: the client keeps asking for things) ---------------
// North is away from the road (large y), east is large x.

export const REQUESTS = [
  { id: 'wc-ne', text: 'トイレは北東に', ok: (an) => an.rooms.some((r) => id(r) === 'wc' && r.x * 2 >= W && r.y * 2 >= H) },
  { id: 'gen-road', text: '玄関は道路に面して', ok: (an) => an.entry?.kind === 'road' },
  { id: 'bed-sun', text: '日当たりのいい寝室', ok: (an) => an.rooms.some((r, i) => isBed(r) && (an.faces[i].out || an.faces[i].road)) },
  { id: 'bath-bed', text: 'お風呂は寝室の隣に', ok: (an) => an.rooms.some((r, i) => id(r) === 'bath' && an.adj[i].some((b) => isBed(an.rooms[b]))) },
  { id: 'short', text: '動線はシンプルに', ok: (an) => an.entry && Math.max(...an.dist) <= 3 && !an.dist.includes(-1) },
  { id: 'garden', text: '庭がほしい', ok: (an) => { let n = 0; for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (an.owner[x][y] === -1 && an.open[x][y]) n++; return n >= 6; } },
  { id: 'fit', text: '敷地に収めて', ok: (an) => an.rooms.every((r) => r.y + r.h <= H) },
  { id: 'wc-ldk', text: 'トイレはリビングから離して', ok: (an) => an.rooms.some((r) => id(r) === 'wc') && !an.rooms.some((r, i) => id(r) === 'wc' && an.adj[i].some((b) => id(an.rooms[b]) === 'ldk')) },
  // 出る物件の要望 (2026-10-24)。pickRequest は先頭8つだけ。期間中に当たった家だけ、後ろから選ぶ。
  { id: 'keep-akazu', text: '開かずの間はそのままに', ok: (an) => an.counts.akazu > 0 },
  { id: 'ido-yard', text: '井戸は庭に', ok: (an) => an.rooms.some((r, i) => id(r) === 'ido' && (an.faces[i].out || an.faces[i].road)) },
  { id: 'ofuda-many', text: 'お札は多めで', ok: (an) => an.counts.ofuda > 0 },
  { id: 'no-notice', text: '告知事項はなくて', ok: (an) => !HALLOWEEN.some((r) => an.counts[r.id]) && !HALLOWEEN_CLASSIC.some((k) => an.counts[k]) },
];
// The first 8 are the ordinary requests. Indices at and after this are the halloween ones (appended,
// so existing ?h= codes keep their request). pickRequest never draws those.
export const REQ_POOL = 8;
export const pickRequest = (rand) => Math.floor(rand() * REQ_POOL);

// The building's name, given with the request (the client has already named it).
export const NAMES = [
  'グランメゾン白金台', 'パークハイツ代官山', 'ロイヤルヒルズ田園調布', 'コーポ山田', 'メゾン・ド・ひだまり', 'ヴィラ・サクラ',
  'レジデンス青山', 'ハイツ若葉', 'パレス六本木', 'シャトー松濤', 'ホワイトキャッスル', 'サンハイツ第二', 'コスモ荘',
  '第三ひまわり荘', 'グリーンヒル', 'ドミール南青山', 'ラ・フォーレ', 'セゾン武蔵野', 'リバーサイド多摩', 'アーバン恵比寿',
  'エクセル赤坂', 'グランドール麻布', 'ソレイユ西荻', 'メゾン一番館', 'ことぶき荘', 'ニュー高円寺ハイツ', 'カーサ・ビアンカ',
  'シーサイドヴィラ', 'ガーデンコート世田谷', 'フォレスト軽井沢', 'タワーレジデンス品川', 'スカイハイツ', 'ノーブル成城',
  'エレガンス元町', 'コンフォート桜台', 'やすらぎ荘', 'ドリームハイツ', 'オーシャンビュー山梨', '日当たり荘', 'シンプルハウス',
  // 出る物件の物件名 (2026-10-24)。pickName は先頭40個だけ。添字は ?h= の2文字に載る（40..47）。
  '事故物件ではありません', 'メゾン開かず', 'オーシャンビュー心霊', 'コーポ四谷（告知あり）',
  'パレスお札', 'ハイツ井戸端', 'グランメゾン心理的瑕疵', '夜鳴き荘',
];
export const NAME_POOL = 40;
export const pickName = (rand) => Math.floor(rand() * NAME_POOL);

// --- reading the plan ----------------------------------------------------------------

const id = (r) => TYPES[r.t].id;
const isBed = (r) => ['yo', 'wa'].includes(id(r));
export const nameOf = (r) => roomName(TYPES[r.t]);
export const labelOf = (r) => roomLabel(TYPES[r.t]);

export function analyze(rooms) {
  const top = Math.max(H, ...rooms.map((r) => r.y + r.h));
  const owner = Array.from({ length: W }, () => new Array(top).fill(-1));
  rooms.forEach((r, i) => {
    for (let x = r.x; x < r.x + r.w; x++) for (let y = r.y; y < r.y + r.h; y++) owner[x][y] = i;
  });
  const at = (x, y) => (x < 0 || x >= W || y < 0 || y >= top ? -2 : owner[x][y]);

  // Empty cells: open (yard: reaches the lot's edge or the sky above the stack) or enclosed.
  const open = Array.from({ length: W }, () => new Array(top).fill(false));
  const queue = [];
  for (let x = 0; x < W; x++) for (let y = 0; y < top; y++) {
    if (owner[x][y] !== -1) continue;
    if (x === 0 || x === W - 1 || y === 0 || y === top - 1) { open[x][y] = true; queue.push([x, y]); }
  }
  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (at(nx, ny) === -1 && !open[nx][ny]) { open[nx][ny] = true; queue.push([nx, ny]); }
    }
  }
  const gaps = [];
  const seen = Array.from({ length: W }, () => new Array(top).fill(false));
  for (let x = 0; x < W; x++) for (let y = 0; y < top; y++) {
    if (owner[x][y] !== -1 || open[x][y] || seen[x][y]) continue;
    const cells = [];
    const st = [[x, y]];
    seen[x][y] = true;
    while (st.length) {
      const [cx, cy] = st.pop();
      cells.push([cx, cy]);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (at(nx, ny) === -1 && !open[nx][ny] && !seen[nx][ny]) { seen[nx][ny] = true; st.push([nx, ny]); }
      }
    }
    gaps.push(cells);
  }
  const outsideAt = (x, y) => { const o = at(x, y); return o === -2 || (o === -1 && open[x][y]); };

  // Shared walls: every pair of rooms that touch gets one door, in the middle of what they share.
  const shared = new Map();
  const add = (a, b, seg) => {
    const k = a < b ? `${a},${b}` : `${b},${a}`;
    if (!shared.has(k)) shared.set(k, []);
    shared.get(k).push(seg);
  };
  for (let x = 0; x < W; x++) for (let y = 0; y < top; y++) {
    const o = owner[x][y];
    if (o < 0) continue;
    if (x + 1 < W && owner[x + 1][y] >= 0 && owner[x + 1][y] !== o) add(o, owner[x + 1][y], { v: true, x: x + 1, y });
    if (y + 1 < top && owner[x][y + 1] >= 0 && owner[x][y + 1] !== o) add(o, owner[x][y + 1], { v: false, x, y: y + 1 });
  }
  const adj = rooms.map(() => []);
  const doors = [];
  for (const [k, segs] of shared) {
    const [a, b] = k.split(',').map(Number);
    adj[a].push(b);
    adj[b].push(a);
    doors.push({ a, b, ...segs[Math.floor((segs.length - 1) / 2)] });
  }

  // Which sides of a room face outside (yard, sky, the neighbours' land or the road).
  const faces = rooms.map((r) => {
    let road = 0, out = 0;
    for (let x = r.x; x < r.x + r.w; x++) {
      if (r.y === 0) road++;
      else if (outsideAt(x, r.y - 1)) out++;
      if (outsideAt(x, r.y + r.h)) out++;
    }
    for (let y = r.y; y < r.y + r.h; y++) {
      if (outsideAt(r.x - 1, y)) out++;
      if (outsideAt(r.x + r.w, y)) out++;
    }
    return { road, out };
  });

  // The way in: a front door on the road, else a front door on the yard, else a window on the road.
  const prefer = ['ldk', 'yo', 'wa', 'beran', 'gen', 'kai', 'oshi', 'bath', 'wc'];
  const gens = rooms.map((r, i) => i).filter((i) => id(rooms[i]) === 'gen');
  let entry = null;
  const roadGen = gens.find((i) => faces[i].road);
  const yardGen = gens.find((i) => faces[i].out);
  if (roadGen != null) entry = { room: roadGen, kind: 'road' };
  else if (yardGen != null) entry = { room: yardGen, kind: 'yard' };
  else {
    const onRoad = rooms.map((r, i) => i).filter((i) => faces[i].road);
    onRoad.sort((a, b) => prefer.indexOf(id(rooms[a])) - prefer.indexOf(id(rooms[b])));
    if (onRoad.length) entry = { room: onRoad[0], kind: 'window' };
  }
  if (entry) {
    // The door (or window) itself: a unit of the room's wall facing the road, else facing the yard.
    // seg = { v, x, y } as for doors; ox, oy = the spot just outside it.
    const r = rooms[entry.room];
    const road = [], yard = [];
    for (let x = r.x; x < r.x + r.w; x++) {
      if (r.y === 0) road.push({ v: false, x, y: 0, ox: x + 0.5, oy: -0.55 });
      else if (outsideAt(x, r.y - 1)) yard.push({ v: false, x, y: r.y, ox: x + 0.5, oy: r.y - 0.55 });
      if (outsideAt(x, r.y + r.h)) yard.push({ v: false, x, y: r.y + r.h, ox: x + 0.5, oy: r.y + r.h + 0.55 });
    }
    for (let y = r.y; y < r.y + r.h; y++) {
      if (outsideAt(r.x - 1, y)) yard.push({ v: true, x: r.x, y, ox: r.x - 0.55, oy: y + 0.5 });
      if (outsideAt(r.x + r.w, y)) yard.push({ v: true, x: r.x + r.w, y, ox: r.x + r.w + 0.55, oy: y + 0.5 });
    }
    const segs = road.length ? road : yard;
    entry.seg = segs[Math.floor((segs.length - 1) / 2)];
  }

  const dist = rooms.map(() => -1);
  const prev = rooms.map(() => -1);
  if (entry) {
    dist[entry.room] = 0;
    const q = [entry.room];
    while (q.length) {
      const a = q.shift();
      for (const b of adj[a]) if (dist[b] < 0) { dist[b] = dist[a] + 1; prev[b] = a; q.push(b); }
    }
  }

  const counts = Object.fromEntries(TYPES.map((t) => [t.id, 0]));
  for (const r of rooms) counts[id(r)]++;
  return { rooms, top, owner, open, gaps, adj, doors, faces, entry, dist, counts };
}

// Shortest walk (room indices, both ends included) between two rooms, or null.
export function route(an, from, to) {
  if (from === to) return [from];
  const prev = new Map([[from, -1]]);
  const q = [from];
  while (q.length) {
    const a = q.shift();
    for (const b of an.adj[a]) {
      if (prev.has(b)) continue;
      prev.set(b, a);
      if (b === to) {
        const path = [to];
        for (let c = a; c !== -1; c = prev.get(c)) path.unshift(c);
        return path;
      }
      q.push(b);
    }
  }
  return null;
}

// --- the flyer -----------------------------------------------------------------------


// The bedroom the family sleeps in (or makes do with).
function bedroom(an) {
  const { rooms, dist } = an;
  const order = ['yo', 'wa', 'ldk', 'oshi', 'kai', 'beran', 'bath', 'gen', 'wc'];
  for (const want of order) {
    const all = rooms.map((r, i) => i).filter((i) => id(rooms[i]) === want);
    if (!all.length) continue;
    const reach = all.filter((i) => dist[i] >= 0);
    return (reach.length ? reach : all).sort((a, b) => dist[b] - dist[a])[0];
  }
  return 0;
}

// A house's theme (2026-10-23): the theme whose distinct member rare rooms are the most numerous,
// when at least THEME_MIN kinds are present. Ties go to the earlier theme in THEMES. Returns
// { id, name, text, at, a, b } or null; `at` is the room the red ring marks (the first of the two
// rooms the headline names, in plan order).
export function themeOf(an) {
  const order = an.rooms.map((r) => TYPES[r.t]);
  let best = null;
  for (const th of THEMES) {
    const kinds = [];
    const seen = new Set();
    order.forEach((t, i) => {
      if (!t.rare || !th.rooms.includes(t.id) || seen.has(t.id)) return;
      seen.add(t.id);
      kinds.push({ id: t.id, i });
    });
    if (kinds.length < THEME_MIN) continue;
    // deru only when a new halloween room is actually in the house (old ?h= with just a graveyard stays)
    if (th.gate && !kinds.some((k) => th.gate.includes(k.id))) continue;
    // a qualifying 出る物件 beats every other theme, so the share says so
    const score = kinds.length + (th.id === 'deru' ? 100 : 0);
    if (!best || score > best.score) best = { th, kinds, score };
  }
  if (!best) return null;
  const a = roomTitle(TYPES[T[best.kinds[0].id]]);
  const b = roomTitle(TYPES[T[best.kinds[1].id]]);
  const name = TX ? TX.theme[best.th.id].name : best.th.name;
  const text = TX ? TX.theme[best.th.id].text(a, b) : best.th.text(a, b);
  return { id: best.th.id, name, text, at: { room: best.kinds[0].i }, a, b };
}

// Everything odd about the house, most remarkable first. Each: { key, pri, text }.
export function quirks(an) {
  const { rooms, counts, entry, dist, adj, gaps, faces } = an;
  const q = [];
  const put = (key, pri, text, at) => q.push({ key, pri, text, at });
  const name = (i) => nameOf(rooms[i]);

  rooms.forEach((r, i) => {
    const t = TYPES[r.t];
    if (!t.rare && !t.shop) return;
    const bed = rooms.findIndex((b) => isBed(b));
    const p = entry && bed >= 0 ? route(an, entry.room, bed) : null;
    const other = adj[i].map((b) => rooms[b]).find((b) => id(b) !== t.id);
    const ctx = {
      near: (want) => adj[i].some((b) => want.includes(id(rooms[b]))),
      bath: counts.bath, wc: counts.wc, other: other && nameOf(other),
      through: !!(p && p.includes(i) && p[p.length - 1] !== i),
      road: faces[i].road > 0,
    };
    // a shop heads the flyer unless there is a rare room (those stay the headline: 96 > 95.5)
    put(t.id, (t.shop ? 95.5 : 96) - q.length * 0.01, rareText(t, ctx), { room: i });
  });

  // テーマ揃いの見出し (2026-10-23): above the rare rooms (96), so it becomes the headline.
  const theme = themeOf(an);
  if (theme) put(`theme-${theme.id}`, 96.5, theme.text, theme.at);

  const over = rooms.filter((r) => r.y + r.h > H).length;
  if (over) put('over', 90, tr('over', `敷地から${over}部屋はみ出し。お隣と応相談`, over), { room: rooms.reduce((b, r, i) => (r.y + r.h > rooms[b].y + rooms[b].h ? i : b), 0) });
  if (gaps.length) {
    const n = gaps.reduce((s, g) => s + g.length, 0) * 2;
    put('gap', 86, tr('gap', `どこからも入れない謎の空間（${n}帖）あり`, n), { cells: gaps[0] });
  }
  if (entry && id(rooms[entry.room]) === 'gen' && adj[entry.room].length === 0) put('gen-alone', 88, tr('gen-alone', '玄関を開けても、どこにも行けない'), { room: entry.room });

  const lost = rooms.map((r, i) => i).filter((i) => dist[i] < 0);
  if (entry && lost.length) {
    const wc = lost.find((i) => id(rooms[i]) === 'wc');
    if (wc != null) put('lost-wc', 84, tr('lost-wc', '開かずのトイレつき'), { room: wc });
    else put('lost', 80, tr('lost', `入口のない${name(lost[0])}つき。防犯性抜群`, name(lost[0])), { room: lost[0] });
  }

  if (!counts.gen) put('gen0', 77, tr('gen0', '玄関なし。窓から出入りできる開放感'));
  else if (entry?.kind === 'yard') put('gen-yard', 66, tr('gen-yard', '玄関は裏手。お隣の庭を通ってお入りください'), { room: entry.room });
  else if (entry?.kind === 'window') put('gen-inner', 74, tr('gen-inner', '玄関が家の真ん中。帰りは窓から'), { room: rooms.findIndex((r) => id(r) === 'gen') });
  if (entry?.kind === 'window' && id(rooms[entry.room]) === 'wc') put('wc-window', 82, tr('wc-window', 'トイレの窓が勝手口'), { room: entry.room });

  if (entry) {
    const bed = rooms.map((r, i) => i).filter((i) => isBed(rooms[i]) && dist[i] > 0);
    const goals = [...bed.map((i) => [i, '寝室', 'bed']), ...rooms.map((r, i) => i).filter((i) => id(rooms[i]) === 'ldk' && dist[i] > 0).map((i) => [i, 'リビング', 'ldk'])];
    for (const [g, label, to] of goals) {
      const path = route(an, entry.room, g);
      const mid = path ? path.slice(1, -1).find((i) => ['wc', 'bath', 'oshi'].includes(id(rooms[i]))) : undefined;
      if (mid == null) continue;
      const via = id(rooms[mid]);
      if (via === 'wc') put('via-wc', 79, tr('via-wc', `${label}へはトイレを通り抜けて。家族の絆が深まる動線`, to), { room: mid });
      else if (via === 'bath') put('via-bath', 72, tr('via-bath', `${label}へは浴室経由。帰ってすぐお風呂`, to), { room: mid });
      else put('via-oshi', 70, tr('via-oshi', `押入れを抜けると${label}`, to), { room: mid });
      break;
    }
    const far = Math.max(...dist);
    if (far >= 5) put('far', 54, tr('far', `玄関から${name(dist.indexOf(far))}まで${far}部屋。家の中で散歩ができる`, name(dist.indexOf(far)), far), { room: dist.indexOf(far) });
  }

  rooms.forEach((r, i) => {
    const k = id(r), n = adj[i].length;
    if (k === 'wc' && n >= 3) put('wc-doors', 76 + n / 10, tr('wc-doors', `トイレに扉が${n}つ。落ち着かない`, n), { room: i });
    if (k === 'bath' && n >= 3) put('bath-doors', 64 + n / 10, tr('bath-doors', `浴室に扉が${n}つ。どこからでも入浴`, n), { room: i });
    if (k === 'oshi' && n >= 3) put('oshi-hub', 67 + n / 10, tr('oshi-hub', `押入れが${n}部屋につながる`, n), { room: i });
    if (k === 'beran' && !faces[i].out && !faces[i].road) put('beran-in', 71, tr('beran-in', '室内ベランダ。雨の日も洗濯物が乾かない'), { room: i });
    if (isBed(r) && !faces[i].out && !faces[i].road) put('dark', 63, tr('dark', `窓のない${nameOf(r)}。集中できる書斎に`, nameOf(r)), { room: i });
  });

  if (!counts.wc) put('wc0', 75, tr('wc0', 'トイレなし。駅のトイレまで徒歩すぐ'));
  else if (counts.wc >= 3 && counts.wc < 6) put('wc3', 69, tr('wc3', `トイレが${counts.wc}か所。家族全員、同時に入れます`, counts.wc));
  else if (counts.wc === 2) put('wc2', 40, tr('wc2', 'トイレ2か所。朝の取り合いなし'));
  if (!counts.bath) put('bath0', 60, tr('bath0', '風呂なし。近くに銭湯あり（たぶん）'));
  else if (counts.bath >= 2) put('bath2', 55, tr('bath2', `浴室が${counts.bath}つ。毎日が温泉気分`, counts.bath));
  if (counts.gen >= 2 && counts.gen < 5) put('gen2', 50, tr('gen2', `玄関が${counts.gen}つ。どこからでも帰れる`, counts.gen));
  if (!counts.ldk) put('ldk0', 58, tr('ldk0', 'LDKなし。外食派のあなたに'));
  else if (counts.ldk >= 2 && counts.ldk < 5) put('ldk2', 52, tr('ldk2', `LDKが${counts.ldk}つ。二世帯でも安心`, counts.ldk));
  if (counts.li >= 2) put('li2', 54, tr('li2', `リビングが${counts.li}つ。どこでもくつろげる`, counts.li));
  else if (counts.li === 1) put('li', 24, tr('li', 'リビングが独立。くつろぎ専用'));
  if (!counts.wa && !counts.yo) put('bed0', 62, tr('bed0', '個室なし。家族の距離が近い間取り'));
  else if (counts.wa >= 2 && counts.wa < 5) put('wa2', 35, tr('wa2', `和室が${counts.wa}間続き。旅館の風格`, counts.wa));
  if (counts.kai >= 5) { /* kai5 below */ } else if (counts.kai >= 2) put('kai2', 57, tr('kai2', `階段が${counts.kai}本。どれも2階はありません`, counts.kai));
  else if (counts.kai === 1) put('kai', 45, tr('kai', 'どこにも続かない階段つき（ロマン）'), { room: rooms.findIndex((r) => id(r) === 'kai') });
  if (counts.oshi >= 2 && counts.oshi < 5) put('oshi2', 30, tr('oshi2', `押入れ${counts.oshi}か所。収納たっぷり`, counts.oshi));
  if (counts.beran >= 2 && counts.beran < 5) put('beran2', 33, tr('beran2', `ベランダが${counts.beran}つ。洗濯物の干し場に困らない`, counts.beran));

  // 変な組み合わせ回の癖（見出しに来るよう 93。レア部屋 96 よりは下）。どれも通常回では起こり得ない数（同じ種類5つ以上・レア3種以上）なので、
  // 通常回の見出し・箇条書きには影響しない（?h= で開いたチラシにも部屋の数だけで付く）。
  const rareKinds = TYPES.filter((t) => t.rare && counts[t.id]);
  const rareN = rareKinds.reduce((s, t) => s + counts[t.id], 0);
  if (rareKinds.length >= 3) put('rare-many', 95, tr('rare-many', `レア部屋が${rareN}つ。もう何の家かわからない`, rareN));
  if (counts.wc + counts.bath >= 6 && counts.wc < 6) put('mizu', 93, tr('mizu', `水まわりが${counts.wc + counts.bath}か所。水道代は応相談`, counts.wc + counts.bath));
  if (counts.oshi >= 5) put('oshi5', 93, tr('oshi5', `押入れが${counts.oshi}か所。住む場所より しまう場所`, counts.oshi));
  if (counts.kai >= 5) put('kai5', 93, tr('kai5', `階段が${counts.kai}本。上ってみたら全部ここに戻る`, counts.kai));
  if (counts.gen >= 5) put('gen5', 93, tr('gen5', `玄関が${counts.gen}つ。帰るたびに迷う`, counts.gen));
  if (counts.wa >= 5) put('wa5', 93, tr('wa5', `和室が${counts.wa}間。もはや旅館`, counts.wa));
  if (counts.beran >= 5) put('beran5', 93, tr('beran5', `ベランダが${counts.beran}つ。洗濯物だけ住んでいる`, counts.beran));
  if (counts.roka >= 5) put('roka5', 93, tr('roka5', `廊下が${counts.roka}本。部屋より廊下が長い`, counts.roka));
  if (counts.wc >= 6) put('wc6', 93, tr('wc6', `トイレが${counts.wc}か所。もはや公衆トイレ`, counts.wc));
  if (counts.yo >= 5) put('yo5', 93, tr('yo5', `洋室が${counts.yo}室。もはやシェアハウス`, counts.yo));
  if (counts.ldk >= 5) put('ldk5', 93, tr('ldk5', `LDKが${counts.ldk}つ。${counts.ldk}世帯住宅`, counts.ldk));

  const gen = rooms.findIndex((r) => id(r) === 'gen');
  if (gen >= 0 && adj[gen].some((b) => id(rooms[b]) === 'bath')) put('gen-bath', 38, tr('gen-bath', '玄関開けたらすぐお風呂'));
  if (gen >= 0 && adj[gen].some((b) => id(rooms[b]) === 'wc')) put('gen-wc', 28, tr('gen-wc', '玄関すぐトイレ。帰宅後すぐ安心'));

  const xs = rooms.map((r) => r.x), xe = rooms.map((r) => r.x + r.w);
  const width = Math.max(...xe) - Math.min(...xs);
  if (width <= 3) put('narrow', 42, tr('narrow', `間口${(width * 1.8).toFixed(1)}m。うなぎの寝床`, (width * 1.8).toFixed(1)));
  let lot = 0;
  for (let x = 0; x < W; x++) if (an.owner[x][0] === -1 && an.open[x][0]) lot++;
  if (lot >= 2) put('park', 20, tr('park', `駐車場${Math.min(lot, 3)}台分`, Math.min(lot, 3)));

  if (!q.length) put('normal', 1, tr('normal', 'ふつうの家。ふつうがいちばん'));
  // one of each kind (the bigger one: a toilet with 4 doors over one with 3)
  const seen = new Set();
  return q.sort((a, b) => b.pri - a.pri).filter((x) => !seen.has(x.key) && seen.add(x.key));
}

export function madoriText(counts, gaps) {
  const n = counts.wa + counts.yo;
  const core = 'L'.repeat(counts.li) + (counts.ldk ? 'LDK'.repeat(counts.ldk) : counts.li ? '' : 'R');
  const rareTypes = TYPES.filter((t) => t.rare && counts[t.id]);
  const rareN = rareTypes.reduce((s, t) => s + counts[t.id], 0);
  const rare = rareTypes.length >= 5
    ? tr('rare-n', `+レア×${rareN}`, rareN)
    : rareTypes.map((t) => `+${roomTitle(t)}`).join('');
  const shop = TYPES.filter((t) => t.shop && counts[t.id]).map((t) => tr('shop', `+店舗(${roomTitle(t)})`, roomTitle(t))).join('');
  return `${n}${core}${gaps.length ? '+S' : ''}${rare}${shop}`;
}

// The rent jumps in RENT_JUMP_P of houses (the landlord's asking price, 30–99 万円).
export const RENT_JUMP_P = 0.05;
export const RENT_JUMP_MIN = 30;
export const RENT_JUMP_MAX = 99;

export function flyer(rooms, req = 0, nameIdx = 0) {
  const an = analyze(rooms);
  const code = encode(rooms, req, nameIdx);
  const rand = rng(hash(code));
  const qs = quirks(an);
  const cells = rooms.reduce((s, r) => s + r.w * r.h, 0);
  const keys = new Set(qs.map((q) => q.key));
  let rent = 1.2 + cells * 0.3 + an.counts.wc * 0.4 + an.counts.bath * 0.3 + (rand() - 0.5) * 0.6;
  if (keys.has('wc0')) rent -= 1.5;
  if (keys.has('bath0')) rent -= 1;
  if (keys.has('lost') || keys.has('lost-wc')) rent -= 1.2;
  if (keys.has('gap')) rent -= 0.8;
  if (keys.has('gen-alone')) rent -= 2;
  let walk = 1 + Math.floor(rand() * 18);
  for (const r of rooms) {
    const t = TYPES[r.t];
    if (!t.rare) continue;
    rent += t.rent;
    if (t.walk != null) walk = t.walk;
  }
  for (const r of rooms) if (TYPES[r.t].shop) rent += TYPES[r.t].rent;
  rent = Math.max(0.8, Math.round(rent * 10) / 10);
  let jump = 0;
  if (rand() < RENT_JUMP_P) {
    const m = 3 + rand() * 7;
    rent = Math.max(RENT_JUMP_MIN, Math.min(RENT_JUMP_MAX, Math.round(rent * m)));
    jump = Math.round(m * 10) / 10;
  }
  const name = buildingName(nameIdx);
  const request = { ...REQUESTS[req], text: requestText(req) };
  const { age, access } = info(code, walk);
  const bullets = jump
    ? [{ key: 'rent-jump', text: tr('rent-jump', '家賃は大家さんの言い値です') }, ...qs.slice(1, 4)].slice(0, 3)
    : qs.slice(1, 4);
  const theme = themeOf(an);
  return {
    an, code, name, quirks: qs, head: qs[0], bullets, request, ok: request.ok(an),
    madori: madoriText(an.counts, an.gaps), rent: rent.toFixed(1), sqm: (cells * SQM).toFixed(1),
    walk, jump, age, access, shop: shopOf(rooms)?.id ?? null,
    theme: theme ? { id: theme.id, name: theme.name } : null,
    limited: rooms.some((r) => TYPES[r.t].event === 'halloween'),
  };
}

// 築年数と駅徒歩 (2026-10-22): from their own rng keyed on the code, so the rent, the walk and the jump
// (drawn from rng(hash(code)) above) stay exactly as they were for every existing ?h= link.
// age / access: { key, text } — key is 'age' / 'walk' for a realistic value, else the joke's id.
// A house with a station inside (walk 0) keeps 駅徒歩0分 and never gets a walk joke.
export function info(code, walk) {
  const r = rng(hash('info' + code));
  const n = 1 + Math.floor(r() * 40);
  const a = r() < AGE_JOKE_P ? AGE_JOKES[Math.floor(r() * AGE_JOKES.length)] : null;
  const w = r() < WALK_JOKE_P && walk > 0 ? WALK_JOKES[Math.floor(r() * WALK_JOKES.length)] : null;
  return {
    age: a ? { key: a.id, text: tr(a.id, a.text) } : { key: 'age', n, text: tr('age', `築${n}年`, n) },
    access: w ? { key: w.id, text: tr(w.id, w.text) } : { key: 'walk', n: walk, text: tr('walk', `駅徒歩${walk}分`, walk) },
  };
}
// The line under the layout in the post: 築12年・駅徒歩7分.
export const infoLine = (f) => (TX ? TX.info(f.age.text, f.access.text) : `${f.age.text}・${f.access.text}`);

// Every language keeps the tag #マドリ (2026-10-22); the rest of the post is the language's own.
// 2026-10-22: the post gets a 4th line, 築年数・駅徒歩 (infoLine), before the tag — unless that would take
// it over X's limit with the two links online.js adds (23 each, on lines of their own); then it's left out.
const xWeight = (t) => [...t].reduce((n, c) => {
  const p = c.codePointAt(0);
  return n + (p <= 0x10ff || (p >= 0x2000 && p <= 0x200d) || (p >= 0x2010 && p <= 0x201f) || (p >= 0x2032 && p <= 0x2037) ? 1 : 2);
}, 0);
const POST_MAX = 280 - 2 * (23 + 1);
// The theme tag line that heads the post (2026-10-23): 【動物園物件】 in Japanese, each language's
// own brackets elsewhere (q.themeTag).
export const themeTag = (f) => (f.theme ? (TX ? TX.q.themeTag(f.theme.name) : `【${f.theme.name}】`) : '');
export const shareText = (f) => {
  const tag = themeTag(f);
  const body = TX ? TX.share(f) : `${f.name}（施主「${f.request.text}」）\n→「${f.head.text}」\n${f.madori}・家賃${f.rent}万円`;
  const full = `${tag ? `${tag}\n` : ''}${body}\n${infoLine(f)}\n#マドリ`;
  if (xWeight(full) <= POST_MAX) return full;
  const noInfo = `${tag ? `${tag}\n` : ''}${body}\n#マドリ`;
  if (xWeight(noInfo) <= POST_MAX) return noInfo;
  return `${body}\n#マドリ`;
};

// --- living there for a day ------------------------------------------------------------
// Steps: { time, text, path: [room…], out: 'leave'|'enter' } — the family walks `path` (room
// indices; 'leave' ends on the road, 'enter' starts there).

export function day(an) {
  const { rooms, entry } = an;
  const steps = [];
  const find = (k) => rooms.map((r, i) => i).filter((i) => id(rooms[i]) === k);
  const bed = bedroom(an);
  let here = bed;
  // what the family does, then the rooms it walks through (when it passes 2 or more) and the stairs
  const say = (base, path) => {
    const stairs = path.some((i) => id(rooms[i]) === 'kai');
    const names = path.length >= 4 ? path.map((i) => nameOf(rooms[i])) : null;
    if (TX) return TX.day.via(base, names, stairs);
    return `${base}${names ? `（${names.join('→')}）` : ''}${stairs ? '。階段を上って、下りる' : ''}`;
  };
  const go = (time, k, verb, none) => {
    const all = find(k);
    if (!all.length) return steps.push({ time, text: none, path: [here] });
    let best = null;
    for (const t of all) { const p = route(an, here, t); if (p && (!best || p.length < best.length)) best = p; }
    if (!best) return steps.push({ time, text: dt('cantReach', `${nameOf(rooms[all[0]])}にたどり着けない`, nameOf(rooms[all[0]])), path: [here], stuck: true });
    steps.push({ time, text: say(verb, best), path: best });
    here = best[best.length - 1];
  };

  const bedText = isBed(rooms[bed]) ? dt('wake', '起きる') : dt('wakeIn', `${nameOf(rooms[bed])}で起きる`, nameOf(rooms[bed]));
  steps.push({ time: '7:00', text: bedText, path: [bed] });
  go('7:05', 'wc', dt('toilet', 'トイレへ'), dt('noToilet', 'トイレがない'));
  go('7:20', 'ldk', dt('breakfast', '朝ごはん'), dt('noLdk', 'LDKがないので、立ったまま朝ごはん'));
  let outside = false;
  if (entry) {
    const p = route(an, here, entry.room);
    const win = entry.kind === 'window' ? nameOf(rooms[entry.room]) : null;
    if (p) {
      steps.push({ time: '7:45', text: say(dt('leave', `${win ? `${win}の窓から` : ''}出かける`, win), p), path: p, out: 'leave' });
      outside = true;
    } else steps.push({ time: '7:45', text: dt('stuckIn', '家から出られない。今日は在宅勤務'), path: [here], stuck: true });
  }
  if (outside) {
    const win = entry.kind === 'window' ? nameOf(rooms[entry.room]) : null;
    steps.push({ time: '19:00', text: dt('home', `${win ? `${win}の窓から` : ''}帰宅`, win), path: [entry.room], out: 'enter' });
    here = entry.room;
  }
  // 店舗付き住宅: after work, a turn in the family's shop
  for (const t of TYPES) if (t.shop && find(t.id).length) go('19:05', t.id, rareVerb(t), '');
  for (const t of TYPES) if (t.rare && find(t.id).length) go('19:10', t.id, rareVerb(t), '');
  go('19:30', 'bath', dt('bath', 'お風呂'), dt('noBath', '風呂がないので、銭湯へ'));
  const p = route(an, here, bed);
  if (p) {
    steps.push({ time: '22:00', text: say(dt('sleep', 'おやすみ'), p), path: p });
    here = p[p.length - 1];
  } else steps.push({ time: '22:00', text: dt('cantSleep', '寝室にたどり着けない。ここで寝る'), path: [here], stuck: true });
  // 出る物件: one more line after lights-out. Houses without a halloween room are unchanged.
  const night = nightBeat(an);
  if (night) steps.push({ time: '23:40', text: dt(night[0], night[1]), path: [here] });
  return steps;
}

function nightBeat(an) {
  const ids = new Set(an.rooms.map((r) => id(r)));
  if (!HALLOWEEN.some((r) => ids.has(r.id))) return null;
  if (ids.has('akazu')) return ['night-akazu', '開かずの間の扉が、内側から鳴る'];
  if (ids.has('ido')) return ['night-ido', '井戸の水面が揺れる。風はない'];
  if (ids.has('kagami')) return ['night-kagami', '鏡を見たら、人数が一人多い'];
  return ['night-steps', '夜中、足音。家族は誰も起きていない'];
}
