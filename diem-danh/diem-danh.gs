/**
 * ĐIỂM DANH LỚP · Thư Đạo · v1.0.1
 * Lưu danh sách học viên, các buổi điểm danh (giờ Việt Nam) và giáo án vào Google Sheet.
 *
 * CÁCH CÀI (làm một lần):
 * 1. Mở dự án Apps Script (tạo ở script.google.com hoặc từ trong một Google Sheet đều được).
 * 2. Xoá hết code cũ → dán TOÀN BỘ file này.
 * 3. Đổi MAT_KHAU bên dưới thành mật khẩu riêng của thầy (ít nhất 6 ký tự), bấm Lưu.
 * 4. Chọn hàm setup ở thanh trên → Chạy → cấp quyền. Nếu dự án không gắn với Sheet nào,
 *    script tự tạo bảng tính "Điểm danh lớp" trong Drive (xem link ở Nhật ký thực thi).
 *    Muốn dùng một Sheet có sẵn: dán ID của Sheet đó vào SHEET_ID bên dưới.
 * 5. Triển khai → Triển khai mới → loại "Ứng dụng web"
 *      Thực thi với tư cách: Tôi · Người có quyền truy cập: Bất kỳ ai
 * 6. Sao chép URL kết thúc bằng /exec, dán vào API_URL trong khối tải trên trang Blogspot.
 * Khi sửa code về sau: Triển khai → Quản lý triển khai → bút chì → Phiên bản: Phiên bản mới → Triển khai
 * (giữ nguyên URL cũ).
 */

const MAT_KHAU = 'DOI_MAT_KHAU_O_DAY';   // mật khẩu nhập trên trang điểm danh
const SHEET_ID = '';                    // để trống: tự dùng Sheet đang gắn, hoặc tự tạo Sheet mới
const TZ = 'Asia/Ho_Chi_Minh';

const TAB_HV = 'HocVien';
const TAB_DD = 'DiemDanh';
const HEAD_HV = ['Mã', 'Họ tên', 'Loại thẻ', 'Tổng số buổi', 'Mốc thẻ', 'Học phí', 'Ngày vào học',
                 'Trạng thái', 'Ghi chú', 'Buổi gần nhất'];
const HEAD_DD = ['Mã buổi', 'Thời gian', 'Mã HV', 'Họ tên', 'Loại thẻ', 'Buổi thứ', 'Buổi trong thẻ', 'Giáo án'];

/* Loại thẻ → số buổi một chu kỳ (hết chu kỳ thì hỏi học phí) */
const THE = { 'Tháng': 4, '12 buổi': 12, '52 buổi': 52 };

function setup() {
  hv_(); dd_();
  Logger.log('Đã sẵn sàng. Bảng tính: ' + ss_().getUrl());
}

/* Bảng tính lưu dữ liệu: SHEET_ID → Sheet đang gắn với dự án → Sheet đã tự tạo trước đó → tạo mới */
let SS_CACHE = null;
function ss_() {
  if (SS_CACHE) return SS_CACHE;
  if (SHEET_ID) return (SS_CACHE = SpreadsheetApp.openById(SHEET_ID));
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return (SS_CACHE = active);
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('DD_SHEET_ID');
  if (saved) {
    try { return (SS_CACHE = SpreadsheetApp.openById(saved)); } catch (e) { /* Sheet đã bị xoá: tạo lại */ }
  }
  const ss = SpreadsheetApp.create('Điểm danh lớp');
  props.setProperty('DD_SHEET_ID', ss.getId());
  return (SS_CACHE = ss);
}

