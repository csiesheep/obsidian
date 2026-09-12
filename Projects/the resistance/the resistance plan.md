---
tags: [project]
status: building
started: 2026-09-11
---
# the resistance

## Overview
- A browser version of **The Resistance** (Don Eskridge, Indie Boards &
  Cards, 2009/2010) — the 5–10 player social-deduction game of spies and
  operatives. Two ways to play:
  1. **Single player** — you plus 4–9 AI bots, entirely in the browser.
  2. **Online room** — a four-letter code, friends join, AI bots fill any
     empty seats. Humans who drop out are taken over by a bot.
- Lives at `games.csiesheep.com/the_resistance/`, its own repo
  (`csiesheep/the_resistance`) and Worker (`the-resistance`), attached to
  the hub by path-scoped Routes — same shape as every sibling
  ([[cloudfare csiesheep.com subdomain setup runbook]]).
- Direct sibling of **Dice Wars** (`~/code/dicewars`): that repo already has
  the exact skeleton this needs — Worker router, one Durable Object per
  room, a shared engine used by both browser and server, AI seats, per-turn
  timers, reconnection tokens. This project copies that skeleton and
  replaces the game.
- Rules digest with sources: [[the resistance - rulebook]].
- **Status: M0 in progress (2026-09-11) — repo scaffolded, placeholder deploy pending.**

## Why this shape
The Resistance is 90% conversation and 10% mechanics. The mechanics are
tiny (a state machine with six phases) — the work is in three places:
1. **Information hiding.** Every seat sees a different slice of the state.
   Getting the *projection* right (what a spy sees, what a team member sees
   mid-mission, what nobody sees) is the whole correctness problem.
2. **Bots that are worth playing against.** A spy bot that fails every
   mission is caught by round two; a resistance bot that approves anything
   is a free win for spies. The bots need a real suspicion model.
3. **The room.** Phases with timers, ten seats, people dropping in and out,
   a chat so the "talk" part exists at all.

Everything else (pages, SEO, hub card, deploy) is the routine that every
game on the hub has already been through.

## Licensing — the key constraint
- **Rules and mechanics are not copyrightable.** A clean-room
  implementation of the game system is fine, as with
  [[zombie in the pocket plan]].
- **"The Resistance" is a trademark of Indie Boards & Cards**, and the card
  art, tableau art and rulebook prose are their copyright. This site would
  carry AdSense, i.e. commercial use.
- Plan: **own art, own copy, no card images, no rulebook text lifted.**
  The rulebook page on the site is written from scratch.
- ⚠️ **Naming decision needed.** The path `/the_resistance/` is the working
  URL. Shipping under the *display title* "The Resistance" is the same
  situation the zombie project chose to avoid by renaming. Options:
  (a) ship as "The Resistance — fan-made, unofficial" with a credit line
  to the designer and publisher; (b) a distinct title with a
  "compatible with / inspired by The Resistance" line. The URL can stay
  either way — `PREFIX` is independent of the title.
  *Not legal advice.*

## Source material
- Consolidated rules v1.1 (base game + The Plot Thickens), PDF:
  https://gamers-hq.de/media/pdf/78/dd/0a/The_Resisance_consolidated_rules_v1-1.pdf
- Rules walkthrough: https://www.ultraboardgames.com/the-resistance/game-rules.php
- BGG entry (41114): https://boardgamegeek.com/boardgame/41114/the-resistance
- Publisher page: https://indieboardsandcards.com/our-games/the-resistance/
- Editions/expansions overview: https://en.wikipedia.org/wiki/The_Resistance_(game)

## Rules in scope (v1 = base game, exactly)

| Players | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|
| Resistance | 3 | 4 | 4 | 5 | 6 | 6 |
| Spies | 2 | 2 | 3 | 3 | 3 | 4 |

