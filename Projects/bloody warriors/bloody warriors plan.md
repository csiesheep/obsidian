---
tags: [project, game, 3d]
status: design
started: 2026-10-04
slug: bloody_warriors
name: 一騎當前
---
# 一騎當前 bloody warriors - plan

> [!info] 設計 v0.4:元素、規則、技術棧與 M0–M5 里程碑已定(owner v0 確認 2026-10-04;M0 實測確認 speed/相機 2026-10-04)
> 名稱:**一騎當前**(「一騎當千」的變體,孤騎當前)。vault 專案 `bloody warriors`(本檔),repo 代號 `bloody_warriors`。
> repo https://github.com/csiesheep/bloody_warriors (public,目前只有 README + DESIGN.md,未部署)。
> 三國無雙類網頁 3D 血腥版:Three.js、Low-poly、v1 單武将(趙雲)、弧光血花。

## Overview

**一騎當前** 是三國無雙類(Dynasty Warriors)的網頁 3D 動作遊戲:玩家是一名三國將軍,長槍在手,獨自在戰場上對著數百敵兵一騎當千地砍過去。血腥版:每一擊、每一殺都在地上留血,戰場越血腥,玩家越接近「無雙」。

- 類型:3D 砍殺(hack and slash)、兵海、一騎當千
- 平台:網頁(桌面,鍵盤 + 滑鼠),Three.js / WebGL
- 玩家:1 人(單機),v1 不上線
- 一局:3 波敵兵 + 1 敵將,約 5 到 10 分鐘
- 美術:Low-poly 風格化
- 語言:v1 先繁中(後期加英文)
- 同人、非官方(自創設定,不用三國志官方美術)

## 設計鉤子:血腥即力量

核心機制與血腥視覺綁在一起:

- 每一擊、每一殺,都在地上留下血。
- 血累積 → 無雙計量表填滿 → 可進入 **無雙狀態**:數秒內無敵、攻擊強化、滿屏血光。
- 「血腥」不是裝飾,而是核心機制的進度條。殺得越狠,無雙來得越快。

**無雙幻想(一騎當千):** 敵兵數量永遠是玩家的 10 到 20 倍。玩家幾乎從不 1v1,永遠站在兵堆中間。

### 核心迴路(micro-loop)

1. 衝進兵堆(突進)
2. 普攻連段砍倒一片(連擊)
3. 血飛、無雙表漲、畫面泛紅
4. 表滿 → 開無雙狀態,把身前一片掃平(必殺,最大爽點)
5. 敵將出現 → 集火
6. 斬落敵將 → 勝利

體感目標:流暢(幾乎不停頓)、爽快(砍人群)、肉感(滿屏血)、釋放(無雙的 payoff)。

## 遊戲元素

### 將軍(玩家)

- v1 角色:趙雲(蜀漢)。兵器:龍膽亮銀槍(長柄長槍)。
- 選長槍:長距離 + 大範圍掃擊 = 清群體手感最好;也是無雙類最具代表性的兵器。
- 設計武器無關:換刀 / 劍 / 錘只改 hitbox 形狀與攻擊動畫表,不改系統。
- 實體屬性:
  - `HP`:100
  - `musouMeter`:0 到 100(見規則「無雙表」)
  - `speed`:快於敵兵(玩家永遠是快的那一方)
  - `facing`:面向(由滑鼠決定)

### 兵器(龍膽亮銀槍)

- 碰撞:角色前方長錐(長度約 2.5 倍身、掃擊時張角變大)。
- 射程是核心:不打近身也能掃到前方一排敵兵。
- 所有 hitbox 參數集中 config。

### 敵兵(兵海)

- v1 只一種:步兵,近戰、慢、低 HP。
- `HP` 30(2 到 3 下普攻殺)、`damage` 5、`speed` 慢於將軍。
- 狀態:Spawn / Chase / Attack / Stagger / Die。
- 呈現:low-poly + InstancedMesh(數百人一次 draw call)。

### 敵將(小 Boss)

- v1:夏侯惇(曹軍)。
- 有獨立 HP 血條(畫面頂部)、`HP` 300。
- 必殺:直線衝刺突刺、三段連擊;低血(小於 30%)狂暴。
- 3 波步兵後出現;斬落他 = 勝利。

