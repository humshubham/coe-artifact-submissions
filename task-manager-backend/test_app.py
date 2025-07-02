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


def test_update_task_not_found(client):
    response = client.put('/tasks/999', json={'title': 'New Title', 'description': ''})
    assert response.status_code == 404


def test_update_task_no_title(client, seeded_task):
    response = client.put(f'/tasks/{seeded_task.id}', json={'description': 'This should fail'})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data


def test_delete_task_success(client, seeded_task):
    response = client.delete(f'/tasks/{seeded_task.id}')
    assert response.status_code == 200
    assert b'Task deleted!' in response.data

    get_response = client.get(f'/tasks/{seeded_task.id}')
    assert get_response.status_code == 404


def test_delete_task_not_found(client):
    response = client.delete('/tasks/999')
    assert response.status_code == 404
