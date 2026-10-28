# ocd-shared – mô-đun dùng chung giữa các trang Thư Đạo

- `ocd-identity.js` – thẻ học viên thống nhất: avatar, khung avatar, nền hồ sơ, hiệu ứng thuốc đa nhiệm (hàm của Reward Core). Hồ sơ đã bảo mật hiện "danh thiếp" công khai.
- `ocd-work-heart.js` – nút thả tim tác phẩm (Phòng triển lãm, Nộp bài); cùng một bài thì số tim chung; Apps Script "Thư viện lâm mô" (Exhibition.gs ≥ v1.2.0).

Mỗi file tự chèn CSS của mình, không cần thẻ link riêng. Trang dùng: thêm thẻ script trỏ tới file này, ghim mã commit, trước script của trang; `tools/build-pages.cjs` gộp vào file nén của trang.
