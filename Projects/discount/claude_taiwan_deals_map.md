# 台灣好康地圖：店家與即時優惠來源調查（Claude 版）

查核日：2026-10-02。每一家都實際打開官網或優惠頁確認過；「今天的優惠」是當天在頁面上看到的檔期，用來證明這個管道真的有在更新。標「未驗證」的是只在搜尋摘要或第三方看到、沒有開到官方頁面的資訊。

**抓取程度**：高＝公開 JSON/XML 或純 HTML 就有標題和日期；中＝HTML 可抓但日期不全、或要換瀏覽器 UA、或活動內頁格式不一；低＝擋爬蟲、只在 App/社群、或 DM 是圖片/PDF 要 OCR。

---

## 1. 便利商店（4 家）

| 店家 | 約門市數 | 優惠來源 | 今天看到的優惠 | 抓取 | 門市位置 |
|---|---|---|---|---|---|
| 7-ELEVEN | 7,200+ | https://www.7-11.com.tw/special/newsList.aspx （頁面向 `/readxml.aspx` 取 XML，含標題與起訖日）；OPENPOINT App | 1010購物節 9/01–10/11；咖啡起司牛奶專案架 9/01–10/27 | **高**（XML 內含過期檔期，要自己用日期過濾） | 政府開放資料（見下）；官方 emap.unipcsc.com.tw |
| 全家 | 4,470 | https://www.family.com.tw/Marketing/zh/Event ；FamilyMart App | 國際咖啡月抽獎 9/16–10/27；PINO JELLY 聯名 9/16–10/27 | **中**（HTML 有日期，但擋非瀏覽器 UA；活動內頁各自不同） | 政府開放資料；官方地圖無公開 API |
| 萊爾富 | 1,800+ | https://hievent.hilife.com.tw/HiShare/Menu/?listid=A05 （主站 hilife.com.tw 對爬蟲回 403） | 貝納頌咖啡 28 件 599 元 10/01–10/31 | **中低**（只能抓子站） | 政府開放資料；ecmap.hilife.com.tw（ASP.NET 表單） |
| OK mart | ~700 | https://www.okmart.com.tw/promotion_reference | 太古任 6 件送 9/17–10/14 | **高**（純 HTML，列表就有活動日期） | 政府開放資料；官網門市查詢 |

**門市位置一次解決**：經濟部商工「全國5大超商資料集」https://data.gcis.nat.gov.tw/od/detail?oid=0202BFA9-8116-4E63-A41A-58A5F4EAF7A2 ，涵蓋 7-11、全家、萊爾富、OK、全聯共約 1.5 萬筆分店地址，每月更新、可下載 CSV。只有地址沒有座標，要另外做地理編碼。

---

## 2. 飲料店（18 家：手搖 14、咖啡 4）

