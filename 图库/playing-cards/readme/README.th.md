# 🃏 ไพ่เล่น

[![สัญญาอนุญาต: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

ภาพไพ่เล่นโอเพ่นซอร์สในรูปแบบ PNG และ SVG ใช้ได้ฟรีกับทุกโปรเจกต์!

🌐 **เดโมสด:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 มีอะไรบ้าง

- **ไพ่เล่น 54 ใบ** (52 ใบมาตรฐาน + 2 โจ๊กเกอร์)
- **รูปแบบ PNG** – ภาพแรสเตอร์คุณภาพสูง
- **รูปแบบ SVG** – กราฟิกเวกเตอร์ปรับขนาดได้
- **JSON API** – ผสานรวมกับโปรเจกต์ของคุณได้ง่าย

## 🚀 เริ่มต้นอย่างรวดเร็ว

### เข้าถึง URL โดยตรง

เข้าถึงไพ่แต่ละใบได้โดยตรงผ่าน GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{ชื่อไพ่}.png
https://webisso.github.io/playing-cards/svg/{ชื่อไพ่}.svg
```

### ตัวอย่าง

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="เอซโพดำ">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="เอซโพดำ">
```

### JSON API

ดึงข้อมูลไพ่ด้วยโปรแกรม:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 โครงสร้างไฟล์

```
playing-cards/
├── png/                    # รูปภาพ PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # รูปภาพ SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # ข้อมูล JSON สำหรับไพ่ทั้งหมด
├── index.html              # หน้าแรกของ GitHub Pages
├── LICENSE                 # ใบอนุญาต MIT
└── README.md               # ไฟล์นี้
```

## 🎴 การตั้งชื่อไพ่

ไพ่แต่ละใบใช้รูปแบบการตั้งชื่อต่อไปนี้:

- **ไพ่ตัวเลข:** `{หมายเลข}_of_{ดอก}.{ext}` (เช่น `2_of_hearts.png`)
- **ไพ่หน้าคน:** `{หน้า}_of_{ดอก}.{ext}` (เช่น `king_of_spades.svg`)
- **เอซ:** `ace_of_{ดอก}.{ext}` (เช่น `ace_of_diamonds.png`)
- **โจ๊กเกอร์:** `{สี}_joker.{ext}` (เช่น `black_joker.svg`, `red_joker.png`)

### ดอกไพ่
- `clubs` ♣️ (ดอกจิก)
- `diamonds` ♦️ (ข้าวหลามตัด)
- `hearts` ♥️ (โพแดง)
- `spades` ♠️ (โพดำ)

### ค่าไพ่
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 การแปลภาษา

README นี้มีให้ในหลายภาษา ดูเพิ่มเติมในโฟลเดอร์ /readme

## 📄 ใบอนุญาต

โปรเจกต์นี้อยู่ภายใต้ใบอนุญาต MIT – ดูรายละเอียดในไฟล์ [LICENSE](../LICENSE)

## 🤝 การมีส่วนร่วม

ยินดีต้อนรับการมีส่วนร่วม! ทำตามนี้:

1. Fork repository
2. สร้าง branch ของคุณ (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'เพิ่มฟีเจอร์เจ๋ง ๆ'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

## ⭐ สนับสนุน

หากคุณพบว่าโปรเจกต์นี้มีประโยชน์ กรุณาให้ดาวบน GitHub!

---

สร้างด้วย ❤️ โดย [Webisso](https://github.com/webisso)
