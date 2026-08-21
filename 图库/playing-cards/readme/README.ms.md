# 🃏 Kad Bermain

[![Lesen: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Imej kad bermain sumber terbuka dalam format PNG dan SVG. Percuma untuk digunakan dalam mana-mana projek!

🌐 **Demo langsung:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Apa yang Disertakan

- **54 kad bermain** (52 kad standard + 2 joker)
- **Format PNG** – Imej raster berkualiti tinggi
- **Format SVG** – Grafik vektor berskala
- **JSON API** – Integrasi mudah ke dalam projek anda

## 🚀 Mula Pantas

### Akses URL Langsung

Akses mana-mana kad secara langsung melalui GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nama_kad}.png
https://webisso.github.io/playing-cards/svg/{nama_kad}.svg
```

### Contoh

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Ace of Spades">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Ace of Spades">
```

### JSON API

Dapatkan data kad secara programatik:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Struktur Fail

```
playing-cards/
├── png/                    # Imej PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Imej SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Data JSON untuk semua kad
├── index.html              # Halaman utama GitHub Pages
├── LICENSE                 # Lesen MIT
└── README.md               # Fail ini
```

## 🎴 Konvensyen Penamaan Kad

Kad mengikuti corak penamaan berikut:

- **Kad nombor:** `{nombor}_of_{jenis}.{ext}` (cth. `2_of_hearts.png`)
- **Kad muka:** `{muka}_of_{jenis}.{ext}` (cth. `king_of_spades.svg`)
- **Ace:** `ace_of_{jenis}.{ext}` (cth. `ace_of_diamonds.png`)
- **Joker:** `{warna}_joker.{ext}` (cth. `black_joker.svg`, `red_joker.png`)

### Jenis
- `clubs` ♣️ (Kelab)
- `diamonds` ♦️ (Berlian)
- `hearts` ♥️ (Hati)
- `spades` ♠️ (Sepade)

### Nilai
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Terjemahan

README ini tersedia dalam beberapa bahasa. Lihat lebih banyak dalam folder /readme.

## 📄 Lesen

Projek ini dilesenkan di bawah MIT – lihat fail [LICENSE](../LICENSE) untuk butiran.

## 🤝 Sumbangan

Sumbangan amat dialu-alukan! Begini caranya:

1. Fork repositori
2. Cipta branch anda (`git checkout -b feature/amazing-feature`)
3. Commit perubahan anda (`git commit -m 'Tambah ciri hebat'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## ⭐ Sokongan

Jika anda mendapati projek ini berguna, sila berikan bintang di GitHub!

---

Dicipta dengan ❤️ oleh [Webisso](https://github.com/webisso)
