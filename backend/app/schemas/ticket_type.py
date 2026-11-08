from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class TicketTypeCreate(BaseModel):
    name: str
    valid_days_count: int = Field(gt=0)
    price: Decimal = Field(gt=0)
    expo_id: int


class TicketTypeUpdate(BaseModel):
    name: str
    valid_days_count: int = Field(gt=0)
    price: Decimal = Field(gt=0)
    expo_id: int


class TicketTypeResponse(BaseModel):
    id: int
    name: str
    valid_days_count: int
    price: Decimal
    expo_id: int

    model_config = ConfigDict(from_attributes=True)
