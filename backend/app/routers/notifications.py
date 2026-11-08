from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud import notification as notification_crud
from app.schemas.notification import (
    NotificationCreate,
    NotificationUpdate,
    NotificationResponse,
)
from app.core.dependencies import get_current_user, require_role
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def get_db():
    with SessionLocal() as db:
        yield db


@router.get("/", response_model=list[NotificationResponse])
def read_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role == "admin":
        return notification_crud.get_notifications(db)

    return notification_crud.get_user_notifications(db, current_user.id)


@router.get("/user/{user_id}", response_model=list[NotificationResponse])
def read_user_notifications(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own notifications",
        )

    return notification_crud.get_user_notifications(db, user_id)


@router.get("/{notification_id}", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = notification_crud.get_notification(db, notification_id)

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    if current_user.role != "admin" and notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own notifications",
        )

    return notification


@router.post(
    "/",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    return notification_crud.create_notification(db, notification_data)


@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(
    notification_id: int,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = notification_crud.get_notification(db, notification_id)

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    if current_user.role != "admin" and notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own notifications",
        )

    return notification_crud.update_notification(db, notification, notification_data)


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = notification_crud.get_notification(db, notification_id)

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    if current_user.role != "admin" and notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own notifications",
        )

    notification_crud.delete_notification(db, notification)
    return None
