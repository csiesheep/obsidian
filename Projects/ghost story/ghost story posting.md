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
| 品牌檔 | `C:\Users\sheep\Pictures\gui_chang_shi\brand\brand.json` |
| 帳簿 | 同資料夾的 `ledger.json` |

| 層 | 在哪 | 負責 |
|---|---|---|
| 產檔 | ghost-story `ghost_plan.py post`、ghost-comic `manga.py export`、`reel`（都已在 main，本機已同步） | 怎麼畫、怎麼切 |
| 長相和字句 | `brand.json` | 顏色、印章、標示、文案範本、「收驚。」 |
| 編號和紀錄 | social-post skill 的 `ledger.py`（本機已裝，還沒合併） | 第 N 首是誰、發到哪、哪天 |

### 0.2 指令

```bash
B="C:/Users/sheep/Pictures/gui_chang_shi/brand/brand.json"
D="C:/Users/sheep/Pictures/gui_chang_shi/stories/<英文短名>"   # 一首故事的資料夾
C="$D/comic"                                                    # manga.py 的工作資料夾
S=~/.claude/skills

# 1. 拿號：同一個標題再要一次會拿回同一號，文字和漫畫共用；--folder 把帳簿對到資料夾
N=$(py -X utf8 $S/social-post/scripts/ledger.py --brand-file "$B" reserve "<標題>" --kind comic --folder stories/<英文短名>)

# 2. 產檔
mkdir -p "$D/posts/threads"
py -X utf8 $S/ghost-story/scripts/ghost_plan.py post "$D/story.md" --mode attach --brand-file "$B" --number $N > "$D/posts/threads/post.txt"
py -X utf8 $S/ghost-comic/scripts/manga.py --work "$C" export --brand-file "$B" --number $N --cover <封面格>
py -X utf8 $S/ghost-comic/scripts/manga.py --work "$C" reel teaser <A1> <A2> <A3> --brand-file "$B" --number $N --name teaser_A
py -X utf8 $S/ghost-comic/scripts/manga.py --work "$C" reel teaser <B1> <B2> <B3> --brand-file "$B" --number $N --name teaser_B

# 2b. manga.py 還是輸出到 comic/out/export/，搬到故事資料夾
rm -rf "$D/posts/ig" && mv "$C/out/export/ig" "$D/posts/ig"
for v in teaser_A teaser_B; do mkdir -p "$D/reels/$v" && mv "$C/out/export/reels/$v"* "$D/reels/$v/"; done

# 3. 每一則發出、打開確認以後
py -X utf8 $S/social-post/scripts/ledger.py --brand-file "$B" posted $N instagram --url <連結>
```

**挑格子**：
- 封面格：不雷，右上角沒有重要的東西，因為直排標題壓在那裡。
- 預告 A、B：各三格，都在揭露之前，開頭不同。
- Threads 配圖：一格不雷的格子，從 `comic/out/panels/` 挑。

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

> [!note] 2026-10-19 擁有者改決定：FB 粉專、YouTube Shorts、TikTok 從現在起一起發，上表三列恢復；IG 帳號中心要開一次「分享到 Facebook」。詳細計畫在 [[ghost story content plan]]。（10-18 原本決定先只發 IG、Threads、Pinterest。）

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
- **圖和附件二選一**：同一則貼了圖就不能加文字附件（2026-10-18 實測）。有漫畫的故事：鉤子加一格圖，結尾「……全篇漫畫在 IG。」，底下自己回一則 IG 連結（第 1 首這樣發）。只有文字的故事：鉤子加附件不配圖，或圖放在串文的下一則。
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
- **AI 標示**：建立釘圖的表單有「Mark as AI-Modified」開關，打開後才能勾「This Pin includes an AI-generated person」；第 1 首兩個都開，釘圖顯示「AI modified」（2026-10-18 實測）。

## 2a. 第 1 首改成現在發（2026-10-18 週日晚上，擁有者決定）

