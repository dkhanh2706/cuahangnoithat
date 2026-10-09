from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Numeric,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    category_id = Column(
        Integer,
        ForeignKey(
            "categories.id",
            ondelete="SET NULL"
        ),
        nullable=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    price = Column(
        Numeric(15, 2),
        nullable=False
    )

    material = Column(
        String(100),
        nullable=True
    )

    color = Column(
        String(100),
        nullable=True
    )

    dimensions = Column(
        String(100),
        nullable=True
    )

    stock_quantity = Column(
        Integer,
        nullable=False,
        default=0
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

    # Quan hệ với category
    category = relationship(
        "Category",
        back_populates="products"
    )

    # Quan hệ với ảnh sản phẩm
    images = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan"
    )