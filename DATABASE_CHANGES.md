# Thay đổi database: lịch sử đơn hàng và đánh giá sản phẩm

## Ảnh đại diện và hồ sơ cá nhân — 18/10/2026

### Thay đổi cấu trúc đã áp dụng

- Đã chạy `python -B -m database.migrate_user_avatar` trên PostgreSQL của dự án.
- Thêm **một cột `users.avatar_url TEXT NULL`**, không có giá trị mặc định, không thêm index hay ràng buộc. Các tài khoản hiện có nhận NULL và tiếp tục hiển thị chữ cái đầu tên khi chưa có ảnh.
- SQL: `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`. Có thể chạy lại, không thêm trùng cột. Không thay đổi cột cũ, bảng khác hay ENUM; không tạo tài khoản/ảnh mẫu.

### Dữ liệu ghi khi sử dụng

- `POST /api/users/me/avatar`: chỉ cập nhật `users.avatar_url` của tài khoản đang đăng nhập, trả về hồ sơ đã lưu. Ảnh JPG/PNG/WebP tối đa 5 MB được kiểm tra MIME và chữ ký định dạng; lưu thành tên UUID trong `uploads/avatars` tại thư mục chạy backend và phục vụ qua `/uploads/avatars/<tên-file>`. Không lưu dữ liệu nhị phân ảnh trong database, không dùng tên file do người dùng gửi để tạo đường dẫn.
- Mỗi lần đổi ảnh tạo file mới, cập nhật URL trong cùng tài khoản. File ảnh cũ vẫn được giữ; không tự xóa file đang dùng trong các nơi khác. Nếu ghi database thất bại, transaction rollback và file mới được dọn.
- `PATCH /api/users/me`: lưu `full_name`, `phone`, `address` của tài khoản hiện tại vào database thay cho cách chỉ lưu localStorage trước đây. Email đăng nhập hiển thị chỉ đọc; API này không đổi email, quyền, trạng thái hay mật khẩu. Tên được trim, dài 2–100 ký tự; điện thoại tối đa 20 ký tự; địa chỉ tối đa 2000 ký tự.
- Theo model có sẵn, cập nhật tài khoản cũng cập nhật `users.updated_at`. Không cập nhật tài khoản khác.
- `GET /api/users/me` và phản hồi đăng nhập bổ sung `avatar_url`; đây là thao tác đọc. Frontend cập nhật cache hồ sơ ở localStorage và thông báo header ngay sau khi lưu; ảnh hiển thị cạnh tên trên desktop và phần tài khoản trên mobile, giữ lại khi đăng nhập lại.
- Gỡ tab lịch sử đơn hàng và dữ liệu đơn mẫu khỏi Profile; không xóa đơn trong database. Lịch sử thật vẫn ở `/orders`.
- Kiểm thử upload và cập nhật hồ sơ dùng SQLite cùng thư mục tạm, không cập nhật hồ sơ hoặc tải ảnh thử lên database thật.

Chạy migration trên môi trường khác từ thư mục `backend`:

```powershell
python -B -m database.migrate_user_avatar
```

Sau đó khởi động lại backend nếu không dùng reload.

## Bổ sung danh mục sản phẩm — 18/10/2026

Đã chạy `python -B -m database.seed_catalog` trên PostgreSQL cấu hình trong dự án:

- **INSERT 28 bản ghi `products`**, ID **6–33**. Tổng sản phẩm tăng từ **4 lên 32**. Các trường được ghi: `category_id`, `name`, `description`, `price`, `material`, `color`, `dimensions`, `stock_quantity`, `status = true`. `id` tự tăng; `created_at`, `updated_at` theo mặc định database.
- **INSERT 57 bản ghi `product_images`**. Các trường: `product_id`, `image_url`, `is_primary`, `sort_order`; `id`, `created_at` tự sinh. Mỗi sản phẩm mới có đúng một ảnh chính, các ảnh còn lại là ảnh phụ. Tổng ảnh tăng từ **0 lên 57**.
- Tận dụng 6 danh mục hiện có: Sofa, Bàn, Ghế, Giường, Tủ, Đèn. Không thêm/sửa danh mục và không UPDATE/DELETE 4 sản phẩm cũ.
- Sequence khóa chính của `products` và `product_images` tăng theo bản ghi mới. Không thay đổi bảng/cột/index/ENUM, không cần migration cấu trúc.
- Nội dung, giá và tồn kho là dữ liệu danh mục minh họa lấy từ bộ 28 sản phẩm đã có trong dự án, nay được lưu thật để dùng với API và thanh toán giả lập. Không chép điểm sao, đánh giá, lượt bán hoặc số đánh giá giả vào database.
- Ảnh là URL Unsplash từ bộ nội dung hiện có, không tải file lên `uploads`; hình ảnh có thể mang tính minh họa và phụ thuộc kết nối Internet.
- Không thêm đơn hàng, đánh giá, thanh toán hoặc giao dịch kho. Không thay đổi dữ liệu tài khoản.
- File dữ liệu đầy đủ: [catalog_products.json](backend/database/catalog_products.json). Script: [seed_catalog.py](backend/database/seed_catalog.py). Khi chạy lại, sản phẩm trùng tên được bỏ qua; không cập nhật đè dữ liệu hoặc thêm ảnh trùng cho những sản phẩm đó.

