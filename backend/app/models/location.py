from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Location(Base):
    __tablename__ = "Location"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    zip_code: Mapped[str] = mapped_column(String(20), nullable=False)
