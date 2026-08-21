# 🃏 Bộ bài

[![Giấy phép: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Hình ảnh bộ bài mã nguồn mở ở định dạng PNG và SVG. Miễn phí cho mọi dự án!

🌐 **Demo trực tiếp:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Bao gồm những gì

- **54 lá bài** (52 lá tiêu chuẩn + 2 lá joker)
- **Định dạng PNG** – Ảnh raster chất lượng cao
- **Định dạng SVG** – Đồ họa vector có thể mở rộng
- **JSON API** – Dễ dàng tích hợp vào dự án của bạn

## 🚀 Bắt đầu nhanh

### Truy cập URL trực tiếp

Truy cập từng lá bài trực tiếp qua GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{ten_la_bai}.png
https://webisso.github.io/playing-cards/svg/{ten_la_bai}.svg
```

### Ví dụ

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Át bích">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Át bích">
```

### JSON API

Lấy dữ liệu lá bài bằng lập trình:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Cấu trúc thư mục

```
playing-cards/
├── png/                    # Ảnh PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Ảnh SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Dữ liệu JSON cho tất cả các lá bài
├── index.html              # Trang chủ GitHub Pages
├── LICENSE                 # Giấy phép MIT
└── README.md               # Tệp này
```

## 🎴 Quy ước đặt tên lá bài

Các lá bài tuân theo mẫu đặt tên sau:

- **Lá số:** `{số}_of_{chất}.{ext}` (vd. `2_of_hearts.png`)
- **Lá hình:** `{hình}_of_{chất}.{ext}` (vd. `king_of_spades.svg`)
- **Át:** `ace_of_{chất}.{ext}` (vd. `ace_of_diamonds.png`)
- **Joker:** `{màu}_joker.{ext}` (vd. `black_joker.svg`, `red_joker.png`)

### Chất
- `clubs` ♣️ (Chuồn)
- `diamonds` ♦️ (Rô)
- `hearts` ♥️ (Cơ)
- `spades` ♠️ (Bích)

### Giá trị
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Dịch thuật

README này có sẵn bằng nhiều ngôn ngữ. Xem thêm trong thư mục /readme.

## 📄 Giấy phép

Dự án này được cấp phép theo MIT – xem tệp [LICENSE](../LICENSE) để biết chi tiết.

## 🤝 Đóng góp

Đóng góp được hoan nghênh! Cách thực hiện:

1. Fork kho lưu trữ
2. Tạo branch của bạn (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng tuyệt vời'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## ⭐ Hỗ trợ

Nếu bạn thấy dự án này hữu ích, hãy cho nó một sao trên GitHub!

---

Tạo bởi ❤️ [Webisso](https://github.com/webisso)
