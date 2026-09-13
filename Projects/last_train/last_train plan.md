---
tags: [project]
status: proposed
started: 2026-09-13
---
# night_boat 夜航船 — plan

Created 2026-09-13. Repo `csiesheep/night_boat`, live at
`https://games.csiesheep.com/night_boat/` (not yet).

## Overview
**夜航船 / The Night Boat** is a 3–10 player hidden-society card game,
about 30 minutes, under its own name and setting. The play is the
trade-and-scuffle system of *Die Kutschfahrt zur Teufelsburg* (see
[[night_boat - rulebook]]): everyone secretly belongs to one of two
societies, carries a trade with one trick and a piece of luggage; you trade
items to learn who is who, pick fights to see cards or take things, and
call the win when your side holds three lamps or three keys and you can
say whose hands they are in. Two ways to play, as every sibling:
1. **Solo**: you plus 2–9 AI passengers, entirely in the browser.
2. **Online room**: a four-letter code, friends join, bots fill empty seats
   and take over anyone who drops.
English + Traditional Chinese from v1, phone-first, fan-made and
unofficial, one Cloudflare Worker under the `games` hub.

## Why this shape
Modelled on **tiandihui** (`~/code/tiandihui`), the newest sibling: the
prefix router, the room Durable Object with hibernating sockets and one
alarm, the per-seat `view(state, seat)` projection, bot seats with
`why`-carrying decisions and templated talk, the child-process balance
harness, i18n files, the ship checklist. All of that is reused.

What is new to this game, and where the work is:
1. **Hidden hands, not just hidden roles.** In 天地會 the only secret is a
   role. Here every seat hides a society, a trade and 1–8 items, and
   information leaks in five different ways (a fight's peek, a fight's
   take, a trade's face-down card, a trade text like the demon mirror, a
   revealed trade). The view projection has to track *who has seen what*,
   per seat, and keep it consistent when items move.
2. **A fight is a mini-phase with everybody in it.** Support goes round
   the table in order, then abilities and items in any order, then the
   count, then the winner's choice, with three once-per-game trades able
   to interrupt (monk before support, apothecary before the count,
   physician after it). That is a sub-state machine with timeouts for
   every seat, not one actor at a time.
3. **Bots that can call the win.** The whole game is deciding when you
   know enough. A bot needs a belief over society assignments *and* over
   where the six goal items are, updated by every leak it saw, and a rule
   for when the expected value of declaring beats another turn.
4. **Odd counts.** One side is one bigger and nobody knows which; the
   talisman water (Trank der Macht) only counts for the smaller side. Bots
   have to reason about their own side's size.

## Licensing
Original: *Die Kutschfahrt zur Teufelsburg*, Michael Palm and Lukas Zach,
Adlung-Spiele 2006; Chinese edition 魔城馬車 by 新天鵝堡; a new edition
with the expansion is due from Game Factory in late September 2026, so
the mark is in active commercial use. Rules and mechanics are not
copyrightable; the exposure is the trademark, using the publisher's title
as the name of a similar product on a page with ads. "Fan-made,
unofficial" mitigates, it does not defend. So: own name, own setting, own
faction words, own art and prose.

Own name proposed: **夜航船 / The Night Boat** (a covered passenger boat
on a canal after midnight, Ming/Qing era; 夜航船 is also the title of
Zhang Dai's 17th-century miscellany about idle talk among boat passengers,
public domain). Credit line, once, in the footer:

> 同人作品，非官方。玩法啟發自 Michael Palm 與 Lukas Zach 設計的《Die
> Kutschfahrt zur Teufelsburg》；名稱、設定、美術與文字皆為本站原創。
> A free fan project, unofficial. The play is inspired by Die Kutschfahrt
> zur Teufelsburg, a card game designed by Michael Palm and Lukas Zach;
> the name, setting, art and words here are our own.

*Not legal advice.*

## Source material
- Rulebook PDF (DE + EN):
  https://silo.tips/download/die-kutschfahrt-zur-teufelsburg-autoren-michael-palm-und-lukas-zach
- Digest with every table and card: [[night_boat - rulebook]]
- BGG: https://boardgamegeek.com/boardgame/168839/die-kutschfahrt-zur-teufelsburg
- Chinese edition: https://www.swanpanasia.com/products/kutschfahrt-zur-teufelsburg

