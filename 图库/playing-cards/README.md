# 🃏 Playing Cards

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Open source playing card images in PNG and SVG formats. Free to use for any project!

🌐 **Live Demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 What's Included

- **54 playing cards** (52 standard cards + 2 jokers)
- **PNG format** - High quality raster images
- **SVG format** - Scalable vector graphics
- **JSON API** - Easy integration with your projects

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

Fetch the card data programmatically:

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
├── LICENSE                 # MIT License
└── README.md               # This file
```

## 🎴 Card Naming Convention

Cards follow this naming pattern:

- **Number cards:** `{number}_of_{suit}.{ext}` (e.g., `2_of_hearts.png`)
- **Face cards:** `{face}_of_{suit}.{ext}` (e.g., `king_of_spades.svg`)
- **Aces:** `ace_of_{suit}.{ext}` (e.g., `ace_of_diamonds.png`)
- **Jokers:** `{color}_joker.{ext}` (e.g., `black_joker.svg`, `red_joker.png`)

### Suits
- `clubs` ♣️
- `diamonds` ♦️
- `hearts` ♥️
- `spades` ♠️

### Ranks
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Translations

This README is available in multiple languages:

| Language | Link |
|----------|------|
| العربية | [README.ar-SA.md](readme/README.ar-SA.md) |
| Català | [README.ca.md](readme/README.ca.md) |
| 简体中文 | [README.zh-Hans.md](readme/README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](readme/README.zh-Hant.md) |
| Hrvatski | [README.hr.md](readme/README.hr.md) |
| Čeština | [README.cs.md](readme/README.cs.md) |
| Dansk | [README.da.md](readme/README.da.md) |
| Nederlands | [README.nl-NL.md](readme/README.nl-NL.md) |
| English (AU) | [README.en-AU.md](readme/README.en-AU.md) |
| English (CA) | [README.en-CA.md](readme/README.en-CA.md) |
| English (GB) | [README.en-GB.md](readme/README.en-GB.md) |
| English (US) | [README.en-US.md](readme/README.en-US.md) |
| Suomi | [README.fi.md](readme/README.fi.md) |
| Français (FR) | [README.fr-FR.md](readme/README.fr-FR.md) |
| Français (CA) | [README.fr-CA.md](readme/README.fr-CA.md) |
| Deutsch | [README.de-DE.md](readme/README.de-DE.md) |
| Ελληνικά | [README.el.md](readme/README.el.md) |
| עברית | [README.he.md](readme/README.he.md) |
| हिन्दी | [README.hi.md](readme/README.hi.md) |
| Magyar | [README.hu.md](readme/README.hu.md) |
| Bahasa Indonesia | [README.id.md](readme/README.id.md) |
| Italiano | [README.it.md](readme/README.it.md) |
| 日本語 | [README.ja.md](readme/README.ja.md) |
| 한국어 | [README.ko.md](readme/README.ko.md) |
| Bahasa Melayu | [README.ms.md](readme/README.ms.md) |
| Norsk | [README.no.md](readme/README.no.md) |
| Polski | [README.pl.md](readme/README.pl.md) |
| Slovenščina | [README.sl.md](readme/README.sl.md) |
| Português | [README.pt.md](readme/README.pt.md) |
| فارسی | [README.fa.md](readme/README.fa.md) |
| ਪੰਜਾਬੀ | [README.pa.md](readme/README.pa.md) |
| Português (BR) | [README.pt-BR.md](readme/README.pt-BR.md) |
| Português (PT) | [README.pt-PT.md](readme/README.pt-PT.md) |
| Română | [README.ro.md](readme/README.ro.md) |
| Русский | [README.ru.md](readme/README.ru.md) |
| Slovenčina | [README.sk.md](readme/README.sk.md) |
| Español (MX) | [README.es-MX.md](readme/README.es-MX.md) |
| Español (ES) | [README.es-ES.md](readme/README.es-ES.md) |
| Svenska | [README.sv.md](readme/README.sv.md) |
| ไทย | [README.th.md](readme/README.th.md) |
| Türkçe | [README.tr.md](readme/README.tr.md) |
| Українська | [README.uk.md](readme/README.uk.md) |
| Tiếng Việt | [README.vi.md](readme/README.vi.md) |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⭐ Support

If you find this project useful, please consider giving it a star on GitHub!

---

Made with ♥️ by [Webisso](https://github.com/webisso)
