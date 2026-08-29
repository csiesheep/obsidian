---
tags: [project, log]
status: current
started: 2026-08-28
---
# jiangshi in the pocket — work log

Running log of what shipped, what it cost to find, and what is still open.
Newest day first. Written from verified state, not from intention: every
"landed" below was checked against `origin/main` and, where it ships, against
production.

---

## 2026-08-28

**100 commits to `main`. 27 issues closed. 2 open.**
`origin/main` at `4a83270`. Production `CACHE` tracked the repo all day.

### Shipped

**The fight got a face and then lost its scaffolding.**
- **#94** — a persistent creature panel over the tile: the creature at size, one
  caption carrying its story sentence and its attack, equal action cards, a
  bare-hands drawing, and the villager transforming as the panel opens.
- **#97** — the full-screen scare removed. `jumpScare` became `announceFight`:
  duck the room, fire the cues, **no picture**. Fights are **1.4×–1.7× sooner**.
- **#103** — the jolt given back, small and inside the panel, plus a breath while
  you choose and a darker ground. Pacing held at **1.0×** — the speed #97 bought
  was not handed back.

**Panels brought into one language.**
- **#98** — the full-backpack panel: dark, unframed (ellipse ground, not a mask —
  a mask would fade the focus ring on a panel that is all controls), the detail
  storey opening on the find's own name, and 點兩下 (first tap reveals, second
  commits). Its size was **duplication, not typography**: the reveal panel had
  already shown and named the item a second earlier.
- **#101** — the verdict card lost the seed line and both replay buttons. The
  buttons had **no appearance rule at all**: "Play again" was rendering as a
  native grey Arial control, "Menu" as a bare green link.
- **#105** — four verdict pictures. `showOverlay` now picks the scene from
  `state.outcome` rather than `opts.tone`, so **the two wins stop sharing one
  picture by construction** — 鎮屍 is the hidden ending and was showing the
  common ending's art.

**Art.**
- **#88 / #89** — the item set and all four burning blade variants.
- **#92 / #93** — the four 攻擊力 tiers as single full-body creatures; three
  villagers drawn at random.
- **#99** — three faint fills in `scare-zombie` were being outlined at full
  opacity; the smoke's mask rect was returning a hard rectangular frame exactly
  where the design says it has no edge.

**Language.**
- **#104** — the first-run letter: zero Han in English (was 13), shortened, in a
  handwriting face, and place names now interpolated from `tiles.*` so a rename
  follows into the letter.
- **#106** — four English strings hardcoded in CSS `content:`, showing on every
  verdict card in 繁體中文. Moved to `theme.verdict.epitaph`.

**Engine and tooling.**
- **#95** — an invariant proving refusing every villager cannot put the King out
  of reach. **Computed, not sampled.**
- **#100** — the unreachable scare renderer marked rather than deleted, with
  live and dead listed side by side.
- **#102** — `js/robot.js`, an AI driver behind `?robot=1`.
- **#96 (partial)** — `js/reach.js`, a reachability tool aimed at a named ending.
- `tools/ends.html` — all five verdict cards side by side with a language toggle.

### The day's second lesson: a guard that cannot see its subject

**#115.** The #113 guard asserts exactly the right thing — containment rather
than a selector, and it refuses to pass on an empty region — and it is blind to
the thing it guards. It builds its own DOM with `host.innerHTML`, so the nesting
it checks is the nesting the **test** wrote. FE demonstrated the failing
direction by breaking the fixture, which is the guard's own input.

Run it the other way — add `class="panel panel--status"` in `game.html` — and the
wash lands on the clock block: **84px against the body's 323px**, containing
neither the hands nor the pack, still red, still toggling, still looking
deliberate. **The suite reports 359 passed, 0 failed.**

The shell digest *did* catch the raw edit — but it is a tamper detector, not a
semantic one. Commit and run `tools/record_shell.py`, which is what anyone making
the change would do, and it goes green with the wash on the wrong box.

**And the instrument lied again, in the same direction as always.** `?robot=1`
adds a Robot button that wraps the nav 46 → 86 and overflows the page by 31px at
375×667. I had that on screen as a layout regression before I checked what was
producing it. The driver changed the layout it was measuring.

### The day's actual lesson

**The instruments were wrong about as often as the code — roughly a dozen each.**
Every real defect was found by someone probing the *instrument*, never by
re-reading.

- **Three sessions miscounted the same verdict card three different ways**: a
  class check that counted one loss eight times, an `offsetParent` check that
  counted a real ending as zero, and a scheduling race that reported eight
  nights from one loss.
- **A build where every written test case passed and was still wrong**: hover
  armed the drop cell, so desktop kept one click. *Hover is not an intentional
  act* — a confirm satisfied by hovering is not a confirm. Correct in every
  transition, wrong in the meaning of one.
- **`tools/ends.html` was wrong twice while looking authoritative** — first no
  artwork (`<use>` cannot resolve across documents), then no dressing (the clone
  had its `id` stripped, so every `#overlay` rule missed). *A card that renders
  something is the most convincing way to be wrong.*
