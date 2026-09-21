---
tags: [project, boardgame, audio]
status: list, tools being chosen
started: 2026-09-20
slug: zongheng
---
# 縱橫 zongheng - audio 音樂與音效清單

Owner, 2026-09-20:「我想加強遊戲的背景音樂/音效,先列出各個需要不同背景音樂的情境,以及需要音效的地方。」
Plan: [[zongheng plan]]. 現況:遊戲裡**沒有任何聲音**(`public/` 沒有音檔,程式沒有 `Audio` / `AudioContext`)。這份只是清單,還沒有開票。

每一項有一個 id,之後開票、命名音檔都用它。優先序:P1 = 沒有它遊戲就像沒聲音;P2 = 明顯加分;P3 = 錦上添花。

## 一、聲音的兩個陣營

讓耳朵和眼睛一樣分得出秦與楚(畫面上是青銅黑 / 漆器紅)。

| 陣營 | 音色 | 出處 |
|---|---|---|
| 秦 | 缶(陶盆打擊)、秦箏、戰鼓、塤 | 李斯《諫逐客書》:「擊甕叩缶,彈箏搏髀……真秦之聲也」 |
| 楚 | 編鐘、瑟、排簫 / 篪、人聲吟唱(楚歌) | 曾侯乙編鐘出於楚文化圈;「四面楚歌」 |
| 周 / 中立 | 磬、單顆鐘 | 禮器,用在九鼎、洛邑、回合鐘 |

## 二、需要不同背景音樂的情境

| id | 情境 | 什麼時候 | 氣氛 | 優先 |
|---|---|---|---|---|
| `bgm.landing` | 首頁(兩個朝廷) | 開啟網站,第一次點擊之後 | 主題曲:左邊秦的箏與缶、右邊楚的編鐘,慢,有空間感 | P1 |
| `bgm.setup` | 單人設定、多人大廳、等人 | 選邊、等對手 | 主題曲的安靜版(只留一種樂器),可長時間循環不煩 | P2 |
| `bgm.tutorial` | 教學十課 | 教學中 | 輕、不緊張;可用變法期的曲子降低強度 | P3 |
| `bgm.table.reform` | 牌桌 · 變法期 | 第 1 到 3 回合 | 佈局、試探:稀疏的撥弦,慢 | P1 |
| `bgm.table.alliance` | 牌桌 · 縱橫期 | 第 4 到 6 回合 | 遊說、合縱連橫:加入節奏,中速 | P1 |
| `bgm.table.conquest` | 牌桌 · 兼併期 | 第 7 到 8 回合 | 大戰:戰鼓與低音,最緊 | P1 |
| `bgm.tension` | 危急層 | 任何一種「立即結束」只差一步時(見下) | 疊在當期音樂上的一層低鼓或心跳,不換曲 | P2 |
| `bgm.win.qin` | 勝利 · 秦 | 秦贏,贏家與觀戰者看到 | 鼓、缶、箏,短而完整(20 到 30 秒),之後接安靜的尾聲循環 | P1 |
| `bgm.win.chu` | 勝利 · 楚 | 楚贏 | 編鐘齊鳴、吟唱 | P1 |
| `bgm.lose.qin` | 敗北 · 秦(B 燼) | 你是秦,輸了 | 餘燼:單支塤、遠處的火聲,很慢 | P1 |
| `bgm.lose.chu` | 敗北 · 楚(B 燼) | 你是楚,輸了 | 一顆走音的鐘、風聲、楚歌殘句 | P1 |
| (無) | 規則頁 | 閱讀 | **不放音樂**;從牌桌打開規則時,牌桌音樂降到很小聲即可 | |

「危急層」的觸發(任一成立):相印 3 / 4、滅國 2 / 3、天命到 ±15 以上(滿 20)、疲敝只剩最後一格、第 8 回合、回合結束前手上還有記分卡。

牌桌音樂要不要**跟著你的座位**換主奏(你是秦 = 箏與缶主奏,你是楚 = 編鐘與瑟主奏)?做法是每期一首曲子、兩條主奏音軌二選一,曲子數量不會變成兩倍。見最後的待決定。

