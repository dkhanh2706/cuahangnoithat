import math
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, desc, asc, func
from sqlalchemy.orm import Session

from database.database import get_db
from models.user import User
from utils.security import hash_password
from admin.dependencies import require_super_admin, ADMIN_EMAIL
from admin.schemas import (
    AdminUserCreate,
    AdminUserUpdate,
    AdminPasswordReset,
    AdminUserStatusUpdate,
    AdminUserResponse,
    AdminUserListResponse,
    AdminStatsResponse
)

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Management"],
    dependencies=[Depends(require_super_admin)]
)


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(db: Session = Depends(get_db)):
    """
    Thống kê tổng quan về tài khoản người dùng cho bảng điều khiển admin.
    """
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.status == True).scalar() or 0
    locked_users = db.query(func.count(User.id)).filter(User.status == False).scalar() or 0
    customer_count = db.query(func.count(User.id)).filter(User.role == "CUSTOMER").scalar() or 0
    staff_count = db.query(func.count(User.id)).filter(User.role == "STAFF").scalar() or 0
    admin_count = db.query(func.count(User.id)).filter(User.role == "ADMIN").scalar() or 0

    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_users_count = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "locked_users": locked_users,
        "customer_count": customer_count,
        "staff_count": staff_count,
        "admin_count": admin_count,
        "recent_users_count": recent_users_count,
    }


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    page: int = Query(1, ge=1, description="Số trang hiện tại"),
    limit: int = Query(10, ge=1, le=100, description="Số lượng người dùng trên mỗi trang"),
    q: Optional[str] = Query(None, description="Từ khóa tìm kiếm (tên, email, số điện thoại)"),
    role: Optional[str] = Query(None, description="Lọc theo vai trò: CUSTOMER, STAFF, ADMIN"),
    status: Optional[bool] = Query(None, description="Lọc theo trạng thái: true/false"),
    sort_by: str = Query("created_at", description="Trường sắp xếp: created_at, id, full_name, email"),
    order: str = Query("desc", description="Thứ tự sắp xếp: asc hoặc desc"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách người dùng có phân trang, tìm kiếm và lọc.
    """
    query = db.query(User)

    if q and isinstance(q, str) and q.strip():
        search = f"%{q.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search),
                User.email.ilike(search),
                User.phone.ilike(search)
            )
        )

    if role and isinstance(role, str) and role.upper() in ["CUSTOMER", "STAFF", "ADMIN"]:
        query = query.filter(User.role == role.upper())

    if status is not None and isinstance(status, bool):
        query = query.filter(User.status == status)

    total = query.count()

    # Chuẩn hóa tham số an toàn khi gọi trực tiếp hoặc qua FastAPI
    page_num = page if isinstance(page, int) else 1
    limit_num = limit if isinstance(limit, int) else 10
    sort_by_str = sort_by if isinstance(sort_by, str) else "created_at"
    order_str = order if isinstance(order, str) else "desc"

    # Sắp xếp
    sort_column = getattr(User, sort_by_str, User.created_at)
    if order_str.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    offset = (page_num - 1) * limit_num
    users = query.offset(offset).limit(limit_num).all()

    total_pages = math.ceil(total / limit_num) if total > 0 else 1

    return {
        "items": users,
        "total": total,
        "page": page_num,
        "limit": limit_num,
        "total_pages": total_pages,
    }


@router.get("/users/{user_id}", response_model=AdminUserResponse)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Lấy chi tiết một người dùng theo ID.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )
    return user


@router.post("/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: AdminUserCreate,
    db: Session = Depends(get_db)
):
    """
    Tạo người dùng mới từ trang quản trị.
    TUYỆT ĐỐI không cho phép tạo tài khoản có vai trò ADMIN.
    """
    # Kiểm tra trùng email
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Địa chỉ email này đã được sử dụng trong hệ thống"
        )

    # Đảm bảo vai trò không phải ADMIN
    if data.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quy tắc hệ thống: Không thể tạo thêm tài khoản Admin. Chỉ có 1 Admin duy nhất."
        )

    new_user = User(
        full_name=data.full_name.strip(),
        email=data.email.strip().lower(),
        password_hash=hash_password(data.password),
        phone=data.phone.strip() if data.phone else None,
        address=data.address.strip() if data.address else None,
        role=data.role,
        status=data.status
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.put("/users/{user_id}", response_model=AdminUserResponse)
def update_user(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db)
):
    """
    Cập nhật thông tin người dùng.
    Bảo vệ tài khoản admin duy nhất và ngăn chặn nâng quyền admin cho tài khoản khác.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )

    is_main_admin = (user.email.lower() == ADMIN_EMAIL.lower())

    if is_main_admin:
        # Nếu là tài khoản admin duy nhất, cấm hạ vai trò hoặc khóa tài khoản
        if data.role and data.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể thay đổi vai trò của tài khoản quản trị viên tối cao"
            )
        if data.status is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể khóa tài khoản quản trị viên tối cao"
            )
    else:
        # Đối với tài khoản khác: TUYỆT ĐỐI KHÔNG ĐƯỢC CHUYỂN THÀNH ADMIN
        if data.role == "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hệ thống quy định chỉ có 1 Admin duy nhất (adminhdk@gmail.com). Không thể thăng cấp thêm Admin."
            )

    if data.full_name is not None:
        user.full_name = data.full_name.strip()
    if data.phone is not None:
        user.phone = data.phone.strip() if data.phone else None
    if data.address is not None:
        user.address = data.address.strip() if data.address else None
    if data.role is not None and not (is_main_admin and data.role != "ADMIN"):
        user.role = data.role
    if data.status is not None and not (is_main_admin and data.status is False):
        user.status = data.status

    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/status", response_model=AdminUserResponse)
def toggle_user_status(
    user_id: int,
    payload: Optional[AdminUserStatusUpdate] = None,
    db: Session = Depends(get_db)
):
    """
    Khóa hoặc kích hoạt tài khoản người dùng.
    Không thể khóa tài khoản Admin chính.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )

    if user.email.lower() == ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản quản trị viên tối cao không thể bị khóa"
        )

    if payload is not None:
        user.status = payload.status
    else:
        user.status = not user.status

    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    data: AdminPasswordReset,
    db: Session = Depends(get_db)
):
    """
    Đặt lại mật khẩu cho tài khoản người dùng.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )

    user.password_hash = hash_password(data.new_password)
    db.commit()

    return {
        "message": f"Đặt lại mật khẩu cho tài khoản {user.email} thành công"
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Xóa tài khoản người dùng.
    Tuyệt đối không thể xóa tài khoản Admin duy nhất.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại"
        )

    if user.email.lower() == ADMIN_EMAIL.lower() or user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể xóa tài khoản Quản trị viên tối cao"
        )

    db.delete(user)
    db.commit()

    return {
        "message": f"Đã xóa tài khoản {user.email} thành công"
    }
