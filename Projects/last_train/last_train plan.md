---
tags: [project]
status: planned
started: 2026-09-13
---
# last_train 末班夜車 — plan

Created 2026-09-13. Repo `csiesheep/last_train`, live at
`https://games.csiesheep.com/last_train/` (placeholder since 2026-09-13,
noindex until M5).

## Overview
**末班夜車 / The Last Night Train** is a 3–10 player hidden-gang card game,
about 30 minutes, under its own name and setting. The play is the
trade-and-scuffle system of *Die Kutschfahrt zur Teufelsburg* (see
[[last_train - rulebook]]): everyone secretly belongs to one of two gangs,
carries a trade with one trick and a piece of luggage; you trade items to
learn who is who, start scuffles to see cards or take things, and show your
hand when your side holds three pocket watches or three jade seals and you
can say whose bags they are in. Two ways to play, as every sibling:
1. **Solo**: you plus 2–9 AI passengers, entirely in the browser.
2. **Online compartment**: a four-letter code, friends join, bots fill
   empty seats and take over anyone who drops.
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
   role. Here every seat hides a gang, a trade and 1–8 items, and
   information leaks in five different ways (a scuffle's peek, a scuffle's
   take, a trade's face-down card, a trade text like the monocle, a
   revealed trade). The view projection has to track *who has seen what*,
   per seat, and keep it consistent when items move.
2. **A scuffle is a mini-phase with everybody in it.** Support goes round
   the carriage in order, then abilities and items in any order, then the
   count, then the winner's choice, with three once-per-game trades able
   to interrupt (priest before support, pharmacist before the count,
   doctor after it). That is a sub-state machine with timeouts for every
   seat, not one actor at a time.
3. **Bots that can call the win.** The whole game is deciding when you
   know enough. A bot needs a belief over gang assignments *and* over
   where the six goal items are, updated by every leak it saw, and a rule
   for when the expected value of declaring beats another turn.
4. **Odd counts.** One side is one bigger and nobody knows which; the
   strong drink (Trank der Macht) only counts for the smaller side. Bots
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

Own name, chosen by the owner 2026-09-13: **末班夜車 / The Last Night
Train** (a 1930s night express, third-class sleeper, two gangs in one
carriage). Credit line, once, in the footer:

> 同人作品，非官方。玩法啟發自 Michael Palm 與 Lukas Zach 設計的《Die
> Kutschfahrt zur Teufelsburg》；名稱、設定、美術與文字皆為本站原創。
> A free fan project, unofficial. The play is inspired by Die Kutschfahrt
> zur Teufelsburg, a card game designed by Michael Palm and Lukas Zach;
> the name, setting, art and words here are our own.

*Not legal advice.*

## Source material
- Rulebook PDF (DE + EN):
  https://silo.tips/download/die-kutschfahrt-zur-teufelsburg-autoren-michael-palm-und-lukas-zach
- Digest with every table and card: [[last_train - rulebook]]
- BGG: https://boardgamegeek.com/boardgame/168839/die-kutschfahrt-zur-teufelsburg
- Chinese edition: https://www.swanpanasia.com/products/kutschfahrt-zur-teufelsburg

Unclear points and how v1 resolves each (details in the rulebook note):
| # | point | v1 |
|---|---|---|
| 1 | count of keys and goblets | 3 + 3, derived from the 21-card deck; test asserts it |
| 2 | who starts | random seat, seeded |
| 3 | strong-drink stacking | at most one per declaration |
| 4 | duelist +1 (EN text only) | no +1; German card text is canonical; toggle |
| 5 | diplomat's forced trade | a normal forced trade, diplomat gives one back, trade texts fire |
| 6 | "dual-symbol" person cards | none; one sword or one shield |
| 7 | scuffle winner vs empty hand | option (b) hidden |
| 8 | pharmacist timing | any time before the count |
| 9 | doctor vs winner's peek | doctor window first, then the winner chooses |
| 10 | best player count | solo default 6; 3–10 allowed, note at 3 |

