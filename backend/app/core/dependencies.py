from sqlalchemy.orm import Session
from app.core.security import verify_access_token
from app.crud import user as user_crud
from app.db.session import SessionLocal
from fastapi import Cookie, Depends, HTTPException, status
from app.models.user import User


def get_db():
    with SessionLocal() as db:
        yield db


def get_current_user(
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if access_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = verify_access_token(access_token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    user = user_crud.get_user(db, user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    return user


def require_role(*allowed_roles: str):
    def role_checker(
        current_user: User = Depends(get_current_user),
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action",
            )

        return current_user

    return role_checker
