# 鬼唱詩 音樂庫（依情境）

Started 2026-11-09 with the owner. Each situation has one chosen track; the files are in `C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/`, and their
source and licence are in `C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/LICENSES.md`. A video takes its music from here by situation, rather than
generating a score per story (the owner rejected ACE-Step scores: 「音樂不行，去找無版權音樂」).
Sad or bouncy tracks don't fit daily life: 「不要是 sad 的音樂」、「太輕快了」, and the second batch of calm guitar, night piano and lo-fi was 「還是太輕快了」. The first three 回憶 candidates (Memories ×3) were all rejected.

| 情境 | 用在 | 選定 | 檔案 |
|---|---|---|---|
| 開場 | Cold open, the first 10–15 s | T3 Horror Creepy (leberch), piano | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/leberch-horror-creepy-255685.mp3 |
| 一般生活 | Setup, daily routine, before anything is wrong | Quiet Piano (leberch), slow soft piano | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/leberch-quiet-piano-313742.mp3 |
| 不安 | The first odd thing, quiet foreshadowing | Slowly to Darkness (leberch), piano | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/leberch-slowly-to-darkness-piano-mysterious-611752.mp3 |
| 懸疑 | Things keep happening, the mystery builds | H1 Ambient Horror Creepy Atmosphere Dark (alex-morgan) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/alex-morgan-ambient-horror-creepy-atmosphere-dark-587402.mp3 |
| 很緊張 | The reveal, being chased, the climax | T1 Tension (leberch) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/leberch-tension-585268.mp3 |
| 餘韻 | After the twist, the last lines | Dark Mystery Piano (universfield), 1:00 | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/universfield-dark-mystery-piano-161660.mp3 |
| 回憶 | Flashbacks, backstory (other stories) | (to choose) | |
| 片尾 | End card | 小さなおばけのワルツ, first 12 s | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/end_theme_12s.wav |
| 靜默 | Just before a scare, a far sound | no music | |

A hit at a reveal is a sound effect (stinger), not music.

## 音效庫（2026-11-09 選定）

Stock effects the brand reuses across videos, separate from a scene's own sounds (footsteps, a door, rain), which come with each H3 clip. The owner picked these 21 from 60 Pixabay candidates (three per item); R2 kept two. They replace ghost-reel `sfx.py`'s synthetic sounds. Files are in `C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/`, licences in `LICENSES.md` beside `licensed/`. G2 has no real tape stop on Pixabay; the pick is a power-down. Rebuild the audition video with `brand/music/sfx_candidates/audition.py` if new candidates are added.

| 編號 | 類別 | 音效 | 用在 | 選定 | 檔案 |
|---|---|---|---|---|---|
| H1-1 | 重擊 | 低頻單發 boom | The reveal, the ghost's first full view | Cinematic Impact Boom 05 (Universfield) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/universfield-cinematic-impact-boom-05-352465.mp3 |
| H2-3 | 重擊 | 「登登」鼓 | A turn in the story, a chapter change, after the hook | Huge Cinematic Tom Hit (Fronbondi_Skegs) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/fronbondi_skegs-drum-huge-cinematic-tom-hit-283585.mp3 |
| H3-1 | 重擊 | 弦樂尖刺 | A jump scare | Scary Violin (DRAGON-STUDIO) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/dragon-studio-scary-violin-382735.mp3 |
| H4-1 | 重擊 | 鋼琴不和諧重音 | Something wrong is noticed | Creepy Piano Stinger (Universfield) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/universfield-creepy-piano-stinger-153296.mp3 |
| R1-3 | 上升 | 反向吸氣 | 1–2 s before a hit | Cinematic Whoosh Reverse (LordSonny) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/lordsonny-cinematic-whoosh-reverse-161307.mp3 |
| R2-2 | 上升 | 弦樂漸強 riser | 3–6 s of build before a reveal | Suspense Riser (Universfield) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/universfield-suspense-riser-191979.mp3 |
| R2-3 | 上升 | 弦樂漸強 riser | 3–6 s of build before a reveal | Tension Buildup Riser v1 (MIGHTUSER) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/mightuser-tension-buildup-riser-v1-hd-270305.mp3 |
| T1-2 | 轉場 | 快速 whoosh | A cut to a new place, the title flying in | Simple Whoosh (DRAGON-STUDIO) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/dragon-studio-simple-whoosh-382724.mp3 |
| T2-2 | 轉場 | 低沉 swoosh | A slow transition, a time jump | Atmospheric Void Whoosh (SoundShelfStudio) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/soundshelfstudio-atmospheric-void-whoosh-546384.mp3 |
| S1-3 | 抽空 | 吸走聲 | The moment before silence, then the scare | Zoom Out Pull Effect (DRAGON-STUDIO) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/dragon-studio-zoom-out-pull-effect-452953.mp3 |
| D1-1 | 鋪底 | 低頻嗡鳴 | Long tense stretches, under the narration | Deep Haunting Drone (DRAGON-STUDIO) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/dragon-studio-deep-haunting-drone-482880.mp3 |
| D2-1 | 鋪底 | 耳鳴高頻 | Shock, after a scare | Ear Ringing (freesound_community) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/freesound_community-ear-ringing-sound-effect-26746.mp3 |
| D3-1 | 鋪底 | 心跳 | Hiding, holding still | Heartbeat Sound (DRAGON-STUDIO) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/dragon-studio-heartbeat-sound-372448.mp3 |
| D4-1 | 鋪底 | 緊張呼吸 | Hiding, close-ups | Scared Breathing 2 (freesound_community) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/freesound_community-scared-breathing-2-47678.mp3 |
| G1-2 | 故障 | 電視靜電、干擾 | The 訊號干擾 title, a video or phone screen | 80s CRT TV Static and Glitch (LensPulse) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/lenspulse-80s-crt-tv-static-noise-amp-glitch-sound-effect-597768.mp3 |
| G2-2 | 故障 | 電源關閉（代替 tape stop） | Time stops, the turn into a twist | Power Down (faespencer) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/faespencer-power-down-486988.mp3 |
| V1-3 | 人聲 | 女鬼低語 | Something is in the room | Creepy Female Ghost Whispers (FadingEmbersAudio) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/fadingembersaudio-creepy-female-ghost-whispers-430175.mp3 |
| V2-3 | 人聲 | 女孩笑聲 | A ghost presence that is never shown | Evil Girl Laughing (DRAGON-STUDIO) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/dragon-studio-evil-girl-laughing-401720.mp3 |
| C1-3 | 節奏 | 時鐘滴答 | Waiting, the minutes before midnight | Ticking Clock 1 (freesound_community) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/freesound_community-ticking-clock_1-27477.mp3 |
| B1-1 | 品牌 | 鐘聲 | The cold open or the end card, as the 鬼唱詩 sound | Church Bell Toll (Universfield) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/universfield-church-bell-toll-156464.mp3 |
| B2-3 | 品牌 | 字幕 tick | A comic reel's captions, the end card text | Tick Sound Effect 1 (u_a4gfvwagf1) | C:/Users/sheep/Pictures/gui_chang_shi/brand/music/licensed/sfx/u_a4gfvwagf1-tick-sound-effect-1-336779.mp3 |
