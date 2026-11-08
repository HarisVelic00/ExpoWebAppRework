from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Expo(Base):
    __tablename__ = "Expos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date_of_opening: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    date_of_closing: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    work_hours_opening: Mapped[str | None] = mapped_column(Text, nullable=True)
    work_hours_closing: Mapped[str | None] = mapped_column(Text, nullable=True)

    organiser_id: Mapped[int | None] = mapped_column(
        ForeignKey("User.id"), nullable=True
    )

    location_id: Mapped[int | None] = mapped_column(
        ForeignKey("Location.id"), nullable=True
    )
    industry_id: Mapped[int] = mapped_column(ForeignKey("Industry.id"), nullable=False)

    organiser = relationship("User")
    location = relationship("Location")
    industry = relationship("Industry")
