from pydantic import BaseModel
from datetime import datetime


class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str
    is_primary: bool
    sort_order: int
    created_at: datetime

    class Config:
        from_attributes = True