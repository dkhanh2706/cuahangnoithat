"""Gửi email giao dịch (hiện dùng cho đặt lại mật khẩu)."""
import logging
import smtplib
import ssl
from email.message import EmailMessage

import config

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool(config.SMTP_HOST and config.SMTP_FROM)


def send_email(to_address: str, subject: str, body: str) -> bool:
    """Gửi một email văn bản thuần. Trả về False nếu chưa cấu hình hoặc gửi lỗi."""
    if not smtp_configured():
        logger.warning(
            "SMTP chưa được cấu hình, không gửi email tới %s. Nội dung:\n%s",
            to_address,
            body,
        )
        return False

    message = EmailMessage()
    message["From"] = config.SMTP_FROM
    message["To"] = to_address
    message["Subject"] = subject
    message.set_content(body)

    try:
        if config.SMTP_USE_SSL:
            with smtplib.SMTP_SSL(
                config.SMTP_HOST,
                config.SMTP_PORT,
                timeout=15,
                context=ssl.create_default_context(),
            ) as server:
                _login_and_send(server, message)
        else:
            with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=15) as server:
                server.starttls(context=ssl.create_default_context())
                _login_and_send(server, message)
    except Exception:
        logger.exception("Không gửi được email tới %s", to_address)
        return False
    return True


def _login_and_send(server, message):
    if config.SMTP_USER:
        server.login(config.SMTP_USER, config.SMTP_PASSWORD)
    server.send_message(message)


def send_password_reset_email(to_address: str, full_name: str, reset_url: str) -> bool:
    body = (
        f"Xin chào {full_name},\n\n"
        "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản CHNT của bạn.\n"
        f"Bấm vào liên kết sau để tạo mật khẩu mới (có hiệu lực {config.RESET_TOKEN_MINUTES} phút, "
        "dùng được một lần):\n\n"
        f"{reset_url}\n\n"
        "Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu hiện tại vẫn an toàn.\n\n"
        "CHNT Interior Living"
    )
    return send_email(to_address, "Đặt lại mật khẩu tài khoản CHNT", body)


def send_new_order_email(to_address: str, order_code: str, receiver_name: str, total, admin_url: str) -> bool:
    body = (
        "Có đơn hàng mới trên CHNT.\n\n"
        f"Mã đơn: {order_code}\n"
        f"Người nhận: {receiver_name}\n"
        f"Tổng tiền: {int(total):,}₫ (thanh toán khi nhận hàng)\n\n"
        f"Xử lý đơn tại: {admin_url}\n"
    )
    return send_email(to_address, f"Đơn hàng mới {order_code}", body)


if __name__ == "__main__":
    # Kiểm tra cấu hình SMTP: python -B -m services.email_service [email_nhan]
    import sys

    sys.stdout.reconfigure(encoding="utf-8")  # console Windows mặc định không in được tiếng Việt
    recipient = sys.argv[1] if len(sys.argv) > 1 else (config.SMTP_USER or config.SMTP_FROM)
    if not smtp_configured():
        print("Chưa cấu hình SMTP: cần SMTP_HOST và SMTP_USER (hoặc SMTP_FROM) trong backend/.env")
        sys.exit(1)
    if not recipient:
        print("Cần truyền email nhận: python -B -m services.email_service ten@gmail.com")
        sys.exit(1)
    ok = send_email(recipient, "Thử gửi email từ CHNT", "Nếu bạn đọc được email này, cấu hình SMTP đã hoạt động.")
    print(f"Đã gửi thử tới {recipient}" if ok else "Gửi thất bại, xem lỗi ở trên.")
    sys.exit(0 if ok else 1)
