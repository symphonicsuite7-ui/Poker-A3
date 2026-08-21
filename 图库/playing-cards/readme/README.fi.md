# 🃏 Pelikortit

[![Lisenssi: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Avoimen lähdekoodin pelikorttikuvia PNG- ja SVG-muodoissa. Vapaasti käytettävissä mihin tahansa projektiin!

🌐 **Live-demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Mitä sisältyy

- **54 pelikorttia** (52 tavallista korttia + 2 jokeria)
- **PNG-muoto** – Laadukkaita rasterikuvia
- **SVG-muoto** – Skaalautuvia vektorigrafiikoita
- **JSON API** – Helppo integrointi projekteihisi

## 🚀 Nopea aloitus

### Suora URL-osoite

Pääset mihin tahansa korttiin suoraan GitHub Pagesin kautta:

```
https://webisso.github.io/playing-cards/png/{kortin_nimi}.png
https://webisso.github.io/playing-cards/svg/{kortin_nimi}.svg
```

### Esimerkkejä

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Pata ässä">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Pata ässä">
```

### JSON API

Hae korttitiedot ohjelmallisesti:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Tiedostorakenne

```
playing-cards/
├── png/                    # PNG-kuvat
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG-kuvat
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Kaikkien korttien JSON-data
├── index.html              # GitHub Pages -etusivu
├── LICENSE                 # MIT-lisenssi
└── README.md               # Tämä tiedosto
```

## 🎴 Korttien nimeämiskäytäntö

Kortit noudattavat tätä nimeämismallia:

- **Numerokortit:** `{numero}_of_{maa}.{ext}` (esim. `2_of_hearts.png`)
- **Kuvakortit:** `{kuva}_of_{maa}.{ext}` (esim. `king_of_spades.svg`)
- **Ässät:** `ace_of_{maa}.{ext}` (esim. `ace_of_diamonds.png`)
- **Jokerit:** `{väri}_joker.{ext}` (esim. `black_joker.svg`, `red_joker.png`)

### Maat
- `clubs` ♣️ (Risti)
- `diamonds` ♦️ (Ruutu)
- `hearts` ♥️ (Hertta)
- `spades` ♠️ (Pata)

### Arvot
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Käännökset

Tämä README on saatavilla useilla kielillä. Katso muut kielet kansiosta /readme.

## 📄 Lisenssi

Tämä projekti on lisensoitu MIT-lisenssillä – katso tiedosto [LICENSE](../LICENSE) lisätietoja varten.

## 🤝 Osallistuminen

Osallistuminen on tervetullutta! Toimi näin:

1. Forkkaa repositorio
2. Luo oma feature branch (`git checkout -b feature/amazing-feature`)
3. Commitoi muutokset (`git commit -m 'Lisää upea ominaisuus'`)
4. Pushaa branch (`git push origin feature/amazing-feature`)
5. Avaa Pull Request

## ⭐ Tuki

Jos koet tämän projektin hyödylliseksi, anna sille tähti GitHubissa!

---

Tehty ❤️:lla [Webisso](https://github.com/webisso)
