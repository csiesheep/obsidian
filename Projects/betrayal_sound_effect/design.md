---
updated: 2026-08-08
tags: [project, betrayal-sound-effect]
---
# Betrayal at House on the Hill — Sound & Music Board: Implementation Plan

Source: [Notion doc](https://app.notion.com/p/App-sound-effect-for-betrayal-of-the-house-on-the-hill-3b437f0b74e2809eaf98d5bd7e2b7316)

A fan-made web app that plays royalty-free sound effects and background
music themed around *Betrayal at House on the Hill* (3rd Edition), with
looping and mixing, hosted for free with ads + donations as revenue.

---

## 1. Legal/IP considerations (read this first)

*Betrayal at House on the Hill* is a trademark of Hasbro/Avalon Hill. This affects two things:

- **Trademark risk.** You can reference the game's name factually ("sounds for fans of Betrayal at House on the Hill") but shouldn't imply official endorsement, use Hasbro's logo, or reproduce their card/room artwork or exact card text. Put a visible disclaimer on every page: *"Unofficial fan project. Not affiliated with or endorsed by Hasbro/Avalon Hill. [Game name] is a trademark of Hasbro, Inc."*
- **AdSense risk.** Google's publisher policies prohibit monetizing pages built around copyrighted material you don't own, and reviewers sometimes flag fan sites for this. Keep the site's actual content (audio files, code, descriptions) 100% original/royalty-free, use the game's name only descriptively (not as a headline trademark-style logo), and don't upload any scanned card art or rulebook text. If AdSense rejects you, **Ezoic** and **Media.net** are more fan-site-tolerant alternatives, and you can launch on donations alone in the meantime.

This isn't legal advice — if you want certainty, a quick read of Hasbro's fan-content stance or a lawyer's opinion is worth it before you monetize at scale.

---

## 2. Content inventory (3rd Edition base game)

Use this as your sound-tagging taxonomy. Sourced from the official 3rd-edition rulebook and the dedicated 3rd-edition fan wiki.

**Rooms, by region** (3rd edition redesigned many tiles to work on multiple floors):

| Region | Rooms |
|---|---|
| Starting tiles | Entrance Hall, Hallway, Ground Floor Staircase, Upper Landing, Basement Landing |
| Ground Floor only | Chapel, Conservatory, Dining Room, Graveyard, Kitchen, Laboratory, Larder, Laundry Chute |
| Upper Floor only | Gallery, Observatory, Statuary Corridor, Tower |
| Basement only | Catacombs, Chasm, Furnace Room, Panic Room, Ritual Room, Secret Staircase, Underground Cavern, Underground Lake, Vault |
| Ground + Basement | Armory, Gymnasium |
| Upper + Ground | Bloody Room, Charred Room, Collapsed Room, Guest Quarters, Junk Room, Library, Primary Bedroom, Salon, Specimen Room, Winter Bedroom |
| Upper + Basement | Crawlspace, Game Room, Nursery, Operating Theatre, Organ Room, Soundproofed Room |
| All three floors | Cramped Passageway, Mystic Elevator |

**The 12 heroes** (any can become the traitor, depending on the haunt): Josef "Brosef" Hooper, Oliver Swift, Stephanie Richter, Persephone Puleri, Sammy Angler, Jaden Jones, Isa Valencia, Anita Hernandez, Father Warren Leung, Dan Nguyen M.D., Michelle Monroe, Brittani "Beat Box" Bowen.

There's no fixed "traitor" roster — one hero secretly turns, some haunts have no traitor, some are free-for-all. Build a generic "Traitor Reveal" sting rather than 12 individual traitor stingers, unless you want to go deep.

**Monsters.** No official master list is published for the game itself (they're revealed haunt-by-haunt across all 50 scenarios). Betrayal-confirmed so far: Zombie, Ghost, Werewolf, Vampire, Giant Wasp, Ghost Shark, Security Robot, Bakeneko, Giant Hair Monster, Spirit, Head of the House. Since a soundboard benefits from broader coverage anyway, round this out with 30 common horror-movie monster archetypes, grouped for sound design:

| Category | Monsters |
|---|---|
| Undead | Zombie, Vampire, Mummy, Skeleton, Ghoul, Revenant |
| Ghosts/spirits | Ghost, Poltergeist, Banshee, Shadow Figure, Possessed Doll, Demon |
| Shapeshifters/cryptids | Werewolf, Witch, Gargoyle, Doppelganger, Chupacabra, Yeti/Bigfoot-type creature |
| Human/slasher | Masked Slasher, Chainsaw Maniac, Killer Clown, Cultist, Plague Doctor, Grim Reaper |
| Creatures/swarms | Giant Spider, Rat Swarm, Bat Swarm, Locust/Insect Swarm, Hellhound, Sea Monster/Kraken |
| Body-horror/other | Frankenstein's-Monster-type Creation, Scarecrow |

**Haunt mechanic:** 50 haunts total, split across the *Secrets of Survival* (hero) and *Traitor's Tome* (traitor) books, triggered by an Omen draw + dice roll. Four haunt types: No Traitor, One Traitor, Hidden Traitor, Free-for-All. (Not building a per-haunt sound map — out of scope for this project.)

**Card decks (Omen / Item / Event) — 74 cards total in the base game:**

**Omens — 9 total.** Drawing one of these is what forces the haunt-roll: Armor, Book, Dagger, Dog, Holy Symbol, Idol, Mask, Ring, Skull.

**Items — 22 total.**
- Non-weapon (17): Angel's Feather, Brooch, Creepy Doll, First Aid Kit, Flashlight, Headphones, Leather Jacket, Lucky Coin, Magic Camera, Map, Mirror, Mystical Stopwatch, Necklace of Teeth, Rabbit's Foot, Skeleton Key, Strange Amulet, Strange Medicine.
- Weapons (5): Machete, Chainsaw, Gun, Crossbow, Dynamite — see the combat SFX table below.

**Events — 43 total. 🔲 TODO: only 3 of 43 names confirmed.** Confirmed from the rulebook: Flickering Lights, Wandering Ghost, Funeral. No public source (fandom wiki, BGG) has the remaining ~40 names indexed or archived. **Action needed:** transcribe the rest from your own physical Event card deck, then send the list back to fold into this doc. Until then, build 2–3 generic Event stings ("eerie atmosphere," "sudden danger/trap," "beneficial/lucky") to cover the deck.

**Note on weapons:** 3rd edition trimmed the weapon roster down to just 5 cards. Older-edition weapons like Baseball Bat, Kitchen Knife, Shotgun, Axe, Rope, Spear, or Sword are **not** in the current 3rd-edition base game — so a "spear" sound effect wouldn't currently have a card to attach to unless you're covering an expansion or an older edition.

**Weapon combat sound effects (the 5 base-game weapons):**

| Weapon | Type | Suggested SFX |
|---|---|---|
| Machete | Melee/bladed | Blade swing + slash impact |
| Chainsaw | Melee/power tool | Rev-up + idle/revving loop + tearing impact |
| Gun | Ranged/firearm | Gunshot + shell-casing drop |
| Crossbow | Ranged/projectile | Bowstring release + bolt thud |
| Dynamite | Ranged/thrown-explosive | Fuse sizzle + explosion |

Also add weapon-agnostic combat SFX: unarmed punch/hit, miss/whiff, critical-hit sting, character-down groan.

**Recommended sound categories to build:**
1. Room ambiences (one loopable ambience per room, or grouped by room "mood": creepy, mechanical, damp/basement, opulent/upper floor)
2. Room-entry stingers (a short sting when a new/dangerous room tile is revealed)
3. Character stings (light, optional — footsteps or a short cue per hero)
4. Monster stings (a signature sound per monster type when it appears/attacks)
5. Traitor reveal sting (dramatic reveal cue)
6. Card-draw stings (a distinct "sting" per deck: Omen chime, Item pickup, Event danger/eerie cue)
7. Weapon/combat SFX (5 weapon-specific cues above + generic hit/miss/critical/down sounds)
8. Haunt-start sting (the big dramatic moment when the haunt begins)
9. Background music beds (3–5 looping haunted-house tracks: exploration/ambient, tense/haunt-active, combat, victory, defeat)

---

## 3. Sourcing royalty-free audio

Track every asset in a spreadsheet (source, license type, attribution required Y/N, URL, date downloaded) — this is your legal paper trail and takes 30 seconds per file.

**Sound effects:**
- **Pixabay** (pixabay.com/sound-effects) — Pixabay Content License, no attribution required, free for commercial use. Best default source.
- **Freesound.org** — huge community library, but licenses vary per file (CC0, CC-BY, CC-BY-NC). Filter search by CC0 to skip attribution tracking.
- **Zapsplat** — free tier requires attribution (or a small one-time donation removes it); very well-organized horror category.

**Background music:**
- **Pixabay Music** (pixabay.com/music) — same no-attribution license as their SFX.
- **Free Music Archive** / **Chosic** — filter for CC0 or CC-BY horror/dark-ambient tracks.
- **Fesliyan Studios** — free with attribution, or a low-cost license to remove it.
- **Kevin MacLeod (incompetech.com)** — huge dark-ambient catalog, CC-BY, attribution required in a credits page.

Plan for roughly 60–90 short SFX (rooms + monsters + stings) and 5–8 longer music beds (2–5 min, designed to loop seamlessly) for a full first version.

---

## 4. Site architecture

**Recommended stack: a static site (HTML/CSS/vanilla JS) using the Web Audio API.** No backend, no database, no build step — the entire feature set (looping, mixing, sound board) runs client-side in the browser. This is the simplest thing that fully satisfies your requirements, it's free to host, and it's easy for you to hand-edit later even without a dev background.

```
/ (repo root)
  index.html              → landing/soundboard page
  /assets/audio/sfx/      → short one-shot sounds, organized by category folder
  /assets/audio/music/    → looping background tracks
  /data/sounds.json        → metadata: {id, title, category, room/monster tag, file, license, attribution}
  /css/style.css
  /js/app.js               → renders soundboard from sounds.json, wires up controls
  /js/audio-engine.js       → Web Audio API mixer (see below)
  /about.html, /privacy.html, /contact.html  → required for AdSense approval
```

**Why not React/a framework:** you don't need routing, state management, or a component library for a sound board — it's a grid of buttons and sliders. A framework adds a build step and hosting complexity for no functional gain here. If the site grows later (user accounts, saved mixes, a search/filter backend), revisit then.

---

## 5. Functionality: looping + mixing

Both are native Web Audio API features — no paid libraries needed (Howler.js is a nice optional wrapper if you want less boilerplate).

- **Looping:** each background-music track gets its own `<audio>` element or `AudioBufferSourceNode` with `loop = true`; loop points can be trimmed in code if the source file has a bad seam.
- **Mixing:** route every sound through a per-sound `GainNode` → a category `GainNode` (SFX bus, Music bus) → a master `GainNode` → output. Each bus gets a volume slider in the UI. This lets a user, e.g., layer "Basement ambience" + "distant footsteps" + "clock ticking" simultaneously, each independently adjustable, like a DJ mixer for the haunted house.
- **UI pattern:** a soundboard grid (click to play a one-shot SFX) plus a persistent "Now Playing" mixer tray at the bottom (shows active loops with individual volume sliders and a stop button per layer). Add a "Save this mix" (just a shareable URL with query params, e.g. `?tracks=basement-amb,clock-tick,footsteps`) — no backend needed since it's static site.

---

## 6. Hosting

Any static host works with AdSense — ads are just a `<script>` tag, they don't care what's serving the HTML. Recommended: **Cloudflare Pages** or **Netlify** (both free tier: unlimited bandwidth-ish, free SSL, custom domain support, auto-deploy from a GitHub repo on every push). GitHub Pages is a fine free fallback if you want to keep everything inside one GitHub account.

Buy a cheap domain (~$10–15/yr, e.g. via Namecheap or Cloudflare Registrar) — a real domain (not a `.netlify.app` subdomain) is effectively required for AdSense approval and looks more legitimate for donations too.

---

## 7. Monetization

- **Google AdSense**: apply only once the site has real content (aim for the full sound library, not a placeholder page), an About/Privacy/Contact page, and has been live a few weeks. Place ads in obviously "ad" slots (sidebar, between sections) — never disguise them as soundboard buttons, which violates policy. Budget for possible rejection on the first pass; iterate on the feedback.
- **Donations**: set up **Ko-fi** or **Buy Me a Coffee** (both free, take ~0–5% fees, embed as a button/widget) as your fallback/primary revenue if AdSense is slow or rejects you. Frame it as "help cover hosting/domain costs," which is honest and low-pressure.
- **Fallback ad networks** if AdSense says no: Ezoic (needs more traffic), Media.net, or simply launch donation-only and re-apply to AdSense after a few months of traffic history.

---

## 8. Phased roadmap

1. **Content prep (1–2 weeks):** build the `sounds.json` taxonomy from Section 2, source and license-track ~20 SFX + 2 music beds (enough for an MVP), write the disclaimer/About/Privacy/Contact copy.
2. **MVP build:** static site with a working soundboard grid + mixer tray for the MVP asset set. Deploy to Cloudflare Pages/Netlify on a real domain.
3. **Content expansion:** fill out the remaining SFX categories (rooms, monsters, traitor reveal, combat) and remaining music beds; add search/filter and category tabs to the UI.
4. **Monetization:** add Ko-fi/Buy Me a Coffee immediately at launch; apply to AdSense once there's a few weeks of real traffic and full content.
5. **Polish/maintain:** mobile responsiveness pass, "save/share a mix" via URL params, periodically add new sounds, keep the license spreadsheet current.

---

## 9. Licensing recordkeeping (don't skip this)

Keep a simple spreadsheet — filename, source site, license type, attribution text (if required), source URL, date downloaded. If you ever need to prove every asset is properly licensed (an AdSense audit, a Hasbro takedown inquiry, or just your own sanity), this is the one document that saves you.