/* ---------- Web App ---------- */
function doGet() {
  return out_({ ok: true, msg: 'Diem danh API v1.0.1' });
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!MAT_KHAU || MAT_KHAU === 'DOI_MAT_KHAU_O_DAY' || MAT_KHAU.length < 6) {
      return out_({ ok: false, error: 'Thầy chưa đặt MAT_KHAU trong Apps Script (ít nhất 6 ký tự).' });
    }
    if (String(d.key || '') !== MAT_KHAU) return out_({ ok: false, error: 'Sai mật khẩu.', auth: false });
    const act = String(d.action || '');
    if (act === 'list') return out_(list_());
    if (act === 'history') return out_(history_(d.id));
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      let r;
      if (act === 'add') r = add_(d);
      else if (act === 'update') r = update_(d);
      else if (act === 'quit') r = setState_(d.id, 'Thôi học');
      else if (act === 'rejoin') r = setState_(d.id, 'Đang học');
      else if (act === 'purge') r = purge_(d.id);
      else if (act === 'checkin') r = checkin_(d.items || []);
      else if (act === 'setPaid') r = setPaid_(d.id, !!d.paid);
      else if (act === 'editLog') r = editLog_(d.logId, d.plan);
      else if (act === 'delLog') r = delLog_(d.logId);
      else return out_({ ok: false, error: 'Không rõ thao tác: ' + act });
      SpreadsheetApp.flush();
      return out_(r);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  }
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Sheet ---------- */
function tab_(name, head) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    const blank = ss.getSheets().length === 1 && ss.getSheets()[0].getLastRow() === 0 && ss.getSheets()[0].getName() !== name &&
                  !ss.getSheetByName(name === TAB_HV ? TAB_DD : TAB_HV) ? ss.getSheets()[0] : null;
    sh = blank ? blank.setName(name) : ss.insertSheet(name);
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#f3ead9');
    sh.setFrozenRows(1);
    sh.getRange(2, 1, 2000, head.length).setNumberFormat('@');
  }
  return sh;
}
function hv_() { return tab_(TAB_HV, HEAD_HV); }
function dd_() { return tab_(TAB_DD, HEAD_DD); }

function now_() { return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm'); }
function today_() { return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy'); }

function writeRow_(sh, row, values) {
  sh.getRange(row, 1, 1, values.length).setNumberFormat('@').setValues([values.map(v => v === undefined || v === null ? '' : String(v))]);
}

function readHV_() {
  const sh = hv_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, HEAD_HV.length).getDisplayValues().map((r, i) => ({
    row: i + 2,
    id: r[0], name: r[1], card: THE[r[2]] ? r[2] : 'Tháng',
    total: Number(r[3]) || 0, mark: Number(r[4]) || 0,
    paid: r[5] === 'Đã đóng', start: r[6],
    state: r[7] || 'Đang học', note: r[8], last: r[9]
  })).filter(s => s.id);
}

function readDD_() {
  const sh = dd_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, HEAD_DD.length).getDisplayValues().map((r, i) => ({
    row: i + 2, logId: r[0], time: r[1], id: r[2], name: r[3], card: r[4],
    no: Number(r[5]) || 0, inCard: r[6], plan: r[7]
  })).filter(l => l.logId);
}

function saveHV_(s) {
  writeRow_(hv_(), s.row, [s.id, s.name, s.card, s.total, s.mark, s.paid ? 'Đã đóng' : 'Chưa đóng',
    s.start, s.state, s.note, s.last]);
}

function pub_(s) {
  const size = THE[s.card] || 4;
  return { id: s.id, name: s.name, card: s.card, size: size, total: s.total,
    inCard: Math.max(0, s.total - s.mark), paid: s.paid, start: s.start,
    state: s.state, note: s.note, last: s.last };
}

function find_(id) {
  const s = readHV_().find(x => x.id === String(id || ''));
  if (!s) throw new Error('Không tìm thấy học viên ' + id);
  return s;
}

/* ---------- Thao tác ---------- */
function list_() {
  const logs = readDD_();
  return { ok: true, now: now_(), today: today_(),
    students: readHV_().map(pub_),
    logs: logs.slice(-300).reverse().map(cleanLog_) };
}

function cleanLog_(l) {
  return { logId: l.logId, time: l.time, id: l.id, name: l.name, card: l.card, no: l.no, inCard: l.inCard, plan: l.plan };
}

function history_(id) {
  return { ok: true, logs: readDD_().filter(l => l.id === String(id)).reverse().map(cleanLog_) };
}

