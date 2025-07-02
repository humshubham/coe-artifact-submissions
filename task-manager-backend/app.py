from flask import Flask, request, jsonify, abort, Response
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from pydantic import BaseModel, Field
from flask_pydantic import validate
from typing import Tuple

load_dotenv()

db = SQLAlchemy()


class TaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=50)
    description: str = Field('', max_length=200)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))

    def __init__(self, title: str, description: str = ''):
        self.title = title
        self.description = description

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
        }

def create_app(database_uri_override=None):
    app = Flask(__name__)
    if database_uri_override:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_uri_override
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    print(f"Using database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

    @app.route('/tasks', methods=['POST'])
    @validate()
    def create_task(body: TaskRequest) -> Tuple[Response, int]:
        new_task = Task(title=body.title, description=body.description)
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
    def not_found(error: Exception) -> Tuple[Response, int]:
        return jsonify({'message': 'Resource not found'}), 404

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)