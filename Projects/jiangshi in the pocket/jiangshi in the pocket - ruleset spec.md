---
tags: [project, spec]
status: draft
started: 2026-08-24
---
# jiangshi in the pocket — ruleset spec

Implementation spec. Mechanics only — constants, state transitions, data
tables, pseudocode. The reasoning behind every number lives in
[[jiangshi in the pocket - redesign]]; the human-readable rules are in
[[jiangshi in the pocket - rulebook]]. **If those three disagree, this
file is what the engine should match, and the disagreement is a bug in
one of the others.**

**Confidence key:** ✅ decided · ❓ open, needs a ruling before it can be
coded · 📐 inherited unchanged from
[[zombie in the pocket - ruleset spec]]

> **What this is not.** Unlike the source spec, nothing here was
> reverse-engineered from a printed game — it is all original design
> decided between 2026-08-22 and 2026-08-23. There is no art to verify
> against and no designer to appeal to. The ❓ items are genuinely
> undecided, not merely unresearched.

---

## 1. Constants ✅

```js
export const RULES = {
  // clock
  TURNS_TOTAL:    30,
  TURN_MINUTES:   6,
  TURNS_PER_HOUR: 10,
  START_HOUR:     21,      // 9 PM; bands are 21 / 22 / 23

  // player
  START_HEALTH:   10,
  HEALTH_CAP:     10,      // hard cap; nothing exceeds it
  START_ATTACK:   0,       // bare-handed. Weapons are absolute, not bonuses
  MAX_ITEMS:      6,       // the tablet is exempt
  START_ITEMS:    { "sticky-rice": 3 },

  // cowering — a charge SKIPS THE EVENT. It heals nothing.
  COWER_CHARGES:  3,

  // combat
  MAX_COMBAT_DAMAGE: 4,
  MIN_COMBAT_DAMAGE: 0,
  RUN_AWAY_DAMAGE:   1,    // generic flee, to an adjacent explored tile
  BREACH_COUNT: { "9": 3, "10": 4, "11": 5 },   // 破牆, scales with the band

  // poison
  POISON_PER_TURN: 1,      // ticks at START of turn; does not stack

  // the King
  KING_THRESHOLD:             12,
  KING_THRESHOLD_WITH_TABLET: 11,
};
```

**Budget check.** 30 turns, every one of which draws an event except a
cower. So a night is **27–30 event draws** against 10 HP — versus the
source's 21 draws against 6 HP with unlimited cowering. Denser and
harsher, and the cap is what keeps it finite.

## 2. Board model 📐

**Unchanged from the source**: two unbounded square grids (indoor,
outdoor) joined at exactly one seam. Tiles occupy integer cells, each has
exits in `{N,E,S,W}` and a rotation `r ∈ {0..3}` applied as
`(exit + r) % 4`.

Carried over verbatim — see the source spec §2 for the reasoning:
- Placement: on entering an unexplored cell, draw the top tile of the
  matching deck and rotate it so **≥1 exit faces back at the edge you
  left**. Rotation is otherwise the player's free choice.
- **Non-entry edges need not match.** A door may face a wall.
- Movement legality: `A.hasExit(d) && B.hasExit(opposite(d))`.
- The grid is unbounded.
- Seam: 天井 Courtyard's exterior door ↔ 後門石階 Back Steps. Both are set
  aside at setup, so each is deterministically the first tile of its deck.

### Two departures ✅

1. **Movement is optional** (§8). The source made it mandatory. `STAY` is
   always a legal action, so a player can never be forced to move.
