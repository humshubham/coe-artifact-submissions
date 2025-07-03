from typing import Optional
from models.user import User
from models.task import Task
from models import db

def get_user_by_id(user_id: int) -> Optional[User]:
    return db.session.get(User, user_id)

def get_task_by_id_and_user(task_id: int, user_id: int) -> Optional[Task]:
    task = db.session.get(Task, task_id)
    if task and task.user_id == user_id:
        return task
    return None

def check_username_exists(username: str) -> bool:
    return User.query.filter_by(username=username).first() is not None

def check_email_exists(email: str) -> bool:
    return User.query.filter_by(email=email).first() is not None 