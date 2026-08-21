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
    return (
      '/cards/' + RANK_FILE[card.rank] + '_of_' + SUIT_FILE[card.suit] + '.svg'
    );
  }

  function cardFaceHtml(card) {
    return (
      '<img src="' +
      cardImageUrl(card) +
      '" alt="' +
      cardLabel(card) +
      '" draggable="false" />'
    );
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
    cardMarkup: cardMarkup,
    cardImageUrl: cardImageUrl,
  };
})(window);
