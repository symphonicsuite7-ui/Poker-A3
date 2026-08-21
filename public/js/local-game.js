/**
 * 本地试玩：与线上相同的对局规则（浏览器）
 */
(function (global) {
  const Cards = global.PokerCards;
  const Rules = global.PokerRules;

function resolveTeams(players) {
  let owner3 = -1;
  let ownerA = -1;
  for (const p of players) {
    if (p.hand.some(Cards.isSpade3)) owner3 = p.id;
    if (p.hand.some(Cards.isSpadeA)) ownerA = p.id;
  }

  if (owner3 === ownerA) {
    const soloId = owner3;
    return {
      solo: true,
      teamA: [soloId],
      teamB: [0, 1, 2, 3].filter((i) => i !== soloId),
    };
  }

  return {
    solo: false,
    teamA: [owner3, ownerA],
    teamB: [0, 1, 2, 3].filter((i) => i !== owner3 && i !== ownerA),
  };
}

/**
 * @param {string[]} playerNames 四名玩家昵称
 * @param {number[]} [prevScores]
 */
function newGame(playerNames, prevScores) {
  prevScores = prevScores || [0, 0, 0, 0];
  const names = playerNames || ['玩家1', '玩家2', '玩家3', '玩家4'];
  const deck = Cards.shuffle(Cards.createDeck());

  const players = [0, 1, 2, 3].map((id) => ({
    id,
    name: names[id] || '玩家' + (id + 1),
    hand: Cards.sortCards(deck.slice(id * 13, id * 13 + 13)),
    finishedRank: null,
    goodsMark: null,
    goodsCount: 0,
    score: prevScores[id] != null ? prevScores[id] : 0,
  }));

  let starter = 0;
  for (const p of players) {
    if (p.hand.some(Cards.isDiamond4)) {
      starter = p.id;
      break;
    }
  }

  const teams = resolveTeams(players);

  return {
    players,
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
    history: ['新一局开始，' + players[starter].name + ' 持有方片4，先出'],
    events: [
      {
        kind: 'system',
        seat: starter,
        name: players[starter].name,
        text: '新一局开始，' + players[starter].name + ' 持有方片4，先出',
        label: '',
        cards: [],
      },
    ],
    round: 1,
    scores: players.map((p) => p.score),
    lastDeltas: [0, 0, 0, 0],
    draw: null,
  };
}

const DRAW_REVEAL_MS = 5000;

function nameOf(state, id) {
  return state.players[id].name;
}

function cloneCards(cards) {
  return (cards || []).map((c) => ({ id: c.id, suit: c.suit, rank: c.rank }));
}

function pushEvent(state, ev) {
  state.history.push(ev.text);
  if (!state.events) state.events = [];
  state.events.push({
    kind: ev.kind || 'system',
    seat: ev.seat != null ? ev.seat : null,
    name: ev.name || '',
    text: ev.text,
    label: ev.label || '',
    cards: cloneCards(ev.cards),
  });
}

function updateTeamReveal(state) {
  if (state.revealedTeam) return;
  const has3 = state.players.some((p) => p.hand.some(Cards.isSpade3));
  const hasA = state.players.some((p) => p.hand.some(Cards.isSpadeA));
  if (!has3 && !hasA) {
    state.revealedTeam = true;
    const tip = state.solo
      ? '队伍已揭晓：' + nameOf(state, state.teamA[0]) + ' 独吞（葵扇3+葵扇A），其余三人一队'
      : '队伍已揭晓：' +
        state.teamA.map((i) => nameOf(state, i)).join('、') +
        ' vs ' +
        state.teamB.map((i) => nameOf(state, i)).join('、');
    pushEvent(state, { kind: 'system', text: tip });
  }
}

function cloneState(state) {
  return {
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      hand: p.hand.map((c) => ({ id: c.id, suit: c.suit, rank: c.rank })),
      finishedRank: p.finishedRank,
      goodsMark: p.goodsMark || null,
      goodsCount: p.goodsCount || 0,
      score: p.score,
    })),
    currentPlayer: state.currentPlayer,
    lastPlay: state.lastPlay
      ? {
          type: state.lastPlay.type,
          cards: state.lastPlay.cards.map((c) => ({
            id: c.id,
            suit: c.suit,
            rank: c.rank,
          })),
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
    events: (state.events || []).map((ev) => ({
      kind: ev.kind,
      seat: ev.seat,
      name: ev.name,
      text: ev.text,
      label: ev.label,
      cards: cloneCards(ev.cards),
    })),
    round: state.round,
    scores: state.scores.slice(),
    lastDeltas: (state.lastDeltas || [0, 0, 0, 0]).slice(),
    draw: cloneDraw(state.draw),
  };
}

