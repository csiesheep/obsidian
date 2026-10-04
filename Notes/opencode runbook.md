---
updated: 2026-10-04
tags: [runbook, llm, local-ai, opencode, llama-cpp, tailscale]
---
# opencode — coding agent on local Qwen, usable from the iPhone

[opencode](https://opencode.ai) (open-source coding agent, like Claude Code) running on the PC
against the local Qwen3.8-27B server ([[qwen 3.8 local llm runbook]]). Its **web UI** is published
on my tailnet so I can drive it from the iPhone: read/edit files and run commands on the PC.
Set up 2026-10-03/04.

## Quick use

| Want to | Do |
|---|---|
| Use it from the iPhone | Tailscale app on → Safari → https://desktop-r2u3mdm.tail528148.ts.net/ → user `opencode`, password below → Add to Home Screen |
| Use it on the PC (browser) | http://127.0.0.1:4096 (same login) |
| Use it on the PC (terminal) | new terminal → `cd` to a project → `opencode` (TUI) |
| One-shot from a script | `opencode run "your prompt"` |
| Start (Qwen + opencode + routes) | double-click `C:\llama.cpp\start-opencode-remote.bat` — normally not needed, it **starts at logon** |
| Stop opencode | `C:\llama.cpp\stop-opencode-remote.bat` (leaves Qwen running; `stop-qwen.bat` for that) |
| Password | `C:\Users\sheep\.config\opencode\remote-password.txt` (random, 24 chars) — to change it see below |
| Log | `C:\llama.cpp\opencode.log`; logon-task output: `C:\llama.cpp\autostart.log` |

The web UI opens in `C:\Users\sheep\code`; other folders can be opened from the UI.

## What is installed

| Thing | Where | Notes |
|---|---|---|
| opencode 1.18.34 | `C:\opencode\` (`npm i -g --prefix C:\opencode opencode-ai`) | `C:\opencode` is on the user PATH. **Not** in `AppData\Roaming\npm` — see gotchas |
| Config | `C:\Users\sheep\.config\opencode\opencode.json` | provider `llamacpp` → `http://127.0.0.1:8080/v1`, model `qwen3.8-27b-uncensored`, 128K context, 32K output, tools/reasoning/images on; `share` disabled, `autoupdate` off |
| Launcher | `C:\llama.cpp\start-opencode-remote.ps1/.bat`, `stop-opencode-remote.bat` | starts Qwen first if it's down, then `opencode serve` hidden via WMI on `127.0.0.1:4096` with `OPENCODE_SERVER_PASSWORD`, then sets the tailnet routes |
| Logon task | Task Scheduler → **"Qwen + opencode (start at logon)"** | 30 s after I log in, runs hidden: (1) this launcher, (2) `comfy-studio\start-studio-hidden.ps1`; 10-min limit; output to `autostart.log`. ComfyUI is not in it |

## Tailnet routes (since 2026-10-04)

```
https://desktop-r2u3mdm.tail528148.ts.net        (tailnet only)
|-- /        proxy http://127.0.0.1:4096   ← opencode
|-- /video   proxy http://127.0.0.1:8190/legacy-video
|-- /studio  proxy http://127.0.0.1:8190

https://desktop-r2u3mdm.tail528148.ts.net:8443   (tailnet only)
|-- /        proxy http://127.0.0.1:8080   ← Qwen chat page + API (was at / before)
```

- opencode has to be at the site **root**: its UI loads `/assets/...` and calls `/session`, `/config`,
  ... with absolute paths and has no base-path option, so `/opencode/` would load a blank page.
  That is why Qwen moved to `:8443`.
- opencode itself listens only on `127.0.0.1`; Tailscale + the password are the only gate.
  Not Funnel (not public).

## Changing the password

The launcher reads `C:\Users\sheep\.config\opencode\remote-password.txt` each time it starts opencode.

1. Either put your own password in that file (one line), **or** delete the file to get a new random one.
   Use letters, digits, `-` and `_` only: the launcher passes it through `cmd`, so `& | < > ^ % "` break it.
2. Run `stop-opencode-remote.bat`, then `start-opencode-remote.bat` (the running server keeps the old one until restarted).
3. Re-enter it on the iPhone (Safari asks again; update the password manager).

## Security

Anyone who gets in can **read/edit any file and run any command on the PC as me**. Gates:
my tailnet only (devices signed in as `csiegoat@`) + HTTP basic auth (user `opencode`).
No sharing of the tailnet device, no Funnel. Unauthenticated requests get `401` (tested).

## Tests (2026-10-03/04)

- `opencode run` on the PC: Qwen called the bash tool (`echo opencode-ok`) and returned the output, 30 s.
- Through the tailnet URL: no password → 401; with password → UI page + JS assets 200;
  API session + prompt → Qwen answered (~20 s).
- Logon task: stopped Qwen + opencode, ran the task → both came back (Qwen loaded in ~1 min),
  task result 0, prompt answered through the tailnet URL.
- Not yet tested from the iPhone itself at the time of writing.

## Gotchas found along the way

- **npm installs from the Claude desktop app go into its private MSIX copy of AppData.**
  `npm i -g` run by Claude landed in
  `AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\npm` — visible to the app,
  invisible to everything else (WMI/Task Scheduler said "The system cannot find the path
  specified"). Fix: install outside AppData (`C:\opencode`). Same cause as the H3 skill's
  scratch-folder problem in [[qwen 3.8 local llm runbook]].
- **Launch `opencode.exe`, not the npm `.cmd` shim**, from the WMI launcher.
- **Windows PowerShell 5.1** (what `.bat` files run) has no `RandomNumberGenerator.Fill` — use
  `RandomNumberGenerator.Create().GetBytes()`.
- **"Server unavailable — Unexpected token '<', "<!doctype"... is not valid JSON"** right after
  the route swap: the browser still had the **old Qwen chat page** cached at `/`; its `/props`
  call now reached opencode, which returned HTML. Hard refresh (Ctrl+Shift+R) / new Safari tab /
  re-add the home-screen icon. Qwen's chat page is at `:8443` now.
- One Qwen request at a time: opencode, `claude-qwen`, the studio and the phone share it.
- Qwen thinks by default; first reply in a new session can take a while.

## Change log

| Date | Change |
|---|---|
| 2026-10-03 | opencode 1.18.34 installed, `llamacpp` provider config, tested with a tool call |
| 2026-10-03 | Moved install to `C:\opencode` (MSIX AppData virtualization); launcher + password; tailnet route on `:8443` |
| 2026-10-04 | Swapped routes: opencode at `/`, Qwen to `:8443` |
| 2026-10-04 | Logon task "Qwen + opencode (start at logon)" — tested from cold |
| 2026-10-04 | Comfy Studio added to the logon task as a second action — tested |

## Related

- [[qwen 3.8 local llm runbook]] — the model server, `claude-qwen`, H3 Video Studio.