## 三、需要音效的地方

### A. 一般介面

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.ui.tap` | 任何按鈕 | 很短的木質或竹質敲擊 | P1 |
| `sfx.ui.toggle` | 語言、軍師、音樂 / 音效開關 | 兩段式的喀 | P3 |
| `sfx.ui.open` / `sfx.ui.close` | 打開 / 關閉卡牌頁、記錄、規則裡的卡牌 | 竹簡展開 / 收起 | P2 |
| `sfx.ui.tab` | 規則頁分頁、篩選 | 輕敲 | P3 |
| `sfx.ui.error` | 點了不能點的地方(「要點亮著的地方」) | 悶的一聲,不刺耳 | P1 |
| `sfx.ui.copy` | 複製房號 | 小鈴 | P3 |

### B. 牌

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.card.deal` | 回合開始補牌 | 一疊竹簡或牌滑出,依張數連響 | P2 |
| `sfx.card.pick` | 在手牌點一張牌 | 牌被拿起 | P1 |
| `sfx.card.commit` | 標題階段蓋下一張牌 | 牌拍在桌上 | P1 |
| `sfx.card.reveal` | 雙方標題同時翻開 | 兩聲翻牌,接一聲鐘 | P1 |
| `sfx.card.event.qin` / `.chu` / `.neutral` | 一張牌當事件發生 | 秦 = 缶加鼓一擊;楚 = 一顆編鐘;中立 = 磬 | P1 |
| `sfx.card.ops` | 一張牌當行動點打出 | 比事件輕的一聲 | P2 |
| `sfx.card.enemyEvent` | 你打對手的牌,對手的事件被觸發 | 對方陣營的音色,音高往下 | P2 |
| `sfx.card.remove` | 事件發生後移出遊戲(牌名帶 * 的) | 竹簡折斷或火燒一下 | P3 |
| `sfx.card.discard` | 棄牌、頓兵堅城 | 牌滑走 | P3 |
| `sfx.card.jiuding` | 九鼎蓋著交給對方 | 沉重的青銅落地,長餘音 | P2 |
| `sfx.card.reshuffle` | 棄牌堆重洗、第 4 / 7 回合新牌庫洗入 | 洗牌 | P3 |

### C. 地圖

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.map.place` | 放置時每點一下(+1、+2……) | 棋子落盤;同一個據點連點時音高逐步升高 | P1 |
| `sfx.map.unplace` | 取消一點 | 同一聲,音高往下 | P2 |
| `sfx.map.confirm` | 確認放置 / 征伐 / 遊說 | 印章蓋下 | P1 |
| `sfx.map.control.gain` / `.lose` | 一個據點變成你控制 / 失去控制(圓盤由灰變黑、由粉紅變紅) | 短促的上行 / 下行兩音 | P1 |
| `sfx.map.campaign` | 征伐結算 | 鼓加兵器碰撞,依移除的點數加重 | P1 |
| `sfx.map.campaign.key` | 征伐要衝,疲敝 +1 | 在上一聲後面加一聲低號角 | P2 |
| `sfx.map.lobby` | 遊說結算 | 低語、竹簡聲,沒有鼓 | P2 |
| `sfx.map.opponent` | 對手剛動過的據點出現「上一手」標記 | 很輕的一聲提示,讓你去看地圖 | P1 |

### D. 軌道與門檻

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.track.mandate` | 天命移動 | 弦的滑音:往秦一種方向、往楚另一種 | P1 |
| `sfx.track.weariness` | 疲敝下降 | 沉的一聲,越接近盡頭越重 | P2 |
| `sfx.track.reform` | 變法軌前進 | 毛筆或刻簡聲 | P2 |
| `sfx.track.reform.first` | 先到某一格、拿到能力 | 加一聲亮的鈴 | P3 |
| `sfx.seal.gain` / `.lose` | 楚取得 / 失去相印 | 蓋印 / 印被拿走 | P1 |
| `sfx.mie` | 秦滅一國 | 城牆倒塌加一聲大鑼 | P1 |
| `sfx.restore` | 復國 | 上行的鐘 | P2 |
| `sfx.luoyi` | 回合末控制洛邑,天命 +1 | 一顆磬 | P3 |
| `sfx.warn` | 任何立即結束只差一步(第一次出現時) | 兩聲急鼓;之後交給 `bgm.tension` | P1 |

