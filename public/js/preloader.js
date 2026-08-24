(function (global) {
  'use strict';

  const loaded = new Set();
  const failedUrls = new Set();
  const pending = new Map();
  let overlay = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'asset-loading';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="asset-loading-panel" role="status" aria-live="polite">' +
      '<div class="asset-loading-spinner" aria-hidden="true"></div>' +
      '<div class="asset-loading-title">正在准备牌局</div>' +
      '<div class="asset-loading-progress"><span></span></div>' +
      '<div class="asset-loading-count">正在加载资源</div>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function show() {
    ensureOverlay().hidden = false;
  }

  function hide() {
    if (overlay) overlay.hidden = true;
  }

  function setProgress(done, total) {
    const host = ensureOverlay();
    const percent = total ? Math.round((done / total) * 100) : 100;
    host.querySelector('.asset-loading-progress span').style.width = percent + '%';
    host.querySelector('.asset-loading-count').textContent =
      total ? '正在加载资源 ' + done + ' / ' + total : '资源准备完成';
  }

  function loadImage(url) {
    if (!url || loaded.has(url)) return Promise.resolve(true);
    if (failedUrls.has(url)) return Promise.resolve(false);
    if (pending.has(url)) return pending.get(url);
    const task = new Promise((resolve) => {
      const img = new Image();
      let finished = false;
      const timeoutId = setTimeout(() => finish(false), 15000);
      function finish(ok) {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
        if (ok) loaded.add(url);
        else failedUrls.add(url);
        resolve(ok);
      }
      img.onload = async function () {
        try {
          if (img.decode) await img.decode();
        } catch (e) {
          // onload 已确认资源可用，部分旧浏览器不支持可靠的 decode。
        }
        finish(true);
      };
      img.onerror = function () {
        finish(false);
      };
      img.src = url;
    }).finally(() => pending.delete(url));
    pending.set(url, task);
    return task;
  }

  function cardUrls() {
    if (!global.PokerCards) return [];
    return global.PokerCards.createDeck().map(global.PokerCards.cardImageUrl);
  }

  async function prepare(extraUrls) {
    const urls = Array.from(new Set(cardUrls().concat(extraUrls || []).filter(Boolean)));
    const missing = urls.filter((url) => !loaded.has(url) && !failedUrls.has(url));
    if (!missing.length) return { total: urls.length, failed: 0 };

    show();
    setProgress(0, missing.length);
    let done = 0;
    let failed = 0;
    await Promise.all(
      missing.map((url) =>
        loadImage(url).then((ok) => {
          done += 1;
          if (!ok) failed += 1;
          setProgress(done, missing.length);
        })
      )
    );
    return { total: missing.length, failed: failed };
  }

  global.PokerPreloader = {
    prepare: prepare,
    show: show,
    hide: hide,
  };
})(window);
