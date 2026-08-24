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
- [x] **Event pool** — **done 2026-08-23 → §6**, including 中毒
      (−1/turn until a 糯米 cures it). Residual: whether **護身符 cancels
      poison** — the villager route hangs on it.
- [x] **Item pool** — **13 items + search probabilities done 2026-08-23**
      (see §1). Residual: whether a talisman *stack* from 硃砂 occupies one
      slot or several.
- [x] **King ability design** — **done 2026-08-23 → §5.** Strength 12 as
      a **threshold**: one strike, Attack ≥ 12 seals him, anything less
      kills you. No abilities by design; the drama is the build-up.
- [x] **Two wins** — **done 2026-08-23 → §7.** They spend different
      currencies (MOVE/tiles vs STAY/items). Recommendation on the table:
      **carrying the tablet lowers the seal threshold 12 → 11**, so the
      two paths converge and a failed burial still counts for something.
- [ ] **Bilingual — English + 繁體中文, both first-class.** Not a
      translation bolted on: this is a Chinese-themed game, so the zh-TW
      text is arguably the original and the English is the localisation.
      Known work: the ~45 strings still hardcoded in `app.js` /
      `render.js` have to move into the theme file (already a
      precondition for anything else); a subsetted CJK display face
      against IM Fell's 20 KB; `<html lang>`, a switch, and persistence;
      and the one genuine technical wrinkle — **`epilogue.js` needs
      per-language *assembly*, not per-language strings.** It composes a
      single sentence from fragments with placeholders, and Chinese word
      order, measure words and the lack of plurals break that structure,
      not just its vocabulary. Tile and item names are already written
      bilingually in §4. Upside: a zh-TW build is a second SEO surface —
      殭屍 / 義莊 / 道士 searches the English page can never reach.

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
| **Cower** | 1 | **no** | **3 per run.** Heals nothing — its value *is* the skipped event |
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

**Cower stops being an economy and becomes an inventory.** Today cowering
is an *economic* decision — unlimited, self-limiting only because each one
spends a card of clock. Capping it at 3 makes it a **charge**: something
you hoard, agonise over, and can run out of.

**And as of 2026-08-24 it heals nothing at all.** A charge buys exactly
one thing: **the turn draws no event.** That is a bigger deal than a heal,
because what it saves is the *expected damage of the draw you skipped* —
which grows as the night does:

| Band | A charge is worth (at Attack 2) |
|---|---|
| 9 PM | ~0.85 HP |
| 10 PM | ~1.25 HP |
| 11 PM | **~2.3 HP** |

So charges are naturally **hoarded for late**, and the game never has to
say so. Three design consequences:
- They belong on the HUD as **three pips**, not a button that silently
  stops working. Running dry is a state the player must feel arriving.
- They should **feed the dread dial** — being out of charges at eleven is
  exactly what that dial exists to register, and `dread()` is a pure
  function of state.
- **Healing is now entirely items and tiles**: 糯米 +3, 金丹 +6/−2, the two
  `HEAL_1` tiles, and `HP: +1` events. Cowering is evasion, not recovery,
  and the two no longer compete for the same slot in the player's head.

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

### The items — ✅ designed 2026-08-23