## Theme
| slot | original | now (zh) | now (en) |
|---|---|---|---|
| title | Die Kutschfahrt zur Teufelsburg | 末班夜車 | The Last Night Train |
| setting | a coach racing to Devil's Castle | 一九三〇年代的末班夜車，三等臥鋪 | a 1930s night express, third-class sleeper |
| gang A (keys) | Orden der offenen Geheimnisse | 掌印社 | the Sealbearers |
| gang B (goblets) | Bruderschaft der wahren Lüge | 守時會 | the Timekeepers |
| goal items | Schlüssel / Kelch | 玉印 / 懷錶 | jade seal / pocket watch |
| profession | Beruf | 行當 | trade |
| luggage | Gepäck / Gegenstand | 行李 / 物件 | luggage / item |
| actions | passen / tauschen / angreifen / Sieg verkünden | 過 / 交換 / 動手 / 攤牌 | pass / trade / scuffle / show your hand |
| support | Schwert / Schild / enthalten | 幫攻 / 幫守 / 旁觀 | back the attacker / back the defender / stay out |
| odd-count card | Trank der Macht | 烈酒 | strong drink |
| solo-win card | Wappen der Loge | 頭等票 | first-class ticket |
| secret cases | Geheimer Koffer | 皮箱（錶 / 印） | suitcase (watch / seal) |
| room / code / host | | 包廂 / 車次 / 列車長 | compartment / code / conductor |
| bot names | Sarah MacMullin… | 周太太、王秘書、陳老闆、林小姐、阿彪、小四、何先生、老金、阿毛、白老師 | Mrs. Zhou, Secretary Wang, Boss Chen, Miss Lin, Ah Biao, Xiao Si, Mr. He, Old Jin, Ah Mao, Teacher Bai |
| favicon | | a brass pocket watch on navy | |

Trades (行當): 外交官 diplomat · 醫生 doctor · 槍手 gunman · 藥劑師
pharmacist · 武師 master · 算命師 fortune teller · 催眠師 hypnotist · 保鏢
bodyguard · 神父 priest · 打手 thug.
Items: 匕首 dagger · 皮手套 gloves · 毒戒 poison ring · 飛刀 knives · 手杖
cane · 密碼本 codebook · 風衣 trench coat · 搜查令 warrant · 單片鏡 monocle
· 時刻表 timetable · 黑函 poison-pen letter · 破鏡 broken mirror · 頭等票
first-class ticket · 皮箱 ×2.

### Look (dark, from 2026-09-13; supersedes the cream version the same day)
Design canvas: https://claude.ai/code/artifact/581233b4-4a9a-42d7-92d7-61b7f422ed75
(page 1 the main flow, twelve phone screens; page 2 the directions not
taken: the cream train version, a graphite alternative, 夜航船 night boat
and 木刻版畫 woodblock).

| token | value | used for |
|---|---|---|
| ground | `#0e121b` (deep `#090c13`, cards `#161c28`) | the night carriage |
| line | `#2a3244` | 1px rules and borders |
| bone | `#e6dfd0` | text, the primary button, your seat's border, item cards |
| grey | `#8b91a0` | secondary text |
| brass | `#a8863a` (bright `#c9a54f`) | the Timekeepers, watches, the ticket card's border and stamp line, timers, the pick outline |
| jade | `#3f8a74` | the Sealbearers, seals |
| rust | `#b8452f` | a scuffle: attack count, the scuffle button |
| steel | `#6f8fb8` | a guard: defence count, AI tag |
| display | Noto Serif TC 700 | title, big words, headings |
| body | Noto Sans TC | everything else |
| Latin | Cormorant Garamond | the English title, the room code, the big numbers |

Square 2px corners, 1px lines, no shadows, no glow. The brass-bordered
"ticket" card with notched sides carries the title, the room code and the
result; the reveal sits on the deepest ground. Chinese numerals for the
player count (六); rounds are stops, 第三站.

## Rules in scope (v1 = base game, exactly)
| players | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| gang cards in | 2+2 | 2+2 | 3+3 | 3+3 | 4+4 | 4+4 | 5+5 | 5+5 |
| one card out | yes | – | yes | – | yes | – | yes | – |
| strong drink | each | – | each | – | each | – | each | – |
| hand limit | 8 | 6 | 5 | 5 | 5 | 5 | 5 | 5 |
| starting items | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| removed | poison-pen letter | – | – | – | – | – | – | trench coat |

