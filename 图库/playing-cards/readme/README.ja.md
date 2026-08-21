[![ライセンス: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

オープンソースのトランプ画像（PNG・SVG形式）。あらゆるプロジェクトで無料で利用可能！

🌐 **ライブデモ：** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 含まれるもの

- **54枚のトランプカード**（52枚の標準カード＋2枚のジョーカー）
- **PNG形式** - 高品質なラスター画像
- **SVG形式** - スケーラブルなベクター画像
- **JSON API** - プロジェクトへの簡単な統合

## 🚀 クイックスタート

### 直接URLアクセス

GitHub Pages から任意のカードに直接アクセスできます：

```
https://webisso.github.io/playing-cards/png/{カード名}.png
https://webisso.github.io/playing-cards/svg/{カード名}.svg
```

### サンプル

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="スペードのエース">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="スペードのエース">
```

### JSON API

カードデータをプログラムで取得：

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 ファイル構成

```
playing-cards/
├── png/                    # PNG画像
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG画像
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # すべてのカードのJSONデータ
├── index.html              # GitHub Pagesのトップページ
├── LICENSE                 # MITライセンス
└── README.md               # このファイル
```

## 🎴 カード命名規則

カードは以下の命名パターンに従います：

- **数字カード：** `{数字}_of_{スート}.{拡張子}`（例：`2_of_hearts.png`）
- **絵札：** `{絵札}_of_{スート}.{拡張子}`（例：`king_of_spades.svg`）
- **エース：** `ace_of_{スート}.{拡張子}`（例：`ace_of_diamonds.png`）
- **ジョーカー：** `{色}_joker.{拡張子}`（例：`black_joker.svg`, `red_joker.png`）

### スート
- `clubs` ♣️（クラブ）
- `diamonds` ♦️（ダイヤ）
- `hearts` ♥️（ハート）
- `spades` ♠️（スペード）

### ランク
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 翻訳

このREADMEは複数の言語で利用できます。他の言語は /readme フォルダを参照してください。

## 📄 ライセンス

このプロジェクトはMITライセンスで提供されています。詳細は [LICENSE](../LICENSE) をご覧ください。

## 🤝 貢献

貢献は大歓迎です！ぜひ以下の手順で：

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m '素晴らしい機能を追加'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## ⭐ サポート

このプロジェクトが役立った場合は、ぜひGitHubでスターをお願いします！

---

[Webisso](https://github.com/webisso) より ❤️ を込めて
[← Back to English](../README.md)
