/* =========================================================
   CHẤM THI TỐT NGHIỆP – ChamThi.gs v1.2.1 (30/10/2026)
   Apps Script RIÊNG (project mới, không sửa Code.gs / Auth.gs đang chạy).

   CÁCH CÀI (làm một lần):
   1. Mở https://script.google.com -> Dự án mới, đặt tên "Chấm thi tốt nghiệp".
   2. Xoá nội dung Code.gs mặc định, dán TOÀN BỘ file này, bấm Lưu.
   3. Cài mật khẩu chấm bài: Cài đặt dự án (bánh răng) -> Thuộc tính tập lệnh
      -> Thêm thuộc tính: tên GRADER_PASSWORD, giá trị = mật khẩu GVCN tự đặt.
   4. Triển khai -> Triển khai mới -> Loại: Ứng dụng web
      - Thực thi dưới dạng: Tôi (tài khoản có quyền sửa Sheet NopBaiLuyenTap)
      - Người có quyền truy cập: Bất kỳ ai
      Bấm Triển khai, cấp quyền, chép "URL ứng dụng web" gửi lại cho Claude
      (để gắn vào trang Kết quả thi tốt nghiệp).
   Sửa file này về sau: Triển khai -> Quản lý triển khai -> sửa -> Phiên bản mới
   (giữ nguyên URL).

   v1.1.0 (29/10/2026) – thêm 2 lệnh tải ảnh, KHÔNG cần mật khẩu:
   - examUpload: Phòng thi tải ảnh câu 32 (sáng tác tại chỗ) thẳng lên Drive,
     KHÔNG đi qua trang Nộp bài -> không bị giới hạn 2 bài/ngày, không tính vào
     bài luyện tập. Chỉ nhận khi: có lượt bắt đầu thi (dòng START) đúng mã,
     bài chưa nộp, còn trong giờ thi (+10 phút), tối đa 5 ảnh/bài thi, ảnh không
     trùng bài đã nộp trước đây, tệp phải đúng là ảnh JPG/PNG/WEBP.
     Ghi sổ ở tab AnhBaiThi (tự tạo nếu chưa có).
   - cardUpload: trang Kết quả nộp thẻ thành tích vào Nộp bài tập (ghi Form
     Responses 1 + NopBaiWeb giống trang Nộp bài), không chặn bởi giới hạn ngày /
     tài khoản bảo mật; chỉ nhận khi bài đã chấm; mỗi Exam ID một thẻ.
   Nâng cấp từ v1.0.0: dán đè toàn bộ file -> Triển khai -> Quản lý triển khai
   -> sửa -> Phiên bản mới (giữ nguyên URL) -> cấp thêm quyền Google Drive.

   v1.2.0 (29/10/2026) – thêm 2 lệnh chỉ đọc, KHÔNG cần mật khẩu:
   - imageProxy: trả ảnh Drive (đã chia sẻ công khai) dạng base64 để trang Kết quả
     vẽ avatar / khung / nền hồ sơ lên thẻ thành tích (ảnh Drive không cho canvas
     đọc trực tiếp), và để trang Hồ sơ học viên tải thẻ về máy. Chỉ nhận ảnh,
     tối đa 4 ảnh/lần, mỗi ảnh tối đa 5MB, file phải đang chia sẻ "Bất kỳ ai có link".
   - certificates: danh sách thẻ thành tích / giấy chứng nhận của một mã học viên
     (đọc NopBaiWeb nguồn "the-thanh-tich" / "giay-chung-nhan") + các bài thi đã
     chấm nhưng học viên chưa mở trang Kết quả để nhận thẻ.
   Nâng cấp từ v1.1.0: dán đè toàn bộ file -> Lưu -> Triển khai -> Quản lý triển
   khai -> sửa -> Phiên bản mới (giữ nguyên URL). Không cần thêm quyền mới.

   v1.2.1 (30/10/2026) – sửa lỗi chấm lại báo "Lỗi máy chủ: Vui lòng chỉ chọn trong một
     cột duy nhất...": tab ChamThiTotNghiep là Bảng (Table), nên định dạng chữ được đặt
     từng ô thay vì cả hàng; mọi điểm ghi dạng chữ thống nhất (không lẫn số và chữ).
     Trả kèm chi tiết bản chấm (gradingData) để trang Kết quả vẽ thẻ thành tích và tự nộp
     ngay sau khi chấm, không phải chờ Google cập nhật Sheet.
     cardUpload có thêm chế độ thay thẻ (replace + mật khẩu chấm bài): GVCN chấm lại hoặc
     thẻ cũ thiếu avatar/khung/nền thì thẻ mới thay ảnh trong đúng dòng Nộp bài tập cũ.
   Nâng cấp từ v1.2.0: dán đè toàn bộ file -> Lưu -> Triển khai -> Quản lý triển khai
   -> sửa -> Phiên bản mới (giữ nguyên URL). Không cần thêm quyền mới.


   CHUẨN ĐIỂM (thang 10):
   - Điểm lý thuyết: lấy từ bài thi (BaiThiTotNghiep, trắc nghiệm chấm tự động).
   - Điểm thực hành: TRUNG BÌNH điểm các câu thực hành GVCN chấm (mỗi câu 0–10).
   - Tổng điểm = 50% lý thuyết + 50% thực hành (trang Kết quả tự tính).
========================================================= */

