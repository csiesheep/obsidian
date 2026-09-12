---
tags: [project]
status: building
started: 2026-09-11
---
# tiandihui 天地會

## Overview
- **天地會 / Tiandihui Brotherhood** — a 5–10 player social-deduction game
  of sworn brothers and Qing informers, under its own name and setting.
  The play is the well-known mission-and-vote system (see
  [[tiandihui - rulebook]]); the name, theme, art and prose are ours.
  Two ways to play:
  1. **Single player** — you plus 4–9 AI bots, entirely in the browser.
  2. **Online room** — a four-letter code, friends join, AI bots fill any
     empty seats. Humans who drop out are taken over by a bot.
- Lives at `games.csiesheep.com/tiandihui/`, its own repo
  (`csiesheep/tiandihui`) and Worker (`tiandihui`), attached to
  the hub by path-scoped Routes — same shape as every sibling
  ([[cloudfare csiesheep.com subdomain setup runbook]]).
- Direct sibling of **Dice Wars** (`~/code/dicewars`): that repo already has
  the exact skeleton this needs — Worker router, one Durable Object per
  room, a shared engine used by both browser and server, AI seats, per-turn
  timers, reconnection tokens. This project copies that skeleton and
  replaces the game.
- Rules digest with sources: [[tiandihui - rulebook]].
- **Status: renamed and relaunched as 天地會 (2026-09-12). M0–M4 done and live at `/tiandihui/`. M5 (ship: drop noindex, OG image, hub card, AdSense) next.**

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

## Licensing — resolved 2026-09-12
- **Copyright risk was always low.** Rules and mechanics are not
  copyrightable; the player-count and team-size tables are part of the
  system, not expression. No official art, card faces or rulebook prose
  was ever used. Every string, icon and page on the site is written or
  drawn here.
- **The real risk was trademark**, not copyright: using another
  publisher's product name as the name of our own similar product, on a
  page that carries ads. "Fan-made, unofficial" is a mitigating factor,
  not a defence.
- **Fixed by renaming**, the same call [[zombie in the pocket plan]] made.
  The game now has its own name (天地會 / Tiandihui Brotherhood), its own
  setting (a Qing-era sworn brotherhood infiltrated by court informers)
  and its own faction words. The original is credited exactly once, in the
  footer, as the design that inspired the play — nominative reference,
  which is what it is for.
- Still true: no official art, no lifted text, own rules page.
  *Not legal advice.*

## Source material
- Consolidated rules v1.1 (base game + The Plot Thickens), PDF:
  https://gamers-hq.de/media/pdf/78/dd/0a/The_Resisance_consolidated_rules_v1-1.pdf
- Rules walkthrough: https://www.ultraboardgames.com/the-resistance/game-rules.php
- BGG entry (41114): https://boardgamegeek.com/boardgame/41114/the-resistance
- Publisher page: https://indieboardsandcards.com/our-games/the-resistance/
- Editions/expansions overview: https://en.wikipedia.org/wiki/The_Resistance_(game)

## Theme (from 2026-09-12)

| slot | before | now (zh) | now (en) |
|---|---|---|---|
| title | The Resistance | 天地會 | Tiandihui Brotherhood |
| good side | Resistance | 天地會 | The Brotherhood |
| good role | Operative | 兄弟 | Brother |
| evil side | Spies | 清廷 | The Qing |
| evil role | Spy | 密探 | Informer |
| bot names | Dana, Marco… | 阿七、石頭、馬三… | Ah Qi, Shitou, Ma San… |
| favicon | abstract circle | the three-sided 天地人 mark the society signed with | |

Blue stays the brotherhood, red stays the Qing, gold stays the leader.
Mission / 任務 kept as-is: it is a generic word and the clearest one.

## 天時 deck / The Hour (from 2026-09-12)

An optional deck, off by default, toggled in solo setup and in the room
lobby. Six face-up cards; one is drawn at the start of every round and
holds for that round only. Drawn cards are not returned, so a five-round
game shows five of the six and the table can count what is left.

| id | 名 | English | effect | draw rule |
|---|---|---|---|---|
| light | 輕裝 | Travel Light | team one short (two-fail rule unchanged) | not on a 2-seat mission |
| signed | 畫押 | Signed | no shuffle; who played what is public | any |
| orders | 密令 | Orders from Above | informers on the team must play Fail, so a success clears the team | any |
| wounded | 掛彩 | Laid Up | one random seat cannot be proposed this round | not on mission 5 |
| silence | 封口 | Hold Your Tongue | no chat, no bot talk, for the round and its reveal | any |
| quiet | 無事 | Quiet Night | nothing | any |

Renamed from the owner's first list (精兵 / 記名 / 清廷密令 / 傷員 / 噤聲 /
平常日). The deck name 天時 pairs with 天地會 and means "what heaven deals".

