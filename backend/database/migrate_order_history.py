"""Run from backend: python -B -m database.migrate_order_history."""
from database.database import Base, engine
import models
from models.order_review import OrderItemReview


if __name__ == "__main__":
    Base.metadata.create_all(engine, tables=[OrderItemReview.__table__])
    print("Created table if missing: order_item_reviews")
