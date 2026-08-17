---
title: Oops Inc. — Game Design Document
project: oops-inc
type: design-doc
version: v3
status: in-progress
updated: 2026-08-16
tags: [gamedev, incremental-game, design-doc, oops-inc]
---

# OOPS INC. — Game Design Document

> *an honest mistake, at scale*

**Title:** Oops Inc.
**Genre:** Active incremental / clicker
**Tone:** Dry corporate satire
**Platform:** Web page first (single-file HTML), portable to desktop & mobile later
**Goal:** Reach **$1,000,000,000,000** in lifetime revenue
**Target playtime to goal:** ~12 hours of active play, across ~6–10 prestige runs
**Version:** Design doc **v3** — pipeline, robot levels, and per-level skill trees

### Decisions locked in v2

| Question | Decision |
|---|---|
| Name | **Oops Inc.** |
| Tone | **Dry corporate satire** — see §2.1 |
| Core verb | **Fix the defects** (robots produce; you do quality control) |
| Endgame sink | **Parts upkeep**, gated by manual repair throughput — see §10.1 |
| Offline progress | **Yes, capped and unlockable** via the Commerce branch |
| Ending at $1T | **The board buys you out** — credits, full stats, optional endless mode |
| Tech stack | **Single-file HTML, vanilla JS, canvas floor + DOM UI** — see §12 |
| Pipeline | **Assemble → QC → pile → pack → ship.** Robots do packing too — see §5A |
| Robot levels | **Three** (Mk I / II / III), each ~10x the last, each with its own skill tree |
| Movement | **Literal** — robots walk the floor; walk speed and distance are real |
| Tree currency | **Service Hours, per level** — earned by that level doing work |
| Assignment | **Ratio slider per level** — % assembly vs % packing |

---

## 1. The pitch

You inherit a derelict robot factory with **$0 and one dead robot on the floor**.

Robots build things. Robots also **get it wrong**. Your job is not to build — it's to catch what the robots screwed up before it ships, and to keep the robots themselves alive. Every robot you add makes you more money *and* more mess. Scaling the factory means scaling the cleanup: first with your own hands, then with **Foremen** who catch defects for you, then **Robot Doctors** who repair breakdowns, then with a skill tree that makes the whole machine hum.

The tension that drives the entire game: **more production is worthless if quality collapses.**

### Why this is a distinct game

The three reference games share a shape: one tactile object, a satisfying repeated action, a shop, a skill tree, and helpers that automate the action.

| Game | Tactile object | Verb | Automation | Meta-layer |
|---|---|---|---|---|
| Dirt Clicker | Patch of dirt | Dig | Mushroom Buddies, Golems, Druids | Skill tree, tool tiers, deeper layers |
| Bottle Flip Inc | Bottle | Flip | Helper hands | Caps → skill tree, unique abilities |
| Bills Must Be Paid | Piggy bank | Smash (stamina-limited) | — (run-based) | Bankruptcy → legacy points → rings/bracelets |

