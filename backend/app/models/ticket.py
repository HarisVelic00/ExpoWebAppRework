from datetime import datetime
from decimal import Decimal
from sqlalchemy import DateTime, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Ticket(Base):
    __tablename__ = "Ticket"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ticket_type_id: Mapped[int] = mapped_column(
        ForeignKey("TicketType.id"), nullable=False
    )
    expo_id: Mapped[int] = mapped_column(ForeignKey("Expos.id"), nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("User.id"), nullable=True)
    date_from: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    date_to: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    ticket_type = relationship("TicketType")
    expo = relationship("Expo")
    user = relationship("User")

    @property
    def expo_title(self) -> str | None:
        return self.expo.title if self.expo else None

    @property
    def ticket_type_name(self) -> str:
        return self.ticket_type.name if self.ticket_type else None
