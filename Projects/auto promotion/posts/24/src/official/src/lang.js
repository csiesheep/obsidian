// Languages (2026-10-22). Japanese is the strings in house.js / rare.js and JA below; the other eight are
// lang/<code>.js (every word the game writes), loaded when picked. lang/meta.js: the list, fonts, CJK.
// Order of choice (as ドットモジ): the switch on the title → the device's languages → the link's ?lang=
// (the language it was shared in) → English.
import { setText } from './house.js';
import { LANGS, FONTS } from '../lang/meta.js';

// Japanese words of the screen and the flyer (the same as index.html, so the page reads the same before
// any script runs).
export const JA = {
  docTitle: 'マドリ — 部屋を落として家を建てる',
  title: 'マドリ', sub: '部屋を落として、家を建てる', go: 'はじめる',
  zukan: 'レア部屋の図鑑', close: 'とじる', unknown: '？？？', next: 'つぎ', hint: 'タップで落とす',
  stage: '敷地', plan: '間取り図',
  client: (t) => `施主「${t}」`, ok: '要望どおり', ng: '要望と違う', newBuild: '新築', limited: '期間限定',
  rent: (r) => ['家賃', r, '万円'],
  // the line under the layout: area, then 築年数 and 駅徒歩 (f.age.text, f.access.text), joined by sep
  sub2: (sqm) => `専有面積 ${sqm}㎡`, sep: ' ／ ',
  post: 'でポスト', save: '画像を保存', again: 'もう一度', mine: '自分も建てる', watch: '住んでみる',
  done: '完成', newRare: (n) => `NEW ${n}`, road: '道路', footer: 'マドリ  se-n.com/madori',
  area: (jo, wa) => `${jo}${wa ? '畳' : '帖'}`, lang: '言語', vote: '投票',
};

export let LANG = 'ja';
export let UI = JA;
export let FONT = FONTS.ja;

export function matchLang(tag = '') {
  const t = tag.toLowerCase();
  if (t.startsWith('zh')) return /hant|-tw|-hk|-mo/.test(t) ? 'zh-Hant' : 'zh-Hans';
  const b = t.split('-')[0];
  return LANGS.includes(b) ? b : null;
}

const KEY = 'md.lang';
export function pickLang() {
  try { const saved = localStorage.getItem(KEY); if (LANGS.includes(saved)) return saved; } catch { /* storage blocked */ }
  for (const l of navigator.languages?.length ? navigator.languages : [navigator.language]) { const m = matchLang(l); if (m) return m; }
  return matchLang(new URLSearchParams(location.search).get('lang') ?? '') ?? 'en';
}
export function saveLang(l) { try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ } }

// Loads the table (Japanese needs none) and makes it current for house.js and the drawing. Resolves the
// language actually in use (Japanese if the file fails to load).
export async function setLang(l) {
  let table = null;
  if (l !== 'ja') {
    try { table = (await import(`../lang/${l}.js`)).default; } catch { l = 'ja'; }
  }
  setText(table);
  LANG = l;
  UI = table ? table.ui : JA;
  FONT = FONTS[l];
  return l;
}

// The page's fixed words: elements with data-t (text) and data-t-aria (aria-label).
export function applyText(doc = document) {
  doc.documentElement.lang = LANG;
  doc.title = UI.docTitle;
  for (const el of doc.querySelectorAll('[data-t]')) el.textContent = UI[el.dataset.t];
  for (const el of doc.querySelectorAll('[data-t-aria]')) el.setAttribute('aria-label', UI[el.dataset.tAria]);
}