var CHAM_CONFIG = {
  version: "CHAM_THI_V1.2.1",
  spreadsheetId: "1GJoTRsbq0kZfZrDdh0uCC667PwS3Bgkje2fHQnwnCKs",
  examSheet: "BaiThiTotNghiep",
  gradingSheet: "ChamThiTotNghiep",
  startReason: "START",
  timeZone: "Asia/Ho_Chi_Minh",

  /* v1.1.0: tải ảnh */
  respSheet: "Form Responses 1",
  logSheet: "NopBaiWeb",
  examImageSheet: "AnhBaiThi",
  folderName: "OCD – Thi tốt nghiệp (ảnh bài thi & thẻ thành tích)",
  folderProp: "EXAM_FOLDER_ID",
  maxBytes: 8 * 1024 * 1024,
  examMinutes: 60,
  graceMinutes: 10,
  maxUploadsPerExam: 5,

  /* v1.2.0 */
  proxyMaxImages: 4,
  proxyMaxBytes: 5 * 1024 * 1024,
  certificateSources: ["the-thanh-tich", "giay-chung-nhan"]
};

var EXAM_IMAGE_HEADERS = [
  "Thời gian", "Exam ID", "Mã học viên", "Câu", "Mã băm ảnh", "File ID", "Link", "Ghi chú"
];

var GRADING_HEADERS = [
  "Dấu thời gian", "Exam ID", "Mã học viên", "Họ và tên", "Tổ", "Khoá",
  "Điểm lý thuyết", "Điểm thực hành", "Số câu đã chấm", "GradingData",
  "Người chấm", "Thời gian chấm", "Phiên bản hệ thống"
];

function doGet(e) {
  return json_({ ok: true, version: CHAM_CONFIG.version });
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return json_({ ok: false, error: "Dữ liệu gửi lên không hợp lệ." });
  }
  try {
    /* v1.1.0: lệnh tải ảnh dành cho học viên (không cần mật khẩu, có kiểm tra riêng) */
    if (body.action === "examUpload") {
      return json_(withLock_(function () { return examUpload_(body); }));
    }
    if (body.action === "cardUpload") {
      return json_(withLock_(function () { return cardUpload_(body); }));
    }
    /* v1.2.0: lệnh chỉ đọc (không cần mật khẩu, không khoá) */
    if (body.action === "imageProxy") {
      return json_(imageProxy_(body));
    }
    if (body.action === "certificates") {
      return json_(certificates_(body));
    }
    if (!checkPassword_(body.password)) {
      Utilities.sleep(800);
      return json_({ ok: false, auth: false, error: "Sai mật khẩu chấm bài." });
    }
    if (body.action === "ping") {
      return json_({ ok: true, auth: true, version: CHAM_CONFIG.version });
    }
    if (body.action === "grade") {
      return json_(saveGrade_(body));
    }
    return json_({ ok: false, error: "Lệnh không hợp lệ." });
  } catch (err) {
    return json_({ ok: false, error: "Lỗi máy chủ: " + (err && err.message ? err.message : err) });
  }
}

/* ---------------- tiện ích ---------------- */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkPassword_(password) {
  var want = PropertiesService.getScriptProperties().getProperty("GRADER_PASSWORD");
  if (!want) {
    throw new Error("Chưa cài GRADER_PASSWORD trong Thuộc tính tập lệnh.");
  }
  return String(password || "") === String(want);
}

function norm_(v) {
  return String(v == null ? "" : v).trim();
}

function headerIndex_(headers, names) {
  var low = headers.map(function (h) { return norm_(h).toLowerCase(); });
  for (var i = 0; i < names.length; i++) {
    var k = low.indexOf(names[i].toLowerCase());
    if (k >= 0) return k;
  }
  return -1;
}

