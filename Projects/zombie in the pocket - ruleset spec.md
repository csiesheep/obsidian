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

**Confidence key:** ✅ from the transcribed rulebook · ⚠️ from a
third-party code implementation, verify against the PDF art · ❓ unknown

Primary rules source: [ZiMP Rules transcription (card-board.weebly.com)](http://card-board.weebly.com/zimp-rules.html)
Data source for tiles/cards: [PatrickKennedy/zombies](https://github.com/PatrickKennedy/zombies) (`src/js/zombies.cards.js`)

---

## 1. Constants ✅

```js
const RULES = {
  START_HEALTH:      6,
  START_ATTACK:      1,
  HEALTH_CAP:        null,  // rulebook: "No upper limit on either."
                            // designer later suggested capping at 6 — make it config
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
  B.hasExit(opposite(dir))`. ⚠️ (implementation detail, consistent with rules)
- **Seam:** the Dining Room has an extra *exterior door* marked with an
  arrow — the only legal way outdoors. Taking it places the **Patio**
  tile against the Dining Room, arrows aligned. ✅
  Patio is forced to be the first outdoor tile drawn, as Foyer is
  forced first indoors. ⚠️
- **Zombie Door:** if a newly placed tile leaves you with no usable
  exit (classic case: Bathroom placed directly above the Foyer), or all
  exits are explored and you still need an unfound room, **3 zombies
  bash through a wall of your choice in the current room**. Fight them
  normally. You may **not** Cower before a Zombie Door attack. ✅

### Indoor tiles (8) — exits ⚠️

| Tile | Exits | Special |
|---|---|---|
| Foyer | N | Start tile, placed at origin, forced first |
| Bathroom | N | — |
| Bedroom | N, W | — |
| Family Room | N, E, W | — |
| Dining Room | N, E, S, W | **+ exterior arrow door → outdoors** |
| Storage | N | After resolving the dev card, you *may* draw another card and take the item on it |
| Kitchen | N, E, W | +1 Health if you end your turn here |
| Evil Temple | E, W | Resolve dev card, **then a second one**. Survive and still be here → you have the **totem** |

### Outdoor tiles (8) — edges ⚠️

| Tile | Grassy edges | Special |
|---|---|---|
| Patio | N | Placed at the Dining Room seam, forced first |
| Garage | S, W | — |
| Yard ×3 | E, S, W | Three identical copies |
| Sitting Area | E, S, W | — |
| Garden | E, S, W | +1 Health if you end your turn here |
| Graveyard | E, S | Resolve dev card, **then a second one**. Survive with the totem → **WIN** |

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
    {"id":"patio",        "name":"Patio",        "exits":["N"],          "start":true},
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

## 3. Development cards (9) ⚠️

Every card carries one **item** plus **three outcomes**, one per hour
band. You read only the row for the current hour.

| # | Item on card | 9 PM | 10 PM | 11 PM |
|---|---|---|---|---|
| 1 | Grisly Femur | ITEM | 5 zombies | Event −1 HP |
| 2 | Gasoline | 4 zombies | Event −1 HP | ITEM |
| 3 | Chainsaw | 3 zombies | Event (flavour, no-op) | 5 zombies |
| 4 | Board with Nails | ITEM | 4 zombies | Event −1 HP |
| 5 | Board with Nails | Event −1 HP | 4 zombies | Event (no-op) |
| 6 | Machete | 4 zombies | Event (no-op) | 6 zombies |
| 7 | Can of Soda | Event +1 HP | ITEM | 4 zombies |
| 8 | Candle | Event +1 HP | ITEM | 4 zombies |
| 9 | Oil | Event (no-op) | ITEM | 6 zombies |

**Difficulty curve** (this is the design, preserve it when re-theming):

| Hour | Zombie cards | Zombie counts | Item cards | Net event HP |
|---|---|---|---|---|
| 9 PM | 3 | 3, 4, 4 | 2 | +1 |
| 10 PM | 3 | 4, 4, 5 | 3 | −1 |
| 11 PM | 4 | 4, 5, 6, 6 | 1 | −2 |

```json
[
  {"id":1,"item":"grisly-femur","9":{"t":"ITEM"},           "10":{"t":"ZOMBIES","n":5},"11":{"t":"EVENT","hp":-1}},
  {"id":2,"item":"gasoline",    "9":{"t":"ZOMBIES","n":4},  "10":{"t":"EVENT","hp":-1},"11":{"t":"ITEM"}},
  {"id":3,"item":"chainsaw",    "9":{"t":"ZOMBIES","n":3},  "10":{"t":"EVENT","hp":0}, "11":{"t":"ZOMBIES","n":5}},
  {"id":4,"item":"board-nails", "9":{"t":"ITEM"},           "10":{"t":"ZOMBIES","n":4},"11":{"t":"EVENT","hp":-1}},
  {"id":5,"item":"board-nails", "9":{"t":"EVENT","hp":-1},  "10":{"t":"ZOMBIES","n":4},"11":{"t":"EVENT","hp":0}},
  {"id":6,"item":"machete",     "9":{"t":"ZOMBIES","n":4},  "10":{"t":"EVENT","hp":0}, "11":{"t":"ZOMBIES","n":6}},
  {"id":7,"item":"can-of-soda", "9":{"t":"EVENT","hp":1},   "10":{"t":"ITEM"},         "11":{"t":"ZOMBIES","n":4}},
  {"id":8,"item":"candle",      "9":{"t":"EVENT","hp":1},   "10":{"t":"ITEM"},         "11":{"t":"ZOMBIES","n":4}},
  {"id":9,"item":"oil",         "9":{"t":"EVENT","hp":0},   "10":{"t":"ITEM"},         "11":{"t":"ZOMBIES","n":6}}
]
```

⚠️ **Two known gaps in this transcription** — check the PDF before
trusting it:
1. **Golf Club is missing.** The rulebook lists it as an item; it
   appears on no card here. Cards 7 and 8 are also mechanically
   identical, which smells like a transcription slip.
2. The component list says **10 item tiles**; the rulebook text
   describes **9 items**; this deck yields **8 distinct**.

## 4. Items ✅

Max **2 carried**. To pick up a third you must drop one; dropped items
vanish the moment you leave that tile. Only **one weapon usable per
combat**, though you may carry two.

| Item | Effect |
|---|---|
| Board with Nails | +1 Attack |
| Grisly Femur | +1 Attack |
| Golf Club | +1 Attack |
| Machete | +2 Attack |
| Chainsaw | +3 Attack, fuel for **2 battles** only |
| Can of Soda | +2 Health |
| Oil | Throw while running away → take no damage. One use. **+ Candle** → kill all zombies on the tile, no damage |
| Gasoline | **+ Candle** → kill all zombies on the tile, no damage. **+ Chainsaw** → 2 more chainsaw uses. One use |
| Candle | Enabler for Oil / Gasoline combos |

## 5. Turn sequence ✅

```
turn():
  1. choose an exit (door indoors / grassy edge outdoors) from current tile
  2. if destination cell unexplored:
       draw tile from matching deck
       rotate so ≥1 exit faces back at the edge you left
       place it
     if no legal placement, or the new tile leaves no usable exit:
       → ZOMBIE_DOOR: player opens a wall of choice, fight 3 zombies
                      (Cower is disallowed this turn)
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
  7. end of turn: if on Kitchen or Garden and you did NOT run away → +1 Health
  8. optional COWER: +3 Health, discard the top dev card unresolved
```

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

**Cowering** — only after a completed turn sequence: +3 Health, discard
the top dev card unresolved. Not allowed against a Zombie Door.

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

## 9. Open questions — verify against the PDF ❓

1. **Exact exits on every tile.** Whole board topology rests on this and
   it comes from a third-party port, not the art.
2. **Golf Club** — present in the rulebook, absent from the card data.
   10 item tiles vs 9 items vs 8 distinct.
3. **The 4 "status tiles"** in the component list. Most likely just
   Health / Attack / Time / Totem markers — irrelevant to a digital
   build if so, but confirm nothing mechanical is hiding there.
4. **Do weapon Attack bonuses persist after dropping the weapon?**
   The rulebook phrasing "Add 1 to Attack score" reads as a permanent
   bump to a tracked score, which would make dropping free and the
   2-item limit toothless. Needs a ruling either way.
5. **Health cap.** Rulebook says none; the designer later suggested 6.
   Ship as a difficulty toggle.
6. **Re-entering the Evil Temple** — can the totem be found twice, and
   does the second card fire again on every revisit?
7. **Zombie Door specifics** — can you open a wall that would face an
   already-occupied, non-matching cell?
8. Whether the Dining Room's exterior door counts as one of its four
   exits or is a fifth.

## Renaming

Everything above is placeholder naming. Before shipping, the theme,
tile names, item names and all flavour text get replaced — mechanics
and numbers carry over untouched, since those aren't copyrightable.
The structural slots to fill:

- 8 interior locations (1 start, 1 healing, 1 bonus-item, 1 goal-A, 1 with the exterior exit)
- 8 exterior locations (1 seam, 1 healing, 1 goal-B, 3 identical filler)
- 9 dual-purpose cards (item + three escalating outcome bands)
- 5 weapons (+1 ×3, +2, +3-with-2-uses), 1 heal, 3 consumable/combo
- A MacGuffin fetched at goal-A and delivered to goal-B

## Links
- [[zombie in the pocket]] — project note
- [ZiMP rules transcription](http://card-board.weebly.com/zimp-rules.html)
- [BGG entry (33468)](https://boardgamegeek.com/boardgame/33468/zombie-in-my-pocket)
- [Complete Game Package PDF — filepage 32541](https://boardgamegeek.com/filepage/32541/zombie-in-my-pocket-complete-game-package-revised)
- [PatrickKennedy/zombies](https://github.com/PatrickKennedy/zombies) — JS port, source of the tile/card data
- [chillNZ/zimp](https://github.com/chillNZ/zimp) — Python; stub data only, not a useful reference
