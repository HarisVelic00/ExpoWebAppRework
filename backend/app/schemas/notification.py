from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    user_id: int = Field(gt=0)


class NotificationUpdate(BaseModel):
    is_seen: bool


class NotificationResponse(BaseModel):
    id: int
    title: str
    content: str
    user_id: int
    creation_date: datetime
    is_seen: bool

    model_config = ConfigDict(from_attributes=True)
