# Betrayal Sound Board — SEO Plan

Fan-made sound & music board for *Betrayal at House on the Hill* (3rd Ed).
Static site (HTML/CSS/vanilla JS + Web Audio), hosted on Cloudflare (Wrangler worker).

## Current state (SEO audit)

- **Single-page static soundboard.** Worker (`src/index.js`) serves under a `/betrayal_sound_board` path prefix. **Canonical URL: `https://games.csiesheep.com/betrayal_sound_board/`** (settled 2026-08-13; old `/betrayal_sound_effect/` path retired → 404).
- `<head>` has only: generic `<title>Betrayal Sound Board</title>`, viewport, Google Fonts, stylesheet. No description, no OG, no canonical, no favicon.
- Entire board (categories, sounds, credits) is **rendered client-side by `js/app.js`** from JSON. Initial HTML `<main>` is empty → element names not in source HTML.
- Baseline positives: `lang="en"` set; one `sr-only` `<h2>` describing the app.

## Gaps, ranked by impact

### Tier 1 — Foundation (do first, ~1h)
1. ~~**Settle the canonical URL.**~~ ✅ Done — `https://games.csiesheep.com/betrayal_sound_board/`. Worker + README aligned; use this in all tags/sitemap.
2. **Rewrite `<title>`** with keywords, e.g. `Betrayal at House on the Hill Soundboard — Monster, Weapon & Room Sound Effects`.
3. **Add `<meta name="description">`** — ~150 chars, this is the search snippet.
4. **Add `<link rel="canonical">`.**

### Tier 2 — Discoverability & sharing (~1h)
5. **Open Graph + Twitter Card tags** (title, description, `og:image`). Controls link previews on Discord/Reddit/Twitter — where the board-gamer audience is. Needs one 1200×630 preview image.
6. **Favicon + apple-touch-icon** (currently none).
7. **`robots.txt` + `sitemap.xml`** — small static files; submit sitemap to Search Console.
8. **JSON-LD structured data** — `WebSite` + `WebApplication`/`SoftwareApplication`.

### Tier 3 — Content indexability (biggest long-term lever)
9. **JS-rendered content isn't reliably indexable.** Searchable terms (monster/room/weapon names, "banshee sound effect") only exist after JS runs. Options, cheapest → strongest:
   - **(a)** Expand the `sr-only` block into a static crawlable text list of every element name. *Fast, low effort, decent win.*
   - **(b)** Server-render the board list in the worker so initial HTML contains it. *Medium effort, best fit for this JS-light static site.*
   - **(c)** Per-element anchor URLs (`#banshee`) or real sub-pages for high-value terms. *Most effort; only if targeting individual-sound rankings.*

### Tier 4 — Off-page & measurement (ongoing)
10. **Google Search Console** + submit sitemap; optional Bing Webmaster Tools.
11. **Core Web Vitals** — already lean static; verify with Lighthouse.
12. **Earn links** — BoardGameGeek forums, relevant subreddits. Main real ranking lever for a niche fan tool.

## Recommended sequence

1. **Tier 1 + Tier 2 in one pass** (~2h): all `<head>` edits + robots/sitemap/JSON-LD + one OG image.
2. **Tier 3 (a)** as quick follow-up.
3. **Search Console** to start measuring.
4. Layer on Tier 3 (b/c) and Tier 4 links later — slower, higher ceiling.

## Resolved decisions

- **Canonical production URL** (2026-08-13): `https://games.csiesheep.com/betrayal_sound_board/`. Worker `PREFIX` set accordingly; old `/betrayal_sound_effect/` path is a hard 404 (no redirect). Use this URL for `<link rel="canonical">`, OG tags, sitemap, and Search Console.
