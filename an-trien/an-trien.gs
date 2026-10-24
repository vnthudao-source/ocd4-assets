/**
 * ẤN TRIỆN · lưu thiết kế mặt ấn & thân ấn lên Google Drive + ghi Sheet   (bản 1.4)
 * Dự án Apps Script RIÊNG (dự án "Gs" đã có doPost riêng).
 *
 * Cách cập nhật mà vẫn giữ nguyên URL /exec:
 *   Dán đè toàn bộ file này → Lưu → Triển khai › Quản lý các bản triển khai
 *   → bấm ✏ (Chỉnh sửa) ở bản đang dùng → Phiên bản: "Phiên bản mới" → Triển khai.
 *   (KHÔNG chọn "Triển khai mới" – làm vậy sẽ ra URL khác.)
 *
 * Lần đầu: chạy hàm setup() một lần để cấp quyền, xem nhật ký để biết thư mục/bảng tính đang dùng.
 *
 * Bản lưu không bị "mất" khi đổi dự án hay triển khai lại:
 *  - Thư mục và bảng tính được tìm theo TÊN nếu chưa ghi nhớ ID (không tạo bản trùng mới).
 *  - Mỗi bản ấn có ảnh PNG + tệp .json cùng tên trong thư mục; danh sách đọc từ các tệp .json này,
 *    rồi bổ sung các dòng cũ trong Sheet (bản lưu trước 1.4 chưa có .json).
 */

const AT_FOLDER_ID   = '';   // để trống: tự tìm/tạo thư mục theo tên dưới đây
const AT_SHEET_ID    = '';   // để trống: tự tìm/tạo bảng tính theo tên dưới đây
const AT_FOLDER_NAME = 'Ấn triện - Thiết kế';
const AT_SHEET_NAME  = 'Thiết kế ấn triện';
const AT_KEY         = '';   // tuỳ chọn: đặt mã, rồi nhập mã này ở mục "Cài đặt lưu" trên trang
const AT_TAB         = 'ThietKeAn';
const AT_HEAD = ['Thời gian','Loại','Tên ấn','Hình','Ngang (cm)','Cao (cm)','Sâu (cm)','Kiểu khắc',
                 'Hàng','Cột','Số ô tô','Lưới (█ = ô tô)','Ảnh','File ID','Dữ liệu','Tệp dữ liệu'];

function setup() {
  const f = folder_(), sh = sheet_();
  Logger.log('Tài khoản: ' + Session.getEffectiveUser().getEmail());
  Logger.log('Thư mục: ' + f.getUrl());
  Logger.log('Bảng tính: ' + sh.getParent().getUrl());
  Logger.log('Số bản mặt ấn tìm thấy: ' + list_().items.length);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!keyOk_(p.key)) return out_({ ok: false, error: 'sai mã lưu' });
  try {
    if (p.action === 'list') return out_(list_());
    return out_({ ok: true, msg: 'An trien API 1.4', account: Session.getEffectiveUser().getEmail() });
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (!keyOk_(d.key)) return out_({ ok: false, error: 'sai mã lưu' });
    if (d.action === 'save') return out_(save_(d));
    return out_({ ok: false, error: 'không rõ thao tác' });
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  }
}

function keyOk_(k) { return !AT_KEY || String(k || '') === AT_KEY; }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function props_() { return PropertiesService.getScriptProperties(); }

function folder_() {
  const P = props_();
  const id = AT_FOLDER_ID || P.getProperty('AT_FOLDER');
  if (id) { try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {} }
  const it = DriveApp.getFoldersByName(AT_FOLDER_NAME);       // tìm lại thư mục cũ theo tên
  while (it.hasNext()) { const f = it.next(); if (!f.isTrashed()) { P.setProperty('AT_FOLDER', f.getId()); return f; } }
  const f = DriveApp.createFolder(AT_FOLDER_NAME);
  P.setProperty('AT_FOLDER', f.getId());
  return f;
}

