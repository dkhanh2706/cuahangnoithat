from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from database.database import get_db
from schemas.user import UserResponse

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


@router.get("/me", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


class ProfileInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(default="", max_length=20)
    address: str = Field(default="", max_length=2000)

    @field_validator("full_name", "phone", "address", mode="before")
    @classmethod
    def trim_text(cls, value):
        return value.strip() if isinstance(value, str) else value


@router.patch("/me", response_model=UserResponse)
def update_profile(data: ProfileInput, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.full_name = data.full_name
    current_user.phone = data.phone or None
    current_user.address = data.address or None
    try:
        db.commit()
        db.refresh(current_user)
    except Exception:
        db.rollback()
        raise
    return current_user


AVATAR_DIR = Path("uploads") / "avatars"
MAX_AVATAR_BYTES = 5 * 1024 * 1024


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        content = await file.read(MAX_AVATAR_BYTES + 1)
    finally:
        await file.close()
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(413, "Ảnh đại diện tối đa 5 MB.")
    extension = None
    if file.content_type == "image/png" and content.startswith(b"\x89PNG\r\n\x1a\n"):
        extension = ".png"
    elif file.content_type == "image/jpeg" and content.startswith(b"\xff\xd8\xff"):
        extension = ".jpg"
    elif file.content_type == "image/webp" and content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        extension = ".webp"
    if not extension:
        raise HTTPException(400, "Vui lòng chọn ảnh JPG, PNG hoặc WebP hợp lệ.")
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    filename = uuid4().hex + extension
    destination = AVATAR_DIR / filename
    try:
        destination.write_bytes(content)
        current_user.avatar_url = "/uploads/avatars/" + filename
        db.commit()
        db.refresh(current_user)
    except Exception:
        db.rollback()
        destination.unlink(missing_ok=True)
        raise
    return current_user


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
