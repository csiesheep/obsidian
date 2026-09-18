---
tags: [project, boardgame]
status: design
started: 2026-09-18
slug: zongheng
---
# 縱橫 zongheng - plan

Created 2026-09-18. Repo https://github.com/csiesheep/zongheng (created
2026-09-18), live at `https://games.csiesheep.com/zongheng/` (not deployed yet).

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
| `/zongheng/` | Landing | Title 縱橫, tagline, the map as art, **Play vs bot**, **Create room**, **Join** (code), rules link, credit line |
| `?play` | Solo setup | Side 秦 / 楚 / random, bot level, your name, language → Start |
| `?room=ABCD` | Lobby | Code, two seats (human / bot badges), side pick, level, Start |
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
8. **相印 is much easier to progress than 滅**: random play pays 2.9 seals a
   game against 0.2 滅, and 24 % of random games end on four seals, none on
   three 滅. Owner's call 2026-09-18: let the M2 harness decide; the fallbacks
   are five seals, or seals that need the capital at the cap.
9. **楚滅越 has no Qin counterpart.** Its lasting +1 on every South scoring is
   worth about 2.5 Mandate a game for Chu; Qin's 白起破郢 lost its v1 scoring
   clause. Recommendation: give 司馬錯伐蜀 "此後西土記分時秦 +1", or make
   楚滅越 a one-off.
10. **Domination with a single battleground.** As written, one controlled
    battleground in an otherwise empty region is 優勢 (more spaces and more
    battlegrounds than nobody). Twilight Struggle also asks for a
    non-battleground. Recommendation: keep; it rewards the first entry into
    an empty region and the bots handle it.

## Decisions
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
- [ ] Decide the seal rule from the hard-vs-hard batch; write it into the rulebook.
- [ ] M5: rules page, deploy the playable build (still noindex), then the ship checklist.

Owner's direction (2026-09-18): little effort on UI (it will be redesigned with
image and video generators); make the engine, the balance and the play flow
right first.
- [ ] M1 engine.
