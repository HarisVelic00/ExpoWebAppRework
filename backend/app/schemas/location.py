from pydantic import BaseModel, ConfigDict


class LocationCreate(BaseModel):
    address: str | None = None
    city: str | None = None
    zip_code: str


class LocationUpdate(BaseModel):
    address: str | None = None
    city: str | None = None
    zip_code: str


class LocationResponse(BaseModel):
    id: int
    address: str | None
    city: str | None
    zip_code: str

    model_config = ConfigDict(from_attributes=True)
