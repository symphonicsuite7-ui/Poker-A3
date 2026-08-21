# 🃏 트럼프 카드

[![라이선스: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

오픈 소스 트럼프 카드 이미지 (PNG 및 SVG 형식). 모든 프로젝트에 무료로 사용 가능!

🌐 **라이브 데모:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 포함 내용

- **54장의 트럼프 카드** (52장의 일반 카드 + 2장의 조커)
- **PNG 형식** – 고화질 래스터 이미지
- **SVG 형식** – 확장 가능한 벡터 그래픽
- **JSON API** – 프로젝트에 쉽게 통합

## 🚀 빠른 시작

### 직접 URL 접근

GitHub Pages를 통해 원하는 카드를 직접 접근할 수 있습니다:

```
https://webisso.github.io/playing-cards/png/{카드이름}.png
https://webisso.github.io/playing-cards/svg/{카드이름}.svg
```

### 예시

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="스페이드 에이스">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="스페이드 에이스">
```

### JSON API

카드 데이터를 프로그래밍 방식으로 가져오기:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 파일 구조

```
playing-cards/
├── png/                    # PNG 이미지
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG 이미지
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # 모든 카드의 JSON 데이터
├── index.html              # GitHub Pages 메인 페이지
├── LICENSE                 # MIT 라이선스
└── README.md               # 이 파일
```

## 🎴 카드 명명 규칙

카드는 다음 명명 규칙을 따릅니다:

- **숫자 카드:** `{숫자}_of_{무늬}.{확장자}` (예: `2_of_hearts.png`)
- **그림 카드:** `{그림}_of_{무늬}.{확장자}` (예: `king_of_spades.svg`)
- **에이스:** `ace_of_{무늬}.{확장자}` (예: `ace_of_diamonds.png`)
- **조커:** `{색상}_joker.{확장자}` (예: `black_joker.svg`, `red_joker.png`)

### 무늬
- `clubs` ♣️ (클럽)
- `diamonds` ♦️ (다이아몬드)
- `hearts` ♥️ (하트)
- `spades` ♠️ (스페이드)

### 값
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 번역

이 README는 여러 언어로 제공됩니다. 다른 언어는 /readme 폴더를 참조하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스로 제공됩니다. 자세한 내용은 [LICENSE](../LICENSE) 파일을 참조하세요.

## 🤝 기여

기여는 언제나 환영합니다! 다음 절차를 따라주세요:

1. 저장소를 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m '멋진 기능 추가'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## ⭐ 지원

이 프로젝트가 유용하다면 GitHub에서 별을 남겨주세요!

---

[Webisso](https://github.com/webisso) 가 ❤️ 으로 만듦