Unclear points and how v1 resolves each (details in the rulebook note):
| # | point | v1 |
|---|---|---|
| 1 | count of keys and goblets | 3 + 3, derived from the 21-card deck; test asserts it |
| 2 | who starts | random seat, seeded |
| 3 | talisman water stacking | at most one per declaration |
| 4 | duelist +1 (EN text only) | no +1; German card text is canonical; toggle |
| 5 | envoy's forced trade | a normal forced trade, envoy gives one back, trade texts fire |
| 6 | "dual-symbol" person cards | none; one sword or one shield |
| 7 | fight winner vs empty hand | option (b) hidden |
| 8 | apothecary timing | any time before the count |
| 9 | physician vs winner's peek | physician window first, then the winner chooses |
| 10 | best player count | solo default 6; 3–10 allowed, note at 3 |

## Theme
| slot | original | now (zh) | now (en) |
|---|---|---|---|
| title | Die Kutschfahrt zur Teufelsburg | 夜航船 | The Night Boat |
| setting | a coach racing to Devil's Castle | 夜半渡江的篷船 | a covered boat crossing the river after midnight |
| society A (keys) | Orden der offenen Geheimnisse | 持鑰會 | the Keyholders |
| society B (goblets) | Bruderschaft der wahren Lüge | 掌燈盟 | the Lamplighters |
| goal items | Schlüssel / Kelch | 鑰匙 / 燈 | key / lamp |
| profession | Beruf | 行當 | trade |
| luggage | Gepäck / Gegenstand | 行囊 / 物件 | luggage / item |
| actions | passen / tauschen / angreifen / Sieg verkünden | 過 / 換物 / 交手 / 宣勝 | pass / trade / fight / declare |
| support | Schwert / Schild / enthalten | 助攻 / 助守 / 袖手 | back the attacker / back the defender / stay out |
| odd-count card | Trank der Macht | 符水 | talisman water |
| solo-win card | Wappen der Loge | 令牌 | the token |
| secret cases | Geheimer Koffer | 密箱（燈 / 鑰） | sealed chest (lamp / key) |
| bot names | Sarah MacMullin… | 阿福、老周、秀娘、陳先生、小滿、麻子、雲姑、鐵頭、三娘、書生 | Ah Fu, Old Zhou, Xiu Niang, Mr. Chen, Xiaoman, Mazi, Yun Gu, Tietou, San Niang, the Scholar |
| favicon | | a lantern outline in amber on night ink | |

Trades (行當): 說客 envoy · 郎中 physician · 劍客 swordsman · 藥師
apothecary · 老鏢頭 old master · 相士 soothsayer · 術士 mesmerist · 鏢師
escort · 僧人 monk · 打手 bruiser.
Items: 匕首 dagger · 護腕 bracers · 毒戒 poison ring · 飛刀 knives · 皮鞭
whip · 古籍 tome · 蓑衣 cape · 官憑 warrant · 照妖鏡 demon mirror · 羅盤
compass · 黑珠 black pearl · 破鏡 broken mirror · 令牌 token · 密箱 ×2.

### Look (proposed 2026-09-13, direction A on the canvas)
Design canvas: https://claude.ai/code/artifact/581233b4-4a9a-42d7-92d7-61b7f422ed75 (page 1 the main flow, twelve phone screens;
page 2 the two directions not taken, 木刻版畫 woodblock and 民初夜車
night train).

| token | value | used for |
|---|---|---|
| night | `#101720` (panels `#182231`, deep `#0a0f16`) | the ground |
| line | `#2b3747` | 1px rules and borders |
| paper | `#efe4c8` (muted `#a99f88`) | text |
| amber | `#e2a63c` | the Lamplighters, lamps, primary button, your seat, the reveal card |
| verdigris | `#4fa08c` | the Keyholders, keys |
| cinnabar | `#c2452f` | a strike: attack count, the fight button |
| steel | `#9fb3c8` | a guard: defence count, AI tag |
| display | LXGW WenKai TC | title, big numbers, headings |
| body | Noto Sans TC | everything else |
| Latin | Cormorant Garamond | the English title and numerals on the EN pages |

