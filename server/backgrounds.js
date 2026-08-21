/**
 * 背景图库：读取 public/backgrounds 目录
 */
const fs = require('fs');
const path = require('path');

const BG_DIR = path.join(__dirname, '..', 'public', 'backgrounds');
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

module.exports = {
  BG_DIR,
  listBackgrounds,
  findByFile,
};
