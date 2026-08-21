/**
 * 手机端：尽量锁定横屏，竖屏时提示旋转
 */
(function () {
  function ensureHint() {
    if (document.getElementById('rotate-hint')) return;
    const el = document.createElement('div');
    el.id = 'rotate-hint';
    el.className = 'rotate-hint';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="rotate-hint-box">' +
      '<div class="rotate-icon" aria-hidden="true">📱</div>' +
      '<p>请将手机横过来游玩</p>' +
      '</div>';
    document.body.appendChild(el);
  }

  function tryLockLandscape() {
    try {
      const ori = screen.orientation;
      if (ori && typeof ori.lock === 'function') {
        ori.lock('landscape').catch(function () {});
      }
    } catch (e) {}
  }

  function boot() {
    document.documentElement.classList.add('mobile-ready');
    ensureHint();
    tryLockLandscape();
    window.addEventListener('orientationchange', tryLockLandscape);
    document.addEventListener('click', tryLockLandscape, { once: true });
    document.addEventListener('touchend', tryLockLandscape, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
