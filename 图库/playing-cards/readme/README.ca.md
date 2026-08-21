# 🃏 Cartes de Joc

[![Llicència: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Imatges de cartes de joc de codi obert en formats PNG i SVG. Gratuït per a qualsevol projecte!

🌐 **Demo en viu:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Què s'inclou

- **54 cartes de joc** (52 cartes estàndard + 2 comodins)
- **Format PNG** – Imatges raster d'alta qualitat
- **Format SVG** – Gràfics vectorials escalables
- **API JSON** – Fàcil integració als teus projectes

## 🚀 Començar ràpidament

### Accés directe per URL

Accedeix a qualsevol carta directament a través de GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nom_carta}.png
https://webisso.github.io/playing-cards/svg/{nom_carta}.svg
```

### Exemples

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As d'espases">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As d'espases">
```

### API JSON

Obteniu dades de les cartes programàticament:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Estructura de fitxers

```
playing-cards/
├── png/                    # Imatges PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Imatges SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Dades JSON de totes les cartes
├── index.html              # Pàgina principal de GitHub Pages
├── LICENSE                 # Llicència MIT
└── README.md               # Aquest fitxer
```

## 🎴 Convenció de noms de cartes

Les cartes segueixen aquest patró de noms:

- **Cartes numèriques:** `{número}_of_{pal}.{ext}` (ex. `2_of_hearts.png`)
- **Cartes de figura:** `{figura}_of_{pal}.{ext}` (ex. `king_of_spades.svg`)
- **Asos:** `ace_of_{pal}.{ext}` (ex. `ace_of_diamonds.png`)
- **Comodins:** `{color}_joker.{ext}` (ex. `black_joker.svg`, `red_joker.png`)

### Pals
- `clubs` ♣️ (Trèvols)
- `diamonds` ♦️ (Diamants)
- `hearts` ♥️ (Cors)
- `spades` ♠️ (Espases)

### Valors
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Traduccions

Aquesta README està disponible en diversos idiomes. Vegeu-ne més a la carpeta /readme.

## 📄 Llicència

Aquest projecte està sota llicència MIT – vegeu el fitxer [LICENSE](../LICENSE) per a més detalls.

## 🤝 Contribució

Les contribucions són benvingudes! Així:

1. Fes un fork del repositori
2. Crea la teva branca (`git checkout -b feature/amazing-feature`)
3. Fes commit dels canvis (`git commit -m 'Afegeix una funció increïble'`)
4. Puja la branca (`git push origin feature/amazing-feature`)
5. Obre un Pull Request

## ⭐ Suport

Si trobes útil aquest projecte, dóna-li una estrella a GitHub!

---

Creat amb ❤️ per [Webisso](https://github.com/webisso)
