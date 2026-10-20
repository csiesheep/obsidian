---
title: csiesheep.com 部落格｜AdSense「低價值內容」改善計畫
tags:
  - project
  - blog
  - adsense
  - plan
status: plan-approved-ready-for-handover
created: 2026-10-20
updated: 2026-10-20
---

# csiesheep.com 部落格｜AdSense「低價值內容」改善計畫

> [!info] 一句話
> AdSense 只審主網域：csiesheep.com 被判「低價值內容」，games.csiesheep.com（遊戲站）就跟著不能放廣告。審核員看的是部落格。部落格的問題是**短篇多、舊技術筆記多、主題分散**。owner 2026-10-20 核准四步：(1) 處理短篇舊文、(2) 補 8–10 篇原創長文、(3) 把 2026 的開發日記寫長、(4) 收錄後重新送審。

## 0. 背景與已確認的事

- **AdSense 狀態**（owner 2026-10-20）：申請的網站是 `csiesheep.com`，結果「低價值內容」。
- **子網域規則**：AdSense 網站清單只收主網域，子網域不另審（[Site management is changing in AdSense](https://support.google.com/adsense/answer/12170421?hl=en)、[Add a new site](https://support.google.com/adsense/answer/9130110/add-or-remove-a-subdomain-in-your-sites-list?hl=en-GB)）。所以 games.csiesheep.com 的 42 個時代頁幫不到這次審核。
- **ads.txt**：`csiesheep.com/ads.txt` 與 `games.csiesheep.com/ads.txt` 都是 `google.com, pub-1718750784240290, DIRECT, f08c47fec0942fa0`；開頭那行外掛註解是規格允許的，不是問題。
- **部落格已有**：隱私權政策頁（約 1300 字）、選單分類 Book／Movie／Game／CS／Note／Life。缺的是有份量的內容，不是頁面。
- **H5 遊戲廣告**：要先有通過審核的 AdSense 帳號與網站，再另外填 H5 Games Ads 申請表（[AdSense H5 Games Ads](https://adsense.google.com/start/h5-games-ads/)）。

## 1. 量到的現況（2026-10-20，抓 sitemap-1.xml 的 57 篇，數內文的中文字）

- 中位數 **549 字**；**43 篇不到 800 字**，其中 **10 篇不到 300 字**。
- 年份：多數是 2008–2012 從 blogspot 搬來的筆記（標題前還留著 `>`），2019、2021 各一批，2026 只有 5 篇（遊戲開發日記）。
- 分類：Book 13、CS 13、Uncategorized 10、Game 8、Movie 6、Life 5、AI 4、Note 3——主題很散，Uncategorized 有 10 篇。

### 1.1 每一篇（由短到長）

| 中文字數 | 年 | 分類 | 文章 | 建議 |
|---|---|---|---|---|
| 94 | 2010 | CS | [SyntaxHighter: 在 blogspot 上顯示漂亮的 code ](https://csiesheep.com/2010/09/08/syntaxhighter-在-blogspot-上顯示漂亮的-code-格式/) | 不收錄或刪（太短） |
| 105 | 2010 | CS | [Python: default value to a constructor](https://csiesheep.com/2010/09/07/python-default-value-to-a-constructor-parameter/) | 不收錄或刪（太短） |
| 136 | 2011 | CS | [【筆記】如何設定 sudo 權限?](https://csiesheep.com/2011/02/10/如何設定-sudo-權限/) | 不收錄或刪（太短） |
| 156 | 2011 | Life | [【生活】手機慢慢融入生活](https://csiesheep.com/2011/02/08/手機慢慢融入生活/) | 不收錄或刪（太短） |
| 163 | 2011 | CS | [【筆記】WordPress 10分鐘安裝](https://csiesheep.com/2011/02/26/wordpress-10分鐘安裝/) | 不收錄或刪（太短） |
| 168 | 2010 | CS | [其他 highlight code syntax 方法](https://csiesheep.com/2010/09/08/其他-highlight-code-syntax-方法/) | 不收錄或刪（太短） |
| 186 | 2010 | Uncategorized | [rsync 來備份 mysql database (MyISAM)](https://csiesheep.com/2010/09/01/rsync-來備份-mysql-database-myisam/) | 不收錄或刪（太短） |
| 194 | 2008 | Uncategorized | [Yahoo interns 午餐聚](https://csiesheep.com/2008/07/06/yahoo-interns-午餐聚/) | 不收錄或刪（太短） |
| 225 | 2008 | Uncategorized | [Yahoo 1st week](https://csiesheep.com/2008/07/06/yahoo-1st-week/) | 不收錄或刪（太短） |
| 225 | 2011 | CS | [【筆記】WordPress 固定網址設定](https://csiesheep.com/2011/02/26/wordpress-固定網址設定/) | 不收錄或刪（太短） |
| 312 | 2012 | CS | [【筆記】Mongodb 特色，缺點，優化](https://csiesheep.com/2012/03/05/mongodb-特色，缺點，優化-筆記/) | 擴寫到 800 字以上，或不收錄 |
| 324 | 2010 | CS | [SEO: blogspot 自動產生 meta keyword 和 cont](https://csiesheep.com/2010/09/02/seo-blogspot-自動產生-meta-keyword-和-content/) | 擴寫到 800 字以上，或不收錄 |
| 324 | 2011 | CS | [【筆記】用 Go Daddy 註冊 Domain name 和設定 DNS](https://csiesheep.com/2011/03/15/用-go-daddy-註冊-domain-name-和設定-dns/) | 擴寫到 800 字以上，或不收錄 |
| 326 | 2011 | Note | [【點子】電影推薦家](https://csiesheep.com/2011/04/21/點子-電影推薦家/) | 擴寫到 800 字以上，或不收錄 |
| 345 | 2011 | CS | [【筆記】WordPress 同步發文至 Facebook, twitter](https://csiesheep.com/2011/03/05/wordpress-同步發文至-facebook-twitter-plurk-google-buzz-等社群網路/) | 擴寫到 800 字以上，或不收錄 |
| 345 | 2012 | CS | [【筆記】地圖上的即時問答服務 ex: LocalMind, 面包圈](https://csiesheep.com/2012/02/25/地圖上的即時問答服務/) | 擴寫到 800 字以上，或不收錄 |
| 361 | 2010 | Life | [【食記】小心上一ㄣˇ (小心上癮) 素食 麻辣火鍋 吃到飽](https://csiesheep.com/2010/09/19/食記-小心上一ㄣˇ-小心上癮-素食-麻辣火鍋-吃到飽/) | 擴寫到 800 字以上，或不收錄 |
| 385 | 2012 | Book | [【讀書筆記】漫畫統計學](https://csiesheep.com/2012/07/26/讀書筆記-漫畫統計學/) | 擴寫到 800 字以上，或不收錄 |
| 421 | 2011 | Life | [【開箱】歐姆龍體脂計 Omron HBF-356](https://csiesheep.com/2011/02/19/開箱文-歐姆龍體脂計-omron-hbf-356/) | 擴寫到 800 字以上，或不收錄 |
| 430 | 2009 | Uncategorized | [面試 如何移動富士山?](https://csiesheep.com/2009/07/23/面試-如何移動富士山/) | 擴寫到 800 字以上，或不收錄 |
| 450 | 2012 | Movie | [【普好雷】 大藝術家](https://csiesheep.com/2012/04/17/普好雷-大藝術家/) | 擴寫到 800 字以上，或不收錄 |
| 499 | 2010 | Book | [【讀書筆記】瞬間贏得信任的冷讀術](https://csiesheep.com/2010/04/01/讀書筆記-瞬間贏得信任的冷讀術/) | 擴寫到 800 字以上，或不收錄 |
| 505 | 2010 | Book | [你管別人怎麼想](https://csiesheep.com/2010/03/07/你管別人怎麼想/) | 擴寫到 800 字以上，或不收錄 |
| 508 | 2009 | Book | [科技頑童沃茲尼克 iWoz](https://csiesheep.com/2009/07/30/科技頑童沃茲尼克-iwoz/) | 擴寫到 800 字以上，或不收錄 |
| 508 | 2010 | Book | [【讀書筆記】有錢人的口頭禪 貧窮人的口頭禪](https://csiesheep.com/2010/03/31/讀書筆記-有錢人的口頭禪-貧窮人的口頭禪/) | 擴寫到 800 字以上，或不收錄 |
| 528 | 2021 | Book | [【讀書筆記】如何利用80/20法則達成非凡的成就?](https://csiesheep.com/2021/01/31/讀書筆記-如何利用80-20法則達成非凡的成就/) | 擴寫到 800 字以上，或不收錄 |
| 535 | 2009 | Uncategorized | [羊羊騎貘姿勢佳 啾竟回答問題回答的怎麼樣呢?](https://csiesheep.com/2009/07/21/羊羊騎貘姿勢佳-啾竟回答問題回答的怎麼樣呢/) | 擴寫到 800 字以上，或不收錄 |
| 541 | 2009 | Uncategorized | [Plurk 機器人朋友們~](https://csiesheep.com/2009/07/18/plurk-機器人朋友們/) | 擴寫到 800 字以上，或不收錄 |
| 549 | 2011 | Game | [【桌遊戰報】Once upon a time 誰能比她慘 牧羊女的一生](https://csiesheep.com/2011/02/20/戰報-once-upon-a-time-誰能比她慘-牧羊女的一生/) | 擴寫到 800 字以上，或不收錄 |
| 558 | 2012 | Life | [【生活】微波爐對人體的影響?](https://csiesheep.com/2012/05/06/生活-微波爐對人體的影響/) | 擴寫到 800 字以上，或不收錄 |
| 565 | 2009 | Uncategorized | [【無雷】Honey & Clover (中譯: 蜂蜜與四葉草)](https://csiesheep.com/2009/08/20/日劇-honey-clover-中譯-蜂蜜與四葉草-無雷/) | 擴寫到 800 字以上，或不收錄 |
| 570 | 2010 | Uncategorized | [運動 vs 減肥](https://csiesheep.com/2010/02/11/運動-vs-減肥/) | 擴寫到 800 字以上，或不收錄 |
| 579 | 2009 | Uncategorized | [羊羊騎貘姿勢佳 10000朋友突破!](https://csiesheep.com/2009/07/16/羊羊騎貘姿勢佳-10000朋友突破/) | 擴寫到 800 字以上，或不收錄 |
| 591 | 2010 | Movie | [Man vs Wild 荒野求生秘技](https://csiesheep.com/2010/09/09/man-vs-wild-荒野求生秘技/) | 擴寫到 800 字以上，或不收錄 |
| 621 | 2017 | Book | [【學習筆記】推薦 羅輯思維，一個隨時學習的好朋友](https://csiesheep.com/2017/03/28/學習筆記-推薦-羅輯思維，一個隨時學習的好朋友/) | 擴寫到 800 字以上，或不收錄 |
| 622 | 2011 | Uncategorized | [【好雷】魔髮奇緣](https://csiesheep.com/2011/03/27/好雷-迪士尼50-魔髮奇緣/) | 擴寫到 800 字以上，或不收錄 |
| 630 | 2011 | Game | [【桌遊戰報】Once upon a time 暴發戶廚師的旅程](https://csiesheep.com/2011/02/20/戰報-once-upon-a-time-暴發戶廚師的旅程/) | 擴寫到 800 字以上，或不收錄 |
| 637 | 2017 | Book | [【學習筆記】一萬小時的努力? 專注力及跳脫舒適圈](https://csiesheep.com/2017/04/08/學習筆記-一萬小時的努力-專注力及跳脫舒適圈/) | 擴寫到 800 字以上，或不收錄 |
| 676 | 2010 | Book | [漫步華爾街](https://csiesheep.com/2010/02/23/漫步華爾街/) | 擴寫到 800 字以上，或不收錄 |
| 679 | 2011 | Game | [【桌遊戰報】Once upon a time 小男孩的旅程](https://csiesheep.com/2011/04/04/桌遊戰報-once-upon-a-time-小男孩的旅程/) | 擴寫到 800 字以上，或不收錄 |
| 681 | 2026 | AI, Game | [【遊戲開發日記】那一夜、殭屍王](https://csiesheep.com/2026/09/05/遊戲開發日記-那一夜、殭屍王/) | 擴寫到 800 字以上，或不收錄 |
| 776 | 2011 | Note | [【心得】如何規畫時程?](https://csiesheep.com/2011/04/21/心得-如何規畫時程/) | 擴寫到 800 字以上，或不收錄 |
| 780 | 2017 | Book | [【學習筆記】概率權的概念，如何作出更理性的選擇](https://csiesheep.com/2017/03/31/學習筆記-概率權的概念，如何作出更理性的選擇/) | 擴寫到 800 字以上，或不收錄 |
| 807 | 2011 | Book | [【讀書筆記】真正的問題是什麼? 你想通了嗎?](https://csiesheep.com/2011/03/29/讀書筆記-真正的問題是什麼-你想通了嗎/) | 保留 |
| 810 | 2019 | Book | [【讀書筆記】塑造世界經濟的50項偉大發明](https://csiesheep.com/2019/09/29/讀書筆記-塑造世界經濟的50項偉大發明/) | 保留 |
| 859 | 2010 | Book | [【讀書筆記】孫子兵法](https://csiesheep.com/2010/09/01/讀書筆記-孫子兵法/) | 保留 |
| 879 | 2026 | AI, Game | [【遊戲開發日記】天地會，一起來反清復明](https://csiesheep.com/2026/09/12/遊戲開發日記-天地會，一起來反清復明/) | 保留 |
| 907 | 2019 | Movie | [【推薦】You vs Wild，貝爾對戰荒野，命運由你決定](https://csiesheep.com/2019/04/14/推薦-you-vs-wild，貝爺-bear-grylls-對戰荒野，命運由你決定/) | 保留 |
| 928 | 2026 | AI, Game | [【遊戲開發日記】末班夜車，你能笑到最後嗎?](https://csiesheep.com/2026/09/16/遊戲開發日記-末班夜車，你能笑到最後嗎/) | 保留 |
| 938 | 2011 | Note | [【心得】如何有效率的討論?](https://csiesheep.com/2011/05/08/心得-如何有效率的討論/) | 保留 |
| 950 | 2009 | Life | [顏色管理法](https://csiesheep.com/2009/08/11/顏色管理法/) | 保留 |
| 989 | 2010 | CS | [如何 減少 寫程式 的 風險，作出 較精確的 時程估計](https://csiesheep.com/2010/09/18/如何-減少-寫程式-的-風險，作出-較精確的-時程估計/) | 保留 |
| 999 | 2026 | AI, Game | [【遊戲開發日記】縱橫：秦滅六國，還是六國合縱?](https://csiesheep.com/2026/09/23/遊戲開發日記-縱橫：秦滅六國，還是六國合縱/) | 保留 |
| 1005 | 2011 | Movie | [【好雷】告白](https://csiesheep.com/2011/04/04/好雷-告白-松隆子/) | 保留 |
| 1079 | 2026 | CS, Game | [【AI的奇幻遊程】一個網頁小白，用 AI 幫《山中小屋》桌遊，做了一塊音效](https://csiesheep.com/2026/08/14/ai的奇幻遊程-一個網頁小白，用-ai-幫《山中小屋》桌/) | 保留 |
| 1152 | 2019 | Movie | [【有雷】天鷹座裂縫之外 Beyond the Aquila Rift，延伸](https://csiesheep.com/2019/04/10/有雷-天鷹座裂縫之外-beyond-the-aquila-rift，一些延伸問題和想法/) | 保留 |
| 1441 | 2019 | Movie | [【好雷】天鷹座裂縫之外 Beyond the Aquila Rift 劇情](https://csiesheep.com/2019/04/07/小羊看電影好雷-天鷹座裂縫之外-beyond-the-aquila-rift/) | 保留 |

> 字數是自動數的（WordPress 內文 `entry-content` 裡的中文字，英文單字另計不在表內）；以程式碼為主的技術筆記會被低估，處理前打開確認。

## 2. 四步

### 步驟 1｜處理短篇舊文（owner 在 WordPress 後台做）

- **不到 300 字、而且過時的技術或生活短文**：設成「不讓搜尋引擎收錄」（Yoast／Rank Math 之類的 SEO 外掛，在那篇文章的進階設定裡勾 noindex），或直接刪除。刪除的話設 301 轉址到同分類的長文，不要留 404。
- **300–800 字**：值得留的擴寫（加背景、例子、自己的看法），不值得的同樣 noindex。
- 把 **Uncategorized** 的 10 篇歸到正確分類；標題前的 `>`（blogspot 搬家留下的）拿掉。
- 做完的判準：仍被收錄的文章裡，沒有一篇不到 600 字。

### 步驟 2｜補 8–10 篇原創長文（新 session 起草、owner 發佈）

主題集中在部落格最有料、別人寫不出來的地方：**做遊戲＋它背後的歷史**。每篇 1500–3000 字、有自己的經驗或研究、附出處、配圖用自己遊戲的截圖或插圖。

| # | 暫定題目 | 素材 |
|---|---|---|
| 1 | 生在中國：兩千年裡，一個普通人最可能怎麼死？ | 遊戲的死因、夭折率、各時代壽命（`china_life` 的 `data/periods.csv`、`data/diseases.csv`、眾生簿統計頁） |
| 2 | 生在中國：唐朝的工匠之家能不能讓孩子考科舉？ | 歷史審查 H18、《唐六典》「工商之家不得預於士」 |
| 3 | 生在中國：做一個「歷史上的普通人」模擬器，我學到的五件事 | `china_life/docs/design.md`、審查報告、開發日誌 |
| 4 | 揚州十日、靖康之變：遊戲裡的「城破」怎麼對史料 | `china_life` 事件表的出處欄 |
| 5 | 縱橫：合縱連橫到底是什麼？從張儀、蘇秦講到一張牌 | `obsidian/Projects/zongheng`、`warring states.md` |
| 6 | 天地會：反清復明的祕密結社，史實與傳說 | `obsidian/Projects/tiandihui` |
| 7 | 一個人用 AI 做了 10 款網頁遊戲：分工、驗證與踩過的坑 | `agent-team-delivery` 的失敗目錄、各遊戲的開發日誌 |
| 8 | 桌遊數位化：把實體桌遊做成手機網頁的取捨 | 殭屍、喪屍、山中小屋音效板的開發經過 |
| 9 | 古代病名對照：癆病、痘瘡、霍亂在今天是什麼病 | `china_life/data/diseases.csv`（73 個古病名、今名、出處） |
| 10 | 戶帖、魚鱗圖冊、黃冊：古代政府怎麼記一個人 | 遊戲的戶帖設計、史料 |

- 每篇結尾放到那款遊戲的連結（自然地放，不要整篇像廣告）。
- 起草規則：繁體中文、第一人稱、不灌水、不重複同一段到兩篇文章、事實要有出處；用到遊戲資料時寫明是遊戲的模型還是史實。
- 不用 AI 生成後原封不動貼上：草稿交 owner 讀過、改成自己的口吻再發（AdSense 與 Google 都在意「為人而寫、有第一手經驗」）。

### 步驟 3｜把 2026 的開發日記寫長

| 文章 | 現在字數 |
|---|---|
| [【AI的奇幻遊程】一個網頁小白，用 AI 幫《山中小屋》桌遊，做了一塊音效板，順便把小](https://csiesheep.com/2026/08/14/ai的奇幻遊程-一個網頁小白，用-ai-幫《山中小屋》桌/) | 1079 |
| [【遊戲開發日記】那一夜、殭屍王](https://csiesheep.com/2026/09/05/遊戲開發日記-那一夜、殭屍王/) | 681 |
| [【遊戲開發日記】天地會，一起來反清復明](https://csiesheep.com/2026/09/12/遊戲開發日記-天地會，一起來反清復明/) | 879 |
| [【遊戲開發日記】末班夜車，你能笑到最後嗎?](https://csiesheep.com/2026/09/16/遊戲開發日記-末班夜車，你能笑到最後嗎/) | 928 |
| [【遊戲開發日記】縱橫：秦滅六國，還是六國合縱?](https://csiesheep.com/2026/09/23/遊戲開發日記-縱橫：秦滅六國，還是六國合縱/) | 999 |

- 每篇補到 1500 字以上：做這款遊戲的動機（已有）＋規則怎麼設計、遇到什麼問題、怎麼驗證、玩家回饋、截圖。
- 首頁的摘要可以保留「繼續閱讀」，但內文要完整。

### 步驟 4｜收錄後重新送審

- 新文章發佈後，在 Google Search Console 對 csiesheep.com 送 sitemap、對新文章按「要求建立索引」。
- 判準：新長文大多已被收錄（Search Console「網頁」報告），而且 noindex 的短文已從索引消失——大約 1–3 週。
- 然後在 AdSense「網站」頁按「我已修正問題，申請審查」。
- 通過後：games.csiesheep.com 底下的遊戲就能放廣告（china_life 已有廣告位與頻率規則，加一行 AdSense 程式碼）；再填 H5 Games Ads 申請表。
- 被拒的話：把拒絕原因貼回這份筆記，再補一輪；同時考慮 §3 的替代路。

## 3. 替代路（沒選，先記著）

- **遊戲站換獨立網域**：遊戲站的內容（42 個時代頁、開發日誌、圖鑑）比部落格紮實，但只要掛在 csiesheep.com 底下，就跟著部落格的審核走。換一個獨立的主網域可以讓遊戲站自己送審；代價是買網域、搬網址、舊分享連結要轉址。
- **其他廣告與收入**：遊戲聯播網（AdinPlay 等）、遊戲平台上架（CrazyGames、Poki、GameDistribution）、贊助按鈕（Ko-fi 等）。

## 4. 交給新 session 的範圍

- **可以做**：讀這份筆記與上面列的素材，在 `obsidian/Projects/blog/drafts/` 寫步驟 2、3 的草稿（每篇一個 .md，檔頭寫目標字數、出處清單、配圖建議、要連的遊戲網址）；整理步驟 1 每一篇的建議動作；寫步驟 4 的檢查清單。
- **不要做**：登入 WordPress、發文、改部落格設定、在任何地方公開 owner 的 email——這些都由 owner 自己做。
- **完成的樣子**：10 篇長文草稿＋6 篇開發日記擴寫稿＋步驟 1 的逐篇處理清單，都在 vault 裡，owner 可以逐篇貼上發佈。