2. **Zombie doors are kept, unchanged** ✅ (2026-08-24). `STAY` being
   legal does not retire them — the trigger and the attack both carry over
   from the source:

   ```
   deadEndCheck(state):          # AFTER the room's own event resolves
     if currentTile has no usable UNEXPLORED exit:
        n = BREACH_COUNT[bandKey(N)]        # 3 / 4 / 5
        jiangshi break through a wall of the player's choice
        combat(state, n)                    # flee is allowed
        the hole PERSISTS and is usable in both directions thereafter
   ```

   Inherited rulings that still apply 📐: it fires **after** the room's
   own event, never instead of it — so a bad room can cost two fights in
   one turn; the hole is permanent and re-usable; you may flee from it,
   and the hole is then made in the room you *end up in*; you never enter
   it immediately.

   ✅ **The count scales with the band: 3 / 4 / 5** (2026-08-24). The
   source's flat 3 would have made a wall coming in at eleven o'clock
   *milder* than an ordinary draw, since the bands run 3–6.

   **This creates the worst single turn in the game.** A dead end fires
   the room's own event *and then* the breach, with no cowering between
   them. At eleven, drawing 僵屍 6 into a 5-jiangshi breach costs:

   | Attack | Room event | Breach | Turn total |
   |---|---|---|---|
   | 2 — 銅錢劍 | 4 | 3 | **7 HP** |
   | 4 — 七星劍 + 真火符 | 2 | 1 | **3 HP** |

   7 of a 10 HP cap in one turn, and it is the one turn you cannot cower
   your way out of. That is a sharp spike, and a fair one: it is the
   clearest argument in the game for being properly armed by the last
   band.

### Tiles — `data/tiles.json` ✅

`search` names a table in §4. There is no rarity flag: every room sharing
a category rolls the identical table.

```json
{
  "indoor": [
    {"id":"gatehouse",     "exits":["N","E","W"],     "start":true},
    {"id":"apothecary",    "exits":["N"],             "search":"medicine"},
    {"id":"woodshed",      "exits":["N","E"],         "search":"weapon"},
    {"id":"sutra-hall",    "exits":["N","W"],         "search":"magic"},
    {"id":"mourning-hall", "exits":["N","E","W"],     "search":"magic"},
    {"id":"courtyard",     "exits":["N","E","S","W"], "exteriorDoor":true},
    {"id":"blacksmith",    "exits":["N"],             "search":"weapon"},
    {"id":"counting-room", "exits":["N","E","W"],     "search":"medicine", "onTurnEnd":"HEAL_1"},
    {"id":"incense-hall",  "exits":["N","E"],         "action":"RESTORE_COWER_ONCE"},
    {"id":"sealed-crypt",  "exits":["E","W"],         "goal":"TAKE_TABLET"}
  ],
  "outdoor": [
    {"id":"back-steps",    "exits":["E","S"],         "seam":"N", "start":true},
    {"id":"dry-well",      "exits":["S","W"]},
    {"id":"bamboo-grove",  "exits":["E","S","W"],     "search":"magic"},
    {"id":"memorial-arch", "exits":["E","S","W"],     "search":"weapon"},
    {"id":"pavilion",      "exits":["E","S","W"]},
    {"id":"pagoda-tree",   "exits":["E","S","W"],     "search":"medicine", "onTurnEnd":"HEAL_1"},
    {"id":"stone-ward",    "exits":["N","E","S","W"]},
    {"id":"stream",        "exits":["E","W"],         "flags":["RUNNING_WATER"]},
    {"id":"earth-god-shrine",  "exits":["E","S"],         "search":"relic",    "action":"PRAY_ONCE"},
    {"id":"mass-grave",    "exits":["E","S"],         "goal":"BURY_TABLET"}
  ]
}
```

Exit density 21/10 indoor (2.1), 26/10 outdoor (2.6) — deliberately
matched to the source's 2.13 / 2.6.

### Tile behaviours ✅

| Field | Meaning |
|---|---|
| `start` | Placed at origin (indoor) / set aside for the seam (outdoor) |
| `exteriorDoor` | One of its exits is the moon gate — the only crossing |
| `seam` | The edge that joins back to the Courtyard |
| `search` | Which §4 table a search here rolls on |
| `onTurnEnd: HEAL_1` | +1 HP if the turn ends here (capped) |
| `action: RESTORE_COWER_ONCE` | Standing here, may restore **1 cower charge. Once per run** |
| `action: PRAY_ONCE` | **Once per run**: the next unexplored *outdoor* tile placed is `mass-grave` |
| `flags: RUNNING_WATER` | The King will not come here (§9) |
| `goal: TAKE_TABLET` | The 神主牌 is here (§7) |
| `goal: BURY_TABLET` | Burying it here wins (§7) |

## 3. The clock ✅

The turn **is** the clock. No deck, no reshuffle.

```js
// turn N, 1-based, 1..30
minutesElapsed = (N - 1) * TURN_MINUTES;         // 0..174
hourBand       = START_HOUR + Math.floor((N - 1) / TURNS_PER_HOUR);  // 21|22|23
bandKey        = String(hourBand - 12);          // "9" | "10" | "11"
clockLabel     = 21:00 + minutesElapsed;         // 9:00 .. 11:54
```

