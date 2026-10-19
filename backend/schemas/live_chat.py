from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from schemas.advisor import AdvisorRequest


class CustomerMessage(AdvisorRequest):
    client_id: UUID


class SessionClose(BaseModel):
    token: str = Field(min_length=32, max_length=128)


class PresenceHeartbeat(BaseModel):
    tab_id: UUID


class PresenceLeave(BaseModel):
    tab_id: UUID
    token: str = Field(min_length=32, max_length=128)


class AdminMessage(BaseModel):
    client_id: UUID
    tab_id: UUID
    lease_token: str = Field(min_length=32, max_length=128)
    reply_to: UUID | None = None
    text: str = Field(default="", max_length=1200)
    product_ids: list[int] = Field(default_factory=list, max_length=8)
    as_bundle: bool = True

    @model_validator(mode="after")
    def validate_message(self):
        self.text = self.text.strip()
        if not self.text and not self.product_ids:
            raise ValueError("Vui lòng nhập tin nhắn hoặc chọn sản phẩm")
        if any(value <= 0 for value in self.product_ids) or len(set(self.product_ids)) != len(self.product_ids):
            raise ValueError("Sản phẩm không hợp lệ hoặc bị trùng")
        return self
