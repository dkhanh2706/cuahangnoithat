from fastapi import APIRouter, Depends

from models.user import User
from utils.dependencies import (
    get_current_user,
    require_staff,
    require_admin
)


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "address": current_user.address,
        "role": current_user.role,
        "status": current_user.status
    }


@router.get("/staff-test")
def staff_test(
    current_user: User = Depends(require_staff)
):
    return {
        "message": "Bạn có quyền STAFF hoặc ADMIN",
        "user": current_user.email
    }


@router.get("/admin-test")
def admin_test(
    current_user: User = Depends(require_admin)
):
    return {
        "message": "Bạn có quyền ADMIN",
        "user": current_user.email
    }