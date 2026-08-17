---
tags: [project]
status: research
started: 2026-08-13
---
# zombie in the pocket

## Overview
- Planned web implementation of the print-and-play solo board game
  *Zombie in my Pocket* (2007) by **Jeremiah Lee**.
- Same house/tile-exploration + midnight timer loop, delivered as a
  browser game. Likely sibling to [[betrayal sound board]] under
  `games.csiesheep.com`, and would carry [[google adsense|AdSense]].
- **Status: legal/licensing research done, not started building.**

## Source material

The original PnP is free and fully available — 16 tiles, 9 development
cards, ~4 printed pages, 5–20 min solo play. Find the zombie totem,
bury it in the backyard graveyard before midnight.

- [BGG entry (33468)](https://boardgamegeek.com/boardgame/33468/zombie-in-my-pocket)
- [Complete Game Package (revised) — filepage 32541](https://boardgamegeek.com/filepage/32541/zombie-in-my-pocket-complete-game-package-revised)
- [Direct rules PDF (funmines.com)](http://funmines.com/wp-content/uploads/2014/12/zimp.pdf)
- [BGG wiki — full variant list](https://boardgamegeek.com/wiki/page/Zombie_in_my_Pocket)

⚠️ **Two different games share the name.** The free PnP is BGG **33468**.
There is a separate commercial 1–8 player edition published by Cambridge
Games Factory at BGG **41372** — different rights holder, don't conflate.

## Licensing — the key constraint

The PnP is licensed **CC BY-NC-SA 3.0**, with the designer's own note:

> "Share, re-theme then share, gift, re-make, but **don't sell or make
> non-paper versions without asking**."

A web game is precisely a "non-paper version," and ads are commercial
use, so both halves of that sentence apply to this project.

| Approach | Ads OK? | Notes |
|---|---|---|
| Lift their art / card text / name, add ads | ❌ | Breaks NC outright. ShareAlike would also force the whole derivative under BY-NC-SA — incompatible with an ad-supported closed build. |
| Clean-room: own name, own art, own rewritten text | ✅ | Game **mechanics and rules systems aren't copyrightable** — only their expression is. Solid ground regardless of the license. |
| Own assets **+ written permission from Lee** | ✅ | Friendliest option; lets us credit the original openly. He's historically permissive — dozens of sanctioned "…in my Pocket" variants, plus Android and Steam Workshop ports exist. |

⚠️ **Rename before shipping.** "Zombie in The Pocket" is confusingly
close to an established title that has a commercial edition. Pick a
clearly distinct name (this note keeps the working title only).

*Not legal advice — if real revenue is attached, run it past an IP
attorney.*

## Decisions
- **2026-08-13** — Go clean-room: original theme, art and rule text;
  new title. Send Lee a courtesy email anyway, mentioning monetization
  up front. Both, not either/or.

## Next steps
- [x] Completeness audit — swept BGG for designer rulings on everything
      the rulebook leaves unsaid. **Spec is sufficient to implement.**
      3 house rules left to pick (all minor, none blocking).
- [x] Pull the full ruleset into a structured spec to code against →
      [[zombie in the pocket - ruleset spec]]
- [x] Verify the spec against the official PDF art — done 2026-08-13,
      found 4 errors in the third-party port, one of them fatal. Spec is
      now first-party verified; 3 design rulings left to make.
- [ ] Decide replacement theme + title
- [ ] Email Jeremiah Lee for permission / blessing
- [ ] Scaffold repo (follow the [[betrayal sound board]] pattern:
      static HTML/CSS/vanilla JS, Cloudflare Worker, `games.csiesheep.com`)
- [ ] SEO tiers + AdSense — reuse the [[google adsense]] playbook

## Implementation plan

Added 2026-08-14. Target: a static web game live at
`games.csiesheep.com/zombie_in_the_pocket/`, same stack and deploy path as
[[betrayal sound board]] (static HTML/CSS/vanilla JS + Cloudflare Worker,
follow [[Deploy a repo under a csiesheep.com subdomain]]). Repo already
created and cloned to `C:\Users\sheep\code\zombie_in_the_pocket`.

The spec ([[zombie in the pocket - ruleset spec]]) is code-ready and
first-party verified, so two independent workstreams: the **engine + UI**
(theme-independent, buildable now) and the **deploy shell** (a documented
recipe). The only content blocker is the still-open theme + title decision;
it gates art and flavour text, not a single line of engine code.

### Guiding decisions
- **Mechanics-first, skin-last.** Build against the spec's placeholder
  names; keep every display string + flavour line in one `data/theme.json`.
  Re-theming becomes a data edit, not a refactor. Mechanics/numbers aren't
  copyrightable and carry over untouched.
- **Keep the URL slug `zombie_in_the_pocket` for now.** It's just the
  `PREFIX` constant and is trivially changeable later. Revisit the
  *public-facing title* before shipping (⚠️ rename — too close to the
  commercial BGG 41372 edition); the slug never blocks engine work.
- **Ship v1.5 as default**, wire v1.75 as a later hard-mode toggle
  (pure constant/data changes, no new art).
- **House rules baked in** per §13 of the spec: flee = adjacent explored
  tile only; cower = once per turn; Temple/Graveyard second card = once,
  consumed on success.

### Pages / navigation
Multi-page static site (separate `.html` files, not a hash-routed SPA —
real pages index better for SEO/AdSense and keep each screen dead simple).

- **`index.html` — choice / main menu.** The landing page. Four options:
  1. **Start** → `game.html`
  2. **Rulebook** → `rulebook.html`
  3. **Credits** → `credits.html`
  4. **About me** → external link to `https://csiesheep.com`, opens in a
     **new tab** (`target="_blank" rel="noopener"`) so a game in progress
     isn't lost
- **`game.html`** — the game itself (board + HUD + log + controls).
- **`rulebook.html`** — the playable rules, built from
  [[zombie in the pocket - rulebook]] (our paraphrased clean-room text, so
  safe to publish). Doubles as a strong SEO/content page.
- **`credits.html`** — credit to the original designer **Jeremiah Lee** and
  the free PnP *Zombie in my Pocket*, plus the clean-room / CC BY-NC-SA
  attribution note. (Matches the "credit the original openly" decision.)

Every page shares `css/style.css` and a small nav back to the menu.

### Target structure (mirrors the sibling repo)
```
index.html          choice / main menu (Start · Rulebook · Credits · About)
game.html           the game: board + status HUD + log + controls
rulebook.html       playable rules (from the rulebook note; SEO content)
credits.html        original-designer credit + license attribution
css/style.css       responsive dark-horror palette, theme tokens
js/
  menu.js           menu page wiring (tiny)
  engine.js         pure game state + rules, no DOM (the spec, in code)
  board.js          tile placement, rotation, adjacency, seam, zombie doors
  render.js         draws board / HUD / log from state
  app.js            game page: wires input → engine → render; RNG; save
data/
  tiles.json        16 tiles (spec §2)
  cards.json        9 dev cards (spec §3 matrix)
  items.json        9 items (spec §4)
  theme.json        all display names + flavour text — the swappable skin
assets/             tile art + item icons (hand-authored SVG, house style)
src/index.js        Cloudflare prefix router + ads.txt / robots / sitemap
wrangler.jsonc  .assetsignore  favicon.svg  og-image.svg  README.md
```

### Phases
1. **Engine core (headless, test-driven).** Pure functions over a state
   object: setup (burn 2; no card for the starting Foyer), `turn()`
   sequence, combat (`clamp(zombies − attack, 0, 4)`; **attack never
   stacks** — one weapon, best bonus), item slots (2 + slotless totem;
   spent-but-kept refuellable chainsaw), time track (empty deck → hour++
   → reshuffle+burn; 11 PM empty = loss), win/lose. House rules baked in.
   Cover with a small test harness so the rules are provably right before
   any UI exists — this is the load-bearing part and it's fully specified.
2. **Board model.** Unbounded dual grid (indoor/outdoor) joined at the
   Dining Room → Patio seam; tile draw + free rotation with the single
   entry-edge constraint; movement legality; dead-end detection → zombie
   doors (persistent wall-to-wall holes; fire *after* the room card;
   runnable-from).
3. **UI.** Build the four pages (see [Pages / navigation](#pages--navigation)):
   the choice menu (`index.html`), the game (`game.html`), the rulebook,
   and credits. Menu + rulebook + credits are static and cheap; the game
   page is the work — render the sprawling board (pan/zoom), status HUD
   (Health / Attack / Hour / Items / Totem), an action log, and the
   interaction flow (choose exit → rotate tile → resolve card → prompts
   for item / flee / cower). Mobile-first, keyboard accessible.
4. **Art + re-theme.** Hand-authored SVG tile/item icons in the house
   style; fill `theme.json` once the setting is decided. **← needs the
   theme/title decision.**
5. **Deploy + SEO/AdSense.** Per the runbook: `wrangler.jsonc`,
   `.assetsignore` (block `.git`, `src`, `.wrangler`, …), `src/index.js`
   prefix router with `PREFIX = "/zombie_in_the_pocket"`, connect to
   Cloudflare, attach `games.csiesheep.com` custom domain. Reuse the
   AdSense `ads.txt` / `robots.txt` / `sitemap.xml` / site-verification
   pattern from [[betrayal sound board]]. SEO meta + OG image + JSON-LD.
6. **Polish (optional).** v1.75 hard-mode toggle, localStorage
   save/resume, seeded runs for sharing.

### Critical path
Phases 1 → 2 → 3 and all of Phase 5's scaffolding run **without** the
theme decision. Only Phase 4 (and the final public title) waits on it. So
the decision can be made in parallel while the engine gets built.

## Log
- 2026-08-13 — researched rules availability + licensing; confirmed
  CC BY-NC-SA 3.0 and the "non-paper versions" clause. See [[2026-08-13]].
- 2026-08-13 — full mechanical spec written up in
  [[zombie in the pocket - ruleset spec]]: constants, board/tile model,
  9-card dev deck matrix, items, turn sequence, combat, time track,
  win/lose. Rules text from a complete transcription; tile exits and
  card contents initially reconstructed from the PatrickKennedy/zombies
  JS port.
- 2026-08-13 — eyeballed the image-only PDF page by page in the browser
  and verified every tile edge and all 9 dev cards against the art.
  **4 errors found in the JS port**, incl. a fatal one (Patio listed
  with a single exit, which would have made the whole outdoor half of
  the map unreachable). Spec corrected and now first-party verified;
  only 3 genuine design rulings remain open.
- 2026-08-13 — completeness audit against the BGG forums. The rulebook
  is terse but the designer answered most edge cases there. Landed 12
  rulings in §12 of the spec, incl. two the first draft had wrong:
  **attack is never additive** (one weapon, best bonus, lost when
  dropped) and **you draw no Dev card for the starting Foyer**. Also
  confirmed we're building **v1.5** — v1.75 is a forum-only hard variant
  the designer says most players should skip. Good hard-mode toggle.
- 2026-08-13 — wrote [[zombie in the pocket - rulebook]], the playable
  rules in one place with all 🗣️ designer rulings folded inline where
  you'd actually look for them, plus the 3 🏠 house rules and a v1.75
  appendix. Paraphrased throughout, not transcribed — keeps the
  clean-room line clean.
- 2026-08-14 — created + cloned the public repo
  [csiesheep/zombie_in_the_pocket](https://github.com/csiesheep/zombie_in_the_pocket)
  (`C:\Users\sheep\code\zombie_in_the_pocket`), and wrote the
  [Implementation plan](#implementation-plan) above: mechanics-first /
  skin-last, mirror the [[betrayal sound board]] stack, 6 phases, theme
  decision is the only content blocker (gates Phase 4 only).
- 2026-08-14 — **Phases 1–3 built, committed, pushed.** The game is
  playable end-to-end on `game.html` (placeholder theme).
  - Phase 1 — headless engine (deck/clock/combat/items/combos/flee/cower/
    win-lose, house rules baked in). 31 unit tests.
  - Phase 2 — board model (dual grid, reveal+rotate placement, seam,
    door-vs-wall adjacency, dead-end zombie doors). +10 tests (41 total).
  - Phase 3 — playable UI: board/HUD render, full turn loop, flee/combo/
    weapon-choice combat, specials, win/lose overlays. Verified with a
    300-game headless fuzz (zero exceptions) + live DOM playthrough.
  - No Node on this machine → tests run in-browser (`/tests/`); Cloudflare
    builds `wrangler` in its own cloud, so that's unaffected.
  - **Remaining: Phase 4 (art + re-theme, needs the theme/title decision),
    Phase 5 (Cloudflare deploy — needs dashboard access), Phase 6 polish.**

## Links
- [[zombie in the pocket - rulebook]] — consolidated playable rules
- [[zombie in the pocket - ruleset spec]] — code-facing spec
- [BGG entry](https://boardgamegeek.com/boardgame/33468/zombie-in-my-pocket)
- [Fun Mines writeup](https://funmines.com/zimp/)
- [PNP+ — verbatim license statement](https://pnpplus.wordpress.com/2014/05/15/zombie-in-my-pocket/)
- [CC BY-NC-SA 3.0 deed](http://creativecommons.org/licenses/by-nc-sa/3.0/)
