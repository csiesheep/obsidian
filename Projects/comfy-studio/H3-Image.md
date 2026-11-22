---
tags: [project, comfyui, local-ai, image-model]
status: live
date: 2026-11-18
repo: C:\Users\sheep\code\comfy-studio
---
# MiniMax-H3-Image in Comfy Studio

Part of [[comfy-studio plan]]. Contract and numbers: `docs/DESIGN.md` in the repo, sections
"H3-Image in text to image" and "H3-Image edit in image to image".

## What exists now (live on the studio, 2026-11-18)
- **Text to image:** `text2img/h3_image` (3rd choice after Z-Image Turbo, which stays default). Issue #51, landed `2e2745d`.
- **Image to image (edit):** `img2img/h3_image_edit` (2nd, after Z-Image img2img). Issues #53/#54, landed `860c4c1`.
- Hub tiles name H3-Image. The **friend page is unchanged** (still `text2img/qwen_image`, never offered H3-Image).

## Numbers (measured on this PC, one 3090, GPU 0)
| | H3-Image | Qwen Image 2.1 (studio UC GGUF) |
|---|---|---|
| Size | ~4 MP (9:16 = 1536x2720, 16:9 = 2720x1536, 1:1 = 2048x2048) | ~1 MP |
| Steps | 6, cfg 1 | 25, cfg 3.5 |
| Seconds per picture (warm) | ~41 (text to image); edit 67-82 | ~64 |
- Models: `minimax_h3_image_pruned_int8_convrot` (21 GB), text encoder `qwen3vl_32b_minimax_h3_int8_convrot` (25 GB), VAE `minimax_h3_image_vae_fp16`.
- Needs ComfyUI >= v0.43; this PC runs **v0.46.0** (rollback target: commit `edb3db00`, v0.42.3).
- RAM is tight (~48 GB total; free RAM fell to 2-4 GB during runs). Switching model families reloads ~48 GB: first job after a switch is slower.
- **Not tested:** sizes above 4 MP (owner: "No need"), 9:16 edit photo, several reference photos (model supports up to 16; studio offers 1).

## 10-prompt comparison vs Qwen Image 2.1 (same seed, no prompt expansion)
H3-Image better on the Taipei neon street (Qwen came out very dark), the pianist's hands and the anime swordswoman; Qwen better on
the product shot and the poster; the rest about even. One seed per prompt, H3 has 4x the pixels, and Qwen was not given its usual
Qwen 3.8 prompt rewrite, so treat it as a rough picture, not a benchmark.

## No content filter, so the studio does the checking
- Owner-run mild test: swimwear, lingerie, a nude marble statue and a bleeding wound were all drawn without refusal. Explicit content was **not** tested on purpose.
- The studio's own safeguards (only for these workflows): under-18 check on the photo, then real-person check, then (only if a real person) a sexual-prompt check on the prompt; all fail closed and run **before** anything is saved or queued.
- **Where the code is (`server.py`, find by name; line numbers drift):** `U18_WORKFLOWS`, `EDIT_GATED_WORKFLOWS`, `looks_under_18`, `under_18_gate`,
  `shows_real_person`, `real_person_gate`, `prompt_is_sexual`, `sexual_prompt_gate`, `charrep_gates`, `edit_gate_photo`, `edit_gates`.
  Called from `write_prompt` (api/prompt) and `_plan_job` (api/run).
- **Instruction files (edit applies next request, no restart):** `workflows/qwen_u18_check.txt`, `qwen_real_person_check.txt`, `qwen_sexual_check.txt`;
  `workflows/qwen_rules.txt` is appended to every Qwen request. Missing or empty file = the check fails and nothing runs.
- **Correction recorded:** the three Qwen uncensored img2img workflows (`qwen_multi_edit`, `qwen_uc_edit`, `qwen_uc_img2img`) have **no** photo checks; only
  the H3 reference / multiframe / character-replacement workflows and the new H3 edit do.
- The studio's Qwen 3.8 is the uncensored one: `qwen3.8-27b-uncensored` = `C:\models\Qwen3.8-27B-Uncensored-Q4_K_M.gguf`, llama-server on 8080, pinned to GPU 1.

## ComfyUI setup facts
- Runs on **127.0.0.1:8188, GPU 0** (`--cuda-device 0`); Qwen 3.8 on GPU 1.
- Three ComfyUI trees exist: `C:\Users\sheep\code\ComfyUI` (comfy-cli workspace, the one in use), `Comfy-Desktop\ComfyUI-Installs\...` (desktop's own code, v0.37.0), and the desktop shell in `AppData\Local\Programs\ComfyUI`.
- **Models live in `C:\Users\sheep\AppData\Local\Comfy-Desktop\ComfyUI-Shared\models` - do not delete that folder.** `code\ComfyUI\extra_model_paths.yaml` (gitignored) points ComfyUI at it.
- **Autostart:** `start-comfyui-hidden.ps1` (new) is called by `start-studio-hidden.ps1`, so the existing "Comfy Studio (start at logon)" task also starts ComfyUI. Tested on a spare port; **not tested through a real logon**.

## Licence (not code)
MiniMax-H3-Image (and the H3 community licence) excludes use in the **US, EU, UK and South Korea**; hosted service for others or revenue over $1M needs written permission.
The owner has not said where the PC is used - **open question**.

## Looked at and not adopted
HyperFlow H3 Flash (Video Rebirth, 13.7B pruned H3): smaller and fast per step, but no quality comparison with our `h3_fused`, no word on uncensored behaviour, same territory exclusions. Decision: keep `h3_fused`; maybe test side by side later.

## Open items
- [ ] Gate the three Qwen uncensored img2img workflows the same way? (owner's call)
- [ ] `REAL_SEXUAL_UNCHECKED` message says "character replacement" - reads oddly on the img2img page (tiny issue).
- [ ] `expected_seconds` for the edit says 68 s; real runs 73-82 s.
- [ ] Real Qwen refusal paths never exercised with a real refusing photo (harness uses swapped verdicts only).
- [ ] Friend page (8191) is off while its Funnel on 10000 is still on; no autostart for it.
- [ ] Node pack `minimax-h3-audio-t8` update (1.10.0 -> 1.105.0) not done.
- [ ] Optional: several-reference edit (needs its own issue, per-photo checks).

## Links
Issues #51, #52, #53, #54 (csiesheep/comfy-studio). Commits: `f13cc39` (autostart), `2e2745d`, `860c4c1`.
