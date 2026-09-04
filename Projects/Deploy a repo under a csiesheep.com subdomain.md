---
updated: 2026-09-04
tags: [runbook, cloudflare, hosting]
---
# Deploy a repo under a csiesheep.com subdomain (Cloudflare Workers + static assets)

Reference: [csiesheep/oops_inc](https://github.com/csiesheep/oops_inc) —
the most current example. Older ones:
[betrayal_sound_effect](https://github.com/csiesheep/betrayal_sound_effect),
[jiangshi_in_the_pocket](https://github.com/csiesheep/jiangshi_in_the_pocket),
[elevator_inc](https://github.com/csiesheep/elevator_inc).

`csiesheep.com`'s apex domain is a WordPress.com site, fronted by
Cloudflare (DNS lives on Cloudflare, but the origin is WordPress.com).
New static tools/games get their own GitHub repo, deployed via
Cloudflare's "Workers with static assets" pipeline, and exposed at
`<category>.csiesheep.com/<name>/` — this leaves the WordPress site
completely untouched.

## Architecture (changed 2026-09 — read this before following old steps)

The subdomain is **shared by many Workers**, not owned by one:

- One **hub Worker** holds the bare hostname as its Custom Domain.
  For games that's the `games` Worker ([csiesheep/games](https://github.com/csiesheep/games)),
  which serves the index page listing every game.
- Each project is its **own Worker**, attached to the same hostname by
  **path-scoped Routes declared in its `wrangler.jsonc`**. Cloudflare
  matches the most specific route first, so `games.csiesheep.com/oops_inc*`
  peels those requests off the hub.

Live examples of this shape, all on `games.csiesheep.com`:

| Path | Worker | Repo |
|---|---|---|
| `/` | `games` | `csiesheep/games` |
| `/oops_inc/` | `oops-inc` | `csiesheep/oops_inc` |
| `/jiangshi_in_the_pocket/` | `jiangshi-in-the-pocket` | `csiesheep/jiangshi_in_the_pocket` |
| `/zombie_in_the_pocket/` | `zombie-in-the-pocket` | `csiesheep/zombie_in_the_pocket` |
| `/elevator_inc/` | `elevator-inc` | `csiesheep/elevator_inc` |

**Do not attach `<category>.csiesheep.com` as a Custom Domain on a new
project Worker.** A hostname's Custom Domain belongs to exactly one
Worker; taking it would break the hub and every sibling. Custom Domain is
only for the *first* Worker on a *brand-new* subdomain (i.e. when creating
a new category hub).

## When to use
When adding a new static (HTML/CSS/vanilla JS, no backend) project that
should live at its own URL under `csiesheep.com` — e.g. a game or tool.
Not for anything needing a database or server-side logic; that needs a
different hosting approach.

## Prerequisites
- `gh` CLI installed and authenticated (`gh auth status`; install via
  `winget install --id GitHub.cli -e` if missing).
- Repo name doesn't already exist under the `csiesheep` GitHub account.
- Access to the Cloudflare dashboard for the `csiesheep.com` zone.
- Decide the URL up front: `<category>.csiesheep.com/<path>/`. One
  subdomain per category (`games`, `tools`, ...); one path segment per
  project. The path segment is just the `PREFIX` constant in
  `src/index.js` — it's **independent of the repo / Worker name** and can
  be changed later on its own (`betrayal_sound_effect` serves at
  `/betrayal_sound_board/`).
- Check what already holds the subdomain before starting:
  ```bash
  curl -sI https://games.csiesheep.com/          # hub alive?
  curl -sI https://games.csiesheep.com/<name>/   # path free? expect 404
  ```

## Steps
1. Scaffold the local project and init git:
   ```bash
   mkdir -p ~/code/<name>/{css,js,src}
   cd ~/code/<name>
   git init && git branch -m main
   ```

2. Create the GitHub repo and push:
   ```bash
   gh repo create csiesheep/<name> --public --source=. --remote=origin --push
   ```

3. **Lock down the asset upload before the first deploy.** The build
   uploads the *entire* working directory as public static assets —
   including `.git`. Confirmed the hard way once: `curl
   https://<name>.<account>.workers.dev/.git/config` returned the repo's
   real git config. Add `.assetsignore` at the repo root:
   ```
   .git
   .github
   .claude
   .wrangler
   node_modules
   src
   README.md
   wrangler.jsonc
   .gitattributes
   .gitignore
   .assetsignore
   ```
   (`src` is excluded because there's no reason to serve your own routing
   logic as a public asset.)

4. Commit `wrangler.jsonc` explicitly — including the **routes** — rather
   than letting Cloudflare regenerate it per build. The routes are what
   attach the Worker to the shared hostname:
   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "<worker-name>",          // hyphens by convention; repo uses underscores
     "compatibility_date": "<today>",
     "main": "src/index.js",
     "observability": { "enabled": true },
     // Path-scoped Routes, NOT a Custom Domain — the hub Worker holds that.
     // Two patterns: `/*` does not match the bare prefix, and the bare
     // prefix is what src/index.js redirects to the trailing-slash form.
     "routes": [
       { "pattern": "games.csiesheep.com/<name>",   "zone_name": "csiesheep.com" },
       { "pattern": "games.csiesheep.com/<name>/*", "zone_name": "csiesheep.com" }
     ],
     "assets": {
       "directory": ".",
       "binding": "ASSETS",
       "run_worker_first": true
     }
   }
   ```

5. Add the path-prefix router at `src/index.js`. **Copy it from
   `oops_inc` and change `PREFIX`** — that version carries two fixes found
   in production, both of which are easy to miss when writing it fresh:

   - **Bare prefix → trailing slash.** `/<name>` must 301 to `/<name>/`,
     or relative hrefs (`css/style.css`) resolve against the host root and
     404 on the hub.
   - **Re-prefix same-origin redirects.** The static-asset handler builds
     `Location` from the *stripped* URL, so `/<name>/game.html` would
     redirect to a bare `/game`, escaping the Worker. Put the prefix back
     on any same-origin redirect it hands you.

   `run_worker_first: true` sends every request through this script before
   asset matching, so the same build also works at the bare
   `*.workers.dev` root for testing.

6. Commit and push `.assetsignore`, `wrangler.jsonc`, and `src/index.js`.

7. Connect the repo: dashboard → **Workers & Pages** → **Create
   application** → **Continue with GitHub** → pick the repo → **Deploy**.
   Defaults are correct: build command empty, deploy command
   `npx wrangler deploy`, root directory `/`. The routes in
   `wrangler.jsonc` are applied by that deploy — **no dashboard step is
   needed to attach the URL**, and none should be taken.

   Later pushes to `main` redeploy automatically.

8. Add a card for it in the hub repo (`csiesheep/games`) so it's reachable
   from `games.csiesheep.com` — a Worker on a route is live but invisible
   until the hub links to it.

## Verify
```bash
# the path itself
curl -s https://games.csiesheep.com/<name>/ | grep -o "<title>[^<]*</title>"

# nested assets resolve through the prefix
curl -sI https://games.csiesheep.com/<name>/css/style.css

# bare prefix redirects to the trailing-slash form (expect 301)
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://games.csiesheep.com/<name>

# .git and src are NOT public (expect 404 each)
curl -s -o /dev/null -w "%{http_code}\n" https://games.csiesheep.com/<name>/.git/config
curl -s -o /dev/null -w "%{http_code}\n" https://games.csiesheep.com/<name>/src/index.js

# the hub and every sibling still work — the point of route-scoping
for u in / /oops_inc/ /jiangshi_in_the_pocket/ /zombie_in_the_pocket/ /elevator_inc/; do
  printf "%-28s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://games.csiesheep.com$u)"
done
```
A first deploy takes roughly 40–60s from clicking Deploy to the path
answering 200; polling the URL is faster than watching the build log.

## Gotchas
- Deep-linking the dashboard's own URLs (`/workers-and-pages/create`,
  `/workers/services/view/<name>/...`) often renders blank — it's an SPA.
  Navigate to `Workers & Pages` and click through instead.
- The Worker name and the repo name differ by convention (hyphens vs
  underscores). The dashboard derives the project name from the repo, so
  keep `name` in `wrangler.jsonc` matching what you want the Worker called.

## Rollback / if it goes wrong
- Remove the project cleanly: delete its two Route entries (or the whole
  Worker). The hub, the siblings, the apex domain and WordPress are all on
  separate paths and are never affected.
- `.git` exposed publicly: add/fix `.assetsignore` and push — takes effect
  on the next deploy within ~30–60s.
- Path on the apex domain (e.g. `csiesheep.com/games/<name>/*` via a
  Route) was tried once and didn't intercept — requests fell through to
  the WordPress origin. Root cause never diagnosed; the subdomain approach
  avoids it entirely.

## Related
- [[incremental game ideas]] — Elevator Inc. design doc, deployed this way
- [[betrayal sound board]] design doc
- [Vault Setup Runbook](../Notes/Vault%20Setup%20Runbook.md) — same
  runbook format, different domain (this vault's own setup)
