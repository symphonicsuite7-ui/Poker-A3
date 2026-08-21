/**
 * 头像：预设路径校验、上传目录
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRESETS = [
  '/avatars/preset-1.svg',
  '/avatars/preset-2.svg',
  '/avatars/preset-3.svg',
  '/avatars/preset-4.svg',
  '/avatars/preset-5.svg',
  '/avatars/preset-6.svg',
];

const UPLOAD_DIR = path.join(__dirname, 'data', 'uploads', 'avatars');
const ALLOWED_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function isPreset(avatar) {
  return PRESETS.indexOf(avatar) !== -1;
}

function isUploaded(avatar) {
  return /^\/uploads\/avatars\/[a-zA-Z0-9-]+\.(jpg|jpeg|png|gif|webp)$/i.test(
    avatar || ''
  );
}

function normalizeAvatar(avatar) {
  if (isPreset(avatar) || isUploaded(avatar)) return avatar;
  return PRESETS[0];
}

/**
 * 根据文件头判断真实图片类型
 */
function detectImageExt(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg';
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return '.png';
  }
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return '.gif';
  }
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return '.webp';
  }
  return null;
}

function saveUploadedAvatar(file) {
  if (!file || !file.buffer) {
    return { ok: false, error: '请选择头像图片' };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: '头像不能超过 2MB' };
  }
  const ext = detectImageExt(file.buffer);
  if (!ext) {
    return { ok: false, error: '仅支持 JPG / PNG / GIF / WEBP 图片' };
  }
  ensureUploadDir();
  const name = crypto.randomUUID() + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.buffer);
  return { ok: true, avatar: '/uploads/avatars/' + name };
}

module.exports = {
  PRESETS,
  UPLOAD_DIR,
  ALLOWED_MIME,
  ensureUploadDir,
  normalizeAvatar,
  saveUploadedAvatar,
  isPreset,
};
