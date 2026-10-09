from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100
    )

    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: bool
    created_at: datetime

    class Config:
        from_attributes = True