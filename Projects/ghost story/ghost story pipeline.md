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
> 製作和發文分開。製作出來的素材**都不帶編號**，可以先做、先存、隨時換順序；**編號在發文前最後一步才蓋上去**，只動文案和兩張封面，幾秒鐘完成，不用重出影片。每個 skill 只做一件事：寫故事、畫漫畫、做影片、發文。發文筆記在 [[ghost story posting]]，內容分配在 [[ghost story content plan]]。

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

發文（排定日期時才拿號）
  ghost-post   ──► 1 檢查平台 → 2 拿號 → 3 蓋編號（文案、封面字條）→ 4 檢查素材
                   → 5 預覽、同意 → 6 依序發 → 7 記帳簿
```

**編號放在哪裡**：

| 地方 | 有沒有編號 | 誰加 |
|---|---|---|
| 各平台文案、YouTube 標題、Threads 第一行、Pinterest 標題 | 有 | ghost-post 發文前產生 |
| 輪播第 1 張下緣字條「鬼唱詩｜第 N 首」、Pinterest 封面字條 | 有 | ghost-post 蓋上（只改一張圖，PIL 幾秒） |
| Reel full、預告 Reel 的畫面 | **沒有**，片名卡只寫標題 | 不加：影片會被轉到多個平台、順序也可能變，編號放在文案就夠 |
| 漫畫頁、結尾卡 | 沒有 | — |

## 3. 每個 skill 負責什麼

| Skill | 狀態 | 輸入 | 產出（不帶編號） | 要改的 |
|---|---|---|---|---|
| **ghost-story** | 已有 | 題材、口味 | `story.md`；`post` 產生 Threads 鉤子（≤500）和全文附件 | 加「鉤子用哪一段」的選項（第一句就要有異常）；預設不加編號，編號留給 ghost-post |
| **ghost-comic** | 已有 | `story.md` | 漫畫頁；`export` 輪播；`reel teaser` 預告 A/B | `export` 預設不蓋編號；加 `export --pinterest`（1000×1500 封面加揭露前的頁、`pins.txt`）；Threads 配圖改成 export 一起挑一格不雷的 |
| **ghost-reel**（新） | 原型在 csiesheep/skills 的 `ghost-comic-reel-full` 分支 | 漫畫資料夾、品牌的配樂和音效庫 | Reel full V3（和 V1）、H3 動態片段、每週 YouTube 合集 | 從原型整理成 skill：分鏡改成每本一份 json、Claude 先自動產生初稿分鏡、自動挑格做 H3 動態、片名卡不帶編號 |
| **ghost-post** | 剛建（`ghost-post` 分支） | 故事資料夾 | 各平台文案、蓋好編號的封面、貼文、帳簿紀錄 | 加 `stamp` 指令：拿號後產生全部文案、在輪播第 1 張和 Pinterest 封面蓋編號；`check_story.py` 改成檢查「未蓋號的素材」和「蓋好號的發文檔」兩階段 |
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
| 各平台文案、蓋編號 | ghost-post `stamp`（要加） |

只有 ghost-reel 是新的，因為 Reel full 牽涉分鏡、H3、配樂、音效、渲染，份量夠大，塞進 ghost-comic 會讓它太肥。

## 4. 一首故事的順序

| 階段 | 什麼時候 | Skill | 做什麼 | 擁有者 |
|---|---|---|---|---|
| 寫 | D-14 以前 | ghost-story | 寫 3 版挑 1 | 挑一版 |
| 畫 | D-10 | ghost-comic | 畫漫畫 | 選角色、場景，看全本 |
| 做素材 | 漫畫畫完當天 | ghost-comic `export`、`reel teaser`、`export --pinterest`；ghost-story `post` | 輪播、預告、Pinterest 圖、Threads 鉤子和附件 | — |
| 做影片 | 同上 | ghost-reel | Reel full V3 | 看一次（開聲音） |
| 進庫存 | | | 素材都在故事資料夾，沒有編號 | — |
| 排日期 | 決定哪天發 | ghost-post | 檢查平台、拿號、`stamp` 蓋號、檢查素材 | 看預覽、每則說可以 |
| 發 | D | ghost-post | 依序發六個平台、記帳簿 | 回留言 |

## 5. 第 2 首〈半夜叫我全名的人〉照這個流程

素材都已做好或快做好，差的是「蓋號」和三樣還沒做的：

| 素材 | 現況 | 怎麼補 |
|---|---|---|
| story.md | ✅ 827 字 | — |
| 漫畫、輪播 | ✅ 8 張（封面沒有編號，正確） | 發文前 `stamp` 蓋「第 2 首」 |
| Reel full V3 | ✅ 82 秒（片名卡寫「鬼唱詩」，不用重出） | — |
| Threads 鉤子、附件、配圖 | ❌ | ghost-story `post`，鉤子第一句用那條規矩；配圖用 p13 帳篷或 p17 眼睛 |
| Pinterest 圖 | ❌ | 封面加第 1 到 3 頁（揭露在第 4 頁） |
| 預告 A、B | ❌（選做） | `reel teaser` |
| 各平台文案 | ❌ | 發文前 `stamp` 產生 |

## 6. 要做的改動（照順序）

1. ghost-post 加 `stamp`（拿號後產生全部文案、蓋兩張封面）和兩階段 `check_story.py`。約 1 小時。
2. ghost-comic：`export` 預設不蓋編號、加 `--pinterest`、一起挑 Threads 配圖。約 1 到 2 小時。
3. ghost-story：`post` 預設不加編號、加鉤子段落選項。約 30 分鐘。
4. ghost-reel：從原型整理成 skill（分鏡 json、自動初稿分鏡、自動 H3）。約半天到一天，可以晚一點，先用原型出第 2 首。
5. 刪掉 social-post 分支（已被 ghost-post 取代）。

## 7. 待擁有者決定

- [ ] 影片畫面裡不放編號、只放在文案。
- [ ] 新建 ghost-reel skill（其他素材歸現有 skill，不再開新的）。
- [ ] 改動的順序：先做 1 到 3，讓第 2 首照新流程發；ghost-reel 之後整理。
- [ ] social-post 分支刪掉。

## 歷程

- 2026-10-20：第一版。擁有者問素材產生順序和編號綁住 skill 的問題；改成兩段式（製作不帶號、發文才蓋號），新 skill 只有 ghost-reel。