function round2_(n) {
  return Math.round(Number(n) * 100) / 100;
}

/* Điểm 0–10, bước 0.25 */
function score_(v) {
  if (v === null || v === undefined || v === "") return null;
  var n = Number(String(v).replace(",", "."));
  if (!isFinite(n) || n < 0 || n > 10) return null;
  return Math.round(n * 4) / 4;
}

/* Bài thi đã nộp (không phải dòng START) theo Exam ID – lấy dòng nộp ĐẦU TIÊN */
function findExam_(ss, examId) {
  var sh = ss.getSheetByName(CHAM_CONFIG.examSheet);
  if (!sh) throw new Error("Không thấy tab " + CHAM_CONFIG.examSheet + ".");
  var values = sh.getDataRange().getDisplayValues();
  var h = values[0] || [];
  var c = {
    id: headerIndex_(h, ["Exam ID"]),
    code: headerIndex_(h, ["Mã học viên"]),
    name: headerIndex_(h, ["Họ và tên"]),
    group: headerIndex_(h, ["Tổ"]),
    course: headerIndex_(h, ["Khoá", "Khóa"]),
    reason: headerIndex_(h, ["Hình thức nộp"]),
    theory: headerIndex_(h, ["Điểm lý thuyết"]),
    practical: headerIndex_(h, ["PracticalData"])
  };
  if (c.id < 0 || c.code < 0) throw new Error("BaiThiTotNghiep thiếu cột Exam ID / Mã học viên.");
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (norm_(row[c.id]) !== examId) continue;
    if (c.reason >= 0 && norm_(row[c.reason]).toUpperCase() === CHAM_CONFIG.startReason) continue;
    var practical = [];
    try { practical = JSON.parse(c.practical >= 0 ? row[c.practical] : "[]") || []; } catch (err) { practical = []; }
    return {
      examId: examId,
      code: norm_(row[c.code]).toUpperCase(),
      name: c.name >= 0 ? norm_(row[c.name]) : "",
      group: c.group >= 0 ? norm_(row[c.group]) : "",
      course: c.course >= 0 ? norm_(row[c.course]) : "",
      theory: c.theory >= 0 ? norm_(row[c.theory]) : "",
      practical: Array.isArray(practical) ? practical : []
    };
  }
  return null;
}

