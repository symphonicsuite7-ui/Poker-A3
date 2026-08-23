/**
 * 背景图库：全界面按钮、选图确认、应用背景
 */
(function (global) {
  const STORAGE_KEY = 'poker_bg';
  let images = [];
  let onPicked = null;
  let getToken = null;
  let overlay = null;
  let grid = null;
  let actionDialog = null;
  let uploadDialog = null;

  function applyBackground(url) {
    const els = [document.documentElement, document.body];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!url) {
        el.classList.remove('has-bg-image');
        el.style.backgroundImage = '';
        el.style.backgroundSize = '';
        el.style.backgroundPosition = '';
        el.style.backgroundRepeat = '';
        el.style.backgroundAttachment = '';
      } else {
        el.classList.add('has-bg-image');
        el.style.backgroundImage = 'url("' + url + '")';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundAttachment = 'fixed';
      }
    }
  }

  function saveLocal(image) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(image));
    } catch (e) {}
  }

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && saved.url) applyBackground(saved.url);
    } catch (e) {}
  }

  function currentFile() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return saved && saved.file ? saved.file : '';
    } catch (e) {
      return '';
    }
  }

  function close() {
    if (overlay) overlay.hidden = true;
  }

  function open() {
    if (overlay) overlay.hidden = false;
    loadAndRender();
  }

  function renderGrid() {
    if (!grid) return;
    const current = currentFile();
    grid.innerHTML = '';
    if (!images.length) {
      grid.innerHTML = '<p class="gallery-empty">图库里还没有图片</p>';
      return;
    }
    images.forEach((image) => {
      const wrap = document.createElement('div');
      wrap.className = 'gallery-item-wrap';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item' + (image.file === current ? ' active' : '');
      const img = document.createElement('img');
      img.src = image.url;
      img.alt = image.name;
      const label = document.createElement('span');
      label.textContent = image.name + (image.mine ? ' · 我的' : '');
      btn.appendChild(img);
      btn.appendChild(label);
      btn.addEventListener('click', function () {
        openActions(image);
      });
      wrap.appendChild(btn);
      grid.appendChild(wrap);
    });
  }

  function builtinImages() {
    const files = [
      '烧烤-掌中宝.jpg',
      '烧烤-烤橘子.jpg',
      '烧烤-烤橘子2.jpg',
      '烧烤-烤肠.jpg',
      '烧烤.jpg',
      '配置山-合影.jpg',
      '配置山-明媚.jpg',
      '配置山-明媚2.jpg',
      '配置山-明媚3.jpg',
      '配置山-雨云.jpg',
      '配置山-雨云2.jpg',
      '配置山-黄昏.jpg',
      '配置山-黄昏2.jpg',
    ];
    return files.map(function (file) {
      return {
        name: file.replace(/\.[^.]+$/, ''),
        file: file,
        url: '/backgrounds/' + encodeURIComponent(file),
      };
    });
  }

  function useList(data) {
    const list = data && data.images ? data.images : [];
    images = list.length ? list : builtinImages();
    renderGrid();
  }

  function authHeaders() {
    const headers = {};
    const t = typeof getToken === 'function' ? getToken() : '';
    if (t) headers.Authorization = 'Bearer ' + t;
    return headers;
  }

  function loadAndRender() {
    fetch('/api/backgrounds', { headers: authHeaders() })
      .then(function (res) {
        if (!res.ok) throw new Error('no api');
        return res.json();
      })
      .then(useList)
      .catch(function () {
        fetch('/backgrounds/list.json')
          .then(function (res) {
            if (!res.ok) throw new Error('no list');
            return res.json();
          })
          .then(useList)
          .catch(function () {
            images = builtinImages();
            renderGrid();
          });
      });
  }

  async function deleteMine(image) {
    if (!confirm('删除「' + image.name + '」？')) return;
    const res = await fetch('/api/resource/' + image.id, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json().catch(function () {
      return { ok: false };
    });
    if (!data.ok) {
      alert(data.error || '删除失败');
      return;
    }
    actionDialog.hidden = true;
    if (currentFile() === image.file) {
      localStorage.removeItem(STORAGE_KEY);
      applyBackground('');
    }
    loadAndRender();
  }

  async function uploadFile(file, name) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('图片不能超过 5MB');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    form.append('name', name);
    const res = await fetch('/api/resource/upload', {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    const data = await res.json().catch(function () {
      return { ok: false, error: '上传失败' };
    });
    if (!data.ok) {
      alert(data.error || '上传失败');
      return;
    }
    uploadDialog.hidden = true;
    loadAndRender();
  }

  function openActions(image) {
    actionDialog.hidden = false;
    actionDialog.querySelector('.gallery-action-preview').src = image.url;
    actionDialog.querySelector('.gallery-action-title').textContent = image.name;
    const del = actionDialog.querySelector('#btn-gallery-delete');
    del.hidden = !(image.mine && image.id);
    actionDialog.querySelector('#btn-gallery-wallpaper').onclick = async function () {
      applyBackground(image.url);
      saveLocal(image);
      if (typeof onPicked === 'function') await onPicked(image);
      actionDialog.hidden = true;
      close();
      renderGrid();
    };
    actionDialog.querySelector('#btn-gallery-avatar').onclick = async function () {
      if (!image.id) {
        alert('请先将图片添加到“我的图片”，再设为头像');
        return;
      }
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()),
        body: JSON.stringify({ resourceId: image.id }),
      });
      const data = await res.json().catch(function () { return { ok: false }; });
      if (!data.ok) return alert(data.error || '设置头像失败');
      actionDialog.hidden = true;
      window.dispatchEvent(new CustomEvent('poker:avatar-changed', { detail: data.user }));
      alert('头像已更新');
    };
    del.onclick = function () { deleteMine(image); };
  }

  function ensureDom() {
    if (overlay) return;

    let fab = document.getElementById('btn-gallery');
    if (!fab) {
      fab = document.createElement('button');
      fab.type = 'button';
      fab.id = 'btn-gallery';
      fab.className = 'gallery-fab';
      fab.textContent = '图库';
      document.body.appendChild(fab);
    }
    fab.addEventListener('click', open);

    overlay = document.createElement('div');
    overlay.id = 'gallery-overlay';
    overlay.className = 'gallery-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="gallery-panel">' +
      '<div class="gallery-head"><h2>背景图库</h2>' +
      '<div class="gallery-head-actions">' +
      '<button type="button" class="btn btn-primary gallery-upload" id="btn-gallery-add">添加图片</button>' +
      '<button type="button" class="btn btn-ghost" id="btn-gallery-close">关闭</button>' +
      '</div></div>' +
      '<div id="gallery-grid" class="gallery-grid"></div></div>';
    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) close();
    });

    document.body.appendChild(overlay);
    grid = overlay.querySelector('#gallery-grid');
    overlay.querySelector('#btn-gallery-close').addEventListener('click', close);
    overlay.querySelector('#btn-gallery-add').addEventListener('click', function () {
      if (!(typeof getToken === 'function' && getToken())) {
        alert('请先登录后再添加图片');
        return;
      }
      uploadDialog.hidden = false;
      uploadDialog.querySelector('#gallery-name').value = '';
      uploadDialog.querySelector('#gallery-file').value = '';
    });

    actionDialog = document.createElement('div');
    actionDialog.className = 'gallery-overlay gallery-dialog';
    actionDialog.hidden = true;
    actionDialog.innerHTML = '<div class="gallery-dialog-panel"><img class="gallery-action-preview" alt="" />' +
      '<h3 class="gallery-action-title"></h3><div class="gallery-dialog-actions">' +
      '<button class="btn btn-primary" id="btn-gallery-wallpaper">设为壁纸</button>' +
      '<button class="btn" id="btn-gallery-avatar">设为头像</button>' +
      '<button class="btn btn-danger" id="btn-gallery-delete">删除</button>' +
      '<button class="btn btn-ghost" data-close>取消</button></div></div>';
    document.body.appendChild(actionDialog);
    actionDialog.querySelector('[data-close]').onclick = function () { actionDialog.hidden = true; };

    uploadDialog = document.createElement('div');
    uploadDialog.className = 'gallery-overlay gallery-dialog';
    uploadDialog.hidden = true;
    uploadDialog.innerHTML = '<form class="gallery-dialog-panel" id="gallery-upload-form"><h3>添加图片</h3>' +
      '<label class="gallery-field">图片名称<input id="gallery-name" maxlength="30" required placeholder="请输入图片名称" /></label>' +
      '<label class="gallery-field">选择图片<input id="gallery-file" type="file" required accept="image/jpeg,image/png,image/gif,image/webp" /></label>' +
      '<div class="gallery-dialog-actions"><button class="btn btn-primary" type="submit">上传</button>' +
      '<button class="btn btn-ghost" type="button" data-close>取消</button></div></form>';
    document.body.appendChild(uploadDialog);
    uploadDialog.querySelector('[data-close]').onclick = function () { uploadDialog.hidden = true; };
    uploadDialog.querySelector('form').onsubmit = function (ev) {
      ev.preventDefault();
      const name = uploadDialog.querySelector('#gallery-name').value.trim();
      const file = uploadDialog.querySelector('#gallery-file').files[0];
      if (name && file) uploadFile(file, name);
    };
  }

  function mount(opts) {
    opts = opts || {};
    onPicked = opts.onPicked || null;
    getToken = opts.getToken || null;
    ensureDom();
    restore();
  }

  restore();

  global.PokerGallery = {
    mount: mount,
    applyBackground: applyBackground,
    restore: restore,
    saveLocal: saveLocal,
  };
})(window);
