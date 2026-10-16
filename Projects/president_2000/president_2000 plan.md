---
tags: [project, boardgame, plan]
status: m1
created: 2026-10-13
updated: 2026-10-14
---
# 2000：總統的誕生 / 2000: Taiwan Decides — plan

Created 2026-10-13. Repo `csiesheep/president_2000`, live at
`https://games.csiesheep.com/president_2000/` (not yet).

## Overview
三人卡驅動選戰遊戲，改編自 *1960: The Making of the President*，場景換成 2000 年台灣總統大選：陳水扁、宋楚瑜、連戰各由一位玩家執，從 1999 年 11 月開除宋黨籍到 3 月 18 日投票日，九個回合在 25 個縣市、154 個票塊上填塊、搶塊、押議題、打廣告，最後由棄保決定勝負。一局約 40 分鐘。網頁版：單人對兩個 bot、四碼房間三人對戰（空位由 bot 補）、英文與繁體中文、手機優先。同人作品，非官方；自創名稱與美術。

## Why this shape
以 `tiandihui` 為範本：prefix router、一個 Durable Object 一間房、`public/shared/engine.js` 純函式引擎同時跑在瀏覽器與 DO、`tests/sim.js` bot 對打 harness、i18n 全部在 `public/i18n/`。這個遊戲新的部分：三人（不是兩人也不是五到十人）、比例制票塊地圖、袋子抽方塊的支持檢定、兩次棄保結算、有全規則設計模擬器可直接改寫成 `tests/sim.js`。

## Licensing
原作 *1960: The Making of the President*，Christian Leonhard 與 Jason Matthews 設計，Z-Man Games（2007）／GMT Games（2017）出版。規則與機制不受著作權保護；風險在英文商標「The Making of the President」。
自創名稱：**2000: Taiwan Decides / 2000：總統的誕生**。中文名是 owner 定的；英文刻意不用「Making of」。
Credit line（頁尾一次）：「同人作品，非官方。靈感來自 Christian Leonhard 與 Jason Matthews 設計的 *1960: The Making of the President*；規則與機制不受著作權保護，本作為獨立實作、自創名稱與美術。」
真實政治人物：候選人用真名（這是歷史），不用照片、不畫肖像，以號次與顏色代表；事件牌全部是公開史實。
*Not legal advice.*

## Source material
- 規則書：[[president_2000 - rulebook]]（v0.2，自寫，不是原作規則；含 60 張事件牌）。
- 設計決策與模擬：[[president_2000 - design]]（第三節定案、第七節 30 個變體的模擬結果）。
- 模擬器：`Projects/president_2000/sim/sim.js`（Node，一局 0.01 秒）。
- 原作規則對照：ultraboardgames 的 1960 規則整理與規則書 PDF（連結在 design 第九節）。
- 史料：2000 年縣市得票、1996 縣市得票（初始盤的依據）、選戰大事記。

未決或粗糙處（v1 怎麼處理）：
| 點 | v1 |
|---|---|
| 規則書第十七節的 11 個小預設（袋子 12、議題衰減領先者 −1、背書換一半等） | 照 v0.2 做；模擬顯示影響小 |
| 張榮發挺扁、跪票 兩張牌史實未查證 | 先做，writer 查證後改牌文 |
| 連偏弱（模擬 23%） | 不給第 8 張牌；M2 harness 再看 |
| 走透透 另一種寫法（棋子所在縣市免檢定） | 不做 |

## Theme
| slot | original | now (zh) | now (en) |
|---|---|---|---|
| title | 1960: The Making of the President | 2000：總統的誕生 | 2000: Taiwan Decides |
| sides / roles | Kennedy / Nixon | 陳水扁（綠）、宋楚瑜（橘）、連戰（藍） | Chen, Soong, Lien |
| cubes | support cubes | 票塊上的小旗 | flags on vote blocks |
| bot names | — | 助選員／總幹事／操盤手（三個強度） | Volunteer / Campaign chief / Strategist |
| favicon | — | 一面紅色小旗 | a red pennant |