/* ---------------- ghi điểm ---------------- */
function saveGrade_(body) {
  var examId = norm_(body.examId);
  if (!examId) return { ok: false, error: "Thiếu Exam ID." };
  var items = Array.isArray(body.items) ? body.items : [];
  var examiner = norm_(body.examiner) || "GVCN";

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return { ok: false, busy: true, error: "Máy chủ đang bận, vui lòng thử lại." };
  try {
    var ss = SpreadsheetApp.openById(CHAM_CONFIG.spreadsheetId);
    var exam = findExam_(ss, examId);
    if (!exam) return { ok: false, error: "Không tìm thấy bài thi " + examId + " trong BaiThiTotNghiep." };
    if (!exam.practical.length) return { ok: false, error: "Bài thi không có câu thực hành để chấm." };

    /* Chấm theo đúng các câu thực hành học viên đã chọn trong bài thi */
    var byQ = {};
    items.forEach(function (it) { if (it) byQ[String(it.q || it.questionId)] = it; });
    var details = [];
    var total = 0;
    for (var i = 0; i < exam.practical.length; i++) {
      var p = exam.practical[i] || {};
      var q = String(p.q || p.questionId || (i + 1));
      var given = byQ[q] || {};
      var s = score_(given.examScore);
      if (s === null) return { ok: false, error: "Câu " + q + ": điểm phải từ 0 đến 10." };
      total += s;
      details.push({
        questionId: Number(q) || q,
        prompt: p.prompt || "",
        note: p.note || "",
        file: p.file || "",
        submittedAt: p.submittedAt || "",
        originalScore: p.originalScore === undefined ? null : p.originalScore,
        examScore: s,
        examinerComment: norm_(given.examinerComment).slice(0, 1000)
      });
    }
    var practicalScore = round2_(total / details.length);
    var now = Utilities.formatDate(new Date(), CHAM_CONFIG.timeZone, "dd/MM/yyyy HH:mm:ss");

    var sh = ss.getSheetByName(CHAM_CONFIG.gradingSheet);
    if (!sh) {
      sh = ss.insertSheet(CHAM_CONFIG.gradingSheet);
      sh.getRange(1, 1, 1, GRADING_HEADERS.length).setValues([GRADING_HEADERS]);
    }
    var lastCol = Math.max(sh.getLastColumn(), GRADING_HEADERS.length);
    var head = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    var col = {};
    GRADING_HEADERS.forEach(function (name) { col[name] = headerIndex_(head, [name]); });
    if (col["Exam ID"] < 0) throw new Error("ChamThiTotNghiep thiếu cột Exam ID.");

    var record = {
      "Dấu thời gian": now,
      "Exam ID": examId,
      "Mã học viên": exam.code,
      "Họ và tên": exam.name,
      "Tổ": exam.group,
      "Khoá": exam.course,
      "Điểm lý thuyết": exam.theory,
      "Điểm thực hành": practicalScore,
      "Số câu đã chấm": details.length,
      "GradingData": JSON.stringify(details),
      "Người chấm": examiner,
      "Thời gian chấm": now,
      "Phiên bản hệ thống": CHAM_CONFIG.version
    };

    /* Đã chấm rồi -> ghi đè đúng dòng đó (chấm lại), chưa có -> thêm dòng mới */
    var last = sh.getLastRow();
    var target = 0;
    if (last >= 2) {
      var ids = sh.getRange(2, col["Exam ID"] + 1, last - 1, 1).getDisplayValues();
      for (var r = ids.length - 1; r >= 0; r--) {
        if (norm_(ids[r][0]) === examId) { target = r + 2; break; }
      }
    }
    var rowValues;
    if (target) {
      rowValues = sh.getRange(target, 1, 1, lastCol).getValues()[0];
      record["Dấu thời gian"] = rowValues[col["Dấu thời gian"]] || now;
    } else {
      target = last + 1;
      rowValues = [];
      for (var k = 0; k < lastCol; k++) rowValues.push("");
    }
    GRADING_HEADERS.forEach(function (name) {
      if (col[name] >= 0) rowValues[col[name]] = record[name];
    });
    /* v1.2.1: tab ChamThiTotNghiep là một Bảng (Table) của Google Sheets.
       Đặt định dạng cho nhiều cột cùng lúc trong Bảng bị báo lỗi
       "Vui lòng chỉ chọn trong một cột duy nhất..." -> đặt định dạng TỪNG Ô một. */
    for (var fc = 1; fc <= lastCol; fc++) {
      sh.getRange(target, fc).setNumberFormat("@");
    }
    sh.getRange(target, 1, 1, lastCol).setValues([rowValues.map(function (v) {
      if (v === null || v === undefined) return "";
      if (Object.prototype.toString.call(v) === "[object Date]") return Utilities.formatDate(v, CHAM_CONFIG.timeZone, "dd/MM/yyyy HH:mm:ss");
      return String(v);
    })]);
    SpreadsheetApp.flush();

    var theory = Number(String(exam.theory).replace(",", "."));
    return {
      ok: true,
      examId: examId,
      code: exam.code,
      theoryScore: isFinite(theory) ? theory : null,
      practicalScore: practicalScore,
      finalScore: isFinite(theory) ? round2_(theory * 0.5 + practicalScore * 0.5) : null,
      row: target,
      regraded: target <= last,
      gradedAt: now,
      gradingData: details
    };
  } finally {
    lock.releaseLock();
  }
}


/* =========================================================
   v1.1.0: TẢI ẢNH (bài thi câu 32, thẻ thành tích)
========================================================= */

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return { ok: false, busy: true, error: "Máy chủ đang bận, vui lòng thử lại." };
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function hex_(bytes) {
  return bytes.map(function (b) { var v = (b < 0 ? b + 256 : b).toString(16); return v.length === 1 ? "0" + v : v; }).join("");
}

function readImage_(data) {
  var m = String(data || "").match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!m) return { error: "Ảnh không hợp lệ." };
  var bytes = Utilities.base64Decode(m[2]);
  if (!bytes || !bytes.length) return { error: "Ảnh trống." };
  if (bytes.length > CHAM_CONFIG.maxBytes) return { error: "Ảnh quá lớn (tối đa 8MB)." };
  if (bytes.length < 1024 || !isImageBytes_(bytes)) return { error: "Tệp gửi lên không phải ảnh JPG/PNG/WEBP hợp lệ." };
  return {
    mime: m[1],
    bytes: bytes,
    hash: hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes)),
    ext: (m[1].split("/")[1] || "jpg").replace("jpeg", "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5)
  };
}

