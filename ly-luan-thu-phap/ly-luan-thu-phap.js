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
      case 'img': return '<figure class="ll-hinh"><img loading="lazy" onerror="this.parentNode.style.display=\'none\'" src="' + esc(k.src) + '" alt="' + esc(k.cap) + '"><figcaption>' + inl(k.cap)
        + (k.link ? ' · <a href="' + esc(k.link) + '" target="_blank" rel="noopener">' + esc(k.credit || 'Nguồn ảnh') + '</a>' : '') + '</figcaption></figure>';
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
      + '<article class="ll-bai" style="font-size:' + coChu + 'px"><header class="ll-bai-dau"><div class="ll-so">' + esc(c.no) + '</div><h2>' + esc(c.title) + '</h2>'
      + (c.titleZh ? '<div class="ll-zh" lang="zh">' + esc(c.titleZh) + (c.author ? ' · ' + esc(c.author) : '') + '</div>' : '') + '</header>'
      + (c.summary ? '<p class="ll-tom">' + inl(c.summary) + '</p>' : '') + (c.body || []).map(khoi).join('')
      + '<p class="ll-nguon">Bài giảng tiếng Việt do Thư Đạo biên soạn, tóm lược và bình giải nội dung chương; không phải bản dịch nguyên văn. Nguồn: <i>' + esc(b.titleZh) + '</i>, ' + esc(c.author || b.authors) + (c.pages ? ', tr. ' + esc(c.pages) : '') + '.</p>'
      + '<div class="ll-chuyen"><button class="ll-nut phu" ' + (truoc ? 'data-di="#sach=' + esc(b.id) + '&chuong=' + esc(truoc.id) + '"' : 'disabled') + '>‹ ' + (truoc ? esc(truoc.no) : 'Chương trước') + '</button>'
      + '<button class="ll-nut phu" data-di="#sach=' + esc(b.id) + '">Mục lục</button>'
      + '<button class="ll-nut" ' + (sau ? 'data-di="#sach=' + esc(b.id) + '&chuong=' + esc(sau.id) + '"' : 'disabled') + '>' + (sau ? esc(sau.no) : 'Chương sau') + ' ›</button></div></article>';
    noiDung(h);
    document.title = c.title + ' – ' + b.title + ' – Thư Đạo';
  }

  function veLai() {
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
    var t = e.target.closest('[data-di],[data-sach],[data-co]');
    if (!t || !goc.contains(t) || t.disabled) return;
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

  layJSON('data/books.json').then(function (d) { danhMuc = d; veLai(); })
    .catch(function () { noiDung('<p class="ll-thong-bao">Không tải được tủ sách. Hãy tải lại trang.</p>'); });
  return { veLai: veLai };
})();
