const test = require('node:test');
const assert = require('node:assert/strict');

const Game = require('./game');

function card(id, suit, rank) {
  return { id, suit, rank };
}

function drawState() {
  const state = Game.newGame(['一', '二', '三', '四']);
  state.phase = 'draw';
  state.players[0].hand = [card('gainer-card', 0, 1)];
  state.players[1].hand = [card('spade-3', 3, 12)];
  state.players[2].hand = [card('spade-a', 3, 10)];
  state.players[3].hand = [card('diamond-4', 0, 0)];
  state.draw = {
    step: 'devour',
    mode: 'devour',
    uniqueTargets: true,
    gainers: [{ seat: 0, amount: 2 }],
    losers: [{ seat: 1, amount: 1 }, { seat: 2, amount: 1 }],
    picks: {},
    takes: [],
    gives: {},
    giveCards: [],
    revealUntil: null,
  };
  return state;
}

test('draw reveals goods ownership and follows returned key cards', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    let result = Game.devourDraw(drawState(), 0);
    assert.equal(result.ok, true);
    assert.equal(result.state.players[0].goodsMark, 'solo');
    assert.deepEqual(result.state.players.slice(1).map((p) => p.goodsMark), [
      'none',
      'none',
      'none',
    ]);

    result = Game.advanceDrawReveal(result.state);
    assert.equal(result.ok, true);
    result = Game.giveDrawCards(result.state, 0, ['spade-3'], 1);
    assert.equal(result.ok, true);
    assert.equal(result.state.players[0].goodsMark, 'has');
    assert.equal(result.state.players[1].goodsMark, 'has');
    assert.equal(result.state.players[2].goodsMark, 'none');
    assert.equal(result.state.players[3].goodsMark, 'none');
  } finally {
    Math.random = originalRandom;
  }
});

test('teams are resolved again from final hands after draw', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    let result = Game.devourDraw(drawState(), 0);
    result = Game.advanceDrawReveal(result.state);
    result = Game.giveDrawCards(result.state, 0, ['spade-3'], 1);
    result = Game.giveDrawCards(result.state, 0, ['spade-a'], 2);
    assert.equal(result.state.draw.step, 'showGive');

    result = Game.advanceDrawReveal(result.state);
    assert.equal(result.ok, true);
    assert.equal(result.state.phase, 'playing');
    assert.equal(result.state.solo, false);
    assert.deepEqual(result.state.teamA.slice().sort(), [1, 2]);
    assert.deepEqual(result.state.teamB.slice().sort(), [0, 3]);
  } finally {
    Math.random = originalRandom;
  }
});

test('nextRound remaps lastDeltas by userId when seats reorder', () => {
  const state = Game.newGame(['一', '二', '三', '四'], [0, 0, 0, 0], ['u0', 'u1', 'u2', 'u3']);
  state.phase = 'settled';
  state.players[0].score = 10;
  state.players[1].score = 10;
  state.players[2].score = -5;
  state.players[3].score = -5;
  state.lastDeltas = [3, 3, -3, -3];

  // 座位重排：原 1 号坐到 0，原 0 号坐到 1
  const next = Game.nextRound(
    state,
    ['二', '一', '三', '四'],
    ['u1', 'u0', 'u2', 'u3']
  );
  assert.equal(next.phase, 'draw');
  assert.deepEqual(next.lastDeltas, [3, 3, -3, -3]);
  assert.equal(next.players[0].userId, 'u1');
  assert.equal(next.players[0].score, 10);
  assert.equal(next.draw.gainers.map((g) => g.seat).sort().join(','), '0,1');
  assert.equal(next.draw.losers.map((g) => g.seat).sort().join(','), '2,3');
});
