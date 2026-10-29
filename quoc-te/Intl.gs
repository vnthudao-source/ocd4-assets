/* =========================================================
   INTL.GS v1.0 – Thư Đạo International (trang thư pháp cho người nước ngoài)
   ---------------------------------------------------------
   DÁN VÀO ĐÂU: đây là MỘT dự án Apps Script RIÊNG, gắn với một Google Sheet MỚI
   (không dán vào dự án Auth.gs / Code.gs đang chạy, không sửa gì ở đó).
   1. Tạo Google Sheet mới tên "Thư Đạo International".
   2. Trong Sheet: Tiện ích mở rộng → Apps Script → xoá hết mã mẫu → dán TOÀN BỘ file này.
   3. Chọn hàm setup → Chạy → cấp quyền. Hàm tạo đủ các tab, dòng mẫu, thư mục Drive chứa bài nộp
      và trình kích hoạt gửi mail khi thầy chấm bài.
   4. Triển khai → Triển khai mới → Ứng dụng web: Thực thi với tư cách "Tôi", Ai có quyền truy cập "Bất kỳ ai".
      Sao chép URL /exec, dán vào ô API trong khối tải trên Blogspot (QT_CONFIG.API).
   5. Sửa nội dung trong Sheet (không cần sửa code):
      - Workshops: lịch workshop. Status: OPEN (nhận đăng ký) / CLOSED (hiện nhưng hết nhận) / HIDDEN (ẩn).
      - Packages: gói học Online, giá USD và VND. Features cách nhau bằng dấu |.
      - Videos: video bài học (link YouTube không công khai). Free = TRUE thì ai cũng xem được.
      - Settings: PayPal, ngân hàng, liên hệ.
      - Bookings / Enrollments: đơn mới. Đổi Status thành PAID / ACTIVE khi đã nhận tiền
        (ACTIVE ở Enrollments mới mở bài học và video cho học viên).
      - Submissions: bài nộp. Thầy điền Score (0–10) và Comment; Public = TRUE để đưa lên Gallery.
        Khi điền Score, học viên nhận mail báo kết quả.
   ĐĂNG NHẬP: dùng chung tài khoản thudao.com. Mã phiên do Auth.gs cấp được kiểm tra bằng
   hành động authMe của Web App Auth hiện có (AUTH_API bên dưới), nên không cần sửa Auth.gs.
========================================================= */

var CFG = {
  VERSION: '1.0.0',
  AUTH_API: 'https://script.google.com/macros/s/AKfycbwtMkodKNVrUgVWhpvhwMndPZKBrdWD4OF0XoR4i5poQsxRkEDLIkm56-MTxuOCVW9JXA/exec',
  NOTIFY: 'sladargai@gmail.com',
  FOLDER_NAME: 'Thư Đạo International – Bài nộp',
  SITE: 'Thư Đạo · Vietnamese Calligraphy',
  MAX_FILE: 8 * 1024 * 1024
};

var TABS = {
  Workshops: ['ID', 'Title_EN', 'Title_VI', 'Date', 'Time', 'City', 'Address', 'MapURL', 'Price_USD', 'Price_VND', 'Seats', 'Status', 'Desc_EN', 'Desc_VI', 'Image'],
  Bookings: ['Time', 'BookingID', 'WorkshopID', 'Workshop', 'Name', 'Email', 'Phone', 'Country', 'People', 'Payment', 'Amount', 'Lang', 'Note', 'Code', 'Status'],
  Packages: ['ID', 'Course', 'Name_EN', 'Name_VI', 'Price_USD', 'Price_VND', 'Features_EN', 'Features_VI', 'Active'],
  Enrollments: ['Time', 'EnrollID', 'Code', 'Name', 'Email', 'PackageID', 'Package', 'Course', 'Payment', 'Amount', 'Status', 'Lang', 'Note'],
  Submissions: ['Time', 'SubID', 'Code', 'Name', 'Email', 'Course', 'Lesson', 'FileID', 'FileURL', 'Note', 'Score', 'Comment', 'ReviewedAt', 'Public', 'Lang'],
  Videos: ['Course', 'Lesson', 'Title_EN', 'Title_VI', 'YouTube', 'Free'],
  Settings: ['Key', 'Value', 'Ghi chú']
};