/* Kiểm tra chữ ký tệp: JPEG FFD8FF, PNG 89 50 4E 47, WEBP "RIFF....WEBP" */
function isImageBytes_(b) {
  var u = function (i) { return (b[i] + 256) % 256; };
  if (u(0) === 0xFF && u(1) === 0xD8 && u(2) === 0xFF) return true;
  if (u(0) === 0x89 && u(1) === 0x50 && u(2) === 0x4E && u(3) === 0x47) return true;
  if (u(0) === 0x52 && u(1) === 0x49 && u(2) === 0x46 && u(3) === 0x46 && u(8) === 0x57 && u(9) === 0x45 && u(10) === 0x42 && u(11) === 0x50) return true;
  return false;
}

function examFolder_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(CHAM_CONFIG.folderProp);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) {}
  }
  var it = DriveApp.getFoldersByName(CHAM_CONFIG.folderName);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(CHAM_CONFIG.folderName);
  props.setProperty(CHAM_CONFIG.folderProp, folder.getId());
  return folder;
}

function saveImage_(img, fname) {
  var file = examFolder_().createFile(Utilities.newBlob(img.bytes, img.mime, fname));
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
  return file;
}

function examImageLog_(ss) {
  var sh = ss.getSheetByName(CHAM_CONFIG.examImageSheet);
  if (!sh) {
    sh = ss.insertSheet(CHAM_CONFIG.examImageSheet);
    sh.getRange(1, 1, 1, EXAM_IMAGE_HEADERS.length).setValues([EXAM_IMAGE_HEADERS]);
  }
  return sh;
}

/* Ảnh đã từng nộp ở trang Nộp bài (mã băm trong NopBaiWeb, cột D) */
function practiceHash_(ss, hash) {
  var sh = ss.getSheetByName(CHAM_CONFIG.logSheet);
  if (!sh || sh.getLastRow() < 2) return null;
  var f = sh.getRange(2, 4, sh.getLastRow() - 1, 1).createTextFinder(hash).matchEntireCell(true).findNext();
  if (!f) return null;
  var r = sh.getRange(f.getRow(), 1, 1, 3).getDisplayValues()[0];
  return { time: r[0], code: norm_(r[1]).toUpperCase(), desc: norm_(r[2]) };
}

/* Các dòng của một Exam ID trong BaiThiTotNghiep */
function examRows_(ss, examId) {
  var sh = ss.getSheetByName(CHAM_CONFIG.examSheet);
  if (!sh) throw new Error("Không thấy tab " + CHAM_CONFIG.examSheet + ".");
  var v = sh.getDataRange().getDisplayValues();
  var h = v[0] || [];
  var c = { id: headerIndex_(h, ["Exam ID"]), code: headerIndex_(h, ["Mã học viên"]), reason: headerIndex_(h, ["Hình thức nộp"]) };
  var out = { start: null, done: false };
  for (var r = 1; r < v.length; r++) {
    if (norm_(v[r][c.id]) !== examId) continue;
    var isStart = c.reason >= 0 && norm_(v[r][c.reason]).toUpperCase() === CHAM_CONFIG.startReason;
    if (isStart) out.start = { code: norm_(v[r][c.code]).toUpperCase() };
    else out.done = true;
  }
  return out;
}

/* Thời điểm bắt đầu lấy từ Exam ID: OCD-EXAM-MÃ-yyyyMMddHHmmss (giờ Việt Nam) */
function examStart_(examId) {
  var m = String(examId).match(/(\d{14})$/);
  if (!m) return null;
  return Utilities.parseDate(m[1], CHAM_CONFIG.timeZone, "yyyyMMddHHmmss");
}

