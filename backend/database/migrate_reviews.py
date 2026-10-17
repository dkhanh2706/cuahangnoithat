"""Run from backend: python -m database.migrate_reviews. Creates store_reviews only."""
from database.database import Base, engine
import models
from models.order_review import Order, OrderItem, StoreReview


if __name__ == "__main__":
    Base.metadata.create_all(engine, tables=[StoreReview.__table__])
    print("Created table if missing: store_reviews")
