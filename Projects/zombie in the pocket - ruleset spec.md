---
tags: [project, spec]
status: draft
started: 2026-08-13
---
# zombie in the pocket — ruleset spec

Implementation spec for [[zombie in the pocket]]. Mechanics only —
numbers, state transitions, data tables. **Names below are the
originals and are placeholders**; per the clean-room decision in the
project note they get renamed before shipping (see [Renaming](#renaming)).

**Confidence key:** ✅ verified against the official PDF art
(2026-08-13) · ❓ genuinely ambiguous in the rulebook

> **2026-08-13 — verified, then completeness-audited.** Read the
> image-only PDF page by page in the browser and checked every tile edge
> and all 9 dev cards against the art; found **4 errors** in the
> third-party JS port that the first draft inherited (see §9). Then swept
> the BGG forums for designer rulings on everything the terse rulebook
> leaves unsaid (§12). **Verdict: sufficient to implement.** Three gaps
> remain (§13); all three need a house rule, not more research.

Rules text: [transcription (card-board.weebly.com)](http://card-board.weebly.com/zimp-rules.html), confirmed
word-for-word against the PDF rulebook panels.
Tile art + cards: [official PDF](http://funmines.com/wp-content/uploads/2014/12/zimp.pdf), pages 3 (cards) and 4 (tiles).

---

## 1. Constants ✅

```js
const RULES = {
  START_HEALTH:      6,
  START_ATTACK:      1,
  HEALTH_CAP:        null,  // ✅ rulebook setup step 4, verbatim: "Record your
                            // starting Attack (1) and Health (6) scores. These
                            // numbers will change over the course of the game.
                            // No upper limit on either."
                            // The designer later suggested capping at 6 on the
                            // forums — ship that as a difficulty toggle, not default
  START_HOUR:        21,    // 9 PM
  FINAL_HOUR:        23,    // 11 PM; needing a card with an empty deck here = loss
  DEV_DECK_SIZE:     9,
  SETUP_BURN:        2,     // → 7 resolvable draws per hour
  MAX_COMBAT_DAMAGE: 4,
  MIN_COMBAT_DAMAGE: 0,     // "You can never gain Health points in combat"
  MAX_ITEMS:         2,
  COWER_HEAL:        3,
  RUN_AWAY_DAMAGE:   1,
  ZOMBIE_DOOR_COUNT: 3,
};
```

Budget check: 3 hours × 7 draws = **21 resolvable dev cards max**, and
item pickups / cowering burn draws too. The clock is the real
antagonist, not the zombies.

## 2. Board model

Two separate square grids — indoor and outdoor — joined by exactly one
seam. Tiles occupy integer cells; each has a set of exits in
`{N, E, S, W}` and a rotation `r ∈ {0,1,2,3}` applied as
`(exit + r) % 4`.

- **Indoor** exits are doors. **Outdoor** exits are *open grassy edges*;
  hedge edges are walls and cannot be crossed. ✅
- Placement rule: when entering an unexplored cell, draw the top tile of
  the matching deck and rotate it so **at least one of its exits faces
  back at the door/edge you just left**. ✅
- Movement legality: cells orthogonally adjacent, `A.hasExit(dir) &&
  B.hasExit(opposite(dir))`. (implementation detail, consistent with rules)
- **Rotation is the player's free choice**, constrained only by the entry
  edge. ✅ designer: you avoid getting boxed in "with tile rotation
  choices."
- **Non-entry edges do not have to match.** A door may face a wall and a
  wall may block a door, with no consequence. ✅ designer, on a jammed
  layout: *"It makes a useless door in the living room, but that's fine…
  I don't think I would have said that you couldn't block off a doorway,
  as I didn't want a bunch of restrictions."* This matters — it means
  placement can never fail for want of a match, so the only Zombie Door
  trigger is *no usable exit*.
- **The grid is unbounded.** ❓ No rule, no designer statement, no forum
  thread constrains the footprint. The "4×4 house" idea circulating in
  fan ports is an inference from the 16-tile count, not a rule. Let it
  sprawl.
- **Movement is mandatory** — you may not reveal a tile and stay put. ✅
  designer: *"If you choose to go into a room, you're going in there."*
  You may always move back into an already-explored room.
- **Seam:** the Dining Room's **north door is also its exterior door**,
  marked with an arrow in the art — the only legal way outdoors. Taking
  it places the **Patio** tile against the Dining Room, arrows aligned;
  the Patio's arrow is on *its* north edge. ✅ verified on the art:
  the arrow sits in the margin directly above an ordinary door gap, so
  it is **not a fifth exit** — it flags one of the four.
- Foyer and Patio are both set aside at setup rather than shuffled, so
  they are deterministically the first tile of their respective decks. ✅
- **Zombie Door:** if a newly placed tile leaves you with no usable
  exit (classic case: Bathroom placed directly above the Foyer), or all
  exits are explored and you still need an unfound room, **3 zombies
  bash through a wall of your choice in the current room**. Fully
  pinned down by designer rulings — see [§12](#12-designer-rulings-bgg).

### Indoor tiles (8) — exits ✅

Doors read off the art as light gaps in the black wall border. All eight
verified.

| Tile | Exits | Special |
|---|---|---|
| Foyer | N | Start tile, placed at origin, forced first |
| Bathroom | N | — |
| Bedroom | N, W | — |
| Family Room | N, E, W | — |
| Dining Room | N, E, S, W | **The N door carries the arrow → outdoors** |
| Storage | N | After resolving the dev card, you *may* draw another card and take the item on it |
| Kitchen | N, E, W | +1 Health if you end your turn here |
| Evil Temple | E, W | Resolve dev card, **then a second one**. Survive and still be here → you have the **totem** |

### Outdoor tiles (8) — edges ✅

Open **grassy** edges are exits; **hedge** edges are walls. Every tile
except the Patio and Graveyard is simply "hedge on one side, grass on the
other three."

| Tile | Grassy edges | Hedges | Special |
|---|---|---|---|
| Patio | **E, S** | W | N is the wooden-deck seam bearing the arrow → Dining Room. Set aside at setup |
| Garage | S, W | N, E | Driveway runs off the S edge |
| Yard ×3 | E, S, W | N | Three identical copies |
| Sitting Area | E, S, W | N | — |
| Garden | E, S, W | N | +1 Health if you end your turn here |
| Graveyard | E, S | N, W | Resolve dev card, **then a second one**. Survive with the totem → **WIN** |

```json
{
  "indoor": [
    {"id":"foyer",       "name":"Foyer",       "exits":["N"],              "start":true},
    {"id":"bathroom",    "name":"Bathroom",    "exits":["N"]},
    {"id":"bedroom",     "name":"Bedroom",     "exits":["N","W"]},
    {"id":"family-room", "name":"Family Room", "exits":["N","E","W"]},
    {"id":"dining-room", "name":"Dining Room", "exits":["N","E","S","W"], "exteriorDoor":true},
    {"id":"storage",     "name":"Storage",     "exits":["N"],              "onResolve":"BONUS_ITEM"},
    {"id":"kitchen",     "name":"Kitchen",     "exits":["N","E","W"],      "onTurnEnd":"HEAL_1"},
    {"id":"evil-temple", "name":"Evil Temple", "exits":["E","W"],          "onResolve":"SECOND_CARD_THEN_GAIN_TOTEM"}
  ],
  "outdoor": [
    {"id":"patio",        "name":"Patio",        "exits":["E","S"],      "seam":"N", "start":true},
    {"id":"garage",       "name":"Garage",       "exits":["S","W"]},
    {"id":"yard-1",       "name":"Yard",         "exits":["E","S","W"]},
    {"id":"yard-2",       "name":"Yard",         "exits":["E","S","W"]},
    {"id":"yard-3",       "name":"Yard",         "exits":["E","S","W"]},
    {"id":"sitting-area", "name":"Sitting Area", "exits":["E","S","W"]},
    {"id":"garden",       "name":"Garden",       "exits":["E","S","W"],  "onTurnEnd":"HEAL_1"},
    {"id":"graveyard",    "name":"Graveyard",    "exits":["E","S"],      "onResolve":"SECOND_CARD_THEN_BURY_TOTEM"}
  ]
}
```

## 3. Development cards (9) ✅

Every card carries one **item** plus **three outcomes**, one per hour
band. You read only the row for the current hour. All nine transcribed
directly off the card art. **9 cards, 9 distinct items, no duplicates.**

| # | Item on card | 9 PM | 10 PM | 11 PM |
|---|---|---|---|---|
| 1 | Oil | *"You try hard not to wet yourself."* (no-op) | ITEM | 6 zombies |
| 2 | Gasoline | 4 zombies | *"You sense your impending doom."* −1 HP | ITEM |
| 3 | Board with Nails | ITEM | 4 zombies | *"Something icky in your mouth."* −1 HP |
| 4 | Machete | 4 zombies | *"A bat poops in your eye."* −1 HP | 6 zombies |
| 5 | Grisly Femur | ITEM | 5 zombies | *"Your soul isn't wanted here."* −1 HP |
| 6 | Golf Club | *"Slip on nasty goo."* −1 HP | 4 zombies | *"The smell of blood is in the air."* (no-op) |
| 7 | Candle | *"Your body shivers involuntarily."* (no-op) | *"You feel a spark of hope."* +1 HP | 4 zombies |
| 8 | Can of Soda | *"Candybar in your pocket."* +1 HP | ITEM | 4 zombies |
| 9 | Chainsaw | 3 zombies | *"You hear terrible screams."* (no-op) | 5 zombies |

**Difficulty curve** — this is the load-bearing design, preserve the
shape when re-theming:

| Hour | Zombie cards | Zombie counts | Item cards | Event cards | Net event HP |
|---|---|---|---|---|---|
| 9 PM | 3 | 3, 4, 4 | 2 | 4 | 0 |
| 10 PM | 3 | 4, 4, 5 | 2 | 4 | −1 |
| 11 PM | **5** | 4, 4, 5, 6, 6 | 1 | 3 | −2 |

The squeeze is sharp and deliberate: at 11 PM more than half the deck is
a fight, the fights are bigger, and items nearly dry up — one item card
in nine. You are meant to arrive at midnight already armed.

```json
[
  {"id":1,"item":"oil",         "9":{"t":"EVENT","hp":0},  "10":{"t":"ITEM"},         "11":{"t":"ZOMBIES","n":6}},
  {"id":2,"item":"gasoline",    "9":{"t":"ZOMBIES","n":4}, "10":{"t":"EVENT","hp":-1},"11":{"t":"ITEM"}},
  {"id":3,"item":"board-nails", "9":{"t":"ITEM"},          "10":{"t":"ZOMBIES","n":4},"11":{"t":"EVENT","hp":-1}},
  {"id":4,"item":"machete",     "9":{"t":"ZOMBIES","n":4}, "10":{"t":"EVENT","hp":-1},"11":{"t":"ZOMBIES","n":6}},
  {"id":5,"item":"grisly-femur","9":{"t":"ITEM"},          "10":{"t":"ZOMBIES","n":5},"11":{"t":"EVENT","hp":-1}},
  {"id":6,"item":"golf-club",   "9":{"t":"EVENT","hp":-1}, "10":{"t":"ZOMBIES","n":4},"11":{"t":"EVENT","hp":0}},
  {"id":7,"item":"candle",      "9":{"t":"EVENT","hp":0},  "10":{"t":"EVENT","hp":1}, "11":{"t":"ZOMBIES","n":4}},
  {"id":8,"item":"can-of-soda", "9":{"t":"EVENT","hp":1},  "10":{"t":"ITEM"},         "11":{"t":"ZOMBIES","n":4}},
  {"id":9,"item":"chainsaw",    "9":{"t":"ZOMBIES","n":3}, "10":{"t":"EVENT","hp":0}, "11":{"t":"ZOMBIES","n":5}}
]
```

## 4. Items ✅

**Exactly 9 items, one per dev card.** (The revised print package lists
"10 item tiles" — that's a punch-out sheet count, 9 items plus a totem
token, not a 10th item.)

Max **2 carried**. To pick up a third you must drop one; dropped items
vanish the moment you leave that tile. Only **one weapon usable per
combat**, though you may carry two.

**Attack is not cumulative.** ✅ This is the single most important
ruling for the combat code:

```js
attack = 1 + max(bonus of the one weapon you choose to use this combat)
// NOT 1 + sum of held weapons. Drop the weapon, lose the score.
```

Designer, asked directly whether femur (+1) plus machete (+2) gives +3:
*"You can only use one weapon at a time, so having the femur and the
machete would still only be +2, as you'd use the better bonus."* The
later v1.75 rules rewrote the numbers as absolutes precisely to kill this
confusion — *"the femur is a 3 attack, not a 1+3."*

**The totem does not occupy an item slot.** ✅ designer, asked directly:
*"Nope!"* / *"The Totem does not count against your two item limit."*

| Item | Effect |
|---|---|
| Board with Nails | +1 Attack |
| Grisly Femur | +1 Attack |
| Golf Club | +1 Attack |
| Machete | +2 Attack |
| Chainsaw | +3 Attack, fuel for **2 battles**. When spent it is **not** discarded — it keeps occupying a slot and can be refuelled with Gasoline, unlimited times ✅ |
| Can of Soda | +2 Health |
| Oil | Throw while running away → take no damage. One use. **+ Candle** → kill all zombies on the tile, no damage |
| Gasoline | **+ Candle** → kill all zombies on the tile, no damage. **+ Chainsaw** → 2 more chainsaw uses. One use |
| Candle | Enabler for Oil / Gasoline combos |

## 5. Turn sequence ✅

**Game start:** you begin in the Foyer and **do not draw a Dev card for
it.** ✅ designer: *"You shouldn't be drawing a card for starting in the
foyer. If you go back into the foyer, you would draw a card."* Play
begins by moving out. Easy to get wrong; it's a free card if you do.

```
turn():
  1. choose an exit (door indoors / grassy edge outdoors) from current tile
     — movement is MANDATORY; you may not stay put
  2. if destination cell unexplored:
       draw tile from matching deck
       player freely rotates it, sole constraint: ≥1 exit faces back at
       the edge you left. Other edges need not match anything.
       place it
  3. move player
  4. drawDevCard()            // even when re-entering an explored tile
       if deck empty → timePasses() first
  5. resolve the card's entry for the CURRENT HOUR:
       ITEM     → optionally draw the next card; take the item printed on IT
       ZOMBIES  → combat(n)
       EVENT    → health += hp
  6. apply tile instructions, AFTER the card resolves:
       Storage      → may draw one more card, take its item
       Evil Temple  → resolve a SECOND card; survive & still here ⇒ gain totem
       Graveyard    → resolve a SECOND card; survive & still here ⇒ bury totem ⇒ WIN
  7. NOW check for a dead end. If the tile has no usable unexplored exit:
       → ZOMBIE_DOOR (see §12) — this can be a SECOND fight in one turn
  8. end of turn: if on Kitchen or Garden and you did NOT run away → +1 Health
  9. optional COWER: +3 Health, discard the top dev card unresolved
```

⚠️ **Step ordering matters.** The Zombie Door fires *after* the room's
own card resolves, not instead of it — designer: *"You deal with the
'normal' room first, then deal with the fact that it's a dead end."* So
entering the Bathroom-above-the-Foyer can cost you two fights back to
back, and you cannot cower between them.

Note the cost model: an item pickup, a special room, and cowering all
**consume extra dev cards**, i.e. they all spend clock. That tension is
the whole game.

## 6. Time track ✅

```
timePasses():                      # fires when a draw is attempted on an empty deck
  if hour == FINAL_HOUR: return LOSS   # midnight
  hour += 1
  deck = shuffle(all 9 cards, including the 2 burned at setup)
  burn(2)
```

- Start **9 PM**. Bands are 9 / 10 / 11.
- Edge case ✅: if an **ITEM** card is the *last* card of a deck,
  reshuffle + burn as above, then draw the **first card of the new
  deck** to determine the item found.

## 7. Combat ✅

```
combat(zombies):
  damage = clamp(zombies - attack, MIN_COMBAT_DAMAGE, MAX_COMBAT_DAMAGE)
  health -= damage
  if health <= 0: return LOSS
```

**Running away** — on drawing a zombie card you may instead flee through
a door / grassy edge into any **previously explored** tile. Cost: **−1
Health**, and you do **not** draw a dev card for the tile you flee into.
Holding **Oil**, you may throw it as you go and take no damage (one use).

**Cowering** — after a completed turn sequence: +3 Health, discard the
top dev card unresolved. Designer rulings: ✅ any tile counts as a
"room", **including outdoors**; ✅ you may cower **after running away**
(*"the turn has been resolved for that room, it just happened that the
turn didn't include drawing a card"*); ✅ you may cower **between the two
Temple/Graveyard cards** (*"it's basically like a fresh-normal-turn"*);
✅ you may **not** cower before a Zombie Door attack, but may after.

## 8. Win / lose ✅

| Outcome | Condition |
|---|---|
| **Win** | Alive after burying the totem in the Graveyard |
| Lose | Health reaches 0 in combat |
| Lose | Health reaches 0 from an Event |
| Lose | You need to draw a dev card during the 11 PM hour and the deck is empty |

Totem chain: reach **Evil Temple** (indoors) → survive its second card →
carry totem → exit via **Dining Room** arrow → reach **Graveyard**
(outdoors) → survive its second card → win.

## 9. Corrections made after reading the PDF

The first draft of this spec took tile exits and card contents from the
[PatrickKennedy/zombies](https://github.com/PatrickKennedy/zombies) JS
port. Four things were wrong. If you ever consult that repo again, know
that its `zombies.cards.js` is not trustworthy:

| # | Port said | Art actually says | Severity |
|---|---|---|---|
| 1 | **Patio** has one exit, N | Patio has **grassy edges E and S**; N is the house seam, W is hedge | **Fatal** — with one exit the Patio is a dead end and the entire outdoor half of the game, including the Graveyard, is unreachable |
| 2 | Two cards both carry **Board with Nails**; no Golf Club anywhere | Card 6 is the **Golf Club**. Nine cards, nine distinct items | Moderate — loses an item |
| 3 | **Machete** card, 10 PM = harmless flavour | Machete card, 10 PM = **−1 Health** | Moderate — silently easier |
| 4 | **Candle** card = +1 HP / ITEM / 4 zombies | Candle card = no-op / **+1 HP** / 4 zombies | Minor — shifts an item out of the 10 PM band |

Everything else in the port's tile data — all 8 indoor tiles, and 7 of 8
outdoor tiles — checked out exactly.

## 10. Resolved ✅

- **Tile exits** — all 16 read off the art, tabulated above.
- **Golf Club** — real, on card 6. 9 items, not 8 or 10.
- **"4 status tiles"** — a print-sheet artefact of the revised package.
  The original components list is only *8 indoor tiles, 8 outdoor tiles,
  9 development cards*. Health / Attack / Time are just tracked numbers;
  nothing mechanical is hiding there.
- **Health cap** — none. Setup step 4 says so in as many words.
- **The Dining Room arrow** — marks its north door, not a fifth exit.

## 11. Version — build v1.5, not v1.75

**This spec is v1.5, the last officially typeset ruleset**, and that is
the right target. The designer never updated the rulebook PDF past it.

- **v1.5** (what we have): attack starts at 1, zombie counts +2 over the
  original. Our card data already reflects this — counts of 3/4/5/6 are
  the post-1.5 numbers.
- **v1.75** is a designer-written *harder variant* posted to the forums
  and never typeset: cower heals 2 instead of 3, health capped at 6, the
  Foyer gains a second door, and Femur/Candle/Machete are reworked.
  His own advice: *"There's really very little reason for most players to
  use the 1.75 rules. If you're looking for more of a challenge, step up
  to 1.75, otherwise stick with 1.5."*

Good shape for us: ship v1.5 as normal difficulty and v1.75 as a "hard
mode" toggle later. No new art needed for either.

## 12. Designer rulings (BGG) ✅

Answers the rulebook doesn't give, sourced to the designer on the BGG
forums. These close almost every gap the first draft left open.

| Topic | Ruling |
|---|---|
| **Foyer, first turn** | No Dev card for starting in the Foyer. Re-entering it later *does* draw one |
| **Attack stacking** | Never additive. One weapon per combat, best bonus only |
| **Totem** | Does not count against the 2-item limit |
| **Spent chainsaw** | Not discarded; keeps its slot; refuellable with Gasoline, no limit on refuels |
| **Tile rotation** | Player's free choice, subject only to the entry edge |
| **Non-entry edges** | Need not match. Doors may face walls; walls may block doors |
| **Movement** | Mandatory each turn. You may re-enter explored rooms freely |
| **Zombie Door — timing** | Fires *after* the room's own card resolves |
| **Zombie Door — the hole** | Persists and is reusable. Placed wall-to-wall (it's a hole, not a matched door pair) |
| **Zombie Door — entering** | You do *not* go through immediately. You may cower first, then enter on a later turn; entering draws a card as normal |
| **Zombie Door — fleeing** | You may run from the three zombies. The door is made in **the room you end up in**, and it stays |
| **Cowering** | Any tile including outdoors; allowed after running away; allowed between the two Temple/Graveyard cards; never before a Zombie Door, but allowed after |

The designer's general adjudication principle, worth adopting for any
case not covered: *"If there's not a rule against it, generally, it's not
against the rules."*

## 13. Still open ❓ — pick a house rule

Three genuine gaps. All three were searched for on the BGG forums; none
has a published answer. None blocks a build.

1. **Flee adjacency.** The rulebook says you run *"through a door or
   grassy edge into any previously explored tile"* — the first clause
   implies one step, the second sounds unbounded. Never asked directly on
   the forums. The one designer-blessed example is a single step
   sideways. **Recommend: adjacent only, via a legal connection.**
2. **Cower frequency.** Asked on BGG as "Cowering Quantity"; the designer
   never replied. Community reading is once per turn, from the phrase
   "after completion of a turn sequence". **Recommend: once per turn** —
   otherwise infinite cowering trivialises health at the cost of a clock
   that you'd happily spend.
3. **Re-entering the Evil Temple.** Can the totem be found twice; does
   the second card fire on every revisit? **Recommend: the second-card
   draw is once per room, consumed on success.**

## Renaming

Everything above is placeholder naming. Before shipping, the theme,
tile names, item names and all flavour text get replaced — mechanics
and numbers carry over untouched, since those aren't copyrightable.
The structural slots to fill:

- 8 interior locations (1 start, 1 healing, 1 bonus-item, 1 goal-A, 1 with the exterior exit)
- 8 exterior locations (1 seam, 1 healing, 1 goal-B, 3 identical filler)
- 9 dual-purpose cards (item + three escalating outcome bands), one
  distinct item each
- 5 weapons (+1 ×3, +2, +3-with-2-uses), 1 heal, 3 consumable/combo
- A MacGuffin fetched at goal-A and delivered to goal-B

## Links
- [[zombie in the pocket]] — project note
- [ZiMP rules transcription](http://card-board.weebly.com/zimp-rules.html) — matches the designer's own v1.5 text file (BGG filepage 31471)
- [v1.5 changelog](https://boardgamegeek.com/thread/303923) · [v1.75 changelog](https://boardgamegeek.com/thread/334719) · [semi-official variants](https://boardgamegeek.com/thread/321832) — all designer-written
- Key rulings: [attack doesn't stack](https://boardgamegeek.com/thread/330037) · [no Foyer card](https://boardgamegeek.com/thread/333121) · [zombie door persists](https://boardgamegeek.com/thread/418712) · [zombie door entry](https://boardgamegeek.com/thread/560176) · [totem is slotless](https://boardgamegeek.com/thread/584988) · [carry a spent chainsaw](https://boardgamegeek.com/thread/296027) · [movement mandatory](https://boardgamegeek.com/thread/804131) · [blocked doorways are fine](https://boardgamegeek.com/thread/900150)
- [BGG entry (33468)](https://boardgamegeek.com/boardgame/33468/zombie-in-my-pocket)
- [Complete Game Package PDF — filepage 32541](https://boardgamegeek.com/filepage/32541/zombie-in-my-pocket-complete-game-package-revised)
- [PatrickKennedy/zombies](https://github.com/PatrickKennedy/zombies) — JS port. Useful starting point but **4 data errors**, see §9; don't copy from it
- [chillNZ/zimp](https://github.com/chillNZ/zimp) — Python; stub data only, not a useful reference
