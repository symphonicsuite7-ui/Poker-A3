/**
 * 简易用户注册 / 登录（本地 JSON 存储）
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const avatars = require('./avatars');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function uuid() {
  return crypto.randomUUID();
}

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  avatars.ensureUploadDir();
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2), 'utf8');
  }
}

function loadUsers() {
  ensureStore();
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(raw);
}

function saveUsers(data) {
  ensureStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function normalizeNickname(raw, fallbackUsername) {
  const nick = String(raw == null ? '' : raw).trim();
  if (!nick) return '';
  if (nick.length > 32) return null; // 无效
  return nick;
}

/** 展示名：有昵称用昵称，否则用户名 */
function displayName(userLike) {
  if (!userLike) return '';
  const nick = String(userLike.nickname || '').trim();
  return nick || userLike.username || '';
}

/** @type {Map<string, { userId: string, username: string, nickname: string, avatar: string, createdAt: number }>} */
const sessions = new Map();

function createSession(user) {
  const token = uuid();
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    nickname: user.nickname || '',
    avatar: avatars.normalizeAvatar(user.avatar),
    createdAt: Date.now(),
  });
  return token;
}

function getSession(token) {
  if (!token) return null;
  return sessions.get(token) || null;
}

function destroySession(token) {
  sessions.delete(token);
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname || '',
    avatar: avatars.normalizeAvatar(user.avatar),
    background: user.background || null,
  };
}

function findUserById(id) {
  const data = loadUsers();
  return data.users.find((u) => u.id === id) || null;
}

function updateUser(userId, changes) {
  const data = loadUsers();
  const user = data.users.find((u) => u.id === userId);
  if (!user) return null;
  if (Object.prototype.hasOwnProperty.call(changes, 'nickname')) {
    const nick = normalizeNickname(changes.nickname, user.username);
    if (nick === null) return { ok: false, error: '昵称过长' };
    user.nickname = nick;
    delete changes.nickname;
  }
  Object.assign(user, changes);
  saveUsers(data);
  for (const session of sessions.values()) {
    if (session.userId !== userId) continue;
    if (user.avatar) session.avatar = avatars.normalizeAvatar(user.avatar);
    session.nickname = user.nickname || '';
    session.username = user.username;
  }
  return publicUser(user);
}

/**
 * @param {string} username
 * @param {string} password
 * @param {{ avatar?: string, file?: object, nickname?: string }} [opts]
 */
function register(username, password, opts) {
  opts = opts || {};
  const name = String(username || '').trim();
  const pass = String(password || '');
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]{2,16}$/.test(name)) {
    return { ok: false, error: '用户名需 2-16 位（中文/字母/数字/下划线）' };
  }
  if (pass.length < 4 || pass.length > 32) {
    return { ok: false, error: '密码需 4-32 位' };
  }

  const nick = normalizeNickname(opts.nickname, name);
  if (nick === null) return { ok: false, error: '昵称过长' };

  let avatar = avatars.PRESETS[0];
  if (opts.file) {
    const saved = avatars.saveUploadedAvatar(opts.file);
    if (!saved.ok) return saved;
    avatar = saved.avatar;
  } else if (opts.avatar) {
    avatar = avatars.normalizeAvatar(opts.avatar);
  }

  const data = loadUsers();
  if (data.users.some((u) => u.username === name)) {
    return { ok: false, error: '用户名已存在' };
  }

  const user = {
    id: uuid(),
    username: name,
    nickname: nick || '',
    passwordHash: bcrypt.hashSync(pass, 8),
    avatar: avatar,
    createdAt: Date.now(),
  };
  data.users.push(user);
  saveUsers(data);

  const token = createSession(user);
  return { ok: true, token, user: publicUser(user) };
}

function login(username, password) {
  const name = String(username || '').trim();
  const pass = String(password || '');
  const data = loadUsers();
  const user = data.users.find((u) => u.username === name);
  if (!user || !bcrypt.compareSync(pass, user.passwordHash)) {
    return { ok: false, error: '用户名或密码错误' };
  }
  if (!user.avatar) {
    user.avatar = avatars.PRESETS[0];
    saveUsers(data);
  }
  if (user.nickname == null) user.nickname = '';
  const token = createSession(user);
  return { ok: true, token, user: publicUser(user) };
}

function authFromHeader(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const session = getSession(token);
  if (!session) return null;
  return { token, ...session };
}

module.exports = {
  register,
  login,
  getSession,
  destroySession,
  authFromHeader,
  createSession,
  findUserById,
  publicUser,
  updateUser,
  displayName,
};
