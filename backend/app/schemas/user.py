from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Literal


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8)
    company_name: str | None = Field(default=None, max_length=200)
    about_us: str | None = Field(default=None, max_length=2000)


class UserRegister(UserCreate):
    role: Literal["visitor", "organizer"] = "visitor"


class UserUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    company_name: str | None = Field(default=None, max_length=200)
    about_us: str | None = Field(default=None, max_length=2000)


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    company_name: str | None
    about_us: str | None

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    username: str
    password: str


class UserChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
