🃏 Játékkártyák

[![Licenc: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Nyílt forráskódú játékkártya-képek PNG és SVG formátumban. Ingyenesen használható bármilyen projekthez!

🌐 **Élő demó:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Mit tartalmaz

- **54 játékkártya** (52 standard kártya + 2 joker)
- **PNG formátum** – Kiváló minőségű raszterképek
- **SVG formátum** – Skálázható vektorgrafikák
- **JSON API** – Egyszerű integráció a projektjeidbe

## 🚀 Gyors kezdés

### Közvetlen URL-elérés

Bármelyik kártyához közvetlenül hozzáférhetsz a GitHub Pages-en keresztül:

```
https://webisso.github.io/playing-cards/png/{kartya_neve}.png
https://webisso.github.io/playing-cards/svg/{kartya_neve}.svg
```

### Példák

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Pikk ász">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Pikk ász">
```

### JSON API

Kártyaadatok lekérése programozottan:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Fájlstruktúra

```
playing-cards/
├── png/                    # PNG képek
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG képek
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Minden kártya JSON adata
├── index.html              # GitHub Pages kezdőlap
├── LICENSE                 # MIT licenc
└── README.md               # Ez a fájl
```

## 🎴 Kártyanév-konvenció

A kártyák az alábbi elnevezési mintát követik:

- **Számozott kártyák:** `{szám}_of_{szín}.{ext}` (pl. `2_of_hearts.png`)
- **Figurás kártyák:** `{figura}_of_{szín}.{ext}` (pl. `king_of_spades.svg`)
- **Ászok:** `ace_of_{szín}.{ext}` (pl. `ace_of_diamonds.png`)
- **Jokerek:** `{szín}_joker.{ext}` (pl. `black_joker.svg`, `red_joker.png`)

### Színek
- `clubs` ♣️ (Treff)
- `diamonds` ♦️ (Káró)
- `hearts` ♥️ (Kőr)
- `spades` ♠️ (Pikk)

### Értékek
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Fordítások

Ez a README több nyelven elérhető. További nyelvekért lásd a /readme mappát.

## 📄 Licenc

Ez a projekt MIT licenc alatt áll – részletekért lásd a [LICENSE](../LICENSE) fájlt.

## 🤝 Közreműködés

Szívesen fogadunk közreműködéseket! Kövesd az alábbi lépéseket:

1. Forkold a repót
2. Hozd létre a saját branched (`git checkout -b feature/amazing-feature`)
3. Commitold a módosításokat (`git commit -m 'Adj hozzá egy szuper funkciót'`)
4. Pushold a branchet (`git push origin feature/amazing-feature`)
5. Nyiss egy Pull Requestet

## ⭐ Támogatás

Ha hasznosnak találod ezt a projektet, adj neki csillagot a GitHubon!

---

Készítette ❤️ [Webisso](https://github.com/webisso)
