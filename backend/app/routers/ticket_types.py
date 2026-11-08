from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud import ticket_type as ticket_type_crud
from app.db.session import SessionLocal
from app.schemas.ticket_type import (
    TicketTypeCreate,
    TicketTypeUpdate,
    TicketTypeResponse,
)
from app.core.dependencies import require_role
from app.models.user import User
from app.crud import expo as expo_crud
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/ticket-types", tags=["Ticket Types"])


def get_db():
    with SessionLocal() as db:
        yield db


@router.get("/", response_model=list[TicketTypeResponse])
def read_ticket_types(db: Session = Depends(get_db)):
    return ticket_type_crud.get_ticket_types(db)


@router.get("/{ticket_type_id}", response_model=TicketTypeResponse)
def read_ticket_type(
    ticket_type_id: int,
    db: Session = Depends(get_db),
):
    ticket_type = ticket_type_crud.get_ticket_type(db, ticket_type_id)

    if ticket_type is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found",
        )

    return ticket_type


@router.post(
    "/",
    response_model=TicketTypeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket_type(
    ticket_type_data: TicketTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer", "admin")),
):

    expo = expo_crud.get_expo(db, ticket_type_data.expo_id)

    if expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo not found",
        )

    if current_user.role != "admin" and expo.organiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create ticket types for your own expos",
        )

    return ticket_type_crud.create_ticket_type(db, ticket_type_data)


@router.put("/{ticket_type_id}", response_model=TicketTypeResponse)
def update_ticket_type(
    ticket_type_id: int,
    ticket_type_data: TicketTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer", "admin")),
):
    ticket_type = ticket_type_crud.get_ticket_type(db, ticket_type_id)

    if ticket_type is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found",
        )

    expo = expo_crud.get_expo(db, ticket_type.expo_id)

    if expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo not found",
        )

    if current_user.role != "admin" and expo.organiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update ticket types for your own expos",
        )

    new_expo = expo_crud.get_expo(db, ticket_type_data.expo_id)

    if new_expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Target expo not found"
        )

    if current_user.role != "admin" and new_expo.organiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only assign ticket types to your own expos",
        )

    return ticket_type_crud.update_ticket_type(db, ticket_type, ticket_type_data)


@router.delete(
    "/{ticket_type_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_ticket_type(
    ticket_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer", "admin")),
):
    ticket_type = ticket_type_crud.get_ticket_type(db, ticket_type_id)

    if ticket_type is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found",
        )

    expo = expo_crud.get_expo(db, ticket_type.expo_id)

    if expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo not found",
        )

    if current_user.role != "admin" and expo.organiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete ticket types for your own expos",
        )

    try:
        ticket_type_crud.delete_ticket_type(db, ticket_type)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete this ticket type because it is associated with one or more tickets.",
        )

    return None