function examUpload_(b) {
  var examId = norm_(b.examId);
  var code = norm_(b.code).toUpperCase();
  var q = Number(b.q) || 32;
  if (!examId || !code) return { ok: false, error: "Thiếu Exam ID hoặc mã học viên." };
  if (examId.indexOf("OCD-EXAM-" + code + "-") !== 0) return { ok: false, error: "Exam ID không khớp mã học viên." };

  var ss = SpreadsheetApp.openById(CHAM_CONFIG.spreadsheetId);
  var rows = examRows_(ss, examId);
  if (!rows.start || rows.start.code !== code) return { ok: false, error: "Không tìm thấy lượt bắt đầu thi của bài này. Hãy tải lại trang phòng thi." };
  if (rows.done) return { ok: false, closed: true, error: "Bài thi đã nộp, không tải thêm ảnh được." };

  var start = examStart_(examId);
  var limitMs = (CHAM_CONFIG.examMinutes + CHAM_CONFIG.graceMinutes) * 60000;
  if (!start || new Date().getTime() - start.getTime() > limitMs) return { ok: false, closed: true, error: "Đã hết giờ làm bài, không tải thêm ảnh được." };

  var img = readImage_(b.data);
  if (img.error) return { ok: false, error: img.error };

  var log = examImageLog_(ss);
  var last = log.getLastRow();
  var used = 0;
  if (last >= 2) {
    var lv = log.getRange(2, 1, last - 1, EXAM_IMAGE_HEADERS.length).getDisplayValues();
    for (var i = 0; i < lv.length; i++) {
      if (norm_(lv[i][4]) !== img.hash) { if (norm_(lv[i][1]) === examId) used++; continue; }
      if (norm_(lv[i][1]) === examId) {
        /* cùng bài thi tải lại đúng ảnh này -> dùng lại, không lưu thêm */
        return { ok: true, reused: true, fileId: norm_(lv[i][5]), url: norm_(lv[i][6]), uploadedAt: norm_(lv[i][0]) };
      }
      return { ok: false, duplicate: true, error: "Ảnh này đã được dùng trong một bài thi khác. Hãy chụp ảnh tác phẩm vừa sáng tác." };
    }
  }
  if (used >= CHAM_CONFIG.maxUploadsPerExam) return { ok: false, error: "Mỗi bài thi chỉ tải tối đa " + CHAM_CONFIG.maxUploadsPerExam + " ảnh." };

  var old = practiceHash_(ss, img.hash);
  if (old) return { ok: false, duplicate: true, error: "Ảnh này là bài đã nộp trước đây (" + old.time + "). Câu " + q + " cần ảnh tác phẩm sáng tác tại chỗ." };

  var now = new Date();
  var fname = code + "_THI_C" + q + "_" + Utilities.formatDate(now, CHAM_CONFIG.timeZone, "yyyyMMdd_HHmmss") + "." + img.ext;
  var file = saveImage_(img, fname);
  var url = "https://drive.google.com/open?id=" + file.getId();
  var note = norm_(b.note).slice(0, 300);
  log.appendRow([now, examId, "'" + code, q, "'" + img.hash, "'" + file.getId(), url, note]);
  return {
    ok: true,
    fileId: file.getId(),
    url: url,
    uploadedAt: Utilities.formatDate(now, CHAM_CONFIG.timeZone, "dd/MM/yyyy HH:mm:ss")
  };
}

/* Thông tin học viên trong tab HocVien (giống trang Nộp bài) */
function hocVien_(ss, code) {
  var sh = ss.getSheetByName("HocVien");
  if (!sh) return null;
  var v = sh.getRange(1, 1, sh.getLastRow(), 6).getDisplayValues();
  var h = v[0].map(function (x) { return norm_(x).toLowerCase(); });
  var ci = h.indexOf("mã học viên"), ni = h.indexOf("họ và tên"), ti = h.indexOf("tổ");
  var ki = h.findIndex(function (x) { return x === "khoá" || x === "khóa"; });
  for (var i = 1; i < v.length; i++) {
    if (norm_(v[i][ci < 0 ? 0 : ci]).toUpperCase() === code) {
      return { name: norm_(v[i][ni < 0 ? 1 : ni]), team: norm_(v[i][ti < 0 ? 2 : ti]), course: norm_(v[i][ki < 0 ? 3 : ki]) };
    }
  }
  return null;
}

function respLastRow_(sh) {
  var v = sh.getRange(1, 1, sh.getMaxRows(), 1).getValues();
  for (var i = v.length - 1; i >= 0; i--) if (v[i][0] !== "" && v[i][0] !== null) return i + 1;
  return 1;
}

