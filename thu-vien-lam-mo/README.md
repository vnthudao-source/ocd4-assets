# Thư viện lâm mô

Nguồn trang Blogspot "Thư viện lâm mô", tách khỏi Google Doc 1PqR4vebYT44H-JPVkB403LLF2FSk_1PzlLxGBlMqKZA (bản đang chạy ngày 29/10/2026), giữ nguyên logic.

- `thu-vien-lam-mo.css` – giao diện
- `thu-vien-lam-mo.html` – khung trang (nằm trong `<div id="thu-vien-lam-mo">`)
- `thu-vien-lam-mo.js` – toàn bộ mã xử lý
- `thu-vien-lam-mo.min.js` – file đóng gói duy nhất trang Blogspot tải (CSS + khung + JS, đã nén)
- `blogspot.html` – khối tải ngắn dán vào Blogspot

Sửa nguồn xong: `node thu-vien-lam-mo/build.cjs` (đặt `ESBUILD_LIB` nếu cần), commit, rồi đổi `V` trong khối tải sang mã commit mới.
Không dùng thuộc tính `fn.name` sau khi bỏ `keepNames` — mã đăng ký hàm toàn cục dựa vào tên hàm.
