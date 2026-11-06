# 帳號與 Chrome 設定檔

2026-11-07 起，每個品牌有自己的 Chrome 設定檔，各自一直保持登入。排程任務只用自己品牌那個 Chrome，**不再切換 IG／Threads 帳號，也不登出**。

為什麼：在同一個 Chrome 裡一天切換兩個 IG 帳號好幾次，IG 在 10/30 到 11/05 之間登出或要求輸入密碼大約 10 次，Threads 也跟著掉線。owner 2026-11-07 同意：「好，用兩個 Chrome 的方案」。

## 三個 Chrome

| Chrome 設定檔 | Claude in Chrome deviceId | 登入的帳號 | 誰在用 |
|---|---|---|---|
| **csiesheep.games** | `ad2977e1-4f4e-4d58-9611-3f06aafa85c0` | IG csiesheep.games、Threads csiesheep.games、FB 傅道揚（粉專 小羊遊戲間）、YouTube Studio 小羊遊戲間 | 小羊遊戲間的所有任務 |
| **鬼唱詩** | `79a72d3b-ce4f-4444-a4e0-6c5cbfdda6f9` | IG gui.chang.shi、Threads gui.chang.shi、FB 傅道揚（粉專 鬼唱詩）、YouTube Studio 鬼唱詩（gui.chang.shi.tw@gmail.com）、Pinterest guichangshi | 鬼唱詩的所有任務 |
| 原本的 Chrome | `fc855be5-907f-4a04-a09e-9dc01649a6a7` | 舊的混用狀態：IG 兩個帳號都存著、Threads csiesheep.games | owner 自己用，排程不用 |

- csiesheep.games 和鬼唱詩這兩個 Chrome 都要一直開著。任何一個關掉，那個品牌的任務會停下來，寄 email 到 csiegoat@gmail.com。
- 擴充功能清單上的名字（Browser 1／2／3）每接上一個 Chrome 就重新編號，靠不住；任務只認 deviceId。
- 要確認某個 deviceId 是哪個視窗：在那個 Chrome 開一個好認的分頁（例如搜尋「XXX 測試分頁」），請 owner 看它出現在哪個視窗。`switch_browser` 的回報不一定是 owner 按的那個（11/07 實測）。

## 任務怎麼用

| 任務 | Chrome |
|---|---|
| 遊戲回覆（找文 06:30／10:00／16:30、發文 07:30／12:00／13:55／18:00／19:30）、小羊遊戲間回覆 15:30 | csiesheep.games |
| 熱門遊戲介紹 08:00／20:00、開發日記 11:30／21:20、分享卡 17:30、生在中國 Reel 14:30／18:30 | csiesheep.games |
| Threads 回留言 13:30、自己的貼文 21:00、今日挑戰 09:00、作者收錄通知 09:30 | csiesheep.games |
| 鬼唱詩回覆（13:00、13:20、22:00、22:18、22:36、22:53、23:09）、鬼故事發文 05:00／23:20 | 鬼唱詩 |
| 每日社群數字 01:10 | 兩個都用，各讀各的品牌 |
| 製作（promo-producer）、遊戲數據、週報 | 不用 Chrome |

每個任務的 SKILL.md 最前面有一段「## Chrome：只用「…」那個 Chrome」，寫明 deviceId，並且優先於下面所有切換帳號的舊步驟。

## 規則

- 不切換 IG／Threads 帳號，不登出，不輸入密碼，不用 Chrome 自動帶入的密碼，不按登入頁的「Log in」。
- 發文前仍要在頁面上確認帳號；帳號不對就不發，標「未發：帳號不對」，寄 email。
- Facebook：在該品牌的 Chrome 裡用「立即切換」換成粉專身分，發完切回個人檔案傅道揚。
- 要登入或重新登入，一律由 owner 自己來。

## 新增或換 Chrome 時

1. owner 建立設定檔，安裝 Claude in Chrome 並登入 Claude，再登入該品牌的各平台（IG 勾「儲存登入資訊」，Threads 用 IG 登入）。
2. Claude 用 `list_connected_browsers` 找到新的 deviceId，用測試分頁請 owner 確認是哪個視窗，再逐一確認各平台的帳號。
3. 更新各任務 SKILL.md 的 Chrome 段落，以及 `~/.claude/skills/game-promote/references/accounts.md`、`~/.claude/skills/auto_promotion/SKILL.md`、`~/.claude/skills/ghost-reply/references/posting-task.md` 開頭的說明，還有這份筆記。

## 之後可以考慮

兩個品牌不再共用瀏覽器，2026-11-01 定下的品牌時段（鬼唱詩 22:00–07:25、13:00–13:40；小羊遊戲間 07:30–12:55、13:45–21:57）可以放寬，讓兩邊同時跑。等跑順幾天再決定。
