# 🃏 Playing Cards (UK English)

[![Licence: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Open source playing card images in PNG and SVG formats. Free to use for any project!

🌐 **Live demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 What's Included

- **54 playing cards** (52 standard cards + 2 jokers)
- **PNG format** – High quality raster images
- **SVG format** – Scalable vector graphics
- **JSON API** – Easy integration into your projects

## 🚀 Quick Start

### Direct URL Access

Access any card directly via GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{card_name}.png
https://webisso.github.io/playing-cards/svg/{card_name}.svg
```

### Examples

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Ace of Spades">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Ace of Spades">
```

### JSON API

Fetch card data programmatically:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 File Structure

```
playing-cards/
├── png/                    # PNG images
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG images
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON data for all cards
├── index.html              # GitHub Pages landing page
├── LICENSE                 # MIT licence
└── README.md               # This file
```

## 🎴 Card Naming Convention

Cards follow this naming pattern:

- **Number cards:** `{number}_of_{suit}.{ext}` (e.g. `2_of_hearts.png`)
- **Face cards:** `{face}_of_{suit}.{ext}` (e.g. `king_of_spades.svg`)
- **Aces:** `ace_of_{suit}.{ext}` (e.g. `ace_of_diamonds.png`)
- **Jokers:** `{colour}_joker.{ext}` (e.g. `black_joker.svg`, `red_joker.png`)

### Suits
- `clubs` ♣️
- `diamonds` ♦️
- `hearts` ♥️
- `spades` ♠️

### Values
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Translations

This README is available in several languages. See more in the /readme folder.

## 📄 Licence

This project is licensed under the MIT Licence – see the [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⭐ Support

If you find this project useful, please give it a star on GitHub!

---

Created with ❤️ by [Webisso](https://github.com/webisso)
