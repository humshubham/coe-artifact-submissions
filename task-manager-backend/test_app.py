import pytest
import json
from app import create_app, db, Task


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
def seeded_task(app_with_context):
    task = Task(title='Initial Task', description='Initial Description')
    db.session.add(task)
    db.session.commit()
    return task


def test_create_task_success(client):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description'})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Task'
    assert data['description'] == 'Test Description'
    assert 'id' in data


def test_create_task_no_title(client):
    response = client.post('/tasks', json={'description': 'This should fail'})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert 'title' in data['validation_error']['body_params'][0]['loc']


def test_create_task_only_title(client):
    response = client.post('/tasks', json={'title': 'Task with title only'})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Task with title only'
    assert data['description'] == ''


def test_create_task_empty_title(client):
    response = client.post('/tasks', json={'title': '', 'description': 'd'})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert data['validation_error']['body_params'][0]['loc'] == ['title']
    assert 'at least 1 character' in data['validation_error']['body_params'][0]['msg']


def test_create_task_wrong_type(client):
    response = client.post('/tasks', json={'title': 123, 'description': 'd'})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert data['validation_error']['body_params'][0]['loc'] == ['title']
    assert 'Input should be a valid string' in data['validation_error']['body_params'][0]['msg']


def test_create_task_empty_json(client):
    response = client.post('/tasks', json={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert data['validation_error']['body_params'][0]['loc'] == ['title']
    assert 'Field required' in data['validation_error']['body_params'][0]['msg']


def test_create_task_title_max_length(client):
    title = 'a' * 50
    response = client.post('/tasks', json={'title': title, 'description': 'd'})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == title


def test_create_task_title_too_long(client):
    title = 'a' * 51
    response = client.post('/tasks', json={'title': title, 'description': 'd'})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert 'String should have at most 50 characters' in data['validation_error']['body_params'][0]['msg']


def test_create_task_description_max_length(client):
    description = 'a' * 200
    response = client.post('/tasks', json={'title': 'Test', 'description': description})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['description'] == description


def test_create_task_description_too_long(client):
    description = 'a' * 201
    response = client.post('/tasks', json={'title': 'Test', 'description': description})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert 'String should have at most 200 characters' in data['validation_error']['body_params'][0]['msg']


def test_create_task_extra_fields(client):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description', 'extra': 'field'})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'extra' not in data


def test_get_tasks_empty(client):
    response = client.get('/tasks')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0


def test_get_tasks_success(client, seeded_task):
    response = client.get('/tasks')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert data['tasks'][0]['title'] == seeded_task.title


def test_get_task_success(client, seeded_task):
    response = client.get(f'/tasks/{seeded_task.id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == seeded_task.title


def test_get_task_not_found(client):
    response = client.get('/tasks/999')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_get_task_invalid_id(client):
    response = client.get('/tasks/abc')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_update_task_success(client, seeded_task):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 'New Title', 'description': 'New Description'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'New Title'
    assert data['description'] == 'New Description'
    assert data['id'] == seeded_task.id

    get_response = client.get(f'/tasks/{seeded_task.id}')
    data = json.loads(get_response.data)
    assert data['title'] == 'New Title'
    assert data['description'] == 'New Description'


def test_update_task_only_title(client, seeded_task):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 'Only Title Updated'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Only Title Updated'
    assert data['description'] == ''


def test_update_task_not_found(client):
    response = client.put('/tasks/999', json={'title': 'New Title', 'description': ''})
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_update_task_no_title(client, seeded_task):
    response = client.put(f'/tasks/{seeded_task.id}', json={'description': 'This should fail'})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data


def test_update_task_empty_title(client, seeded_task):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': ''})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert data['validation_error']['body_params'][0]['loc'] == ['title']
    assert 'at least 1 character' in data['validation_error']['body_params'][0]['msg']


def test_update_task_title_too_long(client, seeded_task):
    title = 'a' * 51
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': title})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert 'String should have at most 50 characters' in data['validation_error']['body_params'][0]['msg']


def test_update_task_description_too_long(client, seeded_task):
    description = 'a' * 201
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 't', 'description': description})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    assert 'String should have at most 200 characters' in data['validation_error']['body_params'][0]['msg']


def test_delete_task_success(client, seeded_task):
    response = client.delete(f'/tasks/{seeded_task.id}')
    assert response.status_code == 200
    assert b'Task deleted!' in response.data

    get_response = client.get(f'/tasks/{seeded_task.id}')
    assert get_response.status_code == 404


def test_delete_task_not_found(client):
    response = client.delete('/tasks/999')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'


def test_delete_task_invalid_id(client):
    response = client.delete('/tasks/abc')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert data['message'] == 'Resource not found'
