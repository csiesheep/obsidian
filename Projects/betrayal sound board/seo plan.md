# Betrayal Sound Board — SEO Plan

Fan-made sound & music board for *Betrayal at House on the Hill* (3rd Ed).
Static site (HTML/CSS/vanilla JS + Web Audio), hosted on Cloudflare (Wrangler worker).
**Canonical URL:** `https://games.csiesheep.com/betrayal_sound_board/`

> Status legend: ✅ done & live · 🔜 recommended next · ⏳ later / higher effort

## Progress snapshot (updated 2026-08-13)

- ✅ **Tier 1** — title, meta description, canonical, theme-color
- ✅ **Tier 2** — Open Graph + Twitter tags, favicon.svg, robots.txt + sitemap.xml (served at host root by the Worker), JSON-LD (WebSite + WebApplication)
- ✅ **Tier 3(a)** — `<noscript>` static catalog of all 158 elements (raw-HTML crawlable fallback)
- ✅ **robots.txt** trimmed (Cloudflare Managed robots.txt supplies the UA group; we only add the Sitemap directive)
- ✅ **Quick wins** — meta description trimmed to ~140 chars; "heroes" fixed → real categories (items, weapons, monsters, rooms, omens, events) across desc/OG/Twitter/JSON-LD; JSON-LD `SearchAction` + real `?q=` deep-linking in app.js; sitemap `<lastmod>`
- ✅ **Body content** — About / "Great for more than Betrayal" uses list / 5-item FAQ (`<details>`) below the board. Targets adjacent long-tail (Halloween party, D&D / Call of Cthulhu, horror movie night, escape room, mobile) without diluting the title; also mitigates AdSense "0 in-page ads"
- 🔜 **Tier 4** — Google Search Console (in progress — see below)
- ⏳ OG PNG · H1 keyword · Tier 3(b/c) · off-page links

Shipped via PRs #7 (Tier 1+2), #8 (Tier 3a + robots), #9 (quick wins),
#10 (About/FAQ) — all merged & live. Built in the `feature/seo` worktree
at `C:/Users/sheep/code/betrayal_sound_effect_seo`.

**Concurrent session** also landed on `main` (not by the SEO worktree):
a bottom **AdSense** display unit (`data-ad-slot=4929405343`), a **GSC
URL-prefix** verification file handler in the Worker, and `/` now
301-redirects to the app prefix (was 404).

## Tier 4 — Search Console (active)

Property choice: **Domain property `csiesheep.com`** (covers all subdomains
+ future games/tools; sitemap at the subdomain root is in scope).

1. GSC → Add property → **Domain** → `csiesheep.com` → copy the TXT value.
2. Cloudflare → csiesheep.com zone → DNS → Add record: **TXT**, name `@`,
   content = `google-site-verification=…`, TTL Auto. Save.
3. GSC → **Verify**.
4. GSC → **Sitemaps** → submit `https://games.csiesheep.com/sitemap.xml`.
5. (optional) **URL Inspection** on the canonical URL → **Request Indexing**.

Data (impressions/clicks/queries) populates over the following days.

## Further opportunities (from 2026-08-13 re-audit)

### Quick wins — ✅ DONE (PR #9)
1. ✅ Meta description trimmed to ~140 chars (was 194).
2. ✅ "heroes" removed → real categories (items, weapons, monsters, rooms,
   omens, events) across description / OG / Twitter / JSON-LD.
3. ✅ JSON-LD `SearchAction` added, backed by real `?q=` deep-linking in
   `app.js` (pre-fills search on load; shareable filtered links).
4. ✅ Sitemap `<lastmod>` added.

### Medium
5. 🔜 **Strengthen the H1.** Visible H1 is still just "Sound Board" — no
   primary keyword. Keep the visual, but make the H1 semantically carry
   "Betrayal at House on the Hill" so the most-weighted heading targets the
   query. Touches visible design — coordinate with `design/figma-horror-ui`.
6. ✅ **Body copy DONE (PR #10)** — About / "Great for more than Betrayal" /
   5-item FAQ below the board. Broader keywords without title dilution; also
   the AdSense thin-page fix — see [[google adsense|AdSense note]].

### Higher effort (biggest ceiling)
7. **Tier 3(b)** — server-render the board list in the Worker so the full
   catalog is in the *initial* HTML (not just noscript). Best fit for this
   JS-light static site.
8. **Tier 3(c)** — per-element anchor URLs (`#banshee`) or real sub-pages
   for high-value terms ("banshee sound effect"); expand sitemap accordingly.
9. **OG PNG (1200×630)** — export from `og-image.svg`; needed because
   Twitter/Facebook/LinkedIn don't fetch SVG `og:image`. No rasteriser was
   available in the build env, so this is pending an export.

### Off-page & measurement (ongoing)
10. Earn links: BoardGameGeek forums, r/BetrayalAtHouse / r/boardgames.
11. Core Web Vitals: verify Cloudflare brotli/gzip is active on HTML;
    consider better `Cache-Control` on the HTML (currently `max-age=0,
    must-revalidate`). Fonts already use `display=swap` + preconnect.

## Resolved decisions

- **Canonical production URL** (2026-08-13): `https://games.csiesheep.com/betrayal_sound_board/`. Worker `PREFIX` set accordingly; old `/betrayal_sound_effect/` path is a hard 404. Use for `<link rel="canonical">`, OG tags, sitemap, Search Console.
- **GSC property type** (2026-08-13): Domain property `csiesheep.com` (DNS TXT), not URL-prefix — future-proofs all subdomains/tools.
- **Tier 3(a) technique**: `<noscript>` static catalog, not `sr-only`, to avoid screen readers announcing all 158 names twice on the live JS page.
