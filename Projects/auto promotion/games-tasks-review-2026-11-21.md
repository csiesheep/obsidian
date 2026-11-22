# 小羊遊戲間排程檢討與重排提案（2026-11-21）

owner 2026-11-21：「check the performance of each scheduled task of csiesheep.games. i would like to reduce some and add more for game crawling and game owner reply on threads.」

**這份只是分析和提案。沒有改任何排程、任何任務讀的檔，沒有發文，沒有動 Chrome。** 要套用要 owner 說「go」（app 不接受無人值守的排程修改），確切變更清單在第 8 節。

---

## 0. 三個最大的發現

1. **「回覆別人的貼文」是花最多、換到最少的一塊。** 10 個回覆任務（找文 3 ＋ 發文 5 ＋ hub-1530 ＋ night-2200）合計約 6.5M token／天（占小羊遊戲間任務約 34%），11/14 改用 @csiesheep 後每天發 15 則上下，Threads 進遊戲的訪客卻從 **18／天掉到 4／天**（每則回覆帶來的訪客 0.74 → 0.26）；回覆 160 則（11/8–11/14）帶來 **0 個追蹤**、18 個讚；11/13 之後連 24 小時成績都沒人再填。再加上這是 owner 本人的帳號，量大就是風險（上週 csiesheep.games 的 Threads 就是在一天 20–36 則之後被停用）。
2. **自己發的貼文，只有 Reel 有人看；輪播、圖文、分享卡、熱門遊戲介紹幾乎沒人看。** 11/7–11/18 的 311 篇：FB 生在中國 Reel 平均 172 次瀏覽、hub 今日挑戰 Reel 109、新收錄 Reel 61；但同一批的 FB 輪播／圖文平均 **0.6–2.5 次**、IG 輪播 1–4 次、分享卡 1.7 次。熱門遊戲介紹（每天 2 次，每次約 1.1M token）一次三個平台加起來約 11 次瀏覽。另外 IG csiesheep.games 11/18 起停權（申訴中），IG 的每一步現在都是白跑。
3. **hub-threads-scout 是唯一有實際產出又便宜的：14 天找到 64 款候選、owner 批准約 53 款上架（hub issue #83–#138），每次約 1.2M token；而且「作者收錄通知」是整個推廣裡唯一得到明確正面回應的做法（試辦 5 則，4 位作者回「多謝／感謝收錄」，0 人要求取消）。** 現在它每天平均只找到 5 款（上限 10 款沒有碰到），限制是找得不夠廣、一次搜尋時間不夠，不是上限；通知也還塞在凌晨 02:30 的同一個任務裡。

**提案一句話：停 11 個任務（約 8.2M／天）、再瘦 5 個（約 4.3M／天），加 2 個新任務（約 2.1M／天）——淨省約 10M／天，約占目前排程總用量的 24%；Threads 回覆從約 15 則降到 5 則，把名額換成 5 則作者通知＋2 則作者回覆。**

---

## 1. 資料來源和限制（先講清楚）

| 項目 | 來源 | 限制 |
|---|---|---|
| 跑了幾次、成功／失敗 | `list_task_runs`（每任務最多 50 筆，games-stats-hourly 與 promo-producer 只看得到最近 50 次）、進度紀錄 11/7–11/21 | 「succeeded」包含時段外略過、部分完成 |
| **token** | `get_usage` 只給方案層級（Ultra，每週 15%，本週 11/27 重置；額外用量 40.12／40 USD 已滿），**沒有分任務數字**。所以我改用本機對話紀錄 `~/.claude/projects/C--Users-sheep-code-china-life/*.jsonl` 把每個排程 session 的 usage 加總（**只有 11/10–11/21，12 天**；更早的已被清掉） | 表中的「M」＝百萬「等效輸入 token」＝ 未快取輸入 ＋ 0.1×快取讀取 ＋ 1.25×快取寫入 ＋ 5×輸出（照價格比例）。是估計，不是帳單。不含：不在這個資料夾跑的 session（ghost-reply-post-2200／2236／2309、hub-review-recs 找不到）、子 agent 若不在同一個檔案 |
| 回覆的 24 小時讚／回覆 | engagement 日檔、週報 | **11/13 起沒有人再填**（@csiesheep 的回覆沒人讀 24 小時數字） |
| 帶來的訪客／玩家 | 日報「從哪裡來」（Threads／IG／FB 內建瀏覽器的 china_life＋covervote 訪客）、社群 csv | 只有兩款遊戲，**看不到 games.csiesheep.com 首頁**（hub）；約 90% 訪客是「一般瀏覽器」來源不明；Cloudflare 有取樣；不分是哪個帳號的連結帶來的 → 全部只能說「同時發生」，不是歸因 |
| 追蹤 | social.csv | 11/13 起 social-stats-daily 還在讀已停用的 csiesheep.games Threads，**@csiesheep 的追蹤數沒有人記** → 回覆帶來多少追蹤，11/13 之後完全沒資料 |
| hub 訪客 | monitor.csiesheep.com/games_hub/ 有統計，但要 ADMIN_KEY，我沒有去讀 | 所以 hub 相關任務（今日挑戰、新收錄、scout）的「帶來多少人」目前是**空白** |

