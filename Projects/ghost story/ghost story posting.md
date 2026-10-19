---
title: 鬼唱詩｜發文流程（Threads、IG、Pinterest）
tags:
  - project
  - social
  - ghost-story
  - posting
status: plan-waiting-for-owner-decisions
created: 2026-10-18
updated: 2026-10-18
---

# 鬼唱詩｜發文流程

> [!info] 一句話
> 給定一首故事和它的漫畫，照第 0 節的流程做：拿號、產檔、檢查、給擁有者看、擁有者說發才發、記帳簿。主力是 Threads 文字和 IG 漫畫輪播加 Reel；FB 粉專、YouTube Shorts、TikTok 用同一批檔案交叉發，每個多花約 2 分鐘；Pinterest 放漫畫頁。第一首是〈阿嬤說我後面跟了三個人〉，10/31 開站。帳號和簡介在 [[ghost story brand]]，頻率和成長目標在 [[ghost story growth]]。

## 0. 標準流程：給定一首故事和它的漫畫（2026-10-18）

### 0.1 輸入和三層

| 東西 | 位置 |
|---|---|
| 故事全文 | `<漫畫資料夾>/story.md`，或 ghost-story 寫出來的檔案 |
| 漫畫 | `<漫畫資料夾>/`：`board.json`、`choices.json`、`out/pages/` |
| 品牌檔 | `C:\Users\sheep\Pictures\ghost_comic\brand\brand.json` |
| 帳簿 | 同資料夾的 `ledger.json` |

| 層 | 在哪 | 負責 |
|---|---|---|
| 產檔 | ghost-story `ghost_plan.py post`、ghost-comic `manga.py export`、`reel`（都已在 main，本機已同步） | 怎麼畫、怎麼切 |
| 長相和字句 | `brand.json` | 顏色、印章、標示、文案範本、「收驚。」 |
| 編號和紀錄 | social-post skill 的 `ledger.py`（本機已裝，還沒合併） | 第 N 首是誰、發到哪、哪天 |

### 0.2 指令

```bash
B="C:/Users/sheep/Pictures/ghost_comic/brand/brand.json"
C="C:/Users/sheep/Pictures/ghost_comic/<漫畫資料夾>"
S=~/.claude/skills

# 1. 拿號：同一個標題再要一次會拿回同一號，文字和漫畫共用
N=$(py -X utf8 $S/social-post/scripts/ledger.py --brand-file "$B" reserve "<標題>" --kind comic)

# 2. 產檔
py -X utf8 $S/ghost-story/scripts/ghost_plan.py post "$C/story.md" --mode attach --brand-file "$B" --number $N > "$C/out/export/threads.txt"
py -X utf8 $S/ghost-comic/scripts/manga.py --work "$C" export --brand-file "$B" --number $N --cover <封面格>
py -X utf8 $S/ghost-comic/scripts/manga.py --work "$C" reel teaser <A1> <A2> <A3> --brand-file "$B" --number $N --name teaser_A
py -X utf8 $S/ghost-comic/scripts/manga.py --work "$C" reel teaser <B1> <B2> <B3> --brand-file "$B" --number $N --name teaser_B

# 3. 每一則發出、打開確認以後
py -X utf8 $S/social-post/scripts/ledger.py --brand-file "$B" posted $N instagram --url <連結>
```

**挑格子**：
- 封面格：不雷，右上角沒有重要的東西，因為直排標題壓在那裡。
- 預告 A、B：各三格，都在揭露之前，開頭不同。
- Threads 配圖：一格不雷的格子，從 `out/panels/` 挑。

### 0.3 一首的時程範本（D 是發文日）

| 時間 | 平台 | 貼什麼 | 檔案 | 誰發 |
|---|---|---|---|---|
| D 21:00 | IG 輪播 | 封面、全部頁、結尾卡 | `out/export/ig/` 和 `caption.txt` | Claude 透過 Chrome，或擁有者 |
| D 21:00 | FB 粉專 | 同一則輪播 | IG 發文時自動分享到粉專（帳號中心的「跨帳號分享」，要先開一次） | 自動 |
| D 21:30、23:00 | Threads | 上半首、下半首，或 23:00 一次發完；配一格 | `threads.txt` 加一張格子圖 | Claude 透過 Chrome |
| D+1 12:00 | IG 試用 Reel | 預告 A，只給非追蹤者看 | `out/export/reels/teaser_A.mp4` 和它的 caption | 擁有者用手機，在 app 裡加音樂 |
| D+1 21:00 | IG Reel，同步到 FB | 預告 B | `teaser_B.mp4` | 擁有者用手機 |
| D+2 | YouTube Shorts | 預告 B，標題「第 N 首｜標題」，說明照品牌 | `teaser_B.mp4`；9:16、3 分鐘內會自動當成 Short | Claude 透過 Chrome，或擁有者 |
| D+2 | TikTok | 預告 A 或 B | 同上；音樂在 app 裡加 | 擁有者用手機 |
| D+1 起 5 天 | Pinterest | D+1 封面釘圖，之後每天 2 頁，連到 IG 那則 | 1000×1500 釘圖（工具待補，第 6 節） | Claude 透過 Chrome |
| D+2 21:00 | 成效 | 48 小時的數字 | [[ghost story social]] 的成效表 | 擁有者和 Claude |

