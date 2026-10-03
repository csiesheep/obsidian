## 說明與假設

- 「門市數」皆為**約數／不確定**，會隨開關店、加盟、區域調整而變動；若未查到穩定公開數字，標註「不確定」。
- 「即時性」定義：  
  - **高**：每日或當日可更新，例如限時券、當日活動。  
  - **中**：週期性／檔期性更新，例如每週特價、會員日、固定活動頁。  
  - **低**：不定期、只在門市貼紙、社群碎片化資訊。
- 「可自動抓取程度」定義：  
  - **高**：有公開 API、結構化 HTML/JSON、無登入即可抓。  
  - **中**：網頁可抓，但需處理 JS、Cookie、部分內容在 App/LINE。  
  - **低**：主要只在 App/LINE、需會員登入、加盟碎片化、反爬或無穩定結構。
- 以下為「常見連鎖／具規模加盟品牌」；地方性小品牌未一一列入。

---

## 一、便利商店

| 店家 | 約門市數 | 優惠管道（含網址） | 即時性 | 可自動抓取程度（高/中/低＋原因） | 門市位置資料來源 |
|---|---:|---|---|---|---|
| 7-Eleven | 約4,800+（不確定） | 官網活動頁：https://www.7eleven.tw/；7app電子券／點數；LINE官方帳號（@7eleven，不確定）；信用卡聯名優惠（銀行官網或第三方比價，URL因卡別而異） | 中：多為檔期券、會員券、支付聯名，非逐店即時庫存 | 低：核心優惠在 App/LINE 且需登入；官網活動頁可部分爬取，無公開 API（不確定） | 官網門市查詢（URL不確定）、Google Maps/Places、OpenStreetMap；官方定位 API 不確定 |
| 全家 FamilyMart | 約4,500+（不確定） | 官網：https://www.familymart.com.tw/；FamiPay：https://famipay.com.tw/；全家 App/LINE（不確定）；會員日／信用卡優惠 | 中：週期性券與活動為主 | 低～中：官網／FamiPay 有網頁，但電子券多需登入或 App；無公開 API（不確定） | 官網門市查詢（URL不確定）、Google Maps/Places、OpenStreetMap |
| 萊爾富 Lawson | 約4,000+（不確定） | 官網：https://www.lawson.com.tw/；LaPoint／萊爾富 App（不確定）；LINE官方帳號（不確定）；信用卡優惠 | 中：活動券、會員日為主 | 低～中：部分活動頁可抓，但券多在 App/LINE 且需登入 | 官網門市查詢、Google Maps/Places、OpenStreetMap |
| OK超商 | 約1,300–1,600（不確定） | 官網：http://www.okcvs.com.tw/（不確定）；OK Pay／APP（不確定）；LINE（不確定） | 中～低：活動較少，且可能偏區域或單店 | 低：資訊分散、加盟／區域化，無明確 API | 官網門市查詢、Google Maps/Places、OpenStreetMap |

> 全聯福利中心通常歸為超市／賣場，故列在下方「賣場」表。

---

## 二、飲料店

