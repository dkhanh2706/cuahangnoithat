from typing import Literal

from pydantic import BaseModel, Field, field_validator


class AdvisorRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    history: list[str] = Field(default_factory=list, max_length=12)
    product_id: int | None = Field(default=None, gt=0)
    suggested_ids: list[int] = Field(default_factory=list, max_length=8)

    @field_validator("message")
    @classmethod
    def trim_message(cls, value):
        if not value.strip():
            raise ValueError("Vui lòng nhập câu hỏi")
        return value.strip()

    @field_validator("history")
    @classmethod
    def bound_history(cls, values):
        if any(len(value) > 1200 for value in values):
            raise ValueError("Câu hỏi trong lịch sử quá dài")
        return values


class AdvisorProduct(BaseModel):
    id: int
    name: str
    price: float
    stock_quantity: int
    primary_image: str | None = None
    material: str | None = None
    color: str | None = None
    dimensions: str | None = None


class AdvisorItem(BaseModel):
    product: AdvisorProduct
    quantity: int = Field(default=1, ge=1)


class AdvisorOffer(BaseModel):
    id: str
    kind: Literal["product", "bundle"]
    title: str
    items: list[AdvisorItem]
    total_price: float


class AdvisorResponse(BaseModel):
    reply: str
    offers: list[AdvisorOffer] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class CartCheckItem(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1, le=999)
    cart_quantity: int = Field(default=0, ge=0, le=2147483647)


class CartCheckRequest(BaseModel):
    items: list[CartCheckItem] = Field(min_length=1, max_length=8)

    @field_validator("items")
    @classmethod
    def unique_products(cls, items):
        if len({item.product_id for item in items}) != len(items):
            raise ValueError("Sản phẩm không được trùng lặp")
        return items
