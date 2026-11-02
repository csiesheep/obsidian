// Online features on se-n.com: GA4, run telemetry and X share.
// Every call fails quietly, so the game also runs from a plain static server (serve.mjs)
// where /api/* does not exist.

import { LANG } from './lang.js';

export const GAME = 'madori';
export const TITLE = 'マドリ';
export const PAGE_URL = 'https://se-n.com/madori/';
// 告知ポストの URL。games/<slug>/game.json の quote をビルドが入れる（素のファイルでは空）。
const QUOTE_URL = 'https://x.com/hitomise_com/status/2112852302621204715'.replace(/^__.*__$/, '');
// トップレベルで待たない（待つと main.js の結線が遅れ、読み込みが遅いと「はじめる」が効かない。ゴウシャの事故）。
let common = null;
const waiters = [];
export function onCommon(fn) { if (common) fn(); else waiters.push(fn); }
import('/common/after.js').then((m) => { common = m; waiters.splice(0).forEach((f) => f()); }).catch(() => {});
// 読み込み前に描いた画面には空の印を置き、読めたらその場所に差し込む（最初の画面のガイド・ほかのゲームが消えないように）。
const later = new Map();
function slot(make) {
  if (common) return make();
  const id = later.size + 1;
  later.set(id, make);
  return `<i hidden data-sn-slot="${id}"></i>`;
}
onCommon(() => {
  for (const [id, make] of later) document.querySelectorAll(`[data-sn-slot="${id}"]`).forEach((el) => { el.outerHTML = make(); });
  later.clear();
});
export const guideLink = () => slot(() => common.guideLink());
export const afterHtml = (lang = 'ja') => slot(() => common.afterHtml({ game: GAME, lang }));
export const moreRow = (placement, lang = 'ja') => slot(() => common.moreRow?.({ game: GAME, placement, lang }) ?? '');
const GA_ID = 'G-X1ZYKXK8WP';
// The address the page was opened with, read before the game drops its query (?h= a shared house),
// so GA still sees the utm_* of a link from a post (shared() below).
const LANDING = location.href;
// The game's link in a post carries utm_source x (the post intent) or sheet (the OS share sheet) and
// utm_medium share: players' posts and the launch post both arrive from t.co, and GA tells them apart this way.
const shared = (url, via = 'x') => `${url}${url.includes('?') ? '&' : '?'}utm_source=${via}&utm_medium=share`;
const LIVE = location.hostname === 'se-n.com';
const BUILD = document.querySelector('meta[name="build"]')?.content || 'dev';

// --- GA4 -------------------------------------------------------------------------

export function initAnalytics() {
  if (!LIVE) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { content_group: GAME, page_location: LANDING });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export function track(name, params = {}) {
  if (window.gtag) window.gtag('event', name, { game: GAME, ...params });
  common?.gaSee?.(GAME, name, params);
}

// --- run telemetry (worker/runs.ts) ------------------------------------------------
// One row per finished house: event 'clear', mode normal, result = the flyer's headline (quirk key),
// upgrades = every quirk key. score = rent ×10, time = seconds to build, level = rooms,
// shots = quirks, kills = rooms off the lot, pockets = enclosed gaps, combo = rooms you cannot reach.

export function sendRun(f, time) {
  const over = f.an.rooms.filter((r) => r.y + r.h > 6).length;
  const body = JSON.stringify({
    game: GAME, build: BUILD, event: 'clear', mode: 'normal', result: f.head.key,
    score: Math.round(Number(f.rent) * 10), rack: 1, time, level: f.an.rooms.length, cleared: true,
    shots: f.quirks.length, kills: over, pockets: f.an.gaps.length, combo: f.an.dist.filter((d) => d < 0).length, maxHit: 0,
    upgrades: f.quirks.map((q) => q.key).join(','),
  });
  try {
    if (!navigator.sendBeacon?.('/api/run', new Blob([body], { type: 'text/plain' }))) {
      fetch('/api/run', { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch { /* offline */ }
}

// --- X share -------------------------------------------------------------------------

// Both URLs go inside the text: a separate `url` would be appended after the quote URL.
// Another language than Japanese adds ?lang= (X's card is then in that language: worker/share.ts).
const houseUrl = (code) => `${PAGE_URL}?h=${code}${LANG === 'ja' ? '' : `&lang=${LANG}`}`;
const postText = (text, code, via) => [text, shared(houseUrl(code), via), QUOTE_URL].filter(Boolean).join('\n');
export const intentUrl = (text, code) => `https://x.com/intent/post?text=${encodeURIComponent(postText(text, code, 'x'))}`;

export function canShareImage() {
  try {
    return matchMedia('(pointer: coarse)').matches
      && !!navigator.canShare?.({ files: [new File([new Uint8Array(8)], 'a.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
}

// Made synchronously: awaiting toBlob can outlive the tap, and iOS then refuses to open the sheet.
export function pngFile(canvas, name) {
  const bin = atob(canvas.toDataURL('image/png').split(',')[1]);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return new File([buf], name, { type: 'image/png' });
}

export async function shareImage(text, code, file) {
  try {
    await navigator.share({ text: postText(text, code, 'sheet'), files: [file] });
    return 'shared';
  } catch (e) {
    return e?.name === 'AbortError' ? 'cancel' : 'fail';
  }
}