function cloneDraw(draw) {
  if (!draw) return null;
  const picks = {};
  Object.keys(draw.picks || {}).forEach((k) => {
    picks[k] = draw.picks[k];
  });
  const gives = {};
  Object.keys(draw.gives || {}).forEach((k) => {
    gives[k] = (draw.gives[k] || []).slice();
  });
  return {
    step: draw.step,
    uniqueTargets: !!draw.uniqueTargets,
    gainers: (draw.gainers || []).map((g) => ({ seat: g.seat, amount: g.amount })),
    losers: (draw.losers || []).map((g) => ({ seat: g.seat, amount: g.amount })),
    picks: picks,
    takes: (draw.takes || []).map((t) => ({
      from: t.from,
      to: t.to,
      cards: cloneCards(t.cards),
    })),
    gives: gives,
    giveCards: (draw.giveCards || []).map((t) => ({
      from: t.from,
      to: t.to,
      cards: cloneCards(t.cards),
    })),
    revealUntil: draw.revealUntil || null,
  };
}

function mapGet(map, seat) {
  if (!map) return undefined;
  if (map[seat] != null) return map[seat];
  return map[String(seat)];
}

function findDiamond4Seat(players) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].hand.some(Cards.isDiamond4)) return players[i].id;
  }
  return 0;
}

function randomTake(hand, n) {
  const arr = hand.slice();
  const taken = [];
  for (let i = 0; i < n && arr.length; i++) {
    const j = Math.floor(Math.random() * arr.length);
    taken.push(arr[j]);
    arr.splice(j, 1);
  }
  return { taken: taken, remain: arr };
}

function allGainersPicked(draw) {
  return draw.gainers.every((g) => mapGet(draw.picks, g.seat) != null);
}

function allGainersGave(draw) {
  return draw.gainers.every((g) => mapGet(draw.gives, g.seat));
}

/** 根据上一局加减分进入抽牌，无人加分则直接开打 */
function attachDraw(state, deltas) {
  state.lastDeltas = (deltas || [0, 0, 0, 0]).slice();
  const gainers = [];
  const losers = [];
  for (let i = 0; i < 4; i++) {
    const d = state.lastDeltas[i] || 0;
    if (d > 0) gainers.push({ seat: i, amount: d });
    if (d < 0) losers.push({ seat: i, amount: -d });
  }
  if (!gainers.length || !losers.length) {
    state.phase = 'playing';
    state.draw = null;
    return false;
  }
  state.phase = 'draw';
  state.draw = {
    step: 'pick',
    uniqueTargets: gainers.length <= losers.length,
    gainers: gainers,
    losers: losers,
    picks: {},
    takes: [],
    gives: {},
    giveCards: [],
    revealUntil: null,
  };
  return true;
}

function applyTakes(state) {
  const draw = state.draw;
  for (let i = 0; i < draw.gainers.length; i++) {
    const g = draw.gainers[i];
    const from = mapGet(draw.picks, g.seat);
    const target = state.players[from];
    const gainer = state.players[g.seat];
    const result = randomTake(target.hand, g.amount);
    target.hand = Cards.sortCards(result.remain);
    gainer.hand = Cards.sortCards(gainer.hand.concat(result.taken));
    draw.takes.push({ from: from, to: g.seat, cards: result.taken });
    pushEvent(state, {
      kind: 'system',
      seat: g.seat,
      name: gainer.name,
      text: gainer.name + ' 从 ' + target.name + ' 抽了 ' + result.taken.length + ' 张',
      cards: result.taken,
    });
  }
  draw.step = 'showTake';
  draw.revealUntil = Date.now() + DRAW_REVEAL_MS;
}

