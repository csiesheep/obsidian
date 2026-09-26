---
tags: [project, rules]
updated: 2026-09-13
---
# last_train — rulebook digest

Digest, in my own words, of the base rules and the one expansion of the
game the play is modelled on, *Die Kutschfahrt zur Teufelsburg* (Michael
Palm and Lukas Zach, Adlung-Spiele 2006), for [[last_train plan]]. Kept as
a mechanics reference only. The site ships under its own name and setting
(末班夜車 / The Last Night Train) and its rules page is written fresh from this,
never from the publisher's prose. Card words here are the original's
German with a literal English gloss; the site's own words are in the plan.

## Sources
- Rulebook, German + English in one PDF (the text I worked from):
  https://silo.tips/download/die-kutschfahrt-zur-teufelsburg-autoren-michael-palm-und-lukas-zach
- BGG entry (the id that surfaces today; the XML API refused an
  anonymous lookup so I could not confirm it is the original 2006 entry):
  https://boardgamegeek.com/boardgame/168839/die-kutschfahrt-zur-teufelsburg
- BGG rules file, EN + DE (login needed, not fetched):
  https://boardgamegeek.com/filepage/109776/rules-regeln-fur-kutschfahrt-zur-teufelsburg-engli
- Publisher page: https://www.adlung-spiele.de/produkt/fuer-kindereinrichtungen-geeignet/schule/die-kutschfahrt-zur-teufelsburg/
- German reviews used to cross-check counts and setup:
  https://spielmonster.de/rezension-die-kutschfahrt-zur-teufelsburg/ ,
  https://www.reich-der-spiele.de/kritiken/diekutschfahrtzurteufelsburg ,
  https://www.hall9000.de/html/spiel/die_kutschfahrt_zur_teufelsburg ,
  https://www.cliquenabend.de/spiele/950000-Die-Kutschfahrt-zur-Teufelsburg.html ,
  https://www.spieletest.at/gesellschaftsspiel/1499/die-kutschfahrt-zur-teufelsburg
- Chinese edition 魔城馬車 (新天鵝堡 Swan Panasia):
  https://www.swanpanasia.com/products/kutschfahrt-zur-teufelsburg and a
  fan write-up https://heyjude0929.pixnet.net/blog/post/17641566
- 2026 re-release news (Game Factory with Adlung, base + expansion in one
  box, late September 2026, €19.99):
  https://wuerfelreich.de/game-factory-polaroid-kutschfahrt-teufelsburg/
- Expansion *Die dunkle Prophezeiung*:
  https://www.spieletest.at/gesellschaftsspiel/2106/die-dunkle-prophezeiung

3–10 players, 12+, 30–60 min (reviews say longer at 8+). Two secret
societies, *Orden der offenen Geheimnisse* (needs three keys) and
*Bruderschaft der wahren Lüge* (needs three goblets). On the 2007 Spiel
des Jahres recommendation list per a secondary source. Chinese edition
by Swan Panasia as 魔城馬車 (NT$590, 60 cards).

## Components (60 cards)
| kind | count | notes |
|---|---|---|
| Personenkarten (person) | 10 | 5 women, 5 men; one side shows a sword, the other a shield; purely cosmetic otherwise |
| Berufskarten (profession) | 10 | one each, listed below |
| Gesellschaftskarten (society) | 10 | 5 Orden + 5 Bruderschaft |
| Gegenstände (items, "luggage") | 21 | listed below; 3 Schlüssel and 3 Kelche among them (derived: the 15 named singletons + 2 Koffer leave 6) |
| Trank der Macht | 9 | only used at odd player counts |

## Setup
| players | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| society cards shuffled in | 2+2 | 2+2 | 3+3 | 3+3 | 4+4 | 4+4 | 5+5 | 5+5 |
| dealt | 3 of 4 | all | 5 of 6 | all | 7 of 8 | all | 9 of 10 | all |
| Trank der Macht | 1 each | – | 1 each | – | 1 each | – | 1 each | – |
| hand limit (items) | 8 | 6 | 5 | 5 | 5 | 5 | 5 | 5 |
| starting items each | 2 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| removed | Schwarze Perle | – | – | – | – | – | – | Mantel |

1. Each player takes a person card (cosmetic; it is the sword/shield
   token). Shuffle the professions, one each face down. Society cards per
   the table, one each face down. At odd counts a Trank der Macht goes
   face up in front of every player. Nobody knows the society split at
   odd counts (one side has one more member).
2. Items: take the two *Geheime Koffer* out. Shuffle the rest, count off
   **players − 2** cards face down, shuffle those together with the two
   Koffer, and deal one to each player. So both Koffer are always in hands
   from the first turn. The rest of the items form the face-down draw
   pile. At three players everyone gets two items instead.
