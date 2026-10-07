/**
 * Phòng Luyện Công – Apps Script API (Giai đoạn 2 + Reward Core v4.4.0)
 * - GET  ?action=ping                 : kiểm tra API (GS_VERSION)
 * - GET  ?action=update&key=…[&ref=…] : tự cập nhật code từ GitHub (xem phần TỰ CẬP NHẬT cuối tệp)
 * - POST {action:'form', form, values, keys} : gửi Google Form qua máy chủ và chờ Sheet xác nhận
 * - GET  ?tabs=rooms,attempts,summary : Phòng Luyện Công đọc nhiều tab trong 1 lần gọi
 * - GET  ?action=diag                 : đo thời gian đọc từng tab (chẩn đoán chậm)
 * - GET  ?multi=src:Tab;src:Tab!&code= : trang Nhiệm vụ – gom nhiều tab, ! = lọc theo mã học viên
 * - GET  ?action=flush                : xoá bộ nhớ đệm nội dung nhiệm vụ ngay
 * - GET  ?src=gift|students&sheets=A,B: đọc nhiều tab một lần cho Reward Core (QuaTang, PhieuDoi, QuaTangGVCN, MinhHong…, HocVien)
 * - GET  ?tab=rooms|attempts|summary  : đọc dữ liệu trực tiếp từ Sheet (không trễ như CSV công khai)
 * - POST {action:'finalize', room, leader} : tổng kết + phát thưởng, có khóa chống chạy trùng
 * - POST {action:'questReward', code, questId} : thưởng nhiệm vụ (số thưởng lấy từ tab NhiemVu, mỗi nhiệm vụ 1 lần)
 * - POST {action:'beastReward', assistant, eventId, items:[{code}]} : thưởng Linh Thú (rank/thưởng lấy từ LinhThuTongKet)
 *   (Apps Script tự chấm điểm từ LuotThiTraLoi và tự kiểm tra vé ở MinhHongGiaoDich, không tin dữ liệu trình duyệt gửi)
 *
 * Dán đè toàn bộ file Code.gs cũ, Lưu, rồi Triển khai > Quản lý các bản triển khai > bút chì > Phiên bản: Mới > Triển khai.
 */

const GS_VERSION = 13;
const SS_ID = '1AzGqq0yCi4Qvhw14K8SX2Nx5pGRvFcFYJp0ob9EaPgg';           // Phòng Luyện Công – Dữ liệu và cấu hình
const STUDENT_SS_ID = '1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs';  // NopBaiLuyenTap (tab HocVien)
const GIFT_SS_ID = '1-IkcpEkKQtIavl5DIf6Sbwx3p0aAfnSS4HjT6dn1u_E';     // DoiQua (MinhHongGiaoDich, QuaTangGVCN)
const QUEST_SS_ID = '10EjfikAuPyc1t_aGDDsUlq0eewo0WUl5qOyXjkVG28M';    // OCD_Quest (trang Nhiệm vụ + Linh Thú)
const TICKET_NAME = 'Vé vào phòng luyện công';
const REWARD_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSc48-Y-3nf4GtAKdE-Gq4uOMgOJSBUzvFruoSeQx8qmAok06Q/formResponse';
const LEDGER_TAB = 'TongKetPhong';
const TZ = 'Asia/Ho_Chi_Minh';

const TABS = {
  rooms:    { name: 'HoatDongPhong',    roomCol: 2 },
  attempts: { name: 'LuotThiTraLoi',    roomCol: 3 },
  summary:  { name: 'PhanHoiPhongForm', roomCol: -1 }
};

// Reward Core v4.4.0 đọc các tab này qua ?src=...&sheets=Tab1,Tab2 (gom 1 yêu cầu)
const READ_SOURCES = {
  gift:     { id: GIFT_SS_ID,    sheets: ['QuaTang', 'NhanVat', 'PhieuDoi', 'QuaTangGVCN', 'MinhHongThuMua', 'MinhHongGiaoDich', 'HopQuaBiAn'] },
  students: { id: STUDENT_SS_ID, sheets: ['HocVien', 'Form Responses 1', 'TacPhamWeb', 'XepHang', 'XoaBai'] },
  quest:    { id: QUEST_SS_ID,   sheets: ['NhiemVu', 'BuocNhiemVu', 'CauHoi', 'TienDoForm', 'HoatDongNhiemVu', 'HoiThoaiNPC', 'SuKienTruyenThong',
                                          'TroGiang', 'LinhThuEvent', 'LinhThuKetQua', 'LinhThuTongKet', 'NganHangCauHoi'] },
  plc:      { id: SS_ID,         sheets: ['HoatDongPhong', 'LuotThiTraLoi', 'PhanHoiPhongForm'] }
};

// Nội dung ít thay đổi: lưu bộ nhớ đệm 2 phút (sửa trong Sheet sẽ hiện trên trang sau tối đa 2 phút, hoặc gọi ?action=flush)
const CACHEABLE = {
  'quest:NhiemVu': 1, 'quest:BuocNhiemVu': 1, 'quest:CauHoi': 1, 'quest:HoiThoaiNPC': 1, 'quest:SuKienTruyenThong': 1,
  'quest:NganHangCauHoi': 1, 'quest:TroGiang': 1, 'gift:NhanVat': 1, 'gift:QuaTang': 1, 'gift:MinhHongThuMua': 1,
  'students:HocVien': 1
};
const CONTENT_TTL = 120;
// Sheet chỉ thêm dòng (qua Form): nhớ kết quả, lần sau chỉ đọc các dòng MỚI thêm.
// Sửa/xoá dòng cũ trong Sheet sẽ hiện sau tối đa DELTA_TTL giây (hoặc gọi ?action=flush).
const DELTA_TTL = 300;
const DELTA_ALL = { 'gift:QuaTangGVCN': 1, 'gift:PhieuDoi': 1, 'gift:MinhHongGiaoDich': 1, 'quest:LinhThuKetQua': 1,
  'plc:HoatDongPhong': 1, 'plc:LuotThiTraLoi': 1, 'plc:PhanHoiPhongForm': 1 };
const CODE_HEADERS = ['studentcode', 'mã học viên', 'ma hoc vien', 'mã hv'];
const GEM_NAMES = {
  HOANG_NGOC: 'Hoàng Ngọc', HAI_LAM_NGOC: 'Hải Lam Ngọc', THACH_ANH_TIM: 'Thạch Anh Tím',
  LAM_BAO_THACH: 'Lam Bảo Thạch', LUC_THACH: 'Lục Thạch', HONG_NGOC: 'Hồng Ngọc'
};
const BEAST_QUESTIONS = 5, BEAST_ASSISTANT_MULTIPLIER = 2;

