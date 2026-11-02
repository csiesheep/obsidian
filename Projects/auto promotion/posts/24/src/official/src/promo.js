// 新作の広告の試し（2026-10-24〜、繁体中文だけ）。仕組みは共通の site/common/promo.js（読み方は docs/project/kaiyu.md「ほかのゲームの広告」）。
// 自分の家を3軒建てたあと（このページで）の「もう一度」で、ブラウザごとに1回だけ腕を引く（localStorage md.promo、ad / none を半々）。
// ad はキドクスルーの広告を次の家の前にはさむ。文言は lang/meta.js の PROMO。
// 腕を引いたあとのマドリの game_start / game_end には variant（ad / none）が付く（promoArm）。引いたあとに何軒建てたかを腕ごとに比べる。
import { PROMO } from '../lang/meta.js';

const KEY = 'md.promo';
let common = null;
import('/common/promo.js').then((m) => { common = m; }).catch(() => {});

// The arm this browser drew, or null before the draw.
export function promoArm() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && v.v === 1 && (v.arm === 'ad' || v.arm === 'none') ? v.arm : null;
  } catch { return null; }
}

// Called by 「もう一度」 instead of start: next() runs at once, or after the ad is closed.
export function promoThen({ lang, houses, track, next }) {
  if (!common) { next(); return; }
  const w = PROMO[lang] ?? PROMO['zh-Hant'];
  common.promoThen({
    game: 'madori', key: KEY, arms: ['ad', 'none'], after: 3, count: houses, lang, langs: ['zh-Hant'], track, next,
    words: { head: w.head, go: w.go, close: w.close },
    target: { slug: 'kidokusuru', title: w.title, desc: w.desc, image: '/kidokusuru/og-zh-Hant.png', href: `/kidokusuru/?lang=zh-Hant&from=promo`, isNew: true },
  });
}
