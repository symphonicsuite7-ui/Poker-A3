# 🃏 Kartu Remi

[![Lisensi: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Gambar kartu remi open source dalam format PNG dan SVG. Gratis digunakan untuk proyek apa pun!

🌐 **Demo langsung:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Apa Saja yang Termasuk

- **54 kartu remi** (52 kartu standar + 2 joker)
- **Format PNG** – Gambar raster berkualitas tinggi
- **Format SVG** – Grafik vektor yang dapat diskalakan
- **JSON API** – Integrasi mudah ke dalam proyek Anda

## 🚀 Mulai Cepat

### Akses URL Langsung

Akses setiap kartu langsung melalui GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nama_kartu}.png
https://webisso.github.io/playing-cards/svg/{nama_kartu}.svg
```

### Contoh

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As sekop">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As sekop">
```

### JSON API

Ambil data kartu secara terprogram:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Struktur Berkas

```
playing-cards/
├── png/                    # Gambar PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Gambar SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Data JSON untuk semua kartu
├── index.html              # Halaman utama GitHub Pages
├── LICENSE                 # Lisensi MIT
└── README.md               # Berkas ini
```

## 🎴 Konvensi Penamaan Kartu

Kartu mengikuti pola penamaan berikut:

- **Kartu angka:** `{angka}_of_{jenis}.{ext}` (misal `2_of_hearts.png`)
- **Kartu wajah:** `{wajah}_of_{jenis}.{ext}` (misal `king_of_spades.svg`)
- **As:** `ace_of_{jenis}.{ext}` (misal `ace_of_diamonds.png`)
- **Joker:** `{warna}_joker.{ext}` (misal `black_joker.svg`, `red_joker.png`)

### Jenis
- `clubs` ♣️ (Keriting)
- `diamonds` ♦️ (Wajik)
- `hearts` ♥️ (Hati)
- `spades` ♠️ (Sekop)

### Nilai
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Terjemahan

README ini tersedia dalam beberapa bahasa. Lihat lebih banyak di folder /readme.

## 📄 Lisensi

Proyek ini dilisensikan di bawah MIT – lihat berkas [LICENSE](../LICENSE) untuk detailnya.

## 🤝 Kontribusi

Kontribusi sangat diterima! Berikut caranya:

1. Fork repositori
2. Buat branch Anda (`git checkout -b feature/amazing-feature`)
3. Commit perubahan Anda (`git commit -m 'Tambah fitur keren'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## ⭐ Dukungan

Jika Anda merasa proyek ini bermanfaat, beri bintang di GitHub!

---

Dibuat dengan ❤️ oleh [Webisso](https://github.com/webisso)
