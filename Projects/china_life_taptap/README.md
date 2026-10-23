---
title: 生在中國｜TapTap 上架
tags: [project, china_life, promotion, taptap]
created: 2026-10-23
---

# 生在中國｜TapTap 上架

- 後台：https://developer.taptap.io/33866217/app/34222178 （帳號 csiesheep.games，遊戲 ID 34222178）
- 2026-10-23：版本 V-20261024 送審，狀態「审核中」。

## 送審內容

| 項目 | 值 |
|---|---|
| 遊戲名 | 生在中國（owner 改短，與 APK 一致；原本「生在中國: 生在中國古代，你會過什麼樣的人生?」會被警告名稱不符） |
| APK | `china_life-1.0.0.apk`（本資料夾），com.csiesheep.chinalife，1.0.0／versionCode 1，37.7 KB，憑證 SHA-256 127adfb296279e5f…；china_life repo `android/`（§97、issue #148，main 4e444f0） |
| APK 配置 | 支援語言 繁體中文；網路遊戲 是；內購 否 |
| 地區 | 正式上線：中國香港、中國澳門、中國台灣、美國；其他 165 個「敬請期待」 |
| 上線方式 | 立即上線（審核通過就公開） |
| 商店語言 | 英文（預設）；簡介寫明遊戲文字是繁體中文 |
| 圖 | 截圖 5 張（s1 首頁、s3 纏足抉擇、s2 一生中段、s5 眾生簿、s6 圖鑑；結局頁有 QR 沒放）；詳情頁頂部圖 `top_1920x1080.png` |
| 官網 | https://games.csiesheep.com/china_life/ |

## 簽章金鑰

`C:/Users/sheep/keys/china_life_release.jks`（密碼在同目錄 `china_life_release.txt`）。**不在 repo、不在這裡。遺失就無法更新同一個 App——要備份。**

## 沒驗到

沒有 Android 實機或模擬器：安裝、啟動、返回鍵、站外連結、離線頁、儲存分享卡、localStorage 保留都只做了靜態檢查（`node tests/apk_check.mjs`）。TapTap 審核或第一個使用者回報時要留意。

## 之後

- 審核結果：看「版本审核记录」。被退件就把原因記在這裡。
- 更新遊戲內容不用重送（App 開的是線上網址）；只有改 App 殼才要 versionCode +1 重建（`bash android/build.sh`）。