### 戰場

- v1 地圖:長坂坡(趙雲招牌戰,單騎救阿斗)。
- 地面 + 邊界(圍欄 / 崖 / 樹)+ 少量障礙(巨石、破車)+ 刷兵點(地圖邊緣)+ 血池區。
- 地圖 = 資料檔:邊界多邊形 + 障礙清單 + 刷兵點清單。

### 動作

| 動作 | 輸入 | 手感 | 用途 |
| --- | --- | --- | --- |
| 普攻 | 左鍵 / J | 快、三段連 | 主要輸出、填無雙表 |
| 重擊 | 右鍵 / K | 慢、高傷 + 擊退 | 破段、推開人群 |
| 突刺 | (普攻變體 / 專屬鍵) | 長距離點刺 | 遠距離點殺單體 |
| 突進 | Shift | 短位移 + 短暫無敵 | 進出人群、閃避 |
| 防禦 | 按住 U | 減傷 | 被包圍時撐時間 |
| 無雙狀態 | 空白鍵 / L | 耗滿表、大範圍 + 無敵 + 慢動作 | 爽點 |

### 血腥系統(差異化)

- 弧光血花(爽快版):命中 / 擊殺噴血、畫面濺血、慢動作,但不斷肢(斷肢留後期「重血腥」模式)。
- 元素:血花粒子(池化)、血池(地面,舊的淡出)、畫面濺血(受擊時)、畫面泛紅(血水平越高越紅)。
- 血水平(0 到 100):視覺強度值,隨擊殺累積,驅動上述四項。與無雙表相關但獨立:血水平管「畫面多血腥」,無雙表管「離無雙多近」。

### 數值實體(集中 config)

將軍 HP、敵兵 HP / 傷害、各攻擊傷害、連擊視窗、無雙表增減、血水平增減、血池 / 粒子上限,全部集中一張 config 表,調參不改程式。

## 遊戲規則

### 戰鬥與碰撞

- 碰撞:攻擊「有效幀」觸發時,兵器 hitbox(錐)對每顆敵兵碰撞球判定。命中 → 傷害 + 血 + 硬直。
- 傷害:普攻 15 / 重擊 30 / 必殺 60;敵兵 `HP` 30。
- 硬直(stagger):受擊進 Stagger(0.3s),中斷自己的攻擊;硬直中可再被擊(供連段)。
- 擊退:重擊與必殺把敵兵短距推開。
- 擠推:敵兵互相推擠(簡單分離力),不堆在將軍身上。
- hit-stop:擊殺時全場 0.05s 停格 + 小幅抖動(肉感)。

### 普攻連段

- 三段鏈:第 1 段(刺 / 側掃)→ 第 2 段(另一側掃)→ 第 3 段(大上劈,高傷 + 擊退)。
- 鏈接:攻擊後搖中再按攻擊鍵 → 接下一段;鏈結束回第 1 段。
- 連擊數(combo):0.8s 視窗內的連續命中累加;視窗過期歸零。驅動得分倍率。

### 重擊與突刺

- 重擊:風慢、傷害高(30)、擊退;衝開人群、推開喘空間。
- 突刺:長距離點刺,遠距離點殺單體,冷卻短。

### 無雙表與無雙狀態(核心鉤子)

- 無雙表(0 到 100):
  - 增加:普攻命中 +5、重擊命中 +8、擊殺 +15、(受擊 −5,可選)
  - 衰減:非無雙時 −2/秒(已定,節奏緊湊)
- 無雙狀態(表滿可啟動):
  - 持續 5 秒
  - 期間:無敵、普 / 重傷 ×1.5、移速 +20%、每擊留血弧、畫面紅金色調
  - 啟動耗盡全表
  - 啟動瞬間:短暫慢動作 + 一道大血弧掃過(全遊戲最帥的一刻)
- 設計意圖:戰場越血腥(殺越多)→ 表漲越快 → 無雙越頻繁 → 越爽。

### 敵兵 AI 與波次

