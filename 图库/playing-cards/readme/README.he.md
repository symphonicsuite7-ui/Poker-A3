# 🃏 קלפי משחק

[![רישיון: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

תמונות קלפי משחק בקוד פתוח בפורמטים PNG ו-SVG. חופשי לשימוש בכל פרויקט!

🌐 **הדגמה חיה:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 מה כלול

- **54 קלפים** (52 קלפים רגילים + 2 ג'וקרים)
- **פורמט PNG** – תמונות רסטר באיכות גבוהה
- **פורמט SVG** – גרפיקה וקטורית הניתנת להגדלה
- **JSON API** – אינטגרציה קלה לפרויקטים שלך

## 🚀 התחלה מהירה

### גישה ישירה ל-URL

גישה לכל קלף ישירות דרך GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{שם_הקלף}.png
https://webisso.github.io/playing-cards/svg/{שם_הקלף}.svg
```

### דוגמאות

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="אס עלה">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="אס עלה">
```

### JSON API

קבל נתוני קלפים בתכנות:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 מבנה קבצים

```
playing-cards/
├── png/                    # תמונות PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # תמונות SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # נתוני JSON לכל הקלפים
├── index.html              # דף הבית של GitHub Pages
├── LICENSE                 # רישיון MIT
└── README.md               # קובץ זה
```

## 🎴 מוסכמות שמות קלפים

הקלפים עוקבים אחרי התבנית הבאה:

- **קלפים מספריים:** `{מספר}_of_{סמל}.{ext}` (לדוג' `2_of_hearts.png`)
- **קלפי תמונה:** `{דמות}_of_{סמל}.{ext}` (לדוג' `king_of_spades.svg`)
- **אס:** `ace_of_{סמל}.{ext}` (לדוג' `ace_of_diamonds.png`)
- **ג'וקר:** `{צבע}_joker.{ext}` (לדוג' `black_joker.svg`, `red_joker.png`)

### סמלים
- `clubs` ♣️ (תלתן)
- `diamonds` ♦️ (יהלום)
- `hearts` ♥️ (לב)
- `spades` ♠️ (עלה)

### ערכים
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 תרגומים

README זה זמין במספר שפות. ראה עוד בתיקיית /readme.

## 📄 רישיון

הפרויקט הזה ברישיון MIT – ראה את קובץ [LICENSE](../LICENSE) לפרטים.

## 🤝 תרומה

תרומות יתקבלו בברכה! כך תוכל:

1. עשה fork למאגר
2. צור את ה-branch שלך (`git checkout -b feature/amazing-feature`)
3. בצע commit לשינויים (`git commit -m 'הוסף תכונה מדהימה'`)
4. בצע push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## ⭐ תמיכה

אם מצאת את הפרויקט הזה מועיל, תן לו כוכב ב-GitHub!

---

נוצר באהבה על ידי [Webisso](https://github.com/webisso)
