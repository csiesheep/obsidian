---
tags: [project]
status: planning
started: 2026-08-20
---
# jiangshi in the pocket

## Overview
- A second **mode** of [[zombie in the pocket]] (*Grave Errand*), in the same
  repo, same site, same URL — picked with a **switch** on the menu. The
  same house-crawl + midnight-clock loop, re-themed as a **Chinese
  hopping-vampire (殭屍, jiangshi) night** in a late-Qing corpse hostel (義莊).
- **What is new, mechanically:** the jiangshi mode has **two ways to win**.
  1. **Lay the King to rest** — find his ancestral tablet and bury it in the
     ancestral grave (the Grave Errand win, re-skinned).
  2. **Beat the Jiangshi King at midnight** — survive to the third watch and
     win the duel when he comes for you.
  Everything else carries over from the verified v1.5 ruleset.
- Grave Errand stays the default mode and must not change by a single
  card for anyone who never touches the switch.
- **Status: planning. Nothing built yet.**

## Why this, and why now
*Grave Errand* is done: engine, board, UI, art, audio, SEO, deploy
(108 commits, live). Its design was **mechanics-first, skin-last** from day
one — every player-visible string lives in `data/theme.json`, mechanics in
`tiles.json` / `cards.json` / `items.json` — precisely so a second skin would
be a data edit, not a rewrite. This project cashes that in, and adds the one
thing a pure re-skin can't: a second win condition, which is what makes it a
*different game* rather than a palette swap. Shipping it as a mode of the
existing site, rather than a second site, means one codebase, one deploy,
one SEO footprint, and every atmosphere feature built since June carries
over for free.

## Starting point — what already exists
From `C:\Users\sheep\code\zombie_in_the_pocket` (see [[zombie in the pocket plan]]):

| Layer | State | Shared or per-mode? |
|---|---|---|
| `js/engine.js` — deck, clock, combat, items, combos, flee, cower, win/lose, dread dial, phantom/scare RNG streams | done, 64 tests + 300-game fuzz | **Shared.** One hook (midnight) reads a per-mode rules block |
| `js/board.js` — dual grid, rotation, seam, zombie doors | done, 25 tests | Shared, untouched |
| `js/app.js` — turn orchestration, specials, game-over | done | Shared; gains a `midnight` branch and loses its ~45 hardcoded strings |
| `js/render.js` + `assets/icons.svg` — 14 painted tile scenes, 9 item icons, scare sprite, door/wall states, verdict art | done | Code shared; **sprite sheet per mode**, same symbol ids |
| `js/audio.js` + `assets/audio/` — 13 cues, 2 beds, score | done | Code shared; manifest per mode, files mostly shared |
| `data/theme.json` — title, 16 room names, 9 item names, 27 flavour lines, first-run note, epilogue fragments | done | **Per mode** — all new writing for jiangshi |
| `rulebook.html`, `tiles.html`, `credits.html`, `index.html` | done | Tiles page is already data-driven; rulebook hardcodes names (9× title, 4× each goal room) and must stop |
| `src/index.js` router, `wrangler.jsonc`, `sw.js`, `manifest.webmanifest`, SEO/OG | done | Shared; SW shell list grows, nothing else moves |

The ruleset itself is in [[zombie in the pocket - ruleset spec]] and
[[zombie in the pocket - rulebook]]; neither needs re-verifying.

## Setting and theme

A **義莊** — a corpse hostel on the edge of a village, where coffins wait
for the road home. The one that has waited longest holds the man the
village calls the King. Tonight the caretaker (you) has until the third
watch (三更, ≈ midnight) to put him back in the ground — or to meet him.

Every name below is a **proposal** to fill the structural slots the spec
lists under *Renaming*. Same ids as the original data files, so the
engine, board, tests and tiles page need no change.

### Rooms — indoor (the hostel)
| id | Grave Errand | Jiangshi | Role |
|---|---|---|---|
| `foyer` | Entry Hall | Gatehouse (門廳) | start |
| `bathroom` | Washroom | Washing Room (淨身房) | 1 exit — the classic dead end |
| `bedroom` | Bedchamber | Priest's Cell (道士房) | — |
| `family-room` | Parlour | Mourning Hall (靈堂) | — |
| `dining-room` | Dining Hall | Courtyard (天井) | 4 exits; the **moon gate** is the arrow door out |
| `storage` | Pantry | Coffin Store (棺材房) | bonus item |
| `kitchen` | Kitchen | Kitchen (灶房) | +1 health at turn end |
| `evil-temple` | Reliquary | Sealed Crypt (停柩房) | second card → **the tablet** |