Danh sách đã thêm (giá VND):

| ID | Sản phẩm | Giá | Tồn kho | Số ảnh |
| --- | --- | ---: | ---: | ---: |
| 6 | Sofa Góc L-Shape Scandinavia Nord | 18500000 | 12 | 3 |
| 7 | Bàn Trà Tròn Đôi Slate Marble & Walnut | 6800000 | 18 | 2 |
| 8 | Ghế Thư Giãn Lounge Chair Eames Style | 14200000 | 8 | 2 |
| 9 | Giường Ngủ Nhật Bản Muji Zen Minimalist | 15900000 | 10 | 2 |
| 10 | Bàn Ăn Mở Rộng Bắc Âu OAK Nature | 13500000 | 14 | 2 |
| 11 | Bộ 4 Ghế Ăn Bọc Đệm Elbow Hans Wegner | 5200000 | 25 | 2 |
| 12 | Tủ Kệ Tivi Gỗ Óc Chó Walnut Floating Console | 9900000 | 9 | 2 |
| 13 | Bàn Làm Việc Studio Desk Gỗ Sồi Có Ngăn Kéo | 7500000 | 15 | 2 |
| 14 | Sofa Văng Đôi 2 Chỗ Cozy Velvet Green | 11200000 | 7 | 2 |
| 15 | Giường Ngủ Bọc Vải Nệm Cloud King Size | 17800000 | 5 | 2 |
| 16 | Tủ Quần Áo Cánh Kính Khung Nhôm Minimalist | 24500000 | 3 | 2 |
| 17 | Đèn Cây Đứng Nordic Arc Brass Floor Lamp | 3600000 | 22 | 2 |
| 18 | Tủ Đầu Giường Gỗ Tần Bì Có Ngăn Khóa Nightstand | 2800000 | 16 | 2 |
| 19 | Ghế Làm Việc Công Thái Học Herman Leather Office Chair | 8900000 | 11 | 2 |
| 20 | Kệ Sách Cây Khung Thép 5 Tầng Bookshelf Minimal | 4900000 | 0 | 2 |
| 21 | Đèn Thả Bàn Ăn 3 Bóng Nghệ Thuật Trio Pendant | 3200000 | 13 | 2 |
| 22 | Sofa Đơn Accent Chair Bọc Nhung Blush Pink | 6900000 | 9 | 2 |
| 23 | Bàn Trang Điểm Gỗ Sồi Gương LED Vanity Table | 8400000 | 8 | 2 |
| 24 | Kệ Trang Trí Floating Wall Shelf Gỗ Tần Bì 3 Tầng | 2200000 | 30 | 2 |
| 25 | Sofa 3 Chỗ Bọc Da Ý Premium Leather Milano | 28500000 | 4 | 2 |
| 26 | Bàn Cà Phê Gỗ Tái Chế Reclaimed Wood Coffee Table | 4500000 | 12 | 2 |
| 27 | Tủ Bếp Trên Dưới Hiện Đại Kitchen Cabinet Set | 22000000 | 6 | 2 |
| 28 | Ghế Bar Cao Chân Gỗ Bọc Da PU Counter Stool | 1850000 | 20 | 2 |
| 29 | Đèn Ngủ Để Bàn Ceramic Table Lamp Gốm Thủ Công | 1250000 | 28 | 2 |
| 30 | Bàn Làm Việc Đứng Điều Chỉnh Điện Standing Desk | 12500000 | 10 | 2 |
| 31 | Tủ Giày Cửa Gỗ Kết Hợp Gương Full-Length Shoe Cabinet | 5800000 | 11 | 2 |
| 32 | Ghế Xích Đu Trong Nhà Rattan Swing Chair Boho | 3900000 | 7 | 2 |
| 33 | Sofa Góc Modular 5 Module Cấu Hình Tự Do | 24900000 | 5 | 2 |

