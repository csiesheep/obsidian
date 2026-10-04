---
tags: [project, comfyui, quality]
date: 2026-10-03
status: proposal
---
# Comfy Studio — five approaches to better images and videos

> Investigated 2026-10-03 from facts, not general advice: the eight workflows' real settings
> (`workflows/*/*/api.json`), the notes the template authors left inside the ComfyUI workflows,
> the installed models, Qwen's prompts on the owner's real jobs, and same-seed frames.
> Nothing here is implemented yet. Each approach ends with how to measure it before adopting it.

## What was found

| Fact | Where it comes from | What it means |
|---|---|---|
| H3's native canvas is a **768 px short edge** (768×1344 cap, ×32); the 4-step turbo LoRA is a *768p* LoRA | MiniMax H3 template note | We render at 0.7 MP (640 short edge, e.g. 736×960): below native, and below what the turbo path was trained at |
| Our "H3 fused" model file is `…turbo8…` but we sample **4 steps** | model name + `api.json` | Likely under-stepped; 8 is what the fusion's name says |
| "H3 full" = pruned model, **no turbo LoRA, 20 steps**; the template's middle setting (turbo LoRA at **8 steps**) is not exposed | `reference_run.json` switch nodes | An untested sweet spot between 3 min and 14 min per 5 s |
| SLA sparse attention at sparsity **0.9**, `dense_last_steps 0` on fused | `api.json` | A speed trick; its quality cost is unmeasured |
| Qwen Image 2.1 "has native **2K** support"; we render ~1 MP | Qwen Image template note | Detail left on the table |
| Qwen Image runs at **cfg 1.0**, 25 steps, no negative prompt; no Lightning LoRA installed | `api.json`, models folder | No guidance at all; prompt adherence may suffer (to verify against the official template) |
| Z-Image Turbo: 20 steps at cfg 1 | `api.json` | Official turbo is 8 steps: no quality gain from 20, only time |
| Owner's prompts: 3–4 actions per 10–15 s clip (transform → punch → bomb → catch) | `data/jobs.json` | The hardest case for a distilled video model; the runbook already noted H3 drops the last beat |
| Same seed, fused 4-step vs full 20-step: full has correct anatomy where fused twists the yawn / hunches the t2v fox | frames 62 of both fox clips | Steps are the biggest visible lever |
| No upscale models, no H3 style embeddings installed | models folder | Those levers need downloads first |

Timings today (5 s unless noted): fused 197 s, 10 s 6.5 min, 15 s 9.5 min; full 842 s; Z-Image 42 s; Qwen Image 48 s.

## The five approaches

### 1. Sample properly: steps and attention (video)
Fused at **8 steps** (what `turbo8` implies), and the unexposed **pruned + turbo LoRA at 8 steps**; separately, SLA sparsity lowered / `dense_last_steps 1`.
- Expected: the anatomy difference seen in the frames, at roughly 2× fused time (5 s ≈ 6–7 min) instead of 4.3× (full).
- Risk: a fused model may have been tuned at 4; only the A/B tells.
- Measure: 3 clips (fox photo, one owner photo of their choosing, one text idea), same seed and prompt, 4 settings each → contact sheets at 3 timestamps, owner picks blind. ~2 h of GPU, run when idle.

### 2. Native resolution
H3 at **768 short edge** (0.98 MP, "official 768p"); Qwen Image at **1.5–2K**; keep Z-Image at 1 MP until its native size is confirmed.
- Expected: sharper fur/faces/text; more pixels for the model to place detail in. Cost: H3 +40 % pixels → ×1.5–1.8 time (attention grows faster than pixels); Qwen Image 2K ≈ ×4.
- Risk: VRAM at 15 s × 768p on a 24 GB card (peak was 9.9 GB free at 5 s / 832²): measure 15 s before enabling.
- Measure: same seed at 0.7 MP vs 768p, crops of faces/fur side by side; time and VRAM recorded.

### 3. Story discipline: fewer beats, shorter clips, chain them
Change Qwen's video instructions to **one main action, at most two beats**, default length **5–8 s**; and add **"Continue"**: take the last frame of a clip as the first frame of the next (H3 is first/last-frame capable: `fl2va`), so a 15 s story becomes three 5 s clips the model can actually follow.
- Expected: the biggest gain on the kids' fantasy prompts, with zero extra GPU time (shorter clips are faster). Fewer "the last beat didn't happen" results.
- Risk: continuity across chained clips (lighting/pose drift); the last-frame input is unexplored here.
- Measure: five of the owner's past ideas, 15 s three-beat vs 3 × 5 s chained; count beats that actually happen.

### 4. Draft → pick → final
Images: generate **4 seeds per request** (one batched run, ~1.5 min on Z-Image), show a 2×2, pick one, optionally **refine the pick** (img2img at strength 0.3–0.4, or re-render at 2K with the same seed). Video: a **draft** (4 steps, 0.5 MP, 5 s ≈ 1.5 min) to choose the seed/motion, then **final** (approach 1+2 settings) with that seed.
- Expected: selection is the single most reliable quality lever for images; for video it avoids paying 10+ min for a motion you'd reject.
- Risk: draft and final share a seed but not necessarily the same motion once steps/resolution change; measure how often the motion survives (5 pairs). Page work (grid picker, refine button).
- Measure: the survival rate above; and for images, how often the picked candidate beats the single-shot default.

### 5. Guidance for Qwen Image (and the right step counts)
Verify Qwen Image 2.1's official sampling (the Comfy template: cfg and steps for the non-Lightning model), then A/B **cfg 1 → 3–4 with a negative prompt** at 30–50 steps. Set Z-Image Turbo to its official **8 steps** (speed, same quality) and Z-Image img2img likewise.
- Expected: prompt adherence (counts, positions, text) on Qwen Image; ~2–3.5 min per image at cfg > 1.
- Risk: the "UC" merge may behave differently from the base model; if cfg > 1 burns colors, the A/B shows it.
- Measure: 5 adherence-heavy prompts (e.g. "three red cups, the middle one lying on its side"), same seed, cfg 1 / 3 / 4; score how many constraints hold.

## Order
1 and 2 share one experiment (steps × resolution grid) and have the strongest evidence → first. 3 costs nothing and attacks the owner's actual use → second. 4 is a product feature → after the settings are settled. 5 after checking the official template.

## How the measuring works (all approaches)
Fixed probe set (3 photos incl. one person photo chosen by the owner, 3 text ideas); same seed across arms; contact sheets with the arm labels hidden; owner picks; times and VRAM logged. Each adopted setting becomes a workflow's manifest change with its own reference run, as before. Frames used today: `C:\Users\sheep\code\_wt\frames\` (fox, non-person).
