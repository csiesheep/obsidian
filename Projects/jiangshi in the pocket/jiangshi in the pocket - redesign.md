---
tags: [project, design]
status: capturing
started: 2026-08-22
---
# jiangshi in the pocket — system redesign

Running capture of system changes that depart from the inherited v1.5
ruleset. **Nothing here is decided and nothing is built.** More is coming;
this note is meant to be appended to.

Companion to [[jiangshi in the pocket plan]] (which still describes the
game as a re-theme + one extra win condition — see *What this does to the
plan* at the bottom).

Baseline being changed: [[zombie in the pocket - ruleset spec]].

## TODO — the design still to do
- [x] **New tile design** — 10 indoor + 10 outdoor, roles, exits, which
      are searchable. **Done 2026-08-22 → §4**
- [ ] **Event pool** — contents, hour-band weighting, and the jiangshi
      attacks that live in it. Must satisfy constraint P1.
- [ ] **Item pool** — weapons / magic / medicine, uniques vs commons,
      miss rate. Shape settled (§3), contents not.
- [ ] **King ability design** — what he actually does at midnight.
      ⚠️ Open note: the proposed `clamp(7 − attack, 0, 4)` flattens the
      weapon table (attack 1/2/3 all take 4). Strength 5 gives a clean
      gradient. See *Open questions*.
- [ ] **Two wins** — how the tablet burial and the duel relate: relative
      difficulty, whether they interact, what the epilogue says about each.

---

## 1. Time system — a turn clock, not a deck clock

**✅ Decided 2026-08-22: 30 turns of 6 minutes, 9:00 PM → 12:00 AM.**
(The first draft of this note said 10-minute turns, which doesn't close —
180 minutes ÷ 10 is 18 turns, not 30. Resolved in favour of keeping both
"30 turns" and "three hours"; the turn is 6 minutes.)

**What it replaces.** Today the deck *is* the clock (spec §6): 9 cards,
burn 2, 7 resolvable draws per hour, 3 hours = **21 resolvable draws**.
`clockTime()` derives the minute hand from how much deck is left
(~8.6 min per card). Every card spent — room card, second card, item
search, cowering — moves the hand. Running the deck out is what tolls the
hour, and doing it at 11 PM is the loss.

### The numbers that follow from it
```js
TURNS_TOTAL   = 30
TURN_MINUTES  = 6
TURNS_PER_HOUR = 10
START = 21:00   // turn 1 begins here
END   = 24:00   // turn 30 ends here — the King arrives

// turn N (1-based):
minutesElapsed = (N - 1) * 6        // at the top of the turn
hourBand       = 21 + floor((N - 1) / 10)   // 21 | 22 | 23
```

| Band | Turns | Clock |
|---|---|---|
| 9 PM | 1–10 | 21:00 → 22:00 |
| 10 PM | 11–20 | 22:00 → 23:00 |
| 11 PM | 21–30 | 23:00 → 24:00 |

- **The hour bands are exactly 10 turns each** — the cleanest possible
  version of spec §3's three-band structure, and it survives into the
  event pool (§3) as a straight "which band am I in" lookup.
- **+43 % more actions than the original** (30 vs 21 resolvable draws),
  *before* accounting for anything that costs more than one turn.
- **The minute hand ticks 6 minutes = 36° per turn** — ten even ticks an
  hour. The existing clock render gets a cleaner, more readable motion
  than the current 8.6-minute irrational step, and a discrete tick is a
  better cue than a smooth sweep for "you just spent something."

**Consequences worth deciding on:**
- **Everything stops costing time by default.** The whole tension of the
  original is that a rummage, a special room and a cower all *spend
  clock*. If the clock is turns, the turn becomes the only currency —
  so each of those has to either consume a turn or be free. **This is the
  single biggest knock-on**, bigger than the clock change itself.
- **The game gets longer.** 21 draws today is really ~12–18 player turns
  (searches and specials eat 2 cards). 30 turns is roughly double that:
  a 5–20 min game becomes 15–30. Fine if intended; it changes what the
  game *is*.
