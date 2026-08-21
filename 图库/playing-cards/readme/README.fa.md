# 🃏 کارت‌های بازی

[![مجوز: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

تصاویر کارت‌های بازی متن‌باز در فرمت‌های PNG و SVG. رایگان برای هر پروژه‌ای!

🌐 **دموی زنده:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 چه چیزی شامل می‌شود

- **۵۴ کارت بازی** (۵۲ کارت استاندارد + ۲ جوکر)
- **فرمت PNG** – تصاویر شطرنجی با کیفیت بالا
- **فرمت SVG** – گرافیک برداری مقیاس‌پذیر
- **JSON API** – ادغام آسان با پروژه‌های شما

## 🚀 شروع سریع

### دسترسی مستقیم URL

به هر کارتی مستقیماً از طریق GitHub Pages دسترسی پیدا کنید:

```
https://webisso.github.io/playing-cards/png/{نام_کارت}.png
https://webisso.github.io/playing-cards/svg/{نام_کارت}.svg
```

### نمونه‌ها

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="آس پیک">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="آس پیک">
```

### JSON API

داده‌های کارت را به صورت برنامه‌نویسی دریافت کنید:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 ساختار فایل‌ها

```
playing-cards/
├── png/                    # تصاویر PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # تصاویر SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # داده‌های JSON برای همه کارت‌ها
├── index.html              # صفحه اصلی GitHub Pages
├── LICENSE                 # مجوز MIT
└── README.md               # این فایل
```

## 🎴 قرارداد نام‌گذاری کارت‌ها

کارت‌ها از این الگو پیروی می‌کنند:

- **کارت‌های عددی:** `{عدد}_of_{خال}.{پسوند}` (مثلاً `2_of_hearts.png`)
- **کارت‌های تصویری:** `{تصویر}_of_{خال}.{پسوند}` (مثلاً `king_of_spades.svg`)
- **آس‌ها:** `ace_of_{خال}.{پسوند}` (مثلاً `ace_of_diamonds.png`)
- **جوکرها:** `{رنگ}_joker.{پسوند}` (مثلاً `black_joker.svg`, `red_joker.png`)

### خال‌ها
- `clubs` ♣️ (گشنیز)
- `diamonds` ♦️ (خشت)
- `hearts` ♥️ (دل)
- `spades` ♠️ (پیک)

### مقادیر
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 ترجمه‌ها

این README به چندین زبان موجود است. برای زبان‌های دیگر به پوشه /readme مراجعه کنید.

## 📄 مجوز

این پروژه تحت مجوز MIT است – برای جزئیات به فایل [LICENSE](../LICENSE) مراجعه کنید.

## 🤝 مشارکت

مشارکت‌ها خوش‌آمدند! لطفاً:

1. مخزن را Fork کنید
2. شاخه ویژگی خود را ایجاد کنید (`git checkout -b feature/amazing-feature`)
3. تغییرات خود را Commit کنید (`git commit -m 'افزودن یک ویژگی عالی'`)
4. شاخه را Push کنید (`git push origin feature/amazing-feature`)
5. یک Pull Request باز کنید

## ⭐ حمایت

اگر این پروژه برای شما مفید بود، لطفاً در GitHub به آن ستاره بدهید!

---

ساخته شده با ❤️ توسط [Webisso](https://github.com/webisso)
