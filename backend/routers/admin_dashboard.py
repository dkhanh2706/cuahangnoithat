"""Số liệu tổng quan cho trang quản trị."""
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.database import get_db
from models.order_review import Order, OrderItem
from models.product import Product
from models.user import User
from utils.dependencies import require_admin

router = APIRouter(prefix="/api/admin/dashboard", tags=["Admin dashboard"])

ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"]
LOW_STOCK_LIMIT = 5


def _real_orders(query):
    """Bỏ đơn DEMO cũ vì không thu tiền thật."""
    return query.filter(~Order.code.startswith("DEMO-"))


def _day_key(value) -> str:
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")
    return str(value)[:10]


@router.get("")
def dashboard(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    since = datetime.combine(date.today() - timedelta(days=days - 1), datetime.min.time())

    # Đơn hàng theo trạng thái (tất cả thời gian)
    status_rows = _real_orders(db.query(Order.status, func.count(Order.id))).group_by(Order.status).all()
    by_status = {status: 0 for status in ORDER_STATUSES}
    for status, count in status_rows:
        by_status[str(status)] = count

    # Doanh thu: chỉ tính đơn đã hoàn tất (đã thu tiền)
    completed = _real_orders(db.query(Order)).filter(Order.status == "COMPLETED")
    revenue_total = completed.with_entities(func.coalesce(func.sum(Order.total), 0)).scalar()
    revenue_period = (
        completed.filter(Order.created_at >= since)
        .with_entities(func.coalesce(func.sum(Order.total), 0))
        .scalar()
    )
    orders_period = _real_orders(db.query(func.count(Order.id))).filter(Order.created_at >= since).scalar()

    # Doanh thu và số đơn theo từng ngày (điền đủ các ngày, kể cả ngày không có đơn)
    daily_revenue = {}
    for day, total in (
        completed.filter(Order.created_at >= since)
        .with_entities(func.date(Order.created_at), func.sum(Order.total))
        .group_by(func.date(Order.created_at))
        .all()
    ):
        daily_revenue[_day_key(day)] = float(total or 0)
    daily_orders = {}
    for day, count in (
        _real_orders(db.query(func.date(Order.created_at), func.count(Order.id)))
        .filter(Order.created_at >= since)
        .group_by(func.date(Order.created_at))
        .all()
    ):
        daily_orders[_day_key(day)] = count
    series = []
    for offset in range(days):
        key = (since + timedelta(days=offset)).strftime("%Y-%m-%d")
        series.append({"date": key, "revenue": daily_revenue.get(key, 0.0), "orders": daily_orders.get(key, 0)})

    # Sản phẩm bán chạy (đơn đã hoàn tất)
    top_rows = (
        db.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("quantity"),
            func.sum(OrderItem.subtotal).label("revenue"),
        )
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.status == "COMPLETED", ~Order.code.startswith("DEMO-"))
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc(), func.sum(OrderItem.subtotal).desc())
        .limit(5)
        .all()
    )
    top_products = [
        {"name": name, "quantity": int(quantity or 0), "revenue": float(revenue or 0)}
        for name, quantity, revenue in top_rows
    ]

    # Sản phẩm sắp hết hàng
    low_stock = [
        {"id": p.id, "name": p.name, "stock_quantity": p.stock_quantity}
        for p in db.query(Product)
        .filter(Product.status.is_(True), Product.stock_quantity <= LOW_STOCK_LIMIT)
        .order_by(Product.stock_quantity, Product.id)
        .limit(8)
        .all()
    ]

    customers_total = db.query(func.count(User.id)).filter(User.role == "CUSTOMER").scalar()
    new_customers = (
        db.query(func.count(User.id)).filter(User.role == "CUSTOMER", User.created_at >= since).scalar()
    )

    return {
        "days": days,
        "totals": {
            "revenue": float(revenue_total or 0),
            "revenue_period": float(revenue_period or 0),
            "orders_period": orders_period or 0,
            "pending_orders": by_status["PENDING"],
            "customers": customers_total or 0,
            "new_customers": new_customers or 0,
            "products_active": db.query(func.count(Product.id)).filter(Product.status.is_(True)).scalar() or 0,
        },
        "orders_by_status": by_status,
        "daily": series,
        "top_products": top_products,
        "low_stock": low_stock,
        "low_stock_limit": LOW_STOCK_LIMIT,
    }
