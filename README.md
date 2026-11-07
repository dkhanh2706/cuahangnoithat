# CHNT — Hệ thống quản lý và bán nội thất

CHNT là website giới thiệu, lựa chọn và đặt mua nội thất, kết hợp trang quản trị để quản lý người dùng, sản phẩm, đơn hàng và tư vấn khách hàng. Dự án sử dụng frontend và backend tách biệt, phục vụ thực hành phát triển ứng dụng web và báo cáo môn học.

Khách hàng có thể tìm sản phẩm, khám phá bộ sưu tập, thêm giỏ hàng, đặt hàng thanh toán khi nhận hàng (COD), theo dõi đơn và đánh giá sản phẩm. Quản trị viên xử lý đơn và trả lời tư vấn trực tiếp. Khi không có quản trị viên online, trợ lý tự động gợi ý từ danh mục sản phẩm thật.

## Mục lục

- [1. Chức năng](#1-chức-năng)
- [2. Công nghệ và kiến trúc](#2-công-nghệ-và-kiến-trúc)
- [3. Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
- [4. Yêu cầu môi trường](#4-yêu-cầu-môi-trường)
- [5. Cài đặt lần đầu sau khi clone](#5-cài-đặt-lần-đầu-sau-khi-clone)
- [6. Chạy dự án hằng ngày](#6-chạy-dự-án-hằng-ngày)
- [7. Cập nhật database có sẵn](#7-cập-nhật-database-có-sẵn)
- [8. Tài khoản và phân quyền](#8-tài-khoản-và-phân-quyền)
- [9. Cách hoạt động của hệ thống](#9-cách-hoạt-động-của-hệ-thống)
- [10. Dữ liệu và các bảng chính](#10-dữ-liệu-và-các-bảng-chính)
- [11. Các API tiêu biểu](#11-các-api-tiêu-biểu)
- [12. Kiểm thử và build](#12-kiểm-thử-và-build)
- [13. Kịch bản trình diễn báo cáo](#13-kịch-bản-trình-diễn-báo-cáo)
- [14. Xử lý lỗi thường gặp](#14-xử-lý-lỗi-thường-gặp)
- [15. Phạm vi hiện tại và hướng phát triển](#15-phạm-vi-hiện-tại-và-hướng-phát-triển)

## 1. Chức năng

### 1.1. Dành cho khách hàng

| Nhóm | Chức năng |
| --- | --- |
| Tài khoản | Đăng ký, đăng nhập, đăng xuất; cập nhật họ tên, số điện thoại, địa chỉ và ảnh đại diện. |
| Sản phẩm | Xem danh sách, tìm kiếm, lọc, sắp xếp và xem thông tin chi tiết. |
| Bộ sưu tập | Khám phá theo không gian/phong cách; xem sản phẩm tại điểm gắn trên ảnh; thêm từng món hoặc cả bộ vào giỏ. |
| Giỏ hàng | Thêm/xóa sản phẩm, điều chỉnh số lượng, áp dụng mã giảm giá và xem phí vận chuyển. |
| Đặt hàng | Nhập thông tin nhận hàng, đặt COD và theo dõi tiến độ trong lịch sử đơn hàng. |
| Đánh giá | Đánh giá sản phẩm trong đơn đã thanh toán; xem và xóa đánh giá của mình. |
| Yêu thích | Lưu và bỏ lưu sản phẩm trên trình duyệt. |
| Tư vấn | Chat với nhân viên online hoặc nhận gợi ý tự động về sản phẩm, ngân sách và cách phối nội thất. |
| Nhận tin | Đăng ký lưu email liên hệ sau khi đồng ý với chính sách thông tin. |
| Chính sách | Xem nội dung bảo hành, đổi trả, vận chuyển, thanh toán và thông tin nhận tin. |

### 1.2. Dành cho quản trị viên

| Trang | Chức năng |
| --- | --- |
| `/admin` hoặc `/admin/users` | Xem, tìm kiếm, tạo/sửa, khóa/mở khóa, đặt lại mật khẩu và xóa tài khoản theo ràng buộc của hệ thống. |
| `/admin/products` | Quản lý thông tin sản phẩm, danh mục, giá, tồn kho, ảnh; khóa/mở khóa và xóa sản phẩm. |
| `/admin/orders` | Tìm/lọc đơn, xem người nhận và sản phẩm, xác nhận, chuyển giao hàng, hoàn tất hoặc hủy trước khi giao. |
| `/admin/chat` | Bật/tắt nhận tư vấn, chọn hội thoại, trả lời và gửi gợi ý từng món hoặc cả bộ. |
| `/admin/subscribers` | Tìm kiếm, xem và xóa email đăng ký nhận tin. |

## 2. Công nghệ và kiến trúc

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, JavaScript/JSX, CSS. |
| Giao tiếp API | Axios, HTTP và JSON. |
| Biểu tượng | Lucide React. |
| Backend | Python, FastAPI, Uvicorn. |
| ORM và driver | SQLAlchemy, Psycopg/Psycopg2. |
| Database ứng dụng | PostgreSQL. |
| Kiểm tra đầu vào | Pydantic, Email Validator. |
| Xác thực | JWT qua Python JOSE; băm mật khẩu bằng Passlib/Bcrypt. |
| Kiểm thử | Python Unittest, SQLite riêng cho tests, Chrome và Chrome DevTools Protocol. |

```mermaid
flowchart LR
    Browser[Trình duyệt khách hàng / admin] --> Frontend[React + Vite]
    Frontend -->|HTTP / JSON và JWT| API[FastAPI]
    API --> ORM[SQLAlchemy]
    ORM --> DB[(PostgreSQL)]
    API --> Uploads[Ảnh trong backend/uploads]
    API --> Chat[Phiên tư vấn trong RAM]
```

Frontend hiển thị và xử lý tương tác. Backend kiểm tra quyền, dữ liệu đầu vào, giá, tồn kho và chuyển trạng thái đơn trước khi ghi database. Dữ liệu trong giỏ hàng ở trình duyệt không quyết định giá bán hoặc tồn kho thực tế.

## 3. Cấu trúc thư mục

```text
cuahangnoithat/
├── backend/
│   ├── admin/                  # Quản lý tài khoản, khởi tạo admin demo
│   ├── database/
│   │   ├── database.py         # Kết nối PostgreSQL và ORM session
│   │   ├── init_database.py    # Khởi tạo database mới và catalog
│   │   ├── catalog_products.json
│   │   ├── collection_memberships.json
│   │   └── migrate_*.py        # Các script cập nhật database
│   ├── models/                 # Mô hình bảng SQLAlchemy
│   ├── routers/                # Các tuyến API
│   ├── schemas/                # Kiểu dữ liệu request/response
│   ├── services/               # Tư vấn tự động và chat trực tiếp
│   ├── tests/                  # Kiểm thử và server thử nghiệm
│   ├── uploads/                # Ảnh sản phẩm và ảnh đại diện
│   ├── utils/                  # JWT, mật khẩu và kiểm tra quyền
│   ├── .env.example            # Mẫu cấu hình, không chứa kết nối thật
│   ├── main.py                 # Điểm khởi chạy FastAPI
│   └── requirements.txt        # Thư viện Python
├── frontend/
│   ├── src/
│   │   ├── admin/              # Trang, layout, dịch vụ quản trị
│   │   ├── components/         # Thành phần giao diện dùng chung
│   │   ├── context/            # Trạng thái giỏ hàng và yêu thích
│   │   ├── data/               # Nội dung bộ sưu tập và bộ lọc
│   │   ├── hooks/              # Tải dữ liệu và quản lý phiên tư vấn
│   │   ├── layouts/            # Layout cửa hàng
│   │   ├── pages/              # Các trang khách hàng
│   │   ├── services/           # Kết nối API, xử lý phiên và URL ảnh
│   │   ├── styles/             # CSS giao diện
│   │   ├── App.jsx             # Các tuyến giao diện
│   │   └── main.jsx            # Điểm khởi chạy React
│   ├── tests/                  # Kiểm thử trình duyệt
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
├── DATABASE_CHANGES.md          # Ghi chú thay đổi database trước đây
└── README.md
```

`.venv`, `node_modules`, `dist`, cache Python, file `.env` và ảnh upload phát sinh không được đưa lên Git. Chúng được tạo/cấu hình lại khi cài trên máy mới. `package-lock.json`, tests, migration và catalog được giữ lại để phục vụ cài đặt và kiểm thử.

## 4. Yêu cầu môi trường

- Git để clone mã nguồn.
- Python 3.13 — phiên bản đang dùng để kiểm thử dự án.
- Node.js 22.12 trở lên trong dòng Node 22, hoặc phiên bản đáp ứng `engines` của Vite đang cài; kèm npm.
- PostgreSQL đang hoạt động, tài khoản có quyền kết nối và tạo bảng trong database dự án.
- Trình duyệt Chrome, Edge hoặc Firefox; kiểm thử tự động bên dưới dùng Chrome.
- Internet để cài thư viện và tải ảnh catalog, banner hoặc font từ dịch vụ bên ngoài.

Các lệnh dưới đây sử dụng **Windows PowerShell**. Không cần kích hoạt môi trường ảo vì lệnh gọi trực tiếp Python trong `.venv`.

## 5. Cài đặt lần đầu sau khi clone

### Bước 1 — Clone dự án

```powershell
git clone https://github.com/dkhanh2706/cuahangnoithat.git
cd cuahangnoithat
```

“Thư mục gốc” là thư mục `cuahangnoithat` chứa `backend`, `frontend` và README này.

### Bước 2 — Tạo môi trường Python và cài thư viện

Từ thư mục gốc:

```powershell
python --version
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

Nếu có nhiều phiên bản Python, có thể tạo môi trường bằng `py -3.13 -m venv .venv`.

### Bước 3 — Tạo database PostgreSQL

Tạo database mới tên `chnt` bằng pgAdmin, hoặc dùng lệnh sau nếu `psql` đã có trong PATH:

```powershell
psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE chnt;"
```

Nhập mật khẩu PostgreSQL khi được yêu cầu. Nếu dùng tài khoản, máy chủ, cổng hoặc database khác, thay giá trị tương ứng ở bước tiếp theo.

### Bước 4 — Cấu hình backend

Từ thư mục gốc:

```powershell
Copy-Item backend/.env.example backend/.env
```

Mở `backend/.env` và điền thông tin của máy đang chạy:

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/chnt
SECRET_KEY=YOUR_RANDOM_SECRET
```

| Biến | Ý nghĩa |
| --- | --- |
| `DATABASE_URL` | Kết nối PostgreSQL: driver, tài khoản, mật khẩu, địa chỉ, cổng và tên database. |
| `SECRET_KEY` | Khóa ký/xác minh JWT; dùng chuỗi ngẫu nhiên riêng cho môi trường đang chạy. |

Có thể tạo chuỗi cho `SECRET_KEY` bằng:

```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_hex(32))"
```

Thay các giá trị mẫu trước khi chạy. Nếu mật khẩu database chứa ký tự đặc biệt trong URL như `@`, `#`, `/` hoặc `:`, cần mã hóa phần mật khẩu theo quy tắc URL. Không commit `.env` lên GitHub.

### Bước 5 — Khởi tạo database mới

Chỉ dùng quy trình này cho **database mới dành riêng cho dự án**:

```powershell
cd backend
..\.venv\Scripts\python.exe -B -m database.init_database
```

Script tạo các enum và bảng theo mô hình hiện tại, thêm danh mục, thêm sản phẩm/ảnh từ `catalog_products.json` và liên kết bộ sưu tập với ID thật theo `collection_memberships.json`.

Script không tự chạy khi bật API. Nếu dùng database có dữ liệu từ phiên bản trước, xem [mục 7](#7-cập-nhật-database-có-sẵn).

### Bước 6 — Khởi động backend

Tiếp tục từ thư mục `backend`:

```powershell
..\.venv\Scripts\python.exe -B -m uvicorn main:app --reload --port 8000
```

Khi backend khởi động và kết nối được database đã chuẩn bị, hệ thống kiểm tra/tạo admin demo.

| Địa chỉ | Mục đích |
| --- | --- |
| <http://127.0.0.1:8000> | Kiểm tra API đang chạy. |
| <http://127.0.0.1:8000/api/health> | Trạng thái tiến trình API. |
| <http://127.0.0.1:8000/docs> | Swagger UI để xem và thử API. |
| <http://127.0.0.1:8000/redoc> | Tài liệu API dạng ReDoc. |

`/api/health` kiểm tra tiến trình, không thay thế việc kiểm tra kết nối database. Luôn chạy backend từ `backend` để đường dẫn upload nhất quán. Chạy **một worker** vì phiên chat nằm trong RAM của tiến trình.

### Bước 7 — Cài đặt và chạy frontend

Mở terminal thứ hai từ thư mục gốc:

```powershell
cd frontend
npm ci
npm run dev
```

Mở <http://localhost:5175>. Giữ cả hai terminal backend và frontend hoạt động trong lúc sử dụng.

Frontend mặc định gọi API tại `http://127.0.0.1:8000`. Nếu cần thay địa chỉ, tạo `frontend/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Thay cấu hình Vite thì khởi động lại `npm run dev`; với bản build, cần build lại. Biến `VITE_*` được đưa vào mã frontend, chỉ dùng cho thông tin công khai như địa chỉ API.

## 6. Chạy dự án hằng ngày

Sau khi đã cài thư viện, cấu hình `.env` và chuẩn bị database, mở hai terminal:

**Terminal 1 — Backend, bắt đầu từ thư mục gốc:**

```powershell
cd backend
..\.venv\Scripts\python.exe -B -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend, bắt đầu từ thư mục gốc:**

```powershell
cd frontend
npm run dev
```

| Trang | Địa chỉ |
| --- | --- |
| Cửa hàng | <http://localhost:5175> |
| Sản phẩm | <http://localhost:5175/products> |
| Bộ sưu tập | <http://localhost:5175/collections> |
| Giỏ hàng | <http://localhost:5175/cart> |
| Lịch sử đơn hàng | <http://localhost:5175/orders> |
| Quản trị | <http://localhost:5175/admin> |

Dùng `Ctrl+C` trong từng terminal để dừng. Không cần khởi tạo lại database mỗi lần bật website.

## 7. Cập nhật database có sẵn

Với database cũ, kiểm tra cấu trúc và sao lưu dữ liệu cần giữ trước khi chạy migration phù hợp. Các script sau chạy từ `backend`:

| Script | Mục đích và điều kiện |
| --- | --- |
| `python -B -m database.migrate_user_avatar` | Thêm cột ảnh đại diện; yêu cầu đã có `users`. |
| `python -B -m database.migrate_reviews` | Tạo bảng đánh giá cửa hàng; yêu cầu các bảng người dùng/đơn hàng nền tảng. |
| `python -B -m database.migrate_order_history` | Tạo bảng đánh giá từng sản phẩm trong đơn; yêu cầu các bảng nền tảng. |
| `python -B -m database.migrate_store_features` | Tạo bảng liên kết bộ sưu tập và đăng ký email; khởi tạo liên kết từ sản phẩm hiện có. |

Ví dụ cập nhật bộ sưu tập và nhận tin bằng Python trong môi trường ảo:

```powershell
..\.venv\Scripts\python.exe -B -m database.migrate_store_features
```

Migration này tạo `curated_collection_products` và `newsletter_subscribers`, không thay cấu trúc bảng `collection_products` cũ nếu đã có. Chạy lại không tạo liên kết trùng.

Nếu cần thêm catalog vào database đã có các danh mục tương ứng:

```powershell
..\.venv\Scripts\python.exe -B -m database.seed_catalog --dry-run
..\.venv\Scripts\python.exe -B -m database.seed_catalog
..\.venv\Scripts\python.exe -B -m database.migrate_store_features
```

`--dry-run` rollback thay đổi dữ liệu để xem trước; sequence ID của PostgreSQL vẫn có thể tăng. Các migration riêng lẻ không thay thế bộ cài cho database trống. Xem thêm [DATABASE_CHANGES.md](DATABASE_CHANGES.md).

## 8. Tài khoản và phân quyền

### Tài khoản admin demo

| Thông tin | Giá trị |
| --- | --- |
| Email | `adminhdk@gmail.com` |
| Mật khẩu | `1234567890` |
| Vai trò | `ADMIN` |
| Trang đăng nhập | <http://localhost:5175/login> |

Tài khoản cố định này phục vụ bài thực hành. Mỗi lần backend khởi động, logic hiện tại kiểm tra tài khoản trên, đặt lại mật khẩu demo nếu khác và chuyển các tài khoản `ADMIN` khác về `CUSTOMER`. Không dùng cơ chế admin demo cố định cho hệ thống kinh doanh thực tế.

### Tài khoản khách hàng

Đăng ký tại `/register` để tạo tài khoản `CUSTOMER`. Database mới không có sẵn tài khoản khách hàng dùng chung.

| Đối tượng | Quyền chính |
| --- | --- |
| Chưa đăng nhập | Xem cửa hàng, tìm sản phẩm, dùng giỏ/yêu thích trên trình duyệt, xem đánh giá, tư vấn, đăng ký nhận tin. |
| Khách đã đăng nhập | Đặt hàng, xem đơn của mình, cập nhật hồ sơ, đánh giá sản phẩm đủ điều kiện. |
| Admin | Quản lý người dùng, sản phẩm, đơn hàng, email và tư vấn trực tiếp. Dùng tài khoản khách riêng để đặt COD. |

Mật khẩu được băm bằng Bcrypt. Đăng nhập thành công trả JWT; frontend gửi `Authorization: Bearer <token>` khi gọi API cần xác thực. Token có hạn mặc định 24 giờ. Backend kiểm tra token, trạng thái tài khoản và quyền, không chỉ dựa vào ẩn/hiện menu frontend.

## 9. Cách hoạt động của hệ thống

### 9.1. Sản phẩm, giỏ hàng và yêu thích

- Danh sách, chi tiết sản phẩm và ảnh được tải từ backend/database.
- Sản phẩm bị khóa không xuất hiện trong truy vấn công khai và không được chấp nhận khi đặt hàng.
- Giỏ và yêu thích lưu trong `localStorage` của trình duyệt; chưa đồng bộ giữa các thiết bị và không phải các bảng giỏ hàng trong PostgreSQL.
- Giá/tồn kho có thể thay đổi sau khi admin cập nhật. Backend kiểm tra lại khi thêm bộ sưu tập và đặt đơn.

### 9.2. Bộ sưu tập dùng sản phẩm thật

Thông tin giới thiệu, ảnh không gian, màu sắc và phong cách nằm trong `frontend/src/data/collections.js`. Thành phần sản phẩm được lưu trong `curated_collection_products` và tải qua `/api/collections/products`.

Script khởi tạo tìm theo tên catalog rồi lưu **ID thật**. Những lần hiển thị sau dùng ID đã lưu, nên đổi tên sản phẩm không làm liên kết sang một ID mẫu khác. Tên, giá, ảnh, tồn kho đều lấy từ database; sản phẩm bị khóa không được trả về.

Thêm cả bộ kiểm tra tất cả món và số lượng đã có trong giỏ trước khi thêm một lần. Nếu có món không khả dụng, giỏ không được thêm dở dang. Giá thay đổi thì giao diện cập nhật và yêu cầu xác nhận lại. Tổng giá bộ là tổng từng món; không tự áp dụng mức giảm combo chỉ xuất hiện trong nội dung trình bày.

### 9.3. Đặt hàng và tính tiền

1. Khách đăng nhập, kiểm tra giỏ, điền tên, số điện thoại và địa chỉ nhận hàng.
2. Frontend gửi ID, số lượng, mã ưu đãi và tổng tiền khách đang xác nhận.
3. Backend đọc giá thật, kiểm tra trạng thái và tồn kho; khóa các dòng sản phẩm trong giao dịch PostgreSQL khi tạo đơn.
4. Backend tự tính lại tổng. Nếu giá/tổng tiền thay đổi, khách phải xem lại trước khi đặt.
5. Khi hợp lệ, backend lưu đơn/chi tiết và trừ kho trong cùng giao dịch, trả mã `CHNT-...`.
6. Frontend loại các món đã đặt khỏi giỏ và chuyển tới lịch sử đơn hàng.

Yêu cầu đặt hàng từ giao diện có mã yêu cầu để việc gửi lại cùng yêu cầu không tạo thêm đơn hoặc trừ kho lần nữa.

| Thành phần | Quy tắc |
| --- | --- |
| Tạm tính | Tổng đơn giá trong database × số lượng từng món. |
| `CHNT10` | Giảm 10% tiền sản phẩm. |
| `CHNT20` | Giảm 20% tiền sản phẩm. |
| Vận chuyển | Miễn phí khi tạm tính trước giảm giá từ 2.000.000₫; dưới mức này là 150.000₫. |
| Tổng tiền | Tạm tính − giảm giá + phí vận chuyển. |
| Thanh toán | COD — thanh toán khi nhận hàng, không thu tiền qua website. |

### 9.4. Vòng đời đơn hàng và tồn kho

```mermaid
flowchart LR
    Pending[Chờ xác nhận] --> Confirmed[Đã xác nhận]
    Confirmed --> Shipping[Đang giao]
    Shipping --> Completed[Hoàn tất]
    Pending --> Cancelled[Đã hủy]
    Confirmed --> Cancelled
```

| Trạng thái | Ý nghĩa |
| --- | --- |
| `PENDING` | Đã tạo đơn, đã trừ tồn kho, chờ admin xác nhận. |
| `CONFIRMED` | Đã xác nhận để chuẩn bị giao. |
| `SHIPPING` | Đang giao; không hủy trực tiếp bằng thao tác hủy hiện tại. |
| `COMPLETED` | Admin xác nhận đã giao và thu tiền COD; thanh toán chuyển `SUCCESS`. |
| `CANCELLED` | Hủy từ chờ/đã xác nhận; hoàn số lượng của sản phẩm còn tồn tại đúng một lần. |

Backend không cho bỏ qua các bước hoặc mở lại đơn đã hủy. Đơn `DEMO-...` của luồng giả lập được nhận diện riêng; hủy chúng không tăng tồn kho vì lúc tạo không trừ kho.

Khách xem đơn tại `/orders`, bấm **Cập nhật trạng thái** để lấy tiến độ mới. Đánh giá được mở khi đơn đã thanh toán và chưa hủy; trong luồng COD mới, thanh toán được xác nhận khi admin hoàn tất đơn.

### 9.5. Đánh giá sản phẩm

Khách chọn sản phẩm đủ điều kiện trong lịch sử, chấm 1–5 sao và nhập nội dung. Mỗi dòng sản phẩm trong đơn có tối đa một đánh giá tại một thời điểm. Ảnh sản phẩm được đính kèm lúc tạo đánh giá. Đánh giá hiện ở trang chủ và `/reviews`; khách có thể xóa đánh giá của mình rồi viết lại. Backend kiểm tra quyền sở hữu để ngăn đánh giá hoặc xóa thay người khác.

### 9.6. Tư vấn trực tiếp và tự động

1. Khách mở **Tư vấn nội thất** trên cửa hàng, không bắt buộc đăng nhập.
2. Admin mở `/admin/chat`, chọn **Bật nhận tư vấn**.
3. Frontend admin gửi heartbeat khoảng 10 giây/lần; server coi admin online khi heartbeat chưa quá 30 giây.
4. Có admin online thì chuyển tin vào màn hình tư vấn. Không online hoặc hết hạn online thì trợ lý tự động tiếp nhận.
5. Nhân viên/bot gợi ý từng món hoặc cả bộ. Khách chọn **Có/Không** trước khi thêm; server kiểm tra lại giá và tồn kho.

Trợ lý tự động xử lý theo quy tắc tiếng Việt và dữ liệu sản phẩm thật, **không gọi mô hình AI/LLM bên ngoài, không cần API key**. Có thể thử: “Tư vấn phòng ngủ”, “Ngân sách 30 triệu”, “Tìm sofa dưới 15 triệu”.

Hội thoại và trạng thái online giữ trong RAM, không lưu database hay lịch sử chat trong `localStorage`. Chuyển trang nội bộ/thu gọn vẫn giữ phiên; làm mới, đăng xuất hoặc kết thúc phiên sẽ xóa nội dung. Phiên mất kết nối được dọn sau khoảng 90 giây không còn tín hiệu, theo chu kỳ dọn của server. Khởi động lại backend cũng xóa phiên; chỉ chạy một worker trong cấu hình hiện tại.

### 9.7. Nhận tin và chính sách

Khách nhập email, chọn đồng ý và gửi biểu mẫu footer. Backend kiểm tra email, chuẩn hóa chữ thường và lưu vào `newsletter_subscribers`; cùng email không tạo bản ghi trùng. Chỉ admin được xem/xóa danh sách tại `/admin/subscribers`.

Chức năng lưu danh sách liên hệ, chưa kết nối gửi email tự động. Nội dung chính sách có tại `/policies/warranty`, `/policies/returns`, `/policies/shipping` và `/policies/privacy`.

### 9.8. Hồ sơ và ảnh upload

Khách xem/sửa hồ sơ tại `/profile`. Ảnh đại diện chấp nhận JPG, PNG, WebP hợp lệ, tối đa 5 MB. File được lưu trong `backend/uploads/avatars`, đường dẫn lưu trong bảng người dùng. Ảnh sản phẩm được quản lý qua API ảnh và `backend/uploads/products`.

File được phục vụ dưới `/uploads`. Khi chuyển database có ảnh upload sang máy khác, phải sao chép cả thư mục ảnh tương ứng; chỉ clone Git không có ảnh upload thực tế. Ảnh URL ngoài trong catalog cần Internet.

## 10. Dữ liệu và các bảng chính

| Bảng | Vai trò |
| --- | --- |
| `users` | Tài khoản, mật khẩu đã băm, vai trò, trạng thái và hồ sơ. |
| `categories` | Danh mục sản phẩm. |
| `products` | Thông tin, giá, chất liệu, kích thước, tồn kho và trạng thái sản phẩm. |
| `product_images` | Ảnh và thông tin ảnh chính của sản phẩm. |
| `orders` | Mã đơn, người đặt/nhận, địa chỉ, tổng tiền, trạng thái đơn và thanh toán. |
| `order_details` | Các dòng sản phẩm đã đặt, giữ tên và giá lúc tạo đơn. |
| `store_reviews` | Đánh giá cấp đơn/cửa hàng qua API đánh giá cửa hàng. |
| `order_item_reviews` | Đánh giá từng sản phẩm đã mua, dùng trên giao diện hiện tại. |
| `curated_collection_products` | Liên kết bộ sưu tập với ID sản phẩm thật, thứ tự và tọa độ trên ảnh. |
| `newsletter_subscribers` | Email đăng ký và thời điểm đăng ký. |

Giỏ/yêu thích nằm trên trình duyệt; tư vấn nằm trong RAM backend. Hai nhóm này không phải bảng lưu lịch sử trong database.

## 11. Các API tiêu biểu

Địa chỉ gốc: `http://127.0.0.1:8000`. Xem đầy đủ đường dẫn, kiểu dữ liệu và yêu cầu xác thực tại `/docs`; có thể thử bằng Swagger UI hoặc Postman.

| Phương thức và đường dẫn | Mục đích |
| --- | --- |
| `POST /api/auth/register`, `POST /api/auth/login` | Đăng ký, đăng nhập. |
| `GET /api/users/me`, `PATCH /api/users/me` | Lấy/cập nhật hồ sơ. |
| `POST /api/users/me/avatar` | Upload ảnh đại diện qua multipart form. |
| `GET /api/products`, `GET /api/products/{id}` | Danh sách, chi tiết sản phẩm công khai. |
| `GET /api/products/{id}/images` | Các ảnh sản phẩm. |
| `GET /api/collections/products` | Sản phẩm thật và điểm gắn trong bộ sưu tập. |
| `POST /api/orders/quote` | Kiểm tra giỏ và tính tổng phía server. |
| `POST /api/orders`, `GET /api/orders` | Tạo COD và lấy đơn của khách đăng nhập. |
| `GET /api/admin/orders`, `GET /api/admin/orders/{id}` | Danh sách/lọc và chi tiết đơn cho admin. |
| `PATCH /api/admin/orders/{id}/status` | Chuyển trạng thái theo quy trình. |
| `GET /api/product-reviews`, `POST /api/product-reviews` | Xem, tạo đánh giá sản phẩm. |
| `DELETE /api/product-reviews/{id}` | Xóa đánh giá của chính khách. |
| `POST /api/advisor/chat`, `POST /api/advisor/check-cart` | Tư vấn tự động, kiểm tra lựa chọn trước khi thêm giỏ. |
| `/api/live-chat/*` | Phiên chat, trạng thái online, tư vấn trực tiếp. |
| `POST /api/newsletter/subscriptions` | Ghi nhận email có sự đồng ý của khách. |
| `GET /api/admin/newsletter/subscriptions` | Danh sách email cho admin. |
| `DELETE /api/admin/newsletter/subscriptions/{id}` | Xóa đăng ký nhận tin. |
| `/api/admin/users*`, `/api/products/admin/all` | Quản lý tài khoản, danh sách sản phẩm quản trị. |

`/api/orders/demo` vẫn tồn tại để tương thích luồng giả lập; giao diện đặt hàng hiện tại dùng `/api/orders` cho COD.

## 12. Kiểm thử và build

### 12.1. Backend

Từ thư mục gốc:

```powershell
.\.venv\Scripts\python.exe -B -m unittest discover -s backend/tests -v
```

Tests dùng SQLite riêng, không kết nối PostgreSQL cấu hình trong `.env`. Tại phiên bản hoàn thiện COD/bộ sưu tập/nhận tin, 53 kiểm thử đã chạy thành công, bao gồm phân quyền, hồ sơ, quản lý sản phẩm, tư vấn, đơn hàng, hoàn kho, đánh giá, bộ sưu tập và đăng ký email.

### 12.2. Build frontend

Từ `frontend`:

```powershell
npm run build
```

Kết quả nằm trong `frontend/dist`, được Git bỏ qua. Để xem bản build trên cổng đã được backend cho phép, dừng Vite dev đang chiếm cổng rồi chạy:

```powershell
npm run preview -- --port 5175 --strictPort
```

Backend vẫn cần chạy ở 8000. Có thể kiểm tra thêm quy tắc mã bằng `npm run lint`; một số thành phần cũ vẫn có vi phạm ESLint, nên build thành công không đồng nghĩa toàn bộ lint đã đạt.

### 12.3. Kiểm thử luồng mới bằng Chrome

Quy trình này dùng server riêng ở 8011 và SQLite trong RAM, tách khỏi dữ liệu cửa hàng. Cài thư viện Python/frontend trước khi thực hiện.

**Bước A — Từ `frontend`, build riêng cho tests:**

```powershell
$env:VITE_API_URL='http://127.0.0.1:8011'
npm run build -- --outDir node_modules/.cache/store-completion-dist
Remove-Item Env:VITE_API_URL
```

**Bước B — Terminal mới, từ thư mục gốc:**

```powershell
$env:TEST_FRONTEND_DIST=(Resolve-Path frontend/node_modules/.cache/store-completion-dist).Path
.\.venv\Scripts\python.exe -B -m uvicorn advisor_browser_server:app --app-dir backend/tests --port 8011
```

**Bước C — Terminal khác, từ `frontend`:**

```powershell
node tests/store-completion.browser.mjs 'C:/Program Files/Google/Chrome/Application/chrome.exe'
```

Thay đường dẫn Chrome nếu máy cài ở vị trí khác. Kịch bản kiểm tra bộ sưu tập thật → giỏ → COD → trừ kho → admin xử lý → khách đánh giá; email đăng ký; chính sách; hủy đơn lặp lại; giá đổi; cả bộ hết hàng; bố cục máy tính/điện thoại và lỗi JavaScript.

Ảnh chụp nằm trong `frontend/node_modules/.cache/store-completion-tests`. Dừng server thử nghiệm bằng `Ctrl+C` khi xong. Server này có API hỗ trợ kiểm thử, chỉ dùng cục bộ, không dùng thay backend ứng dụng.

## 13. Kịch bản trình diễn báo cáo

1. **Giới thiệu:** nêu mục tiêu, giao diện khách/admin, sơ đồ React → FastAPI → PostgreSQL.
2. **Tài khoản:** đăng ký khách mới, đăng nhập, cập nhật hồ sơ.
3. **Chọn sản phẩm:** tìm/lọc, xem chi tiết, mở bộ sưu tập và thêm sản phẩm thật vào giỏ.
4. **Đặt COD:** nhập người nhận, áp dụng `CHNT10`, giải thích tổng tiền, đặt đơn và ghi lại mã.
5. **Quản trị:** dùng cửa sổ ẩn danh/trình duyệt khác đăng nhập admin, mở `/admin/orders`, tìm đơn và xem chi tiết.
6. **Hoàn tất:** xác nhận → giao → hoàn tất/thu tiền. Quay lại khách, cập nhật trạng thái và đánh giá.
7. **Hoàn kho:** tạo đơn khác, quan sát tồn kho rồi hủy từ admin; chứng minh kho được hoàn và không tăng thêm khi gửi lại thao tác hủy.
8. **Tư vấn:** thử bot khi admin tắt nhận tin, sau đó bật nhận tư vấn và trả lời trực tiếp; giải thích online và việc không lưu lịch sử chat.
9. **Nhận tin:** đăng ký email ở footer, mở danh sách admin và các trang chính sách.
10. **Kỹ thuật:** giới thiệu phân quyền backend, giao dịch đặt hàng, database, tests và cách clone/chạy lại.

Dùng hai phiên trình duyệt độc lập để giữ đăng nhập admin và khách đồng thời: các tab cùng nguồn trong một hồ sơ trình duyệt dùng chung `localStorage`.

## 14. Xử lý lỗi thường gặp

| Hiện tượng | Cách kiểm tra/xử lý |
| --- | --- |
| Không tìm thấy Python/npm | Kiểm tra cài đặt và PATH; mở lại terminal, chạy `python --version`, `node --version`, `npm --version`. |
| Vite báo Node không phù hợp | Kiểm tra `engines` của Vite, dùng Node đáp ứng yêu cầu rồi cài lại bằng `npm ci`. |
| `ModuleNotFoundError` | Dùng Python trong `.venv`, cài lại `backend/requirements.txt`. |
| Không kết nối database | Kiểm tra PostgreSQL, database tồn tại, `DATABASE_URL`, quyền tài khoản và mã hóa mật khẩu trong URL. |
| Thiếu bảng/cột | Database mới: chạy `database.init_database`; database cũ: kiểm tra cấu trúc rồi chạy migration tương ứng. |
| Lỗi thư mục upload | Chạy Uvicorn từ `backend`; kiểm tra `backend/uploads` tồn tại và có quyền ghi. |
| Frontend không tải dữ liệu | Kiểm tra backend 8000, địa chỉ API, Network trong DevTools và log backend. |
| CORS hoặc Vite đổi cổng | Backend cho phép localhost/127.0.0.1 tại 5173, 5174, 5175. Dùng cổng được cho phép hoặc cập nhật CORS trong `backend/main.py`. |
| Không đăng nhập admin | Kiểm tra database, log khởi tạo, đúng tài khoản demo; thử đăng xuất/đăng nhập lại. |
| API trả `401`/`403` | Kiểm tra đăng nhập, hạn token, khóa tài khoản và vai trò; admin không dùng thay khách để đặt COD. |
| Bộ sưu tập trống | Kiểm tra catalog, chạy migration bộ sưu tập và bảo đảm sản phẩm liên kết không bị khóa. |
| Giá đổi/không đủ kho | Kiểm tra giỏ, điều chỉnh số lượng và xác nhận giá mới; backend không nhận đơn vượt kho. |
| Không thấy ảnh | Kiểm tra Internet với ảnh ngoài; với upload, kiểm tra file được chép theo database và URL `/uploads`. |
| Chat không có nhân viên | Admin mở `/admin/chat`, bật nhận tư vấn; heartbeat hết hạn thì bot tiếp nhận. Chạy một worker. |
| Mất chat khi tải lại | Đây là cơ chế hiện tại: chat không lưu lịch sử bền vững. |

## 15. Phạm vi hiện tại và hướng phát triển

Dự án hỗ trợ đặt COD và quản trị cục bộ. Các giới hạn cần phân biệt khi báo cáo:

- Chưa tích hợp thanh toán online, đơn vị vận chuyển hoặc chuyển tiền hoàn trả tự động.
- Email đăng ký lưu thật nhưng chưa tự động gửi email/campaign.
- Trợ lý tư vấn dùng quy tắc/catalog, không phải chatbot gọi LLM bên ngoài.
- Chat trong RAM, chưa lưu lịch sử sau phiên hoặc chia sẻ giữa nhiều worker.
- Giỏ/yêu thích theo trình duyệt, chưa đồng bộ theo tài khoản trên nhiều thiết bị.
- Bộ sưu tập có nội dung và cấu hình liên kết ban đầu; chưa có màn hình admin thiết kế/quản lý thành phần bộ sưu tập.
- Đổi trả sau giao hàng được mô tả trong chính sách và tiếp nhận qua nhân viên; chưa có phân hệ xử lý yêu cầu riêng.
- Admin cố định là cơ chế demo; cần thay trước khi vận hành kinh doanh thực tế.

Hướng mở rộng gồm quản lý đổi trả, dashboard thống kê, đồng bộ giỏ theo tài khoản, dịch vụ email, thanh toán online và lưu trữ/chia sẻ phiên chat.

Tài liệu bổ sung: [ghi chú frontend](frontend/README.md), [thay đổi database trước đây](DATABASE_CHANGES.md), [tests backend](backend/tests/) và [tests trình duyệt](frontend/tests/).
