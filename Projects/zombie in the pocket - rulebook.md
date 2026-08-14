---
tags: [project, rules]
status: current
started: 2026-08-13
version: v1.5 + designer rulings
---
# zombie in the pocket — consolidated rulebook

The playable ruleset, in one place. This is the human-facing companion to
[[zombie in the pocket - ruleset spec]] (which is the code-facing version
with data tables and pseudocode).

**Why this note exists:** the official rulebook is four pocketmod panels
and is genuinely terse — it leaves a dozen ordinary situations unaddressed.
The designer answered most of them piecemeal on the BGG forums between
2008 and 2020. This note folds those answers back into the rules in the
place you'd actually look for them, so you never have to go thread-hunting
mid-game.

> **Paraphrased, not transcribed.** Everything below is restated in our own
> words. The original rulebook text is the designer's copyrighted
> expression and we're building clean-room (see [[zombie in the pocket]]),
> so nothing here is lifted verbatim. Rules, numbers and procedures aren't
> copyrightable; the prose is.

**Legend:** 📖 in the printed rulebook · 🗣️ designer ruling from the BGG
forums · 🏠 our house rule, because nobody ever answered

---

## Components

- 8 indoor tiles, 8 outdoor tiles, 9 development cards.
- Health and Attack are just numbers you track. So is the time.

## Setup 📖

1. Put the **Foyer** on the table. Set the **Patio** aside — it goes down
   later, when you first step outside.
2. Shuffle the remaining indoor and outdoor tiles into two separate
   face-down stacks.
3. Shuffle the 9 development cards, then **burn the top 2 face down**
   without looking. Seven live cards per hour.
4. Start with **Attack 1** and **Health 6**. Both move up and down over
   the game and **neither has an upper limit**.
5. The clock starts at **9 PM**.

You begin in the Foyer. 🗣️ **You do not draw a development card for it.**
Play starts when you walk out. (If you come *back* to the Foyer later, you
draw as normal.)

## Taking a turn 📖

**1 — Move.** Pick a door leading out of your current room, into either
unexplored space or a room you've already been in. 🗣️ Moving is
**mandatory**; you can't reveal a room and decide to stay put. If you
walk into trouble you can flee afterwards, but you did go in.

**2 — Place the tile,** if the space is unexplored. Draw the top indoor
tile. 🗣️ You may **rotate it however you like**, with one constraint:
one of its doors has to line up with the door you just came through.
🗣️ Its other doors don't have to match anything — a door can open onto a
blank wall, and a wall can seal off a neighbour's door. That's fine and
intended; the designer deliberately kept placement unrestricted.

There's no fixed footprint. The house sprawls as far as the tiles take it.

