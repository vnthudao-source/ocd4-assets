/* Chạy: node quoc-te/test/test-intl.cjs [đường-dẫn-Intl.gs]  – kiểm tra Intl.gs trên Sheet giả lập */
'use strict';
const path = require('path'), assert = require('assert');
const { makeEnv } = require('./gas-mock.cjs');
const FILE = process.argv[2] || path.join(__dirname, '..', 'Intl.gs');
const users = { 'tok-a': { code: '050303', name: 'Anna Smith', email: 'anna@example.com' }, 'tok-b': { code: 'TV1201', name: 'Ben Lee', email: 'ben@example.com' } };
const E = makeEnv({ file: FILE, users });
let n = 0; function ok(name, fn) { fn(); n++; console.log('✓ ' + name); }

ok('setup tạo đủ tab, thư mục, trình kích hoạt', () => {
  assert.strictEqual(E.ctx.setup(), 'OK – Intl.gs 1.0.0');
  ['Workshops', 'Bookings', 'Packages', 'Enrollments', 'Submissions', 'Videos', 'Settings'].forEach(t => assert.ok(E.sheet(t), t));
  assert.ok(!E.sheet('Sheet1'));
  assert.strictEqual(E.triggers.length, 1);
  E.ctx.setup(); assert.strictEqual(E.triggers.length, 1, 'không tạo trùng trigger');
  assert.strictEqual(E.sheet('Packages').getLastRow(), 3);
});
ok('config: workshop HIDDEN bị ẩn, gói học hiện', () => {
  const c = E.post({ action: 'config' });
  assert.ok(c.ok); assert.strictEqual(c.workshops.length, 0); assert.strictEqual(c.packages.length, 2);
  assert.strictEqual(c.settings.bank_account, '0530113118888');
});
ok('mở workshop (Status OPEN, 3 chỗ)', () => {
  const w = E.sheet('Workshops'); w.getRange(2, 12).setValue('OPEN'); w.getRange(2, 11).setValue(3);
  const c = E.post({ action: 'config' });
  assert.strictEqual(c.workshops.length, 1); assert.strictEqual(c.workshops[0].left, 3); assert.strictEqual(c.workshops[0].status, 'OPEN');
});
ok('đặt workshop: thiếu email bị từ chối', () => {
  assert.strictEqual(E.post({ action: 'bookWorkshop', workshopId: 'WS-001', name: 'X' }).error, 'NAME_EMAIL_REQUIRED');
});
ok('đặt workshop 2 người, bank → VND, gửi 2 mail', () => {
  const m0 = E.mails.length;
  const r = E.post({ action: 'bookWorkshop', workshopId: 'WS-001', name: 'Anna', email: 'Anna@Example.com', phone: '+44 7700 900123', country: 'UK', people: 2, payment: 'bank', lang: 'en', note: '=HYPERLINK("x")' });
  assert.ok(r.ok, JSON.stringify(r)); assert.strictEqual(r.amount, 1700000); assert.strictEqual(r.currency, 'VND');
  assert.strictEqual(E.mails.length - m0, 2);
  assert.ok(/Bank transfer 1700000 VND/.test(E.mails[m0].body)); assert.strictEqual(E.mails[m0 + 1].to, 'sladargai@gmail.com');
  const row = E.sheet('Bookings').data[1];
  assert.strictEqual(row[5], 'anna@example.com'); assert.strictEqual(row[12], '=HYPERLINK("x")'); // mock bỏ dấu ' giống Sheets: ô là chữ, không phải công thức
});
ok('hết chỗ: còn 1, đặt 2 bị từ chối; đặt 1 thì workshop CLOSED', () => {
  assert.strictEqual(E.post({ action: 'bookWorkshop', workshopId: 'WS-001', name: 'B', email: 'b@x.io', people: 2 }).error, 'NOT_ENOUGH_SEATS');
  const r = E.post({ action: 'bookWorkshop', workshopId: 'WS-001', name: 'B', email: 'b@x.io', people: 1, payment: 'paypal', lang: 'vi' });
  assert.ok(r.ok); assert.strictEqual(r.amount, 35);
  assert.ok(/Giáo viên sẽ gửi link thanh toán PayPal/.test(E.mails[E.mails.length - 2].body));
  const c = E.post({ action: 'config' }); assert.strictEqual(c.workshops[0].status, 'CLOSED'); assert.strictEqual(c.workshops[0].left, 0);
  assert.strictEqual(E.post({ action: 'bookWorkshop', workshopId: 'WS-001', name: 'C', email: 'c@x.io' }).error, 'WORKSHOP_CLOSED');
});
ok('ghi danh cần đăng nhập', () => {
  assert.strictEqual(E.post({ action: 'enroll', packageId: 'INTRO' }).error, 'LOGIN_REQUIRED');
  assert.strictEqual(E.post({ action: 'enroll', token: 'bad', packageId: 'INTRO' }).error, 'LOGIN_REQUIRED');
});
ok('ghi danh INTRO (PayPal) → PENDING; lặp lại không tạo dòng mới', () => {
  const r = E.post({ action: 'enroll', token: 'tok-a', packageId: 'INTRO', payment: 'paypal' });
  assert.ok(r.ok); assert.strictEqual(r.status, 'PENDING'); assert.strictEqual(r.amount, 49);
  const r2 = E.post({ action: 'enroll', token: 'tok-a', packageId: 'INTRO', payment: 'paypal' });
  assert.ok(r2.duplicate); assert.strictEqual(E.sheet('Enrollments').getLastRow(), 2);
  assert.strictEqual(E.sheet('Enrollments').data[1][2], '050303', 'mã giữ số 0 đầu');
});
ok('nộp bài: N1 miễn phí được nộp, N2 chưa mở bị chặn', () => {
  const png = Buffer.from('89504e470d0a1a0a', 'hex').toString('base64');
  assert.strictEqual(E.post({ action: 'submit', token: 'tok-a', course: 'intro', lesson: 'N2', mime: 'image/png', data: png }).error, 'NO_ACCESS');
  const r = E.post({ action: 'submit', token: 'tok-a', course: 'intro', lesson: 'n1', mime: 'image/png', data: png, note: 'Tâm' });
  assert.ok(r.ok, JSON.stringify(r)); assert.ok(E.files[r.file].shared);
  assert.strictEqual(E.post({ action: 'submit', token: 'tok-a', course: 'intro', lesson: 'N1', mime: 'application/pdf', data: png }).error, 'IMAGE_ONLY');
});
ok('thầy duyệt ACTIVE (mã trên Sheet mất số 0) → mở intro, nộp N2 được', () => {
  const en = E.sheet('Enrollments'); en.getRange(2, 3).setValue(50303); en.getRange(2, 11).setValue('ACTIVE');
  const me = E.post({ action: 'me', token: 'tok-a' });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(me.access)), { intro: true, path52: false });
  const png = Buffer.from('ffd8ffe0', 'hex').toString('base64');
  assert.ok(E.post({ action: 'submit', token: 'tok-a', course: 'intro', lesson: 'N2', mime: 'image/jpeg', data: png }).ok);
  assert.strictEqual(E.post({ action: 'submit', token: 'tok-a', course: 'path52', lesson: 'T3', mime: 'image/jpeg', data: png }).error, 'NO_ACCESS');
  assert.strictEqual(E.post({ action: 'me', token: 'tok-a' }).submissions.length, 2);
});
ok('học viên khác không thấy bài/khoá của người khác', () => {
  const me = E.post({ action: 'me', token: 'tok-b' });
  assert.strictEqual(me.submissions.length, 0); assert.strictEqual(me.enrollments.length, 0); assert.strictEqual(me.access.intro, false);
});
ok('video: free cho mọi người, video khoá chỉ cho người đã ACTIVE', () => {
  const v = E.sheet('Videos'); v.getRange(2, 5).setValue('https://youtu.be/dQw4w9WgXcQ');
  v.appendRow(['intro', 'N2', 'Lesson 2', 'Bài 2', 'https://www.youtube.com/watch?v=abcdefghijk', 'FALSE']);
  assert.strictEqual(E.post({ action: 'config' }).freeVideos.length, 1);
  assert.strictEqual(E.post({ action: 'config' }).freeVideos[0].youtube, 'dQw4w9WgXcQ');
  assert.strictEqual(E.post({ action: 'videos', token: 'tok-b' }).videos.length, 1);
  assert.strictEqual(E.post({ action: 'videos', token: 'tok-a' }).videos.length, 2);
});
ok('thầy chấm điểm → ghi ReviewedAt, gửi mail học viên đúng ngôn ngữ; Public lên gallery', () => {
  const sb = E.sheet('Submissions'), m0 = E.mails.length;
  sb.getRange(2, 11).setValue(8); sb.getRange(2, 12).setValue('Good start');
  E.ctx.onReviewEdit({ range: sb.getRange(2, 11) });
  assert.ok(String(sb.data[1][12]).length > 0);
  assert.strictEqual(E.mails.length - m0, 1); assert.ok(/Score: 8\/10/.test(E.mails[m0].body));
  E.ctx.onReviewEdit({ range: sb.getRange(2, 11) }); assert.strictEqual(E.mails.length - m0, 1, 'không gửi lại');
  E.ctx.onReviewEdit({ range: sb.getRange(2, 12) }); assert.strictEqual(E.mails.length - m0, 1, 'sửa cột khác không gửi');
  sb.getRange(2, 14).setValue(true);
  const g = E.post({ action: 'gallery' }); assert.strictEqual(g.list.length, 1); assert.strictEqual(g.list[0].name, 'Smith');
  const me = E.post({ action: 'me', token: 'tok-a' }); assert.ok(me.submissions.some(s => s.score === '8' && s.reviewed));
});
ok('doGet: JSONP an toàn, callback lạ bị bỏ', () => {
  const r = E.get({ action: 'config', callback: 'cb_1' }); assert.ok(/^cb_1\(\{/.test(r.text)); assert.strictEqual(r.mime, 'js');
  const r2 = E.get({ action: 'config', callback: 'alert(1)//' }); assert.strictEqual(r2.mime, 'json');
});
ok('xác thực được lưu đệm (ít gọi Auth)', () => { assert.ok(E.authCalls() <= 4, 'calls ' + E.authCalls()); });
console.log('\nIntl.gs: ' + n + ' nhóm kiểm tra đạt');