### E. 回合流程

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.turn.new` | 新回合 | 一聲鐘 | P1 |
| `sfx.turn.era` | 進入縱橫期、兼併期(配過場影片) | 三聲鐘加鼓,同時換背景音樂 | P1 |
| `sfx.turn.headline` | 標題階段開始 | 短的號角 | P2 |
| `sfx.turn.yours` | 輪到你(多人房、分頁在背景時特別重要) | 清楚但不吵的提示音 | P1 |
| `sfx.turn.clock` | 多人房倒數最後 10 秒 | 每秒一聲滴答,最後 3 秒加重 | P1 |
| `sfx.turn.timeout` | 時間到,由電腦代打 | 一聲下行 | P2 |
| `sfx.turn.end` | 回合結算(檢查手上的記分卡、疲敝後退) | 低的一聲收尾 | P3 |

### F. 記分

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.score.count` | 打出記分卡,逐項計算(存在、優勢、獨佔、要衝) | 算籌聲,一項一響 | P2 |
| `sfx.score.result` | 差額移動天命 | 接 `sfx.track.mandate`,依差額大小加重 | P2 |

### G. 多人房

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.room.join` / `.leave` | 有人進房 / 離開 | 門軸聲 / 腳步遠去 | P2 |
| `sfx.room.chat` | 收到聊天訊息 | 很輕的一聲 | P2 |
| `sfx.room.start` | 遊戲開始 | 鼓一通 | P2 |
| `sfx.room.drop` / `.back` | 對手斷線 / 回來 | 下行 / 上行 | P3 |

### H. 教學、軍師、結局

| id | 地方 | 聲音 | 優先 |
|---|---|---|---|
| `sfx.tut.step` | 教學一課完成 | 柔和的鈴 | P2 |
| `sfx.tut.done` | 教學全部完成 | 短的凱旋樂句 | P3 |
| `sfx.advisor` | 軍師的建議出現 | 幾乎聽不到的一聲,或不要 | P3 |
| `sfx.end.win.qin` / `.chu` | 結局畫面出現,贏 | 勝利的開場一擊,接 `bgm.win.*` | P1 |
| `sfx.end.lose.qin` / `.chu` | 結局畫面出現,輸(B 燼) | 青銅墜地 / 漆木斷裂,接餘火聲與 `bgm.lose.*` | P1 |
| `sfx.end.reason.*` | 六種結束方式各自的一聲(一統、合縱、天命、疲敝、記分卡、終局) | 可選;先做共用的勝 / 敗 | P3 |

## 四、數量

| | P1 | P2 | P3 | 合計 |
|---|---|---|---|---|
| 背景音樂 | 8 | 2 | 1 | 11 |
| 音效 | 21 | 19 | 13 | 53 |

(以表格的列計算;成對的 id,例如 `.gain` / `.lose`、`.qin` / `.chu`,同一列算一個。)

## 五、做之前要知道的限制

- 手機瀏覽器在使用者第一次點擊之前不准出聲:音樂從首頁的第一次點擊之後才開始。
- iPhone 的靜音鍵對網頁聲音的影響要在你的手機上實測(不同的播放方式結果不同)。
- 要有設定:音樂開 / 關、音效開 / 關、音量,記在瀏覽器裡(和軍師的開關一樣),放在頂欄看得到的地方。
- 分頁切到背景時音樂要暫停;「輪到你」的提示音在背景分頁可能被瀏覽器延後。
- 循環要無縫;手機流量:每首循環 60 到 90 秒、約 1 MB,整個遊戲的聲音先抓 8 MB 以內,依時期延後載入。
- 音效不能蓋過彼此:同一瞬間最多兩三個,事件多的時候(一張牌觸發一串效果)要排隊或合併。

## 六、決定與待決定

已決定(owner,2026-09-20):

1. **音效預設開、音樂預設開**,首頁放一個明顯的開關。(瀏覽器的限制不變:第一次點擊之後才會出聲。)
2. **牌桌音樂跟著座位換主奏**:每期一首、兩條主奏(秦 = 箏與缶,楚 = 編鐘與瑟)。做法見下面的「工具」:文字生成音樂的模型只會輸出混好的立體聲,拿不到分軌,所以實際上是每期做**同速度、同調的兩個版本**(秦主奏版、楚主奏版),開局時依座位選一個;座位在一局中不會變,不需要即時交叉淡化。牌桌音樂因此是 6 個檔。

待決定:

3. 聲音的來源(見下一節的比較)。
4. 先做哪一批?(建議:P1 的音效 21 個加三期牌桌音樂,其餘之後。)

## 七、工具(2026-09-20 查本機 ComfyUI 0.36.0)

owner 問:`audio_minimax_music_3` 夠不夠做音樂和音效?

| 範本(都在本機 ComfyUI 的範本清單裡,都是本機模型) | 做什麼 | 對我們合不合用 |
|---|---|---|
| `audio_minimax_music_3` MiniMax Music 3 | 「歌曲」模型:Caption(風格)加 Lyrics(用 `[intro]` `[verse]` 等標籤控制段落),最長約 5 分鐘,32 kHz 立體聲。節點已在執行中的 ComfyUI 裡。預設組合下載約 14.3 GB(DiT fp16 4.9、文字編碼器 int8 9.2、VAE 0.2) | **音樂:可以試。** 長曲的結構是它的強項。風險:它是為人聲歌曲設計的,純器樂要靠 caption 寫「instrumental, no vocals」加只有段落標籤的 lyrics,還沒試過;編鐘、塤、缶這類冷門樂器可能被做成一般的「中國風」。**音效:不適合**,它的最小單位是一首歌,做不出 0.2 到 2 秒的單擊聲 |
| `audio_ace_step1_5_xl_turbo` ACE-Step 1.5 XL | 文字生成音樂,8 步,很快;v1 就有純器樂的範本 | 音樂的第二個候選:純器樂是它的正常用法,迭代快。和 MiniMax 用同一份簡述各出三個版本,用耳朵選 |
| `audio_stable_audio_3_medium` Stable Audio 3(另有 `small_sfx` 2.3 GB) | 文字生成音訊,有 Music / Instrument / SFX / One-shot 四種類別,可指定秒數 | **音效用這個**:落子、蓋印、翻牌、鼓、鑼這種短聲音正是 One-shot / SFX 類別。短的過場樂句也可以 |
| 真實錄音(CC0 音效庫) | 編鐘、磬、缶的單音 | 生成的古樂器不像的時候用:這幾個音色是秦楚之分的招牌,值得用真的 |

授權要在上線前看原文:Comfy-Org 重新打包的 MiniMax Music 3 標示 Apache-2.0,但官方 GitHub 頁面的徽章是 CC-BY-SA-4.0,官方 Hugging Face 頁沒有授權標籤,三者不一致。Stable Audio 3 是 Stability 的 community licence(`stable-audio-community`)。

無論哪個模型都不會給無縫循環點:循環要自己剪(找小節點、交叉淡化),用 venv 裡的 ffmpeg 就能做。

我聽不到聲音:我能做的是寫簡述、排隊生成(和 H3 影片一樣,一次一個、可續跑,因為這台電腦會重開機)、量長度、響度和循環接點;好不好聽要你聽。

## 八、第一批樣本(2026-09-20,兩個工作流程都跑得動)

owner:「Let's do 2 sounds and 2 musics as examples」。模型都下載完整(大小和 Hugging Face 一致),放在 `%LOCALAPPDATA%/Comfy-Desktop/ComfyUI-Shared/models`。

| 用途 | 工作流程(ComfyUI 範本) | 我改了什麼 | 速度(一張 3090) |
|---|---|---|---|
| 音樂 | `audio_minimax_music_3`(MiniMax Music 3: Text to Music) | 照範本的子圖接線(UNETLoader、CLIPLoader type `minimax`、VAELoader、MiniMaxMusic3TextEncode、ConditioningZeroOut、EmptyMiniMaxMusic3LatentAudio、KSampler 30 步 cfg 1.7 euler / simple、VAEDecodeAudio);用一般解碼而不是分塊解碼;存成 FLAC | 60 秒的曲子約 **7 分鐘**(425 秒、419 秒) |
| 音效 | `audio_stable_audio_3_medium`(Stable Audio 3.0 Medium) | 不用範本裡的 Qwen 改寫提示詞,自己照它的 One-shot / SFX 寫法寫(結尾加 `Length: N seconds`);CheckpointLoaderSimple、CLIPLoader `t5gemma_b_b_ul2` type `stable_audio`、KSampler 8 步 cfg 1 lcm / simple;存成 FLAC | 每個約 **3 秒** |

樣本(原始 FLAC 在 `C:/Users/sheep/code/ComfyUI/output/zongheng_audio/`,給人聽的 MP3 和兩個 API 格式的工作流程在它的 `samples/`):

| 檔案 | cue | 量到的(我聽不到) |
|---|---|---|
| `bgm_table_reform_qin_s5101` | `bgm.table.reform` 秦主奏:箏、缶、低鼓、塤;66 BPM、D 小調五聲 | 59.99 秒,44.1 kHz 立體聲,平均 -20.2 dB,**峰值 0.0 dB(頂到了,正式用要降)**,開頭 0.58 秒靜音 |
| `bgm_table_reform_chu_s5101` | 同一期、同速同調,楚主奏:編鐘、瑟、排簫、磬 | 59.87 秒,平均 -25.9 dB,峰值 -2.7 dB,開頭 0.99 秒靜音 |
| `sfx_map_place_s7101 / s7102 / s7103` | `sfx.map.place` 棋子落在木盤上 | s7102 是乾淨的單擊(0.23 秒後全靜);s7101、s7103 在 0.9 秒左右有第二聲 |
| `sfx_event_chu_s7201 / s7202 / s7203` | `sfx.card.event.chu` 一顆編鐘 | s7201 餘音最長(2.4 秒)、峰值 -9.2 dB;s7202 偏小聲;s7203 中間斷了一下 |

排隊腳本:`scratchpad/audio/audio_queue.py jobs.json [sound|music|<id>]`,一次一個、已經有輸出的就跳過(這台電腦會重開機)。

要你用耳朵判斷的:(1) 兩首有沒有人聲或哼唱(模型是為歌曲設計的,我用 `[Instrumental]` 標籤和「no vocals」壓它);(2) 聽起來像不像箏 / 缶、編鐘 / 排簫,還是一般的「中國風」;(3) 兩首的速度和調是否接近到可以當同一首的兩個版本;(4) 落子聲和鐘聲像不像。

## 九、owner 聽過第一批(2026-09-20)

- **兩個音效:好。** `sfx_map_place_s7102`(落子)和 `sfx_event_chu_s7201`(編鐘)收下;音效就用 Stable Audio 3 這個工作流程和這種提示詞寫法。
- **兩首音樂:「smooth but not good」。** 要每邊三首,**更容易分辨、更有古中國味**。

第二輪的做法(`scratchpad/audio/make_jobs2.py` → `jobs2.json`),照 MiniMax 自己的 caption 寫法指南(repo 裡的 `skills/music-caption-rewriter/SKILL.md`)改:

1. **寫「要什麼」,不列「不要什麼」**。第一輪我列了一串 no piano / no synthesizer,指南說要用正面、具體的描述;點名反而可能把它們帶進來。
2. **Arrangement 寫成逐段的時間線**(Intro、兩段 Instrumental、Solo、Outro 各是哪個樂器進來、做什麼),lyrics 欄位用同樣的段落標籤。
3. Vocal Details 照指南寫「The piece is instrumental」加上主奏樂器。
4. **用八音把兩邊分開**:秦 = 土、革、絲(塤、缶、戰鼓、秦箏、古琴);楚 = 金、石、竹(編鐘、編磬、排簫、篪、瑟、笙)。兩邊連調式都不同:秦 D 羽調(小調感),楚 G 宮調(明亮)。
5. 古味靠織體:單旋律、支聲複調、不配和聲、樂句之間留白、乾的錄音(秦)或大殿的長餘音(楚)、出土樂器複製品。

| 檔名 | 性格 |
|---|---|
| `bgm_reform_qin_A_junzhen_s5211` | 秦 A 軍陣:大戰鼓與缶,低音秦箏的短句,塤獨奏,60 BPM |
| `bgm_reform_qin_B_qinsheng_s5212` | 秦 B 秦聲:李斯說的「擊甕叩缶,彈箏搏髀」,三個陶甕、拍腿、粗獷的箏,76 BPM |
| `bgm_reform_qin_C_miaotang_s5213` | 秦 C 廟堂:古琴的滑音與泛音、塤、每句一聲鼓,散板 |
| `bgm_reform_chu_A_bianzhong_s5221` | 楚 A 編鐘:大鐘起句、中鐘旋律、小鐘加花、編磬對答,60 BPM |
| `bgm_reform_chu_B_jiuge_s5222` | 楚 B 九歌:排簫主奏、篪如回聲、瑟的流水、巫鼓與手鈴;**只有這一首**在中段放了很遠的無字男聲吟唱(楚歌),不喜歡就丟掉 |
| `bgm_reform_chu_C_yunmeng_s5223` | 楚 C 雲夢:瑟主奏、笙的長音、骨笛學鳥叫、偶爾一聲鐘,66 BPM |

第二輪六首已做完並寄給 owner(2026-09-20 14:17;每首 5 到 7 分鐘)。量到的:

| 檔名 | 長度 | 平均 / 峰值 |
|---|---|---|
| `bgm_reform_qin_A_junzhen_s5211` | 59.99 秒 | -17.3 / -0.0 dB |
| `bgm_reform_qin_B_qinsheng_s5212` | 56.80 秒 | -16.8 / -0.0 dB |
| `bgm_reform_qin_C_miaotang_s5213` | 56.91 秒 | -21.3 / -1.3 dB |
| `bgm_reform_chu_A_bianzhong_s5221` | 47.91 秒 | -22.4 / -1.0 dB |
| `bgm_reform_chu_B_jiuge_s5222` | 43.60 秒 | -20.4 / -0.0 dB |
| `bgm_reform_chu_C_yunmeng_s5223` | 54.80 秒 | -19.4 / -1.9 dB |

模型會自己決定在上限(60 秒)之前收尾,楚的兩首只有 44 到 48 秒。三首峰值頂到 0 dB,正式用要降。等 owner 聽。

## 十、owner 的決定與音效批次(2026-09-20 下午)

- **楚 C 雲夢:好**(`bgm_reform_chu_C_yunmeng_s5223`)。其餘五首還沒有評語。
- **順序:先做音效,再做音樂,分批交。**

音效批次(`scratchpad/audio/make_sfx.py`,每個聲音三個版本,Stable Audio 3,每個約 3 秒;試聽頁用 `make_sheet.py` 產生,MP3 內嵌在一個 HTML 裡,每個版本下面是我量到的長度、事件數、峰值):

| 批 | 內容 | 狀態 |
|---|---|---|
| S1 牌與地圖(10 個) | `card.pick`、`card.commit`、`card.reveal`、`card.event.qin`、`card.event.neutral`、`map.confirm`、`map.control.gain` / `.lose`、`map.campaign`、`map.opponent` | 已交 `samples/sfx_batch_S1.html`,等 owner 選 |
| S2 軌道、門檻、回合(11 個) | `track.mandate.qin` / `.chu`、`seal.gain` / `.lose`、`mie`、`warn`、`turn.new`、`turn.era`、`turn.yours`、`turn.clock.tick` / `.last` | 已交 `samples/sfx_batch_S2.html`,等 owner 選 |
| S3 介面與結局(6 個) | `ui.tap`、`ui.error`、`end.win.qin` / `.chu`、`end.lose.qin` / `.chu` | 已定義,未生成 |
| 之前已收下 | `map.place`(s7102)、`card.event.chu`(s7201) | 完成 |

S1 到 S3 加上已收下的兩個,就是清單裡全部 P1 音效。P2、P3 之後再分批。

## 十一、owner 選定的音效(2026-09-20 傍晚)

收下 16 個(資料在 `scratchpad/audio/accepted.json`,原始 FLAC 在 `C:/Users/sheep/code/ComfyUI/output/zongheng_audio/`):

| cue | 版本 |
|---|---|
| `sfx.map.place` | `sfx_map_place_s7102` |
| `sfx.card.event.chu` | `sfx_event_chu_s7201` |
| `sfx.card.pick` | `sfx_card_pick_s8100` |
| `sfx.card.commit` | `sfx_card_commit_s8110` |
| `sfx.card.reveal` | `sfx_card_reveal_s8120` |
| `sfx.card.event.qin` | `sfx_card_event_qin_s8130` |
| `sfx.card.event.neutral` | `sfx_card_event_neutral_s8140` |
| `sfx.map.confirm` | `sfx_map_confirm_s8150` |
| `sfx.map.control.gain` | `sfx_map_control_gain_s8162` |
| `sfx.map.campaign` | `sfx_map_campaign_s8181` |
| `sfx.map.opponent` | `sfx_map_opponent_s8190` |
| `sfx.seal.gain` | `sfx_seal_gain_s8220` |
| `sfx.seal.lose` | `sfx_seal_lose_s8231` |
| `sfx.warn` | `sfx_warn_s8250` |
| `sfx.turn.new` | `sfx_turn_new_s8260` |
| `sfx.turn.yours` | `sfx_turn_yours_s8282` |

退回重做(owner 的話就是新的方向),已重做並交 `samples/sfx_batch_S2b_zh.html`:

| cue | owner 說 | 新做法 |
|---|---|---|
| `sfx.map.control.lose` | 沉重一點,像是關機的聲音 | 一個往下沉、慢慢消失的低音 |
| `sfx.track.mandate.qin` | 鼓聲 | 大戰鼓兩擊,第二擊較低 |
| `sfx.track.mandate.chu` | 有沒有楚國代表的聲音? | A 編鐘三個上行音;B 排簫三個上行音(各三個版本,請選一種代表楚) |
| `sfx.mie` | 城牆倒塌的聲音就好 | 拿掉大鑼,只留夯土牆倒塌 |
| `sfx.turn.era` | 一段中型銅聲 | 中型銅鐘四個慢音的短句,不加鼓 |
| `sfx.turn.clock.tick` / `.last` | 重新產生 | 水滴改成木梆 / 空心木塊 |

試聽頁從這一批起用繁體中文(`make_sheet.py ... zh`):每個聲音有中文名稱、用在哪裡、想要的聲音。

### owner 聽過 S2b(2026-09-20 晚上)

| 聲音 | 選定 |
|---|---|
| `sfx.track.mandate.qin` 天命往秦 | `sfx_track_mandate_qin_s8311`(戰鼓兩擊) |
| `sfx.track.mandate.chu` 天命往楚 | **兩個都收**:`sfx_track_mandate_chu_s8322`(A 編鐘)和 `sfx_track_mandate_chu_paixiao_s8330`(B 排簫)。owner 兩行都列了,沒說二選一;接線時先用編鐘,排簫留作楚的第二個代表音色(待 owner 確認要不要疊在一起) |
| `sfx.mie` 秦滅一國 | `sfx_mie_s8342`(只有城牆倒塌) |
| `sfx.turn.era` 進入新時期 | `sfx_turn_era_s8350`(中型銅鐘四個慢音) |
| `sfx.turn.clock.tick` 倒數滴答 | `sfx_turn_clock_tick_s8360`(木梆) |
| `sfx.turn.clock.last` 倒數最後三秒 | `sfx_turn_clock_last_s8371`(空心木塊) |
| `sfx.map.control.lose` 失去控制 | **再重作**(第二次退回,沒有新的方向,仍是「沉重一點,像關機的聲音」)。批次 S2c 換三種解讀,各三個版本:A 三個很快往下的低音(像關機的提示音)、B 大銅鐘敲一下立刻被手按住、C 音高往下滑的大鼓。種子 85xx |

到這裡收下 **23 個**音效檔(22 個 cue,天命往楚有兩個)。S2c 和 S3(按鈕、不能點、四個結局的開場聲,種子 84xx)同時生成:`sfx_burst.py` 一次把全部音效工作丟進 ComfyUI 的佇列,不然每個 3 秒的音效都要排在一首 10 分鐘的音樂後面。

## 十二、音樂批次(2026-09-20 傍晚,owner:「先產生musics,我等會再聽sounds」)

做法照 owner 選中的「楚 C 雲夢」:MiniMax 自己的 caption 寫法(正面、具體、逐段時間線)、八音分家(秦 = 土革絲,楚 = 金石竹)、秦 D 羽調 / 楚 G 宮調。**每首直接做成正式長度**(換長度就是另一首曲子,所以選中的檔就是上線的檔):牌桌 120 秒、首頁 90 秒、勝利 30 秒(不循環)、敗北 60 秒。每首兩個種子。腳本 `scratchpad/audio/make_music.py`(批次 M1、M2)→ `jobs_music_all.json`(每個情境先做第一個版本,再做第二個,因為這台 PC 會重開)→ `audio_queue.py`;試聽頁 `make_music_sheet.py` → `samples/bgm_batch_M1_zh.html`、`bgm_batch_M2_zh.html`(繁體中文)。

**M1 牌桌(12 首,各 120 秒)**

| id | 名字 | 性格 |
|---|---|---|
| `bgm.table.reform.qin` | 秦 D 渭水 | 和「楚 C 雲夢」成對:秦箏主奏、塤的長音、缶輕拍、古琴滑音,66 BPM。(第二輪的秦 A / B / C owner 沒有評語) |
| `bgm.table.alliance.qin` | 秦 連橫 | 使者的車在路上:缶與拍腿的穩定節奏、秦箏同音反覆、塤獨奏、古琴與箏對話,84 BPM |
| `bgm.table.alliance.chu` | 楚 郢都 | 宴請使者:手鈴與巫鼓、瑟主奏、笙、排簫獨奏、編磬、骨笛,84 BPM |
| `bgm.table.conquest.qin` | 秦 虎狼 | 秦軍出關:成排戰鼓、低音箏的四音動機、塤嘶喊、木梆,100 BPM |
| `bgm.table.conquest.chu` | 楚 國殤 | 祭陣亡將士:大鐘如警報、建鼓、中鐘動機、篪、瑟輪指、編磬連擊,100 BPM |
| `bgm.table.reform.chu` | 楚 C 雲夢(長版) | 已選中的是 55 秒版(`s5223`);同一份描述做 120 秒,不如原版就用原版 |

**M2 首頁與結局(11 首)**

| id | 名字 | 性格 |
|---|---|---|
| `bgm.landing` | 兩個朝廷 | 秦的箏與缶、楚的編鐘一句一句對答,中段只同時演奏一次,56 BPM,90 秒 |
| `bgm.win.qin` | 一統 | 戰鼓、缶、箏的空五度、昂揚的上行句,一擊收住,30 秒 |
| `bgm.win.chu` | 鳳鳴 | 整組編鐘掃上去、歡騰的旋律、編磬、排簫,齊鳴收尾,30 秒;另做一個加遠處無字吟唱的版本 |
| `bgm.lose.qin` | 燼 | 餘火與風、一支塤三個下行音、句子沒吹完就斷,60 秒 |
| `bgm.lose.chu` | 楚歌 | 風與餘火、一顆有裂痕的鐘、遠處一個人哼一小段無字哀歌、瑟的斷音,60 秒 |

之後(M3):`bgm.setup`(主題的安靜版)、`bgm.tension`(危急層)、`bgm.tutorial`。峰值頂到 0 dB 的檔正式用前要降音量。
