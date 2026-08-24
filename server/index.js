/**
 * 天子牌局：葵影服务端入口（可部署到云服务器）
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

const resourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
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
// 旧中文文件名 → 现盘 ASCII 文件（兼容 localStorage / list.json）
app.use('/backgrounds', (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let name = path.basename(req.path);
  try {
    name = decodeURIComponent(name);
  } catch (_e) {
    /* 保持原样 */
  }
  const real = backgrounds.resolveLegacyFile(name);
  if (!real) return next();
  return res.sendFile(path.join(backgrounds.BG_DIR, real), { maxAge: '7d' }, (err) => {
    if (err) next();
  });
});
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

app.get('/api/backgrounds', (req, res) => {
  const session = auth.authFromHeader(req);
  res.json({ ok: true, images: backgrounds.listForUser(session && session.userId) });
});

app.post('/api/resource/upload', requireAuth, (req, res) => {
  resourceUpload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ ok: false, error: err.code === 'LIMIT_FILE_SIZE' ? '图片不能超过 5MB' : err.message });
    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ ok: false, error: '请输入图片名称' });
    if (!req.file) return res.status(400).json({ ok: false, error: '请选择图片' });
    const ext = avatars.ALLOWED_MIME[req.file.mimetype];
    res.json({ ok: true, image: backgrounds.addResource(req.user.userId, name, req.file, ext) });
  });
});

app.delete('/api/resource/:id', requireAuth, (req, res) => {
  if (!backgrounds.removeResource(req.params.id, req.user.userId)) {
    return res.status(404).json({ ok: false, error: '图片不存在或无权删除' });
  }
  res.json({ ok: true });
});

app.post('/api/user/avatar', requireAuth, (req, res) => {
  const image = backgrounds.findResource(req.body.resourceId);
  if (!image) return res.status(404).json({ ok: false, error: '图片不存在' });
  const user = auth.updateUser(req.user.userId, { avatar: image.url });
  const room = rooms.refreshPlayerProfile(req.user.userId, { avatar: image.url });
  if (room) broadcastRoom(room);
  res.json({ ok: true, user });
});

app.post('/api/user/background', requireAuth, (req, res) => {
  const image = req.body.resourceId ? backgrounds.findResource(req.body.resourceId) : backgrounds.findByFile(req.body.file);
  if (!image) return res.status(404).json({ ok: false, error: '图片不存在' });
  auth.updateUser(req.user.userId, { background: { id: image.id || null, name: image.name, file: image.file, url: image.url } });
  res.json({ ok: true });
});

app.get('/api/user/info', requireAuth, (req, res) => {
  const row = auth.findUserById(req.user.userId);
  if (!row) return res.status(401).json({ ok: false, error: '请先登录' });
  res.json({ ok: true, user: auth.publicUser(row) });
});

app.post('/api/user/profile', requireAuth, (req, res) => {
  const applyProfile = (nickname, file) => {
    const changes = {};
    if (nickname != null) changes.nickname = nickname;
    if (file) {
      const saved = avatars.saveUploadedAvatar(file);
      if (!saved.ok) return res.status(400).json(saved);
      changes.avatar = saved.avatar;
    }
    const user = auth.updateUser(req.user.userId, changes);
    if (user && user.ok === false) return res.status(400).json(user);
    if (!user) return res.status(404).json({ ok: false, error: '用户不存在' });
    const room = rooms.refreshPlayerProfile(req.user.userId, {
      nickname: user.nickname,
      avatar: user.avatar,
      username: user.username,
    });
    if (room) broadcastRoom(room);
    res.json({ ok: true, user });
  };

  // 支持 JSON 与 multipart（改昵称 / 换头像）
  if (req.is('multipart/form-data')) {
    return upload.single('avatarFile')(req, res, (err) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? '头像不能超过 2MB' : err.message;
        return res.status(400).json({ ok: false, error: msg || '上传失败' });
      }
      applyProfile(req.body.nickname, req.file);
    });
  }
  applyProfile(req.body.nickname, null);
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
      nickname: req.body.nickname,
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
  const row = auth.findUserById(req.user.userId);
  if (!row) return res.status(401).json({ ok: false, error: '请先登录' });
  res.json({
    ok: true,
    user: auth.publicUser(row),
  });
});

