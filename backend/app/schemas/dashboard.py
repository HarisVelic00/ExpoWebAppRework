from decimal import Decimal
from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_expos: int
    upcoming_expos: int
    tickets_sold: int
    total_revenue: Decimal
