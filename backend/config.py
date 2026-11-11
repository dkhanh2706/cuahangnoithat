"""Cấu hình dùng chung cho backend."""
import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")

# Thư mục ảnh luôn nằm trong backend/, không phụ thuộc nơi chạy uvicorn.
UPLOADS_DIR = BACKEND_DIR / "uploads"

_DEFAULT_CORS_ORIGINS = ",".join(
    f"http://{host}:{port}"
    for port in (5173, 5174, 5175)
    for host in ("localhost", "127.0.0.1")
)

# Có thể đổi bằng biến CORS_ORIGINS trong .env (phân tách bằng dấu phẩy).
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]

# Tài khoản quản trị viên duy nhất của hệ thống (đổi trong .env nếu cần).
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "adminhdk@gmail.com").strip().lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "1234567890")

# Địa chỉ giao diện web, dùng để tạo liên kết đặt lại mật khẩu trong email.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5175").rstrip("/")

# Thời hạn của liên kết đặt lại mật khẩu (phút).
RESET_TOKEN_MINUTES = int(os.getenv("RESET_TOKEN_MINUTES", "30"))

# Cấu hình gửi email (SMTP). Để trống SMTP_HOST thì liên kết chỉ được ghi ra log backend.
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "").strip() or SMTP_USER
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").strip().lower() == "true"

# Email nhận thông báo khi có đơn hàng mới (mặc định là email admin).
ADMIN_NOTIFY_EMAIL = os.getenv("ADMIN_NOTIFY_EMAIL", "").strip() or ADMIN_EMAIL
