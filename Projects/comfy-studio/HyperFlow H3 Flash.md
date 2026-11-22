# HyperFlow H3 Flash trial (2026-11-20)

Decision (owner, 2026-11-20): **keep using h3_fused** for text to video. HyperFlow is not adopted into the studio.

## What it is
- Video Rebirth's pruned 13.7B H3, 4/6/8 steps, CFG 1, 1344x768, 124 frames = 5.17 s at 24 fps, joint 32 kHz stereo audio.
- Tasks: t2va, fl2va (first or first+last frame), ref2va (up to 12 refs). ComfyUI node pack ComfyUI-HyperFlow-Flash v1.1.1.
- Licence: MiniMax H3 Community License; excludes US, EU, UK, South Korea. Region of the owner's PC was never answered.
- Needs INT8 via `--enable-triton-backend` on our torch 2.11+cu128 (the autostart script does not pass it).

## Measured on one RTX 3090 (5 s clip, same prompt, same seed 42, whole job incl. model load)
| prompt | HyperFlow 6 steps 1344x768 | h3_fused final 1120x640, 8 steps |
|---|---|---|
| guitar | 350 s | 250 s |
| cafe | 390 s | 240 s |
| coast | 400 s | 240 s |
| skate | 390 s | 240 s |
- HyperFlow 4 steps (guitar): 240 s, looks like 6 and 8 steps. 8 steps looked the same.
- Cold first run 393 s (1:49 of it model init + triton compile).
- Looks: HyperFlow is sharp and clean at higher resolution; h3_fused follows the prompt better (coast: birds, breaking waves; skate: the ledge jump; cafe: more motion) and its audio is much louder (HyperFlow cafe 0.015 rms vs 0.2). Audio sync and content were not listened to.

## Length and keyframes
- One-shot 10.1 s (243 frames): 1150 s (about 19 min); sampling 136-151 s/step vs 41 s/step at 5 s. Coherent, audio present.
- Two 5 s segments joined with `MiniMaxH3AddGuide` (last 5 or 22 frames of segment 1 pinned at frame 0 of segment 2): 430 s / 500 s for the second segment. 22-frame context kept the guitar's wear marks, 5-frame context lost them. Seam was smooth by frame difference; seam audio not listened to.
- `MiniMaxH3ImageToVideo` has first_frame and last_frame. Guide clip lengths are 17k+5 frames (5, 22, 39, ...). Base H3 trained range about 124-362 frames; HyperFlow only documented at 5.17 s.
- No H3 latent upscale model exists in Comfy-Org/MiniMax-H3, so no small-then-upscale route.

## Not done
- Uncensored check with our heretic encoder (stock encoder only).
- i2v / flf2v / ref2va templates.

## Files on this PC (rollback = delete both)
- `C:\Users\sheep\code\ComfyUI\custom_nodes\ComfyUI-HyperFlow-Flash`
- `C:\Users\sheep\code\ComfyUI\models\diffusion_models\minimax_h3_fl2va_hyperflow_flash_14b-int8_convrot.safetensors` (16 GB)
- Test outputs: `C:\Users\sheep\code\ComfyUI\output\hyperflow\`
