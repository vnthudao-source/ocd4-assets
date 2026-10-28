# Các trang Thư Đạo trên Blogspot

## Cách tải hiện tại (từ 29/10/2026): một file nén, không chặn trang

Mã gốc mỗi trang vẫn nằm ở `pages/<slug>.html`. `tools/build-pages.cjs` đóng gói CSS, khung HTML và mọi script của trang (kể cả script/CSS của repo mà trang ghim theo commit) thành **một file** `dist/<slug>.min.js`. Trang Blogspot chỉ giữ khối tải `loaders/<slug>.html`: một câu mô tả bằng HTML thật (cho SEO) và một thẻ script tải file nén theo mã commit.

Sửa một trang:
1. Sửa `blogspot/pages/<slug>.html`.
2. `node tools/build-pages.cjs <slug>` (đặt `ESBUILD_LIB` nếu esbuild không nằm trong node_modules), commit và push.
3. `node tools/build-pages.cjs --loaders <mã-commit-vừa-push>`, commit khối tải mới.
4. Trên Blogspot chỉ đổi `V='...'` thành mã commit mới.

Script được chạy lần lượt như script toàn cục (giữ hàm cho onclick); sự kiện DOMContentLoaded/load đăng ký khi trang đã tải xong vẫn được gọi.

Khôi phục: đổi `V` về mã commit cũ, hoặc dán lại mã nhúng cũ trong `embeds/`.

## Cách cũ (document.write, thư mục releases/embeds) — chỉ còn để khôi phục

Mã HTML gốc của hai trang trong đợt đầu được quản lý ở `pages/<slug>.html`. Tên slug trùng phần cuối URL Blogspot. `manifest.json` ghi tiêu đề, URL và ID trang.

## Sửa một trang và phát hành phiên bản mới

1. Sửa `blogspot/pages/<slug>.html` trong GitHub hoặc checkout kho mã để sửa.
2. Chạy `python3 tools/release-blogspot.py --version v1.0.1` tại thư mục kho mã. Thay v1.0.1 bằng số mới chưa dùng.
3. Commit và đưa các file nguồn, thư mục `blogspot/releases/v1.0.1` và `blogspot/embeds/v1.0.1` lên nhánh `main`.
4. Mở URL jsDelivr của bản mới và kiểm tra tải thành công trước khi cập nhật Blogspot.
5. Trong chế độ HTML của trang Blogspot, đổi `v1.0.0` thành `v1.0.1` trong URL `src`, hoặc dán toàn bộ mã từ `blogspot/embeds/v1.0.1/<slug>.html`.

Chỉ sửa số phiên bản của những trang muốn cập nhật. Các trang khác tiếp tục dùng bản cũ. Không sửa hoặc ghi đè file trong một thư mục releases đã xuất bản; jsDelivr có bộ nhớ đệm. Mỗi lần sửa tạo số mới để có URL mới.

## Vì sao mã nhúng chạy đồng bộ

Mỗi trang chỉ có một thẻ script ngoài, không thêm thuộc tính async/defer và không chuyển thành module. Bundle ghi lại nguyên văn phần HTML gốc trong lúc trình duyệt đang phân tích trang. Nhờ vậy các script hiện có chạy theo thứ tự ban đầu, các hàm OCDAuth dùng chung vẫn ở thudao.com và các handler DOMContentLoaded vẫn hoạt động. Bundle từ chối chạy sau giai đoạn phân tích để tránh ghi đè tài liệu.

Đây là cách di chuyển giữ nguyên hành vi hiện tại; mã nghiệp vụ không được viết lại. Việc đổi toàn bộ nội dung thành mã JavaScript phụ thuộc vào JavaScript và CDN; bot không chạy JavaScript có thể không đọc được nội dung. Không dùng mã nhúng cho phần mô tả tìm kiếm của Blogger.

## Khôi phục

Đổi lại số phiên bản cũ trong Blogspot. Để quay về HTML trực tiếp, dán nội dung tại commit di chuyển đầu tiên của `blogspot/pages/<slug>.html` vào trình soạn thảo HTML của đúng trang. Lịch sử Git giữ bản gốc kể cả sau khi nguồn được chỉnh sửa.

## Kiểm tra trước khi phát hành

`python3 -m unittest discover -s tools -p 'test_release_blogspot.py'`

Kiểm tra thêm trang thật trên thudao.com, nhất là đăng nhập, tra cứu và các quyền quản trị. Không chạy thao tác ghi dữ liệu học viên chỉ để thử giao diện.
