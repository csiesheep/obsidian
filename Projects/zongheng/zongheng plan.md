---
tags: [project, boardgame]
status: design
started: 2026-09-18
slug: zongheng
---
# 縱橫 zongheng - plan

Created 2026-09-18. Repo https://github.com/csiesheep/zongheng (created
2026-09-18), live at https://games.csiesheep.com/zongheng/ (playable, still
`noindex`, since 2026-09-18).

## Overview
**縱橫 / Zongheng** is a two-player card-driven strategy game set in the Warring
States: 秦 (連橫) against 楚 (合縱), 8 turns, 60 to 90 minutes. Own design,
documented in [[zongheng - rulebook]] (v2, 2026-09-18); the v1 prototype and its
design history stay in [[warring states]]. The play borrows the card-driven
skeleton of Twilight Struggle (headline, action rounds, influence and control,
a war-weariness track, a reform track), then adds its own second layer of the
map (five states with capitals), asymmetric instant wins (滅國 for 秦, 相印 for
楚), diceless 征伐 and 遊說, and an influence cap. Two ways to play: solo against
a bot, or an online room with a 4-letter code where the second seat is a friend
or a bot. English and Traditional Chinese from v1, phone-first. Fan-made,
unofficial as to its inspiration; the name, setting and cards are ours.

Two-player specifics: there is no "bots fill seats" beyond the one opponent
seat; a disconnected human is played by the bot until they return.

## Why this shape
Modelled on `tiandihui` (newest sibling): prefix router, one Durable Object per
room, shared pure engine in browser and DO, seeded RNG, per-seat `view`, bot
takeover, i18n files, the `sim.js` harness with child-process cells. New here:

1. **The engine is the product.** 72 cards, five actions, three tracks, two
   marker systems, dozens of edge cases. Card effects are data plus one small
   function per card id; the reducer validates every action so the UI can only
   offer legal targets (the rulebook says the UI must show where placement is
   impossible under the cap).
2. **A real search bot.** No hidden-role posterior; instead a scored 1-ply
   search over (card, use, target) with a static evaluation, and sampling of the
   opponent's hand for the headline guess. Levels differ by evaluation depth
   and noise.
3. **The balance harness is the design tool.** Nine open numbers in the
   rulebook (cap, seal count, 滅 count, compensation, lock levels, unlocks,
   洛邑, turn count, 頓兵堅城) are decided by win-rate tables, not by feel.
4. **Hidden information is small but strict**: the opponent's hand, the
   face-down 九鼎, the headline until both have committed.