3. Play goes clockwise; the rulebook does not say who starts (v1: random,
   seeded).

## Turn
On your turn do exactly one of:
1. **Pass.**
2. **Trade** one item.
3. **Attack** one player.
4. **Declare victory.**
Then play passes left.

### Trade
- Offer one item face down to any one player. They look at it privately
  and accept or refuse. If they accept, they keep it and hand back a
  *different* item of their choice, face down. Nobody else sees either
  card.
- After the swap both players resolve the "Tauschst du ihn weiter…"
  (when you trade this on) text of the card they gave away.
- Two items **must** be accepted: Schwarze Perle and Zerbrochener
  Spiegel. The item received in exchange for the Spiegel has no trade
  effect.
- A Koffer may not be traded for the other Koffer; if your only item is
  one Koffer and you are offered the other, you must refuse.
- Items only ever move by trading, by a fight, or by the hand-limit rule.
  Over the limit at any moment ⇒ give items of your choice to other
  players at once until legal.

### Attack (Kampf)
1. Name a defender: "Ich greife dich an." Attacker lays their person card
   sword side up, defender shield side up.
2. **Support**, clockwise from the attacker's left: each other player
   shows sword (for the attacker), shield (for the defender) or abstains
   (card stays hidden).
3. **Abilities and items**, any order, anyone: profession powers and item
   texts that say "as attacker / as defender / when supporting". A
   profession used this way is turned face up and stays revealed for the
   game; items are shown and go back to the hand.
4. **Count.** Attacker: swords showing + bonuses. Defender: shields +
   bonuses. Higher wins.
5. **Winner picks one**: (a) look at the loser's society *and* profession
   cards, or (b) look at all the loser's items and take one (the item's
   text is not triggered). **If that was the loser's last item, the winner
   must give the loser any one of the winner's own items back** ("War dies
   die letzte Handkarte des Unterlegenen, muss er ihm einen beliebigen
   Gegenstand aus seinem eigenen Besitz zurückgeben."). Missed in the first
   digest; added 2026-09-25, and the game follows it since then.
   **Tie** ⇒ the attacker draws one item from the pile if any is left.
6. The attacker's turn ends.

### Declare victory (Siegansage)
- You must personally hold at least one of your society's items (a key
  for the Orden, a goblet for the Bruderschaft). A Schwarze Perle holder
  may not declare.
- Stand up, name your society, reveal your society card, profession and
  all items, then name the allies who hold the remaining items. They
  reveal society and items.
- Right ⇒ every member of that society wins, named or not. Wrong in any
  way (a named player is not an ally, does not hold the item, the count is
  short) ⇒ the **other** society wins.
- **Odd counts, Trank der Macht**: for a holder whose society has fewer
  members, one Trank counts as one key or goblet. The rulebook lists the
  combinations "2 items + Trank" and "1 item + own Koffer + Trank".
- **Wappen der Loge**: hold it plus any three of keys and goblets, mixed,
  all in your own hand ⇒ declare a **solo** win; no allies named; Trank
  does not count toward it.
- The draw pile running out does not end the game; it only turns the
  Koffer into a key / goblet and removes the tie draw.

