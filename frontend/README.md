các thư viện cần thiết:

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
