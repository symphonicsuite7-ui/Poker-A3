# 🃏 Cartas de Juego (Español México)

[![Licencia: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Imágenes de cartas de juego de código abierto en formatos PNG y SVG. ¡Gratis para cualquier proyecto!

🌐 **Demo en vivo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Qué incluye

- **54 cartas de juego** (52 cartas estándar + 2 comodines)
- **Formato PNG** – Imágenes ráster de alta calidad
- **Formato SVG** – Gráficos vectoriales escalables
- **API JSON** – Integración sencilla con tus proyectos

## 🚀 Comenzar rápido

### Acceso directo por URL

Accede a cualquier carta directamente desde GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nombre_carta}.png
https://webisso.github.io/playing-cards/svg/{nombre_carta}.svg
```

### Ejemplos

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As de espadas">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As de espadas">
```

### API JSON

Obtén datos de cartas programáticamente:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Estructura de archivos

```
playing-cards/
├── png/                    # Imágenes PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Imágenes SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Datos JSON de todas las cartas
├── index.html              # Página principal de GitHub Pages
├── LICENSE                 # Licencia MIT
└── README.md               # Este archivo
```

## 🎴 Convención de nombres de cartas

Las cartas siguen este patrón de nombres:

- **Cartas numéricas:** `{número}_of_{palo}.{ext}` (ej. `2_of_hearts.png`)
- **Cartas de figura:** `{figura}_of_{palo}.{ext}` (ej. `king_of_spades.svg`)
- **Ases:** `ace_of_{palo}.{ext}` (ej. `ace_of_diamonds.png`)
- **Comodines:** `{color}_joker.{ext}` (ej. `black_joker.svg`, `red_joker.png`)

### Palos
- `clubs` ♣️ (Tréboles)
- `diamonds` ♦️ (Diamantes)
- `hearts` ♥️ (Corazones)
- `spades` ♠️ (Espadas)

### Valores
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Traducciones

Este README está disponible en varios idiomas. Consulta más en la carpeta /readme.

## 📄 Licencia

Este proyecto está licenciado bajo MIT – consulta el archivo [LICENSE](../LICENSE) para más detalles.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Así es como puedes hacerlo:

1. Haz un fork del repositorio
2. Crea tu rama (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Agregar función asombrosa'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## ⭐ Apoyo

Si este proyecto te resulta útil, ¡dale una estrella en GitHub!

---

Creado con ❤️ por [Webisso](https://github.com/webisso)
