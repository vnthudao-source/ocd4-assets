# Đợt chuyển mã đầu tiên — 29/10/2026

Đã thay nội dung hai trang Blogspot bằng mã nhúng v1.0.0:
- https://www.thudao.com/p/luyen-cong.html
- https://www.thudao.com/p/giang-duong.html

Mã gốc: blogspot/pages. Bundle bất biến: blogspot/releases/v1.0.0. Mã nhúng: blogspot/embeds/v1.0.0. Công cụ phát hành: tools/release-blogspot.py.

Kiểm tra đã thực hiện:
- Ba lượt mô phỏng: tái tạo nguyên văn HTML và từ chối document.write khi tài liệu đã tải xong.
- Đối chiếu hash Git blob: cả hai HTML gốc và hai bundle đã tải lên đều khớp bản chuẩn.
- Hai URL jsDelivr trả HTTP 200, đúng MIME JavaScript và khớp nguyên văn bundle.
- Kiểm tra trang thật ở URL chuẩn và chế độ ?m=1, sau đó tải lại; mỗi trang chỉ có một khối ứng dụng.
- Phòng Luyện Công khởi động với data-booted=1 và data-ready=1; mở thể lệ và xử lý nút làm mới khi chưa có mã học viên.
- Giảng Đường tải được các bản lâm, mở và đóng ảnh phóng lớn.
- Không có lỗi JavaScript của website trong nhật ký các lượt kiểm tra; bỏ qua lỗi của tiện ích trình duyệt chrome-extension.
- Mở lại trình soạn Blogger: mã đã lưu khớp chính xác mã nhúng (206 và 208 ký tự).

Giới hạn kiểm thử: phiên này chưa có xác thực học viên, nên chưa chạy vào lớp, tạo/vào phòng, trừ vé, làm bài hoặc phát thưởng. Không thay đổi dữ liệu Google Sheets hay Apps Script.

Các trang còn lại chưa chuyển trong đợt này. Blogspot Preview không tải được máy chủ xem trước; đã kiểm tra trực tiếp trang công khai thay thế.