Deck: 3 watches, 3 seals, 2 suitcases, 13 singletons (21). Ten trades.
Setup: both suitcases plus *players − 2* random items are shuffled and
dealt one each; the rest is the pile. Turn: pass / trade one item /
scuffle with one player / show your hand. Scuffle: support clockwise from
the attacker's left, then abilities and items, then count; the winner
peeks (gang + trade) or takes one item; tie draws for the attacker.
Declaration: right and every member of that gang wins, wrong and the
other gang wins. First-class ticket: any three goal items in one hand is
a solo win. Full text: [[last_train - rulebook]].

**Not in v1** (data-driven so they can be added without touching the
machine): the three official variants (smuggling, fortune-telling,
advanced 3-player) and the *Die dunkle Prophezeiung* expansion (events,
coachman, traitor). Smuggling is one flag on the trade action and ships as
a lobby toggle.

## Architecture
```
last_train/
  public/
    index.html, app.js, style.css, rules.html, favicon.svg, og-image.png
    i18n/en.js, i18n/zh-Hant.js
    shared/engine.js   deck, setup, turn machine, scuffle sub-machine, view()
    shared/bots.js     belief model + policies, 3 levels, `why` on every decision
    shared/talk.js     table-talk templates per language
  src/index.js         Worker: prefix router + /ws         (from tiandihui)
  src/room.js          Durable Object per compartment      (from tiandihui)
  tests/engine.test.js, bots.test.js, room.test.js, sim.js
```

### Engine
- State: `seats[]` each `{gang, trade, tradeUsed, tradeRevealed, items[],
  drink}`, `pile[]`, `turn`, `phase`, and a `knowledge` map: for every
  seat, what it has *seen* (another seat's gang, trade, or a specific item
  at a specific time). Items carry stable ids so "the dagger I saw in Miss
  Lin's bag" stays a fact after it moves.
- Phases: `turn` → one of `trade(offer → answer → texts)`,
  `scuffle(declare → priest window → support × n → powers → count →
  doctor window → winner's choice)`, `declare(claim → reveal → over)`,
  `pass`. Plus `handLimit` interrupts whenever a hand exceeds the cap.
- `apply(state, action)` throws on anything illegal; the UI never offers
  an action `legal(state, seat)` does not list.
- `view(state, seat)`: own cards; every seat's item *count*, revealed
  trades, drink; everything that seat's knowledge map holds; the log.
  `view(state, null)` is the spectator / game-over view.
- Seeded RNG in the state (mulberry32); JSON clone.

### Bots
- **Belief**: a distribution over gang assignments (at most C(10,5) = 252
  splits, exact) times, per goal item, a distribution over which seat
  holds it. Hard evidence zeroes (a peeked gang, an item seen in a hand, a
  suitcase drawn from the pile); soft evidence reweights (who supports
  whom in scuffles, who trades with whom, who accepted a monocle, who
  refuses trades).
- **Policies** from the belief: *trade* to the seat most likely allied,
  offering the item that leaks least and asking for the most (goal items
  flow toward the side that needs them; never hand a goal item to a
  probable enemy); *scuffle* the seat whose bag is most likely to hold
  what you need when the expected support margin is positive, otherwise
  the seat you know least about; *support* the probable ally; *declare*
  when P(claim is right) × win ≥ the value of waiting, with a level knob
  on the threshold.
- Levels: easy (random legal moves with a light bias), normal (the model),
  hard (the model plus lookahead on what a declaration reveals and bluff
  trades that leak nothing).
- Every decision carries a `why` for the talk templates.

### Room
- Lobby: conductor creates, 3–10 seats, Add bot, level, smuggling toggle,
  Start.
- Clocks (one alarm): turn 60 s, trade answer 30 s, each support 15 s,
  powers window 20 s, winner's choice 20 s, declare 60 s. A timeout resolves
  as the bot would for that seat (support: stay out; trade answer: refuse;
  turn: pass).
- Disconnect 15 s grace then bot; token in sessionStorage reclaims.
- Chat, 200 chars, last 100 lines. Fan-out is `view` per socket only.

