from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.location import Location
from app.schemas.location import LocationCreate, LocationUpdate


def get_locations(db: Session) -> list[Location]:
    statement = select(Location).order_by(Location.city)
    return list(db.scalars(statement).all())


def get_location(db: Session, location_id: int) -> Location | None:
    return db.get(Location, location_id)


def create_location(db: Session, location_data: LocationCreate) -> Location:
    location = Location(
        address=location_data.address,
        city=location_data.city,
        zip_code=location_data.zip_code,
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    return location


def update_location(
    db: Session,
    location: Location,
    location_data: LocationUpdate,
) -> Location:
    location.address = location_data.address
    location.city = location_data.city
    location.zip_code = location_data.zip_code

    db.commit()
    db.refresh(location)

    return location


def delete_location(db: Session, location: Location) -> None:
    db.delete(location)
    db.commit()
