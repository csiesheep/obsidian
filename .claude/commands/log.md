---
description: Append a timestamped log entry to today's daily note
---

Append a timestamped bullet to today's daily note in this vault, following the conventions in README.md:

1. Determine today's date (ISO format, `YYYY-MM-DD`) and the current local time (`HH:MM`, 24h).
2. If `Daily/<today>.md` does not exist, create it from `Templates/daily.md`, substituting the date for `{{date}}`.
3. Append a new bullet under the `## Log` heading: `- HH:MM — <entry>`.
4. Never rewrite or reorder existing log entries — only append.

Entry text: $ARGUMENTS
