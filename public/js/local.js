/**
 * 本地试玩界面：模拟线上，只看自己的牌，其余三家由电脑出牌
 */
(function () {
  const SUITS = PokerCards.SUITS;
  const RANKS = PokerCards.RANKS;
  const MY_SEAT = 0;
  const BOT_DELAY_MS = 700;
  const NAMES = ['玩家1', '玩家2', '玩家3', '玩家4'];
  const AVATARS = [
    '/avatars/preset-1.svg',
    '/avatars/preset-2.svg',
    '/avatars/preset-3.svg',
    '/avatars/preset-4.svg',
  ];

  let state = PokerGame.newGame(NAMES);
  let selected = {};
  let lastEventCount = 0;
  let botTimer = null;
  let botWaitKey = '';

  const $ = (id) => document.getElementById(id);

  function selectedIds() {
    return Object.keys(selected).filter((k) => selected[k]);
  }

  function clearSelected() {
    selected = {};
  }

  function avatarSrc(url) {
    return url || AVATARS[0];
  }

  function avatarImg(url) {
    return '<img class="avatar" src="' + avatarSrc(url) + '" alt="" />';
  }

  function mapGet(map, seat) {
    if (!map) return undefined;
    if (map[seat] != null) return map[seat];
    return map[String(seat)];
  }

  function actingSeat() {
    if (state.phase === 'draw' && state.draw) {
      const d = state.draw;
      if (d.step === 'pick') {
        const g = d.gainers.find((x) => mapGet(d.picks, x.seat) == null);
        if (g) return g.seat;
      }
      if (d.step === 'give') {
        const g = d.gainers.find((x) => !mapGet(d.gives, x.seat));
        if (g) return g.seat;
      }
    }
    return state.currentPlayer;
  }

  function isBot(seat) {
    return seat !== MY_SEAT;
  }

  function clearBotTimer() {
    if (botTimer) {
      clearTimeout(botTimer);
      botTimer = null;
    }
    botWaitKey = '';
  }

  /** 枚举手牌中指定张数的组合 */
  function eachCombo(arr, k, fn) {
    const n = arr.length;
    if (k < 1 || k > n) return;
    const idx = [];
    function rec(start, depth) {
      if (depth === k) {
        const cards = [];
        for (let i = 0; i < k; i++) cards.push(arr[idx[i]]);
        fn(cards);
        return;
      }
      for (let i = start; i <= n - (k - depth); i++) {
        idx[depth] = i;
        rec(i + 1, depth + 1);
      }
    }
    rec(0, 0);
  }

  function beatSizes(lastPlay) {
    if (!lastPlay) return [1, 2, 3, 4, 5];
    if (lastPlay.type === 'single') return [1];
    if (lastPlay.type === 'pair') return [2];
    if (lastPlay.type === 'triple') return [3];
    if (lastPlay.type === 'quad') return [4];
    return [5];
  }

  /** 电脑选一手能出的牌；压不住则返回 null（过牌） */
  function chooseBotPlayIds(hand, lastPlay) {
    if (!hand || !hand.length) return null;
    const sizes = beatSizes(lastPlay);
    let best = null;
    for (let s = 0; s < sizes.length; s++) {
      eachCombo(hand, sizes[s], function (cards) {
        const v = PokerRules.validatePlay(cards, lastPlay);
        if (!v.ok) return;
        const leftover = hand.length - cards.length;
        const key = v.play.keyCard || cards[cards.length - 1];
        if (
          !best ||
          leftover < best.leftover ||
          (leftover === best.leftover && PokerCards.compareSingle(key, best.key) < 0)
        ) {
          best = { ids: cards.map((c) => c.id), leftover: leftover, key: key };
        }
      });
    }
    return best ? best.ids : null;
  }

  function botPickTarget(seat) {
    const d = state.draw;
    const taken = {};
    Object.keys(d.picks || {}).forEach((k) => {
      taken[d.picks[k]] = true;
    });
    const losers = (d.losers || []).filter((l) => !(d.uniqueTargets && taken[l.seat]));
    if (!losers.length) return null;
    return losers[0].seat;
  }

  function botGiveIds(seat) {
    const d = state.draw;
    const g = d.gainers.find((x) => x.seat === seat);
    if (!g) return [];
    const hand = state.players[seat].hand;
    const ids = [];
    const used = {};
    (d.takes || []).forEach((t) => {
      if (t.to !== seat) return;
      (t.cards || []).forEach((c) => {
        if (ids.length >= g.amount) return;
        if (used[c.id]) return;
        if (hand.some((h) => h.id === c.id)) {
          ids.push(c.id);
          used[c.id] = true;
        }
      });
    });
    for (let i = 0; i < hand.length && ids.length < g.amount; i++) {
      if (!used[hand[i].id]) {
        ids.push(hand[i].id);
        used[hand[i].id] = true;
      }
    }
    return ids;
  }

  function runBotPlay() {
    botTimer = null;
    if (state.phase !== 'playing') return;
    const seat = state.currentPlayer;
    if (!isBot(seat)) return;
    if (state.players[seat].finishedRank !== null) return;
    const ids = chooseBotPlayIds(state.players[seat].hand, state.lastPlay);
    let result;
    if (ids && ids.length) {
      result = PokerGame.playCards(state, seat, ids);
    } else {
      result = PokerGame.passTurn(state, seat);
    }
    if (!result.ok && state.lastPlay) {
      result = PokerGame.passTurn(state, seat);
    }
    if (result.ok) {
      state = result.state;
      clearSelected();
      render();
    }
  }

  function runBotPick(seat) {
    botTimer = null;
    if (state.phase !== 'draw' || !state.draw || state.draw.step !== 'pick') return;
    if (!isBot(seat)) return;
    if (mapGet(state.draw.picks, seat) != null) return;
    const target = botPickTarget(seat);
    if (target == null) return;
    const result = PokerGame.pickDrawTarget(state, seat, target);
    if (result.ok) {
      state = result.state;
      clearSelected();
      render();
    }
  }

  function runBotGive(seat) {
    botTimer = null;
    if (state.phase !== 'draw' || !state.draw || state.draw.step !== 'give') return;
    if (!isBot(seat)) return;
    if (mapGet(state.draw.gives, seat)) return;
    const result = PokerGame.giveDrawCards(state, seat, botGiveIds(seat));
    if (result.ok) {
      state = result.state;
      clearSelected();
      render();
    }
  }

  function scheduleBot() {
    let key = '';
    if (state.phase === 'playing') {
      const seat = state.currentPlayer;
      if (isBot(seat) && state.players[seat].finishedRank === null) {
        key = 'play:' + seat + ':' + (state.events || []).length;
      }
    } else if (state.phase === 'draw' && state.draw) {
      const d = state.draw;
      if (d.step === 'pick') {
        const g = d.gainers.find((x) => mapGet(d.picks, x.seat) == null);
        if (g && isBot(g.seat)) key = 'pick:' + g.seat;
      } else if (d.step === 'give') {
        const g = d.gainers.find((x) => !mapGet(d.gives, x.seat));
        if (g && isBot(g.seat)) key = 'give:' + g.seat;
      }
    }
    if (!key) {
      clearBotTimer();
      botWaitKey = '';
      return;
    }
    if (botTimer && botWaitKey === key) return;
    clearBotTimer();
    botWaitKey = key;
    if (key.indexOf('play:') === 0) {
      botTimer = setTimeout(runBotPlay, BOT_DELAY_MS);
    } else if (key.indexOf('pick:') === 0) {
      const seat = Number(key.slice(5));
      botTimer = setTimeout(function () {
        runBotPick(seat);
      }, BOT_DELAY_MS);
    } else {
      const seat = Number(key.slice(5));
      botTimer = setTimeout(function () {
        runBotGive(seat);
      }, BOT_DELAY_MS);
    }
  }

  let drawTimerId = null;
  let drawTickId = null;
  let drawTimerFor = 0;

  function clearDrawTimers() {
    if (drawTimerId) {
      clearTimeout(drawTimerId);
      drawTimerId = null;
    }
    if (drawTickId) {
      clearTimeout(drawTickId);
      drawTickId = null;
    }
    drawTimerFor = 0;
  }

  function ensureDrawAdvance() {
    if (state.phase !== 'draw' || !state.draw) {
      clearDrawTimers();
      return;
    }
    const step = state.draw.step;
    if (step !== 'showTake' && step !== 'showGive') {
      if (drawTimerId) {
        clearTimeout(drawTimerId);
        drawTimerId = null;
        drawTimerFor = 0;
      }
      return;
    }
    const until = state.draw.revealUntil;
    if (drawTimerFor !== until) {
      drawTimerFor = until;
      if (drawTimerId) clearTimeout(drawTimerId);
      drawTimerId = setTimeout(() => {
        const result = PokerGame.advanceDrawReveal(state);
        if (result.ok) {
          state = result.state;
          clearSelected();
          render();
        }
      }, Math.max(0, until - Date.now()));
    }
    if (drawTickId) clearTimeout(drawTickId);
    drawTickId = setTimeout(() => {
      if (state.phase === 'draw') render();
    }, 250);
  }

  function renderDrawCardGroups(list, actorKey, otherKey, verb) {
    let html = '';
    for (let i = 0; i < (list || []).length; i++) {
      const t = list[i];
      const actor = state.players[t[actorKey]];
      const other = state.players[t[otherKey]];
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

  function renderDrawOverlay() {
    const overlay = $('draw-overlay');
    const d = state.draw;
    if (state.phase !== 'draw' || !d || d.step === 'done' || d.step === 'give') {
      overlay.hidden = true;
      return;
    }
    overlay.hidden = false;
    $('draw-targets').innerHTML = '';
    $('draw-cards').innerHTML = '';
    $('draw-timer').textContent = '';

    if (d.step === 'pick') {
      const meGainer = d.gainers.find((x) => x.seat === MY_SEAT);
      const myPick = meGainer ? mapGet(d.picks, MY_SEAT) : null;
      $('draw-title').textContent = '抽牌：选择对象';
      if (meGainer && myPick == null) {
        $('draw-desc').textContent =
          '你上一局 +' +
          meGainer.amount +
          '，请选择一名减分者，随机抽 ' +
          meGainer.amount +
          ' 张。先点先锁定，被选中的人不能再被选。';
      } else if (meGainer) {
        $('draw-desc').textContent =
          '已选择抽 ' + state.players[myPick].name + '，等待其他胜者';
      } else {
        $('draw-desc').textContent = '等待加分者选择抽牌对象（手速锁定）';
      }
      const taken = {};
      Object.keys(d.picks || {}).forEach((k) => {
        taken[d.picks[k]] = true;
      });
      d.losers.forEach((loser) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'draw-target';
        const locked = d.uniqueTargets && !!taken[loser.seat];
        const canPick = !!meGainer && myPick == null && !locked;
        btn.disabled = !canPick;
        btn.innerHTML =
          avatarImg(playerAvatar(loser.seat)) +
          '<span>' +
          state.players[loser.seat].name +
          '</span><span class="meta">上一局 -' +
          loser.amount +
          (locked ? ' · 已被选' : '') +
          '</span>';
        if (canPick) {
          btn.addEventListener('click', () => {
            const result = PokerGame.pickDrawTarget(state, MY_SEAT, loser.seat);
            if (!result.ok) {
              $('hint').textContent = result.reason || '选择失败';
              return;
            }
            state = result.state;
            clearSelected();
            render();
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
      $('draw-cards').innerHTML = renderDrawCardGroups(
        d.giveCards,
        'from',
        'to',
        '还给'
      );
      $('draw-timer').textContent =
        '剩余 ' + Math.max(0, Math.ceil((d.revealUntil - Date.now()) / 1000)) + ' 秒';
    }
  }

  function playerAvatar(seat) {
    return AVATARS[seat] || AVATARS[0];
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
    if (opts.faceDown || !card) {
      div.classList.add('back');
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
    const myTurn = state.phase === 'playing' && state.currentPlayer === MY_SEAT;
    const drawGive = state.phase === 'draw' && state.draw && state.draw.step === 'give';
    const giveGainer =
      drawGive &&
      state.draw.gainers.find((g) => g.seat === MY_SEAT && !mapGet(state.draw.gives, g.seat));
    const canGive = !!giveGainer;
    const ids = selectedIds();
    const hand = $('seat-bottom') && $('seat-bottom').querySelector('.hand');
    if (hand) {
      const nodes = hand.querySelectorAll('.card[data-card-id]');
      for (let i = 0; i < nodes.length; i++) {
        const id = nodes[i].dataset.cardId;
        nodes[i].classList.toggle('selected', !!selected[id]);
      }
    }
    if (state.phase === 'playing') {
      $('btn-play').disabled = !(myTurn && ids.length > 0);
      if ($('btn-suggest')) $('btn-suggest').disabled = !myTurn;
      $('hint').textContent = myTurn
        ? previewText(ids)
        : '等待 ' + state.players[state.currentPlayer].name + ' 出牌';
    } else if (canGive) {
      $('btn-draw-give').disabled = ids.length !== giveGainer.amount;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      $('hint').textContent = '已选 ' + ids.length + ' / ' + giveGainer.amount + ' 张还牌';
    }
  }

  function previewText(cardIds) {
    const me = state.players[MY_SEAT];
    if (!cardIds.length) return '请选择要出的牌';
    const selectedCards = [];
    for (let i = 0; i < cardIds.length; i++) {
      const found = me.hand.find((c) => c.id === cardIds[i]);
      if (found) selectedCards.push(found);
    }
    const play = PokerRules.identifyPlay(selectedCards);
    if (!play) return '不是合法牌型';
    const free = state.lastPlay === null;
    const v = PokerRules.validatePlay(selectedCards, free ? null : state.lastPlay);
    if (!v.ok) return v.reason;
    if (isOpeningLead(state) && !selectedCards.some(PokerCards.isDiamond4)) {
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

  function renderLastPlay(play) {
    if (!play) {
      return '<div class="last-play-empty">自由出牌（任意合法牌型）</div>';
    }
    const who =
      state.lastPlayPlayer != null ? state.players[state.lastPlayPlayer] : null;
    const name = who ? who.name : '';
    const avatar = who ? avatarImg(playerAvatar(who.id)) : '';
    return (
      '<div class="last-play-box">' +
      '<div class="last-play-who">' +
      avatar +
      '<span>' +
      name +
      '</span>' +
      '<span class="play-label">出了 ' +
      play.label +
      '</span></div>' +
      '<div class="last-play-cards">' +
      cardsRowHtml(play.cards) +
      '</div></div>'
    );
  }

  /** 每位玩家最近一次出牌/过牌（保留到该玩家再次行动） */
  function lastTableAction(seatId) {
    const events = (state && state.events) || [];
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i];
      if ((ev.kind === 'play' || ev.kind === 'pass') && ev.seat == seatId) {
        return ev;
      }
    }
    return null;
  }

  /** 全场最近一次「出牌」的座位；过牌不影响，上一手保持大牌 */
  function latestPlaySeat() {
    const events = (state && state.events) || [];
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].kind === 'play') return events[i].seat;
    }
    return null;
  }

  function renderSeatPlay(ev, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'seat-play' + (opts.fresh ? ' seat-play--fresh' : '');
    if (!ev) return wrap;
    if (ev.kind === 'pass') {
      wrap.innerHTML = '<span class="seat-pass">过牌</span>';
      return wrap;
    }
    wrap.innerHTML = '<div class="seat-play-cards">' + cardsRowHtml(ev.cards) + '</div>';
    return wrap;
  }

  function fillCenterPlays() {
    const freshSeat = latestPlaySeat();
    const sides = {
      bottom: MY_SEAT,
      right: (MY_SEAT + 1) % 4,
      top: (MY_SEAT + 2) % 4,
      left: (MY_SEAT + 3) % 4,
    };
    Object.keys(sides).forEach((side) => {
      const el = $('seat-play-' + side);
      if (!el) return;
      el.innerHTML = '';
      const last = lastTableAction(sides[side]);
      const fresh = !!(last && last.kind === 'play' && sides[side] === freshSeat);
      const playEl = renderSeatPlay(last, { fresh: fresh });
      if (playEl && playEl.childNodes.length) {
        el.appendChild(playEl);
      }
    });
  }

  function formatLogTime(at) {
    if (!at) return '';
    const d = new Date(at);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return hh + ':' + mm + ':' + ss;
  }

  function renderLogItem(ev) {
    const li = document.createElement('li');
    li.className = 'log-item' + (ev.kind === 'system' ? ' system' : '');
    const avatar = ev.seat != null ? avatarImg(playerAvatar(ev.seat)) : '';
    const timeHtml = ev.at
      ? '<span class="log-item-time">' + formatLogTime(ev.at) + '</span>'
      : '';
    if (ev.kind === 'play') {
      li.innerHTML =
        '<div class="log-item-head">' +
        avatar +
        '<span class="log-item-name">' +
        ev.name +
        '</span><span class="log-item-tag">' +
        (ev.label || '出牌') +
        '</span>' +
        timeHtml +
        '</div><div class="log-cards">' +
        cardsRowHtml(ev.cards) +
        '</div>';
    } else if (ev.kind === 'pass') {
      li.innerHTML =
        '<div class="log-item-head">' +
        avatar +
        '<span class="log-item-name">' +
        ev.name +
        '</span><span class="log-item-tag">过牌</span>' +
        timeHtml +
        '</div>';
    } else {
      li.innerHTML =
        '<div class="log-item-head">' +
        avatar +
        (ev.name
          ? '<span class="log-item-name">' + ev.name + '</span>'
          : '') +
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
    el.innerHTML = '';
    const isMe = player.id === MY_SEAT;
    el.classList.toggle(
      'current',
      player.id === state.currentPlayer && state.phase === 'playing'
    );
    el.classList.toggle('me', isMe);
    el.classList.toggle(
      'finished',
      player.finishedRank !== null && !(player.hand && player.hand.length)
    );

    const thinking =
      !!opts.thinking && state.phase === 'playing' && player.finishedRank == null;
    const info = document.createElement('div');
    info.className = 'seat-info';
    let meta = player.hand.length + '张 · ' + player.score + '点';
    if (player.finishedRank !== null) meta += ' · 第' + player.finishedRank + '名';
    info.innerHTML =
      '<div class="avatar-wrap">' +
      '<div class="avatar-box">' +
      avatarImg(playerAvatar(player.id)) +
      (thinking
        ? '<div class="think-bubble" aria-hidden="true"><span></span><span></span><span></span></div>'
        : '') +
      '</div>' +
      goodsTagHtml(player.goodsMark) +
      '</div>' +
      '<div><div class="pname">' +
      player.name +
      (isMe ? '（我）' : '') +
      '</div><div class="meta">' +
      meta +
      '</div><div class="seat-stats">' +
      '<span class="stat-chip">' +
      player.hand.length +
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
    const selectable = !!opts.selectable;
    const showFace = opts.showFace !== false;
    if (showFace) {
      player.hand.forEach((card) => {
        const node = renderCard(card, {
          selectable: selectable,
          selectedFlag: selectable && !!selected[card.id],
        });
        if (selectable) {
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
      for (let i = 0; i < player.hand.length; i++) {
        hand.appendChild(renderCard(null, { faceDown: true }));
      }
    }
    if (opts.infoRight) {
      el.appendChild(hand);
      el.appendChild(info);
    } else {
      el.appendChild(info);
      el.appendChild(hand);
    }
  }

  function render() {
    const drawGive = state.phase === 'draw' && state.draw && state.draw.step === 'give';
    const myTurn = state.phase === 'playing' && state.currentPlayer === MY_SEAT;
    const giveGainer =
      drawGive &&
      state.draw.gainers.find((g) => g.seat === MY_SEAT && !mapGet(state.draw.gives, g.seat));
    const canGive = !!giveGainer;

    if (state.phase === 'settled') {
      $('turn-info').textContent = '本局已结束';
      $('btn-next').hidden = false;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      $('btn-draw-give').hidden = true;
    } else if (state.phase === 'draw') {
      $('btn-next').hidden = true;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      if (canGive) {
        const targetSeat = mapGet(state.draw.picks, MY_SEAT);
        $('turn-info').textContent =
          '还牌 · 请选出 ' +
          giveGainer.amount +
          ' 张还给 ' +
          state.players[targetSeat].name;
        $('btn-draw-give').hidden = false;
        $('btn-draw-give').disabled = selectedIds().length !== giveGainer.amount;
      } else {
        $('turn-info').textContent = '第 ' + state.round + ' 局 · 抽牌阶段';
        $('btn-draw-give').hidden = true;
      }
    } else {
      const cur = state.players[state.currentPlayer];
      $('turn-info').textContent =
        '第 ' +
        state.round +
        ' 局 · 轮到 ' +
        cur.name +
        (cur.id === MY_SEAT ? '（你）' : '') +
        ' 出牌';
      $('btn-next').hidden = true;
      $('btn-play').disabled = !(myTurn && selectedIds().length > 0);
      $('btn-pass').disabled = !(myTurn && state.lastPlay !== null);
      if ($('btn-suggest')) $('btn-suggest').disabled = !myTurn;
      $('btn-draw-give').hidden = true;
    }

    fillCenterPlays();

    if (state.revealedTeam || state.phase === 'settled') {
      if (state.solo) {
        $('team-info').textContent =
          '队伍：' +
          state.players[state.teamA[0]].name +
          ' 独吞  vs  ' +
          state.teamB.map((i) => state.players[i].name).join('、');
      } else {
        $('team-info').textContent =
          '队伍：' +
          state.teamA.map((i) => state.players[i].name).join('、') +
          '  vs  ' +
          state.teamB.map((i) => state.players[i].name).join('、');
      }
    } else {
      $('team-info').textContent = '队伍未揭晓（葵扇3、葵扇A 打出后揭晓）';
    }

    const revealAll = state.phase === 'settled';
    const thinkingSeat = state.phase === 'playing' ? state.currentPlayer : -1;
    if ($('turn-banner')) {
      $('turn-banner').classList.toggle('is-on', myTurn);
    }
    fillSeat($('seat-bottom'), state.players[MY_SEAT], {
      selectable: myTurn || canGive,
      showFace: true,
      vertical: false,
      infoRight: true,
      thinking: thinkingSeat === MY_SEAT,
    });
    fillSeat($('seat-right'), state.players[(MY_SEAT + 1) % 4], {
      showFace: revealAll,
      vertical: true,
      thinking: thinkingSeat === (MY_SEAT + 1) % 4,
    });
    fillSeat($('seat-top'), state.players[(MY_SEAT + 2) % 4], {
      showFace: revealAll,
      vertical: false,
      thinking: thinkingSeat === (MY_SEAT + 2) % 4,
    });
    fillSeat($('seat-left'), state.players[(MY_SEAT + 3) % 4], {
      showFace: revealAll,
      vertical: true,
      thinking: thinkingSeat === (MY_SEAT + 3) % 4,
    });

    if (state.phase === 'playing') {
      $('hint').textContent = myTurn
        ? previewText(selectedIds())
        : '等待 ' + state.players[state.currentPlayer].name + ' 出牌';
    } else if (canGive) {
      $('hint').textContent =
        '已选 ' + selectedIds().length + ' / ' + giveGainer.amount + ' 张还牌';
    } else if (state.phase === 'draw') {
      $('hint').textContent = '抽牌进行中';
    } else {
      $('hint').textContent = '结算完成，可点击再来一局';
    }

    renderDrawOverlay();
    ensureDrawAdvance();
    scheduleBot();

    $('log').innerHTML = '';
    const events = state.events || [];
    events.forEach((ev) => $('log').appendChild(renderLogItem(ev)));
    if (events.length !== lastEventCount) {
      lastEventCount = events.length;
      $('log').scrollTop = $('log').scrollHeight;
    }
  }

  $('btn-clear').addEventListener('click', () => {
    clearSelected();
    updateSelectionUi();
  });

  $('btn-draw-give').addEventListener('click', () => {
    const result = PokerGame.giveDrawCards(state, MY_SEAT, selectedIds());
    if (!result.ok) {
      $('hint').textContent = result.reason || '还牌失败';
      return;
    }
    state = result.state;
    clearSelected();
    render();
  });

  $('btn-play').addEventListener('click', () => {
    if (state.currentPlayer !== MY_SEAT) return;
    const result = PokerGame.playCards(state, MY_SEAT, selectedIds());
    if (!result.ok) {
      $('hint').textContent = result.reason || '出牌失败';
      return;
    }
    state = result.state;
    clearSelected();
    render();
  });

  $('btn-pass').addEventListener('click', () => {
    if (state.currentPlayer !== MY_SEAT) return;
    const result = PokerGame.passTurn(state, MY_SEAT);
    if (!result.ok) {
      $('hint').textContent = result.reason || '不能过牌';
      return;
    }
    state = result.state;
    clearSelected();
    render();
  });

  if ($('btn-suggest')) {
    $('btn-suggest').addEventListener('click', () => {
      if (state.phase !== 'playing' || state.currentPlayer !== MY_SEAT) return;
      const me = state.players[MY_SEAT];
      const free = state.lastPlay === null;
      const found = PokerRules.findSmallestLegalPlay(me.hand, free ? null : state.lastPlay, {
        requireDiamond4: isOpeningLead(state),
      });
      clearSelected();
      if (!found) {
        $('hint').textContent =
          state.lastPlay != null ? '没有能压过的牌，可以过牌' : '没有合法出牌';
        updateSelectionUi();
        return;
      }
      for (let i = 0; i < found.ids.length; i++) selected[found.ids[i]] = true;
      updateSelectionUi();
      $('hint').textContent = '提示：' + (found.play.label || '可出') + '（已选中）';
    });
  }

  $('btn-new').addEventListener('click', () => {
    if (!confirm('确定重新开局？累计胜点将清零。')) return;
    clearBotTimer();
    clearDrawTimers();
    state = PokerGame.newGame(NAMES);
    clearSelected();
    lastEventCount = 0;
    render();
  });

  $('btn-next').addEventListener('click', () => {
    clearBotTimer();
    clearDrawTimers();
    state = PokerGame.nextRound(state, NAMES);
    clearSelected();
    lastEventCount = 0;
    render();
  });

  PokerGallery.mount({
    onPicked: function (image) {
      const player = state.players[MY_SEAT];
      PokerGame.addBackgroundLog(state, player.id, player.name, image.name);
      render();
    },
  });

  render();
})();