var SAMPLE = {
  Workshops: [['WS-001', 'Brush & Ink – 3-hour taster', 'Bút & Mực – trải nghiệm 3 giờ', '2026-11-22', '09:00 – 12:00', 'Hà Nội', 'Kim Mã, Giảng Võ, Hà Nội', '', '35', '850000', 10, 'HIDDEN',
    'Tools, tea and a finished piece with your name to take home.', 'Có dụng cụ, trà và một tác phẩm có tên bạn mang về.', '']],
  Packages: [
    ['INTRO', 'intro', 'Foundations – 8 lessons', 'Nhập môn – 8 bài', '49', '1200000', 'All 8 video lessons|Submit work and get scored|Lifetime access', 'Đủ 8 bài video|Nộp bài, được chấm điểm|Xem lại trọn đời', 'TRUE'],
    ['PATH52', 'path52', 'Complete path – 52 weeks', 'Lộ trình đầy đủ – 52 tuần', '390', '9500000', 'Foundations included|52 weekly lessons and videos|Personal feedback on every submission|Graduation exam', 'Bao gồm khoá Nhập môn|52 bài theo tuần kèm video|Nhận xét từng bài nộp|Thi tốt nghiệp', 'TRUE']],
  Videos: [['intro', 'N1', 'What is Vietnamese calligraphy?', 'Thư pháp Việt là gì?', '', 'TRUE']],
  Settings: [
    ['PAYPAL_ME', '', 'Tên paypal.me của thầy, ví dụ thudao (để trống thì gửi hướng dẫn PayPal qua email)'],
    ['PAYPAL_EMAIL', '', 'Email nhận PayPal (hiện cho học viên)'],
    ['BANK_NAME', 'MB Bank', ''],
    ['BANK_BIN', 'MB', 'Mã ngân hàng cho mã QR VietQR'],
    ['BANK_ACCOUNT', '0530113118888', ''],
    ['BANK_HOLDER', 'BUI KHAC SANG', ''],
    ['CONTACT_EMAIL', 'vnthudao@gmail.com', ''],
    ['CONTACT_PHONE', '0395 021 559', 'Điện thoại / WhatsApp / Zalo'],
    ['CONTACT_ADDRESS', 'Kim Mã, Giảng Võ, Hà Nội', '']]
};

/* ---------------- Khởi tạo ---------------- */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight('bold');
      sh.setFrozenRows(1);
      if (SAMPLE[name]) sh.getRange(2, 1, SAMPLE[name].length, SAMPLE[name][0].length).setValues(SAMPLE[name]);
    }
  });
  var first = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính1');
  if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  folder_();
  var has = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'onReviewEdit'; });
  if (!has) ScriptApp.newTrigger('onReviewEdit').forSpreadsheet(ss).onEdit().create();
  return 'OK – Intl.gs ' + CFG.VERSION;
}

/* ---------------- Cổng Web App ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var out;
  try {
    if (p.action === 'config') out = config_();
    else if (p.action === 'gallery') out = gallery_();
    else out = { ok: true, service: 'Thu Dao International', version: CFG.VERSION };
  } catch (err) { out = { ok: false, error: String(err && err.message || err) }; }
  return reply_(out, p.callback);
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return reply_({ ok: false, error: 'Bad request' }); }
  var out;
  try {
    switch (body.action) {
      case 'config': out = config_(); break;
      case 'gallery': out = gallery_(); break;
      case 'bookWorkshop': out = bookWorkshop_(body); break;
      case 'enroll': out = enroll_(body); break;
      case 'me': out = me_(body); break;
      case 'videos': out = videos_(body); break;
      case 'submit': out = submit_(body); break;
      default: out = { ok: false, error: 'Unknown action' };
    }
  } catch (err) { out = { ok: false, error: String(err && err.message || err) }; }
  return reply_(out);
}

function reply_(obj, callback) {
  var text = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][\w$]{0,60}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + text + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- Tiện ích Sheet ---------------- */
