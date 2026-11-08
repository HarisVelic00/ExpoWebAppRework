from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class TicketPurchase(BaseModel):
    ticket_type_id: int = Field(gt=0)
    date_from: datetime


class TicketCreate(BaseModel):
    ticket_type_id: int = Field(gt=0)
    expo_id: int = Field(gt=0)
    user_id: int | None = None
    date_from: datetime
    date_to: datetime

    @model_validator(mode="after")
    def validate_dates(self):
        if self.date_to <= self.date_from:
            raise ValueError("Ticket end date must be after start date")
        return self


class TicketResponse(BaseModel):
    id: int
    ticket_type_id: int
    expo_id: int
    user_id: int | None
    date_from: datetime
    date_to: datetime
    price: Decimal
    expo_title: str | None
    ticket_type_name: str

    model_config = ConfigDict(from_attributes=True)
