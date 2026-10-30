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
  + 'finally{if(late){delete d.addEventListener;delete w.addEventListener;}}'
  + 'if(w.__tdpFriendly)w.__tdpFriendly(I);})';

/* ---- Lớp thân thiện dùng chung (người lớn tuổi, điện thoại): chữ/nút không quá nhỏ, bấm là thấy phản hồi,
   không có độ trễ 300 ms khi chạm, ô nhập không làm iPhone tự phóng to, ảnh không tràn màn hình. ---- */
const FRIENDLY_CSS =
  '.tdp-page{-webkit-text-size-adjust:100%;text-size-adjust:100%}'
  + '.tdp-page img,.tdp-page video,.tdp-page canvas{max-width:100%}'
  + '.tdp-page button,.tdp-page [role=button],.tdp-page a,.tdp-page input,.tdp-page select,.tdp-page textarea,.tdp-page label{touch-action:manipulation;-webkit-tap-highlight-color:rgba(176,107,44,.18)}'
  + '.tdp-page button:not([hidden]),.tdp-page [role=button],.tdp-page .nut,.tdp-page a[class*=btn],.tdp-page a[class*=button],.tdp-page a[class*=cta],.tdp-page a[class*=Cta]{min-height:44px}'
  + '.tdp-page input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=range]):not([type=file]),.tdp-page select,.tdp-page textarea{min-height:44px;font-size:max(16px,1em)}'
  + '.tdp-page input[type=checkbox],.tdp-page input[type=radio]{width:22px;height:22px;min-height:0}'
  + '.tdp-page button:active,.tdp-page [role=button]:active,.tdp-page .nut:active{transform:scale(.97);filter:brightness(.92)}'
  + '.tdp-page :is(button,a,input,select,textarea,[role=button],[tabindex]):focus-visible{outline:3px solid #b06b2c;outline-offset:2px}'
  + '@media(prefers-reduced-motion:reduce){.tdp-page *{animation-duration:.01ms!important;transition-duration:.01ms!important}}';

/* Chữ nhỏ hơn 15 px (badge, chú thích 7–10 px) nâng lên 15 px cho dễ đọc; chạy sau khi dựng trang và khi trang vẽ thêm nội dung.
   Dữ liệu CSV Google Sheets (chỉ GET) giữ 90 giây trong sessionStorage: học viên chuyển qua lại giữa các trang
   không phải tải lại cùng một bảng (XepHang, HocVien…). Trang thi (exam) không dùng bộ nhớ đệm này. */
const FRIENDLY_JS = '(function(){var d=document,w=window;'
  + 'w.__tdpFriendly=function(I){var root=d.querySelector(".tdp-page");if(!root)return;var n=0,t=0;'
  + 'function floor(){n++;if(n>40)return;try{var els=root.querySelectorAll("*"),i,el,fs;for(i=0;i<els.length;i++){el=els[i];'
  + 'if(el.__tdpF||!el.firstChild||el.firstChild.nodeType!==3||!el.firstChild.nodeValue.trim())continue;'
  + 'if(/^(SCRIPT|STYLE|SVG|CANVAS|OPTION)$/.test(el.tagName))continue;fs=parseFloat(getComputedStyle(el).fontSize);'
  + 'if(fs&&fs<15){el.style.fontSize="15px";}el.__tdpF=1;}}catch(e){}}'
  + 'floor();try{new MutationObserver(function(){clearTimeout(t);t=setTimeout(floor,600);}).observe(root,{childList:true,subtree:true});}catch(e){}};'
  + 'if(w.__tdpCsvCache||!w.fetch||!w.sessionStorage)return;w.__tdpCsvCache=1;var F=w.fetch,TTL=90000,P="tdpcsv:";'
  + 'function key(u){return P+String(u).replace(/[?&](_|cb|t|ts|nocache)=\\d+/g,"");}'
  + 'w.fetch=function(u,o){var url=typeof u==="string"?u:(u&&u.url)||"";'
  + 'if(!(o&&o.method&&o.method!=="GET")&&/^https:\\/\\/docs\\.google\\.com\\/spreadsheets\\/[^?]*(pub\\?|export\\?|gviz\\/)/.test(url)){'
  + 'var k=key(url),hit=null;try{hit=JSON.parse(sessionStorage.getItem(k)||"null");}catch(e){}'
  + 'if(hit&&Date.now()-hit.at<TTL)return Promise.resolve(new Response(hit.body,{status:200,headers:{"Content-Type":"text/csv; charset=utf-8","X-Tdp-Cache":"hit"}}));'
  + 'return F.call(w,u,o).then(function(r){if(r.ok){r.clone().text().then(function(b){if(b.length<400000){try{sessionStorage.setItem(k,JSON.stringify({at:Date.now(),body:b}));}catch(e){}}});}return r;});}'
  + 'return F.call(w,u,o);};})();';
