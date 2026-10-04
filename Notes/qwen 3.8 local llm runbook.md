---
updated: 2026-10-04
tags: [runbook, llm, local-ai, claude-code, llama-cpp, comfyui, skill, opencode]
---
# Qwen 3.8 local LLM — install, setup, claude-qwen

Local uncensored Qwen3.8-27B on the PC (2× RTX 3090, i9-13900K, 48 GB RAM), served by
llama.cpp on the **second** 3090 so the first stays free for ComfyUI. Reachable from this PC
and, through Tailscale, from my own devices (iPhone) — not from the public internet. Set up 2026-10-01/03. First real use: the Taiwan deals research in
`Projects/discount/` (see `comparison_claude_vs_qwen.md` there for how it did).

## Quick use

| Want to | Do |
|---|---|
| Start the server | double-click `C:\llama.cpp\start-qwen-hidden.bat` (runs hidden, no window) |
| Stop it / free the GPU | double-click `C:\llama.cpp\stop-qwen.bat` |
| Chat in the browser | http://127.0.0.1:8080 |
| Call it from code | OpenAI-style: `http://127.0.0.1:8080/v1`, model `qwen3.8-27b-uncensored`, any API key |
| Claude Code on Qwen | open a **terminal**, `cd` to the folder, run `claude-qwen` (steps below) |
| Send it an image | works in the browser chat, the API, and `claude-qwen` (needs the mmproj, installed) |
| Check it's up | http://127.0.0.1:8080/health → `{"status":"ok"}` |
| Use it from the iPhone | Tailscale app on, then Safari → https://pc.curlew-mountain.ts.net:8443 (see below) |
| Coding agent from the iPhone | opencode at https://pc.curlew-mountain.ts.net/ — see [[opencode runbook]] |

Since 2026-10-04 the server **starts at logon** (with opencode), via the Task Scheduler task
"Qwen + opencode (start at logon)" → `C:\llama.cpp\start-opencode-remote.ps1`, 30 s after login.
Only after I log in — not at the login screen. Disable the task to stop that.

## iPhone access (Tailscale)

Set up 2026-10-03. Tailscale 1.102.4 on the PC (`winget install Tailscale.Tailscale`) and the
Tailscale iOS app, both signed in as `csiegoat@`. The PC is `pc` on the tailnet (renamed
from `desktop-r2u3mdm` on 2026-10-04 with `tailscale set --hostname=pc`; the Windows computer name is
unchanged), tailnet IP `100.97.49.62`. Tailnet name `curlew-mountain.ts.net` (was `tail528148.ts.net` until
2026-10-04). After either rename, `tailscale serve` routes stay under the old
name: `tailscale serve reset` and add them again.

`tailscale serve` publishes the local server to **my tailnet only**, over HTTPS:

```
https://pc.curlew-mountain.ts.net:8443  (tailnet only)
|-- / proxy http://127.0.0.1:8080
```

> **Moved 2026-10-04** from the root address (`…ts.net/`) to port **8443**: the root `/` now
> serves opencode ([[opencode runbook]]), which can't live under a sub-path. Anything pointed at
> `https://pc.curlew-mountain.ts.net/v1` must change to `…ts.net:8443/v1`. A cached old
> chat page at `/` shows "Unexpected token '<' … not valid JSON" — hard refresh / re-add the icon.

- llama-server still listens only on `127.0.0.1` — no firewall rule, no API key, `claude-qwen`
  unchanged. Only devices signed in to my Tailscale account can reach it.
- Serve/HTTPS had to be enabled once for the tailnet (approved via a login.tailscale.com link).
- The serve setting persists across reboots (`--bg`); the **PC must be on, Tailscale running,
  and the Qwen server started**.
- On the iPhone: turn Tailscale on → Safari → the URL above → Share → **Add to Home Screen**.
  Image upload works in that chat page too.
- Any OpenAI-compatible app can use `https://pc.curlew-mountain.ts.net:8443/v1`, model
  `qwen3.8-27b-uncensored`, any key.
- One request at a time: the phone, `claude-qwen`, opencode and scripts share it.
- Check / stop: `tailscale serve status` · `tailscale serve --https=8443 off`
- Tested from the PC through the HTTPS address: health ok, chat page 200, chat request answered.

