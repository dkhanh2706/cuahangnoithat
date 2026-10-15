from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from utils.dependencies import get_current_user

ADMIN_EMAIL = "adminhdk@gmail.com"


def require_super_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Chỉ cho phép tài khoản quản trị viên duy nhất (adminhdk@gmail.com) truy cập.
    """
    if current_user.role != "ADMIN" or current_user.email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập bị từ chối: Chỉ tài khoản Admin duy nhất (adminhdk@gmail.com) mới có quyền quản trị hệ thống."
        )

    return current_user