- **The deck-exhaustion loss disappears** — which the King duel was
  already replacing anyway (plan, *win 2*). The two changes agree.
- **Reshuffling loses its trigger.** Today the hour turns when the deck
  empties; with a turn clock, the event pool needs its own refresh rule
  (see §3).
- **`clockTime()` becomes trivial and more honest** — no more "empty deck
  reads 60 and that's deliberate" comment.

### Turn structure — ✅ decided 2026-08-22

A turn is one **action**, then an **event**, then an optional **search**.
Search is *part of* the turn, not an action of its own.

```
turn(N):                       # N = 1..30, clock reads 21:00 + (N-1)*6 min
  1. ACTION — the player picks one:
       MOVE   → an adjacent tile; if unexplored, draw + rotate + place it
       STAY   → remain on the current tile
       COWER  → heal, spend a charge, END THE TURN HERE (no event)
  2. EVENT — draw one from the event pool for this turn's hour band
  3. SEARCH — if the tile offers one and the player wants it:
       roll → an item from the item pool, or nothing
  4. END OF TURN — tile effects (+1 on the healing tiles)
  5. N += 1
```

| Action | Turn cost | Event? | Limit |
|---|---|---|---|
| **Move** to an adjacent tile | 1 | yes | — |
| **Stay** on the current tile | 1 | yes | — |
| **Cower** | 1 | **no** | **3 per run** (default, to be tuned) |
| **Search** (rides on Move or Stay) | **0** | — | once per turn; may find nothing |

**Two things this settles that were open an hour ago.**

