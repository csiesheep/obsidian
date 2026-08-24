---
tags: [project, rules]
status: draft
started: 2026-08-22
version: pre-alpha — tiles, turn, items and King settled; event pool open
---
# jiangshi in the pocket — rulebook

The playable rules, in one place, as they stand. Human-facing companion to
[[jiangshi in the pocket - redesign]] (which is the design record, with the
reasoning and the arguments).

> ⚠️ **This is a draft of a game that isn't finished being designed.**
> The clock, the turn, the map, the items and the King are settled. The
> **event pool** is not — and it is load-bearing, because every turn draws
> from it. Sections marked ⏳ are provisional; don't build from them.

**Legend:** ✅ settled · ⏳ not yet designed · 📐 inherited unchanged from
the *Zombie in my Pocket* skeleton (see
[[zombie in the pocket - ruleset spec]])

---

## The night

You are the caretaker. The village has locked its doors, and at the far
end of it is the **義莊** — the corpse hostel, where coffins wait for the
road home. One of them has waited too long.

It is **9:00 PM**. At **midnight** the third watch sounds and the thing
in that coffin comes for you. You have until then to do one of two
things:

1. **Lay him to rest.** Find his **神主牌** — the ancestral tablet — in
   the Sealed Crypt, carry it out of the village, and bury it in the
   Mass Grave.
2. **Meet him.** Be standing, armed and whole, when he arrives.

Either ends the night. So does dying.

## Components

- **10 indoor tiles, 10 outdoor tiles.**
- An **event pool** ⏳ and an **item pool** — separate, unlike the source
  game's single deck. **12 items**, in four kinds.
- Health, Attack, the turn number and your cower charges are numbers you
  track.

## Setup ✅

1. Put the **門廳 Gatehouse** on the table. Set the **後門石階 Back
   Steps** aside — it goes down later, the moment you first step outside.
2. Shuffle the remaining indoor and outdoor tiles into two separate
   face-down stacks.
3. Start with **Attack 0** — bare-handed — plus **Health 6** and
   **3 cower charges**. **Health never rises above 10.**
4. The clock reads **9:00 PM**. It is **turn 1 of 30**.

You begin in the Gatehouse and **draw no event for it**. The night starts
when you move.

> **Why Attack 0 and not 1.** Weapons in this game *are* your Attack
> rather than a bonus added to it (戒刀 is "Attack 1", not "+1"), so
> bare-handed has to be 0 or the weakest weapon would do nothing. This
> follows from the item table rather than having been decided on its own —
> if the item numbers change, check this line.

## The clock ✅

**The turn is the clock.** There is no deck to run down.

- The game is exactly **30 turns**.
- Each turn is **6 minutes**. Turn 1 begins at 9:00 PM; turn 30 ends at
  midnight.
- The hour bands are exactly **10 turns** each:

| Band | Turns | Clock |
|---|---|---|
| **9 PM** | 1–10 | 21:00 → 22:00 |
| **10 PM** | 11–20 | 22:00 → 23:00 |
| **11 PM** | 21–30 | 23:00 → 24:00 |

