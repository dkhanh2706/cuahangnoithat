from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, Enum
from sqlalchemy.sql import func

from database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(100), nullable=False)

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    phone = Column(String(20), nullable=True)

    address = Column(Text, nullable=True)

    role = Column(
        Enum(
            "CUSTOMER",
            "STAFF",
            "ADMIN",
            name="user_role"
        ),
        nullable=False,
        default="CUSTOMER"
    )

    status = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )