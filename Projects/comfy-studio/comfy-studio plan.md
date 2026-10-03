---
tags: [project, web, comfyui, local-ai]
status: phase-1
started: 2026-10-03
slug: comfy-studio
repo: C:\Users\sheep\code\comfy-studio
---
# Comfy Studio - plan

> [!info] Phase 0 (2026-10-03). The repo exists with image-to-video working, a hub placeholder and a
> green harness. Numbers and contracts live in the repo: `docs/DESIGN.md` (the harness copies from it).
> This note holds the plan, the phases and the decisions.

## Overview

Pages on the PC, opened from the iPhone over Tailscale, that make images and videos on the local
ComfyUI. A hub page links to four pages; each page lets you **pick a workflow** for that mode and
has **Qwen prompt help**.

| Page | URL (tailnet) |
|---|---|
| Hub | `https://desktop-r2u3mdm.tail528148.ts.net/studio/` |
| Text to image | `/studio/text2img` |
| Image to image | `/studio/img2img` |
| Text to video | `/studio/text2video` |
| Image to video | `/studio/img2video` (**works today**) |

It grew out of the H3 video page set up the same day (see [[qwen 3.8 local llm runbook]] → H3
Video Studio). The old `/video/` address redirects to `/studio/img2video`.

## Decisions

