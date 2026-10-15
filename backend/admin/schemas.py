from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


class AdminUserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    role: Literal["CUSTOMER", "STAFF"] = "CUSTOMER"
    status: bool = True

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if v.strip().lower() == "adminhdk@gmail.com":
            raise ValueError("Không thể tạo tài khoản với email quản trị viên hệ thống")
        return v.strip().lower()

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v == "ADMIN":
            raise ValueError("Không thể tạo tài khoản với vai trò ADMIN. Hệ thống chỉ có 1 Admin duy nhất.")
        return v


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    role: Optional[Literal["CUSTOMER", "STAFF", "ADMIN"]] = None
    status: Optional[bool] = None


class AdminPasswordReset(BaseModel):
    new_password: str = Field(min_length=6, max_length=100)


class AdminUserStatusUpdate(BaseModel):
    status: bool


class AdminUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str
    status: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseModel):
    items: list[AdminUserResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    locked_users: int
    customer_count: int
    staff_count: int
    admin_count: int
    recent_users_count: int