### Rooms — outdoor (the hillside)
| id             | Grave Errand   | Jiangshi             | Role                                      |
| -------------- | -------------- | -------------------- | ----------------------------------------- |
| `patio`        | Veranda        | Back Steps (後門石階)    | seam                                      |
| `garage`       | Carriage House | Ox Shed (牛棚)         | —                                         |
| `yard-1..3`    | Lawn           | Bamboo Grove (竹林) ×3 | filler                                    |
| `sitting-area` | Arbour         | Pavilion (涼亭)        | —                                         |
| `garden`       | Herb Garden    | Herb Terrace (藥圃)    | +1 health at turn end                     |
| `graveyard`    | Family Plot    | Ancestral Grave (祖墳) | second card → **bury the tablet → win 1** |

### Items (9, one per card — mechanics identical)
| id | Mechanic | Grave Errand | Jiangshi |
|---|---|---|---|
| `board-nails` | +1 | Nailed Plank | Bamboo Pole (竹竿) |
| `grisly-femur` | +1 | Splintered Bone | Iron Hoe (鋤頭) |
| `golf-club` | +1 | Fire Iron | Coin Sword (銅錢劍) |
| `machete` | +2 | Billhook | Peachwood Sword (桃木劍) |
| `chainsaw` | +3, 2 uses, refuellable, kept when spent | Petrol Saw | Fire Lance (火銃) — 2 shots |
| `can-of-soda` | +2 health, consumed | Bottled Tonic | Sticky Rice (糯米) |
| `oil` | throw to flee unhurt; +candle = clear the room | Lamp Oil | Black Dog Blood (黑狗血) |
| `gasoline` | +candle = clear the room; +chainsaw = 2 more uses | Petrol Can | Gunpowder (火藥) |
| `candle` | enabler | Tallow Candle | Altar Lamp (長明燈) |

Words: `monsters` → "jiangshi" (no plural), `relic` → "tablet" (神主牌).
The fire-lance / gunpowder / altar-lamp triangle keeps all three combos
legible (powder + flame = blast; powder reloads the lance) — the one
mapping that had to be solved as a set, not item by item.

### Tone
Mr. Vampire (1985) is the reference everyone carries, but it's a comedy.
This should read closer to the folk source: a village, a long night, a
thing that hops because its joints are stiff with death and finds you by
your breath. Same register as Grave Errand's writing — short, concrete,
diegetic — just a different house.

## The new mechanic — win 2: the King at midnight

### What changes
In the v1.5 ruleset, needing a card at 11 PM with an empty deck **is the
loss**. In jiangshi mode, that exact moment becomes the **King's arrival**:
the third-watch drum sounds and he comes to whatever tile you stand on.
Win the duel → win the game. Die → lose. The "midnight" loss reason
disappears in this mode; the only way to lose is health 0. Grave Errand
mode keeps the midnight loss exactly as it is.

### Why the second path is a real design problem, not a flavour add
1. **It removes the clock as a loss condition.** The clock is the original
   game's whole antagonist ("21 resolvable draws, the clock is the real
   antagonist, not the zombies" — spec §1). If the duel is survivable by an
   unprepared player, the game loses its spine: every failed tablet hunt
   gets a free second try.
2. **It changes what cowering means.** Cower = +3 health for one card of
   clock. Under path 2 a player *wants* midnight to come, so cowering is
   pure upside unless something caps it. A turtle that shuffles between
   two explored rooms and cowers every turn reaches midnight with ~20 HP
   (rough count: ~10 turns × (+3 − ~1.5 avg damage)). **This is the
   degenerate strategy the design must kill**, and the numbers below are
   chosen around it.
3. **It must not trivialise path 1.** Burying the tablet should stay the
   *better* win for a run that found it — otherwise nobody explores.

