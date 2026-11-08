from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.crud import user as user_crud
from app.db.session import SessionLocal
from app.schemas.user import UserLogin, UserRegister, UserResponse
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_db():
    with SessionLocal() as db:
        yield db


def set_auth_cookie(response: Response, access_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )


@router.post(
    "/register",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserRegister, response: Response, db: Session = Depends(get_db)
):
    if user_crud.get_user_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered",
        )

    if user_crud.get_user_by_email(db, str(user_data.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = user_crud.create_user(
        db,
        user_data,
        role=user_data.role,
    )

    access_token = create_access_token(user.id)
    set_auth_cookie(response, access_token)

    return {
        "user": UserResponse.model_validate(user),
        "message": "Registration successful",
    }


@router.post("/login")
def login(user_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = user_crud.get_user_by_username(db, user_data.username)

    if user is None or not verify_password(
        user_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )

    access_token = create_access_token(user.id)
    set_auth_cookie(response, access_token)

    return {"message": "Login successful"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=False,
        samesite="lax",
    )
    return {"message": "Logged out successfully"}