/* ===================== ĐỌC DỮ LIỆU ===================== */

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'ping') return json({ ok: true, version: GS_VERSION, sheetsApi: typeof Sheets !== 'undefined', now: new Date().toISOString() });
    if (p.action === 'flush') return json(flushCache_());
    if (p.action === 'update') return json(selfUpdate_(p.key, p.ref));
    if (p.action === 'versions') return json(listVersions_(p.key));
    if (p.action === 'rollback') return json(rollback_(p.key, p.to));
    if (p.action === 'diag') return json(diag_());
    if (p.multi) return json(readMulti_(p.multi, p.code));
    if (p.sheets) return json(readSheets_(p.src || 'gift', String(p.sheets).split(',')));
    if (p.tabs) return json(readPlcTabs_(String(p.tabs).split(',')));
    const cfg = TABS[p.tab];
    if (!cfg) return json({ ok: false, error: 'Tham số tab không hợp lệ (rooms | attempts | summary).' });
    const values = sheet_(cfg.name).getDataRange().getDisplayValues();
    let rows = values.slice(1).filter(nonEmpty_);
    if (p.room && cfg.roomCol >= 0) rows = rows.filter(r => clean_(r[cfg.roomCol]) === clean_(p.room));
    return json({ ok: true, tab: cfg.name, header: values[0] || [], rows: rows, at: Date.now() });
  } catch (err) {
    return json({ ok: false, error: msg_(err) });
  }
}

// ===== ĐỌC NHANH (v9) =====
// Gom mọi tab cần đọc của cùng 1 file vào 1 lần gọi Sheets API (dịch vụ nâng cao "Google Sheets API").
// Chưa bật dịch vụ / gặp lỗi -> tự dùng cách đọc cũ (readSheetsApp_ / readMultiApp_).
function readSheets_(src, names) {
  const cfg = READ_SOURCES[src];
  if (!cfg) return { ok: false, error: 'Nguồn dữ liệu không hợp lệ.' };
  const list = (names || []).map(clean_).filter(n => cfg.sheets.indexOf(n) >= 0);
  const rows = fastTabs_(src, list.map(n => ({ name: n, code: '' })));
  if (!rows) return readSheetsApp_(src, names);
  const out = {};
  list.forEach((n, i) => { if (rows[i]) out[n] = rows[i]; });
  return { ok: true, sheets: out, at: Date.now(), fast: true };
}

// Trang Nhiệm vụ: ?multi=quest:NhiemVu;quest:TienDoForm!;students:TacPhamWeb!&code=TEST001
// Dấu ! = chỉ trả về các dòng của học viên trong &code= (lọc sẵn ở máy chủ).
function readMulti_(spec, code) {
  code = up_(code);
  const start = Date.now(), groups = {}, out = {}, ms = {};
  String(spec || '').split(';').map(clean_).filter(Boolean).slice(0, 30).forEach(item => {
    const m = item.match(/^([a-z]+):(.+?)(!?)$/);
    if (!m) return;
    const src = m[1], name = m[2], filtered = m[3] === '!', cfg = READ_SOURCES[src];
    if (!cfg || cfg.sheets.indexOf(name) < 0 || (filtered && !code)) return;
    (groups[src] = groups[src] || []).push({ item: item, name: name, code: filtered ? code : '' });
  });
  for (const src in groups) {
    const t0 = Date.now(), jobs = groups[src], rows = fastTabs_(src, jobs);
    if (!rows) return readMultiApp_(spec, code);
    jobs.forEach((j, i) => { if (rows[i]) out[j.item] = rows[i]; });
    ms[src] = Date.now() - t0;
  }
  ms._total = Date.now() - start;
  out._ms = ms; // thời gian xử lý (ms) để đo tốc độ
  return { ok: true, sheets: out, at: Date.now(), fast: true };
}

// jobs: [{ name, code }] (code '' = lấy mọi dòng). Trả về mảng rows theo thứ tự jobs; null = dùng cách cũ.
function fastTabs_(src, jobs) {
  if (typeof Sheets === 'undefined') return null;
  const cfg = READ_SOURCES[src], c = CacheService.getScriptCache(), gen = c.get('delta#gen') || '0', now = Date.now();
  const out = jobs.map(() => null), plan = [];
  jobs.forEach((j, i) => {
    const base = src + ':' + j.name, q = "'" + j.name + "'";
    if (!j.code && CACHEABLE[base]) {
      const hit = cacheGet_(base);
      if (hit) out[i] = hit;
      else plan.push({ i: i, j: j, base: base, kind: 'content', range: q });
    } else if (j.code || DELTA_ALL[base]) {
      const key = 'd' + gen + ':' + base + ':' + j.code, hit = cacheGet_(key);
      const w = hit && hit.rows && hit.rows.length ? (hit.w || hit.rows[0].length) : 0;
      if (w && hit.last > 0 && now - hit.t < DELTA_TTL * 1000) {
        hit.w = w;
        plan.push({ i: i, j: j, key: key, hit: hit, kind: 'delta', range: q + '!A' + hit.last + ':' + col_(w) });
      } else plan.push({ i: i, j: j, key: key, kind: 'fresh', range: q });
    } else plan.push({ i: i, j: j, base: base, kind: 'plain', range: q });
  });
  if (!plan.length) return out;
  let got;
  try {
    got = Sheets.Spreadsheets.Values.batchGet(cfg.id, { ranges: plan.map(p => p.range) }).valueRanges || [];
  } catch (x) {
    console.warn('Sheets API lỗi, dùng cách đọc cũ: ' + msg_(x));
    return null;
  }
  plan.forEach((p, k) => {
    const v = (got[k] && got[k].values) || [], code = p.j.code;
    if (p.kind === 'delta') {
      // v[0] là dòng cuối đã biết; các dòng sau đó là dòng mới thêm
      const h = p.hit;
      if (!v.length) h.t = 0; // sheet bị xoá bớt dòng -> lần sau đọc lại toàn bộ
      v.slice(1).forEach(r => { r = pad_(r, h.w); if (code ? up_(r[h.ci]) === code : nonEmpty_(r)) h.rows.push(r); });
      if (v.length !== 1) { h.last += Math.max(v.length - 1, 0); cachePut_(p.key, h, DELTA_TTL); }
      out[p.i] = h.rows;
      return;
    }
    const w = v.reduce((a, r) => Math.max(a, r.length), 0), head = pad_(v[0] || [], w);
    if (p.kind === 'fresh') {
      const h = { t: now, last: v.length, w: w, ci: -1, rows: [head] };
      if (code) {
        h.ci = head.map(x => clean_(x).normalize('NFC').toLowerCase()).findIndex(x => CODE_HEADERS.indexOf(x) >= 0);
        if (h.ci < 0) return;
      }
      for (let r = 1; r < v.length; r++) {
        const row = pad_(v[r], w);
        if (code ? up_(row[h.ci]) === code : nonEmpty_(row)) h.rows.push(row);
      }
      if (h.last > 0) cachePut_(p.key, h, DELTA_TTL);
      out[p.i] = h.rows;
      return;
    }
    const rows = [head].concat(v.slice(1).map(r => pad_(r, w)).filter(nonEmpty_));
    if (p.kind === 'content') cachePut_(p.base, rows);
    out[p.i] = rows;
  });
  return out;
}
function pad_(r, w) { r = (r || []).map(x => x == null ? '' : String(x)); while (r.length < w) r.push(''); return r; }
function col_(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; } return s; }

