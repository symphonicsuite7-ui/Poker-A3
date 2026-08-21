/**
 * 背景图库：全界面按钮、选图确认、应用背景
 */
(function (global) {
  const STORAGE_KEY = 'poker_bg';
  let images = [];
  let onPicked = null;
  let overlay = null;
  let grid = null;

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
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item' + (image.file === current ? ' active' : '');
      btn.innerHTML =
        '<img src="' +
        image.url +
        '" alt="' +
        image.name +
        '" /><span>' +
        image.name +
        '</span>';
      btn.addEventListener('click', function () {
        if (!confirm('确定将背景图修改为「' + image.name + '」吗？')) return;
        applyBackground(image.url);
        saveLocal(image);
        close();
        if (typeof onPicked === 'function') onPicked(image);
      });
      grid.appendChild(btn);
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

  function loadAndRender() {
    fetch('/backgrounds/list.json')
      .then(function (res) {
        if (!res.ok) throw new Error('no list');
        return res.json();
      })
      .then(useList)
      .catch(function () {
        fetch('/api/backgrounds')
          .then(function (res) {
            if (!res.ok) throw new Error('no api');
            return res.json();
          })
          .then(useList)
          .catch(function () {
            images = builtinImages();
            renderGrid();
          });
      });
  }

  function ensureDom() {
    if (document.getElementById('btn-gallery')) return;
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'btn-gallery';
    fab.className = 'gallery-fab';
    fab.textContent = '图库';
    fab.addEventListener('click', open);

    overlay = document.createElement('div');
    overlay.id = 'gallery-overlay';
    overlay.className = 'gallery-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="gallery-panel">' +
      '<div class="gallery-head"><h2>背景图库</h2>' +
      '<button type="button" class="btn btn-ghost" id="btn-gallery-close">关闭</button></div>' +
      '<div id="gallery-grid" class="gallery-grid"></div></div>';
    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) close();
    });

    document.body.appendChild(fab);
    document.body.appendChild(overlay);
    grid = overlay.querySelector('#gallery-grid');
    overlay.querySelector('#btn-gallery-close').addEventListener('click', close);
  }

  function mount(opts) {
    opts = opts || {};
    onPicked = opts.onPicked || null;
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
