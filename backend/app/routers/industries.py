from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.crud import industry as industry_crud
from app.db.session import SessionLocal
from app.schemas.industry import IndustryCreate, IndustryUpdate, IndustryResponse
from app.models.industry import Industry
from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/industries", tags=["Industries"])


def get_db():
    with SessionLocal() as db:
        yield db


@router.get("/", response_model=list[IndustryResponse])
def read_industries(db: Session = Depends(get_db)):
    return industry_crud.get_industries(db)


@router.get("/{industry_id}", response_model=IndustryResponse)
def read_industry(industry_id: int, db: Session = Depends(get_db)):
    industry = industry_crud.get_industry(db, industry_id)

    if industry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found",
        )

    return industry


@router.post(
    "/",
    response_model=IndustryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_industry(
    industry_data: IndustryCreate,
    db: Session = Depends(get_db),
):
    return industry_crud.create_industry(db, industry_data)


@router.put("/{industry_id}", response_model=IndustryResponse)
def update_industry(
    industry_id: int,
    industry_data: IndustryUpdate,
    db: Session = Depends(
        get_db,
    ),
):
    industry = industry_crud.get_industry(db, industry_id)

    if industry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found",
        )

    return industry_crud.update_industry(db, industry, industry_data)


@router.delete(
    "/{industry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_industry(industry_id: int, db: Session = Depends(get_db)):
    industry = industry_crud.get_industry(db, industry_id)

    if industry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Industry not found",
        )

    try:
        industry_crud.delete_industry(db, industry)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete this industry because it is being used by one or more expos.",
        )

    return None
