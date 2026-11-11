import hashlib
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

import config

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()


SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "change-this-secret-key"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
):
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(
            timezone.utc
        ) + expires_delta
    else:
        expire = datetime.now(
            timezone.utc
        ) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None


RESET_PURPOSE = "password-reset"


def _password_fingerprint(password_hash: str) -> str:
    return hashlib.sha256(password_hash.encode()).hexdigest()[:16]


def create_reset_token(user) -> str:
    """Token đặt lại mật khẩu: không cần lưu database.

    Gắn với dấu vân tay của mật khẩu hiện tại nên chỉ dùng được một lần:
    khi mật khẩu đổi, mọi token cũ tự mất hiệu lực.
    """
    return create_access_token(
        {
            "sub": str(user.id),
            "purpose": RESET_PURPOSE,
            "fp": _password_fingerprint(user.password_hash),
        },
        expires_delta=timedelta(minutes=config.RESET_TOKEN_MINUTES),
    )


def verify_reset_token(token: str, user_loader):
    """Trả về user nếu token hợp lệ, ngược lại None. user_loader(user_id) -> user."""
    payload = decode_access_token(token)
    if not payload or payload.get("purpose") != RESET_PURPOSE:
        return None
    try:
        user = user_loader(int(payload.get("sub")))
    except (TypeError, ValueError):
        return None
    if not user or not user.status:
        return None
    if payload.get("fp") != _password_fingerprint(user.password_hash):
        return None
    return user
