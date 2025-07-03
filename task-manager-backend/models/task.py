from models import db

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __init__(self, title: str, user_id: int, description: str = ''):
        self.title = title
        self.description = description
        self.user_id = user_id

    def to_json(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'user_id': self.user_id
        } 