from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from database.database import get_db
from models.category import Category
from models.user import User

from schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse
)

from utils.dependencies import require_admin


router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"]
)


# =========================
# GET ALL CATEGORIES
# PUBLIC
# =========================

@router.get(
    "",
    response_model=list[CategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db)
):
    categories = (
        db.query(Category)
        .order_by(Category.id.asc())
        .all()
    )

    return categories


# =========================
# GET CATEGORY BY ID
# PUBLIC
# =========================

@router.get(
    "/{category_id}",
    response_model=CategoryResponse
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục"
        )

    return category


# =========================
# CREATE CATEGORY
# ADMIN ONLY
# =========================

@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing_category = (
        db.query(Category)
        .filter(Category.name == data.name)
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên danh mục đã tồn tại"
        )

    new_category = Category(
        name=data.name,
        description=data.description,
        image_url=data.image_url,
        status=True
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


# =========================
# UPDATE CATEGORY
# ADMIN ONLY
# =========================

@router.put(
    "/{category_id}",
    response_model=CategoryResponse
)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # Kiểm tra trùng tên nếu đổi tên
    if "name" in update_data:
        existing_category = (
            db.query(Category)
            .filter(
                Category.name == update_data["name"],
                Category.id != category_id
            )
            .first()
        )

        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên danh mục đã tồn tại"
            )

    for key, value in update_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)

    return category


# =========================
# DELETE CATEGORY
# ADMIN ONLY
# =========================

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy danh mục"
        )

    db.delete(category)
    db.commit()

    return {
        "message": "Xóa danh mục thành công"
    }