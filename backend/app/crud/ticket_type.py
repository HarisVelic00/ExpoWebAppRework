from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.ticket_type import TicketType
from app.schemas.ticket_type import TicketTypeCreate, TicketTypeUpdate


def get_ticket_types(db: Session) -> list[TicketType]:
    statement = select(TicketType).order_by(TicketType.name)
    return list(db.scalars(statement).all())


def get_ticket_type(db: Session, ticket_type_id: int) -> TicketType | None:
    return db.get(TicketType, ticket_type_id)


def create_ticket_type(
    db: Session,
    ticket_type_data: TicketTypeCreate,
) -> TicketType:
    ticket_type = TicketType(
        name=ticket_type_data.name,
        valid_days_count=ticket_type_data.valid_days_count,
        price=ticket_type_data.price,
        expo_id=ticket_type_data.expo_id,
    )

    db.add(ticket_type)
    db.commit()
    db.refresh(ticket_type)

    return ticket_type


def update_ticket_type(
    db: Session,
    ticket_type: TicketType,
    ticket_type_data: TicketTypeUpdate,
) -> TicketType:
    ticket_type.name = ticket_type_data.name
    ticket_type.valid_days_count = ticket_type_data.valid_days_count
    ticket_type.price = ticket_type_data.price
    ticket_type.expo_id = ticket_type_data.expo_id

    db.commit()
    db.refresh(ticket_type)

    return ticket_type


def delete_ticket_type(db: Session, ticket_type: TicketType) -> None:
    db.delete(ticket_type)
    db.commit()
