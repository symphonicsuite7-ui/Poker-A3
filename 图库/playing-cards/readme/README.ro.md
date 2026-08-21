# 🃏 Cărți de joc

[![Licență: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Imagini open source cu cărți de joc în formate PNG și SVG. Gratuit pentru orice proiect!

🌐 **Demo live:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Ce este inclus

- **54 cărți de joc** (52 cărți standard + 2 jokeri)
- **Format PNG** – Imagini raster de înaltă calitate
- **Format SVG** – Grafică vectorială scalabilă
- **JSON API** – Integrare ușoară în proiectele tale

## 🚀 Pornire rapidă

### Acces direct la URL

Accesează orice carte direct prin GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nume_carte}.png
https://webisso.github.io/playing-cards/svg/{nume_carte}.svg
```

### Exemple

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As de pică">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As de pică">
```

### JSON API

Obține date despre cărți programatic:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Structura fișierelor

```
playing-cards/
├── png/                    # Imagini PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Imagini SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Date JSON pentru toate cărțile
├── index.html              # Pagina principală GitHub Pages
├── LICENSE                 # Licență MIT
└── README.md               # Acest fișier
```

## 🎴 Convenția de denumire a cărților

Cărțile urmează acest model de denumire:

- **Cărți numerice:** `{număr}_of_{simbol}.{ext}` (ex. `2_of_hearts.png`)
- **Cărți de figură:** `{figură}_of_{simbol}.{ext}` (ex. `king_of_spades.svg`)
- **Ași:** `ace_of_{simbol}.{ext}` (ex. `ace_of_diamonds.png`)
- **Jokeri:** `{culoare}_joker.{ext}` (ex. `black_joker.svg`, `red_joker.png`)

### Simboluri
- `clubs` ♣️ (treflă)
- `diamonds` ♦️ (caro)
- `hearts` ♥️ (inimă)
- `spades` ♠️ (pică)

### Valori
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Traduceri

Acest README este disponibil în mai multe limbi. Vezi mai multe în folderul /readme.

## 📄 Licență

Acest proiect este licențiat sub MIT – vezi fișierul [LICENSE](../LICENSE) pentru detalii.

## 🤝 Contribuții

Contribuțiile sunt binevenite! Iată cum:

1. Fă un fork al depozitului
2. Creează-ți branch-ul (`git checkout -b feature/amazing-feature`)
3. Fă commit la modificări (`git commit -m 'Adaugă funcționalitate grozavă'`)
4. Fă push la branch (`git push origin feature/amazing-feature`)
5. Deschide un Pull Request

## ⭐ Susținere

Dacă găsești acest proiect util, dă-i o stea pe GitHub!

---

Creat cu ❤️ de [Webisso](https://github.com/webisso)