function cardUpload_(b) {
  var examId = norm_(b.examId);
  var code = norm_(b.code).toUpperCase();
  if (!examId || !code) return { ok: false, error: "Thiếu Exam ID hoặc mã học viên." };

  var ss = SpreadsheetApp.openById(CHAM_CONFIG.spreadsheetId);

  /* chỉ nhận khi bài đã được chấm */
  var gsh = ss.getSheetByName(CHAM_CONFIG.gradingSheet);
  var graded = false;
  if (gsh && gsh.getLastRow() >= 2) {
    var gv = gsh.getDataRange().getDisplayValues();
    var gi = headerIndex_(gv[0], ["Exam ID"]), gc = headerIndex_(gv[0], ["Mã học viên"]);
    for (var r = 1; r < gv.length; r++) {
      if (norm_(gv[r][gi]) === examId && norm_(gv[r][gc]).toUpperCase() === code) { graded = true; break; }
    }
  }
  if (!graded) return { ok: false, error: "Bài thi chưa được chấm, chưa nộp thẻ thành tích." };

  /* mỗi Exam ID một thẻ: tìm Exam ID trong mô tả bài nộp (cột G) */
  var resp = ss.getSheetByName(CHAM_CONFIG.respSheet);
  if (!resp) return { ok: false, error: "Không thấy tab " + CHAM_CONFIG.respSheet + "." };
  var lastResp = respLastRow_(resp);
  var hit = null;
  if (lastResp >= 2) {
    hit = resp.getRange(2, 7, lastResp - 1, 1).createTextFinder(examId).findNext();
  }
  /* v1.2.1: GVCN (đúng mật khẩu chấm bài) được thay thẻ đã nộp bằng thẻ vẽ lại */
  var replace = b.replace === true;
  if (replace && !checkPassword_(b.password)) {
    Utilities.sleep(800);
    return { ok: false, auth: false, error: "Sai mật khẩu chấm bài, không thay được thẻ." };
  }
  if (hit && !replace) return { ok: true, dup: true, row: hit.getRow(), time: "" };

  var img = readImage_(b.data);
  if (img.error) return { ok: false, error: img.error };

  if (hit && replace) return replaceCard_(ss, resp, hit.getRow(), examId, code, img);

  var hv = hocVien_(ss, code) || {};
  var exam = findExam_(ss, examId) || {};
  var name = hv.name || exam.name || code;
  var team = hv.team || exam.group || "";
  var course = hv.course || exam.course || "";
  var desc = norm_(b.note || ("Thẻ thành tích – " + examId)).slice(0, 300);
  if (desc.indexOf(examId) < 0) desc += " – " + examId;

  var now = new Date();
  var file = saveImage_(img, code + "_THE_THANH_TICH_" + Utilities.formatDate(now, CHAM_CONFIG.timeZone, "yyyyMMdd_HHmmss") + "." + img.ext);
  var url = "https://drive.google.com/open?id=" + file.getId();
  var rowValues = [[now, name, "'" + code, team, course, url, /^[=+@-]/.test(desc) ? "'" + desc : desc]];

  /* ghi ngay dưới dòng dữ liệu cuối của Form Responses 1 (giống trang Nộp bài);
     đọc lại để chắc không bị trang Nộp bài ghi chồng cùng lúc */
  var row = 0;
  for (var attempt = 0; attempt < 3 && !row; attempt++) {
    var target = respLastRow_(resp) + 1;
    resp.getRange(target, 1, 1, 7).setValues(rowValues);
    resp.getRange(target, 1).setNumberFormat("dd/MM/yyyy H:mm:ss");
    SpreadsheetApp.flush();
    if (norm_(resp.getRange(target, 6).getDisplayValue()) === url) row = target;
  }
  if (!row) return { ok: false, error: "Chưa ghi được vào Nộp bài tập, vui lòng thử lại." };

  var log = ss.getSheetByName(CHAM_CONFIG.logSheet);
  if (log) log.appendRow([now, "'" + code, desc, "'" + img.hash, "'" + file.getId(), row, "the-thanh-tich"]);

  return { ok: true, row: row, url: url, time: Utilities.formatDate(now, CHAM_CONFIG.timeZone, "dd/MM/yyyy HH:mm") };
}
/* v1.2.1: thay ảnh thẻ trong dòng Nộp bài tập đã có (giữ nguyên dòng, thời gian nộp) */
function replaceCard_(ss, resp, row, examId, code, img) {
  var now = new Date();
  var file = saveImage_(img, code + "_THE_THANH_TICH_" + Utilities.formatDate(now, CHAM_CONFIG.timeZone, "yyyyMMdd_HHmmss") + "." + img.ext);
  var url = "https://drive.google.com/open?id=" + file.getId();
  resp.getRange(row, 6).setValue(url);
  var log = ss.getSheetByName(CHAM_CONFIG.logSheet);
  if (log && log.getLastRow() >= 2) {
    var lv = log.getRange(2, 1, log.getLastRow() - 1, 7).getDisplayValues();
    for (var i = lv.length - 1; i >= 0; i--) {
      if (norm_(lv[i][6]) === "the-thanh-tich" && norm_(lv[i][1]).toUpperCase() === code && norm_(lv[i][2]).indexOf(examId) >= 0) {
        log.getRange(i + 2, 4, 1, 2).setValues([["'" + img.hash, "'" + file.getId()]]);
        break;
      }
    }
  }
  SpreadsheetApp.flush();
  return { ok: true, replaced: true, row: row, url: url, time: Utilities.formatDate(now, CHAM_CONFIG.timeZone, "dd/MM/yyyy HH:mm") };
}