**Balance, bots vs bots, normal/normal, 200 games a cell, resistance win %:**

| players | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|
| deck off | 56 | 67 | 49 | 36 | 34 | 42 |
| deck on | 67 | 71 | 54 | 45 | 47 | 50 |

The deck favours the brotherhood by 4–13 points at every count. Likely
drivers: 畫押 (spies will not fail a signed round unless it wins, so it is
close to a free success) and 密令 (a success certifies a whole team, and a
failure gives an exact spy count). Bots were not retuned for the deck, so
this is a signal, not a verdict. To attribute it per card, the engine would
need a custom-deck option for the harness.

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
- **2026-09-12** — Added the 天時 deck as an option, off by default, like
  blind informers. Not a core rule: it measurably shifts balance toward the
  brotherhood.
- **2026-09-12** — Renamed to 天地會 / Tiandihui Brotherhood and moved to
  `/tiandihui/`, on trademark grounds (see Licensing). New repo cloned
  from the old one so all 11 commits of history came along. Engine, bots
  and room code untouched; only player-visible strings changed.
- **2026-09-11** — Ship as "fan-made, unofficial" under the name The
  Resistance, with a credit line. Own art and prose regardless.
- **2026-09-11** — English + zh-Hant from v1 (`?lang=` / toggle, strings
  in `public/i18n/{en,zh-Hant}.json`). Bot talk templates are per language
  too.
- **2026-09-11** — Solo default: 7 players (3 spies, two-fail rule on
  mission 4).
- **2026-09-11** — Bot table talk ships in v1 (M3), thin.
- **2026-09-11** — M0 done: repo `csiesheep/the_resistance` from the Dice
  Wars skeleton, placeholder page (noindex) deployed with `npx wrangler
  deploy` from this machine — **not** the dashboard GitHub connection, so
  pushes do not auto-deploy until that is connected. Routes verified,
  `.git`/`src` not served, all siblings still 200.
- **2026-09-11** — Base game only in v1; expansions data-driven for later.
- **2026-09-11** — Copy the Dice Wars skeleton rather than start clean;
  it already solved rooms, timers, reconnection and AI seats.
- **2026-09-11** — Bot model as planned (posterior over spy sets), plus two
  things the harness forced: spies **vote like operatives** except on
  decisive votes, and operatives get a **fog** knob — exact Bayesian
  operatives with the vote majority win ~90% at every table, which is not
  the real game. Normal = fog 0.45; hard = fog 0.12 (six players stays
  ~95% resistance on hard, that is the count's nature).
- **2026-09-12** — Room design note: the room's language (the host's at
  creation) governs bot talk and system lines; each client's own UI chrome
  follows its own toggle. One stage timer for "votes revealed" / "cards
  flipped" pauses everyone together; a staged event is consumed when the
  stage ends (the first version re-staged it forever).
- **2026-09-11** — Node 24.19 on this machine crashes with 0xC0000005 a few
  percent of the time on long bot runs, under any V8 flags, and Node 22
  via npx too; other apps on the machine have the same crash in the
  event log. Treated as environmental: the harness runs each cell in a
  child process with retries. Worth remembering if anything else here
  starts dying randomly.

## Next steps
- [ ] Owner confirms the plan and the open questions above.
- [x] M0: scaffold and deploy a placeholder at the URL. (2026-09-11)
- [x] M1: engine + tests, 27 passing incl. 3000-game fuzz. (2026-09-11)
- [x] M2: bots + harness. Normal bots: resistance wins 53/66/42/38/31/38 %
      at 5–10 players (300 games per cell); hard spies beat normal
      operatives, hard operatives beat normal spies. (2026-09-11)
- [x] M3: solo mode UI + bot talk + i18n + rules page. Played through
      end to end in both languages on a phone viewport. (2026-09-11)
- [x] M4: rooms — Durable Object per code, per-seat view fan-out, phase
      clocks (reveal 30 s, propose 90 s, vote 30 s, mission 30 s; the table
      decides for whoever runs out), bots fill seats, disconnected humans
      are played by the bot after 15 s and get their seat back with the
      tab's token, chat, rematch. Tested with two tabs + bots to game over,
      reconnect mid-game, rematch, leave, bad code. (2026-09-12)
- [x] Rename to 天地會, new repo `csiesheep/tiandihui`, new Worker and
      routes, deployed and verified at `/tiandihui/`. (2026-09-12)
- [ ] Decide what happens to the old `/the_resistance/` Worker: delete it,
      or leave it 301-ing to the new path. It is still live.
- [x] 天時 deck: engine, bots, solo + room UI, both languages, rules page,
      tests, harness `--hours`. (2026-09-12)
- [ ] Decide on 天時 balance: accept the brotherhood tilt, or tune a card
      (see the balance table).
- [ ] M5: ship — drop noindex, OG image, hub card, sitemap, AdSense slot.
