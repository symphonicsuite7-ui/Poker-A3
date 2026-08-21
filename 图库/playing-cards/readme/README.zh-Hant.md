# 🃏 撲克牌

[![授權：MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

開源撲克牌圖片，提供 PNG 與 SVG 格式。免費用於任何專案！

🌐 **線上展示：** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 內容包含

- **54 張撲克牌**（52 張標準牌 + 2 張鬼牌）
- **PNG 格式** – 高品質點陣圖
- **SVG 格式** – 可縮放向量圖形
- **JSON API** – 輕鬆整合到您的專案

## 🚀 快速開始

### 直接 URL 存取

可直接透過 GitHub Pages 存取每張牌：

```
https://webisso.github.io/playing-cards/png/{牌名}.png
https://webisso.github.io/playing-cards/svg/{牌名}.svg
```

### 範例

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="黑桃 A">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="黑桃 A">
```

### JSON API

以程式方式取得牌組資料：

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 檔案結構

```
playing-cards/
├── png/                    # PNG 圖片
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG 圖片
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # 所有牌的 JSON 資料
├── index.html              # GitHub Pages 首頁
├── LICENSE                 # MIT 授權
└── README.md               # 本檔案
```

## 🎴 牌名命名規則

牌名遵循以下命名規則：

- **數字牌：** `{數字}_of_{花色}.{ext}`（如 `2_of_hearts.png`）
- **人頭牌：** `{人頭}_of_{花色}.{ext}`（如 `king_of_spades.svg`）
- **A：** `ace_of_{花色}.{ext}`（如 `ace_of_diamonds.png`）
- **鬼牌：** `{顏色}_joker.{ext}`（如 `black_joker.svg`, `red_joker.png`）

### 花色
- `clubs` ♣️（梅花）
- `diamonds` ♦️（方塊）
- `hearts` ♥️（紅心）
- `spades` ♠️（黑桃）

### 點數
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 翻譯

本 README 提供多種語言版本。更多語言請見 /readme 資料夾。

## 📄 授權

本專案採用 MIT 授權 – 詳見 [LICENSE](../LICENSE) 檔案。

## 🤝 貢獻

歡迎貢獻！方式如下：

1. Fork 本儲存庫
2. 建立您的分支（`git checkout -b feature/amazing-feature`）
3. Commit 變更（`git commit -m '新增超棒功能'`）
4. Push 分支（`git push origin feature/amazing-feature`）
5. 開 Pull Request

## ⭐ 支持

如果您覺得本專案有用，請在 GitHub 上給顆星！

---

由 [Webisso](https://github.com/webisso) ❤️ 製作
