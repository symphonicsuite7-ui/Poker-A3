/**
 * 对接 Spring 原生 WebSocket，事件名与 Socket.IO 相同。
 * 信封：{"id","event","data"} / {"event":"ack"} / {"event":"room:update"}
 */
(function (global) {
  function connect(token) {
    const handlers = {};
    const pending = {};
    let nextId = 1;
    let connected = false;
    let closed = false;
    let connectFired = false;

    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = proto + '//' + location.host + '/ws?token=' + encodeURIComponent(token || '');
    const ws = new WebSocket(url);

    function fire(event, payload) {
      const list = handlers[event] || [];
      for (let i = 0; i < list.length; i++) {
        list[i](payload);
      }
    }

    const ready = new Promise(function (resolve) {
      function done() {
        if (connectFired) return;
        connectFired = true;
        resolve();
      }
      ws.addEventListener('open', function () {
        connected = true;
        fire('connect');
        done();
      });
      ws.addEventListener('error', function () {
        fire('connect_error');
        done();
      });
      ws.addEventListener('close', function (ev) {
        connected = false;
        if (!closed && ev.code === 1008) {
          fire('connect_error');
        }
        fire('disconnect');
        done();
      });
    });

    ws.addEventListener('message', function (ev) {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      if (msg.event === 'ack') {
        const cb = pending[msg.id];
        if (cb) {
          delete pending[msg.id];
          cb({
            ok: !!msg.ok,
            error: msg.error,
            room: msg.room,
            game: msg.game,
          });
        }
        return;
      }
      if (msg.event === 'room:update') {
        fire('room:update', { room: msg.room, game: msg.game });
      }
    });

    return {
      get connected() {
        return connected && ws.readyState === WebSocket.OPEN;
      },
      ready: ready,
      on: function (event, fn) {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(fn);
      },
      emit: function (event, data, ack) {
        if (typeof data === 'function') {
          ack = data;
          data = {};
        }
        const id = String(nextId++);
        if (typeof ack === 'function') {
          pending[id] = ack;
          setTimeout(function () {
            if (pending[id]) {
              delete pending[id];
              ack({ ok: false, error: '请求超时' });
            }
          }, 12000);
        }
        if (ws.readyState !== WebSocket.OPEN) {
          if (typeof ack === 'function') {
            delete pending[id];
            ack({ ok: false, error: '未连接到服务器' });
          }
          return;
        }
        ws.send(JSON.stringify({ id: id, event: event, data: data || {} }));
      },
      disconnect: function () {
        closed = true;
        connected = false;
        try {
          ws.close();
        } catch (e) {}
      },
    };
  }

  global.A3NativeSocket = { connect: connect };
})(window);
