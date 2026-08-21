---
tags: [project]
status: planning
started: 2026-08-20
---
# jiangshi in the pocket

## Overview
- A second game on the [[zombie in the pocket]] engine: the same
  house-crawl + midnight-clock loop, re-themed as a **Chinese hopping-vampire
  (殭屍, jiangshi) night** in a late-Qing corpse hostel (義莊).
- **What is new, mechanically:** the game has **two ways to win**.
  1. **Lay the King to rest** — find his ancestral tablet and bury it in the
     ancestral grave (the Grave Errand win, re-skinned).
  2. **Beat the Jiangshi King at midnight** — survive to the third watch and
     win the duel when he comes for you.
  Everything else carries over from the verified v1.5 ruleset.
- Sibling of [[betrayal sound board]] and *Grave Errand* under
  `games.csiesheep.com`. Working title and slug: `jiangshi_in_the_pocket`.
- **Status: planning. Nothing built yet.**

## Why this, and why now
*Grave Errand* is done: engine, board, UI, art, audio, SEO, deploy
(108 commits, live). Its design was **mechanics-first, skin-last** from day
one — every player-visible string lives in `data/theme.json`, mechanics in
`tiles.json` / `cards.json` / `items.json` — precisely so a second skin would
be a data edit, not a rewrite. This project cashes that in, and adds the one
thing a pure re-skin can't: a second win condition, which is what makes it a
*different game* rather than a palette swap.

## Starting point — what already exists
From `C:\Users\sheep\code\zombie_in_the_pocket` (see [[zombie in the pocket plan]]):

| Layer | State | Carries over? |
|---|---|---|
| `js/engine.js` — deck, clock, combat, items, combos, flee, cower, win/lose, dread dial, phantom/scare RNG streams | done, 64 tests + 300-game fuzz | **Yes, untouched** except the midnight hook (see below) |
| `js/board.js` — dual grid, rotation, seam, zombie doors | done, 25 tests | Yes, untouched |
| `js/app.js` — turn orchestration, specials, game-over | done | Yes; needs a `midnight` branch |
| `js/render.js` + `assets/icons.svg` — 14 painted tile scenes, 9 item icons, scare sprite, door/wall states, verdict art | done | **No — all new art** (same ids, new drawings) |
| `js/audio.js` + `assets/audio/` — 13 cues, 2 beds, score | done | Mostly; add the King's cues |
| `data/theme.json` — title, 16 room names, 9 item names, 27 flavour lines, first-run note, epilogue fragments | done | **No — all new writing** |
| `rulebook.html`, `tiles.html`, `credits.html`, `index.html` | done | Rewrite rulebook prose; tiles page is data-driven and comes free |
| `src/index.js` router, `wrangler.jsonc`, `sw.js`, `manifest.webmanifest`, SEO/OG | done | Yes, with `PREFIX`, routes, cache name, titles changed |

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
| id | Grave Errand | Jiangshi | Role |
|---|---|---|---|
| `patio` | Veranda | Back Steps (後門石階) | seam |
| `garage` | Carriage House | Ox Shed (牛棚) | — |
| `yard-1..3` | Lawn | Bamboo Grove (竹林) ×3 | filler |
| `sitting-area` | Arbour | Pavilion (涼亭) | — |
| `garden` | Herb Garden | Herb Terrace (藥圃) | +1 health at turn end |
| `graveyard` | Family Plot | Ancestral Grave (祖墳) | second card → **bury the tablet → win 1** |

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
loss**. Here, that exact moment becomes the **King's arrival**: the
third-watch drum sounds and he comes to whatever tile you stand on. Win
the duel → win the game. Die → lose. The "midnight" loss reason disappears;
the only way to lose is health 0.

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
KING = {
  STRENGTH: 7,       // like a mob of seven; damage = clamp(7 − attack, 0, 4) per round
  ROUNDS: 3,         // the three beats of the third-watch drum (三更)
  NO_FLEE: true,     // there is nowhere he is not
  NO_COWER: true,
  NO_TILE_EFFECTS: true,   // no kitchen / herb terrace heal mid-duel
};
RULES.HEALTH_CAP = 10;     // NEW for this edition (Grave Errand: none; v1.75: 6)
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
Tune `STRENGTH`, `ROUNDS`, `HEALTH_CAP` from `data/` until the three rates
sit where they should. No number above ships on the strength of the
arithmetic in this note.

### Code touch points (small — the engine is built for this)
- `engine.js` — `timePasses()` at `FINAL_HOUR` sets `status = "midnight"`
  instead of `lost/midnight`; new `beginDuel()` / `duelRound(state,
  choices)`; `HEALTH_CAP` default; `RULES.KING` read from data.
- `app.js` — every `status === "lost"` guard after a draw gains a
  `"midnight"` branch into a `kingArrives()` set-piece; the duel is a
  three-beat loop over the existing combat UI (weapon choice, priced in
  hearts, combo buttons); `gameOver()` learns a second `won` flavour.
- `epilogue.js` / `theme.json` — new `open` fragments (`king-won`,
  `king-lost`), and `close` fragments must cope with "the tablet never
  mattered".
- `tally.js` — record *which* win, so the "house remembers you" panel
  can show both.
- Tests: duel arithmetic, cap, round skipping, lance fuel across rounds,
  plus the three bots.

## Open decisions
- [ ] **Public title.** Same issue as last time: the working title sits
      inside the "…in my Pocket" family. Lee explicitly blesses re-themes
      and the commercial BGG 41372 edition uses *my*, not *the*, so the
      risk is lower than "Zombie in The Pocket" was — but decide before
      ship, keep the slug regardless.