- **A text scan of all five cards for Latin returned nothing** while the English
  sat in a screenshot beside the result. CSS `content:` is not in the DOM.
- **Three falsifications varying one dimension are one falsification** — the
  `content:` guard was tested verbatim, minified and single-character, all
  double-quoted, and a single quote walked straight through it.
- **An empty `CSSRuleList` is truthy.** CSS Nesting gives every style rule one,
  so `if (r.cssRules) { recurse; continue; }` skipped every rule that could carry
  content. 802 rules, 1085 visited, 223 checked, probe never seen — numbers that
  all look healthy.

**Durable rules from it:** a walk is trustworthy only once it has been shown to
*find* something it should find, never because it came back clean. Derive
falsifications from the grammar of the thing, not from the matcher you just
wrote. Don't parse a language you already have a parser for. And every fix
relocates the risk rather than deleting it — location → translation → the scan's
own grammar → does the traversal traverse.

### Landed after the first write-up

- **#107** — sound was **muted by default** and a phone could never turn it on;
  the only switch is the `M` key and the button went with the utility panel in
  #73. Defaulted to on, no button added, and the adjacent calm-mode precedent
  deliberately **not** copied: that one abandoned the stored key because players
  were stuck with no way out, and doing it here would overrule someone who chose
  silence, every load, and free nobody.
- **#108** — `中毒` was hardcoded in `render.js`. It undercounted: `renderPoison`
  had **three** hardcoded strings, and the reported one was the least of them —
  the rate said "−1 each turn" in *every* language, and the screen-reader line
  was hardcoded half in each. **The single channel that cannot see the glyph was
  reading a sentence no language owns**, and nobody would ever have filed it. A
  stale gloss-stripper was also truncating "Ritual implement" → "Ritual"; it was
  a no-op in Chinese (no value has a space) and wrong in English, so it went.
- **#111** — the iPhone portrait screen **fits with no scrolling**: 375×667,
  tile 143, overflow 0, and it reads as a board rather than a postage stamp.
  Two gates that disagreed were aligned — the stylesheet surrendered the frame
  at `max-width:800 or max-height:560` while `fitBoard` took it back at
  `min-width:801`, so a phone in landscape had a layout that had given up the
  frame and a sizer that had not, writing an **inline** `--tile` no stylesheet
  can outrank. And `.doorway--stay` was missing from the tap-target block
  entirely, shipping at 40×40 under the 44px floor that block exists to enforce.
- **#112** — 戰鬥中不能吃. `app.js:1241` had asserted this in prose for a long
  time with nothing enforcing it; now `game.inFight` does, set in `fightBeat`
  and cleared in `close()`. **Two near-misses on one commit, the same fault at
  different layers:** the gate's first version had the rule right and the
  appearance lying (flag held, buttons stayed enabled — a control that looks
  live and silently refuses); the guard's first version had the assertions right
  and the region empty (the fixture's buttons were dead before any fight, so
  both assertions were trivially true on a pack that could never act).

### Landed and verified after that

- **#113 + #114 together**, one measurement and one move of the constant, which
  was the point of pairing them. `--phone-chrome` 424 → **408**, found by sweep
  rather than by summing my table — 401 fits, 400 overflows by one pixel — and
  my table had a row that was **wrong in the direction that would have cost tile
  height**: making the status row a flex row so the mark could sit in it grew it
  62 → 72 and bought nothing.

      tile     143.1 -> 152.5   (+6.6%)
      hands    114   ->  95.4
      sidebar  319.6 -> 301.3
      focus    243   -> 259.2

  Poisoned now costs **zero height** — panel delta 0.0, status delta 0.0,
  overflow 0 either way, reversible — which was the 43px hole in #111. The mark
  sits at left 136 against a clock ending at 126, on the same row. The labels are
  off the screen and still in the DOM at 1×1 in both languages.

  **The wash is a background-image, not a background-color**, so
  `backgroundColor` reads unchanged in both states. FE measured it on the wrong
  element, got `rgba(0,0,0,0)`, and had written "the wash is not rendering"
  before checking. I hit the same reading from the right element and only found
  the red by looking at `backgroundImage`.

### #115, and the family it turned out to belong to

**Fixed and verified at `4a83270`, PASS (360).** The fixture now imports
`game.html`'s real `.sidebar` and proves the region before asserting
containment. Both sabotages were run **in `game.html`, then committed with
`record_shell.py` re-run**, so the digest was green and could not be what caught
them — one failure each, each naming the wrapper it actually found.

**The second instance was worth more than the first**, and FE found it by taking
the "look for others" paragraph seriously. `creaturePanel()`'s
`closest(".board-pane")` is deliberately `#board`'s **parent**, because
`renderBoard()` wipes `#board` and a panel mounted inside would be deleted by any
mid-fight refresh. `render.js` explains it at length; nothing enforced it, and
every stage fixture hand-wrote the nesting. Losing it means **the creature never
appears** — silent in the tests, obvious in play. Nine `querySelector` sites go
quiet with it.

