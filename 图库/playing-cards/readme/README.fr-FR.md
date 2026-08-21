🃏 Cartes à jouer

[![Licence : MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Images de cartes à jouer open source aux formats PNG et SVG. Utilisation gratuite pour tout projet !

🌐 **Démo en ligne :** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Contenu

- **54 cartes à jouer** (52 cartes standard + 2 jokers)
- **Format PNG** – Images raster de haute qualité
- **Format SVG** – Graphiques vectoriels évolutifs
- **API JSON** – Intégration facile à vos projets

## 🚀 Démarrage rapide

### Accès direct par URL

Accédez à n'importe quelle carte directement via GitHub Pages :

```
https://webisso.github.io/playing-cards/png/{nom_de_carte}.png
https://webisso.github.io/playing-cards/svg/{nom_de_carte}.svg
```

### Exemples

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="As de Pique">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="As de Pique">
```

### API JSON

Récupérez les données des cartes par programmation :

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Structure des fichiers

```
playing-cards/
├── png/                    # Images PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Images SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Données JSON pour toutes les cartes
├── index.html              # Page d'accueil GitHub Pages
├── LICENSE                 # Licence MIT
└── README.md               # Ce fichier
```

## 🎴 Convention de nommage des cartes

Les cartes suivent ce modèle de nommage :

- **Cartes numérotées :** `{nombre}_of_{couleur}.{ext}` (ex. `2_of_hearts.png`)
- **Figures :** `{figure}_of_{couleur}.{ext}` (ex. `king_of_spades.svg`)
- **As :** `ace_of_{couleur}.{ext}` (ex. `ace_of_diamonds.png`)
- **Jokers :** `{couleur}_joker.{ext}` (ex. `black_joker.svg`, `red_joker.png`)

### Couleurs
- `clubs` ♣️ (Trèfle)
- `diamonds` ♦️ (Carreau)
- `hearts` ♥️ (Cœur)
- `spades` ♠️ (Pique)

### Valeurs
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Traductions

Ce README est disponible en plusieurs langues. Voir le dossier /readme pour les autres langues.

## 📄 Licence

Ce projet est sous licence MIT – voir le fichier [LICENSE](../LICENSE) pour plus de détails.

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Forker le dépôt
2. Créer votre branche de fonctionnalité (`git checkout -b feature/fonction-geniale`)
3. Commiter vos modifications (`git commit -m 'Ajouter une fonctionnalité géniale'`)
4. Pousser la branche (`git push origin feature/fonction-geniale`)
5. Ouvrir une Pull Request

## ⭐ Soutien

Si vous trouvez ce projet utile, merci de lui donner une étoile sur GitHub !

---

Fait avec ❤️ par [Webisso](https://github.com/webisso)