### Look
方向 A「街頭旗海」（1999 年競選旗）。Ground `#f7f4ee` 紙白，ink `#1a1a1a`，line `#d9d5cc`。候選人三色：宋 `#f07f1a`、連 `#1757b5`、陳 `#138a4a`；紅 `#d7263d` 是印章、按鈕與警示。游離塊淡色：綠 `#cfe8d8`、藍 `#cfdcf2`；無色 `#e3e0d8`。Display 與 body 都是 Noto Sans TC（900 / 700 / 400），數字用 Anton。方角 4px、2px 墨線、不做陰影；頂上一條紅白藍旗串。
Canvas: https://claude.ai/artifact/VH7BjNkQumRRPvZjfn7afB （第一排三個方向，第二排方向 A 全流程八頁）。

## Rules in scope (v1 = rulebook v0.2, exactly)
- 三人，9 回合；第 6 回合政見發表會、第 9 回合投票日。
- 25 縣市 154 票塊（綠營游離 38、藍營游離 85、無色 31），初始盤陳 25／宋 35／連 20。
- 回合：主動權（袋中抽到兩顆同色，贏家選位置）→ 行動 ×4（每階段輪轉起手）→ 動能結算（衰減、議題交換、槽位獎勵、議題衰減）→ 留牌。
- 出牌：事件或 CP；對手事件 1 動能觸發、2 動能封鎖；外力事件必觸發；楊吉雄爆料必觸發且拿到那回合必須打出。
- 行動：競選（填／跨營填／搶；宋跨區固定 1 CP，其他每區 1 CP）、廣告、議題。
- 支持檢定、地方大老（固定 4 顆）、區域媒體優勢、袋子（起始 12、抽空重裝 12）。
- 政見發表會（同時翻牌、兩張結算、2/3/4 顆）、兩段棄保（差距 ≥ 2）、投票日七步。
- 候選人特性：宋 5 CP 候選人牌、跨區 1 CP；連 3 CP 候選人牌、休息方塊 +1、起始媒體 2；陳起始動能 3、衰減進位。
- 手牌（v0.3）：前期發 5 出 4 留 1 不棄、後期發 6 出 4 留 2 不棄。牌庫：前期 75（事件 50 ＋ 地方 25）、後期 36（事件 20 ＋ 地方 16）；整局不洗牌；70 張事件牌全部在規則書 14.3。
變體與擴充（之後、資料驅動）：連發 8 張、走透透替代寫法、投票日事件、政見發表會事件、候選人牌復原。

## Architecture
- Worker + prefix router（`src/index.js`，從 tiandihui 複製只改 PREFIX）、static assets、一個 DO 一間房。
- `engine.js`：state = { seed+rng, turn, phase, counties[25]{blocks[]{t,o}}, pos[3], mom[3], bag[3], rest[3], media[7][3], issues[3], endorse[7], decks, hands, saved, flags, log }。actions：`playCard{card, mode:event|cp, action:{kind, plan}}`、`trigger`、`preempt`、`save`、`revealDebate`、投票日自動。`view(state, seat)` 藏別人的手牌與留牌、藏牌庫順序。RNG mulberry32，JSON clone。
- `bots.js`：從設計模擬器的啟發式起步（目標函數＝自己預估票 − 最強對手預估票，棄保用軟化流向），三級：助選員只填塊、總幹事算棄保與觸發、操盤手留牌、封鎖、卡議題平手。每個決定帶 `why` 給 talk。
- `room.js`：三席；每個行動 60 秒逾時由 bot 代打；斷線 15 秒 bot 接手；sessionStorage token 回座；30 分鐘無人刪房。
- Solo driver 在 `app.js`。

## Pages and UI
| Route | View | What is on it |
|---|---|---|
| `/president_2000/` | Landing | 2000 大字、三面候選人旗、單人／開房／加入、credit |
| `?play` | Solo setup | 選候選人（含各自強弱一句）、bot 強度三級、教學開關 |
| `?room=ABCD` | Lobby | 代碼、三席（人／bot／空）、桌邊話、開局 |
| (in game) | Table | 回合與動能列、議題三槽＋袋子、區域折疊清單（展開縣市看票塊與小旗）、手牌列 |
| (in game) | Card | 牌的大圖與效果、事件／CP 選擇、競選縣市清單含檢定機率、桌邊話 |
| (in game) | 政見發表會 | 三議題三欄的牌與 CP 合計、留牌列、翻牌 |
| (in game) | 開票／Game over | 當選人、票數條、投票日流水、領先縣市、再來一局 |
| `/president_2000/rules` | Rulebook | 目標、回合、出牌、檢定、棄保、投票日，附 60 張牌 |

