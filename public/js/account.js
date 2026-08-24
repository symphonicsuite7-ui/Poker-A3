/**
 * 用户中心：资料 / 生涯 / 战绩 / 成就（calm-breeze 风格）
 */
(function (global) {
  let overlay = null;
  let getToken = function () {
    return '';
  };
  let onUser = null;
  let activeTab = 'profile';
  let previewObjectUrl = '';

  function token() {
    return typeof getToken === 'function' ? getToken() || '' : '';
  }

  async function api(path, body, method) {
    const opts = {
      method: method || (body ? 'POST' : 'GET'),
      headers: {},
    };
    const t = token();
    if (t) opts.headers.Authorization = 'Bearer ' + t;
    if (body && !(body instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      opts.body = body;
    }
    const res = await fetch(path, opts);
    return res.json().catch(function () {
      return { ok: false, error: '请求失败' };
    });
  }

  function close() {
    if (overlay) overlay.hidden = true;
  }

  function open(tab) {
    if (!overlay) return;
    overlay.hidden = false;
    showTab(tab || activeTab);
  }

  function showTab(tab) {
    activeTab = tab;
    overlay.querySelectorAll('[data-account-tab]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.accountTab === tab);
    });
    overlay.querySelectorAll('[data-account-pane]').forEach(function (pane) {
      pane.hidden = pane.dataset.accountPane !== tab;
    });
    if (tab === 'profile') loadProfile();
    if (tab === 'career') loadCareer();
    if (tab === 'records') loadRecords();
    if (tab === 'achievements') loadAchievements();
  }

  function setStatus(id, msg, isError) {
    const el = overlay.querySelector(id);
    if (!el) return;
    el.hidden = !msg;
    el.textContent = msg || '';
    el.classList.toggle('form-error', !!isError);
  }

  function clearPreviewObjectUrl() {
    if (previewObjectUrl) {
      try {
        URL.revokeObjectURL(previewObjectUrl);
      } catch (e) {}
      previewObjectUrl = '';
    }
  }

  async function loadProfile() {
    const info = await api('/api/user/info');
    if (!info.ok || !info.user) {
      setStatus('#account-profile-error', info.error || '加载失败', true);
      return;
    }
    setStatus('#account-profile-error', '');
    const u = info.user;
    const nick = overlay.querySelector('#account-nickname');
    const name = overlay.querySelector('#account-username');
    const created = overlay.querySelector('#account-created');
    const preview = overlay.querySelector('#account-avatar-preview');
    const fileInput = overlay.querySelector('#account-avatar-file');
    if (nick) nick.value = u.nickname || '';
    if (name) name.textContent = u.username || '';
    if (created) {
      created.textContent = u.createTime
        ? '注册时间 ' + u.createTime.replace('T', ' ').slice(0, 16)
        : '';
    }
    clearPreviewObjectUrl();
    if (fileInput) fileInput.value = '';
    if (preview) preview.src = u.avatar || '/avatars/preset-1.svg';
    if (typeof onUser === 'function') onUser(u);
  }

  async function loadCareer() {
    const pane = overlay.querySelector('[data-account-pane="career"]');
    const data = await api('/api/career');
    if (!data.ok) {
      pane.innerHTML = '<p class="form-error">' + (data.error || '加载失败') + '</p>';
      return;
    }
    const c = data.career || {};
    pane.innerHTML =
      '<div class="career-grid">' +
      chip('总局数', c.totalGames) +
      chip('胜利', c.winGames) +
      chip('失败', c.loseGames) +
      chip('平局', c.drawGames) +
      chip('胜率', (c.winRate || 0) + '%') +
      chip('累计胜点', c.totalScore) +
      chip('独吞', c.soloTimes) +
      chip('独吞头游', c.soloWinTimes) +
      chip('独吞垫底', c.soloLoseTimes) +
      chip('天子', c.emperorTimes) +
      chip('抽牌', c.drawTakeTimes) +
      chip('被抽', c.drawGiveTimes) +
      chip('两回合胜', c.twoRoundWinTimes) +
      '</div>';
  }

  function chip(label, value) {
    return (
      '<div class="career-chip"><span class="career-label">' +
      label +
      '</span><strong>' +
      (value == null ? 0 : value) +
      '</strong></div>'
    );
  }

  async function loadRecords() {
    const pane = overlay.querySelector('[data-account-pane="records"]');
    const data = await api('/api/game/records?limit=20');
    if (!data.ok) {
      pane.innerHTML = '<p class="form-error">' + (data.error || '加载失败') + '</p>';
      return;
    }
    const list = data.records || [];
    if (!list.length) {
      pane.innerHTML = '<p class="account-empty">还没有对局记录。开一局打完后会写到这里。</p>';
      return;
    }
    pane.innerHTML =
      '<ul class="record-list">' +
      list
        .map(function (r) {
          const result = r.result === 'WIN' ? '胜' : r.result === 'LOSE' ? '负' : '平';
          const delta = (r.deltaScore > 0 ? '+' : '') + r.deltaScore;
          const time = r.endTime ? r.endTime.replace('T', ' ').slice(0, 16) : '';
          return (
            '<li><div><strong>' +
            result +
            ' ' +
            delta +
            '</strong><span>' +
            (r.isSolo ? '独吞' : r.winnerType || '') +
            (r.finishRank ? ' · 第' + r.finishRank : '') +
            (r.playedEmperor ? ' · 天子' : '') +
            '</span></div><div class="record-meta">' +
            time +
            '</div></li>'
          );
        })
        .join('') +
      '</ul>';
  }

  async function loadAchievements() {
    const pane = overlay.querySelector('[data-account-pane="achievements"]');
    const data = await api('/api/achievements');
    if (!data.ok) {
      pane.innerHTML = '<p class="form-error">' + (data.error || '加载失败') + '</p>';
      return;
    }
    const items = data.items || [];
    pane.innerHTML =
      '<ul class="achieve-list">' +
      items
        .map(function (a) {
          return (
            '<li class="' +
            (a.unlocked ? 'unlocked' : 'locked') +
            '"><strong>' +
            a.name +
            '</strong><span>' +
            a.desc +
            '</span>' +
            (a.unlocked ? '<em>已解锁 ×' + a.unlockCount + '</em>' : '<em>未解锁</em>') +
            '</li>'
          );
        })
        .join('') +
      '</ul>';
  }

  function ensureDom() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'account-overlay';
    overlay.className = 'gallery-overlay gallery-breeze account-breeze';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="gallery-panel account-panel">' +
      '<div class="gallery-head">' +
      '<h2>我的</h2>' +
      '<button type="button" class="btn-auth-local" id="btn-account-close">关闭</button>' +
      '</div>' +
      '<div class="account-tabs" role="tablist">' +
      '<button type="button" class="tab active" data-account-tab="profile">资料</button>' +
      '<button type="button" class="tab" data-account-tab="career">生涯</button>' +
      '<button type="button" class="tab" data-account-tab="records">战绩</button>' +
      '<button type="button" class="tab" data-account-tab="achievements">成就</button>' +
      '</div>' +
      '<div data-account-pane="profile" class="account-pane-profile">' +
      '<div class="account-profile">' +
      '<button type="button" id="btn-account-avatar" class="account-avatar-hit" title="点击更换头像">' +
      '<img id="account-avatar-preview" class="avatar avatar-lg" src="/avatars/preset-1.svg" alt="头像" />' +
      '<span class="account-avatar-hint">点击更换</span>' +
      '</button>' +
      '<input id="account-avatar-file" type="file" accept="image/jpeg,image/png,image/gif,image/webp" tabindex="-1" />' +
      '<div class="account-profile-meta">' +
      '<div id="account-username" class="account-username"></div>' +
      '<div id="account-created" class="account-created"></div>' +
      '</div></div>' +
      '<label class="account-field">' +
      '<span class="sr-only">昵称</span>' +
      '<input id="account-nickname" maxlength="32" placeholder="昵称（可选）" />' +
      '</label>' +
      '<p id="account-profile-error" class="form-error" hidden></p>' +
      '<button type="button" class="btn-auth-main" id="btn-account-save">保存资料</button>' +
      '</div>' +
      '<div data-account-pane="career" hidden></div>' +
      '<div data-account-pane="records" hidden></div>' +
      '<div data-account-pane="achievements" hidden></div>' +
      '</div>';
    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) close();
    });
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-account-close').addEventListener('click', close);
    overlay.querySelectorAll('[data-account-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showTab(btn.dataset.accountTab);
      });
    });
    overlay.querySelector('#btn-account-save').addEventListener('click', saveProfile);

    const hit = overlay.querySelector('#btn-account-avatar');
    const fileInput = overlay.querySelector('#account-avatar-file');
    hit.addEventListener('click', function () {
      fileInput.click();
    });
    fileInput.addEventListener('change', function () {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        setStatus('#account-profile-error', '头像不能超过 2MB', true);
        fileInput.value = '';
        return;
      }
      clearPreviewObjectUrl();
      previewObjectUrl = URL.createObjectURL(file);
      const preview = overlay.querySelector('#account-avatar-preview');
      if (preview) preview.src = previewObjectUrl;
      setStatus('#account-profile-error', '已选择新头像，点「保存资料」生效');
    });
  }

  async function saveProfile() {
    const nick = overlay.querySelector('#account-nickname').value.trim();
    const file = overlay.querySelector('#account-avatar-file').files[0];
    setStatus('#account-profile-error', '');
    let result;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatus('#account-profile-error', '头像不能超过 2MB', true);
        return;
      }
      const form = new FormData();
      form.append('nickname', nick);
      form.append('avatarFile', file);
      result = await api('/api/user/profile', form, 'POST');
    } else {
      result = await api('/api/user/profile', { nickname: nick });
    }
    if (!result.ok) {
      setStatus('#account-profile-error', result.error || '保存失败', true);
      return;
    }
    overlay.querySelector('#account-avatar-file').value = '';
    clearPreviewObjectUrl();
    setStatus('#account-profile-error', '已保存');
    if (result.token) {
      try {
        localStorage.setItem('poker_token', result.token);
      } catch (e) {}
    }
    if (result.user && typeof onUser === 'function') onUser(result.user);
    const preview = overlay.querySelector('#account-avatar-preview');
    if (preview && result.user && result.user.avatar) preview.src = result.user.avatar;
  }

  function mount(opts) {
    opts = opts || {};
    getToken = opts.getToken || getToken;
    onUser = opts.onUser || null;
    ensureDom();
    const btn = document.getElementById('btn-account');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () {
        open('profile');
      });
    }
  }

  global.PokerAccount = {
    mount: mount,
    open: open,
    close: close,
  };
})(window);
