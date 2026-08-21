# 🃏 Spillkort

[![Lisens: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Åpne kildekode-bilder av spillkort i PNG- og SVG-format. Gratis å bruke til ethvert prosjekt!

🌐 **Live-demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Hva er inkludert

- **54 spillkort** (52 standardkort + 2 jokere)
- **PNG-format** – Bilder i høy kvalitet
- **SVG-format** – Skalerbar vektorgrafikk
- **JSON API** – Enkel integrasjon i dine prosjekter

## 🚀 Kom i gang raskt

### Direkte URL-tilgang

Få tilgang til ethvert kort direkte via GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{kortnavn}.png
https://webisso.github.io/playing-cards/svg/{kortnavn}.svg
```

### Eksempler

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Spar ess">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Spar ess">
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
├── png/                    # PNG-bilder
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG-bilder
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON-data for alle kort
├── index.html              # GitHub Pages forside
├── LICENSE                 # MIT-lisens
└── README.md               # Denne filen
```

## 🎴 Kortnavngivningskonvensjon

Kort følger dette navngivningsmønsteret:

- **Tallkort:** `{nummer}_of_{farge}.{ext}` (f.eks. `2_of_hearts.png`)
- **Bildekort:** `{bilde}_of_{farge}.{ext}` (f.eks. `king_of_spades.svg`)
- **Ess:** `ace_of_{farge}.{ext}` (f.eks. `ace_of_diamonds.png`)
- **Jokere:** `{farge}_joker.{ext}` (f.eks. `black_joker.svg`, `red_joker.png`)

### Farger
- `clubs` ♣️ (Kløver)
- `diamonds` ♦️ (Ruter)
- `hearts` ♥️ (Hjerter)
- `spades` ♠️ (Spar)

### Verdier
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Oversettelser

Denne README-filen er tilgjengelig på flere språk. Se flere i /readme-mappen.

## 📄 Lisens

Dette prosjektet er lisensiert under MIT – se filen [LICENSE](../LICENSE) for detaljer.

## 🤝 Bidrag

Bidrag er velkomne! Slik gjør du det:

1. Fork repoet
2. Opprett din branch (`git checkout -b feature/amazing-feature`)
3. Commit endringene dine (`git commit -m 'Legg til fantastisk funksjon'`)
4. Push branchen (`git push origin feature/amazing-feature`)
5. Opprett en Pull Request

## ⭐ Støtte

Hvis du synes dette prosjektet er nyttig, gi det gjerne en stjerne på GitHub!

---

Laget med ❤️ av [Webisso](https://github.com/webisso)
