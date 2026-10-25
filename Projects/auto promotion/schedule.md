# 自動推廣排程

2026-10-25 起：製作 24 小時都能跑，發文在固定時間。兩個品牌用 Chrome 的時段不重疊。
所有排程都是 Bypass；每次執行的進度記在同資料夾的 `<台灣日期>.md`。流程細節：`~/.claude/skills/auto_promotion/SKILL.md`。

![[schedule.png]]

## 一天的時段（台灣時間）

| 台灣 | 你那邊 PDT（11/1 後減 1 小時） | 帳號 | 做什麼 | 排程 |
|---|---|---|---|---|
| 每 2 小時 | 每 2 小時 | — | 製作：分享卡補到 4 張 → 生在中國 Reel 補到 2 支 → 鬼唱詩補到 2 支 | promo-producer |
| 23:20–01:00 | 08:20–10:00 | gui.chang.shi | 發鬼唱詩故事（深夜場） | promo-post-ghost-night |
| 05:00–06:25 | 14:00–15:25 | gui.chang.shi | 發鬼唱詩故事（早上場） | promo-post-ghost-morning |
| 06:30–07:25 | 15:30–16:25 | csiesheep.games | 遊戲回覆・早上：找文 | games-replies-morning-2 |
| 07:30–08:25 | 16:30–17:25 | csiesheep.games | 遊戲回覆・早上：發 | games-replies-morning-2 |
| 08:30–08:55 | 17:30–17:55 | csiesheep.games | 分享卡 → Threads | promo-post-cards |
| 09:00–09:50 | 18:00–18:50 | gui.chang.shi | 鬼唱詩回覆・中午：找文（先補發故事沒發完的平台） | ghost-reply-daily-1700-bypass |
| 10:00–10:55 | 19:00–19:55 | csiesheep.games | 遊戲回覆・中午：找文 | games-replies-lunch-2 |
| 12:00–13:00 | 21:00–22:00 | csiesheep.games | 遊戲回覆・中午：發 | games-replies-lunch-2 |
| 13:00、13:20 | 22:00、22:20 | gui.chang.shi | 鬼唱詩回覆・中午：發 | ghost-reply-post-1300、-1320 |
| 15:30–16:20 | 00:30–01:20 | gui.chang.shi | 鬼唱詩回覆・晚上：找文 | ghost-reply-daily-0500 |
| 16:30–17:25 | 01:30–02:25 | csiesheep.games | 遊戲回覆・晚上：找文 | games-replies-evening-2 |
| 17:30–17:55 | 02:30–02:55 | csiesheep.games | 分享卡 → Threads | promo-post-cards |
| 18:30–19:25 | 03:30–04:25 | csiesheep.games | 生在中國 Reel → IG、FB、Threads | promo-post-china-reel |
| 19:30–22:00 | 04:30–07:00 | csiesheep.games | 遊戲回覆・晚上：發 | games-replies-evening-2 |
| 22:00–23:15 | 07:00–08:15 | gui.chang.shi | 鬼唱詩回覆・晚上：發（22:00、22:18、22:36、22:53、23:09） | ghost-reply-post-2200 … -2309 |
| 每小時 :07 | 每小時 :07 | — | 遊戲數據報告 | games-stats-hourly |
| 週日 09:30 | 週六 18:30 | — | 遊戲推廣週報（只報告） | games-weekly-review-2 |

## 數量

- 遊戲回覆：第 1 週（到 10/31）每天約 Threads 14＋IG 6；11/1 起沒有警告就加到 Threads 21＋IG 8。每則都附遊戲網址。
- 鬼唱詩回覆：每天每平台最多 7 則，不附連結。
- 生在中國 Reel：每天 1 支（18:30）。分享卡：每天 2 張（08:30、17:30），挑同時期一萬生裡少見的人。
- 鬼唱詩故事：每天最多 2 支（05:00、23:20），沒有存貨就跳過。
- 存貨目標：生在中國 Reel 2、鬼唱詩 2、分享卡 4。

## 時間怎麼對

排程跟著電腦的太平洋時間走，台灣不換時間，所以每個排程在兩個太平洋時間都會啟動，一次對夏令、一次對冬令。啟動後先看台灣時間，不在時段內就幾秒內退出，不記錄。
