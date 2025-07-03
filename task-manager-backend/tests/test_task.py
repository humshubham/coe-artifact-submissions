# import pytest
import json
from models.task import Task
from datetime import timedelta
import time

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

def test_create_task_null_title(client, auth_header):
    response = client.post('/tasks', json={'title': None, 'description': 'desc'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['title']
    assert 'valid string' in error_detail['msg']