function applyGives(state) {
  const draw = state.draw;
  for (let i = 0; i < draw.gainers.length; i++) {
    const g = draw.gainers[i];
    const ids = mapGet(draw.gives, g.seat) || [];
    const gainer = state.players[g.seat];
    const targetSeat = mapGet(draw.picks, g.seat);
    const target = state.players[targetSeat];
    const given = [];
    gainer.hand = gainer.hand.filter((c) => {
      if (ids.indexOf(c.id) >= 0) {
        given.push(c);
        return false;
      }
      return true;
    });
    target.hand = Cards.sortCards(target.hand.concat(given));
    gainer.hand = Cards.sortCards(gainer.hand);
    draw.giveCards.push({ from: g.seat, to: targetSeat, cards: given });
    pushEvent(state, {
      kind: 'system',
      seat: g.seat,
      name: gainer.name,
      text: gainer.name + ' 还给 ' + target.name + ' ' + given.length + ' 张',
      cards: given,
    });
  }
  draw.step = 'showGive';
  draw.revealUntil = Date.now() + DRAW_REVEAL_MS;
}

function beginPlayAfterDraw(state) {
  const starter = findDiamond4Seat(state.players);
  state.currentPlayer = starter;
  state.phase = 'playing';
  if (state.draw) {
    state.draw.step = 'done';
    state.draw.revealUntil = null;
  }
  pushEvent(state, {
    kind: 'system',
    seat: starter,
    name: nameOf(state, starter),
    text: '抽牌结束，' + nameOf(state, starter) + ' 持有方片4，先出',
  });
}

function pickDrawTarget(state, seat, targetSeat) {
  if (state.phase !== 'draw' || !state.draw || state.draw.step !== 'pick') {
    return { ok: false, reason: '现在不能选择抽牌对象', state: state };
  }
  const g = state.draw.gainers.find((x) => x.seat === seat);
  if (!g) return { ok: false, reason: '你不是加分者', state: state };
  if (mapGet(state.draw.picks, seat) != null) {
    return { ok: false, reason: '你已经选过了', state: state };
  }
  const loser = state.draw.losers.find((x) => x.seat === targetSeat);
  if (!loser) return { ok: false, reason: '只能抽减分者', state: state };
  if (state.draw.uniqueTargets) {
    const taken = Object.keys(state.draw.picks).some((k) => state.draw.picks[k] === targetSeat);
    if (taken) return { ok: false, reason: '该玩家已被其他胜者抽走', state: state };
  }

  const next = cloneState(state);
  next.draw.picks[seat] = targetSeat;
  next.draw.picks[String(seat)] = targetSeat;
  pushEvent(next, {
    kind: 'system',
    seat: seat,
    name: nameOf(next, seat),
    text: nameOf(next, seat) + ' 选择抽 ' + nameOf(next, targetSeat),
  });
  if (allGainersPicked(next.draw)) applyTakes(next);
  return { ok: true, state: next };
}

