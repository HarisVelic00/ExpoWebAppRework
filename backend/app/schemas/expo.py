from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ExpoCreate(BaseModel):
    title: str | None = None
    description: str | None = None
    date_of_opening: datetime
    date_of_closing: datetime
    work_hours_opening: str | None = None
    work_hours_closing: str | None = None
    location_id: int | None = None
    industry_id: int = Field(gt=0)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.date_of_closing <= self.date_of_opening:
            raise ValueError("Closing date must be after opening date")
        return self


class ExpoUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    date_of_opening: datetime
    date_of_closing: datetime
    work_hours_opening: str | None = None
    work_hours_closing: str | None = None
    location_id: int | None = None
    industry_id: int = Field(gt=0)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.date_of_closing <= self.date_of_opening:
            raise ValueError("Closing date must be after opening date")
        return self


class ExpoResponse(BaseModel):
    id: int
    title: str | None
    description: str | None
    date_of_opening: datetime
    date_of_closing: datetime
    work_hours_opening: str | None
    work_hours_closing: str | None
    organiser_id: int | None
    location_id: int | None
    industry_id: int

    model_config = ConfigDict(from_attributes=True)