const NO_CACHE_PAGES = ['ocd-phong-thi-tot-nghiep-graduation', 'ket-qua-thi-tot-nghiep', 'cham-thi-tot-nghiep'];

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
  // Ảnh trong khung tĩnh: tải lười + giải mã không chặn (trừ ảnh đã khai báo). Google Fonts: display=swap để chữ hiện ngay.
  html = html.replace(/<img\b(?![^>]*\bloading=)([^>]*)>/gi, '<img loading="lazy" decoding="async"$1>')
    .replace(/(fonts\.googleapis\.com\/css2?\?[^"']*?)(["'])/gi, (m, u, q) => (/display=/.test(u) ? u : u + '&display=swap') + q);
  html = '<div class="tdp-page">' + collapse(html) + '</div>';
  css.push(FRIENDLY_CSS);
  const cssMin = css.length ? esbuild.transformSync(css.join('\n'), { loader: 'css', minify: true, charset: 'utf8' }).code.trim() : '';
  /* Mỗi script chạy như script toàn cục dùng CHUNG một phạm vi. Không rút gọn tên biến (minifyIdentifiers: false):
     nếu rút gọn, hàm phụ của esbuild (__name, __defProp) bị đổi thành tên ngắn khác nhau ở từng script và ghi đè nhau
     (lỗi "Property description must be an object" ở Chợ phiên). Giữ tên đầy đủ thì các hàm phụ giống hệt nhau, ghi đè vô hại. */
  const friendly = esbuild.transformSync(NO_CACHE_PAGES.includes(slug) ? FRIENDLY_JS.replace('if(w.__tdpCsvCache||', 'if(1||') : FRIENDLY_JS,
    { loader: 'js', minifyWhitespace: true, charset: 'utf8' }).code.trim();
  const scripts = [friendly].concat(now.concat(deferred).map(code => esbuild.transformSync(code, {
    loader: 'js', minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false,
    keepNames: true, charset: 'utf8', legalComments: 'none'
  }).code.trim()));
  const id = 'tdp-' + slug;
  const out = '/* Thư Đạo · ' + slug + ' · nguồn: blogspot/pages/' + slug + '.html */\n'
    + RUNTIME + '(' + JSON.stringify(id) + ',' + JSON.stringify(cssMin) + ',' + JSON.stringify(html)
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
    + '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin><link rel="preconnect" href="https://docs.google.com"><link rel="preconnect" href="https://script.google.com">\n'
    + '<div id="' + id + '" style="font:18px/1.6 Arial,sans-serif;padding:24px 12px;text-align:center"><p style="margin:0 0 8px"><b>' + page.title + '</b> – Thư Đạo.</p><p style="margin:0;color:#765344">Đang tải trang, vui lòng đợi…</p></div>\n'
    + '<script>(function(){var V=\'' + sha + '\';var r=document.getElementById(\'' + id + '\');var s=document.createElement(\'script\');s.src=\'https://cdn.jsdelivr.net/gh/'
    + REPO + '@\'+V+\'/' + file + '\';s.fetchPriority=\'high\';s.onerror=function(){if(r){r.textContent=\'Không tải được trang (phiên bản \'+V.slice(0,7)+\'). Hãy kiểm tra mạng rồi tải lại trang.\';r.style.color=\'#8b2a1f\';}};'
    + 'setTimeout(function(){if(r){if(document.body.contains(r)){var p=r.lastElementChild;if(p)p.textContent=\'Mạng đang chậm, trang vẫn đang tải. Vui lòng đợi thêm một chút…\';}}},8000);document.body.appendChild(s);})();</script>\n';
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
