/**
 * 前端：登录、房间、对局（Socket.io）
 */
(function () {
  const TOKEN_KEY = 'poker_token';
  const USER_KEY = 'poker_user';

  const SUITS = PokerCards.SUITS;
  const RANKS = PokerCards.RANKS;

  let token = localStorage.getItem(TOKEN_KEY) || '';
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch (e) {
    user = null;
  }

  let socket = null;
  let room = null;
  let game = null;
  let selected = {};
  let authMode = 'login';
  let customAvatarFile = null;
  let lastEventCount = 0;
  let lastAnimatedPlayKey = '';
  /** 吞噬还牌：已点「还牌」、等待点选对象 */
  let pendingGivePick = false;
  let gameEntryVersion = 0;

  const $ = (id) => document.getElementById(id);
  /** 节点可能已从牌桌中间移除，写入前先判断 */
  const setText = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };

  const LETTER_COLORS = ['#3d5a80', '#2f6b4f', '#6b4a2f', '#4a3d6b', '#6b3d4a', '#2f5a6b'];

  function firstChar(text) {
    const s = (text || '').trim();
    return s ? s.charAt(0).toUpperCase() : '?';
  }

  function letterColor(ch) {
    let h = 0;
    for (let i = 0; i < ch.length; i++) h = (h * 31 + ch.charCodeAt(i)) >>> 0;
    return LETTER_COLORS[h % LETTER_COLORS.length];
  }

  function avatarSrc(url) {
    return url || '';
  }

  /** 渲染头像：有图用 img，否则用名字首字 */
  function avatarImg(url, extraClass, nameHint) {
    const cls = 'avatar' + (extraClass ? ' ' + extraClass : '');
    if (url) {
      return '<img class="' + cls + '" src="' + url + '" alt="" />';
    }
    const ch = firstChar(nameHint);
    return (
      '<span class="' +
      cls +
      ' avatar-letter" style="background:' +
      letterColor(ch) +
      '">' +
      ch +
      '</span>'
    );
  }

  function refreshAuthLetterPreview() {
    const letterEl = $('avatar-letter');
    if (!letterEl) return;
    const name = $('auth-username').value.trim() || $('auth-nickname').value.trim();
    const ch = firstChar(name);
    letterEl.textContent = ch;
    letterEl.style.background = letterColor(ch);
  }

  function showAuthLetterPreview() {
    customAvatarFile = null;
    if ($('auth-avatar-file')) $('auth-avatar-file').value = '';
    if ($('avatar-preview')) {
      $('avatar-preview').hidden = true;
      $('avatar-preview').removeAttribute('src');
    }
    if ($('avatar-letter')) $('avatar-letter').hidden = false;
    if ($('btn-clear-avatar')) $('btn-clear-avatar').hidden = true;
    refreshAuthLetterPreview();
  }

  function showAuthUploadPreview(url) {
    if ($('avatar-letter')) $('avatar-letter').hidden = true;
    if ($('avatar-preview')) {
      $('avatar-preview').hidden = false;
      $('avatar-preview').src = url;
    }
    if ($('btn-clear-avatar')) $('btn-clear-avatar').hidden = false;
  }

  function setLobbyAvatar(url, name) {
    const host = $('lobby-avatar');
    if (!host) return;
    host.innerHTML = avatarImg(url, '', name || '');
  }

  let drawTickId = null;

  function renderDrawCardGroups(list, actorKey, otherKey, verb) {
    let html = '';
    for (let i = 0; i < (list || []).length; i++) {
      const t = list[i];
      const actor = game.players[t[actorKey]];
      const other = game.players[t[otherKey]];
      html +=
        '<div class="draw-card-group"><div class="group-title">' +
        actor.name +
        ' ' +
        verb +
        ' ' +
        other.name +
        '</div><div class="draw-cards-scroll">' +
        '<button type="button" class="draw-scroll-btn draw-scroll-prev" aria-label="向左">‹</button>' +
        '<div class="log-cards">' +
        cardsRowHtml(t.cards) +
        '</div>' +
        '<button type="button" class="draw-scroll-btn draw-scroll-next" aria-label="向右">›</button>' +
        '</div></div>';
    }
    return html;
  }

  /** 抽牌公示：牌过多时用左右按钮横向滚动 */
  function bindDrawCardsScroll(root) {
    if (!root) return;
    const rows = root.querySelectorAll('.draw-cards-scroll');
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const track = row.querySelector('.log-cards');
      const prev = row.querySelector('.draw-scroll-prev');
      const next = row.querySelector('.draw-scroll-next');
      if (!track || !prev || !next) continue;
      if (row.dataset.bound === '1') {
        track.dispatchEvent(new Event('scroll'));
        continue;
      }
      row.dataset.bound = '1';
      const step = () => Math.max(160, Math.floor(track.clientWidth * 0.7));
      const sync = () => {
        const max = track.scrollWidth - track.clientWidth;
        const need = max > 4;
        row.classList.toggle('is-scrollable', need);
        prev.disabled = !need || track.scrollLeft <= 2;
        next.disabled = !need || track.scrollLeft >= max - 2;
      };
      prev.addEventListener('click', () => {
        track.scrollBy({ left: -step(), behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        track.scrollBy({ left: step(), behavior: 'smooth' });
      });
      track.addEventListener('scroll', sync);
      sync();
      requestAnimationFrame(sync);
    }
  }

  function setDrawCardsHtml(html) {
    const host = $('draw-cards');
    if (!host) return;
    if (host.dataset.snap === html) return;
    host.dataset.snap = html;
    host.innerHTML = html;
    bindDrawCardsScroll(host);
  }

  function ensureDrawTick() {
    if (drawTickId) {
      clearTimeout(drawTickId);
      drawTickId = null;
    }
    if (
      game &&
      game.phase === 'draw' &&
      game.draw &&
      (game.draw.step === 'showTake' || game.draw.step === 'showGive')
    ) {
      drawTickId = setTimeout(() => {
        renderGame();
      }, 250);
    }
  }

  function giveNeedAmount(d) {
    if (!d) return 0;
    if (d.mode === 'devour') return d.myGiveChunk != null ? d.myGiveChunk : d.myAmount;
    return d.myAmount || 0;
  }

  function renderDrawOverlay() {
    const overlay = $('draw-overlay');
    if (!overlay) return;
    const d = game && game.draw;
    const devourBtn = $('btn-draw-devour');
    if (devourBtn) devourBtn.hidden = true;

    const showGivePick =
      pendingGivePick &&
      game &&
      game.phase === 'draw' &&
      d &&
      d.step === 'give' &&
      d.mode === 'devour' &&
      d.isGainer &&
      !d.myGiveDone;

    if (!game || game.phase !== 'draw' || !d || d.step === 'done') {
      overlay.hidden = true;
      return;
    }
    if (d.step === 'give' && !showGivePick) {
      overlay.hidden = true;
      return;
    }

    overlay.hidden = false;
    $('draw-targets').innerHTML = '';
    $('draw-cards').innerHTML = '';
    if ($('draw-cards')) delete $('draw-cards').dataset.snap;
    $('draw-timer').textContent = '';

    if (d.step === 'devour') {
      const g = (d.gainers || [])[0];
      $('draw-title').textContent = '吞噬' + (g ? g.amount : d.myAmount) + '张牌';
      $('draw-desc').textContent = d.isGainer
        ? '点击吞噬，从各减分者手中按失分张数平分抽取'
        : '等待加分者吞噬';
      if (devourBtn) {
        devourBtn.hidden = !d.isGainer;
        devourBtn.textContent = '吞噬';
      }
    } else if (showGivePick) {
      const need = giveNeedAmount(d);
      const remSeats = d.remainingTargets || [];
      $('draw-title').textContent = '还牌：选择对象';
      $('draw-desc').textContent =
        '已选 ' + need + ' 张，请选择一名减分者归还（还需还 ' + remSeats.length + ' 人）';
      (d.losers || []).forEach((loser) => {
        if (remSeats.indexOf(loser.seat) < 0) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'draw-target';
        const p = game.players[loser.seat];
        btn.innerHTML =
          avatarImg(p.avatar, '', p.name) +
          '<span>' +
          p.name +
          '</span><span class="meta">归还 ' +
          loser.amount +
          ' 张</span>';
        btn.addEventListener('click', async () => {
          const result = await emit('game:drawGive', {
            cardIds: selectedIds(),
            targetSeat: loser.seat,
          });
          if (!result.ok) {
            $('hint').textContent = result.error || '还牌失败';
            return;
          }
          clearSelected();
          pendingGivePick = false;
        });
        $('draw-targets').appendChild(btn);
      });
    } else if (d.step === 'pick') {
      $('draw-title').textContent = '抽牌：选择对象';
      if (d.isGainer && d.myPick == null) {
        $('draw-desc').textContent =
          '你上一局 +' +
          d.myAmount +
          '，请选择一名减分者，随机抽 ' +
          d.myAmount +
          ' 张。先点先锁定，被选中的人不能再被选。';
      } else if (d.isGainer) {
        const name = game.players[d.myPick] ? game.players[d.myPick].name : '';
        $('draw-desc').textContent = '已选择抽 ' + name + '，等待其他胜者';
      } else {
        $('draw-desc').textContent = '等待加分者选择抽牌对象（手速锁定）';
      }
      const taken = {};
      (d.takenSeats || []).forEach((s) => {
        taken[s] = true;
      });
      (d.losers || []).forEach((loser) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'draw-target';
        const locked = d.uniqueTargets && !!taken[loser.seat];
        const canPick = d.isGainer && d.myPick == null && !locked;
        btn.disabled = !canPick;
        const p = game.players[loser.seat];
        btn.innerHTML =
          avatarImg(p.avatar, '', p.name) +
          '<span>' +
          p.name +
          '</span><span class="meta">上一局 -' +
          loser.amount +
          (locked ? ' · 已被选' : '') +
          '</span>';
        if (canPick) {
          btn.addEventListener('click', async () => {
            const result = await emit('game:drawPick', { targetSeat: loser.seat });
            if (!result.ok) {
              $('hint').textContent = result.error || '选择失败';
            }
          });
        }
        $('draw-targets').appendChild(btn);
      });
    } else if (d.step === 'showTake') {
      $('draw-title').textContent = '抽到的牌';
      $('draw-desc').textContent = '抽中的牌公示给所有人';
      setDrawCardsHtml(renderDrawCardGroups(d.takes, 'to', 'from', '抽了'));
      $('draw-timer').textContent =
        '剩余 ' + Math.max(0, Math.ceil((d.revealUntil - Date.now()) / 1000)) + ' 秒';
    } else if (d.step === 'showGive') {
      $('draw-title').textContent = '还给的牌';
      $('draw-desc').textContent = '还回的牌公示给所有人';
      setDrawCardsHtml(renderDrawCardGroups(d.giveCards, 'from', 'to', '还给'));
      $('draw-timer').textContent =
        '剩余 ' + Math.max(0, Math.ceil((d.revealUntil - Date.now()) / 1000)) + ' 秒';
    }
  }

  const screens = {
    auth: $('screen-auth'),
    lobby: $('screen-lobby'),
    room: $('screen-room'),
    game: $('screen-game'),
  };

  function showScreen(name) {
    Object.keys(screens).forEach((k) => {
      screens[k].hidden = k !== name;
    });
    if (window.PokerGallery && typeof PokerGallery.syncControls === 'function') {
      PokerGallery.syncControls(name === 'game');
    }
  }

  function selectedIds() {
    return Object.keys(selected).filter((k) => selected[k]);
  }

  function clearSelected() {
    selected = {};
  }

  function setError(el, msg) {
    if (!el) return;
    if (!msg) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = msg;
  }

  async function api(path, body, method) {
    const opts = {
      method: method || (body ? 'POST' : 'GET'),
      headers: {},
    };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({ ok: false, error: '请求失败' }));
    return data;
  }

  async function apiForm(path, formData) {
    const opts = {
      method: 'POST',
      headers: {},
      body: formData,
    };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
    const res = await fetch(path, opts);
    const data = await res.json().catch(() => ({ ok: false, error: '请求失败' }));
    return data;
  }

  function saveAuth(nextToken, nextUser) {
    token = nextToken;
    user = nextUser;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    token = '';
    user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function useNativeWs() {
    return window.A3_NATIVE_WS === true || typeof io !== 'function' || location.port === '8080';
  }

  function bindSocketHandlers(sock) {
    sock.on('connect_error', () => {
      clearAuth();
      disconnectSocket();
      showScreen('auth');
      setError($('auth-error'), '登录已失效，请重新登录');
    });

    sock.on('room:update', async (payload) => {
      const entryVersion = ++gameEntryVersion;
      const prevPhase = game && game.phase;
      const prevStep = game && game.draw && game.draw.step;
      room = payload.room;
      game = payload.game;
      if (!room) {
        PokerPreloader.hide();
        if (window.PokerPixelFire) PokerPixelFire.stop();
        PokerGallery.restore();
        showScreen('lobby');
        return;
      }
      applyRoomBackground();
      if (room.status === 'waiting') {
        PokerPreloader.hide();
        if (window.PokerPixelFire) PokerPixelFire.stop();
        const overlay = $('draw-overlay');
        if (overlay) overlay.hidden = true;
        renderRoom();
        showScreen('room');
      } else {
        const assetUrls = room.players.map((p) => p.avatar).filter(Boolean);
        if (room.background && room.background.url) assetUrls.push(room.background.url);
        const preload = await PokerPreloader.prepare(assetUrls);
        if (entryVersion !== gameEntryVersion || !room || room.status === 'waiting') return;
        const step = game && game.draw && game.draw.step;
        if (prevPhase !== (game && game.phase) || prevStep !== step) {
          clearSelected();
        }
        renderGame();
        showScreen('game');
        PokerPreloader.hide();
        if (preload.failed && $('hint')) {
          $('hint').textContent = preload.failed + ' 个图片加载失败，牌局仍可继续';
        }
      }
    });
  }

  function whenConnected(sock) {
    if (!sock) {
      return Promise.resolve();
    }
    if (sock.connected) {
      return Promise.resolve();
    }
    if (sock.ready) {
      return sock.ready;
    }
    return new Promise(function (resolve) {
      let done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve();
      }
      sock.on('connect', finish);
      setTimeout(finish, 8000);
    });
  }

  function connectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    if (useNativeWs() && window.A3NativeSocket) {
      socket = window.A3NativeSocket.connect(token);
    } else {
      socket = io({
        auth: { token: token },
      });
    }
    bindSocketHandlers(socket);
    return whenConnected(socket);
  }

  function disconnectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  function applyRoomBackground() {
    if (room && room.background && room.background.url) {
      PokerGallery.applyBackground(room.background.url);
      PokerGallery.saveLocal(room.background);
    }
  }

  function emit(event, data) {
    return new Promise((resolve) => {
      if (!socket || !socket.connected) {
        resolve({ ok: false, error: '未连接到服务器' });
        return;
      }
      if (data === undefined) {
        socket.emit(event, resolve);
      } else {
        socket.emit(event, data, resolve);
      }
    });
  }

  // —— 认证 UI ——
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      authMode = tab.dataset.tab;
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      $('btn-auth').textContent = authMode === 'login' ? '登录' : '注册';
      $('avatar-picker').hidden = authMode !== 'register';
      $('auth-nickname-wrap').hidden = authMode !== 'register';
      if ($('screen-auth')) {
        $('screen-auth').classList.toggle('is-register', authMode === 'register');
      }
      if (authMode === 'login' && $('auth-nickname')) $('auth-nickname').value = '';
      if (authMode === 'register') showAuthLetterPreview();
      setError($('auth-error'), '');
    });
  });

  if ($('auth-username')) {
    $('auth-username').addEventListener('input', refreshAuthLetterPreview);
  }
  if ($('auth-nickname')) {
    $('auth-nickname').addEventListener('input', refreshAuthLetterPreview);
  }

  if ($('btn-avatar-pick') && $('auth-avatar-file')) {
    $('btn-avatar-pick').addEventListener('click', () => {
      $('auth-avatar-file').click();
    });
  }

  if ($('btn-clear-avatar')) {
    $('btn-clear-avatar').addEventListener('click', (e) => {
      e.stopPropagation();
      showAuthLetterPreview();
    });
  }

  if ($('auth-avatar-file')) {
    $('auth-avatar-file').addEventListener('change', () => {
      const file = $('auth-avatar-file').files[0];
      if (!file) {
        showAuthLetterPreview();
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError($('auth-error'), '头像不能超过 2MB');
        showAuthLetterPreview();
        return;
      }
      customAvatarFile = file;
      showAuthUploadPreview(URL.createObjectURL(file));
    });
  }

  $('form-auth').addEventListener('submit', async (e) => {
    e.preventDefault();
    setError($('auth-error'), '');
    const username = $('auth-username').value.trim();
    const password = $('auth-password').value;
    let result;
    if (authMode === 'login') {
      result = await api('/api/login', { username, password });
    } else {
      const form = new FormData();
      form.append('username', username);
      form.append('password', password);
      form.append('nickname', $('auth-nickname').value.trim());
      if (customAvatarFile) form.append('avatarFile', customAvatarFile);
      result = await apiForm('/api/register', form);
    }
    if (!result.ok) {
      setError($('auth-error'), result.error || '失败');
      return;
    }
    saveAuth(result.token, result.user);
    await enterLobby();
  });

  $('btn-logout').addEventListener('click', async () => {
    await api('/api/logout', {});
    clearAuth();
    disconnectSocket();
    room = null;
    game = null;
    showScreen('auth');
  });

  function applyUser(next) {
    if (!next) return;
    user = Object.assign(user || {}, next);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if ($('lobby-username')) {
      $('lobby-username').textContent = user.nickname || user.username || '';
    }
    if ($('lobby-avatar')) {
      setLobbyAvatar(user.avatar, user.nickname || user.username);
    }
    if (user.background && user.background.url && (!room || !room.background)) {
      PokerGallery.applyBackground(user.background.url);
      PokerGallery.saveLocal(user.background);
    }
  }

  async function enterLobby() {
    const info = await api('/api/user/info');
    if (info && info.ok && info.user) {
      applyUser(info.user);
    }
    $('lobby-username').textContent = (user && (user.nickname || user.username)) || '';
    setLobbyAvatar(user && user.avatar, user && (user.nickname || user.username));
    showScreen('lobby');
    await connectSocket();
    const sync = await emit('room:sync');
    if (sync && sync.ok && sync.room) {
      room = sync.room;
      game = sync.game;
      if (room.status === 'waiting') {
        renderRoom();
        showScreen('room');
      } else {
        renderGame();
        showScreen('game');
      }
    }
  }

  // —— 大厅 ——
  $('btn-create-room').addEventListener('click', async () => {
    setError($('lobby-error'), '');
    const result = await emit('room:create');
    if (!result.ok) {
      setError($('lobby-error'), result.error || '创建失败');
      return;
    }
    room = result.room;
    game = null;
    renderRoom();
    showScreen('room');
  });

  $('btn-join-room').addEventListener('click', async () => {
    setError($('lobby-error'), '');
    const password = $('join-password').value.trim();
    const result = await emit('room:join', { password });
    if (!result.ok) {
      setError($('lobby-error'), result.error || '加入失败');
      return;
    }
    room = result.room;
    game = null;
    renderRoom();
    showScreen('room');
  });

  function playerShownName(p) {
    // 自己优先用本地最新昵称；他人用房间下发的 nickname
    if (p && p.isMe && user) {
      const mine = String(user.nickname || '').trim();
      if (mine) return mine;
    }
    const nick = p && String(p.nickname || '').trim();
    if (nick) return nick;
    return (p && (p.username || p.name)) || '';
  }

  // —— 房间 ——
  function renderRoom() {
    if (!room) return;
    $('room-password').textContent = room.password;
    const list = $('seat-list');
    list.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const p = room.players[i];
      const li = document.createElement('li');
      if (!p) {
        li.className = 'empty';
        li.innerHTML = '<span>座位 ' + (i + 1) + '</span><span>空位</span>';
      } else {
        const tags = [];
        if (p.isHost) tags.push('房主');
        if (p.isMe) tags.push('我');
        if (!p.online) tags.push('离线');
        const shown = playerShownName(p);
        li.innerHTML =
          '<span class="seat-player">' +
          avatarImg(p.avatar, '', shown) +
          '<span>' +
          shown +
          '</span></span><span class="tag">' +
          tags.join(' · ') +
          '</span>';
      }
      list.appendChild(li);
    }

    const full = room.playerCount >= room.maxPlayers;
    $('room-tip').textContent = full
      ? '人数已齐，房主可以开始游戏'
      : '等待玩家加入（' + room.playerCount + '/' + room.maxPlayers + '）';

    const amHost = room.players.some((p) => p.isMe && p.isHost);
    $('btn-start').disabled = !(amHost && full);
    $('btn-start').textContent = amHost ? '开始游戏' : '等待房主开始';
  }

  $('btn-copy-password').addEventListener('click', async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.password);
      $('btn-copy-password').textContent = '已复制';
      setTimeout(() => {
        $('btn-copy-password').textContent = '复制密码';
      }, 1200);
    } catch (e) {
      prompt('复制房间密码：', room.password);
    }
  });

  $('btn-start').addEventListener('click', async () => {
    setError($('room-error'), '');
    PokerPreloader.show();
    const result = await emit('room:start');
    if (!result.ok) {
      PokerPreloader.hide();
      setError($('room-error'), result.error || '无法开始');
    }
  });

  async function leaveRoom() {
    await emit('room:leave');
    room = null;
    game = null;
    clearSelected();
    showScreen('lobby');
  }

  $('btn-leave-room').addEventListener('click', leaveRoom);
  $('btn-leave-game').addEventListener('click', async () => {
    if (!confirm('确定离开房间？')) return;
    await leaveRoom();
  });

  // —— 对局 ——
  function previewText(cardIds) {
    if (!game || game.mySeat == null) return '等待中';
    const me = game.players[game.mySeat];
    if (!me || !me.hand) return '';
    if (!cardIds.length) return '请选择要出的牌';
    const selectedCards = [];
    for (let i = 0; i < cardIds.length; i++) {
      const found = me.hand.find((c) => c.id === cardIds[i]);
      if (found) selectedCards.push(found);
    }
    const play = PokerRules.identifyPlay(selectedCards);
    if (!play) return '不是合法牌型';
    const free = game.lastPlay === null;
    const v = PokerRules.validatePlay(selectedCards, free ? null : game.lastPlay);
    if (!v.ok) return v.reason;
    if (isOpeningLead(game) && !selectedCards.some(PokerCards.isDiamond4)) {
      return '首出必须包含方片4';
    }
    return '可出：' + play.label;
  }

  /** 本局第一次出牌才必须带方片4；全过后再出不算初出。 */
  function isOpeningLead(g) {
    if (!g || g.lastPlay != null) return false;
    const events = g.events || [];
    for (let i = 0; i < events.length; i++) {
      if (events[i].kind === 'play') return false;
    }
    return true;
  }

  function cardHtml(card, extraClass) {
    return PokerCards.cardMarkup(card, extraClass || 'tiny');
  }

  function cardsRowHtml(cards) {
    if (!cards || !cards.length) return '';
    let html = '';
    for (let i = 0; i < cards.length; i++) html += cardHtml(cards[i]);
    return html;
  }

  function goodsTagHtml(mark) {
    if (mark === 'has') return '<span class="goods-tag has">有货</span>';
    if (mark === 'solo') return '<span class="goods-tag solo">独吞</span>';
    if (mark === 'none') return '<span class="goods-tag none">没货</span>';
    return '';
  }

  function renderCard(card, opts) {
    opts = opts || {};
    const div = document.createElement('button');
    div.type = 'button';
    div.className = 'card';
    if (opts.faceDown) {
      div.classList.add('back');
      div.innerHTML = PokerCards.cardBackHtml
        ? PokerCards.cardBackHtml()
        : '<img src="/cards/back.svg" alt="" draggable="false" />';
      return div;
    }
    const suit = SUITS[card.suit];
    div.classList.add(suit.color);
    if (card.id != null) div.dataset.cardId = card.id;
    if (opts.selectable) div.classList.add('playable');
    if (opts.selectedFlag) div.classList.add('selected');
    div.innerHTML = PokerCards.cardFaceHtml(card);
    div.title = suit.name + RANKS[card.rank].name;
    return div;
  }

  /** 只更新选牌高亮和提示，避免整桌重绘导致闪屏。 */
  function updateSelectionUi() {
    if (!game || !room) return;
    const myTurn = game.phase === 'playing' && game.mySeat === game.currentPlayer;
    const d = game.draw;
    const canGive =
      game.phase === 'draw' && d && d.step === 'give' && d.isGainer && !d.myGiveDone;
    const need = giveNeedAmount(d);
    const ids = selectedIds();
    const hand = $('seat-bottom') && $('seat-bottom').querySelector('.hand');
    if (hand) {
      const nodes = hand.querySelectorAll('.card[data-card-id]');
      for (let i = 0; i < nodes.length; i++) {
        const id = nodes[i].dataset.cardId;
        nodes[i].classList.toggle('selected', !!selected[id]);
      }
    }
    if (game.phase === 'playing') {
      $('btn-play').disabled = !(myTurn && ids.length > 0);
      if ($('btn-suggest')) $('btn-suggest').disabled = !myTurn;
      $('hint').textContent = myTurn
        ? previewText(ids)
        : '等待 ' + game.players[game.currentPlayer].name + ' 出牌';
    } else if (canGive) {
      $('btn-draw-give').disabled = ids.length !== need;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      $('hint').textContent = '已选 ' + ids.length + ' / ' + need + ' 张还牌';
    }
  }

  function renderLastPlay(play) {
    if (!play) {
      return '<div class="last-play-empty">自由出牌（任意合法牌型）</div>';
    }
    const who =
      game.lastPlayPlayer != null ? game.players[game.lastPlayPlayer] : null;
    const name = who ? who.name : '';
    const avatar = who ? avatarImg(who.avatar, '', who.name) : '';
    return (
      '<div class="last-play-box">' +
      '<div class="last-play-who">' +
      avatar +
      '<span>' +
      name +
      '</span>' +
      '<span class="play-label">出了 ' +
      play.label +
      '</span>' +
      '</div>' +
      '<div class="last-play-cards">' +
      cardsRowHtml(play.cards) +
      '</div>' +
      '</div>'
    );
  }

  /** 每位玩家最近一次出牌/过牌（保留到该玩家再次行动） */
  function lastTableAction(seatId) {
    const events = (game && game.events) || [];
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i];
      if ((ev.kind === 'play' || ev.kind === 'pass') && ev.seat == seatId) {
        return ev;
      }
    }
    return null;
  }

  /** 全场最近一次「出牌」的座位；过牌不影响，上一手保持大牌（与本地试玩一致） */
  function latestPlaySeat() {
    const events = (game && game.events) || [];
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].kind === 'play') return events[i].seat;
    }
    return null;
  }

  function renderSeatPlay(ev, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className =
      'seat-play' +
      (opts.fresh ? ' seat-play--fresh' : '') +
      (opts.stable ? ' seat-play--stable' : '');
    if (!ev) return wrap;
    if (ev.kind === 'pass') {
      wrap.innerHTML = '<span class="seat-pass">过牌</span>';
      return wrap;
    }
    wrap.innerHTML = '<div class="seat-play-cards">' + cardsRowHtml(ev.cards) + '</div>';
    return wrap;
  }

  function fillCenterPlays() {
    const mySeat = game && game.mySeat != null ? game.mySeat : 0;
    const freshSeat = latestPlaySeat();
    let latestActionKind = '';
    const allEvents = (game && game.events) || [];
    for (let i = allEvents.length - 1; i >= 0; i--) {
      if (allEvents[i].kind === 'play' || allEvents[i].kind === 'pass') {
        latestActionKind = allEvents[i].kind;
        break;
      }
    }
    let latestPlayKey = '';
    const events = (game && game.events) || [];
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].kind === 'play') {
        const cards = (events[i].cards || []).map((card) => card.id).join(',');
        latestPlayKey = String(i) + ':' + String(events[i].seat) + ':' + cards;
        break;
      }
    }
    const sides = {
      bottom: mySeat,
      right: (mySeat + 1) % 4,
      top: (mySeat + 2) % 4,
      left: (mySeat + 3) % 4,
    };
    Object.keys(sides).forEach((side) => {
      const el = $('seat-play-' + side);
      if (!el) return;
      el.innerHTML = '';
      const last = lastTableAction(sides[side]);
      // 最新出牌座位始终保持大牌；过牌时加 stable 避免重播落牌动画
      const isLatestPlay = !!(last && last.kind === 'play' && sides[side] === freshSeat);
      const playEl = renderSeatPlay(last, {
        fresh: isLatestPlay,
        stable: latestActionKind === 'pass' || (isLatestPlay && latestPlayKey === lastAnimatedPlayKey),
      });
      if (playEl && playEl.childNodes.length) {
        el.appendChild(playEl);
      }
    });
    if (latestPlayKey && latestActionKind === 'play') lastAnimatedPlayKey = latestPlayKey;
  }

  function renderLogItem(ev) {
    const li = document.createElement('li');
    li.className = 'log-item' + (ev.kind === 'system' ? ' system' : '');
    const timeHtml = ev.at
      ? '<span class="log-item-time">' +
        (function (at) {
          const d = new Date(at);
          return (
            String(d.getHours()).padStart(2, '0') +
            ':' +
            String(d.getMinutes()).padStart(2, '0') +
            ':' +
            String(d.getSeconds()).padStart(2, '0')
          );
        })(ev.at) +
        '</span>'
      : '';
    if (ev.kind === 'play') {
      li.innerHTML =
        '<div class="log-item-head">' +
        avatarImg(ev.avatar, '', ev.name) +
        '<span class="log-item-name">' +
        ev.name +
        '</span>' +
        '<span class="log-item-tag">' +
        (ev.label || '出牌') +
        '</span>' +
        timeHtml +
        '</div>' +
        '<div class="log-cards">' +
        cardsRowHtml(ev.cards) +
        '</div>';
    } else if (ev.kind === 'pass') {
      li.innerHTML =
        '<div class="log-item-head">' +
        avatarImg(ev.avatar, '', ev.name) +
        '<span class="log-item-name">' +
        ev.name +
        '</span>' +
        '<span class="log-item-tag">过牌</span>' +
        timeHtml +
        '</div>';
    } else {
      const who = ev.avatar || ev.name
        ? avatarImg(ev.avatar, '', ev.name) +
          '<span class="log-item-name">' +
          (ev.name || '') +
          '</span>'
        : '';
      li.innerHTML =
        '<div class="log-item-head">' +
        who +
        '<span class="log-item-text">' +
        ev.text +
        '</span>' +
        timeHtml +
        '</div>' +
        (ev.cards && ev.cards.length
          ? '<div class="log-cards">' + cardsRowHtml(ev.cards) + '</div>'
          : '');
    }
    return li;
  }

  function fillSeat(el, player, opts) {
    opts = opts || {};
    const prevHand = el.id === 'seat-bottom' ? el.querySelector('.hand.horizontal') : null;
    const savedScroll = prevHand ? prevHand.scrollLeft : 0;
    const savedFire =
      el.id === 'seat-bottom' ? el.querySelector('.hand-fire-canvas') : null;
    el.innerHTML = '';
    el.classList.toggle(
      'current',
      player.id === game.currentPlayer && game.phase === 'playing'
    );
    el.classList.toggle('me', !!player.isMe);
    el.classList.toggle(
      'finished',
      player.finishedRank !== null && !(player.hand && player.hand.length)
    );

    const thinking =
      !!opts.thinking && game && game.phase === 'playing' && player.finishedRank == null;
    const info = document.createElement('div');
    info.className = 'seat-info';
    let meta =
      (player.handCount != null ? player.handCount : player.hand.length) +
      '张 · ' +
      player.score +
      '点';
    if (player.finishedRank !== null) meta += ' · 第' + player.finishedRank + '名';
    info.innerHTML =
      '<div class="avatar-wrap">' +
      '<div class="avatar-box">' +
      avatarImg(player.avatar, '', playerShownName({
        isMe: player.isMe,
        nickname: player.nickname,
        username: player.name,
        name: player.name,
      })) +
      (thinking
        ? '<div class="think-bubble" aria-hidden="true"><span></span><span></span><span></span></div>'
        : '') +
      '</div>' +
      goodsTagHtml(player.goodsMark) +
      '</div>' +
      '<div><div class="pname">' +
      playerShownName({
        isMe: player.isMe,
        nickname: player.nickname,
        username: player.name,
        name: player.name,
      }) +
      (player.isMe ? '（我）' : '') +
      '</div><div class="meta">' +
      meta +
      '</div><div class="seat-stats">' +
      '<span class="stat-chip">' +
      (player.handCount != null ? player.handCount : player.hand ? player.hand.length : 0) +
      ' 牌</span>' +
      '<span class="stat-chip pts">' +
      player.score +
      ' 分</span>' +
      (player.finishedRank !== null
        ? '<span class="stat-chip">第' + player.finishedRank + '</span>'
        : '') +
      '</div></div>';

    const hand = document.createElement('div');
    hand.className = 'hand ' + (opts.vertical ? 'vertical' : 'horizontal');
    const count =
      player.handCount != null ? player.handCount : player.hand ? player.hand.length : 0;
    const showFace = Array.isArray(player.hand);
    if (showFace) {
      player.hand.forEach((card) => {
        const node = renderCard(card, {
          selectable: !!opts.selectable,
          selectedFlag: !!opts.selectable && !!selected[card.id],
        });
        if (opts.selectable) {
          node.addEventListener('click', (e) => {
            e.preventDefault();
            if (selected[card.id]) delete selected[card.id];
            else selected[card.id] = true;
            updateSelectionUi();
          });
        }
        hand.appendChild(node);
      });
    } else {
      for (let i = 0; i < count; i++) {
        hand.appendChild(renderCard(null, { faceDown: true }));
      }
    }

    // 底部自己的手牌：左右滚动（牌多时）
    let handMount = hand;
    if (el.id === 'seat-bottom' && !opts.vertical) {
      const wrap = document.createElement('div');
      wrap.className = 'hand-scroll';
      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'hand-scroll-btn hand-scroll-prev';
      prev.setAttribute('aria-label', '向左');
      prev.textContent = '‹';
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'hand-scroll-btn hand-scroll-next';
      next.setAttribute('aria-label', '向右');
      next.textContent = '›';
      wrap.appendChild(prev);
      wrap.appendChild(hand);
      wrap.appendChild(next);
      const step = () => Math.max(120, Math.floor(hand.clientWidth * 0.65));
      const sync = () => {
        const max = hand.scrollWidth - hand.clientWidth;
        const need = max > 4;
        wrap.classList.toggle('is-scrollable', need);
        prev.disabled = !need || hand.scrollLeft <= 2;
        next.disabled = !need || hand.scrollLeft >= max - 2;
      };
      prev.addEventListener('click', () => {
        hand.scrollBy({ left: -step(), behavior: 'smooth' });
      });
      next.addEventListener('click', () => {
        hand.scrollBy({ left: step(), behavior: 'smooth' });
      });
      hand.addEventListener('scroll', sync);
      handMount = wrap;
      requestAnimationFrame(() => {
        if (savedScroll > 0) hand.scrollLeft = savedScroll;
        sync();
      });
    }

    if (savedFire) {
      hand.insertBefore(savedFire, hand.firstChild);
    }

    if (opts.infoRight) {
      el.appendChild(handMount);
      el.appendChild(info);
    } else {
      el.appendChild(info);
      el.appendChild(handMount);
    }
  }

  function renderGame() {
    if (!game || !room) return;

    $('game-room-code').textContent = '房间 ' + room.password;

    const amHost = room.players.some((p) => p.isMe && p.isHost);
    const myTurn = game.phase === 'playing' && game.mySeat === game.currentPlayer;
    if ($('turn-banner')) {
      $('turn-banner').classList.toggle('is-on', myTurn);
    }
    const d = game.draw;
    const canGive =
      game.phase === 'draw' && d && d.step === 'give' && d.isGainer && !d.myGiveDone;
    const need = giveNeedAmount(d);
    const gameScreen = $('screen-game') || document.querySelector('.screen-game');
    if (gameScreen) gameScreen.classList.toggle('draw-give-select', !!canGive);

    if (game.phase === 'settled') {
      setText('turn-info', '本局已结束');
      $('btn-next').hidden = !amHost;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      $('btn-draw-give').hidden = true;
      pendingGivePick = false;
    } else if (game.phase === 'draw') {
      $('btn-next').hidden = true;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      if (canGive) {
        setText(
          'turn-info',
          d.mode === 'devour'
            ? '还牌 · 请选出 ' + need + ' 张，点还牌后再选对象'
            : '还牌 · 请选出 ' +
              need +
              ' 张还给 ' +
              (game.players[d.myPick] ? game.players[d.myPick].name : '')
        );
        $('btn-draw-give').hidden = false;
        $('btn-draw-give').disabled = selectedIds().length !== need;
      } else {
        if (d && d.step === 'devour') {
          setText(
            'turn-info',
            d.isGainer
              ? '吞噬 ' + d.myAmount + ' 张牌'
              : '第 ' + game.round + ' 局 · 等待吞噬'
          );
        } else {
          setText('turn-info', '第 ' + game.round + ' 局 · 抽牌阶段');
        }
        $('btn-draw-give').hidden = true;
        if (!d || d.step !== 'give') pendingGivePick = false;
      }
    } else {
      const cur = game.players[game.currentPlayer];
      setText(
        'turn-info',
        '第 ' +
          game.round +
          ' 局 · 轮到 ' +
          cur.name +
          (cur.isMe ? '（你）' : '') +
          ' 出牌'
      );
      $('btn-next').hidden = true;
      $('btn-play').disabled = !(myTurn && selectedIds().length > 0);
      $('btn-pass').disabled = !(myTurn && game.lastPlay !== null);
      if ($('btn-suggest')) $('btn-suggest').disabled = !myTurn;
      $('btn-draw-give').hidden = true;
    }

    fillCenterPlays();

    if (game.teamA) {
      if (game.solo) {
        setText(
          'team-info',
          '队伍：' +
            game.players[game.teamA[0]].name +
            ' 独吞  vs  ' +
            game.teamB.map((i) => game.players[i].name).join('、')
        );
      } else {
        setText(
          'team-info',
          '队伍：' +
            game.teamA.map((i) => game.players[i].name).join('、') +
            '  vs  ' +
            game.teamB.map((i) => game.players[i].name).join('、')
        );
      }
    } else {
      setText('team-info', '队伍未揭晓（葵扇3、葵扇A 打出后揭晓）');
    }

    const mySeat = game.mySeat != null ? game.mySeat : 0;
    const thinkingSeat = game.phase === 'playing' ? game.currentPlayer : -1;
    fillSeat($('seat-bottom'), game.players[mySeat], {
      showFace: true,
      selectable: myTurn || canGive,
      vertical: false,
      infoRight: true,
      thinking: thinkingSeat === mySeat,
    });
    fillSeat($('seat-right'), game.players[(mySeat + 1) % 4], {
      showFace: false,
      vertical: true,
      thinking: thinkingSeat === (mySeat + 1) % 4,
    });
    fillSeat($('seat-top'), game.players[(mySeat + 2) % 4], {
      showFace: false,
      vertical: false,
      thinking: thinkingSeat === (mySeat + 2) % 4,
    });
    fillSeat($('seat-left'), game.players[(mySeat + 3) % 4], {
      showFace: false,
      vertical: true,
      thinking: thinkingSeat === (mySeat + 3) % 4,
    });

    // 轮到自己操作时，手牌背后播放像素火焰
    if (window.PokerPixelFire) {
      PokerPixelFire.syncMyTurn(myTurn || canGive, $('seat-bottom'));
    }

    if (game.phase === 'playing') {
      $('hint').textContent = myTurn
        ? previewText(selectedIds())
        : '等待 ' + game.players[game.currentPlayer].name + ' 出牌';
    } else if (canGive) {
      $('hint').textContent =
        '已选 ' + selectedIds().length + ' / ' + need + ' 张还牌';
    } else if (game.phase === 'draw') {
      $('hint').textContent = d && d.isGainer && d.myGiveDone ? '已还牌，等待其他人' : '抽牌进行中';
    } else {
      $('hint').textContent = '结算完成，可点击再来一局';
    }

    renderDrawOverlay();
    ensureDrawTick();

    $('log').innerHTML = '';
    const events = game.events && game.events.length ? game.events : null;
    if (events) {
      events.forEach((ev) => {
        $('log').appendChild(renderLogItem(ev));
      });
      if (events.length !== lastEventCount) {
        lastEventCount = events.length;
        $('log').scrollTop = $('log').scrollHeight;
      }
    } else {
      const hist = (game.history || []).slice();
      hist.forEach((line) => {
        const li = document.createElement('li');
        li.textContent = line;
        $('log').appendChild(li);
      });
    }
  }

  $('btn-clear').addEventListener('click', () => {
    clearSelected();
    updateSelectionUi();
  });

  $('btn-draw-give').addEventListener('click', async () => {
    const d = game && game.draw;
    const need = giveNeedAmount(d);
    const ids = selectedIds();
    if (ids.length !== need) {
      $('hint').textContent = '请选择 ' + need + ' 张还牌';
      return;
    }
    if (d && d.mode === 'devour') {
      pendingGivePick = true;
      renderDrawOverlay();
      $('hint').textContent = '请选择还牌对象';
      return;
    }
    const result = await emit('game:drawGive', { cardIds: ids });
    if (!result.ok) {
      $('hint').textContent = result.error || '还牌失败';
      return;
    }
    clearSelected();
  });

  if ($('btn-draw-devour')) {
    $('btn-draw-devour').addEventListener('click', async () => {
      const result = await emit('game:drawDevour');
      if (!result.ok) {
        $('hint').textContent = result.error || '吞噬失败';
      }
    });
  }

  $('btn-play').addEventListener('click', async () => {
    const result = await emit('game:play', { cardIds: selectedIds() });
    if (!result.ok) {
      $('hint').textContent = result.error || '出牌失败';
      return;
    }
    clearSelected();
  });

  $('btn-pass').addEventListener('click', async () => {
    const result = await emit('game:pass');
    if (!result.ok) {
      $('hint').textContent = result.error || '不能过牌';
    }
  });

  if ($('btn-suggest')) {
    $('btn-suggest').addEventListener('click', () => {
      if (!game || game.phase !== 'playing' || game.mySeat !== game.currentPlayer) return;
      const me = game.players[game.mySeat];
      if (!me || !me.hand) return;
      const free = game.lastPlay === null;
      const found = PokerRules.findSmallestLegalPlay(me.hand, free ? null : game.lastPlay, {
        requireDiamond4: isOpeningLead(game),
        // 自由出牌（含三家都过后）：提示选能出的最多张
        preferLargest: free,
      });
      clearSelected();
      if (!found) {
        $('hint').textContent =
          game.lastPlay != null ? '没有能压过的牌，可以过牌' : '没有合法出牌';
        updateSelectionUi();
        return;
      }
      for (let i = 0; i < found.ids.length; i++) selected[found.ids[i]] = true;
      updateSelectionUi();
      $('hint').textContent = '提示：' + (found.play.label || '可出') + '（已选中）';
    });
  }

  $('btn-next').addEventListener('click', async () => {
    const result = await emit('room:next');
    if (!result.ok) {
      $('hint').textContent = result.error || '无法开下一局';
    }
  });

  PokerGallery.mount({
    getToken: function () {
      return token;
    },
    onPicked: async function (image) {
      await api('/api/user/background', {
        resourceId: image.id || null,
        file: image.file,
        name: image.name,
        url: image.url,
      });
      if (!socket || !room) return;
      const result = await emit('room:background', {
        file: image.file,
        name: image.name,
        url: image.url,
      });
      if (!result.ok && $('hint')) {
        $('hint').textContent = result.error || '修改背景失败';
      }
    },
  });

  window.addEventListener('poker:avatar-changed', function (ev) {
    if (ev.detail) applyUser(ev.detail);
  });

  if (window.PokerAccount) {
    PokerAccount.mount({
      getToken: function () {
        return token;
      },
      onUser: function (u) {
        try {
          const t = localStorage.getItem(TOKEN_KEY);
          if (t) token = t;
        } catch (e) {}
        applyUser(u);
      },
    });
  }

  // 启动
  (async function boot() {
    if (!token) {
      showScreen('auth');
      return;
    }
    const me = await api('/api/me');
    if (!me.ok) {
      clearAuth();
      showScreen('auth');
      return;
    }
    user = me.user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    await enterLobby();
  })();
})();