Kiểm tra trên SQLite độc lập: dữ liệu đáp ứng schema sản phẩm, mỗi sản phẩm có một ảnh chính, chạy seed hai lần không tăng thêm sản phẩm/ảnh. Việc bổ sung được ghi trong một transaction.

## Xóa đánh giá — 18/10/2026

- Thêm `DELETE /api/product-reviews/{review_id}`: yêu cầu đăng nhập và chỉ cho phép xóa đánh giá thuộc tài khoản hiện tại. Đánh giá không tồn tại hoặc thuộc người khác đều trả 404; chưa đăng nhập bị từ chối.
- Khi người dùng xác nhận xóa trong lịch sử đơn hàng, API thực hiện DELETE đúng một bản ghi trong `order_item_reviews` theo `id` và `user_id`. Đây là xóa vĩnh viễn bản ghi, không phải ẩn đánh giá.
- Không sửa/xóa đơn hàng, chi tiết đơn, sản phẩm, tài khoản hoặc file ảnh. URL ảnh chỉ nằm trong bản ghi đánh giá được xóa, file ảnh sản phẩm vẫn được giữ nguyên.
- Đánh giá bị loại khỏi danh sách công khai và Góc chia sẻ. Sản phẩm được mở lại nút đánh giá; khi gửi lại, điều kiện đơn đã thanh toán và chưa hủy vẫn được kiểm tra.
- Không thay đổi cấu trúc database, không thêm bảng/cột/index/ENUM hay migration. Không xóa dữ liệu thật trong quá trình phát triển; kiểm thử dùng SQLite trong bộ nhớ.

## Sửa lỗi ENUM thanh toán — 17/10/2026

- Sửa model `Order.status` từ `String` sang ENUM PostgreSQL có sẵn `order_status`: `PENDING`, `CONFIRMED`, `SHIPPING`, `COMPLETED`, `CANCELLED`.
- Sửa model `Order.payment_status` từ `String` sang ENUM PostgreSQL có sẵn `payment_status`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`.
- Đặt `create_type=False`: chỉ ánh xạ đúng kiểu đã có, không tạo hay sửa ENUM trong database. Không ALTER bảng/cột, không thêm migration, không chuyển đổi dữ liệu.
- Nguyên nhân lỗi 500 trước đây: psycopg gửi `SUCCESS` dưới dạng `VARCHAR`, PostgreSQL không tự ép kiểu đó sang ENUM `payment_status`.
- Kiểm chứng INSERT, SELECT và UPDATE trên PostgreSQL bằng bảng TEMPORARY trong transaction được rollback; không ghi đơn, sản phẩm hay đánh giá thử vào bảng nghiệp vụ, không tăng sequence của bảng nghiệp vụ.
- Bỏ sản phẩm mẫu khỏi danh sách mua hàng, phần nổi bật và sản phẩm liên quan. Chi tiết không tự chuyển sang sản phẩm mẫu khi API trả 404. Đây là thay đổi frontend, không thêm sản phẩm mẫu hay sửa dữ liệu sản phẩm trong database.

## Bản cập nhật hiện tại — 17/10/2026

Phần này thay thế mô tả thanh toán giả lập ở các ghi chú lịch sử bên dưới. Đã chạy `python -B -m database.migrate_order_history` trên PostgreSQL được cấu hình trong dự án. Trước migration, bảng `order_item_reviews` chưa tồn tại. Không tạo đơn hay đánh giá mẫu trên database thật.

### 1. Thay đổi cấu trúc đã áp dụng

Tạo mới duy nhất bảng **order_item_reviews**:

| Cột | Kiểu PostgreSQL | Ràng buộc / ý nghĩa |
| --- | --- | --- |
| id | SERIAL / INTEGER | Khóa chính tự tăng; sequence `order_item_reviews_id_seq` |
| user_id | INTEGER | NOT NULL; khóa ngoại đến `users.id` |
| order_item_id | INTEGER | NOT NULL; khóa ngoại đến `order_details.id` |
| rating | INTEGER | NOT NULL; CHECK từ 1 đến 5 |
| content | TEXT | NOT NULL; CHECK nội dung trim không rỗng và dài tối đa 2000 ký tự |
| image_url | TEXT | Cho phép NULL; lưu URL ảnh sản phẩm tại thời điểm gửi đánh giá |
| created_at | TIMESTAMP WITHOUT TIME ZONE | NOT NULL; mặc định `now()` |

- UNIQUE `uq_review_order_item` trên `order_item_id`: mỗi sản phẩm trong một đơn được đánh giá một lần, kể cả khi số lượng mua lớn hơn 1. Cùng sản phẩm trong đơn khác có thể đánh giá tiếp.
- PostgreSQL tạo index cho khóa chính và UNIQUE; không thêm index riêng khác.
- Hai khóa ngoại dùng hành vi mặc định, không tự xóa đánh giá khi xóa người dùng hay chi tiết đơn.
- Không ALTER/DROP bảng hoặc cột cũ; không sửa enum, trigger, dữ liệu hay cấu hình database cũ.
- Giữ nguyên bảng `store_reviews` và `reviews` cũ; giao diện mới dùng `order_item_reviews`. Đánh giá cửa hàng cũ không tự chuyển thành đánh giá sản phẩm.
- Ảnh là ảnh sản phẩm từ `product_images`, ưu tiên ảnh chính rồi thứ tự hiển thị. Khi gửi đánh giá, URL được chụp lại trong `image_url`; không có chức năng tải ảnh người dùng lên trong bản này. Nếu sản phẩm chưa có ảnh thì không tạo ảnh mẫu.

### 2. Dữ liệu sẽ ghi khi người dùng thao tác

**Thanh toán giả lập — `POST /api/orders/demo`**, yêu cầu tài khoản khách hàng đăng nhập:

- INSERT vào `orders`: `user_id`, `order_code` tiền tố `DEMO-`, `receiver_name`, `receiver_phone`, `shipping_address`, `total_amount`, `payment_status = 'SUCCESS'`. `status` giữ mặc định `PENDING`; thời gian theo mặc định database. `SUCCESS` ở đơn DEMO chỉ biểu thị hoàn tất giả lập, không chứng minh thu tiền thật.
- INSERT từng sản phẩm vào `order_details`: `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `subtotal`. Sản phẩm trùng trong giỏ được gộp số lượng.
- Server lấy giá và kiểm tra số lượng tồn hiện tại, tính mã giảm FURNI10/FURNI20 và phí vận chuyển. Mã giảm giá khác không được giảm. Đơn và chi tiết được ghi trong cùng transaction.
- **Không UPDATE `products.stock_quantity` hoặc `products.updated_at` khi thanh toán giả lập**, không tạo giao dịch trong `payments` hay `inventory_transactions`, không gọi MoMo hoặc thu tiền.
- Chỉ xóa giỏ hàng trong trình duyệt sau khi API lưu đơn thành công. Không ghi vào bảng `carts`/`cart_items`.
- Đơn DEMO được hiển thị rõ trong lịch sử để phân biệt với đơn thật.

