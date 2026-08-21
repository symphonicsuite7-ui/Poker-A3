🃏 Carte da Gioco

[![Licenza: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Immagini di carte da gioco open source in formato PNG e SVG. Gratis per qualsiasi progetto!

🌐 **Demo dal vivo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Cosa è incluso

- **54 carte da gioco** (52 carte standard + 2 jolly)
- **Formato PNG** – Immagini raster di alta qualità
- **Formato SVG** – Grafica vettoriale scalabile
- **API JSON** – Facile integrazione nei tuoi progetti

## 🚀 Inizio rapido

### Accesso diretto tramite URL

Accedi a qualsiasi carta direttamente tramite GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nome_carta}.png
https://webisso.github.io/playing-cards/svg/{nome_carta}.svg
```

### Esempi

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Asso di Picche">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Asso di Picche">
```

### API JSON

Recupera i dati delle carte in modo programmatico:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Struttura dei file

```
playing-cards/
├── png/                    # Immagini PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Immagini SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Dati JSON per tutte le carte
├── index.html              # Pagina principale di GitHub Pages
├── LICENSE                 # Licenza MIT
└── README.md               # Questo file
```

## 🎴 Convenzione di denominazione delle carte

Le carte seguono questo schema di denominazione:

- **Carte numeriche:** `{numero}_of_{seme}.{ext}` (es. `2_of_hearts.png`)
- **Carte di figura:** `{figura}_of_{seme}.{ext}` (es. `king_of_spades.svg`)
- **Assi:** `ace_of_{seme}.{ext}` (es. `ace_of_diamonds.png`)
- **Jolly:** `{colore}_joker.{ext}` (es. `black_joker.svg`, `red_joker.png`)

### Semi
- `clubs` ♣️ (Fiori)
- `diamonds` ♦️ (Quadri)
- `hearts` ♥️ (Cuori)
- `spades` ♠️ (Picche)

### Valori
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Traduzioni

Questo README è disponibile in più lingue. Vedi la cartella /readme per altre lingue.

## 📄 Licenza

Questo progetto è concesso in licenza MIT – vedi il file [LICENSE](../LICENSE) per i dettagli.

## 🤝 Contribuire

I contributi sono benvenuti! Sentiti libero di:

1. Forkare il repository
2. Creare il tuo branch di funzionalità (`git checkout -b feature/funzionalita-fantastica`)
3. Committare le modifiche (`git commit -m 'Aggiungi una funzionalità fantastica'`)
4. Pushare il branch (`git push origin feature/funzionalita-fantastica`)
5. Aprire una Pull Request

## ⭐ Supporto

Se trovi utile questo progetto, considera di lasciargli una stella su GitHub!

---

Creato con ❤️ da [Webisso](https://github.com/webisso)
