/**
 * 四人扑克服务端入口（可部署到云服务器）
 */
const path = require('path');
const http = require('http');
const express = require('express');
const multer = require('multer');
const { Server } = require('socket.io');
const auth = require('./auth');
const rooms = require('./rooms');
const avatars = require('./avatars');
const backgrounds = require('./backgrounds');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (avatars.ALLOWED_MIME[file.mimetype]) cb(null, true);
    else cb(new Error('仅支持 JPG / PNG / GIF / WEBP 图片'));
  },
});

avatars.ensureUploadDir();

app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'data', 'uploads'), {
    maxAge: '7d',
  })
);
app.use(
  '/backgrounds',
  express.static(backgrounds.BG_DIR, {
    maxAge: '7d',
  })
);
app.use(express.static(path.join(__dirname, '..', 'public')));

function requireAuth(req, res, next) {
  const session = auth.authFromHeader(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: '请先登录' });
  }
  req.user = session;
  next();
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'up' });
});

app.get('/api/backgrounds', (_req, res) => {
  res.json({ ok: true, images: backgrounds.listBackgrounds() });
});

app.post('/api/register', (req, res) => {
  upload.single('avatarFile')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? '头像不能超过 2MB' : err.message;
      return res.status(400).json({ ok: false, error: msg || '头像上传失败' });
    }
    const result = auth.register(req.body.username, req.body.password, {
      avatar: req.body.avatar,
      file: req.file,
    });
    if (!result.ok) return res.status(400).json(result);
    res.json(result);
  });
});

app.post('/api/login', (req, res) => {
  const result = auth.login(req.body.username, req.body.password);
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

app.post('/api/logout', requireAuth, (req, res) => {
  auth.destroySession(req.user.token);
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: {
      id: req.user.userId,
      username: req.user.username,
      avatar: avatars.normalizeAvatar(req.user.avatar),
    },
  });
});

function socketUser(socket) {
  return {
    userId: socket.user.userId,
    username: socket.user.username,
    avatar: avatars.normalizeAvatar(socket.user.avatar),
  };
}

function broadcastRoom(room) {
  if (!room) return;
  for (const p of room.players) {
    if (!p.socketId) continue;
    const payload = {
      room: rooms.roomPublic(room, p.userId),
      game: rooms.gameViewFor(room, p.userId),
    };
    io.to(p.socketId).emit('room:update', payload);
  }
}

const drawTimers = new Map();

function scheduleDrawAdvance(room) {
  if (!room || !room.game || !room.game.draw) return;
  const step = room.game.draw.step;
  if (step !== 'showTake' && step !== 'showGive') return;
  const until = room.game.draw.revealUntil || Date.now();
  const wait = Math.max(50, until - Date.now());
  if (drawTimers.has(room.id)) clearTimeout(drawTimers.get(room.id));
  const roomId = room.id;
  drawTimers.set(
    roomId,
    setTimeout(() => {
      drawTimers.delete(roomId);
      const result = rooms.advanceDraw(roomId);
      if (!result.ok) return;
      broadcastRoom(result.room);
      scheduleDrawAdvance(result.room);
    }, wait)
  );
}

io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  const session = auth.getSession(token);
  if (!session) return next(new Error('未登录'));
  socket.user = session;
  socket.token = token;
  next();
});

io.on('connection', (socket) => {
  const user = socketUser(socket);

  const existing = rooms.bindSocket(user.userId, socket.id);
  if (existing) {
    socket.join(existing.id);
    broadcastRoom(existing);
  }

  socket.on('room:create', (ack) => {
    const result = rooms.createRoom(user);
    if (!result.ok) return ack && ack(result);
    const room = rooms.getRoom(result.room.id);
    rooms.bindSocket(user.userId, socket.id);
    socket.join(room.id);
    broadcastRoom(room);
    ack && ack({ ok: true, room: result.room });
  });

  socket.on('room:join', (data, ack) => {
    const result = rooms.joinRoom(user, data && data.password);
    if (!result.ok) return ack && ack(result);
    const room = rooms.getRoom(result.room.id);
    rooms.bindSocket(user.userId, socket.id);
    socket.join(room.id);
    broadcastRoom(room);
    ack && ack({ ok: true, room: result.room });
  });

  socket.on('room:leave', (ack) => {
    const before = rooms.getRoomByUser(user.userId);
    const result = rooms.leaveRoom(user.userId);
    if (before) socket.leave(before.id);
    if (result.room) broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:start', (ack) => {
    const result = rooms.startGame(user.userId);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:next', (ack) => {
    const result = rooms.nextRound(user.userId);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:play', (data, ack) => {
    const result = rooms.playCards(user.userId, (data && data.cardIds) || []);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:pass', (ack) => {
    const result = rooms.passTurn(user.userId);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:drawPick', (data, ack) => {
    const result = rooms.pickDrawTarget(user.userId, data && data.targetSeat);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    scheduleDrawAdvance(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:drawGive', (data, ack) => {
    const result = rooms.giveDrawCards(user.userId, (data && data.cardIds) || []);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    scheduleDrawAdvance(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:background', (data, ack) => {
    const result = rooms.setBackground(user.userId, data && data.file);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:sync', (ack) => {
    const room = rooms.getRoomByUser(user.userId);
    if (!room) return ack && ack({ ok: true, room: null, game: null });
    rooms.bindSocket(user.userId, socket.id);
    ack &&
      ack({
        ok: true,
        room: rooms.roomPublic(room, user.userId),
        game: rooms.gameViewFor(room, user.userId),
      });
  });

  socket.on('disconnect', () => {
    const room = rooms.setOffline(socket.id);
    if (room) broadcastRoom(room);
  });
});

server.listen(PORT, HOST, () => {
  console.log('四人扑克服务已启动: http://' + HOST + ':' + PORT);
});
