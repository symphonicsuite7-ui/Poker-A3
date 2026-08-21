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
  let selectedAvatar = '/avatars/preset-1.svg';
  let customAvatarFile = null;
  let lastEventCount = 0;

  const $ = (id) => document.getElementById(id);

  function avatarSrc(url) {
    return url || '/avatars/preset-1.svg';
  }

  function avatarImg(url, extraClass) {
    return (
      '<img class="avatar' +
      (extraClass ? ' ' + extraClass : '') +
      '" src="' +
      avatarSrc(url) +
      '" alt="" />'
    );
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
        '</div><div class="log-cards">' +
        cardsRowHtml(t.cards) +
        '</div></div>';
    }
    return html;
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

  function renderDrawOverlay() {
    const overlay = $('draw-overlay');
    if (!overlay) return;
    const d = game && game.draw;
    if (!game || game.phase !== 'draw' || !d || d.step === 'give' || d.step === 'done') {
      overlay.hidden = true;
      return;
    }
    overlay.hidden = false;
    $('draw-targets').innerHTML = '';
    $('draw-cards').innerHTML = '';
    $('draw-timer').textContent = '';

    if (d.step === 'pick') {
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
          avatarImg(p.avatar) +
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
      $('draw-cards').innerHTML = renderDrawCardGroups(d.takes, 'to', 'from', '抽了');
      $('draw-timer').textContent =
        '剩余 ' + Math.max(0, Math.ceil((d.revealUntil - Date.now()) / 1000)) + ' 秒';
    } else if (d.step === 'showGive') {
      $('draw-title').textContent = '还给的牌';
      $('draw-desc').textContent = '还回的牌公示给所有人';
      $('draw-cards').innerHTML = renderDrawCardGroups(d.giveCards, 'from', 'to', '还给');
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

  async function api(path, body) {
    const opts = {
      method: body ? 'POST' : 'GET',
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

  function connectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    socket = io({
      auth: { token: token },
    });

    socket.on('connect_error', () => {
      clearAuth();
      disconnectSocket();
      showScreen('auth');
      setError($('auth-error'), '登录已失效，请重新登录');
    });

    socket.on('room:update', (payload) => {
      const prevPhase = game && game.phase;
      const prevStep = game && game.draw && game.draw.step;
      room = payload.room;
      game = payload.game;
      if (!room) {
        PokerGallery.restore();
        showScreen('lobby');
        return;
      }
      applyRoomBackground();
      if (room.status === 'waiting') {
        const overlay = $('draw-overlay');
        if (overlay) overlay.hidden = true;
        renderRoom();
        showScreen('room');
      } else {
        const step = game && game.draw && game.draw.step;
        if (prevPhase !== (game && game.phase) || prevStep !== step) {
          clearSelected();
        }
        renderGame();
        showScreen('game');
      }
    });
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
      setError($('auth-error'), '');
    });
  });

  document.querySelectorAll('.avatar-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      customAvatarFile = null;
      $('auth-avatar-file').value = '';
      selectedAvatar = btn.dataset.avatar;
      $('avatar-preview').src = selectedAvatar;
      document.querySelectorAll('.avatar-opt').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $('auth-avatar-file').addEventListener('change', () => {
    const file = $('auth-avatar-file').files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError($('auth-error'), '头像不能超过 2MB');
      $('auth-avatar-file').value = '';
      return;
    }
    customAvatarFile = file;
    document.querySelectorAll('.avatar-opt').forEach((b) => b.classList.remove('active'));
    const url = URL.createObjectURL(file);
    $('avatar-preview').src = url;
  });

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
      form.append('avatar', selectedAvatar);
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

  async function enterLobby() {
    $('lobby-username').textContent = user.username;
    $('lobby-avatar').src = avatarSrc(user.avatar);
    connectSocket();
    showScreen('lobby');
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
        li.innerHTML =
          '<span class="seat-player">' +
          avatarImg(p.avatar) +
          '<span>' +
          p.username +
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
    const result = await emit('room:start');
    if (!result.ok) setError($('room-error'), result.error || '无法开始');
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
    return '可出：' + play.label;
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
      return div;
    }
    const suit = SUITS[card.suit];
    div.classList.add(suit.color);
    if (opts.selectable) div.classList.add('playable');
    if (opts.selectedFlag) div.classList.add('selected');
    div.innerHTML = PokerCards.cardFaceHtml(card);
    div.title = suit.name + RANKS[card.rank].name;
    return div;
  }

  function renderLastPlay(play) {
    if (!play) {
      return '<div class="last-play-empty">自由出牌（任意合法牌型）</div>';
    }
    const who =
      game.lastPlayPlayer != null ? game.players[game.lastPlayPlayer] : null;
    const name = who ? who.name : '';
    const avatar = who ? avatarImg(who.avatar) : '';
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

  function renderLogItem(ev) {
    const li = document.createElement('li');
    li.className = 'log-item' + (ev.kind === 'system' ? ' system' : '');
    if (ev.kind === 'play') {
      li.innerHTML =
        '<div class="log-item-head">' +
        avatarImg(ev.avatar) +
        '<span class="log-item-name">' +
        ev.name +
        '</span>' +
        '<span class="log-item-tag">' +
        (ev.label || '出牌') +
        '</span>' +
        '</div>' +
        '<div class="log-cards">' +
        cardsRowHtml(ev.cards) +
        '</div>';
    } else if (ev.kind === 'pass') {
      li.innerHTML =
        '<div class="log-item-head">' +
        avatarImg(ev.avatar) +
        '<span class="log-item-name">' +
        ev.name +
        '</span>' +
        '<span class="log-item-tag">过牌</span>' +
        '</div>';
    } else {
      const who = ev.avatar
        ? avatarImg(ev.avatar) +
          '<span class="log-item-name">' +
          (ev.name || '') +
          '</span>'
        : '';
      li.innerHTML =
        '<div class="log-item-head">' +
        who +
        '<span class="log-item-text">' +
        ev.text +
        '</span></div>' +
        (ev.cards && ev.cards.length
          ? '<div class="log-cards">' + cardsRowHtml(ev.cards) + '</div>'
          : '');
    }
    return li;
  }

  function fillSeat(el, player, opts) {
    opts = opts || {};
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

    const info = document.createElement('div');
    info.className = 'seat-info';
    let meta = (player.handCount != null ? player.handCount : player.hand.length) + '张 · ' + player.score + '点';
    if (player.finishedRank !== null) meta += ' · 第' + player.finishedRank + '名';
    info.innerHTML =
      '<div class="avatar-wrap">' +
      avatarImg(player.avatar) +
      goodsTagHtml(player.goodsMark) +
      '</div>' +
      '<div><div class="pname">' +
      player.name +
      (player.isMe ? '（我）' : '') +
      '</div><div class="meta">' +
      meta +
      '</div></div>';
    el.appendChild(info);

    const hand = document.createElement('div');
    hand.className = 'hand ' + (opts.vertical ? 'vertical' : 'horizontal');
    const count = player.handCount != null ? player.handCount : (player.hand ? player.hand.length : 0);
    const showFace = Array.isArray(player.hand);
    if (showFace) {
      player.hand.forEach((card) => {
        const node = renderCard(card, {
          selectable: !!opts.selectable,
          selectedFlag: !!opts.selectable && !!selected[card.id],
        });
        if (opts.selectable) {
          node.addEventListener('click', () => {
            if (selected[card.id]) delete selected[card.id];
            else selected[card.id] = true;
            renderGame();
          });
        }
        hand.appendChild(node);
      });
    } else {
      for (let i = 0; i < count; i++) {
        hand.appendChild(renderCard(null, { faceDown: true }));
      }
    }
    el.appendChild(hand);
  }

  function renderGame() {
    if (!game || !room) return;

    $('game-room-code').textContent = '房间 ' + room.password;

    const amHost = room.players.some((p) => p.isMe && p.isHost);
    const myTurn = game.phase === 'playing' && game.mySeat === game.currentPlayer;
    const d = game.draw;
    const canGive =
      game.phase === 'draw' && d && d.step === 'give' && d.isGainer && !d.myGiveDone;

    if (game.phase === 'settled') {
      $('turn-info').textContent = '本局已结束';
      $('btn-next').hidden = !amHost;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      $('btn-draw-give').hidden = true;
    } else if (game.phase === 'draw') {
      $('btn-next').hidden = true;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      if (canGive) {
        const targetSeat = d.myPick;
        $('turn-info').textContent =
          '还牌 · 请选出 ' +
          d.myAmount +
          ' 张还给 ' +
          game.players[targetSeat].name;
        $('btn-draw-give').hidden = false;
        $('btn-draw-give').disabled = selectedIds().length !== d.myAmount;
      } else {
        $('turn-info').textContent = '第 ' + game.round + ' 局 · 抽牌阶段';
        $('btn-draw-give').hidden = true;
      }
    } else {
      const cur = game.players[game.currentPlayer];
      $('turn-info').textContent =
        '第 ' +
        game.round +
        ' 局 · 轮到 ' +
        cur.name +
        (cur.isMe ? '（你）' : '') +
        ' 出牌';
      $('btn-next').hidden = true;
      $('btn-play').disabled = !(myTurn && selectedIds().length > 0);
      $('btn-pass').disabled = !(myTurn && game.lastPlay !== null);
      $('btn-draw-give').hidden = true;
    }

    $('last-play').innerHTML = renderLastPlay(game.lastPlay);

    if (game.teamA) {
      if (game.solo) {
        $('team-info').textContent =
          '队伍：' +
          game.players[game.teamA[0]].name +
          ' 独吞  vs  ' +
          game.teamB.map((i) => game.players[i].name).join('、');
      } else {
        $('team-info').textContent =
          '队伍：' +
          game.teamA.map((i) => game.players[i].name).join('、') +
          '  vs  ' +
          game.teamB.map((i) => game.players[i].name).join('、');
      }
    } else {
      $('team-info').textContent = '队伍未揭晓（葵扇3、葵扇A 打出后揭晓）';
    }

    const mySeat = game.mySeat != null ? game.mySeat : 0;
    fillSeat($('seat-bottom'), game.players[mySeat], {
      showFace: true,
      selectable: myTurn || canGive,
      vertical: false,
    });
    fillSeat($('seat-right'), game.players[(mySeat + 1) % 4], {
      showFace: false,
      vertical: true,
    });
    fillSeat($('seat-top'), game.players[(mySeat + 2) % 4], {
      showFace: false,
      vertical: false,
    });
    fillSeat($('seat-left'), game.players[(mySeat + 3) % 4], {
      showFace: false,
      vertical: true,
    });

    if (game.phase === 'playing') {
      $('hint').textContent = myTurn
        ? previewText(selectedIds())
        : '等待 ' + game.players[game.currentPlayer].name + ' 出牌';
    } else if (canGive) {
      $('hint').textContent =
        '已选 ' + selectedIds().length + ' / ' + d.myAmount + ' 张还牌';
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
    renderGame();
  });

  $('btn-draw-give').addEventListener('click', async () => {
    const result = await emit('game:drawGive', { cardIds: selectedIds() });
    if (!result.ok) {
      $('hint').textContent = result.error || '还牌失败';
      return;
    }
    clearSelected();
  });

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

  $('btn-next').addEventListener('click', async () => {
    const result = await emit('room:next');
    if (!result.ok) {
      $('hint').textContent = result.error || '无法开下一局';
    }
  });

  PokerGallery.mount({
    onPicked: async function (image) {
      if (!socket || !room) return;
      const result = await emit('room:background', { file: image.file });
      if (!result.ok && $('hint')) {
        $('hint').textContent = result.error || '修改背景失败';
      }
    },
  });

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
