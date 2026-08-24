---
tags: [project, reference]
status: current
started: 2026-08-24
---
# jiangshi in the pocket — 中英對照表

Canonical naming for development. **The `id` column is the contract** —
it is what appears in `data/*.json`, in engine code, and in every sprite
symbol id. The two language columns are display strings and belong in the
theme files, never in code.

Companion to [[jiangshi in the pocket - ruleset spec]].

> **Why ids are English-and-hyphenated.** Not a preference — the sprite
> sheet, the JSON keys and the CSS class names all share this namespace,
> and the inherited engine already keys `icon("tile", id)` off it. Keep
> ids ASCII, lowercase, hyphenated, and **never translate them.**

---

## ⚠️ One inconsistency to settle first: 殭屍 or 僵屍

Both spellings are in the notes: **殭屍** (used for 殭屍王 and the project
framing) and **僵屍** (used in the event pool tables). They are variant
forms of the same word.

**Recommend 殭屍 throughout.** It is the standard Traditional Chinese form
for the hopping vampire, and the 歹 radical carries the corpse sense that
僵 (merely "stiff") does not. 僵屍 is more common in Simplified contexts.
**Pick one and sweep** — a game whose own monster is spelled two ways in
its own UI is a small, avoidable embarrassment.

Romanisation stays **jiangshi** (no tone marks, no hyphen) — it is the
project name and the URL slug.

---

## Tiles — indoor 室內

| `id` | 繁體中文 | English | Role |
|---|---|---|---|
| `gatehouse` | 門廳 | Gatehouse | Start |
| `apothecary` | 藥鋪 | Apothecary | 丹藥 search |
| `woodshed` | 柴房 | Woodshed | 武器 search |
| `sutra-hall` | 經堂 | Sutra Hall | 符咒 search |
| `mourning-hall` | 靈堂 | Mourning Hall | 符咒 search |
| `courtyard` | 天井 | Courtyard | The moon gate |
| `blacksmith` | 鐵匠鋪 | Blacksmith | 武器 search |
| `counting-room` | 帳房 | Counting Room | 丹藥 search, +1 HP |
| `incense-hall` | 香堂 | Incense Hall | Restores a cower charge |
| `sealed-crypt` | 停柩房 | Sealed Crypt | The tablet |

## Tiles — outdoor 室外

| `id` | 繁體中文 | English | Role |
|---|---|---|---|
| `back-steps` | 後門石階 | Back Steps | The seam |
| `dry-well` | 枯井 | Dry Well | Hazard, no search |
| `bamboo-grove` | 竹林 | Bamboo Grove | 符咒 search |
| `memorial-arch` | 牌坊 | Memorial Arch | 武器 search |
| `pavilion` | 涼亭 | Pavilion | Filler |
| `pagoda-tree` | 槐樹 | Pagoda Tree | 丹藥 search, +1 HP |
| `stone-ward` | 石敢當 | Stone Ward | The outdoor hub |
| `stream` | 溪澗 | Stream | Running water |
| `earth-god-shrine` | 土地廟 | Earth God Shrine | The banner; the prayer |
| `mass-grave` | 亂葬崗 | Mass Grave | The burial |

## Items

| `id` | 繁體中文 | English | `cat` |
|---|---|---|---|
| `precept-knife` | 戒刀 | Precept Knife | weapon |
| `peachwood-sword` | 桃木劍 | Peachwood Sword | weapon |
| `coin-sword` | 銅錢劍 | Coin Sword | weapon |
| `sevenstar-sword` | 七星劍 | Seven-Star Sword | weapon |
| `truefire-talisman` | 真火符 | True Fire Talisman | magic |
| `fivethunder-talisman` | 五雷符 | Five Thunder Talisman | magic |
| `blood-talisman` | 血符 | Blood Talisman | magic |
| `cinnabar` | 硃砂 | Cinnabar | magic |
| `soul-banner` | 攝魂幡 | Soul-Snatching Banner | relic |
| `sticky-rice` | 糯米 | Sticky Rice | medicine |
| `black-dog-blood` | 黑狗血 | Black Dog Blood | medicine |
| `golden-elixir` | 金丹 | Golden Elixir | medicine |
| `protective-charm` | 護身符 | Protective Charm | charm |

