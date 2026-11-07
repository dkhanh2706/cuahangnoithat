# Frontend CHNT

Hướng dẫn cài đặt và cập nhật database nằm trong [README gốc](../README.md).

**Quy trình hiện tại:** giỏ hàng đặt đơn COD qua `POST /api/orders`, kiểm tra giá
và trừ tồn kho. Admin xử lý tại `/admin/orders`: xác nhận → giao hàng → hoàn tất
và ghi nhận thu tiền. Hủy trước khi giao sẽ hoàn kho một lần. Đơn DEMO cũ vẫn
hiển thị nhưng không tác động tồn kho khi hủy.

**Bộ sưu tập:** thông tin trang trí trong `src/data/collections.js`; sản phẩm,
ID, giá, ảnh và tồn kho lấy từ API `/api/collections/products`. Không dùng ID
hoặc giá sản phẩm mẫu. Thêm cả bộ kiểm tra toàn bộ món trước khi thêm một lần.

**Nhận tin và chính sách:** email có sự đồng ý của khách được lưu vào database;
admin xem/xóa tại `/admin/subscribers`. Website chưa tự động gửi email. Các
trang `/policies/warranty`, `/policies/returns`, `/policies/shipping` và
`/policies/privacy` giải thích quy trình tương ứng.

Các ghi chú chức năng trước đây:

**Tư vấn trực tiếp (20/10/2026):** đăng nhập admin, chọn **Tư vấn khách hàng** ở menu hoặc mở `/admin/chat`, rồi bấm **Bật nhận tư vấn**. Danh sách tự cập nhật tin khách; chọn hội thoại để trả lời. Dùng **Gợi ý sản phẩm / cả bộ** để chọn tối đa 8 món đang còn hàng; có thể ghép thành một bộ hoặc gửi từng món. Khách xác nhận Có/Không trước khi thêm vào giỏ.

Admin gửi heartbeat mỗi 10 giây khi trang Tư vấn đang mở và bật nhận tin, kể cả khi chuyển sang tab trình duyệt khác. Server chỉ coi là online khi heartbeat cách hiện tại dưới 30 giây. Tắt nhận tư vấn/rời trang admin sẽ chuyển bot tiếp nhận ngay khi server nhận tín hiệu; mất kết nối đột ngột sẽ chuyển sau khi heartbeat hết hạn. Tin khách còn chờ cũng được bot trả lời; không tự gửi thêm câu bot khi admin đã trả lời tin đó. Khách chưa đăng nhập dùng được như trước.

**Không lưu lịch sử chat:** chỉ giữ trong RAM backend và bộ nhớ giao diện, không lưu database/file/localStorage/sessionStorage. Nút làm mới, đăng xuất, tải lại trang hoặc đóng/rời website sẽ kết thúc và xóa phiên ở cả phía khách lẫn admin. Thu gọn khung chat/chuyển trang nội bộ vẫn giữ nội dung. Nếu mất mạng/đóng trình duyệt đột ngột, server tự dọn phiên sau khoảng 90–95 giây không nhận tín hiệu khách. Khởi động/reload backend cũng xóa mọi phiên. Giỏ hàng vẫn được giữ riêng như trước.

Không cần migration hoặc API key. Chạy backend với **một worker** như lệnh `uvicorn main:app --reload` hiện tại; dữ liệu chat RAM không chia sẻ giữa các worker. API trực tiếp nằm ở `/api/live-chat/*`; `/api/advisor/chat` vẫn là API bot không lưu lịch sử, và `/api/advisor/check-cart` kiểm tra hàng trước khi thêm giỏ. Chi tiết tại [DATABASE_CHANGES.md](../DATABASE_CHANGES.md).

Chat tư vấn nội thất: nút **Tư vấn nội thất** ở góc dưới trên mọi trang khách hàng, hỗ trợ cả điện thoại và khách chưa đăng nhập. Dùng dữ liệu sản phẩm thật và kịch bản tiếng Việt, không cần API key. Ví dụ: “Phòng ngủ nên có những món gì?”, “Ngân sách 30 triệu”, “Tìm sofa dưới 15 triệu”, “Chất liệu món đầu tiên là gì?”. Có thể hỏi tiếp để điều chỉnh ngân sách/màu/chất liệu, xem chi tiết sản phẩm, chọn món lẻ hoặc cả bộ. Bộ do trợ lý ghép từ hàng còn tồn kho, tính tổng giá từng món; không dùng ID hay giá giảm từ bộ sưu tập mẫu.

Mỗi gợi ý có **Có / Không**: chỉ Có mới thêm vào giỏ hàng hiện tại. Kiểm tra lại giá, tồn kho và số lượng đã có trong giỏ trước khi thêm; bộ được thêm cùng lúc, không thêm dở dang. Giá đổi thì hiển thị giá mới và yêu cầu xác nhận lại; gợi ý đã thêm/bỏ qua không thể bấm lại. Khi thêm riêng một món, gợi ý cả bộ có chứa món đó sẽ đóng để tránh thêm trùng; có thể tiếp tục thêm các món còn lại. Chat giữ nội dung khi chuyển giữa các trang khách hàng; tải lại trang hoặc chọn **Cuộc trò chuyện mới** sẽ xóa nội dung chat. Giỏ hàng vẫn lưu theo cơ chế localStorage hiện có.

Backend bổ sung `POST /api/advisor/chat` và `POST /api/advisor/check-cart`, chỉ đọc database; không thêm bảng/cột, không migration, không ghi lịch sử chat, không gửi dữ liệu tới dịch vụ AI bên ngoài. Chạy backend và frontend như bình thường; nếu không dùng `--reload`, khởi động lại backend để nhận API mới. Chạy kiểm thử từ thư mục gốc: `.venv/Scripts/python.exe -B -m unittest discover -s backend/tests -v`; build frontend bằng `npm run build` từ `frontend`.

Quản lý sản phẩm: đăng nhập bằng tài khoản admin, mở `/admin/products` hoặc chọn **Quản lý Sản phẩm** trong menu admin. Có thể thêm/sửa thông tin, danh mục, giá, tồn kho, ảnh đại diện; tìm kiếm, lọc, phân trang; xóa và khóa/mở khóa sản phẩm. Sản phẩm bị khóa sẽ ẩn khỏi danh sách và trang chi tiết công khai, không thể đặt mua. Dữ liệu dùng chung với cửa hàng, không cần migration database mới.

Lịch sử đơn hàng: truy cập `/orders` sau khi đăng nhập để theo dõi đơn COD.
Nhấn **Cập nhật trạng thái** để xem tiến độ mới nhất. Sau khi admin xác nhận đã
giao và thu tiền, khách có thể đánh giá từng sản phẩm bằng 1–5 sao và nội dung.
Mỗi sản phẩm trong đơn được đánh giá một lần, kèm ảnh sản phẩm tự động. Đánh giá
hiện trên Home và `/reviews`; không hiển thị đánh giá mẫu.

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
