/* Điểm danh lớp – thudao.com · v1.0.0
   Trang Blogspot chỉ cần <div id="ddl"></div> + window.DDL_CONFIG = { API_URL: "<URL /exec của Apps Script>" }. */
(function () {
  'use strict';
  var root = document.getElementById('ddl');
  if (!root) return;
  var CFG = window.DDL_CONFIG || {};
  var API = String(CFG.API_URL || '').replace(/&amp;/g, '&').trim();
  var KEY_STORE = 'ddl_key';
  var CARD_LABEL = { 'Tháng': 'Thẻ tháng', '12 buổi': 'Thẻ 12 buổi', '52 buổi': 'Thẻ năm' };
  var CARDS = ['Tháng', '12 buổi', '52 buổi'];

  var S = { key: '', students: [], logs: [], tab: 'att', sel: {}, q: '', open: '', hist: {}, busy: false };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ''; if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return ''; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, el) { return (el || root).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || root).querySelectorAll(sel)); }

  /* ---------- Giờ Việt Nam ---------- */
  function vnParts() {
    var o = {};
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short' })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) {
      var d = new Date(Date.now() + 7 * 3600000);
      o = { day: pad(d.getUTCDate()), month: pad(d.getUTCMonth() + 1), year: String(d.getUTCFullYear()), hour: pad(d.getUTCHours()), minute: pad(d.getUTCMinutes()), second: pad(d.getUTCSeconds()), weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()] };
    }
    if (o.hour === '24') o.hour = '00';
    return o;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var THU = { Sun: 'Chủ nhật', Mon: 'Thứ hai', Tue: 'Thứ ba', Wed: 'Thứ tư', Thu: 'Thứ năm', Fri: 'Thứ sáu', Sat: 'Thứ bảy' };
  function vnToday() { var p = vnParts(); return p.day + '/' + p.month + '/' + p.year; }
  function tick() {
    var el = $('#dd-clock');
    if (!el) return;
    var p = vnParts();
    el.innerHTML = (THU[p.weekday] || '') + ', ' + p.day + '/' + p.month + '/' + p.year + ' · <b>' + p.hour + ':' + p.minute + ':' + p.second + '</b> (giờ Việt Nam)';
  }

  /* ---------- Gọi Apps Script ---------- */
  function api(action, data) {
    if (!API || API.indexOf('http') !== 0) return Promise.reject(new Error('Trang chưa có API_URL trong DDL_CONFIG.'));
    var body = data || {};
    body.action = action;
    body.key = S.key;
    return fetch(API, { method: 'POST', body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) { var e = new Error(j.error || 'Lỗi máy chủ'); e.auth = j.auth === false; throw e; }
        return j;
      });
  }

  function toast(t) {
    var old = $('.dd-toast'); if (old) old.remove();
    var d = document.createElement('div'); d.className = 'dd-toast'; d.textContent = t; root.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.remove(); }, 2600);
  }
  function fail(e) {
    if (e && e.auth) { store(KEY_STORE, null); S.key = ''; showLogin('Sai mật khẩu, thầy nhập lại nhé.'); return; }
    toast((e && e.message) || 'Có lỗi, thử lại.');
  }

  /* ---------- Đăng nhập ---------- */
  function showLogin(msg) {
    root.innerHTML = head() +
      '<div class="dd-card"><h3>Mật khẩu quản lý lớp</h3>' +
      '<input class="dd-in" id="dd-pass" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu đã đặt trong Apps Script">' +
      '<div class="dd-actions"><button class="dd-btn pri" id="dd-login">Vào trang điểm danh</button></div>' +
      '<p class="dd-msg' + (msg ? ' err' : '') + '" id="dd-lmsg">' + esc(msg || 'Máy này sẽ nhớ mật khẩu, lần sau không cần nhập lại.') + '</p></div>';
    tick();
    var go = function () {
      var v = $('#dd-pass').value.trim();
      if (!v) return;
      S.key = v;
      $('#dd-lmsg').className = 'dd-msg'; $('#dd-lmsg').textContent = 'Đang kiểm tra…';
      load(true);
    };
    $('#dd-login').onclick = go;
    $('#dd-pass').onkeydown = function (e) { if (e.key === 'Enter') go(); };
  }

  function load(first) {
    return api('list').then(function (j) {
      if (first) store(KEY_STORE, S.key);
      S.students = j.students || [];
      S.logs = j.logs || [];
      render();
    }).catch(function (e) {
      if (first && !e.auth) { var m = $('#dd-lmsg'); if (m) { m.className = 'dd-msg err'; m.textContent = e.message; return; } }
      if (!e.auth && !$('#dd-body')) {
        root.innerHTML = head() + '<div class="dd-card"><p class="dd-msg err">Không tải được danh sách: ' + esc(e.message) + '</p><div class="dd-actions"><button class="dd-btn pri" id="dd-retry">Thử lại</button></div></div>';
        tick(); $('#dd-retry').onclick = function () { load(false); };
        return;
      }
      fail(e);
    });
  }

  /* ---------- Khung trang ---------- */
  function active() { return S.students.filter(function (s) { return s.state !== 'Thôi học'; }); }
  function head() {
    var a = active(), paid = a.filter(function (s) { return s.paid; }).length;
    return '<div class="dd-head"><p class="dd-kicker">Thư Đạo · Sổ lớp</p><h2 class="dd-title">Điểm danh học viên</h2>' +
      '<div class="dd-clock" id="dd-clock"></div>' +
      (S.key && S.students.length ? '<div class="dd-stats"><div class="dd-stat"><b>' + a.length + '</b><span>Đang học</span></div>' +
        '<div class="dd-stat g"><b>' + paid + '</b><span>Đã đóng phí</span></div>' +
        '<div class="dd-stat r"><b>' + (a.length - paid) + '</b><span>Chưa đóng phí</span></div></div>' : '') +
      '</div>';
  }

  function render() {
    var y = window.scrollY;
    root.innerHTML = head() +
      '<div class="dd-tabs">' +
      tabBtn('att', 'Điểm danh') + tabBtn('hv', 'Học viên') + tabBtn('log', 'Giáo án đã dạy') +
      '</div><div id="dd-body"></div>';
    tick();
    $$('.dd-tabs button').forEach(function (b) { b.onclick = function () { S.tab = b.getAttribute('data-t'); S.open = ''; render(); window.scrollTo(0, 0); }; });
    if (S.tab === 'att') renderAtt(); else if (S.tab === 'hv') renderHV(); else renderLogs();
    window.scrollTo(0, y);
  }
  function tabBtn(t, label) { return '<button data-t="' + t + '" class="' + (S.tab === t ? 'on' : '') + '">' + label + '</button>'; }

  function cardText(s) { return (CARD_LABEL[s.card] || s.card) + ' · ' + s.inCard + '/' + s.size; }
  function nameCls(s) { return s.paid ? 'paid' : 'unpaid'; }
  function progBar(s) { return '<div class="dd-prog ' + nameCls(s) + '"><i style="width:' + Math.min(100, Math.round(s.inCard / s.size * 100)) + '%"></i></div>'; }
  function match(s) { var q = S.q.trim().toLowerCase(); return !q || s.name.toLowerCase().indexOf(q) >= 0 || s.id.toLowerCase().indexOf(q) >= 0; }
  function todayTime(s) { var t = vnToday(); return s.last && s.last.indexOf(t) === 0 ? s.last.slice(11) : ''; }

  /* ---------- Tab Điểm danh ---------- */
  function renderAtt() {
    var list = active().filter(match);
    var n = Object.keys(S.sel).length;
    var h = '<div class="dd-card"><h3>Giáo án chung cho buổi này</h3>' +
      '<textarea class="dd-in" id="dd-common" placeholder="Ví dụ: Nét ngang, nét sổ; viết chữ Tâm. Bấm nút dưới để điền cho các bạn đã chọn, rồi sửa riêng từng bạn nếu cần."></textarea>' +
      '<div class="dd-actions"><button class="dd-btn sm" id="dd-fill">Điền cho các bạn đã chọn</button><button class="dd-btn sm" id="dd-all">Chọn tất cả</button><button class="dd-btn sm" id="dd-none">Bỏ chọn</button></div></div>' +
      '<div class="dd-tools"><input class="dd-in" id="dd-q" type="search" placeholder="Tìm tên học viên…" value="' + esc(S.q) + '"></div>';
    if (!S.students.length) h += '<div class="dd-empty">Chưa có học viên. Sang tab <b>Học viên</b> để thêm.</div>';
    else if (!list.length) h += '<div class="dd-empty">Không có học viên khớp.</div>';
    h += '<div class="dd-list">' + list.map(function (s) {
      var on = S.sel.hasOwnProperty(s.id), tt = todayTime(s);
      return '<div class="dd-item' + (on ? ' sel' : '') + '" data-id="' + esc(s.id) + '">' +
        '<label class="dd-line"><input type="checkbox" ' + (on ? 'checked' : '') + '>' +
        '<span class="dd-who"><span class="dd-name ' + nameCls(s) + '">' + esc(s.name) + '</span>' +
        '<span class="dd-sub">' + esc(cardText(s)) + ' · Tổng ' + s.total + ' buổi' + (tt ? '<span class="dd-today">Đã điểm danh ' + esc(tt) + '</span>' : '') + '</span></span>' +
        '<span class="dd-pill ' + nameCls(s) + '">' + (s.paid ? 'Đã đóng' : 'Chưa đóng') + '</span></label>' + progBar(s) +
        (on ? '<div class="dd-plan"><textarea class="dd-in" placeholder="Giáo án buổi này của ' + esc(s.name) + '">' + esc(S.sel[s.id]) + '</textarea></div>' : '') +
        '</div>';
    }).join('') + '</div>' +
      '<div class="dd-bar"><div class="dd-bar-in"><span>' + (n ? 'Đã chọn <b>' + n + '</b> học viên' : 'Tích vào tên để điểm danh') + '</span>' +
      '<button class="dd-btn pri" id="dd-go"' + (n && !S.busy ? '' : ' disabled') + '>' + (S.busy ? 'Đang lưu…' : 'Điểm danh' + (n ? ' (' + n + ')' : '')) + '</button></div></div>';
    $('#dd-body').innerHTML = h;

    $('#dd-q').oninput = function () { S.q = this.value; var p = this.selectionStart; renderAtt(); var q = $('#dd-q'); q.focus(); try { q.setSelectionRange(p, p); } catch (e) {} };
    $$('.dd-item').forEach(function (it) {
      var id = it.getAttribute('data-id');
      $('input[type=checkbox]', it).onchange = function () {
        if (this.checked) S.sel[id] = ($('#dd-common').value || '').trim(); else delete S.sel[id];
        var keep = $('#dd-common').value; renderAtt(); $('#dd-common').value = keep;
      };
      var ta = $('.dd-plan textarea', it);
      if (ta) ta.oninput = function () { S.sel[id] = this.value; };
    });
    $('#dd-fill').onclick = function () {
      var v = $('#dd-common').value.trim();
      if (!Object.keys(S.sel).length) { toast('Chưa chọn học viên nào.'); return; }
      Object.keys(S.sel).forEach(function (k) { S.sel[k] = v; });
      renderAtt(); $('#dd-common').value = v;
    };
    $('#dd-all').onclick = function () { var v = $('#dd-common').value.trim(); list.forEach(function (s) { if (!S.sel.hasOwnProperty(s.id)) S.sel[s.id] = v; }); renderAtt(); $('#dd-common').value = v; };
    $('#dd-none').onclick = function () { var v = $('#dd-common').value; S.sel = {}; renderAtt(); $('#dd-common').value = v; };
    $('#dd-go').onclick = submit;
  }

  function submit() {
    var ids = Object.keys(S.sel);
    if (!ids.length || S.busy) return;
    var again = ids.filter(function (id) { var s = byId(id); return s && todayTime(s); });
    if (again.length && !confirm(again.map(function (id) { return byId(id).name; }).join(', ') + ' đã được điểm danh hôm nay. Vẫn ghi thêm một buổi nữa?')) return;
    S.busy = true; renderAtt();
    api('checkin', { items: ids.map(function (id) { return { id: id, plan: S.sel[id] }; }) }).then(function (j) {
      S.busy = false; S.sel = {};
      (j.done || []).forEach(upsert);
      toast('Đã điểm danh ' + (j.done || []).length + ' học viên lúc ' + j.time);
      return load().then(function () { askFees(j.ask || []); });
    }).catch(function (e) { S.busy = false; renderAtt(); fail(e); });
  }

  /* ---------- Hỏi học phí khi hết chu kỳ thẻ ---------- */
  function askFees(queue) {
    if (!queue.length) return;
    var a = queue.shift();
    var what = a.card === 'Tháng' ? 'đã học đủ ' + a.size + ' buổi của thẻ tháng' : 'đã học hết thẻ ' + a.size + ' buổi';
    var next = a.card === 'Tháng' ? 'tháng tiếp theo' : 'thẻ mới';
    modal('Học phí · ' + a.name, '<b>' + esc(a.name) + '</b> ' + what + '. Học viên đã đóng học phí cho ' + next + ' chưa?',
      [{ t: 'Chưa đóng', c: 'pri', v: false }, { t: 'Đã đóng', c: 'ok', v: true }], function (v) {
        api('setPaid', { id: a.id, paid: v }).then(function (j) { upsert(j.student); render(); askFees(queue); }).catch(function (e) { fail(e); askFees(queue); });
      });
  }

  function modal(title, html, btns, cb) {
    var m = document.createElement('div');
    m.className = 'dd-mask';
    m.innerHTML = '<div class="dd-modal"><h3>' + esc(title) + '</h3><p>' + html + '</p><div class="dd-actions">' +
      btns.map(function (b, i) { return '<button class="dd-btn ' + (b.c || '') + '" data-i="' + i + '">' + esc(b.t) + '</button>'; }).join('') + '</div></div>';
    root.appendChild(m);
    $$('button', m).forEach(function (b) { b.onclick = function () { m.remove(); cb(btns[Number(b.getAttribute('data-i'))].v); }; });
  }

  function byId(id) { for (var i = 0; i < S.students.length; i++) if (S.students[i].id === id) return S.students[i]; return null; }
  function upsert(s) {
    if (!s) return;
    for (var i = 0; i < S.students.length; i++) if (S.students[i].id === s.id) { S.students[i] = s; return; }
    S.students.push(s);
  }

  /* ---------- Tab Học viên ---------- */
  function cardOpts(cur) { return CARDS.map(function (c) { return '<option value="' + c + '"' + (c === cur ? ' selected' : '') + '>' + CARD_LABEL[c] + ' (' + ({ 'Tháng': '4 buổi/tháng', '12 buổi': '12 buổi', '52 buổi': '52 buổi' })[c] + ')</option>'; }).join(''); }

  function renderHV() {
    var act = active().filter(match), quit = S.students.filter(function (s) { return s.state === 'Thôi học'; });
    var h = '<div class="dd-card"><h3>Thêm học viên mới</h3>' +
      '<input class="dd-in" id="dd-nname" placeholder="Họ và tên">' +
      '<div class="dd-row2"><select class="dd-in" id="dd-ncard">' + cardOpts('Tháng') + '</select>' +
      '<select class="dd-in" id="dd-npaid"><option value="1">Đã đóng học phí</option><option value="0">Chưa đóng học phí</option></select></div>' +
      '<input class="dd-in" id="dd-nnote" placeholder="Ghi chú (tuỳ chọn): SĐT, lớp, giờ học…" style="margin-top:8px">' +
      '<div class="dd-actions"><button class="dd-btn pri" id="dd-add">Thêm học viên</button></div></div>' +
      '<div class="dd-tools"><input class="dd-in" id="dd-q" type="search" placeholder="Tìm tên học viên…" value="' + esc(S.q) + '"></div>' +
      '<div class="dd-sec">Đang học (' + active().length + ') · bấm vào tên để xem, sửa, cho thôi học</div><div class="dd-list">' +
      (act.length ? act.map(hvItem).join('') : '<div class="dd-empty">Chưa có học viên.</div>') + '</div>';
    if (quit.length) h += '<div class="dd-sec">Đã thôi học (' + quit.length + ')</div><div class="dd-list">' + quit.map(function (s) {
      return '<div class="dd-item"><div class="dd-line"><span class="dd-who"><span class="dd-name" style="color:var(--muted)">' + esc(s.name) + '</span>' +
        '<span class="dd-sub">' + esc(s.id) + ' · đã học ' + s.total + ' buổi</span></span>' +
        '<button class="dd-btn sm" data-re="' + esc(s.id) + '">Học lại</button><button class="dd-btn sm" data-purge="' + esc(s.id) + '">Xoá hẳn</button></div></div>';
    }).join('') + '</div>';
    $('#dd-body').innerHTML = h;

    $('#dd-q').oninput = function () { S.q = this.value; var p = this.selectionStart; renderHV(); var q = $('#dd-q'); q.focus(); try { q.setSelectionRange(p, p); } catch (e) {} };
    $('#dd-add').onclick = function () {
      var name = $('#dd-nname').value.trim();
      if (!name) { toast('Nhập họ tên trước đã.'); return; }
      var b = this; b.disabled = true; b.textContent = 'Đang thêm…';
      api('add', { name: name, card: $('#dd-ncard').value, paid: $('#dd-npaid').value === '1', note: $('#dd-nnote').value }).then(function (j) {
        upsert(j.student); toast('Đã thêm ' + j.student.name); render();
      }).catch(function (e) { b.disabled = false; b.textContent = 'Thêm học viên'; fail(e); });
    };
    $$('[data-tog]').forEach(function (b) { b.onclick = function () { var id = b.getAttribute('data-tog'); S.open = S.open === id ? '' : id; renderHV(); if (S.open) loadHist(id); }; });
    $$('[data-paid]').forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        var s = byId(b.getAttribute('data-paid'));
        api('setPaid', { id: s.id, paid: !s.paid }).then(function (j) { upsert(j.student); render(); toast(j.student.name + ': ' + (j.student.paid ? 'đã đóng học phí' : 'chưa đóng học phí')); }).catch(fail);
      };
    });
    $$('[data-re]').forEach(function (b) { b.onclick = function () { api('rejoin', { id: b.getAttribute('data-re') }).then(function (j) { upsert(j.student); render(); }).catch(fail); }; });
    $$('[data-purge]').forEach(function (b) {
      b.onclick = function () {
        var s = byId(b.getAttribute('data-purge'));
        if (!confirm('Xoá hẳn ' + s.name + ' khỏi danh sách? Các buổi đã điểm danh vẫn giữ trong Sheet.')) return;
        api('purge', { id: s.id }).then(function () { S.students = S.students.filter(function (x) { return x.id !== s.id; }); render(); }).catch(fail);
      };
    });
    if (S.open) bindDetail(S.open);
  }

  function hvItem(s) {
    var open = S.open === s.id;
    return '<div class="dd-item"><div class="dd-line">' +
      '<button class="dd-who" data-tog="' + esc(s.id) + '" style="border:0;background:none;text-align:left;padding:0;color:inherit">' +
      '<span class="dd-name ' + nameCls(s) + '">' + esc(s.name) + '</span>' +
      '<span class="dd-sub">' + esc(s.id) + ' · ' + esc(cardText(s)) + ' · Tổng ' + s.total + ' buổi' + (s.last ? ' · Gần nhất ' + esc(s.last) : '') + '</span></button>' +
      '<button class="dd-pill ' + nameCls(s) + '" data-paid="' + esc(s.id) + '">' + (s.paid ? 'Đã đóng' : 'Chưa đóng') + '</button></div>' + progBar(s) +
      (open ? detail(s) : '') + '</div>';
  }

  function detail(s) {
    return '<div class="dd-detail" id="dd-det">' +
      '<label>Họ tên</label><input class="dd-in" id="dd-ename" value="' + esc(s.name) + '">' +
      '<label>Loại thẻ (đổi thẻ thì thẻ mới tính từ buổi kế tiếp)</label><select class="dd-in" id="dd-ecard">' + cardOpts(s.card) + '</select>' +
      '<label>Ghi chú</label><input class="dd-in" id="dd-enote" value="' + esc(s.note) + '">' +
      '<div class="dd-sub" style="margin-top:6px">Vào học ngày ' + esc(s.start || '—') + '</div>' +
      '<div class="dd-actions"><button class="dd-btn ok sm" id="dd-esave">Lưu thay đổi</button><button class="dd-btn sm" id="dd-equit">Cho thôi học</button></div>' +
      '<div class="dd-sec" style="margin-top:14px">Các buổi đã học</div><div id="dd-ehist"><div class="dd-empty">Đang tải…</div></div></div>';
  }

  function bindDetail(id) {
    var s = byId(id); if (!s) return;
    $('#dd-esave').onclick = function () {
      var b = this; b.disabled = true;
      api('update', { id: id, name: $('#dd-ename').value, card: $('#dd-ecard').value, note: $('#dd-enote').value }).then(function (j) {
        upsert(j.student); toast('Đã lưu'); render(); loadHist(id);
      }).catch(function (e) { b.disabled = false; fail(e); });
    };
    $('#dd-equit').onclick = function () {
      if (!confirm('Cho ' + s.name + ' thôi học? Học viên sẽ ẩn khỏi danh sách điểm danh (vẫn giữ lịch sử, có thể cho học lại).')) return;
      api('quit', { id: id }).then(function (j) { upsert(j.student); S.open = ''; render(); toast('Đã chuyển ' + s.name + ' sang thôi học'); }).catch(fail);
    };
    if (S.hist[id]) drawHist(id);
  }

  function loadHist(id) {
    api('history', { id: id }).then(function (j) { S.hist[id] = j.logs || []; if (S.open === id) drawHist(id); }).catch(fail);
  }
  function drawHist(id) {
    var box = $('#dd-ehist'); if (!box) return;
    var logs = S.hist[id] || [];
    box.innerHTML = logs.length ? logs.map(logItem).join('') : '<div class="dd-empty">Chưa có buổi nào.</div>';
    bindLogs(box, function () { loadHist(id); });
  }

  /* ---------- Buổi học & giáo án ---------- */
  function logItem(l) {
    return '<div class="dd-log" data-log="' + esc(l.logId) + '"><div class="dd-log-h"><b>' + esc(l.name) + '</b><span>' + esc(l.time) + ' · Buổi ' + l.no + ' · ' + esc(CARD_LABEL[l.card] || l.card) + ' ' + esc(l.inCard) + '</span></div>' +
      '<div class="dd-log-plan' + (l.plan ? '' : ' none') + '">' + (l.plan ? esc(l.plan) : 'Chưa ghi giáo án') + '</div>' +
      '<div class="dd-actions" style="margin-top:4px"><button class="dd-link" data-edit>Sửa giáo án</button><button class="dd-link" data-del style="color:var(--muted)">Xoá buổi này</button></div></div>';
  }
  function findLog(id) {
    var all = S.logs.slice(); Object.keys(S.hist).forEach(function (k) { all = all.concat(S.hist[k]); });
    for (var i = 0; i < all.length; i++) if (all[i].logId === id) return all[i];
    return null;
  }
  function bindLogs(box, after) {
    $$('.dd-log', box).forEach(function (el) {
      var id = el.getAttribute('data-log'), l = findLog(id);
      $('[data-edit]', el).onclick = function () {
        var p = $('.dd-log-plan', el);
        p.className = 'dd-plan';
        p.innerHTML = '<textarea class="dd-in">' + esc(l ? l.plan : '') + '</textarea><div class="dd-actions"><button class="dd-btn ok sm">Lưu giáo án</button></div>';
        var ta = $('textarea', p); ta.focus();
        $('button', p).onclick = function () {
          var b = this; b.disabled = true;
          api('editLog', { logId: id, plan: ta.value }).then(function () { toast('Đã lưu giáo án'); return load(); }).then(after).catch(function (e) { b.disabled = false; fail(e); });
        };
      };
      $('[data-del]', el).onclick = function () {
        if (!confirm('Xoá buổi ' + (l ? l.time + ' của ' + l.name : 'này') + '? Số buổi đã học sẽ giảm 1.')) return;
        api('delLog', { logId: id }).then(function () { toast('Đã xoá buổi học'); return load(); }).then(after).catch(fail);
      };
    });
  }

  /* ---------- Tab Giáo án đã dạy ---------- */
  function renderLogs() {
    var q = S.q.trim().toLowerCase();
    var logs = S.logs.filter(function (l) { return !q || l.name.toLowerCase().indexOf(q) >= 0 || (l.plan || '').toLowerCase().indexOf(q) >= 0; });
    var h = '<div class="dd-tools"><input class="dd-in" id="dd-q" type="search" placeholder="Tìm theo tên hoặc nội dung giáo án…" value="' + esc(S.q) + '"></div>';
    if (!logs.length) h += '<div class="dd-empty">Chưa có buổi học nào.</div>';
    var day = '';
    logs.forEach(function (l) {
      var d = (l.time || '').slice(0, 10);
      if (d !== day) { day = d; h += '<div class="dd-day">' + (d === vnToday() ? 'Hôm nay · ' : '') + esc(d) + '</div>'; }
      h += logItem(l);
    });
    if (S.logs.length >= 300) h += '<p class="dd-msg">Hiển thị 300 buổi gần nhất. Xem đầy đủ trong Google Sheet hoặc trong từng học viên.</p>';
    $('#dd-body').innerHTML = h;
    $('#dd-q').oninput = function () { S.q = this.value; var p = this.selectionStart; renderLogs(); var qq = $('#dd-q'); qq.focus(); try { qq.setSelectionRange(p, p); } catch (e) {} };
    bindLogs($('#dd-body'), render);
  }

  /* ---------- Khởi động ---------- */
  setInterval(tick, 1000);
  S.key = store(KEY_STORE);
  if (!API || API.indexOf('http') !== 0) {
    root.innerHTML = head() + '<div class="dd-card"><p class="dd-msg err">Trang chưa có API_URL. Thầy dán URL /exec của Apps Script vào DDL_CONFIG trên trang Blogspot.</p></div>';
    tick();
  } else if (S.key) {
    root.innerHTML = head() + '<div class="dd-empty">Đang tải danh sách lớp…</div>'; tick();
    load(false);
  } else showLogin();
})();
