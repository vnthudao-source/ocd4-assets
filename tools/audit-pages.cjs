#!/usr/bin/env node
/* Đo hiệu năng + thân thiện người dùng của các trang Blogspot (bản đóng gói trong blogspot/dist).
   Mô phỏng điện thoại tầm trung trên mạng 3G: CPU chậm 4 lần, độ trễ 150 ms, 1,5 Mbit/s.
   Mạng ngoài (Google Sheets CSV, Apps Script, font) được giả lập – KHÔNG gọi máy chủ thật.

   Chạy: node tools/audit-pages.cjs [--runs 50] [--out file.json] [slug ...]
   Đo mỗi trang: thời điểm nội dung hiện ra, JS chặn luồng chính, số nút nhỏ hơn 44 px,
   chữ nhỏ hơn 15 px, tràn ngang, lỗi JS. */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const { chromium } = require(process.env.PLAYWRIGHT_LIB || '/opt/node22/lib/node_modules/playwright');
const ROOT = path.resolve(__dirname, '..'), BASE = path.join(ROOT, 'blogspot');
const manifest = JSON.parse(fs.readFileSync(path.join(BASE, 'manifest.json'), 'utf8'));

const args = process.argv.slice(2);
function opt(name, def) { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; }
const RUNS = Number(opt('--runs', 50));
const OUT = opt('--out', '');
const CPU = Number(opt('--cpu', 4));
const slugs = args.length ? args : manifest.map(p => p.slug);

const NET = { latency: 150, bps: 1.5e6 / 8 };   // 3G khá: 150 ms, 1,5 Mbit/s
const delayFor = bytes => NET.latency + (bytes / NET.bps) * 1000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const INIT = `(() => {
  const M = window.__audit = { mounted: 0, content: 0, longTotal: 0, longMax: 0, longCount: 0, errors: [] };
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) { M.longTotal += e.duration; M.longCount++; if (e.duration > M.longMax) M.longMax = e.duration; } }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  window.addEventListener('error', e => M.errors.push(String(e.message || e).slice(0, 120)));
  const mo = new MutationObserver(() => {
    const root = document.querySelector('.post-body');
    if (!root) return;
    if (!M.mounted && !document.querySelector('[id^="tdp-"]')) M.mounted = performance.now();
    if (!M.content && (root.innerText || '').replace(/\\s+/g, ' ').length > 200) M.content = performance.now();
    if (M.mounted && M.content) mo.disconnect();
  });
  document.addEventListener('DOMContentLoaded', () => mo.observe(document.body, { childList: true, subtree: true, characterData: true }));
})();`;

const UX_PROBE = `(() => {
  const vw = innerWidth, out = { smallTargets: [], smallText: 0, overflow: document.documentElement.scrollWidth > vw + 2, buttons: 0, inputs: 0, lowContrast: 0 };
  const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button], [onclick]')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (el.matches('button,[role=button],[onclick]')) out.buttons++; else if (el.matches('input,select,textarea')) out.inputs++;
    if (r.height < 44 || r.width < 44) out.smallTargets.push(((el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase())) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; const seen = new Set();
  while ((n = walker.nextNode())) {
    if (!n.nodeValue.trim() || !n.parentElement || seen.has(n.parentElement)) continue;
    seen.add(n.parentElement);
    if (!vis(n.parentElement)) continue;
    const fs = parseFloat(getComputedStyle(n.parentElement).fontSize);
    if (fs < 15) out.smallText++;
  }
  out.smallTargetCount = out.smallTargets.length; out.smallTargets = out.smallTargets.slice(0, 12);
  return out;
})()`;

