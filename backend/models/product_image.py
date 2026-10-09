from sqlalchemy import (
    Column,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database.database import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey(
            "products.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    image_url = Column(
        Text,
        nullable=False
    )

    is_primary = Column(
        Boolean,
        nullable=False,
        default=False
    )

    sort_order = Column(
        Integer,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    product = relationship(
        "Product",
        back_populates="images"
    )