> [!note] 2026-10-18 擁有者決定：先只發 IG、Threads、Pinterest。上表 FB 粉專、YouTube Shorts、TikTok 三列暫停，之後再說；IG 發文時也先不要開「分享到 Facebook」。

FB、YouTube、TikTok 是交叉發，不承諾回留言，時間先留給 IG 和 Threads（[[ghost story growth]] 第 10 節）。之後要開的話，YouTube 的訂閱越早累積，拿分潤時越有底子。

### 0.4 每一則的順序

1. 自己先看：IG 的第 1 張、Reel 的 `_frames.jpg`、`threads.txt` 每則的字數。
2. 跑第 3 節的檢查清單。
3. 預覽給擁有者：圖和影片用檔案傳，文案貼原文。
4. 擁有者說「發」才發，一次同意只算一則。
5. 發完打開那則確認，複製連結，`ledger.py posted` 記下來。
6. 第一個小時擁有者回留言；48 小時後填成效表。

## 1. 一首的流水線

| 平台 | 貼什麼 | 怎麼產出 | 現況 |
|---|---|---|---|
| Threads | 文字故事：500 字鉤子加全文附件，配一張圖 | `ghost_plan.py post story.md --mode attach` | 工具有了；缺「第 N 首」開頭和「收驚。」結尾（第 6 節） |
| IG 輪播 | 封面、10 頁漫畫、結尾卡，3:4 | `manga.py export --cover <格> --handle @gui.chang.shi` | 工具有了；〈阿嬤〉已有一份舊輸出，要用新 handle 重跑 |
| IG Reel | 三格預告 15 秒，每本做 2 到 3 支不同開頭 | `manga.py reel teaser <三格> --handle @gui.chang.shi --logo <圓形頭像>` | 工具在 PR [csiesheep/skills#12](https://github.com/csiesheep/skills/pull/12)，還沒合併，先從 worktree 跑 |
| Pinterest | 封面釘圖加每一頁，2:3 | 還沒有工具（第 6 節） | 要補 `manga.py export --pinterest` |

### Threads

- **格式**：一則 500 字以內的鉤子，停在第一個毛的地方，結尾「……（全文在附件）」，全文放文字附件（10,000 字以內，不是每個帳號都有）。附件不能用時改 `--mode chain` 拆串文。
- **品牌格式**：第一行「第 N 首｜標題」，第二行 AI 標示，最後一行「收驚。」。標題一律 `[創作]` 意思，絕不用 `[經驗]`；`ghost_plan.py post` 會自動把 `[經驗]` 換掉。
- **配圖**：有漫畫的用一格不雷的格子；只有文字的用一張單格插圖。有圖的貼文觸及較高（[[ghost story growth]] 第 3 節）。
- **主題標籤**：一則只能一個，固定「鬼故事」。
- **時間**：照成長策略，前兩週測「21:30 上半首、23:00 下半首」和「23:00 一次發完」。〈阿嬤〉全文約 3,000 字，一則只能 500 字，所以上下半首是兩則各帶一份附件；附件不能用就整首改串文。
- **導流**：同一首有漫畫時，最後一行前加「漫畫版在 IG」。

### IG

- **輪播**：最多 20 張，3:4（1080×1440）。第 1 張封面用不雷的格子加直排標題；最後一張結尾卡有 AI 標示和帳號。
- **文案**：export 產生的 `caption.txt` 要改成品牌格式：

```
第 N 首｜阿嬤說我後面跟了三個人

AI 輔助創作｜故事純屬虛構
漫畫由右往左、由上往下讀。
傳給那個說自己不怕的朋友。

#鬼唱詩 #台灣怪談 #鬼故事 #漫畫 #靈異 #創作
```

- **Reel**：輪播發出的隔天發一支一般 Reel，另 1 到 2 支用「試用 Reels」只給非追蹤者看。預告只放鋪陳，絕不放揭露那格。
- **音樂**：Reel 是靜音輸出。IG 網頁版上傳找不到加音樂的地方（沒查證到），所以 Reel 用手機 app 發，在 app 裡挑熱門音訊。
- **AI 標示**：發文進階設定若有「AI 資訊／AI 標籤」就開；文案第二行照樣寫明。

### Pinterest

- **尺寸**：2:3（1000×1500）。漫畫頁是 1200×1700，放進 2:3 上下會留一點白，不裁畫面。
- **一本漫畫的釘圖**：一張封面釘圖（標題加一格），加 10 張單頁釘圖，標題寫第幾頁，例如「台灣怪談漫畫｜第 1 首 阿嬤說我後面跟了三個人（1/10）」。單頁分 5 天、每天 2 張釘，不要一次 11 張。多圖輪播釘圖最多 5 張，網路上的規格多半在講廣告，官方沒查到一般釘圖能不能用，先不用。
- **圖板**：一個「鬼唱詩｜台灣怪談漫畫」圖板，每本漫畫一個分區。
- **標題和說明**：標題 100 字內，前 40 字最重要，放「台灣怪談、鬼故事漫畫、恐怖漫畫」這類搜尋字。說明寫 AI 標示和一句劇情鉤子。
- **連結**：還沒有網站，先連到 IG 那則輪播。網站做好後改連網站。
- **AI 標示**：Pinterest 會自己偵測並標「AI modified」；建立釘圖時若有自己標示的選項就勾。

## 2. 第一首的時程（〈阿嬤說我後面跟了三個人〉）

開站前的 9 則鋪主頁貼文另見 [[ghost story brand]] 第 3 節，這裡只排第一首。

| 時間 | 平台 | 貼什麼 |
|---|---|---|
| 10/31（六）21:00 | IG | 輪播：封面、10 頁、結尾卡 |
| 10/31 21:30 | Threads | 第 1 首上半：500 字鉤子，文字附件放前半全文，停在「妹妹，妳後面那三個是妳同事喔？」，配 p8 |
| 10/31 23:00 | Threads | 同一串回覆：下半首的鉤子加附件放後半全文，最後「漫畫版在 IG」、「收驚。」 |
| 11/1（日）12:00 | IG | 試用 Reel A：p8、p9、p10（已做好的測試片可直接用） |
| 11/1 21:00 | IG | 一般 Reel B：另外三格開頭，例如 p26、p27、p28 |
| 11/1 起 5 天 | Pinterest | 11/1 封面釘圖；11/2 到 11/6 每天 2 頁 |
| 11/2（一）21:00 | 成效記錄 | 輪播和 Threads 發出滿 48 小時，填 [[ghost story social]] 的成效表 |

每則發出後的第一個小時，擁有者在線回留言（[[ghost story growth]] 第 3 節）。

## 3. 每則發送前的檢查

- [ ] 第一行是「第 N 首」，有「AI 輔助創作，純屬虛構」，沒有 `[經驗]`。
- [ ] 沒有點名真實的醫院、廟、店家；只到縣市和「某區域醫院」。〈阿嬤〉寫的是「台南一間區域醫院」，可以。
- [ ] 圖沒有露出揭露那格（封面、預告、配圖都一樣）。
- [ ] 字數在上限內：Threads 500、IG 文案 2,200、Pinterest 標題 100。
- [ ] IG、Pinterest 的 AI 標示選項有開。
- [ ] 連結對：Threads 結尾指 IG，Pinterest 連到 IG 那則。
- [ ] 發完重新整理公開頁看一次，再填成效表的日期和連結。

## 4. 誰按發送（待擁有者決定）

| 方式 | 適合 | 代價 |
|---|---|---|
| **A. 擁有者自己發**：Claude 準備好檔案和文案，傳到手機 | Reel（要在 app 加音樂）、任何想親手發的 | 每則約 2 分鐘 |
| **B. Claude 透過 Chrome 發**：每一則先把預覽給擁有者看，擁有者說「發」才按 | Threads、IG 輪播、Pinterest、YouTube Shorts | 每則都要擁有者回一句；`social-post` skill 已寫好（本機），發文頁面的步驟要第一次發完再寫實 |
| **C. 先排程**：Meta Business Suite 能排 IG 和 FB，據第三方說法也能排 Threads（沒查證） | 固定時間的貼文 | 要先在 Business Suite 綁好帳號；Pinterest 要另外排 |

建議：Reel 用 A；Threads、IG 輪播、Pinterest 第一次用 B，確認流程後再決定要不要寫成 skill 或改排程。發文是對外公開的動作，不管哪種方式，每一則都要擁有者說可以。

## 5. 發完以後

- 第一個小時回留言；別人轉發或問「真的假的」時，照 brand 筆記的固定回法。
- 爆款規則照 [[ghost story growth]] 第 5 節：2 小時內觀看超過中位數 3 倍，就釘選、補「後來」、24 小時內發續集。
- 48 小時後填成效表：收藏、分享、留言、新追蹤，Pinterest 加「儲存」和「點擊」。

## 6. 開站前要補的工具（小改）

1. ~~`ghost_plan.py post` 加 `--number N`~~：2026-10-18 做好並合併（PR #14），`--brand-file brand.json --number N` 自動加「第 N 首｜」和「收驚。」。
2. ~~`manga.py export` 的文案改成品牌格式~~：2026-10-18 做好並合併（PR #14）。四本已重出到各自的 `out/export/ig/`；試用 Reel A（第 1 首，p8、p9、p10）在 `three_behind/out/export/reels/teaser_A_p8.mp4`。
3. **還沒有**：`manga.py export --pinterest`，輸出 1000×1500 的封面和單頁釘圖，加一份標題和說明的文字檔。沒有它，Pinterest 那一列只能手動縮圖。
4. **還沒有**：`ghost_plan.py post --mode halves`，把故事切成上半首和下半首，各自是一則鉤子加附件，斷在最毛的那一句。沒有它，上下半首只能手動切，或改成一次發完。
5. ~~合併 PR #12~~：2026-10-18 合併，本機已同步。
6. **還沒驗證**：social-post 的發文頁面步驟（Threads、IG、Pinterest、YouTube、TikTok 都沒實際發過），第一次發完要把實際流程寫回它的 `references/platforms.md`；IG 跨帳號分享到粉專要先在帳號中心開一次。

## 7. 待擁有者決定

- [ ] 誰按發送（第 4 節）。
- [ ] Threads 先試哪種：上下半首、附件、串文。
- [ ] Pinterest 單頁要不要全部釘，還是只釘封面和前 3 頁留懸念。
- [ ] 第 6 節還沒有的兩個工具（Pinterest 釘圖、上下半首），要不要開站前做完。
- [x] FB 粉專、YouTube Shorts、TikTok：擁有者 2026-10-18 決定**先不發**，先只發 IG、Threads、Pinterest，之後再說。第 0.3 節那三列暫停。

## 來源（2026-10-18 查）

- Pinterest 2:3、標題 100 字、輪播 2 到 5 張：[Featurebase](https://dopost.featurebase.app/help/articles/1823037-pinterest)、[Pinterest 說明](https://help.pinterest.com/en/articles/promote-app-install-pins)、[Strike Social](https://strikesocial.com/blog/pinterest-ad-specs/)
- Pinterest AI modified 標籤：[smallbiztrends](https://smallbiztrends.com/pinterest-gen-ai-content-labels/)、[Nightjar](https://nightjar.so/help-desk/does-pinterest-allow-ai-generated-product-pins)
- IG 網頁版上傳 Reels、音樂在手機編輯器：[ShortSync](https://shortsync.app/resources/instagram-reels-upload-guide)
- Threads 排程說法不一：[Nuelink](https://help.nuelink.com/article/234-best-threads-scheduling-tools)、[ShortSync](https://shortsync.app/guides/schedule-threads-posts)
- YouTube Shorts 3 分鐘、9:16 自動判定：[ShortSync](https://shortsync.app/resources/youtube-shorts-upload-requirements-2026)、[1of10](https://1of10.com/blog/how-to-make-youtube-shorts/)
- IG 跨帳號分享到 FB 粉專、Reels 需連粉專：[HubSpot](https://blog.hubspot.com/marketing/instagram-to-facebook-company-page)、[socialk.it](https://socialk.it/en/cross-post/instagram-to-facebook)

## 歷程

- 2026-10-18：擁有者決定先只發 IG、Threads、Pinterest；FB、YouTube、TikTok 暫停。
- 2026-10-18：加第 0 節標準流程：給定任一首故事和漫畫的指令、D 到 D+5 的時程範本（含 FB、YouTube Shorts、TikTok 交叉發）、每則的順序。工具清單更新為合併後的狀態。

- 2026-10-18：第一版。
