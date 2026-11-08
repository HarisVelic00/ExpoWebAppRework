from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.expo import Expo
from app.schemas.expo import ExpoCreate, ExpoUpdate


def get_expos(db: Session) -> list[Expo]:
    statement = select(Expo).order_by(Expo.date_of_opening)
    return list(db.scalars(statement).all())


def get_expo(db: Session, expo_id: int) -> Expo | None:
    return db.get(Expo, expo_id)


def create_expo(db: Session, expo_data: ExpoCreate, organiser_id: int) -> Expo:
    expo = Expo(
        title=expo_data.title,
        description=expo_data.description,
        date_of_opening=expo_data.date_of_opening,
        date_of_closing=expo_data.date_of_closing,
        work_hours_opening=expo_data.work_hours_opening,
        work_hours_closing=expo_data.work_hours_closing,
        organiser_id=organiser_id,
        location_id=expo_data.location_id,
        industry_id=expo_data.industry_id,
    )

    db.add(expo)
    db.commit()
    db.refresh(expo)

    return expo


def update_expo(
    db: Session,
    expo: Expo,
    expo_data: ExpoUpdate,
) -> Expo:
    expo.title = expo_data.title
    expo.description = expo_data.description
    expo.date_of_opening = expo_data.date_of_opening
    expo.date_of_closing = expo_data.date_of_closing
    expo.work_hours_opening = expo_data.work_hours_opening
    expo.work_hours_closing = expo_data.work_hours_closing
    expo.location_id = expo_data.location_id
    expo.industry_id = expo_data.industry_id

    db.commit()
    db.refresh(expo)

    return expo


def delete_expo(db: Session, expo: Expo) -> None:
    db.delete(expo)
    db.commit()
