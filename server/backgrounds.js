/**
 * 背景图库：读取 public/backgrounds 目录
 * 磁盘文件为 ASCII 名（bg-*.jpg），展示名仍用中文；兼容旧中文路径
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BG_DIR = path.join(__dirname, '..', 'public', 'backgrounds');
const RESOURCE_DIR = path.join(__dirname, 'data', 'uploads', 'resources');
const RESOURCE_FILE = path.join(__dirname, 'data', 'resources.json');
const ALLOWED = {
  '.jpg': true,
  '.jpeg': true,
  '.png': true,
  '.gif': true,
  '.webp': true,
  '.bmp': true,
};

/** 文件名 → 中文展示名 */
const DISPLAY_NAMES = {
  'bg-shaokao-zhangzhongbao.jpg': '烧烤-掌中宝',
  'bg-shaokao-kaojuzi.jpg': '烧烤-烤橘子',
  'bg-shaokao-kaojuzi-2.jpg': '烧烤-烤橘子2',
  'bg-shaokao-kaochang.jpg': '烧烤-烤肠',
  'bg-shaokao.jpg': '烧烤',
  'bg-peizhishan-heying.jpg': '配置山-合影',
  'bg-peizhishan-mingmei.jpg': '配置山-明媚',
  'bg-peizhishan-mingmei-2.jpg': '配置山-明媚2',
  'bg-peizhishan-mingmei-3.jpg': '配置山-明媚3',
  'bg-peizhishan-yuyun.jpg': '配置山-雨云',
  'bg-peizhishan-yuyun-2.jpg': '配置山-雨云2',
  'bg-peizhishan-huanghun.jpg': '配置山-黄昏',
  'bg-peizhishan-huanghun-2.jpg': '配置山-黄昏2',
};

/** 旧中文文件名 → 现盘文件名（本地缓存 / 旧 list.json） */
const LEGACY_TO_FILE = {
  '烧烤-掌中宝.jpg': 'bg-shaokao-zhangzhongbao.jpg',
  '烧烤-烤橘子.jpg': 'bg-shaokao-kaojuzi.jpg',
  '烧烤-烤橘子2.jpg': 'bg-shaokao-kaojuzi-2.jpg',
  '烧烤-烤肠.jpg': 'bg-shaokao-kaochang.jpg',
  '烧烤.jpg': 'bg-shaokao.jpg',
  '配置山-合影.jpg': 'bg-peizhishan-heying.jpg',
  '配置山-明媚.jpg': 'bg-peizhishan-mingmei.jpg',
  '配置山-明媚2.jpg': 'bg-peizhishan-mingmei-2.jpg',
  '配置山-明媚3.jpg': 'bg-peizhishan-mingmei-3.jpg',
  '配置山-雨云.jpg': 'bg-peizhishan-yuyun.jpg',
  '配置山-雨云2.jpg': 'bg-peizhishan-yuyun-2.jpg',
  '配置山-黄昏.jpg': 'bg-peizhishan-huanghun.jpg',
  '配置山-黄昏2.jpg': 'bg-peizhishan-huanghun-2.jpg',
};

function displayName(file) {
  if (DISPLAY_NAMES[file]) return DISPLAY_NAMES[file];
  return path.basename(file, path.extname(file));
}

/** 规范化请求中的文件名（含旧中文别名） */
function resolveFilename(file) {
  const name = path.basename(String(file || ''));
  return LEGACY_TO_FILE[name] || name;
}

/** 若为旧中文路径且盘上有对应新文件，返回新文件名；否则 null */
function resolveLegacyFile(file) {
  const name = path.basename(String(file || ''));
  const mapped = LEGACY_TO_FILE[name];
  if (!mapped) return null;
  if (!fs.existsSync(path.join(BG_DIR, mapped))) return null;
  return mapped;
}

function listBackgrounds() {
  if (!fs.existsSync(BG_DIR)) return [];
  return fs
    .readdirSync(BG_DIR)
    .filter((file) => ALLOWED[path.extname(file).toLowerCase()])
    .map((file) => ({
      name: displayName(file),
      file: file,
      url: '/backgrounds/' + encodeURIComponent(file),
    }));
}

function findByFile(file) {
  const name = resolveFilename(file);
  return listBackgrounds().find((item) => item.file === name) || null;
}

function loadResources() {
  if (!fs.existsSync(RESOURCE_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(RESOURCE_FILE, 'utf8')).resources || []; } catch (_e) { return []; }
}

function saveResources(resources) {
  fs.mkdirSync(path.dirname(RESOURCE_FILE), { recursive: true });
  fs.writeFileSync(RESOURCE_FILE, JSON.stringify({ resources }, null, 2), 'utf8');
}

function listForUser(userId) {
  return listBackgrounds().concat(loadResources().map((item) => ({
    ...item,
    mine: item.userId === userId,
  })));
}

function addResource(userId, name, file, ext) {
  fs.mkdirSync(RESOURCE_DIR, { recursive: true });
  const id = crypto.randomUUID();
  const filename = id + ext;
  fs.writeFileSync(path.join(RESOURCE_DIR, filename), file.buffer);
  const item = {
    id,
    userId,
    name: String(name || '').trim().slice(0, 30),
    file: filename,
    url: '/uploads/resources/' + filename,
    createdAt: Date.now(),
  };
  const resources = loadResources();
  resources.push(item);
  saveResources(resources);
  return item;
}

function findResource(id) {
  return loadResources().find((item) => item.id === id) || null;
}

function removeResource(id, userId) {
  const resources = loadResources();
  const item = resources.find((entry) => entry.id === id);
  if (!item || item.userId !== userId) return false;
  saveResources(resources.filter((entry) => entry.id !== id));
  const target = path.join(RESOURCE_DIR, path.basename(item.file));
  if (fs.existsSync(target)) fs.unlinkSync(target);
  return true;
}

module.exports = {
  BG_DIR,
  listBackgrounds,
  findByFile,
  listForUser,
  addResource,
  findResource,
  removeResource,
  resolveLegacyFile,
  resolveFilename,
};