## Professions (Berufe)
| German | gloss | when | text (my words) |
|---|---|---|---|
| Diplomat | diplomat | once, own turn | Name an item and a player: they must trade it to you (a forced trade; you give one back). If they say they do not have it, they show you their hand; your turn ends. |
| Doktor | doctor | once, right after a fight | Cancel that fight's outcome: the winner learns and takes nothing. |
| Duellant | duelist | once, as attacker or defender | Nobody may support this fight. (The PDF's English text also gives +1; the German card text quoted does not. Unknown 4.) |
| Giftmischer | poisoner | once, a fight you are not in | Decide the winner, even after support is declared. |
| Großmeister | grand master | always, as defender | +1. |
| Hellseher | clairvoyant | once, own turn | Look through the draw pile, pick two, shuffle the rest, put the two on top in your order. |
| Hypnotiseur | hypnotist | always, as attacker | After support is declared, name one player: they abstain and may use no profession or item this fight. |
| Leibwächter | bodyguard | always, when supporting | The side you support gets +1. |
| Priester | priest | once, before support | Stop the fight. If the attacker holds 2+ items they give you one. Attacker's turn ends. |
| Schläger | thug | always, as attacker | +1. |

## Items (Gegenstände)
| German | gloss | × | text (my words) |
|---|---|---|---|
| Schlüssel | key | 3 | Orden wins with three. |
| Kelch | goblet | 3 | Bruderschaft wins with three. |
| Geheimer Koffer (Schlüssel) | secret case, key side | 1 | When you trade it on, draw one item from the pile. Never traded for the other Koffer. Counts as a **key** once the pile is empty. |
| Geheimer Koffer (Kelch) | secret case, goblet side | 1 | Same, counts as a **goblet** once the pile is empty. |
| Dolch | dagger | 1 | +1 as attacker (not when supporting). |
| Handschuhe | gloves | 1 | +1 as defender (not when supporting). |
| Giftring | poison ring | 1 | As attacker or defender you win ties. |
| Wurfmesser | throwing knives | 1 | When you support the attacker, the attacker gets +1. |
| Peitsche | whip | 1 | When you support the defender, the defender gets +1. |
| Foliant | tome | 1 | When you trade it on, you may swap professions with your trade partner. Revealed professions go face down again; used once-only powers come back. |
| Mantel | coat | 1 | When you trade it on, take a new profession from the undealt ones, return yours. Once-only powers come back. Out at 10 players (none spare). |
| Freibrief | letter of passage | 1 | When you trade it on, look at all of your trade partner's items. |
| Monokel | monocle | 1 | When you trade it on, look at your trade partner's society card. |
| Sextant | sextant | 1 | When you trade it on, name a direction; everyone at once passes one item of their choice to their neighbour that way. No trade texts fire on these; the received card's own text is still usable later. |
| Schwarze Perle | black pearl | 1 | Must be accepted in a trade. Its holder may not declare victory. Out at 3 players. |
| Zerbrochener Spiegel | broken mirror | 1 | Must be accepted in a trade. The item you get for it has no trade effect; the swap is silent. |
| Wappen der Loge | crest of the lodge | 1 | With any three keys/goblets in your own hand, declare a solo win. |

## Trank der Macht (odd counts only)
Face up in front of each player. Counts as one key or one goblet for a
holder whose society is in the minority. Never counts toward the Wappen
win.

## Official variants
- **Schmuggel** (smuggling): a trade text fires only if the giver chooses
  to read it out; otherwise the card changes hands silently.
- **Wahrsagen** (fortune-telling): you may declare victory *for the other
  society* by naming exactly which opponents hold its three items; right
  ⇒ your side wins.
- **Advanced 3-player**: shuffle all 10 society cards, 3 each, one out;
  you belong to whichever society you hold two or three of; lay the three
  face down in a row and a fight loser reveals one per lost fight.

## Expansion: Die dunkle Prophezeiung (Adlung, 60 cards)
Only playable with the base. Adds 25 Ereigniskarten (events), a
Kutscher (coachman) card that draws and runs events and changes hands
after a won fight, new professions, new items, new society cards, a
Rache (revenge) card, and at odd counts of 5+ a Verräter (traitor) who
belongs to no society and wins alone at "sunrise" or with three mixed
items. The 2026 Game Factory edition ships base + expansion in one box.
Not in v1; the card list would need the physical rulebook.

## Unclear or contradictory across sources
1. **Total keys and goblets.** No source states 3 + 3 outright; it
   follows from 21 items minus the 15 named singletons and 2 Koffer.
   v1: 3 + 3, and the engine test asserts the deck sums to 21.
2. **Who starts.** Not stated. v1: random seat, seeded.
3. **Trank der Macht stacking.** Two minority members each hold one; the
   rulebook lists only "two items + one Trank" and "one item + own Koffer
   + one Trank". v1: at most one Trank per declaration; the second combo
   applies only once the Koffer has become an item (pile empty).
4. **Duellant +1.** The English text in the PDF gives +1 on top of "no
   support"; the German card text quoted gives only "no support". v1:
   no +1, flagged as a one-line toggle; keep the German as canonical.
5. **Diplomat.** German: "demand the trade of an item you named". What
   the target gets back, and whether trade texts fire, is not spelled
   out. v1: a forced trade, Diplomat gives one item of their choice back,
   trade texts fire as in a normal trade.
6. **Person cards with both symbols.** The English summary mentions
   "dual-symbol cards, owner chooses". No German source does. v1: every
   person card is one sword or one shield, nothing else.
7. **Winner's option (b) with an empty hand.** If the loser has no items
   the winner effectively gets only option (a). v1: option (b) hidden
   when the loser holds nothing.
8. **Giftmischer timing.** "Even after support is declared" but before or
   after items? v1: at any point up to the count; overrides everything.
9. **Timing of Doktor vs the winner's look.** "Right after the fight"
   means before the winner peeks. v1: the winner's choice is offered only
   after a Doktor window closes.
10. **Reviews disagree on best count**: hall9000 says even counts, six is
    best; spieletest says 6–8; several say 3 is broken without house
    rules. v1: solo default 6, lobby allows 3–10 with a note at 3.