function sheet_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('Thiếu tab ' + name + ' – hãy chạy hàm setup.');
  return sh;
}
function rows_(name) {
  var sh = sheet_(name), last = sh.getLastRow(), cols = sh.getLastColumn();
  if (last < 2) return [];
  var head = sh.getRange(1, 1, 1, cols).getValues()[0].map(function (h) { return String(h).trim(); });
  return sh.getRange(2, 1, last - 1, cols).getValues().map(function (r, i) {
    var o = { _row: i + 2 };
    head.forEach(function (h, j) { if (h) o[h] = r[j]; });
    return o;
  });
}
function append_(name, obj) {
  var sh = sheet_(name);
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  sh.appendRow(head.map(function (h) { return obj[h] === undefined ? '' : text_(obj[h]); }));
}
/* Giữ nguyên dạng chữ khi ghi: chặn công thức (= + - @) và giữ số 0 đầu của mã / số điện thoại */
function text_(v) {
  if (typeof v !== 'string') return v;
  return /^[=+\-@]/.test(v) || /^0\d/.test(v) ? "'" + v : v;
}
function codeKey_(v) { return str_(v).toUpperCase().replace(/^0+(?=\d)/, ''); }
function str_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  return String(v == null ? '' : v).trim();
}
function bool_(v) { return v === true || /^(true|1|x|yes|có|co)$/i.test(str_(v)); }
function clip_(v, n) { return str_(v).replace(/[\u0000-\u001f]+/g, ' ').slice(0, n || 200); }
function email_(v) { v = str_(v).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : ''; }
function id_(prefix) { return prefix + '-' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyMMdd') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function now_() { return Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss'); }
function lang_(v) { return v === 'vi' ? 'vi' : 'en'; }

function settings_() {
  var o = {};
  rows_('Settings').forEach(function (r) { if (str_(r.Key)) o[str_(r.Key)] = str_(r.Value); });
  return o;
}