function giveDrawCards(state, seat, cardIds) {
  if (state.phase !== 'draw' || !state.draw || state.draw.step !== 'give') {
    return { ok: false, reason: '现在不能还牌', state: state };
  }
  const g = state.draw.gainers.find((x) => x.seat === seat);
  if (!g) return { ok: false, reason: '你不是加分者', state: state };
  if (mapGet(state.draw.gives, seat)) {
    return { ok: false, reason: '你已经还过牌', state: state };
  }
  const ids = cardIds || [];
  if (ids.length !== g.amount) {
    return { ok: false, reason: '请选择 ' + g.amount + ' 张还牌', state: state };
  }
  if (new Set(ids).size !== ids.length) {
    return { ok: false, reason: '不能重复选同一张牌', state: state };
  }
  const p = state.players[seat];
  for (let i = 0; i < ids.length; i++) {
    if (!p.hand.some((c) => c.id === ids[i])) {
      return { ok: false, reason: '选中的牌不在手牌中', state: state };
    }
  }

  const next = cloneState(state);
  next.draw.gives[seat] = ids.slice();
  next.draw.gives[String(seat)] = ids.slice();
  pushEvent(next, {
    kind: 'system',
    seat: seat,
    name: nameOf(next, seat),
    text: nameOf(next, seat) + ' 已选好还牌，等待其他人',
  });
  if (allGainersGave(next.draw)) applyGives(next);
  return { ok: true, state: next };
}

function advanceDrawReveal(state) {
  if (state.phase !== 'draw' || !state.draw) {
    return { ok: false, reason: '当前不是抽牌阶段', state: state };
  }
  const next = cloneState(state);
  if (next.draw.step === 'showTake') {
    next.draw.step = 'give';
    next.draw.revealUntil = null;
    pushEvent(next, { kind: 'system', text: '请加分者从手牌中选出还牌' });
    return { ok: true, state: next };
  }
  if (next.draw.step === 'showGive') {
    beginPlayAfterDraw(next);
    return { ok: true, state: next };
  }
  return { ok: false, reason: '当前不能进入下一步', state: state };
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

function teamKey(state, id) {
  return state.teamA.indexOf(id) >= 0 ? 'A' : 'B';
}

function goodsCountIn(cards) {
  let n = 0;
  if ((cards || []).some(Cards.isSpade3)) n += 1;
  if ((cards || []).some(Cards.isSpadeA)) n += 1;
  return n;
}

function refreshGoodsMark(player) {
  const n = player.goodsCount || 0;
  if (n >= 2) player.goodsMark = 'solo';
  else if (n === 1) player.goodsMark = 'has';
}

/** 打出葵扇A/葵扇3：一张为有货，两张或已有货再出一张为独吞 */
function markGoodsIfPlayed(player, cards) {
  const n = goodsCountIn(cards);
  if (n <= 0) return;
  player.goodsCount = (player.goodsCount || 0) + n;
  refreshGoodsMark(player);
}

/** 亮牌时把还留在手里的货也计入标记 */
function markGoodsFromHand(player) {
  player.goodsCount = (player.goodsCount || 0) + goodsCountIn(player.hand);
  refreshGoodsMark(player);
  if (!player.goodsMark) player.goodsMark = 'none';
}

/**
 * 根据已出名次判断本局胜点是否已锁死。
 * 独吞：头游/二游即可定局；合作：头游二游同队（双上）即可定局。
 */
function scoreLockReason(state) {
  if (state.finishedOrder.length >= 3) return '已有三人出完';
  if (state.solo) {
    const r = state.players[state.teamA[0]].finishedRank;
    if (r === 1) return '独吞头游，计分已确定';
    if (r === 2) return '独吞二游，计分已确定';
    return null;
  }
  if (state.finishedOrder.length >= 2) {
    const a = state.finishedOrder[0];
    const b = state.finishedOrder[1];
    if (teamKey(state, a) === teamKey(state, b)) {
      return '头游二游同队，计分已确定';
    }
  }
  return null;
}

/** 给尚未出完的玩家按座位顺序补名次，并亮出剩余手牌 */
function assignRemainingRanks(state) {
  for (let i = 1; i <= 4; i++) {
    const p = state.players[(state.currentPlayer + i) % 4];
    if (p.finishedRank !== null) continue;
    state.finishedOrder.push(p.id);
    p.finishedRank = state.finishedOrder.length;
    markGoodsFromHand(p);
    pushEvent(state, {
      kind: 'system',
      seat: p.id,
      name: p.name,
      text: p.name + ' 未出完，亮牌，排名第 ' + p.finishedRank,
      cards: p.hand,
    });
  }
}

function settle(state) {
  const scoresBefore = state.players.map((p) => p.score);
  state.phase = 'settled';
  state.revealedTeam = true;

  const rankOf = (id) => state.players[id].finishedRank;
  const add = (ids, delta) => {
    for (const id of ids) state.players[id].score += delta;
  };

  if (state.solo) {
    const soloId = state.teamA[0];
    const others = state.teamB;
    const r = rankOf(soloId);

    if (r === 1) {
      add([soloId], 9);
      add(others, -3);
      pushEvent(state, { kind: 'system', text: '结算（独吞第1）：独吞 +9，其余各 -3' });
    } else if (r === 2) {
      add([soloId], 4);
      add(
        others.filter((id) => rankOf(id) !== 1),
        -2
      );
      pushEvent(state, { kind: 'system', text: '结算（独吞第2）：独吞 +4，第1名不变，其余各 -2' });
    } else if (r === 3) {
      add([soloId], -4);
      add(
        others.filter((id) => rankOf(id) !== 4),
        2
      );
      pushEvent(state, { kind: 'system', text: '结算（独吞第3）：独吞 -4，第4名不变，其余各 +2' });
    } else {
      add([soloId], -9);
      add(others, 3);
      pushEvent(state, { kind: 'system', text: '结算（独吞第4）：独吞 -9，其余各 +3' });
    }
  } else {
    const a = state.teamA;
    const b = state.teamB;
    const ranksA = a.map(rankOf).sort((x, y) => x - y);
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
      pushEvent(
        state,
        {
          kind: 'system',
          text:
            '结算：队伍 ' +
            a.map((i) => nameOf(state, i)).join('、') +
            ' 名次 ' +
            ranksA.join('、') +
            '，各 ' +
            (delta > 0 ? '+' : '') +
            delta +
            '；对方各 ' +
            (-delta > 0 ? '+' : '') +
            -delta,
        }
      );
    } else {
      pushEvent(state, { kind: 'system', text: '结算：名次为 1、4 对 2、3，胜点不变' });
    }
  }

  state.scores = state.players.map((p) => p.score);
  state.lastDeltas = state.players.map((p, i) => p.score - scoresBefore[i]);
  pushEvent(state, {
    kind: 'system',
    text:
      '本局结束。累计胜点：' +
      state.players.map((p) => p.name + ' ' + p.score).join('，'),
  });
}