| Date | Decision | Who |
|---|---|---|
| 2026-10-03 | A web page, not a tool inside the Qwen chat (chat-attached images can't reach an MCP tool; MCP is experimental and localhost-only) | owner |
| 2026-10-03 | Repo `comfy-studio`, private on GitHub, at `C:\Users\sheep\code\comfy-studio` | owner |
| 2026-10-03 | Hub at `/studio/`, pages `/studio/text2img`, `/img2img`, `/text2video`, `/img2video` | owner |
| 2026-10-03 | Qwen prompt help on every page | owner |
| 2026-10-03 | No LTX workflows | owner |
| 2026-10-03 | Ownership: BE = server, workflows, launchers; FE = `web/`; writer = README; orchestrator = design doc, tests, tools, TEAM.md | owner |
| 2026-10-03 | Uploads, outputs and history go in the repo's `data\` (git-ignored), one folder per mode: `data\img2video\`, `data\text2img\`… with `inputs\` inside; `data\jobs.json` shared. Issue 1 for the orchestrator | owner |
| 2026-10-03 | Deploy after every land: fast-forward the main checkout, restart the studio, check SHA + both URLs | owner |
| 2026-10-03 | Python standard library only, one server process (same as the Qwen launchers: hidden WMI start, `.bat` start/stop) | orchestrator draft |
| 2026-10-03 | A workflow = `api.json` taken from a successful run + `manifest.json` slot map; enabled only after a smoke run passes | orchestrator draft |

## Architecture

```
iPhone Safari ──Tailscale──> tailscale serve /studio ──> server.py :8190
                                                          │  pages (web/), jobs, files
                                                          ├──> Qwen :8080   prompt help (sees the photo)
                                                          └──> ComfyUI :8188  fill workflow → queue → fetch output
```

- One generic engine: load `workflows/<mode>/<id>/api.json`, fill the slots named in
  `manifest.json`, upload photos, submit, watch, copy the output to `Videos\h3\studio\`.
- Adding a workflow is a folder, not server code.
- Shared job history across pages (filter by mode), with Use again.

## Workflows

| Page | Workflows |
|---|---|
| Text to image | Z-Image Turbo, Qwen Image 2.1 GGUF |
| Image to image | Z-Image img2img, Qwen Image Edit 2511, Qwen Image 2.1 multi-image edit |
| Text to video | H3 fused t2v, H3 t2v (full) |
| Image to video | **H3 fused i2v (done)**, H3 i2v (full) |

All are saved in ComfyUI's editor format; each needs its API format captured once from a real run.
Only H3 fused i2v is confirmed end to end.

## Phases

| # | Phase | Done when |
|---|---|---|
| 0 | Repo, design doc with numbers, harness, first guard shown red, `TEAM.md`, GitHub repo | harness green, owner saw it red, ownership table confirmed |
| 1 | Orchestrator session in the repo; one issue through dispatch → verify → land | land report with harness numbers and a falsify |
| 2 | Generic engine + manifest format; port H3 fused i2v onto it with no change in behavior | manifest guards green; a real i2v run through the new engine |
| 3 | Hub + img2video page with the workflow picker; add H3 full i2v | both workflows smoke-run from the page |
| 4 | text2video page: H3 fused t2v, H3 full t2v | smoke runs |
| 5 | text2img page: Z-Image Turbo, Qwen Image 2.1 | smoke runs |
| 6 | img2img page: Z-Image img2img, Qwen Image Edit 2511, Qwen Image 2.1 multi-image (multi-photo picker) | smoke runs |

Phases 4-6 don't depend on each other once 2 is in; they can run in parallel.

## Risks

- **Editor → API format.** The saved workflows can't be submitted as they are. Capture from a real
  run (what worked for H3); a wrong conversion fails silently (a value written to a node nothing
  reads). The `[product-verb]` guard checks values reach the Save node.
- **Missing models / nodes.** Templates may reference models not installed. Smoke run decides; a
  failing workflow stays out of the picker.
- **One GPU for ComfyUI.** Jobs queue; switching model families reloads models (first job slower,
  not yet measured).
- **Qwen is one request at a time**, shared with the phone chat and `claude-qwen`.

## Status

- 2026-10-03: Phase 0 in progress. Repo created with server, hub placeholder, img2video page,
  `docs/DESIGN.md`, `tests/run.py` (17 pass / 0 fail / 5 todo). First commit `ea74559`, pushed to
  github.com/csiesheep/comfy-studio (private).
  - Guard shown red: photo written to an unwired LoadImage → 2 fail ("written to node ['902'] which
    does not feed SaveVideo 92"; "first_frame comes from node 901 … not the photo"); restored → green.
  - `orch wt smoke HEAD` → harness 17/0/5 in the worktree → `orch rm smoke`: works.
  - Live server now runs from the repo; tailnet `/studio/` live, `/video/` → 302 `/studio/img2video`.
  - Owner confirmed the `TEAM.md` ownership table and deploy section → committed `3636d57`.
    **Phase 0 done.** Next: orchestrator session in the repo (Phase 1).
- 2026-10-03: Phase 1 started. The setup session moved into the repo and became the orchestrator
  (declared: it wrote the Phase 0 code itself; that code has had no independent review).
  - Acceptance for issue 1 landed first: `c25093b` (parent `3636d57`), harness 17/0/5 → 18/0/9;
    git-ignore row falsified (data/ commented out → "not ignored by git: [3 paths]").
  - [Issue #1](https://github.com/csiesheep/comfy-studio/issues/1) data folder per mode → peer-be →
    verified (orch-checker + page check) → landed `50407d7` (parent `c25093b`), harness 18/0/9 → 22/0/5 →
    deployed: 4 jobs migrated into `data\img2video\`, all play over the tailnet. Closed.
    Old `C:\Users\sheep\Videos\h3\studio\` left for the owner to delete.
  - Follow-ups (on #1): port 8190 can be double-bound; harness probe cleanup; README path (writer);
    `/api/jobs` ~13 s while ComfyUI is busy; `stop-studio.bat` must be run by full path.
- 2026-10-03: Phase 2 started (owner: "Go").
  - Acceptance landed `f5f8726` (parent `50407d7`): engine contract in DESIGN.md, golden H3 graph,
    9 engine rows (probed against a throwaway stub: correct 31/0/4; each single defect red with the
    right reason; the port row was rewritten after it stayed green on the real defect). Harness
    probe fix from #1 included. Harness 22/0/5 → 22/0/13.
  - [#2](https://github.com/csiesheep/comfy-studio/issues/2) engine → peer-be;
    [#3](https://github.com/csiesheep/comfy-studio/issues/3) README → peer-writer (in parallel).
  - #3 landed `ed86f0d` after one send-back (said "videos" where image modes store images). Closed.
  - #2 landed `5878a35` (parent `ed86f0d`), harness 22/0/13 → **31/0/4**. Checker falsified 4 ways
    (real-person rule, node-id leak, seconds max, default workflow); orchestrator ran real Qwen
    through the engine. Peer's real run: 5 s in 214 s. Deployed; 5 jobs play; a second server on
    8190 is now refused (WinError 10048). Closed. **Phase 2 done.**
  - Carried into Phase 3: auto-sized width/height are not page fields (orchestrator 裁決); harness
    rows for the request-level default and int→float seconds; a golden graph from a real run for
    every new workflow; multi-photo slots and image outputs still to build (Phases 5-6).
- 2026-10-03: Phase 3 started (owner: "Go").
  - Acceptance landed `7579804` (parent `5878a35`): DESIGN.md §Picker; harness section 6 (request
    default, int→float seconds — both pass and were falsified; auto-sized fields and reference runs —
    todo, each probed red). Picker row per page. Harness 31/0/4 → 33/0/9.
  - [#4](https://github.com/csiesheep/comfy-studio/issues/4) H3 full workflow from a real run → peer-be;
    [#5](https://github.com/csiesheep/comfy-studio/issues/5) img2video picker → peer-fe (in parallel).
  - #5 landed `02d0c96` (parent `7579804`), harness 33/0/9 → 34/0/8; checked by orch-checker and by
    eye at 375 px dark with the live job list (8 jobs); deployed (page only, served file byte-identical).
    The checker found the static picker row too weak (matches a comment; can't tell run from prompt)
    → tighten in the next acceptance commit. Closed.
  - Harness tightened `209eec8`: picker row strips comments and checks api/prompt and api/run
    separately; new row "picker's first entry = the no-workflow default".
  - #4 H3 full: real run 5 s in **842 s** (4.3× fused). Sent back once: job watch gave up at 60 min
    (a 15 s H3 full ≈ 43 min, queue time counted) → now waits while ComfyUI has the prompt, 10-min
    lost window, 6 h cap; description gives times. Landed `a11fceb`, harness → **37/0/6**, deployed.
    Closed. **Phase 3 done.**
  - Open for owner: H3 full at 0.7 MP (DESIGN) vs the template's 0.4 MP (faster).
    → owner: "Keep 0.7, go Phase 4".
- 2026-10-03: Phase 4 started (text2video).
  - orchestrator 裁決: shape choice 9:16 (default) / 16:9 / 1:1 at 0.7 MP.
  - Acceptance landed `bf60ef3` (parent `a11fceb`): DESIGN.md §Text to video; harness section 7
    (5 rows, probed with temp workflows + stub, each defect red). Harness 37/0/6 → 37/0/11.
  - [#6](https://github.com/csiesheep/comfy-studio/issues/6) t2v workflows (2 real runs) → peer-be;
    [#7](https://github.com/csiesheep/comfy-studio/issues/7) t2v page + hub link → peer-fe (parallel).
  - Real runs: t2v fused 5 s 9:16 in 151 s, t2v full 792 s.
  - #6 + #7 landed together as `6a98465` (merge of verified `1a349ce` + `7009959`, plus a harness
    row: bad aspect refused before queueing). Harness → **45/0/4**. Checker falsified 5 ways; real
    Qwen t2v prompt (Chinese, no photo) in 7 s; pages checked by eye. Deployed. Closed. **Phase 4 done.**
  - Harness `df21c6b`: a shipped page that loses its route is red (was todo).
  - Next: Phase 5 text2img — needs image outputs in watch() and the image job list.
