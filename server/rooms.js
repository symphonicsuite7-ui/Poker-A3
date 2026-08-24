/**
 * 房间管理：创建密码、加入、开局
 */
const crypto = require('crypto');
const Game = require('./engine/game');
const backgrounds = require('./backgrounds');

const MAX_PLAYERS = 4;

function uuid() {
  return crypto.randomUUID();
}

/** @type {Map<string, object>} password -> room */
const roomsByPassword = new Map();
/** @type {Map<string, object>} roomId -> room */
const roomsById = new Map();
/** @type {Map<string, string>} userId -> roomId */
const userRoom = new Map();

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  if (roomsByPassword.has(code)) return generatePassword();
  return code;
}

function roomPublic(room, viewerUserId) {
  return {
    id: room.id,
    password: room.password,
    hostId: room.hostId,
    status: room.status,
    players: room.players.map((p) => ({
      userId: p.userId,
      username: p.username,
      nickname: p.nickname || '',
      avatar: p.avatar || '/avatars/preset-1.svg',
      seat: p.seat,
      online: p.online,
      isHost: p.userId === room.hostId,
      isMe: p.userId === viewerUserId,
    })),
    playerCount: room.players.length,
    maxPlayers: MAX_PLAYERS,
    background: room.background || null,
  };
}

/** 座位展示名：昵称优先 */
function seatDisplayName(p) {
  const nick = String((p && p.nickname) || '').trim();
  return nick || (p && p.username) || '';
}

/**
 * 对指定玩家脱敏后的对局状态：只看自己的手牌
 */
function gameViewFor(room, userId) {
  if (!room.game) return null;
  const seat = room.players.findIndex((p) => p.userId === userId);
  const g = room.game;

  return {
    mySeat: seat,
    currentPlayer: g.currentPlayer,
    lastPlay: g.lastPlay,
    lastPlayPlayer: g.lastPlayPlayer,
    phase: g.phase,
    revealedTeam: g.revealedTeam,
    teamA: g.revealedTeam || g.phase === 'settled' ? g.teamA : null,
    teamB: g.revealedTeam || g.phase === 'settled' ? g.teamB : null,
    solo: g.solo,
    history: g.history.slice(-40),
    events: (g.events || []).slice(-60).map((ev) => ({
      kind: ev.kind,
      seat: ev.seat,
      name: ev.name,
      text: ev.text,
      label: ev.label,
      cards: ev.cards || [],
      avatar:
        ev.seat != null && room.players[ev.seat]
          ? room.players[ev.seat].avatar
          : null,
    })),
    round: g.round,
    lastDeltas: g.lastDeltas || [0, 0, 0, 0],
    draw: drawView(g, seat),
    players: g.players.map((p, idx) => ({
      id: p.id,
      name: p.name,
      avatar:
        (room.players[idx] && room.players[idx].avatar) || '/avatars/preset-1.svg',
      score: p.score,
      handCount: p.hand.length,
      finishedRank: p.finishedRank,
      goodsMark: p.goodsMark || null,
      hand: idx === seat || g.phase === 'settled' ? p.hand : null,
      isMe: idx === seat,
    })),
  };
}

function mapGet(map, seat) {
  if (!map) return undefined;
  if (map[seat] != null) return map[seat];
  return map[String(seat)];
}

function drawView(g, seat) {
  if (!g.draw || g.phase !== 'draw' || g.draw.step === 'done') return null;
  const d = g.draw;
  const gainer = (d.gainers || []).find((x) => x.seat === seat) || null;
  const takenSeats = [];
  Object.keys(d.picks || {}).forEach((k) => {
    const v = d.picks[k];
    if (v != null && takenSeats.indexOf(v) < 0) takenSeats.push(v);
  });
  const showTakes = d.step === 'showTake' || d.step === 'give' || d.step === 'showGive';
  const showGives = d.step === 'showGive';
  const devour = d.mode === 'devour';
  let remainingTargets = [];
  let myGiveChunk = gainer ? gainer.amount : 0;
  let myGiveDone = !!(gainer && mapGet(d.gives, seat));
  if (devour && gainer) {
    remainingTargets = Game.remainingGiveLosers(d, seat).map((l) => l.seat);
    myGiveChunk = Game.giveChunkSize(d, seat);
    myGiveDone = remainingTargets.length === 0;
  }
  return {
    step: d.step,
    mode: d.mode || 'normal',
    uniqueTargets: !!d.uniqueTargets,
    gainers: d.gainers,
    losers: d.losers,
    picks: d.picks,
    takenSeats: takenSeats,
    takes: showTakes ? d.takes || [] : [],
    giveCards: showGives ? d.giveCards || [] : [],
    revealUntil: d.revealUntil || null,
    isGainer: !!gainer,
    myAmount: gainer ? gainer.amount : 0,
    myGiveChunk: myGiveChunk,
    myPick: gainer ? mapGet(d.picks, seat) : null,
    myGiveDone: myGiveDone,
    remainingTargets: remainingTargets,
  };
}