Square corners, 1px rules, no shadows; only the lamp has a glow. Chinese
numerals for the round and player count (第三巡、六). Item cards are
paper-coloured on the dark table so the hand reads at a glance.

## Rules in scope (v1 = base game, exactly)
| players | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| society cards in | 2+2 | 2+2 | 3+3 | 3+3 | 4+4 | 4+4 | 5+5 | 5+5 |
| one card out | yes | – | yes | – | yes | – | yes | – |
| talisman water | each | – | each | – | each | – | each | – |
| hand limit | 8 | 6 | 5 | 5 | 5 | 5 | 5 | 5 |
| starting items | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| removed | black pearl | – | – | – | – | – | – | cape |

Deck: 3 lamps, 3 keys, 2 sealed chests, 13 singletons (21). Ten trades.
Setup: both chests plus *players − 2* random items are shuffled and dealt
one each; the rest is the pile. Turn: pass / trade one item / fight one
player / declare. Fight: support clockwise from the attacker's left, then
abilities and items, then count; the winner peeks (society + trade) or
takes one item; tie draws for the attacker. Declaration: right and every
member of that side wins, wrong and the other side wins. Token: any three
goal items in one hand is a solo win. Full text: [[night_boat - rulebook]].

**Not in v1** (data-driven so they can be added without touching the
machine): the three official variants (smuggling, fortune-telling,
advanced 3-player) and the *Die dunkle Prophezeiung* expansion (events,
coachman, traitor). Smuggling is one flag on the trade action and could
ship as a lobby toggle.

## Architecture
```
night_boat/
  public/
    index.html, app.js, style.css, rules.html, favicon.svg, og-image.png
    i18n/en.js, i18n/zh-Hant.js
    shared/engine.js   deck, setup, turn machine, fight sub-machine, view()
    shared/bots.js     belief model + policies, 3 levels, `why` on every decision
    shared/talk.js     table-talk templates per language
  src/index.js         Worker: prefix router + /ws         (from tiandihui)
  src/room.js          Durable Object per room              (from tiandihui)
  tests/engine.test.js, bots.test.js, room.test.js, sim.js
```

### Engine
- State: `seats[]` each `{society, trade, tradeUsed, tradeRevealed,
  items[], talisman}`, `pile[]`, `turn`, `phase`, and a `knowledge` map:
  for every seat, what it has *seen* (another seat's society, trade, or a
  specific item at a specific time). Items carry stable ids so "the dagger
  I saw in Xiu Niang's hand" stays a fact after it moves.
- Phases: `turn` → one of `trade(offer → answer → texts)`,
  `fight(declare → monk window → support × n → powers → count → physician
  window → winner's choice)`, `declare(claim → reveal → over)`, `pass`.
  Plus `handLimit` interrupts whenever a hand exceeds the cap.
- `apply(state, action)` throws on anything illegal; the UI never offers
  an action `legal(state, seat)` does not list.
- `view(state, seat)`: own cards; every seat's item *count*, revealed
  trades, talisman; everything that seat's knowledge map holds; the log.
  `view(state, null)` is the spectator / game-over view.
- Seeded RNG in the state (mulberry32); JSON clone.

### Bots
- **Belief**: a distribution over society assignments (at most C(10,5) =
  252 splits, exact) times, per goal item, a distribution over which seat
  holds it. Hard evidence zeroes (a peeked society, an item seen in a
  hand, a chest drawn from the pile); soft evidence reweights (who
  supports whom in fights, who trades with whom, who accepted a demon
  mirror, who refuses trades).
- **Policies** from the belief: *trade* to the seat most likely allied,
  offering the item that leaks least and asking for the most (goal items
  flow toward the side that needs them; never hand a goal item to a
  probable enemy); *fight* the seat whose hand is most likely to hold
  what you need when the expected support margin is positive, otherwise
  the seat you know least about; *support* the probable ally; *declare*
  when P(claim is right) × win ≥ the value of waiting, with a level knob
  on the threshold.
- Levels: easy (random legal moves with a light bias), normal (the model),
  hard (the model plus lookahead on what a declaration reveals and
  bluff trades that leak nothing).
- Every decision carries a `why` for the talk templates.

