#!/usr/bin/env python3
"""Đóng gói một trang (CSS + các file JS) thành mã dán Blogspot bản đầy đủ.

Vì sao: trình soạn Blogspot có thể đổi mỗi lần xuống dòng thành thẻ <br>, chèn cả vào
giữa đoạn <script> làm code lỗi và trang dừng ở "Đang tải…". Công cụ này gộp CSS và JS
thành MỖI KHỐI MỘT DÒNG (bỏ chú thích, nối dòng), nên không còn chỗ xuống dòng nào trong code.
Lỗi khi chạy (nếu có) được hiện ngay trong khung trang.

Dùng:
  python3 tools/blogspot-pack.py <id-khung> "<tiêu đề>" <tệp-ra> '<dòng cấu hình JS>' <file.css> <file1.js> [file2.js ...]
Các file JS phải kết thúc mỗi câu lệnh bằng dấu chấm phẩy và không dùng chú thích //
(công cụ sẽ báo nếu có chỗ nối dòng nguy hiểm).
"""
import sys, re

def strip_block_comments(s):
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)

def one_line_js(src, name):
    if re.search(r'(^|[^:\\])//', strip_block_comments(src).replace('https://', '').replace('http://', '')):
        sys.exit('Có chú thích // trong ' + name + ' — đổi sang /* */ trước khi đóng gói.')
    lines = [l.strip() for l in strip_block_comments(src).split('\n') if l.strip()]
    for a, b in zip(lines, lines[1:]):
        if a[-1] not in ';{,[(:' and b[0] in '([`+-/':
            sys.exit('Nối dòng nguy hiểm trong %s: %r || %r' % (name, a[-40:], b[:40]))
    return ' '.join(lines)

def one_line_css(src):
    return ''.join(l.strip() for l in strip_block_comments(src).split('\n') if l.strip())

root_id, title, out, config = sys.argv[1:5]
css = one_line_css(open(sys.argv[5], encoding='utf-8').read())
js = ' '.join(one_line_js(open(f, encoding='utf-8').read(), f) for f in sys.argv[6:])
guard = ("(function(){var r=document.getElementById('%s');try{%s}catch(e){if(r){r.textContent='Không chạy được trang: '+(e&&e.message);}if(window.console){console.error(e);}}})();"
         % (root_id, js))
lines = [
    '<!-- %s · bản đầy đủ cho Blogspot (chế độ HTML).' % title,
    '     Cách dùng: sao chép TOÀN BỘ trang tài liệu này, dán đè vào trang Blogspot ở chế độ HTML.',
    '     Chỉ sửa phần trong dấu ngoặc kép ở dòng cấu hình. Mỗi khối CSS/JS nằm trên MỘT dòng: không tự xuống dòng bên trong. -->',
    '<div id="%s">Đang tải…</div>' % root_id,
    '<style>%s</style>' % css,
    '<script>%s</script>' % config,
    '<script>%s</script>' % guard,
]
text = '\n'.join(lines) + '\n'
open(out, 'w', encoding='utf-8').write(text)
print(out, len(text), 'ký tự')
