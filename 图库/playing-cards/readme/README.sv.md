# 🃏 Spelkort

[![Licens: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Öppna källkods-bilder på spelkort i PNG- och SVG-format. Gratis att använda för alla projekt!

🌐 **Live-demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Vad som ingår

- **54 spelkort** (52 standardkort + 2 jokrar)
- **PNG-format** – Högkvalitativa rasterbilder
- **SVG-format** – Skalbara vektorgrafiker
- **JSON API** – Enkel integration i dina projekt

## 🚀 Snabbstart

### Direkt URL-åtkomst

Kom åt vilket kort som helst direkt via GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{kortnamn}.png
https://webisso.github.io/playing-cards/svg/{kortnamn}.svg
```

### Exempel

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Spader ess">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Spader ess">
```

### JSON API

Hämta kortdata programmatiskt:

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
├── cards.json              # JSON-data för alla kort
├── index.html              # GitHub Pages startsida
├── LICENSE                 # MIT-licens
└── README.md               # Denna fil
```

## 🎴 Kortnamngivningskonvention

Kort följer detta namngivningsmönster:

- **Nummerkort:** `{nummer}_of_{färg}.{ext}` (t.ex. `2_of_hearts.png`)
- **Klädda kort:** `{figur}_of_{färg}.{ext}` (t.ex. `king_of_spades.svg`)
- **Ess:** `ace_of_{färg}.{ext}` (t.ex. `ace_of_diamonds.png`)
- **Jokrar:** `{färg}_joker.{ext}` (t.ex. `black_joker.svg`, `red_joker.png`)

### Färger
- `clubs` ♣️ (Klöver)
- `diamonds` ♦️ (Ruter)
- `hearts` ♥️ (Hjärter)
- `spades` ♠️ (Spader)

### Värden
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Översättningar

Denna README finns på flera språk. Se mappen /readme för andra språk.

## 📄 Licens

Detta projekt är licensierat under MIT – se filen [LICENSE](../LICENSE) för detaljer.

## 🤝 Bidra

Bidrag välkomnas! Gör så här:

1. Forka repot
2. Skapa din feature branch (`git checkout -b feature/amazing-feature`)
3. Committa dina ändringar (`git commit -m 'Lägg till en fantastisk funktion'`)
4. Pusha branchen (`git push origin feature/amazing-feature`)
5. Öppna en Pull Request

## ⭐ Stöd

Om du tycker att projektet är användbart, ge det gärna en stjärna på GitHub!

---

Skapat med ❤️ av [Webisso](https://github.com/webisso)
