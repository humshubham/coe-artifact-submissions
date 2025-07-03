from flask import Blueprint, jsonify, Response
from flask_pydantic import validate
from models.user import User
from models import db
from schemas.user import UserRequest, LoginRequest
from flask_jwt_extended import create_access_token
from utils import check_username_exists, check_email_exists
from typing import Tuple

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
@validate()
def register_user(body: UserRequest) -> Tuple[Response, int]:
    if check_username_exists(body.username):
        return jsonify({'message': 'Username already exists'}), 400
    
    if check_email_exists(body.email):
        return jsonify({'message': 'Email already registered'}), 400
    
    new_user = User(username=body.username, email=body.email)
    new_user.set_password(body.password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify(new_user.to_json()), 201

@bp.route('/login', methods=['POST'])
@validate()
def login(body: LoginRequest) -> Tuple[Response, int]:
    user = User.query.filter_by(username=body.username).first()
    
    if user and user.check_password(body.password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401 