// ===== CÁCH ĐỌC CŨ (dự phòng khi chưa bật Google Sheets API) =====
function readSheetsApp_(src, names) {
  const cfg = READ_SOURCES[src];
  if (!cfg) return { ok: false, error: 'Nguồn dữ liệu không hợp lệ.' };
  const ss = SpreadsheetApp.openById(cfg.id), out = {};
  names.map(clean_).filter(n => cfg.sheets.indexOf(n) >= 0).forEach(n => {
    const sh = ss.getSheetByName(n);
    if (!sh) return;
    const base = src + ':' + n;
    let rows = CACHEABLE[base] ? cacheGet_(base) : null;
    if (!rows && DELTA_ALL[base]) rows = deltaRows_(sh, base, '');
    if (!rows) {
      const v = sh.getDataRange().getDisplayValues();
      rows = [v[0] || []].concat(v.slice(1).filter(nonEmpty_));
      if (CACHEABLE[base]) cachePut_(base, rows);
    }
    out[n] = rows;
  });
  return { ok: true, sheets: out, at: Date.now() };
}

// Trang Nhiệm vụ: ?multi=quest:NhiemVu;quest:TienDoForm!;students:TacPhamWeb!&code=TEST001
// Dấu ! = chỉ trả về các dòng của học viên trong &code= (lọc sẵn ở máy chủ).
function readMultiApp_(spec, code) {
  code = up_(code);
  const out = {}, books = {}, raw = {}, ms = {}, start = Date.now();
  String(spec || '').split(';').map(clean_).filter(Boolean).slice(0, 30).forEach(item => {
    const t0 = Date.now();
    const m = item.match(/^([a-z]+):(.+?)(!?)$/);
    if (!m) return;
    const src = m[1], name = m[2], filtered = m[3] === '!', cfg = READ_SOURCES[src];
    if (!cfg || cfg.sheets.indexOf(name) < 0 || (filtered && !code)) return;
    const base = src + ':' + name;
    let rows = raw[base] || (CACHEABLE[base] ? cacheGet_(base) : null), mine = null;
    if (!rows) {
      const ss = books[src] || (books[src] = SpreadsheetApp.openById(cfg.id));
      const sh = ss.getSheetByName(name);
      if (!sh) return;
      if (filtered || DELTA_ALL[base]) {
        mine = deltaRows_(sh, base, filtered ? code : '');
        if (!mine) return;
      } else {
        const all = sh.getDataRange().getDisplayValues();
        rows = [all[0] || []].concat(all.slice(1).filter(nonEmpty_));
        if (CACHEABLE[base]) cachePut_(base, rows);
      }
    }
    if (mine) rows = mine;
    else raw[base] = rows;
    if (filtered && !mine) {
      const h = rows[0].map(x => clean_(x).normalize('NFC').toLowerCase());
      const ci = h.findIndex(x => CODE_HEADERS.indexOf(x) >= 0);
      if (ci < 0) return;
      rows = [rows[0]].concat(rows.slice(1).filter(r => up_(r[ci]) === code));
    }
    out[item] = rows;
    ms[item] = Date.now() - t0;
    ms._total = Date.now() - start;
    out._ms = ms; // thời gian xử lý (ms) để đo tốc độ
  });
  return { ok: true, sheets: out, at: Date.now() };
}

// Đọc tăng dần: lần đầu đọc cả sheet (lọc theo mã nếu có), lưu lại số dòng cuối.
// Lần sau: nếu sheet chỉ dài thêm thì chỉ đọc phần dòng mới -> nhanh hơn nhiều.
function deltaRows_(sh, base, code) {
  const c = CacheService.getScriptCache(), gen = c.get('delta#gen') || '0';
  const key = 'd' + gen + ':' + base + ':' + code;
  const last = sh.getLastRow(), width = sh.getLastColumn(), now = Date.now();
  const keep = r => code ? up_(r[hit.ci]) === code : nonEmpty_(r);
  let hit = cacheGet_(key);
  if (hit && hit.rows && hit.w === width && hit.last <= last && now - hit.t < DELTA_TTL * 1000) {
    if (hit.last < last) {
      sh.getRange(hit.last + 1, 1, last - hit.last, width).getDisplayValues().forEach(r => { if (keep(r)) hit.rows.push(r); });
      hit.last = last;
      cachePut_(key, hit, DELTA_TTL);
    }
    return hit.rows;
  }
  if (last < 1 || width < 1) return null;
  const v = sh.getRange(1, 1, last, width).getDisplayValues();
  hit = { t: now, last: last, w: width, ci: -1, rows: [v[0]] };
  if (code) {
    const h = v[0].map(x => clean_(x).normalize('NFC').toLowerCase());
    hit.ci = h.findIndex(x => CODE_HEADERS.indexOf(x) >= 0);
    if (hit.ci < 0) return null;
  }
  for (let i = 1; i < v.length; i++) if (keep(v[i])) hit.rows.push(v[i]);
  cachePut_(key, hit, DELTA_TTL);
  return hit.rows;
}

// Bộ nhớ đệm chia nhỏ (mỗi khóa CacheService tối đa 100KB)
function cacheGet_(key) {
  try {
    const c = CacheService.getScriptCache(), n = Number(c.get(key + '#n'));
    if (!n) return null;
    const keys = [];
    for (let i = 0; i < n; i++) keys.push(key + '#' + i);
    const parts = c.getAll(keys);
    let s = '';
    for (let i = 0; i < n; i++) { const part = parts[key + '#' + i]; if (part == null) return null; s += part; }
    return JSON.parse(s);
  } catch (x) { return null; }
}
function cachePut_(key, rows, ttl) {
  try {
    const s = JSON.stringify(rows), size = 25000, n = Math.ceil(s.length / size), o = {};
    if (n > 60) return;
    for (let i = 0; i < n; i++) o[key + '#' + i] = s.slice(i * size, (i + 1) * size);
    o[key + '#n'] = String(n);
    CacheService.getScriptCache().putAll(o, ttl || CONTENT_TTL);
  } catch (x) {}
}
// Đo tốc độ: mở từng file Sheet và đọc từng tab, trả về số mili-giây (ms) / số dòng x số cột.
function diag_() {
  const out = { version: GS_VERSION }, all = Date.now();
  Object.keys(READ_SOURCES).forEach(src => {
    let t0 = Date.now();
    const ss = SpreadsheetApp.openById(READ_SOURCES[src].id);
    out[src + ' (mở file)'] = (Date.now() - t0) + 'ms';
    READ_SOURCES[src].sheets.forEach(n => {
      const sh = ss.getSheetByName(n);
      if (!sh) { out[src + ':' + n] = 'không có tab'; return; }
      t0 = Date.now();
      const v = sh.getDataRange().getDisplayValues();
      out[src + ':' + n] = (Date.now() - t0) + 'ms / ' + v.length + ' dòng x ' + (v[0] || []).length + ' cột';
    });
  });
  out._total = (Date.now() - all) + 'ms';
  // So sánh: đọc MỌI tab của mỗi file trong 1 lần gọi Sheets API (cách mới v9)
  out.sheetsApi = typeof Sheets !== 'undefined';
  if (out.sheetsApi) Object.keys(READ_SOURCES).forEach(src => {
    const t0 = Date.now();
    try {
      Sheets.Spreadsheets.Values.batchGet(READ_SOURCES[src].id, { ranges: READ_SOURCES[src].sheets.map(n => "'" + n + "'") });
      out['MỚI ' + src + ' (tất cả tab, 1 lần gọi)'] = (Date.now() - t0) + 'ms';
    } catch (x) { out['MỚI ' + src] = 'lỗi: ' + msg_(x); }
  });
  return out;
}

