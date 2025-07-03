from flask import Flask, jsonify, Response
from dotenv import load_dotenv
import os
from typing import Tuple, Optional
from werkzeug.exceptions import HTTPException
from flask_jwt_extended import JWTManager

from models import db

from routes.auth import bp as auth_bp
from routes.tasks import bp as tasks_bp

from config import Config, DevelopmentConfig, TestingConfig

load_dotenv()

def create_app(database_uri_override: Optional[str] = None, testing: bool = False) -> Flask:
    app = Flask(__name__)
    if testing:
        app.config.from_object(TestingConfig)
    elif os.getenv('FLASK_ENV') == 'development':
        app.config.from_object(DevelopmentConfig)
    else:
        app.config.from_object(Config)
    if database_uri_override:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_uri_override

    jwt = JWTManager(app)
    db.init_app(app)

    
    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)

    @app.errorhandler(400)
    def bad_request(error: HTTPException) -> Tuple[Response, int]:
        return jsonify({'validation_error': {'message': error.description}}), 400

    @app.errorhandler(404)
    def not_found(error: HTTPException) -> Tuple[Response, int]:
        return jsonify({'message': 'Resource not found'}), 404

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)