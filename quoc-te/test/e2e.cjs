/* Chạy giả lập trình duyệt: trang Blogspot + khối tải thật + quoc-te.min.js + Intl.gs (Sheet giả lập) + Auth giả lập.
   node quoc-te/test/e2e.cjs <thư-mục-ảnh>   (cần playwright; NODE_PATH=/opt/npm-tools/node_modules) */
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright');
const { makeEnv } = require('./gas-mock.cjs');
const DIR = path.join(__dirname, '..'), OUT = process.argv[2] || '/tmp';
const AUTH = 'https://script.google.com/macros/s/AKfycbwtMkodKNVrUgVWhpvhwMndPZKBrdWD4OF0XoR4i5poQsxRkEDLIkm56-MTxuOCVW9JXA/exec';
const INTL = 'https://script.google.com/macros/s/INTLTEST/exec';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const users = {}, accounts = {};
const env = makeEnv({ file: path.join(DIR, 'Intl.gs'), users });
env.ctx.setup();
env.sheet('Workshops').getRange(2, 12).setValue('OPEN');
env.sheet('Videos').getRange(2, 5).setValue('https://youtu.be/dQw4w9WgXcQ');
env.sheet('Videos').appendRow(['intro', 'N2', 'Lesson 2 video', 'Video bài 2', 'https://youtu.be/abcdefghijk', 'FALSE']);
env.sheet('Settings').data.forEach(r => { if (r[0] === 'PAYPAL_ME') r[1] = 'thudao'; });

function authHandler(b) {
  const mk = (me) => { const tok = 'tok-' + me.code; users[tok] = me; return { ok: true, token: tok, expires: Date.now() + 864e5, me }; };
  switch (b.action) {
    case 'regStart': if (accounts[b.email]) return { ok: false, error: 'Email này đã có tài khoản.' }; accounts[b.email] = { pending: b }; return { ok: true, sentTo: b.email.replace(/^(.).*@/, '$1***@') };
    case 'regVerify': { const a = accounts[b.email]; if (!a || b.otp !== '123456') return { ok: false, error: 'Mã xác nhận chưa đúng.' };
      a.me = { code: 'TV0042', name: a.pending.name, email: b.email }; a.pw = a.pending.password; a.profile = { name: a.pending.name, email: b.email, phone: a.pending.phone, birth: '', address: a.pending.address, zalo: a.pending.zalo }; return mk(a.me); }
    case 'authLogin': { const a = Object.values(accounts).find(x => x.me && (x.me.email === b.id || x.me.code === b.id)); if (!a || a.pw !== b.password) return { ok: false, error: 'Sai mật khẩu.' }; return mk(a.me); }
    case 'authProfile': { const me = users[b.token]; if (!me) return { ok: false, expired: true }; return { ok: true, profile: accounts[me.email].profile }; }
    case 'authProfileSave': { const me = users[b.token]; const p = accounts[me.email].profile; Object.assign(p, { name: b.name, birth: b.birth, address: b.address, zalo: b.zalo }); return { ok: true, profile: p }; }
    case 'authLogout': delete users[b.token]; return { ok: true };
    case 'authMe': return users[b.token] ? { ok: true, me: users[b.token] } : { ok: false, expired: true };
    default: return { ok: false, error: 'unknown' };
  }
}
const CSV_MODELS = 'Hinh anh,Noi dung,Chu de,Nguoi viet,Tuan hoc\nhttps://drive.google.com/open?id=MODEL1234567890,Chữ Tâm,Lâm mô,Thanh Phong,5\nhttps://drive.google.com/file/d/MODEL2234567890/view,Chữ An,Lâm mô,Thanh Phong,6\n';
const CSV_WORKS = '"A","B","C","F","G","H","I"\n"1/10/2026","Nguyễn Văn Bình","940203","https://drive.google.com/open?id=WORK1234567890","Bài T5","9","Ngon"\n';