## Pages and UI
| Route | View | What is on it |
|---|---|---|
| `/last_train/` | Landing | the ticket card with title and pitch, Solo / Open a compartment / Board with code, credit |
| `?play` | Solo setup | name, players 3–10 (default 6), level, smuggling toggle |
| `?room=ABCD` | Lobby | code on a ticket, seat list with AI tags, Add bot, level, Start |
| (in game) | Reveal | your gang, your trade and its text, your starting item |
| (in game) | Carriage | seat grid with bag counts and revealed trades, your bags, action bar 交換 / 動手 / 攤牌 / 過, log |
| Carriage › Scuffle | attack vs defence counts, support list, your usable items and trade, timer |
| Carriage › Trade | the offered card, its text, pick what to give back, accept / refuse |
| (in game) | Show your hand | your goal items, pick the allies and what they hold, the warning |
| (in game) | Terminus | winner, every seat's gang / trade / bags, rematch |
| `/last_train/rules` | Rulebook | own prose, the count table, the trades and items |

Mockup: the canvas above. Phone-first, 390×844.

## Bots and balance
`node tests/sim.js <games> <n or 0> [levelA levelB] [--seed=N] [--verbose]
[--smuggling]`, each cell a child process with retries. Per count 3–10 it
reports the Timekeepers' win rate, the wrong-declaration and solo rates,
average turns, scuffles and trades per game, the smaller gang's win rate
at odd counts, and **calibration**: the mean confidence bots declared at
against how often they were right.

### What the bots are (M2, 2026-09-13)
- A bot sees its `view` and the engine's `legalActions` for its seat,
  nothing else. Stateless: beliefs are rebuilt from the knowledge list and
  the public log at every decision.
- **Gang belief**: all splits of the other seats into allies and enemies
  at the possible gang sizes (two sizes at odd counts), C(9,4)+C(9,5) at
  most. Peeked gangs are hard constraints. Soft evidence from the log:
  who backs whom in a scuffle (×1.35), who trades with whom (×1.12), who
  attacks whom (×0.85), the pharmacist's pick (×1.5); the whole soft
  likelihood is tempered to the power 0.6, because behaviour is a guess
  about a guess and a table of guessers otherwise talks itself into
  cliques. Gives P(ally) per seat and a *joint* P(all named are allies).
