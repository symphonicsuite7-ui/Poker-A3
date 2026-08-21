/**
 * 出牌类型识别与压制规则
 */
(function (global) {
  const compareSingle = global.PokerCards.compareSingle;
  const sortCards = global.PokerCards.sortCards;

  function sameRank(cards) {
    return cards.every(function (c) {
      return c.rank === cards[0].rank;
    });
  }

  function rankCounts(cards) {
    const m = {};
    for (let i = 0; i < cards.length; i++) {
      const r = cards[i].rank;
      m[r] = (m[r] || 0) + 1;
    }
    return m;
  }

  /** 五张点数相邻（按本游戏点数顺序，不绕圈） */
  function isStraightRanks(cards) {
    const set = {};
    for (let i = 0; i < cards.length; i++) set[cards[i].rank] = true;
    const ranks = Object.keys(set)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    if (ranks.length !== 5) return false;
    for (let i = 1; i < 5; i++) {
      if (ranks[i] !== ranks[i - 1] + 1) return false;
    }
    return true;
  }

  function identifyPlay(raw) {
    if (!raw || raw.length === 0) return null;
    const cards = sortCards(raw);
    const n = cards.length;

    if (n === 1) {
      return {
        type: 'single',
        cards: cards,
        keyRank: cards[0].rank,
        keyCard: cards[0],
        label: '单张',
      };
    }

    if (n === 2) {
      if (cards[0].rank === cards[1].rank) {
        return {
          type: 'pair',
          cards: cards,
          keyRank: cards[0].rank,
          keyCard: cards[1],
          label: '一对',
        };
      }
      return null;
    }

    if (n === 3) {
      if (sameRank(cards)) {
        return {
          type: 'triple',
          cards: cards,
          keyRank: cards[0].rank,
          label: '三条',
        };
      }
      return null;
    }

    if (n === 4) {
      if (sameRank(cards)) {
        return {
          type: 'quad',
          cards: cards,
          keyRank: cards[0].rank,
          label: '四条',
        };
      }
      return null;
    }

    if (n === 5) {
      const counts = rankCounts(cards);
      const entries = Object.keys(counts).map(function (r) {
        return { rank: Number(r), count: counts[r] };
      });

      const four = entries.find(function (e) {
        return e.count === 4;
      });
      const one = entries.find(function (e) {
        return e.count === 1;
      });
      if (four && one) {
        return {
          type: 'fourone',
          cards: cards,
          keyRank: four.rank,
          label: '四带一',
        };
      }

      const three = entries.find(function (e) {
        return e.count === 3;
      });
      const two = entries.find(function (e) {
        return e.count === 2;
      });
      if (three && two) {
        return {
          type: 'fullhouse',
          cards: cards,
          keyRank: three.rank,
          label: '三带二',
        };
      }

      const maxCard = cards.reduce(function (m, c) {
        return compareSingle(c, m) > 0 ? c : m;
      });
      const sameSuit = cards.every(function (c) {
        return c.suit === cards[0].suit;
      });

      // 顺子 / 天子（同花顺优先于普通同花）
      if (isStraightRanks(cards)) {
        if (sameSuit) {
          return {
            type: 'flushstraight',
            cards: cards,
            keyRank: maxCard.rank,
            keyCard: maxCard,
            keySuit: cards[0].suit,
            label: '天子',
          };
        }
        return {
          type: 'straight',
          cards: cards,
          keyRank: maxCard.rank,
          keyCard: maxCard,
          label: '顺子',
        };
      }

      // 同花：五张相同花色（非顺子）
      if (sameSuit) {
        return {
          type: 'flush',
          cards: cards,
          keyRank: maxCard.rank,
          keyCard: maxCard,
          keySuit: cards[0].suit,
          label: '同花',
        };
      }
    }

    return null;
  }

  function canBeat(challenger, previous) {
    if (!challenger) return false;
    if (!previous) return true;

    const t = previous.type;
    const c = challenger.type;

    if (t === 'single') {
      if (c !== 'single') return false;
      return compareSingle(challenger.cards[0], previous.cards[0]) > 0;
    }

    // 一对：同点数须含葵扇；或更大点数任意一对
    if (t === 'pair') {
      if (c !== 'pair') return false;
      if (challenger.keyRank > previous.keyRank) return true;
      if (challenger.keyRank < previous.keyRank) return false;
      return challenger.cards.some(function (card) {
        return card.suit === 3;
      });
    }

    if (t === 'triple') {
      return c === 'triple' && challenger.keyRank > previous.keyRank;
    }

    if (t === 'quad') {
      return c === 'quad' && challenger.keyRank > previous.keyRank;
    }

    // 顺子：更大顺子 / 任意同花 / 任意三带二 / 任意四带一 / 任意天子
    if (t === 'straight') {
      if (
        c === 'flush' ||
        c === 'fullhouse' ||
        c === 'fourone' ||
        c === 'flushstraight'
      ) {
        return true;
      }
      if (c === 'straight') {
        return compareSingle(challenger.keyCard, previous.keyCard) > 0;
      }
      return false;
    }

    // 同花：同花色比最大牌；花色更大；任意三带二 / 四带一 / 天子
    if (t === 'flush') {
      if (c === 'fullhouse' || c === 'fourone' || c === 'flushstraight') return true;
      if (c === 'flush') {
        if (challenger.keySuit > previous.keySuit) return true;
        if (challenger.keySuit < previous.keySuit) return false;
        return compareSingle(challenger.keyCard, previous.keyCard) > 0;
      }
      return false;
    }

    // 三带二：三更大 / 任意四带一 / 任意天子
    if (t === 'fullhouse') {
      if (c === 'fourone' || c === 'flushstraight') return true;
      if (c === 'fullhouse') return challenger.keyRank > previous.keyRank;
      return false;
    }

    // 四带一：四更大 / 任意天子
    if (t === 'fourone') {
      if (c === 'flushstraight') return true;
      if (c === 'fourone') return challenger.keyRank > previous.keyRank;
      return false;
    }

    // 天子：只能更大天子
    if (t === 'flushstraight') {
      if (c !== 'flushstraight') return false;
      return compareSingle(challenger.keyCard, previous.keyCard) > 0;
    }

    return false;
  }

  function validatePlay(selected, lastPlay) {
    const play = identifyPlay(selected);
    if (!play) {
      return { ok: false, reason: '不是合法牌型' };
    }
    if (!canBeat(play, lastPlay)) {
      return {
        ok: false,
        reason: lastPlay ? '压不过上一手牌' : '牌型无效',
      };
    }
    return { ok: true, play: play };
  }

  global.PokerRules = {
    identifyPlay: identifyPlay,
    canBeat: canBeat,
    validatePlay: validatePlay,
  };
})(window);