| Mission | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|
| 1st | 2 | 2 | 2 | 3 | 3 | 3 |
| 2nd | 3 | 3 | 3 | 4 | 4 | 4 |
| 3rd | 2 | 4 | 3 | 4 | 4 | 4 |
| 4th | 3 | 3 | 4 | 5* | 5* | 5* |
| 5th | 3 | 4 | 4 | 5 | 5 | 5 |

\* and 7 players: the **4th mission needs two Fail cards** to fail.

Round = **team building** (leader proposes exactly N players, everyone
votes, majority approves, tie rejects, leader passes clockwise on a
reject) → **mission** (team members secretly play Success/Fail; operatives
*must* play Success; cards shuffled before reveal; any Fail = mission
fails, except the 4th-mission rule). First to **three** missions wins.
**Five rejected teams in one round = spies win.** The spies know each
other from the start (the "eyes closed" script becomes a private reveal
screen). Leader for round 1 is random.

**Not in v1** (data-driven so they can be added later without touching
the state machine): *The Plot Thickens* (15 plot cards — the per-card
rules are in the rulebook note), *Targeting* variant (leader picks which
mission), *Blind Spies* (skip the reveal), and the Avalon-style roles
(Merlin / Assassin / Percival / Morgana / Mordred / Oberon). Blind Spies
is a one-line option and could ship in v1 as a lobby toggle.

## Starting point — what Dice Wars already provides

| Dice Wars file | What it does | Reuse |
|---|---|---|
| `src/index.js` (102 lines) | Prefix router, `/ws` → Durable Object, prefix-scoped sitemap, redirect fix-up | Copy, change `PREFIX` |
| `src/room.js` (311 lines) | DO per room: hibernating WebSockets, one alarm for all timers, seat tokens, AI takeover on disconnect, idle deletion after 30 min | Copy the shell; replace the turn logic with the phase machine |
| `public/shared/engine.js` | Pure rules + AI, seeded RNG, same module in browser and DO | Same pattern, new content |
| `public/app.js` | Views `landing / lobby / game`, query-string routes (`?play`, `?room=ABCD`), WebSocket client, `localStorage` name | Copy the routing and socket plumbing |
| `wrangler.jsonc` | Routes, assets, `durable_objects` + `new_sqlite_classes` migration | Copy, rename |

The one thing Dice Wars does **not** have and this game needs: a
**per-seat view projection**. Dice Wars broadcasts the full state because
nothing is hidden. Here the DO must send each socket `view(state, seat)`,
never `state`.

## Architecture

```
the_resistance/
  public/
    index.html          one page, three views: landing / lobby / table
    app.js              routing, socket client, single-player driver, rendering
    style.css
    shared/
      engine.js         rules: tables, phase machine, reducer, view projection
      bots.js           suspicion model + policies (resistance / spy), 3 levels
      talk.js           templated table-talk lines from the bots, per language
    rules.html          the rulebook page (own prose), SEO target
    og-image.png, favicon.svg, manifest
  src/
    index.js            Worker: prefix router + /ws
    room.js             Durable Object: lobby, phase timers, chat, view fan-out
  tests/
    engine.test.js      node:test — every table, every phase, illegal actions
    bots.test.js        model sanity (posterior sums to 1, spies never proposed
                        an all-spy team by a resistance bot, etc.)
    sim.js              bot-vs-bot harness: N games × player counts → win rates
  wrangler.jsonc, package.json, README.md
```

### Engine (`shared/engine.js`)
- `TABLES` — the two tables above plus `twoFailsNeeded(n, mission)`.
- `createGame(seed, seats, options)` → deals roles with the seeded RNG,
  picks a random leader, `phase: "reveal"`.
- Phases: `reveal → propose → vote → mission → (score) → propose … → over`.
- One reducer: `apply(state, action)` for `ready`, `propose(team)`,
  `vote(seat, approve)`, `play(seat, success)`. Every illegal action
  throws with a reason; the UI never reaches an impossible state because
  the same function gates the buttons.
