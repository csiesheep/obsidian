# 無聊遊戲簿 / Bored Games — plan

Created 2026-09-19. Repo `csiesheep/bored_games`(還沒建,等 owner 確認名稱), live at
`https://games.csiesheep.com/bored_games/` (not yet).

## Overview
一本作業簿,裡面是小時候無聊時自己發明的遊戲。每款一個手勢、三分鐘一局、不需要教學文字。第一款是**紙上空戰**:兩個人,一張對摺的紙,用筆尖滑出一條線,線穿過對方的飛機就擊毀,每邊三架,先打光對方的人贏。網頁版加上:跟電腦玩、同一支手機兩人對坐、四個字母的房間碼連線對戰、英文 + 繁體中文、手機優先。原創,沒有出版品原作。

系列第二款預定是車窗跑者(手感原型已過關),之後的候選見 [[childhood game ideas]]。

## Why this shape
- 以 `tiandihui` 為底:prefix router、靜態資產、一個房間一個 Durable Object、`tests/sim.js` 子行程 harness。
- **跟兄弟 repo 不一樣的地方:一個 repo 裝整個系列。** 這些遊戲每款只有幾百行,手繪筆觸、紙張、字體都共用;一款一個 repo 的話,每次都要重跑 Phase 0。所以 `/bored_games/` 是作業簿封面(目錄),每款遊戲一個子資料夾 `/bored_games/<game>/`,之後加遊戲只是開新 issue。
- 兩人遊戲,所以「bot 補滿座位」變成「對手沒來就由電腦頂上」;房間只有兩個座位。
- 新東西:引擎是連續座標的幾何(線段對圓的命中判定),不是離散棋盤;手感(蓄力、擺動)留在前端,引擎只收 `{plane, ang, pr}`。

## Licensing
沒有原作、沒有出版社;這是民間流傳的紙筆遊戲,名稱和畫面都是自己的。頁尾不需要致謝原作,只寫「小時候在紙上玩的遊戲」。*Not legal advice.*

## Source material
- 規則筆記:[[bored_games - rulebook]]
- 設計初稿和候選點子:[[childhood game ideas]]
- 手感原型(owner 2026-09-19 試玩通過):紙上空戰 https://claude.ai/artifact/T1BzBXJKrmmY6F7hkSAgSP、車窗跑者 https://claude.ai/artifact/DmLtKwYqCj8vhxq2oWokjT
- 記憶和原型沒講清楚的七點,v1 的裁定都在規則筆記的表裡(出手上限 30 次、殘骸不擋線、命中半徑固定、邊界含邊…)。

## Theme
| slot | now (zh) | now (en) |
|---|---|---|
| 系列名 | 無聊遊戲簿 | Bored Games |
| 第一款 | 紙上空戰 | Paper Dogfight |
| 兩方 | 藍筆 / 黑筆 | Blue pen / Black pen |
| 電腦對手的名字 | 隔壁的阿明(簡單)、班長(普通)、轉學生(厲害) | Ming next door / Class monitor / The new kid |
| 評語 | 老師的紅筆:甲上、甲、乙上 | Teacher's red pen: A+, A, B+ |
| favicon | 鉛筆畫的小飛機 | |

### Look
單一視覺世界,不做深色版:這是一張紙。

| token | 值 | 意思 |
|---|---|---|
| `--desk` | `#e3e7da` | 桌面上的作業簿,頁面底色,帶綠色格線 |
| `--sheet` | `#f8f9f3` | 撕下來的那張紙,遊戲區 |
| `--rule` | `#a9cdb9` | 作業簿的綠色格線 |
| `--pencil` | `#3a3f46` | 鉛筆:介面文字、框線、摺線 |
| `--blue` | `#2340a8` | 藍色原子筆:座位 0(下方,單人時是玩家) |
| `--black` | `#1d1f24` | 黑色原子筆:座位 1 |
| `--red` | `#cf3a35` | 老師的紅筆:只用在擊毀、出界、評語 |

字體:`LXGW WenKai TC`(手寫楷體,Google Fonts),fallback `BiauKai, DFKai-SB, Kaiti TC, serif`;英文同一套字。按鈕是手畫的不規則圓角框,沒有陰影、沒有漸層。輪到的那一方,飛機的線條會「抖」(每秒 7 格的手繪動畫)。

Mockup:見 Pages and UI。

