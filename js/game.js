/**
 * 四人扑克游戏状态：发牌、出牌、过牌、队伍与结算
 * 本地一人操控四家，无联网
 */
(function (global) {
  const Cards = global.PokerCards;
  const Rules = global.PokerRules;

  const PLAYER_NAMES = ['玩家1', '玩家2', '玩家3', '玩家4'];

  function resolveTeams(players) {
    let owner3 = -1;
    let ownerA = -1;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (p.hand.some(Cards.isSpade3)) owner3 = p.id;
      if (p.hand.some(Cards.isSpadeA)) ownerA = p.id;
    }

    if (owner3 === ownerA) {
      const soloId = owner3;
      return {
        solo: true,
        teamA: [soloId],
        teamB: [0, 1, 2, 3].filter(function (i) {
          return i !== soloId;
        }),
      };
    }

    return {
      solo: false,
      teamA: [owner3, ownerA],
      teamB: [0, 1, 2, 3].filter(function (i) {
        return i !== owner3 && i !== ownerA;
      }),
    };
  }

  function newGame(prevScores) {
    prevScores = prevScores || [0, 0, 0, 0];
    const deck = Cards.shuffle(Cards.createDeck());
    const players = [0, 1, 2, 3].map(function (id) {
      return {
        id: id,
        name: PLAYER_NAMES[id],
        hand: Cards.sortCards(deck.slice(id * 13, id * 13 + 13)),
        finishedRank: null,
        score: prevScores[id] != null ? prevScores[id] : 0,
      };
    });

    let starter = 0;
    for (let i = 0; i < players.length; i++) {
      if (players[i].hand.some(Cards.isDiamond4)) {
        starter = players[i].id;
        break;
      }
    }

    const teams = resolveTeams(players);

    return {
      players: players,
      currentPlayer: starter,
      lastPlay: null,
      lastPlayPlayer: null,
      passCount: 0,
      finishedOrder: [],
      phase: 'playing',
      revealedTeam: false,
      teamA: teams.teamA,
      teamB: teams.teamB,
      solo: teams.solo,
      history: ['新一局开始，' + PLAYER_NAMES[starter] + ' 持有方片4，先出'],
      round: 1,
      scores: players.map(function (p) {
        return p.score;
      }),
    };
  }

  function nameOf(state, id) {
    return state.players[id].name;
  }

  function updateTeamReveal(state) {
    if (state.revealedTeam) return;
    const has3 = state.players.some(function (p) {
      return p.hand.some(Cards.isSpade3);
    });
    const hasA = state.players.some(function (p) {
      return p.hand.some(Cards.isSpadeA);
    });
    if (!has3 && !hasA) {
      state.revealedTeam = true;
      const tip = state.solo
        ? '队伍已揭晓：' +
          nameOf(state, state.teamA[0]) +
          ' 独吞（葵扇3+葵扇A），其余三人一队'
        : '队伍已揭晓：' +
          state.teamA
            .map(function (i) {
              return nameOf(state, i);
            })
            .join('、') +
          ' vs ' +
          state.teamB
            .map(function (i) {
              return nameOf(state, i);
            })
            .join('、');
      state.history.push(tip);
    }
  }

  function cloneState(state) {
    return {
      players: state.players.map(function (p) {
        return {
          id: p.id,
          name: p.name,
          hand: p.hand.map(function (c) {
            return { id: c.id, suit: c.suit, rank: c.rank };
          }),
          finishedRank: p.finishedRank,
          score: p.score,
        };
      }),
      currentPlayer: state.currentPlayer,
      lastPlay: state.lastPlay
        ? {
            type: state.lastPlay.type,
            cards: state.lastPlay.cards.map(function (c) {
              return { id: c.id, suit: c.suit, rank: c.rank };
            }),
            keyRank: state.lastPlay.keyRank,
            keySuit: state.lastPlay.keySuit,
            keyCard: state.lastPlay.keyCard
              ? {
                  id: state.lastPlay.keyCard.id,
                  suit: state.lastPlay.keyCard.suit,
                  rank: state.lastPlay.keyCard.rank,
                }
              : undefined,
            label: state.lastPlay.label,
          }
        : null,
      lastPlayPlayer: state.lastPlayPlayer,
      passCount: state.passCount,
      finishedOrder: state.finishedOrder.slice(),
      phase: state.phase,
      revealedTeam: state.revealedTeam,
      teamA: state.teamA.slice(),
      teamB: state.teamB.slice(),
      solo: state.solo,
      history: state.history.slice(),
      round: state.round,
      scores: state.scores.slice(),
    };
  }

  function nextActiveAfter(state, fromId) {
    for (let i = 1; i <= 4; i++) {
      const id = (fromId + i) % 4;
      if (state.players[id].finishedRank === null) return id;
    }
    return fromId;
  }

  function advanceTurn(state) {
    state.currentPlayer = nextActiveAfter(state, state.currentPlayer);
  }

  function settle(state) {
    state.phase = 'settled';
    state.revealedTeam = true;

    function rankOf(id) {
      return state.players[id].finishedRank;
    }

    function add(ids, delta) {
      for (let i = 0; i < ids.length; i++) {
        state.players[ids[i]].score += delta;
      }
    }

    if (state.solo) {
      const soloId = state.teamA[0];
      const others = state.teamB;
      const r = rankOf(soloId);

      if (r === 1) {
        add([soloId], 9);
        add(others, -3);
        state.history.push('结算（独吞第1）：独吞 +9，其余各 -3');
      } else if (r === 2) {
        add([soloId], 4);
        const rest = others.filter(function (id) {
          return rankOf(id) !== 1;
        });
        add(rest, -2);
        state.history.push('结算（独吞第2）：独吞 +4，第1名不变，其余各 -2');
      } else if (r === 3) {
        add([soloId], -4);
        const rest = others.filter(function (id) {
          return rankOf(id) !== 4;
        });
        add(rest, 2);
        state.history.push('结算（独吞第3）：独吞 -4，第4名不变，其余各 +2');
      } else {
        add([soloId], -9);
        add(others, 3);
        state.history.push('结算（独吞第4）：独吞 -9，其余各 +3');
      }
    } else {
      const a = state.teamA;
      const b = state.teamB;
      const ranksA = a
        .map(rankOf)
        .sort(function (x, y) {
          return x - y;
        });
      const pair = ranksA[0] + ',' + ranksA[1];

      let delta = 0;
      if (pair === '1,2') delta = 3;
      else if (pair === '1,3') delta = 2;
      else if (pair === '1,4') delta = 0;
      else if (pair === '2,3') delta = 0;
      else if (pair === '2,4') delta = -2;
      else if (pair === '3,4') delta = -3;

      if (delta !== 0) {
        add(a, delta);
        add(b, -delta);
        state.history.push(
          '结算：队伍 ' +
            a
              .map(function (i) {
                return nameOf(state, i);
              })
              .join('、') +
            ' 名次 ' +
            ranksA.join('、') +
            '，各 ' +
            (delta > 0 ? '+' : '') +
            delta +
            '；对方各 ' +
            (-delta > 0 ? '+' : '') +
            -delta
        );
      } else {
        state.history.push('结算：名次为 1、4 对 2、3，胜点不变');
      }
    }

    state.scores = state.players.map(function (p) {
      return p.score;
    });
    state.history.push(
      '本局结束。累计胜点：' +
        state.players
          .map(function (p) {
            return p.name + ' ' + p.score;
          })
          .join('，')
    );
  }

  function playCards(state, cardIds) {
    if (state.phase !== 'playing') {
      return { ok: false, reason: '本局已结束', state: state };
    }

    const player = state.players[state.currentPlayer];
    const selected = [];
    for (let i = 0; i < cardIds.length; i++) {
      const found = player.hand.find(function (c) {
        return c.id === cardIds[i];
      });
      if (found) selected.push(found);
    }

    if (selected.length !== cardIds.length) {
      return { ok: false, reason: '选中的牌不在手牌中', state: state };
    }

    const free = state.lastPlay === null;
    const check = Rules.validatePlay(selected, free ? null : state.lastPlay);
    if (!check.ok) {
      return { ok: false, reason: check.reason, state: state };
    }

    const play = check.play;
    const next = cloneState(state);
    const p = next.players[next.currentPlayer];
    p.hand = p.hand.filter(function (c) {
      return cardIds.indexOf(c.id) === -1;
    });

    const labels = play.cards.map(Cards.cardLabel).join(' ');
    next.history.push(p.name + ' 出' + play.label + '：' + labels);

    next.lastPlay = play;
    next.lastPlayPlayer = next.currentPlayer;
    next.passCount = 0;

    updateTeamReveal(next);

    if (p.hand.length === 0) {
      next.finishedOrder.push(p.id);
      p.finishedRank = next.finishedOrder.length;
      next.history.push(p.name + ' 出完，排名第 ' + p.finishedRank);

      if (next.finishedOrder.length === 3) {
        const last = next.players.find(function (x) {
          return x.finishedRank === null;
        });
        if (last) {
          next.finishedOrder.push(last.id);
          last.finishedRank = 4;
          next.history.push(last.name + ' 垫底，排名第 4');
        }
        settle(next);
        return { ok: true, state: next };
      }
    }

    advanceTurn(next);
    return { ok: true, state: next };
  }

  function passTurn(state) {
    if (state.phase !== 'playing') {
      return { ok: false, reason: '本局已结束', state: state };
    }
    if (state.lastPlay === null) {
      return { ok: false, reason: '自由出牌时不能过牌，必须出牌', state: state };
    }

    const next = cloneState(state);
    const p = next.players[next.currentPlayer];
    next.history.push(p.name + ' 过牌');
    next.passCount += 1;

    const active = next.players.filter(function (x) {
      return x.finishedRank === null;
    });
    const others = active.filter(function (x) {
      return x.id !== next.lastPlayPlayer;
    });

    if (next.passCount >= others.length) {
      let starter = next.lastPlayPlayer;
      if (next.players[starter].finishedRank !== null) {
        starter = nextActiveAfter(next, starter);
      }
      next.lastPlay = null;
      next.lastPlayPlayer = null;
      next.passCount = 0;
      next.currentPlayer = starter;
      next.history.push('全部过牌，' + nameOf(next, starter) + ' 自由出牌');
      return { ok: true, state: next };
    }

    advanceTurn(next);
    return { ok: true, state: next };
  }

  function nextRound(state) {
    const scores = state.players.map(function (p) {
      return p.score;
    });
    const g = newGame(scores);
    g.round = (state.round || 1) + 1;
    g.history.unshift('—— 第 ' + g.round + ' 局 ——');
    return g;
  }

  function previewPlay(state, cardIds) {
    const player = state.players[state.currentPlayer];
    const selected = [];
    for (let i = 0; i < cardIds.length; i++) {
      const found = player.hand.find(function (c) {
        return c.id === cardIds[i];
      });
      if (found) selected.push(found);
    }
    if (selected.length === 0) {
      return { play: null, text: '请选择要出的牌' };
    }
    const play = Rules.identifyPlay(selected);
    if (!play) return { play: null, text: '不是合法牌型' };
    const free = state.lastPlay === null;
    const v = Rules.validatePlay(selected, free ? null : state.lastPlay);
    if (!v.ok) return { play: play, text: v.reason };
    return { play: play, text: '可出：' + play.label };
  }

  global.PokerGame = {
    newGame: newGame,
    playCards: playCards,
    passTurn: passTurn,
    nextRound: nextRound,
    previewPlay: previewPlay,
  };
})(window);
