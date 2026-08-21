🃏 Cartas de Juego

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

Accede a cualquier carta directamente a través de GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nombre_carta}.png
https://webisso.github.io/playing-cards/svg/{nombre_carta}.svg
```

### Ejemplos

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As de Picas">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As de Picas">
```

### API JSON

Obtén los datos de las cartas programáticamente:

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
├── cards.json              # Datos JSON para todas las cartas
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
- `spades` ♠️ (Picas)

### Rangos
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Traducciones

Este README está disponible en varios idiomas. Consulta la carpeta /readme para otros idiomas.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT – consulta el archivo [LICENSE](../LICENSE) para más detalles.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! No dudes en:

1. Bifurcar el repositorio
2. Crear tu rama de funcionalidad (`git checkout -b feature/funcion-genial`)
3. Confirmar tus cambios (`git commit -m 'Agregar una función genial'`)
4. Subir la rama (`git push origin feature/funcion-genial`)
5. Abrir un Pull Request

## ⭐ Apoyo

Si encuentras útil este proyecto, ¡considera darle una estrella en GitHub!

---

Hecho con ❤️ por [Webisso](https://github.com/webisso)