## Rules in scope (v1 = 規則筆記裡的紙上空戰,exactly)
兩人;每邊 3 架;紙 600 × 900;命中半徑 24;距離 100 到 740;長度誤差 ±6%;弧度 ±10%;出界墜毀;每人最多出手 30 次。所有數值表在 [[bored_games - rulebook]]。變體(5 架、掩體、轟炸機)之後用資料加。

v1 也包含「自己畫飛機」:畫的筆畫縮放進固定的框,命中半徑不變,只影響外觀。連線時筆畫跟著 state 走。

## Architecture
- Worker + prefix router(`PREFIX = "/bored_games"`),靜態資產,一個房間一個 DO。`/bored_games/ws` 升級成房間。
- `public/index.html`:封面(目錄)。`public/dogfight/index.html`:紙上空戰,query-string 路由(`?play`、`?pair`、`?room=ABCD`、`?lang=`)。
- `public/shared/dogfight/engine.js`:純函式,瀏覽器和 DO 共用。
  - state:`{seed, rng, turn, shots:[n0,n1], planes:[{id, side, x, y, ang, alive, by, lost, art}], inks:[{side, pts}], over, winner}`
  - action:`{type:'fire', plane, ang, pr}`;引擎用 state 裡的 mulberry32 決定長度誤差和弧度,所以從種子 + 動作可以重播。
  - `legal(state, seat)`:自己每架活著的飛機;`ang` 任意、`pr` 在 [0, 1]。
  - `view(state, seat)`:沒有隱藏資訊,回傳整個 state(仍然經過 `view`,之後加戰爭迷霧變體才有地方放)。
  - `clone` 用 JSON clone。
- `public/shared/dogfight/bots.js`:見 Bots and balance。
- `public/shared/paper.js`:系列共用的手繪畫筆(抖動線、紙、格線、墨跡),canvas。
- `src/room.js`:兩個座位;回合時鐘 30 秒(逾時由 bot 代打一手);斷線 20 秒後 bot 接手,分頁的 token 可以拿回座位;閒置刪除。
- `public/dogfight/app.js`:單人和對坐的 driver、輸入手感(蓄力、擺動、取消)、畫面;不含文案。
- `public/i18n/en.js`、`public/i18n/zh-Hant.js`:所有玩家看得到的字。

## Pages and UI
| Route | View | What is on it |
|---|---|---|
| `/bored_games/` | 封面 | 作業簿封面、目錄(紙上空戰可玩,其他標「還沒寫」)、語言切換 |
| `/bored_games/dogfight/` | 開局 | 跟電腦玩(三個對手)、兩個人對坐、開房間 / 輸入房間碼 |
| `?play` / `?pair` | 畫飛機 | 三個框,自己畫或用預設的 |
| `?room=ABCD` | 等人 | 房間碼、分享連結、等不到人就讓電腦頂上 |
| (in game) | 紙 | 整張紙;輪到誰的提示在那個人那一側(對坐時上方轉 180°) |
| (in game) | 結束 | 誰贏、畫了幾條線、老師的評語、再撕一張 |
| `/bored_games/dogfight/rules` | 規則 | 六句話加一張圖 |

Mockup:https://claude.ai/artifact/(見 Decisions 的連結)。手機優先;owner 的 iPhone Chrome 可見高度約 669,紙 2:3 在 390 寬時是 585 高,上下各留一條給標題和輪次提示。用 `svh`,不用 `vh`。

## Bots and balance
- bot 要推理的事:對每個(自己的飛機 × 對方的飛機)候選,用引擎的誤差分布做 Monte Carlo(每個候選 40 次),估擊毀機率、出界機率,以及出手後自己停的位置被對方下一手打中的機率。另外考慮「不開火、往前挪」的手。分數 = 擊毀 − 出界 − 曝險 × 權重。
- 等級旋鈕:瞄準角度的雜訊(簡單 ±12°、普通 ±6°、厲害 ±2.5°)、Monte Carlo 次數、曝險權重。雜訊模擬的是人在擺動中抓時機的誤差。
- 每個決定帶 `why`(`'close_shot' | 'advance' | 'desperate' …`),給之後的對手碎碎念用。
- Harness:`node tests/sim.js <games> <cell>`,子行程跑 cell、失敗重試。量三件事:先手勝率(目標 50% ± 5%)、每局出手數(目標 8 到 16 手,約 2 到 3 分鐘)、各等級對打的勝率階梯(厲害對簡單 ≥ 75%)。
- 先手勝率超標時的旋鈕,依序:起始距離、命中半徑、後手多一架。

