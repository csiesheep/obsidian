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
- [~] **Item pool** — **11 items designed 2026-08-23** (see §1). Still
      open: rarity counts, slot rules for talisman stacks, and the miss
      rate on a search.
- [~] **King ability design** — strength 8 set; **two variants written
      2026-08-23 → §5.** **A (鎮屍)**: no health, win by sealing him on a
      zero-damage beat — the banner is the one gate. **B (血戰)**: Attack
      8 / Health 10, win by emptying him — wider viable kits, but turn
      order must be fixed and the banner loses its rarity's justification.
      Bot both.
- [ ] **Two wins** — how the tablet burial and the duel relate: relative
      difficulty, whether they interact, what the epilogue says about each.
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

### The items — ✅ designed 2026-08-23

Twelve items in four categories. Weapons persist; talismans and
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
| **攝魂幡** | Soul-Snatching Banner | Your **next attack ×2** |

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
| 戒刀 | 30 % | 真火符 | 30 % | 糯米 | 40 % | 糯米 | 40 % |
| 桃木劍 | 30 % | 血符 | 20 % | 黑狗血 | 25 % | **攝魂幡** | **15 %** |
| 銅錢劍 | 20 % | 硃砂 | 20 % | 金丹 | 15 % | nothing | 45 % |
| 七星劍 | **10 %** | 五雷符 | 20 % | nothing | 20 % | | |
| nothing | 10 % | nothing | 10 % | | | | |

### What the probabilities do

**1. ✅ Weapons self-limit, elegantly.** Because a duplicate roll returns
nothing, the effective miss rate *climbs as you collect*:

| Already carrying | Effective "nothing" |
|---|---|
| — | 10 % |
| 戒刀 | 40 % |
| 戒刀 + 桃木劍 | 70 % |
| + 銅錢劍 | 90 % |

Diminishing returns with no extra rule written — the fourth weapon search
in a night is nearly always wasted. This is the cleanest of the four
tables.

**2. 七星劍 at 10 % means most runs never see it.** It's geometric and the
odds don't improve as you collect others, so it's ~10 searches expected;
ten rolls give 65 %, twenty give 88 %. Each extra roll costs a **STAY** —
a turn *and* an event. **So the realistic attack ceiling for a typical
run is 2–3, not 3–4**, with 七星劍 as the lucky night. Worth holding on
to when the King gets numbers: build him against the common case, not the
best case.

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

## 5. 殭屍王 The King — strength 8 ⚠️ proposal

**Strength 8 is a statement, and it should be read as one.** With the
inherited formula `damage = clamp(8 − attack, 0, 4)` and a 10 HP cap:

| Attack | Damage / beat | Over 3 beats |
|---|---|---|
| 0 – 4 | **4** (all clamped) | **12 → dead** |
| 5 — 血符 | 3 | 9 |
| 6 — 血符 ×攝魂幡 ÷2… | 2 | 6 |
| 7 | 1 | 3 |
| 8+ | **0** | 0 |

Two things fall straight out, and they define the design:

1. **You cannot out-fight him.** Realistic Attack is 2–3 (七星劍 is a
   10 % find), and everything from 0 to 4 takes the identical full 4 —
   the clamp flattens the whole weapon table. 12 damage against a cap of
   10 means **tanking three beats is arithmetically impossible.**
2. **⚠️ It also kills two talismans at the exact moment they should
   shine.** 真火符 (1) and 五雷符 (4) both leave you taking 4, i.e. they
   do *nothing* in the duel. Only 血符 (5) and 攝魂幡 (doubling) move the
   number at all. If that isn't intended, strength 8 is the wrong number;
   if it is, the duel must not be a damage race.

**So: don't make him a stat check. Make him a three-beat puzzle** where
each beat is answered with an item, not a score. That reading turns
strength 8 from a problem into the premise — *steel does not stop him* —
and it gives every folklore counter a job.

---

## Variant A — 鎮屍, the seal (he has no health)

### The three beats — 三更三響

He arrives at the end of turn 30, in whatever place you are standing.
**No fleeing, no cowering, no tile effects.** Three beats of the watch
drum; answer each one.

### Passives

**屍毒 Corpse-poison.** Any beat where he lands damage also **poisons**
you: −1 HP at the start of every later beat, and it persists past the
duel. **糯米 draws it out.** — This is where 屍毒 comes from, closing the
loop 糯米's cure mode opened with nothing to cure.

**他聞你的呼吸 He hunts by breath.** He is blind and finds you by
breathing. **Hold your breath** to answer a beat: he loses you and deals
no damage, but you cannot act either. **Once per duel** — you have to
breathe eventually.

### Weaknesses — the answers

> **Corrected 2026-08-23.** 僵直 was first written as "you strike first on
> beat one, free." That was wrong: if the seal only needs a beat where his
> strike dealt zero damage, a free beat one *is* a seal window, and the
> duel becomes "spend any talisman on turn 30 and win." Rigor is now a
> **cushion, not a window** — beat one hits for 2 less, which buys you the
> time to reach your banner beat without handing you the win.

