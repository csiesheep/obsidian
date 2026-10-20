---
title: 鬼唱詩｜素材流程與 skill 分工
tags:
  - project
  - ghost-story
  - pipeline
status: plan-approved
created: 2026-10-20
updated: 2026-10-20
---

# 鬼唱詩｜素材流程與 skill 分工

> [!info] 一句話
> 五個 skill，照順序：寫故事 → 畫漫畫 → 做影片 → 包裝（拿號、蓋號、寫文案）→ 發文。前三步做的素材都不帶編號，可以先做好放庫存、隨時換發文順序；編號在決定發文日時才由 ghost-pack 加上。ghost-post 只檢查和發文，不準備任何素材（擁有者 2026-10-20 定）。發文計畫在 [[ghost story posting]]，內容分配在 [[ghost story content plan]]。

## 1. 分工和順序

| 順序 | Skill | 負責產生什麼 | 帶編號嗎 | 狀態 |
|---|---|---|---|---|
| 1 | **ghost-story** | 鬼故事全文；Threads 鉤子（500 字內）和全文附件 | 不帶 | 已有，要小改 |
| 2 | **ghost-comic** | 漫畫頁；IG 輪播（封面、每一頁、結尾卡）；Pinterest 圖（封面加揭露前的頁）；Threads 配圖；預告 Reel A、B | 不帶 | 已有，要加 Pinterest 圖和配圖 |
| 3 | **ghost-reel** | Reel full V3（整篇影片）；動態片段；每週 YouTube 合集 | 不帶 | 要新建，目前是原型 |
| 4 | **ghost-pack** | 拿編號；輪播封面和 Pinterest 封面蓋「第 N 首」；各平台文案（IG、Threads 第一行、YouTube 標題和說明、TikTok、FB、Pinterest 標題） | 這一步加上 | 要新建 |
| 5 | **ghost-post** | 不產生東西：檢查六個平台、檢查素材、發文、記連結 | — | 已建好（csiesheep/skills 的 `ghost-post` 分支） |

```
1 ghost-story  寫故事
      ↓
2 ghost-comic  畫漫畫 → 輪播、Pinterest 圖、配圖、預告 A/B
      ↓
3 ghost-reel   做 Reel full V3
      ↓        （1 到 3 做完放庫存，都不帶編號）
4 ghost-pack   決定哪天發時：拿號、蓋號、寫文案
      ↓
5 ghost-post   檢查平台 → 檢查素材 → 擁有者同意 → 發文 → 記連結
```

**編號只出現在**：各平台文案、Threads 第一行、YouTube 標題、Pinterest 標題、輪播第 1 張和 Pinterest 封面的下緣字條。**影片畫面裡不放編號**（影片會轉到多個平台，順序也可能變）。

## 2. 共用的資料夾約定

五個 skill 靠這份約定交接：前一個 skill 寫到這些位置，後一個 skill 從這裡讀。故事資料夾是 `C:/Users/sheep/Pictures/gui_chang_shi/stories/<英文短名>/`。

| 檔案 | 誰寫 | 誰讀 | 帶編號 |
|---|---|---|---|
| `story.md` | ghost-story | ghost-comic、ghost-pack | 否 |
| `posts/threads/hook.txt`（≤500 字）、`attachment.txt`（≤10,000 字） | ghost-story | ghost-pack（補第一行編號）、ghost-post | 包裝後有 |
| `posts/threads/image.jpg` | ghost-comic | ghost-post | 否 |
| `posts/ig/01.jpg … NN.jpg` | ghost-comic | ghost-pack（蓋 01.jpg）、ghost-post | 包裝後 01 有 |
| `posts/pinterest/00_cover.jpg`、`01_page.jpg …`（1000×1500，只到揭露前一頁） | ghost-comic | ghost-pack（蓋封面）、ghost-post | 包裝後封面有 |
| `reels/teaser_A/`、`teaser_B/` | ghost-comic | ghost-post | 否 |
| `reels/full_v3_cinema/full_v3_cinema.mp4`（和 V1） | ghost-reel | ghost-post | 否 |
| `posts/ig/caption.txt`、`posts/pinterest/pins.txt`、`posts/cross_caption.txt`（YouTube、TikTok、FB；IG 連結留 `{ig_link}`） | ghost-pack | ghost-post（發 IG 後把 `{ig_link}` 換成連結） | 有 |
| `README.md`（編號、狀態、連結） | ghost-pack 建、ghost-post 補連結 | 擁有者 | 有 |
| 帳簿 `brand/ledger.json` | ghost-pack 拿號；ghost-post 記發文 | 全部 | — |