function createRoom(user) {
  if (userRoom.has(user.userId)) {
    return { ok: false, error: '你已在房间中，请先离开' };
  }

  const password = generatePassword();
  const room = {
    id: uuid(),
    password,
    hostId: user.userId,
    status: 'waiting', // waiting | playing | settled
    players: [
      {
        userId: user.userId,
        username: user.username,
        nickname: user.nickname || '',
        avatar: user.avatar || '/avatars/preset-1.svg',
        seat: 0,
        online: true,
        socketId: null,
      },
    ],
    game: null,
    background: null,
    createdAt: Date.now(),
  };

  roomsById.set(room.id, room);
  roomsByPassword.set(password, room);
  userRoom.set(user.userId, room.id);

  return { ok: true, room: roomPublic(room, user.userId) };
}

function joinRoom(user, password) {
  const code = String(password || '')
    .trim()
    .toUpperCase();
  if (!code) return { ok: false, error: '请输入房间密码' };

  if (userRoom.has(user.userId)) {
    const existingId = userRoom.get(user.userId);
    const existing = roomsById.get(existingId);
    if (existing && existing.password === code) {
      return { ok: true, room: roomPublic(existing, user.userId) };
    }
    return { ok: false, error: '你已在其他房间中，请先离开' };
  }

  const room = roomsByPassword.get(code);
  if (!room) return { ok: false, error: '房间不存在或密码错误' };
  if (room.status !== 'waiting') {
    return { ok: false, error: '对局已开始，无法加入' };
  }
  if (room.players.length >= MAX_PLAYERS) {
    return { ok: false, error: '房间已满' };
  }
  if (room.players.some((p) => p.userId === user.userId)) {
    return { ok: true, room: roomPublic(room, user.userId) };
  }

  room.players.push({
    userId: user.userId,
    username: user.username,
    nickname: user.nickname || '',
    avatar: user.avatar || '/avatars/preset-1.svg',
    seat: room.players.length,
    online: true,
    socketId: null,
  });
  userRoom.set(user.userId, room.id);

  return { ok: true, room: roomPublic(room, user.userId) };
}

function leaveRoom(userId) {
  const roomId = userRoom.get(userId);
  if (!roomId) return { ok: true };
  const room = roomsById.get(roomId);
  userRoom.delete(userId);
  if (!room) return { ok: true };

  if (room.status === 'playing') {
    const p = room.players.find((x) => x.userId === userId);
    if (p) p.online = false;
    return { ok: true, room, leftDuringGame: true };
  }

  room.players = room.players.filter((p) => p.userId !== userId);
  room.players.forEach((p, i) => {
    p.seat = i;
  });

  if (room.players.length === 0) {
    roomsById.delete(room.id);
    roomsByPassword.delete(room.password);
    return { ok: true, room: null, dissolved: true };
  }

  if (room.hostId === userId) {
    room.hostId = room.players[0].userId;
  }

  return { ok: true, room };
}

function getRoomByUser(userId) {
  const roomId = userRoom.get(userId);
  if (!roomId) return null;
  return roomsById.get(roomId) || null;
}

function getRoom(roomId) {
  return roomsById.get(roomId) || null;
}

function startGame(userId) {
  const room = getRoomByUser(userId);
  if (!room) return { ok: false, error: '不在房间中' };
  if (room.hostId !== userId) return { ok: false, error: '只有房主可以开始游戏' };
  if (room.players.length < MAX_PLAYERS) {
    return { ok: false, error: '需要 4 名玩家才能开始' };
  }
  if (room.status === 'playing') return { ok: false, error: '游戏已开始' };

  const names = room.players.map((p) => seatDisplayName(p));
  const prevScores =
    room.game && room.game.phase === 'settled'
      ? room.game.players.map((p) => p.score)
      : [0, 0, 0, 0];

  room.game = Game.newGame(names, prevScores);
  room.status = 'playing';
  return { ok: true, room };
}

function nextRound(userId) {
  const room = getRoomByUser(userId);
  if (!room) return { ok: false, error: '不在房间中' };
  if (room.hostId !== userId) return { ok: false, error: '只有房主可以开下一局' };
  if (!room.game || room.game.phase !== 'settled') {
    return { ok: false, error: '当前不能开下一局' };
  }
  if (room.players.length < MAX_PLAYERS) {
    return { ok: false, error: '人数不足' };
  }

  const names = room.players.map((p) => seatDisplayName(p));
  room.game = Game.nextRound(room.game, names);
  room.status = 'playing';
  return { ok: true, room };
}