14 天視窗＝11/7–11/21；token 視窗＝11/10–11/21。11/13 是分界：之前 Threads 是 csiesheep.games，之後是 @csiesheep（11/14–16 還因為私人帳號被擋，回覆幾乎全沒發出）。

---

## 2. 清單

**運作中（跟小羊遊戲間有關）：** games-stats-hourly、games-weekly-review-2、games-replies-morning-2／lunch-2／evening-2（找文）、games-replies-post-0730／1200／1355／1800／1930（發文）、games-replies-hub-1530、games-replies-night-2200、hub-daily-challenge、hub-new-games-post、hub-review-recs、hub-threads-scout、promo-post-china-reel、promo-post-china-reel-1430、promo-post-cards、promo-post-popular、promo-threads-1330、promo-threads-2100、promo-producer（與鬼唱詩共用）、social-stats-daily／weekly（與鬼唱詩共用）、dst-shift。

**已停用（只記一下）：** hub-creator-notes（11/9 到期，11/13 還跑過一次空的）、promo-post-devnote-1130／2120（11/9 為省 token 停）。**鬼唱詩的任務（ghost-*、promo-post-ghost-*、ghost-weekly-review）不在這份裡。**

---

## 3. 每個任務的成績（14 天，token 為 11/10–11/21）

「M／天」＝等效輸入 token 百萬／天。「視窗」＝只看得到一部分。

### 3.1 回覆別人的貼文（Threads，11/14 起 @csiesheep）

11/7–11/13（csiesheep.games）發 173 則（25／天）；11/14–11/21（@csiesheep）發 123 則（15／天）。

| 任務 | 台灣時間 | 跑了 | 每次 token (M) | M／天 | 發出（11/7–13 → 11/14–21） | 備註 |
|---|---|---|---|---|---|---|
| games-replies-morning-2（找） | 05:30 | 14／14 成功 | 0.71 | 0.65 | — | 找文給 07:30 |
| games-replies-post-0730 | 07:30 | 14／14 | 0.52 | 0.48 | 30 → 22 | |
| games-replies-lunch-2（找） | 10:00 | 15／15 | 1.02 | 1.02 | — | 最貴的一支找文 |
| games-replies-post-1200 | 12:00 | 15／15 | 0.77 | 0.77 | 35 → 31 | 中位數 45 分鐘（等間隔），11/14 因私人帳號 0 則 |
| games-replies-post-1355 | 13:55 | 15／15 | 0.39 | 0.39 | 17 → 15 | 3 次略過（沒稿） |
| games-replies-hub-1530 | 15:30 | 15／15 | 0.85 | 0.85 | 33 → **7**（3 次略過） | 11/14–16 私人帳號 0 則；試辦 11/2–9 共 23 則 → 5 讚、2 回覆、**1 則被移除** |
| games-replies-evening-2（找） | 16:30 | 15／15 | 0.71 | 0.71 | — | |
| games-replies-post-1800 | 18:00 | 15／14（1 次失敗：Cloudflare 403，11/13） | 0.37 | 0.37 | 16 → 17 | |
| games-replies-post-1930 | 19:30 | 15／15 | 0.33 | 0.33 | 14 → 13 | |
| games-replies-night-2200 | 22:00 | 15／15 | 0.97 | 0.97 | 28 → 18 | 中位數 31 分鐘；跟鬼唱詩 22:00 組搶 Chrome 鎖 |
| **合計** | | | | **6.5** | 173 → 123 | **約 0.3M／則** |

