"""Initialize tables and catalog in a NEW database. Run from backend.

Existing installations should use the migration scripts instead.
"""
from database.database import Base, SessionLocal, engine
import models  # noqa: F401  Register users, categories, products and images.
import models.order_review  # noqa: F401  Register order and review tables.
import models.store_features  # noqa: F401  Register collection and newsletter tables.
import models.shopping  # noqa: F401  Register cart and wishlist tables.
from models.order_review import Order
from models.category import Category
from database.seed_catalog import CATEGORY_NAMES, seed_catalog
from database.migrate_store_features import seed_collections


def main():
    if engine.dialect.name != "postgresql":
        raise RuntimeError("Database initialization requires PostgreSQL.")

    with engine.begin() as connection:
        # These columns refer to enum types that production already provides.
        Order.__table__.c.status.type.create(connection, checkfirst=True)
        Order.__table__.c.payment_status.type.create(connection, checkfirst=True)
        Base.metadata.create_all(connection)

    with SessionLocal() as db:
        existing = {name for (name,) in db.query(Category.name).all()}
        for name in CATEGORY_NAMES.values():
            if name not in existing:
                db.add(Category(name=name, status=True))
        db.commit()
        seed_catalog(db)
        seed_collections(db)

    print("Database and catalog initialized. Start the API to create the demo admin.")


if __name__ == "__main__":
    main()
