---
tags: [project, boardgame, art]
status: design
started: 2026-09-18
slug: zongheng
---
# 縱橫 zongheng - art prompts

Every image prompt used for the UI redesign, so the art can be regenerated or tried
in another model. Plan: [[zongheng plan]]. Canvas: https://claude.ai/artifact/DRqSqSm8LFmtnxZW7s3i41

## How the card art works
A card wears its side, the same idea as the chosen UI direction (兩廷 Two Courts):

| Cards | Style | Why |
|---|---|---|
| 秦 events | stone rubbing, white engraved line on solid black | Qin's colour is black (水德); rubbings of stone reliefs are white on black |
| 楚 events | lacquer painting, black and gold on vermilion | Chu lacquerware, the phoenix, the cloud scroll |
| neutral events, scoring cards, 九鼎 | ink wash on pale paper | the same neutral ground as the map |

Rules that held up: say "No text, no characters, no seals, no calligraphy, no writing
anywhere" in every prompt (the owner's note on round 1: generated pseudo seal characters
look wrong, so 秦 and 楚 are always real type). Do not mention "white margin", even to
forbid it: it produces one. Name no historical person; describe the scene instead.

Settings: Z-Image-Turbo on the local ComfyUI (`image_z_image_turbo` graph), 768x1024,
8 steps, shift 3, about 6 s an image on the RTX 3090. Seed = 5000 + card number; the ten
redone cards use 70xx seeds. Originals, `prompts.json`, `prompts.py` and the resumable
`zimage_batch.py` are in `C:/Users/sheep/code/ComfyUI/output/zongheng_cards/`.
Post-processing: a panel that came back on a white sheet is filled black (rubbings) or
cropped (lacquer), then everything is centre-cropped to 3:4 and saved as 600x800 JPEG.

## Style templates
`%s` is the scene from the table below.

**秦 (stone rubbing)**
```text
A Chinese stone rubbing illustration: white engraved lines on a solid matte black ground, flat and two-dimensional, in the manner of Qin and Han pictorial stone reliefs, figures in profile, stylised, inside a thin border line. Scene: %s. Warring States period dress and bronze weapons, hair in topknots. No text, no characters, no seals, no calligraphy, no writing anywhere.
```

**楚 (lacquer painting)**
```text
A Warring States Chu lacquer painting: flat stylised figures in black, gold and ochre on a glossy vermilion red lacquer ground, flowing cloud scrolls in the margins, in the manner of painted lacquerware from the Chu tombs, elegant elongated proportions, fine even outlines, no shading, no perspective. Scene: %s. No text, no characters, no seals, no calligraphy, no writing anywhere.
```

**Neutral and scoring (ink wash)**
```text
A Chinese ink wash painting on pale warm paper, sparse composition with generous empty space, black ink with light touches of grey-blue and ochre, loose confident brushwork. Scene: %s. Warring States period, around 300 BC, rammed-earth walls, bronze weapons, bamboo slips, no paper scrolls. No text, no characters, no seals, no calligraphy, no writing anywhere.
```

## Three prompts for comparing models
The owner asked for prompts to compare Z-Image with GPT image (2026-09-18). Z-Image-Turbo
results: seeds 4101, 4201, 4301, files `zhcmp_*` in `C:/Users/sheep/code/comfyui_mcp/output/`.

**1. 長平之戰 (rubbing)**
```text
A Chinese stone rubbing illustration: white engraved lines on a solid matte black ground, flat and two-dimensional, in the manner of Qin and Han pictorial stone reliefs. Scene: the battle of Changping, 260 BC. Ranks of Qin infantry with bronze dagger-axes and crossbows encircle a hilltop camp of Zhao soldiers; four-horse war chariots on the flanks; long banners streaming. Figures in profile, stylised, arranged in horizontal registers inside a thin border line. Warring States armour, hair in topknots. No text, no characters, no seals, no writing anywhere. Portrait, 3:4.
```

