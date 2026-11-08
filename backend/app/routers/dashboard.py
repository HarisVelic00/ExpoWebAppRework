from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.crud.dashboard import get_dashboard_stats
from app.schemas.dashboard import DashboardStats
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return get_dashboard_stats(
        db=db,
        user_id=current_user.id,
        role=current_user.role,
    )