/* ---------------- Dữ liệu công khai ---------------- */
function workshops_() {
  var taken = {};
  rows_('Bookings').forEach(function (b) {
    if (/^CANCEL/i.test(str_(b.Status))) return;
    var id = str_(b.WorkshopID);
    taken[id] = (taken[id] || 0) + (Number(b.People) || 1);
  });
  return rows_('Workshops').filter(function (w) { return str_(w.ID) && !/^HIDDEN/i.test(str_(w.Status)); }).map(function (w) {
    var seats = Number(w.Seats) || 0, id = str_(w.ID);
    var left = seats ? Math.max(0, seats - (taken[id] || 0)) : null;
    return {
      id: id, title_en: str_(w.Title_EN), title_vi: str_(w.Title_VI) || str_(w.Title_EN), date: str_(w.Date), time: str_(w.Time),
      city: str_(w.City), address: str_(w.Address), map: str_(w.MapURL), price_usd: str_(w.Price_USD), price_vnd: str_(w.Price_VND),
      seats: seats, left: left, status: (/^OPEN/i.test(str_(w.Status)) && left !== 0) ? 'OPEN' : 'CLOSED',
      desc_en: str_(w.Desc_EN), desc_vi: str_(w.Desc_VI) || str_(w.Desc_EN), image: str_(w.Image)
    };
  }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
}
function packages_() {
  return rows_('Packages').filter(function (p) { return str_(p.ID) && bool_(p.Active); }).map(function (p) {
    return { id: str_(p.ID), course: str_(p.Course).toLowerCase(), name_en: str_(p.Name_EN), name_vi: str_(p.Name_VI) || str_(p.Name_EN),
      price_usd: str_(p.Price_USD), price_vnd: str_(p.Price_VND), features_en: str_(p.Features_EN), features_vi: str_(p.Features_VI) };
  });
}
function publicSettings_() {
  var s = settings_();
  return { paypal_me: s.PAYPAL_ME || '', paypal_email: s.PAYPAL_EMAIL || '', bank_name: s.BANK_NAME || '', bank_bin: s.BANK_BIN || '',
    bank_account: s.BANK_ACCOUNT || '', bank_holder: s.BANK_HOLDER || '', contact_email: s.CONTACT_EMAIL || '',
    contact_phone: s.CONTACT_PHONE || '', contact_address: s.CONTACT_ADDRESS || '' };
}
function config_() {
  var free = rows_('Videos').filter(function (v) { return bool_(v.Free) && str_(v.YouTube); }).map(video_);
  return { ok: true, version: CFG.VERSION, workshops: workshops_(), packages: packages_(), settings: publicSettings_(), freeVideos: free };
}
function video_(v) {
  return { course: str_(v.Course).toLowerCase(), lesson: str_(v.Lesson).toUpperCase(), title_en: str_(v.Title_EN), title_vi: str_(v.Title_VI) || str_(v.Title_EN),
    youtube: youtubeId_(v.YouTube), free: bool_(v.Free) };
}
function youtubeId_(u) {
  u = str_(u);
  var m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : (/^[\w-]{11}$/.test(u) ? u : '');
}
function gallery_() {
  var list = rows_('Submissions').filter(function (s) { return bool_(s.Public) && str_(s.FileID); }).map(function (s) {
    return { id: str_(s.SubID), name: str_(s.Name).split(' ').slice(-1)[0] || 'Student', course: str_(s.Course), lesson: str_(s.Lesson),
      file: str_(s.FileID), score: str_(s.Score), comment: str_(s.Comment), time: str_(s.Time).slice(0, 10) };
  });
  list.reverse();
  return { ok: true, list: list.slice(0, 60) };
}

/* ---------------- Xác thực qua Auth.gs đang chạy ---------------- */
function auth_(token) {
  token = str_(token);
  if (!token || token.length > 300) throw new Error('LOGIN_REQUIRED');
  var key = 'au_' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token)).slice(0, 40);
  var cache = CacheService.getScriptCache(), hit = cache.get(key);
  if (hit) return JSON.parse(hit);
  var res = UrlFetchApp.fetch(CFG.AUTH_API, { method: 'post', contentType: 'text/plain;charset=utf-8', muteHttpExceptions: true,
    payload: JSON.stringify({ action: 'authMe', token: token, device: 'Intl.gs' }) });
  var j = {};
  try { j = JSON.parse(res.getContentText()); } catch (e) { throw new Error('AUTH_UNAVAILABLE'); }
  if (!j.ok || !j.me) throw new Error('LOGIN_REQUIRED');
  var me = { code: str_(j.me.linked || j.me.code).toUpperCase(), name: str_(j.me.name), email: email_(j.me.email) };
  if (!me.code) throw new Error('LOGIN_REQUIRED');
  cache.put(key, JSON.stringify(me), 600);
  return me;
}

function enrollments_(code) {
  code = codeKey_(code);
  return rows_('Enrollments').filter(function (r) { return codeKey_(r.Code) === code; }).map(function (r) {
    return { id: str_(r.EnrollID), packageId: str_(r.PackageID), package: str_(r.Package), course: str_(r.Course).toLowerCase(),
      payment: str_(r.Payment), amount: str_(r.Amount), status: str_(r.Status).toUpperCase() || 'PENDING', time: str_(r.Time) };
  });
}
function access_(list) {
  var a = { intro: false, path52: false };
  list.forEach(function (e) {
    if (e.status !== 'ACTIVE') return;
    if (e.course === 'path52') { a.path52 = true; a.intro = true; }
    if (e.course === 'intro') a.intro = true;
  });
  return a;
}

function me_(b) {
  var me = auth_(b.token), list = enrollments_(me.code);
  var subs = rows_('Submissions').filter(function (s) { return codeKey_(s.Code) === codeKey_(me.code); }).map(function (s) {
    return { id: str_(s.SubID), time: str_(s.Time), course: str_(s.Course), lesson: str_(s.Lesson), file: str_(s.FileID),
      note: str_(s.Note), score: str_(s.Score), comment: str_(s.Comment), reviewed: !!str_(s.ReviewedAt) || str_(s.Score) !== '' };
  }).reverse();
  return { ok: true, me: me, enrollments: list, access: access_(list), submissions: subs };
}

