from sqlalchemy import ForeignKey, Integer, Text, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal
from app.db.base import Base
from app.models.expo import Expo


class TicketType(Base):
    __tablename__ = "TicketType"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    valid_days_count: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    expo_id: Mapped[int] = mapped_column(ForeignKey("Expos.id"), nullable=False)

    expo: Mapped["Expo"] = relationship("Expo")
