---
updated: 2026-09-07
tags: [runbook, claude-code, multi-agent, process, elevator-inc]
---
# elevator inc — 讓現行專案對齊 agent team delivery(給 orchestrator 讀)

> [!important] 這份是給 orchestrator session 的 brief
> 你是 `C:\Users\sheep\code\elevator_inc` 的 **orchestrator**。規矩在 `~/.claude/skills/agent-team-delivery/SKILL.md`
> (讀 §一、§二、§四、§七、§十一,失敗目錄按索引跳)和 repo 的 `TEAM.md`。
> 這份 note 只講**既有專案怎麼切換**——跟新專案不同,問題不是缺東西,是**殘留的東西沒有名字**。
> 順序是:**收現場 → 補判準 → issue 分流 → 常駐 session 退場 → 一張 issue 走完整圈 → 才平行。**
> 每一步有「做完的判準」和「誰做」。不是你做的,列出來給 owner,不要替他做。
> 通用版在 [[agent team delivery runbook]];本文跟 skill 衝突時 skill 贏。

## 你先讀什麼

1. `SKILL.md` §一、§二、§四、§七、§十一(§五只掃索引)
2. repo 的 `TEAM.md`(2026-09-07 放進去,**所有權表還是空的**——見第二步)
3. `gh issue list --limit 200`、`git fetch && git log origin/main --oneline -30`、`git worktree list`
4. 這份 note 的「現場快照」,然後**自己重量一次**——快照是 2026-09-07 的讀數,不是現況(`[report-is-a-reading]`)

## 現場快照(2026-09-07,orchestrator 的讀數,要重驗)

