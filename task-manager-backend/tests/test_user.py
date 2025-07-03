# import pytest
import json
from models.user import User

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
    user = User(username='foo', email='foo@example.com')
    user.id = 42
    result = user.to_json()
    assert result['id'] == 42
    assert result['username'] == 'foo'
    assert result['email'] == 'foo@example.com'

def test_register_user_null_username(client):
    response = client.post('/register', json={
        'username': None,
        'email': 'test@example.com',
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['username']
    assert 'valid string' in error_detail['msg']

def test_register_user_null_email(client):
    response = client.post('/register', json={
        'username': 'testuser',
        'email': None,
        'password': 'password123'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['email']
    assert 'valid string' in error_detail['msg']

def test_register_user_malformed_json(client):
    resp = client.post('/register', data='notjson', content_type='application/json')
    assert resp.status_code == 400 or resp.status_code == 422

def test_register_user_non_json_content_type(client):
    resp = client.post('/register', data='notjson', content_type='text/plain')
    assert resp.status_code == 400 or resp.status_code == 415

def test_register_user_large_payload(client):
    user_data = {
        'email': 'a' * 120 + '@example.com',
        'username': 'a' * 15,
        'password': 'a' * 100
    }
    resp = client.post('/register', json=user_data)
    assert resp.status_code == 400 or resp.status_code == 413

def test_register_user_email_too_long(client):
    user_data = {
        'email': 'a' * 121 + '@example.com',
        'username': 'user',
        'password': 'password123'
    }
    resp = client.post('/register', json=user_data)
    assert resp.status_code == 400
    data = json.loads(resp.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['email']
    assert 'too long before the @-sign' in error_detail['msg']
