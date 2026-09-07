---
updated: 2026-09-07
tags: [runbook, claude-code, multi-agent, process]
---
# Agent team delivery — runbook for a brand-new project

Reference project: [[elevator inc]] — one full round on 2026-09-07
(#135 verified & closed, #136 dispatched → verified → landed as `3c933ce`),
which is where the order of these steps was paid for.

> [!important] Where the authority lives
> The orchestrator-facing version is **`~/.claude/skills/agent-team-delivery/SKILL.md` §十二**;
> the per-repo contract is the repo's **`TEAM.md`**; the mechanics are **`tools/orch.sh`**.
> This note is the **owner's** side — what *you* do at each step and how you know
> the step is done. If it contradicts the skill, the skill wins. Context and index
> for the whole approach: [[agent team delivery]].

## The one-line version

**numbers → contract → mechanics → one guard you have seen go red → only then an
orchestrator → one peer through a full loop → only then parallel.**

Each step has a "done when". Do not move on before it holds.

## Phase 0 — one ordinary session, no team yet

Goal of this phase is a single thing: **make "verifiable" exist.**

0. **Repo skeleton.** `git init`, `gh repo create`, first commit, `.gitignore`.
1. **Design doc with numbers.** Every mechanic gets its start value, cap, formula,
   threshold written next to it (`docs/design.md` or the vault).
   *Done when:* the harness `SPEC` constants can be copied line by line from it.
   A mechanic you cannot put a number on is not dispatchable yet.
2. **`/agent-team-delivery init <repo path>`.** Drops in `TEAM.md`, `tools/orch.sh`,
   `tools/serve.py`, `tests/harness.js`, `tests/index.html` (never overwrites, never commits).
   Then **you fill the ownership table** — even if you are the only person (write
   "all BE for now"); every file gets a row.
   *Done when:* `bash tools/orch.sh wt smoke HEAD && bash tools/orch.sh rm smoke` runs,
   and the table has no blanks. Sub-agents **do not load the skill** — anything a peer
   must obey has to live in the repo.
3. **First guard = the product's verb.** `tests/acceptance.js` group 0: constants vs
   product settings; group 1: "the verb stopped → red" (are elevators delivering,
   are cards being played, are orders closing). Loose threshold, catches collapse.
   Then **make it go red once**: `orch falsify` → `orch serve` → open
   `tests/index.html?json=1` and read what it printed → `orch restore` → `orch clean`.
   *Done when:* harness green **and you have personally seen it red.**
4. **Commit.** End of Phase 0. You now have: numbers, contract, mechanics, one guard
   that has been red. **No harness → no dispatch**: there would be nothing to verify against.

## Phase 1 — open the orchestrator, one peer, one full loop

5. **Open the orchestrator session** (title `<project> orchestrator`). Its cwd may be
   the main checkout, but it only *reads* there (`git fetch`, `gh`, opening worktrees);
   all edits happen in `_wt/`. Opening message (this is the brief for the brief):

   > 你是這個專案的 orchestrator,照 agent-team-delivery skill 和 repo 的 TEAM.md 做。
   > 目標:__。優先序:__。
   > 你開 issue、寫 brief、派子 agent、獨立驗證、land。你不寫產品程式碼。
   > 需要 owner 裁決的事在 issue 留言標「要 owner 裁決」,我會去 issue 上回。
   > 先做一張 issue、走完一次派 → 交付 → 驗 → land,再跟我報告。

6. **It opens the first issue.** What you check: ruling + reason, constraints + what
   breaks if violated, explicit non-goals, **the falsification case**, the three
   authorization columns.
   *Done when:* the falsification case says where a wrong implementation gets bitten.
   If it can't, the orchestrator doesn't understand the issue yet — send it back to
   the orchestrator, not to a peer.
7. **It dispatches one sub-agent, verifies, lands.** Your only job this round: answer
   rulings on the issue. Do not talk to the peer, do not look inside `_wt/`, do not
   edit in the main checkout.
   *Done when:* the land report has the five-line handover, harness numbers before and
   after, one falsification, and the merge SHA with its two parents. Anything missing →
   ask for it.

## Phase 2 — parallel

8. Two independent lines → two sub-agents. If both touch the same data table, the
   brief requires each to list its new ids first (id collisions are green on both sides).
9. Open a **persistent** session (a long-lived "FE"/"BE") only when you want to watch
   or steer mid-way, and only with all three preconditions from SKILL.md §十一:
   its own worktree with cwd inside it; a brief complete enough to cold-start; the
   orchestrator has recorded its existence on the issue.

## Ongoing

- After every round the orchestrator asks once: **did an instrument lie to me this
  round?** Yes → failure catalogue in the *global* skill, not `TEAM.md`.
- Ownership or conventions changed → `TEAM.md`, orchestrator ruling, reason in the
  commit message.
- You catch yourself talking to a peer, or editing in the main checkout → the process
  leaked; go back to `TEAM.md` and add the rule.

## Things that bit us on the first run (2026-09-07)

- A persistent backend session whose cwd was the **main checkout** ran a
  `git checkout <tree> -- .` there and silently changed the owner's working tree.
  Hence "no session's cwd is the main checkout" in `TEAM.md`.
- The browser pane is **shared** across agents: the BE sub-agent navigated the
  orchestrator's tab to its own server. Orchestrator now opens its own tab and prints
  `location.href` with every reading.
- The peer falsified the *orchestrator's* harness and found a vacuous "all fields
  consistent" check (`undefined === undefined`). It reported instead of editing
  `tests/` — exactly the intended division of labour.