(async () => {
  const errors = [];
  const browser = await chromium.launch();
  async function newPage(api, width) {
    const ctx = await browser.newContext({ viewport: { width: width || 1280, height: 900 } });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.route('**/*', async route => {
      const req = route.request(), url = req.url();
      if (url.startsWith('https://test.blogspot.com/')) {
        const loader = fs.readFileSync(path.join(DIR, 'blogspot.html'), 'utf8').replace(/API:'[^']*'/, "API:'" + api + "'");
        return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><html><head><meta name=viewport content="width=device-width,initial-scale=1"><title>Blog</title><style>body{margin:0;font-family:serif}.post-body{padding:0 15px}</style></head><body><div class="post-body">' + loader + '</div></body></html>' });
      }
      if (url.includes('cdn.jsdelivr.net/gh/vnthudao-source/ocd4-assets@')) return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body: fs.readFileSync(path.join(DIR, 'quoc-te.min.js'), 'utf8') });
      if (url.startsWith(AUTH)) return route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(authHandler(JSON.parse(req.postData() || '{}'))) });
      if (url.startsWith(INTL)) {
        const out = req.method() === 'POST' ? env.ctx.doPost({ postData: { contents: req.postData() } }) : env.ctx.doGet({ parameter: Object.fromEntries(new URL(url).searchParams) });
        return route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: out.text });
      }
      if (url.includes('docs.google.com') && url.includes('export?format=csv')) return route.fulfill({ contentType: 'text/csv', headers: { 'access-control-allow-origin': '*' }, body: CSV_MODELS });
      if (url.includes('docs.google.com') && url.includes('gviz')) return route.fulfill({ contentType: 'text/csv', headers: { 'access-control-allow-origin': '*' }, body: CSV_WORKS });
      if (/drive\.google\.com\/thumbnail|img\.vietqr\.io|i\.ytimg\.com|googleusercontent/.test(url)) return route.fulfill({ contentType: 'image/png', body: PNG });
      if (/fonts\.(googleapis|gstatic)\.com/.test(url)) return route.fulfill({ contentType: 'text/css', body: '' });
      if (/youtube-nocookie\.com/.test(url)) return route.fulfill({ contentType: 'text/html', body: '<p>video</p>' });
      return route.abort();
    });
    return page;
  }
  const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });
  let n = 0; const step = async (name, fn) => { await fn(); n++; console.log('✓ ' + name); };
  const URL0 = 'https://test.blogspot.com/p/quoc-te.html';

  const page = await newPage(INTL);
  await step('trang chủ tiếng Anh tải được, có workshop sắp tới', async () => {
    await page.goto(URL0);
    await page.waitForSelector('.qt-hero h1');
    assert.strictEqual(await page.textContent('.qt-hero h1'), 'Learn Vietnamese calligraphy with brush and ink');
    await page.waitForSelector('#qt-home-ws .qt-ws');
    await shot(page, '01-home-en');
  });
  await step('đổi sang tiếng Việt và giữ lựa chọn khi tải lại', async () => {
    await page.click('.qt-lang');
    assert.strictEqual(await page.textContent('.qt-hero h1'), 'Học thư pháp Việt với bút lông và mực');
    await page.reload(); await page.waitForSelector('.qt-hero h1');
    assert.strictEqual(await page.textContent('.qt-hero h1'), 'Học thư pháp Việt với bút lông và mực');
    await page.click('.qt-lang');
  });
  await step('đăng ký workshop (chuyển khoản) → mã đăng ký + QR', async () => {
    await page.click('a[data-r="workshops"]');
    await page.waitForSelector('.qt-ws button');
    await page.click('.qt-ws button');
    await page.click('.qt-modal .qt-btn:not(.qt-x)');
    assert.ok(/name/i.test(await page.textContent('.qt-modal .qt-msg')));
    const f = await page.$$('.qt-modal input');
    await f[0].fill('Anna Smith'); await f[1].fill('anna@example.com'); await f[2].fill('+44 7700 900123'); await f[3].fill('United Kingdom'); await f[4].fill('2');
    await page.check('.qt-modal input[value=bank]');
    await page.click('.qt-modal .qt-actions .qt-btn');
    await page.waitForSelector('.qt-ok-t');
    assert.ok(await page.$('.qt-qr'));
    assert.ok(/WS-\d{6}-/.test(await page.textContent('.qt-modal-body')));
    await shot(page, '02-booking-done');
    await page.click('.qt-modal-body .qt-btn.ghost');
    assert.strictEqual(env.sheet('Bookings').getLastRow(), 2);
  });
  await step('khoá Online: chưa đăng nhập → bị nhắc đăng nhập', async () => {
    await page.click('a[data-r="online"]');
    await page.waitForSelector('.qt-pk .qt-btn');
    assert.strictEqual(await page.$$eval('.qt-lessons', l => l.length), 5);
    await page.click('.qt-pk .qt-btn');
    assert.ok(/sign in/i.test(await page.textContent('.qt-modal-body')));
    await page.click('.qt-modal-body a.qt-btn');
  });
  await step('tạo tài khoản + mã OTP → về khoá học', async () => {
    await page.waitForSelector('.qt-acc');
    await page.click('.qt-tab:nth-child(2)');
    const f = await page.$$('.qt-acc input');
    await f[0].fill('Anna Smith'); await f[1].fill('anna@example.com'); await f[2].fill('+44 7700 900123'); await f[3].fill('London, UK'); await f[4].fill('+447700900123');
    await f[5].fill('secret1'); await f[6].fill('secret1');
    await page.click('.qt-acc .qt-actions .qt-btn');
    await page.waitForSelector('.qt-acc input[autocomplete=one-time-code]');
    await page.fill('.qt-acc input[autocomplete=one-time-code]', '123456');
    await page.click('.qt-acc .qt-actions .qt-btn');
    await page.waitForSelector('.qt-pk');
    assert.ok(/Anna|Smith/.test(await page.textContent('.qt-acct')));
  });
  await step('ghi danh khoá Nhập môn bằng PayPal → link paypal.me, trạng thái chờ', async () => {
    await page.click('.qt-pk .qt-btn');
    await page.click('.qt-modal .qt-actions .qt-btn');
    await page.waitForSelector('.qt-ok-t');
    const href = await page.getAttribute('.qt-pay a.qt-btn', 'href');
    assert.strictEqual(href, 'https://paypal.me/thudao/49USD');
    await shot(page, '03-enrol-done');
    await page.click('.qt-modal-body .qt-btn.ghost');
    await page.waitForSelector('.qt-pk .qt-badge');
    assert.ok(/Waiting/.test(await page.textContent('.qt-pk .qt-badge')));
  });
  await step('bài N1 miễn phí: có video, nộp ảnh thành công; bài N2 bị khoá', async () => {
    await page.goto(URL0 + '#learn/intro/N1');
    await page.waitForSelector('.qt-submit input[type=file]');
    assert.ok(await page.$('.qt-yt'));
    await page.setInputFiles('.qt-submit input[type=file]', { name: 'work.png', mimeType: 'image/png', buffer: PNG });
    await page.click('.qt-submit .qt-btn');
    await page.waitForSelector('.qt-submit .qt-msg.ok');
    assert.strictEqual(env.sheet('Submissions').getLastRow(), 2);
    await page.click('.qt-pager a');
    await page.waitForSelector('.qt-locked');
  });
  await step('thầy duyệt ACTIVE → N2 mở, có video bài 2', async () => {
    env.sheet('Enrollments').getRange(2, 11).setValue('ACTIVE');
    await page.reload();
    await page.waitForSelector('.qt-submit');
    assert.ok(!(await page.$('.qt-locked')));
    await page.click('.qt-yt');
    await page.waitForSelector('.qt-yt-frame iframe');
    assert.ok((await page.getAttribute('.qt-yt-frame iframe', 'src')).includes('abcdefghijk'));
    await shot(page, '04-lesson-open');
  });
  await step('thầy chấm 8 điểm → hồ sơ hiện điểm, nhận xét; sửa hồ sơ được', async () => {
    const sb = env.sheet('Submissions'); sb.getRange(2, 11).setValue(8); sb.getRange(2, 12).setValue('Lovely round ending – keep the tip centred.');
    env.ctx.onReviewEdit({ range: sb.getRange(2, 11) });
    await page.click('.qt-acct');
    await page.waitForSelector('.qt-score');
    assert.ok(/8\/10/.test(await page.textContent('.qt-score')));
    assert.ok(/Active/.test(await page.textContent('.qt-two')));
    const city = await page.$$('.qt-two .qt-card input');
    await city[4].fill('Manchester, UK');
    await page.click('.qt-two .qt-card .qt-btn');
    await page.waitForSelector('.qt-two .qt-msg.ok');
    assert.strictEqual(accounts['anna@example.com'].profile.address, 'Manchester, UK');
    await shot(page, '05-profile');
  });
  await step('gallery: bài học viên + bài mẫu lâm mô', async () => {
    await page.click('a[data-r="gallery"]');
    await page.waitForSelector('.qt-gitem');
    assert.ok((await page.$$('.qt-gitem')).length >= 1);
    await page.click('.qt-tabs a:nth-child(2)');
    await page.waitForFunction(() => document.querySelectorAll('.qt-gitem').length === 2);
    await page.click('.qt-gitem'); await page.waitForSelector('.qt-big'); await page.keyboard.press('Escape');
  });
  await step('đăng xuất → đăng nhập lại bằng email', async () => {
    await page.click('.qt-acct'); await page.waitForSelector('.qt-profile-head');
    await page.click('text=Sign out');
    await page.waitForSelector('.qt-hero');
    await page.goto(URL0 + '#account');
    await page.fill('.qt-acc input[autocomplete=username]', 'anna@example.com');
    await page.fill('.qt-acc input[type=password]', 'secret1');
    await page.click('.qt-acc .qt-actions .qt-btn');
    await page.waitForSelector('.qt-profile-head');
  });

  const mob = await newPage(INTL, 375);
  await step('điện thoại 375px: không tràn ngang, menu mở được', async () => {
    for (const h of ['', '#workshops', '#online', '#learn/intro/N1', '#account', '#gallery']) {
      await mob.goto(URL0 + h); await mob.waitForSelector('.qt-main > *');
      await mob.waitForTimeout(150);
      const over = await mob.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(over <= 0, 'tràn ' + over + 'px ở ' + h);
    }
    await mob.goto(URL0); await mob.waitForSelector('.qt-hero');
    assert.ok(!(await mob.isVisible('.qt-nav')));
    await mob.click('.qt-menu'); assert.ok(await mob.isVisible('.qt-nav'));
    await shot(mob, '06-mobile-menu');
    await mob.click('.qt-menu');
    await mob.goto(URL0 + '#online'); await mob.waitForSelector('.qt-pk'); await shot(mob, '07-mobile-online');
  });

  const demo = await newPage('');
  await step('chế độ xem thử (chưa có API): hiện dữ liệu mẫu và ghi chú', async () => {
    await demo.goto(URL0 + '#workshops');
    await demo.waitForSelector('.qt-demo');
    assert.strictEqual((await demo.$$('.qt-ws')).length, 2);
  });

  await browser.close();
  if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
  console.log('\nTrình duyệt giả lập: ' + n + ' bước đạt, không có lỗi JavaScript');
})().catch(e => { console.error(e); process.exit(1); });
