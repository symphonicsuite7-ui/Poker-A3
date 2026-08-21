/**
 * 界面：一人操控四家
 */
(function () {
  const SUITS = PokerCards.SUITS;
  const RANKS = PokerCards.RANKS;
  const newGame = PokerGame.newGame;
  const playCards = PokerGame.playCards;
  const passTurn = PokerGame.passTurn;
  const nextRound = PokerGame.nextRound;
  const previewPlay = PokerGame.previewPlay;

  let state = newGame();
  let selected = {};

  const el = {
    players: document.getElementById('players'),
    scoreboard: document.getElementById('scoreboard'),
    turnInfo: document.getElementById('turn-info'),
    lastPlay: document.getElementById('last-play'),
    teamInfo: document.getElementById('team-info'),
    hint: document.getElementById('hint'),
    log: document.getElementById('log'),
    showAll: document.getElementById('show-all'),
    btnPlay: document.getElementById('btn-play'),
    btnPass: document.getElementById('btn-pass'),
    btnClear: document.getElementById('btn-clear'),
    btnNew: document.getElementById('btn-new'),
    btnNext: document.getElementById('btn-next'),
  };

  function selectedIds() {
    return Object.keys(selected).filter(function (k) {
      return selected[k];
    });
  }

  function clearSelected() {
    selected = {};
  }

  el.showAll.addEventListener('change', render);
  el.btnClear.addEventListener('click', function () {
    clearSelected();
    render();
  });
  el.btnPlay.addEventListener('click', onPlay);
  el.btnPass.addEventListener('click', onPass);
  el.btnNew.addEventListener('click', function () {
    if (!confirm('确定重新开局？累计胜点将清零。')) return;
    state = newGame([0, 0, 0, 0]);
    clearSelected();
    render();
  });
  el.btnNext.addEventListener('click', function () {
    state = nextRound(state);
    clearSelected();
    render();
  });

  function onPlay() {
    const result = playCards(state, selectedIds());
    if (!result.ok) {
      el.hint.textContent = result.reason || '出牌失败';
      return;
    }
    state = result.state;
    clearSelected();
    render();
  }

  function onPass() {
    const result = passTurn(state);
    if (!result.ok) {
      el.hint.textContent = result.reason || '不能过牌';
      return;
    }
    state = result.state;
    clearSelected();
    render();
  }

  function toggleSelect(cardId, playerId) {
    if (state.phase !== 'playing') return;
    if (playerId !== state.currentPlayer) return;
    if (selected[cardId]) delete selected[cardId];
    else selected[cardId] = true;
    render();
  }

  function renderCard(card, opts) {
    opts = opts || {};
    const div = document.createElement('button');
    div.type = 'button';
    div.className = 'card';
    if (opts.faceDown) {
      div.classList.add('back');
      div.title = '牌背';
      return div;
    }
    const suit = SUITS[card.suit];
    div.classList.add(suit.color);
    if (opts.selectable) div.classList.add('playable');
    if (opts.selectedFlag) div.classList.add('selected');
    div.dataset.id = card.id;
    div.innerHTML =
      '<span class="suit">' +
      suit.symbol +
      '</span><span class="rank">' +
      RANKS[card.rank].name +
      '</span>';
    div.title = suit.name + RANKS[card.rank].name;
    return div;
  }

  function renderLastPlayCards(play) {
    if (!play) return '自由出牌（任意合法牌型）';
    const who =
      state.lastPlayPlayer != null
        ? state.players[state.lastPlayPlayer].name
        : '';
    let cardsHtml = '';
    for (let i = 0; i < play.cards.length; i++) {
      const c = play.cards[i];
      const suit = SUITS[c.suit];
      cardsHtml +=
        '<span class="card tiny ' +
        suit.color +
        '" title="' +
        suit.name +
        RANKS[c.rank].name +
        '"><span class="suit">' +
        suit.symbol +
        '</span><span class="rank">' +
        RANKS[c.rank].name +
        '</span></span>';
    }
    return (
      who +
      ' 出了 <b>' +
      play.label +
      '</b>：<span class="hand" style="display:inline-flex;vertical-align:middle;gap:4px;margin-left:6px">' +
      cardsHtml +
      '</span>'
    );
  }

  function render() {
    el.scoreboard.innerHTML = '';
    state.players.forEach(function (p) {
      const chip = document.createElement('div');
      chip.className =
        'score-chip' + (p.id === state.currentPlayer ? ' active' : '');
      chip.innerHTML =
        '<div class="name">' +
        p.name +
        '</div><div class="pts">' +
        p.score +
        '</div>';
      el.scoreboard.appendChild(chip);
    });

    if (state.phase === 'settled') {
      el.turnInfo.textContent = '本局已结束';
      el.btnNext.hidden = false;
      el.btnPlay.disabled = true;
      el.btnPass.disabled = true;
    } else {
      const cur = state.players[state.currentPlayer];
      el.turnInfo.textContent =
        '第 ' +
        state.round +
        ' 局 · 轮到 ' +
        cur.name +
        ' 出牌（手牌 ' +
        cur.hand.length +
        ' 张）';
      el.btnNext.hidden = true;
      el.btnPlay.disabled = selectedIds().length === 0;
      el.btnPass.disabled = state.lastPlay === null;
    }

    el.lastPlay.innerHTML = renderLastPlayCards(state.lastPlay);

    if (state.revealedTeam || state.phase === 'settled') {
      if (state.solo) {
        el.teamInfo.textContent =
          '队伍：' +
          state.players[state.teamA[0]].name +
          ' 独吞  vs  ' +
          state.teamB
            .map(function (i) {
              return state.players[i].name;
            })
            .join('、');
      } else {
        el.teamInfo.textContent =
          '队伍：' +
          state.teamA
            .map(function (i) {
              return state.players[i].name;
            })
            .join('、') +
          '  vs  ' +
          state.teamB
            .map(function (i) {
              return state.players[i].name;
            })
            .join('、');
      }
    } else {
      el.teamInfo.textContent = '队伍未揭晓（葵扇3、葵扇A 打出后揭晓）';
    }

    const showAll = el.showAll.checked;
    el.players.innerHTML = '';
    state.players.forEach(function (p) {
      const row = document.createElement('div');
      row.className = 'player-row';
      if (p.id === state.currentPlayer && state.phase === 'playing') {
        row.classList.add('current');
      }
      if (p.finishedRank !== null) row.classList.add('finished');

      const head = document.createElement('div');
      head.className = 'player-head';
      let meta = '剩余 ' + p.hand.length + ' 张';
      if (p.finishedRank !== null) meta += ' · 第 ' + p.finishedRank + ' 名';
      head.innerHTML =
        '<span class="pname">' +
        p.name +
        '</span><span class="meta">' +
        meta +
        '</span>';
      row.appendChild(head);

      const hand = document.createElement('div');
      hand.className = 'hand';

      const canOperate =
        showAll || p.id === state.currentPlayer || state.phase === 'settled';

      p.hand.forEach(function (card) {
        const faceDown = !canOperate;
        const selectable =
          state.phase === 'playing' &&
          p.id === state.currentPlayer &&
          !faceDown;
        const node = renderCard(card, {
          selectable: selectable,
          selectedFlag: !!selected[card.id],
          faceDown: faceDown,
        });
        if (selectable) {
          node.addEventListener('click', function () {
            toggleSelect(card.id, p.id);
          });
        }
        hand.appendChild(node);
      });

      row.appendChild(hand);
      el.players.appendChild(row);
    });

    if (state.phase === 'playing') {
      const preview = previewPlay(state, selectedIds());
      el.hint.textContent = preview.text;
    } else {
      const ranks = state.players
        .slice()
        .sort(function (a, b) {
          return (a.finishedRank || 9) - (b.finishedRank || 9);
        })
        .map(function (p) {
          return p.name + '第' + p.finishedRank + '名(' + p.score + '点)';
        })
        .join('，');
      el.hint.textContent = '结算完成：' + ranks;
    }

    el.log.innerHTML = '';
    const hist = state.history.slice().reverse();
    for (let i = 0; i < hist.length; i++) {
      const li = document.createElement('li');
      li.textContent = hist[i];
      el.log.appendChild(li);
    }
  }

  render();
})();
