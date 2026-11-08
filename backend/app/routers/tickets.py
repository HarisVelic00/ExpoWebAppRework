from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud import ticket as ticket_crud
from app.crud import expo as expo_crud
from app.db.session import SessionLocal
from app.schemas.ticket import TicketCreate, TicketPurchase, TicketResponse
from app.core.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def get_db():
    with SessionLocal() as db:
        yield db


@router.get("/", response_model=list[TicketResponse])
def read_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        return ticket_crud.get_tickets(db)

    if current_user.role == "organizer":
        tickets = ticket_crud.get_tickets(db)

        return [
            ticket
            for ticket in tickets
            if (expo := expo_crud.get_expo(db, ticket.expo_id)) is not None
            and expo.organiser_id == current_user.id
        ]

    return ticket_crud.get_user_tickets(db, current_user.id)


@router.get("/expo/{expo_id}", response_model=list[TicketResponse])
def read_tickets_by_expo(
    expo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer", "admin")),
):
    expo = expo_crud.get_expo(db, expo_id)

    if expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo not found",
        )

    if current_user.role != "admin" and expo.organiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view tickets for your own expos",
        )

    return ticket_crud.get_tickets_by_expo(db, expo_id)


@router.post(
    "/purchase",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def purchase_ticket(
    ticket_data: TicketPurchase,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("visitor")),
):
    try:
        return ticket_crud.purchase_ticket(
            db,
            ticket_data,
            current_user.id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.get("/{ticket_id}", response_model=TicketResponse)
def read_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = ticket_crud.get_ticket(db, ticket_id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    if current_user.role == "admin":
        return ticket

    if current_user.role == "organizer":
        expo = expo_crud.get_expo(db, ticket.expo_id)

        if expo is not None and expo.organiser_id == current_user.id:
            return ticket

    if ticket.user_id == current_user.id:
        return ticket

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You cannot access this ticket",
    )


@router.post(
    "/",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer", "admin")),
):
    expo = expo_crud.get_expo(db, ticket_data.expo_id)

    if expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo not found",
        )

    if current_user.role != "admin" and expo.organiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create tickets for your own expos",
        )

    try:
        return ticket_crud.create_ticket(db, ticket_data)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer", "admin")),
):
    ticket = ticket_crud.get_ticket(db, ticket_id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    expo = expo_crud.get_expo(db, ticket.expo_id)

    if expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo not found",
        )

    if current_user.role != "admin" and expo.organiser_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete tickets for your own expos",
        )

    ticket_crud.delete_ticket(db, ticket)
    return None
