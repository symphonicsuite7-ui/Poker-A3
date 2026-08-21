# 🃏 أوراق اللعب

[![الترخيص: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

صور أوراق لعب مفتوحة المصدر بصيغ PNG وSVG. مجانية لأي مشروع!

🌐 **عرض مباشر:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 ماذا يتضمن

- **54 ورقة لعب** (52 ورقة عادية + 2 جوكر)
- **صيغة PNG** – صور نقطية عالية الجودة
- **صيغة SVG** – رسومات متجهية قابلة للتكبير
- **واجهة JSON** – تكامل سهل مع مشاريعك

## 🚀 بداية سريعة

### الوصول المباشر عبر الرابط

يمكنك الوصول لأي ورقة مباشرة عبر GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{اسم_البطاقة}.png
https://webisso.github.io/playing-cards/svg/{اسم_البطاقة}.svg
```

### أمثلة

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="آس السباتي">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="آس السباتي">
```

### واجهة JSON

احصل على بيانات الأوراق برمجياً:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		# 🃏 أوراق اللعب

		[![الترخيص: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
		[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

		صور أوراق لعب مفتوحة المصدر بصيغ PNG وSVG. مجانية لأي مشروع!

		🌐 **عرض مباشر:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

		## 📦 ماذا يتضمن

		- **54 ورقة لعب** (52 ورقة عادية + 2 جوكر)
		- **صيغة PNG** – صور نقطية عالية الجودة
		- **صيغة SVG** – رسومات متجهية قابلة للتكبير
		- **واجهة JSON** – تكامل سهل مع مشاريعك

		## 🚀 بداية سريعة

		### الوصول المباشر عبر الرابط

		يمكنك الوصول إلى أي ورقة مباشرة عبر GitHub Pages:

		```
		https://webisso.github.io/playing-cards/png/{اسم_البطاقة}.png
		https://webisso.github.io/playing-cards/svg/{اسم_البطاقة}.svg
		```

		### أمثلة

		```html
		<!-- PNG -->
		<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="آس السباتي">

		<!-- SVG -->
		<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="آس السباتي">
		```

		### واجهة JSON

		احصل على بيانات البطاقات برمجياً:

		```javascript
		fetch('https://webisso.github.io/playing-cards/cards.json')
			.then(response => response.json())
			.then(data => {
				console.log(data.cards.spades.ace);
			});
		```

		## 📁 هيكل الملفات

		```
		playing-cards/
		├── png/                    # صور PNG
		│   ├── ace_of_clubs.png
		│   ├── ace_of_diamonds.png
		│   ├── ace_of_hearts.png
		│   ├── ace_of_spades.png
		│   ├── 2_of_clubs.png
		│   ├── ...
		│   ├── king_of_spades.png
		│   ├── black_joker.png
		│   └── red_joker.png
		├── svg/                    # صور SVG
		│   ├── ace_of_clubs.svg
		│   ├── ...
		│   └── red_joker.svg
		├── cards.json              # بيانات JSON لجميع البطاقات
		├── index.html              # الصفحة الرئيسية لـ GitHub Pages
		├── LICENSE                 # رخصة MIT
		└── README.md               # هذا الملف
		```

		## 🎴 تسمية البطاقات

		تتبع البطاقات النمط التالي:

		- **بطاقات الأرقام:** `{رقم}_of_{رمز}.{ext}` (مثال: `2_of_hearts.png`)
		- **بطاقات الصور:** `{صورة}_of_{رمز}.{ext}` (مثال: `king_of_spades.svg`)
		- **الآس:** `ace_of_{رمز}.{ext}` (مثال: `ace_of_diamonds.png`)
		- **الجوكر:** `{لون}_joker.{ext}` (مثال: `black_joker.svg`, `red_joker.png`)

		### الرموز
		- `clubs` ♣️ (السباتي)
		- `diamonds` ♦️ (الماس)
		- `hearts` ♥️ (القلب)
		- `spades` ♠️ (البستوني)

		### القيم
		- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

		## 🌍 الترجمات

		هذا الملف README متوفر بعدة لغات. راجع المزيد في مجلد /readme.

		## 📄 الرخصة

		هذا المشروع مرخص بموجب MIT – راجع ملف [LICENSE](../LICENSE) للتفاصيل.

		## 🤝 المساهمة

		المساهمات مرحب بها! إليك الطريقة:

		1. قم بعمل fork للمستودع
		2. أنشئ فرعك (`git checkout -b feature/amazing-feature`)
		3. قم بعمل commit للتغييرات (`git commit -m 'إضافة ميزة رائعة'`)
		4. ادفع الفرع (`git push origin feature/amazing-feature`)
		5. افتح Pull Request

		## ⭐ الدعم

		إذا وجدت هذا المشروع مفيدًا، يرجى منحه نجمة على GitHub!

		---

		تم الإنشاء بواسطة ❤️ [Webisso](https://github.com/webisso)
