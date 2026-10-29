# Tủ sách Lý luận thư pháp

Trang Blogspot đọc bài giảng tiếng Việt theo từng chương của các sách lý luận thư pháp (tóm lược, bình giải; cổ văn dịch trọn).

- `ly-luan-thu-phap.css`, `.html`, `.js` – giao diện, khung, mã xử lý
- `ly-luan-thu-phap.bundle.js` – file nén duy nhất trang tải
- `data/books.json` – danh mục 7 cuốn và mục lục; `data/<id>.json` – bài giảng từng chương
- `blogspot.html` – khối tải dán vào Blogspot

Thêm chương: ghi vào `data/<id>.json` (và mục lục trong books.json), chạy `node ly-luan-thu-phap/build.cjs` (tự đánh dấu chương đã có), commit, đổi `V` trong khối tải sang mã commit mới.
