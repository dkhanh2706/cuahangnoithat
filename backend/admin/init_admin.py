import logging
from database.database import SessionLocal
from models.user import User
from utils.security import hash_password, verify_password

logger = logging.getLogger(__name__)

ADMIN_EMAIL = "adminhdk@gmail.com"
ADMIN_PASSWORD = "1234567890"


def ensure_single_admin():
    """
    Đảm bảo trong hệ thống chỉ có DUY NHẤT 1 tài khoản ADMIN:
    Email: adminhdk@gmail.com
    Password: 1234567890
    Role: ADMIN
    Status: True
    Bất kỳ tài khoản nào khác có role ADMIN sẽ bị chuyển về CUSTOMER.
    """
    try:
        with SessionLocal() as db:
            # 1. Hạ quyền tất cả tài khoản admin khác nếu có
            other_admins = db.query(User).filter(
                User.email != ADMIN_EMAIL,
                User.role == "ADMIN"
            ).all()

            for other in other_admins:
                other.role = "CUSTOMER"
                logger.warning(f"Đã chuyển quyền tài khoản {other.email} từ ADMIN về CUSTOMER.")

            # 2. Tìm hoặc tạo adminhdk@gmail.com
            admin_user = db.query(User).filter(
                User.email == ADMIN_EMAIL
            ).first()

            if not admin_user:
                admin_user = User(
                    full_name="Quản Trị Viên Hệ Thống",
                    email=ADMIN_EMAIL,
                    password_hash=hash_password(ADMIN_PASSWORD),
                    phone="0987654321",
                    address="Hệ thống quản trị FurniHome",
                    role="ADMIN",
                    status=True
                )
                db.add(admin_user)
                logger.info(f"Đã khởi tạo tài khoản quản trị viên duy nhất: {ADMIN_EMAIL}")
            else:
                admin_user.role = "ADMIN"
                admin_user.status = True
                # Đảm bảo mật khẩu luôn khớp 1234567890 theo yêu cầu
                if not verify_password(ADMIN_PASSWORD, admin_user.password_hash):
                    admin_user.password_hash = hash_password(ADMIN_PASSWORD)
                    logger.info(f"Đã cập nhật mật khẩu chuẩn cho {ADMIN_EMAIL}")

            db.commit()
    except Exception as e:
        logger.error(f"Lỗi khi kiểm tra tài khoản admin duy nhất: {e}")
