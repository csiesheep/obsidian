// usage: node md2wp.mjs <md> <media.json> <out.json>   media: {"<basename>":{"id":N,"url":"...","width":400?}}
import fs from 'fs';
const [,, mdPath, mediaPath, outPath] = process.argv;
const media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
let src = fs.readFileSync(mdPath, 'utf8').replace(/\r/g, '');
src = src.replace(/^---\n[\s\S]*?\n---\n/, '');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(t) {
  const keep = [];
  const hold = h => { keep.push(h); return `\u0000${keep.length - 1}\u0000`; };
  t = t.replace(/<br>/g, () => hold('<br>'));
  t = t.replace(/`([^`]+)`/g, (_, c) => hold(`<code>${esc(c)}</code>`));
  // links with balanced parens in url
  let out = '', i = 0;
  while (i < t.length) {
    if (t[i] === '[') {
      const close = t.indexOf('](', i);
      if (close > 0 && !t.slice(i + 1, close).includes('[')) {
        let j = close + 2, depth = 1;
        while (j < t.length && depth > 0) { if (t[j] === '(') depth++; else if (t[j] === ')') depth--; j++; }
        if (depth === 0) {
          const text = t.slice(i + 1, close), url = t.slice(close + 2, j - 1);
          out += hold(`<a href="${esc(url)}">${text}</a>`); i = j; continue;
        }
      }
    }
    out += t[i++];
  }
  t = out;
  t = esc(t.replace(/\\#/g, '#'));
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\u0000(\d+)\u0000/g, (_, n) => keep[+n]);
  // links hold text unescaped; escape & in link text that was not escaped
  return t;
}
const lines = src.split('\n');
const blocks = [];
let para = [], list = null, table = null, quote = null;
const flushP = () => { if (para.length) { blocks.push(`<!-- wp:paragraph -->\n<p>${para.map(inline).join('<br>')}</p>\n<!-- /wp:paragraph -->`); para = []; } };
const flushL = () => { if (list) { const o = list.ordered; blocks.push(`<!-- wp:list${o ? ' {"ordered":true}' : ''} -->\n<${o ? 'ol' : 'ul'} class="wp-block-list">${list.items.map(x => `<!-- wp:list-item -->\n<li>${inline(x)}</li>\n<!-- /wp:list-item -->`).join('')}</${o ? 'ol' : 'ul'}>\n<!-- /wp:list -->`); list = null; } };
const flushT = () => { if (table) { const [h, ...rows] = table; blocks.push(`<!-- wp:table -->\n<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr>${h.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></figure>\n<!-- /wp:table -->`); table = null; } };
const flushQ = () => { if (quote) { blocks.push(`<!-- wp:quote -->\n<blockquote class="wp-block-quote"><!-- wp:paragraph -->\n<p>${quote.map(inline).join('<br>')}</p>\n<!-- /wp:paragraph --></blockquote>\n<!-- /wp:quote -->`); quote = null; } };
const flushAll = () => { flushP(); flushL(); flushT(); flushQ(); };
const endsSentence = s => /[。！？!?：:）)」』”~…]$|:\)$|XD$|orz$|:p$|:P$/i.test(s.trim());
const plainLine = s => s !== undefined && s.trim() !== '' && !/^(#|---|- |\d+\. |\||>|!\[)/.test(s.trim());
for (let n = 0; n < lines.length; n++) {
  const l = lines[n], tl = l.trim();
  let m;
  if (tl === '') {
    if (para.length && !endsSentence(para[para.length - 1]) && plainLine(lines[n + 1]) && !endsSentence(para[para.length - 1])) continue; // keep paragraph open
    flushAll(); continue;
  }
  if (/^# /.test(tl)) { flushAll(); continue; } // page H1 = post title
  if (tl === '---') { flushAll(); blocks.push('<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->'); continue; }
  if ((m = tl.match(/^### (.*)/))) { flushAll(); blocks.push(`<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${inline(m[1])}</h3>\n<!-- /wp:heading -->`); continue; }
  if ((m = tl.match(/^## (.*)/))) { flushAll(); blocks.push(`<!-- wp:heading -->\n<h2 class="wp-block-heading">${inline(m[1])}</h2>\n<!-- /wp:heading -->`); continue; }
  if ((m = tl.match(/^!\[([^\]]*)\]\(([^)]+)\)/))) {
    flushAll();
    const base = m[2].split('/').pop().replace(/\.(jpg|png|jpeg)$/i, '');
    const md_ = media[base]; if (!md_) throw new Error('no media for ' + base);
    const w = md_.width || 400;
    blocks.push(`<!-- wp:image {"id":${md_.id},"width":"${w}px","sizeSlug":"full","linkDestination":"none","align":"center"} -->\n<figure class="wp-block-image aligncenter size-full is-resized"><img src="${md_.url}" alt="${esc(m[1])}" class="wp-image-${md_.id}" style="width:${w}px"/><figcaption class="wp-element-caption">${esc(m[1])}</figcaption></figure>\n<!-- /wp:image -->`);
    continue;
  }
  if (tl.startsWith('|')) {
    flushP(); flushL(); flushQ();
    const cells = tl.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    if (cells.every(c => /^:?-+:?$/.test(c))) continue;
    (table ||= []).push(cells); continue;
  }
  if ((m = tl.match(/^> ?(.*)/))) { flushP(); flushL(); flushT(); (quote ||= []).push(m[1]); continue; }
  if ((m = tl.match(/^- (.*)/))) { flushP(); flushT(); flushQ(); if (!list || list.ordered) { flushL(); list = { ordered: false, items: [] }; } list.items.push(m[1]); continue; }
  if ((m = tl.match(/^\d+\. (.*)/))) { flushP(); flushT(); flushQ(); if (!list || !list.ordered) { flushL(); list = { ordered: true, items: [] }; } list.items.push(m[1]); continue; }
  flushL(); flushT(); flushQ();
  para.push(tl);
}
flushAll();
fs.writeFileSync(outPath, JSON.stringify(blocks.join('\n\n')));
console.log(blocks.length + ' blocks');