- `view(state, seat)`: role of self; fellow spies if spy; all votes only
  after every seat has voted (then they are public, per rules); mission
  cards as a *count* of fails only, never who; full history log.
  `view(state, null)` is the spectator/game-over view (everything).
- Deterministic: same seed + same actions ⇒ same game. This is what makes
  the sim harness and the tests cheap.

### Bots (`shared/bots.js`)
The model is small enough to be exact:
- There are at most C(10,4) = 210 possible spy sets. A resistance bot
  keeps a **posterior over spy sets**, starting uniform and knowing it is
  not itself a spy.
- **Hard evidence** (zero out inconsistent sets): a mission with *k* Fail
  cards ⇒ the team held ≥ k spies; a 4th-mission single Fail at 7+ ⇒
  exactly one spy on it and it still "succeeded".
- **Soft evidence** (multiply by likelihoods): approving a team that later
  failed, rejecting a team that later succeeded, proposing a failed team,
  spies' tendency to approve teams containing a spy. The likelihood
  weights are the tuning knobs.
- `P(spy | seat)` = marginal of the posterior. Everything a resistance bot
  does derives from it: **propose** the N lowest-suspicion seats (itself
  included — it *knows* it is clean); **vote** approve iff the team's
  probability of containing a spy is under a threshold, *always* approve
  the fifth proposal; **play** Success (mandatory).
- **Spy bot** knows the truth and optimises for cover: proposes teams with
  exactly one spy when it leads; approves teams containing a spy most of
  the time but not always (the "change your MO" tip in the rulebook);
  rejects clean teams unless that would look suspicious (it tracks what
  the *resistance* posterior would say about it, i.e. it runs the same
  model from a resistance point of view); plays Fail when the count of
  failures needed makes it worth it and with one spy on the team, and
  sometimes sabotages mission 1 anyway, seeded.
- Three levels: **easy** (random propose/vote with a light bias),
  **normal** (the model above), **hard** (spy bots simulate what the
  resistance model concludes about each option and pick the least
  incriminating; resistance bots add vote-pattern evidence).
- **Tuned by the harness, not by feel**: run 2 000 games per player count
  per level, record resistance win rate. The real game is known to lean
  spy at 7+; the target is "normal" bots landing in the 40–55% resistance
  band at 5–6 and lower at 7+, and "hard" spies beating "normal"
  resistance.

### Room (`src/room.js`)
- Lobby: host creates, gets a code; 5–10 seats; **Add bot** fills a seat;
  host sets level and options; **Start** when seats ≥ 5.
- Timers (one DO alarm): reveal 15 s, propose 90 s, vote 30 s, mission
  30 s, result 8 s. A timeout resolves the phase the way a bot would for
  that seat (leader's proposal auto-filled by the bot policy, missing
  vote = reject, missing mission card = Success).
- Disconnect: 20 s grace, then the seat plays as a bot until the human
  reconnects with their token — copied from Dice Wars.
- Chat: text only, broadcast, 200 chars, last 100 lines kept in the room
  state. Voice is out of scope (people will use Discord; say so on the
  page).
- Fan-out: on every change the DO sends each socket its own `view`.
  Never the whole state — that is the one rule that keeps spies secret.

### Single player
Runs the same engine and bots in the browser, no network. The seat
loop: human acts through the UI, bots act after a short delay so the
table reads as a sequence. Bot "talk" (v1.5): each bot emits a templated
line when it proposes, votes or a mission resolves, built from its own
model ("I've been on two clean missions with Dana. Taking her again.").
Pure flavour, but it is what makes the solo mode feel like the game.

## Pages and UI
One page, query-string routes (same as Dice Wars, so the build works at
any prefix):

