---
title: 鬼故事產生器（Ghost Story Generator）
tags:
  - project
  - llm
  - generator
  - ghost-story
status: v1-building
created: 2026-10-13
updated: 2026-10-13
---

# 鬼故事產生器

> [!info] 一句話
> 從鬼故事來源抽「結構」和「評分」而不是抄文本；用加權抽樣規劃骨架，LLM 寫，LLM 評審，不及格就改。目標是讓 marvel 板老鄉民推「雞皮疙瘩」而不是「虛」。

## 核心主張

- 來源最值錢的不是故事本身，是**結構**和**評分**。直接 fine-tune 或檢索原文會做出抄襲機，而且不會更可怕。
- 「好」是評審撐出來的，不是語料量撐出來的。PTT 推噓文是免費的品質標籤。
- 可怕靠真實感，不靠鬼。鬼越清楚越不可怕；結尾收太乾淨也不可怕。這兩條要寫進評審規則。

## 第一版範圍（2026-10-13 定案）

PTT marvel 板 `[經驗]` 文、推文數 ≥ 30、約 200 篇。微疼等口述來源留到第二版。

## 管線

```
collect   PTT 站內搜尋 recommend:30 → 逐篇抓本文和推噓
annotate  LLM 把每篇拆成故事 DNA
stats     哪些組合高分、高分組節拍比例、字數、鬼露出 → weights.json + report.md
generate  規劃器抽骨架 → 寫手 → 評審 → 不過就照意見改，最多三輪
```

程式目前在 Claude Code session 裡（Python，`ghost/` 套件 + `prompts/` 三份 prompt），還沒搬進 repo。

### 故事 DNA 欄位

| 欄位 | 內容 |
|---|---|
| 場景 | 20 種：宿舍、當兵、夜班、山路、租屋、醫院、超商、老家、校園、飯店、夜路、喪事、廟宇、辦公室、大眾運輸、童年家中、電梯樓梯間、國外、水域、其他 |
| 恐怖機制 | 13 種：身份錯置、時間錯亂、逐步失控、犯禁忌、事後才知道、見證不一致、重複循環、在場感、善意型、附身、物件作祟、夢境滲入、只有聲音 |
| 結尾 | 開放、有解釋、反轉、淡出 |
| 節拍 | 正常、小異常、否認、升級、揭露、餘波，各佔比例 |
| 鬼露出 | 0 沒正面寫、1 間接跡象、2 一瞬間看見、3 清楚描述 |
| 錨點 | 讓它像真的細節類型（門禁時間、值班交接簿） |
| 聲音標記 | 第一人稱、朋友的朋友、免責開頭、鄉民用語、AI 潤飾、具體地點、具體時間、程序細節、對話、自我懷疑 |

### 權重公式

`weight = mean_score × ln(1 + n)`。高分但只出現一次的類別不會壓過常見又穩定高分的。場景 × 機制的條件抽樣只在同組合至少兩篇時啟用。

### 模型

annotate 用 Haiku（批量抽取，便宜），write 和 judge 用 Opus。三種憑證都能跑：API key、`ant auth login`、或 Claude Code 訂閱走 `claude -p`。

## 來源清單

| 來源 | 型態 | 能榨出什麼 | 取得方式 | 狀態 |
|---|---|---|---|---|
| PTT marvel 板 | 文字 + 推噓 | 結構 + 免費品質標籤 | 站內搜尋 `recommend:N`，HTML 直抓，無 robots.txt | **v1 使用中** |
| [Dcard 靈異版](https://www.dcard.tw/f/marvel) | 文字 + 愛心留言 | 大學生視角，場景偏宿舍租屋；據[時局的整理](https://today.line.me/tw/v3/article/XYLnnzQ)聲量高過 PTT | 有 Cloudflare，爬取難 | 候選 v2 |
| 微疼的鬼故事（YouTube） | 口述，聽眾投稿 | 口述節奏、開頭鉤子、停頓點；故事本身和 PTT 同源 | yt-dlp 抓自動字幕，不用 Whisper | v2 |
| 偷聽 story（YouTube） | 口述，聽眾投稿 | 同上 | 同上 | v2 |
| 靈異公社（Facebook 社團） | 文字投稿，量大 | 素人口吻最純 | FB 不能爬，只能手動 | 參考 |
| [不聽不可靈異頻道](https://rephonic.com/podcasts/bu-ting-bu-ke-ling-yi-pin-dao)（Podcast） | 口述，週更 | 都市傳說型 | 轉錄 | 候選 |
| 王狗、異色檔案（YouTube） | 都市傳說解說 | 題材庫，不是經驗文；[異色檔案提過黃標限制](https://www.inside.com.tw/feature/mysterious-content-on-youtube) | 不抓 | 題材參考 |
| [洒落怖](https://dic.nicovideo.jp/a/%E6%B4%92%E8%90%BD%E6%80%96)（2ch，日文） | 文字，2000 年起每月 50 到 80 篇 | 另一套結構的對照組；PTT `[翻譯]` 已有中譯 | 公開 wiki | 對照組 |
| r/nosleep | 英文創作 | 創作而非經驗，聲音完全不同 | Reddit API | 不用 |
| 聊齋等公有領域 | 古典 | 題材 | 維基文庫 | 不用 |

微疼、偷聽 story、靈異公社是自己知道的來源，這次搜尋沒有驗證到現況。沒有找到現成的中文鬼故事開源資料集。

## 法律

只抽結構欄位，`annotated.jsonl` 和 `weights.json` 不含原文句子。`raw/` 只留本機，不重發、不拿去訓練會吐原文的模型。

## 下一步

- [ ] 拿到憑證跑 annotate 200 篇，看 report.md 的場景 × 機制表合不合直覺
- [ ] 產 5 篇，找 5 個人盲測「真人寫的還是機器寫的」
- [ ] 評審改成拿推文資料訓練的分類器（標註破千篇再做）
- [ ] v2：微疼、偷聽 story 自動字幕，抽口述節奏
- [ ] 程式搬進 repo

## 歷程

- 2026-10-13 討論架構，決定 v1 只用 PTT。寫完 collect / annotate / stats / generate 四段和三份 prompt，PTT 抓取跑通。