- 狀態機:
  - Spawn:刷兵點出現(0.5s)
  - Chase:朝將軍移動、保持個間距,進攻擊範圍 → Attack
  - Attack:風(0.4s tell)→ 攻擊(有效幀)→ 收(0.3s);落空回 Chase
  - Stagger:受擊後 0.3s
  - Die:倒地(0.4s)+ 大血花 + 留血池,之後回池
- 波次:v1 = 3 波步兵 + 1 敵將。波 1:10 兵、波 2:15 兵、波 3:20 兵(同場上限約 15,多的排隊)。波間歇 3 秒。波 3 結束 → 敵將出現。
- 同場上限:同場 ≤ 20 敵兵(性能 + 節奏)。

### 敵將規則

- 波 3 後出現(「敵將登場」+ 畫面變暗)。`HP` 300、有血條。
- 普通:追擊 + 攻擊(傷害 10)。
- 必殺 1:直線衝刺突刺(一條直線衝,閃或吃大傷)。
- 必殺 2:三段連擊。
- 低血(小於 30%)狂暴:攻速 +20%。
- 被斬 → 大血花 + 慢動作 → 勝利。

### 血腥規則

- 血水平(0 到 100):擊殺 +8、普攻命中 +2;衰減 −3/秒。
- 驅動:畫面泛紅(已定,邊緣→中大紅,0 → 無、100 → 中大面積紅,不到滿屏深紅)、血池大小 / 不透明度、擊殺慢動作(血水平 > 70 觸發)。
- 性能上限(池化):血花粒子同場 ≤ 500、血池同場 ≤ 40、敵兵同場 ≤ 20。
- 畫面濺血:受擊時螢幕邊緣血漬,2s 淡出。

### 勝負與計分

- 勝利:斬落敵將。失敗:將軍 `HP` = 0。
- 基礎分:敵兵擊殺 100、敵將擊殺 1000;連擊倍率 ×(1 + 連擊數 × 0.1);時間加分(越快越高)。
- 得分供自我挑戰 / 排行,不綁核心迴路。

## 操作(網頁)

- 移動:WASD / 方向鍵
- 指向:滑鼠(將軍面向滑鼠方向)
- 普攻:左鍵 / J;重擊:右鍵 / K
- 無雙狀態:空白鍵 / L(表滿時)
- 突進:Shift;防禦:按住 U(專屬鍵,避免與 S 後退衝突)
- 相機:第三人稱跟隨(將軍後上方、固定角、隨移動自動跟)
- 手機觸控:v1 非目標

## v1 範圍

**做:**

- Low-poly 風格化 3D 美術
- 1 武将(趙雲,龍膽亮銀槍)
- 1 地圖(長坂坡)
- 1 敵兵種(步兵)+ 1 敵將(夏侯惇)
- 普攻(三段)/ 重擊 / 突進 / 防禦 / 無雙狀態
- 3 波步兵 + 1 敵將
- 弧光血花(血花 / 血池 / 畫面濺血 / 畫面泛紅 / 慢動作)
- 無雙表 + 無雙狀態
- 勝負 + 計分
- 桌面鍵盤 + 滑鼠
- iPhone 觸控(虛擬搖桿 + 攻擊鈕 + 自動瞄準,M1.5 提前做,原列「後期」)

**不做(後期):**

- 多武将 / 選將畫面
- 多地圖 / 多任務(長坂救阿斗的護衛關)
- 弓兵 / 重甲敵兵
- 重血腥模式(斷肢、斷頭)
- 音效 / BGM
- 線上 / 排行榜
- 存檔 / 設定

## Decisions