| Band | Turns | Clock |
|---|---|---|
| 9 PM | 1–10 | 21:00 → 22:00 |
| 10 PM | 11–20 | 22:00 → 23:00 |
| 11 PM | 21–30 | 23:00 → 24:00 |

**After turn 30 resolves → `midnight()` (§8).** There is no
losing-to-the-clock; midnight is an appointment, not a deadline.

`clockTime()` becomes a pure function of `N` — no deck length, and none of
the source's "empty deck reads 60" special case.

## 4. Items and search ✅

### Item definitions — `data/items.json`

```json
[
  {"id":"precept-knife",       "cat":"weapon",   "attack":1, "unique":true},
  {"id":"peachwood-sword",     "cat":"weapon",   "attack":1, "unique":true},
  {"id":"coin-sword",          "cat":"weapon",   "attack":2, "unique":true},
  {"id":"sevenstar-sword",     "cat":"weapon",   "attack":3, "unique":true},

  {"id":"truefire-talisman",   "cat":"magic",    "attack":1, "buffSword":1, "consumed":true},
  {"id":"fivethunder-talisman","cat":"magic",    "attack":4, "consumed":true},
  {"id":"blood-talisman",      "cat":"magic",    "attack":5, "costHp":1,    "consumed":true},
  {"id":"cinnabar",            "cat":"magic",    "effect":"DUPLICATE_TALISMAN", "n":2, "consumed":true},

  {"id":"soul-banner",         "cat":"relic",    "effect":"DOUBLE_SWORD", "unique":true, "consumed":true},

  {"id":"sticky-rice",         "cat":"medicine", "heal":3, "cures":"POISON", "consumed":true},
  {"id":"black-dog-blood",     "cat":"medicine", "effect":"ESCAPE_FIGHT", "consumed":true, "notVsKing":true},
  {"id":"golden-elixir",       "cat":"medicine", "gamble":[{"p":50,"hp":6},{"p":50,"hp":-2}], "consumed":true},

  {"id":"protective-charm",    "cat":"charm",    "damageReduction":1, "unique":true, "searchable":false}
]
```

**13 items.** Weapons and the charm persist; everything else is consumed
on use. `protective-charm` is not in any search table — it comes only from
the 9 PM villager (§5).

### Search tables — `data/search.json`

Rolled once per search. `null` = found nothing.

```json
{
  "weapon": [
    {"id":"precept-knife","p":25}, {"id":"peachwood-sword","p":25},
    {"id":"coin-sword","p":25},    {"id":"sevenstar-sword","p":15},
    {"id":null,"p":10}
  ],
  "magic": [
    {"id":"truefire-talisman","p":30}, {"id":"blood-talisman","p":20},
    {"id":"cinnabar","p":20},          {"id":"fivethunder-talisman","p":20},
    {"id":null,"p":10}
  ],
  "medicine": [
    {"id":"sticky-rice","p":40}, {"id":"black-dog-blood","p":25},
    {"id":"golden-elixir","p":15}, {"id":null,"p":20}
  ],
  "relic": [
    {"id":"sticky-rice","p":40}, {"id":"soul-banner","p":15},
    {"id":null,"p":45}
  ]
}
```

Each table sums to 100.

### Rolling a search ✅

```
search(state, table):
  pick = weightedPick(table)             # from the search RNG stream
  if pick == null:              return NOTHING
  if item.unique and held(pick): return NOTHING      # duplicate -> nothing
  if bagFull(state):            return OFFER_DROP    # player chooses
  take(pick)
```

**Uniques already held return nothing.** This is what makes weapon
searches self-limiting: effective miss climbs 10 % → 35 % → 60 % → 85 %
as the swords accumulate.

✅ **No `rich` flag.** 經堂 and 鐵匠鋪 roll exactly the same table as
their siblings (decided 2026-08-24) — the ★ in the design notes is
flavour, not mechanics. **The field is removed from `tiles.json`.**

✅ **Talisman stacks occupy one slot.** `cinnabar` gives `+2 quantity` of a
held talisman, so inventory holds `{id: count}` rather than a flat list. A
stack of any size is **one slot** (decided 2026-08-24), mirroring the
source's refuellable chainsaw. 硃砂 may only target a talisman you
actually hold.

