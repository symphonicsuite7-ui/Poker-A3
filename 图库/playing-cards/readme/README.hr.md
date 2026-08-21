# 🃏 Igraće karte

[![Licenca: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Slike igraćih karata otvorenog koda u PNG i SVG formatima. Besplatno za bilo koji projekt!

🌐 **Demo uživo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Što je uključeno

- **54 igraće karte** (52 standardne karte + 2 džokera)
- **PNG format** – Kvalitetne rasterske slike
- **SVG format** – Skalabilna vektorska grafika
- **JSON API** – Jednostavna integracija u vaše projekte

## 🚀 Brzi početak

### Izravan pristup URL-u

Pristupite svakoj karti izravno putem GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{ime_karte}.png
https://webisso.github.io/playing-cards/svg/{ime_karte}.svg
```

### Primjeri

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As pik">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As pik">
```

### JSON API

Preuzmite podatke o kartama programatski:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Struktura datoteka

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
├── cards.json              # JSON podaci za sve karte
├── index.html              # Početna stranica GitHub Pages
├── LICENSE                 # MIT licenca
└── README.md               # Ova datoteka
```

## 🎴 Konvencija imenovanja karata

Karte slijede ovaj obrazac imenovanja:

- **Brojčane karte:** `{broj}_of_{znak}.{ext}` (npr. `2_of_hearts.png`)
- **Face karte:** `{face}_of_{znak}.{ext}` (npr. `king_of_spades.svg`)
- **Asovi:** `ace_of_{znak}.{ext}` (npr. `ace_of_diamonds.png`)
- **Džokeri:** `{boja}_joker.{ext}` (npr. `black_joker.svg`, `red_joker.png`)

### Znakovi
- `clubs` ♣️ (tref)
- `diamonds` ♦️ (karo)
- `hearts` ♥️ (herc)
- `spades` ♠️ (pik)

### Vrijednosti
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Prijevodi

Ovaj README dostupan je na više jezika. Pogledajte više u mapi /readme.

## 📄 Licenca

Ovaj projekt je licenciran pod MIT – pogledajte datoteku [LICENSE](../LICENSE) za detalje.

## 🤝 Doprinos

Doprinosi su dobrodošli! Evo kako:

1. Forkajte repozitorij
2. Napravite svoj branch (`git checkout -b feature/amazing-feature`)
3. Commitajte promjene (`git commit -m 'Dodaj sjajnu funkcionalnost'`)
4. Pushajte branch (`git push origin feature/amazing-feature`)
5. Otvorite Pull Request

## ⭐ Podrška

Ako vam je ovaj projekt koristan, dajte mu zvjezdicu na GitHubu!

---

Izradio s ❤️ [Webisso](https://github.com/webisso)
