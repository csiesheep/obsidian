---
title: csiesheep.com daily post plan (draft, not running yet)
status: running — scheduled task blog-daily-draft, every day 06:00 local (PST), created 2026-11-21
created: 2026-11-21
---

# Goal

1 public post per day on csiesheep.com. Claude finds the topics and drafts; the owner reads and decides. Nothing goes public without the owner.

# Daily loop

## Step 1. Find topics (about 10 min)

Sources, read-only, checked every day:

| Area | Where | What to look for |
|---|---|---|
| Vibe coding / AI | Hacker News front page, r/ClaudeAI, r/vibecoding, Threads (Chinese posts) | what people argue about this week: a new tool, a failure story, a number |
| Games | 4388 new/top, itch.io popular, Paradaily, r/WebGames, r/gamedev | a new web game that took off, a design trick, a launch story |
| Tech | Hacker News, Ars/The Verge headlines, PTT Soft_Job / Tech_Job | one story with a clear "so what" |
| Taiwan angle | Threads, Dcard, Paradaily | anything Chinese-language readers are already talking about |

Score each candidate 0-3 on four things and keep the top ones:
1. **We have first-hand material.** Our own games, the hub's 1,500+ game list, china_life numbers, our AI workflow. This is the most important one.
2. **A real question** ("is that true?", "why did it work?") rather than a news recap.
3. **Chinese-reading audience is already interested.**
4. **Not covered in our last 60 days** (check `topics-log.md`).

Anything scoring 0 on the first item is dropped. A post that only repeats a news story is the kind of "low-value content" AdSense rejects.

## Step 2. Write 3 drafts (csiesheep-perspective skill)

- Each draft: 1,500+ Chinese characters, csiesheep voice, a "real question" opening, sources linked, at least one number or screenshot from our own work, ends with "有錯請指正".
- Facts come only from fetched sources or our own data. No invented personal stories (this went wrong before and was fixed each time).
- One original image per post (our own screenshot or a chart), 400 px wide, no featured image.
- Each draft ends with an `owner_check` list: claims I could not verify, personal details, anything that needs the owner's word.
- Drafts saved to `Projects/blog/drafts/` with frontmatter `status: private (WP post N)`.

## Step 3. Upload as private

- Upload images, then create the post with `status: private`, no featured image, right category (AI / Game / CS).
- Private posts are not visible to the public or to search engines, so they cannot hurt the AdSense review while waiting.
- Send the owner a short message: 3 titles, one-line summary each, links to the private previews, plus the topic log entry.

## Step 4. Owner decides (not automated)

- Read the 3 private posts, edit in own voice, then change **Visibility → Public** on the one to publish (about 1 per day).
- The other two stay private as a reserve, or get deleted.

# Guardrails (to protect the AdSense review)

1. **Never publish automatically.** Always private first.
2. **Max 1 public post per day.** 14 posts in 3 weeks may have looked mass-produced already.
3. **Owner edit before public.** AI drafts pasted as-is are the risk; the skill and the plan note both say this.
4. **No duplicate angles:** a topic log (`topics-log.md`) with date, topic, post ID, outcome.
5. **No copying:** summarise and cite, never reproduce long passages from sources.
6. **Email when stuck:** if WordPress is logged out or Chrome is unreachable, send an email and stop, not retry silently (same rule as the other scheduled tasks).

# Open choices (need the owner)

1. "3 posts from the top topic": 3 angles on the same topic, or the top topic in each of 3 areas? **Recommended: top topic per area (vibe coding / games / tech)**, because 3 posts on the same topic overlap and look repetitive to a reviewer.
2. Run time: what time of day, in which timezone? **Recommended: 06:00 Bay Area time**, so the drafts are waiting in the morning.
3. Dry run: do the first batch today, now, before scheduling anything.

# Not included

- No auto-publishing, no social posting, no comments, no changes to site settings.

# Schedule (set up 2026-11-21)

- Task `blog-daily-draft`, cron `0 6 * * *` (local time, Bay Area; the app adds a few minutes of delay, first run 2026-11-22 about 06:08). File: `C:\Users\sheep\.claude\scheduled-tasks\blog-daily-draft\SKILL.md`.
- 1 draft per day (owner: "1 post per day"), saved as private. Drafts in `drafts/`, topic log in `topics-log.md`, run log in `daily-log.md`, converter in `tools/md2wp.mjs`.
- Uses the owner's original Chrome (deviceId fc855be5…, WordPress signed in) under the shared Chrome lock; emails csiegoat@gmail.com only when stuck (for example WordPress logged out).
- Runs only while the Claude app is open; if closed at 06:00 it runs on next launch.
- To stop it: disable the task in the app's Scheduled list.