All three make the player **produce**. Oops Inc. makes the player **correct**. That single inversion gives us mechanics none of them have: quality as an economic multiplier, automation that is *partial* (a Foreman only handles defect types you've trained it on), and an antagonist that is your own workforce.

What we borrow deliberately:
- **Dirt Clicker:** tiered helper roster with personality, a skill tree that buffs both tools *and* workers, collectibles as a secondary discovery loop.
- **Bottle Flip Inc:** a second currency extracted from the object itself (caps → Parts), spent in a tree separate from cash.
- **Bills Must Be Paid:** the meta-progression *is* a failure state. Bankruptcy there = **Product Recall** here. Also its sense of humour — the upgrade names are half the fun.

### 2.1 Voice — dry corporate satire

The joke is that this is a functioning business with a compliance department, and it is on fire.

**Rules of the voice:**
1. **The game never acknowledges that anything is wrong.** Eleven robots offline is "a temporary throughput variance." A rogue robot destroying your inventory is "an unscheduled workflow deviation."
2. **Understate the disaster, oversell the trivia.** A catastrophic cascade failure gets one flat line in the ticker. Buying your 25th robot triggers a full congratulatory banner.
3. **Everything is a euphemism.** Never "broken" — *non-operational*. Never "you lost money" — *value was not realised*. Never "defect" in customer-facing text — *pre-owned condition*.
4. **The player is management, and management is the problem.** Upgrade names sound like initiatives imposed from above. The robots have no say.
5. **No exclamation marks except where a corporation would use them** — i.e. exclusively in announcements nobody wanted.

**Sample ticker lines:**
```
▸ RB-01 #17 shipped a unit in pre-owned condition. Noted in its file.
▸ Congratulations! You have unlocked SYNERGY BOLTS.
▸ GH-3 #2 has gone rogue. HR has been notified.
▸ Quality is trending downward. Management is confident.
▸ FA-4 #9 is on fire. Fire is a known operating state.
▸ Reminder: Rusty has now worked 40,000 consecutive hours.
▸ Recall filed. The lawyers send their regards.
```

**Naming conventions:**
- Skill tree nodes are **corporate initiatives**: *Synergy Bolts, Q3 Efficiency Mandate, Voluntary Overtime, Rightsizing, The Calibration Directive*
- Staff are **job titles, dehumanised**: Foreman, Robot Doctor, Calibrator, Shift Manager, Quality Director
- Achievements are **performance review outcomes**: *Meets Expectations, Exceeds Expectations, Whoopsie Daisy, Somebody Noticed*
- Robots have **serial numbers and nicknames**, because someone in the break room named them and it stuck

---

## 2. Core loop

```
        ┌─────────────────────────────────────────────┐
        │                                             │
   Robots produce widgets ──► good widgets ship ──► CASH
        │                                             │
        ├──► DEFECTIVE widgets ride the QC belt        │
        │        │                                     │
        │        ├── you click to fix ──► ships (+salvage bonus)
        │        ├── a Foreman fixes it ──► ships
        │        └── it times out ──► SCRAPPED, Quality Score drops
        │                                             │
        └──► robots WEAR DOWN ──► break down ──► produce nothing
                 │                                     │
                 ├── you click to repair               │
                 └── a Robot Doctor repairs it         │
                                                       │
   CASH ──► more robots, better robots, staff, line upgrades ──┘
   CASH ──► (at a threshold) PRODUCT RECALL ──► Blueprints ──► skill tree ──► stronger next run
```

### The three things the player is always doing

1. **Fixing defects** (click the belt) — the primary verb, ~70% of clicks
2. **Repairing robots** (click the floor) — the interrupt verb, ~20% of clicks
3. **Spending** (click the shop/tree) — the decision verb, ~10% of clicks

### Quality Score — the stat that makes it a game

`Quality Score (QS)` = rolling percentage of the last 200 produced units that shipped in good condition.

**Sale price multiplier = 0.5 + QS**

- QS 100% → widgets sell for **2×** base
- QS 50% → widgets sell for **1×** base
- QS 0% → widgets sell for **0.5×** base

This is the spine of the design. It means letting defects slip past is not a small missed bonus — it's a **4× income swing** between sloppy and perfect play. It's why hiring a Foreman feels like a raise, why the endgame still wants your attention, and why "just buy more robots" is a trap if you haven't scaled QC alongside.

QS is displayed as a big, always-visible gauge that visibly wobbles as you play.

---

## 3. Opening sequence (first 5 minutes)

The first five minutes have to teach three verbs and give the player $0 → visible growth. Beat by beat:

| Time | What happens | What it teaches |
|---|---|---|
| 0:00 | Empty factory. One dead robot, **RB-00 "Rusty"**, slumped and sparking. Cash: $0. Prompt: *"Fix it."* | The repair verb is the very first click of the game. Starting with zero means starting with a broken thing. |
| 0:05 | ~10 clicks bring Rusty online. He shudders to life and starts producing 1 widget every 2s at **$1** each. | Production exists. Money goes up. |
| 0:20 | Rusty's defect rate is **40%** — he's a rust bucket. Defective widgets start riding the belt, wobbling and marked with a red `!`. First one triggers a prompt: *"That one's wrong. Fix it."* | The fix verb. High early defect rate guarantees constant clicking. |
| 0:30 | Player learns fixed defects pay **2×** (salvage bonus). Ignored defects fall off the belt end into the scrap bin and the QS gauge visibly drops. | Fixing pays; ignoring costs. |
| 1:30 | ~$15 banked. **RB-01 "Bolt"** unlocks in the shop. First purchase. Output doubles. | The buy verb, and the core dopamine hit. |
| 3:00 | Rusty breaks down again (wear). This time the player knows what to do. | Breakdowns are recurring, not a one-off. |
| 5:00 | ~4 robots. Defects arrive faster than comfortable. **Foreman** unlocks at $250. | The player *feels* the need for automation before it's offered. |

**Design rule:** never offer automation before the player has felt the pain it solves. Every helper unlock is placed ~60 seconds after the corresponding chore stops being fun.

---

## 4. Currencies

| Currency | Earned from | Spent on | Resets on prestige? |
|---|---|---|---|
| **Cash ($)** | Shipping widgets | Robots, staff, line upgrades | Yes |
| **Parts** ⚙ | Repairing robots, scrapping defects (unlocks Act 3) | Workshop: repair-side & QC-side upgrades, robot mods | Yes |
| **Blueprints** 📐 | Product Recall (prestige) | Skill tree | **No** — permanent |
| **Patents** 🏛 | Second prestige, Act 4 only (stretch) | Global multipliers, tree respec, QoL | No |

Three currencies is right for this genre, but they're **staged**: Act 1–2 has only Cash. Parts arrive in Act 3, Patents in Act 4. Complexity grows with the player.

---

## 5. The robots

Each tier is roughly **×7 output** at **×20–30 base cost**, with a **lower defect rate but higher absolute defect volume**. Cost scaling per unit owned: `cost = base × 1.15^owned` (genre standard; tuned per tier in the balance pass).

| Tier | Name | Base cost | Output (w/s) | Defect rate | Durability | Personality |
|---|---|---|---|---|---|---|
| 0 | **RB-00 "Rusty"** | free, 1 only | 0.5 | 40% | 60 | Ancient, wheezing, beloved. Never sellable. |
| 1 | **RB-01 "Bolt"** | $15 | 0.5 | 25% | 200 | Eager, dumb, fast. |
| 2 | **RB-02 "Sprocket"** | $250 | 3 | 18% | 400 | Reliable middle manager of robots. |
| 3 | **GH-3 "Gearhead"** | $6,000 | 20 | 14% | 900 | Overengineered, overheats. |
| 4 | **FA-4 "Forge-Arm"** | $150,000 | 140 | 10% | 2,000 | Industrial, loud, jams often. |
| 5 | **OV-5 "Overseer"** | $4,000,000 | 1,000 | 7% | 5,000 | Smug. Occasionally goes **rogue**. |
| 6 | **NS-6 "Nanoswarm"** | $120,000,000 | 8,000 | 5% | 12,000 | Not one robot — a cloud. Defects arrive in clusters. |
| 7 | **FP-7 "Fabricator Prime"** | $4,000,000,000 | 70,000 | 3% | 40,000 | Endgame. Produces so fast that a 3% defect rate is a firehose. |

**Durability** depletes 1 per widget produced. At 0 the robot enters a failure state and stops. Tree nodes, Parts mods, and Lubricators raise it.

**The trap:** a tier-7 robot at 3% defect and 70,000 w/s emits **2,100 defects/second**. Nobody clicks that. Late game is not about clicking harder — it's about having built the QC infrastructure to absorb it, with your clicks reserved for the high-value targets (see Golden Defects, §7).

---

## 6. What "getting it wrong" looks like

### 6.1 Defect types (things on the belt)

Each type is a **different click interaction**, so the primary verb never gets stale. They unlock progressively, and — critically — **Foremen must be individually trained on each type** via the skill tree. Automation is never a single binary switch.

| # | Defect | Unlock | Interaction | Notes |
|---|---|---|---|---|
| 1 | **Misaligned** | Start | Single click | The bread-and-butter defect. |
| 2 | **Loose Bolts** | Act 1 | Click 3× rapidly | Rewards click speed. |
| 3 | **Paint Smear** | Act 1 | Click-and-drag across it | Different muscle, feels great. |
| 4 | **Inverted** | Act 2 | Click to rotate 180° | Trivially easy, pure rhythm. |
| 5 | **Live Wire** | Act 2 | Click a small moving spark | Precision target. Misclick = brief stun. |
| 6 | **Clone Error** ⚠ | Act 2 | Single click, but spawns 2 more every 3s if ignored | **Priority target.** Can cascade and flood the belt. |
| 7 | **Mislabeled Crate** | Act 3 | Click to *reject* — fixing it is wrong | Punishes autopilot clicking. |
| 8 | **Overheated Unit** | Act 3 | Hold to cool | Hold interaction breaks up tapping. |
| 9 | **Recursive Defect** | Act 4 | Fixing it creates a smaller one; 3 layers deep | Endgame flavour, big payout. |

### 6.2 Robot failure states (things on the floor)

| # | State | Unlock | Interaction | Effect while active |
|---|---|---|---|---|
| 1 | **Offline** | Start | Click N times (N = 5 × tier) | Produces nothing |
| 2 | **Miscalibrated** ⚠ | Act 1 | Click when a sweeping needle hits the green zone | Not stopped — defect rate **×3**. Sneaky: easy to miss. |
| 3 | **Overheated** | Act 2 | Hold click to vent | Output halved, wear doubled |
| 4 | **Jammed** | Act 2 | Click the highlighted jam point | Produces nothing, emits a defect every 2s |
| 5 | **Rogue** 🔴 | Act 3 | Click 10× fast to shut down | **Actively un-fixes shipped widgets.** QS drains fast. |
| 6 | **Cascade Failure** | Act 4 | Repair 3 linked robots within 15s | Neighbouring robots break in sequence |

**Miscalibrated is the design MVP here.** It's the state where the robot *looks* fine and keeps producing — but is quietly poisoning your Quality Score. It rewards players who actually watch their factory rather than mashing the belt.

---

## 7. Staff (the automation layer)

Hired with Cash, cost scaling `base × 1.18^owned`. Each has a **tier upgrade path** and is buffed by the skill tree.

| Staff | Unlock | What it does | Base cost |
|---|---|---|---|
| **Foreman** 🔍 | $250 | Auto-fixes 1 defect every 4s. Only handles defect types it's been *trained* on (tree nodes). | $250 |
| **Robot Doctor** 🔧 | $2,500 | Auto-repairs broken robots at 1 repair-click/s. Prioritises highest-tier robot. | $2,500 |
| **Calibrator** 📏 | $25,000 | Passively reduces global defect rate by 4% each (diminishing, capped) | $25,000 |
| **Lubricator** 🛢 | $200,000 | +25% durability to all robots each (diminishing) | $200,000 |
| **Shift Manager** 👔 | $5,000,000 | +15% effectiveness to *all other staff*; unlocks auto-buy for robot tiers you own 50+ of | $5,000,000 |
| **Quality Director** 🏅 | $500,000,000 | Sets a QS floor — QS cannot drop below 40% (upgradeable) | $500M |

Progression logic: **you** → **Foreman** (fixes) → **Robot Doctor** (repairs) → **Calibrator/Lubricator** (prevention) → **Shift Manager** (meta-automation) → **Quality Director** (safety net). Each layer removes a chore only after the *next* chore has already appeared. The player is never idle, and never overwhelmed for more than a minute.

### Golden Defect (the attention hook)

Every 60–180s, a **Contract Unit** appears on the belt: glowing gold, ignored by Foremen, worth **50× base value** and **+5 QS instantly**. Lives 8 seconds. This is what keeps the endgame player watching a belt they've otherwise automated — the Cookie Clicker golden-cookie pattern, adapted.

---

## 8. Skill tree

Spend **Blueprints**. ~56 nodes across 4 branches radiating from a central root, plus 4 cross-branch capstones. Full-screen pannable/zoomable SVG overlay.

```
                         ┌──────────────┐
                         │   THROUGHPUT │  (make more)
                         └──────┬───────┘
                                │
     ┌──────────────┐    ┌──────┴───────┐    ┌──────────────┐
     │  MAINTENANCE │────│  THE FACTORY │────│   QUALITY    │
     │  (keep alive)│    │     (root)   │    │ (get it right)│
     └──────────────┘    └──────┬───────┘    └──────────────┘
                                │
                         ┌──────┴───────┐
                         │   COMMERCE   │  (sell it higher)
                         └──────────────┘
```

Node names follow the §2.1 rule: everything sounds like an initiative that came down from above.

### 🔩 Throughput (14 nodes) — *make more*
- **Voluntary Overtime I–V** — +10% output per rank, all robots
- **Preferred Vendor Agreement I–III** — robot cost scaling 1.15 → 1.13 → 1.11
- **The Night Shift** — robots keep producing while the tab is unfocused
- **Economies of Scale** — every 25 robots of a tier grants +5% to that tier
- **Capital Expenditure Approval** — 3 nodes gating T5, T6, T7 behind Blueprint investment
- **Synergy** *(capstone, needs Maintenance 8)* — robots draw durability from a shared pool

### ✅ Quality (16 nodes) — *get it right*
- **Hands-On Leadership I–V** — your click fixes +1 additional defect per rank
- **Mandatory Training: [type]** — 9 nodes, one per defect type. A Foreman can only auto-fix what it has been *certified* on. Uncertified defects sail right past him.
- **Performance Improvement Plan I–III** — Foreman speed +20% per rank
- **Facilities Request I–III** — +4 belt slots, +3s defect timeout per rank
- **Reclassification I–III** — fixed defects pay 2× → 3× → 5× *(they were never defective, they were bespoke)*
- **Zero Defect Culture** *(capstone, needs Commerce 6)* — at QS 100%, all income ×1.5

### 🔧 Maintenance (13 nodes) — *keep them alive*
- **Structural Integrity Initiative I–V** — +30% durability per rank
- **Percussive Maintenance I–III** — repair clicks count for 2× → 3× → 5× *(hitting it is an approved procedure)*
- **Extended Warranty I–III** — Robot Doctor speed +25% per rank
- **Proactive Monitoring** — miscalibration gets an obvious warning icon
- **Self-Assessment** — 15% chance a failing robot repairs itself and tells no one
- **Employee of the Month** *(capstone)* — RB-00 "Rusty" never breaks again and matches the average output of your best tier

### 💰 Commerce (13 nodes) — *sell it higher*
- **Value Engineering I–V** — +25% widget base value per rank
- **Business Development I–III** — Contract Units appear 25% more often per rank
- **Asynchronous Operations I–III** — **offline earnings: 2h → 6h → 24h at 40% rate.** Off until purchased; you come back to a pile of cash and a completely jammed factory.
- **Lessons Learned I–III** — +40% Blueprints per Recall per rank
- **Brand Equity** — QS multiplier improves from `0.5 + QS` to `0.7 + 1.3 × QS`
- **Shareholder Value** *(capstone, needs all branches at 5)* — income ×3, unlocks Patents

**Respec:** free before the first prestige, then costs Patents. Encourages experimentation early, commitment later.

---

## 9. Prestige — "Product Recall"

Available once lifetime run revenue ≥ **$100,000**.

> *You file a voluntary recall. Every widget you've ever shipped comes back on a truck. The factory is stripped, the staff go home, and the lawyers hand you a folder of very expensive lessons.*

**Blueprints gained = floor( 10 × √(runRevenue / 1,000,000) ) × recallValueMultiplier**

| Run revenue | Blueprints |
|---|---|
| $100K | 3 |
| $1M | 10 |
| $10M | 31 |
| $100M | 100 |
| $1B | 316 |
| $10B | 1,000 |
| $100B | 3,162 |
| $1T | 10,000 |

Reset: Cash, Parts, robots, staff, line upgrades.
Kept: Blueprints, skill tree, collectibles, achievements, statistics, unlocked defect types (the *knowledge* of what can go wrong persists — nice thematic touch, and avoids re-teaching).

**Expected run count to $1T:** 6–10 recalls. Each run should feel meaningfully faster than the last — target **~2.5× faster** per prestige early on, tapering to 1.4× late.

**Patents (Act 4 stretch layer):** at $10B+, "Go Public" converts Blueprints into Patents, resets the tree, and grants permanent global multipliers plus tree respec tokens. Only build this if the $1B → $1T stretch tests as too flat.

---

## 10. Number curve to $1,000,000,000,000

### Target pacing (active play, including prestiges)

| Milestone | Elapsed | Act | What's new |
|---|---|---|---|
| $100 | 2 min | 1 | T1 robots, fixing |
| $1K | 6 min | 1 | Foreman, defect types 2–3 |
| $10K | 15 min | 2 | T2–T3, Robot Doctor, failure states 2–3 |
| $100K | 30 min | 2 | **First Recall offered.** Skill tree opens. |
| $1M | 50 min | 2 | T4, Calibrator, run 2–3 |
| $10M | 1h 30m | 3 | **Parts economy**, Workshop, Mislabeled Crates |
| $100M | 2h 30m | 3 | T5, Rogue robots, Shift Manager |
| $1B | 4h | 3 | T6, Quality Director |
| $10B | 6h | 4 | T7 unlock, Patents, Recursive Defects |
| $100B | 8h 30m | 4 | Capstones, Cascade Failures |
| **$1T** | **12h** | 4 | **Ending: you buy the factory next door.** |

### Formulas

```
robotCost(tier, n)   = baseCost[tier] × 1.15^n           (1.15 → 1.11 via tree)
staffCost(role, n)   = baseCost[role] × 1.18^n
production           = Σ(count[t] × rate[t]) × throughputMult
defectsPerSec        = Σ(count[t] × rate[t] × defectRate[t]) × qualityMult
widgetValue          = baseValue × markupMult × (0.5 + QS)
income/sec           = (production − defectsPerSec) × widgetValue
                     + (defectsFixed/sec × widgetValue × salvageBonus)
blueprints(recall)   = floor(10 × √(runRevenue / 1e6)) × recallMult
```

### ⚠️ The math needs a simulator, not a spreadsheet

I want to flag this honestly rather than pretend the table above is final. A quick check on the tier-7 endgame:

> 50 × FP-7 at 70,000 w/s = 3.5M widgets/sec. With a fully-invested tree, `widgetValue` plausibly reaches ~$500 (base $1 × Markup 3.05 × QS 2.0 × capstones ×4.5 × Parts mods ×20). That's **$1.75B/sec** — which blows through $1T in under 10 minutes, not 3.5 hours.

### 10.1 The fix — Parts upkeep *(decided)*

Act 4 robots don't just cost money to buy. They cost **Parts to keep running**, forever.

> *"Effective immediately, all Tier 5+ units fall under the Consumables Accountability Program. Units without allocated Parts will enter a rest state. This is not a cost increase."*

**How it works:**
- Every T5/T6/T7 robot consumes Parts continuously — `upkeep = baseUpkeep[tier] × count`, scaling faster than the tier's income contribution
- A robot with no Parts allocated doesn't break — it goes **idle**. Your $/sec quietly collapses and the ticker calls it "a rest state."
- **Parts come overwhelmingly from *your own hands*.** Auto-repairs by Robot Doctors yield ~15% of the Parts that a manual repair does. The Workshop can improve this, but never closes the gap.

**Why this is the right sink:**
1. It converts the endgame from *watching a number* into *sustaining a machine*. You are personally keeping the trillion-dollar factory alive with a wrench.
2. It makes the manual repair verb — which would otherwise be fully automated away by Act 3 — become the **most valuable action in the game** precisely when the player would otherwise stop clicking.
3. It's self-balancing. Buying more T7s is only correct if you can service them. The player throttles their own growth, which is exactly the pressure a 3-hour final stretch needs.
4. It is extremely funny in the corporate register. You are the CEO. You are also the only one doing any work.

**Balance target:** at the $100B → $1T stretch, a fully-engaged player should sustain ~70% of their robots. Walking away should decay to ~25% within an hour. Offline progress (§8, Commerce) reflects this — you come back rich and completely seized up.

### 10.2 The simulator

**Plan item:** build a headless JS balance simulator (`sim.js`) *before* finalising Act 3–4 numbers. It runs a scripted "reasonable player" policy over simulated hours and outputs the milestone table above, plus Parts-sustainability curves for §10.1. Every tuning change gets re-run against it. This is ~200 lines and will save days of manual guessing.

---

## 11. Screen layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  $12,480   ▲ $340/s        QUALITY ████████░░ 82%        📐 31   [RECALL]│
├──────────────────────────────────────────────┬─────────────────────────┤
│                                              │  ROBOTS │ STAFF │ TREE  │
│   FACTORY FLOOR                              ├─────────────────────────┤
│                                              │                         │
│   [🤖]  [🤖]  [🤖⚡]  [🤖]  [🤖🔥]           │  RB-01 Bolt      ×24    │
│    ok    ok   BROKEN   ok   OVERHEAT         │  $412            [BUY]  │
│                                              │                         │
│   [🤖]  [🤖]  [🤖]  [🤖]  [🤖]               │  RB-02 Sprocket  ×8     │
│                                              │  $1,204          [BUY]  │
│  ─────────────────────────────────────────►  │                         │
│   QC BELT   ▣  ▣!  ▣  ▣!!  ▣      → 📦       │  GH-3 Gearhead   ×0     │
│  ─────────────────────────────────────────►  │  $6,000       [LOCKED]  │
│                                              │                         │
│   ⚙ 1,240 Parts          🗑 Scrap: 18        │                         │
├──────────────────────────────────────────────┴─────────────────────────┤
│  ▸ RB-01 #17 shipped a defective unit. Quality −0.4%                   │
│  ▸ GH-3 #2 has gone ROGUE. Shut it down!                               │
└────────────────────────────────────────────────────────────────────────┘
```

- **Top bar:** Cash, $/sec, the big Quality gauge, Blueprints, Recall button (pulses when profitable)
- **Left/centre:** the factory. Robots as a grid above, the QC belt scrolling right below them, output chute at the end. Everything clickable is a ≥32px target.
- **Right panel:** tabbed — Robots / Staff / Upgrades / Workshop / Tree / Stats
- **Bottom:** event ticker, where the game's personality lives
- **Skill tree:** full-screen overlay, SVG nodes and connectors, pan + zoom

### Art & juice
- No external assets. Chunky flat-vector robots built from CSS/SVG shapes with distinct silhouettes per tier.
- Floating `+$12` numbers on every fix, particle sparks on breakdowns, a small screen-shake when a robot dies, belt motion via CSS transforms.
- Sound synthesised with WebAudio — no files. A satisfying *chunk* on fix, a descending whine on breakdown, a chime on Golden Defect. Muted by default with an obvious unmute.
- Defect types differ by **shape and icon**, not colour alone (colourblind-safe).
- `prefers-reduced-motion` respected; a "calm mode" toggle kills shake and particles.
- Hold-to-fix as an alternative to rapid clicking, for accessibility and for wrists.

---

## 12. Tech decision

**Single-file HTML with vanilla JS, DOM + CSS rendering.** You asked me to pick, so here's the pick and the reasoning:

- You get a `.html` file you double-click. No Node, no build, no install — I can hand you a playable build every iteration and you can send it to anyone.
- Peak on-screen object count is ~150 (robots + belt items). DOM handles that comfortably at 60fps with CSS transforms; canvas would be premature optimisation and would cost us free click targets, CSS animation, and accessibility.
- Vanilla keeps the whole thing readable in one place, which matters most in the phase where the *design* is still moving.

**But structured to escape it.** The file is organised as if it were already modules — a pure `state` object, a `tick(dt)` function with zero DOM access, a `render()` function with zero game logic, and data-driven config tables (robots, defects, staff, tree nodes) as plain arrays at the top. Splitting into a Vite + TypeScript project later is a mechanical move, not a rewrite.

**When we'd migrate:** past ~4,000 lines, or the moment you want a Steam/mobile build. Then: Vite + TS, same architecture, Capacitor for mobile, Electron or Tauri for desktop.

**Saving:** `localStorage`, wrapped in a storage adapter that falls back to in-memory if storage is blocked (some preview sandboxes disallow it), plus **export/import save-string** buttons so a save is never trapped. Autosave every 20s and on tab hide. Save versioning from day one with a migration function — you will change the schema, and losing your own test saves is demoralising.

---

## 13. Build plan

| Phase | Deliverable | What's in it |
|---|---|---|
| **0** | *This document* | Design approved before code |
| **1** | `engine skeleton` | State object, fixed-timestep tick loop, number formatting (K/M/B/T), save/load + versioning, UI shell, config tables |
| **2** | **First playable** | Rusty, production, belt, defect type 1, click-to-fix, Quality Score, Cash, T1–T2 robots. *You can play this and tell me if the verb feels good.* |
| **3** | `breakdowns` | Durability, failure states 1–2, click-to-repair, Foreman, Robot Doctor |
| **4** | `progression` | Skill tree (all 4 branches), Product Recall, T3–T4, defect types 2–5 |
| **5** | `depth` | Parts + Workshop, Acts 3–4 content, remaining defect/failure types, Golden Defects, events |
| **6** | `balance` | `sim.js` headless simulator, full curve tuning against the §10 table, endgame cost sink |
| **7** | `polish` | Juice, WebAudio, achievements, collectibles, offline progress, mobile touch layout, accessibility pass |

**Checkpoint after Phase 2 is the important one.** The entire game rests on whether clicking a defect off a belt feels as good as smashing a piggy bank. If it doesn't, we change the verb then — cheaply — rather than after the skill tree is built on top of it.

---

## 14. The ending — "The Board Buys You Out"

At **$1,000,000,000,000**, production halts on its own.

> *A car arrives. Nobody called a car.*
>
> *The board has elected to acquire your holdings. The terms are extremely favourable and entirely non-negotiable. Your badge will be deactivated at the end of the day. Please do not take the robots.*

**Beat sequence:**
1. The factory goes quiet. The belt stops mid-item. The ticker, for the first time in the entire game, says something plainly: *"It's over. You did it."*
2. **The Exit Interview** — a full statistics screen, framed as a performance review:

| Metric | Your result | *Assessment* |
|---|---|---|
| Units shipped | 4,182,900,331 | *Exceeds expectations* |
| Defects personally corrected | 1,204,882 | *Exceeds expectations* |
| Defects you let go | 88,417,003 | *Meets expectations* |
| Robots repaired | 41,229 | *Exceeds expectations* |
| Robots lost | 312 | *Needs improvement* |
| Recalls filed | 8 | *Meets expectations* |
| Time served | 11h 42m | *— see HR* |
| Peak Quality Score | 99.4% | *Exceeds expectations* |
| Final Quality Score | 61% | *We'll talk.* |

3. **Credits**, over a slow pan across the empty factory floor. Rusty is still there. Rusty is still running. Nobody told Rusty.
4. **"Stay late?"** — an optional endless mode. Keeps your save, keeps prestiging, counter keeps climbing. No new content, no pressure; it's there for the players who don't want to stop.

The "Defects you let go" line is the emotional payoff of the entire Quality Score system. The game has been silently counting the whole time, and only tells you at the very end.

---

## 15. Remaining open questions

Smaller, and none of them block Phase 1:

1. **Rusty's fate** — I've written the ending so Rusty is still running after everyone leaves. Too sentimental for the satire tone, or exactly the right amount?
2. **Contract Units** (§7) — I called them "Golden Defects" in the design. In the corporate register they'd be **Priority Client Units**, and Foremen ignore them because the paperwork is above their pay grade. Good?
3. **Achievement volume** — a tight ~30 that each mean something, or ~120 for the completionists? Dirt Clicker leans heavily on 40+ collectibles as a discovery loop.
4. **Failure severity** — should a robot left broken too long ever be *permanently destroyed*? It adds real stakes to the repair verb but is punishing in an idle-adjacent game. My instinct is no destruction, but a scaling Parts cost to restart.

---

## 16. Immediate next step

**Phase 1 + 2 → a first playable.** Rusty, the belt, click-to-fix, Quality Score, cash, T1–T2 robots, in a single `.html` file you can double-click.

The only question that build answers, and it's the one that matters: **does clicking a defect off a moving belt feel as good as smashing a piggy bank?** If it doesn't, we change the verb then — before the skill tree is built on top of it.


---

# PART II — v3 SYSTEMS

*Everything below supersedes the corresponding v2 section. Section 5 (the flat 8-tier
robot table) and the single skill tree in section 8 are replaced.*

## 5A. The pipeline

v2 had one step: a robot makes a widget, the widget sells. That is thin. v3 makes
production a **line with a bottleneck you have to manage**:

```
  ASSEMBLY BAYS          OUTPUT PILE         PACK STATION        SHIPPING
  ┌───────────┐                                  ┌────┐
  │ [▣]🤖 ✦   │  good units   ▪▪▪▪▪   packers    │ 📦 │  sealed
  │ [▣]🤖     │ ──────────►   ▪▪▪▪▪  ──walk──►   │    │ ─────────►  $$$
  │ [▣]🤖 ✦   │               ▪▪▪▪▪   carry      └────┘
  └─────┬─────┘                  │
        │ defective                └── loose freight chute (slow, 0.35x value)
        ▼
   QC BELT ──► you / Foreman fix it ──► back into the pile
           └── unfixed ──► scrapped, Quality Score drops
```

**Units only become real money when packaged.** A sealed package ships at
`unitValue x packSize x bundleBonus` — bundleBonus starts at 1.5x. Anything sitting
in the pile trickles out through the **loose freight chute** at 0.35x value, so the
line never hard-stalls, but running on loose freight means running at a third of
your potential. The chute is the safety net, not the plan.

This creates the game's second real decision, alongside quality:
**how many of your robots assemble, and how many carry?**

- Too many assemblers → the pile grows, loose freight can't keep up, you're shipping
  at 0.35x while units rot on the floor.
- Too many packers → they queue at an empty pile, idle, and you've paid for headcount
  that produces nothing.

The Jobs tab shows assembly rate vs. pack rate and names the current bottleneck out
loud, so this is a legible decision rather than a guessing game.

## 5B. Robot levels

Three levels instead of v2's eight tiers. Each is roughly **10x the work rate** of
the one below, and — the important part — **each has its own skill tree**. Plus
Rusty, who is not really a level so much as a liability.

| | RB-00 "Rusty" | Mk I "Bolt" | Mk II "Sprocket" | Mk III "Overseer" |
|---|---|---|---|---|
| Base cost | free, 1 only | $15 | $2,500 | $400,000 |
| Work rate | 0.25/s | 0.5/s | 5/s | 50/s |
| Walk speed | 30 | 45 | 75 | 130 |
| Hands | 1 | 1 | 2 | 4 |
| Defect rate | 40% | 25% | 18% | 12% |
| Durability | 60 | 200 | 900 | 4,000 |
| Skill tree | *grandfathered into Mk I* | Mk I tree | Mk II tree | Mk III tree |

**Hands** do double duty, which is what makes the stat interesting: an assembler with
3 hands builds three units in parallel; a packer with 3 hands carries three units per
trip. The same upgrade means different things depending on the job you've assigned.

**Old levels don't become garbage.** When Mk II arrives, your Mk I units get demoted
to packing duty — they still walk, still carry, and still earn Mk I Service Hours,
which keeps the Mk I tree worth investing in long after Mk I has stopped assembling
anything. This is the corporate-satire version of a promotion.

## 5C. Why the floor is now literal

Robots occupy real positions and walk between them. This is not decoration:

- **Walk speed** is a real throughput term. A packer's cycle is
  `walk to pile + pickup + walk to station + deposit`. Half the cycle is travel.
- **Distance** is a real cost, which makes *Floor Reorganisation* (moves the pile
  closer to the pack station) a genuine upgrade rather than a number tweak.
- **Hands** visibly change the picture — a 4-hand packer walks back carrying a stack.
- You can **see the bottleneck** before the UI tells you: a growing pile with idle
  packers queued at an empty spot reads instantly.

Rendering moves to canvas for the floor; the QC belt and all panels stay DOM, because
they need click targets and text.

### Work effects (request #4)

Every completed unit produces: a flash ring on the robot, an arm-swing animation, a
small unit sprite that **arcs from the robot to the pile**, and a bounce on the pile
when it lands. Packers show their carried stack above their head. Sealing a package
pops a burst and a floating `+$`. The floor should look busy and legible at a glance —
you should be able to tell a healthy line from a jammed one without reading a number.

## 8A. Skill trees (replaces v2 §8)

Four trees, each with its own currency. Currencies are **earned by doing**, not
granted by prestige, so every tree grows out of the part of the factory it improves.

| Tree | Currency | Earned by |
|---|---|---|
| Mk I Programme | **Mk I Service Hours** | Mk I (and Rusty) doing work |
| Mk II Programme | **Mk II Service Hours** | Mk II doing work |
| Mk III Programme | **Mk III Service Hours** | Mk III doing work |
| Logistics | **Logistics Points** | Sealing packages |

### Robot tree — the same seven nodes for each level, scaled

Identical shape per level so the player learns it once, but the numbers and costs
scale with the level, and each is funded separately.

| Node | Ranks | Effect per rank |
|---|---|---|
| **Hydraulic Upgrade** | 5 | +15% work speed |
| **Additional Arm** | 3 | +1 hand (parallel assembly / carry capacity) |
| **Servo Legs** | 5 | +20% walk speed |
| **Tolerance Control** | 4 | -15% defect rate (multiplicative) |
| **Hardened Chassis** | 4 | +35% durability |
| **Quick Restart** | 3 | -25% repair effort when it breaks |
| **Unpaid Overtime** | 3 | +30% work speed, +20% wear — the trade-off node |

*Unpaid Overtime* is the one with teeth: raw speed at the cost of breaking more often,
which is only correct if your Robot Doctor coverage can absorb it.

### Logistics tree

| Node | Ranks | Effect per rank |
|---|---|---|
| **Bigger Boxes** | 5 | +3 units per package |
| **Bundle Premium** | 5 | +20% package value |
| **Automatic Sealer** | 4 | +30% sealing speed |
| **Pallet Jacks** | 3 | +2 carry capacity for every packer |
| **Floor Reorganisation** | 3 | Pile moves 15% closer to the pack station |
| **Loose Freight Contract** | 3 | Better rate on unpackaged units |

*Floor Reorganisation* only exists because the floor is spatial. It's the node that
justifies the whole rebuild.

## 10B. What this does to the curve

Three levels at 10x each is a shallower ladder than v2's eight tiers, so the climb to
$1T now leans on **multiplicative stacking** rather than tier-hopping:
`work speed x hands x quality multiplier x package size x bundle premium`. Five
multipliers compounding across four trees reaches 1e12 comfortably — and the
Parts-upkeep sink from §10.1 still governs the last stretch.

The simulator in §10.2 becomes more necessary, not less: with a bottleneck between
two robot jobs, throughput is no longer a sum, it's a `min()` of two rates. That is
exactly the kind of curve that misbehaves in ways a spreadsheet hides.


---

*v3 — pipeline, three robot levels, four skill trees, spatial floor.*
