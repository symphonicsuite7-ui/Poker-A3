# 🃏 Oyun Kartları

[![Lisans: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Açık kaynak oyun kartı görselleri PNG ve SVG formatlarında. Her türlü projede ücretsiz kullanabilirsiniz!

🌐 **Canlı Demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 İçerik

- **54 oyun kartı** (52 standart kart + 2 joker)
- **PNG formatı** - Yüksek kaliteli raster görseller
- **SVG formatı** - Ölçeklenebilir vektör grafikler
- **JSON API** - Projelerinizle kolay entegrasyon

## 🚀 Hızlı Başlangıç

### Doğrudan URL Erişimi

Herhangi bir karta GitHub Pages üzerinden doğrudan erişin:

```
https://webisso.github.io/playing-cards/png/{kart_adi}.png
https://webisso.github.io/playing-cards/svg/{kart_adi}.svg
```

### Örnekler

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Maça Ası">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Maça Ası">
```

### JSON API

Kart verilerini programatik olarak çekin:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Dosya Yapısı

```
playing-cards/
├── png/                    # PNG görselleri
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG görselleri
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Tüm kartlar için JSON veri
├── index.html              # GitHub Pages açılış sayfası
├── LICENSE                 # MIT Lisansı
└── README.md               # Bu dosya
```

## 🎴 Kart İsimlendirme Kuralı

Kartlar şu isimlendirme desenini takip eder:

- **Numaralı kartlar:** `{numara}_of_{takım}.{uzantı}` (örn. `2_of_hearts.png`)
- **Resimli kartlar:** `{resim}_of_{takım}.{uzantı}` (örn. `king_of_spades.svg`)
- **Aslar:** `ace_of_{takım}.{uzantı}` (örn. `ace_of_diamonds.png`)
- **Jokerler:** `{renk}_joker.{uzantı}` (örn. `black_joker.svg`, `red_joker.png`)

### Takımlar
- `clubs` ♣️ (Sinek)
- `diamonds` ♦️ (Karo)
- `hearts` ♥️ (Kupa)
- `spades` ♠️ (Maça)

### Değerler
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Çeviriler

Bu README birden fazla dilde mevcuttur. Diğer diller için /readme klasörüne bakınız.

## 📄 Lisans

Bu proje MIT Lisansı ile lisanslanmıştır - detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 🤝 Katkı

Katkılar memnuniyetle karşılanır! Lütfen:

1. Depoyu çatallayın (fork)
2. Özellik dalınızı oluşturun (`git checkout -b feature/harika-ozellik`)
3. Değişikliklerinizi kaydedin (`git commit -m 'Harika bir özellik ekle'`)
4. Dalı gönderin (`git push origin feature/harika-ozellik`)
5. Bir Pull Request açın

## ⭐ Destek

Bu projeyi faydalı bulduysanız, lütfen GitHub'da yıldız vermeyi düşünün!

---

[Webisso](https://github.com/webisso) tarafından sevgiyle yapılmıştır
