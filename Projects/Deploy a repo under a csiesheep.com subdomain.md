---
updated: 2026-08-08
tags: [runbook, cloudflare, hosting]
---
# Deploy a repo under a csiesheep.com subdomain (Cloudflare Workers + static assets)

Reference: [csiesheep/betrayal_sound_effect](https://github.com/csiesheep/betrayal_sound_effect)

`csiesheep.com`'s apex domain is a WordPress.com site, fronted by
Cloudflare (DNS lives on Cloudflare, but the origin is WordPress.com).
New static tools/games get their own GitHub repo, deployed via
Cloudflare's "Workers with static assets" pipeline, and exposed at
`<category>.csiesheep.com/<name>/` through a dedicated subdomain attached
directly to the Worker — this leaves the WordPress site completely
untouched.

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
- Decide the URL up front: `<category>.csiesheep.com/<name>/`
  (e.g. `games.csiesheep.com/betrayal_sound_effect/`). One subdomain per
  category (`games`, `tools`, ...) so multiple projects can eventually
  share it; one path segment per project.

## Steps
1. Scaffold the local project and init git:
   ```bash
   mkdir -p ~/code/<name>/{css,js,data,assets,src}
   cd ~/code/<name>
   git init && git branch -m main
   ```
   Add `index.html`, `css/style.css`, etc.

2. Create the GitHub repo and push:
   ```bash
   gh repo create csiesheep/<name> --public --source=. --remote=origin --push
   ```

3. Connect it to Cloudflare: dashboard → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git** → select the repo. Build command empty,
   output directory `/`.

   **Gotcha:** despite the "Pages" label, Cloudflare's current dashboard
   deploys this through the *Workers with static assets* pipeline
   (`npx wrangler deploy` under the hood) — you get a Worker named after
   the repo and a `<name>.<account>.workers.dev` URL, not a classic
   `*.pages.dev` Pages project. This actually works in our favor: routes
   and custom domains are native Worker features, so no separate router
   Worker is needed later.

4. **Lock down the asset upload immediately.** The default build uploads
   the *entire* working directory as public static assets — including
   `.git` and `.wrangler/tmp`. Confirmed the hard way: `curl
   https://<name>.<account>.workers.dev/.git/config` returned the repo's
   actual git config. Add an `.assetsignore` file at the repo root:
   ```
   .git
   .github
   .wrangler
   node_modules
   src
   ```
   (`src` excluded too, once step 6 adds a router script there — no
   reason to serve your own routing logic as a public asset.)

5. Commit the `wrangler.jsonc` config explicitly rather than letting
   Cloudflare regenerate it non-interactively on every build:
   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "<name>",
     "compatibility_date": "<today>",
     "main": "src/index.js",
     "observability": { "enabled": true },
     "assets": {
       "directory": ".",
       "binding": "ASSETS",
       "run_worker_first": true
     }
   }
   ```

6. Add a path-prefix router at `src/index.js`. `run_worker_first: true`
   makes every request hit this script before asset matching, so it can
   strip the `/​<name>` prefix and still work at the bare
   `*.workers.dev` root for testing:
   ```js
   const PREFIX = "/<name>";

   export default {
     async fetch(request, env) {
       const url = new URL(request.url);

       if (url.pathname === PREFIX || url.pathname.startsWith(PREFIX + "/")) {
         url.pathname = url.pathname.slice(PREFIX.length) || "/";
         request = new Request(url, request);
       }

       return env.ASSETS.fetch(request);
     },
   };
   ```

7. Commit and push `.assetsignore`, `wrangler.jsonc`, and `src/index.js`
   together — this triggers a redeploy.

8. Attach the subdomain: dashboard → the Worker → **Settings → Domains &
   Routes** → **Add** → **Custom Domain** → `<category>.csiesheep.com`.
   Cloudflare creates the DNS record and certificate automatically.

## Verify
```bash
# raw workers.dev root still works (unprefixed, for testing)
curl -sI https://<name>.<account>.workers.dev/

# prefixed path resolves correctly
curl -s https://<name>.<account>.workers.dev/<name>/

# a nested asset resolves through the prefix too
curl -sI https://<name>.<account>.workers.dev/<name>/css/style.css

# .git is NOT publicly exposed
curl -s -o /dev/null -w "%{http_code}\n" https://<name>.<account>.workers.dev/.git/config
# expect 404

# once the Custom Domain is attached and DNS/cert has propagated
curl -s https://<category>.csiesheep.com/<name>/
```

## Rollback / if it goes wrong
- Detach cleanly without touching WordPress: remove the Custom Domain (or
  Route) entry in **Settings → Domains & Routes** — the apex domain and
  WordPress are on a completely separate path and are never affected.
- Path on the apex domain instead of a subdomain (e.g.
  `csiesheep.com/games/<name>/*` via a Worker **Route**) was tried first
  and didn't intercept — requests fell straight through to the WordPress
  origin (404 from WordPress, confirmed via `host-header: WordPress.com`
  in the response). Root cause not fully diagnosed; the subdomain +
  Custom Domain approach avoided the issue entirely and is simpler to
  reason about, so that's the recommended default now.
- `.git` exposed publicly: add/fix `.assetsignore` (step 4) and push —
  takes effect on the next deploy within ~30–60s.

## Related
- [[betrayal_sound_effect]] design doc
- [Vault Setup Runbook](../Notes/Vault%20Setup%20Runbook.md) — same
  runbook format, different domain (this vault's own setup)