效果（看得到的）：
- Threads 內建瀏覽器的 china_life＋covervote 訪客：11/7–13 共 128（18／天）；11/14–21 共 32（4／天）。每則回覆對應的訪客 0.74 → 0.26。**同時發生的事太多（換帳號、私人帳號擋三天、hub 連結不放、只回輕鬆貼文），分不出哪個是原因。**
- 24 小時成績（能讀的 11/8、9、11 三天，81 則）：約 18 個讚、8 則回覆；每則最多 1 個讚。
- 追蹤：csiesheep.games Threads 11/1 的 6 個到 11/12 的 13 個（所有動作合計）；回覆 160 則帶來 0 個（週報 11/15）。@csiesheep 完全沒資料。
- 玩家人數跟 Threads 訪客無關：11/8–10 平均 134 人、11/11–13 平均 62 人、11/14–21 平均 49 人，掉的是「一般瀏覽器」（週報 11/15 已指出；原因不明）。

### 3.2 自己發的貼文

| 任務 | 台灣時間 | 跑了 | 每次 token (M) | M／天 | 每次的產出與瀏覽（11/7–11/18 讀到的平均） |
|---|---|---|---|---|---|
| promo-post-china-reel | 18:30 | 15／15 | 1.14 | 1.14 | FB Reel 172、YouTube 46、IG 27、Threads 2 → 約 250 次／次 |
| promo-post-china-reel-1430 | 14:30 | 15／15 | 1.22 | 1.22 | 同上；週報：**每天 1 支或 2 支，玩家人數看不出差別**（66／67／61） |
| hub-daily-challenge | 09:00 | 15／15（12 次略過部分平台：IG 停權、第 5 款是政治遊戲等） | 1.58 | 1.58 | FB Reel 109、YouTube 16、IG Reel 7、Threads 串文 13／Reel 4；**FB 圖文 1.5、IG 圖文 1.5** → 約 150 次／次 |
| hub-new-games-post | 23:00 | 15／15（IG 11/18 起未發） | 1.81 | 1.81 | FB Reel 61、YouTube 35、IG Reel 23、Threads 串文 29／Reel 10；**FB 輪播 0.9、IG 輪播 3.4** → 約 160 次／次 |
| promo-post-popular | 08:00、20:00 | 30／30 | 1.11 | **2.22** | Threads 6.9、IG 輪播 3.6、FB 輪播 0.6 → 約 11 次／次（每天 2 次） |
| promo-post-cards | 17:30 | 15／15 | 0.51 | 0.51 | FB 1.7、IG 1.6、Threads 8–14 → 約 15 次／次 |
| promo-threads-2100 | 21:00 | 15／15（2＋1 次略過） | 0.28 | 0.28 | Threads 串文 12–20 次；11/7–13 發 4 則、11/14–21 發 3 則 |
| promo-threads-1330 | 13:30 | 15／15 | 0.35 | 0.35 | 回自己貼文下的留言：11/7–13 發 8 則、11/14–21 只 2 則（沒人留言）；同時記追蹤數（與 social-stats-daily 重複） |
| **合計** | | | | **9.4** | |

（IG 的數字是 11/18 以前的；IG 11/18 起停權，之後這些任務的 IG 步驟都是白跑。）

### 3.3 小羊遊戲間 hub：找遊戲、作者、審核

| 任務 | 台灣時間 | 跑了 | 每次 token (M) | 產出 |
|---|---|---|---|---|
| **hub-threads-scout** | 02:30 | 14／14 | 1.21（約 15 分鐘） | **新收 64 款進審核頁**（11/8–11/21，平均 4.6／天，最多 9）；owner 決定後開 issue #83–#138（約 56 張，約 53 款上架）；seen 清單 110 筆，其中 46 筆讀完判定不收（約 42% 的閱讀是白讀）；作者通知 12 則（11/13：5 則用 csiesheep.games，11/15：5、11/16：1、11/17：5、11/18：1，用 @csiesheep）。11/21 只搜了一輪「限時內」，找到 1 款 |
| hub-creator-notes（停用） | 09:30 | 7／7（最後幾次是空跑） | 0.16 | 試辦 5 則（11/4–11/8）：4 位作者回「多謝」「感謝收錄👍🏼」「非常感謝…」，0 人要求取消 |
| hub-review-recs | 12:00（每天一次） | 15／15，1 分鐘 | — | 審玩家推薦；找不到這個資料夾的對話紀錄，沒有 token 數字，也沒寫進度紀錄 |

