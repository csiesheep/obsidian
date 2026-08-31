---
title: Oops Inc. — Game Design Document
project: oops-inc
type: design-doc
version: v4
status: in-progress
updated: 2026-08-30
supersedes: oops inc design v3
tags: [gamedev, incremental-game, design-doc, oops-inc]
---

# OOPS INC. — Game Design Document

> *an honest mistake, at scale*

**Title:** Oops Inc.
**Genre:** Active incremental
**Tone:** Dry corporate satire
**Platform:** Web page first (single-file HTML), portable to desktop & mobile later
**Goal:** Reach **$1,000,000,000** in lifetime revenue
**Length:** ~8 hours of active play, **one run, no prestige**
**Version:** **v4** — single run, four acts, spatial job assignment

> **This document is self-contained.** v3 was written as an overlay on v2 and
> replaced only *part* of it, which orphaned nine systems that lived in the
> deleted sections and severed the prestige loop entirely (see §21). v4 replaces
> both documents outright. Nothing here defers to an earlier version. Keep v3 on
> disk as a record of how we got here; do not read it for rules.

### Decisions locked in v4

| Question | Decision |
|---|---|
| Name | **Oops Inc.** (provisional) |
| Tone | **Dry corporate satire** — see §2 |
| Core verb | **Fix the defects** (robots produce; you do quality control) |
| **Prestige** | **None.** One run, start to finish. Next game starts from zero. |
| **Goal** | **$1,000,000,000** |
| **Length** | **~8 hours**, four acts |
| Currencies | **Cash + Parts**, plus four tree currencies earned by working |
| Pipeline | **Assemble → pile → pack → ship.** Robots do packing too — see §5 |
| Robot levels | **Three** (Mk I / II / III), each ~10× the last |
| Movement | **Literal** — robots walk the floor; walk speed and distance are real |
| **Job assignment** | **Drag / slider, and the robots walk there themselves** — see §7 |
| Tree currency | **Service Hours, per level**, plus Logistics Points |
| Endgame sink | **Parts upkeep on Mk III**, gated by manual repair throughput |
| **Offline progress** | **None.** Tab hidden = paused. |
| Ending at $1B | **The board buys you out** — credits, full stats, optional endless mode |
| Tech stack | **Single-file HTML, vanilla JS, canvas floor + DOM UI** |

---

## 1. The pitch

You inherit a derelict robot factory with **$0 and one dead robot on the floor**.

Robots build things. Robots also **get it wrong**. Your job is not to build — it's
to catch what the robots screwed up before it ships, and to keep the robots
themselves alive. Every robot you add makes you more money *and* more mess.
Scaling the factory means scaling the cleanup: first with your own hands, then
with **Technicians** who catch defects and repair machines for you, then with
skill trees that make the whole line hum.

The tension that drives the entire game: **more production is worthless if
quality collapses.**

### Why this is a distinct game

The reference games all make the player **produce**. Oops Inc. makes the player
**correct**. That single inversion gives us mechanics they don't have: quality as
an economic multiplier, automation that is *partial* (a Technician only handles
what it has been certified on), and an antagonist that is your own workforce.

| Game | Tactile object | Verb | Automation |
|---|---|---|---|
| Dirt Clicker | Patch of dirt | Dig | Mushroom Buddies, Golems, Druids |
| Bottle Flip Inc | Bottle | Flip | Helper hands |
| **Universal Paperclips** | — | Make | Autoclippers |

*Universal Paperclips* is the closest structural reference now: one run, no
prestige, escalating scale, a definitive ending. It is proof this shape works.

