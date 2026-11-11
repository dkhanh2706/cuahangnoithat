from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from database.database import get_db
from models.product import Product
from models.category import Category
from models.store_features import CollectionProduct, NewsletterSubscriber
from utils.dependencies import require_admin

router = APIRouter(prefix="/api", tags=["Collections and newsletter"])


@router.get("/collections/products")
def collection_products(db: Session = Depends(get_db)):
    rows = db.query(CollectionProduct, Product).join(Product).options(selectinload(Product.images)).filter(
        Product.status.is_(True)).order_by(CollectionProduct.collection_slug, CollectionProduct.position).all()
    category_names = dict(db.query(Category.id, Category.name).all())
    result = {}
    for membership, product in rows:
        collection = result.setdefault(membership.collection_slug, {"products": [], "hotspots": []})
        images = sorted(product.images, key=lambda i: (not i.is_primary, i.sort_order or 0, i.id))
        collection["products"].append({"id": product.id, "name": product.name, "price": product.price,
            "description": product.description, "material": product.material, "color": product.color,
            "dimensions": product.dimensions, "stock_quantity": product.stock_quantity, "status": product.status,
            "category": str(product.category_id), "category_name": category_names.get(product.category_id, "Nội thất"),
            "primary_image": images[0].image_url if images else None,
            "images": [image.image_url for image in images]})
        if membership.hotspot_x is not None:
            collection["hotspots"].append({"id": str(membership.id), "product_id": product.id,
                "label": product.name, "x": membership.hotspot_x, "y": membership.hotspot_y})
    return result


class SubscribeInput(BaseModel):
    email: EmailStr = Field(max_length=254)
    consent: bool


@router.post("/newsletter/subscriptions")
def subscribe(data: SubscribeInput, db: Session = Depends(get_db)):
    if not data.consent:
        raise HTTPException(422, "Vui lòng đồng ý để CHNT lưu email liên hệ.")
    email = str(data.email).lower()
    if not db.query(NewsletterSubscriber.id).filter_by(email=email).first():
        db.add(NewsletterSubscriber(email=email))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
    return {"message": "CHNT đã ghi nhận email. Bạn có thể dùng mã CHNT10 để giảm 10% khi đặt hàng."}


@router.get("/admin/newsletter/subscriptions")
def subscribers(q: str = Query("", max_length=254), offset: int = Query(0, ge=0),
                limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db), admin=Depends(require_admin)):
    query = db.query(NewsletterSubscriber)
    term = q.strip().lower()
    if term:
        # Escape LIKE wildcards so "_" and "%" in an email are matched literally
        term = term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        query = query.filter(func.lower(NewsletterSubscriber.email).like(f"%{term}%", escape="\\"))
    return {"total": query.count(), "items": [{"id": row.id, "email": row.email, "created_at": row.created_at}
        for row in query.order_by(NewsletterSubscriber.id.desc()).offset(offset).limit(limit).all()]}


@router.delete("/admin/newsletter/subscriptions/{subscriber_id}", status_code=204)
def remove_subscriber(subscriber_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    row = db.get(NewsletterSubscriber, subscriber_id)
    if not row:
        raise HTTPException(404, "Không tìm thấy đăng ký.")
    db.delete(row)
    db.commit()
