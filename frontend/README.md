các thư viện cần thiết:

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
