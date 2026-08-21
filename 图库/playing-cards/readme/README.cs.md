
# 🃏 Hrací karty

[![Licence: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Otevřené obrázky hracích karet ve formátech PNG a SVG. Zdarma pro jakýkoli projekt!

🌐 **Živá ukázka:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Co je součástí

- **54 hracích karet** (52 standardních karet + 2 žolíky)
- **Formát PNG** – Vysoce kvalitní rastrové obrázky
- **Formát SVG** – Škálovatelné vektorové grafiky
- **JSON API** – Snadná integrace do vašich projektů

## 🚀 Rychlý start

### Přímý přístup k URL

Přístup ke každé kartě přímo přes GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nazev_karty}.png
https://webisso.github.io/playing-cards/svg/{nazev_karty}.svg
```

### Příklady

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Eso pikové">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Eso pikové">
```

### JSON API

Získejte data o kartách programově:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Struktura souborů

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
├── cards.json              # JSON data pro všechny karty
├── index.html              # Úvodní stránka GitHub Pages
├── LICENSE                 # MIT licence
└── README.md               # Tento soubor
```

## 🎴 Konvence pojmenování karet

Karty následují tento vzor pojmenování:

- **Číselné karty:** `{číslo}_of_{barva}.{ext}` (např. `2_of_hearts.png`)
- **Obrázkové karty:** `{obraz}_of_{barva}.{ext}` (např. `king_of_spades.svg`)
- **Esa:** `ace_of_{barva}.{ext}` (např. `ace_of_diamonds.png`)
- **Žolíky:** `{barva}_joker.{ext}` (např. `black_joker.svg`, `red_joker.png`)

### Barvy
- `clubs` ♣️ (kříže)
- `diamonds` ♦️ (kára)
- `hearts` ♥️ (srdce)
- `spades` ♠️ (piky)

### Hodnoty
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Překlady

Tento README je dostupný v několika jazycích. Další jazyky najdete ve složce /readme.

## 📄 Licence

Tento projekt je licencován pod MIT – viz soubor [LICENSE](../LICENSE) pro podrobnosti.

## 🤝 Přispění

Přispění jsou vítána! Postupujte takto:

1. Forkněte repozitář
2. Vytvořte svou větev (`git checkout -b feature/amazing-feature`)
3. Proveďte změny (`git commit -m 'Přidat úžasnou funkci'`)
4. Pushněte větev (`git push origin feature/amazing-feature`)
5. Otevřete Pull Request

## ⭐ Podpora

Pokud vám tento projekt přijde užitečný, zvažte udělení hvězdy na GitHubu!

---

Vytvořil s ❤️ [Webisso](https://github.com/webisso)
