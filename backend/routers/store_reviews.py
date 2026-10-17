from decimal import Decimal
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database.database import get_db
from models.user import User
from models.product import Product
from models.order_review import Order, OrderItem, StoreReview, OrderItemReview
from models.product_image import ProductImage
from utils.dependencies import require_customer

router = APIRouter(prefix="/api", tags=["Orders and store reviews"])


class ItemInput(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=999, strict=True)


class CheckoutInput(BaseModel):
    items: list[ItemInput] = Field(min_length=1, max_length=100)
    promo_code: str = Field(default="", max_length=30)
    receiver_name: str = Field(min_length=1, max_length=100)
    receiver_phone: str = Field(min_length=1, max_length=20)
    shipping_address: str = Field(min_length=1, max_length=2000)

    @field_validator("receiver_name", "receiver_phone", "shipping_address")
    @classmethod
    def clean_shipping(cls, value):
        if not value.strip():
            raise ValueError("Vui lòng nhập đầy đủ thông tin nhận hàng")
        return value.strip()


class ReviewContent(BaseModel):
    rating: int = Field(ge=1, le=5, strict=True)
    content: str = Field(min_length=1, max_length=2000)

    @field_validator("content")
    @classmethod
    def clean_content(cls, value):
        if not value.strip():
            raise ValueError("Nội dung đánh giá không được để trống")
        return value.strip()


class ReviewInput(ReviewContent):
    order_id: int = Field(gt=0)


