---
title: 鬼唱詩｜素材流程與 skill 分工
tags:
  - project
  - ghost-story
  - pipeline
status: plan-waiting-for-owner
created: 2026-10-20
updated: 2026-10-20
---

# 鬼唱詩｜素材流程與 skill 分工

> [!info] 一句話
> 三段：**製作**（不帶編號，可以先做、先存、隨時換順序）→ **包裝**（排定日期才拿號，蓋編號、寫各平台文案，只動文案和兩張封面，幾秒鐘，不用重出影片）→ **發文**（只檢查平台、檢查素材、發、記連結，不準備任何素材）。每個 skill 只做一件事：寫故事、畫漫畫、做影片、包裝、發文。擁有者 2026-10-20：ghost-post 只負責 check 平台、素材和 post。發文筆記在 [[ghost story posting]]，內容分配在 [[ghost story content plan]]。

## 1. 問題

編號（「第 N 首」）是發文時才決定的：故事可能插隊（爆款規則）、可能延後。如果輪播封面、Reel 片名、Threads 開頭在製作時就寫上編號，製作就被發文排程綁住，順序一改就要重出（Reel full 一支要 11 分鐘）。

## 2. 做法：兩段式

```
製作（不帶編號，可以提早做好放庫存）
  ghost-story  ──► story.md、Threads 鉤子與附件（開頭只有標題）
       │
  ghost-comic  ──► 漫畫頁 ──► 輪播（封面只有「鬼唱詩」）、Pinterest 圖、預告 Reel A/B
       │
  ghost-reel   ──► Reel full V3（片名只有標題）、動態片段、每週合集
                    （用品牌的配樂和音效庫）

包裝（排定日期時才拿號）
  ghost-pack   ──► 拿號 → 蓋編號（輪播第 1 張、Pinterest 封面字條）→ 寫各平台文案
                   → posts/ 底下全部是「可以直接發」的檔案

發文（不準備任何素材）
  ghost-post   ──► 1 檢查平台 → 2 檢查素材（缺了就停，說該用哪個 skill 補）
                   → 3 預覽、同意 → 4 依序發 → 5 記連結
```

**編號放在哪裡**：

| 地方 | 有沒有編號 | 誰加 |
|---|---|---|
| 各平台文案、YouTube 標題、Threads 第一行、Pinterest 標題 | 有 | ghost-pack |
| 輪播第 1 張下緣字條「鬼唱詩｜第 N 首」、Pinterest 封面字條 | 有 | ghost-pack 蓋上（只改一張圖，PIL 幾秒） |
| Reel full、預告 Reel 的畫面 | **沒有**，片名卡只寫標題 | 不加：影片會被轉到多個平台、順序也可能變，編號放在文案就夠 |
| 漫畫頁、結尾卡 | 沒有 | — |

## 3. 每個 skill 負責什麼

| Skill | 狀態 | 輸入 | 產出（不帶編號） | 要改的 |
|---|---|---|---|---|
| **ghost-story** | 已有 | 題材、口味 | `story.md`；`post` 產生 Threads 鉤子（≤500）和全文附件 | 加「鉤子用哪一段」的選項（第一句就要有異常）；預設不加編號，編號留給 ghost-post |
| **ghost-comic** | 已有 | `story.md` | 漫畫頁；`export` 輪播；`reel teaser` 預告 A/B | `export` 預設不蓋編號；加 `export --pinterest`（1000×1500 封面加揭露前的頁、`pins.txt`）；Threads 配圖改成 export 一起挑一格不雷的 |
| **ghost-reel**（新） | 原型在 csiesheep/skills 的 `ghost-comic-reel-full` 分支 | 漫畫資料夾、品牌的配樂和音效庫 | Reel full V3（和 V1）、H3 動態片段、每週 YouTube 合集 | 從原型整理成 skill：分鏡改成每本一份 json、Claude 先自動產生初稿分鏡、自動挑格做 H3 動態、片名卡不帶編號 |
| **ghost-pack**（新，小） | 還沒有 | 故事資料夾（不帶號的素材）、帳簿 | 帳簿拿號、蓋好編號的輪播封面和 Pinterest 封面、各平台文案（IG、Threads 第一行、YouTube 標題和說明、TikTok、FB、Pinterest 標題），全部放 `posts/` | 新建：`ledger.py reserve` 搬過來，加 `stamp` |
| **ghost-post** | 剛建（`ghost-post` 分支） | `posts/` 裡可以直接發的檔案 | 貼文、帳簿的發文紀錄和連結 | 拿掉拿號和「缺什麼就做」那段；素材缺了就停下並說該用哪個 skill 補 |
| **ghost-reply** | 已有 | — | 回覆別人的貼文 | 不用改 |
| **social-post** | 本機分支，未合併 | — | — | 已被 ghost-post 取代，建議刪掉分支 |

