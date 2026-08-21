# 🃏 Spielkarten

[![Lizenz: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Open-Source-Spielkartenbilder im PNG- und SVG-Format. Frei für jedes Projekt verwendbar!

🌐 **Live-Demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Inhalt

- **54 Spielkarten** (52 Standardkarten + 2 Joker)
- **PNG-Format** – Hochwertige Rasterbilder
- **SVG-Format** – Skalierbare Vektorgrafiken
- **JSON API** – Einfache Integration in Ihre Projekte

## 🚀 Schnellstart

### Direkter URL-Zugriff

Greifen Sie direkt über GitHub Pages auf jede Karte zu:

```
https://webisso.github.io/playing-cards/png/{kartenname}.png
https://webisso.github.io/playing-cards/svg/{kartenname}.svg
```

### Beispiele

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Pik Ass">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Pik Ass">
```

### JSON API

Rufen Sie die Kartendaten programmgesteuert ab:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Dateistruktur

```
playing-cards/
├── png/                    # PNG-Bilder
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG-Bilder
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON-Daten für alle Karten
├── index.html              # GitHub Pages Startseite
├── LICENSE                 # MIT-Lizenz
└── README.md               # Diese Datei
```

## 🎴 Kartenbenennungskonvention

Karten folgen diesem Benennungsmuster:

- **Zahlenkarten:** `{nummer}_of_{farbe}.{ext}` (z.B. `2_of_hearts.png`)
- **Bildkarten:** `{bild}_of_{farbe}.{ext}` (z.B. `king_of_spades.svg`)
- **Asse:** `ace_of_{farbe}.{ext}` (z.B. `ace_of_diamonds.png`)
- **Joker:** `{farbe}_joker.{ext}` (z.B. `black_joker.svg`, `red_joker.png`)

### Farben
- `clubs` ♣️ (Kreuz)
- `diamonds` ♦️ (Karo)
- `hearts` ♥️ (Herz)
- `spades` ♠️ (Pik)

### Werte
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Übersetzungen

Diese README ist in mehreren Sprachen verfügbar. Siehe /readme für weitere Sprachen.

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert – siehe [LICENSE](../LICENSE) für Details.

## 🤝 Mitwirken

Beiträge sind willkommen! So können Sie helfen:

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/tolle-funktion`)
3. Änderungen committen (`git commit -m 'Tolle Funktion hinzugefügt'`)
4. Branch pushen (`git push origin feature/tolle-funktion`)
5. Pull Request öffnen

## ⭐ Unterstützung

Wenn Ihnen dieses Projekt gefällt, geben Sie ihm bitte einen Stern auf GitHub!

---

Mit ❤️ von [Webisso](https://github.com/webisso)