- [ ] **Language.** English first (same audience and SEO as the hub).
      `theme.json` covers ~90 % of the copy; the rest is ~45 strings
      hardcoded in `app.js` / `render.js` (action labels, overlay titles,
      log lines). Moving those into `theme.json` is the precondition for a
      zh-TW edition later, and worth doing *while* re-theming since every
      one of them gets touched anyway. A CJK webfont (Noto Serif TC,
      subset) is the other cost — ~1 MB even subset, against IM Fell's
      20 KB.
- [ ] **Display font.** IM Fell is the 17th-century-English voice; pick a
      Latin face that reads as brush/woodblock without being a chop-suey
      font. Shortlist when Phase 4 starts.
- [ ] **Does the tablet matter at midnight?** v1: no. Revisit.
- [ ] **Hard mode.** v1.75 toggle was deferred in Grave Errand too; same
      here. Not in scope.

## Architecture decision — fork, don't abstract
Three options:

| Option | Cost | Verdict |
|---|---|---|
| **A. New repo, cloned from `zombie_in_the_pocket` with full history** | Duplicates 7 k lines; fixes ported by `git cherry-pick` across a shared ancestry | **✅ Do this** |
| B. One repo, two skins, build-time theme selection | Art is painted SVG keyed by tile id in `render.js`/`icons.svg`, audio manifests differ, and the duel is a rules fork — it stops being "a theme" at the first new rule | ❌ |
| C. Shared engine package | No Node, no build step on this machine by design | ❌ |

Keep the file layout byte-for-byte identical so cherry-picks apply
cleanly in both directions (`git remote add grave ../zombie_in_the_pocket`).
The engine will drift by exactly one feature (the duel); everything else
should stay mergeable.

## Phases
1. **Fork + rename.** Clone with history, new GitHub repo
   `csiesheep/jiangshi_in_the_pocket`, `PREFIX`/routes/cache name/
   manifest/canonicals → `jiangshi_in_the_pocket`, `noindex` until reviewed,
   placeholder `theme.json` with the names above. Ship it to a
   `workers.dev` URL on day one so every later phase is visible live.
   *(Half a day. Purely mechanical.)*
2. **The duel (engine-first, test-driven).** Everything in *Code touch
   points* above, headless, with the three bots. **Tune the numbers here,
   before any UI exists** — this is the load-bearing phase, same as Phase 1
   was last time. *(The one phase with real uncertainty.)*
3. **Duel UI + staging.** The third-watch set-piece: drum, the board going
   dark, him in the doorway, three beats. Reuse the combat window; the
   cue list and the dread dial already exist, the King just pegs the dial
   at 1.0.
4. **Writing.** `theme.json` in full: 27 flavour lines, the first-run note
   (now it must teach *both* ways out in four lines), epilogue fragments
   for two wins, rulebook prose (new §: *The Third Watch*), credits.
5. **Art.** 14 tile scenes, 9 item icons, the jiangshi sprite (poster size,
   hands through the wall, the one standing in the doorway), the King,
   verdict art ×3, favicon/icons, social card. Largest block of hours;
   zero uncertainty.
6. **Audio.** New cues: hop-thud (replaces the murmur's shuffle), the
   watch drum, talisman-paper flutter, breath. Keep the rest.
7. **Ship.** Routes on `games.csiesheep.com`, hub card + sitemap entry in
   `~/code/games`, Search Console, drop `noindex`. Same runbook:
   [[Deploy a repo under a csiesheep.com subdomain]].

### Critical path
1 → 2 → 3 is the only chain with dependencies; 4, 5, 6 are independent
of each other and of 3, and can start the moment Phase 1's skeleton is
live. **Phase 2 is where the project can fail**: if no set of numbers
makes the duel winnable-only-when-earned, the second win needs a
different shape (e.g. a ward item that must be *found*, gating the duel
on exploration like path 1 is). Find that out before drawing anything.

## Risks
- **The duel is a free retry.** Mitigated by the cap + bots; see above.
- **Cultural flattening.** Jiangshi is a real folk tradition; the easy
  version is Halloween-with-a-queue-hairstyle. Keep the hostel, the
  watch drums and the burial rites specific and quiet; no gongs.
- **Scope creep via "while I'm in there".** Grave Errand's last 60 commits
  were atmosphere. Port them, don't redo them — the fork keeps all of it.
- **Naming** — see open decisions; no more than a day on it.

## Licensing
Unchanged from [[zombie in the pocket plan]]: mechanics aren't
copyrightable, expression is all ours, credit Jeremiah Lee on the credits
page. The King duel is original and owes nothing to the source.
Re-theming is explicitly encouraged by the designer's own license note.

## Next steps
- [ ] Phase 1: fork, rename, deploy skeleton to `workers.dev`
- [ ] Phase 2: duel in the engine + three bots; land the numbers
- [ ] Decide language scope (English-only vs. prep for zh-TW) before Phase 4
- [ ] Title decision before Phase 7

## Log
- 2026-08-20 — project created; plan written against the shipped Grave
  Errand codebase. Key calls: fork with shared history (not a theme
  flag); the midnight loss becomes the King's arrival; three-round duel on
  the mob damage formula plus a health cap of 10, all to be tuned by
  hunter / duelist / turtle bots before any UI or art.

## Links
- [[zombie in the pocket plan]] — the parent project, incl. licensing research
- [[zombie in the pocket - ruleset spec]] — the mechanics this inherits
- [[zombie in the pocket - rulebook]] — prose rules, to be re-skinned
- [[Deploy a repo under a csiesheep.com subdomain]] — ship runbook
- [[betrayal sound board]] — the hub sibling
- [csiesheep/zombie_in_the_pocket](https://github.com/csiesheep/zombie_in_the_pocket) — source repo to fork