✅ **Only talismans stack** (decided 2026-08-24). A stack of any size is
one slot; **everything else takes a slot per item.** So the three starting
糯米 occupy **3 of the 6 slots**.

```
slotsUsed(inv) = count of distinct ids, EXCEPT that
                 cat === "magic" contributes 1 slot per id regardless of count,
                 and every other cat contributes 1 slot PER UNIT
```

Inventory is `{id: count}` throughout; only `cat: "magic"` ignores the
count when charging slots. The rule came from 硃砂, which is the only
thing in the game that creates duplicates by rule, and it stays scoped
there.

**The slot arithmetic this produces is deliberate:**

```
3 starting 糯米                      3
七星劍                                1
攝魂幡                                1
one attack talisman (any stack size)  1
─────────────────────────────────────
                                      6   — exactly full
```

The pack is sized for *your starting rice plus a complete duel kit*, with
nothing to spare. It also gives a good arc: the bag begins full of
**consumables** and converts, rice by rice, into **equipment** — every
rice spent opens a slot for something found. And a fourth rice picked up
while carrying three plus three is a real decision, not a formality.

✅ **One 真火符 per sword.** `buffSword: 1` is permanent, and a sword
accepts **at most one** (decided 2026-08-24). So the sword ceiling is
`七星劍 3 + 1 = 4`, and 硃砂 cannot be used to pump a blade past it.
`sword.buffed: bool` is enough state.

## 5. The event pool ✅

`data/events.json`, keyed by band. Each band sums to 100.

```json
{
  "9": [
    {"t":"JIANGSHI","n":3,"p":15},
    {"t":"JIANGSHI","n":4,"p":25},
    {"t":"HP","hp":-1,"p":10},
    {"t":"HP","hp":1,"p":10},
    {"t":"NOTHING","p":20},
    {"t":"POISON","p":10},
    {"t":"VILLAGER","gift":"protective-charm","turnsInto":4,"p":10}
  ],
  "10": [
    {"t":"JIANGSHI","n":4,"p":25},
    {"t":"JIANGSHI","n":5,"p":15},
    {"t":"HP","hp":-1,"p":10},
    {"t":"HP","hp":1,"p":10},
    {"t":"NOTHING","p":20},
    {"t":"POISON","p":10},
    {"t":"VILLAGER","gift":"truefire-talisman","turnsInto":5,"p":10}
  ],
  "11": [
    {"t":"JIANGSHI","n":4,"p":20},
    {"t":"JIANGSHI","n":5,"p":20},
    {"t":"JIANGSHI","n":6,"p":20},
    {"t":"HP","hp":-1,"p":10},
    {"t":"NOTHING","p":10},
    {"t":"POISON","p":10},
    {"t":"VILLAGER","gift":"fivethunder-talisman","turnsInto":6,"p":10}
  ]
}
```

Drawn **with replacement** — it is a distribution, not a deck. The same
event may fire twice.

### VILLAGER resolution ✅

```
villager(state, ev):
  if holds("sticky-rice") and player accepts:
     consume("sticky-rice")
     take(ev.gift)                     # charm / talisman
  else:
     combat(state, ev.turnsInto)       # the band's worst jiangshi
```

Note the 10 and 11 PM gifts are **真火符 and 五雷符** — two of the four
pieces the seal needs (§8). This is deliberate: it is a second route to
the endgame kit for a player who spends rice on strangers.

### POISON ✅

```
poison(state):  state.poisoned = true      # no stack; already-poisoned is a no-op
```

## 6. Attack and combat ✅

### The attack formula — **the central departure from the source**

**A sword and a talisman ADD.** The source allowed one weapon only.

```js
function attack(state, use = {}) {
  let sword = bestSword(state);              // 0..3, plus any buffSword baked in
  if (use.banner) sword *= 2;                // 攝魂幡 doubles the SWORD only
  const talisman = use.talisman ? def(use.talisman).attack : 0;
  return sword + talisman;                   // banner never doubles the talisman
}
```

- **Only one sword counts** 📐 — the best held, never summed.
- `buffSword` from 真火符 is **permanent** and stored on the sword, not
  recomputed.
- The banner is **one use, consumed**, and doubles the sword half only.

Worked examples:

