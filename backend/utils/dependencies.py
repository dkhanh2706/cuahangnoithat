from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from utils.security import decode_access_token


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ"
        )

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Người dùng không tồn tại"
        )

    if not user.status:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa"
        )

    return user


def require_customer(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ khách hàng được phép truy cập"
        )

    return current_user


def require_staff(
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["STAFF", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền nhân viên"
        )

    return current_user


def require_admin(
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ADMIN" or current_user.email != "adminhdk@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ tài khoản quản trị viên duy nhất (adminhdk@gmail.com) mới có quyền truy cập"
        )

    return current_user