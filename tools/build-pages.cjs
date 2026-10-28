#!/usr/bin/env node
/* Đóng gói mỗi trang trong blogspot/pages/<slug>.html thành MỘT file nén blogspot/dist/<slug>.min.js
   (CSS + khung HTML + toàn bộ script, kể cả script ngoài ghim commit trên jsdelivr).
   Trang Blogspot chỉ giữ khối tải trong blogspot/loaders/<slug>.html, tải file nén không chặn trang.

   Chạy:  node tools/build-pages.cjs [slug ...]        (không ghi slug = mọi trang trong manifest)
          ESBUILD_LIB=/đường/dẫn/esbuild nếu esbuild không nằm trong node_modules.
   Sau khi commit:  node tools/build-pages.cjs --loaders <mã-commit>   để ghi khối tải ghim commit đó. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const esbuild = require(process.env.ESBUILD_LIB || 'esbuild');
const ROOT = path.resolve(__dirname, '..'), BASE = path.join(ROOT, 'blogspot');
const REPO = 'vnthudao-source/ocd4-assets';
const manifest = JSON.parse(fs.readFileSync(path.join(BASE, 'manifest.json'), 'utf8'));

/* Bộ chạy dùng chung, nhúng vào đầu mỗi file nén. Thay chỗ giữ chỗ bằng khung gốc rồi chạy lần lượt
   từng script như script toàn cục (giữ nguyên biến/hàm toàn cục mà các nút onclick cần).
   Nếu trang đã tải xong, sự kiện DOMContentLoaded / load đăng ký trong lúc chạy vẫn được gọi. */
const RUNTIME = '(function(I,C,H,J){var d=document,w=window,r=d.getElementById(I);if(!r||r.getAttribute("data-on"))return;'
  + 'r.setAttribute("data-on","1");if(C){var st=d.createElement("style");st.textContent=C;d.head.appendChild(st);}'
  + 'r.insertAdjacentHTML("beforebegin",H);r.parentNode.removeChild(r);var late=d.readyState!=="loading";'
  + 'function fire(t,f,o){var e=new Event(t);setTimeout(function(){typeof f==="function"?f.call(o,e):f&&f.handleEvent&&f.handleEvent(e);});}'
  + 'if(late){d.addEventListener=function(t,f){if(t==="DOMContentLoaded")return fire(t,f,d);return EventTarget.prototype.addEventListener.apply(this,arguments);};'
  + 'w.addEventListener=function(t,f){if(t==="DOMContentLoaded"||(t==="load"&&d.readyState==="complete"))return fire(t,f,w);return EventTarget.prototype.addEventListener.apply(this,arguments);};}'
  + 'try{for(var i=0;i<J.length;i++){var s=d.createElement("script");s.textContent=J[i];d.body.appendChild(s);}}'
  + 'finally{if(late){delete d.addEventListener;delete w.addEventListener;}}})';

