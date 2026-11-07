from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Float
from sqlalchemy.sql import func
from database.database import Base


class CollectionProduct(Base):
    __tablename__ = "curated_collection_products"
    id = Column(Integer, primary_key=True)
    collection_slug = Column(String(100), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, nullable=False)
    hotspot_x = Column(Float, nullable=True)
    hotspot_y = Column(Float, nullable=True)
    __table_args__ = (UniqueConstraint("collection_slug", "product_id", name="uq_collection_product"),)


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    id = Column(Integer, primary_key=True)
    email = Column(String(254), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
