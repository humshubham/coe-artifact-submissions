from flask import Blueprint, jsonify, abort, Response, request
from flask_pydantic import validate
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.task import Task
from models import db
from schemas.task import TaskRequest, TaskStatus
from utils import get_user_by_id, get_task_by_id_and_user
from typing import Tuple
from sqlalchemy.orm import Query

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
        status=body.status,
        user_id=current_user_id
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(new_task.to_json()), 201

@bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks() -> Response:

    current_user_id = int(get_jwt_identity())
    
    title_filter = request.args.get('title')
    description_filter = request.args.get('description')
    status_filter = request.args.get('status')
    sort_by = request.args.get('sort_by')
    sort_order = request.args.get('sort_order', 'asc')
    page_no = int(request.args.get('page_no', 1))
    limit = int(request.args.get('limit', 10))
    
    if sort_by and sort_by not in ['title', 'description', 'status', 'created_at']:
        abort(400, description='Invalid sort_by parameter')
    
    if sort_order not in ['asc', 'desc']:
        abort(400, description='Invalid sort_order parameter')
    
    if status_filter:
        try:
            status_enum = TaskStatus(status_filter)
        except ValueError:
            abort(400, description='Invalid status parameter')
    else:
        status_enum = None
    
    if page_no < 1:
        abort(400, description='page_no must be at least 1')
    
    if limit < 1 or limit > 100:
        abort(400, description='limit must be between 1 and 100')
    
    query_obj: Query = Task.query.filter_by(user_id=current_user_id)
    
    if title_filter:
        query_obj = query_obj.filter(Task.title.ilike(f'%{title_filter}%'))  # type: ignore
    
    if description_filter:
        query_obj = query_obj.filter(Task.description.ilike(f'%{description_filter}%'))  # type: ignore
    
    if status_enum:
        query_obj = query_obj.filter(Task.status == status_enum)  # type: ignore
    
    if sort_by:
        sort_column = getattr(Task, sort_by)
        if sort_order == 'desc':
            sort_column = sort_column.desc()
        query_obj = query_obj.order_by(sort_column)
    else:
        query_obj = query_obj.order_by(Task.created_at.desc())
    
    total_count = query_obj.count()
    
    offset = (page_no - 1) * limit
    query_obj = query_obj.offset(offset).limit(limit)
    
    tasks = query_obj.all()
    tasks_list = [task.to_json() for task in tasks]
    
    total_pages = (total_count + limit - 1) // limit
    has_next = page_no < total_pages
    has_prev = page_no > 1
    
    pagination_info = {
        'page_no': page_no,
        'limit': limit,
        'total': total_count,
        'total_pages': total_pages,
        'has_next': has_next,
        'has_prev': has_prev
    }
    
    return jsonify({
        'tasks': tasks_list,
        'pagination': pagination_info
    })

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
    task.status = body.status
    
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