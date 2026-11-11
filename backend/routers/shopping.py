"""Giỏ hàng và yêu thích theo tài khoản khách hàng."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.database import get_db
from models.product import Product
from models.shopping import Cart, CartItem, WishlistItem
from models.user import User
from utils.dependencies import require_customer

router = APIRouter(prefix="/api", tags=["Cart and wishlist"])

MAX_LINES = 100


class CartLine(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=999)


class CartInput(BaseModel):
    items: list[CartLine] = Field(default_factory=list, max_length=MAX_LINES)


class WishlistInput(BaseModel):
    product_ids: list[int] = Field(default_factory=list, max_length=200)


def existing_products(db: Session, ids) -> dict[int, Product]:
    if not ids:
        return {}
    return {p.id: p for p in db.query(Product).filter(Product.id.in_(list(ids))).all()}


def cart_response(db: Session, user: User):
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    rows = []
    if cart:
        rows = db.query(CartItem).filter(CartItem.cart_id == cart.id).order_by(CartItem.id).all()
    return {"items": [{"product_id": r.product_id, "quantity": r.quantity} for r in rows]}


@router.get("/cart")
def get_cart(db: Session = Depends(get_db), user: User = Depends(require_customer)):
    return cart_response(db, user)


@router.put("/cart")
def replace_cart(data: CartInput, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    """Ghi đè toàn bộ giỏ. Sản phẩm không còn tồn tại bị bỏ qua, dòng trùng được cộng dồn."""
    wanted: dict[int, int] = {}
    for line in data.items:
        wanted[line.product_id] = min(999, wanted.get(line.product_id, 0) + line.quantity)
    products = existing_products(db, wanted)
    try:
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()
        if cart is None:
            cart = Cart(user_id=user.id)
            db.add(cart)
            db.flush()
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        for product_id, quantity in wanted.items():
            product = products.get(product_id)
            if product is not None:
                db.add(CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity, price=product.price))
        cart.updated_at = func.now()
        db.commit()
    except Exception:
        db.rollback()
        raise
    return cart_response(db, user)


@router.get("/wishlist")
def get_wishlist(db: Session = Depends(get_db), user: User = Depends(require_customer)):
    rows = db.query(WishlistItem).filter(WishlistItem.user_id == user.id).order_by(WishlistItem.created_at, WishlistItem.product_id).all()
    return {"product_ids": [r.product_id for r in rows]}


@router.put("/wishlist")
def replace_wishlist(data: WishlistInput, db: Session = Depends(get_db), user: User = Depends(require_customer)):
    ordered = list(dict.fromkeys(data.product_ids))
    valid = set(existing_products(db, ordered))
    try:
        db.query(WishlistItem).filter(WishlistItem.user_id == user.id).delete()
        for product_id in ordered:
            if product_id in valid:
                db.add(WishlistItem(user_id=user.id, product_id=product_id))
        db.commit()
    except Exception:
        db.rollback()
        raise
    return get_wishlist(db, user)