Mockup: https://claude.ai/artifact/VH7BjNkQumRRPvZjfn7afB 。手機優先，390 寬。地圖用「區域折疊清單」不用地理圖：手機上 25 個縣市的票塊列放不下，展開一區才看縣市。

## Bots and balance
- 第一版 bot 直接改寫自設計模擬器（`sim/sim.js`）的啟發式；harness `node tests/sim.js <games> [variant=value …]`，每格子程序、重試。
- 目標（v0.2 模擬的基準，1000 局）：勝率陳 39 / 宋 38 / 連 23，平均票塊 44.9 / 44.7 / 43.4，勝差 3.6 塊，投票率 86%，興票案 100%、授意說 37%。M2 的 bot 對打落在陳與宋各 30–45%、連 18–30%、投票率 82–90% 就算合格；偏出去先查 bot 再查規則。
- 「像人」：會在對手有動能時不打對手大牌、會留 4 CP 牌去政見發表會、會在投票日前把差距卡在一顆。

## Team (agent-team-delivery)
Phase 0 proposal; the owner confirms it with the first go.

| Files | Role |
|---|---|
| `public/shared/*.js`、`src/`、`tests/sim.js`、`tests/diag.js`、`wrangler.jsonc`、`package.json` | BE |
| `public/*.html`、`public/app.js`、`public/landing.js`、`public/rules.js`、`public/style.css`、`public/favicon.svg` | FE |
| `public/i18n/*`、規則頁文字、`README.md` | writer |
| `public/art/` 與產生它的 prompt | artist |
| `tests/*.test.js`、`tests/driver.js`、`tests/harness.js`、`tools/`、`TEAM.md` | orchestrator |

- 中文牌文在 `public/shared/cards.js`（BE 的檔案）裡：writer 改牌文是跨界修改，交付時點名。
- `.gitignore` 沒有主人，照 civil_war 的做法留白。
- First guard：group 0 從規則書抄常數（154 塊、每縣市票塊數、初始盤 25/35/20 與 13/30/31、休息方塊 2/1/0、地方大老 4、手牌 7/4/1/2、事件牌 18/17/18/7、9 回合）；group 1 檢查一局能被設定、第 1 回合第 1 階段每一席至少有一個合法動作（出任一張牌當 CP）。證偽：`orch falsify` 把棋盤資料裡台北縣的 24 改成 23，group 0 的「總塊數 154」與「台北縣 24」兩條要紅，印出的那一行留在筆記。
- Placeholder deploy：yes，`games.csiesheep.com/president_2000/`（noindex）。
- Deploy rule：M5 之前（頁面 noindex）orchestrator 每次 land 之後部署並逐位元組比對；M5 起只在 owner 說 go 時。指令 `npx wrangler deploy`。
- Orchestrator's first goal：M1 engine。Priorities：(1) 棋盤、牌庫、回合迴圈、支持檢定與袋子；(2) 60 張事件牌資料驅動，先做效果最簡單的 40 張，興票案三張與「本回合」旗標最後；(3) 政見發表會、兩段棄保、投票日七步；(4) fuzz 合法動作、view 不漏手牌；(5) 用設計模擬器當對照：同種子同策略時引擎的 bot 對打數字要落在 v0.2 基準內。

## Milestones
- M0 Scaffold and team setup (Phase 0): router, placeholder deployed and verified, `TEAM.md`, a first guard seen red. M1 on are orchestrator issues.
- M1 Engine + tests (incl. a fuzz test over legal moves).
- M2 Bots + harness, win-rate table against the v0.2 targets.
- M3 Solo UI (方向 A), bot talk, i18n, rules page with the 60 cards.
- M4 Rooms: DO, clocks, chat, bot fill, reconnect, rematch.
- M5 Ship: noindex off, OG, JSON-LD, hub tile, sitemap.