function kiemTraDrive() {
  Logger.log("Thư mục ảnh thi: " + examFolder_().getUrl());
}


/* =========================================================
   v1.2.0: ẢNH CHO THẺ THÀNH TÍCH + DANH SÁCH GIẤY CHỨNG NHẬN
========================================================= */

/* Ảnh Drive công khai -> data URL (canvas trên trang web vẽ được) */
function imageProxy_(b) {
  var ids = Array.isArray(b.ids) ? b.ids : [b.id];
  var out = {};
  var seen = {};
  var count = 0;
  for (var i = 0; i < ids.length && count < CHAM_CONFIG.proxyMaxImages; i++) {
    var id = norm_(ids[i]);
    if (!/^[\w-]{20,100}$/.test(id) || seen[id]) continue;
    seen[id] = true;
    count++;
    try {
      var file = DriveApp.getFileById(id);
      var access = file.getSharingAccess();
      if (access !== DriveApp.Access.ANYONE && access !== DriveApp.Access.ANYONE_WITH_LINK) continue;
      var blob = file.getBlob();
      var mime = String(blob.getContentType() || "");
      if (!/^image\//i.test(mime)) continue;
      var bytes = blob.getBytes();
      if (!bytes.length || bytes.length > CHAM_CONFIG.proxyMaxBytes) continue;
      out[id] = "data:" + mime + ";base64," + Utilities.base64Encode(bytes);
    } catch (err) {}
  }
  return { ok: true, images: out };
}

/* Thẻ thành tích / giấy chứng nhận của một học viên (mới nhất trước) */
function certificates_(b) {
  var code = norm_(b.code).toUpperCase();
  if (!code) return { ok: false, error: "Thiếu mã học viên." };
  var ss = SpreadsheetApp.openById(CHAM_CONFIG.spreadsheetId);
  var items = [];
  var cardExams = {};

  var log = ss.getSheetByName(CHAM_CONFIG.logSheet);
  if (log && log.getLastRow() >= 2) {
    var lv = log.getRange(2, 1, log.getLastRow() - 1, 7).getDisplayValues();
    for (var i = 0; i < lv.length; i++) {
      var src = norm_(lv[i][6]);
      if (CHAM_CONFIG.certificateSources.indexOf(src) < 0) continue;
      if (norm_(lv[i][1]).toUpperCase() !== code) continue;
      var desc = norm_(lv[i][2]);
      var m = desc.match(/OCD-EXAM-[\w-]+/);
      var examId = m ? m[0] : "";
      if (examId) cardExams[examId] = true;
      var fileId = norm_(lv[i][4]);
      items.push({
        type: src === "giay-chung-nhan" ? "certificate" : "card",
        title: desc.replace(/\s*[–-]\s*OCD-EXAM-[\w-]+/, "").trim() || "Thẻ thành tích",
        examId: examId,
        fileId: fileId,
        url: fileId ? "https://drive.google.com/open?id=" + fileId : "",
        time: norm_(lv[i][0])
      });
    }
  }
  items.reverse();

  /* bài đã chấm nhưng chưa có thẻ (học viên chưa mở trang Kết quả) */
  var pending = [];
  var gsh = ss.getSheetByName(CHAM_CONFIG.gradingSheet);
  if (gsh && gsh.getLastRow() >= 2) {
    var gv = gsh.getDataRange().getDisplayValues();
    var gi = headerIndex_(gv[0], ["Exam ID"]), gc = headerIndex_(gv[0], ["Mã học viên"]), gt = headerIndex_(gv[0], ["Thời gian chấm"]);
    for (var r = 1; r < gv.length; r++) {
      if (norm_(gv[r][gc]).toUpperCase() !== code) continue;
      var eid = norm_(gv[r][gi]);
      if (!eid || cardExams[eid]) continue;
      cardExams[eid] = true;
      pending.push({ examId: eid, gradedAt: gt >= 0 ? norm_(gv[r][gt]) : "" });
    }
  }

  return { ok: true, code: code, items: items, pending: pending };
}