What we borrow: a tiered helper roster with personality (Dirt Clicker), a second
currency extracted from the object itself (Bottle Flip Inc's caps → our Parts),
and upgrade names that are half the fun.

---

## 2. Voice — dry corporate satire

The joke is that this is a functioning business with a compliance department, and
it is on fire.

**Rules of the voice:**

1. **The game never acknowledges that anything is wrong.** Eleven robots offline
   is "a temporary throughput variance." A rogue robot destroying your inventory
   is "an unscheduled workflow deviation."
2. **Understate the disaster, oversell the trivia.** A catastrophic cascade
   failure gets one flat line in the ticker. Buying your 25th robot triggers a
   full congratulatory banner.
3. **Everything is a euphemism.** Never "broken" — *non-operational*. Never "you
   lost money" — *value was not realised*. Never "defect" in customer-facing text
   — *pre-owned condition*.
4. **The player is management, and management is the problem.** Upgrade names
   sound like initiatives imposed from above. The robots have no say.
5. **No exclamation marks except where a corporation would use them** — i.e.
   exclusively in announcements nobody wanted.

**Sample ticker lines:**

```
▸ MK1-17 shipped a unit in pre-owned condition. Noted in its file.
▸ Congratulations! You have unlocked SYNERGY BOLTS.
▸ MK3-02 has gone rogue. HR has been notified.
▸ Quality is trending downward. Management is confident.
▸ MK2-09 is on fire. Fire is a known operating state.
▸ Reminder: Rusty has now worked 40,000 consecutive hours.
▸ Output pile at capacity. Overflow items have been processed per procedure.
▸ Technician #14 has been reassigned. Technician #14 was not consulted.
```

**Naming conventions:**

- Skill tree nodes are **corporate initiatives**: *Hydraulic Upgrade, Unpaid
  Overtime, Tolerance Control, Storage Requisition*
- Staff are **job titles, dehumanised**: Technician, Calibrator, Lubricator,
  Shift Manager, Quality Director
- Achievements are **performance review outcomes**: *Meets Expectations, Exceeds
  Expectations, Whoopsie Daisy, Somebody Noticed*
- Robots have **serial numbers and nicknames**, because someone in the break room
  named them and it stuck. Serials are `MK1-`, `MK2-`, `MK3-`, and `RB-00`.

---

## 3. Core loop

```
   ASSEMBLY ──► good units ──► OUTPUT PILE ──► packers carry ──► SEALED ──► $$$
      │                             │
      │                             └── pile full ──► OVERFLOW IS LOST
      │
      └──► DEFECTIVE units ride the QC BELT
              ├── you click to fix ──────► back into the pile (+salvage bonus)
              ├── a Technician fixes it ─► back into the pile
              └── it times out ──────────► SCRAPPED: Quality Score drops, +Parts

   Robots WEAR DOWN ──► break down ──► produce nothing
              ├── you click to repair ───► +Parts (the main source)
              └── a Technician repairs it ► +Parts (~15% as much)

   CASH ──► more robots, more staff, more floor
   PARTS ─► the Workshop, and (Act 4) keeping Mk III alive at all
```

### The four things the player is always doing

1. **Fixing defects** (click the belt) — the primary verb, ~60% of clicks
2. **Repairing robots** (click the floor) — the interrupt verb, ~20%
3. **Assigning jobs** (drag the floor) — the deployment verb, ~10%
4. **Spending** (click the panel) — the decision verb, ~10%

Four verbs, four rhythms: fast and dense, interrupting, spatial, deliberate.

### Quality Score — the stat that makes it a game

`Quality Score (QS)` = rolling percentage of the last **200** produced units that
shipped in good condition.

**Sale price multiplier = 0.5 + QS**

| QS | Multiplier |
|---|---|
| 100% | **2.0×** |
| 50% | 1.0× |
| 0% | **0.5×** |

This is the spine of the design. Letting defects slip past is not a small missed
bonus — it's a **4× income swing** between sloppy and perfect play. It's why
hiring a Technician feels like a raise, and why "just buy more robots" is a trap
if you haven't scaled QC alongside.

QS is displayed as a big, always-visible gauge that visibly wobbles as you play.

**Defect rate applies at assembly only.** Packers do not produce, so they do not
produce defects. This means **job assignment is also a quality lever**: moving
robots to packing throttles the defect inflow at the source. It is a legitimate
and interesting play, and the balance pass must account for it — QC belt load
scales with *assembly headcount*, not total headcount.

---

## 4. Currencies

| Currency | Earned from | Spent on |
|---|---|---|
| **Cash ($)** | Shipping units | Robots, staff, floor |
| **Parts** ⚙ | **Repairing robots** (main), scrapping defects | Workshop; Mk III upkeep |
| **Mk I / II / III Service Hours** | That level doing work, either job | That level's Programme tree |
| **Logistics Points** | Sealing packages | The Logistics tree |

Staged, so complexity grows with the player: **Act 1–2 has only Cash.** Parts
arrive in Act 3. Service Hours arrive with each level; Logistics Points arrive
with packing in Act 2.

> There are no Blueprints and no Patents. Those were prestige currencies and
> there is no prestige. See §21.

---

## 5. The pipeline

Production is a **line with a bottleneck you have to manage**:

```
  ASSEMBLY BAYS          OUTPUT PILE         PACK STATION        SHIPPING
  ┌───────────┐         (has a CAP)              ┌────┐
  │ [▣]🤖 ✦   │  good    ▪▪▪▪▪   packers walk    │ 📦 │  sealed
  │ [▣]🤖     │ ──────►  ▪▪▪▪▪  ────────────►    │    │ ────────►  $$$
  │ [▣]🤖 ✦   │          ▪▪▪▪▪   and carry       └────┘
  └─────┬─────┘             │
        │ defective         └── FULL? new units are DESTROYED
        ▼
   QC BELT ──► you / a Technician fix it ──► back into the pile
           └── unfixed ──► scrapped: QS drops, +Parts
```

**Units only become real money when packaged.** A sealed package ships at
`unitValue × packSize × bundleBonus`.

### 5.1 Value anchoring

| | Multiplier |
|---|---|
| Act 1 direct shipping (no pile, no packing) | **1.0×** — the player's mental baseline |
| Packaged, on introduction in Act 2 | **1.5×** |
| Packaged, Logistics tree fully invested | **3.0×** |

Packing arrives as a **pure gift**: "we can bundle these and charge more." There
is no moment where introducing a new system makes the player poorer. The pressure
to keep packers staffed grows as *you* invest in the Logistics tree — it is a
pressure you create, not one dropped on you.

### 5.2 The pile has a cap, and overflow is destroyed

There is **no loose freight chute**. When the pile is full, newly assembled units
have nowhere to go and are **lost**.

> ▸ Output pile at capacity. Overflow items have been processed per procedure.

This is deliberately harsher than a discount-price safety net, and it is what
makes the rest of the design bite:

| Designed elsewhere | What the cap does to it |
|---|---|
| Reassignment costs time (§7) | Reacting late is a **loss**, not just lower income |
| The floor is literal (§6) | A full pile is **visible** — you don't read a number |
| Bottleneck indicator | Too much hysteresis and you are throwing away product |

One mechanism, one consequence. The old design punished over-assembly twice
(stuff piled up *and* sold cheap); this punishes it once, clearly.

**Sizing rule (for `sim.js`, §13.4):** the pile must absorb a *typical* imbalance
for **≥ 30 seconds**, because one redeployment takes 12–15 seconds. A buffer
smaller than that means the player is always chasing a bottleneck that has
already overflowed — that is not difficulty, that is broken.

Pile capacity is upgradeable: **Storage Requisition** in the Logistics tree.

---

## 6. The robots

Three levels, each roughly **10× the work rate** of the one below, plus Rusty,
who is not really a level so much as a liability.

| | RB-00 "Rusty" | Mk I "Bolt" | Mk II "Sprocket" | Mk III "Overseer" |
|---|---|---|---|---|
| Base cost | free, 1 only | $15 | $2,500 | $400,000 |
| Work rate | 0.25/s | 0.5/s | 5/s | 50/s |
| Walk speed | 30 | 45 | 75 | 130 |
| Hands | 1 | 1 | 2 | 4 |
| Defect rate | 40% | 25% | 18% | 12% |
| Durability | 60 | 200 | 900 | 4,000 |
| Programme tree | *shares Mk I's* | Mk I | Mk II | Mk III |
| Personality | Ancient, wheezing, beloved. Never sellable. | Eager, dumb, fast. | Reliable middle manager of robots. | Smug. Occasionally goes **rogue**. |

Cost scaling per unit owned: `cost = baseCost × 1.15^owned`.

**Hands do double duty**, which is what makes the stat interesting: an assembler
with 3 hands builds three units in parallel; a packer with 3 hands carries three
units per trip. The same upgrade means different things depending on the job.

### 6.1 Durability

> **Durability depletes 1 point per unit handled — whether the robot assembled it
> or carried it.**

One rule, both jobs. A unit costs **2 durability** over its life (1 to build, 1
to pack). At 0 the robot enters a failure state and stops.

Because a packer's throughput is walk-bound, packers wear roughly **5× slower**
than assemblers of the same level:

| | Units/sec handled | Relative wear |
|---|---|---|
| Mk I assembling | 0.5 | baseline |
| Mk I packing (~10s round trip, 1 hand) | 0.1 | **1/5** |

Packing is easy work and robots live longer doing it. That is intended, and it is
the third reason to demote old levels to packing.

### 6.2 Old levels don't become garbage

When Mk II arrives, your Mk I units get demoted to packing duty. Three reasons
that stays worthwhile:

1. They still earn **Mk I Service Hours**, so the Mk I tree keeps paying
2. They wear far more slowly (§6.1)
3. **Their defect rate stops mattering** — packers don't produce, so they don't
   produce defects

This is the corporate-satire version of a promotion.

### 6.3 Rusty

Point 3 above resolves Rusty without a special case. His 40% defect rate makes
him actively harmful as an assembler, but once Mk II arrives and he moves to
packing, **that number stops applying**. He becomes merely slow, and harmless.

Which is why the ending works: everyone leaves, and Rusty is still running.
Nobody told Rusty.

### 6.4 The floor is literal

Robots occupy real positions and walk between them. This is not decoration:

- **Walk speed is a real throughput term.** A packer's cycle is
  `walk to pile + pick up + walk to station + deposit`. Half the cycle is travel.
- **Distance is a real cost**, which makes *Floor Reorganisation* a genuine
  upgrade rather than a number tweak.
- **Hands visibly change the picture** — a 4-hand packer walks back with a stack.
- **You can see the bottleneck** before the UI tells you: a full pile with idle
  packers queued at an empty spot reads instantly.

Rendering: **canvas for the floor**; the QC belt and all panels stay DOM, because
they need click targets and text.

**Work effects.** Every completed unit produces a flash ring on the robot, an
arm-swing, a small unit sprite that **arcs from the robot to the pile**, and a
bounce when it lands. Packers show their carried stack above their head. Sealing
a package pops a burst and a floating `+$`.

---

## 7. Job assignment — the deployment verb

**Every robot is either assembling or packing, and you decide which.** This is
the game's second real decision, alongside quality.

- Too many assemblers → the pile fills → **units are destroyed**
- Too many packers → they queue at an empty pile, idle, and you've paid for
  headcount that produces nothing

### 7.1 Two inputs, one system

Dragging and the slider are not alternatives; they are two ways to express the
same thing — a target allocation. It grows in three stages, and each stage
arrives when the previous one stops being pleasant:

| Stage | Floor shows | How you assign |
|---|---|---|
| **Act 1–2** (1–8 robots) | Individuals, with serials and nicknames | **Drag one at a time.** You know each robot. |
| **Act 2–3** (dozens) | Same-level, same-job robots auto-group into **clusters** ("Mk I ×24") | **Drag a cluster**, or set a **ratio slider** per level |
| **Act 4** (hundreds) | Clusters | **Shift Manager auto-balances** to clear the bottleneck |

The Shift Manager ($5M, §9) finally has a real function: he is the automation
layer for this verb, which completes the staff progression in §9.

### 7.2 The robots walk there themselves

The slider sets **intent**. The walking is **execution**, and it takes real time.

This is the whole point. Without a transit cost, the job ratio is a solved
optimisation problem — the player finds the right number once and never touches
it again, and the second decision dies within twenty minutes. With a transit
cost, it never gets solved:

- Moving 20 robots means 20 robots stop, walk, and restart — **your output dips**
- So "should I react?" becomes a real question: will this imbalance persist, or
  is it noise?
- **Over-reacting is punished automatically.** A player who yanks the slider
  constantly has half the factory permanently in transit.

Illustrative transit times across a ~450-unit floor (confirm with `sim.js`):

| | Walk speed | Crossing the factory |
|---|---|---|
| Rusty | 30 | ~15s |
| Mk I | 45 | ~10s |
| Mk II | 75 | ~6s |
| Mk III | 130 | ~3.5s |

Higher levels redeploy faster. That perk falls out of the existing stats; it does
not need designing.

### 7.3 Finish the current task, then walk

> - Mid-assembly → **finish that unit**, then walk
> - Carrying a load → **deliver it**, then walk
> - Walking empty-handed → **turn around immediately**, free

**The best consequence is automatic: this staggers the migration.** With
instant reassignment, twenty robots would down tools simultaneously and your
output would cliff, then spike. Finishing first means fast robots leave first and
slow ones later, so a reassignment is a **trickle across the floor**, not a mass
exodus. Production dips and recovers smoothly. Nobody had to design that; it
falls out of the rule.

**An asymmetry worth keeping.** Because a loaded packer must complete its
delivery first, the worst case for a packer is ~1.5× the floor width, while an
assembler only finishes one unit (2s for Mk I, negligible for Mk III):

> **Sending help to packing is fast. Pulling packers back is slow.**

Thematically right — reinforcing a backlog is easier than abandoning one — and it
means over-reacting to a packing bottleneck costs more to undo.

**Changing your mind is free.** An in-transit robot is empty-handed, so it turns
around at no cost. Committing costs; reconsidering does not.

### 7.4 UI requirements

The slider shows **intent**; the player also needs **actual**, or they will
assume it is broken and yank it again:

```
Mk I   assembly ████████░░░░░░░░ packing      40 / 60
       of 62:  24 assembling · 31 packing · 7 in transit
```

**"In transit" is the instrument for this whole mechanic and is not optional.**

The bottleneck indicator needs **hysteresis** — it must persist for N seconds
before it lights. Without it, it flickers, the player over-corrects, and the
system reads as broken.

---

## 8. What "getting it wrong" looks like

### 8.1 Defect types (things on the belt)

Each type is a **different click interaction**, so the primary verb never gets
stale. Critically, **Technicians must be individually certified on each type**
(§9.2). Automation is never a single binary switch.

| # | Defect | Act | Interaction | Notes |
|---|---|---|---|---|
| 1 | **Misaligned** | 1 | Single click | The bread-and-butter defect. |
| 2 | **Loose Bolts** | 1 | Click 3× rapidly | Rewards click speed. |
| 3 | **Paint Smear** | 1 | Click-and-drag across it | Different muscle, feels great. |
| 4 | **Inverted** | 2 | Click to rotate 180° | Trivially easy, pure rhythm. |
| 5 | **Live Wire** | 2 | Click a small moving spark | Precision. Misclick = brief stun. |
| 6 | **Clone Error** ⚠ | 2 | Single click, but spawns 2 more every 3s if ignored | **Priority target.** Can flood the belt. |
| 7 | **Mislabeled Crate** | 3 | Click to *reject* — fixing it is wrong | Punishes autopilot clicking. |
| 8 | **Overheated Unit** | 3 | Hold to cool | Breaks up tapping. |
| 9 | **Recursive Defect** | 4 | Fixing it creates a smaller one; 3 layers deep | Endgame flavour, big payout. |

Defect types are distinguished by **shape and icon, not colour alone**
(colourblind-safe).

### 8.2 Robot failure states (things on the floor)

| # | State | Act | Interaction | Effect while active |
|---|---|---|---|---|
| 1 | **Offline** | 1 | Click N times — **N = 5 / 10 / 20 for Mk I / II / III** | Produces nothing |
| 2 | **Miscalibrated** ⚠ | 2 | Click when a sweeping needle hits the green zone | Not stopped — defect rate **×3** |
| 3 | **Overheated** | 2 | Hold click to vent | Output halved, wear doubled |
| 4 | **Jammed** | 2 | Click the highlighted jam point | Produces nothing, emits a defect every 2s |
| 5 | **Rogue** 🔴 | 3 | Click 10× fast to shut down | **Actively un-fixes shipped units.** QS drains fast. |
| 6 | **Cascade Failure** | 4 | Repair 3 linked robots within 15s | Neighbouring robots break in sequence |

**Miscalibrated is the design MVP.** The robot *looks* fine and keeps producing —
while quietly poisoning your Quality Score. It rewards players who actually watch
their factory rather than mashing the belt.

**Robots cannot be permanently destroyed.** A robot left broken is a robot not
working; that is punishment enough for an idle-adjacent game.

**A broken robot cannot walk**, so a reassignment issued to it queues until it is
repaired. A migration where three units stay behind blinking red is a good, free
interaction between two systems.

---

## 9. Staff

Hired with Cash, cost scaling `base × 1.18^owned`.

| Staff | Unlock | What it does |
|---|---|---|
| **Technician** 🔧 | $250 | Handles defects and repairs — **only what it is certified on** |
| **Calibrator** 📏 | $25,000 | Passively reduces global defect rate by 4% each (diminishing, capped) |
| **Lubricator** 🛢 | $200,000 | +25% durability to all robots each (diminishing) |
| **Shift Manager** 👔 | $5,000,000 | +15% to all other staff; **auto-balances job assignment** (§7.1) |
| **Quality Director** 🏅 | **$50,000,000** | Sets a QS floor — QS cannot drop below 40% (upgradeable) |

> **Quality Director was $500M in v3**, calibrated for a $1T game. In a $1B game
> that is half the entire target and it would arrive around hour 7 of 8 — too
> late to matter, and too late to enable the Act 4 play in §14.2. $50M puts it at
> the start of Act 4.

### 9.1 The Technician (merged from Foreman + Robot Doctor)

One role: **the person who follows the robots around fixing what they broke.**

> ▸ Technician #14 has been reassigned. Technician #14 was not consulted.

Merging two staff types into one risked collapsing two teaching beats ten minutes
apart into a single moment. It doesn't, because the *capability* unlocks in two
stages:

| When | What |
|---|---|
| **$250** | First Technician — **certified for defects only** |
| **~$2,500** | **Maintenance Certification** unlocks — Technicians can now be assigned to robot repair |

Two beats, one staff type. The ten minutes in between — *someone helps with the
belt, but the machines are still yours to fix* — is a genuinely good pressure
state and it survives.

### 9.2 Certification — automation is never one switch

A Technician only handles what it has been certified on. Uncertified work sails
right past. Twelve certifications total:

- **9 defect certifications**, one per type in §8.1
- **3 failure-group certifications**: *Basic Repair* (Offline, Miscalibrated),
  *Heat & Jams* (Overheated, Jammed), *Containment* (Rogue, Cascade)

Certifications are bought with Cash and are a major Act 2–3 sink.

### 9.3 Technicians get assigned too

Once you have **3 or more**, Technicians need deploying between the **belt** and
the **floor** — exactly the same verb as §7, one layer up:

> You have 6 Technicians. How many watch the belt, how many walk the floor?

The player learns dragging once and uses it in two places. The whole operational
vocabulary of the game collapses to: **click the problem, or move someone to it.**

### 9.4 Priority Client (the attention hook)

Every 60–180s a **Priority Client Unit** appears on the belt: glowing gold,
**ignored by Technicians** (the paperwork is above their pay grade), worth **50×
base value** and **+5 QS instantly**. Lives 8 seconds.

This is what keeps a late-game player watching a belt they have otherwise
automated.

---

## 10. Skill trees

Four trees. Currencies are **earned by doing**, so every tree grows out of the
part of the factory it improves.

| Tree | Currency | Earned by |
|---|---|---|
| Mk I Programme | Mk I Service Hours | Mk I (and Rusty) doing work, either job |
| Mk II Programme | Mk II Service Hours | Mk II doing work |
| Mk III Programme | Mk III Service Hours | Mk III doing work |
| Logistics | Logistics Points | Sealing packages |

### 10.1 The Programme tree — trunk plus two branches

Identical shape for all three levels, so the player learns it once. Because
robots move between jobs freely (§7), the tree describes **what your factory is
good at**, not which robot does what — investment never punishes redeployment.

```
                     ┌─ ASSEMBLY ─── Hydraulic Upgrade   5 · +15% work speed
                     │               Tolerance Control   4 · −15% defect rate
   TRUNK ────────────┤
   Additional Arm  3 │
   Hardened Chassis 4│
   Quick Restart   3 └─ PACKING ──── Servo Legs          5 · +20% walk speed
   Unpaid Overtime 3                 Quick Hands         3 · −25% pick-up/deposit
```

| Node | Ranks | Effect per rank |
|---|---|---|
| **Additional Arm** | 3 | +1 hand (parallel assembly *or* carry capacity) |
| **Hardened Chassis** | 4 | +35% durability |
| **Quick Restart** | 3 | −25% repair effort when it breaks |
| **Unpaid Overtime** | 3 | +30% work speed, **+20% wear** — the trade-off node |
| **Hydraulic Upgrade** | 5 | +15% work speed *(assembly)* |
| **Tolerance Control** | 4 | −15% defect rate, multiplicative *(assembly)* |
| **Servo Legs** | 5 | +20% walk speed *(packing)* |
| **Quick Hands** | 3 | −25% pick-up and deposit time *(packing)* |

*Servo Legs* is quietly the most interesting node, because walk speed also
determines **redeployment speed** (§7.2). A player who never redeploys does not
need it; a player who plays reactively cannot live without it. Same node, wildly
different value by playstyle.

*Unpaid Overtime* is the one with teeth: raw speed at the cost of breaking more
often, correct only if your Technician coverage can absorb it.

> **When Mk II arrives and your Mk I units move to packing, you start pouring Mk I
> hours into the packing branch.** Same tree, shifted centre of gravity. This is
> what keeps an obsolete level's tree alive.

### 10.2 Logistics tree

| Node | Ranks | Effect per rank |
|---|---|---|
| **Bigger Boxes** | 5 | +3 units per package |
| **Bundle Premium** | 5 | +20% package value |
| **Automatic Sealer** | 4 | +30% sealing speed |
| **Pallet Jacks** | 3 | +2 carry capacity for every packer |
| **Floor Reorganisation** | 3 | Pile moves 15% closer to the pack station |
| **Storage Requisition** | 3 | **+N output pile capacity** |

*Floor Reorganisation* only exists because the floor is spatial — it shortens both
the packer cycle and redeployment. It's the node that justifies the whole rebuild.

*Storage Requisition* replaces v3's *Loose Freight Contract*, which improved a
loose-freight rate that no longer exists (§5.2). A capped pile makes raising the
cap a necessary purchase.

---

## 11. The four acts

Each act introduces **one new thing to manage**, escalating:

> **things → the line → people → survival**

The three robot levels land at act boundaries, but they are the **prize** of an
act, not its definition. Act 4 has no new level, because Act 4 is not about
getting bigger.

| | Act | You manage | New systems | Robots | Time | Ends near |
|---|---|---|---|---|---|---|
| **1** | **One Pair of Hands** | **Quality** | Assembly, QC belt, repair, Technician | Rusty → Mk I | 0–25 min | $10K |
| **2** | **The Line** | **Throughput** | Pile, packing, **job assignment**, Logistics | Mk II | 25 min–2h | $1M |
| **3** | **Dispatch** | **People + Parts** | Certification, technician assignment, Parts, Workshop | Mk III | 2–5h | $100M |
| **4** | **Sustain** | **Survival** | **Parts upkeep**, cascade failure | *none* | 5–8h | **$1B** |

### Act 1 — One Pair of Hands (0–25 min)

No pile, no packing, no Parts. Units assemble, ride the QC belt if defective, and
**ship directly at 1.0×**. You are the only labour in the building.

Defects 1–3. Failure state 1. Technician at $250 (defects only). Mk I Programme
opens.

### Act 2 — The Line (25 min – 2h)

> *To all staff: effective immediately, loose shipment no longer meets client
> expectations. This facility will adopt packaging operations. Labour allocation
> is left to the floor.*

The pile, the pack station, and **job assignment** arrive together. Packaged units
are worth 1.5×. Mk II arrives, and your Mk I units start their long career as
packers.

Defects 4–6. Failure states 2–4. Maintenance Certification ($2,500), Calibrator,
Lubricator. Mk II Programme and Logistics open.

This is the densest act — about fifteen new things over 95 minutes — because this
is where the game becomes itself.

### Act 3 — Dispatch (2–5h)

The longest act, and the middle game. Mk III arrives. You stop touching individual
robots and start managing groups: clusters, sliders, and Technicians who need
deploying themselves (§9.3). The Parts economy and the Workshop open.

Defects 7–8. Failure state 5 (Rogue). Shift Manager.

### Act 4 — Sustain (5–8h)

> *To all staff: high-tier units now fall under the Consumables Accountability
> Programme. Units without allocated Parts will enter a rest state. This is not a
> cost increase.*

No new robot level. You are no longer growing — you are keeping a very large
machine alive with a wrench. See §14.

Defect 9. Failure state 6. Quality Director.

---

## 12. Opening sequence (first 5 minutes)

| Time | What happens | What it teaches |
|---|---|---|
| 0:00 | Empty floor. One dead robot, **RB-00 "Rusty"**, slumped and sparking. Cash $0. Prompt: *"Fix it."* | The repair verb is the first click of the game. |
| 0:05 | ~10 clicks bring Rusty online. He shudders to life and produces 1 unit every 4s at $1. | Production exists. Money goes up. |
| 0:20 | Rusty's defect rate is **40%**. Defective units ride the belt, wobbling, marked `!`. Prompt: *"That one's wrong. Fix it."* | The fix verb. A high early defect rate guarantees constant clicking. |
| 0:30 | Fixed defects pay **2×** (salvage). Ignored ones fall off the belt end into the scrap bin and the QS gauge visibly drops. | Fixing pays; ignoring costs. |
| 1:30 | ~$15 banked. **Mk I "Bolt"** unlocks. First purchase. Output doubles. | The buy verb, and the core dopamine hit. |
| 3:00 | Rusty breaks down again (wear). This time the player knows what to do. | Breakdowns recur; they are not a one-off. |
| 5:00 | ~4 robots. Defects arrive faster than is comfortable. **Technician** unlocks at $250. | The player *feels* the need for automation before it is offered. |

**Design rule:** never offer automation before the player has felt the pain it
solves. Every unlock sits ~60 seconds after the corresponding chore stops being
fun.

### 12.1 Teaching the fourth verb

Job assignment is introduced in Act 2 with the same rule — **let the player feel
it first**:

| Time | What happens |
|---|---|
| ~26 min | The pile appears. Units start accumulating. Nothing is wrong yet. |
| ~28 min | The pile fills. The first overflow is destroyed. The ticker notes it, flatly. |
| ~28:10 | Prompt: **"Drag a robot to the pack station."** |

The player watches product evaporate for twenty seconds before being handed the
solution. That is the lesson.

---

## 13. Numbers

### 13.1 Formulas

```
assemblyRate     = Σ(assemblers[L] × workRate[L] × hands[L] × speedMult[L])
packRate         = Σ(packers[L] × carryCapacity[L] / cycleTime[L])
cycleTime[L]     = (2 × pileToStationDistance / walkSpeed[L]) + handlingTime[L]

throughput       = min(assemblyRate, packRate)        ← NOT a sum
pileDelta        = assemblyRate − packRate            ← overflow is destroyed
defectsPerSec    = Σ(assemblers[L] × workRate[L] × defectRate[L])

unitValue        = baseValue × (0.5 + QS)
packagedValue    = unitValue × packSize × bundleBonus
income/sec       = throughput × packagedValue / packSize
                 + (defectsFixed/sec × unitValue × salvageBonus)

robotCost(L, n)  = baseCost[L] × 1.15^n
staffCost(r, n)  = baseCost[r] × 1.18^n
```

**`throughput` is a `min()`, not a sum.** This is the single most important change
from v2's arithmetic, and it is exactly the kind of curve that misbehaves in ways
a spreadsheet hides.

### 13.2 Why the goal is $1B and not $1T

Without prestige, every multiplier is **bounded** by its node's rank cap. A rough
ceiling calculation:

| Source | Multiplier |
|---|---|
| Hydraulic Upgrade, 5 ranks × 15% | 1.75 |
| Additional Arm, 3 ranks (4 → 7 hands) | 1.75 |
| Unpaid Overtime, 3 ranks × 30% | 1.90 |
| **Work speed total** | **≈ 5.8×** |
| QS at 100% | 2.0 |
| Bundle bonus, fully invested | 3.0 |
| **Unit value total** | **≈ $6** |

Robot count is capped in practice by `400,000 × 1.15^n`. The 60th Mk III costs
$1.75B — about **4.7 hours** of income to afford — so players top out around
**50–55 units**.

```
50 × 50/s × 5.8 × $6  ≈  $87,000 / second at peak
```

| Target | Time at peak rate |
|---|---|
| **$1,000,000,000** | **~3.2 hours** → ~8 hours including the ramp ✅ |
| $10,000,000,000 | ~32 hours ❌ |
| $1,000,000,000,000 | ~3,200 hours ❌ |

$1T is off by three orders of magnitude. $1B is the honest number for this
structure, and "make a billion dollars" is a cleaner goal anyway.

### 13.3 Pacing

The game splits in half, and the halves are different games:

```
$0 ─────────────► $100M              $100M ──────────► $1B
   GROWING (Acts 1–3)                  SUSTAINING (Act 4)
      ~5 hours                            ~3 hours
   buy, upgrade, expand              Parts upkeep, manual repair
```

**Deliberately not writing a milestone table here.** v3's was inherited from a
prestige structure that no longer exists, and §13.4 is the correct way to produce
one.

### 13.4 The simulator comes first

**Build a headless JS balance simulator (`sim.js`) before finalising Act 3–4
numbers.** It runs a scripted "reasonable player" policy over simulated hours and
outputs the pacing table, plus Parts-sustainability curves for §14. Every tuning
change gets re-run against it. ~200 lines, and it will save days.

Two things it must check first:

1. **Does `min()` behave?** A bottleneck between two rates is where curves
   misbehave invisibly.
2. **Is the pile cap ≥ 30 seconds of typical imbalance?** (§5.2) If not, the
   whole reassignment mechanic is unplayable.

---

## 14. The endgame — Parts upkeep

Act 4 robots don't just cost money to buy. They cost **Parts to keep running,
forever.**

**How it works:**

- Every Mk III consumes Parts continuously — `upkeep = baseUpkeep × count`,
  scaling faster than its income contribution
- A robot with no Parts allocated doesn't break — it goes **idle**. Your $/sec
  quietly collapses and the ticker calls it "a rest state."
- **Parts come overwhelmingly from your own hands.** Technician auto-repairs
  yield ~15% of what a manual repair does. The Workshop narrows the gap and never
  closes it.

**Why this is the right sink:**

1. It converts the endgame from *watching a number* into *sustaining a machine*.
2. It makes manual repair — which Act 3 would otherwise automate away — the
   **most valuable action in the game**, precisely when the player would
   otherwise stop clicking.
3. It is self-balancing. Buying more Mk III is only correct if you can service
   them, so the player throttles their own growth.
4. It is extremely funny in the corporate register. You are the CEO. You are also
   the only one doing any work.

**Balance target:** through the $100M → $1B stretch, a fully engaged player should
sustain ~70% of their robots. Walking away should decay to ~25% within an hour.

**Where the Parts come from:** Mk III assemblers at 50 units/sec burn 50 durability
per second, so 4,000 durability lasts ~80 seconds. **They fall over constantly**,
and that is your supply. The picture of Act 4 is you running between a row of
collapsing high-end machines with a wrench.

### 14.1 Robots cannot be permanently destroyed

A robot left broken is a robot not earning. That is punishment enough. Restart
cost scales with time spent broken, in Parts.

### 14.2 The Act 4 trade-off: scrap for Parts

§4 lists **scrapping defects** as a Parts source. Surfacing it gives Act 4 a real
strategic choice:

> **You can deliberately let defects time out, to farm Parts.**
> QS falls → sale multiplier falls.
> Parts rise → Mk III keeps running.

This is why the **Quality Director** matters and why it moved to $50M (§9): a QS
floor is what makes deliberately letting go *survivable*. It stops being a
safety net and becomes the tool that enables a playstyle.

No new system, and it lands in the act with the least new content.

---

## 15. Away-from-keyboard

**There is no offline progress.** Tab hidden → **paused**. Tab shown → resumes.
**Autosave on hide.**

(Browsers throttle timers in hidden tabs anyway, so "keeps running" would run
inaccurately. Explicitly pausing is the only honest implementation.)

### 15.1 Tab open, player away

Pausing on hide moves the boundary but doesn't remove the question: a player who
leaves the tab open and walks away still comes back to unfixed defects and a
full pile.

**§9 already answers this.** Automation *is* the away protection:

- **Act 1, away 10 minutes** → disaster. You are the only labour.
- **Act 4, away 10 minutes** → reduced efficiency. The factory holds itself up.

Tolerance for stepping away grows naturally with progress, as a direct
consequence of the staff progression. No new system.

### 15.2 Saving is now critical, not nice-to-have

In a prestige game, a lost save costs one run. **Here it costs the entire game,
and the player never sees the ending.**

So §17's save requirements — localStorage with an in-memory fallback,
**export/import save string**, autosave every 20s and on tab hide, and save
versioning with a migration function from day one — move into **Phase 1**. They
are not a polish item.

---

## 16. Screen layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  $12,480   ▲ $340/s        QUALITY ████████░░ 82%        ⚙ 1,240        │
├──────────────────────────────────────────────┬─────────────────────────┤
│                                              │ ROBOTS│JOBS│STAFF│TREES │
│   FACTORY FLOOR (canvas)                     ├─────────────────────────┤
│                                              │                         │
│   [🤖] [🤖] [🤖⚡]    ▪▪▪▪▪    ┌────┐        │  Mk I "Bolt"     ×24    │
│   [🤖] [🤖] [🤖🔥]    ▪▪▪▪▪ →  │ 📦 │ → $$$  │  $412            [BUY]  │
│                       PILE     └────┘        │                         │
│                                              │  Mk II "Sprocket" ×8    │
│  ASSEMBLY 412 u/s → PACKING 268 u/s    ⚠     │  $1,204          [BUY]  │
│  ─────────────────────────────────────────►  │                         │
│   QC BELT   ▣  ▣!  ▣  ▣!!  ▣      → 🗑        │  JOB SPLIT              │
│  ─────────────────────────────────────────►  │  Mk I  ███░░░░  20/80   │
├──────────────────────────────────────────────┴─────────────────────────┤
│  ▸ MK1-17 shipped a unit in pre-owned condition. Quality −0.4%          │
│  ▸ Packing is the constraint. Management is confident.                 │
└────────────────────────────────────────────────────────────────────────┘
```

- **Top bar:** Cash, $/sec, the big Quality gauge, Parts. *No Blueprints, no
  Recall button* — neither exists. QS now has the top bar largely to itself,
  which suits the spine of the design.
- **Left/centre:** the factory. Assembly bays, the pile, the pack station,
  shipping. Everything clickable is a ≥32px target.
- **Between floor and belt:** the pipeline readout — assembly rate, pack rate,
  in-transit count, and the bottleneck (with hysteresis, §7.4).
- **Right panel:** tabbed — Robots / Jobs / Staff / Workshop / Trees / Stats
- **Bottom:** the event ticker, where the game's personality lives
- **Skill trees:** full-screen overlay, SVG nodes and connectors, pan + zoom

Mockups of the main screen, the opening, and a Programme tree exist in the repo at
`design/screens.html`. They predate this document in two places: they show a
Blueprints counter and a Recall button, and the job split has no "in transit"
line.

### Art & juice

- No external assets. Chunky flat-vector robots built from CSS/SVG shapes with
  distinct silhouettes per level.
- Floating `+$12` numbers on every fix, particle sparks on breakdowns, a small
  screen-shake when a robot dies, belt motion via CSS transforms.
- Sound synthesised with WebAudio — no files. A satisfying *chunk* on fix, a
  descending whine on breakdown, a chime on a Priority Client. Muted by default
  with an obvious unmute.
- Defect types differ by **shape and icon**, not colour alone.
- `prefers-reduced-motion` respected; a "calm mode" toggle kills shake and
  particles.
- Hold-to-fix as an alternative to rapid clicking, for accessibility and wrists.

---

## 17. Tech decision

**Single-file HTML with vanilla JS, canvas floor + DOM UI.**

- You get a `.html` file you double-click. No Node, no build, no install.
- The floor goes to **canvas** (many moving robots, arcs, particles); the QC
  belt and every panel stay **DOM**, because they need click targets, text and
  accessibility.
- Vanilla keeps the whole thing readable in one place, which matters most while
  the design is still moving.

**But structured to escape it.** Organised as if it were already modules — a pure
`state` object, a `tick(dt)` with zero DOM access, a `render()` with zero game
logic, and data-driven config tables (robots, defects, staff, tree nodes) as
plain arrays at the top. Splitting into Vite + TypeScript later is mechanical.

**When we'd migrate:** past ~4,000 lines, or the moment you want a Steam/mobile
build.

**Saving:** see §15.2. This is Phase 1 work.

---

## 18. Build plan

| Phase | Deliverable | What's in it |
|---|---|---|
| **0** | *This document* | Design approved before code |
| **1** | `engine skeleton` | State object, fixed-timestep tick, number formatting, **save/load + versioning + export/import**, UI shell, config tables |
| **2** | **First playable** | Rusty, production, belt, defect type 1, click-to-fix, Quality Score, Cash, Mk I. **Act 1 only.** |
| **3** | `the line` | Pile + cap, packing, **job assignment and walking**, Logistics tree, Mk II — all of Act 2 |
| **4** | `breakdowns & staff` | Durability, failure states, Technician, certification, technician assignment |
| **5** | `depth` | Mk III, Parts + Workshop, remaining defect/failure types, Priority Clients, Acts 3–4 |
| **6** | `balance` | **`sim.js`**, full curve tuning against §13, Parts upkeep |
| **7** | `polish` | Juice, WebAudio, achievements, mobile touch layout, accessibility pass |

**Checkpoint after Phase 2 is the important one.** The entire game rests on
whether clicking a defect off a belt feels as good as it needs to. If it doesn't,
we change the verb then — cheaply — rather than after the trees are built on top
of it.

**Checkpoint after Phase 3** is the second one: does the walking make job
assignment feel like a decision, or like waiting?

---

## 19. The ending — "The Board Buys You Out"

At **$1,000,000,000**, production halts on its own.

> *A car arrives. Nobody called a car.*
>
> *The board has elected to acquire your holdings. The terms are extremely
> favourable and entirely non-negotiable. Your badge will be deactivated at the
> end of the day. Please do not take the robots.*

**Beat sequence:**

1. The factory goes quiet. The belt stops mid-item. A packer stops mid-walk,
   still holding two units. The ticker, for the first time in the entire game,
   says something plainly: *"It's over. You did it."*
2. **The Exit Interview** — a full statistics screen, framed as a performance
   review:

| Metric | Your result | *Assessment* |
|---|---|---|
| Units shipped | ~200,000,000 | *Exceeds expectations* |
| Defects personally corrected | ~400,000 | *Exceeds expectations* |
| **Defects you let go** | ~4,600,000 | *Meets expectations* |
| Units destroyed by pile overflow | — | *Needs improvement* |
| Robots repaired | — | *Exceeds expectations* |
| Reassignments issued | — | *— see HR* |
| Time served | 8h 04m | *— see HR* |
| Peak Quality Score | 99.4% | *Exceeds expectations* |
| Final Quality Score | 61% | *We'll talk.* |

> Figures are order-of-magnitude placeholders for a $1B run at ~$5 average unit
> value. `sim.js` produces the real ones. **They must be consistent with §13** —
> v3's ending quoted 4.18 billion units shipped, which was a $1T number.

3. **Credits**, over a slow pan across the empty factory floor. Rusty is still
   there. Rusty is still running. Nobody told Rusty.
4. **"Stay late?"** — an optional endless mode. Keeps your save, the counter
   keeps climbing. No new content, no pressure.

"Defects you let go" is the emotional payoff of the entire Quality Score system.
The game has been silently counting the whole time, and only tells you at the end.

**Without prestige this lands harder.** There is no eighth run to dilute it — you
arrive once.

---

## 20. Open questions

1. **Rusty's fate** — the ending has Rusty still running after everyone leaves.
   Too sentimental for the satire, or exactly right?
2. **Achievement volume** — a tight ~30 that each mean something, or ~120 for
   completionists?
3. **Cluster threshold** — at how many robots does the floor switch from
   individuals to clusters (§7.1)? Guess: 12. Needs playtesting, not analysis.
4. **Does the pack station need a queue?** If several packers arrive at once, do
   they queue, or does the station absorb them in parallel? A queue makes
   *Automatic Sealer* far more important and adds a third bottleneck.

*(v3's question about Contract Unit naming is resolved: they are **Priority
Client Units**, and Technicians ignore them because the paperwork is above their
pay grade. v3's question about permanent robot destruction is resolved: no —
§14.1.)*

---

## 21. Changelog — what changed from v3, and why

### The structural fault v4 exists to fix

v3 was written as an overlay: *"Everything below supersedes the corresponding v2
section. Section 5 and the single skill tree in section 8 are replaced."*

Replacing all of §8 deleted 56 nodes across four branches, but v3 only replaced
the **robot** parts of it. Nine systems were left pointing at nodes that no longer
existed:

| Orphaned | Lived in |
|---|---|
| Foreman per-defect-type certification | Quality branch |
| Offline earnings | Commerce branch |
| Patents unlock | Commerce capstone |
| Blueprint yield per recall | Commerce branch |
| Robot cost-curve improvement | Throughput branch |
| The QS multiplier's growth | Commerce branch |
| The player's own click power | Quality branch |
| Miscalibration warning | Maintenance branch |
| Rusty's redemption | Maintenance capstone |

**And it severed the prestige loop.** v3's trees are funded by Service Hours,
earned by robots that a Recall deletes. Blueprints — the only permanent currency
— had nothing left to buy. Every run would have been identical, so the "each run
2.5× faster" target, the 6–10 run structure, and the 12-hour length all rested on
something that no longer existed.

**v4 is therefore self-contained.** No future revision should be written as a
partial overlay.

### Decisions

| # | Change | Reason |
|---|---|---|
| 1 | **No prestige.** One run, $1B, ~8 hours | Chosen directly. It also makes §10's "earned by doing, not granted by prestige" self-consistent for the first time |
| 2 | Blueprints and Patents deleted; §9 (Product Recall) deleted | No prestige, no prestige currencies |
| 3 | Goal $1T → **$1B** | Bounded node ranks cap peak income near $87K/s; $1T is ~3,200 hours away (§13.2) |
| 4 | Length 12h → **8h** | No "each run is faster" hook to carry the time; content density works out to one new thing per ~16 min |
| 5 | **Four acts by management object**, not by tier unlock | Three levels can't gate four acts. things → line → people → survival |
| 6 | **Job assignment is drag/slider, and robots walk there** | The floor is already spatial. Transit cost stops the job ratio from being a solved optimisation |
| 7 | **Finish current task, then walk** | Avoids a production cliff; staggers migration for free |
| 8 | Programme tree → **trunk + assembly branch + packing branch** | Robots move between jobs, so the tree must describe the factory, not the robot |
| 9 | Foreman + Robot Doctor → **Technician**, two-stage unlock | One job thematically; staged capability preserves both teaching beats |
| 10 | Durability = **1 per unit handled** | v3's "per unit produced" made packers immortal and starved the Parts economy |
| 11 | Pile has a **cap; overflow is destroyed**. Loose freight chute removed | One mechanism, one consequence. Makes transit cost bite |
| 12 | Value anchor: Act 1 direct = 1.0×, packaged 1.5× → 3.0× | v3's 0.35× penalty would have made Act 2's new system an immediate pay cut |
| 13 | *Loose Freight Contract* → **Storage Requisition** | Its subject no longer exists; a capped pile needs a cap upgrade |
| 14 | Act 1 has **no pile at all** | Simpler to teach; packing arrives whole in Act 2 |
| 15 | **No offline progress**; pause on hide | Chosen directly. Automation already covers stepping away (§15.1) |
| 16 | Quality Director $500M → **$50M** | $500M was calibrated for $1T; it would have arrived at hour 7 of 8 and gated §14.2 |
| 17 | Scrapping-for-Parts surfaced as an **Act 4 playstyle** | Already in v3's currency table, never used. Fills the thinnest act |
| 18 | `throughput = min(assembly, pack)`, not a sum | v3 admitted its own §10 arithmetic was v2's |
| 19 | Failure state 1: `N = 5 × tier` → **5 / 10 / 20 per level** | v2 leftover; "tier" no longer means anything |
| 20 | Parts upkeep: "T5/T6/T7" → **Mk III** | v2 leftover; there is no T5 |
| 21 | New node: **Quick Hands** (packing branch) | The packer cycle is walk + handle; the tree only covered walk |
| 22 | Rusty needs no special case | Packers have no defect rate, so demotion neutralises him (§6.3) |

### Carried over unchanged

The voice rules (§2), Quality Score and its multiplier (§3), the nine defect
types and six failure states (§8), the three-level robot table (§6), hands doing
double duty, Priority Client Units (§9.4), the tech stack (§17), and the ending's
shape (§19).