| 店家 | 約門市數 | 優惠管道（含網址） | 即時性 | 可自動抓取程度（高/中/低＋原因） | 門市位置資料來源 |
|---|---:|---|---|---|---|
| 85°C | 約300–500（不確定） | 官網：https://www.85c.com.tw/（不確定）；官方 App／LINE（不確定）；門市查詢（URL不確定） | 中：活動券、會員券為主，更新週期不明 | 中：官網活動頁與門市頁若為靜態可抓；但券多在 App/LINE 需登入 | 官網、Google Maps/Places、OpenStreetMap |
| CoCo都可 | 約200–400（不確定） | 官網：https://www.coco.com.tw/（不確定）；會員 App／LINE（不確定） | 中：品牌券為主，加盟門市可能有單店差異 | 低～中：部分網頁可抓，但加盟優惠碎片化、需登入 | 官網、Google Maps/Places |
| 春水堂 | 約100+（不確定） | 官網：https://www.springwatercafe.com.tw/（不確定）；LINE／App（不確定） | 中：活動資訊可能只在 App/LINE 或門市 | 低～中：公開結構化資料不明，需逐店確認 | 官網、Google Maps/Places |
| 一茶 | 約100+（不確定） | 官網：https://www.itea.com.tw/（不確定）；LINE／App（不確定） | 中：活動券或門市公告為主 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 喜樂蜂 Le Fun | 約50–150（不確定） | 官網：https://www.lefun.com.tw/（不確定）；LINE／App（不確定） | 中：活動資訊可能碎片化 | 低：加盟為主，門市與優惠差異大 | 官網、Google Maps/Places |
| 50嵐 | 約50–150（不確定） | 官網：https://www.50lan.com.tw/（不確定）；LINE／App（不確定） | 中：活動資訊可能碎片化 | 低：加盟為主，門市與優惠差異大 | 官網、Google Maps/Places |
| 大卡司 | 約200+（不確定） | 官網：https://www.dakasi.com.tw/（不確定）；App／LINE（不確定）；門市查詢 | 中：活動頁較常見，但加盟差異需注意 | 中：有活動／門市網頁可抓，需處理加盟差異 | 官網、Google Maps/Places |
| Starbucks 星巴克 | 約200+（不確定） | 官網：https://www.starbucks.com.tw/；Starbucks App；LINE（不確定）；門市查詢（URL不確定） | 中：星享點數、限時券、門市活動 | 中～高：門市查詢與活動頁較結構化；App 券需登入 | 官網、Google Places、OpenStreetMap |
| 太平洋咖啡 Pacific Coffee | 約100+（不確定） | 官網：https://www.pacificcoffee.com.tw/（不確定）；會員 App／LINE（不確定） | 中：會員活動為主 | 低～中：公開結構化資料不明，可能需登入 | 官網、Google Maps/Places |
| 丹堤 The Danz | 約50–100（不確定） | 官網：https://thedanz.com.tw/（不確定）；會員制／App（不確定） | 中：會員活動為主 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| Costa Coffee | 約30–60（不確定） | 官網：https://www.costacoffee.com.tw/（不確定）；App／LINE（不確定） | 中：活動券或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| Tim Hortons | 約20–50（不確定） | 官網：https://www.timhortons.com.tw/（不確定）；App（不確定） | 中：活動券或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 蜜雪冰城 Mixue | 數十家（不確定） | 官方 IG／LINE／App（URL不確定）；門市公告 | 低～中：多靠門市或社群，更新頻繁但非結構化 | 低：新進加盟、門市變動快，無統一 API | Google Maps、OpenStreetMap |
| 甜心屋 Sweetheart House | 約30–80（不確定） | 官網：https://www.sweetheart-house.com/（不確定）；LINE／App（不確定） | 中：活動資訊可能碎片化 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 珍奶／珍珠奶茶（加盟為主） | 數百～數千（不確定） | 多為單店 IG、門市貼紙，無統一官網/API | 低：單店優惠為主 | 低：加盟碎片化、資料非集中 | Google Maps、OpenStreetMap、單店社群 |
| 鹿角巷 The Alley | 數十家（不確定） | 官方 App／IG／LINE（URL不確定）；門市查詢（不確定） | 中：活動資訊多在社群或 App | 低～中：門市少但資訊非完全結構化 | 官網、Google Maps/Places |
| 茶裡王 | 數十家（不確定） | 官網／LINE／IG（URL不確定） | 中～低：資訊碎片化 | 低：加盟為主，公開結構化資料不明 | Google Maps、OpenStreetMap |

---

## 三、速食店

