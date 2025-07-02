import pytest
import json
from datetime import timedelta
import time
from app import create_app, db, Task, User


@pytest.fixture
def app_with_context():
    app = create_app('sqlite:///:memory:')
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app_with_context):
    return app_with_context.test_client()


@pytest.fixture
def user(client):
    user_data = {
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'password123'
    }
    client.post('/register', json=user_data)
    # The user is created, now we can fetch it to get the ID
    with db.session.no_autoflush:
        db_user = User.query.filter_by(username=user_data['username']).first()
        return db_user


@pytest.fixture
def seeded_task(app_with_context, user):
    task = Task(title='Initial Task', description='Initial Description', user_id=user.id)
    db.session.add(task)
    db.session.commit()
    return task


@pytest.fixture
def auth_header(client, user):
    login_data = {
        'username': user.username,
        'password': 'password123'
    }
    response = client.post('/login', json=login_data)
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def test_register_user_success(client):
    user_data = {
        'email': 'newuser@example.com',
        'username': 'newuser',
        'password': 'password123'
    }
    response = client.post('/register', json=user_data)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['username'] == user_data['username']
    assert data['email'] == user_data['email']
    assert 'id' in data


def test_register_user_invalid_email(client):
    response = client.post('/register', json={
        'email': 'not-an-email',
        'username': 'newuser',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "value is not a valid email address" in error_detail["msg"]
    assert error_detail["loc"] == ["email"]


def test_register_user_short_username(client):
    response = client.post('/register', json={
        'email': 'newuser@example.com',
        'username': 'nu',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "String should have at least 3 characters" in error_detail["msg"]
    assert error_detail["loc"] == ["username"]


def test_register_user_long_username(client):
    response = client.post('/register', json={
        'email': 'newuser@example.com',
        'username': 'a' * 16,
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "String should have at most 15 characters" in error_detail["msg"]
    assert error_detail["loc"] == ["username"]


def test_register_user_short_password(client):
    response = client.post('/register', json={
        'email': 'newuser@example.com',
        'username': 'newuser',
        'password': 'a' * 7
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "String should have at least 8 characters" in error_detail["msg"]
    assert error_detail["loc"] == ["password"]


def test_register_user_long_password(client):
    response = client.post('/register', json={
        'email': 'newuser@example.com',
        'username': 'newuser',
        'password': 'a' * 101
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "String should have at most 100 characters" in error_detail["msg"]
    assert error_detail["loc"] == ["password"]


def test_register_user_missing_username(client):
    response = client.post('/register', json={
        'email': 'newuser@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "Field required" in error_detail["msg"]
    assert error_detail["loc"] == ["username"]


def test_register_user_missing_email(client):
    response = client.post('/register', json={
        'username': 'newuser',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "Field required" in error_detail["msg"]
    assert error_detail["loc"] == ["email"]


def test_register_user_missing_password(client):
    response = client.post('/register', json={
        'email': 'newuser@example.com',
        'username': 'newuser'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "Field required" in error_detail["msg"]
    assert error_detail["loc"] == ["password"]


def test_register_user_username_not_string(client):
    response = client.post('/register', json={
        'username': 123,
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "Input should be a valid string" in error_detail["msg"]
    assert error_detail["loc"] == ["username"]


def test_register_user_email_not_string(client):
    response = client.post('/register', json={
        'username': 'testuser',
        'email': 123,
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "Input should be a valid string" in error_detail["msg"]
    assert error_detail["loc"] == ["email"]


def test_register_user_password_not_string(client):
    response = client.post('/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 12345678
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert "Input should be a valid string" in error_detail["msg"]
    assert error_detail["loc"] == ["password"]


def test_register_user_duplicate_username(client, user):
    response = client.post('/register', json={
        'email': 'another@example.com',
        'username': 'testuser',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['message'] == 'Username already exists'


def test_register_user_duplicate_email(client, user):
    response = client.post('/register', json={
        'email': 'test@example.com',
        'username': 'anotheruser',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['message'] == 'Email already registered'


def test_create_task_success(client, user, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Task'
    assert data['description'] == 'Test Description'
    assert 'id' in data
    assert data['user_id'] == user.id


def test_create_task_no_title(client, auth_header):
    response = client.post('/tasks', json={'description': 'This should fail'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['title']
    assert "Field required" in error_detail['msg']


def test_create_task_only_title(client, auth_header):
    response = client.post('/tasks', json={'title': 'Task with title only'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Task with title only'
    assert data['description'] == ''


def test_create_task_empty_title(client, auth_header):
    response = client.post('/tasks', json={'title': '', 'description': 'd'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert data['validation_error']['body_params'][0]['loc'] == ['title']
    assert 'at least 1 character' in data['validation_error']['body_params'][0]['msg']


def test_create_task_wrong_type(client, auth_header):
    response = client.post('/tasks', json={'title': 123, 'description': 'd'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert data['validation_error']['body_params'][0]['loc'] == ['title']
    assert 'Input should be a valid string' in data['validation_error']['body_params'][0]['msg']


def test_create_task_empty_json(client, auth_header):
    response = client.post('/tasks', json={}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    errors = {tuple(e['loc']): e['msg'] for e in data['validation_error']['body_params']}
    assert ('title',) in errors
    assert "Field required" in errors[('title',)]


def test_create_task_no_user_id(client, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Task'
    assert data['description'] == 'Test Description'


def test_create_task_title_max_length(client, auth_header):
    title = 'a' * 50
    response = client.post('/tasks', json={'title': title, 'description': 'd'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == title


def test_create_task_title_too_long(client, auth_header):
    title = 'a' * 51
    response = client.post('/tasks', json={'title': title, 'description': 'd'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert 'String should have at most 50 characters' in error_detail['msg']
    assert error_detail['loc'] == ['title']


def test_create_task_description_max_length(client, auth_header):
    description = 'a' * 200
    response = client.post('/tasks', json={'title': 'Test', 'description': description}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['description'] == description


def test_create_task_description_too_long(client, auth_header):
    description = 'a' * 201
    response = client.post('/tasks', json={'title': 'Test', 'description': description}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert 'String should have at most 200 characters' in error_detail['msg']
    assert error_detail['loc'] == ['description']


def test_create_task_extra_fields(client, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description', 'extra': 'field'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'extra' not in data


def test_get_tasks_empty(client, auth_header):
    response = client.get('/tasks', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0


def test_get_tasks_success(client, seeded_task, user, auth_header):
    response = client.get('/tasks', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert data['tasks'][0]['title'] == seeded_task.title
    assert data['tasks'][0]['user_id'] == user.id


def test_get_task_success(client, seeded_task, auth_header):
    response = client.get(f'/tasks/{seeded_task.id}', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == seeded_task.title


def test_get_task_not_found(client, auth_header):
    response = client.get('/tasks/999', headers=auth_header)
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_get_task_invalid_id(client, auth_header):
    response = client.get('/tasks/abc', headers=auth_header)
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_update_task_success(client, seeded_task, auth_header):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 'New Title', 'description': 'New Description'}, headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'New Title'
    assert data['description'] == 'New Description'
    assert data['id'] == seeded_task.id

    get_response = client.get(f'/tasks/{seeded_task.id}', headers=auth_header)
    data = json.loads(get_response.data)
    assert data['title'] == 'New Title'
    assert data['description'] == 'New Description'


def test_update_task_only_title(client, seeded_task, auth_header):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 'Only Title Updated'}, headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Only Title Updated'
    assert data['description'] == ''


def test_update_task_not_found(client, auth_header):
    response = client.put('/tasks/999', json={'title': 'New Title', 'description': ''}, headers=auth_header)
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_update_task_no_title(client, seeded_task, auth_header):
    response = client.put(f'/tasks/{seeded_task.id}', json={'description': 'This should fail'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['title']
    assert "Field required" in error_detail['msg']


def test_update_task_empty_title(client, seeded_task, auth_header):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': ''}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['title']
    assert "at least 1 character" in error_detail['msg']


def test_update_task_title_too_long(client, seeded_task, auth_header):
    title = 'a' * 51
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': title}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert 'String should have at most 50 characters' in error_detail['msg']
    assert error_detail['loc'] == ['title']


def test_update_task_description_too_long(client, seeded_task, auth_header):
    description = 'a' * 201
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 't', 'description': description}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert 'String should have at most 200 characters' in error_detail['msg']
    assert error_detail['loc'] == ['description']


def test_delete_task_success(client, seeded_task, auth_header):
    response = client.delete(f'/tasks/{seeded_task.id}', headers=auth_header)
    assert response.status_code == 200
    assert b'Task deleted!' in response.data

    get_response = client.get(f'/tasks/{seeded_task.id}', headers=auth_header)
    assert get_response.status_code == 404


def test_delete_task_not_found(client, auth_header):
    response = client.delete('/tasks/999', headers=auth_header)
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_delete_task_invalid_id(client, auth_header):
    response = client.delete('/tasks/abc', headers=auth_header)
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == "Resource not found"


def test_login_user_success(client, user):
    login_data = {
        'username': 'testuser',
        'password': 'password123'
    }
    response = client.post('/login', json=login_data)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'access_token' in data


def test_login_wrong_password(client):
    login_data = {
        'username': 'testuser',
        'password': 'wrongpassword'
    }
    response = client.post('/login', json=login_data)
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['message'] == 'Invalid credentials'


def test_login_nonexistent_user(client):
    login_data = {
        'username': 'nonexistentuser',
        'password': 'password123'
    }
    response = client.post('/login', json=login_data)
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['message'] == 'Invalid credentials'


def test_login_missing_username(client):
    login_data = {'password': 'password123'}
    response = client.post('/login', json=login_data)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data


def test_login_missing_password(client):
    login_data = {'username': 'testuser'}
    response = client.post('/login', json=login_data)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data


def test_user_set_and_check_password():
    user = User(username='foo', email='foo@example.com')
    user.set_password('supersecret')
    assert user.check_password('supersecret')
    assert not user.check_password('wrongpass')


def test_user_to_json():
    user = User(username='bar', email='bar@example.com')
    user.id = 42
    result = user.to_json()
    assert result['id'] == 42
    assert result['username'] == 'bar'
    assert result['email'] == 'bar@example.com'


def test_task_to_json(user):
    task = Task(title='T', description='D', user_id=user.id)
    task.id = 99
    result = task.to_json()
    assert result['id'] == 99
    assert result['title'] == 'T'
    assert result['description'] == 'D'
    assert result['user_id'] == user.id


def test_protected_route_no_token(client):
    resp = client.get('/tasks')
    assert resp.status_code == 401
    assert b'Missing Authorization Header' in resp.data or b'missing' in resp.data.lower()


def test_protected_route_invalid_token(client):
    headers = {'Authorization': 'Bearer invalidtoken'}
    resp = client.get('/tasks', headers=headers)
    assert resp.status_code == 422 or resp.status_code == 401


def test_protected_route_expired_token(client, user):
    # Create a token with a very short expiry
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity=str(user.id), expires_delta=timedelta(seconds=1))
    time.sleep(2)
    headers = {'Authorization': f'Bearer {token}'}
    resp = client.get('/tasks', headers=headers)
    assert resp.status_code == 401 or resp.status_code == 422


def test_register_user_null_username(client):
    resp = client.post('/register', json={'email': 'a@b.com', 'password': 'password123'})
    assert resp.status_code == 400


def test_register_user_null_email(client):
    resp = client.post('/register', json={'username': 'foo', 'password': 'password123'})
    assert resp.status_code == 400


def test_create_task_null_title(client, auth_header):
    resp = client.post('/tasks', json={'description': 'desc'}, headers=auth_header)
    assert resp.status_code == 400


def test_register_user_malformed_json(client):
    resp = client.post('/register', data='notjson', content_type='application/json')
    assert resp.status_code == 400 or resp.status_code == 422


def test_register_user_non_json_content_type(client):
    resp = client.post('/register', data='username=foo&password=bar', content_type='application/x-www-form-urlencoded')
    assert resp.status_code == 400 or resp.status_code == 415


def test_register_user_large_payload(client):
    user_data = {
        'email': 'large@example.com',
        'username': 'largeuser',
        'password': 'p' * 100 
    }
    user_data['extra'] = 'x' * 10000
    resp = client.post('/register', json=user_data)
    assert resp.status_code in (201, 400)


def test_register_user_email_too_long(client):
    long_email = 'a' * 110 + '@example.com'  # 110 + 11 = 121 chars
    user_data = {
        'email': long_email,
        'username': 'longemailuser',
        'password': 'password123'
    }
    resp = client.post('/register', json=user_data)
    assert resp.status_code == 400
    data = resp.get_json()
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    # Pydantic EmailStr will fail before max_length, so check for email validity error
    assert 'not a valid email address' in error_detail['msg']
    assert error_detail['loc'] == ['email']
