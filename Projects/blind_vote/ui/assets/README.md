# 蓋牌投票 (covervote) assets

All generated on the local ComfyUI (RTX 3090), free local models only. Contact sheet: `contact_images.png`.

## Images

Model: **Z-Image-Turbo** (`image_z_image_turbo` template; `z_image_turbo_bf16.safetensors`, text encoder `qwen_3_4b.safetensors`, VAE `ae.safetensors`), 8 steps, cfg 1, res_multistep. 3 seeds per image; the chosen seed is listed. Post-processing done with PIL (`post.py`, `fix_card.py` in the scratch folder).

### `card_back.png`
- Seed 212 (tried 211, 212, 213), generated 768x1088
- Post: Generated 768x1088 with the card floating on cream; cropped to the card, side-padded with the card's charcoal (no stretch), bright red recolored to #C8321E.
- Prompt: Back of a playing card, flat woodblock print illustration, full frame. Solid deep charcoal black field (#1E1C1A) covered with a fine, intricate, perfectly symmetric cream-colored geometric lattice pattern inspired by traditional Taiwanese wooden window grilles, interlocking small squares, crosses and diamonds in a repeating grid, mirrored top-bottom and left-right like a playing card. A thin cream double border inset from the edge. One small vermilion red (#C8321E) diamond in the exact center. Risograph ink texture, slight paper grain, hand-inked lines. No text, no letters, no numbers.

### `paper_texture.png`
- Seed 221 (tried 221, 222, 223), generated 1024x1024
- Post: Edges trimmed, large-scale shading removed (fine grain only at 60%), recolored to #F4EFE4 base, made seamless by a half-offset blend.
- Prompt: Flat scan of a blank sheet of plain cream colored paper (#F4EFE4), extremely subtle fine paper fiber grain, very low contrast, evenly lit, uniform texture across the whole frame, no shadows, no folds, no stains, no objects, no vignette, no text. Top-down macro texture photograph of handmade paper surface.

### `hero.png`
- Seed 235 (tried 234, 235, 236), generated 1536x864
- Post: Second prompt (first round drew card pips and aces). Red recolored to #C8321E.
- Prompt: Flat risograph woodblock print illustration, wide composition. The left half of the image is completely empty plain cream paper (#F4EFE4), nothing there. On the right half: the top of a simple light wooden desk in a voting booth, seen from slightly above, with a neat row of four face-down cards whose backs are charcoal black with a thin cream lattice pattern. A hand is lifting and flipping one card, its face completely blank plain cream with no symbols. Beside the cards on the desk surface, a flat round vermilion red (#C8321E) ink stamp impression circle printed on a small slip of paper. Limited palette: cream, charcoal black, warm gray, light warm wood, sparing vermilion red. Bold hand-inked outlines, slight paper grain, calm civic playful card game mood. No text, no letters, no numbers, no card pips, no suits, no flags, no blue, no green.

### `stamp_mark.png`
- Seed 241 (tried 241, 242, 243), generated 1024x1024
- Post: Generated 1024x1024 on cream; ink density turned into alpha (transparent PNG), ink color set to #C8321E, cropped around the stamp, 512x512.
- Prompt: A single round vermilion red (#C8321E) rubber ink stamp impression centered on plain cream paper (#F4EFE4). Circular ring outline with a simple bold cross-shaped mark inside, like a ballot circle stamp. Imperfect uneven ink coverage, speckled texture, slightly faded edges, realistic stamp print. Flat top-down view, lots of plain cream space around it. No text, no letters, no characters.

### `og_bg.png`
- Seed 256 (tried 254, 255, 256), generated 1216x640
- Post: Second prompt (first round drew aces with an 'A'). Generated 1216x640, resized and cropped to 1200x630.
- Prompt: Flat risograph woodblock print illustration, wide banner. Plain cream paper background (#F4EFE4) filling the frame; the left two thirds is completely empty cream space. In the lower right: three plain rectangular blank cards with rounded corners. Two lie face down, their backs solid charcoal black with a thin cream geometric lattice pattern. One lies face up on top, its face entirely plain blank cream with nothing printed on it. Beside them a flat round vermilion red (#C8321E) ink stamp impression circle. Palette only cream, charcoal black, warm gray and vermilion red. Hand-inked outlines, slight paper grain. Absolutely no text, no letters, no numbers, no suits, no pips, no symbols on the cards, no blue, no green.

### `empty_state.png`
- Seed 265 (tried 264, 265, 266), generated 768x768
- Post: Second prompt (first round drew aces with an 'A').
- Prompt: Friendly flat risograph woodblock print illustration, centered spot illustration on plain cream background (#F4EFE4). An empty simple square ballot box made of light wood with bold charcoal outlines and a slot on top. One plain rectangular card is peeking out of the slot; the card is solid charcoal black with a thin cream geometric lattice pattern, no markings. A small round vermilion red (#C8321E) stamp circle on the front of the box. Simple, cute, calm, lots of empty space around. Palette: cream, charcoal black, light wood, warm gray, small touch of vermilion red. Hand-inked lines, slight paper grain. Absolutely no text, no letters, no numbers, no suits, no pips, no flags, no blue, no green.

## Sound effects

Model: **Stable Audio 3 Medium** (`stable_audio_3_medium.safetensors`, text encoder `t5gemma_b_b_ul2.safetensors`), 8 steps, cfg 1, lcm/simple, empty negative prompt. Run as a flat API graph I built (CheckpointLoader, CLIPLoader, CLIPTextEncode, EmptyLatentAudio, KSampler, VAEDecodeAudio, SaveAudioAdvanced). It skips the template's subgraph and its LLM reprompt step, so the CustomCombo validation error never happens. Each sound was generated at about 2x its target length (at least 3 s), and takes were picked by measurement (onset count, active length, spectral centroid, tonality), not by listening.

Processing (ffmpeg 7.1): high-pass at 40 to 80 Hz (card_deal had sub-20 Hz rumble), leading silence removed at -45 dB, cut to length with a short fade-out, gain set to -16 LUFS integrated (measured on the clip looped 12x, since clips this short fall under the EBU R128 window), limiter at -1 dBFS, MP3 VBR q2. Final loudness, looped: about -16 to -17 LUFS. Exception: `sfx_card_flip` is at -19.7 LUFS, capped at +13 dB so the limiter would not crush the single snap.

| File | Length | Take(s) used | Prompt |
|---|---|---|---|
| `sfx_stamp.mp3` | 0.60 s | seed 702 (of 701/702) | Foley sound effect: a single rubber ink stamp pressed firmly onto a paper ballot on a wooden desk, one dull short thud, close mic, dry, isolated one-shot |
| `sfx_card_flip.mp3` | 0.40 s | seed 701 (of 701/702) | Foley sound effect: a single playing card flipped over on a table, one crisp short paper snap, close mic, dry, isolated one-shot |
| `sfx_card_deal.mp3` | 0.95 s | seed 702 (of 701/702) | Foley sound effect: three playing cards dealt quickly one after another onto a felt table, three soft quick paper slides, close mic, dry, isolated |
| `sfx_tap.mp3` | 0.15 s | seed 701 (of 701/702) | UI sound effect: one soft short wooden tap, a single gentle knock on a small wooden block, very short click, dry, isolated one-shot |
| `sfx_guess_right.mp3` | 0.70 s | **composite**: seed 701 (single 880 Hz note), then seed 702 (single 1050 Hz note) 120 ms later, a rising minor third. Neither take had two notes. A second prompt (seeds 703 to 705) gave 1.2 s melodies. | UI sound effect: a gentle bright two-note rising wooden marimba chime, short, pleasant, success notification, dry, isolated one-shot / retry: Marimba, two notes: a low note then a higher note a third above, played quickly one after the other, ding-ding, bright gentle success jingle, dry, isolated |
| `sfx_guess_wrong.mp3` | 0.50 s | seed 702 (of 701/702) | UI sound effect: a single soft low muted wood block knock, gentle, dull, not harsh, short error notification, dry, isolated one-shot |
| `sfx_reveal.mp3` | 2.08 s | **composite**: card flips from seed 702 (0.15 to 1.30 s) crossfaded (120 ms) into the end of the marimba phrase from retry seed 705 (1.95 to 3.0 s). The first prompt gave flips with no marimba; the retry prompt gave marimba with no flips. | Sound effect: a stack of playing cards flipped over quickly in sequence, rapid paper flicks, ending with a warm short ascending marimba flourish, dry, isolated / retry: Five quick paper card flips in a row, then a warm ascending marimba arpeggio of four notes ending on a sustained bright note, short game reveal jingle, dry |
| `sfx_shuffle.mp3` | 1.10 s | seed 702 (of 701/702) | Foley sound effect: a riffle shuffle of a deck of playing cards, quick paper fluttering cascade then a soft bridge tap, close mic, dry, isolated |

## Caveats

- I picked the sounds by measurement and did not listen to any of them. Give them a listen, especially the two composites, before shipping.
- Nothing was impossible to make. Not runnable on this install (missing models): Krea-2, FLUX 3 Klein, Z-Image-Turbo int8, and the Qwen Image 2.1 template.