### 3.4 製作、統計、報告

| 任務 | 跑了 | 每次 token (M) | M／天 | 備註 |
|---|---|---|---|---|
| promo-producer（與鬼唱詩共用） | 539 次／12 天（約 45／天） | 0.29 | 12.9 | 其中約 437 次是「存貨已滿」空轉（0.043M×437＝18.8M／12 天）；做鬼唱詩故事 34 次共 86M（55%）；**小羊遊戲間部分：生在中國 Reel 21 次共 23M（1.1M／支）、貼文 4.3M、分享卡 1.7M**，合計約 2.4M／天 |
| games-stats-hourly | 273 次／12 天（24／天） | 0.058 | 1.32 | 每小時一次，只有兩款遊戲，77 次警告；日報裡每小時表格沒有人用到（週報用全天數字） |
| social-stats-daily（與鬼唱詩共用） | 15 | 1.13（中位數 12 分鐘） | 1.13 | 每天都讀不到 csiesheep.games Threads（已停用）和 YouTube Studio；沒有記 @csiesheep |
| games-weekly-review-2 | 2 | 0.39 | 0.06 | 每週一次，便宜；但上週的 5 項建議 owner 只採了一部分 |
| social-stats-weekly／dst-shift | 2／1 | 0.1／0.05 | — | 忽略 |

**目前小羊遊戲間任務合計約 19.2M／天，外加 producer 小羊遊戲間部分約 2.4M／天、producer 空轉約 1.6M／天（共用）。這個資料夾所有排程 session 合計約 43M／天。**

---

## 4. 排名：每個 token 換到什麼

排名標準：每天花多少、有沒有看得到的產出、有沒有被回應、風險。分數是我的判斷，不是量出來的。

| 名次 | 任務 | 判斷 |
|---|---|---|
| 1 | hub-threads-scout | 約 1.2M 換 5 款候選，每款約 0.23M；產出直接長進產品（hub 的遊戲數），而且 owner 真的批准了 80% 以上。唯一缺：看不到這些遊戲帶來多少 hub 訪客 |
| 2 | 作者收錄通知（現在寄生在 scout 裡） | 試辦 5 則 4 位回應；0.16M 一次。要的是客氣、一個作者一則 |
| 3 | promo-post-china-reel（18:30） | 每支約 250 次瀏覽，約 220 次／M，是自己貼文裡最好的（主要是 FB Reel） |
| 4 | hub-daily-challenge／hub-new-games-post 的「Reel」部分 | FB Reel 61–109，約 90 次／M；但同一個任務裡的輪播、圖文 0.9–3.4 次是白花 |
| 5 | games-stats-hourly | 便宜但頻率過高；評估要靠它，所以不停，只降頻 |
| 6 | promo-post-china-reel-1430 | 單支跟 18:30 一樣，但邊際效果看不出來（週報） |
| 7 | social-stats-daily | 一半是鬼唱詩的；小羊遊戲間那半讀不到，要修成讀 @csiesheep |
| 8 | games-replies（含 hub-1530、night-2200） | 約 0.3M／則，每則 0.26 位訪客、0 追蹤；又是 owner 本人帳號的風險來源。**量減到剩一小塊** |
| 9 | promo-threads-1330／2100 | 便宜（0.3M）但產出一天 0–1 則、10–20 次瀏覽；1330 的功能可以併進新的作者任務 |
| 10 | promo-post-cards | 約 15 次瀏覽／次；Threads 又因為安全規則常不能發 |
| 11 | promo-post-popular | 最貴的單一自己貼文任務（2.2M／天），約 11 次瀏覽／次，加上 producer 做每篇的 3 輪評審 |

---

## 5. 提案

### 5.1 停（11 個，約 8.2M／天）