function shellFor(slug) {
  const loader = fs.readFileSync(path.join(BASE, 'loaders', slug + '.html'), 'utf8')
    .replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/[^'"]+?\/blogspot\/dist\/[^'"]+\.min\.js/g, 'https://www.thudao.com/dist/' + slug + '.min.js')
    .replace(/'https:\/\/cdn\.jsdelivr\.net\/gh\/vnthudao-source\/ocd4-assets@'\+V\+'\/blogspot\/dist\/' + slug + '\.min\.js'/, "'https://www.thudao.com/dist/" + slug + ".min.js'");
  return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + slug + '</title>'
    + '<style>body{margin:0;font-family:Arial,sans-serif}.post-body{padding:8px}</style></head><body><div class="post-body">' + loader + '</div></body></html>';
}

async function audit(browser, slug, runs) {
  const bundle = fs.readFileSync(path.join(BASE, 'dist', slug + '.min.js'));
  const gz = zlib.gzipSync(bundle).length;
  const shell = shellFor(slug);
  const timings = [], errorsAll = new Set();
  let ux = null, requests = null;
  for (let i = 0; i < runs; i++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'vi-VN' });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    await page.addInitScript(INIT);
    const reqs = [];
    await page.route('**/*', async route => {
      const u = route.request().url();
      reqs.push(u.replace(/\?.*$/, '').slice(0, 90));
      if (u === 'https://www.thudao.com/p/' + slug + '.html') { await sleep(delayFor(shell.length)); return route.fulfill({ contentType: 'text/html; charset=utf-8', body: shell }); }
      if (u.endsWith('/dist/' + slug + '.min.js')) { await sleep(delayFor(gz)); return route.fulfill({ contentType: 'application/javascript; charset=utf-8', body: bundle }); }
      if (/docs\.google\.com\/spreadsheets/.test(u)) { await sleep(delayFor(2000) + 350); return route.fulfill({ contentType: 'text/csv', headers: { 'access-control-allow-origin': '*' }, body: 'Dấu thời gian,Mã học viên\n' }); }
      if (/script\.google\.com/.test(u)) { await sleep(delayFor(500) + 900); return route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false,"error":"offline"}' }); }
      if (/fonts\.g(oogle|static)/.test(u)) { await sleep(NET.latency); return route.fulfill({ contentType: /css/.test(u) ? 'text/css' : 'font/woff2', body: '' }); }
      if (/\.(png|jpe?g|webp|gif|svg)(\?|$)|drive\.google\.com|googleusercontent/.test(u)) { await sleep(delayFor(8000)); return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') }); }
      await sleep(delayFor(300));
      return route.fulfill({ status: 204, body: '' });
    });
    const t0 = Date.now();
    await page.goto('https://www.thudao.com/p/' + slug + '.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__audit && window.__audit.content > 0, null, { timeout: 20000 }).catch(() => {});
    await sleep(1500);
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      return Object.assign({}, window.__audit, { dcl: nav.domContentLoadedEventEnd || 0, load: nav.loadEventEnd || 0 });
    });
    timings.push(m);
    m.errors.forEach(e => errorsAll.add(e));
    if (i === 0) { await sleep(2500); ux = await page.evaluate(UX_PROBE); requests = reqs; }
    await ctx.close();
  }
  const med = k => { const a = timings.map(t => t[k]).filter(v => v > 0).sort((x, y) => x - y); return a.length ? Math.round(a[Math.floor(a.length / 2)]) : null; };
  const p95 = k => { const a = timings.map(t => t[k]).filter(v => v > 0).sort((x, y) => x - y); return a.length ? Math.round(a[Math.min(a.length - 1, Math.floor(a.length * 0.95))]) : null; };
  return {
    slug, runs, bytes: bundle.length, gzip: gz,
    mountedMed: med('mounted'), mountedP95: p95('mounted'), contentMed: med('content'), contentP95: p95('content'),
    longTotalMed: med('longTotal'), longMaxMed: med('longMax'),
    errors: [...errorsAll], ux, requests: requests ? requests.length : null, requestList: requests
  };
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const slug of slugs) {
    const r = await audit(browser, slug, RUNS);
    results.push(r);
    console.log([slug.padEnd(36), 'gz ' + (r.gzip / 1024).toFixed(0).padStart(4) + 'K',
      'dựng ' + String(r.mountedMed).padStart(5) + 'ms (p95 ' + r.mountedP95 + ')', 'nội dung ' + String(r.contentMed).padStart(5) + 'ms',
      'JS chặn ' + String(r.longTotalMed).padStart(5) + 'ms', 'nút nhỏ ' + String(r.ux.smallTargetCount).padStart(3),
      'chữ nhỏ ' + String(r.ux.smallText).padStart(3), 'tràn ' + (r.ux.overflow ? 'CÓ' : 'không'),
      'lỗi ' + r.errors.length].join(' | '));
  }
  await browser.close();
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
})();