| Holding | Working | Attack |
|---|---|---|
| 七星劍 + 真火符 in it, banner, 五雷符 | (3+1) × 2 + 4 | **12** |
| 七星劍 + 真火符 in it, banner, 血符 | (3+1) × 2 + 5 | **13** |
| 銅錢劍 + 真火符 in it, banner, 血符 | (2+1) × 2 + 5 | **11** |
| 七星劍, banner, 五雷符 | 3 × 2 + 4 | 10 |
| 七星劍 + 真火符, 五雷符, no banner | 4 + 4 | 8 |

### Damage ✅

```js
function damage(n, atk, hasCharm) {
  let d = Math.max(MIN_COMBAT_DAMAGE, Math.min(MAX_COMBAT_DAMAGE, n - atk));
  if (hasCharm) d = Math.max(0, d - 1);     // 護身符 — combat only, after the clamp
  return d;
}
```

✅ **護身符 applies to combat only** (2026-08-24). It does **not** reduce
`HP: -1` events, and it does **not** touch poison. Its `damageReduction`
is read inside `damage()` and nowhere else — a wound from a jiangshi, and
nothing more.

That keeps the charm's scope narrow and easy to state: *the things that
claw at you hit softer; nothing else changes.*

### Escaping a fight ✅

`black-dog-blood` → `ESCAPE_FIGHT`: no damage, item consumed.
**Barred against the King** (`notVsKing: true`).

✅ **Generic flee exists** (2026-08-24), inherited shape:

```
flee(state):                    # offered on any JIANGSHI event
  health -= RUN_AWAY_DAMAGE     # 1
  move to an ADJACENT, already-explored tile
  draw NO event for the tile fled into
  state.fled = true             # suppresses onTurnEnd HEAL_1 this turn
```

`RUN_AWAY_DAMAGE = 1`. Adjacency is the source's house rule 📐 — one step,
through a legal connection, into somewhere already known.

So there are **two ways out of a fight**: flee for 1 HP, or spend
`black-dog-blood` and take nothing. The blood is strictly better, which is
correct — that is what the item is for. Neither works against the King.

❓ **Does 護身符 reduce the flee cost?** Assume **no**, on the same
reasoning as the `HP` events — the charm is combat-only, and the 1 HP of
running is a price, not a wound.

## 7. Poison, the tablet, cowering ✅

### 中毒

- Inflicted by the `POISON` event, 10 % in every band.
- **−1 HP at the START of each turn**, forever, until cured.
- **Does not stack.**
- **Only `sticky-rice` cures it.** `protective-charm` does **not** —
  poison is not damage.
- Irrelevant at midnight: the seal is a threshold on Attack, not health.

### The 神主牌 tablet

- Taken at `sealed-crypt`, buried at `mass-grave`.
- **Slotless** 📐 — never counts against `MAX_ITEMS`.
- Carrying it at midnight lowers the seal threshold **12 → 11** (§8).

✅ **Each rite draws an extra event** (2026-08-24).

```
rite(state, kind):              # kind = TAKE_TABLET | BURY_TABLET
  resolve the room's own event first          # step 3 of the turn
  then draw and resolve ONE MORE event        # the rite itself
  if still alive and still here:
     TAKE_TABLET  -> state.tablet = true
     BURY_TABLET  -> if state.tablet: return "WIN_BURIAL"
```

So both goal rooms are **two events in one turn**, and the second one is
drawn at the moment you least want it — standing over the grave with the
tablet in your hands. Neither win is free.

❓ Does fleeing the second event abort the rite? The source said the totem
was only gained if you were *still standing there* after the card. Assume
the same: **flee and the rite does not complete**, but you may return.

### Cowering

```
cower(state):
  if state.cowerCharges <= 0: return ILLEGAL
  state.cowerCharges--
  END TURN            # no event, no search, NO HEALING
```

**Cowering heals nothing** (decided 2026-08-24). Its entire value is that
it is the **only event-free turn in the game** — you spend a turn and a
charge to not draw. 3 charges, +1 from `incense-hall` once per run.

That makes a charge worth *the expected damage of the event you skipped*,
so its value scales with the band: ~0.85 HP at nine o'clock, ~2.3 at
eleven (at Attack 2). **Charges are therefore hoarded for late**, which is
the right incentive and needs no rule to enforce.

Consequence: **healing is now entirely items and tiles** — 糯米 +3,
金丹 +6/−2, the two `HEAL_1` tiles, and `HP: +1` events. Nothing else
restores health.

