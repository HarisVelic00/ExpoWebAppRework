from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Industry(Base):
    __tablename__ = "Industry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str | None] = mapped_column(Text, nullable=True)
