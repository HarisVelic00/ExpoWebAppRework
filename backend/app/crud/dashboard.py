from datetime import datetime
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.expo import Expo
from app.models.ticket import Ticket


def get_dashboard_stats(
    db: Session,
    user_id: int,
    role: str,
) -> dict:
    now = datetime.now()
    expo_query = select(func.count(Expo.id))
    ticket_query = select(func.count(Ticket.id))
    revenue_query = select(func.coalesce(func.sum(Ticket.price), 0))

    if role == "organizer":
        expo_query = expo_query.where(Expo.organiser_id == user_id)

        ticket_query = ticket_query.join(Expo, Ticket.expo_id == Expo.id).where(
            Expo.organiser_id == user_id
        )

        revenue_query = revenue_query.join(Expo, Ticket.expo_id == Expo.id).where(
            Expo.organiser_id == user_id
        )

    total_expos = db.scalar(expo_query) or 0

    upcoming_expos = db.scalar(expo_query.where(Expo.date_of_opening > now)) or 0

    tickets_sold = db.scalar(ticket_query) or 0
    total_revenue = db.scalar(revenue_query) or Decimal("0.00")

    return {
        "total_expos": total_expos,
        "upcoming_expos": upcoming_expos,
        "tickets_sold": tickets_sold,
        "total_revenue": total_revenue,
    }
