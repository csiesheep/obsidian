// For each game page: what cover, description and languages does it already provide?
import fs from 'node:fs';
const [, , listPath, outPath] = process.argv;
const games = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const attr = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };
const meta = (html, key) =>
  attr(html, new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)`, 'i')) ||
  attr(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'));

async function one([id, plays, url, name]) {
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 20000);
    const r = await fetch(url, { headers: { 'user-agent': UA }, signal: ctl.signal });
    const html = await r.text();
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const ogImage = meta(html, 'og:image') || meta(html, 'twitter:image');
    let ogImageOk = null;
    if (ogImage) {
      try { const i = await fetch(new URL(ogImage, r.url), { method: 'HEAD', headers: { 'user-agent': UA } }); ogImageOk = i.ok && /image/.test(i.headers.get('content-type') || ''); } catch { ogImageOk = false; }
    }
    const desc = meta(html, 'og:description') || meta(html, 'description');
    const langs = [...new Set([...html.matchAll(/hreflang=["']([^"']+)/gi)].map(m => m[1].toLowerCase()))];
    const htmlLang = attr(html, /<html[^>]*\blang=["']([^"']+)/i);
    const cjk = (text.match(/[一-鿿]/g) || []).length;
    const latin = (text.match(/[A-Za-z]/g) || []).length;
    return { id, plays, url, name, status: r.status, title: attr(html, /<title[^>]*>([^<]*)/i), ogImage, ogImageOk, desc, descLen: desc ? desc.length : 0, hreflang: langs, htmlLang, textLen: text.length, cjk, latin, isItch: /itch\.io/.test(url) };
  } catch (e) { return { id, plays, url, name, status: 0, err: String(e.name || e) }; }
}
const out = [];
for (let i = 0; i < games.length; i += 8) out.push(...await Promise.all(games.slice(i, i + 8).map(one)));
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
const live = out.filter(x => x.status === 200);
const n = f => live.filter(f).length;
console.log({
  live: live.length,
  hasOgImage: n(x => x.ogImage), ogImageLoads: n(x => x.ogImageOk),
  hasDesc: n(x => x.descLen > 0), descAtLeast40: n(x => x.descLen >= 40),
  hasHreflang: n(x => x.hreflang.length > 1),
  hasEnAndZh: n(x => x.hreflang.some(l => l.startsWith('en')) && x.hreflang.some(l => l.startsWith('zh'))),
  mostlyCJK: n(x => x.cjk > x.latin / 3), mostlyLatin: n(x => x.cjk <= x.latin / 3),
  thinPage: n(x => x.textLen < 200),
});
