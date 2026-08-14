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
- 🔜 **Tier 4** — Google Search Console (in progress — see below)
- ⏳ OG PNG · Tier 3(b/c) · real body content · off-page links

Shipped via PRs #7 (Tier 1+2), #8 (Tier 3a + robots). Built in the
`feature/seo` worktree at `C:/Users/sheep/code/betrayal_sound_effect_seo`.

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

### Quick wins (low effort, I can do in the seo worktree)
1. **Trim meta description to ~155 chars** — currently 194 (Google truncates).
2. **Fix "heroes" in copy** — description says "monsters, weapons, items,
   rooms, and heroes" but the catalog has **no heroes**; real categories are
   items, weapons, monsters, rooms, **omens, events**. Fix title/desc/OG copy
   to match actual content (also better keyword alignment).
3. **JSON-LD `SearchAction`** — add `potentialAction` (site-search target)
   to the WebSite node → eligibility for a sitelinks search box.
4. **Sitemap `<lastmod>`** — add a lastmod date to the URL entry.

### Medium (touches visible design — coordinate with `design/figma-horror-ui`)
5. **Strengthen the H1.** Visible H1 is just "Sound Board" — no primary
   keyword. Keep the visual, but make the H1 semantically carry
   "Betrayal at House on the Hill" (e.g. accessible text / restructure) so
   the single most-weighted heading targets the query.
6. **Add real body copy** — a short intro / "How to use" / FAQ section.
   Doubles as the fix for AdSense's "0 in-page ads" (thin page) — see
   [[google adsense|AdSense note]]. Biggest overlap win.

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
