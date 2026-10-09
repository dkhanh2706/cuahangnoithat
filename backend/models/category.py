from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    image_url = Column(
        Text,
        nullable=True
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

    products = relationship(
        "Product",
        back_populates="category"
    )