## Licensing
Own game, own name. The mechanics that inspired it are from Twilight Struggle
(Ananda Gupta and Jason Matthews, GMT Games); mechanics are not copyrightable,
and none of its name, art, card text or prose is used. Credit line, once, in
the footer: "Inspired by the card-driven design of Twilight Struggle. Fan-made,
unofficial, not affiliated with GMT Games." The words "Warring States" alone
are the name of the period and of several existing tabletop products (BGG lists
"Warring States", "Warring States: China", "Warring States Period", "Shaolia:
Warring States"), so the product name is 縱橫 / Zongheng and "Warring States" is
only a descriptor in copy. *Not legal advice.*

## Source material
- [[zongheng - rulebook]] v2 rules, 72-card table, differences from v1, open
  numbers.
- [[warring states]] v1 prototype (2026-09-18, same day), kept as history.
- Unclear points that v2 resolved with explicit rules: who moves the weariness
  track during an opponent's event (the phasing player); ops of a free 征伐
  (the card's printed ops); 九鼎 outside the hand, never headline or reform;
  scoring cards drawn by events (reveal, reshuffle, redraw); random discards
  never hit scoring cards; final scoring exists; tie goes to 楚.

## Theme
| slot | v1 working name | now (zh) | now (en) |
|---|---|---|---|
| title | warring states | 縱橫 | Zongheng |
| tagline | | 橫成則秦帝,縱成則楚王 | Unite them and Qin is emperor; bind them and Chu is king |
| side A | 秦 | 秦(連橫) | Qin (the Horizontal) |
| side B | 楚 | 楚(合縱) | Chu (the Vertical) |
| VP track | 天命軌 | 天命 | Mandate |
| DEFCON | 疲敝軌 | 疲敝 | Weariness |
| space race | 變法軌 | 變法 | Reform |
| coup | 政變 | 征伐 | Campaign |
| realignment | (none) | 遊說 | Lobby |
| China card | 九鼎 | 九鼎 | The Nine Cauldrons |
| bot names | | 秦:司馬錯、范雎、王齕;楚:昭陽、屈匄、項燕 | same, romanised |
| favicon | | a bronze 鼎 on dark lacquer | |

### Look (帛與青銅, proposed 2026-09-18)
Design canvas: https://claude.ai/code/artifact/FB6pCs1jjEm7yfMCatNTfd
(private until shared; nine phone artboards).

| token | value | used for |
|---|---|---|
| silk | `#e4d6b8` (fields `#efe5cf`) | the map and every light surface |
| lacquer | `#1c1a17` | top and bottom chrome, the hand tray |
| 秦 black | `#22201d` with a bronze ring | Qin influence discs, Qin side of tracks |
| 楚 vermilion | `#a8321f` (dark `#7e2416`) | Chu influence discs, Chu side of tracks |
| bronze | `#8b6b2e` (light `#c9a45c`) | 要衝 rings, capitals' ◎, primary buttons, rules |
| verdigris | `#4f7a6a` | the 變法 track, "legal target" highlights |
| weariness | bronze to `#a8321f` across five boxes | the 疲敝 track |
| display | LXGW WenKai TC | title, space names, big numbers |
| body | Noto Serif TC | everything else |

Square corners, 1.5px bronze rules, no shadows. Chinese numerals for track
boxes and turn number in zh; digits in en. Influence shown as a disc with the
number inside; control shown as a filled space border in the controller's
colour; a 滅 marker is a black seal, a 相印 marker a vermilion seal.

## Rules in scope (v1 = rulebook v2, exactly)
Everything in [[zongheng - rulebook]]: 26 spaces, 5 regions, 5 states and
capitals, 8 requirements of setup, 8 turns in three eras (hand 8/9, action
rounds 6/7), headline, five uses of a card, 征伐 with region locks, 遊說 with
局勢, reform track with 6 boxes and unlocks, weariness track, 九鼎, 洛邑, 滅 and
相印 markers, six ways to end, final scoring, all 72 cards.

Not in v1, data-driven later: a historical-order mode (era decks dealt in
strict chronological order), optional "天時" style luck cards for 征伐, a
tutorial game on rails (as `tiandihui` has), spectators.

## Architecture
```
zongheng/
  public/
    index.html            one page: landing / setup / lobby / table / over
    app.js                routing (?play, ?room=ABCD, ?lang=), socket client, solo driver, rendering
    style.css
    map.svg               the 26-space schematic, ids = space ids
    shared/
      engine.js           state, reducer, legality, view(state, seat), RNG
      cards.js            72 card records: id, era, side, ops, remove, text keys, effect fn
      board.js            spaces, adjacency, regions, states, capitals, scoring table
      bots.js             evaluation, 1-ply search, headline sampler, 3 levels, why
      talk.js             bot lines per language
    i18n/en.js, i18n/zh-Hant.js
    rules.html            own prose, the tables, the card list (SEO page)
  src/index.js            Worker: prefix router + /ws
  src/room.js             Durable Object: 2 seats, clocks, bot fill, reconnect, rematch
  tests/
    engine.test.js        every rule in the rulebook as a test; fuzz over legal moves
    cards.test.js         each card's effect against a fixture state
    bots.test.js          bots never propose an illegal action; never push 土崩 by choice
    room.test.js          fake DO context
    sim.js                bot-vs-bot cells, child processes, retries
```

- **engine.js**: `createGame(seed, options)`, `legal(state, seat)` returns the
  full list of legal actions with their targets (the UI and the bots share it),
  `apply(state, action)`, `view(state, seat)`. Actions: `headline(card)`,
  `play(card, use, payload)` where use ∈ event / place / campaign / lobby /
  reform, plus sub-steps for events that ask the player to choose (targets,
  order of event vs ops, 說客 pairing). Every check in the rulebook is a
  named predicate so tests read like the rulebook.
- **cards.js**: effects are functions `(state, ctx) => state` over a small
  vocabulary (`place`, `remove`, `freeCampaign`, `track`, `draw`, `persist`),
  so most cards are one line and the fuzz test covers all 72.
- **bots.js**: evaluation = expected scoring value per region (weighted by how
  many scoring cards of it remain in the deck), 要衝 count, 滅 and 相印 progress,
  weariness safety margin (never end an action at a level where a card in the
  own hand would lose), hand quality (opponent events held), reform unlocks.
  Search = enumerate `legal()` actions, score the resulting state, add noise by
  level; headline = sample 200 opponent hands from the unseen deck and pick the
  card that maximises the average outcome. `why` strings feed table talk.
- **room.js**: seats 秦 and 楚; host picks a side or random; clocks: headline
  60 s, action 90 s, event choices inside the same clock; timeout = the bot
  acts for that seat; 20 s disconnect grace then bot takeover; rematch swaps
  sides.

## Pages and UI
| Route | View | What is on it |
|---|---|---|
| `/zongheng/` | Landing (`index.html`, `landing.js`) | Title 縱橫, tagline, the map as art, your name, **Resume your game** and **Back to room CODE** when there is one, **Play vs bot**, **Create room**, **Join** (code), rules link, credit line |
| `/zongheng/play` | Game page (`play.html`, `app.js`) | Everything below; the bar carries the return link ‹ 縱橫 to the landing |
| `play?play` | Solo setup | Side 秦 / 楚 / random, bot level, your name, language → Start |
| `play?room=ABCD`, `play?create=1` | Lobby | Code, two seats (human / bot badges), side pick, level, Start |
| (in game) | Headline | Both hands face down until committed; reveal in ops order |
| (in game) | Table | Map (pan/zoom), three tracks, era and turn, hand tray, action sheet: event / place / 征伐 / 遊說 / 變法 with legal targets lit |
| Table › Place | Tap spaces to drop points; the cost per point shown (1 or 2); cap warnings |
| Table › 征伐 / 遊說 | Tap a space; a preview shows removed and placed points and the weariness result before confirming |
| (in game) | Scoring | Region overlay: presence / domination / control per side, the arithmetic, the Mandate moving |
| (in game) | Game over | How it ended (one of six), final board, log, Play again |
| `/zongheng/rules` | Rulebook | Own prose, every table, the 72 cards with the year |

Phone-first: the map fits 390 px wide as a schematic (not a geographic map),
the hand is a horizontal tray, the action sheet slides up.

## Bots and balance
- Levels: **easy** (random legal action with a bias toward scoring regions),
  **normal** (1-ply search, evaluation above), **hard** (2-ply on the
  opponent's best reply for 征伐 and headline decisions, less noise).
- Harness: `node tests/sim.js <games> <cell>` where a cell is a rules
  variant: `cap=2|3`, `seals=4|5`, `mie=3|2+1`, `comp=0|2|4`, `homelock=4|3`,
  `luoyi=1|0.5`, `turns=8|9`. Report 秦 win %, how games end (six ways), mean
  turn of instant wins, mean Mandate at the end.
- Targets: normal vs normal 秦 in the 45 to 55 % band; no way of ending under 5
  % or over 50 % of games; hard beats normal from either side; a 滅 or 相印
  win in maybe 15 to 30 % of games so the threat is real but not the whole
  game.
- "Feels human": the bot holds scoring cards until the region is set up,
  dumps opponent events into 變法 or 說客, and never walks into 土崩.

## Balance log (bot vs bot, `node tests/sim.js`)

Read as signals with about ±8 points at 100 to 150 games a cell. Both seats
use the same bot, so an asymmetry is the rules or the bot's handling of one
side's path, not the opponent's skill.

**2026-09-18, normal vs normal, 100 games a cell, seeds 1000+**

| cell | Qin % | mean turn | 合縱 | 天命 | 一統 | note |
|---|---|---|---|---|---|---|
| base (4 seals on control) | 15 | 3.9 | 72 % | 13 % | 3 % | seals end most games by turn 4 |
| seals=5 | 29 | 5.3 | 33 % | 35 % | 3 % | |
| sealAt=cap | 29 | 5.7 | 20 % | 47 % | 2 % | seal needs Chu at stability +2 in the capital |
| mie=2 | 29 | 3.3 | 61 % | 11 % | 21 % | a race, not a fix |
| cap=3 | 23 | 4.0 | 68 % | 17 % | 1 % | |
| comp=0 / comp=4 | 20 / 26 | 3.7 / 3.9 | 63 / 62 % | | | within noise |
| homeLock=3 | 29 | 3.7 | 65 % | 17 % | | |
| luoyi=0.5, turns=9 | 15, 19 | | 73, 69 % | | | no effect |
| scoringSplit=v2 | 12 | 3.5 | 42 % | 35 % | | mandate −10.6: the old split again |
| qin=hard / chu=hard | 33 / 17 | | 46 / 72 % | | | a deeper Qin defends better |
| qin=easy / chu=easy | 1 / 100 | | | | | levels order correctly |

**2026-09-18, hard vs hard, 150 games, seeds 5000+**

| cell | Qin % | mean turn | 合縱 | 天命 | 終局 | mandate |
|---|---|---|---|---|---|---|
| base | 27 | 4.2 | 58 % | 18 % | 7 % | +0.5 |
| sealAt=cap | 30 | 6.2 | 23 % | 34 % | 23 % | −4.8 |

**2026-09-18, normal vs normal, 200 games a cell, seeds 7000+ (after the harness merge fix; every cell prints its n)**

| cell | Qin % | mean turn | 合縱 | 天命 | mandate | West Q:C | South Q:C |
|---|---|---|---|---|---|---|---|
| sealAt=cap | 33 | 5.4 | 24 % | 40 % | −4.6 | 2.6 : 0.4 | 0.1 : 4.5 |
| cap + 函谷關 3 | 34 | 5.6 | 29 % | 40 % | −3.4 | 3.2 : 0.3 | 0.1 : 4.4 |
| cap + 函谷關 3 + comp 0 | 46 | 5.6 | 17 % | 37 % | −1.5 | 3.1 : 0.3 | 0.1 : 4.4 |

| cap + 五國伐秦 not 關中 | 35 | 5.5 | 22 % | 40 % | −4.7 | 3.1 : 0.8 | 0.1 : 4.4 |
| cap + 函谷關 3 + 五國伐秦 | 41 | 5.6 | 22 % | 38 % | −2.5 | 3.6 : 0.7 | 0.1 : 4.2 |
| cap + 函谷關 3 + 五國伐秦 + comp 0 (**decided**) | 39 | 5.7 | 19 % | 41 % | −3.2 | 3.6 : 0.8 | 0.1 : 4.3 |
| 5 seals on control + 函谷關 3 + 五國伐秦 | 49 | 5.5 | 21 % | 34 % | +0.5 | 3.7 : 0.8 | 0.1 : 4.2 |

**2026-09-18, hard vs hard, 120 games a cell, seeds 5000+**

| cell | Qin % | mean turn | 合縱 | 天命 | 終局 | mandate |
|---|---|---|---|---|---|---|
| seals=5 | 38 | 5.5 | 18 % | 34 % | 17 % | −1.5 |
| sealAt=cap + comp 0 | 43 | 6.1 | 18 % | 33 % | 23 % | −2.2 |
| sealAt=cap + tie to Qin | 28 | 6.1 | 24 % | 37 % | 23 % | −4.8 |

**2026-09-18, the decided rules, normal vs normal, 400 games, seeds 11000+**: Qin 44 %
(±5), mean turn 5.8, mandate −1.9; endings 天命 37 %, 終局 19 %, 合縱 18 %,
記分 18 %, 一統 4 %, 土崩 4 %, 平手 2 %; West 3.6 : 0.7, South 0.1 : 4.3. The
hard-vs-hard confirmation died at 120 of 150 games when one chunk crashed
Node five times running; the harness now replays such a chunk game by game.

At 200 games a cell one estimate is good to about ±7, so the 39 and the 46
for the two comp-0 cells are the same number. Ties are 1 to 3 % of games:
the tie rule does not matter.

Home regions, 40 bot games under sealAt=cap: when the West scores Qin controls
關中 31 % of the time (presence 57 %, domination 31 %, nothing 12 %); when the
South scores Chu controls 郢 71 % of the time (domination 70 %). Qin's home is
the fragile one: it starts with one controlled space to Chu's two, and Chu's
early 五國伐秦 strikes it in the era the West scores.

Reading: four seals on plain control decide most games before the alliance
era; requiring the cap (or five seals) turns them back into one threat among
several and lets games run six turns. Qin still sits near 30 %, so a second
lever is needed after the seal fix; candidates are the Chu bonus points, the
tie rule, and the South's structural edge (Chu's home tallies 4.3 a scoring
against Qin's 3.0 in the West with equal values: 楚滅越's +1 and the South's
two stability-2 spaces).

### Round 2, 2026-09-18: the two lasting scoring clauses
Normal vs normal, 1,000 games a cell, the same seeds (20000+) in every cell,
run in batches of 5 (`--chunk=5`) with resume. About ±3 points at this size.

| cell | Qin wins | mean Mandate | 滅 | 相印 | turns |
|---|---|---|---|---|---|
| round-1 rules | 39 % | -2.7 | 1.14 | 2.59 | 5.8 |
| westBonus: 司馬錯伐蜀 adds a lasting West +1 for Qin | 42 % | -1.4 | 1.14 | 2.66 | 5.8 |
| noYue: 楚滅越 loses its lasting South +1 | 45 % | -0.4 | 1.19 | 2.65 | 6.0 |
| both | **50 %** | **+0.8** | 1.18 | 2.63 | 5.9 |

Endings with both: 一統 3 %, 合縱 17 %, 天命 38 %, 土崩 4 %, 記分 18 %, 終局
20 %, 平手 1 %. Home tallies a scoring: the West 4.2 to 0.7, the South 0.1 to
3.8, so the two homes now pay the same. Both clauses are the engine defaults
(repo `9f083a5`, deployed `b821476e`, byte-verified); the old pair is the
`round1Rules` harness cell. Still open: 一統 ends only 3 % of bot games, so 滅
three states shapes play more than it wins (rulebook 未決項 2).

## Milestones
- M0 Scaffold: repo from `tiandihui`, `PREFIX /zongheng`, Worker `zongheng`,
  routes, placeholder (noindex), deploy, verify bytes. Half a day.
- M1 Engine + cards + tests, including the fuzz test over legal moves and a
  test per rulebook rule. Three days.
- M2 Bots + harness, the first win-rate table over the nine open numbers;
  rulebook updated with the decisions. Three days.
- M3 Solo UI: map, tracks, hand, action sheet, scoring overlay, i18n, rules
  page. Three days.
- M4 Rooms: DO with two seats, clocks, bot fill and takeover, reconnect,
  rematch. One day.
- M5 Ship: noindex off, OG image, JSON-LD, hub tile, sitemap. One day.

## Open questions (decide before M0)
1. ~~**Name**~~ Decided 2026-09-18: 縱橫 / Zongheng, slug `zongheng`.
2. **Ship the v2 rules as written**, with the nine numbers left to the
   harness in M2. Recommendation: yes; a paper prototype cannot answer them.
3. **遊說 in v1**. Recommendation: keep; it is the only unlockable answer to the
   cap deadlock and gives 1-op cards a use.
4. **Tie goes to 楚**. Recommendation: keep unless the harness shows 楚 above
   55 % at normal.
5. **Map style**: schematic with fixed positions (recommended for a phone) or
   a drawn geographic map.
6. **Bot names**: historical generals and ministers as above, or invented.
7. ~~**南方 is worth more than 西土**~~ Decided 2026-09-18: equal, 2/4/6 both.
8. ~~**相印 is much easier to progress than 滅**~~ Decided 2026-09-18 from the harness: a seal needs the capital at the cap. Original note: **相印 was much easier to progress than 滅**: random play pays 2.9 seals a
   game against 0.2 滅, and 24 % of random games end on four seals, none on
   three 滅. Owner's call 2026-09-18: let the M2 harness decide; the fallbacks
   are five seals, or seals that need the capital at the cap.
9. ~~**楚滅越 has no Qin counterpart.**~~ Decided 2026-09-18 from round 2 of the
   harness: 司馬錯伐蜀 gains "此後西土記分時秦 +1" and 楚滅越 becomes two points
   and nothing more (Qin 50 % over 1,000 games). Original note: its lasting +1 on every South scoring is
   worth about 2.5 Mandate a game for Chu; Qin's 白起破郢 lost its v1 scoring
   clause. Recommendation: give 司馬錯伐蜀 "此後西土記分時秦 +1", or make
   楚滅越 a one-off.
10. **Domination with a single battleground.** As written, one controlled
    battleground in an otherwise empty region is 優勢 (more spaces and more
    battlegrounds than nobody). Twilight Struggle also asks for a
    non-battleground. Recommendation: keep; it rewards the first entry into
    an empty region and the bots handle it.

## Decisions
- **2026-09-18** The owner signed off the C2 UI design ("C2: every page" on the canvas): landing at two
  iPhone sizes with a neutral-card multiplayer block, solo setup that wears the chosen side (black / dark
  red / white), table pages on the light C1 map with soft region tints and strong names, a dark red lower
  half when seated as Chu, card sheets that wear the card (Chu dark red, Qin black, neutral and scoring
  white), one identical frame on all 23 Qin illustrations, no mixed Chinese and English labels except 秦,
  楚 and the title. Next the owner wants seven videos, done one by one, three ideas and a 10 s ComfyUI
  clip each, with the user scenario shown:
  1. opening video, then the landing page
  2. start a game as Qin, then the table
  3. start a game as Chu, then the table
  4. win as Qin, then the Qin win page
  5. lose as Qin, then the Chu win page
  6. win as Chu, then the Chu win page (the owner wrote "Qin win page"; read as a slip, to confirm)
  7. lose as Chu, then the Qin win page (the owner wrote "CHU win page"; same)
- **2026-09-18** From here on Zongheng is built by a team, not by one session. An
  orchestrator session opened in the repo writes issues and dispatches each to a
  subagent whose model fits the role (`peer-be` Opus, `peer-fe`, `peer-writer` and
  `peer-artist` Sonnet, `peer-chore` Haiku, `orch-checker` Sonnet), then verifies
  independently before landing (`agent-team-delivery` §十三, `~/.claude/CLAUDE.md`).
  Everything built so far (engine, cards, bots, harness, rooms, client) was written and
  checked by one session, so by the skill's §一 it is the least-verified part of the
  system: peers are told to suspect it first.
- **2026-09-18** The owner picked version **C2 虎符與漆鳳 Bronze and Lacquer** of Two
  Courts, with two requirements, both applied on the canvas and binding for the build:
  1. **The landing page never scrolls on an iPhone.** It is exactly one small viewport
     tall (`100svh`): the two court panels share whatever height the controls leave.
     Drawn at 390x664 (iPhone 14/15 in Safari with both bars showing) and 375x553
     (iPhone SE in Safari); the name field lost its visible label to save a row.
  2. **Every card has rounded corners and its number sits in a round badge, as the Chu
     cards do** (每張牌的角都作圓滑,數字都是圓框,跟楚國卡一樣): hand cards, card
     sheets and the 72-card gallery, for Qin, neutral and scoring cards alike. A side now
     shows through colour, material and typeface, not through corner shape.
  The owner also set the hand row on the C2 game page to 207 px; kept. All image prompts
  are in [[zongheng - art prompts]].
- **2026-09-18** The owner picked direction **C 兩廷 Two Courts** (the interface
  wears your side) and asked for three versions of it, a correct symbol for 秦,
  and an illustration for every card. Round 2 is the second page of the canvas
  (https://claude.ai/artifact/DRqSqSm8LFmtnxZW7s3i41):
  C1 玄鳥與鳳 Two Birds (heraldic, light: Qin's mark is the dark bird 玄鳥 of its
  founding myth as a roof-tile roundel, Chu's the lacquer phoenix), C2 虎符與漆鳳
  Bronze and Lacquer (material, dark: 虎狼之秦's tiger tally against Chu's
  phoenix standing on a tiger, a night map), C3 經緯 Warp and Weft (typographic:
  Qin is every horizontal band and row of sans type, Chu every vertical column
  of brush type; almost no texture, the cheapest to build). In all three the
  characters 秦 and 楚 are real type, never generated glyphs: the first round's
  Qin art had invented pseudo seal characters.
- **2026-09-18** Card art: one illustration per card, all 72, and a card wears
  its side. Qin events are stone rubbings (white line on black), Chu events are
  lacquer paintings (black and gold on vermilion), neutral events and scoring
  cards are ink wash on paper. Z-Image-Turbo, 768x1024, 8 steps, about 6 s an
  image; seeds are 5000 + the card number (ten were redone with 70xx seeds).
  Originals, prompts and the resumable batch script are in
  `C:/Users/sheep/code/ComfyUI/output/zongheng_cards/` (`prompts.json`,
  `prompts.py`, `zimage_batch.py`). Known flaws to fix before shipping: later
  dynasty roofs and crenellated walls in places, a tiny pagoda in 北疆記分, two
  assassins in 荊軻刺秦王. Every prompt forbids writing, so no fake characters.
- **2026-09-18** Balance round 2 adopted: 司馬錯伐蜀 keeps a lasting +1 for Qin
  on West scorings, 楚滅越 drops its lasting South +1. Normal bots: Qin 50 %
  over 1,000 games (39 % before). History agrees: 蜀 was the granary that made
  Qin rich; Chu's hold on 越 was never firm.
- **2026-09-18** The landing page and the game page are separate files:
  `index.html` + `landing.js` (no engine, fast, indexable later) and
  `play.html` + `app.js`. The game page carries a return link (‹ 縱橫) in its
  bar; the landing offers "Resume your game" and "Back to room CODE" when
  there is something to return to. Deployed `22f6e705`.
- **2026-09-18** UI redesign: three directions on a Design canvas
  (https://claude.ai/artifact/DRqSqSm8LFmtnxZW7s3i41), twelve phone artboards, stills from
  Z-Image-Turbo and three 3-second clips with sound from MiniMax H3 Turbo
  (4 steps, 768x1344, about 3.5 minutes a clip on the 3090). A 帛圖 Silk Map,
  B 兵符 Bronze War Table, C 兩廷 Two Courts. The owner picks; nothing in the
  client changes until then.
- **2026-09-18** Rules decided from the harness and made the engine defaults:
  a 相印 needs control of the capital with Chu's influence at the cap; 函谷關
  starts at 3; Chu's 2 bonus points are gone; 五國伐秦 cannot target 關中.
  Five seals balanced as well in the bots but would be blocked for good by a
  human Qin camping one capital. Qin lands at 39 to 46 % with normal bots
  (±7); a confirmation run at 400 games is on disk under %TEMP%. The first
  drafts stay reachable as harness options. Playable build deployed
  (version fe5080f7), all 12 served files byte-identical, a room created and
  played on production.
- **2026-09-18** Scoring cards re-split by era: 三晉, 西土, 南方 in the reform
  deck; 東方, 北疆 in the alliance deck. The first draft (東方 early, 西土 late)
  scored Chu's home 2.5 times a game against Qin's once, about 10 Mandate a
  game before any play. The old split stays in the engine as harness cell
  `scoringSplit: "v2"`.
- **2026-09-18** Name confirmed by the owner: 縱橫 / Zongheng, slug `zongheng`.
  Repo `csiesheep/zongheng` created from the `tiandihui` shape (prefix router,
  Durable Object shell with two seats, i18n files, `node --test` layout) plus
  the board data (`public/shared/board.js`) and its integrity tests. Placeholder
  page is `noindex`. Not deployed; M0's deploy is the next step.
- **2026-09-18** Design v2 written as the implementation spec
  ([[zongheng - rulebook]]): asymmetric instant wins (滅國 / 相印), three eras,
  征伐 with region locks, 遊說, reform track cut to 6 boxes, final scoring,
  72 cards. v1 note kept as history.
- **2026-09-18** Working slug `zongheng`; folder and links renamed if the
  owner picks another name.

## Next steps
- [x] Owner confirms the name: 縱橫 / Zongheng. (2026-09-18)
- [ ] Owner answers open questions 2 to 6 (defaults stand if not).
- [x] Create repo `csiesheep/zongheng` from the `tiandihui` skeleton. (2026-09-18)
- [x] M0: placeholder deployed with `npx wrangler deploy` (version
      c2e73fdd); all 9 served files byte-identical to the repo, `/zongheng`
      301s, `/zongheng/index.html` 307s back under the prefix, sitemap has 2
      urls, `noindex` live, `src/` not served, hub and tiandihui still 200. (2026-09-18)
- [x] M1: engine (`engine.js`, a plan-and-pending machine), the 72 cards
      (`cards.js`), 47 tests: board, one test per rule, the tricky cards, a
      fuzz over random legal games with invariants after every action, a
      replay check. Random play: 200 games end in 6.0 turns on average, every
      one of the six endings occurs. (2026-09-18)
- [x] M2: `bots.js` (easy random, normal one ply from the seat's view with a
      determinized guess of the unknown, hard adds the other side's best reply)
      and `tests/sim.js` (rules cells in 10-game child processes with retries;
      `--cells`, `--only=`, `k=v` options). First tables in the Balance log. (2026-09-18)
- [x] M3 first cut: solo client plays end to end against the bot in the
      browser pane (setup, headline, every kind of choice, campaign preview,
      game over); `?play&auto` watches the bot play both seats. Plain look on
      purpose. Rules page and polish remain. (2026-09-18)
- [x] M4 server side: `src/room.js` deals, applies actions through the engine,
      keeps one clock per decision kind, lets the bot play its seat and any
      away seat, sends per-seat views; 4 tests over a fake context. The
      client's socket path is not written yet. (2026-09-18)
- [x] M4 client: create or join from the landing, lobby (code, seats, swap,
      bot fill, level, start), the table driven by the room's view, actions
      over the socket, clock in the bar, rematch from the lobby. Walked through
      against wrangler dev with a bot seat, and with two humans in two tabs:
      each tab saw only its own hand, the setup handed over, and a reload got
      the seat back with the tab's token. Chat is not wired in the client yet. (2026-09-18)
- [x] Seal rule and setup decided from the harness, written into the rulebook
      with dated why-notes, made the engine defaults, 59 tests pass. (2026-09-18)
- [x] Playable build deployed and byte-verified, still `noindex`; rules page
      live at `/zongheng/rules`; a production room created, bot added, game
      started and played to the first headline. (2026-09-18)
- [x] Client: room chat, solo games saved in the browser and resumable from
      the landing, a rules link on every view, a per-state progress row, a
      "since your last action" strip, a result screen with a way back to the
      final board, English text for all 72 cards. Deployed (version f47d0f1f)
      and byte-verified. (2026-09-18)
- [x] Balance round 2 at 1,000 games a cell: 司馬錯伐蜀 West +1 and 楚滅越
      without its South +1 bring Qin from 39 % to 50 %. Engine defaults, card
      text in both languages, deployed `b821476e`. (2026-09-18)
- [x] Landing page and game page split, return link on the game page.
      Deployed `22f6e705`. (2026-09-18)
- [x] UI redesign explorations: three directions with generated stills and
      H3 clips on the canvas https://claude.ai/artifact/DRqSqSm8LFmtnxZW7s3i41. (2026-09-18)
- [x] Owner picks a UI direction: C 兩廷 Two Courts. (2026-09-18)
- [x] Round 2 on the canvas: three versions of Two Courts (C1, C2, C3), each
      with landing, game page, a Chu card sheet and a Qin card sheet, plus a
      gallery of all 72 illustrated cards. (2026-09-18)
- [x] Owner picks a version: C2 虎符與漆鳳 Bronze and Lacquer, with a landing that
      never scrolls on an iPhone and rounded cards with round number badges. Canvas
      updated. (2026-09-18)
- [x] Team setup: `TEAM.md` with the ownership table and deploy rule the owner confirmed,
      `tools/orch.sh`; a guard shown red (seals 4 -> 5 failed "four 相印 win for Chu") and
      restored; repo `95d1ead`. The owner asked this session to be the orchestrator; it moved
      into the repo folder. (2026-09-18)
- [ ] Videos paused by the owner (2026-09-18): all three opening clips rejected, then "let's stop video generation, make the designed UI alive first". #8 stays parked.
- [x] Desktop landing: the owner found the stretched desktop landing poor and chose design A (the iPhone layout as one centred 430 px column, the two courts and the gold seam running on behind it); canvas page "Desktop landing". Built as issue #11, in parallel with #5 (returned once: layout not the design, table scrolls, labels and names clipped) and #10 (rules page, own stylesheet). (2026-09-18)
- [x] Landed and live (2026-09-18): #11 desktop landing A (`b2c3f05`, version `bd8f3532`) and #10 rules page with all 72 card rows including 九鼎 (`c1ac084`, version `a8f4f024`); both byte-checked against the live site. #10 went back once (13 rows with the English name inline, 九鼎 row missing).
- [ ] Landing trimmed on the owner's word (2026-09-18): no name field, no Random side, no "多人遊戲" title, no credit line; "開房間" now reads "多人遊戲" (en: Multiplayer). The credit stays on the rules page. Issue #12 (with `peer-fe`); the canvas landing and desktop artboards are redrawn (Version 18). Follow-up put on #6: the lobby asks for a name before seating when none is stored, since the room server has no rename message.
- [ ] Tutorial (owner, 2026-09-19: design first, then an issue): a tutorial level 初入戰國, ten scripted lessons seated as Qin ending with Han destroyed (map, control, hand, place, event, enemy card, campaign and weariness, lobby, scoring, destroying a state), a coach panel plus a spotlight on the map, and a Tutorial button on the landing page in two placements (A in the card beside the rules link, B a gold pill in the top bar). Drawn on the canvas page "Tutorial" (Version 19). Owner's placement (2026-09-19): the Tutorial button is a full-width row above the Multiplayer row inside the card, and the rules link moves to the top bar, left of the language button (the rules move is folded into #12; canvas Version 20). The owner signed off the ten lessons (2026-09-19: "十課內容可以,開 issue 實作"). Issues: #13 scenario and script in `shared/tutorial.js` (`peer-be`, running), #14 coach copy in both languages (`peer-writer`, running; ruling: the rules page's terms 安定值 / 要衝 / 據點, not my draft's), #15 tutorial mode and the landing button (`peer-fe`, after #5, #12, #13, #14). One ruling on the design: lesson 4 must not place into 新鄭, because 宜陽 + 新鄭 is all of Han and lesson 10 would have nothing left; lesson 4 moves to another space (河東 suggested).
- [ ] Landing, owner's corrections (2026-09-19), folded into #12: the phoenix further left, no black bar at the top (the tiger tally runs under the top bar), a full-width gold line between the two courts.
- [x] #12 landed and live (2026-09-19): `d2be0ad`, version `155232ad`, six live files byte-identical. The landing has no name field, Random side, Multiplayer title or credit; 開房間 reads 多人遊戲; the tiger tally runs under a transparent top bar; a full gold line sits between the courts; the phoenix moved left; the rules link is in the top bar left of the language button. Returned once (desktop seam 18 px stale after a height change). Not verified in a visible window: the pane was hidden, so only the resize-event plus timeout path was exercised.
- [x] Desktop design signed off by the owner (2026-09-19: "looks good. go ahead."), after three notes: never full screen (a frame of at most 1280 px), a small log and chat strip, and the win page wearing the winner's court (whole window on desktop, page colour on the phone); a hand of nine uses four columns of smaller cards. #7 is rewritten as a build issue from these boards (after #5); the win-page colour is added to #6. Canvas Version 25. Also landed and live: #13 tutorial script (`f51e0f6`, 75 tests) and #14 tutorial copy (`40e0d1a`), version `6e4ba131`, four live files byte-identical; #16 opened for two engine observations from the #13 peer. Earlier note follows.
- [x] Desktop design for every page drawn (2026-09-19, canvas page "Desktop: every page", Version 21), waiting for the owner's sign-off; it is the proposal #7 asked for. Owner's notes (2026-09-19): the table looks good but must never be full screen, so it sits in a frame of at most 1280 px centred on the seat's ground (a 1920x1080 board shows it staying 1280); and the log and chat can be small, so it is one strip with the latest entry and a button (Version 22). Two rules: the table uses the width (map on the left at about 1030x880, the phone's lower half as a 390 px side column with the hand in a 3x2 grid and the log always open; a card opens in that column while the map stays in view); every other page stays the phone column, centred on the landing's two-court ground.
- [ ] Advisor mode 軍師 (owner, 2026-09-19: for single-player games, a button at the top to switch, the AI suggests which card and action, the suggestion glows pale yellow from behind; make a design). Drawn on the canvas page "Advisor mode" (Version 26): a 軍師 switch in the table's top row (it takes the Rules link's place on the table; rules stay reachable from the log and chat panel), an advice strip with one line of why, and the pale yellow glow `#ffe98a` on the suggested card, then the suggested use in the card sheet, then the suggested target on the map; on desktop the card and the target glow at the same time. The advice would come from the bot's own evaluator run for the player's side. Owner's notes on the map mark (2026-09-19): the first pale glow was too faint on the light map; then, on the stronger version: no 軍師 tag on the city, no dark edge on the yellow ring, half the glow. Then: everything the advisor touches is gold, not pale yellow. The switch, the advice strip, the glow on the card and the use, and the ring on the map are all `#e9b92e` (canvas Version 30). The owner signed it off (2026-09-19: "good"). Issues: #17 `advise(view, side)` built on the hard bot, returning the bot's own move plus a computed reason, never seeing hidden information (`peer-be`, running); #18 the switch, the advice strip and the gold glow in the solo client (`peer-fe`, after #5 and #17; its copy block `advisor.*` goes to the writer once #17 fixes the reason keys). Same day: #5 returned a third time (everything passed except that the whole map is scaled down: discs render at 23.5 px, names at about 9.4 px, tap targets 30x30; and I corrected my own wrong number, the design's hand card is 96x176, not 124x197).
- [ ] Queue restructured (2026-09-19) after the session restarted mid-work (both running peers were interrupted and resumed with their context; #5 had uncommitted work in three files, #17 had nothing yet). Instead of five front-end issues in a row, work that does not touch the table runs beside #5 now: #6 lobby (asks for a name before seating) and win/lose pages in the winner's colour, with its own `screens.css` (`peer-fe`, running); #19 the advisor's copy (`peer-writer`, running); #17 the advisor's back end (`peer-be`, running). Once #5 lands, #15 tutorial screens, #7 desktop and #18 advisor screens go out together to three peers, each confined to its own new files (`tutorial-ui.js` + `tutorial.css`, `desktop.css`, `advisor-ui.js` + `advisor.css`) with only imports and call sites in `app.js`, each rebasing before hand-in.
- [x] #19 advisor copy landed and live (2026-09-19): `5f1d1ab`, version `ad5fc3fd`, both language files byte-identical (the first fetch after the deploy still served the old `en.js`; three re-fetches a few seconds later matched, so re-fetch before calling a DIFF). Returned twice: one reason described the 頓兵 forced discard instead of spending an enemy card, so the two became separate reasons (`bogDiscard` added to #17 as well); my single-template strip title could not join (now one sentence per use); two wordings.
- [ ] Owner's iPhone report (2026-09-19, iOS Chrome, visible area about 390x669): on the live solo setup page the Back / Start row is off-screen until you scroll, and tapping any button makes the others flicker. Causes I read in the code: the page hangs off `body { min-height: 100vh }` (on iOS that is the viewport with the toolbars hidden), and `renderSetup()` rebuilds all six buttons and their images on every tap. My own check of #2 missed the first one because an emulated 390x844 viewport has no toolbars. Issue #20 (`peer-fe`, running, priority); #6 was told to use `100svh` and to leave `seg()` alone; #7 got a note about the iPad landing column, which #12 switched to `100vh`.
- [x] #20 landed and live (2026-09-19): `bfa515d`, version `7c04059b`, `app.js` and `style.css` byte-identical. The solo setup page now hangs off `100svh` (with `100vh` only as a fallback) and never scrolls: Start bottom 646 of 670 at 390x669 (the owner's iPhone), 530 of 554 at 375x553 with the description hidden last, 150 px tiles at 390x844. Tapping a side or a level changes 0 child nodes (same nodes, same images), so nothing flickers. Not verified on a real iPhone; the owner was asked to check. Follow-up #21: 44 px tap areas for the Rules links, fallbacks for the `cqh` units.
- [ ] Same night, three blue screens in 36 minutes (01:04, 01:31, 01:40, 0x20001); every crash stopped all four peers, none lost work because each had committed and pushed WIP on my ask. Likeliest trigger is sustained CPU-heavy Node work, so #17 keeps `npm test` near 8 s and runs its long sweep as a separate one-process script.
- [ ] Hand-ins checked that night: #6 endings pass (8 reasons x won or lost x two languages = 32, winner's colour and art, all four buttons inside 390x669) but the lobby went back (seats not in the courts' colours, four stacked buttons forcing an inner scroll on the owner's phone height); #17 nearly passes (88 tests in 8 s, the advice equals the hard bot every time, my own break turned a test red) with two reason fixes (playing a scoring card must never say `scoringSoon`; a change of control beats `battleground`); #5 round four: the map finally reads at a glance (discs 28.7 / 32.5 px, 44x44 taps, no clipped or overlapping names, English on two lines), only the hand on short screens is left, ruled as 56 px chips plus a slimmer turn block. #7 desktop and #15 tutorial screens started from the #5 branch tip so they do not wait for that last round.
- [x] #17 advisor back end landed and live (2026-09-19): `ed4a262`, version `9afb9e4f`, 89 tests in 7 s, three shared files byte-identical. `advise(view, side)` returns the hard bot's own move (checked 44 times over two games, equal every time), a computed reason from 15 keys, and targets; playing a scoring card says `mandate` or `mustPlayScoring`, never `scoringSoon`; a change of control beats `battleground`; headlines say `best`. My own break (`hard` to `normal`) turned two tests red. Returned once. The lobby (#6) went back a second time: the English version overlaps at 375x667 and 375x553, and the bot button is 36 px.
- [x] #5 table pages landed and live after five rounds (2026-09-19): `927c3a2`, version `320659ab`. At 390x669 (the owner's iPhone) the map is full size (390x406, discs 29.8 / 33.8 px, 44x44 taps, no clipped or covered names in either language), the hand is a row of 56 px chips (badge, both names, no art, tap opens the full card sheet), the turn and Mandate block is one 28 px row, and the page does not scroll; at 375x812 the hand is the full 96x176 cards with art; at 375x553 the page scrolls instead of crushing anything. What the five rounds taught: measure rendered sizes, check at the owner's phone height, and look at a screenshot even when every probe passes (round two passed by truncating names, round three by scaling the whole map down).
- [x] #6 lobby and endings landed and live after three rounds (2026-09-19): `404cfb7`, version `ba7b12e1`, six live files byte-identical. Endings: 8 engine reasons x won or lost x two languages, winner's colour and art, the loser's view greyed. Lobby: seats in the courts' colours, the bot button inside its seat row, Swap and Leave side by side, only Start pinned; 16 combinations (two languages, four sizes, one or two seats) with 0 overlapping controls; a name is asked before seating when none is stored. Round two failed only in English (one more line of hint text), so both languages are now checked at every size. I smoke-tested the merged tree of #5 and #6 before pushing.
- [ ] Running after that: #7 desktop, #15 tutorial screens, #18 advisor screens, #21 small fixes (tap areas, `cqh` fallbacks, the last ellipsis, the English lobby 5 px short at 390x669). At most four peers at once.
- [ ] Morning of 2026-09-19: a fourth blue screen at 02:27 (four light front-end peers running, no heavy Node work), then the machine sat idle until the owner wrote at 07:44. Nothing lost. From then on at most two peers run at a time, to see whether the crash rate falls. #21 small fixes landed and live (`0a589b2`, version `d7f02742`): `cqh` fallbacks, no ellipsis on the mini card strip (checked in a real game: 「1 徙木立信 Moving the Pole」, 354x44, nothing cut), the English lobby now fits 390x669 (Start bottom 653). #15 tutorial screens came in: the script walks all ten lessons to 「秦滅韓」 and leaves a saved solo game untouched, but the screens went back with nine findings, chiefly the coach panel falling off-screen (545 to 705 of 669 on the owner's phone height; 806 to 965 of 844 in lesson 6), the lesson text collapsed by default, and the landing button not being the full-width gold row inside the card that the owner asked for. #7 desktop resumed; #18 advisor screens next.
- [x] #7 desktop layout landed and live on the first hand-in (2026-09-19): `d845dc3`, version `e1a13b22`, eight live files byte-identical. The table frame is 1280 wide at 1440x900 (margins 80 / 80) and still exactly 1280 at 1920x1080 (320 / 320), scales to 1205 at 1280x720, fills 1024x768; none scrolls. Map 880x691 with discs about 51 / 58 px; a hand of eight sits in four columns of 77x141; the side column ends in a strip with the latest log entry and a Log and chat button. A card opens inside the side column and the lit space on the map stays clickable. Setup and rules are the 390 px phone card centred; the win page spreads the winner's texture over the whole window (chutex when Chu wins, qintex when Qin wins). Phones measure unchanged at 390x669 and download no textures. Not verified: a real iPad, a real window drag (the pane sends no resize event).
- [x] #22 landed and live (2026-09-19, `72fa259`, four live files byte-identical): the owner's second iPhone report, "move the start button up. Now I can't see it or click it due to no scroll". #20's `height: 100svh; overflow: hidden` had made it worse on the real phone. Measured from the owner's screenshot (924x2000, 2.37 image px per CSS px): the visible web area is about 669 px, but iOS Chrome lays the page out about 100 px taller (the top bar slides under the address bar, the Start row under the toolbar), so **`100svh` is not the visible height on this phone**. Fix: the Back / Start row sits in normal flow right under the name field, the description comes last, and the page may scroll. Start is at 460 to 512 at 390x669, 429 to 481 at 390x540, 432 to 484 at 375x553, tappable by `elementFromPoint` in three themes and both languages; no rebuild on tap; 89 tests. A measuring page `/zongheng/vp.html` went live with it. **Correction, same morning:** the owner's screenshot of that page shows `innerHeight`, `visualViewport.height`, `100svh` and `100dvh` all 669, and `100vh` and `100lvh` 777. So `svh` is right on this phone and my sentence above in bold is wrong. The real cause: the global `body { min-height: 100vh }` stayed in force under #20's `height: 100svh`, and min-height wins, so the body was 777 tall. Emulation has vh equal to svh and cannot see it. The same hole is still on `body.table-lock` (the table, so the hand row is behind the toolbar on the phone) and `body.sheet-open`: issue #23, with my guard test `tests/css-viewport.test.js` that reads the stylesheets (red on main on exactly those three rules), `peer-fe` running from the guard branch.
- [ ] Same morning, two hand-ins returned. #15 tutorial round 2 (`4da34c4`): the coach panel, text, dots, title, top bar, done page, Skip, landing button and the untouched `zh.solo` all pass, but at 390x669 the Done / Confirm button is off-screen in lessons 4, 6, 7, 8 and 10 (for example 674 to 718 of 669) on a page that cannot scroll, so a player is stuck; on desktop the coach panel covers the same buttons; the spotlight is too faint. The peer's own probe passed because `.click()` works on a button nobody can see; my walk now checks `elementFromPoint` before every click. #18 advisor round 1 (`816485f`): switch, card glow, use glow and the gold ring are right, but the advice strip is `position: fixed` and floats over the map (435 to 503 at 390x669), over the cream card page, and over the top 46 px of the suggested card on desktop, unreadable on light ground. Ruling: the strip is always in flow with a solid dark fill; on short phones it takes the prompt text's place. Found on main too: at 390x669, while picking a campaign target, Confirm sits at 725 to 769 and needs a page scroll.
- [x] #23 landed and live (2026-09-19, `b40c913`, version `e80ff4db`, live `style.css` byte-identical): three CSS lines. The global body rule is now `min-height: 100vh; min-height: 100svh`, and `body.table-lock` and `body.sheet-open` reset `min-height: 0`. My own red and green at 390x669 with the global min-height forced to 777 px (what the phone computes for `100vh`): the old live build gave body 777, table 54 to 777, prompt row 657 to 707, below the screen and unscrollable; the fixed build gives body 669, table 54 to 669. Guard `tests/css-viewport.test.js` is mine, red on main on three rules, green now; 91 tests in a serial run. Not verified on the real iPhone; the owner is asked.
- [ ] #15 tutorial round 3 (`a2c2097`) nearly passes: Chinese at 390x669 and desktop English walk all ten lessons with every button fully on screen; buttons 44 px; spotlight is a solid 3 px gold ring. Back for a short round 4: in English at 390x669 the Confirm button is 643 to 687 (16 px cut, lessons 7 and 10) because the no-hand branch of `layoutTable()` never shrinks the map to its floor; and the lesson text starts collapsed in some lessons, ruled as: always open, with a Got it button that collapses it when it covers the target. #24 opened and queued: on a 669 px phone, picking a campaign target in a normal game puts Confirm at 725 to 769; ruling: the hand row and the prompt row fold away and the card panel goes compact.
- [x] #18 advisor mode landed and live on its second hand-in (2026-09-19, `6d636eb`, version `fd152486`, four live files byte-identical, 91 tests). The advice strip is now a normal flow element with a solid dark fill: in the prompt's place on a 669 px phone (545 to 595 during setup, 525 to 575 in the action round), inside the card page when a card is open (257 to 322), and the first row of the hand grid on desktop (288 to 354); it touches no map space, no card and no button, and the advised card, use and target are all tappable. Marks count down during setup placement. The switch is hidden in setup and in the tutorial; switching off restores the prompt. Leftovers moved to #24 (target picking at 669 px overflows on main with or without the advisor; a hidden empty strip node stays when off). Copy for #9: "Place 1 points". #16 engine checks started (`peer-be`).
- [x] #16 engine checks landed and live (2026-09-19, `3fe4872`, version `611bf330`, live `shared/engine.js` byte-identical): an ops choice that arrives through `choose` (the event-first branch, 商旅通賈) now gets the same dry run as `play()`, so a missing `points` list or an unknown space is a rules refusal, not a TypeError; the room answers with a plain refusal. The empty-hand rollover inside one `apply` matches the rulebook and is pinned by a test, not changed. 97 tests in a serial run (15.5 s); with the old `engine.js` four of the six new tests go red. I checked it myself because a fifth blue screen (09:57, code 0x0A, new) killed the checker and the tutorial peer; nothing was lost, the tutorial peer resumed at 12:15 with its uncommitted work intact. The owner also started my side-task chip (page scroll at 375x667 in the headline) as a separate session; it overlaps #24, so I asked that session for a branch and numbers instead of a landing.
- [x] Owner's phone check (2026-09-19, real iPhone, iOS Chrome): "Both 2 phone checks good". The Start button on the solo setup page works (#22) and the hand row on the table is fully visible above the toolbar (#23). Also folded into #24 from a side session's diagnosis: at 375 wide in English the advisor switch wraps the top bar (98 px, my #18 check covered 390 only), and `layoutTable()` flip-flops between scrolling and locked at 375x667 en and 375x553 because it measures while the last pass's `table-overflow` is still set.
- [x] #15 tutorial 初入戰國 landed and live after five rounds (2026-09-19, `1b7f7e2`, version `d7a269bd`, eight live files byte-identical, 97 tests): the Tutorial button sits in the landing card above the Multiplayer row; ten guided lessons end with Han destroyed and a done page. My walk (it checks `elementFromPoint` and the whole button inside the viewport before every click) passes at 390x669 in English and Chinese, 375x667 English and 1440x900 English: every button fully on screen, the coach panel always inside the screen, lesson text open at every lesson start, a Got it button collapses the panel where it would cover the target. What the rounds caught: round 2 Done / Confirm below a locked 669 px screen in five lessons; round 3 the English Confirm 16 px cut (the no-hand branch of `layoutTable()` never shrank the map to its floor); round 4 a new fallback that threw the coach panel below the screen in seven places. Known: 12 to 14 px of page scroll in English while a campaign target is picked, nothing hidden. #24 dispatched next (`peer-fe`).
- [ ] Owner's asks from playing on the phone (2026-09-19 afternoon). (1) 「在規則頁的棋盤加入地圖」: issue #26, the rules page's board section gets the same map as the table, drawn from one shared geometry module `public/map-draw.js` (`peer-fe`, running). (2) 「設計在地圖上如何顯示安定值」: today stability lives only in a tooltip a phone never shows. Three options on the canvas page "Stability on the map" (Version 31): A numeral tag, B pips, C wall segments. **The owner picked A 數字籤**: a 15 px square tag, bronze `#3a2d0c` on paper `#f7f3e8` with a `#5d4a1a` edge, at the disc's lower left, on both the table and the rules page; the advisor's +n badge moves to the lower right; where a city's name sits to the left, the tag flips to the lower right. Folded into #26. (3) 「標題階段:蓋一張牌。這部分是什麼?規則中沒有說明」: the rules page only mentions the headline inside a parenthesis; added to #9 (the turn becomes a numbered list with the headline as its own step, and the in-game prompt says what to do and what happens). (4) 「紀錄 展開後 關不掉」: the log panel is a fixed bottom sheet that covers its own toggle once the log has about six lines, and it blocks the hand too; issue #27 (`peer-fe`, running, top priority): a sticky header with a 收起 button inside the panel, and a scrim that closes it. I missed this in #5 because I only opened the log when it was short.
- [ ] More from the owner's phone (2026-09-19 13:33): the label 周室 becomes 周; the 周 and 三晉 labels do look swapped (checked: the 三晉 label sits beside 洛邑, Zhou's only space, and the 周室 label sits in the middle of Jin's spaces), so their positions swap; Zhou's tint is too close to Jin's amber, so Zhou becomes purple (`#6b4fa0` tint, `#4a3578` label); all three go into #26 as a third commit. The Rules link on the table goes back to the top bar, between the advisor switch and the language button (into #24; the bar must stay one line, so on the table the middle text gives way first, then the switch's word).
- [x] #27 landed and live (2026-09-19, `01e5182`, version `f03c08de`, three live files byte-identical): the log panel has its own sticky header with a 收起 button (471 to 515 at 390x669, 44x44, tappable while the old toggle is covered) and a scrim that closes it; the old toggle's label is right again on every path. Checked in a real solo game with six log lines and the advisor on. 97 tests.
- [ ] Same afternoon, more from the owner's phone. Patterned grounds: solo setup and the table wear `qintex` / `chutex` on phones too, Random stays plain cream by my ruling (#28, `peer-fe`, running, CSS only, with a measured veil so every text colour keeps 4.5:1). The card page does not match the signed-off C2 card sheets and has no Cancel before a use is chosen (#29, queued behind #24: art 186x248 with the double frame, name block, a text box with Chinese and English, five 52 px two-line use buttons across the width, a hint line, Cancel and Confirm pinned at the bottom). #24 round 1 (`afedf0e`) fixed the 669 px overflow (campaign Confirm 548 to 663, no scroll, no flip-flop, the bar is one line with Advisor, Rules and language) but went back with five findings: no button at all in the compact panel before a target is tapped; a pending event choice shows Confirm and Cancel with no question; the enemy card's order row and 說客's pairing became unreachable on short screens (ruling: both rows move onto the full card page, chosen before the use); no Cancel on the card page; the bar is 64 px on the first render in English.
- [x] #28 landed and live (2026-09-19, `3e7fe59`, version `d3c63ffa`): the solo setup page and the table wear `qintex` / `chutex` under a measured same-hue veil (tightest text 4.65 to 4.93 : 1; without the veil 1.2 to 1.8 : 1), Random stays plain cream, only the seated side's texture is fetched, layout numbers unchanged. I looked at setup Qin, setup Chu, table Qin and table Chu at 390x669.
- [x] #26 landed and live (2026-09-19, `369785b`, version `d9e190dd`, seven live files byte-identical, 97 tests): one geometry module `public/map-draw.js` now draws both the table's map and the rules page's board section; every space shows its stability on the owner's chosen 15 px tag (26 of 26 equal to the engine's numbers, both maps); 周室 is 周, the 周 and 三晉 labels swapped so that 周 sits beside 洛邑, and Zhou is purple. Follow-up with the same peer (26b): 郢's tag is clipped 3 px by the map's bottom edge, and tags overlap some name boxes by 3 to 5 px (4 in Chinese, 13 in English).
- [x] #26b landed and live (2026-09-19, `f3c3ce9`, version `2f9dbee9`): the stability tags now clear every name and stay inside the map (0 intersections at 390x669 in Chinese and English on the table and on the rules page, was 4 and 13; 郢's tag no longer clipped; 上黨's tag sits on the lower right). #26 closed. #24 is in round 3: round 2 added Cancel to the card page and put the enemy card's order choice there, but a hidden title element gave the empty card panel a 16 px box, which pushed the hand row to 612 to 684 on a 669 px screen.
- [x] #24 landed and live after four rounds (2026-09-19, `ca37092`, version `2700ed5a`, five live files byte-identical, 97 tests): on a 669 px phone every table state now fits with no page scroll. Picking a target folds the hand row and the prompt row away and makes the card panel compact, with the question on its first line and Cancel always there; the campaign Confirm is at 534 to 663 (was 725 to 769). The layout no longer flip-flops. The top bar is one 54 px line with Advisor, Rules and language. Every card page has Cancel; an enemy card's order and 說客's pairing are chosen on the card page. My walker plays a game and checks every state: 16 states at 390x669 English with the advisor off, 20 in Chinese and 15 in English with it on, 16 on desktop, all scroll 0; the tutorial still completes. What the rounds caught: no button at all in the compact panel before a target, a pending event choice with no question, the order choice lost on short screens, a hidden title element giving the empty panel a 16 px box, and the advisor strip landing inside the panel and pushing the hand off screen. Left for #29: with the advisor on the hand row shifts about 16 px once while the advice arrives. Dispatched next: #29 card page as designed (`peer-fe`) and #9 copy pass (`peer-writer`).
- [x] #9 copy pass landed and live (2026-09-19, `f3d126a`, version `3cc5a8c6`): the rules page's turn section is a numbered list (refill, headline, action rounds, end of turn) with the headline phase as its own step, matching the rulebook; the in-game headline prompt now says what to do and what happens; English setup sentences say "influence" instead of "1 points"; two leftover 周室 region names became 周. The longer prompt still fits the 669 px table (scroll 0 in 16 English and 18 Chinese states). Open issues now: #29 card page as designed (running), #8 videos (parked).
- [x] #29 card page landed and live on its first hand-in (2026-09-19, `1b8fde1`, version `9d462373`, six live files byte-identical, 97 tests): the page now follows the signed-off C2 card sheets: the top bar stays, art 186x248 in the double frame, names in both languages, a text box with the Chinese and the English text, five use buttons across the width (68x52 with two-line labels; they had been about 36 px wide because of a CSS specificity slip), a hint line per kind of card, and a pinned footer with Cancel and Confirm. The advisor strip reserves its box, so the hand row no longer jumps. Walker: 16 states at 390x669 English, 19 in Chinese with the advisor on, 16 on desktop, all scroll 0; the tutorial still completes. End of the day: every issue is closed except #8 videos (parked). Landed today: #22, #23, #18, #16, #15, #27, #28, #26 and 26b, #24, #9, #29; waiting for the owner's phone feedback.
- [ ] Owner's phone, 2026-09-19 16:05 (issue #30, `peer-fe`, running): the top bar should wear the court's pattern too (one continuous ground with the table), lose the "回合 1 · 秦" text, and take the Log button (order: back, Log, Advisor, Rules, language; one 54 px line, the switch's word and then the back link's word give way). And a bug: each open and close of the log left another copy of the news block under the prompt (six copies pushed the hand off the screen). Cause read in the code: `renderLog()` appends the block with `insertAdjacentHTML("beforeend")` assuming `render()` just reset the prompt, but the log buttons call `renderLog()` on their own. An old #5 bug, not from #27; I never toggled the log more than once while checking.
- [ ] Owner's reports, 2026-09-19 late afternoon, three issues running (`peer-fe` each). #31: every hand card in a normal game is 32 % transparent, because the tutorial's rule `.hand .card:not(.tut-lit) { opacity: .32 }` was never scoped to the tutorial and `tutorial.css` is always loaded (from #15; I only measured the tutorial and never looked at a plain game's hand afterwards). #32: on desktop only part of a disc takes a click. Measured live at 1440x900: the tap buttons are placed as percentages of the whole map box (880 wide) with a fixed 44 px, while the drawn map is 661 wide and centred, so a disc is covered by its own tap area 17 % on average, 0 % in the west and east (關中 is 82 px off); phones are off vertically by up to 24 to 41 px when the map is tall. From #7, which I had checked with `.click()`. #30 also takes the owner's "the bar is too tall": 40 px on desktop, 48 px on phones with 44 px tap areas. The owner confirmed the stability tags are visible (「有數字籤」).
- [x] Evening of 2026-09-19, three owner reports landed and live (main `5b865ef`, 97 tests). #31 (`92b1c23`): hand cards are opaque again; the tutorial's dimming rule now hangs off `body.tut-on`. #30 (`af9fa37`): toggling the log no longer leaves extra copies of the news block (one block, replaced in place; five toggles keep it at 1 and the hand at 592 to 664); the table's bar wears the court's pattern as one ground with the table, is 48 px on phones and 40 px on desktop, has no turn text, and carries back, Log, Advisor, Rules, language. #32 (`5b865ef`): map tap areas now share the drawn map's coordinates; before, on desktop, a disc was covered by its own tap area 17 % on average and 0 % in the west and east; now all 26 are centred (dx = dy = 0), 47 px on phones and 81 px on desktop, and five probe points per disc hit the right space, also when the map is tall. The machine restarted once more at 16:17 (no bugcheck logged); the peer in flight had no commits yet and was restarted. Open: #8 videos (parked); a small follow-up: the prompt line shows under the stat line during the tutorial.
- [ ] Owner, evening of 2026-09-19, two more (both `peer-fe`, running). #33: on desktop the Confirm / Cancel panel covers the prompt text, because `desktop.css` puts `#sheet` in the same grid cell as `#prompt` (a cell is as tall as the taller of the two, not their sum); my desktop walks had printed the same rectangle for both (207 to 329) and I did not read it. The panel gets its own row; the tutorial's stray prompt line is fixed with it. #34: tapping a card's name in the news line or in the log opens a read-only card page (the #29 layout with one Close button), without touching the game state or the saved game.
- [x] #33 and #34 landed and live (2026-09-19 night, main `effe548`, 97 tests). #33 (`2eda1e2`): on desktop the Confirm / Cancel panel has its own row under the prompt (prompt 207 to 280, panel 280 to 448, hand from there), no overlap in 16 states at 1440x900 and 15 at 1024x768; the tutorial's stray prompt line is gone. #34 (`effe548`, two rounds): card names in the news block and in the log are tappable and open a read-only card page with one Close button; nothing in the game state or the saved game changes. Round 1 went back because I had asked for 32 px tap boxes by padding while the lines are 16 px apart, so the next line's box covered the name above (tapping 客卿制度 opened 張儀連橫); now a one-card line is a row-wide button and each name returns itself at three probe points. Small follow-up found in passing: in English at 390x669, switching the advisor on during setup placement leaves the panel 18 px below the screen until the next tap.
- [ ] Owner (2026-09-19 night): every card gets a short history, three samples first; and on the rules page every card can be tapped to see its detail. #35 (`peer-fe`, running): the rules page's 72 rows open a card detail page drawn by one shared module with the table's read-only page, with a 史事 section and its source line, `#card-<id>` in the URL so Back closes it; data in `public/i18n/stories.js`. I wrote the three samples (張儀連橫, 吳起變法, 澠池之會; about 100 Chinese characters and 60 English words each, with sources from 史記 and 韓非子) and showed them to the owner; the other 69 go to a writer once the tone is approved, every claim sourced, a sample of each batch fact-checked by me.
- [ ] Card histories decided (owner, 2026-09-19 night): the three samples are fine in tone and length, and **the history shows only the current interface language** (the card's rules text stays in both languages as in the C2 boards). The samples are drawn on the canvas page "Card histories" (Version 32). #35 shows them (rules page card detail and the table's read-only card page share one module); #36 is the writer's issue for the other 69, in four batches (reform, alliance, conquest, then the five scoring cards and the Nine Cauldrons), every claim sourced to a chapter, quotations only from the sources, a confidence mark per story, and I fact-check a third of each batch before it lands. #36 goes out when #35 lands.
- [x] #35 landed and live (2026-09-19 night, `457e4ac`, version `b8c674b0`): on the rules page each of the 72 card rows opens a card detail page (`#card-<id>` in the URL, Back closes it), drawn by the same module as the table's read-only card page; the history block shows only the interface's language (the other language is not in the page at all), with its source line; three stories so far. A process slip of mine: the test run before that merge printed 83 pass and 1 fail and my script merged and deployed anyway; two re-runs gave 97 and 0, so it was the machine's intermittent crash of one test file, and the merge step is now gated on `fail 0`. I added `tests/stories.test.js` (`eb4d294`: fields, lengths near the samples, house style; completeness is a todo). #36 batch 1 (the reform era's 22 stories) is with the writer.
- [x] #36 batch 1 landed and live (2026-09-19 late night, writer's `076f86d` merged as `4531a80`): the reform era's 22 stories, 25 of 73 now in. It took three rounds. I read all 22 in both languages against their sources: 10 passed at once, 12 went back (an invented quotation, invented causality, a wrong period for 河西, 孟嘗君 called a general, Su Qin's death, Zhang Yi's argument in 司馬錯伐蜀, Hedong for Hexi in the English, a deleted fact, a missing source). Batch 2 (the alliance era, 21 stories) is with the same writer, with those lessons written into the brief: quotations must be the source's own words, no invented causes, offices as the source gives them, every proper noun and year compared across the two languages.
- [x] #37 landed and live (`a4a3afb`, version `0640366f`): the owner asked that the Chu panel's red darken into black at its bottom edge on the landing page. One more background layer on the Chu shade; its last stop is the body's own ground colour. The peer could not get a browser tab, so I did the looking: 390x669 zh and 375x553 en with Resume, no seam, no scroll.
- [ ] Owner (2026-09-19 late night): the landing page's lower part (the cream card with Tutorial, Multiplayer, code and Join) does not belong on the dark page; three redesigns asked for. Canvas Version 33, page "Landing: the lower part" (generator `design3/foot.py`, 11 boards at 390x669 zh and 375x553 en, with and without a saved game): **A 銅線** flat bronze outlines in two rows, 116 px with or without Resume (today 170 / 120), my recommendation; **B 銅牌** one framed menu with the title plate's double ring, 171 px; **C 底欄** a dock of four tiles, 72 px, Join behind one tap. The owner picked **A 銅線** the same night and added that with A the Chu red can reach further down: the fade to black now takes the last third of the Chu panel, not its lower half (canvas Version 34). Being built as #38 (`peer-fe`): 116 px in all four states (nothing saved, saved game, a room to return to, both), the code field at 16 px so iOS does not zoom a page that cannot scroll, the new-tutorial dot inline after the label.
- [x] #38 landed and live (2026-09-19 late night, `ac20f87`, version `eebd14a9`): the landing's lower part is design A, 116 px in all four states (nothing saved, saved game, room, both), code field 16 px, the Chu red reaching further down. My own checks: 390x669 zh (two states), 375x553 en with both extras (Tutorial icon-only), 1280x800; strict tap check on every control, nothing clipped. Leftover, not filed: a faint hairline at the Chu panel's bottom when that edge falls on a fraction of a device pixel (seen only in the scaled preview pane).
- [ ] Owner (2026-09-19 late night): re-check every page for improvements, phone and desktop. Done by script on main `a4a3afb` at 390x669 and 1440x900 (landing, setup, seven table states, rules) plus two phone screenshots; canvas Version 35, page "Review: every page": 16 findings in three ranks and three proposal boards. The facts that matter: no `:hover` and no `:active` rule in any stylesheet; no key handling on the table; no transitions; status-line labels 9 px and 天命 a 2 px line; desktop hand cards with 8 px English; the rules page 11,459 px long on the phone with no section nav and a 347 px column on a 1440 px screen; nothing on the map marks the opponent's last change. Not covered: lobby and chat, endings, the tutorial's steps, a real iPhone. Waiting for the owner to pick rows. The owner then asked to see the proposals before and after: canvas Version 36, page "Review: before and after", twelve boards (generator `design3/ba.py`); the TODAY panels are redrawn from the measured CSS values, not screenshots.
- [x] #36 batch 2 landed and live (2026-09-19 late night, writer's `58b6e4d` merged as `3e1dde2`, version `43e7be96`): 46 of 73 stories in, after three rounds (15 back, then 5, then three precision notes carried into batch 3's first commit). Batch 3 (the conquest era, 20 stories) is with the same writer.
- [ ] Owner's ruling on the review (2026-09-20): build every before/after board except 8 (keyboard), and **the hand shows one language only**, the interface's. Issues: #39 the table around the map (one-language hand on phone and desktop, 天命 as a 10 px tug bar, status line 11 / 13 px, card-name pills in the log strip; about 27 px of height comes out of the map, hit buttons must stay at 40 px or more), #40 rules on the phone (section chips that stay, search, era and side filters, rows' small print 12 px), #41 the map marks what the last action changed, #42 setup tiles without the repeated name and without cream plus small print a size up on landing and card page, #43 hover / pressed / focus states everywhere and 160 ms arrival for the card page, log and read-only card (last, so it covers the new pills and chips). Wave 1 running: #39 and #40 with two `peer-fe`. The rules page's desktop layout (board 5) gets a proper design round from me first, then the owner's sign-off, then an issue.
- [x] #39 landed and live (2026-09-20, `63ad2bc` merged as `64751b7`, version `28511745`), three rounds: 天命 is a tug bar with the value beside the turn text, the status line is 11 / 13 px, the hand shows one language (three chips visible at 390 px), every card name in the log strip is a 30 px pill, and the late advice text re-runs the layout. The price was paid by the map: its floor now derives from a 40 px hit button (40 px at 375x667 in English, 42 px at 390x669 in Chinese). Round 1 had a 2 px regression and my own wrong spec (pills on the latest line only); round 2 a 24 px overflow in a state the peer's matrix had skipped (375x667, English, advisor off, headline phase). My walkers now clear storage and reload before each run: the advisor setting persists, and with it on the phone shows no log strip at all.
- [ ] Three owner requests in one sitting (2026-09-20, canvas Versions 40 to 44). **Losing endings**: today the loser sees the winner's picture in grey; three ideas on the page "Losing endings" (generator `design3/lose.py`, six pictures from Z-Image-Turbo), each with the loser's OWN emblem broken and without the big glyph so the emblem stays whole above the words: A 碎 (cracked, same hall), B 燼 (burnt, in ash and embers), C 易主 (broken on the winner's ground). **The owner picked B for both sides.** Issue #50: part 1 with `peer-artist` (re-frame the tiger so it sits above the words; seeds 7303 and 7402), part 2 for a `peer-fe` after it lands. **Influence disc**: the owner's three rules (a side without influence is not drawn; black / red = control and grey / pink = influence without control, so the control ring goes; the two colours blend in the middle); three versions on the page "Influence disc" (`design3/disc.py`): V1 半盤, V2 滿盤, V3 鏤空. **The owner picked V2, with a darker grey and a redder pink**; a second board (`design3/disc2.py`) shows three tone steps with their contrast numbers (black against grey falls from 3.4 to 2.7 and 2.3, red against pink from 3.9 to 2.7 and 2.4: tone is now the only sign of control) and an optional thin inner rim on controlled discs. **The owner picked 深一階** (grey `#5a5650`, pink `#d9827a`, no inner rim): issue #51, to be dispatched when #49 lands (both rewrite the small pills around the disc); the disc's decision goes into a DOM-free `public/disc-view.js` so I can guard it with a test. **Audio**: there is no sound in the game today; the list of situations that need their own music (11) and of places that need a sound (53 rows), with ids and priorities, is in [[zongheng - audio]]; four questions for the owner at its end; no issue yet.
- [x] #56 landed and live (2026-09-20, `8a58aef` merged as `91b49bd`, version `435ea1c1`, live `advisor-ui.js` byte-identical): with the advisor on, a suggested scoring card's page marks 事件 in gold. One line: the page translates the advisor's `score` to `event` where it looks the button up. Checker 129 of 129 on a throwaway merge with main. Seen with my own script (it follows the advisor's gold marks until a scoring card is suggested): 390x669 zh, 西土記分, 事件 gold before and after it is pressed, scroll 0; advisor off, no mark; 1280x800 en, Event gold. Not fixed, reported by the peer: a suggested headline marks nothing on the card's page (蓋下 is outside the marked selectors). **Owner the same evening: 「先產生musics,我等會再聽sounds」**: music batches M1 (the table, three eras times two seats, 120 s each) and M2 (landing, two wins, two defeats) are queued on the local ComfyUI, 23 pieces, written in the style of the accepted 楚 C 雲夢; details in the audio note, section 十二.
- [ ] Later that evening, 2026-09-20 (main `657247b`, 129 tests, live `3f882615`). **#55 landed and live** (`68a8bed` merged as `eff1bd0`): a `forcedCard(st, side)` helper in the engine is the one reader of 細作's named card, and the obligation lapses when that card has left the hand. Checker: 126 of 126, my guard 3 of 3 on the branch and 1 of 3 on the base, two of three falsifications red (the third is an equivalent mutant: `beginAction` wipes the stale name before `legal()` reads it), seeds 1 to 400 all finish on fallbacks. After the deploy the live `engine.js` was byte-identical and a real room on production (`ALMU`) got the bot's answer through the alarm. Guard landed as `tests/no-deadlock.test.js`. **#57 filed and with the same `peer-be`**: the peer found a second live deadlock while fixing the first (頓兵堅城 and 細作 on the same side, seed 1332: the bog discard is refused because a card is named, the named card is refused because a bog discard is owed) and a synthetic third (the headline phase with an empty hand). My rulings, written into the rulebook's 細則 as provisional and FLAGGED TO THE OWNER: the bog comes first with any 2+ ops card and 細作 carries over unless the named card itself was discarded; a side with no card commits no headline. Extended guard ready (`scratchpad/no-deadlock.v57.test.js`, 8 checks, 3 pass and 5 fail today). **#56 filed from the owner's phone screenshot and with a `peer-fe`**: with the advisor on, a suggested scoring card's page does not mark 事件 in gold. Cause read in the code: the advisor calls that use `score` (the strip's sentence keys on it) and the page looks uses up in a list that has no `score`. **#53 part 2 round 1 (`cbfefe6`) sent back**: the logic is right (fallback applied and saved, the stuck case stops the loop and shows again after a resume), but on the phone neither sentence is on screen: they only reach the closed log panel and the desktop sidebar, so a stuck game still reads 「等待對手…」 for ever. Measured in a review worktree with the bot and the fallback stubbed through localStorage flags.
- [ ] Evening of 2026-09-20 (main `0386f96`, 126 tests, live `5d33d80c`). **#53 part 1 landed** (`a4301bf`): the room's fallback moved to the shared `public/shared/fallback.js` (`fallbackFor(state, side)`), and it now tries scoring cards first: my dry run had shown that a game played only on fallbacks ended in turn 1 or 2 for a held scoring card; now such games run to turns 6 to 8 and visit every pending kind. Guard `tests/fallback.test.js`. Room smoke test on production passed after the deploy. **#55 found by the BE peer on the way and reproduced by me: an engine deadlock.** 細作 names a card; if that card is discarded before it can be played (seed 70: 春申君 played for ops, the forced discard is 說客), the side has NO legal action and the game is stuck, for a human too. My ruling, FLAGGED TO THE OWNER because rules are the owner's: the obligation lapses when the named card is no longer in the hand. With a `peer-be`; guard written (`scratchpad/no-deadlock.test.js`: seed 70, an invariant over 120 games, and that a live named card is still enforced; red on main). #53 part 2 (the solo game uses the fallback and says so) is with a `peer-fe`. **Audio**: the owner picked 14 sounds of S1 and S2 (16 accepted with the first two) and sent seven back with directions; regenerated as S2b. Listening pages are in Traditional Chinese from now on.
- [x] **#54 landed and live** (2026-09-20, `d1d3bb7` merged as `87693c2`, version `99a4401f`, first hand-in): every pending prompt fits the phone. On main the 「怎麼用?」 prompt set #24's give-way flag only after a use was picked, so with the advisor off the hand was cut by 24 px at 390x669. Verified from fresh loads in natural play (函谷關天險 event first): five sub-states at 390x669 zh and 375x667 en, advisor off and on, scroll 0, every button tappable, the hand comes back afterwards. My table walk now confirms an event-first play and checks the PENDING states (it used to cancel, which is why this state went unseen since #24); its NO-CANCEL rule no longer applies to pending prompts.
- [x] Later on 2026-09-20 (main `ef1cda2`, 122 tests, live `36f250c1`): **#25 landed** (`7a34638`): a refused bot action no longer keeps a room awake: 3 refusals on one position, then a fallback the engine accepted, or one 'bot stuck' line and no more 900 ms wake-ups. Round 1 keyed the position on `log.length`, which the engine caps at 400 entries; sent back for `logSeq`; the peer measured a real key collision once that part is frozen. Guard `tests/room-bot-retry.test.js` (the peer's four, adopted, plus mine). After the deploy a smoke test on production: a real room, a bot seat, the bot's setup arrived through the real alarm. **#43 landed** (`42d520b`): hover, pressed and focus on every control, the card page and log arrive in 160 ms; round 1 came back for coverage (a mechanical check found 12 kinds of control without a rule, the design board's own example among them); my resting-state diff over every computed property is 0 on every page. **#52 landed** (`ef1cda2`): the advisor marks its suggestion on pending prompts (the owner's 「怎麼用?」 case), verified in natural play. **Found on the way: #54**, on main and on the owner's phone size: with the advisor off that same prompt overflows (390x669: hand cut by 24 px); my table walk never entered a pending prompt because it cancelled event-first plays; the walk now confirms one. #54 is with a `peer-fe`. **#53 filed** (the solo game freezes silently when the bot's action is refused). **Audio**: the owner accepted Chu C 雲夢 and ordered sounds first, then music, in batches; batches S1 (10 sounds) and S2 (11) sent as listening pages, S3 defined.
- [ ] Afternoon of 2026-09-20. **Audio**: the owner accepted the two sounds and found the two musics "smooth but not good"; round 2 is six pieces, three characters per side, written to MiniMax's own caption guide (positive descriptions, a section timeline, the eight-sounds families split between the courts); sent, waiting for the owner's ears. **#25** (room bot retry loop, back end) dispatched on the owner's word, with two rulings (tests stay mine: the peer hands me its red-then-green test; the fix's direction is decided). **#52** filed from the owner's desktop screenshot: with the advisor on, the 「怎麼用?」 prompt's buttons wear no gold mark, because `decorateSheet()` only looks at the card page's grid and a pending choice carries its move in `adv.action.choice`; with a `peer-fe`. **#43** round 1 (`945d2d2`): my own resting-state diff over EVERY computed property is 0 on nine pages and states (up to 630,039 properties), walks and sweeps clean, checker green; sent back because a mechanical coverage check (`scratchpad/v43_cover.js`) finds controls with no hover or pressed rule: the landing's outline buttons (the design board's own example), the ending's three outline buttons, two level buttons, and no pressed look on the bar's links.
- [ ] Audio, first samples (2026-09-20): both local ComfyUI workflows run. Music = template `audio_minimax_music_3` (about 7 minutes for a 60 s piece on one 3090), sounds = `audio_stable_audio_3_medium` (about 3 s each). Made: the reform-era table music in a Qin-lead and a Chu-lead version (same tempo and key, seed 5101) and two effects in three takes each (placing a piece; a Chu event = one bronze chime bell). Sent to the owner as MP3 with the two workflows in API format; I can only measure them (length, loudness, silences), the owner has to listen. Details in [[zongheng - audio]] section 八.
- [x] **#51 landed and live** (2026-09-20, `47043d3` merged as `0632e89`, version `ba925020`, issue closed, first hand-in): the influence disc V2 滿盤. A side without influence is not drawn, a lone side fills the disc with one centred 16 px numeral, black / red = control and grey `#5a5650` / pink `#d9827a` = influence without control, the two tones blend in the middle, the control ring is gone, the hit buttons' names say who controls. I rigged a saved game with every state and compared all 26 discs with the engine (0 mismatches), looked at the screenshot next to the board, swept the pills with every disc forced lone and forced split (0 / 0 / the accepted 1), ran the table walk, the tutorial and the last-move marks. Guard: `tests/disc-view.test.js` (5 checks, falsified three ways by the checker), main now runs 117 tests. Next and last of this wave: #43.
- [x] (done, see above) #51 dispatched (2026-09-20, main `3d5f7e6`): the influence disc V2 滿盤, 深一階, to a `peer-fe`; `tests/disc-view.test.js` is written and waits for `public/disc-view.js` (five checks, the last one compares every space of a real position with `E.controller`).
- [x] **#49 landed and live** (2026-09-20, `081fb76` merged as `a863790`, version `b1851469`, issue closed): while a side places influence the +N badge and the picked ring wear its colour (Qin black, Chu red), the badge has the last-move tag's size, and both pills read one per-space position table (`NODE_PILL_POS` in `map-draw.js`). Four rounds. Round 1 put the black +N on Qin's own numeral on six spaces (my brief had not listed the digits); my new sweep, which forces the pill onto all 26 spaces with both digits present, also found 8 latent overlaps in the last-move tag that was already live (my #41 check had only seen marks that happened to appear and its selector missed the numerals). Round 2 put 薊's pill under the disc, touching 邯鄲; I ruled it back to the corner from a probe that had no map-edge check, and the peer's own measurement showed that corner cut by 6.9 px on desktop: the peer's instrument was right. Round 4: a position `trl`, 5 px lower. Final sweep 0 / 0 / 1 (郢's pill on 1.9 px of a neighbour's name at 375x667 en, accepted by me). Guard added: `tests/pill-pos.test.js`, main now runs 112 tests.
- [x] Owner's ruling (2026-09-20): with 「隨機」 selected on the solo setup page, the page's ground **stays cream**. No change; my question from #42 is closed.
- [x] **#50 done: the losing endings are live** (2026-09-20, part 2 `3f4aea3` merged as `088e599`, version `b39f8d1d`, issue closed). The loser sees their own emblem burnt (`loser-qin` / `loser-chu` on `#over`, `lose_<side>.jpg`, no glyph, grounds `#12100e` and `#1c0907`, plain ground on desktop); the winner and a spectator see today's page, which I checked on the same build, and the CSS diff removes no line. I reached real endings without touching code: in the saved solo game `st.options.seals = 0` (Chu wins at the next marker check) or `st.options.mie = 0` (Qin), `play.html?resume`, one Place card (`scratchpad/v50_check.js`). At 390x669 the tiger sits at 120 to 263 and the title starts at 290. Seen on the way, for the copy pass: the English ending title wraps to two lines at 375 px because of its 6 px letter spacing, on win pages too.
- [x] #50 part 1 landed and live (2026-09-20, artist's `5996e63` merged as `21622b1`, version `85b79aea`): `lose_qin.jpg` (the tiger re-framed upward, the ash ground extended without a seam) and `lose_chu.jpg`, prompts and seeds in `prompts.json`. The artist flagged that the tiger's paws and the phoenix's tail reach under the words: the first was my arithmetic (I asked for 22 to 50 % of the height, the board needs 13 to 43 %), solved in part 2 with `object-position: center 24%`; the second is the board the owner approved. Part 2 (the page) is with a `peer-fe`.
- [ ] #49 round 1 (`4d65d2a`) sent back: colour, size, ring, layout, taps and tests pass, but on the six spaces whose pill sits at the left the black +N covers about half of Qin's own numeral (函谷關 and 巴蜀 among them). My brief had not listed the digits, and my #41 check never looked at them either (its selector missed the `<i>` numerals and it only saw marks that happened to appear): a new sweep that forces the pill onto all 26 spaces with both digits present finds 15 overlaps for the badge and 8 latent ones for the last-move tag that is live. Round 2: one per-space position table for both pills, chosen mechanically against that sweep (`scratchpad/v49_sweep.js`, posted on the issue).
- [ ] #49 dispatched (2026-09-20, owner: 「Qin 在放影響力時,+1/+2/... 用黑色」): the +N badge and the picked ring were Chu's red for both sides; they follow the placing side, and the badge takes the last-move tag's size and position rules (18 px, 12 px digits). With a `peer-fe`.
- [x] #42 landed and live (2026-09-20, `3fd06e5` merged as `d9dc379`, version `71154682`): the setup tiles carry the courts' pictures (Random = tiger left, phoenix right, a gold seam, the 「?」 above the words), the landing's and the card page's small print is 12 px and up. Round 1 had both Random half-pictures on the left half. Verified on a local merge with #41 (108 tests, two table walks clean, the last-move marks still equal my own diff). The PC rebooted during the merge and zeroed `.git/refs/heads/main`; the merge commit was intact, the ref was restored from the reflog, fsck clean.
- [x] #41 landed and live (2026-09-20, merged as `6e54b73`, version `616bdae6`): the map frames every space the last action changed with four ink corner brackets and tags it with the change in the changed side's colour; a tap clears the marks; none in the tutorial. The diff lives in a DOM-free `public/lastmove.js`, guarded by `tests/lastmove.test.js` (7 tests, falsified twice, `c2245e6`). Known limit, accepted for now: an opponent action that resolves in two renders (an event, then its ops) shows only the second render's changes.
- [x] #46 landed and live on its first hand-in (2026-09-20, `c952c2c` merged as `da2ce1b`, version `a587c972`): every face of a card shows the interface language only (the hand card page's name, text and use buttons; the read-only card; the rules page's detail on the phone and in the desktop panel; the other language is not in the DOM), and the hand card page shows the card's history under the rules text, in a middle that scrolls while the use buttons, order row and Cancel / Confirm stay pinned. On a headline card all of the story shows at 390x669; on an enemy card, the tightest page, the heading and first line show and the rest scrolls. With the advisor on the advice strip now sits above the history and is wholly visible. The tutorial keeps its card pages without history.
- [ ] #41 round 1 (`06c8e54`): the marks match my own diff of the saved game's influence for three bot actions in a row, taps and layout are untouched; sent back because the mark does not catch the eye (a thin bronze outline beside the control rings, a 9 px tag): four ink corner brackets and an 18 px tag in the changed side's colour, and the diff function into a DOM-free module so I can test it. #42 (setup tiles, small print) dispatched when #46 landed.
- [x] #48 landed and live (2026-09-20, `b39b488` merged as `3142bfb`, version `a1dcca16`): the 天命 bar's fill grows from the middle to the marker in the leader's colour (Qin's paper tone, 11.5:1 on the track; a new `--chu-fill` `#e0392b`, 3.47:1, because the disc red is only 1.98:1 there: the peer stopped and asked instead of picking a colour). Checked with real renders at 0, 秦 +6, 楚 +3 and both ends by editing the saved solo game's `mandate` and loading `play.html?resume`; no height change.
- [ ] Wave 2 dispatched (2026-09-20): #46 (a card shows one language on the card page, the read-only card and the rules detail; the hand card page gains the history; the advice strip moves above it), #41 (the map marks what the last action changed) and #48, a small one from my own screenshot of #39: with 秦 +6 the bar was mostly red, because my board filled black from the left edge to the marker; the fill now grows from the middle in the leader's colour. Three peers at once in `app.js` and `style.css`, in different parts: they land one at a time, the later ones through a local merge worktree.
- [x] #47 landed and live (2026-09-20, `e87b4ae` merged as `aa445a9`, version `665e4029`): the rules page's lists show one language (phone rows: name, 「era · side」 line and text in the interface language; desktop tiles likewise), the search still finds a card by its other-language name, the phone row's badge is 12 px, the tile's year reads 「前 356 年」. Round 1 had lost the 「*」 mark (removed after its event) in English, because it lived on the Chinese name; now 41 rows and tiles carry it in both languages. The card pages' one language is #46, waiting for #39.
- [x] #45 landed and live (2026-09-20, `d5db5dc` merged as `002bb1c`, version `9cd2cc96`): on the desktop rules page no scrollbar is drawn, the card tile is the design's (picture at the left, badge and 15 px name on the first line, a second line always present: year, 年代不詳, the era for scoring cards, 每個時期 for 九鼎), and the card panel's picture frame is whole. Two rounds: round 1 had put the panel's padding on the wrong element (the clipper was the inner one) and left 30 tiles without a second line. This time I compared a screenshot of the whole tab with the board. #47 (the rules lists in one language) went to the same peer.
- [ ] #39 round 2 (`daadbc8`): the 2 px regression, the pills on every visible card name and the late advice layout are all fixed, but my walk found a new overflow in a state the peer's matrix missed: 375x667, English, advisor off, headline phase, 24 px with the hand ending at 685 of 667 (main: 0). The map was already at its floor there on main. Ruling sent back: the floor may drop until the map's hit buttons are 40 px (they are 45); the log strip is never empty while the log has a line. Round 3 running.
- [x] #44 landed and live (2026-09-20, `431a772` merged as `7f7ebec`, version `17bc2352`): the rules page on desktop is design B, from 1024 px of width in a frame of at most 1280 px: two tabs in a sticky bar; 規則 with a section list that marks the section under the bar, a 571 px text column and the map pinned at 400 px (320 px with a 395 px column at 1024); 七十二張牌 with filters and counts in the rail, compact 12 px tiles in three columns (two at 1024) and the chosen card beside them; picks replace the history entry, `#card-<id>` opens the cards tab. Three rounds; two of the defects came from my own rules (a one-third-of-the-viewport threshold that marked the next section after a click on a short one). The PC rebooted at 08:01 in the middle of the landing; nothing had been merged, the tests were re-run.
- [ ] Owner, right after #44 (2026-09-20): no scrollbar on the desktop rules page (#45, with the same peer), and **the hand card page in the game must show the card's history** (#46, iPhone screenshot of 吳起變法 with an empty area above the buttons). #46 reverses my earlier ruling that the playable card page had no room: the story goes in the scrolling middle under the rules text, the use buttons and Cancel / Confirm stay pinned, the compact target-picking panel and the tutorial's simple page stay without it. #46 starts when #39 lands, together with #41. **Second ruling the same morning: "卡牌,只顯示一語言" means every face of a card** (names, rules text, use buttons), not only the hand chips and the histories as I had read it. #46 now carries the one-language card page (playable, read-only and the rules page's detail, through `card-view.js`) together with the history; #47 is the rules page's lists in one language (search still matches both names) and the phone row's badge at 12 px, for the #45 peer when #45 lands. Two more desktop reports from the owner went into #45 the same morning: the card tiles are not the design's (live: the badge sits on the picture's corner and name and year share one 12 px line; design: picture at the left, badge and a 15 px name on the first line, the year under them), which I had passed in review on sizes alone without comparing the layout with the board; and the card panel clips the picture's double-ring frame on the left (no inner padding under `overflow: hidden`).
- [x] #40 landed and live (2026-09-20, `0dd5ee9` merged as `f809594`, version `9f27bafb`): the rules page on the phone has section chips that stay at the top and follow the scroll, a search field (16 px) and era and side filters for the 72 cards with a count line and an empty state; a card opened from a filtered list returns to the same scroll and filters by Close or Back; the deep link now opens the five `score_*` cards too. My own script at 390x669 zh and 375x667 en: counts 72 / 27 / 24 / 20 and 72 / 23 / 23 / 21 / 5, nine chip taps each landing the heading under the row, strict tap checks. #44 (the desktop layout, design B) went to a `peer-fe` right after.
- [x] **#36 done: all 72 cards have a history** (2026-09-20, batch 4 `e808f78` merged as `5d7c3c7`, live version `bace6ccc`, issue closed). The completeness test stopped being a todo (`3e3137d`, falsified once); 101 tests, 0 todo. Four batches, ten review rounds; in round 1 the batches came back 12 of 22, 15 of 21, 13 of 20 and 4 of 6. I read every story in both languages and checked the doubtful lines in the Shiji text. What came back most: invented quotations and numbers, titles the source does not give, two events or people folded into one, later legends told as fact, slips between the two languages. Found on the way: the rules page's deep link does not open the five `score_*` cards (hash pattern without an underscore); handed to #40.
- [x] #36 batch 3 landed and live (2026-09-20, writer's `93da7ba` merged as `2ff62f8`, version `6f8faae3`): **66 of 72** stories in (the total is 72: the 71 cards of `CARDS` plus 九鼎; my earlier "73" was a miscount, corrected on #36 and #40). Batch 4, the last, is with the writer: the five scoring cards as stories of their regions, and 九鼎 with both traditions of how the cauldrons ended.
- [ ] Rules page on desktop, design round (2026-09-20): canvas Version 37, page "Rules page on desktop" (generator `design3/rulesdesk.py`), two versions at 1280 x 800, two states each. **A 一頁到底**: the phone's single page with a section rail, a 720 px column and a card drawer. **B 兩個分頁**: a Rules tab with the map pinned beside the text, and a Cards tab with filters and counts in the rail, a grid, and the chosen card beside it; my recommendation. **The owner picked B** the same day. Issue #44 is open and waits for #40 to land (it reuses #40's search and filters): from 1024 px of width, in a frame of at most 1280 px; below that the page stays the phone page.
- [x] (history of that batch) #36 batch 3 (conquest era, 20 stories), round 1 `cdc6413` (2026-09-20; the PC blue-screened at 22:34 the night before with all 20 drafted and none committed, the file survived on disk): I read all 20 in both languages, 7 pass, 13 back, 8 of them for facts (呂不韋 made 相國 in the wrong year, 廉頗 holding Changping for three years where the biography has months, 項燕 named in a passage that says only 荊人, 春申君 called a noble, 逐客令 ending without its withdrawal, a quotation missing a word and a million turned into a hundred thousand, 上黨 and 長平 folded into one year, 沃野千里 with a number the source does not have). With the writer for round 2.
- [x] (history of that batch) #36 batch 2 (alliance era, 21 stories), round 1 `87e9eab`: I read all 21 in both languages; 6 pass, 15 back, 8 of them for facts (張儀欺楚 puts the bribing of 靳尚 and 鄭袖 in the wrong visit; 宜陽 has an invented 五萬; 遠交近攻 has Qin hit Han first where the biography has Wei; 合縱攻秦 gives Mengchang a title no source has; 屈原 fuses 上官大夫 with 靳尚; 黃金臺 states the terrace as fact under sources that only have a palace for Guo Wei; 齊滅宋 contradicts its own first source's 三分其地; 修長城 has the order of the walls wrong; 徙民實邊 should stand on the 昭襄王 entries of 秦本紀). Six points were re-checked in the Shiji text itself. With the writer for round 2.
- [ ] Making the signed-off C2 design live, as ordered issues (https://github.com/csiesheep/zongheng/issues):
      #1 art into the repo (landed `098fc82`), #3 uniform Qin frames (landed `554d591`), #4 win art and the light map
      (landed `ea13f54`), #2 landing + no mixed labels + setup themes + card sheets (landed `e9d3f36`
      after one return to the same peer, live as `0b172cd8`), #5 table pages (with `peer-fe`, same context), then #6 lobby + endings + rules, #7 desktop (proposal first),
      #9 copy pass; #8 videos waits for the owner's picks. Every land is deployed and byte-checked. (2026-09-18)
- [ ] Superseded note, kept for history: issues #1 (art into `public/art/`, `peer-chore`) and #2 (C2 phone client, `peer-fe`), https://github.com/csiesheep/zongheng/issues : rebuild the client on C2: landing at `100svh`, game page,
      card sheet, the 72 card images into the repo (about 7 MB as 600x800 JPEG), desktop
      layout, both languages; then deploy and byte-verify.
- [ ] Hard-bot check of the round-2 rules (150 games) and a look at why 一統
      ends only 3 % of games.
- [ ] M5: rules page, deploy the playable build (still noindex), then the ship checklist.

Owner's direction (2026-09-18): little effort on UI (it will be redesigned with
image and video generators); make the engine, the balance and the play flow
right first.
- [ ] M1 engine.
