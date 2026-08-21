# 🃏 Hracie karty

[![Licencia: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Otvorené obrázky hracích kariet vo formátoch PNG a SVG. Zadarmo pre akýkoľvek projekt!

🌐 **Živá ukážka:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Čo je súčasťou

- **54 hracích kariet** (52 štandardných kariet + 2 žolíky)
- **Formát PNG** – Vysokokvalitné rastrové obrázky
- **Formát SVG** – Škálovateľná vektorová grafika
- **JSON API** – Jednoduchá integrácia do vašich projektov

## 🚀 Rýchly štart

### Priamy prístup k URL

Prístup ku každej karte priamo cez GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nazov_karty}.png
https://webisso.github.io/playing-cards/svg/{nazov_karty}.svg
```

### Príklady

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Eso pikové">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Eso pikové">
```

### JSON API

Získajte údaje o kartách programovo:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Štruktúra súborov

```
playing-cards/
├── png/                    # PNG obrázky
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG obrázky
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON údaje pre všetky karty
├── index.html              # Úvodná stránka GitHub Pages
├── LICENSE                 # MIT licencia
└── README.md               # Tento súbor
```

## 🎴 Konvencia pomenovania kariet

Karty nasledujú tento vzor pomenovania:

- **Číselné karty:** `{číslo}_of_{farba}.{ext}` (napr. `2_of_hearts.png`)
- **Obrázkové karty:** `{obraz}_of_{farba}.{ext}` (napr. `king_of_spades.svg`)
- **Esá:** `ace_of_{farba}.{ext}` (napr. `ace_of_diamonds.png`)
- **Žolíky:** `{farba}_joker.{ext}` (napr. `black_joker.svg`, `red_joker.png`)

### Farby
- `clubs` ♣️ (kríž)
- `diamonds` ♦️ (karo)
- `hearts` ♥️ (srdce)
- `spades` ♠️ (piky)

### Hodnoty
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Preklady

Tento README je dostupný vo viacerých jazykoch. Ďalšie jazyky nájdete v priečinku /readme.

## 📄 Licencia

Tento projekt je licencovaný pod MIT – pozrite súbor [LICENSE](../LICENSE) pre podrobnosti.

## 🤝 Prispievanie

Príspevky sú vítané! Postupujte takto:

1. Forknite repozitár
2. Vytvorte svoju vetvu (`git checkout -b feature/amazing-feature`)
3. Commitnite zmeny (`git commit -m 'Pridať úžasnú funkciu'`)
4. Pushnite vetvu (`git push origin feature/amazing-feature`)
5. Otvorte Pull Request

## ⭐ Podpora

Ak vám tento projekt príde užitočný, dajte mu hviezdičku na GitHube!

---

Vytvoril s ❤️ [Webisso](https://github.com/webisso)
