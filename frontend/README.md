các thư viện cần thiết:

**Tư vấn trực tiếp (20/10/2026):** đăng nhập admin, chọn **Tư vấn khách hàng** ở menu hoặc mở `/admin/chat`, rồi bấm **Bật nhận tư vấn**. Danh sách tự cập nhật tin khách; chọn hội thoại để trả lời. Dùng **Gợi ý sản phẩm / cả bộ** để chọn tối đa 8 món đang còn hàng; có thể ghép thành một bộ hoặc gửi từng món. Khách xác nhận Có/Không trước khi thêm vào giỏ.

Admin gửi heartbeat mỗi 10 giây khi trang Tư vấn đang mở và bật nhận tin, kể cả khi chuyển sang tab trình duyệt khác. Server chỉ coi là online khi heartbeat cách hiện tại dưới 30 giây. Tắt nhận tư vấn/rời trang admin sẽ chuyển bot tiếp nhận ngay khi server nhận tín hiệu; mất kết nối đột ngột sẽ chuyển sau khi heartbeat hết hạn. Tin khách còn chờ cũng được bot trả lời; không tự gửi thêm câu bot khi admin đã trả lời tin đó. Khách chưa đăng nhập dùng được như trước.

**Không lưu lịch sử chat:** chỉ giữ trong RAM backend và bộ nhớ giao diện, không lưu database/file/localStorage/sessionStorage. Nút làm mới, đăng xuất, tải lại trang hoặc đóng/rời website sẽ kết thúc và xóa phiên ở cả phía khách lẫn admin. Thu gọn khung chat/chuyển trang nội bộ vẫn giữ nội dung. Nếu mất mạng/đóng trình duyệt đột ngột, server tự dọn phiên sau khoảng 90–95 giây không nhận tín hiệu khách. Khởi động/reload backend cũng xóa mọi phiên. Giỏ hàng vẫn được giữ riêng như trước.

Không cần migration hoặc API key. Chạy backend với **một worker** như lệnh `uvicorn main:app --reload` hiện tại; dữ liệu chat RAM không chia sẻ giữa các worker. API trực tiếp nằm ở `/api/live-chat/*`; `/api/advisor/chat` vẫn là API bot không lưu lịch sử, và `/api/advisor/check-cart` kiểm tra hàng trước khi thêm giỏ. Chi tiết tại [DATABASE_CHANGES.md](../DATABASE_CHANGES.md).

Chat tư vấn nội thất: nút **Tư vấn nội thất** ở góc dưới trên mọi trang khách hàng, hỗ trợ cả điện thoại và khách chưa đăng nhập. Dùng dữ liệu sản phẩm thật và kịch bản tiếng Việt, không cần API key. Ví dụ: “Phòng ngủ nên có những món gì?”, “Ngân sách 30 triệu”, “Tìm sofa dưới 15 triệu”, “Chất liệu món đầu tiên là gì?”. Có thể hỏi tiếp để điều chỉnh ngân sách/màu/chất liệu, xem chi tiết sản phẩm, chọn món lẻ hoặc cả bộ. Bộ do trợ lý ghép từ hàng còn tồn kho, tính tổng giá từng món; không dùng ID hay giá giảm từ bộ sưu tập mẫu.

Mỗi gợi ý có **Có / Không**: chỉ Có mới thêm vào giỏ hàng hiện tại. Kiểm tra lại giá, tồn kho và số lượng đã có trong giỏ trước khi thêm; bộ được thêm cùng lúc, không thêm dở dang. Giá đổi thì hiển thị giá mới và yêu cầu xác nhận lại; gợi ý đã thêm/bỏ qua không thể bấm lại. Khi thêm riêng một món, gợi ý cả bộ có chứa món đó sẽ đóng để tránh thêm trùng; có thể tiếp tục thêm các món còn lại. Chat giữ nội dung khi chuyển giữa các trang khách hàng; tải lại trang hoặc chọn **Cuộc trò chuyện mới** sẽ xóa nội dung chat. Giỏ hàng vẫn lưu theo cơ chế localStorage hiện có.

Backend bổ sung `POST /api/advisor/chat` và `POST /api/advisor/check-cart`, chỉ đọc database; không thêm bảng/cột, không migration, không ghi lịch sử chat, không gửi dữ liệu tới dịch vụ AI bên ngoài. Chạy backend và frontend như bình thường; nếu không dùng `--reload`, khởi động lại backend để nhận API mới. Chạy kiểm thử từ thư mục gốc: `.venv/Scripts/python.exe -B -m unittest discover -s backend/tests -v`; build frontend bằng `npm run build` từ `frontend`.

Quản lý sản phẩm: đăng nhập bằng tài khoản admin, mở `/admin/products` hoặc chọn **Quản lý Sản phẩm** trong menu admin. Có thể thêm/sửa thông tin, danh mục, giá, tồn kho, ảnh đại diện; tìm kiếm, lọc, phân trang; xóa và khóa/mở khóa sản phẩm. Sản phẩm bị khóa sẽ ẩn khỏi danh sách và trang chi tiết công khai, không thể đặt mua. Dữ liệu dùng chung với cửa hàng, không cần migration database mới.

Lịch sử đơn hàng: truy cập `/orders` sau khi đăng nhập. Thanh toán giả lập ở giỏ hàng lưu đơn DEMO vào database, không thu tiền và không trừ tồn kho; thành công sẽ chuyển thẳng đến lịch sử. Nhấn icon bình luận cạnh sản phẩm để chọn 1–5 sao và viết đánh giá. Mỗi sản phẩm trong đơn được đánh giá một lần, kèm ảnh sản phẩm tự động. Đánh giá hiện ngay trên Home, phía trên nội dung nội thất, và tại `/reviews`; không hiển thị đánh giá mẫu. Xem toàn bộ thay đổi database và migration tại [DATABASE_CHANGES.md](../DATABASE_CHANGES.md).

- npm install axios react-router-dom
- npm install lucide-react
- pip install fastapi uvicorn
- pip install sqlalchemy psycopg2-binary
- pip install python-jose[cryptography] passlib[bcrypt]
- pip install python-multipart
- pip install python-dotenv
- pip install "psycopg[binary]"
- python -m venv .venv
- pip install email-validator
  chạy be
- uvicorn main:app --reload
