from models import db
from datetime import datetime, timezone
from schemas.task import TaskStatus
import sqlalchemy as sa

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    status = db.Column(sa.Enum(TaskStatus, name="taskstatus"), nullable=False, default=TaskStatus.TODO)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __init__(self, title: str, user_id: int, description: str = '', status: TaskStatus = TaskStatus.TODO):
        self.title = title
        self.description = description
        self.user_id = user_id
        self.status = status

    def to_json(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status.value,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 