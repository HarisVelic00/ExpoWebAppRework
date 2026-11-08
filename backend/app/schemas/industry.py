from pydantic import BaseModel, ConfigDict


class IndustryResponse(BaseModel):
    id: int
    name: str | None

    model_config = ConfigDict(from_attributes=True)


class IndustryCreate(BaseModel):
    name: str


class IndustryUpdate(BaseModel):
    name: str
