from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud import expo as expo_crud
from app.db.session import SessionLocal
from app.schemas.expo import ExpoCreate, ExpoUpdate, ExpoResponse
from app.core.dependencies import require_role
from app.models.user import User
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/expos", tags=["Expos"])


def get_db():
    with SessionLocal() as db:
        yield db


@router.get("/", response_model=list[ExpoResponse])
def read_expos(db: Session = Depends(get_db)):
    return expo_crud.get_expos(db)


@router.get("/{expo_id}", response_model=ExpoResponse)
def read_expo(expo_id: int, db: Session = Depends(get_db)):
    expo = expo_crud.get_expo(db, expo_id)

    if expo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expo not found",
        )

    return expo


@router.post("/", response_model=ExpoResponse, status_code=status.HTTP_201_CREATED)
def create_expo(
    expo_data: ExpoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("organizer", "admin")),
):
    return expo_crud.create_expo(
        db,
        expo_data,
        organiser_id=current_user.id,
    )


@router.put("/{expo_id}", response_model=ExpoResponse)
def update_expo(
    expo_id: int,
    expo_data: ExpoUpdate,
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
            detail="You can only update your own expos",
        )

    return expo_crud.update_expo(db, expo, expo_data)


@router.delete("/{expo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expo(
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
            detail="You can only delete your own expos",
        )

    try:
        expo_crud.delete_expo(db, expo)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete this expo because it has associated tickets or ticket types.",
        )

    return None
