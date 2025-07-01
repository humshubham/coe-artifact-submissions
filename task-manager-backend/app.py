from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()

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
        db_user = os.getenv('DB_USER')
        db_password = os.getenv('DB_PASSWORD')
        db_host = os.getenv('DB_HOST')
        db_name = os.getenv('DB_NAME')
        app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/tasks', methods=['POST'])
    def create_task():
        raise NotImplementedError("Not implemented")


    @app.route('/tasks', methods=['GET'])
    def get_tasks():
        raise NotImplementedError("Not implemented")
        

    @app.route('/tasks/<task_id>', methods=['GET'])
    def get_task(task_id):
        raise NotImplementedError("Not implemented")
        

    @app.route('/tasks/<task_id>', methods=['PUT'])
    def update_task(task_id):
        raise NotImplementedError("Not implemented")
        

    @app.route('/tasks/<task_id>', methods=['DELETE'])
    def delete_task(task_id):
        raise NotImplementedError("Not implemented")
        

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)