| 日期 | 決定 | 誰 |
| --- | --- | --- |
| 2026-10-04 | 先出設計文件(元素與規則),技術棧與里程碑下一輪 | owner |
| 2026-10-04 | 3D 引擎:Three.js | owner |
| 2026-10-04 | v1 單武将 | owner |
| 2026-10-04 | 血腥:爽快的弧光血花 | owner |
| 2026-10-04 | 正式名稱:一騎當前 | owner |
| 2026-10-04 | 防禦:專屬鍵 U | owner |
| 2026-10-04 | 無雙表:衰減 −2/秒 | owner |
| 2026-10-04 | 敵將:夏侯惇 | owner |
| 2026-10-04 | 美術:Low-poly 風格化 | owner |
| 2026-10-04 | 血紅上限:邊緣→中大紅 | owner |
| 2026-10-04 | 部署:games.csiesheep.com/bloody_warriors/(本 repo 一個 Cloudflare Worker,games 慣例) | owner |
| 2026-10-04 | 突進 2.5m / 0.15s / 期間無敵 / CD 0.8s;防禦減傷 70%、移速減半 | owner |
| 2026-10-04 | 突刺:v0 不做(規格保留) | owner |
| 2026-10-04 | 角色分工:引擎/規則→peer-be、畫面/頁面→peer-fe、美術→peer-artist、文案→peer-writer | owner |
| 2026-10-04 | M0 實測確認:speed 6 m/s、相機 8/10/1.5(寫入 DESIGN §2.1/§4);敵兵 speed 3.5 m/s 為起始值(待確認) | owner |
| 2026-10-04 | M1 landed(`eabaa2f`/deployed `aebed980`):probe=2 時間軸裁定 0.05/0.4、敵兵 (0,-2)(active 窗口按鍵不接鏈,原 0.35 會被吞);peer-be 子 agent 兩度靜默失敗 → orchestrator 自實作 | orchestrator |
| 2026-10-04 | iPhone 觸控提前做(M1.5):左下固定搖桿 + 右下攻擊鈕,指向 = 自動瞄準最近敵人(deadzone 0.3 / 射程 12 m);無敵時保持原朝向 | owner |
| 2026-10-04 | M1.5 landed(`13a3f38`/deployed `61554f2d`):probe=3 決定性(搖桿走 6m + 自動瞄準兩下砍死);證偽 autoAimRange 12→0.5 三條紅;搖桿 DOM 接線未經真機觸控事件,待 owner iPhone 實測 | orchestrator |
| 2026-10-04 | M2 landed(`c18b864`/merged `1f2fd5a`/deployed `9a81249d`):波次 10/15/20(間歇 3s)+兵海(同場上限 20,spawnGap 0.2s)+血水平(kill+8/hit+2/decay−3/s/max100)→泛紅(100→0.6 中大紅)+血池≤40(最舊淡出)+粒子池≤500+擊殺/受擊濺血(12/6);node 20/20、harness 24/24/0、tsc 0;證偽 pool.particle 500→100 → node 2 紅 + harness 2 紅。裁定:①同場上限取 20(§3.5「約 15」pacing 以 spawnGap 取代)②InstancedMesh 延 M5(≤20 用 individual-mesh pool)③kill=+8 不疊 +2 | orchestrator |
| 2026-10-05 | 無雙表「受擊 −5」開(§3.4「可選」定案) | owner |
| 2026-10-05 | M3 landed(`4e7dd2c`/merged `8f5c334`/deployed `3391fe76`):無雙表(+5/+8/+15/−5/−2/s/max100)+無雙 5s(傷×1.5/速×1.2/無敵/0.5s 慢動作 0.4×/紅金調)+重擊(傷 30/擊退 1.5/風 0.5 收 0.4)+受擊畫面濺血(2s 淡出);node 30/30、harness 30/30/0、tsc 0;證偽 musou.decay 2→5 → node 2 紅 + harness 3 紅。裁定:①重擊節奏 0.5/0.15/0.4/pushback 1.5(orchestrator 初值,owner 可調)②擊殺只 +15 ③gain 按 hit 事件 ④重擊與連擊不混用 ⑤orchestrator 自寫自驗 | orchestrator |
| 2026-10-05 | 槍掃動畫提前自 M5(owner 實機:J/K 有傷害但將軍不動,拍板先做):spear 右肩 pivot + 純函式 `spearPose`(phase→sweep/ang/lean,smoothstep;n=1 右→左、n=2 鏡像、n=3 上劈、重擊高舉下砸),時長讀 config;landed `8bf65d6`(merged `728b674`)/deployed `b47246c3`(issue #5 已關);node 34/34、harness 30/30/0、tsc 0;證偽重擊 sweep 1.4→2.4 → node 1 紅。裁定:姿態角度為 orchestrator 初值,玩測可調 | orchestrator |
| 2026-10-05 | M4 landed(`2812405`/merged `46a0a3c`/deployed `7e3273a3`):長坂坡(±20、6 圓柱障礙、8 刷兵點輪用)+ 夏侯惇(HP300/普攻 10/直線衝刺 12m/s・接觸 1.2m 傷 20・滿 8m 停/三段連擊 3×10・0.25s/狂暴 <30% 攻速 ×1.2)+ 突進(Shift,2.5m/0.15s/無敵/CD 0.8)+ 防禦(U,減傷 70%/半速)+ 勝敗畫面(R/鈕重開)+ 計分(100/1000/×(1+連擊×0.1)/時間分 1000−2/s 僅勝利);node 43/43、harness 36/36/0、tsc 0;證偽狂暴門檻 0.3→0.5 → node 2 紅。裁定:①敵將必殺節奏 + 選擇規則(dist>4 衝刺/dist<2.2 連擊/否則普攻,共享 CD 4s)②狂暴 = 內部時鐘 ×1.2、移動用真實 dt ③時間分公式 ④combat.ts 不在權限 → 敵將 hitbox 用 id 9999 代理在 main.ts ⑤防禦減傷只套敵兵(敵將於 stepBoss 內減)——皆 orchestrator 初值,玩測可調 | orchestrator |
| 2026-10-05 | M5 landed(`f54d7b7`/merged `a833bc5`/deployed `50939510`):手感(鏡頭震動 5 類 hit .08/kill .15/bossHit .12/bossAtk .2/hurt .18、0.15s 二次衰減+hit-stop 微震)+血水平 >70 擊殺慢動作 0.25s@0.5×(無雙慢動作較長者保留)+WebAudio 6 種合成音效(volume 0.3、M 靜音、首次觸控解鎖)+性能 pass(粒子→THREE.Points 單 draw call;headless SwiftShader 實測 20 兵+500 粒子 300 幀 avg 1357fps/最慢 100 幀 812fps,draw calls 28)+規則書頁(rules.html,右下角「規則」)+上線(noindex→index、sitemap 補遊戲頁+rules);node 49/49、harness 44/44/0、tsc 0;證偽 killSlowmo.bloodMin 70→95 → node 2 紅。裁定:震動幅度/時長、音效頻率皆 orchestrator 初值,玩測可調;性能門檻 ≥60fps(headless 留 13× margin) | orchestrator |
| 2026-10-07 | 無雙 bugfix(issue #8,owner 實玩「無雙好像不能用?」):根因 = musouKill/musouHit clamp 到恰好 100,stepMusou 每幀 decay 2/s 連滿格都照減 → 下一幀 99.97,tryActivate 嚴格 >=100 永遠 false;UI Math.round() 一直顯示 100%(騙人)、.full 光暈只亮 1 幀 → 滿表 <1 幀,人類按不到。修法 = stepMusou 滿格 pin 不 decay(直到啟動耗盡),滿格時 .full 常亮 = ready 線索;landed `98b3af4`(merged `f2f9856`)/deployed `c7e11865`;node 50/50(新 guard:填滿→stepMusou 5 幀→仍 100→tryActivate true)、tsc 0;證偽:還原舊邏輯 → 新測試紅(99.8333≠100);CDP e2e(修正版 build 實時):meter 100%@9.5s→按 Space→fx 0→1、meter 歸零、active 中再填 40%、score 1110→1640(×1.5 生效);live byte-match OK。裁定:pin-at-max 取代「滿格也 decay」(原 decay 設計意圖是催使用,但與嚴格門檻自相矛盾);無雙未滿按鍵仍無回饋(silent fail)= 玩測可再加 | orchestrator |
| 2026-10-07 | M6 美術 landed(`4917315`/merged `5c4de94`/deployed `533b66b7`):DESIGN v0.5 §8 落地——主角趙雲(銀白甲 0xe3e9f2+藍飾 0x2f5d8a+銀槍 2.4m,scale 1.05)、敵兵(暗紅棕 0x7c3a2f,merged 10-box 幾何+20 份 Lambert jitter 0.92–1.08,scale 1.0)、敵將夏侯惇(黑甲 0x26262e+金飾 0xc8a23a+獨眼發光 0xff3b30+大環刀,scale 1.6,狂暴時甲紅 0x881111/眼 0xff8a7a)、長坂坡(gradient 天穹 0x8fa3b8→0xc9b89a 單 canvas 貼圖、黃土 0x9a8a5c+暗斑/枯草/巨石/斷籬/界石全合併 vertex-color 1 draw call);node 53/53(新 m6 guard:SPEC 常數+尺度階序 boss>hero>soldier+faction luminance 主角>敵將+80)、tsc 0;證偽 boss.eye 0xff3b30→0x3b6aff → 紅(3894015≠16726832);probe7 實測(SwiftShader,20 兵+500 粒子+新場景,300 幀):avg 603.7fps/最慢 100 幀 248.3fps/draw calls 36(M5:1357/812/28)→ 8.7× 60fps 門檻;CDP 三截圖(bw6-01 開場/02 戰鬥/03 敵將,敵將 50.3s 出現、HP100 存活,存 Temp\opencode 待 owner 眼睛 QA);live byte-match(sha256 014212cc…)。裁定:色板/場景細節皆 §8 owner 拍板值;CDP headless 無滑鼠 → 角色固定朝向,J-mash 站樁會死,玩測腳本須 ?touch=1 auto-aim + 無雙 kiting | orchestrator |

## Milestones(正式拆解,DESIGN.md §7.4,2026-10-04)

技術棧:Vite + TypeScript + Three.js;敵兵 InstancedMesh;血花/血池池化;HUD 用 DOM overlay;config.ts 單一數值表;Cloudflare Worker(path-prefix router)部署。

| | 內容 | 驗收 | 證偽 |
| --- | --- | --- | --- |
| M0 | 骨架:Vite+TS+Three、地面+邊界、佔位將軍、WASD+滑鼠、跟隨相機、placeholder 部署 | 頁面載入、玩家可動、相機跟隨;?json=1 報得出玩家位置 | 改 config 速度 → guard 紅 |
| M1 | 三段普攻鏈+hitbox、傷害/硬直/擊退、假人敵兵 AI、擠推、hit-stop、連擊計數 | 假人 HP30 兩下死;敵兵能傷將軍;連擊數正確 | 改鏈接視窗 → 紅 |
| M2 | 波次(10/15/20、同場≤20)、兵海、血水平→泛紅、血池≤40、粒子池≤500 | 波次數量正確;連殺 60 人池子不爆 | 改粒子上限 → 紅 |
| M3 | 無雙表(+5/+8/+15、−2/s)+無雙狀態(5s)+濺血 | 腳本輸入逐步比對表值;無雙恰好 5s | 改衰減率 → 紅 |
| M4 | 長坂坡地圖、夏侯惇(HP300+2 必殺+狂暴)、勝/敗、計分 | 完整 3 波+斬將→勝利;計分公式驗證 | 改狂暴門檻 → 紅 |
| M5 | 手感、慢動作、音效、性能 pass(≥60fps)、眼睛 QA、規則書、上線 | 全套 guard 綠 + 性能數字 + owner 親眼驗 | 套件即閘門 |

## Open questions

- (無雙表「受擊 −5」已定:開,2026-10-05;突刺輸入已隨「v0 不做」一起解除;其餘已定,見 Decisions。)

## Next steps

- [x] 技術棧 + M0–M5 拆解(DESIGN.md v0.3 §7,2026-10-04)
- [x] M0:骨架 + 部署到 games.csiesheep.com/bloody_warriors/(2026-10-04 完成,SHA 6b9bd3f,owner 已玩過)
- [x] M0 通過後開 orchestrator session(cwd 在 repo),目標 M1(2026-10-04,issue #1,派 peer-be)
- [x] M1:核心戰鬥迴圈(三段普攻鏈 + 假人敵兵),landed main `eabaa2f`、deployed `aebed980`(2026-10-04,issue #1 已關;peer-be 子 agent 兩度靜默失敗 → orchestrator 自實作;鏈接 guard 強化:補後搖 0.2s 斷言)
- [x] M1.5:iPhone 觸控(虛擬搖桿 + 攻擊鈕 + 自動瞄準),landed main `13a3f38`、deployed `61554f2d`(2026-10-04,issue #2 已關;node 12/12、harness 17/17/0;搖桿 DOM 接線待實機驗證)
- [x] M2:波次(10/15/20)+ 兵海(同場上限 20)+ 血水平泛紅 + 血池/粒子池,landed main `c18b864`(merged `1f2fd5a`)、deployed `9a81249d`(2026-10-04,issue #3 已關;node 20/20、harness 24/24/0、tsc 0;證偽 pool.particle 500→100 → node 2 紅 + harness 2 紅)
- [x] M3:無雙表(+5/+8/+15/−5/−2/s)+ 無雙狀態(5s:×1.5/×1.2/無敵/慢動作)+ 重擊(傷 30/擊退)+ 受擊畫面濺血,landed main `4e7dd2c`(merged `8f5c334`)、deployed `3391fe76`(2026-10-05,issue #4 已關;node 30/30、harness 30/30/0、tsc 0;證偽 musou.decay 2→5 → node 2 紅 + harness 3 紅;裁定:受擊 −5 開、重擊節奏 orchestrator 初值、擊殺只 +15、重擊與連擊不混用)
- [x] 槍掃動畫(提前自 M5):spear 改右肩 pivot 驅動,純函式 `spearPose` 由 swing/heavy phase 算 sweep/ang/lean(n=1 右→左、n=2 鏡像、n=3 上劈、重擊高舉下砸),時長讀 config,landed main `8bf65d6`(merged `728b674`)、deployed `b47246c3`(2026-10-05,issue #5 已關;起因 owner 實機:J/K 有傷害但將軍不動;node 34/34、harness 30/30/0、tsc 0;證偽重擊 sweep 1.4→2.4 → node 1 紅;裁定:姿態角度為 orchestrator 初值,玩測可調)
- [ ] owner 實機玩測(M1 戰鬥 / M1.5 搖桿 / M2 波次推進 + 兵海堆積 + 泛紅 / M3 無雙表漲與開、重擊擊退、受擊濺血 / 槍掃動畫:J 掃槍、第三段上劈、K 高舉下砸)
- [x] M4:長坂坡地圖(6 障礙 + 8 刷兵點輪用)+ 夏侯惇(HP300+2 必殺+狂暴)+ 突進/防禦 + 勝/敗畫面 + 計分,landed main `2812405`(merged `46a0a3c`)、deployed `7e3273a3`(2026-10-05,issue #6 已關;node 43/43、harness 36/36/0、tsc 0;證偽狂暴門檻 0.3→0.5 → node 2 紅;裁定:必殺節奏/時間分公式/敵將 proxy 為 orchestrator 初值)
- [x] M5:手感(震動/擊殺慢動作)+極簡音效+性能 pass(粒子→單 draw call)+規則書+上線,landed main `f54d7b7`(merged `a833bc5`)、deployed `50939510`(2026-10-05,issue #7 已關;node 49/49、harness 44/44/0、tsc 0;證偽 bloodMin 70→95 → node 2 紅;性能 headless 實測 1357fps/812fps、draw calls 28;裁定:震動/音效為 orchestrator 初值,玩測可調)
- [x] 無雙 bugfix:滿格 pin 不 decay,修 tryActivate 嚴格 >=100 幾乎必敗,landed main `98b3af4`(merged `f2f9856`)、deployed `c7e11865`(2026-10-07,issue #8 已關;node 50/50、tsc 0;CDP e2e 確認滿格按 Space 有啟動)
- [x] M6 美術:主角/敵兵/敵將/長坂坡場景脫離占位 capsule(DESIGN v0.5 §8),landed main `4917315`(merged `5c4de94`)、deployed `533b66b7`(2026-10-07,issue #9 已關;node 53/53、tsc 0、證偽紅;probe7 603.7fps/248.3fps/draw calls 36;CDP 三截圖待 owner 眼睛 QA)

## Related

- repo:https://github.com/csiesheep/bloody_warriors
- 設計文件(repo 內,與本檔同步):`bloody_warriors/DESIGN.md`