| Route | View | What is on it |
|---|---|---|
| `/the_resistance/` | Landing | Title, one-paragraph pitch, **Play vs bots**, **Create room**, **Join** (code field), link to rules |
| `?play` | Solo setup | Players 5–10, level, your name, Blind Spies toggle → Start |
| `?room=ABCD` | Lobby | Code (big, copyable), seat list with human/bot badges, Add bot, Ready, Start (host) |
| (in game) | Reveal | Hold-to-peek card: OPERATIVE, or SPY + the other spies |
| (in game) | Table | Seat ring, 5-mission track, vote track 1–5, leader token, phase panel, chat drawer |
| Table › Propose | Leader taps N seats, others watch the picks live |
| Table › Vote | Approve / Reject; then every vote revealed with the tally |
| Table › Mission | Team members: Success / Fail (Fail is disabled for operatives) |
| Table › Result | Cards flip, mission marker set, next leader |
| (in game) | Game over | Winner, every role revealed, round-by-round history, Play again |
| `rules.html` | Rulebook | Own prose, the two tables, the variants; the SEO page |

Mockups: the *Resistance Screens* artifact (10 phone frames, 2026-09-11).
Design direction from the mockups: dark ground, blue for operative /
missions won, red for spy / missions lost, gold for the leader token;
condensed uppercase display type (poster / stencil), phone-first because
the realistic online use is everyone at a table with their phone.

## Milestones
1. **M0 — Scaffold.** Repo from the Dice Wars skeleton, `PREFIX`
   `/the_resistance`, Worker `the-resistance`, Routes, hub card + sitemap
   line in `games`. Deploys a placeholder. Half a day.
2. **M1 — Engine.** Tables, phase machine, reducer, `view`, tests for
   every player count and every illegal action. One day.
3. **M2 — Bots + harness.** Model, two policies, three levels, `sim.js`
   with win-rate tables per count and level. Tune. Two days.
4. **M3 — Solo mode.** All views against bots in the browser; the game is
   playable end to end. Two days.
5. **M4 — Rooms.** DO phase timers, per-seat view fan-out, chat, bot fill,
   disconnect takeover, reconnect. Two days.
6. **M5 — Ship.** Rules page, SEO/OG, favicon, GA, AdSense slot, README,
   hub card final copy, sitemap lastmod. One day.
7. **Later.** Bot table-talk; Blind Spies toggle if not in v1; Plot
   cards; Targeting; Avalon roles; zh-Hant strings.

## Open questions (decide before M0)
- [x] **Title and credit line** — ship as "The Resistance — fan-made,
      unofficial" with a designer/publisher credit line. (2026-09-11)
- [x] **Language** — English and traditional Chinese from the start; all
      player-visible strings in one strings file per language. (2026-09-11)
- [x] **Default player count for solo** — 7. (2026-09-11)
- [x] **Bot talk in v1.** Thin version: ~20–30 templates per language,
      picked from what the bot actually concluded. (2026-09-11)
- [ ] **Blind Spies toggle in v1?** Trivial to add; changes the bot model
      (spy bots no longer know each other).
- [ ] **Timers** — the numbers above are guesses; 90 s to propose may be
      short for a real argument.

## Decisions
- **2026-09-11** — Ship as "fan-made, unofficial" under the name The
  Resistance, with a credit line. Own art and prose regardless.
- **2026-09-11** — English + zh-Hant from v1 (`?lang=` / toggle, strings
  in `public/i18n/{en,zh-Hant}.json`). Bot talk templates are per language
  too.
- **2026-09-11** — Solo default: 7 players (3 spies, two-fail rule on
  mission 4).
- **2026-09-11** — Bot table talk ships in v1 (M3), thin.
- **2026-09-11** — M0 started: repo `csiesheep/the_resistance` created
  from the Dice Wars skeleton, placeholder page.
- **2026-09-11** — Base game only in v1; expansions data-driven for later.
- **2026-09-11** — Copy the Dice Wars skeleton rather than start clean;
  it already solved rooms, timers, reconnection and AI seats.

## Next steps
- [ ] Owner confirms the plan and the open questions above.
- [ ] M0: scaffold and deploy a placeholder at the URL.