function videos_(b) {
  var me = auth_(b.token), acc = access_(enrollments_(me.code));
  var list = rows_('Videos').filter(function (v) {
    var c = str_(v.Course).toLowerCase();
    return str_(v.YouTube) && (bool_(v.Free) || acc[c]);
  }).map(video_);
  return { ok: true, access: acc, videos: list };
}

/* ---------------- Đăng ký workshop (không cần đăng nhập) ---------------- */
function bookWorkshop_(b) {
  var name = clip_(b.name, 80), mail = email_(b.email), people = Math.max(1, Math.min(10, Number(b.people) || 1));
  if (!name || !mail) throw new Error('NAME_EMAIL_REQUIRED');
  var payment = /^(paypal|bank|cash)$/.test(b.payment) ? b.payment : 'cash';
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ws = workshops_().filter(function (w) { return w.id === str_(b.workshopId); })[0];
    if (!ws) throw new Error('WORKSHOP_NOT_FOUND');
    if (ws.status !== 'OPEN') throw new Error('WORKSHOP_CLOSED');
    if (ws.left !== null && people > ws.left) throw new Error('NOT_ENOUGH_SEATS');
    var code = '';
    if (b.token) { try { code = auth_(b.token).code; } catch (e) { code = ''; } }
    var amount = payment === 'bank' ? (Number(ws.price_vnd) || 0) * people : (Number(ws.price_usd) || 0) * people;
    var bid = id_('WS');
    append_('Bookings', { Time: now_(), BookingID: bid, WorkshopID: ws.id, Workshop: ws.title_en, Name: name, Email: mail,
      Phone: clip_(b.phone, 40), Country: clip_(b.country, 60), People: people, Payment: payment, Amount: amount,
      Lang: lang_(b.lang), Note: clip_(b.note, 500), Code: code, Status: 'NEW' });
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  var L = lang_(b.lang), s = settings_();
  var title = L === 'vi' ? ws.title_vi : ws.title_en;
  var pay = payInfo_(payment, amount, bid, L, s);
  mail_(mail, (L === 'vi' ? 'Xác nhận đăng ký workshop – ' : 'Workshop booking received – ') + title,
    (L === 'vi'
      ? 'Chào ' + name + ',\n\nThư Đạo đã nhận đăng ký của bạn.\n\nWorkshop: ' + title + '\nThời gian: ' + ws.date + ' ' + ws.time + '\nĐịa chỉ: ' + ws.address + '\nSố người: ' + people + '\nMã đăng ký: ' + bid + '\n\n' + pay + '\n\nHẹn gặp bạn!\n' + CFG.SITE
      : 'Hello ' + name + ',\n\nThank you – we have received your booking.\n\nWorkshop: ' + title + '\nWhen: ' + ws.date + ' ' + ws.time + '\nWhere: ' + ws.address + '\nPeople: ' + people + '\nBooking code: ' + bid + '\n\n' + pay + '\n\nSee you soon!\n' + CFG.SITE));
  mail_(CFG.NOTIFY, '[Workshop] ' + name + ' – ' + ws.title_vi + ' (' + people + ' người)',
    'Đăng ký workshop mới\n\n' + ws.title_vi + ' – ' + ws.date + ' ' + ws.time + '\nHọ tên: ' + name + '\nEmail: ' + mail + '\nĐiện thoại: ' + clip_(b.phone, 40) +
    '\nQuốc gia: ' + clip_(b.country, 60) + '\nSố người: ' + people + '\nThanh toán: ' + payment + ' – ' + amount + '\nMã: ' + bid + '\nGhi chú: ' + clip_(b.note, 500));
  return { ok: true, bookingId: bid, amount: amount, payment: payment, currency: payment === 'bank' ? 'VND' : 'USD' };
}

