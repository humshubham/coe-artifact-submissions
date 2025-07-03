from models import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(15), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    tasks = db.relationship('Task', backref='user', lazy=True)

    def __init__(self, username: str, email: str):
        self.username = username
        self.email = email

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_json(self) -> dict:
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
        } 