🃏 Karty do gry

[![Licencja: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Otwarte obrazy kart do gry w formatach PNG i SVG. Darmowe do dowolnego projektu!

🌐 **Demo na żywo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Co zawiera

- **54 karty do gry** (52 standardowe karty + 2 jokery)
- **Format PNG** – Wysokiej jakości obrazy rastrowe
- **Format SVG** – Skalowalne grafiki wektorowe
- **JSON API** – Łatwa integracja z Twoimi projektami

## 🚀 Szybki start

### Bezpośredni dostęp do URL

Uzyskaj dostęp do dowolnej karty bezpośrednio przez GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nazwa_karty}.png
https://webisso.github.io/playing-cards/svg/{nazwa_karty}.svg
```

### Przykłady

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As pik">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As pik">
```

### JSON API

Pobierz dane kart programistycznie:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Struktura plików

```
playing-cards/
├── png/                    # Obrazy PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Obrazy SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Dane JSON dla wszystkich kart
├── index.html              # Strona główna GitHub Pages
├── LICENSE                 # Licencja MIT
└── README.md               # Ten plik
```

## 🎴 Konwencja nazewnictwa kart

Karty mają następujący schemat nazewnictwa:

- **Karty liczbowe:** `{liczba}_of_{kolor}.{ext}` (np. `2_of_hearts.png`)
- **Figury:** `{figura}_of_{kolor}.{ext}` (np. `king_of_spades.svg`)
- **Asy:** `ace_of_{kolor}.{ext}` (np. `ace_of_diamonds.png`)
- **Jokery:** `{kolor}_joker.{ext}` (np. `black_joker.svg`, `red_joker.png`)

### Kolory
- `clubs` ♣️ (Trefl)
- `diamonds` ♦️ (Karo)
- `hearts` ♥️ (Kier)
- `spades` ♠️ (Pik)

### Wartości
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Tłumaczenia

Ten README jest dostępny w wielu językach. Zobacz folder /readme dla innych języków.

## 📄 Licencja

Ten projekt jest licencjonowany na MIT – zobacz plik [LICENSE](../LICENSE) po szczegóły.

## 🤝 Współpraca

Współpraca jest mile widziana! Wykonaj:

1. Fork repozytorium
2. Utwórz swoją gałąź (`git checkout -b feature/amazing-feature`)
3. Zatwierdź zmiany (`git commit -m 'Dodaj świetną funkcję'`)
4. Wypchnij gałąź (`git push origin feature/amazing-feature`)
5. Otwórz Pull Request

## ⭐ Wsparcie

Jeśli ten projekt jest dla Ciebie przydatny, daj mu gwiazdkę na GitHub!

---

Stworzone z ❤️ przez [Webisso](https://github.com/webisso)