function playCards(state, seatIndex, cardIds) {
  if (state.phase !== 'playing') {
    return { ok: false, reason: state.phase === 'draw' ? '抽牌尚未结束' : '本局已结束', state };
  }
  if (state.currentPlayer !== seatIndex) {
    return { ok: false, reason: '还没轮到你', state };
  }

  const player = state.players[seatIndex];
  const selected = [];
  for (const id of cardIds) {
    const found = player.hand.find((c) => c.id === id);
    if (found) selected.push(found);
  }
  if (selected.length !== cardIds.length) {
    return { ok: false, reason: '选中的牌不在手牌中', state };
  }

  const free = state.lastPlay === null;
  const check = Rules.validatePlay(selected, free ? null : state.lastPlay);
  if (!check.ok) return { ok: false, reason: check.reason, state };

  const play = check.play;
  const next = cloneState(state);
  const p = next.players[seatIndex];
  p.hand = p.hand.filter((c) => cardIds.indexOf(c.id) === -1);
  markGoodsIfPlayed(p, play.cards);

  pushEvent(next, {
    kind: 'play',
    seat: seatIndex,
    name: p.name,
    text: p.name + ' 出' + play.label,
    label: play.label,
    cards: play.cards,
  });
  next.lastPlay = play;
  next.lastPlayPlayer = seatIndex;
  next.passCount = 0;

  updateTeamReveal(next);

  if (p.hand.length === 0) {
    next.finishedOrder.push(p.id);
    p.finishedRank = next.finishedOrder.length;
    if (p.goodsMark !== 'has' && p.goodsMark !== 'solo') p.goodsMark = 'none';
    pushEvent(next, {
      kind: 'system',
      seat: p.id,
      name: p.name,
      text: p.name + ' 出完，排名第 ' + p.finishedRank,
    });

    const reason = scoreLockReason(next);
    if (reason) {
      pushEvent(next, { kind: 'system', text: reason + '，本局结束' });
      assignRemainingRanks(next);
      settle(next);
      return { ok: true, state: next };
    }
  }

  advanceTurn(next);
  return { ok: true, state: next };
}

