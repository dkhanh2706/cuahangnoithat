from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from database.database import get_db
from models.product import Product
from schemas.advisor import AdvisorRequest, AdvisorResponse, AdvisorItem, CartCheckRequest
from services.furniture_advisor import advise, serialize_product


router = APIRouter(prefix="/api/advisor", tags=["Furniture advisor"])


@router.post("/chat", response_model=AdvisorResponse)
def chat(data: AdvisorRequest, db: Session = Depends(get_db)):
    products = db.query(Product).options(selectinload(Product.images), selectinload(Product.category)).filter(Product.status.is_(True)).all()
    return advise(data, products)


@router.post("/check-cart", response_model=list[AdvisorItem])
def check_cart(data: CartCheckRequest, db: Session = Depends(get_db)):
    """Read current price/availability for an entire selection; no partial additions."""
    ids = [item.product_id for item in data.items]
    products = {p.id: p for p in db.query(Product).options(selectinload(Product.images)).filter(Product.id.in_(ids), Product.status.is_(True)).all()}
    result = []
    for item in data.items:
        product = products.get(item.product_id)
        if not product:
            raise HTTPException(409, "Một sản phẩm đã bị ẩn hoặc xóa. Chưa thêm món nào; hãy yêu cầu tư vấn lại.")
        if product.stock_quantity < item.quantity + item.cart_quantity:
            raise HTTPException(409, f'"{product.name}" chỉ còn {product.stock_quantity} sản phẩm (đã tính số lượng trong giỏ). Chưa thêm món nào.')
        result.append({"product": serialize_product(product), "quantity": item.quantity})
    return result
