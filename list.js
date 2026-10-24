// 必去清單頁：網址參數 t（標題）、e（活動 id，逗號分隔）
(function () {
  var cfg = window.FESTIGO;
  var params = new URLSearchParams(location.search);
  var ids = (params.get('e') || '').split(',').filter(Boolean);
  var title = params.get('t');
  if (title) { document.getElementById('list-title').textContent = title; document.title = title + ' — FestiGo'; }
  document.getElementById('open-app').href = 'festigo://list' + location.search;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  function deviceId() {
    var id = store.get('festigo-device');
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, function () { return (Math.random() * 16 | 0).toString(16); });
      store.set('festigo-device', id);
    }
    return id;
  }
  var wanted = JSON.parse(store.get('festigo-wanted') || '[]');
  function rpc(name, body) {
    return fetch(cfg.rest + '/rpc/' + name, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.key, Authorization: 'Bearer ' + cfg.key },
      body: JSON.stringify(body)
    });
  }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  var counts = {};
  function render(events) {
    var grid = document.getElementById('list');
    var byId = {};
    events.forEach(function (e) { byId[e.id] = e; });
    var shown = ids.map(function (id) { return byId[id]; }).filter(Boolean);
    if (!shown.length) { grid.appendChild(el('p', 'place', cfg.text.empty)); return; }
    shown.forEach(function (e) {
      var card = el('article', 'list-card');
      var cover = el('div', 'cover', e.emoji);
      cover.style.backgroundImage = e.photo ? 'url("' + e.photo + '")' : 'linear-gradient(135deg,' + e.gradient.join(',') + ')';
      if (e.photo) cover.textContent = '';
      card.appendChild(cover);
      var body = el('div', 'body');
      var h3 = el('h3'); var a = el('a', null, e.emoji + ' ' + e.name); a.href = 'e/' + e.id + '.html'; h3.appendChild(a);
      body.appendChild(h3);
      body.appendChild(el('div', 'place', e.place));
      body.appendChild(el('div', 'date', e.when));
      var row = el('div', 'row');
      var count = el('span', 'place');
      var button = el('button', 'want');
      function paint() {
        var n = counts[e.id] || 0;
        count.textContent = n ? cfg.text.people.replace('{n}', n) : '';
        var on = wanted.indexOf(e.id) >= 0;
        button.setAttribute('aria-pressed', String(on));
        button.textContent = on ? cfg.text.wanted : cfg.text.want;
      }
      button.addEventListener('click', function () {
        var on = wanted.indexOf(e.id) < 0;
        wanted = on ? wanted.concat(e.id) : wanted.filter(function (x) { return x !== e.id; });
        store.set('festigo-wanted', JSON.stringify(wanted));
        counts[e.id] = Math.max((counts[e.id] || 0) + (on ? 1 : -1), 0);
        paint();
        rpc('set_interest', { p_device: deviceId(), p_event: e.id, p_interested: on });
      });
      row.appendChild(count); row.appendChild(button); body.appendChild(row); card.appendChild(body);
      grid.appendChild(card);
      paint();
      e.paint = paint;
    });
    rpc('interest_counts', {}).then(function (r) { return r.json(); }).then(function (rows) {
      rows.forEach(function (r) { counts[r.eventId] = r.count; });
      shown.forEach(function (e) { e.paint(); });
    }).catch(function () {});
  }
  fetch(cfg.data).then(function (r) { return r.json(); }).then(render);
})();