| 任務 | 理由 |
|---|---|
| promo-post-popular | 排名最後；停了之後 producer 也不用再做熱門貼文（`producer_check.py` 的 popular 目標設 0，連同 4 篇存貨留著）。約 −2.2M ＋ producer 約 −0.4M |
| promo-post-cards | 15 次瀏覽／次；producer 的分享卡目標設 0。約 −0.5M ＋ producer −0.15M |
| promo-threads-2100 | 一天 0–1 則、10–20 次瀏覽 |
| promo-threads-1330 | 沒人留言；追蹤數由 social-stats-daily 記；回留言併入新的 hub-creator-replies（5.3） |
| promo-post-china-reel-1430 | 一天 1 支 vs 2 支看不出差別；保留 18:30 這支（FB Reel 最好）；producer 的 Reel 存貨目標 3→2，每天少做一支（約 −0.9M） |
| games-replies-evening-2、post-1800、post-1930、post-1355 | 傍晚到晚上三組；每天約 −1.8M |
| games-replies-hub-1530 | 試辦已在 11/9 結束；每則都帶 hub 連結＝最容易被移除（試辦 1 則被移除）；11/14–16 空轉三天 |
| games-replies-night-2200 | 22:00 和鬼唱詩 22:00 組搶 Chrome；每則約 1M |

**留下的回覆：morning-2 ＋ post-0730、lunch-2 ＋ post-1200，一天合計 5 則（早 2、午 3）。** 這四個每天約 3.0M，比現在的 6.5M 少一半以上。

### 5.2 瘦（約 4.3M／天，其中 hub 貼文的 1.0M 是估計）

| 任務 | 做法 |
|---|---|
| hub-daily-challenge（09:00） | 只發 Reel（FB、YouTube）＋1 則 Threads 串文；不再發 FB／IG 圖文、IG 全部（停權）。估計 −0.5M |
| hub-new-games-post（23:00） | 同上：只發 Reel（FB、YouTube）＋1 則 Threads 串文；不發輪播。估計 −0.5M |
| games-stats-hourly | cron `5 */3 * * *`（每 3 小時，一天 8 次）。−0.9M |
| promo-producer | cron 從每 30 分鐘改每 60 分鐘（共用，**鬼唱詩也受影響，owner 決定**）：空轉約 437 次／12 天 → 約一半，−0.8M |
| social-stats-daily | 不再讀 csiesheep.games Threads，改讀 @csiesheep：追蹤數＋前一天各則回覆的讚／回覆（現在完全沒資料）。+0.1M |

### 5.3 加（2 個新任務＋1 項測量）

**A. hub-threads-scout-2（新）——多找遊戲**
- 台灣 11:00（cron `0 19 * * *`），Threads 只讀，約 15–20 分鐘，必須在 11:55 前結束（12:00 有 post-1200）。
- 內容：跟 02:30 那次**用不同的搜尋組**，不重複：02:30 照現在（作者自己發的作品文）；11:00 做 (1) 有遊戲網址的貼文（itch.io／github.io／pages.dev／vercel.app／netlify.app／glitch.me）、(2) 網頁遊戲連結樓、(3) hashtag（#網頁遊戲 #獨立遊戲 #vibecoding #小遊戲）、(4) 已收錄作者的主頁看有沒有下一款。看過的網址進同一份 `threads_scout_seen.json`。
- 每天兩次合計**最多 12 款**進審核頁（現在是 10；實際平均 4.6）。上限不是瓶頸，所以不是靠放寬上限，而是靠多搜一次。
- 估計 +1.2M／天（照 scout 現在每次 1.2M）。
- **owner 要看的審核會從約 5 款／天變成約 8–10 款／天。**
- 同時改 02:30 的 hub-threads-scout：拿掉「通知作者」這一步（搬去 B），只留處理 owner 決定、開 issue、找遊戲。

**B. hub-creator-replies（新，取代 hub-creator-notes 和 scout 的通知步驟）——回覆遊戲作者**
- 台灣 15:30（cron `30 23 * * *`，用 hub-1530 讓出的時段），Threads @csiesheep，只在 @csiesheep 的 Chrome（fc855be5…）做，約 20 分鐘。
- 一天最多 **7 則**，一則一個作者、一個作者一輩子一則（先查 seen／已通知清單）：
  1. **收錄通知 ≤ 5 則**：遊戲已上架（games.csv `listed`）而且還沒通知的，在作者的原貼文底下留言。至少隔 5 分鐘（現在有幾次只隔 3 分鐘）。
  2. **回覆作者的回覆 ≤ 2 則**：作者在我們通知底下回了（謝謝、問題）→ 客氣回一次。作者要求取消收錄 → 不回，立刻寄 email（現有做法）。
  3. 檢查 14 天內通知底下有沒有取消要求；把作者回覆寫進 `hub_daily/creator_notes.md`（現在 @csiesheep 的 12 則通知有沒有人回，**沒有紀錄**）。
