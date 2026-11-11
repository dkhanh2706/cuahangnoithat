import logging
import time

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

import config
from config import ADMIN_EMAIL

from database.database import get_db

from models.user import User

from schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    LoginResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)

from services.email_service import send_password_reset_email
from utils.dependencies import get_current_user

from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_reset_token,
    verify_reset_token,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db)
):

    if data.email.lower() == ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể đăng ký tài khoản quản trị viên hệ thống"
        )

    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được sử dụng"
        )

    new_user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(
            data.password
        ),
        phone=data.phone,
        address=data.address,
        role="CUSTOMER",
        status=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    data: UserLogin,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác"
        )

    if not user.status:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa"
        )

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


# =========================
# ĐỔI / QUÊN / ĐẶT LẠI MẬT KHẨU
# =========================

logger = logging.getLogger(__name__)

FORGOT_MESSAGE = "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu."
FORGOT_COOLDOWN_SECONDS = 60
_last_forgot_request: dict[str, float] = {}


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mật khẩu quản trị viên được cấu hình trong ADMIN_PASSWORD của máy chủ, không đổi tại đây.",
        )

    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không đúng",
        )

    if verify_password(data.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới phải khác mật khẩu hiện tại",
        )

    current_user.password_hash = hash_password(data.new_password)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"message": "Đã đổi mật khẩu thành công"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Luôn trả về cùng một thông báo để không lộ email nào đã đăng ký."""
    email = data.email.strip().lower()

    now = time.monotonic()
    last = _last_forgot_request.get(email)
    if last is not None and now - last < FORGOT_COOLDOWN_SECONDS:
        return {"message": FORGOT_MESSAGE}
    _last_forgot_request[email] = now

    user = db.query(User).filter(func.lower(User.email) == email).first()
    if user and user.status and user.role != "ADMIN":
        token = create_reset_token(user)
        reset_url = f"{config.FRONTEND_URL}/reset-password?token={token}"
        background_tasks.add_task(
            send_password_reset_email, user.email, user.full_name, reset_url
        )

    return {"message": FORGOT_MESSAGE}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = verify_reset_token(
        data.token, lambda user_id: db.query(User).filter(User.id == user_id).first()
    )
    if not user or user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
        )

    user.password_hash = hash_password(data.new_password)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {"message": "Đã đặt lại mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới."}
