---
updated: 2026-09-04
tags: [runbook, claude-code, multi-agent, process]
---
# Agent team delivery — orchestrator + FE/BE peers

Reference project: [[jiangshi in the pocket]] — the leaderboard arc
(recorder → server-side replay → gate → ledger page → tabs → both
languages) was built this way end to end, across ~40 dispatches.

> [!important] The operational doc is the skill, not this note
> **`~/.claude/skills/agent-team-delivery/SKILL.md`** (769 lines) holds the
> dispatch template, handover format, verification steps, and a 20-entry
> failure catalogue. Invoke it with `/agent-team-delivery`, or it triggers
> on "派給 FE / BE", "幫我驗這個分支", "這個可以 land 嗎".
>
> **This note is the context and the index — do not copy the skill's
> contents here.** Two copies of a process go stale independently and both
> keep looking authoritative. If something below contradicts the skill,
> the skill wins.

## When to use

When one session cannot hold the work, or when several dependent threads
need to move at once. Not for making things *look* parallel: every new
session is a cold start that must rebuild context, so a thread is only
worth splitting off if it can run independently all the way to
"deliverable".

## The model in one screen

| Role | Owns | Never does |
|---|---|---|
| **Orchestrator** | priority, issues, dispatch, **independent verification**, merge & push, reporting to the owner | write product code — it destroys the independence that makes the verification worth anything |
| **Peer** (FE / BE / writer / simulator / artist) | implementation on its own branch + worktree, self-test, guards, handover | merge to main; resolve a conflict it did not create |

Every file has an owner. Cross-boundary edits are **allowed** but must be
declared in the handover so the orchestrator can route the ruling to the
file's owner. The worst case is not a merge conflict — it is two peers
quietly holding different versions of the same truth.

## The four things that actually made it work

**A dispatch carries the ruling *and its reasoning*.** A peer will hit
trade-offs you did not foresee; it can only decide well if it knows the
criterion. Constraints must say what goes wrong if broken — "this gate
must fail open, because hiding the button silently discards a record the
player earned, and a refusal is recoverable where an unoffered chance is
not."

**Two sentences, always paired.** "If you cannot do X, *report to me — do
not scale it down yourself*" (scope is the owner's call, not the peer's),
together with an explicit **what you may do without asking** table.
Giving only the first makes peers stop everywhere; one waited an hour and
then asked the *owner*, because from inside its session the human is its
user and the orchestrator is just an external message.

**The handover has a fixed shape**, and the most valuable line is *what I
could not verify*. When BE wrote "the D1 binding resolving inside the
isolate, D1's behaviour, and the routing cannot be tested until it
deploys", that named precisely — and only — what I had to do myself after
the deploy.

**Verification means making it go red.** Reading the code is not
verification and neither is a green suite. The only thing that counts is
breaking the *product* (never a fixture) and checking the guard fails, and
that its message says something true. Re-run the falsification after any
edit to the guard.

## What it cost to learn

Every one of these happened while working carefully — that is the point.
Full catalogue in the skill; these are the ones worth remembering as
stories.

- **A faithful replayer launders the bug.** Teaching the server-side
  verifier to match the product would have made the leaderboard *certify*
  fight-dodging under the authority of "the server replayed it". Ask what
  a checker is FOR before making it agree with the thing it checks.
- **A check that sources its expectation from its subject.** Extracting a
  column list from an INSERT and reading it back with the same list makes
  a swapped pair *cancel* — the sabotage stays green. Hit twice in one
  file. Test: *if I broke the rule, would the expectation break with it?*
- **Validating an instrument in the regime that works.** I offered "this
  column is perfectly linear" as proof my measurement was sound — but the
  linear column was the *overflowing* regime, and the fault only existed
  in the *fitting* one (`min-height:100vh` reports zero slack for anything
  that fits). Checking the working half says nothing about the broken one.
- **A true sentence with the wrong scope.** The measurement is real, so
  the conclusion feels earned, and the error is invisible from inside the
  claim. Fix: state what is *still* proved alongside what is not — a bare
  negative invites the reader to supply a bound, and they supply a larger
  one than the facts support. Applies to commits, handovers, issue
  comments, and verification reports equally.
- **Tests drive the engine; nobody renders the ending.** 280 tests and a
  bot farm shipped three false sentences on the verdict card; 399 tests
  shipped a stats strip with no separators. **Open the page before running
  the suite** for anything whose job is to be looked at.

## Still-open additions (not yet in the skill)

> [!note] Two lessons from 2026-09-04 that the skill does not yet carry
> **1. `no-store` does not bind a service worker.** It negotiates with the
> HTTP cache; the worker's fetch handler runs *first* and may answer from
> its own cache regardless. The fix must be **a URL that has never
> existed** (`?fresh=<stamp>`) — a politer header does not bind a party
> that never agreed to honour it.
>
> Ten-second signature, more useful than the mechanism: **if a red only
> goes away when you change origin (new port/host), the answer is coming
> from somewhere your request headers cannot reach.**
>
> It also cannot be reproduced locally here: `registerWorker()` bails off
> https/localhost, and `app.js` only calls `main()` when `#board` exists —
> both flip on the deployed origin. Same shape as the D1 binding: *a bug
> that can only exist where you cannot easily look.*
>
> **2. A probe's reading is not a claim about code you have not read.** I
> measured two of my own fetches (6291 bytes cached vs 6176 fresh), both
> numbers correct, and reported it as "the guard fetches without
> cache-busting" — a statement about a file I had not opened. `no-store`
> was already there; my recommended fix was a no-op that would have left
> the hole open while both of us believed it closed. A variant of "true
> sentence, wrong scope", except it went out as an *instruction to change
> code* rather than sitting in a comment.

## Housekeeping

The skill currently has two sections numbered 八 (`八、對 peer 說話的方式`
and `八之二、授權…`). Cosmetic; renumber if it is ever edited heavily.

## Related

- [[jiangshi in the pocket]] — the project this was distilled from
- [[Vault Setup Runbook]] — how this vault and its Claude Code wiring work