**2. 屈原 (lacquer)**
```text
A Warring States Chu lacquer painting: flat stylised figures in black, gold and ochre on a glossy vermilion red lacquer ground, flowing cloud scrolls and long-tailed phoenix motifs in the margins, in the manner of painted lacquerware from the Chu tombs. Scene: Qu Yuan, the exiled Chu poet-minister, in a tall cap and a long-sleeved robe, standing alone on the bank of the Miluo river, reeds and water ripples, orchids at his feet. Elegant elongated proportions, fine even outlines, no shading, no perspective. No text, no characters, no seals, no writing anywhere. Portrait, 3:4.
```

**3. 玄鳥 roof-tile roundel (Qin emblem)**
```text
A circular roof-tile end (wadang) of the Qin state, seen straight on: a single stylised dark swallow, the black bird Xuanniao, wings spread, in bold geometric low relief, inside a plain raised ring with four small cloud-curl motifs. Carved grey stone, pale grey relief on a matte black ground, studio photograph, centred, symmetrical, high detail. No text, no characters, no writing.
```

## The 72 scenes
| No. | 牌 | Card | Style | Seed | Scene |
|---|---|---|---|---|---|
| 1 | 三晉記分 | Three Jin scoring | ink wash | 5001 | the central plains of the Three Jin: three walled rammed-earth cities on a wide plain, the Yellow River winding between them, distant low hills |
| 2 | 西土記分 | West scoring | ink wash | 5002 | the land within the passes: a fortified gate tower closing a narrow mountain pass between steep cliffs, a broad river valley beyond |
| 3 | 南方記分 | South scoring | ink wash | 5003 | the south of Chu: misty marshes and lakes along a great river, reeds, a few small boats, forested hills fading into mist |
| 4 | 東方記分 | East scoring | ink wash | 5004 | the east: a great sacred mountain rising above a rich plain, and beyond it a sea coast with salt pans and fishing boats |
| 5 | 北疆記分 | North scoring | ink wash | 7005 | the northern frontier: open steppe under a big sky, low beacon mounds of pounded earth with smoke signals, a herd of horses |
| 6 | 商鞅變法 | Shang Yang's Reforms | 秦 rubbing | 5006 | a stern reformer standing on a platform proclaiming new laws to rows of farmers and soldiers, officials holding bundles of bamboo slips, a square bronze measuring vessel beside him |
| 7 | 徙木立信 | Moving the Pole | 秦 rubbing | 5007 | a tall wooden pole at the gate of a city market, a man carrying it away on his shoulder, an official holding out a reward of gold ingots, a crowd watching |
| 8 | 收復河西 | Retaking Hexi | 秦 rubbing | 5008 | soldiers crossing a wide river on boats and rafts toward a fortified bank, chariots waiting on the far shore, waves drawn as curling lines |
| 9 | 張儀連橫 | Zhang Yi's Horizontal | 秦 rubbing | 5009 | a smooth diplomat bowing before an enthroned king in a palace hall, attendants at both sides, a horizontal row of five small palaces along the top register |
| 10 | 司馬錯伐蜀 | Sima Cuo Takes Shu | 秦 rubbing | 5010 | an army marching along wooden plank roads built into sheer cliffs, soldiers and pack oxen in a line, mountains in stacked zigzag patterns |
| 11 | 函谷關天險 | Hangu Pass | 秦 rubbing | 5011 | a massive two-storey gate tower closing a narrow gorge, guards with crossbows on the wall, a road disappearing into the ravine |
| 12 | 客卿制度 | Guest Ministers | 秦 rubbing | 5012 | foreign scholars and advisers arriving at a royal court by carriage, received by an official at the palace gate, servants carrying cases of bamboo slips |
| 13 | 連橫使節 | Horizontal Envoy | 秦 rubbing | 5013 | an envoy riding in a canopied carriage holding a tasselled diplomatic staff, escorted by two horsemen, travelling along a road |
| 14 | 吳起變法 | Wu Qi's Reforms | 楚 lacquer | 5014 | a reformer in armour addressing nobles in a palace courtyard, the nobles in long robes looking displeased, soldiers drilling behind |
| 15 | 蘇秦合縱 | Su Qin's Vertical | 楚 lacquer | 5015 | a strategist wearing six official seals hanging from his belt, standing before six kings seated in a vertical column of pavilions |
| 16 | 圍魏救趙 | Besiege Wei to Save Zhao | 楚 lacquer | 5016 | a strategist seated in a small covered carriage directing troops toward the walls of a great city, while an enemy army turns back in a hurry |
| 17 | 馬陵之戰 | Battle of Maling | 楚 lacquer | 7017 | a night ambush in a narrow wooded ravine: crossbowmen hidden on both slopes loosing volleys of bolts at an army below, a great tree stripped of its bark in the middle |
| 18 | 稷下學宮 | Jixia Academy | 楚 lacquer | 5018 | an academy of scholars in long robes seated on mats in debate under a pavilion by a city gate, bamboo slips spread out, one scholar gesturing |
| 19 | 五國伐秦 | Five States Attack Qin | 楚 lacquer | 5019 | the armies of five states with five different banners advancing together toward a mountain pass gate |
| 20 | 墨者守城 | Mohist Defenders | 楚 lacquer | 5020 | defenders in plain dark clothes on a city wall operating defensive machines: a counterweight beam, large shields and a multi-bolt crossbow, the attackers' ladders pushed away |
| 21 | 楚滅越 | Chu Conquers Yue | 楚 lacquer | 5021 | war boats with oarsmen and warriors on a wide river among reeds, defeating tattooed short-haired warriors of the far south-east, water birds and waves |
| 22 | 縱橫家遊說 | The Persuaders | ink wash | 5022 | a wandering persuader in travelling robes speaking before a lord seated in a simple hall, gesturing with one hand, a bundle of bamboo slips under his arm |
| 23 | 質子交換 | Exchange of Hostages | ink wash | 5023 | two young princes exchanged as hostages at a river border, two carriages facing each other across a bridge, escorts on both banks |
| 24 | 說客 | The Lobbyist | ink wash | 5024 | a lone travelling adviser walking a road with a staff and a bundle on his back, a walled city far ahead |
| 25 | 黃河決口 | The Yellow River Breaks | ink wash | 5025 | a great river bursting its dyke, brown flood water sweeping over fields and thatched villages, people fleeing to high ground |
| 26 | 天狗食日 | The Dog Eats the Sun | ink wash | 5026 | a solar eclipse over a walled city, a black disc with a thin ring of light in a dark sky, people beating drums and looking up in fear |
| 27 | 冶鐵與弩機 | Iron and Crossbows | ink wash | 5027 | an iron foundry: smiths working bellows at a glowing furnace, casting moulds, finished crossbow trigger mechanisms and iron blades laid out on a bench |
| 28 | 周天子賜胙 | The Zhou King's Gift | ink wash | 5028 | a royal envoy presenting sacrificial meat on a ritual stand to a kneeling lord, bronze tripod vessels, a solemn ceremony |
| 29 | 大饑 | Famine | ink wash | 5029 | a great famine: cracked dry fields, withered crops, thin farmers leading children along a road away from an empty granary |
| 30 | 張儀欺楚 | Zhang Yi Dupes Chu | 秦 rubbing | 7030 | a diplomat offering a plain rolled bundle of silk to a king, the king leaning forward greedily, courtiers whispering behind |
| 31 | 宜陽之戰 | Battle of Yiyang | 秦 rubbing | 5031 | troops storming a walled city with scaling ladders, archers on the ramparts, a general on a chariot beating a war drum |
| 32 | 楚懷王入秦 | King Huai Enters Qin | 秦 rubbing | 5032 | a king in ceremonial robes seized at a frontier pass, surrounded by soldiers with dagger-axes, the gate closing behind his carriage |
| 33 | 白起 | Bai Qi | 秦 rubbing | 5033 | a fearsome general standing in armour on a war chariot, sword raised, ranks of infantry behind him in strict rows |
| 34 | 樂毅伐齊 | Yue Yi Invades Qi | 秦 rubbing | 5034 | a general leading the allied armies of five states, a row of five different banners, troops marching toward a walled coastal city |
| 35 | 白起破郢 | Bai Qi Sacks Ying | 秦 rubbing | 5035 | soldiers breaching the walls of a great southern capital, water flooding through a broken dyke into the city, palace roofs burning |
| 36 | 遠交近攻 | Befriend the Far, Attack the Near | 秦 rubbing | 5036 | a minister pointing at a large map spread on the floor before a king; on one side an envoy carries gifts to a far country, on the other soldiers attack a nearby city |
| 37 | 稱西帝 | Emperor of the West | 秦 rubbing | 5037 | a king seated high on a throne receiving a crown and jade insignia, ministers prostrating in rows, tall ritual bronze vessels on each side |
| 38 | 胡服騎射 | Nomad Dress and Mounted Archery | 楚 lacquer | 5038 | a king in a short nomad tunic and trousers on horseback drawing a bow at full gallop, mounted archers behind him, steppe grass |
| 39 | 孟嘗君 | Lord Mengchang | 楚 lacquer | 5039 | a generous lord at a feast with his many retainers; at night one retainer crows like a rooster before a closed pass gate so that the guards open it |
| 40 | 合縱攻秦 | The Alliance Attacks Qin | 楚 lacquer | 5040 | the allied armies of six states breaking through a mountain pass, chariots charging, allied banners in a vertical column, the defenders retreating |
| 41 | 田單復國 | Tian Dan Restores Qi | 楚 lacquer | 5041 | a herd of oxen with blades tied to their horns and burning reeds on their tails charging at night into an enemy camp, soldiers following behind |
| 42 | 完璧歸趙 | The Jade Returns to Zhao | 楚 lacquer | 5042 | an envoy holding a round jade disc high beside a palace pillar, threatening to smash it, a king on his throne reaching out in alarm |
| 43 | 閼與之戰 | Battle of Yuyu | 楚 lacquer | 5043 | a general leading troops up a steep mountain to seize the high ground above a besieged fortress, the enemy below in the valley |
| 44 | 屈原 | Qu Yuan | 楚 lacquer | 5044 | an exiled poet-minister in a tall cap and a long-sleeved robe standing alone on a river bank, reeds and water ripples, orchids at his feet |
| 45 | 黃金臺 | The Golden Terrace | 楚 lacquer | 5045 | a king on a high terrace heaped with gold, welcoming talented men who arrive from afar on horseback and on foot |
| 46 | 齊滅宋 | Qi Swallows Song | ink wash | 7046 | a large army overrunning a small walled state, a toppled royal banner, wooden siege ladders |
| 47 | 商旅通賈 | Merchant Caravans | ink wash | 5047 | a merchant caravan of ox carts and pack horses loaded with silk, salt and bronze goods passing a toll gate, river boats alongside |
| 48 | 澠池之會 | The Meeting at Mianchi | ink wash | 5048 | two kings meeting on a terrace seated facing each other, one playing a long zither, the other striking a clay pot, ministers recording on bamboo slips |
| 49 | 疫癘 | Pestilence | ink wash | 5049 | a plague: a quiet village with doors shut, a masked shaman performing an exorcism rite with a staff, smoke from burning herbs |
| 50 | 修長城 | Building the Long Wall | ink wash | 7050 | labourers building a long rammed-earth frontier wall across hills with wooden frames and rammers, the wall is a low smooth rampart of yellow pounded earth without battlements, no bricks, no stone |
| 51 | 徙民實邊 | Settling the Frontier | ink wash | 5051 | families resettled to the frontier: a long line of people with carts, oxen and bundles walking toward new fields and rammed-earth houses |
| 52 | 長平之戰 | Battle of Changping | 秦 rubbing | 5052 | a great battle: ranks of infantry with bronze dagger-axes and crossbows encircle a hilltop camp of enemy soldiers, four-horse war chariots on the flanks, long banners streaming, arranged in horizontal registers |
| 53 | 秦滅周 | Qin Ends the Zhou | 秦 rubbing | 5053 | soldiers carrying great bronze tripod cauldrons on poles out of a royal ancestral temple, an old king bowing at the gate |
| 54 | 呂不韋 | Lü Buwei | 秦 rubbing | 7054 | a rich merchant-chancellor seated among scholars compiling books of bamboo slips, stacks of bamboo bundles, servants bringing more bamboo bundles on trays |
| 55 | 鄭國渠 | The Zhengguo Canal | 秦 rubbing | 5055 | labourers digging a great irrigation canal with spades and baskets, a long channel of water drawn as parallel wavy lines crossing fields of grain, an engineer directing with a measuring rod |
| 56 | 反間 | Sowing Discord | 秦 rubbing | 7056 | a spy whispering into the ear of a king behind a screen, a purse of gold changing hands; outside the hall a loyal general is led away |
| 57 | 王翦滅楚 | Wang Jian Conquers Chu | 秦 rubbing | 5057 | an old general on a chariot leading a vast army, endless rows of soldiers receding in registers, a southern city on the horizon |
| 58 | 韓非入秦 | Han Fei Comes to Qin | 秦 rubbing | 7058 | a philosopher presenting bundles of bamboo slips to a king; in a side panel the same man sits alone in a prison cell |
| 59 | 信陵君竊符救趙 | Lord Xinling Steals the Tally | 楚 lacquer | 5059 | a noble lord holding up a bronze tiger tally before a general's tent, a strongman behind him with a heavy iron hammer, an army waiting |
| 60 | 毛遂自薦 | Mao Sui Volunteers | 楚 lacquer | 5060 | a bold retainer with his hand on his sword stepping up the palace stairs toward a king, his companions waiting below, a bronze basin ready for a blood oath |
| 61 | 廉頗與李牧 | Lian Po and Li Mu | 楚 lacquer | 5061 | two veteran generals in armour guarding a fortified rampart, one old with a long white beard, one mounted with cavalry, the enemy army halted in the distance |
| 62 | 春申君 | Lord Chunshen | 楚 lacquer | 5062 | a chancellor in splendid robes receiving guests who wear pearl-decorated shoes in a grand hall |
| 63 | 荊軻刺秦王 | Jing Ke's Attempt | 楚 lacquer | 7063 | an assassin lunging with a dagger from a plain unrolled strip of blank silk at a king, who pulls away around a bronze pillar with his sleeve torn, an open box on the floor |
| 64 | 六國會盟 | The Six-State Covenant | 楚 lacquer | 7064 | six kings gathered around an altar swearing a covenant over a bronze vessel, six plain single-colour banners without any emblems, a sacrificial ox |
| 65 | 李信伐楚敗績 | Li Xin's Defeat | 楚 lacquer | 5065 | an army pursuing and routing the troops of a rash young general, soldiers fleeing, camps overrun |
| 66 | 奪將 | Poaching a General | ink wash | 5066 | a famous general in armour riding out of one camp and over to the opposing camp, where a lord welcomes him with a cup of wine |
| 67 | 細作 | The Spy | ink wash | 5067 | a spy in plain clothes listening behind a lattice screen at night while two ministers talk by lamplight |
| 68 | 逐客令 | Expulsion of Foreigners | ink wash | 5068 | foreign advisers and guests expelled from a city, leaving through the gate with their carts and belongings, guards watching |
| 69 | 頓兵堅城 | Bogged Before the Walls | ink wash | 5069 | an army bogged down before an unbreakable walled city, siege camps in the rain, tired soldiers sitting by their tents, the wall towering above |
| 70 | 弭兵之議 | A Proposal to Lay Down Arms | ink wash | 5070 | a peace conference: envoys of several states seated in a circle under an open pavilion, weapons laid down and bound in bundles outside |
| 71 | 兼併小邦 | Swallowing the Small States | ink wash | 5071 | a large army absorbing a tiny walled town, the small lord handing over his seal box and a map at the gate |
| 72 | 九鼎 | The Nine Cauldrons | ink wash | 5072 | nine large bronze tripod cauldrons with monster-mask decoration standing in three rows in a dim ancestral temple, a shaft of light, incense smoke, touches of verdigris green |

