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

**⚠️ But the healing tiles are now the uncapped source — and optional
movement makes it worse.** Kitchen and Herb Terrace give +1 for *ending a
turn* there, with no limit. Under the original's mandatory movement, that
meant bouncing on and off the tile for +1 every 2 turns. **With STAY
legal, you just stand in the kitchen: +1 every single turn.** The only
brake is that each of those turns still draws an event, so the camper
trades event damage for healing at 1 HP a turn. Whether that trade is
losing depends entirely on the event pool's average damage at 10–11 PM
(§3). If mean event damage is under 1 HP/turn, **standing in the kitchen
until midnight is the dominant strategy** and the game is broken. Fixes,
if the bots confirm it: cap the tile heal per visit, make it fire only on
*arrival* rather than on any turn end, or accept it and make the pool
meaner. **Test this first — it is the most likely way this ruleset
breaks.**

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

**The open sub-question this creates → does a search turn draw an
event?** If it doesn't, searching is a *safe* turn — and a safe turn that
also hands out gear is strictly better than moving, which would make
"search everything searchable" the dominant line and would need its own
cap (search-once-per-tile) to hold. If it does draw an event, searching
is self-limiting by risk and needs no cap at all. **The second is the
better design**; it makes rummaging in a dead house feel like rummaging
in a dead house. Not decided.

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

**So 4 new slots to fill: 2 in, 2 out.** Open question what they *do*.
Cheapest is more filler; most interesting is new roles. Some candidates,
none picked:
- a second searchable room (couples directly to §3 — see below)
- a room that costs a turn to cross (the well, the coffin stacks)
- a shortcut / second seam between the two grids
- a shrine that lets you re-read or re-draw
- more one-exit dead ends, which is what actually generates zombie doors

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
- [x] **§1 — move, search and cower each cost 1 turn** (2026-08-22).
- [x] **§1 — cowering is limited to 3 per run**, default, to be tuned.

## Open questions
- [ ] **§1 — does a search turn draw an event?** ⭐ The live one. "No"
      makes searching a safe turn and forces a search-once-per-tile cap;
      "yes" makes it self-limiting by risk and needs no cap. Prefer yes.
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

## Links
- [[jiangshi in the pocket plan]] — project note (partly superseded, see above)
- [[zombie in the pocket - ruleset spec]] — the baseline being departed from
- [[zombie in the pocket - rulebook]] — prose rules, same baseline
- [[zombie in the pocket plan]] — the parent project
