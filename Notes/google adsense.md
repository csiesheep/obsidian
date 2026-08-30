---
updated: 2026-08-29
tags: [runbook, adsense, monetization, hosting]
---
# Google AdSense preparation (static site under csiesheep.com)

Reference project: [[betrayal sound board]] —
first site monetized this way. Live at
`games.csiesheep.com/betrayal_sound_board/`.

> [!important] Active publisher account
> **Current: `pub-1718750784240290`** (as of 2026-08-29).
> Originally set up under **`pub-3643717374169188`**, then migrated — see
> [[#Account migration (169188 → 240290)]] below. Snippets further down
> in this note still show the *old* id `…169188` as historical examples;
> use `…240290` for anything new.

## Context
`csiesheep.com` apex = WordPress.com (fronted by Cloudflare). Static
tools/games live at `<category>.csiesheep.com/<name>/` on a Cloudflare
Worker (see [[Deploy a repo under a csiesheep.com subdomain]]). AdSense
sits on top of whichever page serves the loader snippet.

## The full pipeline (in order)

### 1. Add the loader snippet to the site's `<head>`
AdSense gives one account-wide script:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3643717374169188"
     crossorigin="anonymous"></script>
```
- Publisher id: `ca-pub-3643717374169188`.
- Additive only — no visible change, no UI impact. Loads quietly; shows
  nothing until approved + ads enabled.
- For a single-page app, "every page" = just `index.html`.
- Deploy = commit to `main` → Cloudflare redeploys (~30–60s). Verify:
  `curl -s https://games.csiesheep.com/betrayal_sound_board/ | grep ca-pub`

### 2. Verify site ownership — **watch which domain AdSense checks**
- AdSense verifies the **exact site you registered**. We registered the
  apex `csiesheep.com`, so its crawler fetched the apex HTML — but the
  loader was only on the `games.` subdomain → **"Couldn't verify your
  site."**
- Fixes:
  - **Meta-tag method** (easiest on WordPress.com, no paid plan): AdSense
    "try another method" → Meta tag → WordPress **Tools → Marketing →
    Traffic → Site verification services** → paste tag.
  - **Custom `<head>` code** on WordPress apex → needs Business plan+.
  - **Register the subdomain** (`games.csiesheep.com`) as the site
    instead of the apex — loader is already live there, may verify with
    zero WordPress work.

### 3. Get approved
Google reviews content (days → ~2 weeks). No ads render until the
approval email arrives. Blank slots before approval are normal.

### 4. Enable ads
- **Auto ads** (zero code): AdSense → Ads → By site → (site) → edit →
  Auto ads **On** → Apply. Consider disabling **Vignette** and **Anchor**
  (intrusive overlays).
- **Manual ad unit** (controlled placement): AdSense → Ads → By ad unit →
  Display ads → Responsive → Create → copy `data-ad-slot` → place `<ins>`
  block in `index.html`:
  ```html
  <ins class="adsbygoogle" style="display:block"
       data-ad-client="ca-pub-3643717374169188"
       data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
  ```

## Gotcha: Auto ads shows "0 in-page ads" on app-style pages
**Confirmed on this project.** After approval + Auto ads on, AdSense
reported `games.csiesheep.com/betrayal_sound_board/ → 0 in-page ads`.

- **Why:** Auto ads places ads by analyzing page **content/structure**
  (paragraphs, article text, feeds). A compact soundboard has almost no
  text, and its `<main>` is **JS-rendered** (empty in raw HTML), so Auto
  ads sees nothing to slot ads into → zero placements. Not a delay, a
  content problem.
- **Fix A (reliable):** use a **manual ad unit** — declaring an `<ins>`
  spot bypasses Auto ads' content analysis; the ad renders wherever the
  tag sits, thin page or not.
- **Fix B (slower, compounding):** add real text content (About /
  how-to-use / descriptions). Gives Auto ads structure to place into and
  doubles as SEO work (see [[betrayal sound board#SEO Plan|SEO plan]]).

## Verifying ad serving
- The in-app sandbox browser **blocks ad networks** — not a valid test
  surface (no `pagead2` request fires there even when the loader is
  present). Test in a **real browser**, no ad blocker, incognito to rule
  out extensions.
- Fresh approval + fresh Auto ads can take a few hours (up to ~24–48h) to
  start filling.

## Policy caveats (approval risk)
- **Thin / low-value content:** a single interactive page with little
  text is a common rejection reason. Adding written content mitigates.
- **Copyright / trademark:** *Betrayal at House on the Hill* is
  trademarked (Avalon Hill / Hasbro); this is a fan tool using sourced
  SFX. Confirm SFX licenses permit ad-monetized use — many "royalty-free"
  licenses restrict commercial/ad contexts.

## ads.txt
Resolves at the **root domain**, so for `games.csiesheep.com/...` the
file is `csiesheep.com/ads.txt` (the WordPress apex, via the **Easy Google
AdSense** plugin). The `games.` subdomain **also** serves its own
`ads.txt` from the Cloudflare Worker (`src/index.js`, inline `ADS_TXT`),
because a subdomain with its own ads.txt uses that instead of the root's.
So **two** places carry the line:
- Apex `csiesheep.com/ads.txt` → WordPress plugin (Easy Google AdSense)
- `games.csiesheep.com/ads.txt` → Worker `ADS_TXT` constant

Line format: `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`.

## Account migration (169188 → 240290)
**2026-08-29:** migrated the whole domain from `pub-3643717374169188` to
`pub-1718750784240290`. In the new account, `csiesheep.com` showed
**"Unauthorized"** — meaning the site's ads.txt didn't list the new
account's publisher id.

Surfaces that had to change (all now on `…240290`):
1. **Apex ads.txt** — WordPress "Easy Google AdSense" plugin settings.
2. **Worker ads.txt** — `ADS_TXT` in `src/index.js`.
3. **Ad loader `client=`** — `adsbygoogle.js?client=ca-pub-…` in each page.
4. **Manual ad `<ins>`** — `data-ad-client` **and** a **new `data-ad-slot`**
   (slot ids are per-account — the old `4929405343` is NOT transferable;
   create a fresh Display ad unit in the new account).

### How re-authorization works (the actual question)
- **No manual "re-authorize" button.** AdSense re-crawls `ads.txt` on its
  own schedule and flips Unauthorized → Authorized/Ready automatically.
- **Timing:** usually **24–48h**, up to ~a week. Cannot be forced (unlike
  Search Console's "Request Indexing").
- **Do:** confirm the file is 200 / `text/plain` / no redirect / correct
  id (`curl -s https://csiesheep.com/ads.txt`). Cache-bust with `?cb=N` —
  Cloudflare/WordPress can serve a stale copy for a while after an edit.
- **Don't:** remove & re-add the site or keep editing ads.txt — resets the
  crawl/review clock. Get it right once, then wait.
- A freshly-used account for the domain may also trigger a one-time **site
  review** (separate from the ads.txt check).

> One AdSense account per person is the policy norm — consolidate onto
> `…240290`; don't leave both accounts monetizing the domain.

## Related
- [[Deploy a repo under a csiesheep.com subdomain]]
- [[betrayal sound board#SEO Plan|Betrayal Sound Board — SEO plan]]
- [[betrayal sound board|Betrayal Sound Board — design]]