**3 — Draw a development card.** Always, even when re-entering a room you
already know. If the deck is empty, see [Time passing](#time-passing)
first. Read only the line for the **current hour** and ignore the other
two:

- **Item** — you *may* draw the next card and take the item pictured on
  *that* card. Declining costs nothing, but you get nothing.
- **Zombies** — fight, or run. See [Combat](#combat).
- **Event** — gain or lose the Health shown, if any.

**4 — Apply the room's own instructions,** after the card is done. Only
some rooms have them; see [Special rooms](#special-rooms).

**5 — Check for a dead end.** If you're now somewhere with no unexplored
way out, see [Zombie doors](#zombie-doors).

**6 — Kitchen and Garden** give **+1 Health** if you finish your turn in
them.

**7 — Optionally cower.** See [Cowering](#cowering).

## Special rooms 📖

**Evil Temple.** The zombie totem is here. Resolve the room's card
normally, then draw and resolve **a second card** — that one represents
the search. Survive it and still be standing in the room, and the totem
is yours. 🗣️ Carrying it does **not** use up an item slot.

**Graveyard.** Same two-card procedure, this time representing the burial.
Survive it holding the totem and you've won.

**Storage.** Resolve the card normally, then you *may* draw one more card
and take the item on it.

**Kitchen** and **Garden.** +1 Health if you end your turn there.

## Going outdoors 📖

The only way out of the house is the **Dining Room's exterior door**,
marked with an arrow on the tile. It's one of the Dining Room's four
ordinary doors, not a fifth exit.

Take it and the **Patio** goes down against the Dining Room with the two
arrows aligned. Then draw a card as usual.

Outside, turns work exactly as they do indoors, with one substitution:
instead of choosing a door, you leave across an **open grassy edge**.
**Hedges are walls** — you can't push through them. As indoors, one grassy
edge on each newly placed tile must line up with the edge you left by.

## Time passing 📖

The clock only moves when the deck runs dry. **When you need to draw and
there are no cards left, an hour has passed.** Note the new time — from
here on you read the new hour's line on every card.

Then reshuffle the whole deck, including the two you burned at setup, and
burn two again.

Edge case: if an **Item** card is the last card in the deck, reshuffle and
burn first, then draw the top card of the fresh deck to see what you found.

Hours run **9 PM → 10 PM → 11 PM**. There is no midnight line to read; see
[Losing](#losing).

## Combat 📖

Fighting is arithmetic, not dice:

> **Health lost = (number of zombies) − (your Attack)**

You can never lose more than **4 Health** in a single fight, and you can
never *gain* Health from one.

🗣️ **Attack never stacks.** You use exactly one weapon per fight — the
best one you're holding — and its bonus does not accumulate with anything
else. Carrying the femur (+1) and the machete (+2) leaves you at +2, not
+3. Drop a weapon and you lose its bonus outright. (The later v1.75 rules
restate weapon values as flat totals specifically to stop people reading
these as cumulative.)

### Running away 📖

Instead of fighting, leave through a door or grassy edge into a room
you've **already explored**. The zombies get a parting swipe: **−1
Health**. You do *not* draw a card for the room you retreat into.

🏠 We treat the destination as **adjacent only**. The rulebook's wording
is ambiguous — it says "any previously explored tile", but also says you
go *through a door*, and the one worked example the designer endorsed was
a single step sideways. Nobody ever asked him directly. One step it is.

Holding **Oil**, you can throw it as you go and take no damage at all.
One use.

### Cowering 📖

Once a room's turn is finished, you may hole up: **+3 Health**, at the
cost of discarding the top development card unresolved. Health is cheap;
time is not.

Designer rulings, all 🗣️:

- Any tile counts, **including outdoor ones**.
- You may cower **after running away** — the turn resolved, it just
  didn't happen to involve a card.
- You may cower **between the Temple's or Graveyard's two cards**. It
  behaves like an ordinary fresh turn.
- You may **not** cower before a zombie door attack. Afterwards is fine.

🏠 **Once per turn.** This was asked on the forums and never answered.
Unlimited cowering would make Health free, and the clock cost isn't a real
deterrent when you're dying.

## Zombie doors 📖

Sometimes you end up somewhere with nowhere to go — the classic case is
the Bathroom placed directly above the Foyer, where its only door faces
back the way you came. It also happens when every exit is explored and the
room you still need hasn't turned up.

When that happens, **three zombies smash through a wall of your choosing**,
making a new opening. Fight them as normal.

Designer rulings, all 🗣️:

- **They arrive after the room's own card is resolved**, not instead of
  it. Deal with the room first, then with the fact that it's a dead end.
  A bad tile can therefore mean **two fights in one turn**, and you can't
  cower between them.
- You **may run** from them. If you do, the new opening is made in **the
  room you end up in**, and it stays there.
- The hole is a **hole**, not a matched pair of doors — the tile beyond it
  goes down wall-to-wall. It persists and you can use it again later.
- You **don't** have to go through straight away. Cower first if you like,
  and head through on a later turn. Entering draws a card as normal.

## Items 📖

You can carry **two at a time**. Picking up a third means dropping one,
and anything you drop vanishes as soon as you leave that room. You may
*carry* two weapons but only ever *use* one in a fight.

🗣️ The totem is exempt and doesn't count toward the limit.

| Item | Effect |
|---|---|
| Board with Nails | +1 Attack |
| Grisly Femur | +1 Attack |
| Golf Club | +1 Attack |
| Machete | +2 Attack |
| Chainsaw | +3 Attack, but only enough fuel for **2 fights** |
| Can of Soda | +2 Health |
| Candle | Does nothing alone — pairs with Oil or Gasoline |
| Oil | Throw it while fleeing to escape damage. **+ Candle**: wipes out every zombie in the room, unharmed. One use |
| Gasoline | **+ Candle**: wipes out every zombie in the room, unharmed. **+ Chainsaw**: two more fights' worth of fuel. One use |

🗣️ **An empty chainsaw isn't discarded.** It stays in your hands, keeps
occupying a slot, and can be refuelled with Gasoline as often as you can
find it. Dropping it is your call, not automatic.

## Winning

Survive the burial of the totem in the Graveyard. Every zombie drops.

## Losing

- Zombies finish you off.
- An Event takes your last Health.
- **You need a development card during the 11 PM hour and the deck is
  empty.** Midnight.

## House rules 🏠

Three things nobody has ever ruled on. Our calls, all recorded above:

| Gap | Our ruling |
|---|---|
| How far can you flee? | One step, to an adjacent explored room |
| How often can you cower? | Once per turn |
| Can the Temple be re-searched? | No — the second-card draw happens once, and is used up on success |

## Appendix — v1.75 🗣️

A harder variant the designer posted to the forums and never typeset. The
printed rulebook was never updated past v1.5, which is what everything
above describes.

- Cowering heals **2** instead of 3.
- Health is **capped at 6**.
- The **Foyer gains a second door**, on the left as you face the original.
- **Femur**: attack 3, but every −1 Health card costs you −2 while you
  carry it.
- **Candle**: gains a "peek" — reveal and attach an adjacent room without
  moving into it, and without spending time.
- **Machete**: attack 2 indoors, 3 outdoors.

His own advice is that most players should skip it and stay on v1.5, and
that it's there for people who find the base game a touch easy. For us
that makes it a **hard-mode toggle** — no new art required.

## Links
- [[zombie in the pocket]] — project note
- [[zombie in the pocket - ruleset spec]] — code-facing spec, data tables, pseudocode
- [BGG entry (33468)](https://boardgamegeek.com/boardgame/33468/zombie-in-my-pocket)
- [Official PDF](http://funmines.com/wp-content/uploads/2014/12/zimp.pdf) — rulebook on p2, cards p3, tiles p4
- [v1.5 changelog](https://boardgamegeek.com/thread/303923) · [v1.75 changelog](https://boardgamegeek.com/thread/334719)
