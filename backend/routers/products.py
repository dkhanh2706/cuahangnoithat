from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query
)

from sqlalchemy.orm import Session
from sqlalchemy import or_

from database.database import get_db

from models.product import Product
from models.category import Category
from models.user import User

from schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse
)

from utils.dependencies import require_admin


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


# =========================
# GET PRODUCTS
# PUBLIC
# =========================

@router.get(
    "",
    response_model=list[ProductResponse]
)
def get_products(
    search: str | None = Query(
        default=None
    ),
    category_id: int | None = Query(
        default=None
    ),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            or_(
                Product.name.ilike(search_value),
                Product.description.ilike(search_value),
                Product.material.ilike(search_value),
                Product.color.ilike(search_value)
            )
        )

    if category_id:
        query = query.filter(
            Product.category_id == category_id
        )

    return (
        query
        .order_by(Product.id.desc())
        .all()
    )


# =========================
# GET PRODUCT DETAIL
# PUBLIC
# =========================

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy sản phẩm"
        )

    return product


# =========================
# CREATE PRODUCT
# ADMIN
# =========================

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if data.category_id is not None:

        category = db.query(Category).filter(
            Category.id == data.category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Danh mục không tồn tại"
            )

    product = Product(
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        price=data.price,
        material=data.material,
        color=data.color,
        dimensions=data.dimensions,
        stock_quantity=data.stock_quantity,
        status=True
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# =========================
# UPDATE PRODUCT
# ADMIN
# =========================

@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy sản phẩm"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    if "category_id" in update_data:

        category_id = update_data[
            "category_id"
        ]

        if category_id is not None:

            category = db.query(Category).filter(
                Category.id == category_id
            ).first()

            if not category:
                raise HTTPException(
                    status_code=400,
                    detail="Danh mục không tồn tại"
                )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return product


# =========================
# DELETE PRODUCT
# ADMIN
# =========================

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy sản phẩm"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Xóa sản phẩm thành công"
    }