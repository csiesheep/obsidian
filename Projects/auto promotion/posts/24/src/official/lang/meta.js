// The languages of マドリ (2026-10-22): the list, their names in the switch, the fonts, and the X card
// for a link shared in that language (worker/share.ts reads OG; the image is og-<code>.png).
// Japanese is the strings in src/; the others are lang/<code>.js.

export const LANGS = ['ja', 'en', 'ko', 'zh-Hans', 'zh-Hant', 'es', 'pt', 'fr', 'de'];
export const LANG_NAMES = {
  ja: '日本語', en: 'English', ko: '한국어', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文',
  es: 'Español', pt: 'Português', fr: 'Français', de: 'Deutsch',
};
export const LANG_SHORT = { ja: 'JA', en: 'EN', ko: 'KO', 'zh-Hans': '简', 'zh-Hant': '繁', es: 'ES', pt: 'PT', fr: 'FR', de: 'DE' };

// Canvas fonts (the flyer, the plan). Chinese and Korean need their own glyphs before the Japanese fonts.
const JP = '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", "Noto Sans CJK JP", "Yu Gothic", sans-serif';
const LATIN = `"Helvetica Neue", Arial, "Noto Sans", ${JP}`;
export const FONTS = {
  ja: JP,
  ko: `"Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", ${JP}`,
  'zh-Hans': `"PingFang SC", "Noto Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", ${JP}`,
  'zh-Hant': `"PingFang TC", "Noto Sans TC", "Noto Sans CJK TC", "Microsoft JhengHei", ${JP}`,
  en: LATIN, es: LATIN, pt: LATIN, fr: LATIN, de: LATIN,
};
// Scripts written without spaces between words: the plan stacks a tall room's name one character
// per line, and lines wrap anywhere. The others wrap at spaces and turn a tall name sideways.
export const CJK = new Set(['ja', 'zh-Hans', 'zh-Hant']);

// The X card of a link shared in that language (worker/share.ts). The same as ui.ogTitle / ui.ogDesc of
// lang/<code>.js (tests/madori-lang.test.mjs checks), copied here by sim/og.mjs so the worker doesn't load every word.
export const OG = {
  "en": { title: "Madori — drop rooms, build a house", description: "Drop rooms from a crane to build a house, and the estate agent turns it into a flyer. Three doors on the toilet, mystery space included." },
  "ko": { title: "마도리 — 방을 떨어뜨려 집을 짓자", description: "크레인으로 방을 떨어뜨려 집을 지으면, 부동산이 매물 전단지로 만들어 줍니다. 문이 3개인 화장실, 정체불명의 공간 포함." },
  "zh-Hans": { title: "Madori — 吊下房间，盖一栋房子", description: "用吊车吊下房间盖房子，中介帮你做成房源广告。厕所有3扇门，附赠神秘空间。" },
  "zh-Hant": { title: "Madori — 吊房間、蓋房子", description: "用吊車把房間放下來蓋房子，房仲幫你寫成租屋廣告。廁所有三扇門，附神秘空間。" },
  "es": { title: "Madori — suelta habitaciones y construye una casa", description: "Suelta habitaciones desde una grúa, construye una casa y la inmobiliaria la convierte en anuncio. Aseo con tres puertas y espacio misterioso incluidos." },
  "pt": { title: "Madori — solte cômodos, monte uma casa", description: "Solte cômodos de um guindaste, monte uma casa e a imobiliária faz o anúncio. Banheiro com três portas, espaço misterioso incluso." },
  "fr": { title: "Madori — lâchez des pièces, bâtissez une maison", description: "Lâchez des pièces depuis une grue pour bâtir une maison, et l’agent immobilier en fait une annonce. WC à trois portes, espace mystère inclus." },
  "de": { title: "Madori — Räume abwerfen, Haus bauen", description: "Räume per Kran abwerfen, ein Haus bauen – und der Makler macht ein Exposé daraus. WC mit drei Türen, mysteriöser Raum inklusive." },
};

// The new-game ad (src/promo.js, a test from 2026-10-24): its words in the languages it runs in. キドクスルー's name and
// description are its OG in kidokusuru/lang/meta.js.
export const PROMO = {
  'zh-Hant': {
    head: '新遊戲', title: '已讀不回',
    desc: '讀完聊天訊息，在對方轉身前回覆，不然就是已讀不回。還會被要求畫自畫像。',
    go: '玩玩看 ›', close: '關閉',
  },
};
