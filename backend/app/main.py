from fastapi import FastAPI, Request
from app.routers.industries import router as industries_router
from app.routers.locations import router as locations_router
from app.routers.ticket_types import router as ticket_types_router
from app.routers.users import router as users_router
from app.routers.expo import router as expos_router
from app.routers.tickets import router as tickets_router
from app.routers.notifications import router as notifications_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

TRUSTED_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}


@app.middleware("http")
async def verify_origin(request: Request, call_next):
    unsafe_methods = {"POST", "PUT", "PATCH", "DELETE"}

    if request.method in unsafe_methods:
        origin = request.headers.get("origin")

        if origin not in TRUSTED_ORIGINS:
            return JSONResponse(
                status_code=403,
                content={"detail": "Untrusted request origin"},
            )

    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(industries_router)
app.include_router(locations_router)
app.include_router(expos_router)
app.include_router(ticket_types_router)
app.include_router(tickets_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)