## Interface art (the three versions of Two Courts)
| Key | Used in | Size | Seed | Prompt |
|---|---|---|---|---|
| `x_c1_qin` | C1 Qin emblem | 1024x1024 | 6101 | A Chinese stone rubbing of a circular roof-tile end: a single stylised swallow with spread wings and a forked tail, bold geometric shapes, white on a solid matte black ground, inside a plain double ring with four small cloud-curl motifs, flat and two-dimensional, centred, symmetrical. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c1_chu` | C1 Chu emblem | 1024x1024 | 6102 | A circular Chu lacquer roundel seen straight on: a single stylised phoenix with a crest and long curling tail feathers, painted in gold and black on glossy vermilion red lacquer, inside a plain gold ring with four small cloud-curl motifs, flat, centred, symmetrical, on a solid vermilion ground. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c2_qin` | C2 landing, Qin panel (chosen) | 768x1024 | 6201 | A bronze tiger tally of ancient China: a crouching tiger figure split lengthwise into two matching halves lying side by side, fine gold-inlaid line decoration along the body, dark bronze with green patina, on matte black stone, dramatic raking side light, top-down studio photograph, deep shadows. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c2_chu` | C2 landing, Chu panel (chosen) | 768x1024 | 6202 | A Warring States Chu lacquer sculpture: a tall slender phoenix with antlers standing on the back of a crouching tiger, painted in vermilion, black and gold lacquer with fine patterns, in front of a deep vermilion lacquer wall, dramatic raking side light, studio photograph. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c2_map` | C2 night map (chosen) | 1024x1024 | 6203 | A night landscape painted in pale silver-grey ink on very dark indigo-black paper: faint mountains along the left and top edges, a thin pale river winding from the upper left to the lower right, drifting mist, very large empty dark areas in the centre, top-down map-like view, quiet and sparse. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c2_qintex` | C2 Qin header texture (chosen) | 1024x512 | 6204 | A close-up of a dark bronze surface cast with a dense interlaced dragon pattern in low relief, almost black with a faint green patina, even raking light, seamless texture, no objects. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c2_chutex` | C2 Chu header texture (chosen) | 1024x512 | 6205 | A close-up of a glossy vermilion red lacquer surface painted with fine flowing cloud scrolls in slightly darker red and thin gold lines, even light, seamless texture, no objects. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c3_qin` | C3 horizontal frieze | 1344x448 | 6301 | A long horizontal frieze, Chinese stone rubbing: a procession of four-horse war chariots, cavalry and infantry with dagger-axes marching from left to right in one register, white engraved lines on a solid matte black ground, flat, stylised, figures in profile, thin border lines above and below. No text, no characters, no seals, no calligraphy, no writing anywhere. |
| `x_c3_chu` | C3 vertical panel | 448x1344 | 6302 | A tall narrow vertical Chu lacquer panel: a single phoenix rising upward with very long trailing tail feathers and cloud scrolls flowing down the whole height, gold and black on glossy vermilion red lacquer, flat, stylised, fine even outlines. No text, no characters, no seals, no calligraphy, no writing anywhere. |

## Known flaws to fix before shipping
- Roofs and crenellated walls in places look like later dynasties; Warring States walls were rammed earth.
- 北疆記分 has a tiny pagoda far away; 齊滅宋 a multi-storey gate tower.
- 荊軻刺秦王 shows two assassins (it can pass for 荊軻 and 秦舞陽).
- The C1 玄鳥 roundel is a realistic swallow; a more geometric one would match the rubbings better.

## Related
- [[zongheng plan]]
- [[zongheng - rulebook]]