const REPO_URL = /^https:\/\/cdn\.jsdelivr\.net\/gh\/vnthudao-source\/ocd4-assets@([0-9a-f]{40}|v[0-9.]+)\/(.+)$/;
// Lấy nội dung file của repo đúng tại commit/tag mà trang gốc đang ghim.
function externalSource(url) {
  const m = url.match(REPO_URL);
  if (!m) throw new Error('Script ngoài không thuộc repo ocd4-assets ghim commit/tag: ' + url);
  const ref = /^v/.test(m[1]) ? 'refs/tags/' + m[1] : m[1];
  try { cp.execFileSync('git', ['cat-file', '-e', ref + '^{commit}'], { cwd: ROOT, stdio: 'ignore' }); }
  catch (e) { cp.execFileSync('git', ['fetch', '-q', '--depth=1', 'origin', /^v/.test(m[1]) ? ref + ':' + ref : m[1]], { cwd: ROOT }); }
  return cp.execFileSync('git', ['show', ref + ':' + m[2]], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
}

function collapse(html) {
  // Gom khoảng trắng có xuống dòng thành một dấu xuống dòng; giữ nguyên nội dung pre/textarea.
  return html.split(/(<(pre|textarea)\b[\s\S]*?<\/\2>)/i).map((part, i) => {
    if (i % 3 === 1) return part;
    if (i % 3 === 2) return '';
    return part.replace(/<!--(?!\[if)[\s\S]*?-->/g, '').replace(/[ \t]*\n\s*/g, '\n');
  }).join('').trim();
}

function build(slug) {
  let html = fs.readFileSync(path.join(BASE, 'pages', slug + '.html'), 'utf8').replace(/^﻿/, '');
  const css = [], now = [], deferred = [];
  // CSS theo đúng thứ tự trong trang: thẻ style và link tới CSS của repo được gộp; link ngoài (Google Fonts) giữ nguyên.
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>|<link\b[^>]*>/gi, (all, body) => {
    if (body !== undefined) { css.push(body); return ''; }
    const href = (all.match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    if (/rel\s*=\s*["']?stylesheet/i.test(all) && REPO_URL.test(href)) { css.push(externalSource(href)); return ''; }
    return all;
  });
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (all, attrs, body) => {
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (type && !/^(text|application)\/(javascript|ecmascript)$/i.test(type)) return all; // dữ liệu, giữ nguyên
    const src = (attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1];
    const code = src ? externalSource(src) : body;
    (src && /\bdefer\b/i.test(attrs) ? deferred : now).push(code);
    return '';
  });
  const cssMin = css.length ? esbuild.transformSync(css.join('\n'), { loader: 'css', minify: true, charset: 'utf8' }).code.trim() : '';
  const scripts = now.concat(deferred).map(code => esbuild.transformSync(code, {
    loader: 'js', minify: true, keepNames: true, charset: 'utf8', legalComments: 'none'
  }).code.trim());
  const id = 'tdp-' + slug;
  const out = '/* Thư Đạo · ' + slug + ' · nguồn: blogspot/pages/' + slug + '.html */\n'
    + RUNTIME + '(' + JSON.stringify(id) + ',' + JSON.stringify(cssMin) + ',' + JSON.stringify(collapse(html))
    + ',' + JSON.stringify(scripts) + ');\n';
  fs.mkdirSync(path.join(BASE, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(BASE, 'dist', slug + '.min.js'), out);
  return out.length;
}

function loader(page, sha) {
  const slug = page.slug, id = 'tdp-' + slug;
  const file = 'blogspot/dist/' + slug + '.min.js';
  return '<!-- ' + page.title + ' · trang Blogspot (dán ở chế độ HTML, đè toàn bộ mã cũ).\n'
    + '     Toàn bộ mã trang nằm trên GitHub (' + REPO + ', ' + file + '), tải qua jsdelivr thành MỘT file nén, không chặn trang.\n'
    + '     Cập nhật trang: CHỈ đổi mã phiên bản trong V=\'...\' (mã commit Claude gửi). Không xuống dòng bên trong thẻ script. -->\n'
    + '<div id="' + id + '"><p>' + page.title + ' – Thư Đạo.</p><p>Đang tải trang…</p></div>\n'
    + '<script>(function(){var V=\'' + sha + '\';var s=document.createElement(\'script\');s.src=\'https://cdn.jsdelivr.net/gh/'
    + REPO + '@\'+V+\'/' + file + '\';s.onerror=function(){var r=document.getElementById(\'' + id
    + '\');if(r){r.textContent=\'Không tải được trang (phiên bản \'+V+\'). Hãy tải lại trang.\';}};document.body.appendChild(s);})();</script>\n';
}

const args = process.argv.slice(2);
if (args[0] === '--loaders') {
  const sha = args[1];
  if (!/^[0-9a-f]{40}$/.test(sha || '')) { console.error('Cần mã commit đầy đủ 40 ký tự.'); process.exit(1); }
  fs.mkdirSync(path.join(BASE, 'loaders'), { recursive: true });
  for (const page of manifest) {
    if (!fs.existsSync(path.join(BASE, 'dist', page.slug + '.min.js'))) continue;
    const text = loader(page, sha);
    if (/[<&]/.test(text.match(/<script>([\s\S]*?)<\/script>/)[1])) throw new Error('Khối tải có ký tự < hoặc &: ' + page.slug);
    fs.writeFileSync(path.join(BASE, 'loaders', page.slug + '.html'), text);
    console.log('loaders/' + page.slug + '.html');
  }
} else {
  const slugs = args.length ? args : manifest.map(p => p.slug);
  for (const slug of slugs) console.log(slug.padEnd(40), build(slug), 'bytes');
}