Events get worse as the bands advance. When turn 30 ends, **the King
arrives** — see [Midnight](#midnight-).

## Taking a turn ✅

Every turn is **one action**, then **an event**, then **an optional
search**.

### 1 — Choose one action

**MOVE** — step into an adjacent room, explored or not. If it's
unexplored, place a tile (below).

**STAY** — remain where you are. Legal, and often correct: staying is how
you search a room a second time.

**COWER** — hide. Regain Health, spend one of your **3 charges**, and
**end the turn immediately** — no event, no search. See
[Cowering](#cowering-).

> **Movement is optional**, unlike the source game. But standing still
> costs a turn and draws an event exactly like walking does. There is no
> free turn.

### 2 — Place the tile, if the room is new 📐

Draw the top tile of the matching stack. **Rotate it however you like**,
with one constraint: one of its ways out must line up with the way you
just came through. Its other edges don't have to match anything — a door
may open onto a blank wall, and a wall may seal off a neighbour's door.

There's no fixed footprint. The village sprawls as far as the tiles take
it.

### 3 — Draw an event ⏳

One event from the pool, read for **the current hour band**. Always —
including when you re-enter a room you already know, and including when
you stayed put.

Events are fights, harms, and things that merely happen. **The contents
of the pool are not designed yet.**

### 4 — Search, if the room offers it ✅

Ten of the twenty tiles can be searched, each for **one category** of
thing:

|                 | Where                                                                             |
| --------------- | --------------------------------------------------------------------------------- |
| **武器 weapons** | 鐵匠鋪 Blacksmith ★ · 柴房 Woodshed · 牌坊 Memorial Arch |
| **符咒 magic** | 經堂 Sutra Hall ★ · 靈堂 Mourning Hall · 竹林 Bamboo Grove |
| **丹藥 medicine** | 藥鋪 Apothecary · 帳房 Counting Room · 槐樹 Pagoda Tree |
| **法器 implement** | 土地廟 Earth God Shrine — the **攝魂幡** and nothing else |

Searching is **free** — it costs no turn. It happens after the event, and
**it may find nothing** ⏳. If it does, you can search the same room again
by spending next turn on **STAY** — which means another event. That is
the price of rummaging: not the search, the lingering.

You may carry **6 items**. The 神主牌 tablet doesn't count against that.

### 5 — End of turn ✅

**帳房 Counting Room** and **槐樹 Pagoda Tree** give **+1 Health** if you
finish your turn standing in them.

Advance the clock 6 minutes.

## The map ✅

### Indoors — the village, and the 義莊 at the end of it

| Room | Ways out | Search | What it is |
|---|---|---|---|
| **門廳 Gatehouse** | N, E, W | — | Where you start. Three ways on |
| **藥鋪 Apothecary** | N | 丹藥 | One door. Drawers of herbs and scales |
| **柴房 Woodshed** | N, E | 武器 | Poles and axes, close to the start |
| **經堂 Sutra Hall ★** | N, W | 符咒 | Scripture and talismans. The richest magic in the game |
| **靈堂 Mourning Hall** | N, E, W | 符咒 | Where the coffins are laid out |
| **天井 Courtyard** | N, E, S, W | — | The crossroads. Its **moon gate** is the only way outside |
| **鐵匠鋪 Blacksmith ★** | N | 武器 | One door. The forge — iron is anti-yin, and the best weapons are here |
| **帳房 Counting Room** | N, E, W | 丹藥 | **+1 Health** if you end your turn here |
| **香堂 Incense Hall** | N, E | — | **Restores one cower charge. Once per night** |
| **停柩房 Sealed Crypt** | E, W | — | **The tablet is here** |

### Outdoors — the hillside

Outdoors you leave across an **open edge**. **Hedges and walls are
solid** — you can't push through them.

| Place | Ways out | Search | What it is |
|---|---|---|---|
| **後門石階 Back Steps** | E, S | — | The landing outside the moon gate. Set aside at setup |
| **枯井 Dry Well** | S, W | — | No water left in it. Something climbed out |
| **竹林 Bamboo Grove** | E, S, W | 符咒 | Paper and ink among the stems |
| **牌坊 Memorial Arch** | E, S, W | 武器 | Offerings and tools stacked at its foot |
| **涼亭 Pavilion** | E, S, W | — | Somewhere to sit, if this were a different night |
| **槐樹 Pagoda Tree** | E, S, W | 丹藥 | 鬼樹. **+1 Health** if you end your turn here |
| **石敢當 Stone Ward** | N, E, S, W | — | The stone at the junction. Every route outdoors crosses it |
| **溪澗 Stream** | E, W | — | **Running water. Jiangshi cannot cross it** — their attacks do you no harm here |
| **土地廟 Earth God Shrine** | E, S | 法器 | **Pray: the next new place you step is the Mass Grave. Once per night.** The only place the **攝魂幡** is ever found |
| **亂葬崗 Mass Grave** | E, S | — | The pit for the unclaimed. **Bury the tablet here** |

★ = the best of its category.

## Going outdoors ✅

The only way out of the village is the **Courtyard's moon gate**, one of
its four ordinary ways out, not a fifth. Take it and the **Back Steps**
goes down against the Courtyard, joined along that edge. Then the turn
continues as normal.

The gate works both ways. Going back in costs a turn, like any move.

> Almost everything you will ever carry is found indoors. Crossing the
> moon gate is a decision made with what you already have.

## Special places ✅

**停柩房 Sealed Crypt.** The tablet is here. Resolve the room's event,
then perform the search of the crypt ⏳ — cost not yet fixed. Survive it
and the tablet is yours. Carrying it does **not** use an item slot 📐.

**亂葬崗 Mass Grave.** The same shape, for the burial ⏳. Survive it
holding the tablet and **you have won**.

**香堂 Incense Hall.** Light the incense: **one cower charge back**. Once
per night — the incense burns out.

**土地廟 Earth God Shrine.** Pray: the **next unexplored outdoor tile you
place is the Mass Grave**. Once per night. The land god knows where the
dead are buried.

**溪澗 Stream.** Running water. Jiangshi cannot cross it, so their
attacks deal **no damage** while you stand here. There is nothing to find
and nothing to heal you — it is shelter and nothing more.

**帳房 Counting Room** and **槐樹 Pagoda Tree.** +1 Health at end of turn.

## Items ✅

You can carry **6**. The 神主牌 tablet doesn't count against that.

**Weapons stay with you. Everything else — talismans, medicines, the
banner — is used once and is gone.**

### 武器 Weapons — kept

A weapon *is* your Attack, not a bonus on top of it. Only the best one
you're holding counts: carrying two doesn't add them together 📐.

| Weapon | Attack |
|---|---|
| **戒刀** Precept Knife | 1 |
| **桃木劍** Peachwood Sword | 1 |
| **銅錢劍** Coin Sword | 2 |
| **七星劍** Seven-Star Sword | 3 |

### 符咒 Talismans — burned once

**A talisman adds to your sword.** Bring both to the same fight and the
two stack:

> **Attack = (sword, doubled if you spend the 攝魂幡) + talisman**

So 七星劍 with a 真火符 burned into it (4), the banner, and a 五雷符 (4)
comes to (4 × 2) + 4 = **12**.

The sword keeps its number all night. The banner and the talisman are
gone the moment you use them, so **that combination can be assembled
once.**

| Talisman | What it does |
|---|---|
| **真火符** True Fire | Fight at **1** — *or* raise one sword's Attack by **+1**, and it stays raised |
| **五雷符** Five Thunder | Fight at **4** |
| **血符** Blood | Fight at **5**. Writing it costs you **1 Health** |
| **硃砂** Cinnabar | Copy a talisman you already hold — **+2 more of it** |

真火符 is the only one worth spending outside a fight: put it into a
sword and the sword is better for the rest of the night. 七星劍 with a
真火符 in it fights at **4**.

### 丹藥 Medicines — taken once

| Medicine | What it does |
|---|---|
| **糯米** Sticky Rice | **+3 Health** — *or* draw out **屍毒 corpse-poison** ⏳ |
| **黑狗血** Black Dog Blood | **Get out of the fight**, unhurt |
| **金丹** Golden Elixir | A gamble: **half the time +6 Health, half the time −2** |

Health stops at **10**. Anything that would take you past it is
wasted — so a 糯米 at 9 Health is worth holding rather than eating.

### 法器 The banner — used once

| | |
|---|---|
| **攝魂幡** Soul-Snatching Banner | **Doubles your sword** for one fight. It does nothing for a talisman |

There is exactly one place it is ever found: **土地廟 the Earth God
Shrine**, and only sometimes, when you search there.

Doubling a sword is wasted on a small pack — damage only goes down to
zero, and a sword and talisman together often get you there anyway.
**Keep it for something big.** You will want it at midnight.

### What a search turns up ✅

Each search rolls once on the table for that place's category.

| 武器 weapon | | 符咒 magic | | 丹藥 medicine | | 土地廟 only | |
|---|---|---|---|---|---|---|---|
| 戒刀 | 30 % | 真火符 | 30 % | 糯米 | 40 % | 糯米 | 40 % |
| 桃木劍 | 30 % | 血符 | 20 % | 黑狗血 | 25 % | **攝魂幡** | 15 % |
| 銅錢劍 | 20 % | 硃砂 | 20 % | 金丹 | 15 % | nothing | 45 % |
| 七星劍 | 10 % | 五雷符 | 20 % | nothing | 20 % | | |
| nothing | 10 % | nothing | 10 % | | | | |

**There is only one of each weapon in the village.** Turn up one you're
already carrying and you find nothing — so the more blades you own, the
more often a weapon search comes up empty. Four searches in and it
almost always will.

**Talismans have no limit** — the same one can be found again and again,
and a talisman search comes up empty only one time in ten.

**七星劍 is rare on purpose.** One search in ten. Most nights you will
fight with something worse, and that is the game working, not the game
cheating you.

### What isn't settled about items ⏳
- **Which are common and which are one-of-a-kind.** Rarity is how the
  pool is weighted, and no item has a count yet.
- **Whether a stack of talismans is one slot or several.** 硃砂 can leave
  you holding 五雷符 ×3.
- **屍毒 corpse-poison.** 糯米 cures it; nothing in the game inflicts it
  yet. It will come from the event pool, and it needs rules of its own —
  how long it lasts and what it costs you per turn.
- **Whether one sword can take more than one 真火符.**
- **Where 黑狗血 puts you** when you escape a fight.

## Cowering ✅

Cowering costs a **whole turn** and one of your **3 charges**, and it is
the only turn in the game that **draws no event**.

- You regain Health ⏳ (3, or possibly 4–5 — not yet tuned).
- You may cower anywhere, indoors or out.
- When the charges are gone, they are gone — except for the one the
  Incense Hall gives back.

> Cowering is not an economy in this game, it's an **inventory**. Three
> charges is the whole supply of safety you will get.

## Combat 📐 ⏳

Inherited arithmetic, no dice:

> **Health lost = (number of jiangshi) − (your Attack)**

Never more than **4** from one fight, and never a gain.

**Only one sword counts** — carrying two doesn't add them together, you
use the better. **But a sword and a talisman do add**, and the 攝魂幡
doubles the sword before the talisman goes on top:

> **Attack = (sword, doubled if you spend the 攝魂幡) + talisman**

The 4-damage ceiling is why a very high Attack stops helping against an
ordinary pack — you can only get the damage to zero. It is at
[midnight](#midnight-) that the big numbers start to matter.

The specific attacks, their sizes and how often they come are part of the
**event pool** ⏳.

## Midnight — 三更 ✅

When turn 30 ends the third watch sounds, and **the King comes to
whatever place you are standing in.**

**There is one exchange.** He strikes once, you meet it once, and the
night is decided.

> **Attack 12 or more — you seal him, and you have won.**
> **Anything less — he takes you.**

No fleeing, no cowering, no medicine, no second chance. **黑狗血 does not
work on him** — there is nowhere he is not.

### Reaching 12

Your Attack is the sword — doubled if you spend the **攝魂幡** — with a
talisman added on top. Two kits get there:

| | Working | Attack |
|---|---|---|
| **七星劍** (with a 真火符 in it) **+ 攝魂幡 + 五雷符** | (3+1) × 2 + 4 | **12** |
| **七星劍** (with a 真火符 in it) **+ 攝魂幡 + 血符** | (3+1) × 2 + 5 | **13** |

Drop any single piece and you fall short:

| | Attack | |
|---|---|---|
| No 真火符 burned into the sword | 11 | one short |
| 銅錢劍 instead of 七星劍 | 11 | one short |
| No talisman to add | 8 | four short |
| No banner to double with | 8 | four short |

**The whole night is spent building one number.** 七星劍 is the only
sword that reaches it, and the 攝魂幡 is found nowhere but the 土地廟,
out past the moon gate.

### 鎮屍 — what winning looks like

You do not kill him. His blow meets your twelve and lands on nothing; he
loses his footing, and in that opening the paper goes onto his forehead
and he stops mid-hop. Nobody destroys a 殭屍王. You put him back.

### Not being there

**溪澗 Stream** is running water, and he will not cross it. Stand there
when turn 30 ends and **he does not come** — you live, and you cannot
seal him, because nothing happens at all. If the tablet is already in the
ground you have won anyway. If it isn't, you simply saw the night out.

## Winning and losing

| | |
|---|---|
| **Win — the burial** | Survive the rite at the Mass Grave while carrying the tablet |
| **Win — the seal** | Meet one of the King's blows with Attack 12 and seal him |
| **Lose** | Health reaches 0, at any point |

There is no losing to the clock. Midnight is not a deadline in this
game — it's an appointment.

## What isn't decided yet
- **The event pool** — everything in it, and how the three bands differ.
- **The item pool's weighting** — the 12 items exist; which are unique,
  which are common, and how often a search finds nothing do not.
- **屍毒 corpse-poison** — 糯米 cures it, and nothing yet inflicts it. It
  has to come from the event pool.
- **How much cowering heals**, exactly.
- **What the crypt rite and the burial rite cost** — a turn each, an
  event each, or both.
- **Whether one moon gate is enough**, given the round trip path 1 needs.

## Links
- [[jiangshi in the pocket - redesign]] — the design record and reasoning
- [[jiangshi in the pocket plan]] — the project note
- [[zombie in the pocket - rulebook]] — the source skeleton's rules
- [[zombie in the pocket - ruleset spec]] — what 📐 refers to
