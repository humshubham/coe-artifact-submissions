import pytest
from app import create_app
from models import db
from models.user import User
from models.task import Task

@pytest.fixture
def app_with_context():
    """Create a Flask app context with an in-memory SQLite DB for testing."""
    app = create_app('sqlite:///:memory:', testing=True)
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app_with_context):
    """Return a test client for the Flask app."""
    return app_with_context.test_client()

@pytest.fixture
def user(client):
    """Register and return a test user object from the DB."""
    user_data = {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'password123'
    }
    client.post('/register', json=user_data)
    with db.session.no_autoflush:
        db_user = User.query.filter_by(username=user_data['username']).first()
        return db_user

@pytest.fixture
def seeded_task(app_with_context, user):
    """Create and return a seeded task for the test user."""
    task = Task(title='Initial Task', description='Initial Description', user_id=user.id)
    db.session.add(task)
    db.session.commit()
    return task

@pytest.fixture
def auth_header(client, user):
    """Return an auth header for the test user."""
    login_data = {
        'username': user.username,
        'password': 'password123'
    }
    response = client.post('/login', json=login_data)
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'} 