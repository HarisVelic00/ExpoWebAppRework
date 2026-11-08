from datetime import timedelta, datetime, timezone
from sqlalchemy.orm import Session
from app.models.ticket import Ticket
from app.models.ticket_type import TicketType
from app.models.expo import Expo
from app.schemas.ticket import TicketPurchase, TicketCreate
from app.models.notification import Notification


def get_tickets(db: Session) -> list[Ticket]:
    return list(db.query(Ticket).order_by(Ticket.id).all())


def get_ticket(db: Session, ticket_id: int) -> Ticket | None:
    return db.get(Ticket, ticket_id)


def get_user_tickets(db: Session, user_id: int) -> list[Ticket]:
    return list(
        db.query(Ticket).filter(Ticket.user_id == user_id).order_by(Ticket.id).all()
    )


def get_tickets_by_expo(db: Session, expo_id: int) -> list[Ticket]:
    return db.query(Ticket).filter(Ticket.expo_id == expo_id).order_by(Ticket.id).all()


def purchase_ticket(
    db: Session,
    ticket_data: TicketPurchase,
    user_id: int,
) -> Ticket:
    ticket_type = db.get(TicketType, ticket_data.ticket_type_id)

    if ticket_type is None:
        raise ValueError("Ticket type not found")

    expo = db.get(Expo, ticket_type.expo_id)

    if expo is None:
        raise ValueError("Expo not found")

    date_from = ticket_data.date_from

    if date_from < expo.date_of_opening or date_from >= expo.date_of_closing:
        raise ValueError("Ticket start date must be within the expo dates")

    last_valid_date = date_from.date() + timedelta(
        days=ticket_type.valid_days_count - 1
    )

    if last_valid_date > expo.date_of_closing.date():
        raise ValueError("There are not enough expo days remaining for this ticket")

    date_to = datetime.combine(
        last_valid_date + timedelta(days=1),
        datetime.min.time(),
    ) - timedelta(microseconds=1)

    date_to = min(date_to, expo.date_of_closing)

    ticket = Ticket(
        ticket_type_id=ticket_type.id,
        expo_id=expo.id,
        user_id=user_id,
        date_from=date_from,
        date_to=date_to,
        price=ticket_type.price,
    )

    db.add(ticket)

    if expo.organiser_id is not None:
        notification = Notification(
            title="New ticket purchase",
            content=f"A ticket has been purchased for your expo '{expo.title}'.",
            user_id=expo.organiser_id,
            creation_date=datetime.now(timezone.utc).replace(tzinfo=None),
            is_seen=False,
        )
        db.add(notification)

    db.commit()
    db.refresh(ticket)

    return ticket


def create_ticket(db: Session, ticket_data: TicketCreate) -> Ticket:
    ticket_type = db.get(TicketType, ticket_data.ticket_type_id)

    if ticket_type is None:
        raise ValueError("Ticket type not found")

    expo = db.get(Expo, ticket_data.expo_id)

    if expo is None:
        raise ValueError("Expo not found")

    if ticket_type.expo_id != expo.id:
        raise ValueError("Ticket type does not belong to this expo")

    if ticket_data.date_from < expo.date_of_opening:
        raise ValueError("Ticket start date cannot be before the expo opens")

    if ticket_data.date_to <= ticket_data.date_from:
        raise ValueError("Ticket end date must be after start date")

    if ticket_data.date_to > expo.date_of_closing:
        raise ValueError("Ticket end date cannot be after the expo closes")

    ticket = Ticket(
        ticket_type_id=ticket_type.id,
        expo_id=expo.id,
        user_id=ticket_data.user_id,
        date_from=ticket_data.date_from,
        date_to=ticket_data.date_to,
        price=ticket_type.price,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def delete_ticket(db: Session, ticket: Ticket) -> None:
    db.delete(ticket)
    db.commit()