## Team (agent-team-delivery)
Phase 0 proposal; the owner confirms it with the first go.

| Files | Role |
|---|---|
| `public/shared/dogfight/engine.js`, `public/shared/dogfight/bots.js`, `src/`, `tests/sim.js`, `wrangler.jsonc`, `package.json` | BE |
| `public/index.html`, `public/dogfight/*.html`, `public/dogfight/app.js`, `public/shared/paper.js`, `public/style.css` | FE |
| `public/i18n/*`, 規則頁的文字, `README.md` | writer |
| `public/art/`(社群分享圖、favicon)和產生它們的 prompt | artist |
| `tests/`(`sim.js` 除外), `tools/`, `TEAM.md` | orchestrator |

- First guard:group 0 從規則筆記抄常數(紙 600 × 900、每邊 3 架、起始帶 90 到 260、命中半徑 24、距離 100 到 740、出手上限 30)。group 1 檢查產品動詞:`setup(seed)` 擺出 3 + 3 架而且都在自己那一半;兩個座位都有合法的手;對準敵機中心、`pr` 足夠的一手會擊毀它;`pr = 1` 朝紙外的一手會讓自己墜毀。弄紅的方法:`orch falsify` 把引擎的命中半徑改成 0,預期 group 1 的「對準中心會擊毀」那一行變紅。
- Placeholder deploy: yes,`games.csiesheep.com/bored_games/`,`noindex`,一頁作業簿封面寫「還沒寫」。
- Deploy rule: M5 之前頁面是 `noindex`,orchestrator 每次 land 後 `npx wrangler deploy` 並比對 live bytes;M5 起只在 owner 說 go 才 deploy。
- Orchestrator's first goal: M1 紙上空戰引擎。優先序:規則筆記的數值表逐條有測試 → 合法手的 fuzz(隨機種子、隨機手,不當機、state 永遠合法、30 手上限一定結束)→ 重播(種子 + 動作重現同一局)。

## Milestones
- M0 Scaffold and team setup (Phase 0): router, placeholder deployed and verified, `TEAM.md`, a first guard seen red. M1 on are orchestrator issues.
- M1 Engine + tests (incl. a fuzz test over legal moves).
- M2 Bots + harness:先手勝率、出手數、等級階梯三張表。
- M3 Solo + 對坐 UI:把原型的手感搬進來(數值照規則筆記)、畫飛機、封面、i18n、規則頁。在 owner 的 iPhone 上驗。
- M4 Rooms:兩座位 DO、回合時鐘、bot 頂替、重連、再來一張。
- M5 Ship:noindex off、OG、JSON-LD、hub tile、sitemap。
- 之後:車窗跑者作為第二款,從 M1 形狀的 issue 開始(沒有 bot 和房間,會短很多)。

## Open questions (decide before M0)
1. 系列共用一個 repo,還是一款一個? — recommendation: 共用一個(`bored_games`),理由見 Why this shape。
2. 名稱:無聊遊戲簿 / Bored Games、下課十分鐘 / Recess、小時候 / Childhood? — recommendation: 無聊遊戲簿。「無聊時自己發明的遊戲」就是這個系列的篩選線,英文又是 board games 的諧音。
3. v1 要不要連線房間? — recommendation: 要,但排在 M4;M3 做完(電腦 + 對坐)就已經可以玩,M4 不擋上線前的試玩。
4. 「自己畫飛機」放 v1 嗎? — recommendation: 放。成本低,而且是這款最有記憶點的地方;命中半徑固定,不影響平衡。
5. 出界墜毀留不留? — recommendation: 留。它是「想打遠就要賭」的代價;原型預設就是開的。
6. 出手上限 30 次夠不夠? — recommendation: 先 30,M2 的 harness 量到每局出手數的分布後再調。

## Decisions
- **2026-09-19** — 兩款手感原型 owner 試玩通過(車窗跑者:looks good;紙上空戰:可以)。先做紙上空戰。
- **2026-09-19** — 手感數值以原型預設為準,寫進規則筆記當 group 0 的來源。

## Next steps
- [ ] Owner confirms the plan, the open questions and the Phase 0 proposal (first go).
- [ ] 建 repo `csiesheep/bored_games`(名稱確認後),從 `tiandihui` scaffold。
- [ ] Phase 0: placeholder, `TEAM.md`, first guard seen red.
- [ ] Owner's second go: the orchestrator session starts M1.
