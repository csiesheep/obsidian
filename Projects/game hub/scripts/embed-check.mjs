// Check whether each game URL allows being shown in an iframe on another site.
import fs from 'node:fs';
const [, , listPath, outPath] = process.argv;
const games = JSON.parse(fs.readFileSync(listPath, 'utf8'));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';

async function get(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow', signal: ctl.signal });
    const body = (await r.text()).slice(0, 400000);
    return { status: r.status, final: r.url, xfo: r.headers.get('x-frame-options'), csp: r.headers.get('content-security-policy'), body };
  } catch (e) {
    return { status: 0, err: String(e.name || e) };
  } finally { clearTimeout(t); }
}

function verdict(h) {
  if (!h.status) return 'error';
  if (h.status >= 400) return 'error';
  const fa = (h.csp || '').split(';').map(s => s.trim()).find(s => /^frame-ancestors/i.test(s));
  if (fa) {
    const v = fa.replace(/^frame-ancestors/i, '').trim();
    if (/\*(\s|$)/.test(v) && !/'none'/.test(v)) return 'ok';
    return 'blocked-csp';
  }
  if (h.xfo && /deny|sameorigin/i.test(h.xfo)) return 'blocked-xfo';
  return 'ok';
}

// Code that pushes itself out of a frame (headers allow it, but the game escapes).
function bustHint(body = '') {
  return /top\.location\s*(=|\.href\s*=|\.replace)|window\.top\s*!==?\s*window\.self|self\s*!==?\s*top|top\s*!==?\s*self/i.test(body);
}

async function check(g) {
  const [id, plays, url, name] = g;
  const h = await get(url);
  const row = { id, plays, url, name, status: h.status, final: h.final, xfo: h.xfo, frameAncestors: ((h.csp || '').match(/frame-ancestors[^;]*/i) || [null])[0], verdict: verdict(h), bust: bustHint(h.body), err: h.err };
  // itch.io: the page wraps the real game in an iframe on html-classic.itch.zone; check that address too.
  if (/\.itch\.io\//.test(url) && h.body) {
    const m = h.body.match(/https?:\/\/html(?:-classic)?\.itch\.zone\/html\/[^"'&<\s]+/) || h.body.match(/https?:\/\/v6p9d9t4\.ssl\.hwcdn\.net\/html\/[^"'&<\s]+/);
    if (m) {
      const inner = await get(m[0].replace(/&quot;.*/, ''));
      row.itchInner = m[0];
      row.itchInnerVerdict = verdict(inner);
      row.itchInnerXfo = inner.xfo;
    } else {
      row.itchInner = null;
    }
  }
  return row;
}

const out = [];
for (let i = 0; i < games.length; i += 6) {
  out.push(...await Promise.all(games.slice(i, i + 6).map(check)));
  process.stderr.write(`${out.length}/${games.length}\n`);
}
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
const c = {};
for (const r of out) c[r.verdict] = (c[r.verdict] || 0) + 1;
console.log(JSON.stringify(c));
