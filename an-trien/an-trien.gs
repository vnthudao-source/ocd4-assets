/**
 * ẤN TRIỆN · lưu thiết kế mặt ấn & thân ấn lên Google Drive + ghi Sheet
 * Tạo thành MỘT DỰ ÁN APPS SCRIPT RIÊNG (vì dự án "Gs" đã có doPost riêng).
 *
 * Cách dùng:
 * 1. script.google.com → Dự án mới → dán toàn bộ file này.
 * 2. Chạy hàm setup() một lần để cấp quyền (tự tạo thư mục + bảng tính).
 * 3. Triển khai → Triển khai mới → Ứng dụng web
 *      Thực thi với tư cách: Tôi · Người có quyền truy cập: Bất kỳ ai
 * 4. Sao chép URL /exec, dán vào API_URL trong ATX_CONFIG trên trang Blogspot.
 */

const AT_FOLDER_ID = '';   // để trống: tự tạo thư mục "Ấn triện - Thiết kế"
const AT_SHEET_ID  = '';   // để trống: tự tạo bảng tính "Thiết kế ấn triện"
const AT_KEY       = '';   // tuỳ chọn: đặt mã, rồi nhập mã này ở mục "Cài đặt lưu" trên trang
const AT_TAB       = 'ThietKeAn';
const AT_HEAD = ['Thời gian','Loại','Tên ấn','Hình','Ngang (cm)','Cao (cm)','Sâu (cm)','Kiểu khắc',
                 'Hàng','Cột','Số ô tô','Lưới (█ = ô tô)','Ảnh','File ID','Dữ liệu'];

function setup() { folder_(); sheet_(); Logger.log('Sheet: ' + sheet_().getParent().getUrl()); }

function doGet(e) {
  const p = e.parameter || {};
  if (!keyOk_(p.key)) return out_({ ok: false, error: 'sai mã lưu' });
  if (p.action === 'list') return out_(list_());
  return out_({ ok: true, msg: 'An trien API' });
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
  const id = AT_FOLDER_ID || props_().getProperty('AT_FOLDER');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const f = DriveApp.createFolder('Ấn triện - Thiết kế');
  props_().setProperty('AT_FOLDER', f.getId());
  return f;
}

function sheet_() {
  const id = AT_SHEET_ID || props_().getProperty('AT_SHEET');
  let ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) {} }
  if (!ss) {
    ss = SpreadsheetApp.create('Thiết kế ấn triện');
    props_().setProperty('AT_SHEET', ss.getId());
    DriveApp.getFileById(ss.getId()).moveTo(folder_());
  }
  let sh = ss.getSheetByName(AT_TAB);
  if (!sh) {
    sh = ss.insertSheet(AT_TAB);
    sh.appendRow(AT_HEAD);
    sh.setFrozenRows(1);
    sh.getRange('L:L').setFontFamily('Courier New').setWrap(true);
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
    const stamp = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmmss');
    const safe = name.replace(/[\\\/:*?"<>|]+/g, '_');
    const bytes = Utilities.base64Decode(String(d.png).replace(/^data:image\/png;base64,/, ''));
    const file = folder_().createFile(Utilities.newBlob(bytes, 'image/png', `${safe} - ${type} - ${stamp}.png`));
    const m = d.meta || {};
    sheet_().appendRow([new Date(), type, name, m.shapeLabel || '', m.w || '', m.h || '', m.d || '',
      m.modeLabel || '', m.rows || '', m.cols || '', m.count || '', m.gridText || '',
      file.getUrl(), file.getId(), JSON.stringify(d.data || {})]);
    return { ok: true, url: file.getUrl(), id: file.getId() };
  } finally {
    lock.releaseLock();
  }
}

function list_() {
  const sh = sheet_(), n = sh.getLastRow();
  if (n < 2) return { ok: true, items: [] };
  const v = sh.getRange(2, 1, n - 1, AT_HEAD.length).getValues(), items = [];
  for (let i = v.length - 1; i >= 0 && items.length < 300; i--) {
    if (v[i][1] !== 'Mặt ấn') continue;
    items.push({
      time: Utilities.formatDate(new Date(v[i][0]), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'),
      name: v[i][2], url: v[i][12], data: v[i][14]
    });
  }
  return { ok: true, items: items };
}
