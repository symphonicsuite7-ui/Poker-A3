# 🃏 扑克牌

[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

开源扑克牌图片，提供 PNG 和 SVG 格式。可免费用于任何项目！

🌐 **在线演示：** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 包含内容

- **54 张扑克牌**（52 张标准牌 + 2 张鬼牌）
- **PNG 格式** - 高质量光栅图片
- **SVG 格式** - 可缩放矢量图形
- **JSON API** - 便于集成到您的项目中

## 🚀 快速开始

### 直接 URL 访问

可通过 GitHub Pages 直接访问任意牌：

```
https://webisso.github.io/playing-cards/png/{牌名}.png
https://webisso.github.io/playing-cards/svg/{牌名}.svg
```

### 示例

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="黑桃A">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="黑桃A">
```

### JSON API

以编程方式获取牌数据：

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 文件结构

```
playing-cards/
├── png/                    # PNG 图片
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # SVG 图片
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # 所有牌的 JSON 数据
├── index.html              # GitHub Pages 主页
├── LICENSE                 # MIT 许可证
└── README.md               # 本文件
```

## 🎴 牌命名规范

牌名遵循以下模式：

- **数字牌：** `{数字}_of_{花色}.{扩展名}`（如 `2_of_hearts.png`）
- **人头牌：** `{人头}_of_{花色}.{扩展名}`（如 `king_of_spades.svg`）
- **A：** `ace_of_{花色}.{扩展名}`（如 `ace_of_diamonds.png`）
- **鬼牌：** `{颜色}_joker.{扩展名}`（如 `black_joker.svg`, `red_joker.png`）

### 花色
- `clubs` ♣️（梅花）
- `diamonds` ♦️（方块）
- `hearts` ♥️（红桃）
- `spades` ♠️（黑桃）

### 点数
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 多语言

本 README 提供多种语言版本。其他语言请参见 /readme 文件夹。

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参见 [LICENSE](../LICENSE) 文件。

## 🤝 贡献

欢迎贡献！请按照以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/awesome-feature`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送分支 (`git push origin feature/awesome-feature`)
5. 提交 Pull Request

## ⭐ 支持

如果你觉得本项目有用，请在 GitHub 上点个星！

---

由 [Webisso](https://github.com/webisso) ❤️ 制作