@router.post("/orders", status_code=201)
def checkout(data: CheckoutInput, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    return save_order(data, db, user)


@router.post("/orders/demo", status_code=201)
def demo_checkout(data: CheckoutInput, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    return save_order(data, db, user, demo=True)


def save_order(data, db, user, demo=False):
    quantities = {}
    for item in data.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity
    products = db.query(Product).filter(Product.id.in_(quantities)).order_by(Product.id).with_for_update().all()
    if len(products) != len(quantities):
        raise HTTPException(400, "Có sản phẩm không còn tồn tại. Vui lòng kiểm tra giỏ hàng.")
    for product in products:
        if not product.status or product.stock_quantity < quantities[product.id]:
            raise HTTPException(400, f"{product.name}: không đủ hàng để đặt mua.")
    subtotal = sum((p.price * quantities[p.id] for p in products), Decimal("0"))
    discount = {"FURNI10": Decimal("0.1"), "FURNI20": Decimal("0.2")}.get(data.promo_code.strip().upper(), Decimal("0"))
    total = subtotal * (1 - discount) + (150000 if subtotal < 2000000 else 0)
    order = Order(code=("DEMO-" if demo else "FH-") + uuid4().hex.upper(), user_id=user.id, total=total,
                  receiver_name=data.receiver_name, receiver_phone=data.receiver_phone,
                  shipping_address=data.shipping_address)
    if demo:
        order.payment_status = "SUCCESS"
    try:
        db.add(order)
        db.flush()
        for product in products:
            db.add(OrderItem(order_id=order.id, product_id=product.id, product_name=product.name,
                             quantity=quantities[product.id], unit_price=product.price,
                             subtotal=product.price * quantities[product.id]))
            if not demo:
                product.stock_quantity -= quantities[product.id]
        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        raise
    return {"id": order.id, "code": order.code, "total": order.total, "payment_status": order.payment_status}


def review_response(review, name):
    return {"id": review.id, "full_name": name, "rating": review.rating, "content": review.content, "created_at": review.created_at}


@router.get("/reviews")
def list_reviews(offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    rows = db.query(StoreReview, User.full_name).join(User, User.id == StoreReview.user_id).order_by(StoreReview.created_at.desc(), StoreReview.id.desc()).offset(offset).limit(limit).all()
    return [review_response(review, name) for review, name in rows]


@router.get("/reviews/eligible-orders")
def eligible_orders(db: Session = Depends(get_db), user: User = Depends(require_customer)):
    orders = db.query(Order).filter(Order.user_id == user.id, Order.status != "CANCELLED", ~Order.id.in_(db.query(StoreReview.order_id))).order_by(Order.id.desc()).all()
    return [{"id": order.id, "code": order.code, "created_at": order.created_at} for order in orders]


@router.post("/reviews", status_code=201)
def create_review(data: ReviewInput, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    order = db.query(Order).filter(Order.id == data.order_id, Order.user_id == user.id, Order.status != "CANCELLED").first()
    if not order:
        raise HTTPException(403, "Bạn chỉ được đánh giá đơn hàng đã đặt thành công của mình.")
    if db.query(StoreReview).filter(StoreReview.order_id == order.id).first():
        raise HTTPException(409, "Đơn hàng này đã được đánh giá.")
    review = StoreReview(user_id=user.id, order_id=order.id, rating=data.rating, content=data.content)
    db.add(review)
    try:
        db.commit()
        db.refresh(review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Đơn hàng này đã được đánh giá.")
    return review_response(review, user.full_name)


class ItemReviewInput(ReviewContent):
    order_item_id: int = Field(gt=0)


def product_image(db, product_id):
    image = db.query(ProductImage).filter(ProductImage.product_id == product_id).order_by(
        ProductImage.is_primary.desc(), ProductImage.sort_order, ProductImage.id).first()
    return image.image_url if image else None


def item_review_response(review, name, item):
    return {**review_response(review, name), "order_item_id": item.id,
            "product_id": item.product_id, "product_name": item.product_name,
            "image_url": review.image_url}


@router.get("/orders")
def order_history(offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
                  db: Session = Depends(get_db), user: User = Depends(require_customer)):
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.id.desc()).offset(offset).limit(limit).all()
    items = db.query(OrderItem).filter(OrderItem.order_id.in_([o.id for o in orders])).order_by(OrderItem.id).all()
    reviews = {r.order_item_id: r for r in db.query(OrderItemReview).filter(
        OrderItemReview.order_item_id.in_([i.id for i in items])).all()}
    return [{"id": o.id, "code": o.code, "total": o.total, "status": o.status,
             "payment_status": o.payment_status, "created_at": o.created_at,
             "items": [{"id": i.id, "product_id": i.product_id, "product_name": i.product_name,
                        "quantity": i.quantity, "unit_price": i.unit_price, "subtotal": i.subtotal,
                        "image_url": product_image(db, i.product_id),
                        "review": item_review_response(reviews[i.id], user.full_name, i) if i.id in reviews else None}
                       for i in items if i.order_id == o.id]} for o in orders]


@router.get("/product-reviews")
def product_reviews(offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), db: Session = Depends(get_db)):
    rows = db.query(OrderItemReview, User.full_name, OrderItem).join(
        User, User.id == OrderItemReview.user_id).join(
        OrderItem, OrderItem.id == OrderItemReview.order_item_id).order_by(
        OrderItemReview.created_at.desc(), OrderItemReview.id.desc()).offset(offset).limit(limit).all()
    return [item_review_response(review, name, item) for review, name, item in rows]


@router.post("/product-reviews", status_code=201)
def create_item_review(data: ItemReviewInput, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    item = db.query(OrderItem).join(Order, Order.id == OrderItem.order_id).filter(
        OrderItem.id == data.order_item_id, Order.user_id == user.id,
        Order.payment_status == "SUCCESS", Order.status != "CANCELLED").first()
    if not item:
        raise HTTPException(403, "Chỉ được đánh giá sản phẩm trong đơn đã thanh toán của bạn.")
    review = OrderItemReview(user_id=user.id, order_item_id=item.id, rating=data.rating,
                             content=data.content, image_url=product_image(db, item.product_id))
    db.add(review)
    try:
        db.commit()
        db.refresh(review)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Sản phẩm trong đơn này đã được đánh giá.")
    return item_review_response(review, user.full_name, item)


@router.delete("/product-reviews/{review_id}", status_code=204)
def delete_item_review(review_id: int, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    try:
        deleted = db.query(OrderItemReview).filter(
            OrderItemReview.id == review_id, OrderItemReview.user_id == user.id
        ).delete(synchronize_session=False)
        if not deleted:
            raise HTTPException(404, "Không tìm thấy đánh giá của bạn hoặc đánh giá đã được xóa.")
        db.commit()
    except Exception:
        db.rollback()
        raise
    return Response(status_code=204)