| Answer | Costs | Does |
|---|---|---|
| **僵直 Rigor** | — | He comes stiff out of the coffin: **beat one deals 2 less damage** |
| **攝魂幡** | the banner | **Attack ×2** for one beat — the only thing that reaches the seal window |
| **血符** | 1 HP | Attack 5 for one beat → 3 damage instead of 4 |
| **黑狗血** | the blood | Breaks the working: **skip a beat entirely** |
| **糯米** | the rice | Clears 屍毒 |
| **Hold breath** | once | Skip a beat |
| **溪澗 Stream** | — | He **will not cross running water.** See below |

### 鎮屍 — how you actually win

You do not kill him, you **seal** him.

> **On any beat where his strike deals you zero damage, you may spend
> one talisman as a 鎮屍符** — press it to his forehead. The duel ends and
> the night is yours.

**The seal talisman is separate from whatever got you to Attack 8.** So
the winning beat costs, typically, three things: the banner, a talisman
spent for attack, and a talisman spent as the seal. With 6 slots and a
90 % talisman hit rate that is affordable — but it has to be *carried*,
and a player who arrives with the banner and one talisman cannot close.

Zero damage needs **Attack ≥ 8**, and **攝魂幡 doubles a talisman's
attack as well as a sword's** (confirmed 2026-08-23), which opens three
lines:

| Line | Attack | vs 8 | Availability |
|---|---|---|---|
| **攝魂幡 + 五雷符** | 4 × 2 = **8** | **0 — seal** | 20 %, unlimited supply. **The accessible line** |
| **攝魂幡 + 血符** | 5 × 2 = **10** | **0 — seal** | 20 %, costs 1 HP |
| **攝魂幡 + 七星劍 + 真火符** | 4 × 2 = **8** | **0 — seal** | needs the 10 % sword |
| 攝魂幡 + 七星劍 | 3 × 2 = 6 | 2 | — |
| anything without the banner | ≤ 5 | ≥ 3 | — |

**This rehabilitates 五雷符**, which the strength-8 clamp had otherwise
made worthless (see the warning at the top of this section). Doubled, it
is the *cheapest* route to the seal — a common talisman from an unlimited
supply. The rare sword turns out not to be required at all.

So the duel has exactly **one real gate: the banner.** Everything else on
the seal lines is readily found. That is a good place to land — a single
clear condition, at 15 % from one tile behind the moon gate, rather than a
compound stat check nobody can plan around.

**This makes 攝魂幡 the key to the duel**, which justifies everything
about it — 15 % odds, outdoors only, one place in the world, and "keep it
for something big" turning out to be literal. It also means the duelist
must cross the moon gate, which is the structural property we wanted.

**The knob, if the gate is too tight:** allow the seal at **≤1 damage**
instead of 0, which opens Attack 7 and takes the banner from mandatory to
strongly preferred.

### How it actually plays

With 僵直 as a cushion, an ordinary duelist — Attack 2 from a 銅錢劍,
10 HP, holding the banner and a 五雷符:

| Beat | Play | Damage | HP |
|---|---|---|---|
| 1 | fight (rigor: −2) | 2 | 8 |
| 2 | **攝魂幡 + 五雷符 → Attack 8** | **0** | 8 → **seal, win** |

And the same player *without* a banner:

| Beat | Play | Damage | HP |
|---|---|---|---|
| 1 | fight (rigor: −2) | 2 | 8 |
| 2 | fight | 4 | 4 |
| 3 | fight | 4 | **0 — dead** |

Exactly lethal, which is the right feel: no banner, no night. 黑狗血 or a
held breath buys one of those beats back and leaves you alive at 4 — but
alive is not the same as won (see the open question below).

---

## Variant B — 血戰, he has health (alternative, 2026-08-23)

**The King gets a stat block: Attack 8, Health 10.** The duel stops being
"can you survive him" and becomes "**who empties whom first**." Plus:
**no 僵直**, and **攝魂幡 doubles swords only, not talismans.**

### What this changes at the root

**鎮屍 is gone.** With health to remove, winning means removing it — the
zero-damage opening and the forehead talisman have nothing to attach to.
The clean "the banner is the one gate" structure goes with it. Not a
loss, but a real trade, and worth choosing deliberately rather than
inheriting.

### The numbers

- **His damage to you** — keep the inherited clamp:
  `clamp(8 − your attack, 0, 4)`. Capped at 4 against a 10 HP player,
  that gives you **three beats** to work in. *(Unclamped, `8 − attack`,
  a low-attack player dies in two — playable, but much harsher and it
  needs a new formula for no gain.)*
- **Your damage to him** — your Attack, **cumulative**. You need **10**.
- **Talismans are burst** (they replace your attack for that beat);
  **swords are sustained.**