### v1 design (starting numbers — to be tuned by bots, not by feel)
```js
// data/modes/jiangshi/rules.json — read by newGame(data, opts), never a
// module constant, so Grave Errand's RULES object is not touched.
{
  "midnight": "duel",       // Grave Errand: "lose"
  "healthCap": 10,          // Grave Errand: null; v1.75: 6
  "king": {
    "strength": 7,          // like a mob of seven; damage = clamp(7 − attack, 0, 4) per round
    "rounds": 3,            // the three beats of the third-watch drum (三更)
    "noFlee": true,         // there is nowhere he is not
    "noCower": true,
    "noTileEffects": true   // no kitchen / herb terrace heal mid-duel
  }
}
```
- **Three rounds, mob damage rules.** Reuses `combatDamage()` exactly, so
  the weapon table keeps its meaning: Fire Lance (attack 4) → 3 per round,
  Peachwood Sword (3) → 4, anything less → 4. The lance's **2 shots** now
  matter: round three falls back to your other weapon unless you carry
  gunpowder. That's the interplay that makes the duel a *preparation*
  puzzle rather than a dice-free formality.
- **Between rounds** you may use items: eat sticky rice (+2), throw dog
  blood or light powder at the altar lamp — these **don't kill the King**;
  each skips one round ("he flinches from the blaze"). Combos thus keep
  their value in the endgame instead of going dead at 11 PM.
- **Health cap 10** is what kills the turtle: attack 1 takes 12 over three
  rounds, so a bare-handed hoarder at 10 HP dies. Lance + powder takes 9
  (survives at 1); lance + rice nets 8; sword + rice nets exactly 10 —
  dead by one. That's a deliberately tight surface: the duel is winnable
  only by a run that found a real weapon *and* came in healthy. The cap
  barely binds on path 1 (health starts at 6, cowering is expensive), and
  the original designer floated a cap himself (spec §1).
- **The tablet in your pocket changes nothing** in v1. Tempting to have
  the King come harder (or weaker) for it — leave it for v2 once the base
  numbers are proven.

### How it is validated
The engine already has a 300-game headless fuzz. Extend it with **three
scripted bots** and measure win rate per path:
- **Hunter** — goes for the tablet, buries it. Target: win rate roughly
  what Grave Errand's is today; the duel should rarely rescue a failed hunt.
- **Duelist** — arms up, stocks health, waits for midnight. Target: wins
  *only* with a +2/+3 weapon and near-cap health; otherwise dies.
- **Turtle** — never explores past two rooms, cowers every turn. Target:
  **≈ 0 % win**. If this bot wins, the cap or the numbers are wrong.
Tune `strength`, `rounds`, `healthCap` in `rules.json` until the three
rates sit where they should. No number above ships on the strength of the
arithmetic in this note.

### Code touch points (small — the engine is built for this)
- `engine.js` — `newGame()` already takes `opts.healthCap`; extend that
  to `opts.rules` (the block above). `timePasses()` at `FINAL_HOUR`
  branches on `rules.midnight`: `"lose"` as today, `"duel"` sets
  `status = "midnight"`. New `beginDuel()` / `duelRound(state, choices)`.
- `app.js` — every `status === "lost"` guard after a draw gains a
  `"midnight"` branch into a `kingArrives()` set-piece; the duel is a
  three-beat loop over the existing combat UI (weapon choice, priced in
  hearts, combo buttons); `gameOver()` learns a second `won` flavour.
- `epilogue.js` / theme — new `open` fragments (`king-won`, `king-lost`),
  and `close` fragments must cope with "the tablet never mattered".
- `tally.js` — record *which* win, so the "house remembers you" panel
  can show both.
- Tests: duel arithmetic, cap, round skipping, lance fuel across rounds,
  plus the three bots; and a **mode-isolation test**: Grave Errand rules
  with the same seed produce the same state before and after the change.

## Architecture — one repo, two modes, a switch

**Decision (2026-08-20): the jiangshi game is a mode of the existing site,
not a fork.** A switch on the menu picks it; a new run starts in the
chosen mode; nothing switches mid-run.

The rule that keeps this honest: **code never asks which mode it is in.**
Code reads data; the mode decides which data is loaded. The one exception
is the midnight hook, and even that reads `rules.midnight`, not a mode
name. If a second `if (mode === …)` appears anywhere, the data model is
missing a field.

