from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session
from database.database import get_db
from models.order_review import Order, OrderItem
from models.product import Product
from utils.dependencies import require_admin

router = APIRouter(prefix="/api/admin/orders", tags=["Order management"])
TRANSITIONS = {"PENDING": {"CONFIRMED", "CANCELLED"}, "CONFIRMED": {"SHIPPING", "CANCELLED"},
               "SHIPPING": {"COMPLETED"}, "COMPLETED": set(), "CANCELLED": set()}


def serialize(order, items=None):
    result = {"id": order.id, "code": order.code, "status": order.status,
        "payment_status": order.payment_status, "total": order.total, "created_at": order.created_at,
        "receiver_name": order.receiver_name, "receiver_phone": order.receiver_phone,
        "shipping_address": order.shipping_address, "user_id": order.user_id,
        "is_demo": order.code.startswith("DEMO-")}
    if items is not None:
        result["items"] = [{"id": i.id, "product_id": i.product_id, "product_name": i.product_name,
            "quantity": i.quantity, "unit_price": i.unit_price, "subtotal": i.subtotal} for i in items]
    return result


@router.get("")
def orders(q: str = Query("", max_length=150), status: Literal["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"] | None = None,
           offset: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100),
           db: Session = Depends(get_db), admin=Depends(require_admin)):
    query = db.query(Order)
    if q.strip():
        pattern = f"%{q.strip()}%"
        query = query.filter(or_(Order.code.ilike(pattern), Order.receiver_name.ilike(pattern), Order.receiver_phone.ilike(pattern)))
    if status:
        query = query.filter(Order.status == status)
    return {"total": query.count(), "items": [serialize(o) for o in query.order_by(Order.id.desc()).offset(offset).limit(limit).all()]}


@router.get("/summary")
def orders_summary(db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Số đơn đang chờ xác nhận, dùng cho huy hiệu thông báo trên menu admin."""
    pending = db.query(Order).filter(Order.status == "PENDING", ~Order.code.startswith("DEMO-")).count()
    latest = db.query(Order.id).filter(~Order.code.startswith("DEMO-")).order_by(Order.id.desc()).first()
    return {"pending": pending, "latest_order_id": latest[0] if latest else 0}


@router.get("/{order_id}")
def order_detail(order_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Không tìm thấy đơn hàng.")
    return serialize(order, db.query(OrderItem).filter_by(order_id=order.id).order_by(OrderItem.id).all())


class StatusInput(BaseModel):
    status: Literal["CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"]


@router.patch("/{order_id}/status")
def update_status(order_id: int, data: StatusInput, db: Session = Depends(get_db), admin=Depends(require_admin)):
    try:
        order = db.query(Order).filter_by(id=order_id).with_for_update().first()
        if not order:
            raise HTTPException(404, "Không tìm thấy đơn hàng.")
        if order.status == data.status:
            return serialize(order)
        if data.status not in TRANSITIONS.get(order.status, set()):
            raise HTTPException(409, "Trạng thái đơn đã thay đổi hoặc bước xử lý không hợp lệ. Vui lòng tải lại.")
        if data.status == "CANCELLED" and not order.code.startswith("DEMO-"):
            quantities = {}
            for item in db.query(OrderItem).filter_by(order_id=order.id).all():
                if item.product_id is not None:
                    quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity
            for product in db.query(Product).filter(Product.id.in_(quantities)).order_by(Product.id).with_for_update().all():
                product.stock_quantity += quantities[product.id]
        order.status = data.status
        if data.status == "COMPLETED":
            order.payment_status = "SUCCESS"
        elif data.status == "CANCELLED":
            order.payment_status = "REFUNDED" if order.payment_status == "SUCCESS" else "FAILED"
        db.commit()
        db.refresh(order)
        return serialize(order)
    except Exception:
        db.rollback()
        raise