function playCards(userId, cardIds) {
  const room = getRoomByUser(userId);
  if (!room || !room.game) return { ok: false, error: '对局未开始' };
  const seat = room.players.findIndex((p) => p.userId === userId);
  if (seat < 0) return { ok: false, error: '座位无效' };

  const result = Game.playCards(room.game, seat, cardIds || []);
  if (!result.ok) return { ok: false, error: result.reason };
  room.game = result.state;
  if (room.game.phase === 'settled') room.status = 'settled';
  return { ok: true, room };
}

function passTurn(userId) {
  const room = getRoomByUser(userId);
  if (!room || !room.game) return { ok: false, error: '对局未开始' };
  const seat = room.players.findIndex((p) => p.userId === userId);
  if (seat < 0) return { ok: false, error: '座位无效' };

  const result = Game.passTurn(room.game, seat);
  if (!result.ok) return { ok: false, error: result.reason };
  room.game = result.state;
  return { ok: true, room };
}

function pickDrawTarget(userId, targetSeat) {
  const room = getRoomByUser(userId);
  if (!room || !room.game) return { ok: false, error: '对局未开始' };
  const seat = room.players.findIndex((p) => p.userId === userId);
  if (seat < 0) return { ok: false, error: '座位无效' };
  const result = Game.pickDrawTarget(room.game, seat, Number(targetSeat));
  if (!result.ok) return { ok: false, error: result.reason };
  room.game = result.state;
  return { ok: true, room };
}

function devourDraw(userId) {
  const room = getRoomByUser(userId);
  if (!room || !room.game) return { ok: false, error: '对局未开始' };
  const seat = room.players.findIndex((p) => p.userId === userId);
  if (seat < 0) return { ok: false, error: '座位无效' };
  const result = Game.devourDraw(room.game, seat);
  if (!result.ok) return { ok: false, error: result.reason };
  room.game = result.state;
  return { ok: true, room };
}

function giveDrawCards(userId, cardIds, targetSeat) {
  const room = getRoomByUser(userId);
  if (!room || !room.game) return { ok: false, error: '对局未开始' };
  const seat = room.players.findIndex((p) => p.userId === userId);
  if (seat < 0) return { ok: false, error: '座位无效' };
  const result = Game.giveDrawCards(
    room.game,
    seat,
    cardIds || [],
    targetSeat == null ? undefined : Number(targetSeat)
  );
  if (!result.ok) return { ok: false, error: result.reason };
  room.game = result.state;
  return { ok: true, room };
}

function advanceDraw(roomId) {
  const room = roomsById.get(roomId);
  if (!room || !room.game) return { ok: false, error: '对局未开始' };
  const result = Game.advanceDrawReveal(room.game);
  if (!result.ok) return { ok: false, error: result.reason };
  room.game = result.state;
  return { ok: true, room };
}

function setBackground(userId, file) {
  const room = getRoomByUser(userId);
  if (!room) return { ok: false, error: '不在房间中' };
  const item = backgrounds.findByFile(file);
  if (!item) return { ok: false, error: '图片不存在' };
  const p = room.players.find((x) => x.userId === userId);
  if (!p) return { ok: false, error: '座位无效' };

  room.background = {
    name: item.name,
    file: item.file,
    url: item.url,
    by: seatDisplayName(p),
  };

  if (room.game) {
    Game.addBackgroundLog(room.game, p.seat, seatDisplayName(p), item.name);
  }

  return { ok: true, room };
}

function bindSocket(userId, socketId) {
  const room = getRoomByUser(userId);
  if (!room) return null;
  const p = room.players.find((x) => x.userId === userId);
  if (p) {
    p.socketId = socketId;
    p.online = true;
  }
  return room;
}

/** 资料变更后同步房间座位展示信息 */
function refreshPlayerProfile(userId, patch) {
  const room = getRoomByUser(userId);
  if (!room) return null;
  const p = room.players.find((x) => x.userId === userId);
  if (!p) return null;
  if (patch.nickname != null) p.nickname = String(patch.nickname || '').trim();
  if (patch.avatar) p.avatar = patch.avatar;
  if (patch.username) p.username = patch.username;
  // 对局中同步引擎展示名（日志/座位旁）
  if (room.game && room.game.players && room.game.players[p.seat]) {
    room.game.players[p.seat].name = seatDisplayName(p);
  }
  return room;
}

function setOffline(socketId) {
  for (const room of roomsById.values()) {
    const p = room.players.find((x) => x.socketId === socketId);
    if (p) {
      p.online = false;
      p.socketId = null;
      return room;
    }
  }
  return null;
}

module.exports = {
  MAX_PLAYERS,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomByUser,
  getRoom,
  startGame,
  nextRound,
  playCards,
  passTurn,
  pickDrawTarget,
  devourDraw,
  giveDrawCards,
  advanceDraw,
  setBackground,
  roomPublic,
  gameViewFor,
  bindSocket,
  refreshPlayerProfile,
  setOffline,
};
