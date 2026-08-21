# 🃏 Spillekort

[![Licens: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Open source spillekortbilleder i PNG- og SVG-format. Gratis at bruge til ethvert projekt!

🌐 **Live-demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Hvad er inkluderet

- **54 spillekort** (52 standardkort + 2 jokere)
- **PNG-format** – Billeder i høj kvalitet
- **SVG-format** – Skalerbar vektorgrafik
- **JSON API** – Nem integration i dine projekter

## 🚀 Kom godt i gang

### Direkte URL-adgang

Få adgang til ethvert kort direkte via GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{kortnavn}.png
https://webisso.github.io/playing-cards/svg/{kortnavn}.svg
```

### Eksempler

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Spar es">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Spar es">
```

### JSON API

Hent kortdata programmatisk:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Filstruktur

```
playing-cards/
├── png/                    # PNG-billeder
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG-billeder
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON-data for alle kort
├── index.html              # GitHub Pages forside
├── LICENSE                 # MIT-licens
└── README.md               # Denne fil
```

## 🎴 Kortnavngivningskonvention

Kort følger dette navngivningsmønster:

- **Talskort:** `{nummer}_of_{kulør}.{ext}` (fx `2_of_hearts.png`)
- **Billedkort:** `{billede}_of_{kulør}.{ext}` (fx `king_of_spades.svg`)
- **Es:** `ace_of_{kulør}.{ext}` (fx `ace_of_diamonds.png`)
- **Jokere:** `{farve}_joker.{ext}` (fx `black_joker.svg`, `red_joker.png`)

### Kulører
- `clubs` ♣️ (Klør)
- `diamonds` ♦️ (Ruder)
- `hearts` ♥️ (Hjerter)
- `spades` ♠️ (Spar)

### Værdier
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Oversættelser

Denne README findes på flere sprog. Se mappen /readme for andre sprog.

## 📄 Licens

Dette projekt er licenseret under MIT – se filen [LICENSE](../LICENSE) for detaljer.

## 🤝 Bidrag

Bidrag er velkomne! Sådan gør du:

1. Fork repositoryet
2. Opret din feature branch (`git checkout -b feature/amazing-feature`)
3. Commit dine ændringer (`git commit -m 'Tilføj en fantastisk funktion'`)
4. Push branchen (`git push origin feature/amazing-feature`)
5. Opret en Pull Request

## ⭐ Støtte

Hvis du finder dette projekt nyttigt, så giv det gerne en stjerne på GitHub!

---

Lavet med ❤️ af [Webisso](https://github.com/webisso)
