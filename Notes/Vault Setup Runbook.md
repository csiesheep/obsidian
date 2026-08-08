---
updated: 2026-08-08
tags: [runbook]
---
# Setting up this Obsidian vault (from scratch, mirroring qh_obsidian)

Reference: [csiesheep/obsidian](https://github.com/csiesheep/obsidian)

How this personal vault (`C:\Users\sheep\code\obsidian`) was bootstrapped
from a fresh Obsidian install and synced to GitHub, following the same
structure and conventions as the work vault (`qh_obsidian`). Use this if
you ever need to set up another vault the same way, or want to remember
what's wired up and why.

## When to use
Reach for this when spinning up a new Obsidian vault that should follow
the same folder structure, templates, and Claude Code integration as this
one — or when troubleshooting why a piece (daily notes, git sync, `/log`)
isn't working, since it lists every moving part. Not needed for day-to-day
use of the vault, just its setup.

## Prerequisites
- Obsidian installed, vault folder created and opened at least once
  (so `.obsidian/` exists).
- An **empty** GitHub repo to sync to — verify with `git ls-remote <url>`
  before wiring anything up; an existing repo with commits will conflict.
- Claude Code available in the vault folder.

## Steps
1. Remove Obsidian's default starter content and create the folder
   structure (empty folders need a placeholder so git tracks them):
   ```bash
   rm -f Welcome.md
   mkdir -p Daily Notes Projects Templates
   touch Daily/.gitkeep Notes/.gitkeep Projects/.gitkeep
   ```
2. Add note templates to `Templates/` — `daily.md` (frontmatter + Focus/Log/
   Done/Blockers/Links sections) and `runbook.md` (this file's own template).
3. Add `.gitignore` so local-only/machine-specific files never get synced:
   ```
   .obsidian/workspace*.json
   .obsidian/cache
   .trash/
   .DS_Store
   .claude/settings.local.json
   ```
4. Install the **obsidian-git** community plugin by copying its plugin
   files (`main.js`, `manifest.json`, `styles.css`, `data.json`) into
   `.obsidian/plugins/obsidian-git/`, then enable it in
   `.obsidian/community-plugins.json`:
   ```json
   ["obsidian-git"]
   ```
5. Configure the core **Daily Notes** plugin by writing
   `.obsidian/daily-notes.json` directly (faster than the Settings UI):
   ```json
   {
     "folder": "Daily",
     "template": "Templates/daily",
     "format": "YYYY-MM-DD",
     "autorun": false
   }
   ```
6. Write `README.md` documenting the folder structure, note conventions,
   and the "contract" Claude Code follows when writing to the vault
   (daily note format, append-only logs, wikilinks, commit author).
7. Add the `/log` Claude Code slash command at
   `.claude/commands/log.md` — appends a timestamped bullet
   (`- HH:MM — <entry>`) to today's daily note, creating it from the
   template first if needed.
8. Initialize git, set the **local** (repo-only, not global) author
   identity, and point it at the empty GitHub repo:
   ```bash
   git init
   git config user.name "csiesheep"
   git config user.email "csiegoat@gmail.com"
   git remote add origin https://github.com/csiesheep/obsidian.git
   git branch -m main
   ```
9. Stage, commit, and push:
   ```bash
   git add -A
   git commit -m "Set up personal vault: structure, templates, obsidian-git, /log command"
   git push -u origin main
   ```
   Note: the push needs an interactive browser sign-in (Git Credential
   Manager), so run it from a normal terminal — it will hang/time out in
   a non-interactive shell.
10. In Obsidian, reload the app (or toggle the obsidian-git plugin off/on)
    so it picks up the newly installed plugin and daily-notes config.
11. Start a **new** Claude Code session in the vault folder so it picks up
    the newly added `.claude/commands/log.md` — project slash commands are
    only loaded at session start, so a session running from before the file
    existed won't see it.

## Verify
- `git ls-remote origin` shows the pushed commit's SHA on `refs/heads/main`.
- Obsidian's daily note ribbon icon opens/creates `Daily/YYYY-MM-DD.md`
  from `Templates/daily.md` without prompting for settings.
- Obsidian's status bar (bottom) shows the obsidian-git plugin (branch
  name / sync icon).
- In a fresh Claude Code session in the vault folder, `/log test` appends
  a bullet to today's daily note.

## Rollback / if it goes wrong
- Wrong/non-empty remote repo: don't push — `git remote set-url origin
  <correct-empty-repo-url>` before ever pushing, and double check with
  `git ls-remote` first.
- Plugin not showing in Obsidian: confirm files exist under
  `.obsidian/plugins/obsidian-git/` and the plugin is enabled in
  `.obsidian/community-plugins.json`, then restart Obsidian.
- `/log` not recognized: restart the Claude Code session in this folder.

## Related
- Structure and conventions mirrored from the work vault at
  `C:\Users\sheep\code\qh_obsidian` (`TaoyangFuQH/obsidian` on GitHub).
