import pytest
import json
from app import create_app, db, Task

@pytest.fixture
def client():
    app = create_app('sqlite:///:memory:')
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_create_task_success(client):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description'})
    assert response.status_code == 201
    assert b"New task created!" in response.data

def test_get_tasks_success(client):

    client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description'})
    
    response = client.get('/tasks')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert data['tasks'][0]['title'] == 'Test Task'

def test_get_task_success(client):
    
    post_response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description'})
    
    response = client.get('/tasks')
    task_id = json.loads(response.data)['tasks'][0]['id']

    response = client.get(f'/tasks/{task_id}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Test Task'

def test_update_task_success(client):

    client.post('/tasks', json={'title': 'Old Title', 'description': 'Old Description'})
    
    response = client.get('/tasks')
    task_id = json.loads(response.data)['tasks'][0]['id']

    update_response = client.put(f'/tasks/{task_id}', json={'title': 'New Title'})
    assert update_response.status_code == 200
    assert b'Task updated!' in update_response.data

    get_response = client.get(f'/tasks/{task_id}')
    data = json.loads(get_response.data)
    assert data['title'] == 'New Title'

def test_delete_task_success(client):

    client.post('/tasks', json={'title': 'Task to be deleted', 'description': ''})
    
    response = client.get('/tasks')
    task_id = json.loads(response.data)['tasks'][0]['id']

    delete_response = client.delete(f'/tasks/{task_id}')
    assert delete_response.status_code == 200
    assert b'Task deleted!' in delete_response.data

    get_response = client.get(f'/tasks/{task_id}')
    assert get_response.status_code == 404
