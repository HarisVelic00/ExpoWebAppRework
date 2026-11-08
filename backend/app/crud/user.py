from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_users(db: Session) -> list[User]:
    statement = select(User).order_by(User.username)
    return list(db.scalars(statement).all())


def get_user(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_username(db: Session, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    return db.scalar(statement)


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.scalar(statement)


def create_user(
    db: Session,
    user_data: UserCreate,
    role: str = "visitor",
) -> User:
    user = User(
        username=user_data.username,
        full_name=user_data.full_name,
        email=str(user_data.email),
        hashed_password=hash_password(user_data.password),
        role=role,
        company_name=user_data.company_name,
        about_us=user_data.about_us,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_user(db: Session, user: User, user_data: UserUpdate) -> User:
    user.full_name = user_data.full_name
    user.email = user_data.email
    user.company_name = user_data.company_name
    user.about_us = user_data.about_us

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()


def change_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
) -> bool:
    if not verify_password(current_password, user.hashed_password):
        return False

    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)

    return True