## 8. Turn sequence ✅

```
turn(N):                                  # N = 1..30
  1. POISON TICK
       if state.poisoned: health -= POISON_PER_TURN;  if health <= 0 -> LOSS

  2. ACTION — player picks exactly one:
       MOVE  -> pick a legal adjacent cell
                if unexplored: draw tile from matching deck, player rotates
                               (>=1 exit must face the edge left), place
                move player
                if crossing the moon gate: place back-steps at the seam
       STAY  -> remain in place
       COWER -> see §7, ends the turn here

  3. EVENT — draw from events[bandKey(N)], with replacement
       JIANGSHI n -> combat: player may spend banner / talisman / 黑狗血
                     health -= damage(n, attack(state, use), hasCharm)
       HP hp      -> health += hp        (respect HEALTH_CAP; <=0 -> LOSS)
       NOTHING    -> nothing
       POISON     -> state.poisoned = true
       VILLAGER   -> see §5

  4. SEARCH — optional, free, once per turn
       if tile.search: roll per §4

  5. TILE END
       if tile.onTurnEnd == "HEAL_1": health += 1   (capped)

  6. N++
     if N > TURNS_TOTAL: midnight()
```

**Step order matters.** Poison before the action, so a turn spent curing
still pays that turn's tick. Search *after* the event, so you rummage a
room that has already shown you what is in it.

### Edge cases the order creates ✅

| Situation | Resolution |
|---|---|
| **You flee the room's own event** | You are no longer standing in the dead end, so **no breach fires**. You also draw no event where you land, and `fled` suppresses `HEAL_1` |
| **Can you search after fleeing?** | **No.** You arrived without drawing an event; the turn is over |
| **A dead-end goal room** | Room event → rite event → breach. **Three fights in one turn** is possible, and nothing about it is a bug |
| **Standing on `mass-grave` without the tablet** | The rite does **not** fire. No extra event, nothing to bury |
| **`golden-elixir`'s coin-flip** | Rolled from the **search RNG stream**, not the game stream, so a shared seed replays identically |

✅ **Tile actions cost no turn** (2026-08-24). `RESTORE_COWER_ONCE` (香堂)
and `PRAY_ONCE` (土地廟) are offered while standing on the tile and are
free, like a search. Both are already gated twice over — once per run, and
by the walk it took to get there — so charging a turn on top would tax the
same thing twice and make a late detour to the Incense Hall never worth
it.

## 9. Midnight — the King ✅

```
midnight(state):
  if currentTile.flags.includes("RUNNING_WATER"):
      return "SURVIVED"                       # he will not cross it

  threshold = state.tablet ? KING_THRESHOLD_WITH_TABLET : KING_THRESHOLD
  atk = attack(state, playerChoice)           # ONE chance: banner + talisman
  if atk >= threshold: return "WIN_SEAL"
  return "LOSS_KING"
```

**One strike, binary.** No rounds, no damage, no health. He has no
abilities, no health pool, and 黑狗血 does not work on him.

The kits that reach the threshold:

| Kit | Attack | at 12 | at 11 (tablet) |
|---|---|---|---|
| 七星劍 + 真火符 + banner + 血符 | 13 | ✅ | ✅ |
| 七星劍 + 真火符 + banner + 五雷符 | 12 | ✅ | ✅ |
| 七星劍 + banner + 血符 | 11 | ✗ | ✅ |
| 銅錢劍 + 真火符 + banner + 血符 | 11 | ✗ | ✅ |

**Every winning line spends the banner.** It is the only truly
compulsory item.

### 🤫 Presentation rule — not a mechanic, but binding

鎮屍 is a **hidden ending**. The threshold is **never displayed**, before
or after, and sealing him unlocks nothing. The *only* place the number
ever appears is the verdict card of a player killed at midnight:

```
        your attack   6
        needed       12
```

That single line is the entire discovery mechanism. **Treat it as part of
the spec, not as UI copy** — remove it and the ending becomes
unreachable in practice.

## 10. Win / lose ✅

