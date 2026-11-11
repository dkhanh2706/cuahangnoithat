# Frontend CHNT

Giao diện React + Vite của cửa hàng nội thất CHNT. Hướng dẫn cài đặt, chạy dự án,
cập nhật database và mô tả chi tiết chức năng nằm trong [README gốc](../README.md).

## Lệnh thường dùng

Chạy trong thư mục `frontend`:

```bash
npm install        # cài thư viện
npm run dev        # chạy giao diện tại http://localhost:5175
npm run lint       # kiểm tra mã nguồn
npm run build      # build bản production vào dist/
```

Backend cần chạy song song (`uvicorn main:app --reload` trong thư mục `backend`,
một worker vì chat trực tiếp lưu trong RAM).

## Cấu trúc `src/`

| Thư mục | Nội dung |
| --- | --- |
| `pages/` | Các trang khách hàng (sản phẩm, giỏ hàng, đơn hàng, bộ sưu tập...) |
| `components/` | Thành phần dùng chung: header, footer, chat tư vấn, thẻ đánh giá |
| `admin/` | Trang quản trị: người dùng, sản phẩm, đơn hàng, tư vấn, email đăng ký |
| `context/` | Giỏ hàng và danh sách yêu thích |
| `services/` | Axios (`api.js`), phiên đăng nhập, URL ảnh, chat trực tiếp |
| `data/` | Nội dung trang trí của bộ sưu tập và bộ lọc sản phẩm |
| `styles/` | CSS theo từng trang |

## Lưu ý

- Bộ sưu tập: `src/data/collections.js` chỉ chứa nội dung trang trí; ID, giá, ảnh
  và tồn kho luôn lấy từ API `/api/collections/products`.
- Trang `/admin/*` được tách thành các gói tải riêng (lazy loading).
- Frontend gọi API tại `http://127.0.0.1:8000`, đổi bằng `frontend/.env`
  (xem README gốc).
