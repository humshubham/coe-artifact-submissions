from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from pydantic import BaseModel
from flask_pydantic import validate

load_dotenv()

db = SQLAlchemy()


class TaskRequest(BaseModel):
    title: str
    description: str = ''


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))

    def __init__(self, title, description=''):
        self.title = title
        self.description = description

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
    def create_task(body: TaskRequest):
        new_task = Task(title=body.title, description=body.description)
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'id': new_task.id, 'title': new_task.title, 'description': new_task.description}), 201

    @app.route('/tasks', methods=['GET'])
    def get_tasks():
        tasks = Task.query.all()
        output = []
        for task in tasks:
            task_data = {'id': task.id, 'title': task.title, 'description': task.description}
            output.append(task_data)
        return jsonify({'tasks': output})

    @app.route('/tasks/<task_id>', methods=['GET'])
    def get_task(task_id):
        task = db.session.get(Task, task_id)
        if task is None:
            abort(404)
        task_data = {'id': task.id, 'title': task.title, 'description': task.description}
        return jsonify(task_data)

    @app.route('/tasks/<task_id>', methods=['PUT'])
    @validate()
    def update_task(task_id: int, body: TaskRequest):
        task = db.session.get(Task, task_id)
        if task is None:
            abort(404)
        task.title = body.title
        task.description = body.description if body.description is not None else task.description
        db.session.commit()
        return jsonify({'id': task.id, 'title': task.title, 'description': task.description})

    @app.route('/tasks/<task_id>', methods=['DELETE'])
    def delete_task(task_id):
        task = db.session.get(Task, task_id)
        if task is None:
            abort(404)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted!'})

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)