| 店家 | 約門市數 | 優惠管道（含網址） | 即時性 | 可自動抓取程度（高/中/低＋原因） | 門市位置資料來源 |
|---|---:|---|---|---|---|
| McDonald's 麥當勞 | 約300+（不確定） | 官網：https://www.mcdonalds.com.tw/；McDonald's App；LINE（不確定）；門市查詢（URL不確定） | 中～高：限時券、套餐更新較頻繁 | 中～高：官網與門市頁結構化程度較高，可抓活動與門市；App 券需登入 | 官網、Google Places、OpenStreetMap |
| Burger King 漢堡王 | 約50–70（不確定） | 官網：https://www.burgerking.com.tw/；App／LINE（不確定） | 中：檔期券、套餐活動 | 中：活動頁可抓，但券可能需登入 | 官網、Google Maps/Places |
| KFC 肯德基 | 約100+（不確定） | 官網：https://www.kfc.com.tw/（不確定）；App／LINE（不確定） | 中：活動券、套餐 | 低～中：公開結構化資料不明，可能需登入 | 官網、Google Maps/Places |
| A&W | 約100+（不確定） | 官網：https://www.aw.com.tw/（不確定）；App／LINE（不確定） | 中：活動券、套餐 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| Jollibee 快樂蜂 | 約30–50（不確定） | 官網：https://www.jollibee.com.tw/（不確定）；App／LINE（不確定） | 中：活動券、套餐 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| Pizza Hut 必勝客 | 約100+（不確定） | 官網：https://www.pizzahut.com.tw/；外送網站／App（不確定）；門市或據點查詢 | 中：套餐、外送券 | 中～高：外送選址頁結構化，可抓門市／據點；券需登入或活動分散 | 官網、Google Maps/Places |
| Domino's Pizza 多樂披薩 | 門市／外送據點數不確定 | 官網：https://www.dominos.com.tw/；外送網站／App（不確定） | 中：外送優惠較即時 | 中～高：外送頁面常含地址、門市資料，可嘗試抓 JSON/API（不確定） | 官網、Google Maps/Places |
| Papa John's | 不確定（可能已縮減或區域性存在） | 官網／門市資訊（URL不確定） | 低～中：活動資訊不明 | 低：門市數與公開資料不穩定 | Google Maps、OpenStreetMap |
| Popeyes | 少量（不確定） | 官網／IG／LINE（URL不確定） | 低～中：新進品牌，資訊未完整 | 低：門市少、公開結構化資料不明 | Google Maps、OpenStreetMap |
| Five Guys | 少量（不確定） | 官網／IG（URL不確定） | 低～中：活動資訊有限 | 低：門市少、公開結構化資料不明 | Google Maps、OpenStreetMap |
| Shake Shack | 少量（不確定） | 官網／IG／App（URL不確定） | 低～中：活動資訊有限 | 低：門市少、公開結構化資料不明 | Google Maps、OpenStreetMap |
| Dunkin' Donuts | 少量（不確定） | 官網／IG／App（URL不確定） | 低～中：活動資訊有限 | 低：門市少、公開結構化資料不明 | Google Maps、OpenStreetMap |
| Baskin-Robbins 冰雪皇后 | 約30–60（不確定） | 官網／門市資訊（URL不確定）；App／LINE（不確定） | 中：甜點活動或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 正新雞排 | 數千家（不確定，加盟為主） | 總公司網頁／IG（URL不確定）、單店社群；無統一 API | 低：多為單店或地區優惠 | 低：加盟碎片化、門市變動快 | Google Maps、OpenStreetMap、官方資料（不確定） |
| 一蘭拉面 | 約20–40（不確定） | 官網：https://www.iran.co.jp/tw/（不確定）；線上點餐／預約（不確定） | 中：限時套餐、門市公告 | 中：官網可能有結構化門市資料，但需處理 JS | 官網、Google Maps/Places |
| 一風堂 | 約10–30（不確定） | 官網：https://www.ikkyudo.com.tw/（不確定）；預約／社群 | 中：套餐或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 吉野家 | 約50–100（不確定） | 官網：https://www.yoshinoya.com.tw/（不確定）；App／LINE（不確定） | 中：套餐或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 食其家 Sukiya | 約30–60（不確定） | 官網：https://www.sukiya.com.tw/（不確定）；App（不確定） | 中：套餐或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 松屋 Matsuya | 約20–40（不確定） | 官網：https://www.matsuya.com.tw/（不確定）；App／LINE（不確定） | 中：套餐或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 丸龜制面 | 約50+（不確定） | 官網：https://www.marugame.co.jp/tw/（不確定）；門市查詢 | 中：套餐或門市公告 | 中：門市頁可能結構化，需處理 JS | 官網、Google Maps/Places |
| Coco壱番屋 | 約30–60（不確定） | 官網：https://www.cocoyokan.com.tw/（不確定）；App／LINE（不確定） | 中：套餐或門市公告 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 三商巧福 | 約數十–百（不確定） | 官網／門市資訊（URL不確定）、活動頁（不確定） | 中：門市公告或活動頁 | 低～中：公開結構化資料不明 | Google Maps、OpenStreetMap |

---

## 四、賣場

> 這裡的「賣場」包含超市、量販店、家居賣場，以及百貨公司內的大型賣場／超市。若你的定義只限超市或量販店，可忽略百貨行。