- 也接手 promo-threads-1330 的「回自己貼文下的留言」（量很小）。
- 通知文字要改成第一人稱的做遊戲的人（現在 scout 裡的字句還是「我們」，跟 @csiesheep 的設定衝突）。草稿（**請 owner 核准後才換**；每則仍要過 `threads_safety.py`，遊戲名過不了就用類型名，像 11/17 那則「棒球應援小遊戲」）：
  > 你好！看到你做的《〈遊戲名〉》，很好玩 👍 我把它收進我整理的網頁小遊戲站了，點進去會直接連到你的網站：https://games.csiesheep.com/　如果你不希望被收錄，回我一聲，我馬上拿掉。謝謝你做出這個遊戲！
- 停發規則照舊：一則被移除 → 這個任務停 24 小時（因為都帶連結）；7 天內 2 則 → 整個 Threads 停 24 小時。
- 估計 +0.9M／天（hub-1530 每次 0.85M、night-2200 每次 0.97M 發 7 則；這個任務沒有找文，大概更便宜）。

**C. 測量（便宜，但沒有它，之後還是不能判斷）**
1. social-stats-daily 記 @csiesheep 的追蹤數、前一天回覆的讚／回覆（現在是空白）。
2. 把 `games.csiesheep.com/`（hub 首頁）和 `/g/<id>` 加進 games_stats 的 Cloudflare 查詢（要改 `games_stats.py`，產品／腳本改動，要 owner 同意）；或 owner 給我 monitor 的統計頁權限讓我讀。這樣才看得到 scout／作者通知／hub 貼文到底帶來幾個 hub 訪客。
3. 週報加兩行：scout 新收／批准款數、作者通知與作者回覆數。

### 5.4 新的一天（台灣時間；Chrome 的部分）

| 台灣時間 | 任務 | Chrome | 帳號 | 每天上限 |
|---|---|---|---|---|
| 02:30 | hub-threads-scout（瘦身，只讀＋決定／issue） | 讀 | @csiesheep 只讀 | 候選 ≤ 6（與 11:00 合計 ≤ 12） |
| 05:30 | games-replies-morning-2（找文） | 讀 | — | 2 則 |
| 07:30 | games-replies-post-0730 | 發 | @csiesheep | 2 則（Threads） |
| 09:00 | hub-daily-challenge（瘦身） | 發 | csiesheep.games（FB、YouTube）、@csiesheep（Threads 1 則） | 1 Reel＋1 Threads |
| 10:00 | games-replies-lunch-2（找文） | 讀 | — | 3 則 |
| **11:00** | **hub-threads-scout-2（新）** | 讀 | @csiesheep 只讀 | 候選 ≤ 6 |
| 12:00 | games-replies-post-1200 | 發 | @csiesheep | 3 則 |
| 12:10–13:38 | （鬼唱詩午休兩組，不動） | | | |
| **15:30** | **hub-creator-replies（新）** | 發 | @csiesheep | 通知 ≤ 5＋回覆 ≤ 2 |
| 18:30 | promo-post-china-reel | 發 | FB、YouTube（IG 停權） | 1 支 |
| 23:00 | hub-new-games-post（瘦身） | 發 | 同 09:00 | 1 Reel＋1 Threads |
| 每 3 小時 | games-stats-hourly | 否 | — | — |

已騰出：01:30、08:00、13:30、13:55、14:30、16:30、17:30、18:00、19:30、20:00、21:00、22:00（小羊遊戲間側）。**Chrome 鎖：** 兩個新任務放在沒有鬼唱詩的時段（11:00 在 10:00 找文之後、12:00 發文之前；15:30–16:00 整段空），不重疊；鬼唱詩的 12:10／13:10／20:00／21:00／22:00／00:10 不受影響。cron 小時＝台灣小時＋8（mod 24），新任務要同時寫進 `tw_schedule.json` 並跑 `dst_shift.py --init`。

