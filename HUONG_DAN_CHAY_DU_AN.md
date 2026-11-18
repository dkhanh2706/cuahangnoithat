# Hướng dẫn chạy dự án Cửa hàng nội thất

Dự án gồm:

- **Frontend:** React + Vite
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL, database `furniture_store_db`

## 1. Chuẩn bị

Đảm bảo PostgreSQL đang chạy và cấu hình kết nối trong file môi trường của backend trỏ đúng tới database **`furniture_store_db`**.

Cấu trúc thư mục:

```text
C:\Users\Home\Pictures\cuahangnoithat\
├── .venv\
├── backend\
└── frontend\
```

## 2. Chạy Backend (Terminal 1 — PowerShell)

Mở terminal thứ nhất và chạy lần lượt:

```powershell
cd C:\Users\Home\Pictures\cuahangnoithat
.\.venv\Scripts\Activate.ps1
cd backend
python -m uvicorn main:app --reload
```

Backend chạy tại: **http://127.0.0.1:8000**  
Trang tài liệu API (Swagger): **http://127.0.0.1:8000/docs**

Khi thấy `Application startup complete.` và không có lỗi kết nối database, backend đã khởi động xong.

> Giữ terminal này mở trong lúc sử dụng website.

## 3. Chạy Frontend (Terminal 2 — PowerShell)

Mở **terminal thứ hai** và chạy:

```powershell
cd C:\Users\Home\Pictures\cuahangnoithat\frontend
npm run dev
```

Trong lần chạy trước, Vite hiển thị địa chỉ: **http://localhost:5175/**.

> Mở đúng địa chỉ `Local` mà terminal Vite đang hiển thị; số cổng có thể thay đổi nếu cổng trước đó đang được sử dụng. Giữ terminal này mở.

## 4. Tóm tắt lệnh chạy mỗi lần

**Terminal 1 — Backend:**

```powershell
cd C:\Users\Home\Pictures\cuahangnoithat
.\.venv\Scripts\Activate.ps1
cd backend
python -m uvicorn main:app --reload
```

**Terminal 2 — Frontend:**

```powershell
cd C:\Users\Home\Pictures\cuahangnoithat\frontend
npm run dev
```

| Thành phần | Địa chỉ |
|---|---|
| Frontend | http://localhost:5175/ (theo lần chạy trước; kiểm tra terminal) |
| Backend | http://127.0.0.1:8000/ |
| Swagger API | http://127.0.0.1:8000/docs |

## 5. Các lệnh cài đặt (không cần chạy mỗi lần)

Chỉ dùng khi cài đặt lần đầu, tạo lại môi trường hoặc cập nhật các thư viện:

```powershell
# Chạy tại thư mục gốc dự án
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt

# Cài frontend
cd frontend
npm install
```

Không cần chạy lại `python -m venv .venv`, `pip install` hoặc `npm install` mỗi lần khởi động dự án. Không nên tùy tiện dùng `npm audit fix --force` vì có thể gây thay đổi phiên bản không tương thích.

## 6. Dừng dự án

Nhấn **Ctrl + C** ở từng terminal để dừng backend và frontend.

## 7. Lỗi thường gặp

- **`database "cuahangnoithat" does not exist`:** Kiểm tra lại tên database trong cấu hình backend; database thực tế của dự án là `furniture_store_db`.
- **`Expected string or URL object, got None`:** Backend không đọc được biến kết nối database (ví dụ `DATABASE_URL`); kiểm tra file `.env` và cách tải biến môi trường.
- **Frontend không mở được ở cổng 5175:** Xem dòng `Local:` sau khi chạy `npm run dev` để lấy cổng thực tế.
- **API `/api/users/me` trả `401 Unauthorized`:** Có thể là bình thường nếu chưa đăng nhập; không nhất thiết là lỗi khởi động backend.

---

**Ghi nhớ:** PostgreSQL chạy → mở Terminal 1 chạy Backend → mở Terminal 2 chạy Frontend → truy cập địa chỉ `Local` của Vite.
