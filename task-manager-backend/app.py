from flask import Flask, request, jsonify, abort, Response
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from pydantic import BaseModel, Field, EmailStr
from flask_pydantic import validate
from typing import Tuple, Optional
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import HTTPException

load_dotenv()

db = SQLAlchemy()


class UserRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=15)
    password: str = Field(..., min_length=8, max_length=100)


class TaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=50)
    description: str = Field('', max_length=200)
    user_id: int


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

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
        }


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __init__(self, title: str, user_id: int, description: str = ''):
        self.title = title
        self.description = description
        self.user_id = user_id

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'user_id': self.user_id
        }

def create_app(database_uri_override: Optional[str] = None) -> Flask:
    app = Flask(__name__)
    if database_uri_override:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_uri_override
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

    @app.route('/register', methods=['POST'])
    @validate()
    def register_user(body: UserRequest):
        if User.query.filter_by(username=body.username).first() is not None:
            return jsonify({'message': 'Username already exists'}), 400
        if User.query.filter_by(email=body.email).first() is not None:
            return jsonify({'message': 'Email already registered'}), 400
        
        new_user = User(username=body.username, email=body.email)
        new_user.set_password(body.password)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify(new_user.to_json()), 201

    @app.route('/tasks', methods=['POST'])
    @validate()
    def create_task(body: TaskRequest) -> Tuple[Response, int]:
        user = db.session.get(User, body.user_id)
        if user is None:
            abort(404, description="User not found")
        new_task = Task(title=body.title, description=body.description, user_id=body.user_id)
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_json()), 201

    @app.route('/tasks', methods=['GET'])
    def get_tasks() -> Response:
        tasks = Task.query.all()
        tasks_list = [task.to_json() for task in tasks]
        return jsonify({'tasks': tasks_list})

    @app.route('/tasks/<task_id>', methods=['GET'])
    def get_task(task_id: int) -> Response:
        task = db.session.get(Task, task_id)
        if task is None:
            abort(404)
        return jsonify(task.to_json())

    @app.route('/tasks/<task_id>', methods=['PUT'])
    @validate()
    def update_task(task_id: int, body: TaskRequest) -> Response:
        task = db.session.get(Task, task_id)
        if task is None:
            abort(404)
        task.title = body.title
        task.description = body.description if body.description is not None else task.description
        db.session.commit()
        return jsonify(task.to_json())

    @app.route('/tasks/<task_id>', methods=['DELETE'])
    def delete_task(task_id: int) -> Response:
        task = db.session.get(Task, task_id)
        if task is None:
            abort(404)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted!'})

    @app.errorhandler(404)
    def not_found(error: HTTPException) -> Tuple[Response, int]:
        return jsonify({'message': 'Resource not found'}), 404

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)