---
title: 鬼故事 IG + Threads 經營
tags:
  - project
  - social
  - ghost-story
status: plan-waiting-for-owner-decisions
created: 2026-10-17
updated: 2026-10-17
---

# 鬼故事 IG + Threads 經營

> [!info] 一句話
> 一個鬼故事品牌帳號，Threads 放文字短篇和互動，IG 放漫畫輪播。故事用 ghost-story 寫，漫畫用 ghost-comic 畫，都是原創、AI 輔助、純屬虛構。上游專案是 [[ghost story generator]]。為什麼做、對誰做、其他平台、其他格式、怎麼賺、什麼時候停，在 [[ghost story business plan]]。

IG 和 Threads 都不能自己開「社團」。Threads 的 Communities 是 Meta 挑主題開的，不能自建（2025-10 全球 beta，200 多個主題）。所以這份計畫做的是「品牌帳號 + 兩個平台分工」。要成員制的社團得另外開 Facebook 社團。

## 還沒決定（等擁有者回答）

- [ ] 帳號名稱和人設：匿名的說書人，還是公開作者是誰。候選名稱：「今晚不關燈」「飄點微弱」「大夜班說書人」。
- [ ] 目標：衝追蹤數、單純發表作品，還是之後想變現。這會決定發文頻率和要不要做 Reels。
- [ ] 每週能花多少時間審稿和回留言。拿這個數字調「每週產能」的頻率。

## 現有的存貨

| 作品 | 頁數 | 位置 |
|---|---|---|
| 〈一個人在家開視訊〉 | 7 | 第一個 session 暫存資料夾的 `data/comic_home` |
| 〈半夜叫我全名的人〉 | 6 | `C:\Users\sheep\Pictures\ghost_comic\name_call` |
| 〈跟外甥玩捉迷藏〉 | 7 | `C:\Users\sheep\Pictures\ghost_comic\hide_seek` |
| 〈阿嬤說我後面跟了三個人〉 | 10 | `C:\Users\sheep\Pictures\ghost_comic\three_behind` |

四本就是開站前四週的量。〈阿嬤〉的 p27 手畫反了（變成護理師握阿嬤的手腕），擁有者決定照現狀發，不重畫。

## 兩個平台的分工

| | Threads | IG |
|---|---|---|
| 主力 | 文字短篇、互動 | 漫畫輪播 |
| 格式 | 單篇 500 字上限，可以加最多 10,000 字的文字附件（2025-09 起，不是每個帳號都有）。開頭 500 字當鉤子、全文放附件，或拆成串文，兩種都試，看留言數決定 | 一則最多 20 張，比例要一樣；主頁格狀顯示會裁成 3:4。漫畫頁 1200×1700 放進 3:4（1080×1440），左右只留約 32px 白邊，整頁放得下。第一張做封面（標題加一格緊張的畫面，不能雷），最後一張放「純屬虛構、AI 輔助」和追蹤提示 |
| 頻率 | 每週 5 篇故事，加 2 則互動（投票：「你遇過嗎？」「哪一格最毛？」） | 每週 1 本漫畫（4 到 10 頁），加 2 則文字輪播（Threads 上反應最好的故事），限動不定時 |
| 時間 | 晚上 10 點到 12 點，前兩週實測 | 同左 |
| 導流 | 漫畫上架那天在 Threads 發第一頁和連結 | 簡介放 Threads 連結 |

## 內容欄目

1. **原創短篇**（Threads）：ghost-story 寫，「直接」和「留白」兩種口味輪流發，順便收集讀者偏好。
2. **漫畫版**（IG）：Threads 上反應前幾名的故事才畫。
3. **系列作**：固定角色，例如大夜班護理師。角色卡可以重複用，省掉選設計那一關，讀者也會追下一集。〈阿嬤〉的結尾本來就接得下去。
4. **讀者投票選角色**：ghost-comic 第 2 關「每個角色 3 個版本」直接放進限動或 Threads 投票：「三個阿嬤，哪個最毛？」擁有者少做一個決定，又多一則互動。
5. **讀者投稿**：第二個月才開。投稿人要書面同意改編，標「讀者投稿改編」。絕不把 AI 寫的故事說成某個讀者的真實經歷。

## 每週產能

| 工作 | 誰做 | 時間 |
|---|---|---|
| 5 篇故事（每篇寫 3 版選 1） | Claude | 每篇 15 到 25 分鐘 |
| 讀故事、決定發不發 | 擁有者 | 每篇 2 到 3 分鐘 |
| 1 本漫畫 | Claude 和 GPU。畫風固定以後跳過第 1 關，系列作連第 2 關也可以省 | GPU 1.5 到 2.5 小時，排在晚上跑 |
| 漫畫的關卡（故事、角色、版面） | 擁有者 | 每週 15 到 20 分鐘 |
| 發文、回留言 | 擁有者 | 每天 10 到 20 分鐘 |