/* ---------------- Ghi danh khoá Online (cần đăng nhập) ---------------- */
function enroll_(b) {
  var me = auth_(b.token);
  var pk = packages_().filter(function (p) { return p.id === str_(b.packageId); })[0];
  if (!pk) throw new Error('PACKAGE_NOT_FOUND');
  var payment = b.payment === 'bank' ? 'bank' : 'paypal';
  var list = enrollments_(me.code);
  var dup = list.filter(function (e) { return e.packageId === pk.id && (e.status === 'PENDING' || e.status === 'ACTIVE'); })[0];
  if (dup) return { ok: true, duplicate: true, enrollId: dup.id, status: dup.status, amount: dup.amount, payment: dup.payment, currency: dup.payment === 'bank' ? 'VND' : 'USD' };
  var amount = payment === 'bank' ? (Number(pk.price_vnd) || 0) : (Number(pk.price_usd) || 0);
  var eid = id_('EN'), mail = me.email || email_(b.email), L = lang_(b.lang);
  append_('Enrollments', { Time: now_(), EnrollID: eid, Code: me.code, Name: me.name, Email: mail, PackageID: pk.id, Package: pk.name_en,
    Course: pk.course, Payment: payment, Amount: amount, Status: 'PENDING', Lang: L, Note: clip_(b.note, 500) });
  var pay = payInfo_(payment, amount, eid, L, settings_());
  if (mail) mail_(mail, (L === 'vi' ? 'Đăng ký khoá học – ' : 'Course enrolment – ') + (L === 'vi' ? pk.name_vi : pk.name_en),
    (L === 'vi'
      ? 'Chào ' + me.name + ',\n\nBạn đã đăng ký: ' + pk.name_vi + '\nMã đăng ký: ' + eid + '\n\n' + pay + '\n\nKhi giáo viên xác nhận thanh toán, bài học và video sẽ được mở trong tài khoản ' + me.code + '.\n' + CFG.SITE
      : 'Hello ' + me.name + ',\n\nYou enrolled in: ' + pk.name_en + '\nEnrolment code: ' + eid + '\n\n' + pay + '\n\nAs soon as your teacher confirms the payment, all lessons and videos will unlock in your account ' + me.code + '.\n' + CFG.SITE));
  mail_(CFG.NOTIFY, '[Online quốc tế] ' + me.name + ' (' + me.code + ') – ' + pk.name_vi,
    'Ghi danh mới (chờ duyệt)\n\nHọc viên: ' + me.name + ' – ' + me.code + '\nEmail: ' + mail + '\nGói: ' + pk.name_vi + '\nThanh toán: ' + payment + ' – ' + amount +
    '\nMã: ' + eid + '\n\nKhi đã nhận tiền: đổi Status ở tab Enrollments thành ACTIVE.');
  return { ok: true, enrollId: eid, status: 'PENDING', amount: amount, payment: payment, currency: payment === 'bank' ? 'VND' : 'USD' };
}

function payInfo_(payment, amount, ref, L, s) {
  if (payment === 'bank') {
    return (L === 'vi' ? 'Chuyển khoản ' : 'Bank transfer ') + amount + ' VND\n' + s.BANK_NAME + ' – ' + s.BANK_ACCOUNT + ' – ' + s.BANK_HOLDER +
      (L === 'vi' ? '\nNội dung: ' : '\nTransfer note: ') + ref;
  }
  if (payment === 'paypal') {
    var link = s.PAYPAL_ME ? 'https://paypal.me/' + s.PAYPAL_ME + '/' + amount + 'USD' : '';
    return 'PayPal: ' + amount + ' USD' + (link ? '\n' + link : '') + (s.PAYPAL_EMAIL ? '\n' + s.PAYPAL_EMAIL : '') +
      (link || s.PAYPAL_EMAIL ? '' : (L === 'vi' ? '\nGiáo viên sẽ gửi link thanh toán PayPal qua email.' : '\nYour teacher will email you a PayPal payment link.')) +
      (L === 'vi' ? '\nGhi chú khi thanh toán: ' : '\nPlease add this note to the payment: ') + ref;
  }
  return L === 'vi' ? 'Thanh toán tiền mặt tại buổi học.' : 'Pay in cash at the workshop.';
}