function flushCache_() {
  const c = CacheService.getScriptCache();
  c.removeAll(Object.keys(CACHEABLE).map(k => k + '#n'));
  c.put('delta#gen', String(Date.now()), 21600);
  return { ok: true, flushed: Object.keys(CACHEABLE) };
}

/* ===================== TỔNG KẾT PHÒNG ===================== */

/* ===================== GỬI FORM QUA MÁY CHỦ (v12) =====================
   Trang gửi dữ liệu lên đây -> máy chủ gửi Google Form -> chờ dòng mới xuất hiện trong Sheet
   rồi mới trả lời "đã ghi nhận". Trang không phải tự đọc lại Sheet nhiều vòng nữa.
   Chỉ nhận các Form trong danh sách dưới đây. */
const FORMS = {
  progress:    { id: '1FAIpQLSeKQ_WF7f1t-0q69my3h5t2wdNC1HNMdbQTU7-QfvWMChqoeQ', src: 'quest', tab: 'TienDoForm' },
  activity:    { id: '1FAIpQLSdfbYq-uMMWRHcvJZxcn1_X4sW3CWJNyQXRXAgawFclC-cZQw', src: 'quest', tab: 'HoatDongNhiemVu' },
  beastEvent:  { id: '1FAIpQLSd0hZS8jLNSxf9N8kJtbnwp6ijbudeZ-JWijE8dzKXfVCCR1Q', src: 'quest', tab: 'LinhThuEvent' },
  beastResult: { id: '1FAIpQLSdNswWmxLVCnW0gvOZaQAn5ibjrjhBN_sAChG5PR-75qTTcPw', src: 'quest', tab: 'LinhThuKetQua' },
  beastFinal:  { id: '1FAIpQLScFKPq-ySShsuPYsF6cUckk-iz2GlifSHARUqFEse6q0Z6oQ', src: 'quest', tab: 'LinhThuTongKet' }
};
const FORM_WAIT_MS = 12000;

function submitForm_(form, values, keys) {
  const cfg = FORMS[form];
  if (!cfg) return { ok: false, error: 'Biểu mẫu không hợp lệ.' };
  const payload = {};
  let n = 0;
  Object.keys(values || {}).forEach(k => {
    if (/^entry\.\d+$/.test(k) && n < 40) { payload[k] = String(values[k] == null ? '' : values[k]).slice(0, 5000); n++; }
  });
  if (!n) return { ok: false, error: 'Thiếu dữ liệu gửi Form.' };
  const start = Date.now(), bookId = READ_SOURCES[cfg.src].id;
  const sh = SpreadsheetApp.openById(bookId).getSheetByName(cfg.tab);
  if (!sh) return { ok: false, error: 'Không tìm thấy tab ' + cfg.tab + '.' };
  const before = sh.getLastRow(), width = Math.max(1, sh.getLastColumn());
  const res = UrlFetchApp.fetch('https://docs.google.com/forms/d/e/' + cfg.id + '/formResponse',
    { method: 'post', payload: payload, muteHttpExceptions: true, followRedirects: true });
  const code = res.getResponseCode();
  if (code >= 400) return { ok: false, error: 'Google Form từ chối dữ liệu (HTTP ' + code + ').' };
  // Chờ dòng mới có đúng các giá trị khóa (vd: mã học viên + mã nhiệm vụ)
  const want = (Array.isArray(keys) ? keys : []).map(k => clean_(payload[k])).filter(Boolean);
  const range = "'" + cfg.tab + "'!A" + (before + 1) + ':' + col_(width);
  const end = Date.now() + FORM_WAIT_MS;
  while (Date.now() < end) {
    Utilities.sleep(500);
    let rows = [];
    try {
      if (typeof Sheets !== 'undefined') rows = Sheets.Spreadsheets.Values.get(bookId, range).values || [];
      else {
        const last = SpreadsheetApp.openById(bookId).getSheetByName(cfg.tab).getLastRow();
        if (last > before) rows = sh.getRange(before + 1, 1, last - before, width).getDisplayValues();
      }
    } catch (x) { rows = []; }
    if (rows.some(r => want.every(w => (r || []).some(c => clean_(c) === w)))) {
      return { ok: true, confirmed: true, ms: Date.now() - start };
    }
  }
  return { ok: true, confirmed: false, ms: Date.now() - start };
}