**#116 is the third, and it was inside the second one's demo.**
`<section class="board-pane" id="board-pane">` carries both names on one line, so
the rename took the id — and `app.js` writes screen-reader labels by that id
under `if (el)`, where a missing id is silence rather than an error. In
繁體中文: `#board` 遊戲圖板, `#actions-pop` 輪到你, `#log` 旁白, and the board pane
**"Board"**. Three of four localised, one silently English, suite green.

**The shape of all three:** a string in `game.html` that code depends on, with
the dependency recorded in a comment and restated in a fixture. Not drifted on
`main` — the third one is a gap, not a defect.

### Open

- **#109** — the tab icon becomes 僵屍4's head. Ruled: `favicon.svg` only, the
  "neck up, tighter" crop, an icon-weight redraw rather than a scaled painting,
  and the deliberate break of the three-surfaces rule written into
  `tools/make_icons.py`.
- **#116** — the four aria ids `app.js` localises by are not in the
  both-directions check. Not drifted; a gap.

### Waiting on the repo owner

- **Trim the backpack cells too?** FE correctly refused to do it:
  「縮小武器/身上/右手 panel」 names the hands panel, and the pack trim was **my
  suggestion rather than a ruling**. It is worth about another 17px of tile.

### Ruled by the repo owner

- **Sound is audible.** Confirmed by ear: 有音效. This is the one question of the
  day that **no pane could answer** — two of them gave two different readings of
  the audio context's state and *neither* could say whether a sound came out of a
  speaker. It took a person with ears, and nothing else would have done.
  **#110 closed on it.** The gaps it names stay true and unfixed: searching a
  room, the most repeated action in the game, is still silent, and the poison
  tick still takes a health point without a sound.
- **Hands labels: unconditional.** 手機上不顯示 — hidden on phones in both states,
  so the panel height is a constant and `--phone-chrome` stays a single
  hand-maintained number. This avoids the outcome that sounded most reasonable
  and was worst: **a board that resizes as you pick things up.**
- **Favicon: one surface.** 只改分頁 — `favicon.svg` only; the four PNGs keep the
  house and keep being generated from `titlehouse`. `make_icons.py` claims "three
  surfaces, one building, and no way for them to drift", so the break is
  deliberate and must be **written into that file**: a favicon is read at 16px
  where a face is 16% of the icon, the app icons start at 192px where a
  silhouette is the whole job, and one drawing across a 12× size range stopped
  making sense the moment one of the two became a face.

### Closed since, with what stays true

- **#96** — 鎮屍 and 王帶走了你 **have never been rendered by playing**, by anyone
  or anything. 下葬 was reached today for the first time and every quantitative
  line on its card was checked against state. `js/reach.js` is the route; both
  targets are wired and honestly marked undriven.
- **#107** — sound was **muted by default** and a phone could never turn it on
  (the only switch is the `M` key, and the button went with the utility panel in
  #73). Defaulted to on. Audibility was unverifiable by any pane and was
  **confirmed by the repo owner by ear**, which is the only instrument that could
  have done it.
- **#108** — `中毒` was hardcoded in `render.js`; a stale gloss-stripper truncated
  "Ritual implement" → "Ritual". Both fixed; the screen-reader line that no
  language owned was the part nobody would ever have filed.
- **#110** — sound gaps. **Searching a room is completely silent**, and it is the
  most repeated action in the game; `itemPickup` exists but is wired only to a
  villager's gift and 硃砂. The poison tick takes a health point every turn in
  silence. The override socket already exists (16 named cues, file-or-synthesis,
  multiple takes) — this is not a build.

### Decisions taken

- **No music.** Ambience and event cues only.
- **`betrayal_sound_effect` is mostly not reusable** — 163 files, 43 MB against
  this game's 1.1 MB of assets, and the wrong world (chainsaws, werewolves, a
  clown room). A handful of room tones worth auditioning as raw material.
- **#91 closed** — the landing copy rewrite is cancelled; both structural
  findings on it were done. The dead `tagline` key had **already drifted**: the
  two copies matched in English while the Chinese one was a truncated older
  translation missing its whole third clause.
- **`scareNow` marked, not deleted** — the crowd choreography is recorded nowhere
  else, and the pictures turned out to be **live in two places**; a sweep on the
  name would have removed the creature from the panel and the hop's timing from
  every fight.

### Pending user decisions

- Whether to commit a **Han handwriting font**. The handwritten letter is
  English-only today; Chinese falls to Georgia by design, because the hand is
  scoped to `html[lang^="en"]` so Han never reaches a face that lacks it.

### Superseded

- **"iPhone overflows by 141px, with 39px unaccounted for"** — written earlier
  today, closed out by **#111**. The 39px was never a real remainder: I measured
  the **idle** screen after telling FE to measure with the actions window open,
  which is the same fault I had flagged in others all day. The true gap was
  **312px**, and the page now fits at 375×667 with overflow 0.