### The seams, file by file
| Concern | Today | With modes |
|---|---|---|
| **Mode resolution** | — | `?mode=jiangshi` in the URL wins, then `localStorage["zitp:mode"]`, then default `grave-errand`. Resolved once in `app.js` / `menu.js` before `loadData()` |
| **Theme + rules** | `data/theme.json` | `data/modes/<mode>/theme.json` + `data/modes/<mode>/rules.json`. `tiles.json` / `cards.json` / `items.json` stay at `data/` — shared mechanics |
| **Strings in code** | ~45 literals in `app.js` / `render.js` (action labels, overlay titles, log lines, `"You break ground, and begin the burial…"`) | **All move to `theme.json`.** Was optional for i18n; now mandatory, because two modes share the code and the Reliquary line cannot be shown in the Sealed Crypt |
| **Art** | `render.js: loadIcons()` fetches `assets/icons.svg` once; symbols by id (`tile-foyer`, `scene-graveyard`, `item-oil`, `scare-zombie`, `verdict-*`) | `assets/modes/<mode>/icons.svg`, **identical ids**. `loadIcons()` takes the path from the mode. No change to `icon()` or any caller |
| **Audio** | `assets/audio/manifest.json` → files | `assets/audio/manifest.<mode>.json`, cue names identical, most entries pointing at the same shared files; jiangshi overrides `murmur` (hop-thud), adds `drum`, `paper`, `breath` |
| **Look** | `:root` tokens, IM Fell via `--font-display` | `<html data-mode="jiangshi">` set before first paint; a `[data-mode="jiangshi"]` block re-tokens palette + display font. No per-mode CSS files |
| **Seeds** | `?seed=N`, `copyReplayLink()` builds `?seed=` | Replay links **must carry the mode**: `?mode=jiangshi&seed=N`. Same seed, different rules (cap, duel) → a different run, so a bare seed would replay the wrong game. `seedFromUrl()` → `runFromUrl()` |
| **Tally** | `zitp:deaths` / `zitp:escapes` | Keyed per mode: `zitp:<mode>:deaths` … The house remembers each house separately; the existing keys become Grave Errand's without migration |
| **Service worker** | `SHELL` lists one sprite, one manifest, one theme | Lists both modes' data, sprites and manifests. Bump `CACHE` as usual. Offline play covers both modes from the first visit |
| **First-run note** | `zitp:seen` once | Per mode: the jiangshi note has to teach *two* ways out, so a Grave Errand veteran must still see it |
| **Menu** | Start / Rulebook / Credits / About | A two-position switch above Start: the chosen mode's title, tagline, and (later) art. Persists the choice. `Start` opens `game.html?mode=…` |
| **Rulebook** | Names hardcoded (9× "Grave Errand", 4× Reliquary, 4× Family Plot) | Names from the active theme at load, the way `tiles.html` already does; one mode-conditional section, *The Third Watch*. Same switch in the page header |
| **Tiles page** | Data-driven already | Honours the mode; comes free |
| **Router / routes / wrangler** | `PREFIX = /zombie_in_the_pocket` | **Unchanged.** Same URL, same Worker, no new routes, no hub entry |
| **SEO** | One canonical per page, OG card for Grave Errand | Default mode keeps every existing canonical. Jiangshi gets a **landing page** `jiangshi.html` (own title, description, OG image, JSON-LD, in the sitemap) whose Start button deep-links `game.html?mode=jiangshi` — a query string is not a page a crawler will rank, a landing is |

### What this rules out
- A separate repo, Worker, slug or hub card. Everything ships at
  `games.csiesheep.com/zombie_in_the_pocket/`.
- Mid-run switching. Mode is fixed at `newGame()`.
- Per-mode copies of `engine.js`, `board.js`, `render.js`, `app.js`.

## Open decisions
- [ ] **The mode's public name.** "Jiangshi in the Pocket" is the working
      title. It sits in the "…in my Pocket" family, but as a *mode* of an
      already-renamed game the exposure is lower than last time. Decide
      before the landing page ships; the menu label can change any day.
