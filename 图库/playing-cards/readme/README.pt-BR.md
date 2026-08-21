🃏 Cartas de Baralho

[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://webisso.github.io/playing-cards/)

Imagens de cartas de baralho open source nos formatos PNG e SVG. Gratuito para qualquer projeto!

🌐 **Demo ao vivo:** [https://webisso.github.io/playing-cards/](https://webisso.github.io/playing-cards/)

## 📦 O que está incluído

- **54 cartas de baralho** (52 cartas padrão + 2 curingas)
- **Formato PNG** – Imagens raster de alta qualidade
- **Formato SVG** – Gráficos vetoriais escaláveis
- **API JSON** – Fácil integração com seus projetos

## 🚀 Início rápido

### Acesso direto por URL

Acesse qualquer carta diretamente pelo GitHub Pages:

```
https://webisso.github.io/playing-cards/png/{nome_carta}.png
https://webisso.github.io/playing-cards/svg/{nome_carta}.svg
```

### Exemplos

```html
<!-- PNG -->
<img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Ás de Espadas">

<!-- SVG -->
<img src="https://webisso.github.io/playing-cards/svg/ace_of_spades.svg" alt="Ás de Espadas">
```

### API JSON

Busque os dados das cartas programaticamente:

```javascript
fetch('https://webisso.github.io/playing-cards/cards.json')
	.then(response => response.json())
	.then(data => {
		console.log(data.cards.spades.ace);
	});
```

## 📁 Estrutura de arquivos

```
playing-cards/
├── png/                    # Imagens PNG
│   ├── ace_of_clubs.png
│   ├── ace_of_diamonds.png
│   ├── ace_of_hearts.png
│   ├── ace_of_spades.png
│   ├── 2_of_clubs.png
│   ├── ...
│   ├── king_of_spades.png
│   ├── black_joker.png
│   └── red_joker.png
├── svg/                    # Imagens SVG
│   ├── ace_of_clubs.svg
│   ├── ...
│   └── red_joker.svg
├── cards.json              # Dados JSON para todas as cartas
├── index.html              # Página inicial do GitHub Pages
├── LICENSE                 # Licença MIT
└── README.md               # Este arquivo
```

## 🎴 Convenção de nomes das cartas

As cartas seguem este padrão de nomenclatura:

- **Cartas numéricas:** `{número}_of_{naipe}.{ext}` (ex. `2_of_hearts.png`)
- **Cartas de figura:** `{figura}_of_{naipe}.{ext}` (ex. `king_of_spades.svg`)
- **Ases:** `ace_of_{naipe}.{ext}` (ex. `ace_of_diamonds.png`)
- **Curingas:** `{cor}_joker.{ext}` (ex. `black_joker.svg`, `red_joker.png`)

### Naipes
- `clubs` ♣️ (Paus)
- `diamonds` ♦️ (Ouros)
- `hearts` ♥️ (Copas)
- `spades` ♠️ (Espadas)

### Valores
- `ace`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `jack`, `queen`, `king`

## 🌍 Traduções

Este README está disponível em vários idiomas. Veja a pasta /readme para outros idiomas.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT – veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do repositório
2. Criar seu branch de funcionalidade (`git checkout -b feature/funcionalidade-incrivel`)
3. Comitar suas alterações (`git commit -m 'Adicionar uma funcionalidade incrível'`)
4. Enviar o branch (`git push origin feature/funcionalidade-incrivel`)
5. Abrir um Pull Request

## ⭐ Apoio

Se você achou este projeto útil, considere dar uma estrela no GitHub!

---

Feito com ❤️ por [Webisso](https://github.com/webisso)