function doPost(e) {

  let body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (x) { return json({ ok: false, error: 'Dữ liệu gửi lên không đúng định dạng.' }); }

  if (body.action === 'form') {
    try { return json(submitForm_(clean_(body.form), body.values, body.keys)); }
    catch (err) { return json({ ok: false, error: msg_(err) }); }
  }
  if (['finalize', 'questReward', 'beastReward'].indexOf(body.action) < 0) return json({ ok: false, error: 'Thao tác không hợp lệ.' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return json({ ok: false, error: 'Hệ thống đang tổng kết một phòng khác. Hãy thử lại sau vài giây.' });
  try {
    if (body.action === 'questReward') return json(questReward_(body.code, body.questId));
    if (body.action === 'beastReward') return json(beastReward_(body.assistant, body.eventId, body.items));
    return json(finalizeRoom_(clean_(body.room), up_(body.leader)));
  } catch (err) {
    return json({ ok: false, error: msg_(err) });
  } finally {
    lock.releaseLock();
  }
}

function finalizeRoom_(roomId, leader) {
  if (!roomId || !leader) throw Error('Thiếu mã phòng hoặc mã trưởng phòng.');

  // 1. Phòng phải tồn tại và người gọi phải là người tạo phòng
  const roomSheet = sheet_('HoatDongPhong');
  const roomRows = roomSheet.getDataRange().getValues().slice(1).filter(nonEmpty_)
    .filter(r => clean_(r[2]) === roomId && up_(r[7] || 'LIVE') === 'LIVE');
  const create = roomRows.find(r => up_(r[5]) === 'CREATE');
  if (!create) throw Error('Không tìm thấy phòng ' + roomId + '.');
  if (up_(create[4]) !== leader) throw Error('Chỉ trưởng phòng được tổng kết và phát thưởng.');
  const roomCode = clean_(create[3]);

  // 2. Đã đóng rồi -> trả lại kết quả cũ, không phát lại
  const ledger = ledger_();
  if (roomRows.some(r => up_(r[5]) === 'CLOSE')) {
    const done = ledger.getDataRange().getValues().slice(1).filter(r => clean_(r[1]) === roomId);
    return {
      ok: true, already: true,
      eligible: done.map(r => up_(r[4])),
      total: done.reduce((s, r) => s + (Number(r[5]) || 0), 0),
      qty: done.length ? Number(done[0][6]) || 0 : 0
    };
  }

  // 3. Tính điểm từ chính Sheet (không tin điểm do trình duyệt gửi)
  const results = scoreRoom_(roomId);
  const lead = results.get(leader);
  if (!lead || !lead.done) throw Error('Sheet chưa có dòng FINISH của trưởng phòng. Hãy chờ vài giây rồi thử lại.');

  // 4. Danh sách hợp lệ: đã FINISH, điểm > 0, và Sheet MinhHongGiaoDich có giao dịch trừ vé của đúng phòng này
  const sales = ticketSales_();
  if (!sales.has(ticketSaleId_(roomId, leader))) throw Error('Sheet chưa xác nhận giao dịch vé của trưởng phòng. Hãy chờ vài giây rồi thử lại.');
  const eligible = Array.from(results.values())
    .filter(a => a.done && a.score > 0 && sales.has(ticketSaleId_(roomId, a.code)))
    .map(a => a.code);
  if (!eligible.length) throw Error('Chưa có học viên đủ điều kiện nhận thưởng.');

  const total = eligible.reduce((s, c) => s + results.get(c).score, 0);
  const n = eligible.length;
  const qty = Math.min(5 * n, Math.floor(total / 2));
  const created = create[0] instanceof Date ? create[0] : new Date();
  const label = qty ? 'Mốc ' + qty + ' Hoàng Ngọc - ' + n + ' người' : 'Chưa đạt thưởng';

  // 5. Gửi thưởng – mỗi marker chỉ gửi đúng 1 lần (ghi sổ TongKetPhong)
  const sent = new Set(ledger.getDataRange().getValues().slice(1).map(r => clean_(r[7])));
  const giftReasons = giftReasons_(); // chặn cả thưởng đã gửi bằng code cũ (Form trực tiếp từ trình duyệt)
  const students = studentMap_();
  if (qty > 0) {
    eligible.forEach(code => {
      const marker = ['PLC', created.toISOString().slice(0, 10), roomId, label, code].join('|');
      if (sent.has(marker) || giftReasons.some(t => t.indexOf(marker) >= 0)) return;
      const st = students.get(code) || {};
      const payload = {
        'entry.1737038806': 'Cá nhân',
        'entry.583300350': code,
        'entry.1930196666': st.team || '',
        'entry.1043199349': st.course || '',
        'entry.1978772868': 'Linh thạch',
        'entry.1706258741': 'Hoàng Ngọc',
        'entry.606656855': String(qty),
        'entry.360182186': 'Phòng Luyện Công · ' + marker,
        'entry.1383532227': 'Phòng Luyện Công',
        'entry.1295235585': 'Đang hiệu lực'
      };
      const res = UrlFetchApp.fetch(REWARD_FORM, { method: 'post', payload: payload, muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() >= 400) throw Error('Gửi thưởng cho ' + code + ' thất bại (HTTP ' + res.getResponseCode() + '). Hãy bấm tổng kết lại; người đã nhận sẽ không bị gửi trùng.');
      ledger.appendRow([new Date(), roomId, roomCode, leader, code, results.get(code).score, qty, marker, 'DA_GUI']);
      sent.add(marker);
    });
  }

  // 6. Ghi CLOSE trực tiếp vào HoatDongPhong
  const meta = Utilities.base64EncodeWebSafe(JSON.stringify({ v: 4, at: Date.now(), total: total, rewarded: eligible, by: 'apps-script' })).replace(/=+$/, '');
  roomSheet.appendRow([new Date(), 'EVT_PLC_srv_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12) + '~' + meta,
    roomId, roomCode, leader, 'CLOSE', eligible.join(','), 'LIVE']);

  return { ok: true, already: false, eligible: eligible, total: total, qty: qty };
}

/* ===================== THƯỞNG NHIỆM VỤ & LINH THÚ ===================== */

// Thưởng nhiệm vụ: số lượng và loại thưởng luôn lấy từ tab NhiemVu, không tin trình duyệt
function questReward_(code, questId) {
  code = up_(code); questId = clean_(questId);
  if (!code) throw Error('Thiếu mã học viên.');
  if (!/^[A-Za-z0-9_\-]+(@[A-Za-z0-9_\-]+)?$/.test(questId)) throw Error('Mã nhiệm vụ không hợp lệ.');
  const base = questId.split('@')[0].toUpperCase();
  const qss = SpreadsheetApp.openById(QUEST_SS_ID);

  const nv = qss.getSheetByName('NhiemVu').getDataRange().getDisplayValues(), h = nv[0] || [];
  const qi = findCol_(h, ['QuestID']), ti = findCol_(h, ['LoaiThuong']), ai = findCol_(h, ['SoLuongThuong']), si = findCol_(h, ['TrangThai']);
  const row = nv.slice(1).find(r => clean_(r[qi]).toUpperCase() === base);
  if (!row) throw Error('Không tìm thấy nhiệm vụ ' + base + '.');
  if (si >= 0 && nm_(row[si]) !== 'active') throw Error('Nhiệm vụ ' + base + ' đang tạm dừng.');
  const gem = GEM_NAMES[clean_(row[ti]).toUpperCase()], qty = Number(row[ai]) || 0;
  if (!gem || qty <= 0) throw Error('Nhiệm vụ ' + base + ' chưa có phần thưởng hợp lệ.');

  const td = qss.getSheetByName('TienDoForm').getDataRange().getDisplayValues(), h2 = td[0] || [];
  const ci = findCol_(h2, ['StudentCode', 'Mã học viên']), qc = findCol_(h2, ['QuestID']), sc = findCol_(h2, ['Status']);
  const done = td.slice(1).some(r => up_(r[ci]) === code && clean_(r[qc]).toUpperCase() === questId.toUpperCase() && clean_(r[sc]).toUpperCase() === 'COMPLETED');
  if (!done) throw Error('TienDoForm chưa ghi nhận ' + code + ' hoàn thành ' + questId + '. Hãy chờ vài giây rồi bấm lại.');

  const reason = 'QUEST:' + questId, key = code + '|' + reason.toUpperCase();
  if (rewardIndex_().has(key) || wasSent_(key)) return { ok: true, already: true, gem: gem, qty: qty };
  sendGift_(code, gem, qty, reason, 'Minh Hồng', studentMap_().get(code) || {});
  markSent_(key);
  return { ok: true, sent: true, gem: gem, qty: qty };
}

// Thưởng Linh Thú: kiểm tra Trợ giảng, bài hoàn thành và rank/thưởng từ LinhThuTongKet
function beastReward_(assistant, eventId, items) {
  assistant = up_(assistant); eventId = clean_(eventId);
  if (!/^[A-Za-z0-9_\-]+$/.test(eventId)) throw Error('Mã sự kiện Linh Thú không hợp lệ.');
  const EID = eventId.toUpperCase(), qss = SpreadsheetApp.openById(QUEST_SS_ID);

  const tgRows = qss.getSheetByName('TroGiang').getDataRange().getDisplayValues();
  const tci = findCol_(tgRows[0] || [], ['Mã học viên']);
  if (!tgRows.slice(1).some(r => up_(r[tci]) === assistant)) throw Error('Chỉ Trợ giảng mới có quyền phát thưởng Linh Thú.');

  const kq = qss.getSheetByName('LinhThuKetQua').getDataRange().getDisplayValues(), kh = kq[0] || [];
  const k = {
    eid: findCol_(kh, ['EventID']), code: findCol_(kh, ['Mã học viên']), team: findCol_(kh, ['Tổ chiến đấu']),
    asst: findCol_(kh, ['Là trợ giảng']), total: findCol_(kh, ['Tổng số câu']), st: findCol_(kh, ['Trạng thái'])
  };
  const results = new Map();
  kq.slice(1).forEach(r => {
    if (clean_(r[k.eid]).toUpperCase() !== EID || clean_(r[k.st]).toUpperCase() !== 'COMPLETED' || Number(r[k.total]) !== BEAST_QUESTIONS) return;
    const code = up_(r[k.code]), team = teamNo_(r[k.team]);
    if (code && team && !results.has(code)) results.set(code, { team: team, assistant: up_(r[k.asst]) === 'TRUE' });
  });

  const tk = qss.getSheetByName('LinhThuTongKet').getDataRange().getDisplayValues(), th = tk[0] || [];
  const f = {
    eid: findCol_(th, ['EventID']), team: findCol_(th, ['Tổ']), rank: findCol_(th, ['Rank']),
    reward: findCol_(th, ['Thưởng mỗi người']), st: findCol_(th, ['Trạng thái'])
  };
  const finals = new Map();
  tk.slice(1).forEach(r => {
    if (clean_(r[f.eid]).toUpperCase() !== EID || ['FINAL', 'COMPLETED'].indexOf(clean_(r[f.st]).toUpperCase()) < 0) return;
    const team = teamNo_(r[f.team]);
    if (team) finals.set(team, { rank: Number(r[f.rank]) || 0, reward: Number(r[f.reward]) || 0 }); // dòng sau cùng là bản mới nhất
  });
  if (!finals.size) throw Error('LinhThuTongKet chưa có tổng kết chính thức cho ' + eventId + '.');

  const index = rewardIndex_(), students = studentMap_(), out = [];
  (Array.isArray(items) ? items : []).slice(0, 100).forEach(it => {
    const code = up_(it && it.code), r = results.get(code);
    if (!code) return;
    if (!r) { out.push({ code: code, status: 'error', msg: 'Không có bài Linh Thú hoàn thành.' }); return; }
    const fin = finals.get(r.team);
    if (!fin || fin.rank <= 0) { out.push({ code: code, status: 'error', msg: 'Tổ ' + r.team + ' chưa có rank.' }); return; }
    const qty = fin.reward * (r.assistant ? BEAST_ASSISTANT_MULTIPLIER : 1);
    if (qty <= 0) { out.push({ code: code, rank: fin.rank, status: 'skip', msg: 'Rank này không có thưởng.' }); return; }
    const reason = 'BEAST:' + EID + ':RANK' + fin.rank, key = code + '|' + reason;
    if (index.has(key) || wasSent_(key)) { out.push({ code: code, rank: fin.rank, qty: qty, status: 'already' }); return; }
    const st = students.get(code);
    if (!st || !st.team || !st.course) { out.push({ code: code, rank: fin.rank, status: 'error', msg: 'HocVien thiếu Tổ/Khóa.' }); return; }
    try {
      sendGift_(code, GEM_NAMES.HOANG_NGOC, qty, reason, 'GVCN', st);
      markSent_(key); index.add(key);
      out.push({ code: code, rank: fin.rank, qty: qty, status: 'sent' });
    } catch (x) { out.push({ code: code, rank: fin.rank, status: 'error', msg: msg_(x) }); }
  });
  return { ok: true, results: out };
}

function sendGift_(code, gemName, qty, reason, giver, st) {
  const payload = {
    'entry.1737038806': 'Cá nhân',
    'entry.583300350': code,
    'entry.1930196666': (st && st.team) || '',
    'entry.1043199349': (st && st.course) || '',
    'entry.1978772868': 'Linh thạch',
    'entry.1706258741': gemName,
    'entry.606656855': String(qty),
    'entry.360182186': reason,
    'entry.1383532227': giver,
    'entry.1295235585': 'Đang hiệu lực'
  };
  const res = UrlFetchApp.fetch(REWARD_FORM, { method: 'post', payload: payload, muteHttpExceptions: true, followRedirects: true });
  if (res.getResponseCode() >= 400) throw Error('Gửi thưởng cho ' + code + ' thất bại (HTTP ' + res.getResponseCode() + ').');
}

// Tập "MÃ|LÝ DO" của các phần thưởng đang hiệu lực trong QuaTangGVCN
function rewardIndex_() {
  const v = SpreadsheetApp.openById(GIFT_SS_ID).getSheetByName('QuaTangGVCN').getDataRange().getDisplayValues(), h = v[0] || [];
  const ci = findCol_(h, ['Mã học viên', 'StudentCode']), ri = findCol_(h, ['Lý do tặng', 'Lý do', 'Reason']), si = findCol_(h, ['Trạng thái', 'Status']);
  const set = new Set();
  v.slice(1).forEach(r => {
    const st = si >= 0 ? nm_(r[si]) : '';
    if (st && st !== 'dang hieu luc' && st !== 'active') return;
    const c = up_(r[ci]), reason = clean_(r[ri]).replace(/&#183;/g, '·').toUpperCase();
    if (c && reason) set.add(c + '|' + reason);
  });
  return set;
}
// Ghi nhớ 6 giờ các phần thưởng vừa gửi (phòng khi Form chưa kịp ghi vào Sheet)
function wasSent_(key) { return !!CacheService.getScriptCache().get('sent:' + key); }
function markSent_(key) { CacheService.getScriptCache().put('sent:' + key, '1', 21600); }

function findCol_(h, names) {
  const a = (h || []).map(x => clean_(x).normalize('NFC').toLowerCase());
  for (const n of names) { const i = a.indexOf(n.normalize('NFC').toLowerCase()); if (i >= 0) return i; }
  return -1;
}
function nm_(v) { return Array.from(clean_(v).normalize('NFD')).filter(ch => ch.charCodeAt(0) < 768 || ch.charCodeAt(0) > 879).join('').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
function teamNo_(v) { const m = String(v || '').match(/[1-4]/); return m ? m[0] : ''; }

/* ===================== CHẤM ĐIỂM ===================== */

function scoreRoom_(roomId) {
  const answerKey = new Map();
  const bank = sheet_('NganHangAnh').getDataRange().getDisplayValues();
  const h = bank[0] || [], qi = h.indexOf('QuestionID'), ci = h.indexOf('CorrectOption');
  bank.slice(1).forEach(r => { if (r[qi]) answerKey.set(clean_(r[qi]), up_(r[ci])); });

  const rows = sheet_('LuotThiTraLoi').getDataRange().getValues().slice(1).filter(nonEmpty_)
    .filter(r => clean_(r[3]) === roomId && up_(r[11] || 'LIVE') === 'LIVE');

  // Gom theo lượt thi
  const attempts = new Map();
  rows.forEach((r, seq) => {
    const id = clean_(r[2]), code = up_(r[4]), action = up_(r[5]);
    if (!id || !code) return;
    let a = attempts.get(id);
    if (!a) { a = { id: id, code: code, answers: new Map(), done: false, reported: null, seq: seq }; attempts.set(id, a); }
    if (action === 'ANSWER') a.answers.set(Number(r[7]), { q: clean_(r[9]), opt: up_(r[10]) });
    if (action === 'FINISH' || action === 'TIMEOUT' || action === 'LEAVE') {
      a.done = true;
      const m = meta_(r[1]);
      if (Number.isFinite(Number(m.score))) a.reported = Number(m.score);
    }
  });

  // Mỗi học viên: ưu tiên lượt đã FINISH, rồi lượt mới nhất
  const best = new Map();
  attempts.forEach(a => {
    let score = 0;
    for (let i = 1; i <= 10; i++) {
      const ans = a.answers.get(i);
      if (!ans) break;
      const key = answerKey.get(ans.q);
      if (!key) { score = a.reported != null ? a.reported : score; break; }
      if (ans.opt !== key) break;
      score++;
    }
    a.score = score;
    const old = best.get(a.code);
    if (!old || (a.done && !old.done) || (a.done === old.done && a.seq >= old.seq)) best.set(a.code, a);
  });
  return best;
}

/* ===================== TIỆN ÍCH ===================== */

function studentMap_() {
  const map = new Map();
  try {
    const v = SpreadsheetApp.openById(STUDENT_SS_ID).getSheetByName('HocVien').getDataRange().getDisplayValues();
    const h = v[0].map(x => clean_(x).toLowerCase());
    const ci = h.indexOf('mã học viên'), ti = h.indexOf('tổ'), ki = Math.max(h.indexOf('khóa'), h.indexOf('khoá'));
    v.slice(1).forEach(r => { const c = up_(r[ci]); if (c) map.set(c, { team: ti >= 0 ? r[ti] : '', course: ki >= 0 ? r[ki] : '' }); });
  } catch (x) { console.warn('Không đọc được HocVien: ' + msg_(x)); }
  return map;
}

// Mã giao dịch vé: giống hệt ticketSaleId() trên trang (đã kiểm tra khớp với dữ liệu thật)
function ticketSaleId_(roomId, code) {
  code = up_(code);
  const text = 'PLC|' + ['PLC-TICKET', roomId, code].join('|') + '|' + code;
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 'PLC-' + code + '-' + (h >>> 0).toString(36).toUpperCase();
}

function ticketSales_() {
  const set = new Set();
  const v = SpreadsheetApp.openById(GIFT_SS_ID).getSheetByName('MinhHongGiaoDich').getDataRange().getDisplayValues();
  v.slice(1).forEach(r => {
    if (clean_(r[3]).toLowerCase() === TICKET_NAME.toLowerCase() && Number(r[4]) === 1) set.add(clean_(r[1]));
  });
  return set;
}

function giftReasons_() {
  const sh = SpreadsheetApp.openById(GIFT_SS_ID).getSheetByName('QuaTangGVCN');
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 9, last - 1, 1).getDisplayValues()
    .map(r => clean_(r[0]).replace(/&#183;/g, '·'))
    .filter(t => t.indexOf('PLC|') >= 0);
}

function ledger_() {
  const ss = SpreadsheetApp.openById(SS_ID);
  let sh = ss.getSheetByName(LEDGER_TAB);
  if (!sh) {
    sh = ss.insertSheet(LEDGER_TAB);
    sh.appendRow(['Thời gian', 'Mã định dạng phòng', 'Mã phòng', 'Trưởng phòng', 'Mã học viên', 'Điểm', 'Hoàng Ngọc', 'Marker', 'Trạng thái']);
  }
  return sh;
}

function meta_(eventId) {
  try {
    let p = String(eventId || '').split('~')[1] || '';
    while (p.length % 4) p += '=';
    return JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(p)).getDataAsString('UTF-8'));
  } catch (x) { return {}; }
}

// Phòng Luyện Công: ?tabs=rooms,attempts,summary -> đọc cả 3 tab trong 1 lần gọi (nhanh, chỉ đọc dòng mới)
function readPlcTabs_(list) {
  const start = Date.now(), keys = [], names = [];
  (list || []).map(clean_).forEach(k => { if (TABS[k] && keys.indexOf(k) < 0) { keys.push(k); names.push(TABS[k].name); } });
  if (!keys.length) return { ok: false, error: 'Tham số tabs không hợp lệ (rooms | attempts | summary).' };
  let rows = fastTabs_('plc', names.map(n => ({ name: n, code: '' })));
  if (!rows) {
    const ss = SpreadsheetApp.openById(SS_ID);
    rows = names.map(n => {
      const sh = ss.getSheetByName(n);
      if (!sh) return null;
      const v = sh.getDataRange().getDisplayValues();
      return [v[0] || []].concat(v.slice(1).filter(nonEmpty_));
    });
  }
  const tabs = {};
  keys.forEach((k, i) => { const r = rows[i]; if (r) tabs[k] = { tab: names[i], header: r[0] || [], rows: r.slice(1) }; });
  return { ok: true, tabs: tabs, _ms: Date.now() - start, at: Date.now() };
}

function sheet_(name) {
  const sh = SpreadsheetApp.openById(SS_ID).getSheetByName(name);
  if (!sh) throw Error('Không tìm thấy tab ' + name);
  return sh;
}
function nonEmpty_(r) { return r.some(c => String(c).trim() !== ''); }
function clean_(v) { return String(v == null ? '' : v).trim(); }
function up_(v) { return clean_(v).toUpperCase().replace(/\s+/g, ''); }
function msg_(e) { return String(e && e.message || e); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* Chạy thử trong trình soạn thảo (không phát thưởng): xem điểm phòng sáng 07/10 */
/* ===================== TỰ CẬP NHẬT TỪ GITHUB (v13) =====================
   Mở trên điện thoại:  …/exec?action=update&key=MÃ_BÍ_MẬT            (lấy bản mới nhất trên GitHub)
                        …/exec?action=update&key=MÃ_BÍ_MẬT&ref=<commit> (lấy đúng một bản)
                        …/exec?action=versions&key=MÃ_BÍ_MẬT           (xem các phiên bản đã có)
                        …/exec?action=rollback&key=MÃ_BÍ_MẬT&to=<số>    (quay về phiên bản cũ)
   Cài đặt 1 lần trên máy tính: bật "Google Apps Script API" (script.google.com/home/usersettings),
   dán appsscript.json có đủ quyền, chạy hàm setupUpdater() rồi xem mã bí mật trong Nhật ký thực thi.
   Mã bí mật nằm trong Thuộc tính tập lệnh (Script Properties), KHÔNG nằm trong code công khai trên GitHub. */
const UPDATE_SOURCE = 'https://raw.githubusercontent.com/vnthudao-source/ocd4-assets/';
const UPDATE_PATH = '/gs/Code.gs';
const DEPLOYMENT_ID = 'AKfycbwtMkodKNVrUgVWhpvhwMndPZKBrdWD4OF0XoR4i5poQsxRkEDLIkm56-MTxuOCVW9JXA';

function setupUpdater() {
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('UPDATE_KEY');
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    props.setProperty('UPDATE_KEY', key);
  }
  // Gọi thử API để Google hỏi cấp quyền ngay lúc này (trên máy tính)
  const r = scriptApi_('get', '/content');
  console.log('Mã bí mật cập nhật: ' + key);
  console.log('Link cập nhật: ' + ScriptApp.getService().getUrl() + '?action=update&key=' + key);
  console.log('Project có ' + ((r.files || []).length) + ' tệp. Updater sẵn sàng.');
  return key;
}

function checkUpdateKey_(key) {
  const real = PropertiesService.getScriptProperties().getProperty('UPDATE_KEY');
  if (!real) throw Error('Chưa cài updater: hãy chạy hàm setupUpdater() một lần trên máy tính.');
  if (!key || String(key) !== real) throw Error('Sai mã bí mật.');
}

function scriptApi_(method, path, body) {
  const url = 'https://script.googleapis.com/v1/projects/' + ScriptApp.getScriptId() + path;
  const opt = { method: method, muteHttpExceptions: true, contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } };
  if (body) opt.payload = JSON.stringify(body);
  const res = UrlFetchApp.fetch(url, opt), code = res.getResponseCode(), text = res.getContentText();
  if (code >= 300) throw Error('Apps Script API lỗi ' + code + ': ' + text.slice(0, 300));
  return text ? JSON.parse(text) : {};
}

function selfUpdate_(key, ref) {
  checkUpdateKey_(key);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) throw Error('Đang có một lượt cập nhật khác.');
  try {
    ref = String(ref || 'main').replace(/[^A-Za-z0-9._-]/g, '');
    const res = UrlFetchApp.fetch(UPDATE_SOURCE + ref + UPDATE_PATH + '?t=' + Date.now(), { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw Error('Không tải được code từ GitHub (HTTP ' + res.getResponseCode() + ').');
    const source = res.getContentText();
    // Kiểm tra an toàn: code mới phải là Gs của hệ thống và vẫn còn chức năng tự cập nhật
    if (source.length < 5000 || source.length > 400000) throw Error('Code tải về có kích thước bất thường.');
    ['function doGet(', 'function doPost(', 'function selfUpdate_(', 'const GS_VERSION'].forEach(s => {
      if (source.indexOf(s) < 0) throw Error('Code tải về thiếu "' + s + '", không cập nhật để tránh hỏng hệ thống.');
    });
    const m = source.match(/const GS_VERSION\s*=\s*(\d+)/), newVersion = m ? Number(m[1]) : 0;
    const content = scriptApi_('get', '/content');
    const files = content.files || [];
    let target = files.find(f => f.type === 'SERVER_JS' && /function doGet\(/.test(f.source || ''));
    if (!target) target = files.find(f => f.type === 'SERVER_JS' && f.name === 'Code');
    if (!target) throw Error('Không tìm thấy tệp code chính trong project.');
    if (target.source === source) return { ok: true, changed: false, version: GS_VERSION, note: 'Code trên GitHub giống bản đang chạy.' };
    target.source = source;
    scriptApi_('put', '/content', { files: files });
    const ver = scriptApi_('post', '/versions', { description: 'GS v' + newVersion + ' từ GitHub ' + ref + ' (' + new Date().toISOString() + ')' });
    scriptApi_('put', '/deployments/' + DEPLOYMENT_ID, { deploymentConfig: {
      scriptId: ScriptApp.getScriptId(), versionNumber: ver.versionNumber, manifestFileName: 'appsscript',
      description: 'GS v' + newVersion + ' (' + ref + ')' } });
    flushCache_();
    return { ok: true, changed: true, from: GS_VERSION, to: newVersion, deploymentVersion: ver.versionNumber, ref: ref,
      note: 'Đã cập nhật. Mở ?action=ping sau vài giây để kiểm tra.' };
  } finally { lock.releaseLock(); }
}

function listVersions_(key) {
  checkUpdateKey_(key);
  const v = scriptApi_('get', '/versions?pageSize=50');
  const d = scriptApi_('get', '/deployments/' + DEPLOYMENT_ID);
  return { ok: true, current: d.deploymentConfig && d.deploymentConfig.versionNumber,
    versions: (v.versions || []).map(x => ({ number: x.versionNumber, description: x.description, created: x.createTime })) };
}

function rollback_(key, to) {
  checkUpdateKey_(key);
  const n = Number(to);
  if (!(n > 0)) throw Error('Thiếu số phiên bản (to=).');
  scriptApi_('put', '/deployments/' + DEPLOYMENT_ID, { deploymentConfig: {
    scriptId: ScriptApp.getScriptId(), versionNumber: n, manifestFileName: 'appsscript', description: 'Quay về phiên bản ' + n } });
  return { ok: true, deploymentVersion: n, note: 'Đã quay về phiên bản ' + n + '.' };
}

function testScore() {
  const room = 'ROOM_LIVE_mux94u5q_72bb1f1b4186';
  const sales = ticketSales_();
  scoreRoom_(room).forEach(a => Logger.log(a.code + ': ' + a.score + ' điểm, FINISH=' + a.done + ', vé=' + sales.has(ticketSaleId_(room, a.code))));
}
