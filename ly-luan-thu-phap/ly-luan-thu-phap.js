/* Tủ sách Lý luận thư pháp – Thư Đạo
   Dữ liệu: data/books.json (danh mục) + data/<id>.json (bài giảng từng chương), tải cùng phiên bản với file nén.
   Địa chỉ trong trang: #sach=<id>  ·  #sach=<id>&chuong=<cid> */
var LL = (function () {
  var goc = document.getElementById('ly-luan-thu-phap');
  var BASE = (window.LL_BASE || '').replace(/\/?$/, '/');
  var danhMuc = null, sachDaTai = {}, coChu = 17;
  try { coChu = parseInt(localStorage.getItem('ll-co-chu'), 10) || 17; } catch (e) {}

  function $(s) { return goc.querySelector(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* Chữ đậm/nghiêng tối giản trong đoạn văn: **đậm**, *nghiêng* */
  function inl(s) { return esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<i>$1</i>'); }
  function layJSON(f) {
    var k = 'll-cache:' + BASE + f, cu = null;
    try { cu = JSON.parse(sessionStorage.getItem(k)); } catch (e) {}
    if (cu) return Promise.resolve(cu);
    return fetch(BASE + f).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) { try { sessionStorage.setItem(k, JSON.stringify(d)); } catch (e) {} return d; });
  }
  function docHash() {
    var o = {}; location.hash.replace(/^#/, '').split('&').forEach(function (p) { var a = p.split('='); if (a[0]) o[a[0]] = decodeURIComponent(a[1] || ''); });
    return o;
  }
  function di(h) { if (location.hash === h || (!h && !location.hash)) veLai(); else location.hash = h; }
  function noiDung(html) { $('.ll-than').innerHTML = html; }
  function cuon() { var t = goc.getBoundingClientRect().top + window.pageYOffset - 10; if (window.pageYOffset > t) window.scrollTo(0, t); }

  /* ===== Nghe đọc: dùng giọng đọc có sẵn của trình duyệt (Web Speech API) ===== */
  var Doc = (function () {
    var tts = window.speechSynthesis, coTTS = !!(tts && window.SpeechSynthesisUtterance);
    var TOC = [0.75, 1, 1.25, 1.5, 2], tocDo = 1, giong = null, ds = [], vt = 0, manh = [], vm = 0, trangThai = 'dung', luot = 0;
    try { var t0 = parseFloat(localStorage.getItem('ll-toc-do')); if (TOC.indexOf(t0) >= 0) tocDo = t0; } catch (e) {}
    var HAN = /[⺀-⿟　-〿㐀-䶿一-鿿豈-﫿＀-￯]+/g;
    function sach(s) { return String(s || '').replace(HAN, ' ').replace(/[«»“”"*]/g, '').replace(/\s*·\s*/g, ', ').replace(/\s+/g, ' ').trim(); }
    function chonGiong() {
      if (!coTTS) return null;
      var v = tts.getVoices() || [], vi = v.filter(function (x) { return /^vi([-_]|$)/i.test(x.lang); });
      vi.sort(function (a, b) { return (/natural|neural|online|google/i.test(b.name) ? 1 : 0) - (/natural|neural|online|google/i.test(a.name) ? 1 : 0); });
      giong = vi[0] || null;
      var tb = goc.querySelector('.ll-doc-tb');
      if (tb) tb.textContent = giong ? '' : (v.length ? 'Máy này chưa có giọng đọc tiếng Việt; trình duyệt sẽ đọc bằng giọng mặc định. Trên điện thoại, cài giọng Tiếng Việt trong mục Chuyển văn bản thành giọng nói.' : '');
      return giong;
    }
    if (coTTS) { chonGiong(); if ('onvoiceschanged' in tts) tts.onvoiceschanged = chonGiong; }
    /* Cắt câu dài thành mảnh ≤ 180 ký tự (Chrome hay ngắt giữa chừng với câu quá dài) */
    function cat(text) {
      var cau = text.match(/[^.!?;:…]+[.!?;:…]*\s*/g) || [text], out = [], buf = '';
      cau.forEach(function (c) {
        c = c.trim(); if (!c) return;
        while (c.length > 180) { var k = c.lastIndexOf(',', 180); if (k < 60) k = c.lastIndexOf(' ', 180); if (k < 1) k = 180; out.push(c.slice(0, k + 1)); c = c.slice(k + 1).trim(); }
        if ((buf + ' ' + c).length > 180) { if (buf) out.push(buf); buf = c; } else buf = buf ? buf + ' ' + c : c;
      });
      if (buf) out.push(buf);
      return out;
    }
    /* Danh sách đoạn đọc theo thứ tự trong bài; bỏ chữ Hán, bỏ dòng nguồn */
    function lapDs() {
      var bai = goc.querySelector('.ll-bai'); ds = [];
      if (!bai) return;
      bai.querySelectorAll('.ll-bai-dau h2, .ll-tom, .ll-bai > h3, .ll-bai > p:not(.ll-nguon), .ll-co-van, .ll-bang tbody tr, .ll-hinh figcaption, .ll-hoi li').forEach(function (el) {
        var t;
        if (el.classList.contains('ll-co-van')) {
          var hv = el.querySelector('.hv'), vi = el.querySelector('.vi'), src = el.querySelector('.src');
          t = (hv ? 'Âm Hán Việt: ' + hv.textContent + '. ' : '') + (vi ? vi.textContent : '') + (src ? '. ' + src.textContent.replace(/^—\s*/, 'Theo ') : '');
        } else if (el.tagName === 'TR') {
          var o = el.children, cot = [];
          for (var i = 0; i < o.length; i++) if (!o[i].classList.contains('zh')) cot.push(o[i].textContent);
          t = cot.join('. ');
        } else if (el.closest('.ll-hoi')) {
          var li = el.parentNode.children, so = Array.prototype.indexOf.call(li, el) + 1;
          t = (so === 1 ? 'Câu hỏi ôn tập. ' : '') + 'Câu ' + so + '. ' + el.textContent;
        } else if (el.tagName === 'H2') {
          var no = goc.querySelector('.ll-bai-dau .ll-so');
          t = (no ? no.textContent + '. ' : '') + el.textContent;
        } else t = el.textContent;
        t = sach(t);
        if (t.replace(/[\s.,]/g, '').length) ds.push({ el: el, text: t });
      });
    }
    function veNut() {
      var n = goc.querySelector('.ll-doc-phat'); if (!n) return;
      n.textContent = trangThai === 'doc' ? '❚❚ Tạm dừng' : (trangThai === 'tam' ? '▶ Đọc tiếp' : '▶ Nghe đọc');
      n.setAttribute('aria-pressed', trangThai === 'doc' ? 'true' : 'false');
      var vtEl = goc.querySelector('.ll-doc-vt'); if (vtEl) vtEl.textContent = ds.length && trangThai !== 'dung' ? 'Đoạn ' + (vt + 1) + '/' + ds.length : '';
    }
    function toSang() {
      goc.querySelectorAll('.ll-dang-doc').forEach(function (x) { x.classList.remove('ll-dang-doc'); });
      var d = ds[vt]; if (!d || trangThai === 'dung') return;
      d.el.classList.add('ll-dang-doc');
      var r = d.el.getBoundingClientRect(), h = window.innerHeight || 600;
      if (r.top < 60 || r.bottom > h - 90) { try { d.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { d.el.scrollIntoView(); } }
    }
    function noiManh() {
      var l = ++luot;
      if (vm >= manh.length) { vt++; if (vt >= ds.length) { dung(); return; } batDauDoan(); return; }
      var u = new SpeechSynthesisUtterance(manh[vm]);
      u.lang = 'vi-VN'; if (giong) u.voice = giong; u.rate = tocDo;
      u.onend = function () { if (l !== luot || trangThai !== 'doc') return; vm++; noiManh(); };
      u.onerror = function (e) { if (l !== luot || trangThai !== 'doc') return; if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; vm++; noiManh(); };
      tts.speak(u);
    }
    function batDauDoan() { manh = cat(ds[vt].text); vm = 0; toSang(); veNut(); noiManh(); }
    function phat() {
      if (!coTTS) return;
      if (!ds.length) lapDs();
      if (!ds.length) return;
      tts.cancel(); trangThai = 'doc';
      if (vt >= ds.length) vt = 0;
      if (manh.length && vm < manh.length && manh === manh) { toSang(); veNut(); noiManh(); } else batDauDoan();
    }
    function tamDung() { trangThai = 'tam'; luot++; tts.cancel(); veNut(); }
    function dung() { trangThai = 'dung'; luot++; if (coTTS) tts.cancel(); vt = 0; manh = []; vm = 0; toSang(); veNut(); }
    function nhay(d) {
      if (!ds.length) lapDs(); if (!ds.length) return;
      vt = Math.max(0, Math.min(ds.length - 1, vt + d));
      if (trangThai === 'doc') { luot++; tts.cancel(); batDauDoan(); } else { manh = cat(ds[vt].text); vm = 0; trangThai = 'tam'; toSang(); veNut(); }
    }
    function denDoan(el) {
      for (var i = 0; i < ds.length; i++) if (ds[i].el === el || ds[i].el.contains(el)) {
        vt = i; luot++; tts.cancel(); trangThai = 'doc'; batDauDoan(); return true;
      }
      return false;
    }
    function doiToc(v) {
      tocDo = v; try { localStorage.setItem('ll-toc-do', v); } catch (e) {}
      goc.querySelectorAll('.ll-doc-toc button').forEach(function (b) { b.setAttribute('aria-pressed', parseFloat(b.getAttribute('data-toc')) === v ? 'true' : 'false'); });
      if (trangThai === 'doc') { luot++; tts.cancel(); noiManh(); }
    }
    return {
      thanh: function () {
        if (!coTTS) return '<div class="ll-doc"><span class="ll-doc-tb">Trình duyệt này không hỗ trợ nghe đọc. Hãy mở trang bằng Chrome, Safari hoặc Edge bản mới.</span></div>';
        return '<div class="ll-doc" role="group" aria-label="Nghe đọc bài giảng">'
          + '<button class="ll-doc-phat" data-doc="phat" aria-pressed="false">▶ Nghe đọc</button>'
          + '<button data-doc="lui" aria-label="Đoạn trước">⏮</button><button data-doc="toi" aria-label="Đoạn sau">⏭</button><button data-doc="dung" aria-label="Dừng đọc">■</button>'
          + '<span class="ll-doc-toc" aria-label="Tốc độ đọc">' + TOC.map(function (v) { return '<button data-toc="' + v + '" aria-pressed="' + (v === tocDo) + '">x' + String(v).replace('.', ',') + '</button>'; }).join('') + '</span>'
          + '<span class="ll-doc-vt" aria-live="polite"></span><span class="ll-doc-tb"></span></div>';
      },
      gan: function () { ds = []; vt = 0; manh = []; vm = 0; trangThai = 'dung'; if (coTTS) { lapDs(); chonGiong(); } veNut(); },
      dung: function () { if (trangThai !== 'dung') dung(); },
      bam: function (t) {
        var a = t.getAttribute('data-doc');
        if (a === 'phat') { trangThai === 'doc' ? tamDung() : phat(); }
        else if (a === 'dung') dung();
        else if (a === 'lui') nhay(-1);
        else if (a === 'toi') nhay(1);
      },
      toc: function (v) { doiToc(v); },
      chamDoan: function (el) { return trangThai !== 'dung' && denDoan(el); }
    };
  })();

  function veKe() {
    var h = '<div class="ll-ke">';
    danhMuc.books.forEach(function (b) {
      var xong = (b.chapters || []).filter(function (c) { return c.ready; }).length;
      h += '<button class="ll-sach" data-sach="' + esc(b.id) + '"><div class="ll-bia"><b>' + esc(b.title) + '</b><i>' + esc(b.authors) + '</i><span class="ll-an">' + esc(b.seal || '書') + '</span></div>'
        + '<div class="ll-sach-tt">' + esc(b.titleZh) + '<br><span class="ll-dem">' + xong + '/' + (b.chapters || []).length + '</span> bài giảng đã có</div></button>';
    });
    noiDung(h + '</div>');
    document.title = 'Lý luận thư pháp – Thư Đạo';
  }

  function duong(b, c) {
    var h = '<nav class="ll-duong"><a data-di="">Tủ sách</a>';
    if (b) h += ' › <a data-di="#sach=' + esc(b.id) + '">' + esc(b.title) + '</a>';
    if (c) h += ' › <span>' + esc(c.no) + '</span>';
    return h + '</nav>';
  }

  function veSach(b) {
    var h = duong(b) + '<div class="ll-gioi-thieu"><h2>' + esc(b.title) + '</h2><p class="ll-goc">' + esc(b.titleZh) + ' · ' + esc(b.authors)
      + (b.publisher ? ' · ' + esc(b.publisher) : '') + (b.year ? ', ' + esc(b.year) : '') + '</p>'
      + (b.intro || []).map(function (p) { return '<p>' + inl(p) + '</p>'; }).join('') + '</div>'
      + '<input class="ll-loc" type="search" placeholder="Tìm chương theo tên…" aria-label="Tìm chương"><ul class="ll-muc-luc">';
    (b.chapters || []).forEach(function (c) {
      h += '<li data-loc="' + esc((c.no + ' ' + c.title + ' ' + (c.titleZh || '')).toLowerCase()) + '"><button data-di="#sach=' + esc(b.id) + '&chuong=' + esc(c.id) + '"' + (c.ready ? '' : ' disabled class="ll-cho"') + '>'
        + '<span class="ll-so">' + esc(c.no) + '</span><span class="ll-ten">' + esc(c.title) + '<small>' + esc(c.titleZh || '') + (c.ready ? '' : ' · đang biên soạn') + '</small></span></button></li>';
    });
    noiDung(h + '</ul>');
    var o = $('.ll-loc');
    o.addEventListener('input', function () {
      var q = o.value.trim().toLowerCase();
      goc.querySelectorAll('.ll-muc-luc li').forEach(function (li) { li.style.display = !q || li.getAttribute('data-loc').indexOf(q) >= 0 ? '' : 'none'; });
    });
    document.title = b.title + ' – Lý luận thư pháp – Thư Đạo';
  }

  function khoi(k) {
    switch (k.t) {
      case 'h': return '<h3>' + inl(k.x) + '</h3>';
      case 'p': return '<p>' + inl(k.x) + '</p>';
      case 'quote': return '<blockquote class="ll-co-van">' + (k.zh ? '<div class="zh" lang="zh">' + esc(k.zh) + '</div>' : '') + (k.hv ? '<div class="hv">' + esc(k.hv) + '</div>' : '')
        + '<div class="vi">' + inl(k.vi) + '</div>' + (k.src ? '<div class="src">— ' + esc(k.src) + '</div>' : '') + '</blockquote>';
      case 'terms': return '<table class="ll-bang"><thead><tr><th>Thuật ngữ</th><th>Hán tự</th><th>Giải nghĩa</th></tr></thead><tbody>'
        + k.items.map(function (i) { return '<tr><td><b>' + esc(i.hv) + '</b></td><td class="zh" lang="zh">' + esc(i.zh || '') + '</td><td>' + inl(i.vi) + '</td></tr>'; }).join('') + '</tbody></table>';
      case 'people': return '<table class="ll-bang"><thead><tr><th>Nhân vật</th><th>Thời đại</th><th>Ghi chú</th></tr></thead><tbody>'
        + k.items.map(function (i) { return '<tr><td><b>' + esc(i.name) + '</b>' + (i.zh ? ' <span class="zh" lang="zh">' + esc(i.zh) + '</span>' : '') + '</td><td>' + esc(i.years || '') + '</td><td>' + inl(i.note || '') + '</td></tr>'; }).join('') + '</tbody></table>';
      case 'img': return '<figure class="ll-hinh"><img loading="lazy" onerror="this.parentNode.style.display=\'none\'" src="' + esc(/^https?:/.test(k.src) ? k.src : BASE + k.src) + '" alt="' + esc(k.cap) + '"><figcaption>' + inl(k.cap)
        + (k.link ? ' · <a href="' + esc(k.link) + '" target="_blank" rel="noopener">' + esc(k.credit || 'Nguồn ảnh') + '</a>' : (k.credit ? ' · ' + esc(k.credit) : '')) + '</figcaption></figure>';
      case 'qs': return '<div class="ll-hoi"><b>Câu hỏi ôn tập</b><ol>' + k.items.map(function (q) { return '<li>' + inl(q) + '</li>'; }).join('') + '</ol></div>';
      default: return '';
    }
  }

  function veChuong(b, sach, cid) {
    var ds = sach.chapters, i = -1;
    for (var j = 0; j < ds.length; j++) if (ds[j].id === cid) i = j;
    var c = ds[i];
    if (!c) { noiDung(duong(b) + '<p class="ll-thong-bao">Chương này đang được biên soạn.</p>'); return; }
    var truoc = null, sau = null;
    for (j = i - 1; j >= 0; j--) if (ds[j].body) { truoc = ds[j]; break; }
    for (j = i + 1; j < ds.length; j++) if (ds[j].body) { sau = ds[j]; break; }
    var h = duong(b, c) + '<div class="ll-cong-cu"><button data-co="-1" aria-label="Chữ nhỏ hơn">A−</button><button data-co="1" aria-label="Chữ lớn hơn">A+</button></div>'
      + Doc.thanh()
      + '<article class="ll-bai" style="font-size:' + coChu + 'px"><header class="ll-bai-dau"><div class="ll-so">' + esc(c.no) + '</div><h2>' + esc(c.title) + '</h2>'
      + (c.titleZh ? '<div class="ll-zh" lang="zh">' + esc(c.titleZh) + (c.author ? ' · ' + esc(c.author) : '') + '</div>' : '') + '</header>'
      + (c.summary ? '<p class="ll-tom">' + inl(c.summary) + '</p>' : '') + (c.body || []).map(khoi).join('')
      + '<p class="ll-nguon">Bài giảng tiếng Việt do Thư Đạo biên soạn, tóm lược và bình giải nội dung chương; không phải bản dịch nguyên văn. Nguồn: <i>' + esc(b.titleZh) + '</i>, ' + esc(c.author || b.authors) + (c.pages ? ', tr. ' + esc(c.pages) : '') + '.</p>'
      + '<div class="ll-chuyen"><button class="ll-nut phu" ' + (truoc ? 'data-di="#sach=' + esc(b.id) + '&chuong=' + esc(truoc.id) + '"' : 'disabled') + '>‹ ' + (truoc ? esc(truoc.no) : 'Chương trước') + '</button>'
      + '<button class="ll-nut phu" data-di="#sach=' + esc(b.id) + '">Mục lục</button>'
      + '<button class="ll-nut" ' + (sau ? 'data-di="#sach=' + esc(b.id) + '&chuong=' + esc(sau.id) + '"' : 'disabled') + '>' + (sau ? esc(sau.no) : 'Chương sau') + ' ›</button></div></article>';
    noiDung(h);
    Doc.gan();
    document.title = c.title + ' – ' + b.title + ' – Thư Đạo';
  }

  function veLai() {
    Doc.dung();
    var q = docHash();
    if (!danhMuc) return;
    var b = null;
    danhMuc.books.forEach(function (x) { if (x.id === q.sach) b = x; });
    if (!b) { veKe(); return; }
    if (!q.chuong) { veSach(b); cuon(); return; }
    var co = sachDaTai[b.id];
    if (co) { veChuong(b, co, q.chuong); cuon(); return; }
    noiDung(duong(b) + '<p class="ll-thong-bao">Đang mở chương…</p>');
    layJSON('data/' + b.id + '.json').then(function (s) { sachDaTai[b.id] = s; if (docHash().chuong === q.chuong) { veChuong(b, s, q.chuong); cuon(); } })
      .catch(function () { noiDung(duong(b) + '<p class="ll-thong-bao">Không tải được nội dung. Hãy tải lại trang.</p>'); });
  }

  goc.addEventListener('click', function (e) {
    var d = e.target.closest('[data-doc],[data-toc]');
    if (d && goc.contains(d)) {
      if (d.hasAttribute('data-toc')) Doc.toc(parseFloat(d.getAttribute('data-toc'))); else Doc.bam(d);
      return;
    }
    var t = e.target.closest('[data-di],[data-sach],[data-co]');
    if (!t) { /* Đang nghe: chạm vào một đoạn trong bài để đọc từ đoạn đó */
      var bai = e.target.closest('.ll-bai');
      if (bai && !e.target.closest('a,button')) Doc.chamDoan(e.target);
      return;
    }
    if (!goc.contains(t) || t.disabled) return;
    if (t.hasAttribute('data-co')) {
      coChu = Math.max(14, Math.min(24, coChu + parseInt(t.getAttribute('data-co'), 10)));
      try { localStorage.setItem('ll-co-chu', coChu); } catch (x) {}
      var a = $('.ll-bai'); if (a) a.style.fontSize = coChu + 'px';
      return;
    }
    e.preventDefault();
    di(t.hasAttribute('data-sach') ? '#sach=' + t.getAttribute('data-sach') : t.getAttribute('data-di'));
  });
  window.addEventListener('hashchange', veLai);
  window.addEventListener('pagehide', function () { Doc.dung(); });

  layJSON('data/books.json').then(function (d) { danhMuc = d; veLai(); })
    .catch(function () { noiDung('<p class="ll-thong-bao">Không tải được tủ sách. Hãy tải lại trang.</p>'); });
  return { veLai: veLai };
})();
