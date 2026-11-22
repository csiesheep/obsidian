# 鬼唱詩 漫畫風格測試

2026-11-21 with the owner. 16 comic styles drawn on two local engines, Qwen Image 2.1 (ghost-comic's engine) and MiniMax-H3-Image, to choose a look other than the black-and-white manga line art used so far.

- **Choice:** 〈卡丁車的白色安全帽〉 uses **Qwen 10 水墨筆觸** (board style option `B`).
- **Round 1:** styles 1 to 10, the owner's request for styles the two models do well (CalArts and the like).
- **Round 2:** styles 11 to 16, picked from horror-comic reviews for ghost stories.
- **Rounds 3 and 4:** two real panels of the kart story in the owner's four picks.

Files:
- Every image and the script: `C:/Users/sheep/Pictures/gui_chang_shi/research/style_test_2026-11-21/`.
- The script is `style_test.py`. It runs `qwen`, `h3`, `kart_qwen`, `kart_h3` and the `sheet` modes, and skips images that already exist.

## How the test was run

- **Same subjects in every style:**
  - **人:** a 21-year-old Taiwanese university woman, short black hair, a black zip-up hoodie, half body, in a convenience store at night, holding milk tea.
  - **鬼:** a female ghost, long wet black hair over part of her face, grey-white cracked skin, all-black eyes, at the end of a dark school corridor under one flickering light, staring at the viewer.
- **Prompt:** the style sentence (below), then the subject, then `No text, no letters, no speech bubbles, no frame border.`
- **Settings:** seed 20261121, one image each, 832×1216 portrait. H3 drew the same aspect ratio at its tuned 2048×2048 area.
- **Engine settings:**
  - Qwen: 15 steps, CFG 1.
  - H3: 6 steps, CFG 1, batch size 1. Its prompt expander was left out.
- **Speed:** about 17 to 48 s per image on Qwen (slower while another session used the GPU), 32 to 44 s on H3.
- **Images below:** each style has one picture. Left to right: Qwen 人, Qwen 鬼, H3 人, H3 鬼.

## Overall

- **Qwen 2.1** follows a style more fully: CalArts, Q 版, watercolour and risograph each look like themselves.
  - Its ghosts often come out too dark to see (2, 3, 4, 6, 12, 14).
  - When the face is lit, they turn pretty or doll-like.
- **H3** shows the ghost's face clearly and frighteningly in every style.
  - Its styles differ less: most read as Japanese illustration with a filter.
- **On a long panel prompt** (1,200 to 1,800 characters), Qwen dropped the opening style sentence. Saying the style again at the end of the prompt fixed it for ink wash and watercolour, but not for 厚塗 (round 4).
- **Both engines failed 14** (dark tones with one shock of red): no red appeared. The red probably has to be placed on a named object.

## Round 1: styles 1 to 10

### 1. CalArts 美式卡通
`American TV cartoon style (CalArts style): thick uniform rounded outlines, simple geometric shapes, small dot eyes, rubbery exaggerated expressions, flat bright colours, no gradients.`

![[comic style 01_calarts.jpg]]

- **Qwen:** the person is a true American TV cartoon; the ghost has a white face and black eyes, like a mask.
- **H3:** the person looks more Japanese; the ghost's face is clear, scary and a little funny.

### 2. 法式清線 BD
`European bande dessinee in ligne claire style: clean even black ink lines of one weight, flat colours, no hatching, no shading gradients, detailed realistic background.`

![[comic style 02_ligne_claire.jpg]]

- **Qwen:** doesn't read as ligne claire; the ghost is too dark.
- **H3:** cleaner lines, closer to ligne claire.

### 3. 韓式條漫
`Korean webtoon style: digital cel shading, bold clean outlines, soft flat colours with one shadow tone, glossy hair highlights, modern vertical-scroll comic look.`

![[comic style 03_webtoon.jpg]]

- **Qwen:** a good person; the ghost is too dark.
- **H3:** both are good, and the ghost's face is clear. One of the three best of round 1.

### 4. 90 年代動畫
`1990s anime cel style: hard-edged cel shadows, slightly faded film colours, soft glow, sharp lineart, hand-painted background, retro anime screenshot look.`

![[comic style 04_90s_anime.jpg]]

- **Qwen:** looks like an anime screenshot; the ghost is too dark.
- **H3:** strongly 90s anime, and the ghost is clear.

### 5. 復古少女漫畫
`retro 1980s shoujo manga style: big sparkling eyes, thin delicate lines, screentone, flowers and sparkles in the background, black and white ink.`

![[comic style 05_shoujo.jpg]]

- **Qwen:** both fit the style. The cute-to-scary contrast is the strongest of all the styles.
- **H3:** also good, with screentone and flowers.

### 6. 黑色電影漫畫
`noir graphic novel style: heavy black shadows, stark chiaroscuro, high contrast black and white with one muted accent colour, rough brush ink.`

![[comic style 06_noir.jpg]]

- **Qwen:** the ghost is almost all black, only two white eyes. Scary, but there is no face.
- **H3:** strong light and shadow, and the face shows.

### 7. Q 版
`chibi style: big head on a tiny body, about two and a half heads tall, round simple features, simple soft shading, cute sticker look.`

![[comic style 07_chibi.jpg]]

- **Qwen:** a very cute person and a chibi ghost too; the contrast is funny.
- **H3:** a cute person, but the ghost isn't scary.

### 8. 繪本水彩
`children's storybook watercolour illustration: soft washes, visible paper texture, loose pencil lines, gentle muted palette, lots of white space.`

![[comic style 08_watercolor.jpg]]

- **Qwen:** the scariest ghost of round 1: lots of white space, black eyes and long hair at the end of the corridor.
- **H3:** composition shrunk to the middle, strong paper texture.

### 9. Risograph 孔版
`risograph print illustration: only two ink colours (fluorescent pink and teal) on off-white paper, grainy texture, halftone dots, slightly misregistered layers.`

![[comic style 09_risograph.jpg]]

- **Qwen:** pink and teal, very recognisable.
- **H3:** closer to a real two-colour print; the most artful ghost.

### 10. 水墨筆觸
`Chinese ink wash painting with brush and ink: varied brush strokes, dry brush texture, grey ink gradations on rice paper, almost no colour.`

![[comic style 10_ink_wash.jpg]]

- **Qwen:** the right brushwork, and a ghost with a Taiwanese folk-tale feel. **Chosen for the kart story.**
- **H3:** messier lines; a scary ghost.

## Round 2: styles 11 to 16, for horror

The styles horror comics are known for, written only as traits with no artist names.

### 11. 日式寫實恐怖
`Japanese horror manga style: realistic faces, dense fine pen lines and hatching, solid black ink areas, stark white empty background, black and white only, unsettling stillness.`

![[comic style 11_jp_horror.jpg]]

- **Qwen:** one of the best: white background, dense fine lines, the ghost's hair a wild mass, her face clear.
- **H3:** strong contrast, but the person looks like ordinary Japanese illustration.

### 12. 卡通臉＋寫實眼
`simple cute cartoon style with flat colours and round shapes, except that the eyes are drawn in hyper-realistic detail with wet irises and fine lashes, an uncanny mismatch.`

![[comic style 12_odd_eye.jpg]]

- **Both engines** drew a cute person and ignored the realistic eyes.
- **Qwen:** the ghost is too dark.
- **H3:** the ghost's face is clear.

### 13. 哥德版畫
`gothic black and white engraving style like an old woodcut or etching: fine parallel and cross-hatched lines, heavy black, Victorian ghost story illustration.`

![[comic style 13_gothic_print.jpg]]

- **Qwen:** the hatching looks like a print; the ghost's white face and black eyes are frightening.
- **H3:** the scariest ghost of round 2, with fine cracks in the face.

### 14. 暗調＋一抹紅
`dark desaturated grey-blue comic art with soft shadows, everything muted except one small shock of vivid red in the picture.`

![[comic style 14_dark_accent.jpg]]

- **Both failed:** no red appeared.
- **Qwen:** everything is too dark.

### 15. 厚塗繪畫
`painted horror comic art in thick oil and acrylic: visible brush strokes, blurred soft edges, deep shadows, atmospheric depth, painterly realism.`

![[comic style 15_painted.jpg]]

- **Qwen:** oil-paint strokes and atmosphere; the ghost is dark.
- **H3:** looks like digital illustration, not paint.

### 16. 復古怪談雜誌
`1970s horror comic magazine print style: coarse halftone dots, yellowed cheap paper, saturated but dirty printed colours, bold inked outlines.`

![[comic style 16_retro_mag.jpg]]

- **Qwen:** yellowed paper and 70s print, very fitting.
- **H3:** also very good: halftone, dirty print colours, a frightening ghost.

## Rounds 3 and 4: the kart story's panels in the four picks

- **The picks:** Qwen 10 水墨, H3 16 復古怪談雜誌, Qwen 8 繪本水彩, Qwen 15 厚塗.
- **The panels:** p2 (the three friends at the rest area, the funny half) and p17 (the reveal: the ghost's chin on the narrator's shoulder).
- **Prompts:** taken from the story's `board.json` without reference images, because the character sheets weren't chosen yet. 1344×768.

### Round 3
- The style sentence was given at the start only, plus `The ghost's whole face is lit and clearly visible`.

![[comic style kart round 3.jpg]]

- **Qwen:** the three styles collapsed into the same realistic illustration under the long prompt.
- **Ghosts:** all four turned cute or doll-like once lit.
- **H3 16:** the most style; the kart was drawn right (legs straight out, seat almost on the ground, battery box behind).

### Round 4
- The style sentence is repeated at the end: `Drawn entirely in this style: …`.
- The ghost's horror is spelled out after the light line: black eyes like two holes, grey-white dead skin with fine cracks and dark veins, sunken cheeks, cracked lips, wet hair across the face, `not pretty and not doll-like`.

![[comic style kart round 4.jpg]]

- **Qwen 10 水墨:** improved most; ink lines and wash texture now show in p2.
- **Qwen 8:** a little more pencil and white space, but p17 drew **two** ghosts.
- **Qwen 15:** unchanged.
- **H3 16:** the ghost is finally frightening (a cracked face, empty eyes).
- **Qwen ghosts:** still lean doll-like.
- **The narrator** looks like a boy again in the helmet in every Qwen p17. Character-sheet references should help, but that is not yet verified.

## Decision and what carries over

- **Kart story:** the owner chose Qwen 10 水墨.
  - `backlog/kart_helmet/comic/build_board.py` has it as style option `B`.
  - Every panel prompt ends with the ink-wash sentence again.
  - The ghost's desc carries the scary-face words.
  - Two light texts that said "line art" and "screentone" were changed.
- **For any comic on Qwen:**
  - Repeat the style at the end of long prompts.
  - Spell out the ghost's horror after any instruction to light her face.
  - Expect a face that comes out pretty anyway.
- **H3 instead:** if a story needs a ghost that is lit and scary, H3 (16 or 13) did it more reliably. ghost-comic supports only Qwen since 2026-11-21, so using H3 means adding its graph back (`style_test.py` has a working one).