漫畫的揭露格在 `comic/board.json` 標 `"reveal": true`，ghost-comic 和 ghost-post 都靠它避開（封面、配圖、預告、Pinterest 都不能用到揭露格之後）。

## 3. 逐步實作計畫

每一步在 csiesheep/skills 開一個分支，改完先用現有的故事測（〈阿嬤〉的輸出要和改之前一致），擁有者看過再合併。第 2 首〈半夜叫我全名的人〉當每一步的實際測試。

### 步驟 0：約定和清理（約 30 分鐘）✅ 2026-10-20 完成

> [!done] 做了什麼
> - 約定寫進 `gui_chang_shi/README.md`（資料夾樹、每個檔案誰寫誰讀、編號只在哪裡出現、不發的東西放 `drafts/`）和 ghost-post 的 SKILL.md。
> - 〈阿嬤〉：Threads 三個檔改名成 `hook.txt`（內容改成實際發出的版本，最後一行「……全篇漫畫在 IG。」）、`attachment.txt`、`image.jpg`；工具原本切的 500 字移到 `drafts/threads/`；Pinterest 第 8 到 10 頁（揭露在第 8 頁）移到 `drafts/pinterest_after_reveal/`；`teaser_A_p8` 改名 `teaser_A`；兩支測試預告和特效原型移到 `drafts/reels/`。
> - 〈半夜〉：V2 說書快剪和 V3 第五輪舊版移到 `drafts/reels/`。第 0 首的檢查圖移到 `about/drafts/`。沒有刪除任何檔案。
> - `board.json` 和 `build_board.py` 標揭露格：〈半夜〉p18、〈阿嬤〉p29。
> - ghost-post 的 `check_story.py` 改讀約定檔名，並檢查封面是否蓋號（看 ghost-pack 的 `_nonumber` 備份）和 Pinterest 有沒有到揭露頁（ghost-post 分支 4354833）。
> - 刪掉 social-post 分支（7 個 commit，內容已在 ghost-post）、`skills-post` worktree 和本機安裝的 social-post。
> - 第 1 首是舊流程做的，封面編號在製作時印上，沒有 `_nonumber` 備份；檢查會顯示「還沒蓋號」，它已發出，不影響。


- 把第 2 節的約定寫進每個相關 skill 的 SKILL.md（一小段，指向同一份清單）。
- 在 `name_call` 和 `three_behind` 的 `board.json` 標揭露格（p18、p29）。
- 現有的第 1 首、第 2 首檔案改成約定的檔名（例如 `posts/threads/01_post_hook.txt` → `hook.txt`）。
- 刪掉 social-post 分支和 `skills-post` worktree（已被 ghost-post 取代；要擁有者點頭）。
- **完成標準**：兩個故事資料夾都照約定，ghost-post 的 `check_story.py` 改讀這些檔名。

### 步驟 1：ghost-story（約 30 分鐘）✅ 2026-10-20 完成

> [!done] 做了什麼（skills main 5f93fa3）
> - `post` 有品牌檔、沒給 `--number` 時，開頭只有標題和 AI 標示。
> - attach 模式從「鉤子」開始：預設挑故事前三分之一裡分數最高的一句（規矩、叫名字、回頭沒人）；如果前一句也很強（例如「我回頭」回應的那句問話）就從前一句開始。`--hook <句子>` 或 `--hook <段號>` 可以指定，`--hook 1` 等於舊行為。
> - `--dest <故事資料夾>` 寫 `posts/threads/hook.txt`、`attachment.txt`。
> - 第 2 首：鉤子第一句是那條規矩，406 字；附件 844 字；沒有編號和 [經驗]。第 1 首自動挑到阿嬤那句問話。另外三篇自動挑到鋪陳，要手動給 `--hook`（SKILL.md 有寫）。
> - 舊行為不變：帶 `--number` 的 chain、ig 和 `--hook 1` 的 attach 輸出逐字相同。