## What is installed

| Thing | Where | Notes |
|---|---|---|
| llama.cpp build 11342 (CUDA 12.4) | `C:\llama.cpp\` | official GitHub release, not the article's one-click script |
| Model, default | `C:\models\Qwen3.8-27B-Uncensored-Q4_K_M.gguf` (15.7 GB) | SHA256 checked against Hugging Face |
| Model, older | `C:\models\Qwen3.8-27B-Uncensored-Q5_K_M.gguf` (18.2 GB) | SHA256 checked |
| Vision projector (mmproj) | `C:\models\mmproj-Qwen3.8-27B-Uncensored-F16.gguf` (0.9 GB) | SHA256 checked; the launcher adds `--mmproj` when the file exists. Without it, image input fails with `500 image input is not supported ... provide the mmproj` |
| Claude Code CLI 2.1.286 | `winget install Anthropic.ClaudeCode` | plain `claude` still uses Claude |
| Launchers | `C:\llama.cpp\start-qwen-hidden.ps1/.bat`, `stop-qwen.bat`, `claude-qwen.cmd` | `C:\llama.cpp` is on the user PATH |
| opencode + its launcher | `C:\opencode\`, `C:\llama.cpp\start-opencode-remote.ps1/.bat`, `stop-opencode-remote.bat` | see [[opencode runbook]]; the start script also starts Qwen |
| Patched chat template | `C:\llama.cpp\qwen-template.jinja` | original saved as `qwen-template-original.jinja` |
| Server log | `C:\llama.cpp\server.log` (previous run: `server.prev.log`) | |

Model source: Hugging Face `JonathanColetti/Qwen3.8-27B-Uncensored-GGUF` — the 越狱/无审查
repo linked from the freedidi.com article (https://www.freedidi.com/25504.html), **not**
the official `unsloth/Qwen3.8-27B-GGUF`. Abliterated with Heretic; the repo's README
reports refusals 12/100 vs 98/100 for the base model on harmful prompts, so refusals are
*reduced, not removed*. That figure was measured at full precision, not on Q4/Q5; the
author says quantization makes the old refusal boundary less stable.

## Server settings (default, tested 2026-10-02)

`start-qwen-hidden.ps1` defaults: **Q4_K_M, 128K context (131072), 1 request at a time,
q8_0 KV cache**, MTP speculative decoding (`--spec-type draft-mtp --spec-draft-n-max 2`),
`CUDA_VISIBLE_DEVICES=1`, patched template, vision projector. Uses ~22.5 GB on the second 3090
(21.4 GB before vision was added); a test image request peaked at 22.6 GB with no spill.

Options: `-Quant`, `-Ctx`, `-Parallel`, `-KvQ8`. The old setup:

```powershell
powershell -ExecutionPolicy Bypass -File C:\llama.cpp\start-qwen-hidden.ps1 -Quant Q5_K_M -Ctx 32768 -Parallel 4 -KvQ8:$false
```

What was measured choosing this:

| Setup | Real context per request | VRAM | Spill to system RAM |
|---|---|---|---|
| Q5_K_M, 32K, 4 slots | 32K | ~23 GB | — |
| Q4_K_M, 98K, 1 slot, plain KV | 98K | 22.5 GB | 0.3 GB |
| **Q4_K_M, 128K, 1 slot, q8 KV** | **128K** | **21.4 GB** | **0.4 GB** |
| Q4_K_M, 160K, 4 slots | only 40K each (split) | 23.1 GB | **5 GB — slow** |

Long-context check: ~97K-token prompt with one fact hidden in the middle → found it.
Prompt reading ~680 tok/s (142 s for 97K). Generation ~60 tok/s on short prompts,
~30–40 tok/s on long thinking runs.

## Thinking mode

- Qwen thinks by default. A long task can spend tens of thousands of tokens thinking
  before writing anything — set `max_tokens` high (e.g. 100000) or it ends with an empty answer.
- At **temperature 0.4** it got stuck repeating one sentence for 38K tokens. Use Qwen's
  recommended thinking settings: `temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5`.
- To skip thinking: `"chat_template_kwargs": {"enable_thinking": false}` in the request.
  Much faster (101 s vs 14 min on the deals task) and, on that task, no less accurate.

## claude-qwen (Claude Code on the local model)

### Running it

1. Server up? If not (after a reboot or `stop-qwen.bat`), double-click
   `C:\llama.cpp\start-qwen-hidden.bat` and wait for `Qwen ... is up`.
2. Open a **new** terminal (Windows Terminal / PowerShell). A terminal opened before
   `C:\llama.cpp` was added to PATH won't find the command.
3. `cd` to the folder to work in, then run `claude-qwen`.
4. First reply takes about a minute (Qwen reads Claude Code's ~55K-token prompt and tools);
   later turns are faster. Quit with `/exit` or Ctrl+C twice.

If `claude-qwen` is "not recognized", run it by full path: `C:\llama.cpp\claude-qwen.cmd`.

If the server is restarted while a `claude-qwen` session is waiting on a reply, that request
won't recover (it retries up to 10 times, then fails). Send the message again, or restart
`claude-qwen`.

### How it works

`claude-qwen` = Claude Code with these env vars set **for that process only**:
`ANTHROPIC_BASE_URL=http://127.0.0.1:8080`, a dummy `ANTHROPIC_AUTH_TOKEN`, and every model
role (`ANTHROPIC_MODEL`, default opus/sonnet/haiku, subagent) set to `qwen3.8-27b-uncensored`.
llama-server speaks the Anthropic Messages API (`/v1/messages`) including tool calls.

