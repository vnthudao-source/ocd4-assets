/* Đóng gói Tủ sách Lý luận thư pháp thành MỘT file ly-luan-thu-phap.min.js (CSS + khung HTML + JS).
   Dữ liệu (data/*.json) không gộp vào file nén: trang tải theo cùng mã phiên bản với file nén.
   Chạy: node ly-luan-thu-phap/build.cjs   (đặt ESBUILD_LIB nếu esbuild không nằm trong node_modules) */
const fs = require('fs'), path = require('path');
const esbuild = require(process.env.ESBUILD_LIB || 'esbuild');
const dir = __dirname, read = f => fs.readFileSync(path.join(dir, f), 'utf8');
/* Kiểm tra dữ liệu: mỗi chương ready trong books.json phải có body trong file sách và ngược lại */
const books = JSON.parse(read('data/books.json'));
for (const b of books.books) {
  const f = path.join(dir, 'data', b.id + '.json');
  const s = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : { chapters: [] };
  const co = new Set(s.chapters.filter(c => Array.isArray(c.body) && c.body.length).map(c => c.id));
  for (const c of b.chapters) c.ready = co.has(c.id);
  for (const id of co) if (!b.chapters.some(c => c.id === id)) throw new Error(b.id + ': chương ' + id + ' có nội dung nhưng thiếu trong books.json');
}
fs.writeFileSync(path.join(dir, 'data/books.json'), JSON.stringify(books, null, 1) + '\n');
const css = esbuild.transformSync(read('ly-luan-thu-phap.css'), { loader: 'css', minify: true }).code.trim();
const html = read('ly-luan-thu-phap.html').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
const src = '(function(){var r=document.getElementById("ly-luan-thu-phap");if(!r||r.getAttribute("data-ll"))return;'
  + 'r.setAttribute("data-ll","1");var cs=document.currentScript;if(!window.LL_BASE&&cs&&cs.src)window.LL_BASE=cs.src.replace(/[^\\/]*$/,"");'
  + 'var st=document.createElement("style");st.textContent=' + JSON.stringify(css)
  + ';document.head.appendChild(st);r.innerHTML=' + JSON.stringify(html) + ';\n' + read('ly-luan-thu-phap.js') + '\n})();';
const out = esbuild.transformSync(src, { loader: 'js', minify: true, charset: 'utf8', target: 'es2018' }).code;
fs.writeFileSync(path.join(dir, 'ly-luan-thu-phap.min.js'), out);
console.log('ly-luan-thu-phap.min.js', out.length, 'bytes');
