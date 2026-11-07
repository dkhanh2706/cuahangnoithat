"""Run from backend: python -B -m database.migrate_store_features.

Adds collection membership and newsletter tables; preserves existing data.
"""
import json
from pathlib import Path
from database.database import Base, engine, SessionLocal
import models
from models.product import Product
from models.store_features import CollectionProduct, NewsletterSubscriber


def seed_collections(db):
    manifest = json.loads(Path(__file__).with_name("collection_memberships.json").read_text(encoding="utf-8"))
    products = {p.name: p for p in db.query(Product).order_by(Product.id).all()}
    existing = {(row.collection_slug, row.product_id) for row in db.query(CollectionProduct).all()}
    for collection in manifest:
        for position, item in enumerate(collection["products"]):
            product = products.get(item["name"])
            if product is None or (collection["slug"], product.id) in existing:
                continue
            hotspot = item["hotspot"] or {}
            db.add(CollectionProduct(collection_slug=collection["slug"], product_id=product.id,
                position=position, hotspot_x=hotspot.get("x"), hotspot_y=hotspot.get("y")))
            existing.add((collection["slug"], product.id))
    db.commit()


if __name__ == "__main__":
    Base.metadata.create_all(engine, tables=[CollectionProduct.__table__, NewsletterSubscriber.__table__])
    with SessionLocal() as db:
        seed_collections(db)
    print("Collection memberships and newsletter storage ready.")