**@csiesheep 每天 Threads 寫入總量（硬上限 14，第一週先 10）：**回覆 5＋通知 ≤ 5＋作者回覆 ≤ 2＋自己貼文 2（今日挑戰、新收錄，安全規則常會略過一則）＝ 最多 14。現在是約 15 則回覆＋約 3 則貼文＋通知，所以總量沒有爆增，只是把「對陌生人貼連結」換成「對作者留言」。

### 5.5 token 預算（估計）

| | M／天 |
|---|---|
| 目前：小羊遊戲間任務 | 19.2 |
| 目前：producer 小羊遊戲間部分／空轉（共用） | 2.4／1.6 |
| **停 11 個** | **−8.2** |
| 瘦（hub 貼文 −1.0、stats −0.9、producer 空轉 −0.8；producer 少做 Reel／熱門／卡 −1.5） | −4.2 |
| **騰出合計** | **約 −12.4** |
| 加 scout-2 | +1.2 |
| 加 hub-creator-replies | +0.9 |
| 加 social-stats-daily 測量 | +0.1 |
| **新增合計** | **約 +2.2** |
| **淨** | **約 −10.2（目前所有排程約 43M／天，−24%）** |

不確定的地方：hub 貼文瘦身（−1.0）、producer 數字、新任務每次成本都是照相近任務推的估計；停用的 11 個和 stats 降頻是用實測每次成本算的，比較可靠。

---

## 6. 受到哪些限制

1. **Threads 在 @csiesheep、只在原本的 Chrome**：所有新的 Threads 步驟加「## Threads 改用 @csiesheep」（第一人稱做遊戲的人）、每個 burst 先拿鎖、選 deviceId `fc855be5-907f-4a04-a09e-9dc01649a6a7`。scout-2 只讀，可用任一個 Chrome。
2. **安全規則**：不寫死亡（尤其小孩）、自殘、暴力、性、饑荒疫病、政治、悲劇時事、拉讚拉追蹤；每則先跑 `threads_safety.py`，BLOCK 改寫一次，還是 BLOCK 就不發。只回輕鬆貼文。作者通知：作者貼文如果是這些題材（例如 11/19 今日挑戰排到立法院遊戲）→ 不通知，記未發：安全規則。停發規則照舊（1 則被移除停 24 小時、7 天 2 則停平台）。**一個作者只回一則、客氣、不拉追蹤。**
3. **Chrome 鎖**：見 5.4；新任務一次只拿鎖做一個 burst，做完關分頁。
4. **hub v1：沒有廣告、沒有捐款、不寫預估遊玩時間**：通知文字、貼文都不含這三種。
5. **只提案**：沒有動排程；套用步驟在第 8 節。

---

## 7. 風險

| 風險 | 說明 | 怎麼壓 |
|---|---|---|
| **@csiesheep 被限流／停權** | owner 本人帳號，已有前例（csiesheep.games 11/13 被停；IG csiesheep.games 11/18 停權申訴中）。作者通知每天都帶 hub 連結 | 每天 ≤ 14、≥ 5 分鐘間隔、一作者一則、不重複文字（每則帶作者的遊戲名／原貼文細節）；第一週先 10；出現任何警告／驗證／限流整個 Threads 停 |
| 作者不喜歡被收錄 | 試辦 0 人要求取消；但 @csiesheep 的 12 則沒有人讀回應 | 通知必須含「不要的話回我一聲」；回覆檢查 14 天；取消要求立刻寄 email 給 owner，不自己處理 |
| 審核量變成 owner 的瓶頸 | 候選從約 5 變約 8–10 款／天，每款 owner 要點；批准後每款還要 hub 的 orchestrator 派工上架（那一段的 token 不在這份裡，**可能比 scout 本身貴**） | 候選上限 12；owner 可以先只開 02:30 那個、把 11:00 的延後；如果上架來不及，先降 scout-2 上限 |
| 砍掉回覆後 Threads 訪客更少 | 每則回覆約 0.26 訪客 → 少 10 則約少 2–3 位／天；相對 china_life 每天約 50–140 位玩家很小，但 Threads 一般本來就小 | 保留 5 則；兩週後用新的測量判斷 |
| 砍貼文後看起來「安靜」 | FB Reel 以外的圖文本來就沒人看；IG 又停權 | 保留 Reel；等 IG 申訴結果再決定 IG 要不要回來 |
| producer 改每小時 | 鬼唱詩的存貨補充變慢（存貨目標 4，每天做 1–2 支） | 可以不做這項；其他不受影響 |
| 估計誤差 | token 數字是等效單位、12 天樣本、其中有 3 天私人帳號異常 | 套用兩週後用同一個腳本重算 |
| 沒資料的歸因 | 「少了訪客」「玩家掉了」是同時發生，不是證明 | 加 `?src=`（週報建議 3，還沒決定）和 hub 路徑統計 |