- **Item belief**: for each watch and seal (plus the cases once the pile
  is empty) a distribution over hands and the pile. Sightings pin it
  (hands seen by warrant or take, cards given, got, offered, the fortune
  teller's look); every logged movement spreads it, with the mover's hand
  size *at the time* replayed from the log, and a take moving a goal item
  with more than an even share. Gives P(seat holds ≥ k of my items).
- **Declaring**: the most probable claim among the top four candidate
  allies with one or two items each; P(correct) = joint P(allies) × Π
  P(items) × [enough, or enough with the drink in the worlds where my gang
  is the smaller one, counted over the peek-consistent hypotheses and
  discounted ×0.85]. Declare when it clears a threshold that slides down
  with the turn count (normal 0.85 → floor 0.65, giving way after turn 60;
  hard 0.92 → 0.72; easy 0.65). The first-class ticket win is taken the
  moment it is legal.
- **Turn policy** scores every legal offer, attack and demand: a monocle
  or warrant to the least-known seat, the poison-pen letter to a probable
  enemy, goal items to nobody; attacks by expected support margin times the
  value of a peek and of the cards likely there; the diplomat's demand for
  my goal item where it most likely sits.
- **Responses**: accept a trade when it pays or comes from a probable
  ally and return the cheapest card; back the side you believe in
  (edge 0.2 at normal); show every usable item; priest for a threatened
  ally or a toll; pharmacist only for a clear ally with stakes; doctor
  when an ally lost with cards at stake; take when the loser likely holds
  my kind, peek when the gang is unknown.
- Levels: easy = 45 % random moves; normal as above; hard = sharper
  thresholds and edges, 2 % noise so no two bots can loop forever.

### Numbers
Calibration during tuning, normal vs normal, 100–200 games a cell:

| count | wrong declarations | declared at mean p → right | solo | turns |
|---|---|---|---|---|
| 6 | 11 % | .86 → 87 % | 15 % | 77 |
| 8 | 19 % | .82 → 77 % | 19 % | 78 |
| 9 | 18 % | .78 → 77 % | 21 % | 76 |

Before the hand-size replay and the tempering the bots declared at .90
and were right half the time at nine players; the two changes fixed most
of it. Solo wins with the ticket are 12–25 % at every count: they come in
long games (solo at turn 100 on average, with real watches and seals, not
cases) where goal items pile up in whoever wins scuffles. That is a
property of bots that hoard and declare late more than of the rules;
the full table below is the baseline to improve on.

**Full table, 100 games a cell, seed 5, 2026-09-13.** Timekeepers win %
(wrong-declaration % / solo %) · avg turns · declared at mean p → right %.
The two sides are symmetric by construction, so the win rate is a noise
check (±10 at 100 games); the columns to read are the wrong and solo
rates, the length, and the calibration.

| TK / SB | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| easy / easy | 28 (6/49) · 56 · .85→88 | 39 (17/28) · 86 · .78→76 | 50 (29/11) · 86 · .69→67 | 47 (32/11) · 99 · .69→64 | 50 (31/9) · 95 · .68→66 | 50 (31/9) · 95 · .68→66 | 45 (45/4) · 102 · .64→53 | 53 (38/5) · 105 · .67→60 |
| normal / normal | 32 (24/38) · 142 · .74→61 | 39 (19/25) · 102 · .81→75 | 42 (30/9) · 85 · .76→67 | 54 (12/13) · 81 · .86→86 | 40 (27/10) · 75 · .82→70 | 46 (15/18) · 85 · .86→82 | 51 (25/11) · 75 · .81→72 | 42 (18/17) · 70 · .85→78 |
| hard / hard | 33 (28/35) · 223 · .73→57 | 40 (23/26) · 148 · .76→69 | 39 (25/23) · 90 · .79→68 | 37 (11/25) · 75 · .88→85 | 40 (17/24) · 77 · .84→78 | 32 (17/19) · 80 · .87→79 | 46 (20/16) · 72 · .85→76 | 43 (17/24) · 76 · .87→78 |
| normal / hard | 37 (22/42) · 193 · .75→62 | 44 (17/26) · 100 · .86→77 | 37 (22/25) · 68 · .82→71 | 41 (9/16) · 78 · .87→89 | 42 (31/11) · 81 · .77→65 | 42 (8/21) · 74 · .89→90 | 33 (26/17) · 74 · .83→69 | 32 (14/17) · 72 · .90→83 |
| hard / normal | 23 (19/49) · 190 · .76→63 | 34 (18/29) · 107 · .85→75 | 45 (29/19) · 82 · .77→64 | 40 (12/17) · 77 · .88→86 | 47 (22/14) · 73 · .84→74 | 43 (14/19) · 78 · .86→83 | 44 (16/18) · 77 · .84→80 | 56 (13/18) · 73 · .90→84 |

Reading it: even counts 6–10 land at 70–85 turns with 8–19 % wrong and
13–25 % solo, calibrated within about 5 points at normal; odd counts run
5–10 points more overconfident because the drink is a coin flip. Three
players is the long, swingy game the reviews describe (140–220 turns,
half of them solo). Hard is not yet stronger than normal in the mixed
rows: its higher threshold makes it declare later, which the other side
punishes by declaring first. Easy declares at .65–.69 and is right about
60 % of the time, which is the intended "loose" feel. Two easy cells
crashed in the first run and exposed an engine hole: a diplomat holding
only one suitcase could demand the other and be left with nothing legal
to give back. The demand is now illegal in that case and the cells
(re-run after the fix, 4 and 8 players) are in the row.

## Milestones
- **M0 Scaffold** (repo done, not deployed): router, placeholder, tables +
  test. Deploy and verify routes.
- **M1 Engine + tests**: setup for every count, the turn machine, the
  scuffle sub-machine with every trade and item, declarations, hand
  limit, `view` with the knowledge map, a fuzz over legal moves. Two days.
- **M2 Bots + harness**: belief model, policies, three levels, the sim
  table above. Two to three days.
- **M3 Solo UI**: every screen on the canvas, bot talk, i18n, rules page.
  Two days.
- **M4 Rooms**: DO, clocks, chat, bot fill, reconnect, rematch. Two days.
- **M5 Ship**: noindex off, OG image, JSON-LD, hub tile, sitemap. One day.

## Open questions
1. [x] **Name**: 末班夜車 / The Last Night Train, slug `last_train`.
   (owner, 2026-09-13)
2. [x] **Look**: direction C, cream / navy / brass. (follows from the name,
   2026-09-13)
3. **Gang words**: 守時會 / 掌印社 name the goal item, so a new player never
   forgets who needs what. Recommendation: keep.
4. **Solo default count**: 6 (even, the count reviewers rate best).
5. **Smuggling variant as a lobby toggle in v1**: yes, one flag on the
   trade action; the other two variants later.
6. **Duelist +1**: follow the German card text (no +1), keep a toggle.
7. **Strong-drink stacking**: one per declaration.
8. **Clocks**: the numbers above are guesses; support at 15 s per seat may
   feel slow at ten players. Tune in M4 with real people.

Questions 3–8 are taken as recommended unless the owner says otherwise.

## Decisions
- **2026-09-13**: M1 rulings, made while writing the engine and pinned by
  tests. (1) Every decision that could reveal a hidden trade is a *window*
  answered by every eligible seat (priest before support, gunman for the
  two parties, the attacker's hypnotist step, the powers round, doctor
  after the count); a seat is skipped only when its revealed trade settles
  it. Clients may auto-answer for a human who cannot use the power. (2)
  The hypnotist may name any seat but the defender, bystanders included,
  and the named seat is shut out of the powers round and the doctor
  window. (3) Fortune teller is a free action on your own turn; the
  diplomat's demand *is* the turn's action, a forced trade where the
  diplomat picks what goes back. (4) Trade texts fire for the giver and
  are announced to the table (that is what smuggling switches off); a
  broken mirror on either side silences both texts; offers go only to
  seats holding at least one item. (5) The winner's "take" is hidden
  when the loser holds nothing; the doctor window comes before the
  winner's choice. (6) Hand limit is enforced at the end of the turn that
  broke it, gifts chain if a recipient goes over. (7) At most one strong
  drink counts per declaration, for the smaller gang only; a case counts
  as its goal item only once the pile is empty. (8) A wrong solo claim is
  illegal rather than a loss, since everything it needs is in your own
  hand.
- **2026-09-13**: owner said go; M0 deployed from this machine (Worker
  `last_train`, version 3b14c55c). Pushes do not deploy; the dashboard is
  not connected, same as tiandihui.
- **2026-09-13**: owner asked for a dark, serious theme. The cream / navy
  / brass train look became near-black blue, bone and dim brass; capsule
  buttons became 2px squares; the glow went. Vocabulary and screens
  unchanged. The cream version is kept on page 2 of the canvas beside a
  graphite alternative.
- **2026-09-13**: owner picked 末班夜車 / The Last Night Train over the
  recommended 夜航船. Repo renamed `csiesheep/night_boat` →
  `csiesheep/last_train` (GitHub redirects the old name), prefix, Worker
  name and routes changed, vault folder moved, canvas rebuilt in direction
  C with the train vocabulary. Nothing was deployed under the old name, so
  no Worker or URL is orphaned.
- **2026-09-13**: initialised from the rulebook; repo scaffolded from
  tiandihui, not deployed.

## Next steps
- [x] Owner confirms the name. (2026-09-13)
- [x] M0: placeholder deployed with `npx wrangler deploy`; bare prefix
      301s to `/last_train/`; index, style, favicon and both i18n files
      byte-identical live (sha1, cache-busted); prefix sitemap served;
      `src/`, `.git/`, `wrangler.jsonc`, `package.json` 404; hub root and
      five siblings still 200; `noindex` in place. (2026-09-13)
- [x] M1 engine: `public/shared/engine.js`, 26 tests passing, among them
      a fuzz of 200 games (25 seeds × counts 3–10, 1,500 steps each,
      smuggling on for half) that checks item and trade conservation, the
      hand limit between turns, termination by declaration, and that no
      seat's view carries another seat's gang, hand or hidden trade.
      Deployed and byte-verified live. (2026-09-13)
- [ ] M2 bots. [ ] M3 solo. [ ] M4 rooms. [ ] M5 ship.