## Open questions (decide before M0)
1. ~~英文名與 slug~~ — **已定**（owner 2026-10-13）：2000: Taiwan Decides / `president_2000`。
2. 美術方向：A 街頭旗海 / B 選舉公報 / C 開票之夜 — recommendation: **A**，棋子用小旗，地圖用區域折疊清單。
3. 真名：用陳水扁、宋楚瑜、連戰真名，不用照片與肖像 — recommendation: 用真名（歷史題材），美術只用號次與顏色。
4. ~~bot 三級的名字~~ — **已定**（owner 2026-10-13）：樁腳／總幹事／操盤手；2026-10-14 最弱一級改名助選員（owner「A and C」）。
5. 房間計時 — owner 未反對，照建議：每個行動 60 秒，政見發表會翻牌 30 秒（M4 前可改）。
6. 設計模擬器 — owner 未反對，照建議：M2 改寫成 `tests/sim.js`（BE），原檔留在 vault 當對照。

## Decisions
- **2026-10-13** — 設計定案：規則書 v0.2（門檻 4、宋跨區 1 CP、爆料必觸發且必打、連 7 張）；模擬 30 個變體，v0.2 勝率 39/38/23。
- **2026-10-13** — 名稱：《2000：總統的誕生》／2000: Taiwan Decides，slug `president_2000`（owner 確認）。
- **2026-10-13** — UI：先以方向 A 街頭旗海實作，之後重新檢視（owner）。真名、不用肖像；bot 三級 樁腳／總幹事／操盤手（owner）。
- **2026-10-13** — 事件牌樣張 12 張加進 canvas（Cards 版面）：色帶歸屬、CP 黑方塊、議題圓、催票縣市與休息方塊底列、必觸發紅框。
- **2026-10-13** — Repo `csiesheep/president_2000` 建立，scaffold 自 tiandihui。
- **2026-10-13** — 第一次 go（owner：「Go」）：所有權表、部署規則、第一道 guard、placeholder 部署、M1 優先序全部照提案。
- **2026-10-13** — Phase 0 完成：placeholder 上線並逐位元組比對 7 個檔案相符；`TEAM.md`；第一道 guard 通過 17／失敗 0／尚未實作 11，證偽（台北縣 24→23）紅在 4 條、理由正確。Phase 0 的程式碼只有起手 session 驗過。
- **2026-10-13** — 第二次 go（owner：「Go」）：orchestrator session 以 task chip 開在 repo，目標 M1，優先序照提案。起手 session 到此結束，不再寫產品程式碼。
- **2026-10-14** — owner 裁決「好，用 2」：手牌改 1960 形狀（5/4/1/0、6/4/2/0）、前期牌庫補到 75（+10 事件 +5 地方）、初始盤陳 −2 連 +2。規則書 v0.3；模擬 40 / 37 / 22。repo 的 cards.js、engine 發牌、guard 的手牌與牌數常數要跟著改（issue 給 orchestrator）。
- **2026-10-14** — owner 裁決「A and C」：bot 最弱一級「樁腳」改名「助選員」（英文 Canvasser → Volunteer，也避開和催票 canvass 撞字）；名詞「樁腳主」改為「地方大老」（英文仍是 local boss）。原因：bot 名和名詞同時出現在畫面上會混淆。規則書、design、plan 已改；repo 的字串與測試由 orchestrator 開 issue。
- **2026-10-14** — owner 裁決「#10 is fine」：M2 平衡，全操盤手對打 1000 局三批合計連約 30.2%（帶的上限 30%）算合格；陳、宋、投票率都在帶內。另「It is fine」：全助選員對打宋贏 97% 也接受。
- **2026-10-14** — owner 對 Q4–Q8 回「Yes」（照 orchestrator 建議）：Q4（外力牌放方塊由被放的一方選）、Q5（棄保類牌移除與放方塊都檢定）、Q6（本回合免檢定只免同營）、Q8（事件縣市前後期各自分配）維持；**Q7 改 B**：政見發表會牌出完時，沒人出過牌的議題（0 比 0 比 0）不結算，議題依原順序回軌道剩下的空槽。規則書 §九 6 已改。
- **2026-10-14** — owner 選 UI 改版三案中的 **C（桌遊桌面）**：木桌、米色印刷棋盤、木頭方塊、襯線字，點地圖上的縣市跳出該縣選項、手牌扇形排開。同時要求：牌面要有插圖（3 版，每版裡各陣營畫風不同）、地圖要有台灣形狀（3 版）、議題與三位候選人也要有圖（各 3 版）。候選人圖照本計畫「不用照片、不畫肖像」的原則，只畫象徵物配號次與顏色。地理資料：owner 不同意下載 g0v 縣市界，地圖輪廓與縣市界為手繪近似。設計稿：claude.ai 私人 artifact 69Q4zH2AbWEXV7ikBuMHTd。
- **2026-10-14** — owner 選地圖 **一版「印刷棋盤」**：台灣輪廓、近似縣市界與七大區，每縣一張票塊紙片，七個市（台北、基隆、新竹、台中、嘉義、台南、高雄）用拉線放到海上。牌面插圖等「美術三」完成後三版一起選。
- **2026-10-14** — owner 選插圖：**牌面＝美術三「桌上模型」**（陳剪紙、宋黏土、連木頭黃銅加藍漆鐵皮、地方鐵道模型小鎮、外力報紙雕塑，Qwen Image 2.1 微距照片風）；**議題＝美術二「平面插畫」**（磚紅、米白、炭灰的中世紀現代風）；**候選人＝美術二「競選文宣」**（宋手繪看板、連九〇年代官方海報、陳絹印海報；只畫象徵物：雨鞋與橙背心／深藍扶手椅與白梅／裂開柏油長出的綠芽）。清廉議題圖用「出淤泥而不染」的白蓮（天秤版本兩次都畫成金幣較重，棄用）。
- **2026-10-15** — owner：「Implement a tutorial of the game, try to lead the user run some steps」。orchestrator 裁決（#27）：只做單人、固定一局（陳對助選員、固定種子），帶玩家親手走完第一回合的一次完整行動（出牌拿 CP、競選、點縣市放塊、一次檢定、結束行動），看一次對手、預告議題；教學中只能照教學走，隨時可跳過；首頁入口 `?tutorial`。
- **2026-10-13** — 工具觀察：`orch falsify` 只認 git 追蹤的檔案，對未 commit 的新檔案會印「pattern 沒命中」但其實改了、restore 不還原。先 commit 再證偽。
- **2026-10-15** — owner 定稿精簡牌桌（#29，canvas WQA4hG46qh5FBqXCWGfBjh「定稿」）：「第一版的候選人 / 第二版的議題 / 第一版的地圖」；地圖上方塊一樣大、框照票塊數變大；候選人以圓圖站在所在縣市，縣市框不變色、上方與地圖上方都不另列位置；候選人板縮小，票數寫成「33」+小字「0萬票」（每顆 10 萬票）。orchestrator 裁決（#29，不是 owner 的）：手機上手牌、已留、袋子改成點候選人板才顯示。
- **2026-10-15** — owner 裁決媒體改全國（回應 orchestrator 的簡化清單 2a/2b 與 A/B/C 三案）：「2b + B」。即：七區媒體格改成一格「全國媒體」，廣告行動照舊但不選區；拿掉區域媒體優勢的免檢定；全國媒體領先者保留「交換議題位置」與投票日每顆換 1 顆袋中方塊，並**每回合結束 +1 動能**（B 案）。簡化清單其他項（封鎖、背書、檢定條件、議題獎勵、休息方塊…）owner 尚未裁決。orchestrator 待辦：改規則書、寫驗收（含三位候選人勝率範圍）、派 BE。
- **2026-10-15** — owner：「end game page，可以用qwen2.1 產生圖，顯示得票數跟得票率 / 設計三個版本，給我看」，看完三版選「第一版」（開票之夜：當選人陣營的旗海與煙火主視覺、得票數與得票率、投票率、你的名次、2000 年史實對照；canvas R26gizGsymbFUZnLxPoP7V）。#32 artist 把三張主視覺做成 art/end/<seat>.webp，#33 FE 改結局頁。
- **2026-10-15** — owner：「重新設計卡牌UI，不要有那麼多線條的框。用陣營顏色當成卡牌的背景色。設計3版給我看」，選「二版」（滿版圖：插圖滿版上緣、融進陣營色底、CP 在左上色塊、沒有框線；canvas KxzB6DUEdDH45zSVb477NQ）。陣營色：陳 #2f7d46、宋 #c25a12、連 #2456a6、外力 #3d3732、地方 #86683a（宋與地方加深，是 orchestrator 為白字對比定的）。候選人牌不在範圍。#36 FE；2026-10-15 land（296dc58，部署後線上 same 123 / diff 0）。實作時宋用 #bc540c（比 #c25a12 再深一點，白字對比才過 4.5:1，orchestrator 裁決）。
- **2026-10-15** — owner：「候選人牌也改版」。orchestrator 裁決（#37，owner 沒逐條說）：照 #36 二版做——座位陣營色底、沒有框線、art/candidates/<座位>.webp 滿版插圖、左上 CP 角標（5/5/3）、蠟封章改成右上角膠囊「整局一次／已用」；行為不變（點了再問一次）；不能用時跟不能出的手牌一樣淡。#37 FE；2026-10-15 land（63c775d，退回兩次：桌機名字落在畫面外與英文名被截、不能用時沒變淡；部署後線上 same 123 / diff 0）。
- **2026-10-15** — owner 對體驗改善提案（canvas 73DdDpKSfhjNotCsVUKypN，15 項分 P1/P2/P3）說「Design P1 first and show me」，看完 P1 設計頁說「Go ahead」。P1 = ①回合開場卡、②對手出牌重播、⑤介面音效（瀏覽器合成，0 KB）、⑨縣市框插圖、⑬悔一步（單人）、⑭對手速度。orchestrator 定的細節，寫在 owner 看過的便利貼上：回合日期 = 2000/3/18 往前 (9−n)×2 週；悔一步只在單人、電腦沒動且沒抽亂數時可悔；開場卡在房間各自出現、不擋計時。orchestrator 裁決（owner 尚未看過）：便利貼寫的頭條是「影響最大的那一步」，為了能驗證改成「上一回合以事件打出或觸發、CP 最高的牌」。第一批：#40 BE（turn 紀錄帶 votes）、#41 ⑨、#42 ⑤⑭、#43 ⑬；第二批 ①（#44）、②（#47；GitHub 的 #45 是手牌被切掉、#46 是縣市票數）。
- **2026-10-15** — owner 要「合併廣告媒體和議題」，看了 orchestrator 的評估後對四項回 yes（原話逐條在 [[president_2000 - v0.5 草稿（廣告與媒體併入議題）]]）；看完 v0.5 草稿說：「v0.5（廣告與媒體併入議題）可以」。下一步（orchestrator 的計畫，不是 owner 的原話）：寫 v0.5 驗收，派 BE 做可切換的規則版本（v0.4／v0.5），兩版各跑 600 局比較。
- **2026-10-15** — owner：「設計一下 背書，如何在地圖上顯示」。三版在 canvas 上（A 區域印章、B 縣市框蓋小章、C 各區背書表），owner 選：「背書 B版」。B 是在每個縣市框上蓋一個持有者顏色的「背」字小章，旁邊有圖例「章的顏色 = 該區背書持有者」；點縣市時，說明寫出這一區由誰背書、投票日的效果。orchestrator 當時推薦 A，owner 選 B。待開 issue 派 FE。

## Next steps
- [x] Owner confirms the plan, the open questions and the Phase 0 proposal (first go). 2026-10-13
- [x] Phase 0: placeholder, `TEAM.md`, first guard seen red. 2026-10-13
- [x] Owner's second go: the orchestrator session starts M1. 2026-10-13（owner：「Go」；task chip「Run the president_2000 orchestrator」已建，cwd 是 repo）
- [ ] M1 engine lands（orchestrator 的 issue）。