Thirteen items in five categories. (The thirteenth, 護身符, is not
searchable — it comes only from the 9 PM villager; see §6.) Weapons persist; talismans and
medicines are **consumed on use**. The backpack holds **6 items**
(2026-08-23, up from the source's 2). The 神主牌 tablet is slotless.

#### 武器 weapons — persistent, carried

| 物件 | Item | Attack |
|---|---|---|
| **戒刀** | Precept Knife | 1 |
| **桃木劍** | Peachwood Sword | 1 |
| **銅錢劍** | Coin Sword | 2 |
| **七星劍** | Seven-Star Sword | 3 |

#### 符咒 magic — one use, then gone

| 物件 | Item | Effect |
|---|---|---|
| **真火符** | True Fire Talisman | Attack **1** — *or* **+1 attack to a sword, permanently** (戒刀 1 → 2) |
| **五雷符** | Five Thunder Talisman | Attack **4** |
| **血符** | Blood Talisman | Attack **5**, costs **1 HP** to use |
| **硃砂** | Cinnabar | Add **+2 quantity** to any talisman in hand |

#### 法器 ritual implement — one use, then gone

| 物件 | Item | Effect |
|---|---|---|
| **攝魂幡** | Soul-Snatching Banner | **Doubles a sword's** Attack for one fight. Does *not* double a talisman |

#### 丹藥 medicine — one use, then gone

| 物件 | Item | Effect |
|---|---|---|
| **糯米** | Sticky Rice | **+3 HP** — *or* cure **poisoned** |
| **黑狗血** | Black Dog Blood | **Escape the fight** |
| **金丹** | Golden Elixir | **50 %: +6 HP · 50 %: −2 HP** |

### Search probabilities — ✅ decided 2026-08-23

Rolled per search. **Weapons are one-of-a-kind**: roll one you already
carry and you find nothing.

| 武器 weapon | | 符咒 magic | | 丹藥 medicine | | 土地廟 special | |
|---|---|---|---|---|---|---|---|
| 戒刀 | 25 % | 真火符 | 30 % | 糯米 | 40 % | 糯米 | 40 % |
| 桃木劍 | 25 % | 血符 | 20 % | 黑狗血 | 25 % | **攝魂幡** | **15 %** |
| 銅錢劍 | 25 % | 硃砂 | 20 % | 金丹 | 15 % | nothing | 45 % |
| 七星劍 | **15 %** | 五雷符 | 20 % | nothing | 20 % | | |
| nothing | 10 % | nothing | 10 % | | | | |

### What the probabilities do

**1. ✅ Weapons self-limit, elegantly.** Because a duplicate roll returns
nothing, the effective miss rate *climbs as you collect*:

| Already carrying | Effective "nothing" |
|---|---|
| — | 10 % |
| 戒刀 | 35 % |
| 戒刀 + 桃木劍 | 60 % |
| + 銅錢劍 | 85 % |

Diminishing returns with no extra rule written — the fourth weapon search
in a night is nearly always wasted. This is the cleanest of the four
tables.

**2. 七星劍 at 15 %** (raised from 10 % on 2026-08-23, taking the 5 %
from the two interchangeable Attack-1 swords, which between them were
soaking 60 % of every weapon search). ~7 searches expected; seven rolls
give 68 %, twelve give 86 %. Each extra roll costs a **STAY** — a turn
*and* an event. Reachable on a committed night, still absent from many.
The 5 % also went partly to 銅錢劍, which matters because the
tablet-assisted seal line runs through it (§7).

**3. ✅ The health cap fixes the medicine engine.** 帳房 Counting Room and
槐樹 Pagoda Tree each give **+1 HP at end of turn** *and* a 丹藥 search,
which made them a healing engine. A turn standing on 帳房 is still worth
a lot in expectation:

```
+1.0   the tile
+1.2   40 % × 糯米 (+3)
+0.2   15 % × 金丹 (EV +2)
────
+2.4 HP per turn, before event damage
```

— but **health is now capped at 10** (decided 2026-08-23), and that
settles the whole question. Starting health is 6, so the entire headroom
is **+4**. Camping can top you up and then does nothing at all: a turn
spent healing at full health is a turn thrown away, and the clock does
not stop. Healing becomes **recovery**, never accumulation.

That is the right shape, and it is worth saying why the cap works where a
constraint on the event pool would not have:

> **Constraint P1 is retired, not superseded.** It asked the event pool to
> out-damage the healing tiles — which would have meant designing every
> event around one tile's edge case. The cap does the same job at the
> source and leaves the pool free to be whatever the night needs.

The cap also brings back a small, good tension the source game had: at
9 HP, a 糯米 (+3) is mostly wasted, so you hold it — and holding it costs
a slot.

**4. 真火符 is the most common talisman (30 %) and talismans are
unlimited.** Nothing marks 符咒 as one-of-a-kind, so they're drawn with
replacement — a 90 % hit rate, forever. That turns an academic question
urgent: **can one sword take more than one 真火符?** If it can, camping
經堂 / 靈堂 / 竹林 yields a 真火符 roughly every third search and Attack
climbs without limit. Recommend **capping a sword at one**.

**5. Is 攝魂幡 unique?** Unstated, and at **15 %** it is now the rarest
single outcome in the game — ~7 searches expected, all of them outdoors,
all of them costing a STAY plus an event. That rarity does most of the
work on its own: a second banner is another ~7 turns out of 30, which no
run going for either win can spare. Still worth **declaring it unique
like the weapons**, so the shrine returns nothing once you hold one —
otherwise a duelist who reaches the shrine early has a reason to stand
there for a third of the night.

### 🗡️ How Attack is put together — revised 2026-08-23

**A sword and a talisman add.** They are not alternatives any more: you
may bring both to the same fight, and the banner doubles the *sword* half
only.

```
Attack  =  (sword  ×2 if 攝魂幡 spent)  +  talisman
```

| Example | Working | Attack |
|---|---|---|
| 七星劍 + 真火符 in it, 幡, 五雷符 | (3+1) × 2 + 4 | **12** |
| 七星劍 + 真火符 in it, 幡, 血符 | (3+1) × 2 + 5 | **13** |
| 七星劍, 幡, 五雷符 | 3 × 2 + 4 | 10 |
| 銅錢劍, 幡, 血符 | 2 × 2 + 5 | 9 |
| 七星劍 + 真火符, no banner, 五雷符 | 4 + 4 | 8 |

**What survives the fight and what doesn't** — confirmed 2026-08-23:

| | |
|---|---|
| **劍 swords** | **Persistent.** Never consumed. A 真火符 burned into one stays burned in |
| **符 talismans** | **Consumed** on use, one fight each |
| **攝魂幡** | **Consumed** — one use, one fight |

**So the winning kit is spent in a single beat, and you get exactly one
attempt.** The sword half is permanent and safe; the other half — banner
plus talisman — is gone the moment you spend it.

⚠️ **That makes mistiming the banner a way to lose outright.** Spend it on
a beat when you have no attack talisman in hand and you reach 8, not 12 —
the blow lands, and the only route to the seal is gone for the rest of
the night. The duel is therefore not only a collection problem but a
**sequencing** one, which is the good kind of difficulty: it is entirely
visible in advance, and entirely the player's own call.

Two implications for the build:
- **The UI has to make this legible.** At the moment of choosing, the
  player should be able to see what Attack each combination would produce
  and that the banner is one-use. This is a set-piece; it can afford a
  proper confirm.
- **A cautious player will hold the banner to the last beat**, since
  spending it early can only waste it. Worth checking with the bots that
  beat 3 doesn't become the only sensible timing — if it does, the choice
  is illusory.

**This is a much bigger change than the duel it was written for.** It
lifts the ceiling everywhere, and it changes what a talisman *is*:

- **Talismans stop being a substitute and become an amplifier.** Before,
  spending 五雷符 meant fighting at 4 *instead of* your sword. Now it
  means +4 *on top*. A 銅錢劍 player facing five jiangshi went from 3
  damage to **0**.
- **Every weapon stays relevant.** Under the replace rule a 戒刀 was
  strictly worse than any attack talisman, so it was dead weight the
  moment you found one. Now it always contributes.
- **⚠️ Ordinary combat gets much easier.** Sword + talisman routinely
  covers a whole pack. The event pool has not been written yet, so this
  is the right time to know it: **pack sizes should be scaled against
  sword-plus-talisman, not sword alone**, or the 10 and 11 PM bands will
  be walked through by anyone carrying two items.
- 血符 and 五雷符 remain near-identical — +1 Attack for 1 HP is exactly
  break-even under the clamp — so they still want separating by **rarity,
  not effect**. 血符 does now carry a 1-point margin in the duel maths
  below, which is a small real difference.

### What this design implies

**1. Base attack is almost certainly 0, not 1.** Nothing else makes the
table work: 戒刀 at "attack 1" would be identical to bare hands under the
inherited `START_ATTACK = 1`, and 真火符's attack-1 mode would be worth
nothing at all. Read as absolute values over a **bare-handed 0**, every
entry earns its place. This also matches where the source game was
heading — v1.75 rewrote bonuses as absolutes precisely to kill the
`1 + n` confusion (*"the femur is a 3 attack, not a 1+3"*).

**2. ✅ 血符 at 1 HP works.** At 2 HP its cost exactly cancelled its +2
attack and it was strictly worse than 七星劍. At 1 HP it earns a real
band:

| vs pack of | 七星劍 (3) | 血符 (5) | Verdict |
|---|---|---|---|
| 4 | 1 | 0 (+1 HP) | break-even |
| 5 – 7 | 2 / 3 / 4 | 0 / 1 / 2 (+1 HP) | **1 HP better** |
| 8 | 4 | 3 (+1 HP) | break-even |
| 9+ | 4 | 4 (+1 HP) | worse — both clamped |

Good shape: an upgrade against mid packs, wasted on the very largest
(where the 4-damage clamp flattens everything), and an emergency win when
unarmed — attack 0 against a pack of 4 saves 4 HP for 1.

**One consequence:** 血符 and 五雷符 are now nearly the same card. 血符
saves exactly 1 more damage and costs exactly 1 HP, so they trade evenly
everywhere the clamp isn't binding. **Differentiate them by rarity, not
by effect** — 五雷符 common, 血符 rare (or the reverse), because the
numbers won't tell them apart.

**3. 🔥 真火符 on a sword is the game's best line, and it stacks with
硃砂.** The buff is additive and sticks to the weapon:

| Sword | Base | +真火符 |
|---|---|---|
| 戒刀 / 桃木劍 | 1 | 2 |
| 銅錢劍 | 2 | 3 |
| 七星劍 | 3 | **4** |

七星劍 + 真火符 = attack 4 **permanently**, matching the best one-shot
talisman and never running out. And since 硃砂 adds +2 quantity to a
talisman in hand, **硃砂 → 真火符 ×3 → 七星劍 = attack 6**, which zeroes
almost anything in the game.

Every design wants a best line, so this existing is good. **But the
6-slot backpack removed the thing that was keeping it honest.** Under 2
slots you had to stage it — hold 真火符 + 硃砂, spend the 硃砂, drop it,
go and find the sword, then spend all three — which cost turns and
courted disaster. With 6 slots you simply carry all three and press the
button. The line is now gated by **finding** the pieces and nothing else.

If attack 6 turns out to be too much, the brakes available are: cap a
sword at **one** 真火符, stop 硃砂 from targeting 真火符, or make the
buff last one fight instead of sticking.

**4. 🎏 攝魂幡 is a boss item, whether or not that was intended.** It is
the game's first **multiplicative** effect, and the damage clamp decides
what that means. Damage is `count − attack`, so any attack at or above
the pack size already deals 0 — and doubling past that is thrown away:

| Holding | Attack | ×2 | vs a pack of 5 | vs a pack of 7 |
|---|---|---|---|---|
| 七星劍 | 3 | 6 | 2 → **0** | 4 → 1 |
| 七星劍 + 真火符 | 4 | 8 | 1 → **0** | 3 → **0** |
| 血符 | 5 | 10 | 0 → 0 | 2 → **0** |

Against ordinary packs the banner mostly buys nothing a sword wasn't
already buying. Against something **big** it is decisive. So it naturally
becomes the thing you *save for midnight* — which is exactly right for a
soul-banner, and gives the item a real decision attached to it ("is this
the fight?") rather than a number.

Two things follow:
- **It sets the ceiling the King must be designed against.** A prepared
  player can present **attack 10** (血符 ×2) or **12**
  (七星劍 + 真火符 ×3, doubled). If the King's strength lands anywhere
  near the earlier proposals of 5–7, a banner-holding player zeroes him
  outright. Design him knowing this number exists.
- **"Next attack" means exactly one attack**, so in a multi-round duel it
  covers **one round**. That is a good fit with the planned three-round
  structure: the banner answers one beat and you still need answers for
  the other two. Worth keeping the duel multi-round for precisely this
  reason.

**Where it is found — 土地廟 Earth God Shrine, and nowhere else**
(decided 2026-08-23), on a chance when searched. Two things this buys:
- **It is genuinely hard to get.** The shrine is outdoors, so the banner
  is behind the moon gate, behind finding one tile in ten, behind a search
  roll. For the item that decides the duel, that is the right amount of
  work.
- **It pulls the duelist outside.** The shrine also holds the prayer that
  reveals the Mass Grave, so the burial player was always going there —
  now the midnight player has to as well.

**4. 🆕 屍毒 poison is a new status that does not exist yet.** 糯米's
second mode cures "poisoned" — nothing in the design can currently
inflict it. That implies a jiangshi attack in the **event pool** that
poisons rather than damages, and a status system to hold it: how long it
lasts, what it does per turn, whether it stacks, whether cowering or the
healing tiles clear it. **A whole small system, arriving via one item
line.** Worth designing on purpose.

**5. Talismans have *quantity*, which the slot rules don't cover.** 硃砂
adds "+2 quantity to any talisman in hand", so you hold 五雷符 ×3 rather
than 五雷符. Open: does a stack occupy **one** item slot or three? One is
the natural reading and mirrors the source's refuellable chainsaw. Also:
can 硃砂 target a talisman you hold **zero** of, or only one you actually
have?

**6. 長明燈 and the combo triangle are gone.** The previous design had
lamp + blood / lamp + talisman / cinnabar + talisman as three combos.
Only the last survives, as 硃砂. Simpler and easier to teach — but the
altar lamp was also the game's light source in fiction, and its
disappearance is worth being deliberate about rather than incidental.

**7. 金丹 is the first random item in the game.** EV is +2, the same as
the old soda, with a wide spread. Fits the folklore exactly — mercury
elixirs killed emperors — and the engine already has seeded RNG streams
to draw it from, so a shared seed still replays identically. Just note it
is the only item whose outcome the player cannot plan around.

### What the cap tells us about the King ⏳

With **cap 10** fixed and 七星劍 at only 10 %, the King's strength is now
computable rather than a guess. Over the proposed **three rounds**, with
`damage = clamp(strength − attack, 0, 4)` and a full 10 HP:

| Attack | vs strength 5 | vs strength 6 | vs strength 7 |
|---|---|---|---|
| 0 — bare | 12 ✝ | 12 ✝ | 12 ✝ |
| 1 — 戒刀 / 桃木劍 | 12 ✝ | 12 ✝ | 12 ✝ |
| 2 — 銅錢劍 | **9** | 12 ✝ | 12 ✝ |
| 3 — 七星劍 | **6** | **9** | 12 ✝ |
| 4 — 七星劍 + 真火符 | **3** | **6** | **9** |
| 5 — 血符 | **0** | **3** | **6** |

✝ = more than 10, i.e. death.

**Strength 7 requires Attack 4 to survive**, and Attack 4 needs the 10 %
sword *plus* a talisman spent on it — so at strength 7 the duel is
reachable only on a lucky night. **Strength 5 asks for Attack 2**
(銅錽劍, or two or three weapon searches) and near-full health, which is
demanding but ordinary. Given the weapon table, **5 is the number that
matches the game that actually gets played** — 6 if the duel should be
the harder of the two wins.

Caveat for when this gets designed properly: a talisman covers **one
round**, not the whole duel, so 五雷符 and 血符 in the table above are
single-round substitutions, not a standing Attack. And 攝魂幡 doubles
exactly one round.

### Still open on items
- **Which are unique and which are common** — the pool's rarity is
  multiplicity (§ above), and none of the eleven has a count yet.
- **Is a talisman *stack* one slot or many?** Still open, and it matters
  more now: 6 slots holding stacks of 3 is a lot of talismans.
- **Can one sword take more than one 真火符?** If yes, 硃砂 makes
  attack 6 reachable (see 3 above).
- **Does using a talisman replace the weapon's attack or stack with it?**
  Read as replace ("攻擊力 4" is your attack that fight), which is
  consistent with *attack never stacks* 📐.
- **黑狗血 escapes the fight** — to where? The source's flee rule moves
  you to an adjacent explored tile at −1 HP. Here it costs the item
  instead, but the destination question stands.

### 道士的行頭 — source material for the item pool

Folk-Taoist kit as it actually appears in the 茅山 / 湘西趕屍 / 民間道教
tradition that jiangshi films draw on — not orthodox 全真 or 科儀 Taoism.
Reference for authoring the item pool; nothing here is chosen yet.

**The taxonomy already matches the map.** These four groups line up
one-to-one with the search categories in §4 — 法器/武器 → **武器**,
符咒 → **符咒**, 丹藥 → **丹藥**, and 法事用品 as enablers and quest
objects. That wasn't planned; it's just what the tradition is shaped like.

#### 一、法器與武器

| 物件 | 民俗中的作用 |
|---|---|
| **桃木劍** | 最經典。桃木本身辟邪，斬妖不見血 |
| **銅錢劍** | 銅錢（多用五帝錢）以紅線紮成劍形，鎮宅、斬煞 |
| **七星劍** | 劍身嵌北斗七星，正式的法劍，比桃木劍位階高 |
| **法印／天師印／雷印** | 木或玉的印，蓋在符上才生效，也可直接壓在屍額 |
| **令牌（五雷號令）** | 雷擊棗木製，拍案調兵遣將、召雷 |
| **拂塵** | 掃穢氣、拂開陰障，道士標準配件 |
| **帝鐘（三清鈴）** | 手搖銅鈴，聲音通神、驚醒魂魄 |
| **攝魂鈴／趕屍鈴** | 趕屍匠專用，鈴聲領著屍體走 |
| **墨斗** | 木匠的墨線，彈出的線陰邪不敢過——魯班術，民間極常用 |
| **八卦鏡／照妖鏡** | 照出原形、反彈煞氣 |
| **招魂幡／引魂幡** | 長竿白幡，引魂、也標記屍體歸屬 |
| **桃木釘／七寸釘** | 釘關節、釘棺，定住屍身 |
| **硃砂筆** | 畫符的筆，急用時可直接在屍額點硃砂 |
| **戒刀／柳葉刀** | 隨身短刃，切符紙也切東西 |
| **羅盤** | 尋龍點穴、辨方位陰陽 |
| **鎮屍石／鎮墓獸** | 壓在棺上或墓前，鎮住不讓起屍 |

#### 二、符咒

符是**黃紙＋硃砂**寫的，起首「敕令」，收尾「急急如律令」。

| 符 | 用途 |
|---|---|
| **鎮屍符／定屍符** | 貼額頭那張。殭屍片的招牌，貼上就不動 |
| **五雷符** | 召雷擊，最兇的攻擊符 |
| **鎮宅符** | 貼門楣，一室之內邪不入 |
| **護身符／平安符** | 隨身，擋一次災 |
| **破煞符／驅邪符** | 解已中的煞 |
| **引魂符／招魂符** | 招回離體之魂 |
| **安魂符** | 安撫不肯走的魂 |
| **火符** | 燃起真火，焚屍焚穢 |
| **血符** | 沒硃砂時以指血代寫，效力強但傷身 |
| **符水** | 符燒成灰化入水，喝下去去屍毒、解驚 |

配套咒語（不是物件，寫文案會用到）：**淨心神咒、金光神咒、五雷咒、
掌心雷**。

#### 三、丹藥與藥材

| 物件 | 作用 |
|---|---|
| **糯米** | 拔屍毒。被殭屍抓傷後敷或吃，殭屍片第一藥 |
| **黑狗血** | 破一切邪法，潑上去屍體失效 |
| **公雞血／雞冠血** | 至陽之物，點眼可見鬼、破陰 |
| **童子尿** | 至陽，急用時的替代品 |
| **硃砂** | 既是墨也是藥，鎮驚安神 |
| **雄黃／雄黃酒** | 驅蛇蟲、辟邪，端午飲 |
| **香灰** | 沖水服，止驚；也可撒地畫界 |
| **艾草／菖蒲** | 掛門、燻屋、驅穢 |
| **石灰** | 撒在屍身周圍防腐防走 |
| **硫磺** | 燻、燒，逼退陰物 |
| **金丹（外丹）** | 煉丹爐煉出的長生丹，含汞——吃了也可能出事 |
| **柳枝** | 沾水灑淨，柳為陰木但可淨屋 |

#### 四、法事用品

香爐、三炷香、**長明燈（引路燈）**、七星燈（諸葛亮續命那套燈陣）、
紙錢／冥紙、元寶、白蠟燭、米斗、紅線／紅繩、麻繩、白布（孝布）、
**神主牌（靈牌）**、骨灰罈、棺材釘、**草人（替身）**、生辰八字、
五帝錢、桃符、道袍／法衣、度牒。

### The 9-slot remap — and why it still matters

⚠️ **Written against the *old* structure** (9 dual-purpose cards, one
item each, from [[jiangshi in the pocket plan]]). §3 replaced that with
an open-sized pool, so the *slots* are obsolete — but the **item choices
and the combo logic survive intact**, and they are the best part of it.

The two weak points in the plan's original mapping:

- **火銃 Fire Lance** (3 attack, 2 shots, refuellable) — a firearm is not
  a 道士's tool at all, and was the one off-key note in the set. 七星劍 or
  a 雷擊木令牌 fit better, but neither carries the "two uses then empty,
  and refillable" feel. **The thing that natively has that structure is a
  符**: a stack of **五雷符**, two of them, redrawn with **硃砂** when
  spent. Far more natural than petrol and a lance.
- **火藥 Gunpowder** likewise → **硃砂**, and the lamp combo becomes
  *throw the talisman into the lamp flame → the room burns*. Burning a
  talisman to light it is a standard folk action, not an invention.

| Mechanic | Plan's version | Better |
|---|---|---|
| +1 attack | 竹竿 Bamboo Pole | **桃木橛** (peachwood nail) |
| +1 attack | 鋤頭 Iron Hoe | **墨斗** (ink line — snaps a barrier, and doubles as a lash) |
| +1 attack | 銅錢劍 Coin Sword | 銅錢劍 ✓ |
| +2 attack | 桃木劍 Peachwood Sword | 桃木劍 ✓ |
| +3, 2 uses, refillable | 火銃 Fire Lance | **五雷符** (two talismans) |
| +2 health | 糯米 Sticky Rice | 糯米 ✓ |
| flee unhurt / combo clear | 黑狗血 Black Dog Blood | 黑狗血 ✓ |
| combo clear / refill the above | 火藥 Gunpowder | **硃砂** (draw another talisman) |
| combo catalyst | 長明燈 Altar Lamp | 長明燈 ✓ |

**The three combos become:**
- **符 ＋ 長明燈** → 燒符引真火，滿室焚盡 — burn the talisman in the
  flame, the room goes up
- **黑狗血 ＋ 長明燈** → 血火破法 — blood and fire break the working
- **硃砂 ＋ 符** → 再畫兩張 — redraw two more talismans

All three are things a person in this tradition would actually do, which
petrol-and-a-candle never was.


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

| Category | Where it lives | Count |
|---|---|---|
| **武器 weapons** | Blacksmith ★, Woodshed (in) · Memorial Arch (out) | 3 |
| **符咒 magic** | Sutra Hall ★, Mourning Hall (in) · Bamboo Grove (out) | 3 |
| **丹藥 medicine** | Apothecary, Counting Room (in) · Pagoda Tree (out) | 3 |
| **法器 implement** | **Earth God Shrine (out) — 攝魂幡 only** | 1 |

**The counts came out perfectly symmetric**, which was not planned and
is worth keeping:

> Every category has **two rooms in the village and one place on the
> hill.** 武器 — Blacksmith ★, Woodshed · Memorial Arch. 符咒 — Sutra
> Hall ★, Mourning Hall · Bamboo Grove. 丹藥 — Apothecary, Counting Room
> · Pagoda Tree. And 法器, the banner, exists **only** outside.

That shape says the right thing. Outdoors you can **top up** any
category, but from exactly one tile each — a top-up, not a supply line.
Indoors is where you stock. So *the village is still where you prepare
and the hillside is still where you deliver*, without the hillside being
a barren corridor you can be stranded in.

**The banner being outdoors-only does the real structural work here: it
forces the duelist out of the house.** Before it, a player going for the
midnight fight could arm up indoors and never cross the moon gate — the
burial run was the only reason to go outside. Now the most powerful thing
in the duel is outdoors-only while the swords are indoors, so **both win
paths have to use both halves of the map.**

### Indoor — the village, and the 義莊 at the end of it (10)

| #   | id              | Name             | Exits      | Search | Role                                         |
| --- | --------------- | ---------------- | ---------- | ------ | -------------------------------------------- |
| 1   | `gatehouse`     | 門廳 Gatehouse     | N, E, W          | —      | **Start.** Placed at origin                  |
| 2   | `apothecary`    | 藥鋪 Apothecary    | N          | 丹藥     | dead end                                     |
| 3   | `woodshed`      | 柴房 Woodshed      | N, E       | 武器     | cheap weapons near the start                 |
| 4   | `sutra-hall`    | 經堂 Sutra Hall    | N, W       | 符咒 ★   | the richest magic in the game                |
| 5   | `mourning-hall` | 靈堂 Mourning Hall | N, E, W    | 符咒     | hub                                          |
| 6   | `courtyard`     | 天井 Courtyard     | N, E, S, W | —      | crossroads; the **moon gate** is the way out |
| 7   | `blacksmith`    | 鐵匠鋪 Blacksmith   | N          | 武器 ★   | dead end, richest weapons. Iron is anti-yin  |
| 8   | `counting-room` | 帳房 Counting Room | N, E, W    | 丹藥     | **+1 HP** at turn end                        |
| 9   | `incense-hall`  | 香堂 Incense Hall  | N, E       | —      | restores 1 cower charge, once per run        |
| 10  | `sealed-crypt`  | 停柩房 Sealed Crypt | E, W       | —      | **GOAL A — the tablet**                      |

*Exit density 23/10 = 2.3. Two one-exit rooms (Apothecary, Blacksmith),
one four-exit hub, and a start that branches three ways.*

### Outdoor — the hillside (10)

| #   | id              | Name                 | Edges      | Search       | Role                                    |
| --- | --------------- | -------------------- | ---------- | ------------ | --------------------------------------- |
| 1   | `back-steps`    | 後門石階 Back Steps      | E, S       | —            | **Seam** (N). Set aside at setup        |
| 2   | `dry-well`      | 枯井 Dry Well          | S, W       | —           | hazard — something climbed out |
| 3   | `bamboo-1`      | 竹林 Bamboo Grove      | E, S, W    | 符咒 (commons) | paper and ink among the stems                                  |
| 4   | `memorial-arch` | 牌坊 Memorial Arch     | E, S, W    | 武器 (commons) | filler                                  |
| 5   | `pavilion`      | 涼亭 Pavilion          | E, S, W    | —            | filler                                  |
| 6   | `pagoda-tree`   | 槐樹 Pagoda Tree       | E, S, W    | 丹藥           | **+1 HP** at turn end                   |
| 7   | `stone-ward`    | 石敢當 Stone Ward       | N, E, S, W | —            | the outdoor hub. Stands at the junction |
| 8   | `stream`        | 溪澗 Stream            | E, W       | —            | **running water**                       |
| 9   | `earth-shrine`  | 土地廟 Earth God Shrine | E, S       | 法器            | pray once per run · **the only source of 攝魂幡**                      |
| 10  | `mass-grave`    | 亂葬崗 Mass Grave       | E, S       | —            | **GOAL B — bury the tablet → win 1**    |

*Exit density 26/10 = 2.6. Outdoors stays more open than indoors, as
hedges-vs-walls implies.*

**The nine swaps of 2026-08-22 were renames.** Every slot kept its exits,
its search category and its special. Search coverage is unchanged at
**10 of 20 tiles**; both **+1 HP** tiles survive, one per half.

### The special tiles, and what each is for

**香堂 Incense Hall** (indoor) — **restores one cower charge, once per
run.** With cowering capped at 3 (§1), a charge is the most precious
thing on the board, and a tile that gives one back is a genuine
destination worth a detour. Once per run, because the incense burns out —
a repeatable charge fountain would undo the cap.

**石敢當 Stone Ward** (outdoor) — the outdoor half needed a four-exit hub
to answer the Courtyard, and a 石敢當 is *by definition* the stone set at
a road junction. The four exits are the correct reading of the fiction,
not a compromise with it.

**溪澗 Stream** (outdoor) — **jiangshi cannot cross running water.** The
single best piece of folklore available and it costs nothing to
implement: on this tile, jiangshi events deal **no damage**. It is a real
refuge — and a *sterile* one: no search, no heal, two exits, out at the
edge of the map. Camping there buys safety and nothing else, so a player
who hides at the stream arrives at midnight unhurt, unarmed and
unequipped, which loses the duel. **Safety that doesn't win is exactly
the right shape for a refuge**, and it needs no extra rule to hold.

**土地廟 Earth God Shrine** (outdoor) — **pray: the next unexplored
outdoor tile you place is the Mass Grave.** Once per run.

That last one exists to fix a structural asymmetry, and it is the most
load-bearing tile on the board: **win 2 is passive and win 1 is a
scavenger hunt.** The duel comes to you at midnight no matter what; the
burial requires finding *two specific tiles out of twenty*, in the right
order, across a seam, inside 22 movement turns. Without help, path 1 is
strictly harder in a way that isn't interesting — it's harder because of
draw luck. The shrine converts the back half of that hunt from luck into
a route you can choose to take. The land god knows where the dead are
buried.

### What is deliberately *not* searchable

Gatehouse (you just came through it), Courtyard, Incense Hall, Back
Steps, **Dry Well**, Pavilion, Stone Ward, Stream, and both goal rooms.
**10 of 20 tiles are searchable** — 6 indoors, 4 outdoors — an even split
between supply and transit. The goal rooms aren't searchable because
their *ritual* is their search.

The Dry Well is now pure hazard: two exits, nothing in it, and something
that climbed out. The map wanted at least one place that is only bad to
be in.

### Flavour tensions left by the renames

Mechanically nothing moved, but four slots now want a line of fiction to
justify what they do. None is a design problem; each is one sentence of
theme.text away from settled.

| Tile | Does | Needs to explain |
|---|---|---|
| **帳房** Counting Room | 丹藥 search, **+1 HP** | The Kitchen healed you because it had food. A counting room needs a reason — the clerk's own medicine chest, or tea still warm on the desk |
| **枯井** Dry Well | 武器 search | Fine, once said out loud: a dry well is where a village throws what it wants gone. Tools, blades, the ox's harness |
| **牌坊** Memorial Arch | 武器 (commons) search | The weakest fit. An arch has nothing to rummage — unless offerings and tools are stacked at its foot, which is true of real 牌坊 |
| **槐樹** Pagoda Tree | 丹藥 search, **+1 HP** | The best accident of the nine: 槐花 and 槐米 are genuine materia medica. It heals because it is *literally* a medicine tree |

**One name to reconsider, not for mechanics but for meaning:** 亂葬崗 as
Goal B. Burying a tablet in an *ancestral* grave lays a man to rest among
his family; burying it in the pit for the unclaimed is the opposite
gesture — and is arguably the better story. **He became what he is
because nobody claimed him**, and the tablet is the name being given
back. Worth writing to deliberately, since it changes what winning means.

### Open, and deferred
- **How many items a searchable room holds**, and whether ★ rooms
  (Sutra Hall, Blacksmith) hold more or better — see §3.
- **The two goal-room rituals.** The tablet and the burial were "resolve
  a second card" each; in turn terms the natural translation is one extra
  turn, or one extra event, apiece.
- **Whether one seam is still right.** The Courtyard's moon gate remains
  the only crossing. With 20 tiles that is a hard bottleneck for path 1 —
  the Earth God Shrine softens it, but a second seam (or a one-way gate)
  is worth testing if the bots find the burial win too rare.
- **The map has no tile that is frightening to enter on purpose.** The
  Mass Grave was the palette's candidate for that and is now the goal.
  Optional; the map works without one.

### The full palette — options not yet chosen

Kept so the unpicked ideas survive. Nothing here is in the 20 unless the
Status column says so. Hooks are suggestions, not decisions.

#### 室內 — the hostel and village buildings

| 名稱                                   | What it is                                     | Possible hook                                                                                            | Status                  |
| ------------------------------------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------- |
| ★ **祠堂** Ancestral Hall              | Where a lineage's 神主牌 are kept, rows of them   | The tablet's *home*. Alternative Goal A, or: names the King → an edge in the duel                        |                         |
| ★ **雞舍** Chicken Coop                | Hens and a rooster                             | 雞鳴 ends the night. 公雞血 as an item; or once per run force the cock to crow → one jiangshi event cancelled |                         |
| ★ **紙紮舖** Paper Effigy Shop          | Paper horses, servants and houses, for burning | 替身 paper substitute: takes a hit for you, once                                                           |                         |
| ★ **鐵匠鋪** Blacksmith                 | Forge, tools, iron                             | 武器 search, the best in the game. Iron is anti-yin                                                        | **in the 20** |
| **木工房** Carpenter's Shop             | Saw, adze, 墨斗 ink line                         | 武器 + the ink line; peachwood offcuts                                                                     |                         |
| **藥鋪** Apothecary                    | Drawers of herbs, scales                       | 丹藥 search, the best                                                                                      | **in the 20** |
| **酒坊 / 酒窖** Distillery / Wine Cellar | Jars of rice wine                              | 雄黃酒 realgar wine — drink for HP, or splash it                                                            |                         |
| **屠房** Slaughterhouse                | Blocks, hooks, blood                           | 黑狗血 / 公雞血 source. Grim                                                                                   |                         |
| **豆腐坊** Tofu Workshop                | Stone mill, soaking tubs                       | Quiet and domestic, and wrong at night. 丹藥 or filler                                                     |                         |
| **染坊** Dye House                     | Hanging cloth, vats                            | Cloth everywhere — you cannot see what moves                                                             |                         |
| **穀倉** Granary                       | Sacks, rats                                    | 糯米 sticky rice in quantity                                                                               |                         |
| **地窖** Cellar                        | Below ground, cold                             | Dead end; no exit but the one you came in by                                                             |                         |
| **閣樓** Attic / Loft                  | Stored and forgotten things                    | Dead end, but a rich search                                                                              |                         |
| **書房 / 經堂** Study / Sutra Hall       | Scrolls, scripture                             | 符咒 search                                                                                                | **in the 20** |
| **私塾** Village School                | Desks, a slate                                 | Nothing useful in it — pure transit with atmosphere                                                      |                         |
| **當鋪** Pawnshop                      | Whatever the village pawned                    | Mixed search — one item of any category                                                                  |                         |
| **帳房** Counting Room                 | Ledgers of who is owed what                    | Information: reveals something about the map                                                             | **in the 20** |
| **繡房** Embroidery Room               | A daughter's room                              | Classic ghost-story room. Event-heavy, no items                                                          |                         |
| **馬廄 / 牛棚** Stable / Ox Shed         | Animals that will not settle                   | 武器 (farm tools)                                                                                          | *cut 2026-08-22* |
| **偏廳 / 廂房** Side Chamber             | A spare room                                   | Plain filler, 2–3 exits                                                                                  |                         |
| **水井** The Well                      | The hostel's water, in the courtyard           | Something in it. High-risk event, unique reward                                                          |                         |

#### 室外 — the village and the hillside

| 名稱                           | What it is                                                                 | Possible hook                                                                     | Status        |
| ---------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------- |
| ★ **趕屍路** The Corpse Road    | The 湘西 route corpse-drivers walk the dead home along, by night, with bells | Jiangshi events here are worse — but it leads somewhere. A fast lane with a toll  |               |
| ★ **戲台** Opera Stage         | Village theatre; operas performed *for the dead*, with no living audience  | Something is being performed. Once per run the stage takes an event in your place |               |
| ★ **亂葬崗 / 義塚** Mass Grave    | The unclaimed and unmourned dead                                           | The most dangerous tile on the map, and the richest search                        | **in the 20** |
| ★ **石敢當** Stone Ward         | Inscribed stone set at a junction to block evil                            | A refuge that wards rather than blocks — no jiangshi event fires here, once       | **in the 20** |
| ★ **槐樹** Pagoda Tree         | 鬼樹 — said to gather ghosts                                                 | Bad things concentrate. High event severity, no search                            | **in the 20** |
| **城隍廟** City God Temple      | The god who judges the dead                                                | Big shrine: reveals the King's weakness, or restores cower charges                |               |
| **山神廟** Mountain God Shrine  | Smaller, rougher                                                           | Navigation, like the Earth God Shrine                                             |               |
| **破廟** Ruined Temple         | Roof gone, statue faceless                                                 | Shelter that isn't. 符咒 search, but the event fires twice                          |               |
| **石橋** Stone Bridge          | Over the stream                                                            | Running water beneath — a second safe crossing, or the only way over              |               |
| **水車** Waterwheel            | Turning by itself                                                          | Running water, plus noise that covers your breath                                 |               |
| **水塘** Pond                  | Still water, not running                                                   | Looks safe, isn't. The trap version of the Stream                                 |               |
| **枯井** Dry Well              | No water left in it                                                        | Something climbed out                                                             | **in the 20** |
| **稻田 / 田埂** Rice Paddy       | Flooded fields, narrow bunds                                               | Slow going: costs the turn but moves you only one tile, ever                      |               |
| **菜園** Vegetable Garden      | Household plot                                                             | 丹藥 filler                                                                         |               |
| **柴垛** Woodpile              | Stacked firewood                                                           | Cheap 武器 — poles and axes                                                         |               |
| **豬圈** Pigsty                | Pigs that have gone quiet                                                  | The quiet is the tell                                                             |               |
| **牌坊** Memorial Arch         | Stone arch at the village edge                                             | A boundary — marks the far side of the map                                        | **in the 20** |
| **松柏林** Pine & Cypress Grove | Graveyard trees                                                            | Filler with the right mood; could replace a Bamboo Grove                          |               |
| **墳山** Grave Hill            | The slope the graves are cut into                                          | Approach to the Ancestral Grave — a foothill that signals you are close           |               |
| **三岔路口** Crossroads          | Where offerings are burned and spirits gather                              | Four exits — the outdoor hub, better themed than a threshing floor                |               |
| **渡口** Ferry Landing         | Where the river is crossed                                                 | Running water; a one-way crossing to the far bank                                 |               |
| **曬穀場** Threshing Floor      | Open drying ground                                                         | The outdoor hub                                                                   | *cut 2026-08-22* |

#### Five swaps worth considering against the current 20
1. **三岔路口 Crossroads** replaces **曬穀場 Threshing Floor** as the
   outdoor hub — same four exits, far better fiction. Burning offerings
   at a crossroads is exactly where you would meet something.
2. **雞舍 Chicken Coop** into the indoor set. Cockcrow is *the* thing
   that ends a jiangshi night; a once-per-run "cancel one attack" is
   thematically unbeatable and mechanically clean.
3. **亂葬崗 Mass Grave** as an outdoor high-risk / high-reward tile. The
   map currently has no place that is *frightening to enter on purpose*,
   and a game about scarcity needs one.
4. **祠堂 Ancestral Hall** as an indoor tile that names the King —
   feeding whatever his abilities turn out to be, and giving the tablet
   somewhere to belong.
5. **趕屍路 Corpse Road** if a fast lane with a toll is wanted. The one
   idea here that changes *routing* rather than decorating it.

---

## 5. 殭屍王 The King — strength 12, one strike ✅ DECIDED 2026-08-23

**One attack. Win and the night is yours; lose and you are dead.**

```
threshold = 12          # 11 if you are carrying the 神主牌
if  Attack >= threshold  ->  sealed, you win
else                     ->  he takes you, you lose
```

No rounds, no beats, no damage number, no health arithmetic. Strength 12
is a **threshold**, not a damage stat. Thirty turns of scavenging come
down to one number and whether you got it to 12.

### The two kits that reach 12

Attack is `(sword × 2 if 攝魂幡) + talisman`, so:

| Kit | Working | Attack | Seals at 12 | Seals at **11** (tablet) |
|---|---|---|---|---|
| 七星劍 + 真火符 + 攝魂幡 + 血符 | (3+1) × 2 + 5 | **13** | ✅ | ✅ |
| 七星劍 + 真火符 + 攝魂幡 + 五雷符 | (3+1) × 2 + 4 | **12** | ✅ | ✅ |
| 七星劍 + 攝魂幡 + 血符 — no 真火符 | 3 × 2 + 5 | **11** | ✗ | ✅ |
| **銅錢劍 + 真火符 + 攝魂幡 + 血符** | (2+1) × 2 + 5 | **11** | ✗ | ✅ |
| 七星劍 + 攝魂幡 + 五雷符 | 3 × 2 + 4 | 10 | ✗ | ✗ |
| 七星劍 + 真火符 + 攝魂幡 — no talisman | 4 × 2 | 8 | ✗ | ✗ |
| 七星劍 + 真火符 + 五雷符 — no banner | 4 + 4 | 8 | ✗ | ✗ |

**Every piece is load-bearing**, and the tablet is worth exactly the two
lines that miss by one. Note the fourth row: **with the tablet you no
longer need 七星劍 at all** — a 銅錢劍 will do, and that is the wider of
the two gates opened.

**The banner is the one thing nothing substitutes for.** Every line that
reaches 11 spends it.

### What the gate costs

| Piece | Source | Odds |
|---|---|---|
| **七星劍** | 武器 rooms — Blacksmith ★, Woodshed, Memorial Arch | **15 %, unique** |
| **攝魂幡** | 土地廟 only, outdoors, past the moon gate | **15 %, unique** |
| 真火符 | any 符咒 room | 30 %, unlimited |
| 五雷符 / 血符 | any 符咒 room | 20 % each, unlimited |

**Two unique items from opposite halves of the map**, plus two common
talismans — or, **carrying the tablet, only the banner is truly
compulsory.** The banner is therefore the tightest gate in the game: one
tile, outdoors, 15 %, and nothing else does its job.

### 鎮屍 — what the win looks like

You do not kill him. His blow meets Attack 12 and lands on nothing; he
loses his footing, and in that opening the paper goes on his forehead. He
stops mid-hop. Nobody destroys a 殭屍王 — you put him back.

### 不渡活水 — the Stream, and declining

Standing on **溪澗 Stream** when turn 30 ends, **he does not come.**
Running water; he will not cross it. You live, and you cannot seal him,
because nothing happens at all. If the tablet is already buried you have
won regardless — if it isn't, you merely saw the night out.

That makes **where you stand on the last turn a decision you plan for**,
using a tile rule that already existed, and gives a failed burial run a
dignified out: walk to the water and live.

### What the simplification costs, and what it buys

**He has no abilities, and that is now the design.** An earlier draft gave
him three beats, **僵直** (a stiff first blow), **屍毒** on contact, and a
once-per-night **held breath**. All of it is gone — a single binary
exchange has nowhere to put a passive, a phase or a counter. **黑狗血 is
explicitly barred** from the duel as well; there is no escaping him.

The trade is worth it:
- **Zero ambiguity.** No turn order, no simultaneous-death edge case, and
  the question that was blocking progress — *what if you survive all three
  beats without sealing?* — becomes unaskable.
- **The drama moves to the build-up, which is where the game lives.**
  Thirty turns of assembling a kit; the exchange is the verdict, not the
  contest. That suits a game whose whole texture is scarcity.
- **One comparison to implement, one sentence to teach.**

Three consequences to carry forward:

**1. ⚠️ Health no longer affects the duel at all.** Cowering, medicine,
the healing tiles — none of it touches the outcome. They matter only for
*surviving to* turn 30. A duelist therefore optimises purely for four
items and for staying alive on the way, which is a coherent but quite
different build from the burial runner's.

**2. ⚠️ 屍毒 is orphaned again.** It was to come from his touch; with no
contact phase, 糯米's cure mode has nothing to cure. **The poison must now
come from the event pool** — a jiangshi attack that poisons instead of
wounding.

**3. The outcome is knowable in advance.** By turn 20 a player without the
sword *knows* the duel is closed. That is good clarity while the burial is
still live, and dead air once it isn't. The burial fallback and the Stream
decline both cover it, but **the UI should show whether the duel is still
reachable** rather than letting someone discover their night ended ten
turns ago.

### The held breath — re-home it in the event pool

Worth keeping as an idea even though the duel can't hold it. Jiangshi are
blind and hunt by breath; **standing still and holding your breath to let
one pass** is a real folk motif and a natural option to attach to an
ordinary jiangshi event. Noted for the event-pool work.

### Rejected alternatives, kept on the record

**Variant A-with-beats** — three beats of the drum, each answered with an
item; 僵直 softening the first; 屍毒 on contact; the seal fired by
surviving a beat at zero damage. Superseded by the one-strike rule.

**Variant B — 血戰, he has health.** The King as an *opponent* rather
than a threshold: **Attack 8, Health 10**, no 僵直, and you win by
emptying him over several rounds while he empties you. Its appeal was a
much wider spread of viable kits — even 戒刀 + 五雷符 + 血符 totalled
exactly 10 — and a clear "steel alone isn't enough" message. Its costs
were that **turn order became load-bearing** (exact-kill lines are common,
and simultaneous resolution kills both), and that **鎮屍 — the genre's
signature image — has nothing to attach to** when there is a health bar to
empty instead.

*(Recording this properly because I dropped the original Variant B
section by accident in an earlier edit. Kept in brief: it is the only
version with an actual fight in it, and worth revisiting if a single
binary check turns out to feel flat as a finale.)*

### Open on the King
- **Is one binary exchange satisfying as a finale?** It is clean, and it
  suits the game — but it is the entire climax resolved in a single
  comparison, with no play in it. Bots cannot answer this; only a person
  can. Variant B is the fallback if it lands flat.
- **Does the sword-plus-talisman rule apply to ordinary fights too?**
  Read as **yes** — a general combat rule, not a duel exception. That is
  the assumption the event pool must be built against.
- [x] **Carrying the tablet lowers the threshold to 11** — decided
  2026-08-23. See §7 for why.

## 6. The event pool — ✅ designed 2026-08-23

One draw per turn, from the band the turn falls in. Every entry totals
100 %.

| | 9 PM · turns 1–10 | 10 PM · turns 11–20 | 11 PM · turns 21–30 |
|---|---|---|---|
| **僵屍 3** | 15 % | — | — |
| **僵屍 4** | 25 % | 25 % | 20 % |
| **僵屍 5** | — | 15 % | 20 % |
| **僵屍 6** | — | — | 20 % |
| **−1 HP** | 10 % | 10 % | 10 % |
| **+1 HP** | 10 % | 10 % | — |
| **Nothing** | 20 % | 20 % | 10 % |
| **中毒 poisoned** | 10 % | 10 % | 10 % |
| **村民受傷 wounded villager** | 10 % | 10 % | 10 % |

**村民受傷** — a villager is hurt. Spend a **糯米** to save them and take
their gift; refuse, or have no rice, and they turn:

| Band | Saved → you get | Refused → you fight |
|---|---|---|
| 9 PM | **護身符** — all damage you take −1 | 僵屍 4 |
| 10 PM | **真火符** | 僵屍 5 |
| 11 PM | **五雷符** | 僵屍 6 |

### The villager is the best thing in this design

It is the only event that is a **decision** rather than an outcome, and
everything about it earns its place:

- **The cost is real and it hurts.** 糯米 is the game's main heal (+3) and
  the only cure for poison. Spending one on a stranger is a genuine
  sacrifice, not a button.
- **Refusing is not free.** The villager becomes the band's *worst*
  jiangshi. So it is not "help or move on", it is "pay, or fight the
  thing they turn into" — which is exactly the folk-horror bargain.
- **🎯 The rewards are the duel components.** 真火符 and 五雷符 are two of
  the four pieces the seal needs (§5). So **saving villagers late is a
  route to the endgame kit**, parallel to searching for it. A player who
  keeps rice in reserve for the 11 PM band is playing for the duel
  whether they know it or not. That is a beautiful piece of accidental
  structure — two systems designed separately that turn out to feed each
  other.
- **The escalation reads correctly**: a charm early, a talisman at ten, a
  thunder talisman at eleven. Later villagers are worth more, and later
  refusals cost more.

### 糯米 now carries three jobs at once

This is the item the whole economy pivots on:

| Use | Worth |
|---|---|
| Eat it | **+3 HP**, capped at 10 |
| Cure 中毒 | the only cure in the game |
| Save a villager | a 護身符 / 真火符 / 五雷符, and avoids a fight |

**Three good uses, one item, 40 % of a medicine search.** That is the
strongest tension in the design so far, and it is created entirely by
overlap rather than by a rule.

### 🆕 護身符 — a thirteenth item, and a strange one

**All damage you take −1**, presumably permanent and occupying a slot. It
is not in any search table: **the only way to get it is the 9 PM
villager**, which means the only window is turns 1–10, and you must
already be holding rice.

Two things follow:
- **It is probably the strongest defensive item in the game.** In the
  11 PM band, at Attack 2, roughly 70 % of draws are a fight — so −1 on
  each is worth about 0.8 HP a turn, or ~8 HP across the last band, on a
  10 HP cap. Plus it zeroes the −1 HP events outright.
- **And it is only available before you are likely to have rice.**
  Medicine searches are what produce 糯米, and turn 1–10 is when you are
  still finding your feet. So it is a **prepared-early, paid-late**
  reward, which is a good shape — but check with the bots that it is
  reachable often enough to matter, and not so strong that the run
  divides into "got the charm" and "didn't."

### Danger by band — expected HP lost per turn

Assuming the villager is always refused, ignoring poison (its effect is
still undefined), damage = `clamp(N − Attack, 0, 4)`:

| Sustained Attack | 9 PM | 10 PM | 11 PM |
|---|---|---|---|
| **0** — bare-handed | **1.85** | **2.00** | **2.90** |
| 1 — 戒刀 / 桃木劍 | 1.35 | 1.60 | 2.60 |
| 2 — 銅錢劍 | 0.85 | 1.25 | 2.30 |
| 3 — 七星劍 | 0.35 | 0.75 | 1.60 |
| **4** — 七星劍 + 真火符 | **0.00** | **0.25** | **0.90** |

Four things this table says, all of them good:

**1. Bare-handed is lethal, fast.** ~1.85 HP a turn against a 10 HP cap
means about six turns to live. **Finding a weapon is not optional**, and
the game says so in the first band without a single word of tutorial.

**2. The sustained ceiling is Attack 4, and 11 PM is calibrated exactly
against it.** 0.9 a turn over ten turns is ~9 HP against a cap of 10 —
the best-equipped possible player *just* survives the last band on
healing. That is a remarkably tight fit, and it means the 11 PM band is
correctly lethal for everyone below the ceiling.

**3. The escalation matches the source's shape.** Fights go 40 % → 40 %
→ **60 %** (70 % counting refused villagers), sizes climb 3–4 → 4–5 →
4–6, and the +1 HP relief **disappears entirely at eleven**. Spec §3's
deliberate curve — more fights, bigger fights, comfort drying up — is
preserved without copying a single number.

**4. Constraint P1 is comfortably satisfied.** Camping a +1 HP tile
yields +1 a turn against 2.3 (Attack 2) or 2.9 (bare) in the last band.
Standing still to heal is clearly losing, so the healing tiles need no
extra brake.

### Where this leaves the sword-plus-talisman worry

Adding a talisman on top of a sword lifts Attack well past the ceiling —
but **only for one turn each**, and the table above is *sustained* attack.
So the add rule buys **emergency coverage, not immunity**: you can blank
the worst draw of a bad stretch, a handful of times a night. That is a
much healthier read than the earlier concern that the 10 and 11 PM bands
would be walked through, and it means the pack sizes above do not need
re-scaling.

### 中毒 corpse-poison — ✅ decided 2026-08-23

> **−1 HP every turn, until a 糯米 draws it out.** Nothing else cures it.

An open-ended bleed with a single, contested cure. Three things follow,
and the third is the interesting one.

**1. Poison is not survivable if ignored.** At 10 % a turn you are
poisoned around turn 10 on average; left alone from there it costs
**~20 HP** by midnight, against a cap of 10. There is no riding it out —
it is a **forcing function**, and its whole job is to make you spend rice.

**2. It roughly doubles the cost of a bad stretch.** On top of the band
damage from §6:

| At Attack 2 | clean | poisoned |
|---|---|---|
| 9 PM | 0.85 /turn | **1.85** |
| 10 PM | 1.25 /turn | **2.25** |
| 11 PM | 2.30 /turn | **3.30** |

Poisoned and under-armed in the last band is ~3 turns of life. Being
poisoned at 1 HP is death next turn unless you already hold rice.

**3. ⚠️ Poison and the villager now fight over the same item — and
poison has the louder claim.** This is the real consequence. 糯米 was
already carrying three jobs; now one of them is *urgent* and the others
are merely valuable:

| Claim on your 糯米 | Urgency |
|---|---|
| Cure 中毒 | **immediate** — it bleeds until you do |
| Save a villager (→ 真火符 / 五雷符) | can be declined, at the cost of a fight |
| Eat it for +3 | whenever |

So the "villagers are a second route to the duel kit" structure that §6
looked so good for is **partly undercut**: a poisoned player cannot
afford to give rice away, and by the 11 PM band — where the villager
carries a 五雷符, an actual seal component — they will usually be
poisoned. **Check this with the bots**; if the villager reward turns out
to be almost never collected, the elegant part of §6 is decorative.

### 毒不算傷害 — the charm does not stop it ✅ decided 2026-08-23

**Poison is not damage.** 護身符 takes 1 off every *wound*; the bleed goes
right through it. Rice is the only answer, all night, every time.

I had argued the other way — that the charm should be immunity, because it
chains beautifully: save the 9 PM villager, take the charm, never pay the
poison tax again, spend every later rice on villagers. **The ruling is the
better game, and it is worth saying why.**

That chain was elegant, but it **resolved the tension on about turn five**.
One good decision early and the rice question was answered for the rest of
the night. With the poison tax permanent, **every villager is a fresh hard
choice** — you are never done deciding, because the bleed can always come
back and the rice is always the only cure. A dilemma you keep facing beats
a puzzle you solve once.

### 🍚 So: what the rice economy actually looks like

**Demand, across a night:**

| Claim | Roughly |
|---|---|
| Curing 中毒 (10 % a turn, non-stacking) | **~3 rice** |
| Saving all three villagers | **3 rice** |
| Healing (+3, capped at 10) | whatever is left |

**Supply:**

| Source | Roughly |
|---|---|
| Starting pack | **3** |
| 丹藥 searches — 40 % of a search, at 藥鋪 · 帳房 · 槐樹 | a few more |
| Villager gifts | none (they give charms and talismans) |

So the rice ledger is **contested but not hopeless**: demand ~6, supply 3
plus whatever the medicine tiles give up. **You cannot do everything, and
you can do a good deal**, which is where a resource economy wants to sit.

Two consequences to hold:
- **The 丹藥 tiles quietly become strategic.** They are the only tap, and
  two of the three are indoors (藥鋪, 帳房) with 槐樹 the lone outdoor one.
  A player who crosses the moon gate with no rice in hand has one source
  on the far side.
- **護身符 is weaker than it looked, and that is fine.** Still worth ~8 HP
  across the last band on wounds alone. It is a good reward, no longer an
  era-defining one.

### Still open on events
- [x] **中毒 does not stack** (decided 2026-08-23) — a state, not a
  counter. A poison draw while already poisoned does nothing.
- [x] **護身符 does not stop it** (decided 2026-08-23) — **poison is not
  damage.** The charm reduces wounds only. The poison tax is permanent and
  rice is the only answer to it.
- **Start or end of turn?** Start reads better: you wake worse than you
  went to sleep, and it means being cured the same turn you are poisoned
  costs you nothing, which rewards holding rice.
- **Poison at midnight is now irrelevant** — the duel is a threshold on
  Attack, not on health (§5). One fewer edge case.
- **Can the villager be saved with anything but 糯米?** Rice is
  thematically exact — it draws out corpse-poison, which is the same
  thing it does for you — so probably not.
- **Is the same event allowed twice a night?** Drawn with replacement,
  presumably; the pool is a distribution, not a deck.
- **Where the held breath goes** — proposed in §5 as an option on a
  jiangshi draw: stand still, hold your breath, let it pass. Would give a
  third answer alongside fight and flee.

## 7. The two wins — how they relate ✅ designed 2026-08-23

### They are not two routes to the same thing. They spend different currencies.

| | **下葬 The burial** | **鎮屍 The seal** |
|---|---|---|
| You need | Three specific **tiles** — 停柩房, 天井, 亂葬崗 — and the turns to walk between them | Four specific **items** — 七星劍, 真火符, 攝魂幡, an attack talisman |
| Paid in | **MOVE** turns — exploration and routing | **STAY** turns — searching and re-searching |
| Luck is in | the tile stacks | the search rolls |
| Health matters | throughout: you carry the tablet across the map | only to reach turn 30 |
| Resolves | **whenever you get there** | **exactly at turn 30** |
| Helped by | 土地廟's prayer reveals the grave | villagers hand you 真火符 and 五雷符 |

That is the real distinction, and it is a good one: **one win is about
knowing the map, the other about knowing the tables.** They compete for
the same 30 turns, but through opposite verbs — every turn spent standing
still to search is a turn not spent finding the grave.

### ⚠️ The structural asymmetry: the burial can end the night early

The burial wins **the moment you finish the rite**. The seal cannot happen
before turn 30. So a player holding both options takes the burial, and
that makes the seal — on paper — the fallback rather than the equal.

**Framing that honestly, and correctly:** the burial is the win you
**plan**, the seal is the win the night **gives** you. That is a fair
division and it does not need fixing with a rule. What it does need is
for the seal not to be *strictly* harder, which brings us to the numbers.

### ⚠️ The seal is currently the much harder win

Rough turn costs, and this is the part to check with bots:

**Burial** — reveal indoor tiles until 停柩房 turns up (~6 tiles), walk
back to 天井, cross, then find 亂葬崗 among the outdoor stack (~6 tiles,
or immediately with the shrine's prayer). Call it **turn 20–25** on an
ordinary night, tight but ordinary. Three tiles must appear, and the
Courtyard is a hard dependency — **without 天井 there is no outdoors at
all**, so a bad indoor stack can shut the burial down completely.

**Seal** — the two uniques are the whole problem:

| Piece | Expected searches | Where |
|---|---|---|
| 七星劍 at **15 %** | ~7 | 鐵匠鋪 / 柴房 / 牌坊 |
| 攝魂幡 at 15 % | ~7 | 土地廟 only, outdoors |

**Both raised to ~7 searches each** by the 2026-08-23 change to the sword,
so ~13 STAY turns out of 30 rather than ~17 — plus finding those tiles,
travel, and the damage taken standing still. The villagers hand over
真火符 and 五雷符 free, which is what makes the rest affordable.

**And the tablet rule cuts it further**: carrying the 神主牌, the sword
requirement drops to 銅錢劍 (25 %), leaving **the banner as the only
genuinely scarce thing the seal needs.** That is the difficulty gap
closed without a third tuning pass.

Remaining knobs if the bots still find it too rare: **攝魂幡 to 20–25 %**,
or let 硃砂 duplicate a found banner.

### 🎯 ✅ ADOPTED 2026-08-23 — the tablet lowers the threshold to 11

The tablet used to do nothing at midnight, and the two wins never
touched. **Now: carrying the 神主牌 when he comes drops the seal threshold
from 12 to 11.**

You are holding his **name**. A jiangshi that hears its own name loses a
moment — that is the folklore, and it is exactly one moment's worth of
advantage.

Look at what it does to the near-miss table from §5:

| Line | Attack | Without tablet | **With tablet** |
|---|---|---|---|
| 七星劍 + 攝魂幡 + 血符 — no 真火符 | 11 | ✗ | **✅ seals** |
| **銅錢劍 + 真火符 + 攝魂幡 + 血符** — no 七星劍 | 11 | ✗ | **✅ seals** |
| 七星劍 + 真火符 + 攝魂幡 + 五雷符 | 12 | ✅ | ✅ |

**Both "short by exactly 1" lines become live** — including the one that
does not need 七星劍 at all, which is the tighter gate. Three things this
buys:

- **A failed burial stops being wasted.** You found the tablet, you could
  not reach the grave, and the thing in your hands turns out to be worth
  something anyway. That is a far better story than carrying a useless
  MacGuffin to your death.
- **The two paths converge instead of merely competing.** Half a burial
  plus most of a kit is a win, which is how a two-win game should behave.
- **It quietly fixes the difficulty gap** without touching a probability:
  the sword requirement can be dropped by the player who did the map work
  instead.

The cost is one line of engine code and one number.

### The four outcomes

| Outcome | How | Feels like |
|---|---|---|
| **Win — 下葬** | Finish the rite at 亂葬崗 holding the tablet | He was given a name and put back. Quiet, and nobody knows |
| **Win — 鎮屍** | Meet his strike with Attack 12 (11 with the tablet) | You faced him and pinned him |
| **Survived** | Standing on 溪澗 Stream at the end of turn 30 | You lived. He is still out there |
| **Death** | Health 0 at any point, or turn 30 under the threshold | — |

The third one matters: **"survived" is not a win and not a loss**, and it
is the only outcome the player chooses deliberately. Walking to the water
is admitting the night beat you and deciding to see morning anyway. Worth
its own verdict card and its own line.

### What the epilogue needs

`epilogue.js` composes one sentence from fragments (§*Bilingual* note —
this is also the file that resists translation). Four openings now:

| | Fragment shape |
|---|---|
| 下葬 | *"…and the tablet back in the ground where it belongs"* |
| 鎮屍 | *"…and the paper on his forehead before the drum stopped"* |
| Survived | *"…standing in the water while the third watch passed"* |
| Death | existing shapes carry over |

And two run facts worth composing in, because they are the ones a player
would mention when describing the night: **whether a villager was saved**,
and **whether the rice ran out.**

### 🤫 鎮屍 is a hidden ending — ✅ decided 2026-08-23

**The burial is the game's stated goal. The seal is not advertised
anywhere, and it is not presented as the better ending.**

Those are two separate rulings and both matter:

- **Hidden** — nothing tells the player it exists. Not the letter, not the
  menu, not the store copy. It takes commitment and luck to reach, and
  finding out it was possible is part of what it is.
- **Not ranked** — no "true ending", no extra tier, no grander verdict
  card. It is simply another way the night ended. A game about a corpse
  hostel can quite reasonably hold that **putting a man back in the ground
  is the better act**, and the confrontation is just the rarer one.

### What that constrains

| Surface | Ruling |
|---|---|
| **The first-run letter** | Teaches the **burial only** — where the tablet is, where it goes, and that the night is short. No mention of the King as anything but a deadline |
| **The player-facing rulebook** (`rulebook.html`) | Describes what happens at midnight — he comes, and he is beyond you — **without laying out the recipe.** No Attack-12 table, no kit list |
| **This vault rulebook** | Keeps everything. It is the build document, not a player document — worth being explicit that the two now diverge |
| **Epilogue lines** | **Same register, same length** for both wins. The seal's sentence must not be written grander than the burial's |
| **Tally / "the house remembers you"** | Counts it once achieved; never displays it as a higher score, and shows nothing about it beforehand |
| **SEO, OG copy, JSON-LD, landing page** | All describe the burial. A hidden ending in the marketing copy is not hidden |

### ⚠️ But a hidden ending still has to be *findable*

This is the real problem the ruling creates. To stumble into the seal a
player must survive to turn 30 **and** happen to be holding Attack ≥ 11 —
and turn 30 normally kills you. Left alone, almost nobody ever discovers
it, and an ending nobody finds is the same as an ending that isn't there.

**The fix is the death screen.** When he takes you at midnight, show the
comparison:

```
        your attack   6
        needed       12
```

No explanation, no hint text. A player who dies at midnight learns that
**there was a number**, and that is enough — the next run they are
looking. That is the whole of the discovery design: one honest line on the
verdict card that reveals a mechanic without teaching it.

Two softer routes toward it that already exist, and are worth leaving as
the quiet trail:
- **The villagers hand you 真火符 and 五雷符**, which are only really
  *for* this. A player who collects them and never learns why has been
  handed half the answer.
- **The 攝魂幡** does nothing an ordinary fight needs — its whole
  description is about doubling a blow, and it is hidden behind the moon
  gate at one tile. Finding it invites the question.

### The game never explains itself — ✅ decided 2026-08-23

**The threshold is never openly displayed. Not before, not after, not
ever.** Sealing him once unlocks nothing: no achievement text, no "now
you know", no HUD readout, no spoiler section appended to the rulebook.
The tally counts the ending and says nothing about how it happened.

So the **death-screen comparison is the only place the number ever
appears in the entire game**:

```
        your attack   6
        needed       12
```

That makes one line load-bearing. If it ever gets cut for being too
explicit, discovery dies with it — so it should be treated as a rule of
the design rather than a piece of UI copy.

Two things follow, and the second is the good one:

- **A player who seals him may not fully know why**, beyond what they
  happened to be carrying. That is acceptable: the death screen taught
  them the number, and the kit was in their own hands. The game trusts
  them to have noticed.
- **The knowledge lives in players, not in the interface** — which means
  it gets passed along rather than looked up. For a small web game that is
  a feature: a secret the game will not explain is something to talk about
  with someone else who has played it. The community becomes the
  documentation, which is exactly what happened with the source game's own
  forum rulings.

### Open
- **Can you bury the tablet and then still be attacked at turn 30?** No —
  the burial ends the run immediately. Worth confirming that is wanted,
  since it means a turn-12 burial skips two thirds of the game.

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
- 2026-08-22 — **full tile palette recorded** at the end of §4: 21 indoor
  and 22 outdoor candidates drawn from 義莊 architecture, village trades
  and jiangshi folklore, each with a suggested hook, none chosen. Five
  swaps flagged against the current 20 — Crossroads for Threshing Floor,
  and Chicken Coop (cockcrow), Mass Grave, Ancestral Hall and Corpse
  Road as additions.
- 2026-08-22 — **nine tile swaps applied to §4, as renames only.** Indoor:
  Washing Room→藥鋪 Apothecary, Priest's Cell→經堂 Sutra Hall, Coffin
  Store→鐵匠鋪 Blacksmith, Kitchen→帳房 Counting Room. Outdoor: Ancestral
  Grave→亂葬崗 Mass Grave, Threshing Floor→石敢當 Stone Ward, Bamboo-2→
  牌坊 Memorial Arch, Ox Shed→枯井 Dry Well, Herb Terrace→槐樹 Pagoda
  Tree. **Every slot keeps its exits, search category and special** —
  search coverage stays at 10 of 20, both +1 HP tiles survive, one per
  half. (First pass wrongly imported the palette's suggested hooks and
  rewrote four slots' mechanics; corrected same day.) Left behind: four
  slots whose fiction now has to justify their function — the Counting
  Room healing, the Dry Well and Memorial Arch holding weapons — and one
  happy accident, 槐樹, which heals because 槐花/槐米 really are materia
  medica. Also noted that 亂葬崗 as Goal B changes what the win *means*:
  he became this because nobody claimed him, and the tablet is the name
  given back.
- 2026-08-22 — **門廳 Gatehouse opened up: N → N, E, W.** The start is now
  a three-way junction rather than the original Foyer's single stem.
  Indoor exit density rises 2.1 → 2.3 and one-exit rooms drop from three
  to two. Effects: the house **fans out from turn 1** instead of
  threading, which helps path 1 against a 22-move budget; the classic
  "one-exit room placed on top of the start" box-in disappears; and the
  Gatehouse becomes a junction you pass back through rather than a
  terminus. Runs with the grain of the source — the designer's own v1.75
  hard-mode variant gives the Foyer a second door; this goes one further.
- 2026-08-22 — **[[jiangshi in the pocket - rulebook]] created**: the
  playable rules as they stand, with the full 20-tile map written up as
  two prose tables. Marked throughout — ✅ settled, ⏳ not yet designed,
  📐 inherited — so the three undesigned pools (events, items, the King)
  are visibly holes rather than silently thin.
- 2026-08-22 — **bilingual support added to the TODO**: English and
  繁體中文 both first-class. Noted that the zh-TW text is arguably the
  original here rather than a translation, and that `epilogue.js` is the
  one place where the existing architecture actually resists it — it
  assembles a sentence from fragments, so it needs per-language assembly
  rather than a second string table.
- 2026-08-23 — **道士 kit research folded into §1's item-pool section**:
  four reference tables (法器/武器, 符咒, 丹藥/藥材, 法事用品) plus the
  9-slot remap. Two notes worth keeping: the tradition's own four
  categories **already match the map's search types** one-to-one, and the
  plan's 火銃/火藥 pairing should become **五雷符 ×2 refilled with 硃砂**
  — a stack of talismans is natively "two uses, then redraw," which is
  what the fire-lance was awkwardly imitating. The remap's slots are
  obsolete under the open-sized pool, the item choices and combos are not.
- 2026-08-23 — **11 items designed**: 4 swords (absolute attack 1/1/2/3),
  4 talismans (one-use attack bursts + 硃砂 as the restock), 3 medicines.
  Six knock-ons recorded, two of them real: **血符 is strictly worse than
  七星劍 for an armed player** — its 2 HP cost cancels its +2 attack
  exactly, and the damage clamp makes it worse still, so it is an
  emergency card for the *unarmed* rather than the top of the ladder; and
  **糯米's cure mode introduces 屍毒 poison**, a status nothing in the
  design can currently inflict, which implies a poisoning attack in the
  event pool and a small status system to hold it. Also inferred that
  **base attack must now be 0**, since 戒刀 at 1 would otherwise equal
  bare hands.
- 2026-08-23 — **two item revisions.** 真火符's sword buff is **additive
  and permanent** (戒刀 1 → 2), and **血符 costs 1 HP, not 2**. The
  second fixes the flaw flagged earlier: at 2 HP the cost exactly
  cancelled the +2 attack, at 1 HP it is a genuine upgrade against packs
  of 5–7, break-even at 4 and 8, and dead weight at 9+ where the clamp
  flattens both. Two new notes: **血符 and 五雷符 are now nearly the same
  card** and must be separated by rarity rather than effect; and
  **七星劍 + 真火符 = attack 4 permanently**, which with 硃砂 (真火符 ×3)
  reaches **attack 6** — the game's best line, gated by slot pressure and
  three specific finds. Confirm it is intended, and whether one sword can
  take multiple 真火符.
- 2026-08-23 — **backpack expanded 2 → 6 slots.** Big shift in what the
  game is about: with 11 items designed, a full pack is over half the
  contents, so the "which two do I keep" squeeze largely disappears and
  the tension moves entirely onto **finding** things. Fits the 道士
  fiction (a priest carries a kit) and fits the three categories at ~2
  each. Two consequences flagged: the **attack-6 line is no longer gated
  by slot pressure** — you just carry 七星劍 + 真火符 + 硃砂 and press the
  button — and the **King's numbers must assume a fully-equipped player**,
  not a player who had to choose. Whether 6 ever binds depends on the
  search miss rate; if a run only finds 4–5 items, 6 slots is effectively
  no limit.
- 2026-08-23 — **攝魂幡 added** (one use: next attack ×2), the game's
  first multiplicative effect and so far its only 法器. The damage clamp
  makes it near-worthless in ordinary fights and decisive against
  something large, so it is **naturally a boss item** — save it for
  midnight — which is a good decision to hang on an object. It also sets
  a hard constraint on the still-unwritten King: a prepared player can
  present **attack 10–12**, so a strength anywhere near the earlier 5–7
  proposals gets zeroed. Note that "next attack" covers exactly **one
  round**, which is an argument for keeping the duel multi-round.
  Suggested home: a unique find in 靈堂 Mourning Hall, where a 引魂幡
  would actually stand.
- 2026-08-23 — **search types re-cut.** 枯井 Dry Well 武器 → 丹藥, 竹林
  Bamboo Grove 武器 → 符咒, and 土地廟 Earth God Shrine becomes searchable
  as the **sole source of 攝魂幡**. Counts are now 武器 3 / 符咒 3 / 丹藥 4
  / 法器 1, and searchable tiles rise 10 → **11 (6 in, 5 out)**. This
  fixes two things at once: the hillside is no longer a resupply-free
  gauntlet, and — because the banner is outdoors-only while the swords are
  indoors — **both win paths must now use both halves of the map.** Magic
  is no longer indoors-exclusive, though the ★ (經堂) still is.
- 2026-08-23 — **枯井 Dry Well reverted to no search**, leaving it a pure
  hazard tile. Final counts 武器 3 / 符咒 3 / 丹藥 3 / 法器 1, and **10 of
  20 searchable (6 in, 4 out)** — an even split with transit. The result
  is unexpectedly symmetric and worth preserving: **every category has
  two rooms in the village and one place on the hill**, with the 攝魂幡
  the lone exception that exists only outside. Outdoors is therefore a
  top-up rather than a supply line, which keeps "the village prepares,
  the hillside delivers" true without making the hillside a corridor you
  can strand yourself in.
- 2026-08-23 — **search probabilities set** for all four tables. Three
  findings. **Weapons self-limit beautifully**: the duplicate-returns-
  nothing rule pushes the effective miss rate 10 % → 40 % → 70 % → 90 %
  as you collect, so diminishing returns cost no extra rule. **七星劍 at
  10 % means most runs never see it** (~10 searches expected, each
  costing a STAY plus an event), so the realistic attack ceiling for a
  typical night is 2–3 and the King should be built against that, not
  against the best case. And the sharp one: **丹藥 never fails, while
  both +1 HP tiles are also 丹藥 tiles** — a turn on 帳房 is worth ~+2.9
  HP in expectation before event damage, which **supersedes constraint
  P1** (mean event damage must now beat ~3 HP/turn, not 1) and argues for
  **reinstating a health cap**, since nothing else bounds health growth
  any more. Also flagged: talismans are unlimited at 90 % hit, so capping
  a sword at one 真火符 matters now; and 攝魂幡 should probably be unique
  like the weapons.
- 2026-08-23 — **丹藥 re-weighted** (糯米 40 / 黑狗血 25 / 金丹 15 /
  nothing 20) and **health capped at 10**. The cap is the important half:
  it retires constraint P1 outright rather than superseding it. P1 asked
  the *event pool* to out-damage the healing tiles, which would have
  meant tuning every event around one tile's edge case; the cap solves it
  at the source and leaves the pool free. With start 6 and cap 10 the
  entire healing headroom is +4, so camping tops you up and then does
  nothing — healing is **recovery, never accumulation** — and it restores
  the small good tension of holding a 糯米 you cannot afford to waste.
  The cap also makes the King computable: over three rounds at 10 HP,
  **strength 7 demands Attack 4** (the 10 % sword plus a talisman spent
  on it, so a lucky night only), while **strength 5 demands Attack 2**,
  which is ordinary. 5 looks like the number that matches the game that
  actually gets played; 6 if the duel should be the harder win.
- 2026-08-23 — **土地廟 re-weighted**: 攝魂幡 15 %, 糯米 40 %, nothing
  45 %. The banner is now the rarest single outcome in the game — about
  seven searches expected, every one of them outdoors and costing a STAY
  plus an event, which is a serious share of a 30-turn night for the item
  that decides the duel.
- 2026-08-23 — **King strength set to 8; abilities proposed in §5.** The
  number forces the design: with `clamp(8 − attack, 0, 4)` everything
  from Attack 0 to 4 takes the full 4, so 12 damage over three beats
  against a 10 cap makes **tanking him arithmetically impossible**, and
  真火符 and 五雷符 do literally nothing in the duel. Rather than fight
  that, the proposal leans into it: **he is a lock, not a bigger pack.**
  Three beats, each answered by an item — 屍毒 poison (finally giving
  糯米's cure mode a source), a once-per-duel **hold your breath** against
  a blind breath-hunter, **僵直** giving the player a free first strike,
  黑狗血 to skip a beat, and the win by **鎮屍**: survive a beat at zero
  damage, then press any talisman to his forehead. Zero damage needs
  Attack ≥8, which needs **攝魂幡** — so the banner becomes the key to the
  duel, retroactively justifying its 15 % odds and outdoor-only home. Also
  proposed: standing on **溪澗 Stream** at turn 30 means he will not come,
  which is the *decline* option — survive, but win only if the tablet is
  already buried, making where you stand on the last turn a planned
  decision.
- 2026-08-23 — **攝魂幡's ×2 confirmed to apply to talismans**, which
  improves §5 in a way the draft did not anticipate: **五雷符 ×2 = Attack
  8 also seals**, so the cheapest route to the win is a common talisman
  from an unlimited supply rather than the 10 % sword. That rehabilitates
  五雷符, which strength 8 had otherwise made worthless, and leaves the
  duel with **exactly one real gate — the banner.** Also corrected my own
  僵直 rule: "you strike first on beat one, free" would have made beat one
  an automatic seal window and the whole duel a one-item formality.
  Rigor is now a **cushion** (beat one deals 2 less), which lets an
  ordinary Attack-2 duelist survive to their banner beat while a
  banner-less one dies on beat three at exactly 0 HP. New live question:
  **what surviving three beats without sealing means** — the skip items
  (黑狗血, held breath) have no purpose until that is answered.
- 2026-08-23 — **Variant B written into §5**: the King gets **Attack 8 /
  Health 10**, no 僵直, and the banner doubles swords only. The duel
  becomes a race rather than a survival test, which **removes 鎮屍
  entirely** — with health to strip, the zero-damage opening and the
  forehead talisman have nothing to attach to. Keeping the inherited
  clamp on his damage gives the player three beats, and the winning
  spread is healthy: even 戒刀 + 五雷符 + 血符 reaches exactly 10, so the
  duel stops being chained to the 10 % sword, while a sword *alone* falls
  one point short — "steel is not enough, you need the craft too." Two
  problems B must fix: **turn order becomes load-bearing** (exact-kill
  lines are common, and simultaneous resolution kills both — recommend the
  player strikes first), and **the banner is demoted to a good-sword
  accelerator while keeping key-item rarity**, which is the worst of both;
  loosen it to 25–30 % or let it double talismans after all. Variant A
  also clarified: **the seal talisman is a separate item** from whatever
  produced Attack 8, so the winning beat costs the banner plus two
  talismans.
- 2026-08-23 — **Variant A chosen, and its gate raised.** The objection was
  right, and the diagnosis is the useful part: 攝魂幡 + 五雷符 (8) and
  攝魂幡 + 血符 (10) both reached the seal, and both talismans are 20 %
  draws from an **unlimited** supply in three rooms — so the talisman half
  was free and the duel reduced to "find the banner". **Bigger numbers
  cannot fix that**, because any condition phrased as "some talisman"
  stays cheap. The fix is scarcity: the seal now requires **鎮屍符**, a
  **unique** item folded into the 符咒 table at 10 % (真火符 30 → 25,
  五雷符 20 → 15 to make room). It was also the genre's single most iconic
  object and was missing from the game entirely. The duel now needs **two
  unique items from opposite halves of the map** — 攝魂幡 (15 %, outdoors,
  one tile) and 鎮屍符 (10 %, any magic room) — plus any Attack ≥ 4 source.
  Flagged for the bots: the duel may now be *harder* than the burial
  rather than its equal; knobs in order are raise 鎮屍符 to 15 %, let 硃砂
  duplicate it, or let the Sealed Crypt also yield it.
- 2026-08-23 — **鎮屍符 dropped, and the gate rebuilt as a combination.**
  A unique item whose only function is "you win" was a lottery ticket, not
  a decision — reverted, and the 符咒 table restored to 30/20/20/20/10.
  In its place: **攝魂幡 doubles swords only**, **a sword and a talisman
  now ADD**, and the King goes to **strength 12**. That leaves exactly two
  winning kits — 七星劍 + 真火符 + 幡 + 五雷符 (12) and the same with 血符
  (13) — where **dropping any single piece lands you at 11 or 8**. Far
  better than the item gate: it is a configuration the player builds
  toward and can see coming, and it finally justifies 七星劍's 10 % — it
  is not just the best sword, it is the only one that can reach the seal.
  ⚠️ The add rule is much bigger than the duel it was written for: it
  makes talismans **amplifiers rather than substitutes**, so ordinary
  combat gets markedly easier and **the event pool's pack sizes must be
  scaled against sword-plus-talisman, not sword alone.** It also rescues
  the cheap swords, which were dead weight under the replace rule.
- 2026-08-23 — confirmed **swords persist, talismans and 攝魂幡 are
  one-use**. Already the design, but it bites much harder under the
  combination rule: the winning kit is spent in **one beat**, so there is
  exactly one attempt at the seal. **Mistiming the banner loses the night
  outright** — spend it with no attack talisman in hand and you reach 8
  instead of 12, and the route is gone. So the duel is a sequencing
  puzzle as well as a collection one. Two build notes: the choice UI must
  show what Attack each combination would produce and that the banner is
  one-use; and the bots should check whether holding the banner to beat 3
  is always correct, because if it is, the timing decision is illusory.
- 2026-08-23 — **the duel collapses to a single strike.** No beats, no
  rounds, no damage arithmetic: `Attack ≥ 12 → sealed and won, otherwise
  dead`. Strength 12 becomes a **threshold**, not a damage stat.
  Everything I had given him goes with it — three beats, 僵直, 屍毒 on
  contact, the held breath — and 黑狗血 is explicitly barred from the duel.
  **He now has no abilities, and that is the design**: the drama lives in
  thirty turns of assembling a kit, and the exchange is the verdict rather
  than the contest. It also dissolves the question that was blocking
  progress ("what if you survive three beats without sealing") by making
  it unaskable. Three consequences to carry: **health no longer affects
  the duel at all**, so the duelist and the burial runner now optimise for
  different things; **屍毒 is orphaned again** and must come from the event
  pool, since there is no contact phase left to inflict it; and **the
  outcome is knowable in advance**, so the UI has to show whether the duel
  is still reachable rather than letting a player discover their night
  ended ten turns ago. The held breath is worth re-homing in the event
  pool — hold still and let a jiangshi pass. Also: **Variant B's section
  had been lost to an accidental slice in an earlier edit; restored in
  brief under "Rejected alternatives".**
- 2026-08-23 — **event pool designed → §6.** Three bands of exactly 100 %,
  escalating 40 % → 40 % → 60 % fights with sizes 3–4 → 4–5 → 4–6 and the
  +1 HP relief vanishing at eleven — spec §3's deliberate curve preserved
  without reusing a number of it. Two things stand out. **村民受傷 is the
  best event in the design**: the only one that is a *decision*, its cost
  is the game's pivotal item, refusing means fighting the band's worst
  jiangshi, and — the accidental beauty — **its rewards at 10 and 11 PM
  are 真火符 and 五雷符, two of the four pieces the seal needs**, so saving
  villagers late is a second route to the duel kit. And **糯米 now carries
  three competing jobs** — heal +3, the only cure for 中毒, and the price
  of saving a villager — which is the sharpest tension yet and comes
  entirely from overlap rather than from a rule. Also introduces a
  **thirteenth item, 護身符** (all damage −1), obtainable *only* from the
  9 PM villager, so it is prepared-early and paid-late; worth ~8 HP across
  the last band, which may be too strong for something that luck-gated.
  Ran the expected-damage table: **bare-handed is ~1.85 HP/turn, about six
  turns to live**, so finding a weapon teaches itself; and the sustained
  ceiling of Attack 4 takes ~0.9/turn at eleven, i.e. ~9 HP against a cap
  of 10 — **the 11 PM band is calibrated almost exactly against the
  best-equipped possible player.** Constraint P1 is comfortably satisfied
  (camping +1 against 2.3–2.9). Also resolves the earlier worry about the
  sword-plus-talisman add rule: talismans are one-use, so they buy
  **emergency coverage, not immunity**, and the pack sizes need no
  rescaling. Open: 中毒's own rules — duration, cost per turn, stacking,
  and what it means to be poisoned at midnight.
- 2026-08-23 — **中毒 defined: −1 HP every turn until a 糯米 cures it.** An
  open-ended bleed with one contested cure, and it is **not survivable if
  ignored** — poisoned around turn 10 on average, that is ~20 HP by
  midnight against a cap of 10. So it is a forcing function whose job is
  to make you spend rice. It roughly doubles the cost of a bad stretch
  (Attack 2 in the last band goes 2.3 → 3.3 a turn, i.e. about three turns
  of life). ⚠️ **The real consequence is that poison and the wounded
  villager now compete for the same item, and poison has the louder
  claim** — which partly undercuts §6's lovely "villagers are a second
  route to the duel kit", because by the 11 PM band, where the villager
  carries a 五雷符, the player will usually be poisoned and unable to give
  rice away. 🎯 **But there is a fix already sitting in the design:
  護身符 reduces all damage by 1, and poison deals exactly 1** — so if the
  charm applies, it is poison immunity, and the whole thing becomes one
  chain: *save the 9 PM villager → get the charm → immune to the bleed →
  every later rice is free for villagers → who hand you 真火符 and 五雷符,
  two of the four seal components.* One early act of mercy unlocks the
  entire villager route and through it the duel. **Strongly recommend
  ruling that 護身符 stops poison**; without it the rice is permanently
  spoken for and the villager route is decorative. Also read 中毒 as
  non-stacking (a state, not a counter) and ticking at the *start* of a
  turn, so curing on the turn you are poisoned costs nothing.
- 2026-08-23 — **ruled: 毒不算傷害** — poison is not damage, so 護身符 does
  not stop it. I had recommended the opposite; the ruling is the better
  game and worth recording why. My version chained neatly (save the 9 PM
  villager → charm → immunity → every later rice free for villagers) but it
  **resolved the tension around turn five** — one early decision and the
  rice question was settled for the night. With the tax permanent, **every
  villager is a fresh hard choice**, because the bleed can always return
  and rice is always the only cure. A dilemma you keep facing beats a
  puzzle you solve once. The rice ledger now reads: demand ~6 (about 3
  poisonings plus 3 villagers), supply 3 in the starting pack plus whatever
  the three 丹藥 tiles give up at 40 % a search — contested but not
  hopeless, which is where an economy should sit. Two knock-ons: the 丹藥
  tiles become quietly strategic as the only tap, and two of the three are
  indoors, so crossing the moon gate rice-less leaves one source on the far
  side; and 護身符 is weaker than it looked — still ~8 HP across the last
  band on wounds alone, a good reward rather than an era-defining one.
- 2026-08-23 — **§7: the two wins.** The useful framing is that they spend
  **different currencies** — the burial wants *tiles and MOVE turns*
  (three specific rooms and the routing between them), the seal wants
  *items and STAY turns* (four specific finds). One win is about knowing
  the map, the other about knowing the tables, and they compete for the
  same 30 turns through opposite verbs. Two problems named. **The burial
  can end the night early and the seal cannot happen before turn 30**, so
  a player holding both takes the burial — framed honestly, the burial is
  the win you *plan* and the seal is the win the night *gives* you. And
  **the seal is materially the harder one**: ~10 searches expected for
  七星劍 plus ~7 for 攝魂幡 is ~17 STAY turns out of 30, before travel or
  the damage taken standing still; the villagers' free 真火符 and 五雷符 are
  what keep it possible. Knobs listed, 七星劍 to 15 % first. 🎯 **Main
  recommendation: carrying the 神主牌 at midnight lowers the threshold
  from 12 to 11** — you hold his name, and a jiangshi that hears its own
  name loses a moment. It makes **both "short by exactly 1" lines live**,
  including the one that needs no 七星劍, so it fixes the difficulty gap
  without touching a probability; it means **a failed burial is no longer
  wasted**; and it makes the two paths *converge* rather than merely
  compete. Also settled the outcome space at **four**, with "survived" —
  standing on 溪澗 when the drum sounds — as its own verdict: not a win,
  not a loss, and the only ending the player deliberately chooses.
- 2026-08-23 — **七星劍 raised to 15 %** and **the tablet rule adopted**
  (carrying the 神主牌 drops the seal threshold 12 → 11). The 5 % came off
  the two interchangeable Attack-1 swords — 戒刀 and 桃木劍 to 25 % each,
  which between them had been soaking 60 % of every weapon search — with
  some of it going to 銅錢劍 (20 → 25 %), deliberately, because the
  tablet-assisted seal line runs through that sword. Together the two
  changes close the difficulty gap §7 identified: expected searches for
  the sword fall from ~10 to ~7, and **with the tablet in hand 七星劍 is no
  longer required at all** — 銅錢劍 + 真火符 + 幡 + 血符 reaches 11. So the
  seal now has four viable kits instead of two, and **攝魂幡 becomes the
  single genuinely scarce requirement**: one tile, outdoors, 15 %, nothing
  substitutes for it. Every line that reaches the threshold spends the
  banner. Also worth noting what the tablet rule does to the *shape* of a
  run: a player who finds the crypt but cannot reach the grave now has a
  live second plan rather than a souvenir, so the burial and the seal
  stopped being alternatives and became a sequence you can fall back
  along.
- 2026-08-23 — **鎮屍 ruled a hidden ending, and deliberately not a higher
  tier.** Two separate calls: nothing advertises it (not the letter, not
  the menu, not the store copy), and no verdict ranks it above the burial
  — a game about a corpse hostel can hold that **putting a man back in the
  ground is the better act** and the confrontation is merely the rarer
  one. Constraints recorded per surface: the first-run letter teaches the
  burial only; the **player-facing rulebook diverges from this vault one**
  and must describe midnight without printing the recipe; the two wins'
  epilogue lines have to match in register and length so neither reads as
  the "real" ending; and the SEO/OG/landing copy all describe the burial,
  since a hidden ending in the marketing is not hidden. ⚠️ The ruling
  creates one real problem — **an ending nobody finds is the same as one
  that isn't there**, and reaching the seal by accident needs surviving to
  turn 30 while happening to hold Attack ≥ 11. The fix is the **death
  screen**: when he takes you, print `your attack 6 / needed 12` with no
  commentary. A player learns *there was a number* and goes looking, which
  reveals a mechanic without teaching it. The quiet trail already exists
  in two places worth preserving: the villagers hand over 真火符 and 五雷符,
  which are really only *for* this, and the 攝魂幡 does nothing an ordinary
  fight requires.
- 2026-08-23 — **the game never explains the seal: 永遠不說.** The threshold
  is never openly displayed — sealing him once unlocks nothing, no
  achievement text, no HUD readout, no spoiler appendix to the rulebook,
  and the tally counts the ending without explaining it. That leaves the
  **death-screen comparison as the only place the number ever appears in
  the whole game**, which makes that one line a rule of the design rather
  than UI copy: cut it and discovery dies with it. Consequence accepted: a
  player may seal him without fully knowing why, beyond what they were
  carrying — the game trusts them to have noticed. And the upside is real:
  **the knowledge lives in players rather than in the interface**, so it
  gets passed along instead of looked up. For a small web game a secret it
  refuses to explain is something to talk about with someone else who has
  played — the community becomes the documentation, which is exactly what
  happened to the source game on the BGG forums.
- 2026-08-24 — **[[jiangshi in the pocket - ruleset spec]] written**: the
  code-facing document, mirroring the source spec's shape. Constants,
  board model, four JSON data tables (`tiles`, `items`, `search`,
  `events`), the attack and damage formulas, the full turn pseudocode,
  midnight, and a **§11 mapping of what the inherited engine has to
  change** — `engine.js` loses the whole deck/clock half, `board.js` is
  data-only, and the dread dial, phantoms and scare systems survive
  untouched because they read state that still exists. Writing it surfaced
  **nine ❓ items that cannot be coded around**, collected in §12 and
  ranked: `COWER_HEAL` was never actually settled (still 3, candidate
  4–5); zombie doors have no trigger now that STAY is legal; whether a
  generic flee still exists at all; talisman stacks vs slots; multiple
  真火符 per sword; what the two rites cost; and `rich: true` on 經堂 /
  鐵匠鋪 currently means nothing mechanically. Also added §13, a list of
  hand-derived invariants a bot suite should assert — the expected-damage
  figures, the Attack-4 ceiling against the 11 PM band, and the search
  expectations — because several of them are load-bearing and were worked
  out by hand rather than measured.
- 2026-08-24 — **four rulings that close most of the spec's open list.**
  **No `COWER_HEAL`: cowering heals nothing** — a charge buys exactly one
  thing, that the turn draws no event. That is stronger than a heal and
  more interesting: a charge is worth *the expected damage of the draw you
  skipped*, which is ~0.85 HP at nine and **~2.3 at eleven**, so charges
  are hoarded for late without a rule saying so. It also cleanly separates
  the two ideas — **cowering is evasion, healing is items and tiles** (糯米,
  金丹, the two HEAL_1 tiles, +1 HP events) — and they stop competing for
  the same slot in the player's head. Also: **a talisman stack is one
  slot** regardless of size, so inventory holds `{id: count}`; **one 真火符
  per sword**, which fixes the sword ceiling at 4 and stops 硃砂 pumping a
  blade past it; and **no `rich` flag** — 經堂 and 鐵匠鋪 roll the same
  tables as their siblings, so the ★ in the notes is flavour and the field
  comes out of `tiles.json`. Spec §12 is down to five open items, all of
  them small: zombie doors, whether a generic flee exists, the two rites'
  cost, 護身符 vs HP events, and whether tile actions are free.
- 2026-08-24 — **three more rulings.** **Zombie doors are kept unchanged**
  — `STAY` being legal does not retire them; the dead-end trigger, the
  fire-after-the-room's-own-event ordering, the persistent re-usable hole
  and the flee-makes-it-in-the-room-you-reach ruling all carry over 📐.
  (Flagged: `ZOMBIE_DOOR_COUNT = 3` is inherited, but 3 is now the
  *weakest* jiangshi in the game with bands running 3–6, so a wall coming
  in at eleven is milder than an ordinary draw — worth scaling 3/4/5.)
  **A generic flee exists at −1 HP**, one step into an adjacent explored
  tile, no event drawn there — so there are two exits from a fight, and
  黑狗血 is the free version, which is exactly what that item is for. And
  **護身符 is combat-only**: it does not soften the `HP: -1` events, the
  poison, or the cost of running. That keeps its scope to one sentence —
  *the things that claw at you hit softer, and nothing else changes.*
- 2026-08-24 — **rites draw an extra event, tile actions are free, and the
  breach scales 3/4/5 by band.** The rites keep the source's shape: both
  goal rooms are now **two events in one turn**, the second arriving at
  the worst moment — standing over the hole with the tablet in hand — so
  neither win is free. Tile actions (香堂's charge, 土地廟's prayer) cost
  no turn, since both are already gated once-per-run *and* by the walk;
  taxing a turn on top would make a late detour to the Incense Hall never
  worth it. And the breach — the source's "zombie door", renamed **破牆**
  — now scales with the band, because a flat 3 would have made a wall
  coming in at eleven milder than an ordinary draw. That creates **the
  worst single turn in the game**: a dead end at eleven fires the room's
  own event *and then* the breach with no cowering between them, which at
  Attack 2 is 僵屍 6 for 4 plus a 5-breach for 3 — **7 HP of a 10 HP cap in
  one turn** — against 3 HP for a player at Attack 4. A sharp spike, and a
  fair one: it is the clearest argument the game makes for being properly
  armed by the last band.
- 2026-08-24 — **audited the rulebook and spec against every ruling.** Found
  and fixed one real contradiction — **the rulebook still said cowering
  "Regain Health"**, three days after that was removed — plus stale ⏳
  markers on the event pool, the search tables and Combat; three wrong
  section cross-references in the spec; two rows in the engine-change table
  still describing breaches as unused and `fled` as undecided; and **four
  surviving ★ marks** implying 經堂/鐵匠鋪 roll better tables after the
  `rich` flag was dropped. Also caught that the rulebook told the player
  the shrine held "the 攝魂幡 and nothing else" when its table is 40 %
  糯米. Added the edge cases the turn order creates and nobody had written
  down: fleeing the room's event means **no breach** (you are not in the
  dead end any more) and no search; a dead-end goal room can be **three
  fights in one turn**; the rite does not fire at the grave without the
  tablet; and 金丹 rolls from the search RNG stream so seeds replay.
  Finally, ruled **only talismans stack** — so the three starting 糯米 take
  3 of 6 slots, and the pack is exactly sized for *starting rice plus a
  complete duel kit*, with the bag converting from consumables to
  equipment as the rice is spent.
- 2026-08-24 — **ruled: only talismans stack**, so the three starting 糯米
  take 3 of 6 slots and the pack is exactly sized for *starting rice plus a
  complete duel kit*. Also wrote [[jiangshi in the pocket - glossary]], the
  中英對照 table for development: every tile, item, category, event, action
  and outcome keyed by its **engine id**, which is the contract — ids stay
  ASCII and are never translated, while both language columns live in the
  theme files. Flagged one inconsistency the notes had been carrying
  without anyone noticing: **殭屍 and 僵屍 are both in use** — 殭屍 in the
  King's name and the framing, 僵屍 in the event-pool tables. They are
  variant forms of the same word; **殭屍 is the standard Traditional form**
  and the 歹 radical carries the corpse sense that 僵 ("stiff") does not.
  Worth a sweep before any of it reaches a UI.
- 2026-08-24 — **implementation tracker created**: 17 GitHub issues on
  `csiesheep/jiangshi_in_the_pocket`, labelled `be`/`fe` for the two
  implementation sessions and `P0`–`P3` for priority, each with a
  Definition of Done checklist so completion is verifiable. Grounded in a
  repo audit first: the fe/be sessions had already landed the turn clock,
  the 20-tile board (breach geometry included), all twenty painted scenes
  and the 義莊 landing page — but the engine's rules layer is still the
  source game's (health 6, attack 1, 2 slots, chainsaw), and events /
  search / poison / villager / King are unbuilt, so those are the P0s.
  Two findings along the way: the `zitp:*` localStorage keys are shared
  with Grave Errand on the same origin (tallies, mute, first-run flag —
  same class as the sw-cache bug; filed), and the shipped tile id is
  `earth-god-shrine` where the spec and glossary said `earth-shrine` —
  the documents were corrected to match the code, since the id contract
  follows what ships.
- 2026-08-24 — **two spec §2 corrections from BE's implementation review.**
  `exteriorDoor` is an **edge name** (`"N"`), not a boolean — the engine
  rotates it with the tile via `rotateDir`, and a bare `true` would have
  re-hardcoded the north-face assumption that was removed when the moon
  gate became one of the Courtyard's four ordinary doors. The shipped
  shape was right; the spec is amended to match. And the indoor
  exit-density annotation said 21/10 (2.1) against a JSON block that sums
  to **23** — a stale carry-over from before the Gatehouse opened three
  ways; corrected to 23/10 (2.3). Deviations flagged rather than silently
  taken, which is the review working as intended.

## Links
- [[jiangshi in the pocket - ruleset spec]] — the code-facing spec
- [[jiangshi in the pocket - glossary]] — 中英對照, and the id contract
- [[jiangshi in the pocket - rulebook]] — the same rules as playable prose
- [[jiangshi in the pocket plan]] — project note (partly superseded, see above)
- [[zombie in the pocket - ruleset spec]] — the baseline being departed from
- [[zombie in the pocket - rulebook]] — prose rules, same baseline
- [[zombie in the pocket plan]] — the parent project