/* ---------------- Nộp bài ---------------- */
function submit_(b) {
  var me = auth_(b.token);
  var course = str_(b.course).toLowerCase() === 'path52' ? 'path52' : 'intro';
  var lesson = clip_(b.lesson, 12).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!lesson) throw new Error('LESSON_REQUIRED');
  var acc = access_(enrollments_(me.code));
  var freeLesson = course === 'intro' && lesson === 'N1';
  if (!acc[course] && !freeLesson) throw new Error('NO_ACCESS');
  var mime = /^image\/(jpeg|png|webp)$/.test(str_(b.mime)) ? str_(b.mime) : '';
  if (!mime) throw new Error('IMAGE_ONLY');
  var bytes = Utilities.base64Decode(String(b.data || '').replace(/^data:[^,]+,/, ''));
  if (!bytes.length || bytes.length > CFG.MAX_FILE) throw new Error('FILE_TOO_LARGE');
  var sid = id_('SB');
  var ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  var file = folder_().createFile(Utilities.newBlob(bytes, mime, me.code + '_' + course + '_' + lesson + '_' + sid + '.' + ext));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  append_('Submissions', { Time: now_(), SubID: sid, Code: me.code, Name: me.name, Email: me.email, Course: course, Lesson: lesson,
    FileID: file.getId(), FileURL: file.getUrl(), Note: clip_(b.note, 800), Score: '', Comment: '', ReviewedAt: '', Public: 'FALSE', Lang: lang_(b.lang) });
  mail_(CFG.NOTIFY, '[Bài nộp quốc tế] ' + me.name + ' (' + me.code + ') – ' + course + ' ' + lesson,
    'Bài nộp mới cần nhận xét\n\nHọc viên: ' + me.name + ' – ' + me.code + '\nKhoá: ' + course + ' · Bài ' + lesson + '\nẢnh: ' + file.getUrl() +
    '\nGhi chú: ' + clip_(b.note, 800) + '\n\nChấm: điền Score (0–10) và Comment ở tab Submissions.');
  return { ok: true, id: sid, file: file.getId() };
}

function folder_() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var it = DriveApp.getFoldersByName(CFG.FOLDER_NAME);
  var f = it.hasNext() ? it.next() : DriveApp.createFolder(CFG.FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

/* ---------------- Khi thầy chấm bài (trình kích hoạt onEdit do setup tạo) ---------------- */
function onReviewEdit(e) {
  if (!e || !e.range) return;
  var sh = e.range.getSheet();
  if (sh.getName() !== 'Submissions' || e.range.getRow() < 2) return;
  var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
  var cScore = head.indexOf('Score') + 1, cRev = head.indexOf('ReviewedAt') + 1;
  if (e.range.getColumn() > cScore || e.range.getLastColumn() < cScore) return;
  for (var r = e.range.getRow(); r <= e.range.getLastRow(); r++) {
    var row = sh.getRange(r, 1, 1, head.length).getValues()[0], o = {};
    head.forEach(function (h, j) { o[h] = row[j]; });
    if (str_(o.Score) === '' || str_(o.ReviewedAt)) continue;
    sh.getRange(r, cRev).setValue(now_());
    var mail = email_(o.Email);
    if (!mail) continue;
    var vi = str_(o.Lang) === 'vi';
    mail_(mail, vi ? 'Bài của bạn đã được chấm – ' + str_(o.Lesson) : 'Your work has been reviewed – ' + str_(o.Lesson),
      (vi ? 'Chào ' + str_(o.Name) + ',\n\nGiáo viên đã chấm bài ' + str_(o.Lesson) + '.\nĐiểm: ' + str_(o.Score) + '/10\nNhận xét: ' + str_(o.Comment)
          : 'Hello ' + str_(o.Name) + ',\n\nYour teacher has reviewed lesson ' + str_(o.Lesson) + '.\nScore: ' + str_(o.Score) + '/10\nComment: ' + str_(o.Comment)) +
      '\n\n' + CFG.SITE);
  }
}

function mail_(to, subject, body) {
  if (!to) return;
  try { MailApp.sendEmail({ to: to, subject: subject, body: body, name: 'Thư Đạo' }); } catch (e) { console.log('mail failed: ' + e); }
}