**Movement becomes optional.** The original is emphatic that it isn't
(spec §12, designer ruling: *"If you choose to go into a room, you're
going in there"*). Dropping that is correct here and costs nothing — but
note the board consequence: **being boxed in stops being a crisis.** The
zombie-door mechanic fires on "no usable exit"; with STAY legal, a player
in a dead end has an ordinary option, so zombie doors need a re-think as
either a scripted event-pool outcome or a rule keyed to something other
than desperation.

**STAY is the re-search loop, and it prices itself.** The reason to stay
is to roll the search again after finding nothing — and each retry costs
a turn *and* eats an event. That is exactly the self-limiting-by-risk
shape I wanted from "does a search turn draw an event?", reached more
elegantly: the risk isn't attached to searching, it's attached to
*lingering*. Rummaging a dead house while something walks toward you.
**No search cap is needed.** The cost is the clock and the event.

**There is now no safe turn except cowering** — 3 of them, all run.
Every other turn of the 30 draws from the event pool. That is a much
harder night than the original, where cowering was unlimited *and*
skipped a card, and it puts real weight on the event pool's tuning (§3).

**Cower stops being an economy and becomes an inventory.** This is the
change with the longest reach in the whole redesign. Today cowering is an
*economic* decision — unlimited, self-limiting only because each one
spends a card of clock. Capping it at 3 makes it a **charge**, like a
potion: something you hoard, agonise over, and can run out of. Design
consequences:
- It should be **on the HUD as three pips**, not a button that silently
  stops working. Running dry is a state the player must feel arriving.
- It should **feed the dread dial**. Being out of cowers at 11 PM is
  exactly the kind of thing the dial exists to register, and `dread()` is
  a pure function of state, so it's a one-line term.
- **+3 HP may now be too small a payout.** A cower used to cost ~8.6
  minutes of clock and nothing else; it now costs a turn *and* one of
  only three charges. Candidate: raise `COWER_HEAL` to 4–5. Tune with
  the bots, not by feel.

**🎯 This probably retires the health cap.** The plan's King duel
introduced `healthCap: 10` for exactly one reason: to kill the turtle who
cowers every turn and arrives at midnight with ~20 HP. **The 3-cower cap
kills that strategy at the source** — cowering can now contribute at most
+9 HP across an entire run (3 × 3), against a 6 HP start. A cap is a
blunt instrument that also punishes legitimate play; a charge limit is
precise. Two mechanisms are now doing one job, and the cap is the worse
of the two. Re-check before keeping it.

**The healing tiles are the only uncapped source — but that's a
constraint on the pool, not a hole in the rules.** With STAY legal you
can stand in the Kitchen for +1 a turn, paid for with one event. Ruled
2026-08-22 that this is **not a problem**: the turn budget is the real
brake. Camping trades away the tablet win entirely, and a turn spent
healing is a turn not spent exploring, so it is a *choice with a price*
rather than a free lunch.

What it does do is impose one number on the §3 pool design, and it should
be written down before the pool is authored:

> **Constraint P1.** Mean event damage per turn during the 10 PM and
> 11 PM bands must exceed **+1 HP**. Otherwise standing on a healing tile
> is net-positive health *and* net-positive clock toward the King duel,
> and camping dominates.

Not a big ask — the original's 11 PM band is more than half fights, at
4–6 monsters each. It just has to stay true after the pool is rebuilt.
The turtle/bouncer bots exist to check exactly this, so it costs nothing
to verify later.

**The emergent turn budget**, which is the number to design the map
against:
```
30 turns
 −3   cowering (if all charges spent)
 −5   staying (guess: ~5 re-search / linger turns)
 ————
 22   turns of actual movement, against a 20-tile map
```
So a full sweep of both grids is *just* out of reach, and only if you
neither search nor cower. That is a good place to land — it makes §2's
"can you even see the map?" answer itself: **no, and deliberately.**

### The item pool — ✅ shape decided 2026-08-22

**Rarity is expressed as multiplicity.** The pool holds *copies*: the
good items appear **once**, common ones appear **several times**. Drawing
is therefore weighted without any separate weight table — how many copies
a thing has *is* its probability. Exact contents and counts to be
designed later.

```
pool = [ 桃木劍 ×1, 五雷符 ×1, 銅錢劍 ×2, 糯米 ×3, … ]   # illustrative only
```

Why this is the right call, beyond being easy to author:
- **Uniqueness makes a find an event.** Pulling the one Peachwood Sword
  out of a coffin store at 10:30 is a story; pulling one of an infinite
  supply is loot.
- **The pool depletes, so the late game dries up on its own.** Spec §3's
  deliberate 11 PM item drought — one item card in nine — comes back for
  free, as a consequence of the structure rather than a rule anybody has
  to write.
- **It gives the player something to reason about.** "The sword is still
  out there" is real information, and knowing the good stuff is finite
  makes every search decision sharper. Whether to *show* a found-items
  ledger is a UI question worth having later; the information exists
  either way.
- **Duplicated consumables are the right kind of common.** Sticky rice
  and talisman paper get used up, so finding a second one has to be
  possible or the item economy stalls.

Still to settle when the pool is authored (not now):
- Draw with or without replacement — **without** is implied by "good
  items only appear once," and is what makes depletion work.
- The **miss rate**: what fraction of searches find nothing, and whether
  it is flat or decays per attempt on the same tile. A decaying rate
  (50 % → 25 % → 12 %) makes camping a room self-limiting and makes the
  third rummage feel like scraping the bottom — but flat is simpler and
  the turn cost may already be brake enough.
- Whether a **searchable room holds its own small stock** (1–2) and
  visibly empties, versus every search drawing from one global pool.

---

## 2. Tile system — 10 indoor, 10 outdoor

**The ask:** extend from 8 + 8 to **10 + 10**.

**Structurally free.** `board.js` is an unbounded dual grid; tile count is
data, not code. The 25 board tests should survive untouched. This is the
cheapest of the three changes *in code* and the most expensive *in art*.

**Slots today (16):**
- Indoor 8 — start (Gatehouse), dead-end (Washing Room, 1 exit), plain ×2,
  4-exit + exterior door (Courtyard), bonus-item (Coffin Store), heal
  (Kitchen), goal A (Sealed Crypt).
- Outdoor 8 — seam (Back Steps), plain ×1, **filler ×3 (identical Bamboo
  Grove)**, plain ×1, heal (Herb Terrace), goal B (Ancestral Grave).

**So 4 new slots to fill: 2 in, 2 out.** → **Designed 2026-08-22, see §4.**

**Things that need re-checking, not assuming:**
- **Reachability.** There's a commit proving the Reliquary is always
  reachable (`2908025`). 20 tiles on an unbounded grid changes those
  odds; the proof has to be re-run, not inherited.
- **Can you even see the map?** 20 tiles against 30 turns (or 18) — if a
  full sweep is impossible, that's a design statement, and a good one,
  but it should be chosen rather than discovered.
- **Art cost.** 14 painted tile scenes today (the 3 Bamboo Groves share
  one). 20 distinct tiles could be up to 20 scenes — the largest single
  block of hours in the project, and it grows ~40%.

---

## 3. Separate the event pool from the item pool

**The ask:** two pools. Entering a tile triggers a **random event** from
the event pool. **Some tiles** let you **search**, which draws from the
**item pool**.

**What it replaces.** Today one deck of 9 dual-purpose cards (spec §3):
each card carries *both* an item *and* three hour-band outcomes. You read
only the row for the current hour; an ITEM outcome means "draw the next
card and take the item printed on **it**." Items are therefore gated by
the deck itself — at 11 PM exactly one card in nine is an item.

**This is the deepest of the three changes.** It removes the source
game's cleverest piece of compression, and with it most of what made this
project "a re-theme of a verified spec."

**What it buys:**
- Events and items can be sized independently. Want 25 events and 12
  items? Fine. Content is no longer capped at 9 of each.
- **Searchability becomes a property of the map**, not of the card you
  happened to draw. That makes routing matter: you move *toward* places
  worth searching. This is a genuinely better fit for a 20-tile map, and
  it's why §2 and §3 are really one change, not two.
- The item table stops being hostage to the event table. Today, retuning
  an item's rarity means retuning an event.

**What it costs / must be re-solved:**
- **The difficulty curve has to be rebuilt from scratch.** Spec §3's
  curve is load-bearing and deliberate: 9 PM has 3 fights (3/4/4) and 2
  item cards; 11 PM has **5** fights (4/4/5/6/6) and **1** item card. That
  shape — more fights, bigger fights, items drying up — is the game. With
  pools it has to be re-expressed as either per-hour pools, hour-tagged
  events, or weighted draws. **Whatever the mechanism, preserve the
  shape.**
- **Item scarcity needs a new brake.** Previously the deck was the brake.
  Now it's "how many tiles are searchable × how often you may search."
  Obvious knobs: searchable-once-per-tile, search costs a turn, search
  risks an event. Without one of these, a 20-tile map with 6 searchable
  rooms hands out far more gear than the original ever did — and the
  King duel's numbers (plan, *win 2*) assume the original's scarcity.
- **Draw semantics, unspecified:** with or without replacement? Does the
  event pool exhaust and reshuffle (and if so, what triggers it now that
  the deck isn't the clock — §1)? Can the same event fire twice in a
  night? Does the item pool deplete permanently, so a found Peachwood
  Sword is gone from the world?
- **The "no card for the starting room" rule** and the Storage/Temple
  "second card" rules (spec §5, §12) are all phrased in cards. They need
  restating in the new vocabulary or dropping.
- **~64 engine tests are about the deck, the clock and the hour bands.**
  Most stop applying. The board's 25 survive.

---

## 4. The 20 tiles — ✅ designed 2026-08-22

### The organising idea: search is *typed*

The item list splits naturally into **武器 weapons / 符咒 magic / 丹藥
medicine**. Tiles search into **one of those categories**, not into a
single undifferentiated pool. This is what makes a 20-tile map worth
having:

- **Routing becomes a decision with a subject.** You don't wander looking
  for "an item," you cross the house *for a weapon* or *for talismans*.
- **It prices the two win paths differently.** The duel wants attack; the
  tablet run wants survivability. Those live in different rooms.
- **It authors itself.** Three small pools are far easier to balance than
  one big one, and a room's category is obvious from its fiction — you
  look for rice in a kitchen and talismans in a priest's room.

**The resulting geography, which is the point:**

| Category | Where it lives | Consequence |
|---|---|---|
| **符咒 magic** | **indoors only** — Priest's Cell, Mourning Hall | The best gear and the tablet are both in the house. A duelist can't skip the interior |
| **武器 weapons** | mostly **outdoors** — Ox Shed, Bamboo Grove ×2 (+ Woodshed, Coffin Store inside) | Common and plentiful, but the walk is long |
| **丹藥 medicine** | **both** — Washing Room, Kitchen, Herb Terrace | Healing is never far, which is what makes the healing *tiles* not decisive |

### Indoor — 義莊, the corpse hostel (10)

| # | id | Name | Exits | Search | Role |
|---|---|---|---|---|---|
| 1 | `gatehouse` | 門廳 Gatehouse | N | — | **Start.** Placed at origin |
| 2 | `washing-room` | 淨身房 Washing Room | N | 丹藥 | dead end |
| 3 | `woodshed` | 柴房 Woodshed | N, E | 武器 | **NEW** |
| 4 | `priest-cell` | 道士房 Priest's Cell | N, W | 符咒 ★ | the richest magic in the game |
| 5 | `mourning-hall` | 靈堂 Mourning Hall | N, E, W | 符咒 | hub |
| 6 | `courtyard` | 天井 Courtyard | N, E, S, W | — | crossroads; the **moon gate** is the way out |
| 7 | `coffin-store` | 棺材房 Coffin Store | N | 武器 ★ | dead end, richest weapons |
| 8 | `kitchen` | 灶房 Kitchen | N, E, W | 丹藥 | **+1 HP** at turn end |
| 9 | `incense-hall` | 香堂 Incense Hall | N, E | — | **NEW — restores 1 cower charge, once per run** |
| 10 | `sealed-crypt` | 停柩房 Sealed Crypt | E, W | — | **GOAL A — the tablet** |

*Exit density 21/10 = 2.1, matching the original's 17/8 = 2.13. Three
one-exit rooms, one four-exit hub.*

### Outdoor — the hillside (10)

| # | id | Name | Edges | Search | Role |
|---|---|---|---|---|---|
| 1 | `back-steps` | 後門石階 Back Steps | E, S | — | **Seam** (N). Set aside at setup, like the Patio |
| 2 | `ox-shed` | 牛棚 Ox Shed | S, W | 武器 | farm tools |
| 3 | `bamboo-1` | 竹林 Bamboo Grove | E, S, W | 武器 (commons only) | filler |
| 4 | `bamboo-2` | 竹林 Bamboo Grove | E, S, W | 武器 (commons only) | filler |
| 5 | `pavilion` | 涼亭 Pavilion | E, S, W | — | filler |
| 6 | `herb-terrace` | 藥圃 Herb Terrace | E, S, W | 丹藥 | **+1 HP** at turn end |
| 7 | `threshing-floor` | 曬穀場 Threshing Floor | N, E, S, W | — | **NEW** — the outdoor hub |
| 8 | `stream` | 溪澗 Stream | E, W | — | **NEW — running water** |
| 9 | `earth-shrine` | 土地廟 Earth God Shrine | E, S | — | **NEW — pray, once per run** |
| 10 | `ancestral-grave` | 祖墳 Ancestral Grave | E, S | — | **GOAL B — bury the tablet → win 1** |

*Exit density 26/10 = 2.6, matching the original's 21/8 = 2.6. Outdoors
stays more open than indoors, as hedges-vs-walls implies. Bamboo Groves
drop from ×3 to ×2 — with 20 tiles and typed search, identical filler
earns less of the map.*

### The five new tiles, and what each is for

**柴房 Woodshed** (indoor, NEW) — a second cheap weapon source near the
start, so an early run isn't bare-handed if the Coffin Store never turns
up. Pure supply; no cleverness.

**香堂 Incense Hall** (indoor, NEW) — **restores one cower charge, once
per run.** With cowering capped at 3 (§1), a charge is the most precious
thing on the board, and a tile that gives one back is a genuine
destination worth a detour. Once per run, because the incense burns out —
and because a repeatable charge fountain would undo the cap.

**曬穀場 Threshing Floor** (outdoor, NEW) — the outdoor half had no
four-exit hub; the Courtyard has no counterpart across the seam. Open
ground, nowhere to hide, and the place every outdoor route crosses.

**溪澗 Stream** (outdoor, NEW) — **jiangshi cannot cross running water.**
The single best piece of folklore available and it costs nothing to
implement: on this tile, jiangshi events deal **no damage**. It is a real
refuge — and a *sterile* one: no search, no heal, two exits, out at the
edge of the map. Camping there buys safety and nothing else, so a player
who hides at the stream arrives at midnight unhurt, unarmed and
unequipped, which loses the duel. **Safety that doesn't win is exactly
the right shape for a refuge**, and it needs no extra rule to hold.

**土地廟 Earth God Shrine** (outdoor, NEW) — **pray: the next unexplored
outdoor tile you place is the Ancestral Grave.** Once per run.

That last one exists to fix a structural asymmetry, and it's the most
load-bearing of the five: **win 2 is passive and win 1 is a scavenger
hunt.** The duel comes to you at midnight no matter what; the burial
requires finding *two specific tiles out of twenty*, in the right order,
across a seam, inside 22 movement turns. Without help, path 1 is
strictly harder in a way that isn't interesting — it's harder because of
draw luck. The shrine converts the back half of that hunt from luck into
a route you can choose to take. The land god knows where the dead are
buried.

### What is deliberately *not* searchable

Gatehouse (you just came through it), Courtyard, Back Steps, Threshing
Floor, Pavilion (open ground — nothing to rummage), Stream, Earth Shrine
and both goal rooms. **10 of 20 tiles are searchable**, so a search is
never far away, but half the map is transit. The two goal rooms aren't
searchable because their *ritual* is their search.

### Open, and deferred to the pool work
- **How many items a searchable room holds**, and whether ★ rooms
  (Priest's Cell, Coffin Store) hold more or better — see §3.
- **The two goal-room rituals.** The tablet and the burial were "resolve
  a second card" each; in turn terms the natural translation is one extra
  turn, or one extra event, apiece. Listed under *Open questions*.
- **Whether one seam is still right.** The Courtyard's moon gate remains
  the only crossing. With 20 tiles that is a hard bottleneck for path 1 —
  the Earth God Shrine softens it, but a second seam (or a one-way gate)
  is worth testing if the bots find the burial win too rare.

---

## Cross-cutting

**These three changes are one change.** Turn clock (§1) decides what
searching costs; searchable tiles (§3) decide what the 4 new slots are
for (§2); pool size and refresh (§3) have no trigger without the clock
decision (§1). They can't be specced separately.

**What survives all three, untouched:**
- `board.js` entirely — dual grid, free rotation, the seam, zombie doors.
- Combat arithmetic — `clamp(monsters − attack, 0, 4)`, attack never
  stacks, one weapon per fight.
- Items, slots and combos — 2 carried + slotless tablet, the
  weapon/heal/consumable/enabler shapes.
- Every atmosphere system — dread dial, phantoms, the standing figure,
  the guttering lamp, scares, the epilogue composer. All of it reads
  state, and the state it reads still exists.

**What dies:** the deck-as-clock, `timePasses()`, the hour reshuffle, the
burn-2, the dual-purpose card, the midnight-by-exhaustion loss, and the
"21 resolvable draws" budget that every number in the spec was balanced
against.

**Licensing upside, and it's real.** After these three changes the game
no longer *runs on* Zombie in my Pocket's ruleset — it borrows the
tile-crawl + night-clock skeleton and almost nothing else. Mechanics were
never copyrightable anyway, but this moves the project from "a careful
clean-room re-theme" to "an original game with an acknowledged ancestor,"
which is a much shorter conversation. Keep crediting Lee regardless.

**The fork was the right call.** These are rules changes, not skin
changes; a shared-engine "mode switch" would have been fighting this from
day one. [[jiangshi in the pocket plan]]'s architecture section is now
the *only* part of it that these changes strengthen rather than
undermine.

---

## Decided
- [x] **§1 — 30 turns of 6 minutes, 9 PM → midnight** (2026-08-22).
      10 turns per hour band.
- [x] **§1 — turn = one action (move / stay / cower), then an event, then
      an optional search** (2026-08-22). Search is free; staying is what
      costs.
- [x] **§1 — movement is optional.** Overturns the source's mandatory-move
      ruling, deliberately.
- [x] **§1 — cowering is limited to 3 per run**, default, to be tuned; it
      is the only turn that skips the event.
- [x] **§1 — no search cap needed.** Re-searching is priced by the turn
      and the event that STAY costs.
- [x] **§4 — the 20 tiles**, their exits, and which 10 are searchable
      (2026-08-22). Search is **typed** (weapon / magic / medicine).

## Constraints for later tuning
- **P1 — mean event damage at 10–11 PM must exceed +1 HP/turn**, or
  camping a healing tile dominates. Checked by the turtle/bouncer bots.

## Open questions
- [ ] **⚠️ The King duel's damage clamp flattens the weapon table.** With
      `strength 7` and `clamp(7 − attack, 0, 4)`, attack **1, 2 and 3 all
      take 4 a round** — so every +1 and +2 weapon is worth exactly
      nothing in the duel, and only the +3 changes anything. That inverts
      what the redesign wants: it makes campable **health** matter and
      searchable **attack** not. **Recommend King strength 5**, which
      gives a clean gradient (attack 1→4, 2→3, 3→2, 4→1, 5→0) where every
      weapon point tells. Revisit when the duel is tuned.
- [ ] **§1 — what happens to zombie doors** now that being boxed in is
      survivable (STAY is always legal)? Re-key them to the event pool,
      or to something other than "no usable exit".
- [ ] **§3 — item pool contents and probabilities.** Deferred by
      decision; shape is settled (uniques ×1, commons ×N), numbers are not.
- [ ] **§4 — do the goal-room rituals cost an extra turn or an extra
      event?** The tablet and the burial were each "a second card".
- [ ] **§4 — is one seam still right?** The moon gate is the only
      crossing, and path 1 has to make the round trip. Test before adding
      a second.
- [ ] **§1 — is the cower limit per run or per hour?** Read as **per run**
      (3 total). Per hour would be 9 total and a very different game.
- [ ] **§1 — does `COWER_HEAL` rise from 3?** A charge is worth more than
      a card of clock was. Candidate 4–5.
- [ ] **§1 — is `healthCap: 10` still needed** now that the cower cap
      kills the turtle? Probably not. Drop unless the bots disagree.
- [ ] **§1 — do the +1 heal tiles need a brake?** They are now the only
      uncapped healing. Test with a "bouncer" bot.
- [ ] **§1 — do the goal-room rituals cost extra turns?** The Sealed
      Crypt search and the Ancestral Grave burial were "a second card"
      each; in turn terms that's most naturally 1 extra turn apiece.
- [ ] **§2 — what are the 4 new tiles for?** Filler, or new roles?
- [ ] **§3 — how is the 9→11 PM difficulty curve re-expressed?**
      Per-hour pools / hour-tagged events / weighted draws.
- [ ] **§3 — what stops item inflation?** Search once per tile? Search
      costs a turn? Search risks an event?
- [ ] **§3 — pool draw semantics.** Replacement, exhaustion, reshuffle
      trigger, permanent depletion.
- [ ] Does the **King duel** (plan) still balance under a turn clock and
      looser item supply? Its numbers assumed 21 draws and deck-gated gear.
- [ ] Does **cowering survive at all**, or does the turn clock replace it
      with something else?

## What this does to the plan
[[jiangshi in the pocket plan]] currently describes a re-theme of a
verified ruleset plus one new win condition, and its *Starting point*
table assumes `engine.js` carries over with one hook changed. Sections
**§1–3 above supersede that**: the engine's deck/clock half is being
replaced, not re-skinned, and the phase order (seam refactor → duel →
skeleton) no longer matches. **Not reconciled yet — deliberately**, since
more redesign is coming. Reconcile once the systems settle.

## Log
- 2026-08-22 — captured the first three system changes: turn-based clock
  (30 turns, 9→12), 10+10 tiles, and split event/item pools. Flagged the
  30-turns-vs-10-minutes arithmetic conflict, and that all three changes
  are coupled through "what does a turn cost."
- 2026-08-22 — **§1 settled: 30 turns × 6 minutes**, 10 per hour band.
  Gives exactly-even bands (1–10 / 11–20 / 21–30), a 36° clock tick, and
  a budget 43 % larger than the original's 21 draws. "What costs a turn"
  is promoted to the design's central open question — with a fixed turn
  budget it is the only remaining currency.
- 2026-08-22 — **turn costs settled: move / search / cower = 1 turn each,
  cowering capped at 3 charges per run.** Cowering thereby changes
  category — from an economic choice to a hoardable resource, which wants
  HUD pips, a dread term, and probably a bigger heal. Two knock-ons
  recorded: the cower cap **supersedes the King duel's `healthCap: 10`**
  (both existed to kill the turtle; the cap is the blunter of the two),
  and the **+1 heal tiles are now the only uncapped healing**, held in
  check solely by the event-on-entry rule. Turn budget works out to ~22
  movement turns against a 20-tile map — a full sweep is just out of
  reach, which answers §2's "can you even see the map?" with a
  deliberate no.
- 2026-08-22 — **turn structure revised: search is free and rides on the
  turn, not an action of its own.** A turn is one action (MOVE / STAY /
  COWER) → an event → an optional search that may find nothing.
  **Movement becomes optional**, overturning the source's mandatory-move
  ruling. Consequences: STAY is the re-search loop and prices itself (a
  turn plus an event per retry), so **no search cap is needed**; cowering
  is now the only event-free turn, 3 per run; and being boxed in is no
  longer a crisis, so **zombie doors lose their trigger** and need
  re-keying. New top risk recorded: with STAY legal, camping a +1 healing
  tile yields +1 HP/turn against one event — if mean event damage at
  10–11 PM is under 1 HP, standing in the kitchen is the dominant line.
  Bot that before anything else.
- 2026-08-22 — **healing-tile camping ruled not a problem**: the limited
  turn budget is the brake, and camping trades away the tablet win
  outright. Downgraded from a risk to **constraint P1** on the event pool
  (mean damage at 10–11 PM must beat +1 HP/turn), to be verified by bot
  rather than designed around now. **Item pool shape settled: rarity is
  multiplicity** — good items appear once, commons appear several times,
  so the pool depletes and the late-game item drought reappears as a
  consequence of the structure. Contents and probabilities deliberately
  deferred. Separately, flagged that the King duel's `clamp(7 − attack,
  0, 4)` makes attack 1/2/3 identical, which would make the searchable
  half of the game irrelevant to win 2; strength 5 fixes the gradient.
- 2026-08-22 — **§4: the 20 tiles designed.** Organising idea is that
  **search is typed** — weapon / magic / medicine, matching the item
  taxonomy — which gives the map a geography: magic is **indoors only**
  (Priest's Cell, Mourning Hall), weapons skew outdoors, medicine is
  everywhere. 10 of 20 tiles searchable; the rest is transit. Five new
  tiles: Woodshed (weapon supply near the start), **Incense Hall**
  (restores 1 cower charge, once — the scarcest resource in the game
  gets exactly one refill), Threshing Floor (the outdoor hub the map
  lacked), **Stream** (running water: jiangshi events deal no damage —
  a refuge that is deliberately sterile, so hiding there loses the duel),
  and **Earth God Shrine** (pray once: the next unexplored outdoor tile
  is the Grave). The shrine exists to fix a real asymmetry — **win 2 is
  passive, win 1 is a scavenger hunt across a seam** — and converts the
  back half of that hunt from draw luck into a route.

## Links
- [[jiangshi in the pocket plan]] — project note (partly superseded, see above)
- [[zombie in the pocket - ruleset spec]] — the baseline being departed from
- [[zombie in the pocket - rulebook]] — prose rules, same baseline
- [[zombie in the pocket plan]] — the parent project
