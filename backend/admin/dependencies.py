from fastapi import Depends, HTTPException, status

from models.user import User
from utils.dependencies import get_current_user

from config import ADMIN_EMAIL


def require_super_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Chỉ cho phép tài khoản quản trị viên duy nhất của hệ thống truy cập.
    """
    if current_user.role != "ADMIN" or current_user.email.lower() != ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Truy cập bị từ chối: Chỉ tài khoản Admin duy nhất mới có quyền quản trị hệ thống."
        )

    return current_user
