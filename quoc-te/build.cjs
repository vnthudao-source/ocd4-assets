#!/usr/bin/env node
/* Đóng gói trang Thư Đạo Quốc tế thành MỘT file nén quoc-te/quoc-te.min.js
   (font + CSS + dữ liệu bài học + mã trang).
   Chạy:  ESBUILD_LIB=/opt/npm-tools/node_modules/esbuild node quoc-te/build.cjs
   Sau khi commit:  node quoc-te/build.cjs --loader <mã-commit>   để ghi khối tải blogspot.html ghim commit đó. */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = __dirname;
const REPO = 'vnthudao-source/ocd4-assets';

if (process.argv[2] === '--loader') {
  const V = process.argv[3];
  if (!/^[0-9a-f]{40}$/.test(V || '')) throw new Error('Cần mã commit 40 ký tự');
  const api = process.argv[4] || '';
  const html = [
    '<!-- THƯ ĐẠO QUỐC TẾ · trang Blogspot (dán ở chế độ HTML, đè toàn bộ mã cũ).',
    '     Toàn bộ mã trang nằm trên GitHub (' + REPO + ', quoc-te/quoc-te.min.js), tải qua jsdelivr thành MỘT file nén, không chặn trang.',
    '     API: dán URL /exec của Apps Script Intl.gs giữa hai dấu nháy đơn (để trống = chế độ xem thử với dữ liệu mẫu).',
    '     Cập nhật trang: CHỈ đổi mã phiên bản trong V=\'...\' (mã commit Claude gửi). Không xuống dòng bên trong thẻ script. -->',
    '<div id="qt-app"><h1>Thư Đạo – Learn Vietnamese Calligraphy</h1><p>Hands-on calligraphy workshops in Vietnam and an online Vietnamese calligraphy course with video lessons and personal feedback from teacher Thanh Phong.</p><p lang="vi">Học thư pháp Việt: workshop trực tiếp tại Việt Nam và khoá học Online có video, giáo viên nhận xét, chấm điểm từng bài.</p><p>Loading…</p></div>',
    '<script>window.QT_CONFIG={API:\'' + api + '\'};(function(){var V=\'' + V + '\';var s=document.createElement(\'script\');s.src=\'https://cdn.jsdelivr.net/gh/' + REPO + '@\'+V+\'/quoc-te/quoc-te.min.js\';s.onerror=function(){var r=document.getElementById(\'qt-app\');if(r){r.textContent=\'Could not load the page (version \'+V+\'). Please reload.\';}};document.body.appendChild(s);})();</script>',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(DIR, 'blogspot.html'), html);
  console.log('blogspot.html -> ' + V);
  process.exit(0);
}

const esbuild = require(process.env.ESBUILD_LIB || 'esbuild');
const css = esbuild.transformSync(fs.readFileSync(path.join(DIR, 'quoc-te.css'), 'utf8'), { loader: 'css', minify: true }).code.trim();
const FONTS = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,600&display=swap';
const prelude = '(function(){var d=document;if(d.getElementById("qt-style"))return;'
  + 'var p=d.createElement("link");p.rel="preconnect";p.href="https://fonts.gstatic.com";p.crossOrigin="anonymous";d.head.appendChild(p);'
  + 'var f=d.createElement("link");f.rel="stylesheet";f.href=' + JSON.stringify(FONTS) + ';d.head.appendChild(f);'
  + 'var s=d.createElement("style");s.id="qt-style";s.textContent=' + JSON.stringify(css) + ';d.head.appendChild(s);})();\n';
const parts = ['quoc-te-data.js', 'quoc-te-path52.js', 'quoc-te.js'].map(f => fs.readFileSync(path.join(DIR, f), 'utf8'));
/* Xuất thuần ASCII (cả trong biểu thức chính quy) để không vỡ chữ nếu máy chủ trả sai bảng mã */
const out = esbuild.transformSync(prelude + parts.join('\n;\n'), { minify: true, legalComments: 'none', target: 'es2018' }).code
  .replace(/[^\x00-\x7f]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
fs.writeFileSync(path.join(DIR, 'quoc-te.min.js'), out);
console.log('quoc-te.min.js ' + Buffer.byteLength(out) + ' bytes');