## Categories

| `cat` | 繁體中文 | English |
|---|---|---|
| `weapon` | 武器 | Weapon |
| `magic` | 符咒 | Talisman |
| `medicine` | 丹藥 | Medicine |
| `relic` | 法器 | Ritual implement |
| `charm` | 護符 | Charm |

Note `relic` holds exactly one item and `charm` exactly one. Both are
categories rather than special cases so the search tables and the slot
rules stay uniform.

## Events

| `t` | 繁體中文 | English |
|---|---|---|
| `JIANGSHI` | 殭屍 | Jiangshi |
| `HP` (`hp < 0`) | 損血 | Lose Health |
| `HP` (`hp > 0`) | 回血 | Gain Health |
| `NOTHING` | 沒事 | Nothing happens |
| `POISON` | 中毒 | Poisoned |
| `VILLAGER` | 村民受傷 | A villager is hurt |

## Actions and mechanics

| Code term | 繁體中文 | English |
|---|---|---|
| `MOVE` | 移動 | Move |
| `STAY` | 停留 | Stay |
| `COWER` | 躲藏 | Cower |
| `cowerCharges` | 躲藏額度 | Cower charges |
| `search` | 搜索 | Search |
| `flee` | 逃跑 | Run |
| `breach` | 破牆 | Breach |
| `rite` | 儀式 | Rite |
| `seam` / `exteriorDoor` | 月門 | Moon gate |
| `tablet` | 神主牌 | Ancestral tablet |
| `poisoned` | 中毒 | Poisoned |
| `turn` | 回合 | Turn |
| `band` | 時段 | Hour band |
| `attack` | 攻擊力 | Attack |
| `health` | 血 | Health |

## The King and the endgame

| Term | 繁體中文 | English |
|---|---|---|
| the King | 殭屍王 | the Jiangshi King |
| the seal | 鎮屍 | the seal |
| midnight | 三更 | the third watch |
| threshold | 門檻 | threshold |

## Outcomes

| Code | 繁體中文 | English (verdict card) |
|---|---|---|
| `WIN_BURIAL` | 下葬 | The tablet is back in the ground |
| `WIN_SEAL` | 鎮屍 | The paper is on his forehead |
| `SURVIVED` | 見到天亮 | You saw the night out |
| `LOSS_HEALTH` | 傷重不治 | — |
| `LOSS_KING` | 王帶走了你 | — |

⚠️ **`WIN_SEAL` and `WIN_BURIAL` must read as equals.** Same register,
same length, neither grander. The seal is the hidden ending, not the
better one — see the spec §9.

## Setting

| Term | 繁體中文 | English |
|---|---|---|
| the corpse hostel | 義莊 | the corpse hostel |
| the village | 村子 | the village |
| running water | 活水 | running water |
| corpse-poison | 屍毒 | corpse-poison |
| the ghost tree | 鬼樹 | the ghost tree |

Note **屍毒** is the substance and **中毒** is the state of having it. The
event and the status flag are `中毒`; flavour text about what is in your
blood says `屍毒`.

## For the bilingual work

Where each of these ends up, per the plan's bilingual TODO:

| Layer | Holds |
|---|---|
| `data/*.json` | **ids only** — never a display string |
| `data/theme.<lang>.json` | every name in this table, plus flavour |
| `assets/icons.svg` | symbol ids matching the `id` column |
| `js/epilogue.js` | ⚠️ needs per-language **assembly**, not a string table — Chinese word order and measure words break the fragment structure |

**The one file that resists this table** is `epilogue.js`. Everything else
is a lookup; the epilogue composes a sentence, and a sentence is not a
lookup. See the bilingual entry in
[[jiangshi in the pocket - redesign]].

## Links
- [[jiangshi in the pocket - ruleset spec]] — the mechanics these names attach to
- [[jiangshi in the pocket - rulebook]] — the rules in prose
- [[jiangshi in the pocket - redesign]] — the design record