| 項目 | 當時的狀態 | 危險 |
|---|---|---|
| `origin/main` | `7290d2c`(#137 落地);前一個 `3c933ce` 是 #136 的 merge | — |
| 主 checkout `elevator_inc` | HEAD `4ecc21d`,**index 卻是 `3c933ce` 的整棵樹**(backend session 在 08:52 checkout 進去的);`TEAM.md`、`tools/orch.sh` 未追蹤;`.gitignore` 有未 stage 的兩行 | 任何人在這裡 commit 會吃進整棵樹 |
| 常駐 session | 「Elevator Inc backend」(cwd = 主 checkout,worktree `elevator_inc-be-block` / `be/starve-guard`,做 #140 做到一半,content.js 未提交 + `__probe140*.js`)、「Elevator Inc frontend」(cwd `elevator_inc-fe`) | 沒人知道它們在等什麼 |
| `stash@{0}` | `WIP on be/starve-guard: 48ea4ad` — backend session 的 | 不是你的,不動 |
| worktree | 約 60 個,分散在 `_wt/`、`elevator_inc-*`、oops_inc 的 scratchpad 路徑下 | 撞名、看不懂 |
| open issue | 53 張;#97–#134 帶子 issue 多數已由範圍 commit land(`ccb2611`、`17600ff`、`a8c8cb9`、`f8bee56`),但**每張可能有沒做完的角落**(例:第 13 組列屋頂帶五種乘客沒圖);#140 有 owner 裁決但沒分支沒留言;#36 / #67 / #87 是分析型 | 分不出活的死的 |
| harness | `tests/index.html` 在 `3c933ce` 上 **75 pass / 0 fail / 2 todo**;第 22 組是 #136 的驗收;**沒有 `?json=1`** | 讀結果要寫 JS |

## 第一步:收現場(owner 做,你列清單)

你**不動**這些,只產出一份清單給 owner,每項一行、附指令:

- 主 checkout:建議 `git merge --ff-only origin/main`,然後 `git add TEAM.md tools/orch.sh .gitignore` 單獨 commit。
- 兩個常駐 session:各交五行 handover 到它負責的 issue、`git push origin HEAD:<分支>`、然後結束 session。**做到一半的東西變分支 + 留言,不是變 stash。**
- 舊 worktree:逐個問「有未提交的東西嗎?」有 → 推分支;沒有 → `git worktree remove`。你可以先 `git worktree list` + 逐個 `git -C <dir> status --porcelain | wc -l` 產出表格(唯讀),讓 owner 決定。

**判準**(owner 回報後你重驗):`git worktree list` 只剩認得的;`git -C elevator_inc status` 乾淨;沒有 session 在等不知道的確認。**這一步沒過,不要進第四步。**

## 第二步:補 Phase 0 缺的(你做,除了填表)

| Phase 0 判準 | elevator_inc | 動作 | 誰 |
|---|---|---|---|
| 設計文件有數字 | ✓ obsidian 那份,`SPEC` 從它抄 | — | — |
| 三態 harness、通過印數字 | ✓ 75 條 | `tests/index.html` 加 `?json=1`(樣板在 skill 的 `references/starter/tests/index.html`,6 行) | 你(`tests/` 歸你),在 `orch wt` 開的工作樹做,自己的 commit |
| 產品動詞的 guard | ✓ 第 21 組「電梯有沒有在送人」 | — | — |
| `TEAM.md` 所有權表 | 空 | 把下面的推定表交給 owner 確認 | **owner 填**;你只提案 |
| `orch.sh` smoke | ✓ `wt smoke HEAD && rm smoke` 過 | — | — |

推定的所有權表(orchestrator 從 issue 歷史推的,標明是推定;owner 改了再進 `TEAM.md`):

| 檔案 | 主人 |
|---|---|
| `js/content.js`、`js/sim.js`、`js/state.js` | BE |
| `js/render.js`、`js/ui.js`、`js/main.js`、`js/theme.js`、`js/sky.js`、`js/roof.js`、`js/interior.js`、`js/digits.js`、`css/`、`game.html`、`index.html`、`js/landing.js` | FE |
| `js/sprites.js`、`design/*Sprites*`、`tools/art*.py` | artist |
| `js/i18n.js`、`js/i18n-content.js`、`README.md` | writer |
| `tests/`、`tools/orch.sh`、`tools/serve.py`、`TEAM.md` | orchestrator |

**判準**:`TEAM.md` 表無空格且已 commit;`orch serve` 印的 harness URL 開出來是 JSON。

## 第三步:issue 分流(你做,唯讀,然後才動)

53 張逐一問兩個問題,先產出**三堆**給 owner 看,**看過才動**:

1. **land 了嗎?** `git log origin/main --oneline --grep '#NNN'` + harness 對應那條綠不綠 + issue 本文列的交付物都在不在。
   → 全在:留言「orchestrator 驗證於 `<SHA>`:<數字>」,關單(一張一張,**不要批次**——#135 那種「land 了但第 13 組還列著五張圖」要抓出來)。
   → 部分在:留言「已 land __,還缺 __」,**留開**,歸下一堆。
2. **沒 land 的,寫得出證偽案例嗎?**
   → 寫得出:補「orchestrator 裁決(#NNN)/ 證偽案例 / 三欄授權」進 issue → **可派**。
   → 寫不出:留言標「要 owner 裁決:__」或「待設計:__」→ **等 owner**,不派。

已知的個案:#140 有 owner 裁決(選 2)+ 三條約束,但沒分支沒留言 → 歸「可派」,而且 brief 幾乎現成;#36 / #67 / #87 是分析型 → 問 owner 要不要留。

**判準**:open issue 只剩兩種——可派的(有證偽案例)和等 owner 的(標了要什麼)。

## 第四步:常駐 session 退場(owner 做,你接手)

第一步收完之後,自然就退場了。從這一步起:**每張 issue 一個子 agent + `orch wt`**。真的需要人盯的線(art 要看接觸表)才照 §十一 的三個前提開常駐 session,而且你要在 issue 留言記下它的 session 名稱 / worktree / 派工時間。

## 第五步:第一張 issue 走完整圈(你做)

**只做一張**。候選:#140(裁決在、約束在、缺重派)或屋頂帶五張圖(#135 的 brief 當樣板,五條判準與侵蝕數字都在 #135 交付裡)。

流程照 skill:驗收先寫(`tests/`,你的 commit)→ brief 五塊 + 三欄 → 子 agent → 抽離 worktree 驗 → `orch falsify` 紅一次 → A/B → `orch clean` → merge 驗過的 SHA → 檢查父節點 → push → issue 留言 → 關。

**判準**:land 報告有五行 handover、harness 前後數字、一次證偽、merge SHA 與兩個父節點。owner 這一輪只回裁決。

## 第六步:才平行

兩條線互不相依才開第二個子 agent;動同一張資料表的先列 id。

## 硬規則(既有專案特別容易破的)

- **別人的 worktree 一個都不動**(§7.6)。收現場是叫那個 session 自己交,不是你替它 commit / stash / reset。
- **不批次關 issue。** 每張要對到 SHA 和數字。
- **不回頭改舊 issue 的 brief。** 已 land 的關;沒 land 的補三樣就夠。
- **裁決一律寫主詞。** `owner 裁決(#NN)` 只能引原話;你的推論寫 `orchestrator 裁決(#NN)`。
- **你不寫產品程式碼。** `tests/`、`tools/orch.sh`、`TEAM.md` 是你的;`js/` 不是。
- **每個結果讀數帶 `location.href`**——瀏覽器 pane 是共用的(`[shared-browser-tab]`)。

## 回報格式(每一步結束都用)

```
步驟:__
做了:__(附 SHA / issue 編號 / 數字)
沒做、等 owner 的:__(每項一行、附指令)
這一步的判準過了嗎:是 / 否(差什麼)
```
