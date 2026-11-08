from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.industry import Industry
from app.schemas.industry import IndustryCreate, IndustryUpdate


def get_industries(db: Session) -> list[Industry]:
    statement = select(Industry).order_by(Industry.name)
    return list(db.scalars(statement).all())


def get_industry(db: Session, industry_id: int) -> Industry | None:
    return db.get(Industry, industry_id)


def create_industry(db: Session, industry_data: IndustryCreate) -> Industry:
    industry = Industry(name=industry_data.name)

    db.add(industry)
    db.commit()
    db.refresh(industry)

    return industry


def update_industry(
    db: Session,
    industry: Industry,
    industry_data: IndustryUpdate,
) -> Industry:
    industry.name = industry_data.name

    db.commit()
    db.refresh(industry)

    return industry


def delete_industry(db: Session, industry: Industry) -> None:
    db.delete(industry)
    db.commit()
