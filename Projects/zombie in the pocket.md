---
tags: [project]
status: research
started: 2026-08-13
---
# zombie in the pocket

## Overview
- Planned web implementation of the print-and-play solo board game
  *Zombie in my Pocket* (2007) by **Jeremiah Lee**.
- Same house/tile-exploration + midnight timer loop, delivered as a
  browser game. Likely sibling to [[betrayal sound board]] under
  `games.csiesheep.com`, and would carry [[google adsense|AdSense]].
- **Status: legal/licensing research done, not started building.**

## Source material

The original PnP is free and fully available — 16 tiles, 9 development
cards, ~4 printed pages, 5–20 min solo play. Find the zombie totem,
bury it in the backyard graveyard before midnight.

- [BGG entry (33468)](https://boardgamegeek.com/boardgame/33468/zombie-in-my-pocket)
- [Complete Game Package (revised) — filepage 32541](https://boardgamegeek.com/filepage/32541/zombie-in-my-pocket-complete-game-package-revised)
- [Direct rules PDF (funmines.com)](http://funmines.com/wp-content/uploads/2014/12/zimp.pdf)
- [BGG wiki — full variant list](https://boardgamegeek.com/wiki/page/Zombie_in_my_Pocket)

⚠️ **Two different games share the name.** The free PnP is BGG **33468**.
There is a separate commercial 1–8 player edition published by Cambridge
Games Factory at BGG **41372** — different rights holder, don't conflate.

## Licensing — the key constraint

The PnP is licensed **CC BY-NC-SA 3.0**, with the designer's own note:

> "Share, re-theme then share, gift, re-make, but **don't sell or make
> non-paper versions without asking**."

A web game is precisely a "non-paper version," and ads are commercial
use, so both halves of that sentence apply to this project.

| Approach | Ads OK? | Notes |
|---|---|---|
| Lift their art / card text / name, add ads | ❌ | Breaks NC outright. ShareAlike would also force the whole derivative under BY-NC-SA — incompatible with an ad-supported closed build. |
| Clean-room: own name, own art, own rewritten text | ✅ | Game **mechanics and rules systems aren't copyrightable** — only their expression is. Solid ground regardless of the license. |
| Own assets **+ written permission from Lee** | ✅ | Friendliest option; lets us credit the original openly. He's historically permissive — dozens of sanctioned "…in my Pocket" variants, plus Android and Steam Workshop ports exist. |

⚠️ **Rename before shipping.** "Zombie in The Pocket" is confusingly
close to an established title that has a commercial edition. Pick a
clearly distinct name (this note keeps the working title only).

*Not legal advice — if real revenue is attached, run it past an IP
attorney.*

## Decisions
- **2026-08-13** — Go clean-room: original theme, art and rule text;
  new title. Send Lee a courtesy email anyway, mentioning monetization
  up front. Both, not either/or.

## Next steps
- [x] Pull the full ruleset into a structured spec to code against →
      [[zombie in the pocket - ruleset spec]]
- [x] Verify the spec against the official PDF art — done 2026-08-13,
      found 4 errors in the third-party port, one of them fatal. Spec is
      now first-party verified; 3 design rulings left to make.
- [ ] Decide replacement theme + title
- [ ] Email Jeremiah Lee for permission / blessing
- [ ] Scaffold repo (follow the [[betrayal sound board]] pattern:
      static HTML/CSS/vanilla JS, Cloudflare Worker, `games.csiesheep.com`)
- [ ] SEO tiers + AdSense — reuse the [[google adsense]] playbook

## Log
- 2026-08-13 — researched rules availability + licensing; confirmed
  CC BY-NC-SA 3.0 and the "non-paper versions" clause. See [[2026-08-13]].
- 2026-08-13 — full mechanical spec written up in
  [[zombie in the pocket - ruleset spec]]: constants, board/tile model,
  9-card dev deck matrix, items, turn sequence, combat, time track,
  win/lose. Rules text from a complete transcription; tile exits and
  card contents initially reconstructed from the PatrickKennedy/zombies
  JS port.
- 2026-08-13 — eyeballed the image-only PDF page by page in the browser
  and verified every tile edge and all 9 dev cards against the art.
  **4 errors found in the JS port**, incl. a fatal one (Patio listed
  with a single exit, which would have made the whole outdoor half of
  the map unreachable). Spec corrected and now first-party verified;
  only 3 genuine design rulings remain open.

## Links
- [BGG entry](https://boardgamegeek.com/boardgame/33468/zombie-in-my-pocket)
- [Fun Mines writeup](https://funmines.com/zimp/)
- [PNP+ — verbatim license statement](https://pnpplus.wordpress.com/2014/05/15/zombie-in-my-pocket/)
- [CC BY-NC-SA 3.0 deed](http://creativecommons.org/licenses/by-nc-sa/3.0/)