function add_(d) {
  const name = String(d.name || '').trim();
  if (!name) throw new Error('Chưa nhập họ tên.');
  const card = THE[d.card] ? d.card : 'Tháng';
  const list = readHV_();
  let max = 0;
  list.forEach(s => { const m = /^HV(\d+)$/.exec(s.id); if (m) max = Math.max(max, Number(m[1])); });
  const id = 'HV' + String(max + 1).padStart(3, '0');
  const s = { row: hv_().getLastRow() + 1, id: id, name: name, card: card, total: 0, mark: 0,
    paid: !!d.paid, start: today_(), state: 'Đang học', note: String(d.note || '').trim(), last: '' };
  saveHV_(s);
  return { ok: true, student: pub_(s) };
}

function update_(d) {
  const s = find_(d.id);
  if (d.name !== undefined && String(d.name).trim()) s.name = String(d.name).trim();
  if (d.note !== undefined) s.note = String(d.note).trim();
  if (d.card !== undefined && THE[d.card] && d.card !== s.card) {
    s.card = d.card;
    s.mark = s.total;            // thẻ mới bắt đầu tính từ buổi kế tiếp
  }
  if (d.paid !== undefined) s.paid = !!d.paid;
  saveHV_(s);
  return { ok: true, student: pub_(s) };
}

function setState_(id, state) {
  const s = find_(id);
  s.state = state;
  saveHV_(s);
  return { ok: true, student: pub_(s) };
}

function purge_(id) {
  const s = find_(id);
  if (s.state !== 'Thôi học') throw new Error('Chỉ xoá hẳn được học viên đã thôi học.');
  hv_().deleteRow(s.row);
  return { ok: true, removed: s.id };
}

function setPaid_(id, paid) {
  const s = find_(id);
  s.paid = paid;
  saveHV_(s);
  return { ok: true, student: pub_(s) };
}

function checkin_(items) {
  if (!items.length) throw new Error('Chưa chọn học viên nào.');
  const time = now_();
  const stamp = Utilities.formatDate(new Date(), TZ, 'yyMMddHHmmss');
  const list = readHV_();
  const sh = dd_();
  let row = sh.getLastRow() + 1;
  const done = [], ask = [];
  items.forEach(it => {
    const s = list.find(x => x.id === String(it.id));
    if (!s || s.state !== 'Đang học') return;
    const size = THE[s.card] || 4;
    s.total += 1;
    const inCard = s.total - s.mark;
    s.last = time;
    writeRow_(sh, row++, [stamp + '-' + s.id + '-' + row, time, s.id, s.name, s.card, s.total, inCard + '/' + size,
      String(it.plan || '').trim()]);
    if (inCard >= size) {           // hết chu kỳ thẻ: mở chu kỳ mới, mặc định chưa đóng cho tới khi thầy xác nhận
      s.mark = s.total;
      s.paid = false;
      ask.push({ id: s.id, name: s.name, card: s.card, size: size });
    }
    saveHV_(s);
    done.push(pub_(s));
  });
  return { ok: true, time: time, done: done, ask: ask };
}

function editLog_(logId, plan) {
  const l = readDD_().find(x => x.logId === String(logId || ''));
  if (!l) throw new Error('Không tìm thấy buổi học.');
  dd_().getRange(l.row, 8).setNumberFormat('@').setValue(String(plan || '').trim());
  l.plan = String(plan || '').trim();
  return { ok: true, log: cleanLog_(l) };
}

function delLog_(logId) {
  const logs = readDD_();
  const l = logs.find(x => x.logId === String(logId || ''));
  if (!l) throw new Error('Không tìm thấy buổi học.');
  dd_().deleteRow(l.row);
  const s = readHV_().find(x => x.id === l.id);
  if (s) {
    const size = THE[s.card] || 4;
    s.total = Math.max(0, s.total - 1);
    if (s.total < s.mark) s.mark = Math.max(0, s.mark - size);   // lùi về chu kỳ trước
    const rest = logs.filter(x => x.id === s.id && x.logId !== l.logId);
    s.last = rest.length ? rest[rest.length - 1].time : '';
    saveHV_(s);
    return { ok: true, student: pub_(s) };
  }
  return { ok: true };
}
