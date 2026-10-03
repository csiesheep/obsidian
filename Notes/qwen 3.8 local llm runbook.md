---
updated: 2026-10-02
tags: [runbook, llm, local-ai, claude-code, llama-cpp]
---
# Qwen 3.8 local LLM — install, setup, claude-qwen

Local uncensored Qwen3.8-27B on the PC (2× RTX 3090, i9-13900K, 48 GB RAM), served by
llama.cpp on the **second** 3090 so the first stays free for ComfyUI. Reachable only from
this PC. Set up 2026-10-01/02. First real use: the Taiwan deals research in
`Projects/discount/` (see `comparison_claude_vs_qwen.md` there for how it did).

## Quick use

| Want to | Do |
|---|---|
| Start the server | double-click `C:\llama.cpp\start-qwen-hidden.bat` (runs hidden, no window) |
| Stop it / free the GPU | double-click `C:\llama.cpp\stop-qwen.bat` |
| Chat in the browser | http://127.0.0.1:8080 |
| Call it from code | OpenAI-style: `http://127.0.0.1:8080/v1`, model `qwen3.8-27b-uncensored`, any API key |
| Claude Code on Qwen | open a **terminal**, `cd` to the folder, run `claude-qwen` |
| Check it's up | http://127.0.0.1:8080/health → `{"status":"ok"}` |

The server does **not** start by itself after a reboot.

## What is installed

| Thing | Where | Notes |
|---|---|---|
| llama.cpp build 11342 (CUDA 12.4) | `C:\llama.cpp\` | official GitHub release, not the article's one-click script |
| Model, default | `C:\models\Qwen3.8-27B-Uncensored-Q4_K_M.gguf` (15.7 GB) | SHA256 checked against Hugging Face |
| Model, older | `C:\models\Qwen3.8-27B-Uncensored-Q5_K_M.gguf` (18.2 GB) | SHA256 checked |
| Claude Code CLI 2.1.286 | `winget install Anthropic.ClaudeCode` | plain `claude` still uses Claude |
| Launchers | `C:\llama.cpp\start-qwen-hidden.ps1/.bat`, `stop-qwen.bat`, `claude-qwen.cmd` | `C:\llama.cpp` is on the user PATH |
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
`CUDA_VISIBLE_DEVICES=1`, patched template. Uses ~21.4 GB on the second 3090.

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
- **No API key, localhost only.** Exposing it at games.csiesheep.com was discussed but not
  done; it would need Cloudflare Tunnel + a Worker route + Cloudflare Access (or `--api-key`),
  and `--api-prefix` for a sub-path.
- **Facts from Qwen need checking.** On the Taiwan deals research, 8 of its 20 URLs reached the
  right brand; it confused 萊爾富 with Lawson and listed renamed/merged chains. Good for
  structure and drafts, not for facts.

## Related

- ComfyUI (first 3090, port 8188) — Qwen Image 2.1 and Z-Image-Turbo were driven from Qwen-written prompts the same day.
- `Projects/discount/` — the deals-map research and the Claude vs Qwen comparison.