- [ ] **Language.** English first (same audience and SEO as the hub). The
      strings-to-theme move is now a Phase 1 requirement anyway, so a
      zh-TW theme later is purely data + a CJK webfont (Noto Serif TC,
      subset, ~1 MB against IM Fell's 20 KB).
- [ ] **Display font for jiangshi mode.** Pick a Latin face that reads as
      brush/woodblock without being a chop-suey font. Shortlist when
      Phase 5 starts.
- [ ] **Does the tablet matter at midnight?** v1: no. Revisit.
- [ ] **Hard mode.** v1.75 toggle was deferred in Grave Errand too. With
      `rules.json` per mode it becomes trivial (a third "mode" that is
      Grave Errand's theme with v1.75 numbers) — but still out of scope.

## Phases
1. **The mode seam — refactor with zero behaviour change.** Move
   `theme.json` under `data/modes/grave-errand/`, add `rules.json`, make
   `loadData()` / `loadIcons()` / audio manifest / tally / first-run note /
   replay links mode-aware, pull the ~45 hardcoded strings into the theme,
   make `rulebook.html` read names from data. Only one mode exists at the
   end of this phase. **Proof:** all 101 tests pass, and a seed-diff
   harness shows 300 seeded runs produce byte-identical state traces
   before and after. *(The phase most likely to break Grave Errand, so
   it goes first, alone, with the proof.)*
2. **The duel (engine-first, test-driven).** `rules.midnight = "duel"`,
   `beginDuel()` / `duelRound()`, cap, round skipping, lance fuel; the
   three bots. **Tune the numbers here, before any UI exists.** *(The one
   phase with real design uncertainty.)*
3. **Second mode skeleton.** `data/modes/jiangshi/` with the names above
   and placeholder flavour, a copy of the Grave Errand sprite as a stand-in,
   the menu switch, `?mode=`. Jiangshi is playable end-to-end, ugly.
4. **Duel UI + staging.** The third-watch set-piece: drum, the board going
   dark, him in the doorway, three beats. Reuse the combat window; the cue
   list and the dread dial already exist, the King just pegs the dial at 1.0.
5. **Writing.** Jiangshi `theme.json` in full: 27 flavour lines, the
   first-run note (two ways out in four lines), epilogue fragments for two
   wins, rulebook section *The Third Watch*, credits line, landing page copy.
6. **Art.** `assets/modes/jiangshi/icons.svg`: 14 tile scenes, 9 item
   icons, the jiangshi sprite (poster size, hands through the wall, the one
   standing in the doorway), the King, verdict art ×3; a social card for
   the landing page; the menu's mode art. Largest block of hours; zero
   uncertainty.
7. **Audio.** `manifest.jiangshi.json`: hop-thud, watch drum, paper
   flutter, breath. Everything else points at the shared files.
8. **Ship.** Bump the SW cache, add `jiangshi.html` to the sitemap in
   `src/index.js`, OG/JSON-LD on the landing, Search Console. No routes,
   no hub change beyond the card's blurb mentioning two games.

### Critical path
1 → 2 → 3 → 4 is the chain. 5, 6, 7 depend only on 3 and on each other
not at all. **Phase 1 protects the shipped game; Phase 2 is where the
project can fail**: if no set of numbers makes the duel winnable-only-
when-earned, the second win needs a different shape (e.g. a ward item
that must be *found*, gating the duel on exploration like path 1 is).
Find that out before drawing anything.

## Risks
- **Regressing Grave Errand.** The shipped game is the thing most people
  will keep playing. Mitigated by doing the seam refactor first and alone,
  with the seed-diff proof, and by the "code never asks which mode" rule.
- **The duel is a free retry.** Mitigated by the cap + bots; see above.
- **Mode branches metastasise.** Every `if (mode)` outside the midnight
  hook is a missing data field. Review for it.
- **Cultural flattening.** Jiangshi is a real folk tradition; the easy
  version is Halloween-with-a-queue-hairstyle. Keep the hostel, the watch
  drums and the burial rites specific and quiet; no gongs.
- **Scope creep via "while I'm in there".** The mode seam is a refactor,
  not a redesign; nothing about Grave Errand's look or feel changes in
  Phase 1.
- **Naming** — see open decisions; no more than a day on it.

## Licensing
Unchanged from [[zombie in the pocket plan]]: mechanics aren't
copyrightable, expression is all ours, credit Jeremiah Lee on the credits
page. The King duel is original and owes nothing to the source.
Re-theming is explicitly encouraged by the designer's own license note.

## Next steps
- [ ] Phase 1: the mode seam, with the seed-diff proof
- [ ] Phase 2: duel in the engine + three bots; land the numbers
- [ ] Phase 3: jiangshi skeleton behind the switch
- [ ] Name decision before the landing page ships

## Layout A — the game screen, settled 2026-08-29

The direction is **攤開的桌面**: one continuous surface, no cards and no panels.
Separation is a hairline and space. Objects lie on the table with shadows; an
empty place is a ring pressed into it, never a dashed cell. Chosen over two
alternatives (**一室之內**, map-fills-the-screen; **手記**, narration-first) with
the shipped screen drawn beside them as the control.

Reference: the four directions, then Layout A at both sizes, then Layout A lit.

### The stack, both sizes

Same order in both — **房間 → 選擇 → 身上 → 手記**. First what you are holding,
then how you got here.

- **Phone 390×844** — a vertical stack.
- **Desktop 1280×800** — board field on the left; a right column carrying 身上
  and then 手記 beneath it.

### The decisions that are load-bearing

- **Health is top-right, in TWO ROWS OF FIVE**, level with a centred hour. This
  matches what #119 shipped. Ten in a line is 156px and a centred hour ends at
  227 of 390 — a single row collides. Five is 76px and clears by **70.6px**.
  Moving health out from under the hour also takes **34px** off the column.
- **Seven item places, and they are two kinds.** `hands {weapon, charm}` plus
  the tablet (slotless, but it gets a display slot) = 3, and
  `RULES.MAX_ITEMS = 4` = 4. The hairline between them is the whole
  distinction; **no labels on the objects**, per #114.
- **手記 is on screen, under the items, newest first.** The narration exists and
  today is read only to screen readers. Newest at the top, older receding
  through four greys, bad news in `--danger`, fading out at the bottom. Newest
  last opened a void under the label whenever the night was young.
- **Phone top banner**: quiet text plus one hairline, no buttons. The title is
  dropped at 390 — there is room for the four controls or the title, not both.

### The measured budget (phone)

    每個選項 64.6px — the only block that grows

                          667 viewport      ~740 viewport
    物品以上 · 2 選項       ✓ 剩 124          ✓ 剩 197
    物品以上 · 4 選項       ✗ 超出 5          ✓ 剩 68
    物品含在內 · 2 選項     ✓ 剩 26           ✓ 剩 99
    物品含在內 · 4 選項     ✗ 超出 104        ✗ 超出 31

**Unresolved:** whether the item row must sit above the fold at four options. If
it must, ~100px is available from the room (212→176), the hour band (82→60), the
option rows (64.6→56) and the banner (44→36), without touching the narration.

## Atmosphere — light, not effects

**The game already has 74 keyframes and a three-dial light model.** `--dusk`
(the clock, one direction only), `--dread` (written by `renderHour` from engine
`dread()`), and `--gutter` (the candle failing). `--gutter` sags the vignette,
the glow and the neighbour rooms **together**, and the stylesheet states why:
*light that sags everywhere at once reads as the flame failing; light that sags
in one element reads as a CSS effect.*

So the work is **not new effects**. It is connecting Layout A to the light that
exists — which Layout A is unusually good for, because with no panels the
vignette is one layer over the whole surface: the candle sags and the narration,
the object shadows and the banner go with it.

### What that means concretely

- Object shadows read `--gutter`: weak flame, short scattered shadows.
- The hour's colour interpolates toward `--flame` as `--dusk` rises.
- 中毒 tints the whole surface, because there is no panel left to tint.
- Reduced motion is inherited as-is: one slow dim and return, no second dip.

### The one problem Layout A creates

`css/style.css` records that **a gutter is 800ms during which room names sit
below the contrast floor**, which is why `candleGutter()` skips outright while a
decision is pending. That trade was made for **a few room names**. Layout A puts
**a whole column of prose** on screen under the same light. Whether the 手記
needs the same protection is a live question, not a settled one.

## Log
- 2026-08-20 — project created; plan written against the shipped Grave
  Errand codebase. Key calls: fork with shared history (not a theme
  flag); the midnight loss becomes the King's arrival; three-round duel on
  the mob damage formula plus a health cap of 10, all to be tuned by
  hunter / duelist / turtle bots before any UI or art.
- 2026-08-20 — **architecture reversed: one repo, two modes, a switch.**
  Not a fork. Same URL and Worker; mode resolved from `?mode=` →
  localStorage → default; theme + rules per mode under `data/modes/`,
  sprite per mode with identical symbol ids, audio manifest per mode,
  replay links carry the mode, tally keyed per mode, a `jiangshi.html`
  landing for SEO. Phases reordered so the seam refactor goes first with a
  seed-diff proof that Grave Errand is unchanged. The duel design and the
  theme tables are unaffected.

## Links
- [[zombie in the pocket plan]] — the parent project, incl. licensing research
- [[zombie in the pocket - ruleset spec]] — the mechanics this inherits
- [[zombie in the pocket - rulebook]] — prose rules, to be re-skinned
- [[Deploy a repo under a csiesheep.com subdomain]] — the existing deploy, unchanged
- [[betrayal sound board]] — the hub sibling
- [csiesheep/zombie_in_the_pocket](https://github.com/csiesheep/zombie_in_the_pocket) — the repo both modes ship from
