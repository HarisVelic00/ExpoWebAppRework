from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate


def get_notifications(db: Session) -> list[Notification]:
    statement = select(Notification).order_by(Notification.creation_date.desc())
    return list(db.scalars(statement).all())


def get_notification(db: Session, notification_id: int) -> Notification | None:
    return db.get(Notification, notification_id)


def get_user_notifications(db: Session, user_id: int) -> list[Notification]:
    statement = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.creation_date.desc())
    )
    return list(db.scalars(statement).all())


def create_notification(
    db: Session,
    notification_data: NotificationCreate,
) -> Notification:
    notification = Notification(
        title=notification_data.title,
        content=notification_data.content,
        user_id=notification_data.user_id,
        creation_date=datetime.now(timezone.utc).replace(tzinfo=None),
        is_seen=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def update_notification(
    db: Session,
    notification: Notification,
    notification_data: NotificationUpdate,
) -> Notification:
    notification.title = notification_data.title
    notification.content = notification_data.content
    notification.is_seen = notification_data.is_seen

    db.commit()
    db.refresh(notification)

    return notification


def delete_notification(db: Session, notification: Notification) -> None:
    db.delete(notification)
    db.commit()