**要不要再多開 skill**：不用。其他素材都掛在上面四個 skill 底下：

| 素材 | 歸誰 |
|---|---|
| Threads 鉤子、附件 | ghost-story `post` |
| Threads 配圖 | ghost-comic `export`（挑一格不雷的） |
| 輪播 | ghost-comic `export` |
| Pinterest 圖 | ghost-comic `export --pinterest`（要加） |
| 預告 Reel A/B | ghost-comic `reel teaser` |
| Reel full、動態片段、每週合集 | ghost-reel（要建） |
| 配樂、音效庫 | ghost-reel 的一次性設定，存在 `brand/music`、`brand/sfx` |
| 各平台文案、拿號、蓋編號 | ghost-pack（要建） |

新的有兩個：ghost-reel（Reel full 牽涉分鏡、H3、配樂、音效、渲染，份量夠大，塞進 ghost-comic 會太肥）和 ghost-pack（很小，但它是「排程」的事，不屬於任何製作 skill，也不屬於只發文的 ghost-post）。

## 4. 一首故事的順序

| 階段 | 什麼時候 | Skill | 做什麼 | 擁有者 |
|---|---|---|---|---|
| 寫 | D-14 以前 | ghost-story | 寫 3 版挑 1 | 挑一版 |
| 畫 | D-10 | ghost-comic | 畫漫畫 | 選角色、場景，看全本 |
| 做素材 | 漫畫畫完當天 | ghost-comic `export`、`reel teaser`、`export --pinterest`；ghost-story `post` | 輪播、預告、Pinterest 圖、Threads 鉤子和附件 | — |
| 做影片 | 同上 | ghost-reel | Reel full V3 | 看一次（開聲音） |
| 進庫存 | | | 素材都在故事資料夾，沒有編號 | — |
| 包裝 | 決定哪天發時 | ghost-pack | 拿號、蓋號、寫各平台文案 | — |
| 發文前 | D-1 | ghost-post | 檢查平台、檢查素材、傳預覽 | 看預覽、每則說可以 |
| 發 | D | ghost-post | 依序發六個平台、記帳簿 | 回留言 |

## 5. 第 2 首〈半夜叫我全名的人〉照這個流程

素材都已做好或快做好，差的是「蓋號」和三樣還沒做的：

| 素材 | 現況 | 怎麼補 |
|---|---|---|
| story.md | ✅ 827 字 | — |
| 漫畫、輪播 | ✅ 8 張（封面沒有編號，正確） | ghost-pack 蓋「第 2 首」 |
| Reel full V3 | ✅ 82 秒（片名卡寫「鬼唱詩」，不用重出） | — |
| Threads 鉤子、附件、配圖 | ❌ | ghost-story `post`，鉤子第一句用那條規矩；配圖用 p13 帳篷或 p17 眼睛 |
| Pinterest 圖 | ❌ | 封面加第 1 到 3 頁（揭露在第 4 頁） |
| 預告 A、B | ❌（選做） | `reel teaser` |
| 各平台文案 | ❌ | ghost-pack 產生 |

## 6. 要做的改動（照順序）

1. 新建 ghost-pack（拿號、蓋兩張封面、產生全部文案）；ghost-post 拿掉拿號和製作那段，`check_story.py` 只檢查可以直接發的檔案。約 1 到 1.5 小時。
2. ghost-comic：`export` 預設不蓋編號、加 `--pinterest`、一起挑 Threads 配圖。約 1 到 2 小時。
3. ghost-story：`post` 預設不加編號、加鉤子段落選項。約 30 分鐘。
4. ghost-reel：從原型整理成 skill（分鏡 json、自動初稿分鏡、自動 H3）。約半天到一天，可以晚一點，先用原型出第 2 首。
5. 刪掉 social-post 分支（已被 ghost-post 取代）。

## 7. 待擁有者決定

- [ ] 影片畫面裡不放編號、只放在文案。
- [ ] 新建 ghost-reel 和 ghost-pack 兩個 skill（其他素材歸現有 skill）。
- [x] ghost-post 只負責檢查平台、檢查素材、發文（擁有者 2026-10-20）。
- [ ] 改動的順序：先做 1 到 3，讓第 2 首照新流程發；ghost-reel 之後整理。
- [ ] social-post 分支刪掉。

## 歷程

- 2026-10-20：擁有者定 ghost-post 只負責 check 平台、素材和 post；拿號、蓋號、文案移到新的 ghost-pack。
- 2026-10-20：第一版。擁有者問素材產生順序和編號綁住 skill 的問題；改成兩段式（製作不帶號、發文才蓋號），新 skill 只有 ghost-reel。
