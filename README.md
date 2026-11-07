# CHNT — Cửa hàng nội thất

Website React/Vite và API FastAPI dùng PostgreSQL. Có cửa hàng, giỏ hàng,
đặt hàng DEMO, lịch sử đơn, đánh giá, hồ sơ cá nhân, quản lý người dùng/sản phẩm
và tư vấn khách hàng trực tiếp hoặc tự động.

## Yêu cầu

- Python 3.13 (phiên bản đang dùng để kiểm thử).
- Node.js 22.12 trở lên và npm.
- PostgreSQL với một database riêng cho dự án.

## Cài đặt backend (PowerShell)

Chạy từ thư mục gốc sau khi clone:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Copy-Item backend/.env.example backend/.env
```

Sửa `backend/.env`: đặt `DATABASE_URL` theo database PostgreSQL của bạn và thay
`SECRET_KEY` bằng chuỗi bí mật riêng. File `.env` không đưa lên GitHub; không ghi
thông tin kết nối thật vào `.env.example`.

Nếu tạo database **mới, trống**, tạo database tên `chnt` bằng PostgreSQL trước,
rồi chạy:

```powershell
cd backend
..\.venv\Scripts\python.exe -B -m database.init_database
..\.venv\Scripts\python.exe -B -m uvicorn main:app --reload --port 8000
```

Script khởi tạo tạo bảng, các kiểu enum, danh mục và sản phẩm từ
`backend/database/catalog_products.json`. Script không được chạy tự động khi bật API.
Với database cũ, giữ nguyên dữ liệu và xem các migration trong
[DATABASE_CHANGES.md](DATABASE_CHANGES.md) thay vì dùng quy trình khởi tạo mới.

Chạy API từ thư mục `backend` để đường dẫn `uploads` nhất quán. Thư mục upload
được giữ bằng `.gitkeep`, ảnh upload thực tế được bỏ qua bởi Git. Nếu chuyển dữ
liệu từ máy khác, cần sao chép riêng ảnh upload tương ứng. Ảnh sản phẩm trong
catalog mẫu sử dụng URL bên ngoài và cần Internet để hiển thị.

API: <http://127.0.0.1:8000>; tài liệu API: <http://127.0.0.1:8000/docs>.

Khi khởi động, backend tạo tài khoản quản trị demo `adminhdk@gmail.com`, mật khẩu
`1234567890` theo logic hiện có. Đây là tài khoản dùng cho bài thực hành.

## Cài đặt frontend

Mở terminal thứ hai từ thư mục gốc:

```powershell
cd frontend
npm ci
npm run dev
```

Mở <http://localhost:5175>; trang quản trị: <http://localhost:5175/admin>.
Frontend đang gọi API tại `http://127.0.0.1:8000`.

## Kiểm tra

Từ thư mục gốc:

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s backend/tests -v
cd frontend
npm run build
```

Các kiểm thử backend dùng SQLite riêng, không dùng database cấu hình trong `.env`.
Tư vấn trực tiếp giữ trạng thái trong RAM; chỉ chạy một worker backend.
Thanh toán là giả lập, không thu tiền. Chi tiết chức năng và kiểm thử trình duyệt
nằm trong [frontend/README.md](frontend/README.md) và `frontend/tests/`.

## Các file được loại khỏi Git

- 36 file `backend/**/__pycache__/*.pyc`: cache Python, tự sinh lại khi chạy.
- `databse.db`: file rỗng, không được mã nguồn sử dụng; ứng dụng dùng PostgreSQL.
- `frontend/src/App.css`: file rỗng; đã bỏ import tương ứng.
- `frontend/src/styles/home/Testimonials.css`: stylesheet cũ, không được import.
- `backend/.env`: cấu hình riêng, giữ trên máy và thay bằng `.env.example` trên Git.

`.gitignore` chặn cache, môi trường ảo, `node_modules`, bản build, log, database
cục bộ, file cấu hình riêng và dữ liệu upload phát sinh. Những thư mục cần để
chạy trên máy vẫn được giữ lại ở máy hiện tại.

Giữ `package-lock.json` để cài đúng thư viện; giữ tests, migration, catalog và
tài liệu vì chúng phục vụ kiểm thử, chuẩn bị database và giải thích dự án.
