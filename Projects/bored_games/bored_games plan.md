# 無聊遊戲簿 / Bored Games — plan

Created 2026-09-19. Repo `csiesheep/bored_games`, live at
`https://games.csiesheep.com/bored_games/` (placeholder, `noindex`).

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

Mockup(八個手機畫面,中英可切換):https://claude.ai/artifact/XB9W22TKt8nBDk2rUbhqcK。手機優先;owner 的 iPhone Chrome 可見高度約 669,紙 2:3 在 390 寬時是 585 高,上下各留一條給標題和輪次提示。用 `svh`,不用 `vh`。

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
- **2026-09-19** — owner 第一次 go:六個 open question 全照推薦(系列共用一個 repo、名稱「無聊遊戲簿 / Bored Games」、房間排 M4、自己畫飛機進 v1、出界墜毀保留、出手上限 30),Team 一節的所有權表和 deploy 規則照提案確認。
- **2026-09-19** — Phase 0 完成。repo `csiesheep/bored_games` @ `b90d4fa`;placeholder 已部署,線上 4 個檔案 sha1 和 repo 相同。驗收 27 通過 / 0 失敗 / 3 尚未實作。弄紅兩次(一次一個缺陷):命中半徑改 0 → 「RULES.HIT 期望 24 實際 0」「0 / 50 個種子擊毀」「over=false winner=null」三列紅;拿掉「不打自己人」→ 「alive=false by=0」一列紅;還原後回 27 / 0 / 3。
- **2026-09-19** — Phase 0 的 `engine.js` 切片(開局、合法手、出一手)是起手的 session 寫的,沒有獨立驗證;`TEAM.md` 有寫。
- **2026-09-19** — M1 第一張 issue(csiesheep/bored_games#1)走完派 → 交付 → 驗 → land。驗收先寫先 land(`4c05bdf`,對 Phase 0 引擎 44 通過 / 0 失敗 / 10 尚未實作):規則筆記每張數值表逐列、出手上限、view、replay、fuzz(120 局,每一手用 SPEC 重算的神諭對照)。BE(`peer-be`)交 `5b2f198`,只動 `engine.js`:出手上限(兩個人都出滿 30 才結束;結束順序 打光對方 → 自己沒飛機 → 上限比數量;平手 = `over` 而且 `winner === null`)、`onPaper`、`view`、`replay(seed, actions)`。main @ `e3085f6`,54 / 0 / 0,已部署,線上 4 個檔案 sha1 相同。
- **2026-09-19** — #1 的弄紅紀錄(一次一個缺陷,下在產品)。land 驗收前對 Phase 0 引擎 13 個:12 個紅在該紅的列;「紙邊不含邊」是綠的(剛好落在紙邊的線尾用 apply 造不出來),所以契約要求匯出 `onPaper`。交付後 11 個:上限只看出手的人 →「59 手之後 over=true turn=0 shots=[30,29]」;上限排在打光對方前面 → 只有 0 對 0 那一列紅「over=true winner=0」;`onPaper` 不含邊 →「紙上 2 / 7」;引擎亂數改 Math.random → 5 列紅。改過的那一列(replay 拒絕不合法的手)在 `e3085f6` 上重新弄紅。完整的表在 #1 的留言。
- **2026-09-19** — Phase 0 的引擎切片:13 個注入和 fuzz 都沒有找到缺陷。它現在被驗收獨立看過了,但還沒在 Worker / DO 裡跑過(M4)。
- **2026-09-19** — orchestrator 裁決(#1):平手的表示法是 `over === true` 而且 `winner === null`,不加新欄位。
- **2026-09-19** — 待 owner 裁決(csiesheep/bored_games#2):`view` 要不要藏 `seed` / `rng`。這份計畫的 Architecture 寫「回傳整個 state」,但 `rng` 決定下一手的誤差和弧度:客戶端可以算出必中的手,bot 的 Monte Carlo 會變成偷看答案。M2 開工前要定。
- **2026-09-19** — M2(csiesheep/bored_games#3)走完派 → 交付 → 驗 → land。驗收先寫先 land(`7069370`):bot 只拿得到拿掉 `seed` / `rng` 的 view,所以 #2 怎麼裁決都成立。BE 交 `94f7436`:`bots.js`(三個等級;Monte Carlo 用 bot 自己的亂數配 `trace()`,不 `apply`)和 `tests/sim.js`。main @ `b6723cf`,61 / 0 / 0,已部署,線上 5 個檔案 sha1 相同。9 個注入各紅在該紅的列(混進 `view.rng` → 只有「不偷看」紅,三種 view 三個角度)。
- **2026-09-19** — M2 量到的三張表(每格 600 局,`sim.js` 和 orchestrator 自己的探針兩支儀器一致):階梯 hard 對 easy 80.3% / 78.8%(目標 ≥ 75%,達標);**座位 0 勝率 easy / normal / hard = 37.5 / 29.0 / 23.8%(目標 50 ± 5,沒到,而且是後手優勢,跟未知數 #5 假設的方向相反)**;**每局出手數 p50 = 6(目標 8 到 16,沒到)**;耗到上限 0 局。`choose` hard 平均 1.2 ms(桌機)。
- **2026-09-19** — 旋鈕探針(只在探針行程裡改 `RULES`,repo 沒動;hard 同級 600 局):起始帶是唯一有力的旋鈕——40–120 → 14.5%、現在 90–260 → 26.8%、180–350 → 43.8%、200–380 → 55.7%;命中半徑、誤差、弧度幾乎沒用;縮短最遠距離更糟。沒有旋鈕把出手數拉過平均 7.5。待 owner 裁決:csiesheep/bored_games#4。
- **2026-09-19** — M3 第一輪(csiesheep/bored_games#5 writer、#6 FE,平行派、檔案不重疊)走完。驗收先 land(`7d37e85`):輸入手感的常數和純函式逐條(數字抄自規則筆記)、en / zh-Hant 的 key 和洞一致、前端不可寫死中文、i18n 真的有用到;i18n 的 53 個 key 是 orchestrator 定的命名空間。#5 退回一次(兩個英文字串)→ `3d594c3`;#6 退回一次(英文封面斷行)→ main @ `66361d4`,68 / 0 / 0,已部署,線上 13 個檔案 sha1 相同,線上實際開過遊戲頁。
- **2026-09-19** — #6 的驗證:390 × 669 打完一局(真實時間間隔的 pointer 事件),`replay(seed, actions)` 和畫面的 state 相同;把引擎的命中判斷改成 `if (false)`,3 條線穿過敵機、畫面不擊毀 → 前端沒有自己算規則;對坐時座位 1 的提示在上方轉 180°。前端多了 `window.__dogfight.record()` 給驗證用。儀器限制:瀏覽器 pane 隱藏時 rAF 幾乎停住,畫格用 MessageChannel 幫浦推;動畫節奏沒在正常速度下看過。
- **2026-09-19** — orchestrator 裁決(都可以被 owner 推翻):評語門檻 = 贏家剩 3 / 2 / 1 架 → 甲上 / 甲 / 乙上,單人輸了或平手不給(#6);`public/shared/i18n.js` 歸 FE(`TEAM.md`);`msg.cap` 英文上限放寬到 28 字元(#5)。
- **2026-09-19** — owner 裁決(csiesheep/bored_games#7),原話:「move the language switch to the top right corner」。orchestrator 的解讀:封面頁、整個頁面的右上角、卡片外面;其他頁面不動。land `2797788`,已部署。
- **2026-09-19** — M3 第二輪「自己畫飛機」走完:#8 BE(`art` 欄位,`setup(seed, {art})` 嚴格驗證、不影響任何規則;上限 16 條 / 400 點,orchestrator 裁決,已寫進規則筆記)land `bbd2c89`;#9 FE(三個畫框、`toArt`、對坐時黑筆那一頁轉 180°、畫存在 `localStorage`)land `5c14c60`。main @ `5c14c60`,76 / 0 / 0,已部署,線上 14 個檔案 sha1 相同。M3 的範圍到這裡做完,剩 owner 的 iPhone 驗收。
- **2026-09-19** — 這一輪儀器騙過我一次:隱藏的瀏覽器 pane 不送 `resize` 事件(也不送 `ResizeObserver` 通知),我把「canvas 沒跟著縮」當成產品缺陷退回 #9;FE 量到「`resize` 0 次」才找到根因。修法改成不靠事件(CSS 填滿),所以結果仍然是改善,但那次退回的理由有一半是儀器。
- **2026-09-19** — owner 裁決(csiesheep/bored_games#2):選「藏 (Recommended)」→ `view` 永遠拿掉 `seed` 和 `rng`。owner 裁決(#4),原話:「randomly who is the first.」→ 誰先手由種子隨機決定,數值不動(orchestrator 的解讀,記在 #4)。兩件併成 #10(BE)+ #11(writer 改規則頁第一句),main @ `1c4f3db`,82 / 0 / 0,已部署,線上 14 個檔案 sha1 相同。Architecture 一節寫的「`view` 回傳整個 state」已經不成立:以這一條為準。
- **2026-09-19** — #10 之後的三張表(每格 600 局,`sim.js` / orchestrator 的探針):座位 0 勝率 easy 52.0 / 51.7%、normal 49.2 / 49.7%、hard 49.0 / 46.3%(目標 50 ± 5,到了);先出手的一方仍然只贏 34 / 29.5 / 25.7%(後手優勢還在,只是擲硬幣決定落在誰身上);每局出手數 p50 仍是 6(目標 8 到 16,沒到,owner 還沒裁決,#4 留著開)。
- **2026-09-19** — 這一輪驗收的洞:注入「硬幣 = `seed & 1`」時 81 列全綠,因為我抽的 400 個種子奇偶交替。補了一列(偶數 / 奇數 / 1024 的倍數 / 連續,四族各要 40–60%),同一個注入現在紅。教訓:取樣的種子自己有樣式時,跟樣式同相的缺陷是隱形的。另外 `tests/sim.js` 的彙總沒有任何驗收在看(BE 自己指出),目前靠 orchestrator 的獨立探針當第二支儀器;M4 之前決定要不要給它一列。

## Next steps
- [x] Owner confirms the plan, the open questions and the Phase 0 proposal (first go). 2026-09-19
- [x] 建 repo `csiesheep/bored_games`,從 `tiandihui` scaffold。2026-09-19
- [x] Phase 0: placeholder, `TEAM.md`, first guard seen red. 2026-09-19
- [x] Owner's second go: the orchestrator session starts M1. 2026-09-19(task chip「Run the bored_games orchestrator」,cwd 在 repo;目標 M1 引擎,優先序:數值表逐條有測試 → fuzz → 重播)
- [x] Orchestrator:第一張 issue 走完派 → 交付 → 驗 → land,回報 owner。2026-09-19(#1,main @ `e3085f6`)
- [ ] Owner:在 csiesheep/bored_games#2 回 `view` 要不要藏 `seed` / `rng`(M2 開工前)。
- [x] Orchestrator:M2 bots + harness。2026-09-19(#3,main @ `b6723cf`)
- [ ] Owner:在 csiesheep/bored_games#4 回先手勝率和每局出手數怎麼處理(起始帶、5 架、或等 M3 的手感)。
- [x] Orchestrator:M3 第一輪:封面、開局、單人、對坐、結束、規則頁、i18n。2026-09-19(#5、#6,main @ `66361d4`)
- [ ] Owner:在 iPhone 上玩 https://games.csiesheep.com/bored_games/(真的手指、可見高度、動畫節奏),回報手感。
- [x] Orchestrator:M3 第二輪:自己畫飛機。2026-09-19(#8、#9,main @ `5c14c60`);封面語言切換移到右上角(#7)。
- [x] Owner 裁決 #2(藏)和 #4(先手隨機)→ #10、#11,2026-09-19,main @ `1c4f3db`。
- [ ] Orchestrator:M4 Rooms(兩座位 DO、回合時鐘 30 秒、bot 頂替、斷線重連、再來一張)。房間只送 `view`;收畫(`art`)的那一層要先擋訊息大小、自己驗 `opts` 的形狀(#8 的留言);開新的 orchestrator session。
- [ ] Owner:#4 剩下的一件——每局只有 6 手要不要處理(每邊 5 架、或改目標),iPhone 玩過再說。