真正的瓶頸是擁有者審核和回留言的時間，不是 GPU。

## 開站前兩週（目標 2026-10-31 萬聖節）

1. **這週**：開帳號，定名稱和簡介（「AI 輔助創作｜故事純屬虛構｜每晚 11 點更新」）。頭像用阿嬤的花襯衫，或一格只露半張臉的畫。做 9 張開站貼文，讓主頁一打開就是滿的。
2. **10/25 前**：做好下面的工具 1 和 2，把 4 本漫畫轉成輪播。
3. **10/31 開站**：IG 發〈阿嬤說我後面跟了三個人〉（10 頁加封面），Threads 同步發文字版前半段，留懸念。
4. **之後四週**：每週一本現成漫畫，同時開始寫新故事。用前兩週的數字決定 Threads 用附件還是串文，以及幾點發。

## 要先做的工具

都放 `csiesheep/skills`，各開一個 PR。

1. **`manga.py export --ig`**（先做）：輸出 3:4 或 4:5 的輪播圖、封面、結尾卡，寫好 AI 標示。
2. **Threads 拆文**：把故事切成 500 字的鉤子加附件全文，或切成串文，斷點落在懸念上。也能輸出 IG 文字輪播的卡片圖。
3. **成效記錄**：每篇記口味、反轉類型、字數，48 小時後的收藏、分享、留言、新追蹤。先在這份筆記底下放一張表，手動填。
4. **第二個月**：Meta 的 IG 和 Threads API 都可以排程發文和抓成效，要專業帳號和一個 Meta 開發者 app。每一篇還是擁有者按發送。

## 規則（一開始就定）

- **不冒充真實經驗**：標題不用 `[經驗]`，改用 `[創作]`，每則第一行寫明 AI 輔助、純屬虛構。這本來就是 ghost-story skill 的規則，因為 PTT 口吻太像真的。
- **AI 標籤**：Meta 靠圖檔的 C2PA、IPTC metadata 自動標 AI；ComfyUI 輸出的圖通常沒有這種標記，所以要自己標：簡介、內文、IG 發文時的 AI 標籤選項（如果介面有）。查到的政策是 2024 年的報導，開站前要再看一次 Meta 現行規定。
- **不點名真實地方**：只寫到縣市、區、「某區域醫院」這一層，不點名真實的醫院、廟、店家。
- **不搬別人的故事**：不改寫 PTT 原文，投稿一定要有授權。
- **不放血腥畫面**：本來的風格（鬼小、臉在陰影裡）就很安全。

## 成效數字回饋到 skill

ghost-story 原本是用 PTT 推文數學出什麼樣的故事受歡迎。IG 和 Threads 的收藏、分享是另一個讀者訊號。累積約 30 篇以後，比較「直接」和「留白」、反轉和開放結局的差別，再調整 skill 的抽樣和兩兩評審。這是經營帳號之外，對專案本身最有價值的地方。

## 風險

| 風險 | 對策 |
|---|---|
| 讀者反感 AI 作品 | 每則都標示，靠品質取勝（每格獨立檢查、盲讀），畫風固定 |
| 被當成真實事件轉傳 | 第一行就標示，標題用 `[創作]` |
| 擁有者沒時間，斷更 | 先存 2 週的量；系列作和讀者投票都在減少要做的決定 |
| 平台規則變動 | 開站前查 Meta 現行規定；不買粉、不互刷 |

## 成效記錄

| 日期 | 平台 | 作品 | 口味 | 結尾 | 字數／頁數 | 收藏 | 分享 | 留言 | 新追蹤 |
|---|---|---|---|---|---|---|---|---|---|

## 來源（2026-10-17 查）

- Threads 文字附件：[Business Standard](https://www.business-standard.com/technology/tech-news/meta-s-threads-now-lets-users-attach-longer-text-to-posts-how-it-works-125090800643_1.html)、[typecount](https://typecount.com/blog/threads-character-limit)
- Threads Communities：[9to5Mac](https://9to5mac.com/2025/10/02/threads-announces-topic-based-communities/)、[Social Media Today](https://www.socialmediatoday.com/news/threads-rolls-out-communities-all-users/801861/)
- IG 輪播規格：[Decktopus](https://www.decktopus.com/blog/instagram-carousel-size-dimensions)、[ContentStudio](https://contentstudio.io/blog/instagram-carousel)
- Meta AI 標籤（2024 報導）：[Android Authority](https://www.androidauthority.com/meta-ai-labels-3411262/)、[TPR](https://www.tpr.org/2024-02-06/meta-will-start-labeling-ai-generated-images-on-instagram-and-facebook)

## 歷程

- 2026-10-17：擬計畫。
- 2026-10-17：寫 [[ghost story business plan]]。平台分級（核心 Threads、IG；導流 PTT、Dcard；變現 YouTube、FB 社團；小紅書不做）、新格式（三格預告 Reel、條漫、有聲版、互動鬼故事、季刊）、收入模式和停損都在那邊。
