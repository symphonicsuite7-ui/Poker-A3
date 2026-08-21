🃏 Speelkaarten

[![Licentie: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Open source speelkaartenafbeeldingen in PNG- en SVG-formaat. Gratis te gebruiken voor elk project!

🌐 **Live Demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Wat is inbegrepen

- **54 speelkaarten** (52 standaardkaarten + 2 jokers)
- **PNG-formaat** – Afbeeldingen van hoge kwaliteit
- **SVG-formaat** – Schaalbare vectorafbeeldingen
- **JSON API** – Eenvoudige integratie met je projecten

## 🚀 Snelstart

### Directe URL-toegang

Toegang tot elke kaart direct via GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{kaart_naam}.png
https://webisso.github.io/playing-cards/svg/{kaart_naam}.svg
```

### Voorbeelden

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Aas van Schoppen">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Aas van Schoppen">
```

### JSON API

Haal de kaartgegevens programmatically op:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Bestandsstructuur

```
playing-cards/
├── png/                    # PNG-afbeeldingen
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG-afbeeldingen
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON-data voor alle kaarten
├── index.html              # GitHub Pages startpagina
├── LICENSE                 # MIT-licentie
└── README.md               # Dit bestand
```

## 🎴 Naamgevingsconventie kaarten

Kaarten volgen dit naamgevingspatroon:

- **Numerieke kaarten:** `{nummer}_of_{soort}.{ext}` (bijv. `2_of_hearts.png`)
- **Beeldkaarten:** `{beeld}_of_{soort}.{ext}` (bijv. `king_of_spades.svg`)
- **Azen:** `ace_of_{soort}.{ext}` (bijv. `ace_of_diamonds.png`)
- **Jokers:** `{kleur}_joker.{ext}` (bijv. `black_joker.svg`, `red_joker.png`)

### Soorten
- `clubs` ♣️ (Klaver)
- `diamonds` ♦️ (Ruiten)
- `hearts` ♥️ (Harten)
- `spades` ♠️ (Schoppen)

### Waarden
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Vertalingen

Deze README is beschikbaar in meerdere talen. Zie de map /readme voor andere talen.

## 📄 Licentie

Dit project is gelicentieerd onder de MIT-licentie – zie het bestand [LICENSE](../LICENSE) voor details.

## 🤝 Bijdragen

Bijdragen zijn welkom! Voel je vrij om:

1. De repository te forken
2. Je feature branch aan te maken (`git checkout -b feature/geweldige-feature`)
3. Je wijzigingen te committen (`git commit -m 'Voeg een geweldige feature toe'`)
4. De branch te pushen (`git push origin feature/geweldige-feature`)
5. Een Pull Request te openen

## ⭐ Ondersteuning

Als je dit project nuttig vindt, overweeg dan om het een ster te geven op GitHub!

---

Gemaakt met ❤️ door [Webisso](https://github.com/webisso)