| Result | Condition |
|---|---|
| `WIN_BURIAL` | Survive the rite at `mass-grave` holding the tablet. **Ends the run immediately** |
| `WIN_SEAL` | `attack >= threshold` at midnight |
| `SURVIVED` | On a `RUNNING_WATER` tile when turn 30 resolves. Not a win, not a loss |
| `LOSS_HEALTH` | Health ≤ 0 at any point (combat, event, or poison tick) |
| `LOSS_KING` | Turn 30 resolves under the threshold |

There is **no loss to the clock**.

## 11. What the inherited engine has to change

Mapping to the existing `zombie_in_the_pocket` code, which the fork at
`~/code/jiangshi_in_the_pocket` starts from:

| File | Change |
|---|---|
| `js/engine.js` | **Heaviest.** Delete the deck, `timePasses()`, the hour reshuffle, `SETUP_BURN`, `bandKey`-from-deck. Add: turn counter, event-pool draw, poison state, cower charges, the additive attack formula, item categories, search rolls, the midnight threshold. `clockTime()` becomes pure arithmetic on `N` |
| `js/board.js` | Data only — 20 tiles. `STAY` means movement is no longer mandatory. The dead-end/breach machinery is **kept**, with the count now per-band (§2) |
| `js/app.js` | Turn loop restructured to action → event → search. New prompts: villager, search-accept, rite second-event, midnight kit choice. `fled` still gates the `HEAL_1` tiles (§6) |
| `js/render.js` | Turn-based clock face (36° ticks), cower pips, poison indicator, 6-slot backpack, 20 tile scenes |
| `js/epilogue.js` | Four outcomes; per-language *assembly* for zh-TW, not just strings |
| `js/tally.js` | Record which of the two wins; **never rank them** (§9) |
| `data/` | All four files replaced: `tiles`, `items`, `search`, `events` |
| `tests/` | The ~64 deck/clock/hour-band tests mostly stop applying. The 25 board tests survive |

**The dread dial, phantoms, the standing figure, the guttering lamp and
the scare system all survive untouched** — they read state, and the state
they read still exists.

## 12. Open — ❓, in rough priority

1. **Does fleeing a rite's second event abort it?** Assume **yes**, per
   the source's "still standing there" ruling — you may return and try
   again. §7.
2. **Does 護身符 reduce the 1 HP cost of fleeing?** Assume **no**. §6.
3. **A name for the breach in this theme.** "Zombie door" is the source's
   term and a poor fit here. **破牆** — *the wall gives* — is the working
   name in this spec. §2.

*Closed 2026-08-24: no `COWER_HEAL`; **only talismans stack** (so the 3
starting 糯米 take 3 slots); one 真火符 per sword; no `rich` flag; breaches
kept, scaling 3/4/5; generic flee at −1 HP; 護身符 is combat-only; each
rite draws an extra event; tile actions are free.*

## 13. Numbers worth re-deriving after any change

Cheap invariants a bot suite should assert, because several of them are
load-bearing and were arrived at by hand:

All damage figures below assume **the villager is refused**, and **exclude
poison** (which is a separate −1/turn on top).

| Invariant | Value |
|---|---|
| Every search table and event band sums to 100 | — |
| Expected HP lost per turn, bare-handed | 1.85 / 2.00 / 2.90 by band |
| Expected HP lost per turn at Attack 4 | 0.00 / 0.25 / 0.90 |
| Sustained attack ceiling from swords alone | **4** (七星劍 + 真火符) |
| 11 PM damage at the ceiling, over 10 turns | ~9 HP against a cap of 10 |
| Camping a `HEAL_1` tile is losing | +1/turn vs 2.3–2.9 |
| Worst possible single turn (11 PM dead end, 僵屍 6 + breach 5) | 7 HP at Attack 2, 3 HP at Attack 4 |
| Value of a cower charge (damage avoided) | ~0.85 / ~1.25 / ~2.3 by band, at Attack 2 |
| Expected searches for 七星劍 | ~7 (15 %) |
| Expected searches for 攝魂幡 | ~7 (15 %) |
| Winning kits at threshold 12 / 11 | 2 / 4 |
| Slots used by starting rice + a full duel kit | **6 of 6** |

## Links
- [[jiangshi in the pocket - glossary]] — 中英對照, and the id contract
- [[jiangshi in the pocket - redesign]] — every decision and its reasoning
- [[jiangshi in the pocket - rulebook]] — the same rules as prose
- [[jiangshi in the pocket plan]] — project note
- [[zombie in the pocket - ruleset spec]] — what 📐 refers to