**Đánh giá — `POST /api/product-reviews`**:

- INSERT vào `order_item_reviews`: `user_id`, `order_item_id`, `rating`, `content`, `image_url`; thời gian được tạo tự động.
- Chỉ chủ đơn được đánh giá; đơn phải `SUCCESS` và không `CANCELLED`. Áp dụng cả đơn DEMO theo lựa chọn giả lập của dự án.
- Không UPDATE đơn, sản phẩm hay tên người dùng khi gửi đánh giá. Tên hiển thị lấy từ `users.full_name` hiện tại.
- Công khai ngay tên, nội dung, sao, tên và ảnh sản phẩm, ngày đánh giá; không công khai số điện thoại, địa chỉ, mã đơn hay tổng tiền.
- `GET /api/orders` chỉ đọc đơn của tài khoản đăng nhập, có phân trang. `GET /api/product-reviews` đọc đánh giá công khai, mới nhất trước. Home đọc tối đa 6 đánh giá mới nhất, không dùng đánh giá mẫu, không hiện mục này khi chưa có đánh giá.

API `POST /api/orders` cũ vẫn tạo đơn thường với `payment_status = PENDING` và trừ tồn kho như trước; nút thanh toán giả lập trên giao diện không gọi API này. Khi tích hợp MoMo, cần thay nút bằng luồng thanh toán thật, xác thực IPN trước khi đánh dấu SUCCESS và vô hiệu hóa endpoint DEMO trong môi trường bán hàng thật. Không cần xóa lịch sử DEMO hay sửa bảng đánh giá để tích hợp MoMo.

### 3. Chạy trên môi trường khác

Từ thư mục `backend`, dùng Python có các dependency của backend:

```powershell
python -B -m database.migrate_order_history
```

Migration chỉ tạo bảng `order_item_reviews` nếu thiếu, chạy lại không tạo trùng. Các bảng `users`, `orders`, `order_details`, `products`, `product_images` cần có sẵn. Khởi động lại backend nếu không dùng reload.

Kiểm thử từ thư mục gốc (SQLite trong bộ nhớ, không ghi database thật):

```powershell
.venv/Scripts/python.exe -B -m unittest discover -s backend/tests -v
```

---

