from datetime import datetime
from sqlalchemy import Boolean, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Notification(Base):
    __tablename__ = "Notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("User.id"), nullable=False)
    creation_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    is_seen: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user = relationship("User")
