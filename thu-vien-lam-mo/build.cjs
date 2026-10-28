/* Đóng gói Thư viện lâm mô thành MỘT file thu-vien-lam-mo.min.js (CSS + khung HTML + JS).
   Chạy: node thu-vien-lam-mo/build.cjs   (cần esbuild; đặt ESBUILD_LIB nếu esbuild không nằm trong node_modules) */
const fs = require('fs'), path = require('path');
const esbuild = require(process.env.ESBUILD_LIB || 'esbuild');
const dir = __dirname, read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const css = esbuild.transformSync(read('thu-vien-lam-mo.css'), { loader: 'css', minify: true }).code.trim();
const html = read('thu-vien-lam-mo.html').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
const src = '(function(){var r=document.getElementById("thu-vien-lam-mo");if(!r||r.getAttribute("data-tvlm"))return;'
  + 'r.setAttribute("data-tvlm","1");var st=document.createElement("style");st.textContent=' + JSON.stringify(css)
  + ';document.head.appendChild(st);r.innerHTML=' + JSON.stringify(html) + ';\n' + read('thu-vien-lam-mo.js') + '\n})();';
/* Mô-đun dùng chung (thẻ học viên) gộp vào đầu file nén; tự bỏ qua nếu trang đã có */
const shared = fs.readFileSync(path.join(dir, '..', 'ocd-shared', 'ocd-identity.js'), 'utf8');
const out = esbuild.transformSync(shared + '\n' + src, { loader: 'js', minify: true, keepNames: true, charset: 'utf8', target: 'es2018' }).code;
fs.writeFileSync(path.join(dir, 'thu-vien-lam-mo.min.js'), out);
console.log('thu-vien-lam-mo.min.js', out.length, 'bytes');
