"""Add the curated furniture catalog. Run from backend: python -B -m database.seed_catalog."""
import argparse
import json
from decimal import Decimal
from pathlib import Path

from database.database import SessionLocal
from models.category import Category
from models.product import Product
from models.product_image import ProductImage


CATEGORY_NAMES = {"sofa": "Sofa", "ban": "Bàn", "ghe": "Ghế", "giuong": "Giường", "tu-ke": "Tủ", "den": "Đèn"}
CATALOG_PATH = Path(__file__).with_name("catalog_products.json")


def seed_catalog(db, dry_run=False):
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    categories = {category.name: category for category in db.query(Category).all()}
    existing = {name for (name,) in db.query(Product.name).all()}
    missing = set(CATEGORY_NAMES.values()) - categories.keys()
    if missing:
        raise ValueError("Thiếu danh mục: " + ", ".join(sorted(missing)))
    created = []
    skipped = []
    images_added = 0
    try:
        for data in catalog:
            if data["name"] in existing:
                skipped.append(data["name"])
                continue
            product = Product(
                category_id=categories[CATEGORY_NAMES[data["category"]]].id,
                name=data["name"], description=data["description"], price=Decimal(str(data["price"])),
                material=data["material"], color=data["color"], dimensions=data["dimensions"],
                stock_quantity=data["stock_quantity"], status=True,
            )
            db.add(product)
            db.flush()
            for index, url in enumerate(data["images"]):
                db.add(ProductImage(product_id=product.id, image_url=url, is_primary=index == 0, sort_order=index))
                images_added += 1
            created.append({"id": product.id, "name": product.name})
            existing.add(product.name)
        if dry_run:
            db.rollback()
        else:
            db.commit()
    except Exception:
        db.rollback()
        raise
    return {"dry_run": dry_run, "products_added": len(created), "images_added": images_added,
            "products": created, "skipped": skipped}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Rollback changes (database sequences may still advance).")
    args = parser.parse_args()
    with SessionLocal() as session:
        print(json.dumps(seed_catalog(session, dry_run=args.dry_run), ensure_ascii=True))
