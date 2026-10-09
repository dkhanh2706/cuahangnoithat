import os
import uuid
import shutil

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status
)

from sqlalchemy.orm import Session

from database.database import get_db

from models.product import Product
from models.product_image import ProductImage
from models.user import User

from schemas.product_image import ProductImageResponse

from utils.dependencies import require_admin


router = APIRouter(
    prefix="/api/products",
    tags=["Product Images"]
)


UPLOAD_FOLDER = os.path.join(
    "uploads",
    "products"
)


os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
]


# =========================
# GET PRODUCT IMAGES
# PUBLIC
# =========================

@router.get(
    "/{product_id}/images",
    response_model=list[ProductImageResponse]
)
def get_product_images(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy sản phẩm"
        )

    images = (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id == product_id
        )
        .order_by(
            ProductImage.is_primary.desc(),
            ProductImage.sort_order.asc(),
            ProductImage.id.asc()
        )
        .all()
    )

    return images


# =========================
# UPLOAD IMAGE
# ADMIN ONLY
# =========================

@router.post(
    "/{product_id}/images",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_product_image(
    product_id: int,

    file: UploadFile = File(...),

    is_primary: bool = Form(False),

    sort_order: int = Form(0),

    db: Session = Depends(get_db),

    current_user: User = Depends(require_admin)
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy sản phẩm"
        )

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Chỉ cho phép ảnh JPG, PNG hoặc WEBP"
        )

    original_extension = os.path.splitext(
        file.filename
    )[1].lower()

    if original_extension not in [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Định dạng file ảnh không hợp lệ"
        )

    filename = (
        f"{uuid.uuid4().hex}"
        f"{original_extension}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    try:
        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Không thể lưu file ảnh"
        )

    image_url = (
        f"/uploads/products/"
        f"{filename}"
    )

    # Nếu đây là ảnh đầu tiên
    # thì tự động đặt làm ảnh chính

    image_count = (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id
            == product_id
        )
        .count()
    )

    if image_count == 0:
        is_primary = True

    # Nếu upload ảnh chính mới
    # thì bỏ ảnh chính cũ

    if is_primary:
        (
            db.query(ProductImage)
            .filter(
                ProductImage.product_id
                == product_id
            )
            .update({
                ProductImage.is_primary: False
            })
        )

    new_image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        is_primary=is_primary,
        sort_order=sort_order
    )

    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image


# =========================
# SET PRIMARY IMAGE
# ADMIN ONLY
# =========================

@router.put(
    "/{product_id}/images/{image_id}/primary",
    response_model=ProductImageResponse
)
def set_primary_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    image = (
        db.query(ProductImage)
        .filter(
            ProductImage.id == image_id,
            ProductImage.product_id
            == product_id
        )
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy ảnh"
        )

    (
        db.query(ProductImage)
        .filter(
            ProductImage.product_id
            == product_id
        )
        .update({
            ProductImage.is_primary: False
        })
    )

    image.is_primary = True

    db.commit()
    db.refresh(image)

    return image


# =========================
# DELETE IMAGE
# ADMIN ONLY
# =========================

@router.delete(
    "/{product_id}/images/{image_id}"
)
def delete_product_image(
    product_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    image = (
        db.query(ProductImage)
        .filter(
            ProductImage.id == image_id,
            ProductImage.product_id
            == product_id
        )
        .first()
    )

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy ảnh"
        )

    was_primary = image.is_primary

    relative_path = image.image_url.lstrip("/")

    file_path = os.path.join(
        os.getcwd(),
        relative_path
    )

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    db.delete(image)
    db.commit()

    # Nếu vừa xóa ảnh chính
    # thì chọn ảnh còn lại đầu tiên
    # làm ảnh chính

    if was_primary:

        next_image = (
            db.query(ProductImage)
            .filter(
                ProductImage.product_id
                == product_id
            )
            .order_by(
                ProductImage.sort_order.asc(),
                ProductImage.id.asc()
            )
            .first()
        )

        if next_image:
            next_image.is_primary = True
            db.commit()

    return {
        "message": "Xóa ảnh sản phẩm thành công"
    }