function socketUser(socket) {
  const row = auth.findUserById(socket.user.userId);
  return {
    userId: socket.user.userId,
    username: (row && row.username) || socket.user.username,
    nickname: (row && row.nickname) || socket.user.nickname || '',
    avatar: avatars.normalizeAvatar((row && row.avatar) || socket.user.avatar),
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
  const bootUser = socketUser(socket);

  const existing = rooms.bindSocket(bootUser.userId, socket.id);
  if (existing) {
    socket.join(existing.id);
    broadcastRoom(existing);
  }

  // 每次进房取最新资料（避免改昵称后仍用连接时的用户名）
  function liveUser() {
    return socketUser(socket);
  }

  socket.on('room:create', (ack) => {
    const user = liveUser();
    const result = rooms.createRoom(user);
    if (!result.ok) return ack && ack(result);
    const room = rooms.getRoom(result.room.id);
    rooms.bindSocket(user.userId, socket.id);
    socket.join(room.id);
    broadcastRoom(room);
    ack && ack({ ok: true, room: result.room });
  });

  socket.on('room:join', (data, ack) => {
    const user = liveUser();
    const result = rooms.joinRoom(user, data && data.password);
    if (!result.ok) return ack && ack(result);
    const room = rooms.getRoom(result.room.id);
    rooms.bindSocket(user.userId, socket.id);
    socket.join(room.id);
    broadcastRoom(room);
    ack && ack({ ok: true, room: result.room });
  });

  socket.on('room:leave', (ack) => {
    const user = liveUser();
    const before = rooms.getRoomByUser(user.userId);
    const result = rooms.leaveRoom(user.userId);
    if (before) socket.leave(before.id);
    if (result.room) broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:start', (ack) => {
    const user = liveUser();
    const result = rooms.startGame(user.userId);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:next', (ack) => {
    const user = liveUser();
    const result = rooms.nextRound(user.userId);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:play', (data, ack) => {
    const user = liveUser();
    const result = rooms.playCards(user.userId, (data && data.cardIds) || []);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:pass', (ack) => {
    const user = liveUser();
    const result = rooms.passTurn(user.userId);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:drawPick', (data, ack) => {
    const user = liveUser();
    const result = rooms.pickDrawTarget(user.userId, data && data.targetSeat);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    scheduleDrawAdvance(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:drawDevour', (ack) => {
    const user = liveUser();
    const result = rooms.devourDraw(user.userId);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    scheduleDrawAdvance(result.room);
    ack && ack({ ok: true });
  });

  socket.on('game:drawGive', (data, ack) => {
    const user = liveUser();
    const result = rooms.giveDrawCards(
      user.userId,
      (data && data.cardIds) || [],
      data && data.targetSeat
    );
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    scheduleDrawAdvance(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:background', (data, ack) => {
    const user = liveUser();
    const result = rooms.setBackground(user.userId, data && data.file);
    if (!result.ok) return ack && ack(result);
    broadcastRoom(result.room);
    ack && ack({ ok: true });
  });

  socket.on('room:sync', (ack) => {
    const user = liveUser();
    const room = rooms.getRoomByUser(user.userId);
    if (!room) return ack && ack({ ok: true, room: null, game: null });
    // 同步时刷新本座位昵称/头像
    rooms.refreshPlayerProfile(user.userId, {
      nickname: user.nickname,
      avatar: user.avatar,
      username: user.username,
    });
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
  console.log('天子牌局：葵影服务已启动: http://' + HOST + ':' + PORT);
});