## Ghi chú lịch sử của phiên bản trước (không mô tả luồng hiện tại)

## Cập nhật: dùng thanh toán giả lập

Nút ở giỏ hàng hiện là **Thanh toán giả lập**: chỉ tạo mã DEMO trên giao diện, hiển thị thành công và xóa giỏ hàng trong trình duyệt. Không yêu cầu đăng nhập, không gọi `POST /api/orders`, không lưu đơn hay trừ tồn kho trong database. Lần sửa này không thay đổi database.

Đơn giả lập không mở quyền viết đánh giá thật. Quyền đánh giá vẫn được kiểm tra theo đơn đã lưu trong database. Các mô tả API đặt hàng bên dưới áp dụng khi gọi API thật; nút giả lập hiện không sử dụng API này.

## Đã áp dụng trong phiên làm việc này

Đã chạy `python -B -m database.migrate_reviews` trong thư mục `backend` trên PostgreSQL cấu hình trong dự án.

Chỉ tạo mới bảng **store_reviews** (trước khi chạy, bảng này chưa tồn tại):

| Cột | Kiểu | Ràng buộc |
| --- | --- | --- |
| id | INTEGER / SERIAL | Khóa chính, tự tăng; sequence `store_reviews_id_seq` |
| user_id | INTEGER | NOT NULL, khóa ngoại đến `users.id` |
| order_id | INTEGER | NOT NULL, khóa ngoại đến `orders.id` |
| rating | INTEGER | NOT NULL, từ 1 đến 5 |
| content | TEXT | NOT NULL, nội dung sau khi bỏ khoảng trắng hai đầu không rỗng, tối đa 2000 ký tự |
| created_at | TIMESTAMP | NOT NULL, mặc định thời gian hiện tại |

Ràng buộc `uq_store_review_order` bảo đảm mỗi đơn chỉ có một đánh giá; PostgreSQL tạo chỉ mục unique tương ứng và chỉ mục cho khóa chính. Khóa ngoại dùng hành vi mặc định: không tự xóa đánh giá khi xóa người dùng hoặc đơn hàng liên quan.

Không sửa cấu trúc bảng cũ. Không thêm/sửa/xóa bản ghi nào trong database thật, không tạo đánh giá hoặc đơn hàng mẫu. Không chạy hàm khởi tạo admin của ứng dụng. Các bài kiểm thử dùng SQLite trong bộ nhớ, tách biệt database thật.

## Dữ liệu ứng dụng sẽ ghi khi người dùng thao tác

- Đặt hàng thành công: thêm một bản ghi vào bảng có sẵn `orders`, gồm `user_id`, `order_code`, `receiver_name`, `receiver_phone`, `shipping_address`, `total_amount`. `status` và `payment_status` dùng mặc định `PENDING`; các cột thời gian dùng mặc định database. Đặt hàng thành công không đồng nghĩa đã thanh toán.
- Thêm từng sản phẩm vào bảng có sẵn `order_details`: `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `subtotal`.
- Trừ `products.stock_quantity` theo số lượng đặt. Model hiện tại cũng cập nhật `products.updated_at` khi cập nhật tồn kho. Giá và tồn kho được kiểm tra ở server; đơn, chi tiết và tồn kho được ghi trong cùng giao dịch. PostgreSQL khóa các dòng sản phẩm khi đặt hàng để tránh bán quá tồn kho.
- Áp dụng mã FURNI10/FURNI20 ở server; phí vận chuyển 150.000đ nếu tổng tiền hàng dưới 2.000.000đ. Không ghi bản ghi thanh toán vào bảng `payments`.
- Gửi đánh giá: thêm một bản ghi vào `store_reviews`, gắn tài khoản đăng nhập và đơn thuộc tài khoản đó. Không cho đánh giá đơn `CANCELLED`. Mỗi đơn một đánh giá, hiển thị công khai ngay; không có bước duyệt.
- Không sử dụng bảng `reviews` cũ vì bảng đó dành cho đánh giá từng sản phẩm. Đánh giá mới là đánh giá chung của cửa hàng tại `/reviews`.

## Triển khai ở database khác

Từ thư mục `backend`, chạy một lần trước khi sử dụng:

```powershell
python -m database.migrate_reviews
```

Lệnh chỉ tạo bảng `store_reviews` nếu còn thiếu. Hai bảng `orders` và `order_details` phải tồn tại theo cấu trúc hiện tại của dự án. Sau đó khởi động lại backend nếu không dùng chế độ reload.

Kiểm thử tính năng, từ thư mục gốc:

```powershell
.venv/Scripts/python.exe -B -m unittest discover -s backend/tests -v
```
