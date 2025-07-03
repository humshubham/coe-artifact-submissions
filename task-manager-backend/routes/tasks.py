from flask import Blueprint, jsonify, abort, Response
from flask_pydantic import validate
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.task import Task
from models import db
from schemas.task import TaskRequest
from utils import get_user_by_id, get_task_by_id_and_user
from typing import Tuple

bp = Blueprint('tasks', __name__)

@bp.route('/tasks', methods=['POST'])
@jwt_required()
@validate()
def create_task(body: TaskRequest) -> Tuple[Response, int]:

    current_user_id = int(get_jwt_identity())
    user = get_user_by_id(current_user_id)
    
    if user is None:
        abort(404, description='User not found')
    
    new_task = Task(
        title=body.title, 
        description=body.description, 
        user_id=current_user_id
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(new_task.to_json()), 201

@bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks() -> Response:

    current_user_id = int(get_jwt_identity())
    tasks = Task.query.filter_by(user_id=current_user_id).all()
    tasks_list = [task.to_json() for task in tasks]
    
    return jsonify({'tasks': tasks_list})

@bp.route('/tasks/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id: int) -> Response:

    current_user_id = int(get_jwt_identity())
    task = get_task_by_id_and_user(task_id, current_user_id)
    
    if task is None:
        abort(404, description='Task not found')
    
    return jsonify(task.to_json())

@bp.route('/tasks/<task_id>', methods=['PUT'])
@jwt_required()
@validate()
def update_task(task_id: int, body: TaskRequest) -> Response:

    current_user_id = int(get_jwt_identity())
    task = get_task_by_id_and_user(task_id, current_user_id)
    
    if task is None:
        abort(404, description='Task not found')
    
    task.title = body.title
    task.description = body.description if body.description is not None else task.description
    
    db.session.commit()
    
    return jsonify(task.to_json())

@bp.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id: int) -> Response:

    current_user_id = int(get_jwt_identity())
    task = get_task_by_id_and_user(task_id, current_user_id)
    
    if task is None:
        abort(404, description='Task not found')
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted!'}) 