| 店家 | 約門市數 | 優惠來源 | 今天看到的優惠 | 抓取 | 門市位置 |
|---|---|---|---|---|---|
| 清心福全 | 930 | https://www.chingshin.tw/news.php | 今天沒有進行中的（最新一則 8/24–9/06 已過期） | 中（HTML，更新慢） | store.php（JS 載入） |
| 50嵐 | 622 | 官網 50lan.com.tw **連不上** | 無法確認 | 低 | 只有第三方整理 |
| 茶之魔手 | 610 | https://www.teamagichand.com.tw/news/ | 醜白兔聯名加購（7/1 起，未寫結束日） | 中 | /store/（HTML 內含地址） |
| 麻古茶坊 | 390 | https://www.macutea.com.tw/news.php | 巨峰葡萄系列 10/15 回歸（新品，不是折扣） | 高 | shop.php（HTML 內含地址） |
| 迷客夏 | 330 | https://www.milksha.com/ 首頁活動區 | LINE PAY × 陽光基金會 8/01–10/31 | 中 | store.php（結構未驗證） |
| CoCo都可 | 300 | 官網是全球站，**台灣優惠只發在 FB/Threads** | 官方來源無法確認 | 低 | 官網沒有台灣門市清單 |
| 可不可熟成紅茶 | 270 | https://kebuke.com/news/ ；LINE | 會員 3 週年線上寄杯 8 折（10/1 公告） | 高 | /store/（JS 載入） |
| 鮮茶道 | 255 | https://presotea.com/news | 芥末熊可可飲任選 2 杯 109 元 10/01–12/31（日期未驗證） | 高 | /storemap（HTML 內含經緯度） |
| 得正 | 205 | 官網只載出 JS 空殼，**優惠只在 FB/Threads** | 無法確認 | 低 | 拿不到 |
| COMEBUY | 180 | https://www.comebuy2002.com.tw/news/enent/ | Neogence 聯名送面膜（7/31 起，未寫結束日） | 中 | /store/Taiwan/ |
| 大苑子 | 未驗證 | https://www.dayungs.com/ 首頁消息；App；LINE | 10 月跟喝券（整個 10 月） | 中 | /retail-html/（JS 載入） |
| 一沐日 | ~56（未驗證） | https://www.aniceholiday.com.tw/news | 台灣虎航聯名抽機票（10/1 公告） | 高 | /store |
| 龜記 | ~120（未驗證） | https://guiji-group.com/news | 梅子系列遊戲送買一送一券（8/17 公告） | 中 | /location（HTML 內含地址） |
| 茶湯會 | 未驗證 | https://tw.tp-tea.com/news/ | 10 月週三會員日指定飲品 9 折 | 高（每月固定一篇） | /store/（HTML 內含座標） |
| 星巴克 | ~598（粗估） | https://www.starbucks.com.tw/stores/allevent.jspx | 星沁爽特大杯 99 元 9/09–11/03 | **高**（效期寫得清楚） | storesearch.jspx（JS） |
| 路易莎 | ~560（粗估） | https://www.louisacoffee.co/news | LINE PAY 早餐咖啡現折 10 元 10/01–12/31 | 高 | /visit（要查詢） |
| 85度C | ~330（粗估） | https://www.85cafe.com/newsactivity.php | 指定果咖第二杯半價 10/01–10/11 | 高 | stores.php |
| cama café | ~175（粗估） | https://www.camacafe.com/New/ | LINE Pay 早餐咖啡 10 元券 10/01–12/31 | 高 | /Store |

手搖飲前十名門市數來自風傳媒 2026/9；咖啡店門市數只有一則 Threads 貼文，當粗估。

**規律**：多數品牌其實有自己的「最新消息」HTML 頁，不是只靠 FB。真正的困難在解析：效期常常沒寫、新品和折扣混在一起、不少優惠其實是 LINE Pay 或外送平台的活動。

---

## 3. 速食店（11 家）

| 店家 | 約門市數 | 優惠來源 | 今天看到的優惠 | 抓取 | 門市位置 |
|---|---|---|---|---|---|
| 麥當勞 | 430 | https://www.mcdonalds.com/tw/zh-tw/whats-hot.html （對爬蟲回 403）；App 優惠券 | 超值全餐送 4 塊鷄塊至 10/10（來源 TVBS） | 低 | 官方頁 403；用 Google Places |
| 肯德基 | 200 | https://www.kfcclub.com.tw/coupon （輸入代碼）；App | 代碼 26851 $100 套餐至 10/31（來源 TVBS） | 中（前端有 `/menu/v1/QueryCoupons`，未實測） | kfcclub.com.tw/searchShop（JS） |
| 摩斯漢堡 | 297 | 官網 mos.com.tw 從這裡連不上；MOS Order App | 摩斯咖啡(L) 買一送一 $60 10/01–10/04（第三方） | 低 | 未驗證 |
| 漢堡王 | 107 | https://www.burgerking.com.tw/category/6 | 中杯飲料買一送一 $38（未寫日期） | 中高 | /map（JS） |
| 頂呱呱 | 55 | https://www.tkkinc.com.tw/ 活動頁 | 一斤雞 $299 10/01–10/11 | 高 | access.html |
| 必勝客 | ~300（未驗證） | **公開 JSON** https://data.pizzahut.com.tw/json/menu_data.json ；優惠券頁 | 兩個大比薩 555 送可樂 9/29–12/14 | **高**（JSON 有起訖日） | 首頁內嵌選店 |
| 達美樂 | 158（未驗證） | https://www.dominos.com.tw/promotions/ （JS 載入） | 代碼 994349 三個大比薩外帶 $799 起（第三方，未寫效期） | 低 | locate-us（JS） |
| 拿坡里 | ~138（未驗證） | 官網從這裡連不上；三商i美食 App | 小披薩＋12 隻烤雞翅 $199 9/21–10/15（聯合新聞網） | 低 | 未驗證 |
| 21世紀風味館 | 70+ | https://www.pec21c.com.tw/ 最新活動 | 香草烤半雞 $189 9/30–11/24 | 高 | 官網門市資訊頁 |
| Subway | 125 | 官網沒有優惠頁 | 官方來源無 | 低 | /stores（HTML 表格） |
| 吉野家 | 29 | https://yoshinoya.com.tw/news/ | 吉野家×原萃贈品至 10/31 | 中 | /stores/ |

