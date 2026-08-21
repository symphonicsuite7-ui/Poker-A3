# 🃏 Igralne karte

[![Licenca: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Slike igralnih kart z odprto kodo v formatih PNG in SVG. Brezplačno za vsak projekt!

🌐 **Demo v živo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Kaj je vključeno

- **54 igralnih kart** (52 standardnih kart + 2 jokerja)
- **Format PNG** – Visokokakovostne rastrske slike
- **Format SVG** – Prilagodljiva vektorska grafika
- **JSON API** – Enostavna integracija v vaše projekte

## 🚀 Hiter začetek

### Neposreden dostop do URL

Dostopajte do katere koli karte neposredno prek GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{ime_karte}.png
https://webisso.github.io/playing-cards/svg/{ime_karte}.svg
```

### Primeri

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As pik">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As pik">
```

### JSON API

Pridobite podatke o kartah programsko:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Struktura datotek

```
playing-cards/
├── png/                    # PNG slike
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG slike
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON podatki za vse karte
├── index.html              # Domača stran GitHub Pages
├── LICENSE                 # MIT licenca
└── README.md               # Ta datoteka
```

## 🎴 Konvencija poimenovanja kart

Karte sledijo temu vzorcu poimenovanja:

- **Številčne karte:** `{številka}_of_{znak}.{ext}` (npr. `2_of_hearts.png`)
- **Slike:** `{slika}_of_{znak}.{ext}` (npr. `king_of_spades.svg`)
- **Asi:** `ace_of_{znak}.{ext}` (npr. `ace_of_diamonds.png`)
- **Jokerji:** `{barva}_joker.{ext}` (npr. `black_joker.svg`, `red_joker.png`)

### Znaki
- `clubs` ♣️ (križ)
- `diamonds` ♦️ (karo)
- `hearts` ♥️ (srce)
- `spades` ♠️ (pik)

### Vrednosti
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Prevodi

Ta README je na voljo v več jezikih. Več jih najdete v mapi /readme.

## 📄 Licenca

Ta projekt je licenciran pod MIT – glejte datoteko [LICENSE](../LICENSE) za podrobnosti.

## 🤝 Prispevanje

Prispevki so dobrodošli! Tako:

1. Forkajte repozitorij
2. Ustvarite svojo vejo (`git checkout -b feature/amazing-feature`)
3. Commitajte spremembe (`git commit -m 'Dodaj super funkcijo'`)
4. Pushajte vejo (`git push origin feature/amazing-feature`)
5. Odprite Pull Request

## ⭐ Podpora

Če se vam zdi ta projekt uporaben, mu dajte zvezdico na GitHubu!

---

Ustvaril z ❤️ [Webisso](https://github.com/webisso)
