from pydantic import BaseModel, Field
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
        ge=0
    )

    material: Optional[str] = None
    color: Optional[str] = None
    dimensions: Optional[str] = None

    stock_quantity: int = Field(
        default=0,
        ge=0
    )


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

    price: Optional[Decimal] = Field(
        default=None,
        ge=0
    )

    material: Optional[str] = None
    color: Optional[str] = None
    dimensions: Optional[str] = None

    stock_quantity: Optional[int] = Field(
        default=None,
        ge=0
    )

    status: Optional[bool] = None


class ProductResponse(BaseModel):
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