- `post` 預設不加編號（不帶 `--number` 時開頭只有標題和 AI 標示）。
- 加 `--hook` 選項：指定哪一句或哪一段放在鉤子開頭；預設自動挑「第一個異常」那句，不從鋪陳開始。
- 加 `--dest <故事資料夾>`：直接寫 `posts/threads/hook.txt` 和 `attachment.txt`。
- `[經驗]` 自動換掉（已有）。
- **測試**：第 2 首產出鉤子，第一句是那條規矩；字數在限制內。
- **完成標準**：第 2 首的 Threads 兩個檔案就位、不帶編號。

### 步驟 2：ghost-comic（約 1.5 到 2 小時）✅ 2026-10-20 完成

> [!done] 做了什麼（skills main 2bd03d9）
> - `export --dest <故事資料夾>` 寫 `posts/ig/`（保留 ghost-pack 的 caption.txt）、`posts/threads/image.jpg`；加 `--pinterest` 寫 `posts/pinterest/`（封面 + 揭露頁之前的每一頁，1000×1500 紙色底）。有 `--dest` 時不寫任何文案。
> - Threads 配圖：`--threads-panel`，或自動挑揭露前嵌字最像鉤子、畫面寬的格；跳過封面、標題格和手機或螢幕格（那種格不看嵌字只是一支空白手機）。配圖保留格子原本的比例，寬 1080。
> - 揭露格擋下：封面、配圖、預告用到揭露格或之後的格會直接拒絕；Pinterest 停在揭露頁之前。
> - `reel teaser --dest` 寫 `reels/teaser_A/`（接著 B、C…，`--slot` 指定），不寫文案。
> - 測試：〈阿嬤〉重出的 12 張輪播、Threads 配圖、Pinterest 7 頁和現在的檔案逐像素一致；Pinterest 封面版面相同、邊界差幾像素（當初手工縮的）。第 2 首輪播和原本一致，Pinterest 4 張，配圖自動挑 p17。單元測試 44 個全過（順便修好原本就壞的 export 測試）。
> - 給 ghost-pack：Pinterest 封面就是蓋好號的 01.jpg 用 `pin_fit`（邊界 35）縮到 1000×1500，所以蓋號只要蓋 01.jpg，再重做 Pinterest 封面。


- `export` 預設不蓋編號（封面字條只有「鬼唱詩」），加 `--dest` 直接寫 `posts/ig/`。
- 新增 `export --pinterest`：封面加揭露前的每一頁，放到 1000×1500 紙色底，寫 `posts/pinterest/`；標題由 ghost-pack 寫，這裡不寫文字。
- 新增 Threads 配圖：`export` 時一起挑一格（指定 `--threads-panel`，或自動挑揭露前最有張力的格），寫 `posts/threads/image.jpg`。
- `reel teaser` 加 `--dest` 寫 `reels/teaser_A/`。
- 讀 `board.json` 的揭露格，自動擋掉用到揭露格的封面、配圖、預告、Pinterest 頁。
- **測試**：〈阿嬤〉的輪播重出後和目前逐像素一致（除了封面字條的編號）；第 2 首產出 Pinterest 4 張和配圖。
- **完成標準**：第 2 首的輪播、Pinterest 圖、配圖都在約定位置、不帶編號。

### 步驟 3：ghost-pack（新，約 1 到 1.5 小時）

- 新 skill，三件事：
  1. **拿號**：`ledger.py reserve "<標題>" --kind comic --folder stories/<短名>`（同標題再要一次拿回同一號）。
  2. **蓋號**：在 `posts/ig/01.jpg` 和 `posts/pinterest/00_cover.jpg` 的下緣字條蓋「鬼唱詩｜第 N 首」，字型和位置跟 ghost-comic 的封面一樣；原圖先備份成 `01_nonumber.jpg`，可以重蓋。
  3. **寫文案**：全部從 brand.json 的範本產生：IG 文案、Threads 鉤子第一行補「第 N 首｜標題」、Pinterest 每張的標題和說明、`cross_caption.txt`（YouTube 標題「第 N 首｜標題」和說明、TikTok、FB），IG 連結留 `{ig_link}`；建或更新 `README.md`。