### Which lines actually win

Ten cumulative damage inside three beats:

| Carrying | Beat 1 · 2 · 3 | Total | |
|---|---|---|---|
| 七星劍 + 真火符 (4) | 4 · 4 · 4 | **12** | ✅ |
| 七星劍 (3) + 幡 on any beat | 3 · 3 · 6 | **12** | ✅ |
| 銅錢劍 (2) + 五雷符 + 血符 | 4 · 5 · 2 | **11** | ✅ |
| **戒刀 (1) + 五雷符 + 血符** | 4 · 5 · 1 | **10** | ✅ *exactly* |
| 七星劍 (3), sword alone | 3 · 3 · 3 | 9 | ❌ **one short** |
| 銅錢劍 (2), sword alone | 2 · 2 · 2 | 6 | ❌ |

**This is a healthy spread.** Even the worst sword plus two talismans
gets there, so the duel is no longer chained to the 10 % 七星劍 — while a
sword *alone* falls exactly one point short, which says the right thing:
**steel is not enough, you need the craft too.**

### ⚠️ Two things Variant B must answer

**1. Turn order becomes load-bearing.** Look at the 戒刀 line: beat three
lands the final single point. If **you strike first**, he dies before
swinging and you win at 2 HP. If it resolves **simultaneously**, he hits
you too and you both die. Exact-kill lines like that will be common once
he has health, so the order must be stated. 僵直 used to answer this
incidentally; without it, **recommend the player strikes first** — he is
newly woken and stiff, which keeps the old flavour without the free-beat
exploit.

**2. The banner is demoted, and its rarity no longer fits.** Doubling
swords only, its sole worthwhile use is 七星劍 ×2 = 6; on a 戒刀 it buys
2 and is wasted. So it drops from *the key to the duel* to *an
accelerator for players who already found the good sword* — while keeping
15 % odds, a single tile, and a location behind the moon gate. **That
combination is the worst of both**: hard to get and not decisive.
**Recommend loosening it to 25–30 %** if Variant B is taken, or letting
it double talismans after all.

## Shared by both variants

### 不渡活水 — the Stream, and declining the duel

Standing on **溪澗 Stream** at the end of turn 30, he will not come. You
are safe and the duel never happens — so **you cannot win by duel
there.** The Stream is the "decline" option: survive the night, win only
if the tablet is already buried.

That makes **where you stand on turn 30 a decision you plan for**, using
a tile rule that already exists. And it gives a failed burial run a
dignified out: walk to the water and live.

### Why this shape is worth having
- **Every folklore counter gets a mechanical job** — rice, blood,
  running water, the blind breath-hunter, rigor, the forehead seal.
- **The 12-damage impossibility becomes the teaching moment.** A first
  duel is meant to be lost; the player learns he isn't a bigger pack, he
  is a lock.
- **It reuses the combat formula without contradicting it.** No special
  damage rules — just answers that replace beats.

### A vs B, in one line each
- **A (鎮屍)** — he is a **lock**. One gate (the banner), a puzzle to
  open it, and a dramatic finish. Cost: two talismans of the design's
  four do nothing in the fight, and 攝魂幡 must double talismans for any
  of it to work.
- **B (血戰)** — he is an **opponent**. A race with a wide spread of
  viable kits and a clear "steel alone isn't enough" message. Cost:
  turn order has to be nailed down, and the banner loses its reason to
  be rare.

Both reuse the existing damage formula and neither needs new engine
concepts beyond, in B's case, a health pool for one entity. **Bot both.**

### Open on the King
- **Beat count: three?** It fixes 12 damage as the untanked worst case,
  which is exactly one more than the cap allows — a good number.
- **⭐ What happens if you survive all three beats without sealing?**
  Now the live question. Three options: you **live but do not win** (he is
  still loose — symmetrical with the Stream's decline), the beats
  **continue** until seal or death (harsh, and makes 黑狗血 merely
  delaying), or surviving *is* a win ("you lasted to cockcrow"), which
  the source game's dawn ending would support. The skip items — 黑狗血 and
  the held breath — only make sense once this is settled: right now they
  buy beats without buying anything.
- **What if the player has no answers left?** Beat three with nothing in
  hand is 4 damage and probably death. Fine, but the UI must have shown
  it coming.
- **Does 屍毒 outlast the night** in the epilogue, if the duel is won
  while poisoned?
- **What does he *do* narratively on a beat he lands** — the staging is a
  set-piece and the cue list already has a drum, a wall-break and a
  scare to draw on.

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

## Links
- [[jiangshi in the pocket - rulebook]] — the same rules as playable prose
- [[jiangshi in the pocket plan]] — project note (partly superseded, see above)
- [[zombie in the pocket - ruleset spec]] — the baseline being departed from
- [[zombie in the pocket - rulebook]] — prose rules, same baseline
- [[zombie in the pocket plan]] — the parent project