### Room
- Lobby: host creates, 3–10 seats, Add bot, level, smuggling toggle, Start.
- Clocks (one alarm): turn 60 s, trade answer 30 s, each support 15 s,
  powers window 20 s, winner's choice 20 s, declare 60 s. A timeout resolves
  as the bot would for that seat (support: stay out; trade answer: refuse;
  turn: pass).
- Disconnect 15 s grace then bot; token in sessionStorage reclaims.
- Chat, 200 chars, last 100 lines. Fan-out is `view` per socket only.

## Pages and UI
| Route | View | What is on it |
|---|---|---|
| `/night_boat/` | Landing | lantern, title, pitch, Solo / Open a room / Join code, credit |
| `?play` | Solo setup | name, players 3–10 (default 6), level, smuggling toggle |
| `?room=ABCD` | Lobby | code, seat list with AI tags, Add bot, level, Start |
| (in game) | Reveal | your society, your trade and its text, your starting item |
| (in game) | Table | seat grid with item counts and revealed trades, your hand, action bar 換物 / 交手 / 宣勝 / 過, log |
| Table › Fight | attack vs defence counts, support list, your usable items and trade, timer |
| Table › Trade | the offered card, its text, pick what to give back, accept / refuse |
| (in game) | Declare | your goal items, pick the allies and what they hold, the warning |
| (in game) | Game over | winner, every seat's society / trade / items, rematch |
| `/night_boat/rules` | Rulebook | own prose, the count table, the trades and items |

Mockup: https://claude.ai/code/artifact/581233b4-4a9a-42d7-92d7-61b7f422ed75. Phone-first, 390×844.

## Bots and balance
`node tests/sim.js <games> <n or 0> [levelA levelB]`, each cell a child
process with retries. Report per count 3–10: win rate of the side that
declared first, fraction of games ending in a wrong declaration, average
turns, average fights per game. Targets for normal bots: games end in
15–40 turns at every count; wrong declarations under 20 %; no side above
60 % at even counts; at odd counts the bigger side under 65 %. "Feels
human": bots trade early, fight the unknown, and declare with a visible
margin of doubt, not the instant the math allows.

## Milestones
- **M0 Scaffold** (done as a repo, not deployed): router, placeholder,
  tables + test. Deploy and verify routes when the owner says go.
- **M1 Engine + tests**: setup for every count, the turn machine, the
  fight sub-machine with every trade and item, declarations, hand limit,
  `view` with the knowledge map, a fuzz over legal moves. Two days.
- **M2 Bots + harness**: belief model, policies, three levels, the sim
  table above. Two to three days.
- **M3 Solo UI**: every screen on the canvas, bot talk, i18n, rules page.
  Two days.
- **M4 Rooms**: DO, clocks, chat, bot fill, reconnect, rematch. Two days.
- **M5 Ship**: noindex off, OG image, JSON-LD, hub tile, sitemap. One day.

## Open questions (decide before M0)
1. **Name**: 夜航船 / The Night Boat, slug `night_boat` (recommended);
   alternatives 末班夜車 / The Last Night Train, 沙洲商隊 / The Caravan,
   or the original title with a credit line. The repo can still be renamed
   for free until the Worker exists.
2. **Look**: direction A on the canvas (night ink, amber lamp) is the
   recommendation; B woodblock and C night train are on page 2.
3. **Faction words**: 掌燈盟 / 持鑰會 name the goal item, so a new player
   never forgets who needs what. Recommendation: keep; the original's
   opaque names are the alternative.
4. **Solo default count**: 6 (even, the count reviewers rate best).
5. **Smuggling variant as a lobby toggle in v1**: yes, one flag on the
   trade action; the other two variants later.
6. **Duelist +1**: follow the German card text (no +1), keep a toggle.
7. **Talisman water stacking**: one per declaration.
8. **Clocks**: the numbers above are guesses; support at 15 s per seat may
   feel slow at ten players. Tune in M4 with real people.

## Decisions
- **2026-09-13**: initialised from the rulebook; repo scaffolded from
  tiandihui under the recommended slug, not deployed. Name, look and the
  eight questions above await the owner.

## Next steps
- [ ] Owner confirms the name, the look and the open questions.
- [ ] M0: deploy the placeholder, verify both routes and the siblings.
- [ ] M1 engine. [ ] M2 bots. [ ] M3 solo. [ ] M4 rooms. [ ] M5 ship.
