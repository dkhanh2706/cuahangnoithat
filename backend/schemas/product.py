from pydantic import BaseModel, Field, field_validator
from schemas.product_image import ProductImageResponse
from typing import Optional
from decimal import Decimal
from datetime import datetime


class ProductCreate(BaseModel):
    category_id: Optional[int] = None

    name: str = Field(
        min_length=1,
        max_length=150
    )

    description: Optional[str] = None

    price: Decimal = Field(
        ge=0, max_digits=15, decimal_places=2
    )

    material: Optional[str] = Field(default=None, max_length=100)
    color: Optional[str] = Field(default=None, max_length=100)
    dimensions: Optional[str] = Field(default=None, max_length=100)

    stock_quantity: int = Field(
        default=0,
        ge=0, le=2147483647
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value):
        if not value.strip():
            raise ValueError("Tên sản phẩm không được để trống")
        return value.strip()


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description: Optional[str] = None

    price: Optional[Decimal] = Field(
        default=None,
        ge=0, max_digits=15, decimal_places=2
    )

    material: Optional[str] = Field(default=None, max_length=100)
    color: Optional[str] = Field(default=None, max_length=100)
    dimensions: Optional[str] = Field(default=None, max_length=100)

    stock_quantity: Optional[int] = Field(
        default=None,
        ge=0, le=2147483647
    )

    status: Optional[bool] = None

    @field_validator("name", "price", "stock_quantity", "status")
    @classmethod
    def validate_required_fields(cls, value):
        if value is None:
            raise ValueError("Trường này không được để null")
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("Tên sản phẩm không được để trống")
        return value


class ProductResponse(BaseModel):
    images: list[ProductImageResponse] = Field(default_factory=list)
    id: int
    category_id: Optional[int] = None

    name: str
    description: Optional[str] = None

    price: Decimal

    material: Optional[str] = None
    color: Optional[str] = None
    dimensions: Optional[str] = None

    stock_quantity: int
    status: bool

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
