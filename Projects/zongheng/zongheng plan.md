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
