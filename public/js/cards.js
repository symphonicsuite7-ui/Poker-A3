/**
 * 扑克牌定义与比较
 * 花色：方片 < 梅花 < 红桃 < 葵扇
 * 点数：4 < 5 < … < 10 < J < Q < K < A < 2 < 3
 */
(function (global) {
  const SUITS = [
    { id: 0, name: '方片', symbol: '♦', color: 'red' },
    { id: 1, name: '梅花', symbol: '♣', color: 'black' },
    { id: 2, name: '红桃', symbol: '♥', color: 'red' },
    { id: 3, name: '葵扇', symbol: '♠', color: 'black' },
  ];

  const RANKS = [
    { id: 0, name: '4' },
    { id: 1, name: '5' },
    { id: 2, name: '6' },
    { id: 3, name: '7' },
    { id: 4, name: '8' },
    { id: 5, name: '9' },
    { id: 6, name: '10' },
    { id: 7, name: 'J' },
    { id: 8, name: 'Q' },
    { id: 9, name: 'K' },
    { id: 10, name: 'A' },
    { id: 11, name: '2' },
    { id: 12, name: '3' },
  ];

  function createDeck() {
    const deck = [];
    for (let suit = 0; suit < 4; suit++) {
      for (let rank = 0; rank < 13; rank++) {
        deck.push({ id: suit + '-' + rank, suit: suit, rank: rank });
      }
    }
    return deck;
  }

  function shuffle(deck) {
    const arr = deck.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function compareSingle(a, b) {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.suit - b.suit;
  }

  function sortCards(cards) {
    return cards.slice().sort(compareSingle);
  }

  function cardLabel(card) {
    return SUITS[card.suit].name + RANKS[card.rank].name;
  }

  function isSpade3(card) {
    return card.suit === 3 && card.rank === 12;
  }

  function isSpadeA(card) {
    return card.suit === 3 && card.rank === 10;
  }

  function isDiamond4(card) {
    return card.suit === 0 && card.rank === 0;
  }

  // 图库文件名：花色 diamonds/clubs/hearts/spades，点数 2-10 / jack / queen / king / ace
  // 全部点数统一用 SVG（含 J/Q/K，避免大体积 PNG）
  const SUIT_FILE = ['diamonds', 'clubs', 'hearts', 'spades'];
  const RANK_FILE = [
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'jack',
    'queen',
    'king',
    'ace',
    '2',
    '3',
  ];

  function cardImageUrl(card) {
    const rankName = RANK_FILE[card.rank];
    return '/cards/' + rankName + '_of_' + SUIT_FILE[card.suit] + '.svg';
  }

  // 卡背 SVG（内联 data URI，不请求 back.png / back.svg 文件）
  const CARD_BACK_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">' +
    '<defs>' +
    '<linearGradient id="bg" x2="0" y2="1"><stop stop-color="#101d38"/><stop offset="1" stop-color="#030712"/></linearGradient>' +
    '<linearGradient id="gold"><stop stop-color="#ffe29a"/><stop offset="1" stop-color="#9b6518"/></linearGradient>' +
    '</defs>' +
    '<rect width="300" height="450" rx="12" fill="url(#bg)"/>' +
    '<rect x="12" y="12" width="276" height="426" rx="10" fill="none" stroke="url(#gold)" stroke-width="4"/>' +
    '<rect x="25" y="25" width="250" height="400" rx="6" fill="none" stroke="#76501c" stroke-width="1"/>' +
    '<circle cx="150" cy="225" r="90" fill="none" stroke="#b98732" stroke-width="2"/>' +
    '<circle cx="150" cy="225" r="65" fill="none" stroke="#24496b" stroke-width="2"/>' +
    '<path d="M150 125 L165 210 L240 225 L165 240 L150 325 L135 240 L60 225 L135 210 Z" fill="#c79635" opacity="0.85"/>' +
    '<path d="M150 150 L162 225 L150 300 L138 225 Z" fill="#e8e4d0" stroke="#b88632" stroke-width="2"/>' +
    '<rect x="143" y="215" width="14" height="55" rx="4" fill="#123d70" stroke="#d9aa48" stroke-width="3"/>' +
    '<path d="M110 220 Q150 245 190 220 L178 238 Q150 250 122 238 Z" fill="url(#gold)"/>' +
    '<circle cx="150" cy="220" r="8" fill="#36a9ff" stroke="#ffe39a" stroke-width="2"/>' +
    '<g fill="#d7ad55"><circle cx="150" cy="105" r="3"/><circle cx="150" cy="345" r="3"/></g>' +
    '</svg>';

  const CARD_BACK_SRC =
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(CARD_BACK_SVG);

  function cardFaceHtml(card) {
    return (
      '<img src="' +
      cardImageUrl(card) +
      '" alt="' +
      cardLabel(card) +
      '" draggable="false" />'
    );
  }

  function cardBackHtml() {
    return '<img src="' + CARD_BACK_SRC + '" alt="back" draggable="false" />';
  }

  function cardMarkup(card, extraClass) {
    const suit = SUITS[card.suit];
    const cls = ['card'];
    if (extraClass) cls.push(extraClass);
    return (
      '<span class="' +
      cls.join(' ') +
      '" title="' +
      suit.name +
      RANKS[card.rank].name +
      '">' +
      cardFaceHtml(card) +
      '</span>'
    );
  }

  global.PokerCards = {
    SUITS: SUITS,
    RANKS: RANKS,
    createDeck: createDeck,
    shuffle: shuffle,
    compareSingle: compareSingle,
    sortCards: sortCards,
    cardLabel: cardLabel,
    isSpade3: isSpade3,
    isSpadeA: isSpadeA,
    isDiamond4: isDiamond4,
    cardFaceHtml: cardFaceHtml,
    cardBackHtml: cardBackHtml,
    cardMarkup: cardMarkup,
    cardImageUrl: cardImageUrl,
  };
})(window);
