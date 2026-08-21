/**
 * 出牌类型识别与压制规则（服务端）
 */
const { compareSingle, sortCards } = require('./cards');

function sameRank(cards) {
  return cards.every((c) => c.rank === cards[0].rank);
}

function rankCounts(cards) {
  const m = {};
  for (const c of cards) m[c.rank] = (m[c.rank] || 0) + 1;
  return m;
}

function isStraightRanks(cards) {
  const ranks = [...new Set(cards.map((c) => c.rank))].sort((a, b) => a - b);
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
      cards,
      keyRank: cards[0].rank,
      keyCard: cards[0],
      label: '单张',
    };
  }

  if (n === 2) {
    if (cards[0].rank === cards[1].rank) {
      return {
        type: 'pair',
        cards,
        keyRank: cards[0].rank,
        keyCard: cards[1],
        label: '一对',
      };
    }
    return null;
  }

  if (n === 3) {
    if (sameRank(cards)) {
      return { type: 'triple', cards, keyRank: cards[0].rank, label: '三条' };
    }
    return null;
  }

  if (n === 4) {
    if (sameRank(cards)) {
      return { type: 'quad', cards, keyRank: cards[0].rank, label: '四条' };
    }
    return null;
  }

  if (n === 5) {
    const counts = rankCounts(cards);
    const entries = Object.keys(counts).map((r) => ({
      rank: Number(r),
      count: counts[r],
    }));

    const four = entries.find((e) => e.count === 4);
    const one = entries.find((e) => e.count === 1);
    if (four && one) {
      return { type: 'fourone', cards, keyRank: four.rank, label: '四带一' };
    }

    const three = entries.find((e) => e.count === 3);
    const two = entries.find((e) => e.count === 2);
    if (three && two) {
      return { type: 'fullhouse', cards, keyRank: three.rank, label: '三带二' };
    }

    const maxCard = cards.reduce((m, c) => (compareSingle(c, m) > 0 ? c : m));
    const sameSuit = cards.every((c) => c.suit === cards[0].suit);

    if (isStraightRanks(cards)) {
      if (sameSuit) {
        return {
          type: 'flushstraight',
          cards,
          keyRank: maxCard.rank,
          keyCard: maxCard,
          keySuit: cards[0].suit,
          label: '天子',
        };
      }
      return {
        type: 'straight',
        cards,
        keyRank: maxCard.rank,
        keyCard: maxCard,
        label: '顺子',
      };
    }

    if (sameSuit) {
      return {
        type: 'flush',
        cards,
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

  if (t === 'pair') {
    if (c !== 'pair') return false;
    if (challenger.keyRank > previous.keyRank) return true;
    if (challenger.keyRank < previous.keyRank) return false;
    return challenger.cards.some((card) => card.suit === 3);
  }

  if (t === 'triple') {
    return c === 'triple' && challenger.keyRank > previous.keyRank;
  }

  if (t === 'quad') {
    return c === 'quad' && challenger.keyRank > previous.keyRank;
  }

  if (t === 'straight') {
    if (c === 'flush' || c === 'fullhouse' || c === 'fourone' || c === 'flushstraight') {
      return true;
    }
    if (c === 'straight') {
      return compareSingle(challenger.keyCard, previous.keyCard) > 0;
    }
    return false;
  }

  if (t === 'flush') {
    if (c === 'fullhouse' || c === 'fourone' || c === 'flushstraight') return true;
    if (c === 'flush') {
      if (challenger.keySuit > previous.keySuit) return true;
      if (challenger.keySuit < previous.keySuit) return false;
      return compareSingle(challenger.keyCard, previous.keyCard) > 0;
    }
    return false;
  }

  if (t === 'fullhouse') {
    if (c === 'fourone' || c === 'flushstraight') return true;
    if (c === 'fullhouse') return challenger.keyRank > previous.keyRank;
    return false;
  }

  if (t === 'fourone') {
    if (c === 'flushstraight') return true;
    if (c === 'fourone') return challenger.keyRank > previous.keyRank;
    return false;
  }

  if (t === 'flushstraight') {
    if (c !== 'flushstraight') return false;
    return compareSingle(challenger.keyCard, previous.keyCard) > 0;
  }

  return false;
}

function validatePlay(selected, lastPlay) {
  const play = identifyPlay(selected);
  if (!play) return { ok: false, reason: '不是合法牌型' };
  if (!canBeat(play, lastPlay)) {
    return { ok: false, reason: lastPlay ? '压不过上一手牌' : '牌型无效' };
  }
  return { ok: true, play };
}

module.exports = { identifyPlay, canBeat, validatePlay };