不收：丹丹漢堡（只在南部、沒有全品牌官網）、胖老爹（官網沒有優惠）。摩斯和拿坡里官網連不上，可能只擋海外 IP，在台灣網路上要再試。

---

## 4. 賣場（12 家，含改名後的新名稱）

**改名要注意**：家樂福 2026-07-01 起量販改「萬家福」、超市改「樂家康」（carrefour.com.tw 轉到 uni-prosperity.com.tw）；大潤發 2025-08 改名「大全聯」；頂好早已併入家樂福超市，不再單獨列。

| 店家 | 約門市數 | 優惠來源 | 今天看到的優惠 | 抓取 | 門市位置 |
|---|---|---|---|---|---|
| 全聯 | 1,250+ | https://www.pxmart.com.tw/campaign/life-will/edm （PDF）；/campaign/latest | 生活誌 10/02–10/15；2026.10 福利任務 10/01–10/31 | 中（活動列表 HTML 有日期，價格在 PDF） | 官網門市頁（地圖連結含經緯度）；政府開放資料 |
| 大全聯 | ~22 | 同全聯 eDM | 生活誌 Vol 029 9/30–10/15 | 中 | 同全聯 |
| 萬家福／樂家康 | 283 | https://www.uni-prosperity.com.tw/catalogues/ | 買一送一 DM 9/29–10/13 | 低～中（JS，DM 是圖片） | /stores/（JS，未驗證） |
| 好市多 | 14 | https://www.costco.com.tw/ 特價頁；第三方今購百科 | 床墊買一件折 $800 9/28–10/04 | **高**（商品頁 HTML 有價格） | 14 家可手動整理 |
| 愛買 | 15 | https://www.fe-amart.com.tw/index.php/edm/download-dm （PDF） | 週年慶 9/30–10/13 | 低 | 未驗證 |
| 美廉社 | 813 | 官網 DM 頁 404；用 myEDM | 20 週年慶 9/29–10/27 | 中 | map.asp（下拉選單） |
| 楓康超市 | 52 | https://www.supermarket.com.tw/promotions | 10/02–10/15 特攻 | 中 | store-locator（HTML） |
| 寶雅 | ~483（未驗證） | 官網沒有 DM；App、LINE | 週年慶，日期未看到 | 低 | /store（HTML 分頁） |
| 小北百貨 | 172 | https://www.showba.com.tw/dm_page?id=169 | 中秋就醬烤 9/11–10/08 | 低～中（圖片） | 未驗證 |
| 屈臣氏 | 595 | 官網擋爬蟲；用 myEDM | 千件商品第二件 4 折 9/10–10/07 | 低 | 未驗證 |
| 康是美 | 600 | 線上翻頁 DM | 沒看到有期間的檔期 | 低 | shop.aspx（JS） |
| IKEA | 9 | 官網低價專區 | 沒有固定檔期 | 中 | 9 店手動整理 |

**統一入口**：myEDM（https://www.myedm.tw/shop/<店名>）幾乎每家都有當期 DM，頁面寫著期間、頁數、品項數，適合當「本期 DM」的共同來源；轉載前要確認對方的使用條款。屈臣氏、康是美、寶雅、小北、IKEA 比較像藥妝或生活百貨，可另開分類。

---

## 建議

**第一版地圖先做這些（抓取程度高、檔期有日期）：** 7-ELEVEN、OK mart、全家、必勝客、頂呱呱、21世紀、星巴克、85度C、路易莎、cama、茶湯會、鮮茶道、好市多、全聯（只顯示「本期 DM 期間＋連結」）。

**做法：**
1. 門市位置：便利商店與全聯用政府開放資料 CSV＋地理編碼；飲料店多數官網 HTML 就有地址或座標；剩下的用 Google Places 補。
2. 優惠：每家寫一個小抓取器，統一輸出「店家、標題、起日、迄日、來源網址」，每天抓一次，過期自動下架。
3. 第一版不要做到商品價格；賣場只放 DM 期間和連結，等需要再做 OCR。

**主要風險：** 麥當勞、達美樂、屈臣氏、萊爾富主站擋爬蟲；50嵐、CoCo、得正官方只靠社群；App 內會員券無法抓；效期常缺漏，需要人工補；轉載第三方整理站的內容要先看授權。
