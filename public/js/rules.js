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

  /**
   * 五张是否在点数环上连续：4→5→…→K→A→2→3→4。
   * 返回顺子起点 rank（环上第一张），非法则 null。
   */
  function straightStartRank(cards) {
    const set = {};
    for (let i = 0; i < cards.length; i++) set[cards[i].rank] = true;
    const uniq = Object.keys(set);
    if (uniq.length !== 5) return null;
    for (let start = 0; start < 13; start++) {
      let ok = true;
      for (let i = 0; i < 5; i++) {
        if (!set[(start + i) % 13]) {
          ok = false;
          break;
        }
      }
      if (ok) return start;
    }
    return null;
  }

  function isStraightRanks(cards) {
    return straightStartRank(cards) != null;
  }

  /**
   * 顺子/天子比大小键牌：沿环走满 5 张后的末张。
   * 跨过 3→4（同时含 3 与 4）时不用 3，例如 A2345 看 5、KA234 看 4。
   */
  function straightKeyCard(cards) {
    const start = straightStartRank(cards);
    if (start == null) return null;
    const endRank = (start + 4) % 13;
    let key = null;
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (c.rank !== endRank) continue;
      if (!key || compareSingle(c, key) > 0) key = c;
    }
    return key;
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

      // 顺子 / 天子（同花顺优先于普通同花；绕圈顺仍判天子而非同花）
      if (isStraightRanks(cards)) {
        const keyCard = straightKeyCard(cards) || maxCard;
        if (sameSuit) {
          return {
            type: 'flushstraight',
            cards: cards,
            keyRank: keyCard.rank,
            keyCard: keyCard,
            keySuit: cards[0].suit,
            label: '天子',
          };
        }
        return {
          type: 'straight',
          cards: cards,
          keyRank: keyCard.rank,
          keyCard: keyCard,
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

  function beatSizes(lastPlay) {
    if (!lastPlay) return [1, 2, 3, 4, 5];
    if (lastPlay.type === 'single') return [1];
    if (lastPlay.type === 'pair') return [2];
    if (lastPlay.type === 'triple') return [3];
    if (lastPlay.type === 'quad') return [4];
    return [5];
  }

  function eachCombo(arr, k, fn) {
    const n = arr.length;
    if (k < 1 || k > n) return;
    const idx = [];
    function rec(start, depth) {
      if (depth === k) {
        const cards = [];
        for (let i = 0; i < k; i++) cards.push(arr[idx[i]]);
        fn(cards);
        return;
      }
      for (let i = start; i <= n - (k - depth); i++) {
        idx[depth] = i;
        rec(i + 1, depth + 1);
      }
    }
    rec(0, 0);
  }

  /**
   * 找一手合法出牌（预选提示用）。
   * opts.requireDiamond4：本局首出必须含方片4。
   * opts.preferLargest：优先张数最多（自由出牌/三家都过后再出）。
   * 默认优先张数最少。
   * 返回 { ids, play } 或 null。
   */
  function findSmallestLegalPlay(hand, lastPlay, opts) {
    opts = opts || {};
    if (!hand || !hand.length) return null;
    const requireD4 = !!opts.requireDiamond4;
    const preferLargest = !!opts.preferLargest;
    const isDiamond4 = global.PokerCards && global.PokerCards.isDiamond4;
    const sizes = beatSizes(lastPlay);
    let best = null;
    for (let s = 0; s < sizes.length; s++) {
      const size = sizes[s];
      eachCombo(hand, size, function (cards) {
        if (requireD4 && isDiamond4 && !cards.some(isDiamond4)) return;
        const v = validatePlay(cards, lastPlay || null);
        if (!v.ok) return;
        const key =
          v.play.keyCard ||
          cards.reduce(function (m, c) {
            return compareSingle(c, m) > 0 ? c : m;
          }, cards[0]);
        // 必须先有 best，再比较张数，否则首个合法组合会读空报错
        const betterSize =
          !!best && (preferLargest ? size > best.size : size < best.size);
        if (
          !best ||
          betterSize ||
          (size === best.size && compareSingle(key, best.key) < 0)
        ) {
          best = {
            ids: cards.map(function (c) {
              return c.id;
            }),
            play: v.play,
            size: size,
            key: key,
          };
        }
      });
    }
    return best ? { ids: best.ids, play: best.play } : null;
  }

  global.PokerRules = {
    identifyPlay: identifyPlay,
    canBeat: canBeat,
    validatePlay: validatePlay,
    findSmallestLegalPlay: findSmallestLegalPlay,
  };
})(window);