---

## 8. 變更清單（等 owner「go」；我沒套用任何一項）

**停用（`update_scheduled_task` enabled=false，共 11 個）**
1. promo-post-popular
2. promo-post-cards
3. promo-threads-2100
4. promo-threads-1330
5. promo-post-china-reel-1430
6. games-replies-evening-2
7. games-replies-post-1800
8. games-replies-post-1930
9. games-replies-post-1355
10. games-replies-hub-1530
11. games-replies-night-2200

**修改現有任務**
12. games-replies-lunch-2：不再排 13:55 組；12:00 組 ≤ 3 則（SKILL 內的 post-1355 排程與每組則數）。
13. games-replies-morning-2：≤ 2 則。
14. games-replies-post-0730：配合（≤ 2 則）、post-1200 ≤ 3 則。
15. hub-daily-challenge、hub-new-games-post：拿掉 FB／IG 圖文／輪播與所有 IG 步驟（IG 停權）；Reel 只發 FB、YouTube；各留 1 則 Threads 串文（@csiesheep，安全規則不變）。
16. hub-threads-scout：拿掉「2. 通知作者」；每次 ≤ 6 款（與 scout-2 合計 ≤ 12）；開頭加一行：作者通知改由 hub-creator-replies 做。
17. games-stats-hourly：cron `5 */3 * * *`。
18. promo-producer：cron `15,45 * * * *` → `15 * * * *`（共用，owner 決定可不做）；`producer_check.py` 目標：分享卡 0、熱門貼文 0、生在中國 Reel 存貨 3 → 2。
19. social-stats-daily：Threads 改讀 @csiesheep（追蹤數、前一天回覆的讚／回覆）；不再讀 csiesheep.games Threads。
20. games-weekly-review-2：加 scout 新收／批准、作者通知／回覆兩行。

**新增（`create_scheduled_task`，兩個，要 Bypass、要含這些任務共用的段落：Chrome 鎖、關分頁、少截圖、停發規則、卡住寄 email、## Threads 改用 @csiesheep）**
21. hub-threads-scout-2：cron `0 19 * * *`（台灣 11:00）；內容見 5.3 A。
22. hub-creator-replies：cron `30 23 * * *`（台灣 15:30）；內容見 5.3 B；通知文字用 owner 核准後的版本。

**其他**
23. `tw_schedule.json` 加兩個新任務、移除停用的，跑 `dst_shift.py --init`。
24. schedule.md 加一段「2026-11-21 重排」，重畫 schedule.png（`draw_schedule.py`）。
25. （建議，不是排程）games_stats 加 hub 首頁路徑；@csiesheep 追蹤數表格。

建議套用順序：先 1–11（只減，風險最低）→ 17–20 → 21–22（新任務先各跑 3 天，看有沒有警告）→ 15、16。

---

## 9. 沒有資料或只有相關性的地方（再說一次）

- **歸因**：沒有任何一個任務能被證明「帶來」訪客或玩家。Threads 訪客下降與換帳號同時發生。
- **回覆的 24 小時成績**：11/13 起沒有。
- **@csiesheep 追蹤、作者對 12 則通知的反應**：沒有。
- **hub 首頁訪客**：沒有（games_stats 只有兩款遊戲）。
- **hub-review-recs、鬼唱詩的 22:00／22:36／23:09 回覆組的 token**：找不到對話紀錄。
- **token 是等效單位的估計**，12 天，只含這個資料夾的排程 session。
- **producer 對小羊遊戲間的分攤**用 progress 行判斷，約略。
