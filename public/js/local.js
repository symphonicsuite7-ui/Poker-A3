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
  /** 吞噬还牌：已点「还牌」、等待点选对象 */
  let pendingGivePick = false;

  const $ = (id) => document.getElementById(id);
  /** 节点可能已从牌桌中间移除，写入前先判断 */
  const setText = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text;
  };

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
  function chooseBotPlayIds(hand, lastPlay, opts) {
    opts = opts || {};
    if (!hand || !hand.length) return null;
    // 统一走规则提示逻辑，首出必须含方片4
    if (typeof PokerRules.findSmallestLegalPlay === 'function') {
      const found = PokerRules.findSmallestLegalPlay(hand, lastPlay, {
        requireDiamond4: !!opts.requireDiamond4,
      });
      return found && found.ids && found.ids.length ? found.ids : null;
    }
    const sizes = beatSizes(lastPlay);
    let best = null;
    for (let s = 0; s < sizes.length; s++) {
      eachCombo(hand, sizes[s], function (cards) {
        if (opts.requireDiamond4 && !cards.some(PokerCards.isDiamond4)) return;
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

  function botGiveIds(seat, amount) {
    const d = state.draw;
    const need = amount != null ? amount : (d.gainers.find((x) => x.seat === seat) || {}).amount || 0;
    if (!need) return [];
    const hand = state.players[seat].hand;
    const ids = [];
    const used = {};
    (d.takes || []).forEach((t) => {
      if (t.to !== seat) return;
      (t.cards || []).forEach((c) => {
        if (ids.length >= need) return;
        if (used[c.id]) return;
        if (hand.some((h) => h.id === c.id)) {
          ids.push(c.id);
          used[c.id] = true;
        }
      });
    });
    for (let i = 0; i < hand.length && ids.length < need; i++) {
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
    const hand = state.players[seat].hand;
    const opening = isOpeningLead(state);
    let ids = chooseBotPlayIds(hand, state.lastPlay, { requireDiamond4: opening });
    // 首出兜底：至少打出方片4
    if ((!ids || !ids.length) && opening) {
      const d4 = hand.find(PokerCards.isDiamond4);
      if (d4) ids = [d4.id];
    }
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
    } else {
      // 失败时清掉等待键，避免卡死不再调度
      botWaitKey = '';
      scheduleBot();
    }
  }

  function runBotDevour(seat) {
    botTimer = null;
    if (state.phase !== 'draw' || !state.draw || state.draw.step !== 'devour') return;
    if (!isBot(seat)) return;
    const result = PokerGame.devourDraw(state, seat);
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
    let result;
    if (PokerGame.isDevourDraw(state.draw)) {
      const rem = PokerGame.remainingGiveLosers(state.draw, seat);
      if (!rem.length) return;
      const target = rem[0];
      const ids = botGiveIds(seat, target.amount);
      result = PokerGame.giveDrawCards(state, seat, ids, target.seat);
    } else {
      if (mapGet(state.draw.gives, seat)) return;
      result = PokerGame.giveDrawCards(state, seat, botGiveIds(seat));
    }
    if (result.ok) {
      state = result.state;
      clearSelected();
      pendingGivePick = false;
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
      if (d.step === 'devour') {
        const g = d.gainers[0];
        if (g && isBot(g.seat)) key = 'devour:' + g.seat;
      } else if (d.step === 'pick') {
        const g = d.gainers.find((x) => mapGet(d.picks, x.seat) == null);
        if (g && isBot(g.seat)) key = 'pick:' + g.seat;
      } else if (d.step === 'give') {
        if (PokerGame.isDevourDraw(d)) {
          const g = d.gainers[0];
          if (g && isBot(g.seat) && PokerGame.remainingGiveLosers(d, g.seat).length) {
            key = 'give:' + g.seat + ':' + PokerGame.remainingGiveLosers(d, g.seat).length;
          }
        } else {
          const g = d.gainers.find((x) => !mapGet(d.gives, x.seat));
          if (g && isBot(g.seat)) key = 'give:' + g.seat;
        }
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
    } else if (key.indexOf('devour:') === 0) {
      const seat = Number(key.split(':')[1]);
      botTimer = setTimeout(function () {
        runBotDevour(seat);
      }, BOT_DELAY_MS);
    } else if (key.indexOf('pick:') === 0) {
      const seat = Number(key.split(':')[1]);
      botTimer = setTimeout(function () {
        runBotPick(seat);
      }, BOT_DELAY_MS);
    } else {
      const seat = Number(key.split(':')[1]);
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

  function canPlayerGive(seat) {
    const d = state.draw;
    if (state.phase !== 'draw' || !d || d.step !== 'give') return false;
    if (!d.gainers.some((g) => g.seat === seat)) return false;
    if (PokerGame.isDevourDraw(d)) {
      return PokerGame.remainingGiveLosers(d, seat).length > 0;
    }
    return !mapGet(d.gives, seat);
  }

  function giveNeedAmount(seat) {
    const d = state.draw;
    if (!d) return 0;
    if (PokerGame.isDevourDraw(d)) return PokerGame.giveChunkSize(d, seat);
    const g = d.gainers.find((x) => x.seat === seat);
    return g ? g.amount : 0;
  }

  function renderDrawOverlay() {
    const overlay = $('draw-overlay');
    const d = state.draw;
    const devourBtn = $('btn-draw-devour');
    if (devourBtn) devourBtn.hidden = true;

    const showGivePick =
      pendingGivePick &&
      state.phase === 'draw' &&
      d &&
      d.step === 'give' &&
      PokerGame.isDevourDraw(d) &&
      canPlayerGive(MY_SEAT);

    if (
      state.phase !== 'draw' ||
      !d ||
      d.step === 'done' ||
      (d.step === 'give' && !showGivePick)
    ) {
      if (!showGivePick) overlay.hidden = true;
      if (!showGivePick) return;
    }

    overlay.hidden = false;
    $('draw-targets').innerHTML = '';
    $('draw-cards').innerHTML = '';
    if ($('draw-cards')) delete $('draw-cards').dataset.snap;
    $('draw-timer').textContent = '';

    if (d.step === 'devour') {
      const g = d.gainers[0];
      const isMe = g && g.seat === MY_SEAT;
      $('draw-title').textContent = '吞噬' + g.amount + '张牌';
      $('draw-desc').textContent = isMe
        ? '点击吞噬，从各减分者手中按失分张数平分抽取'
        : '等待 ' + state.players[g.seat].name + ' 吞噬';
      if (devourBtn) {
        devourBtn.hidden = !isMe;
        devourBtn.textContent = '吞噬';
      }
    } else if (showGivePick) {
      const need = giveNeedAmount(MY_SEAT);
      const rem = PokerGame.remainingGiveLosers(d, MY_SEAT);
      $('draw-title').textContent = '还牌：选择对象';
      $('draw-desc').textContent =
        '已选 ' + need + ' 张，请选择一名减分者归还（还需还 ' + rem.length + ' 人）';
      rem.forEach((loser) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'draw-target';
        btn.innerHTML =
          avatarImg(playerAvatar(loser.seat)) +
          '<span>' +
          state.players[loser.seat].name +
          '</span><span class="meta">归还 ' +
          loser.amount +
          ' 张</span>';
        btn.addEventListener('click', () => {
          const result = PokerGame.giveDrawCards(state, MY_SEAT, selectedIds(), loser.seat);
          if (!result.ok) {
            $('hint').textContent = result.reason || '还牌失败';
            return;
          }
          state = result.state;
          clearSelected();
          pendingGivePick = false;
          render();
        });
        $('draw-targets').appendChild(btn);
      });
    } else if (d.step === 'pick') {
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
      setDrawCardsHtml(renderDrawCardGroups(d.takes, 'to', 'from', '抽了'));
      $('draw-timer').textContent =
        '剩余 ' + Math.max(0, Math.ceil((d.revealUntil - Date.now()) / 1000)) + ' 秒';
    } else if (d.step === 'showGive') {
      $('draw-title').textContent = '还给的牌';
      $('draw-desc').textContent = '还回的牌公示给所有人';
      setDrawCardsHtml(
        renderDrawCardGroups(d.giveCards, 'from', 'to', '还给')
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
    const myTurn = state.phase === 'playing' && state.currentPlayer === MY_SEAT;
    const canGive = canPlayerGive(MY_SEAT);
    const need = giveNeedAmount(MY_SEAT);
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
      $('btn-draw-give').disabled = ids.length !== need;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      $('hint').textContent = '已选 ' + ids.length + ' / ' + need + ' 张还牌';
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
    let skill = null;
    if (window.PokerBattleSkills) {
      const streak = PokerBattleSkills.previewStreakCount(
        state.events || [],
        play.type,
        free ? null : state.lastPlay
      );
      skill = PokerBattleSkills.resolveSkill(play.type, streak);
    }
    return '可出：' + (skill ? skill.displayName : play.label);
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

  let lastBattleSkillKey = '';

  /** 桌子中间展示当前连续压制战技 */
  function updateBattleSkillBanner() {
    const root = $('battle-skill');
    const nameEl = $('battle-skill-name');
    const descEl = $('battle-skill-desc');
    if (!root || !nameEl || !descEl || !window.PokerBattleSkills) return;

    const skill = PokerBattleSkills.resolveFromEvents((state && state.events) || []);
    if (!skill) {
      root.hidden = true;
      lastBattleSkillKey = '';
      return;
    }

    const key = skill.type + ':' + skill.streak + ':' + skill.displayName;
    nameEl.textContent = skill.displayName;
    nameEl.setAttribute('data-tip', skill.description);
    nameEl.setAttribute('title', skill.description);
    descEl.textContent = skill.description;
    root.hidden = false;

    if (key !== lastBattleSkillKey) {
      lastBattleSkillKey = key;
      root.classList.remove('is-enter');
      void root.offsetWidth;
      root.classList.add('is-enter');
    }
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
    updateBattleSkillBanner();
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
    const prevHand = el.id === 'seat-bottom' ? el.querySelector('.hand.horizontal') : null;
    const savedScroll = prevHand ? prevHand.scrollLeft : 0;
    const savedFire =
      el.id === 'seat-bottom' ? el.querySelector('.hand-fire-canvas') : null;
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

  function render() {
    const drawGive = state.phase === 'draw' && state.draw && state.draw.step === 'give';
    const myTurn = state.phase === 'playing' && state.currentPlayer === MY_SEAT;
    const canGive = canPlayerGive(MY_SEAT);
    const need = giveNeedAmount(MY_SEAT);
    const gameScreen = document.querySelector('.screen-game');
    if (gameScreen) gameScreen.classList.toggle('draw-give-select', canGive);

    if (state.phase === 'settled') {
      setText('turn-info', '本局已结束');
      $('btn-next').hidden = false;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      $('btn-draw-give').hidden = true;
      pendingGivePick = false;
    } else if (state.phase === 'draw') {
      $('btn-next').hidden = true;
      $('btn-play').disabled = true;
      $('btn-pass').disabled = true;
      if ($('btn-suggest')) $('btn-suggest').disabled = true;
      if (canGive) {
        setText(
          'turn-info',
          PokerGame.isDevourDraw(state.draw)
            ? '还牌 · 请选出 ' + need + ' 张，点还牌后再选对象'
            : '还牌 · 请选出 ' + need + ' 张还给 ' + state.players[mapGet(state.draw.picks, MY_SEAT)].name
        );
        $('btn-draw-give').hidden = false;
        $('btn-draw-give').disabled = selectedIds().length !== need;
      } else {
        if (state.draw && state.draw.step === 'devour') {
          const g = state.draw.gainers[0];
          setText(
            'turn-info',
            g.seat === MY_SEAT
              ? '吞噬 ' + g.amount + ' 张牌'
              : '等待 ' + state.players[g.seat].name + ' 吞噬'
          );
        } else {
          setText('turn-info', '第 ' + state.round + ' 局 · 抽牌阶段');
        }
        $('btn-draw-give').hidden = true;
        if (!drawGive) pendingGivePick = false;
      }
    } else {
      const cur = state.players[state.currentPlayer];
      setText(
        'turn-info',
        '第 ' +
          state.round +
          ' 局 · 轮到 ' +
          cur.name +
          (cur.id === MY_SEAT ? '（你）' : '') +
          ' 出牌'
      );
      $('btn-next').hidden = true;
      $('btn-play').disabled = !(myTurn && selectedIds().length > 0);
      $('btn-pass').disabled = !(myTurn && state.lastPlay !== null);
      if ($('btn-suggest')) $('btn-suggest').disabled = !myTurn;
      $('btn-draw-give').hidden = true;
    }

    fillCenterPlays();

    if (state.revealedTeam || state.phase === 'settled') {
      if (state.solo) {
        setText(
          'team-info',
          '队伍：' +
            state.players[state.teamA[0]].name +
            ' 独吞  vs  ' +
            state.teamB.map((i) => state.players[i].name).join('、')
        );
      } else {
        setText(
          'team-info',
          '队伍：' +
            state.teamA.map((i) => state.players[i].name).join('、') +
            '  vs  ' +
            state.teamB.map((i) => state.players[i].name).join('、')
        );
      }
    } else {
      setText('team-info', '队伍未揭晓（葵扇3、葵扇A 打出后揭晓）');
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

    // 轮到自己操作时，手牌背后播放像素火焰
    if (window.PokerPixelFire) {
      PokerPixelFire.syncMyTurn(myTurn || canGive, $('seat-bottom'));
    }

    if (state.phase === 'playing') {
      $('hint').textContent = myTurn
        ? previewText(selectedIds())
        : '等待 ' + state.players[state.currentPlayer].name + ' 出牌';
    } else if (canGive) {
      $('hint').textContent =
        '已选 ' + selectedIds().length + ' / ' + need + ' 张还牌';
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
    const need = giveNeedAmount(MY_SEAT);
    const ids = selectedIds();
    if (ids.length !== need) {
      $('hint').textContent = '请选择 ' + need + ' 张还牌';
      return;
    }
    if (PokerGame.isDevourDraw(state.draw)) {
      pendingGivePick = true;
      renderDrawOverlay();
      $('hint').textContent = '请选择还牌对象';
      return;
    }
    const result = PokerGame.giveDrawCards(state, MY_SEAT, ids);
    if (!result.ok) {
      $('hint').textContent = result.reason || '还牌失败';
      return;
    }
    state = result.state;
    clearSelected();
    render();
  });

  if ($('btn-draw-devour')) {
    $('btn-draw-devour').addEventListener('click', () => {
      const result = PokerGame.devourDraw(state, MY_SEAT);
      if (!result.ok) {
        $('hint').textContent = result.reason || '吞噬失败';
        return;
      }
      state = result.state;
      clearSelected();
      render();
    });
  }

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
        // 自由出牌（含三家都过后）：提示选能出的最多张
        preferLargest: free,
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

  const savedBackground = PokerGallery.currentImage ? PokerGallery.currentImage() : null;
  const initialAssets = AVATARS.concat(savedBackground && savedBackground.url ? [savedBackground.url] : []);
  PokerPreloader.prepare(initialAssets).then((result) => {
    render();
    PokerPreloader.hide();
    if (result.failed) {
      $('hint').textContent = result.failed + ' 个图片加载失败，牌局仍可继续';
    }
  });
})();