- It is a terminal program, not a separate app. Claude desktop app and plain `claude`
  keep using Claude; both can run at the same time.
- Inside a `claude-qwen` session `/model` cannot switch to Claude — every request goes to
  the PC. To mix both in one session would need a routing proxy (e.g. LiteLLM); not set up.
- The desktop app can't be pointed at it per session (only via a developer-mode
  third-party inference setting that redirects the whole app) — don't.
- Each run prints `[claude-code:unrecognized_model]` — harmless.
- The global `~/.claude/CLAUDE.md` still loads, so Qwen sees the TEAM.md rules too.
- Test (2026-10-02): read a Python file and add a discount argument → correct edit,
  74 s, 4 calls, ~55K input tokens (Claude Code's own prompt + tools is most of that).
- Images: pasting or attaching an image in `claude-qwen` works once the mmproj is loaded.
  Test (2026-10-02): a 1024×1024 PNG cost ~1,000 input tokens and was described correctly.

### Skills in claude-qwen

`claude-qwen` uses the same `~/.claude` folder as the Claude app, so it sees:
- **personal skills** in `C:\Users\sheep\.claude\skills\<name>\SKILL.md` (agent-team-delivery,
  csiesheep-perspective, initialize_a_game, nuwa-skill, h3-image-to-video) — put a skill here to
  have it in both;
- **project skills** in `<project>\.claude\skills\` when run inside that project;
- Claude Code's built-in skills (code-review, simplify, init, ...).

It does **not** see skills that come from the claude.ai account (`anthropic-skills:*` such as
docs/pdf/xlsx/pptx/deep-research, and the artifact skills), because it isn't logged in.
Checked 2026-10-03 by asking `claude-qwen -p` to list its skills. Qwen follows long, multi-step
skills less reliably than Claude; short, concrete skills work best.

## h3-image-to-video skill

Personal skill (works in the Claude app and `claude-qwen`): one image + a short description →
a video with sound from the **MiniMax-H3 fused image-to-video** workflow on the local ComfyUI
(first 3090, port 8188).

Use it by asking, e.g. "Animate `C:\pics\cat.png`: the cat stretches and walks off, 10 seconds."
The skill looks at the image, expands the description into an H3 prompt, runs it, and reports
the video path, size, seed and prompt.

Files in `C:\Users\sheep\.claude\skills\h3-image-to-video\`:

| File | What it is |
|---|---|
| `SKILL.md` | the instructions: inputs, steps, prompt template, rules |
| `h3_i2v.py` | uploads the image as first frame, fills the workflow, submits, waits, copies the MP4 out (stdlib only) |
| `h3_fused_i2v_api.json` | the API-format graph, taken from a successful run of `ComfyUI/user/default/workflows/minimax_h3_fused_UC_i2v.json`, with a LoadImage wired into `first_frame` |

Run the script directly:

```bash
python C:\Users\sheep\.claude\skills\h3-image-to-video\h3_i2v.py --image photo.png --prompt-file prompt.txt --seconds 10 --out-dir C:\Users\sheep\Videos\h3
```

Options: `--seconds` (5-15, default 10), `--seed`, `--megapixels` (default 0.7), `--steps`
(default 4), `--prefix`, `--allow-long` (go past 15 s, untested), `--dry-run` (print the filled
workflow only).

Prompt format (the "H3 prompt contract"; write in Chinese or English):

```
integrated_multimodal_description:
<style + scene, matching the image>
[0s-3s] <camera move + first action>
[3s-7s] <main action>
[7s-10s] <ending>

overall_soundscape:
<ambient and action sounds>

non_diegetic_music:
<music style, or N/A>
```

Settings baked into the template: fused ref-delta int8 model, Qwen3-VL-32B text encoder, SLA
attention 0.9/64, res_multistep / simple, 4 steps, sigma shift 12/3, 24 fps; output keeps the
image's aspect ratio at ~0.7 MP (both sides multiples of 32).

- **Length:** H3 was trained on ~124-362 frames (≈5-15 s); the script refuses other lengths
  unless `--allow-long`.
- **Speed:** test 2026-10-03: 5 s fox video, 832×832, with audio, **226 s** to generate. Expect
  ~5-8 min for 10 s. First frame matched the image exactly; the first beats were followed, the
  last one ("look back at the camera") was not.
- **Don't write files into the Claude app's scratch folder** (`AppData\Roaming\Claude\...`):
  Windows virtualizes it for the app, so Python can't see files there ("file not found"). The
  skill falls back to `C:\Users\sheep\Videos\h3\`.
- **Rule in the skill:** if the image shows a real, identifiable person, it won't write prompts
  that undress them or show them nude or sexual.

## H3 Video Studio (browser / iPhone → Qwen → ComfyUI)

Set up 2026-10-03. A web page for the h3-image-to-video pipeline, usable from the iPhone:
pick a photo, type a short idea, **Qwen** (sees the photo) writes the H3 prompt, edit it if you
like, **Make video** → ComfyUI renders it → it plays and downloads in the page.

| Want to | Do |
|---|---|
| Open it (iPhone, tailnet) | https://pc.curlew-mountain.ts.net/studio/img2video (hub: `/studio/`; old `/video/` redirects) → Add to Home Screen |
| Open it (PC) | http://127.0.0.1:8190/img2video |
| Start / stop | `C:\Users\sheep\code\comfy-studio\start-studio-hidden.bat` / `stop-studio.bat` (starts at logon since 2026-10-04) |
| Videos + inputs + history | `C:\Users\sheep\Videos\h3\studio\` (`jobs.json`, `inputs\`) |
| Log | `C:\Users\sheep\code\comfy-studio\studio.log` |

> Since 2026-10-03 the code lives in the **comfy-studio** repo (private, github.com/csiesheep/comfy-studio);
> plan in [[comfy-studio plan]]. `C:\h3-studio\` is the old copy and is no longer run.

- Needs all three running: Qwen server, ComfyUI, studio. The page shows a green/red dot for Qwen and ComfyUI.
- `server.py` (stdlib) has its own copy of the H3 workflow and helpers (the skill folder's copy
  is separate). Qwen is called with thinking off
  (prompt in ~10 s); the system prompt carries the H3 template and the real-person rule.
- The phone photo is downscaled in the browser to ≤1.6 MP JPEG before upload (H3 renders ~0.7 MP).
- Jobs keep running if the page is closed; the server resumes watching running jobs after a restart.
- "Use again" on a finished video reloads its photo and prompt for another seed.
- Studio calls Qwen server-side at `127.0.0.1:8080`, so the 2026-10-04 move of Qwen's tailnet
  route to `:8443` didn't affect it.
- Since 2026-10-04 the studio **starts at logon** (second action of the "Qwen + opencode (start at
  logon)" task, output appended to `C:\llama.cpp\autostart.log`). **ComfyUI does not** — start it
  by hand or the studio's ComfyUI dot is red.
- `tailscale serve` routes: `/` → 4096 (opencode; was 8080 Qwen chat until 2026-10-04, now `:8443`), `/studio` → 8190 (prefix is stripped),
  `/video` → 8190`/legacy-video` (302 to `/studio/img2video`). Remove one:
  `tailscale serve --https=443 --set-path /studio off`.
- The Claude app's built-in browser pane blocks fetches to the ts.net address
  (`ERR_BLOCKED_BY_CLIENT`); test there with http://127.0.0.1:8190 instead. Safari is fine.

## Gotchas found along the way

- **Template patch is required for Claude Code.** Qwen's template raised
  `System message must be at the beginning`; Claude Code sends system messages mid-conversation.
  The patch renders later system messages as system blocks instead of erroring. If a new
  model or llama.cpp version is swapped in, re-check this.
- **Don't launch it as a visible console window.** The first setup ran in a minimized window
  and the server died from a Ctrl+C-type signal (likely the window being closed). The hidden
  launcher starts it through WMI so it is not tied to any console.
- **`nvidia-smi` memory is wrong on this PC**: it shows the same number for both cards. Use
  Task Manager's GPU page or the Windows counter `\GPU Process Memory(*)\Dedicated Usage`.
- **Watch "shared" GPU memory**: if the process's shared usage grows by GBs, Windows is spilling
  VRAM into system RAM and generation gets very slow — lower the context.
- **More parallel slots split the context**: `-Parallel 4` at 160K gives four 40K slots.
- **No API key; localhost + my tailnet only.** If a tailnet device is ever shared with someone
  else, add `--api-key`. Exposing it publicly at games.csiesheep.com was discussed but not
  done; it would need Cloudflare Tunnel + a Worker route + Cloudflare Access (or `--api-key`),
  and `--api-prefix` for a sub-path.
- **Facts from Qwen need checking.** On the Taiwan deals research, 8 of its 20 URLs reached the
  right brand; it confused 萊爾富 with Lawson and listed renamed/merged chains. Good for
  structure and drafts, not for facts.

## Change log

| Date | Change |
|---|---|
| 2026-10-01 | llama.cpp b11342 + Q5_K_M, 32K context, 4 slots, on GPU 1 via a visible `.bat` window |
| 2026-10-02 | Server died when its window was closed → hidden WMI launcher + `stop-qwen.bat` |
| 2026-10-02 | Switched to Q4_K_M, 128K context, 1 slot, q8_0 KV cache |
| 2026-10-02 | Claude Code CLI installed; `claude-qwen` launcher; patched chat template for mid-conversation system messages |
| 2026-10-02 | Added vision projector (mmproj) after image input in `claude-qwen` failed with a 500 |
| 2026-10-03 | Checked which skills `claude-qwen` sees; added the `h3-image-to-video` personal skill |
| 2026-10-03 | Tailscale + `tailscale serve` for iPhone access (tailnet only, HTTPS) |
| 2026-10-03 | H3 Video Studio page at `/video` (`C:\h3-studio\`): photo + idea → Qwen prompt → ComfyUI H3 video |
| 2026-10-03 | opencode installed on top of this server ([[opencode runbook]]) |
| 2026-10-04 | Qwen's tailnet route moved `/` → `:8443`; opencode took `/` |
| 2026-10-04 | Logon task "Qwen + opencode (start at logon)": Qwen no longer needs a manual start after reboot |
| 2026-10-04 | H3 Video Studio added to the logon task (ComfyUI still manual) |
| 2026-10-04 | Machine name `desktop-r2u3mdm` → `pc` (URLs became `https://pc.tail528148.ts.net`; old name dead) |
| 2026-10-04 | Tailnet name `tail528148.ts.net` → `curlew-mountain.ts.net` (admin console, DNS → Rename tailnet); routes reset + re-added; all URLs now `https://pc.curlew-mountain.ts.net` |

## Related

- [[opencode runbook]] — opencode coding agent on this server, from the iPhone.
- ComfyUI (first 3090, port 8188) — Qwen Image 2.1 and Z-Image-Turbo were driven from Qwen-written prompts the same day.
- `Projects/discount/` — the deals-map research and the Claude vs Qwen comparison.
