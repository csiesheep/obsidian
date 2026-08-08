# Personal vault

My personal knowledge base, kept in Obsidian and synced to a private
GitHub repo (`csiesheep/obsidian`). Daily logs, project notes, general
notes, and scratch ideas. Written to by Claude Code and read/edited by me
in Obsidian.

## Structure

- `Daily/` — daily notes, one file per day: `Daily/YYYY-MM-DD.md`.
- `Projects/` — durable per-project notes: `Projects/<name>.md`.
- `Notes/` — general notes not tied to a single day or project
  (ideas, references, how-tos).
- `Templates/` — note templates (`daily.md`, `runbook.md`).

New top-level folders are fine as the vault grows; keep names short and
lowercase-ish, and prefer `[[wikilinks]]` over deep folder nesting.

## Conventions (the contract for Claude)

- **Daily notes** live in `Daily/YYYY-MM-DD.md` (ISO date). One file per day.
- When logging, **append a timestamped bullet** under the `## Log` heading of
  the target day's note: `- HH:MM — <entry>` (24h local time).
- If the day's file does not exist, create it from `Templates/daily.md`,
  substituting the date for `{{date}}`.
- **Project notes** go in `Projects/<name>.md`; **general notes** go in
  `Notes/<topic>.md`.
- Use `[[wikilinks]]` for projects, people, and other notes so backlinks
  connect everything.
- Never rewrite or reorder existing log entries; only append.
- Commit as author `csiesheep`.

## Obsidian setup

- **Daily Notes** core plugin is configured: folder `Daily/`, template
  `Templates/daily.md`, format `YYYY-MM-DD`.
- Backlinks show up automatically on `[[...]]` targets.
- Auto-sync to GitHub via the **Obsidian Git** plugin (5-min autosave,
  auto-pull on boot; push manually or enable an auto-push interval in
  plugin settings).

## Logging with Claude

Use the `/log` slash command in any Claude Code session:

```
/log finished setting up the new vault
```