| 店家 | 約門市數 | 優惠管道（含網址） | 即時性 | 可自動抓取程度（高/中/低＋原因） | 門市位置資料來源 |
|---|---:|---|---|---|---|
| 全聯 PX Mart | 約700+（不確定） | 官網：https://www.pxmart.com.tw/；PX Mart App；LINE官方帳號（URL不確定）；信用卡／會員日優惠（銀行或第三方比價，URL因卡別而異） | 中～高：週期特價、限時券、會員日 | 中～高：官網活動頁與門市查詢較可抓；電子券多在 App/LINE 需登入 | 官網門市查詢、Google Places、OpenStreetMap |
| 大潤發 Carrefour | 約50–70（不確定） | 官網：https://www.carrefour.com.tw/；Carrefour App／LINE（不確定）；會員日／信用卡優惠 | 中：週期特價、會員日為主 | 中：活動頁可抓，但券需登入或 App；門市資料可能可抓 | 官網門市查詢、Google Maps/Places |
| 家樂福超市 Carrefour Supermarket | 約100+（不確定） | 官網：https://www.carrefour.com.tw/；App／LINE（不確定）；會員日／信用卡優惠 | 中：週期特價、會員日為主 | 中：活動頁可抓，但券需登入或 App | 官網門市查詢、Google Maps/Places |
| 愛買 Hi-Life | 約30–60（不確定） | 官網：https://www.hilife.com.tw/（不確定）；會員券／App（不確定） | 中：特價與會員活動 | 低～中：公開結構化資料不明，可能需處理 JS | 官網、Google Maps/Places |
| 頂好 Top | 約100+（不確定） | 官網：https://www.topmart.com.tw/（不確定）；APP／LINE（不確定） | 中：特價與會員活動 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| 美廉價 Meilia | 約100+（不確定） | 官網：https://www.meilia.com.tw/（不確定）；會員券（不確定） | 中：特價與會員活動 | 低～中：公開結構化資料不明 | 官網、Google Maps/Places |
| Costco 好市多 | 約8–10（不確定） | 官網：https://twn.costco.com/（不確定）；App／會員週刊、會員限定優惠 | 中：會員制，部分限時或會員價 | 低～中：需會員登入；門市少可人工維護，商品頁可能結構化 | 官網、Google Maps/Places |
| Sam's Club 山姆會員商店 | 約15–20（不確定） | 官網：https://tw.samsclub.com/（不確定）；App／會員優惠 | 中：會員制，部分限時或會員價 | 低～中：需會員登入；門市少可人工維護 | 官網、Google Maps/Places |
| HOLA 和樂家居 | 約10–15（不確定） | 官網／電商：https://www.hola.com.tw/；LINE／App（不確定） | 中：電商折扣與商品活動可抓 | 高：電商商品頁、活動頁較結構化，門市少 | 官網、Google Maps/Places |
| HomePro 特力屋 | 約10（不確定） | 官網／電商：https://www.homepro.com.tw/；App／LINE（不確定） | 中：電商折扣與商品活動可抓 | 高：電商結構化程度較高，門市少 | 官網、Google Maps/Places |
| IKEA 宜家 | 約1–2（不確定） | 官網／電商：https://www.ikea.com/tw-zh/；App | 中～低：優惠較少，以商品價與定期活動為主 | 高：電商 API 或頁面結構好，門市少 | 官網、Google Maps/Places |
| 遠東SOGO百貨 | 約10+（不確定） | 官網：https://www.sogo.com.tw/；APP／LINE、檔期活動 | 中：檔期活動、品牌聯名 | 中：CMS/JS 需處理，券多在 App/LINE | 官網、Google Maps/Places |
| 新光三越 SPC | 約10+（不確定） | 官網：https://www.spco.com.tw/；APP／LINE、檔期活動 | 中：檔期活動、品牌聯名 | 中：CMS/JS 需處理，券多在 App/LINE | 官網、Google Maps/Places |
| 遠百 Far Eastern | 約10+（不確定） | 官網：https://www.far-eastern-taiwan.com/（不確定）；APP／LINE（不確定） | 中：檔期活動、品牌聯名 | 中：CMS/JS 需處理，券多在 App/LINE | 官網、Google Maps/Places |
| 大樹 Daiso | 約50–100（不確定） | 官網：https://www.daiso.com.tw/（不確定）、門市活動 | 低～中：門市活動為主 | 低～中：公開結構化資料不明，加盟或門市差異需注意 | Google Maps、OpenStreetMap |

---

## 總結：第一版地圖建議

### 1. 最適合第一版的店家

第一版建議優先做「門市數多、品牌統一、官網有基本活動頁或門市查詢」的店家，而不是追求所有加盟店。較適合優先納入的是：

- **便利商店**：7-Eleven、全家、萊爾富。  
  理由：門市最多，使用者需求高；雖然券多在 App/LINE，但官網仍有活動與門市資訊，可先做品牌層級優惠展示。
- **飲料店**：Starbucks、85°C、CoCo都可、大卡司。  
  理由：星巴克的門市與活動資料相對結構化；85°C、CoCo、大卡司有基本官網或活動頁，但需接受部分優惠在 App/LINE。
