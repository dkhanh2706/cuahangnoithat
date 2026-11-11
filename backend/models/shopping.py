from sqlalchemy import Column, Integer, DateTime, Numeric, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from database.database import Base


class Cart(Base):
    """Mỗi khách hàng có một giỏ hàng lưu trên máy chủ để dùng được trên nhiều thiết bị."""
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, server_default="1")
    # Giá tại thời điểm lưu; giá thật luôn được kiểm tra lại khi đặt hàng.
    price = Column(Numeric(15, 2), nullable=False)
    __table_args__ = (
        UniqueConstraint("cart_id", "product_id", name="cart_items_cart_id_product_id_key"),
        CheckConstraint("quantity > 0", name="cart_items_quantity_check"),
        CheckConstraint("price >= 0", name="cart_items_price_check"),
    )


class WishlistItem(Base):
    """Danh sách yêu thích lưu theo tài khoản."""
    __tablename__ = "wishlist_items"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