function passTurn(state, seatIndex) {
  if (state.phase !== 'playing') {
    return { ok: false, reason: state.phase === 'draw' ? '抽牌尚未结束' : '本局已结束', state };
  }
  if (state.currentPlayer !== seatIndex) {
    return { ok: false, reason: '还没轮到你', state };
  }
  if (state.lastPlay === null) {
    return { ok: false, reason: '自由出牌时不能过牌，必须出牌', state };
  }

  const next = cloneState(state);
  const p = next.players[seatIndex];
  pushEvent(next, {
    kind: 'pass',
    seat: seatIndex,
    name: p.name,
    text: p.name + ' 过牌',
    label: '过牌',
  });
  next.passCount += 1;

  const active = next.players.filter((x) => x.finishedRank === null);
  const others = active.filter((x) => x.id !== next.lastPlayPlayer);

  if (next.passCount >= others.length) {
    let starter = next.lastPlayPlayer;
    if (next.players[starter].finishedRank !== null) {
      starter = nextActiveAfter(next, starter);
    }
    next.lastPlay = null;
    next.lastPlayPlayer = null;
    next.passCount = 0;
    next.currentPlayer = starter;
    pushEvent(next, {
      kind: 'system',
      seat: starter,
      name: nameOf(next, starter),
      text: '全部过牌，' + nameOf(next, starter) + ' 自由出牌',
    });
    return { ok: true, state: next };
  }

  advanceTurn(next);
  return { ok: true, state: next };
}

function nextRound(state, playerNames) {
  const scores = state.players.map((p) => p.score);
  const deltas = (state.lastDeltas || [0, 0, 0, 0]).slice();
  const names = playerNames || state.players.map((p) => p.name);
  const g = newGame(names, scores);
  g.round = (state.round || 1) + 1;
  const startedDraw = attachDraw(g, deltas);
  if (startedDraw) {
    g.events = [
      {
        kind: 'system',
        seat: null,
        name: '',
        text: '—— 第 ' + g.round + ' 局：抽牌 ——',
        label: '',
        cards: [],
      },
    ];
    g.history = ['—— 第 ' + g.round + ' 局：抽牌 ——'];
  } else {
    g.events.unshift({
      kind: 'system',
      seat: null,
      name: '',
      text: '—— 第 ' + g.round + ' 局 ——',
      label: '',
      cards: [],
    });
    g.history.unshift('—— 第 ' + g.round + ' 局 ——');
  }
  return g;
}

function addBackgroundLog(state, seat, playerName, imageName) {
  pushEvent(state, {
    kind: 'system',
    seat: seat != null ? seat : null,
    name: playerName || '',
    text: (playerName || '玩家') + ' 将背景图修改为' + imageName,
  });
}

function identifyPlay(raw) {
  return Rules.identifyPlay(raw);
}

function validatePlay(selected, lastPlay) {
  return Rules.validatePlay(selected, lastPlay);
}

  global.PokerGame = {
    newGame: newGame,
    playCards: playCards,
    passTurn: passTurn,
    nextRound: nextRound,
    pickDrawTarget: pickDrawTarget,
    giveDrawCards: giveDrawCards,
    advanceDrawReveal: advanceDrawReveal,
    identifyPlay: identifyPlay,
    validatePlay: validatePlay,
    cloneState: cloneState,
    addBackgroundLog: addBackgroundLog,
  };
})(window);