function sheet_() {
  const P = props_();
  let ss = null;
  const id = AT_SHEET_ID || P.getProperty('AT_SHEET');
  if (id) { try { ss = SpreadsheetApp.openById(id); if (DriveApp.getFileById(id).isTrashed()) ss = null; } catch (e) { ss = null; } }
  if (!ss) {                                                   // tìm lại bảng tính cũ theo tên
    const it = DriveApp.getFilesByName(AT_SHEET_NAME);
    while (it.hasNext()) {
      const fl = it.next();
      if (!fl.isTrashed() && fl.getMimeType() === MimeType.GOOGLE_SHEETS) { ss = SpreadsheetApp.open(fl); break; }
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create(AT_SHEET_NAME);
    DriveApp.getFileById(ss.getId()).moveTo(folder_());
  }
  P.setProperty('AT_SHEET', ss.getId());
  let sh = ss.getSheetByName(AT_TAB);
  if (!sh) {
    sh = ss.insertSheet(AT_TAB);
    sh.appendRow(AT_HEAD);
    sh.setFrozenRows(1);
    sh.getRange('L:L').setFontFamily('Courier New').setWrap(true);
  } else if (sh.getLastColumn() < AT_HEAD.length) {
    sh.getRange(1, 1, 1, AT_HEAD.length).setValues([AT_HEAD]);
  }
  return sh;
}

function save_(d) {
  const name = String(d.name || '').trim();
  if (!name) throw new Error('thiếu tên ấn');
  if (!d.png) throw new Error('thiếu ảnh');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const type = d.type === 'body' ? 'Thân ấn' : 'Mặt ấn';
    const now = new Date();
    const stamp = Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmmss');
    const base = `${name.replace(/[\\\/:*?"<>|]+/g, '_')} - ${type} - ${stamp}`;
    const folder = folder_();
    const bytes = Utilities.base64Decode(String(d.png).replace(/^data:image\/png;base64,/, ''));
    const png = folder.createFile(Utilities.newBlob(bytes, 'image/png', base + '.png'));
    const rec = { v: 2, type: type, name: name, time: now.toISOString(), png: png.getId(), url: png.getUrl(), data: d.data || {} };
    const js = folder.createFile(Utilities.newBlob(JSON.stringify(rec), 'application/json', base + '.json'));
    const m = d.meta || {};
    sheet_().appendRow([now, type, name, m.shapeLabel || '', m.w || '', m.h || '', m.d || '',
      m.modeLabel || '', m.rows || '', m.cols || '', m.count || '', m.gridText || '',
      png.getUrl(), png.getId(), JSON.stringify(d.data || {}), js.getId()]);
    return { ok: true, url: png.getUrl(), id: png.getId() };
  } finally {
    lock.releaseLock();
  }
}

function fmtTime_(t) {
  const d = t instanceof Date ? t : new Date(t);
  return isNaN(d) ? '' : Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
}

function list_() {
  const items = [], seen = {};
  // 1) Tệp .json trong thư mục (nguồn chính, không phụ thuộc Sheet)
  const files = folder_().getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (f.isTrashed() || !/\.json$/i.test(f.getName())) continue;
    try {
      const r = JSON.parse(f.getBlob().getDataAsString());
      if (r.type !== 'Mặt ấn' || !r.data || !r.data.grid) continue;
      seen[r.png] = 1;
      items.push({ t: new Date(r.time).getTime() || 0, time: fmtTime_(r.time), name: r.name, url: r.url, data: r.data });
    } catch (e) {}
  }
  // 2) Dòng trong Sheet chưa có tệp .json (bản lưu trước phiên bản 1.4)
  try {
    const sh = sheet_(), n = sh.getLastRow();
    if (n >= 2) {
      const v = sh.getRange(2, 1, n - 1, 15).getValues();
      v.forEach(function (row) {
        if (row[1] !== 'Mặt ấn' || seen[row[13]]) return;
        let data = null; try { data = JSON.parse(row[14]); } catch (e) {}
        if (!data || !data.grid) return;
        seen[row[13]] = 1;
        items.push({ t: new Date(row[0]).getTime() || 0, time: fmtTime_(row[0]), name: row[2], url: row[12], data: data });
      });
    }
  } catch (e) {}
  items.sort(function (a, b) { return b.t - a.t; });
  return { ok: true, items: items.slice(0, 500).map(function (x) { delete x.t; return x; }) };
}