- 可以重跑：換編號（例如插隊）就重跑一次，只動文案和兩張封面。
- **測試**：第 2 首包裝後，ghost-post 的 `check_story.py` 全部通過。
- **完成標準**：第 2 首 `posts/` 底下都是可以直接發的檔案。

### 步驟 4：ghost-post（約 30 分鐘）

- `check_story.py` 照約定的檔名檢查，並檢查 01.jpg 和 Pinterest 封面已蓋號（看 `_nonumber` 備份是否存在）。
- 發 IG 後把 `cross_caption.txt` 和 Threads 第 3 則的 `{ig_link}` 換成連結（發文動作，不算準備）。
- **測試**：用第 2 首實際發文；YouTube、TikTok、FB 粉專第一次發，發完把實際步驟寫回 `references/platforms.md`。
- **完成標準**：第 2 首六個平台都發出、帳簿和 README 有連結。

### 步驟 5：ghost-reel（新，約半天到一天，可以在第 2 首發出後做）

- 從原型（`ghost-comic-reel-full` 分支、`brand/templates/reel_engine/`）整理成 skill。
- 分鏡從 Python 檔改成每本漫畫一份 `reels/shots.json`；Claude 先從 `board.json` 自動產生初稿（每格的運鏡、特效、音效、字幕、鉤子、揭露），擁有者或 Claude 再手改。
- 自動挑要做動態的格（揭露、結尾、開場、張力格），自動裁 9:16、寫 H3 描述、排隊生成，結果放 `reels/clips/`。
- 片名卡不帶編號；V1 漫動畫和 V3 電影感兩個版本保留，V2 說書快剪先收起來。
- 配樂和音效庫（`brand/music`、`brand/sfx`）的產生流程寫成一次性的設定步驟。
- 品管（`qc.py`）每支都跑。
- **測試**：用 json 分鏡重出第 2 首的 V3，和現在的版本一致；再拿第 1 首〈阿嬤〉做第二本，看自動初稿分鏡要改多少。
- **完成標準**：給一個漫畫資料夾，一個指令做出 Reel full V3 加品管報告。

### 順序和時間

| 順序 | 步驟 | 為什麼這個順序 | 估時 |
|---|---|---|---|
| 1 | 步驟 0 約定和清理 | 後面每一步都靠它 | 30 分鐘 |
| 2 | 步驟 1 ghost-story | 第 2 首缺 Threads 鉤子 | 30 分鐘 |
| 3 | 步驟 2 ghost-comic | 第 2 首缺 Pinterest 圖和配圖 | 1.5 到 2 小時 |
| 4 | 步驟 3 ghost-pack | 第 2 首要拿號、蓋號、文案 | 1 到 1.5 小時 |
| 5 | 步驟 4 ghost-post | 第 2 首實際發文 | 30 分鐘加發文 |
| 6 | 步驟 5 ghost-reel | 第 2 首的 V3 已經用原型做好，不卡發文 | 半天到一天 |

步驟 0 到 4 約 4 到 5 小時，做完第 2 首就能照新流程發。

## 4. 待擁有者決定

- [x] 分工：五個 skill，製作不帶號、ghost-pack 包裝、ghost-post 只檢查和發文（2026-10-20）。
- [x] 影片畫面裡不放編號（2026-10-20，同意計畫）。
- [x] 刪掉 social-post 分支和 `skills-post` worktree（2026-10-20 完成）。
- [x] 每一步改完先給擁有者看再合併（2026-10-20，步驟 1、2 都照做）。

## 歷程

- 2026-10-20：步驟 1 ghost-story、步驟 2 ghost-comic 完成並合併。
- 2026-10-20：步驟 0 約定和清理完成。
- 2026-10-20：改寫成三部分：分工和順序、共用的資料夾約定、五個 skill 的逐步實作計畫（步驟 0 到 5）。
- 2026-10-20：擁有者定 ghost-post 只負責 check 平台、素材和 post；拿號、蓋號、文案移到新的 ghost-pack。
- 2026-10-20：第一版。擁有者問素材產生順序和編號綁住 skill 的問題；改成製作不帶號、發文前才蓋號。
