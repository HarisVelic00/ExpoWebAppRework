from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud import location as location_crud
from app.db.session import SessionLocal
from app.schemas.location import (
    LocationCreate,
    LocationUpdate,
    LocationResponse,
)
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/locations", tags=["Locations"])


def get_db():
    with SessionLocal() as db:
        yield db


@router.get("/", response_model=list[LocationResponse])
def read_locations(db: Session = Depends(get_db)):
    return location_crud.get_locations(db)


@router.get("/{location_id}", response_model=LocationResponse)
def read_location(location_id: int, db: Session = Depends(get_db)):
    location = location_crud.get_location(db, location_id)

    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    return location


@router.post(
    "/",
    response_model=LocationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_location(
    location_data: LocationCreate,
    db: Session = Depends(get_db),
):
    return location_crud.create_location(db, location_data)


@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    location_data: LocationUpdate,
    db: Session = Depends(get_db),
):
    location = location_crud.get_location(db, location_id)

    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    return location_crud.update_location(db, location, location_data)


@router.delete(
    "/{location_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    location = location_crud.get_location(db, location_id)

    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )

    try:
        location_crud.delete_location(db, location)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete this location because it is being used by one or more expos.",
        )

    return None
