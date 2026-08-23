/**
 * 背景图库：读取 public/backgrounds 目录
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

function displayName(file) {
  return path.basename(file, path.extname(file));
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
  const name = path.basename(String(file || ''));
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
};
