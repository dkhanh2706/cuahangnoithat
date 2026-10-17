from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, ForeignKey, CheckConstraint, UniqueConstraint, text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ENUM
from database.database import Base


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    code = Column("order_code", String(50), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    receiver_name = Column(String(100), nullable=False)
    receiver_phone = Column(String(20), nullable=False)
    shipping_address = Column(Text, nullable=False)
    total = Column("total_amount", Numeric(15, 2), nullable=False)
    status = Column(ENUM("PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED",
                         name="order_status", create_type=False, validate_strings=True),
                    nullable=False, server_default=text("'PENDING'"))
    payment_status = Column(ENUM("PENDING", "SUCCESS", "FAILED", "REFUNDED",
                                 name="payment_status", create_type=False, validate_strings=True),
                            nullable=False, server_default=text("'PENDING'"))
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class OrderItem(Base):
    __tablename__ = "order_details"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    product_name = Column(String(150), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(15, 2), nullable=False)
    subtotal = Column(Numeric(15, 2), nullable=False)
    __table_args__ = (CheckConstraint("quantity > 0"),)


class StoreReview(Base):
    __tablename__ = "store_reviews"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    __table_args__ = (
        UniqueConstraint("order_id", name="uq_store_review_order"),
        CheckConstraint("rating >= 1 AND rating <= 5"),
        CheckConstraint("length(trim(content)) >= 1 AND length(content) <= 2000"),
    )


class OrderItemReview(Base):
    __tablename__ = "order_item_reviews"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_item_id = Column(Integer, ForeignKey("order_details.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    __table_args__ = (
        UniqueConstraint("order_item_id", name="uq_review_order_item"),
        CheckConstraint("rating BETWEEN 1 AND 5"),
        CheckConstraint("length(trim(content)) >= 1 AND length(content) <= 2000"),
    )
