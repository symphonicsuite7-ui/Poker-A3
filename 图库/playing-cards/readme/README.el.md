# 🃏 Τράπουλα

[![Άδεια: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Ανοιχτού κώδικα εικόνες τράπουλας σε μορφές PNG και SVG. Δωρεάν για κάθε έργο!

🌐 **Live demo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 Τι περιλαμβάνεται

- **54 κάρτες** (52 τυπικές + 2 τζόκερ)
- **Μορφή PNG** – Υψηλής ποιότητας εικόνες
- **Μορφή SVG** – Κλιμακούμενα διανυσματικά γραφικά
- **JSON API** – Εύκολη ενσωμάτωση στα έργα σας

## 🚀 Γρήγορη εκκίνηση

### Άμεση πρόσβαση μέσω URL

Πρόσβαση σε κάθε κάρτα απευθείας μέσω GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{όνομα_κάρτας}.png
https://webisso.github.io/playing-cards/svg/{όνομα_κάρτας}.svg
```

### Παραδείγματα

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Άσσος σπαθί">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Άσσος σπαθί">
```

### JSON API

Λάβετε δεδομένα καρτών προγραμματικά:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Δομή αρχείων

```
playing-cards/
├── png/                    # Εικόνες PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Εικόνες SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # JSON δεδομένα για όλες τις κάρτες
├── index.html              # Αρχική σελίδα GitHub Pages
├── LICENSE                 # Άδεια MIT
└── README.md               # Αυτό το αρχείο
```

## 🎴 Ονοματολογία καρτών

Οι κάρτες ακολουθούν το παρακάτω μοτίβο ονοματολογίας:

- **Αριθμητικές κάρτες:** `{αριθμός}_of_{σύμβολο}.{ext}` (π.χ. `2_of_hearts.png`)
- **Φιγούρες:** `{φιγούρα}_of_{σύμβολο}.{ext}` (π.χ. `king_of_spades.svg`)
- **Άσσοι:** `ace_of_{σύμβολο}.{ext}` (π.χ. `ace_of_diamonds.png`)
- **Τζόκερ:** `{χρώμα}_joker.{ext}` (π.χ. `black_joker.svg`, `red_joker.png`)

### Σύμβολα
- `clubs` ♣️ (Σταυρός)
- `diamonds` ♦️ (Καρό)
- `hearts` ♥️ (Κούπα)
- `spades` ♠️ (Σπαθί)

### Τιμές
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Μεταφράσεις

Αυτό το README είναι διαθέσιμο σε πολλές γλώσσες. Δείτε περισσότερες στη διαδρομή /readme.

## 📄 Άδεια

Αυτό το έργο είναι υπό άδεια MIT – δείτε το αρχείο [LICENSE](../LICENSE) για λεπτομέρειες.

## 🤝 Συνεισφορά

Οι συνεισφορές είναι ευπρόσδεκτες! Ακολουθήστε τα βήματα:

1. Κάντε fork το αποθετήριο
2. Δημιουργήστε το branch σας (`git checkout -b feature/amazing-feature`)
3. Κάντε commit τις αλλαγές (`git commit -m 'Προσθήκη καταπληκτικής λειτουργίας'`)
4. Κάντε push το branch (`git push origin feature/amazing-feature`)
5. Ανοίξτε Pull Request

## ⭐ Υποστήριξη

Αν βρήκατε αυτό το έργο χρήσιμο, δώστε του ένα αστέρι στο GitHub!

---

Δημιουργήθηκε με ❤️ από τον [Webisso](https://github.com/webisso)