- **速食店**：McDonald's、Burger King、Pizza Hut、Domino's、KFC、A&W。  
  理由：麥當勞、披薩外送品牌的網頁結構相對好；漢堡類可先做品牌活動頁與門市查詢。
- **賣場**：全聯、大潤發／家樂福、HOLA、HomePro、IKEA。  
  理由：全聯與大潤發／家樂福門市多，特價與會員日明確；HOLA、HomePro、IKEA 屬電商型零售，商品折扣較容易抓，但門市少。

相對不建議第一版優先做的類型：

- **高度加盟碎片化**：正新雞排、珍奶、地方手搖飲。  
  原因：各店優惠不同、公開資料分散、門市變動快。
- **會員制且需登入**：Costco、Sam's Club。  
  原因：優惠多限會員，自動抓取較難；若第一版要做，建議先人工維護門市與主要活動。
- **新進或門市數不明品牌**：Popeyes、Five Guys、Shake Shack、Dunkin'、Mixue 等。  
  原因：公開資料不穩定，適合第二版補齊。

---

### 2. 建議的技術做法

第一版不要一開始就做「每家門市即時庫存」，而應分成兩層：

#### A. 門市位置層：先做穩定 POI

優先順序建議：

1. **官方 Store Locator**  
   最權威，但很多品牌沒有公開 API。可用爬蟲抓門市清單、地址、座標、電話。
2. **Google Places / Mapbox POI**  
   快速取得大量門市與座標，適合 MVP；需注意授權、費用、資料更新延遲。
3. **OpenStreetMap / Overpass**  
   開放資料，適合補充；但品質不穩定，需人工校正。
4. **品牌 App 內定位資料**  
   若官方網頁不足，可嘗試逆向 App API，但成本高且可能變動。

建議資料庫欄位：

```text
brand_id
store_id
name
category
address
city
district
lat
lng
phone
source
confidence
updated_at
```

#### B. 優惠活動層：先做品牌／區域級，再升級到門市級

第一版可接受「某品牌目前有這些優惠」，不一定要精確到「某家門市今天有」。  
若要做到門市級，需要額外判斷券的適用範圍，例如：

- 全門市
- 特定區域
- 特定門市
- 會員限定
- App/LINE 限定
- 信用卡限定

建議優惠欄位：

```text
offer_id
brand_id
store_id 或 region_id
title
description
url
channel: web/app/line/member/card
start_date
end_date
condition
applicable_stores
source
confidence
updated_at
```

#### C. 抓取策略

- **官網活動頁**：定時爬取，例如每 1–6 小時一次。  
- **門市查詢頁**：每週或每月更新即可。  
- **App/LINE 券**：第一版可先人工維護、截圖解析或半自動輸入；後期再逆向 API。  
- **電商型賣場**：HOLA、HomePro、IKEA 可用商品頁或活動頁抓取折扣。  
- **外送型速食**：Domino's、Pizza Hut 的外送選址頁可能有結構化門市資料，可優先嘗試。

建議技術棧：

```text
爬蟲：Python + Requests / Playwright / Scrapy
資料庫：PostgreSQL + PostGIS
API：Node.js / FastAPI / Express
前端地圖：Mapbox GL JS 或 Leaflet
資料格式：GeoJSON
排程：cron / Airflow / GitHub Actions
```

---

### 3. 主要風險

1. **門市資料不準**  
   加盟品牌開關店快，Google Maps 可能滯後。需要多源交叉驗證，並標註「資料更新時間」。

2. **優惠不是真正即時**  
   很多店家是檔期券、會員日、週期特價，不是逐店即時庫存。第一版應避免讓使用者誤以為是「該門市此刻一定有貨或可用」。

3. **App/LINE 封閉性高**  
   便利商店與飲料店的核心券常在 App/LINE，且需登入。若只抓官網，可能漏掉主要優惠。

4. **加盟制導致同一品牌不同門市優惠不同**  
   例如手搖飲、雞排、地方小吃。若地圖只展示品牌優惠，可能誤導使用者。

5. **反爬與 JS 渲染**  
   很多官網活動頁使用 React/Vue、Cookie、動態載入，需 Playwright 或逆向 XHR/API。

6. **授權與成本**  
   Google Places API 有費用；OpenStreetMap 需注意 attribution；商標、圖片、LOGO 使用也可能有版權問題。

7. **網址與門市數變動快**  
   本表中多處標註「不確定」，正式開發前建議逐家重新驗證官方域名、Store Locator URL、App/LINE 帳號與門市數。
