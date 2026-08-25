/**
 * 像素火焰粒子（来自 resourse/pixel-fire）
 * 仅在轮到自己时播放；不参与开局加载门禁
 *
 * 左右/高低请改 CSS 变量（style.css .hand-fire-canvas）：
 * --fire-left --fire-right --fire-bottom --fire-height --fire-opacity
 * 不要写死 width:xxxpx，否则左右调不动。
 */
(function (global) {
  'use strict';

  /**
   * 粒子外观（颜色/形状）与运动都在这里调。
   * sparkShape: 'square' 方块 | 'circle' 圆 | 'diamond' 菱形
   * colorMode: 'fire' 橙红火焰 | 'gold' 金黄 | 'cyan' 青绿 | 'custom' 用下面 customRgb
   */
  const DEFAULT_CONFIG = {
    sparkFreq: 1,
    meanSparkSize: 0.00001,
    meanSparkLife: 2000,
    meanSparkVelocity: [2.5, 20],
    sparkSizeVariation: 40,
    sparkBlink: 20,
    floorHeight: 0.05,
    sparkShape: 'circle',
    colorMode: 'fire',
    // colorMode === 'custom' 时生效：每通道 [最小, 最大]
    customRgb: {
      r: [180, 255],
      g: [40, 120],
      b: [0, 40],
    },
    // 底部火带颜色（仍偏红）；不想要火带可把 showFloor 设 false
    showFloor: false,
    floorRgb: [70, 0, 0],
  };

  function randChannel(range) {
    const a = range[0];
    const b = range[1];
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function pickSparkColor(config) {
    const mode = config.colorMode || 'fire';
    if (mode === 'gold') {
      return [randChannel([200, 255]), randChannel([140, 200]), randChannel([20, 80])];
    }
    if (mode === 'cyan') {
      return [randChannel([20, 100]), randChannel([160, 230]), randChannel([180, 255])];
    }
    if (mode === 'custom' && config.customRgb) {
      return [
        randChannel(config.customRgb.r || [180, 255]),
        randChannel(config.customRgb.g || [40, 120]),
        randChannel(config.customRgb.b || [0, 40]),
      ];
    }
    // 默认橙红火焰：R 高、G 中低、B≈0
    return [
      Math.floor(Math.random() * 155) + 100,
      Math.floor(Math.random() * 80),
      0,
    ];
  }

  function Spark(ctx, x, y, config) {
    this.ctx = ctx;
    this.pos = [x, y];
    this.size = config.meanSparkSize + (Math.random() - 0.5) * config.sparkSizeVariation;
    this.v = [
      config.meanSparkVelocity[0] * (Math.random() - 0.5),
      -1 * config.meanSparkVelocity[1] * Math.random(),
    ];
    this.c = pickSparkColor(config);
    this.life = this.lifeOrig = Math.max(1, Math.floor(config.meanSparkLife * Math.random()));
    this.config = config;
  }

  Spark.prototype.move = function () {
    for (let i = 0; i < 2; i++) {
      this.pos[i] += this.v[i] * (1 - this.life / this.lifeOrig);
    }
  };

  Spark.prototype.getAlpha = function () {
    return (
      Math.sqrt(this.life / this.lifeOrig) +
      (Math.random() - 0.5) / this.config.sparkBlink
    );
  };

  Spark.prototype.draw = function () {
    const s = this.size;
    const x = this.pos[0];
    const y = this.pos[1];
    const shape = this.config.sparkShape || 'square';
    this.ctx.fillStyle =
      'rgba(' + this.c[0] + ', ' + this.c[1] + ', ' + this.c[2] + ', ' + this.getAlpha() + ')';
    this.ctx.beginPath();
    if (shape === 'circle') {
      this.ctx.arc(x + s / 2, y + s / 2, Math.max(0.5, s / 2), 0, Math.PI * 2);
    } else if (shape === 'diamond') {
      const cx = x + s / 2;
      const cy = y + s / 2;
      const r = s / 2;
      this.ctx.moveTo(cx, cy - r);
      this.ctx.lineTo(cx + r, cy);
      this.ctx.lineTo(cx, cy + r);
      this.ctx.lineTo(cx - r, cy);
      this.ctx.closePath();
    } else {
      // square
      this.ctx.rect(x, y, s, s);
    }
    this.ctx.fill();
  };

  Spark.prototype.update = function () {
    this.move();
    if (!this.life--) return true;
    this.draw();
    return false;
  };

  function Fire(ctx, canvas, y, config) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.y = y;
    this.r = (config.floorRgb && config.floorRgb[0]) || 70;
    this.config = config;
    this.sparks = [];
  }

  Fire.prototype.spark = function (x) {
    this.sparks.push(new Spark(this.ctx, x, this.y, this.config));
  };

  Fire.prototype.updateColor = function () {
    this.r += (Math.random() - 0.5) * 10;
    const base = (this.config.floorRgb && this.config.floorRgb[0]) || 70;
    this.r = Math.round(Math.min(base + 20, Math.max(base - 10, this.r)));
  };

  Fire.prototype.update = function () {
    if (this.config.showFloor !== false) {
      this.updateColor();
      const fr = this.config.floorRgb || [70, 0, 0];
      this.ctx.beginPath();
      this.ctx.rect(0, this.y, this.canvas.width, Math.max(1, this.config.meanSparkSize));
      this.ctx.fillStyle = 'rgba(' + this.r + ', ' + fr[1] + ', ' + fr[2] + ', 1)';
      this.ctx.fill();
    }
    for (let i = 0; i < this.sparks.length; i++) {
      if (this.sparks[i].update()) {
        this.sparks.splice(i, 1);
        i -= 1;
      }
    }
  };

  let readyPromise = null;
  let hostEl = null;
  let canvas = null;
  let ctx = null;
  let fire = null;
  let config = null;
  let rafId = 0;
  let running = false;
  let resizeObs = null;
  let resizeScheduled = false;

  function requestFrame(cb) {
    const raf =
      global.requestAnimationFrame ||
      global.webkitRequestAnimationFrame ||
      global.mozRequestAnimationFrame ||
      function (fn) {
        return global.setTimeout(fn, 1000 / 60);
      };
    return raf.call(global, cb);
  }

  function cancelFrame(id) {
    const caf = global.cancelAnimationFrame || global.clearTimeout;
    caf.call(global, id);
  }

  function buildConfig(width) {
    const cfg = {};
    for (const k in DEFAULT_CONFIG) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG, k)) cfg[k] = DEFAULT_CONFIG[k];
    }
    cfg.meanSparkSize = Math.max(2, width * cfg.meanSparkSize);
    return cfg;
  }

  function resizeToHost() {
    if (!hostEl || !canvas || !ctx) return;

    // 清掉内联宽高，让 CSS left/right/height 重新参与布局
    canvas.style.width = '';
    canvas.style.height = '';
    canvas.style.left = '';
    canvas.style.right = '';
    canvas.style.bottom = '';

    const parentW = hostEl.clientWidth || 0;
    const cs = global.getComputedStyle(canvas);
    const insetL = parseFloat(cs.left) || 0;
    const insetR = parseFloat(cs.right) || 0;
    const cssH = parseFloat(cs.height) || 160;
    let w = Math.floor(parentW - insetL - insetR);
    if (!(w > 40)) w = Math.max(40, Math.floor(parentW * 0.9) || 40);
    const h = Math.max(48, Math.floor(cssH));

    if (canvas.width === w && canvas.height === h && fire) return;

    canvas.width = w;
    canvas.height = h;
    // 关键 canvas.width 后浏览器会把显示宽度钉成位图像素，必须写回，否则左右 CSS 失效
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.style.left = insetL + 'px';
    canvas.style.right = 'auto';
    canvas.style.bottom = cs.bottom || '4px';

    config = buildConfig(w);
    fire = new Fire(ctx, canvas, h - h * config.floorHeight, config);
  }

  /** 清空火花，从火源底部重新升起（仅重建空对象，不卡加载） */
  function resetFireFromBottom() {
    if (!ctx || !canvas) return;
    if (!config) config = buildConfig(canvas.width || 100);
    const h = canvas.height || 160;
    fire = new Fire(ctx, canvas, h - h * config.floorHeight, config);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function loop() {
    if (!running || !ctx || !fire || !canvas || !config) return;
    rafId = requestFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fire.update();
    for (let i = 0; i < config.sparkFreq; i++) {
      fire.spark(Math.random() * canvas.width);
    }
  }

  function ensureCanvas(parent) {
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'hand-fire-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      ctx = canvas.getContext('2d');
    }
    const mount =
      (parent && parent.id === 'seat-bottom' && parent) ||
      (parent && parent.closest && parent.closest('#seat-bottom')) ||
      parent;
    if (canvas.parentNode !== mount) {
      mount.appendChild(canvas);
    }
    hostEl = mount;
    resizeToHost();
    if (typeof ResizeObserver !== 'undefined') {
      if (resizeObs) resizeObs.disconnect();
      resizeObs = new ResizeObserver(function () {
        if (resizeScheduled) return;
        resizeScheduled = true;
        requestFrame(function () {
          resizeScheduled = false;
          resizeToHost();
        });
      });
      resizeObs.observe(mount);
    }
  }

  function start(parent) {
    if (!parent) return;
    try {
      ensureCanvas(parent);
      canvas.hidden = false;
      resizeToHost();
      // 已在播则保持，避免每帧 render 重置；从停到开则从底部重来
      if (running) return;
      resetFireFromBottom();
      running = true;
      cancelFrame(rafId);
      loop();
    } catch (e) {
      running = false;
    }
  }

  function preload() {
    if (readyPromise) return readyPromise;
    readyPromise = Promise.resolve(true);
    return readyPromise;
  }

  function stop() {
    running = false;
    cancelFrame(rafId);
    rafId = 0;
    if (fire) fire.sparks = [];
    if (canvas) {
      canvas.hidden = true;
      if (ctx && canvas.width) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function syncMyTurn(active, mountEl) {
    if (!active || !mountEl) {
      stop();
      return;
    }
    start(mountEl);
  }

  global.PokerPixelFire = {
    preload: preload,
    start: start,
    stop: stop,
    syncMyTurn: syncMyTurn,
    resize: resizeToHost,
  };
})(window);