開站不等 10/31。檔案都在 `C:\Users\sheep\Pictures\gui_chang_shi\stories\three_behind\posts\` 底下，帳簿已登記第 1 首。每一則都是：給擁有者看預覽，擁有者說發，Claude 透過 Chrome 發，打開確認，記帳簿。

| 順序 | 平台 | 貼什麼 | 檔案 | 注意 |
|---|---|---|---|---|
| 0 ✅ | IG 自介輪播（第 0 首｜關於鬼唱詩） | 封面（王士禎詩句直排）、為什麼叫鬼唱詩、怎麼做的、規矩、收驚，5 張 3:4 | `C:\Users\sheep\Pictures\gui_chang_shi\about\posts\ig\01.jpg` 到 `05.jpg`、`caption.txt`；產生程式 `C:\Users\sheep\Pictures\gui_chang_shi\about\make_intro.py` | **2026-10-19 已發**（Claude 透過 Chrome）：<https://www.instagram.com/p/DesOn3kEnGD/>，原比例、AI 標籤開、沒分享到 Threads，帳簿已記。網頁版沒有「釘選到個人檔案」，擁有者 2026-10-19 用手機 app 釘選好了 |
| 1 ✅ | IG 輪播 | 封面（p10）、10 頁、結尾卡 | `ig/01.jpg` 到 `12.jpg`、`ig/caption.txt` | **2026-10-18 23:3x 已發**：<https://www.instagram.com/p/Deqmn6Bm5Jy/>，原比例、AI 標籤已開（貼文顯示「AI content」）、沒分享到 FB 或 Threads，帳簿已記 |
| 2 ✅ | Threads | 鉤子加 p8，不放全文 | `threads/01_post_hook.txt`（最後一行改成「……全篇漫畫在 IG。」）、`01_image_p8.jpg` | **2026-10-18 23:37 已發**：<https://www.threads.com/@gui.chang.shi/post/DeqoW1smxte>，主題標籤「鬼故事」；底下自己回一則「漫畫版：」加 IG 連結，串文顯示 1/2、2/2；帳簿已記 |
| 3 ✅ | Pinterest | 封面釘圖，連到 IG 那則 | `pinterest/00_cover.jpg`、`pinterest/pins.txt` | **2026-10-18 已發**：<https://www.pinterest.com/pin/1107463364654400823/>，公開圖板「鬼唱詩｜台灣怪談漫畫」（沒開分區）、標題和說明照 pins.txt、連結 IG 那則、「Mark as AI-Modified」和「AI-generated person」都勾（釘圖顯示「AI modified」），帳簿已記。第 1 到 3 頁之後三天各釘一張 |

- **為什麼先 IG**：Threads 的回覆和 Pinterest 的連結都要指到 IG 那則。
- **Threads 用鉤子版**：工具切出的 500 字是開頭鋪陳（「手機排版，文筆普通請見諒」），第一句沒有異常；鉤子版直接放阿嬤那句話。之後可以給 `ghost_plan.py post` 加一個指定鉤子段落的選項。
- **Threads 圖和文字附件不能同一則**（2026-10-18 實發時發現）：貼了圖，「Attach text」選項就消失。擁有者決定：有漫畫的故事，Threads 只放鉤子加一張圖，把人帶去 IG 看漫畫，不放全文。
- **Pinterest 只釘前 3 頁**：揭露格在第 8 頁、結尾在第 10 頁，單頁釘圖會在動態裡單獨出現，等於爆雷。
- **主頁還是空的**：10/28 到 10/30 那 9 則鋪主頁貼文和 Threads 的「第 0 首」自介都還沒發，第 1 首會是主頁第一則。第 0 首可以在第 1 首之前先發在 Threads 並釘選（文案在 [[ghost story brand]] 2.4）。
- **之後**：明天 12:00 試用 Reel A（`reels/teaser_A_p8.mp4`），擁有者用手機發、在 app 加音樂；10/20 晚上填 48 小時成效。10/31 萬聖節改發第 2 首。

## 2b. 第 2 首〈半夜叫我全名的人〉（計畫，2026-10-20）

建議發文日 **D = 10/21（三）**，今天（10/20）把檔案做齊、擁有者看過。檔案都在 `C:/Users/sheep/Pictures/gui_chang_shi/stories/name_call/`。照 [[ghost story content plan]] 3.1 的時間線：主力是 Reel full（V3 電影感），同一天放 IG、YouTube Shorts、TikTok，FB 從 IG 同步。

### 現在有什麼、缺什麼

| 項目 | 狀態 | 要做的 |
|---|---|---|
| 編號 | 帳簿下一號是 2 | `ledger.py reserve "半夜叫我全名的人" --kind comic --folder stories/name_call` |
| Reel full | V3 電影感 82 秒已打磨完（`reels/full_v3_cinema/`）；V1 漫動畫留著 | 片名卡加「鬼唱詩｜第 2 首」，重出 V3（約 11 分鐘）；選封面 |
| IG 輪播 | 8 張已輸出（封面、6 頁、結尾卡），文案沒有編號 | `manga.py export --number 2` 重出（封面格建議 p11 營地夜景，或 p17 紗網後的眼睛；不能用 p18 黑影和 p33 結尾），搬到 `posts/ig/` |
| Threads | 沒有 | `ghost_plan.py post story.md --mode attach --number 2`；鉤子改寫成第一句就是規矩「山上晚上如果聽到有人叫你全名，不管多像我們的聲音，都不要回。」；三則：鉤子加一格圖（p13 帳篷或 p17 眼睛）→ 全文附件 → IG 連結 |
| 預告 Reel A、B | 沒有 | 選做：`manga.py reel teaser` 兩組三格（A：p12 p13 p14，B：p15 p16 p17），當 IG 試用 Reels |
| Pinterest | 沒有 | 封面加第 1 到 3 頁縮成 1000×1500（揭露在第 4 頁 p18，第 4 頁起不釘），寫 `pins.txt` |
| YouTube、TikTok 文案 | 沒有 | 用 brand.json 的 `reel.cross_lines`：標題「第 2 首｜半夜叫我全名的人」，第二行 IG 連結 |

### 擁有者要先做的（不然那個平台當天發不了）

- [ ] 手機 IG：帳號中心開「分享到 Facebook」（FB 粉專才會自動同步）。
- [ ] Chrome 的 YouTube 切到鬼唱詩頻道（目前是個人頻道）。
- [ ] Chrome 登入鬼唱詩的 TikTok（目前沒登入）。
- [ ] 開聲音看一次 V3，確認配樂和音效。

### 時間線

| 時間 | 平台 | 內容 | 誰 |
|---|---|---|---|
| 10/20 | | 拿號、重出 V3 和輪播、做 Threads 三則和 Pinterest 圖、寫各平台文案，全部傳給擁有者看 | Claude |
| 10/20 晚上 | | 擁有者看預覽，每一則說可以或要改 | 擁有者 |
| 10/21 21:00 | IG | Reel full V3（原創音訊，AI 標籤開）＋漫畫輪播 | Claude（Chrome）；Reel 若網頁版不能選封面就改手機 |
| 10/21 21:00 | YouTube Shorts、TikTok | 同一支 V3 | Claude（Chrome） |
| 10/21 21:00 | FB 粉專 | 自動同步輪播和 Reel；21:15 在底下留言放 IG 連結 | 自動＋Claude（粉專身分） |
| 10/21 21:00 | Pinterest | 封面加第 1 到 3 頁，連到 IG 輪播 | Claude |
| 10/21 21:30 | Threads | 鉤子加一格圖 → 全文附件 → IG 連結 | Claude |
| 10/21 21:00 到 22:30 | IG、Threads | 回留言 | 擁有者（Claude 起草） |
| 10/22、10/23 12:00 | IG 試用 Reels | 預告 A、B（有做的話） | 擁有者手機 |
| 10/23 晚上 | | 48 小時成效：觀看、完播、收藏、分享、新追蹤；V3 的數字和第 1 首輪播比 | Claude |

每一則發出後記帳簿 `ledger.py posted 2 <平台> --url <連結>`，故事資料夾的 README 補連結。

### 發文前檢查

- [ ] 每則有「第 2 首」和 AI 標示，Threads 標題不是 `[經驗]`。
- [ ] 封面、Threads 配圖、Pinterest 都沒有用到揭露格（p18 黑影、p33 結尾）。
- [ ] V3 的字都在安全區、品管通過（已過）。
- [ ] 連結：Threads 第 3 則、YouTube 說明、FB 留言、Pinterest 都指到 IG 那則輪播或 Reel。

## 2. 第一首原本的時程（10/31 開站版，已改成 2a）

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
6. **還沒驗證**：social-post 的發文頁面步驟，IG 輪播、Threads、Pinterest 已在 2026-10-18 實發並寫回它的 `references/platforms.md`；YouTube、TikTok 還沒發過。IG 跨帳號分享到粉專要先在帳號中心開一次。

## 7. 待擁有者決定

- [ ] 誰按發送（第 4 節）。
- [x] Threads 先試哪種：第 1 首用鉤子加一張圖、帶去 IG，不放全文（圖和附件不能同一則）。只有文字的故事還沒試附件或串文。
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

- 2026-10-18：第 1 首 Pinterest 封面釘圖發出，建了公開圖板「鬼唱詩｜台灣怪談漫畫」。三個平台都發完。
- 2026-10-18：第 1 首發出 IG 輪播和 Threads（鉤子加 p8，回覆 IG 連結）。Threads 一則不能同時有圖和文字附件，有漫畫的故事 Threads 改成只放鉤子帶去 IG。
- 2026-10-18：擁有者決定先只發 IG、Threads、Pinterest；FB、YouTube、TikTok 暫停。
- 2026-10-18：加第 0 節標準流程：給定任一首故事和漫畫的指令、D 到 D+5 的時程範本（含 FB、YouTube Shorts、TikTok 交叉發）、每則的順序。工具清單更新為合併後的狀態。

- 2026-10-18：第一版。
