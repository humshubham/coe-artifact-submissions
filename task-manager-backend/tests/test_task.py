import json
from models.task import Task
from datetime import timedelta
import time
from schemas.task import TaskStatus

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
    assert result['status'] == 'todo' 

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

def test_get_tasks_with_filtering_by_title(client, auth_header):
    tasks_data = [
        {'title': 'Work Task', 'description': 'Important work'},
        {'title': 'Personal Task', 'description': 'Personal stuff'},
        {'title': 'Work Meeting', 'description': 'Team meeting'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=Work', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 2
    assert all('Work' in task['title'] for task in data['tasks'])

def test_get_tasks_with_filtering_by_description(client, auth_header):
    tasks_data = [
        {'title': 'Task 1', 'description': 'Important work'},
        {'title': 'Task 2', 'description': 'Personal stuff'},
        {'title': 'Task 3', 'description': 'Important meeting'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?description=Important', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 2
    assert all('Important' in task['description'] for task in data['tasks'])

def test_get_tasks_with_sorting_by_title_asc(client, auth_header):
    tasks_data = [
        {'title': 'Zebra Task', 'description': 'Last'},
        {'title': 'Alpha Task', 'description': 'First'},
        {'title': 'Beta Task', 'description': 'Second'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?sort_by=title&sort_order=asc', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 3
    assert data['tasks'][0]['title'] == 'Alpha Task'
    assert data['tasks'][1]['title'] == 'Beta Task'
    assert data['tasks'][2]['title'] == 'Zebra Task'

def test_get_tasks_with_sorting_by_title_desc(client, auth_header):
    tasks_data = [
        {'title': 'Alpha Task', 'description': 'First'},
        {'title': 'Zebra Task', 'description': 'Last'},
        {'title': 'Beta Task', 'description': 'Second'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?sort_by=title&sort_order=desc', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 3
    assert data['tasks'][0]['title'] == 'Zebra Task'
    assert data['tasks'][1]['title'] == 'Beta Task'
    assert data['tasks'][2]['title'] == 'Alpha Task'

def test_get_tasks_with_sorting_by_created_at_desc(client, auth_header):
    tasks_data = [
        {'title': 'First Task', 'description': 'Created first'},
        {'title': 'Second Task', 'description': 'Created second'},
        {'title': 'Third Task', 'description': 'Created third'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
        time.sleep(0.1)  # Small delay to ensure different timestamps
    
    response = client.get('/tasks?sort_by=created_at&sort_order=desc', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 3
    assert data['tasks'][0]['title'] == 'Third Task'
    assert data['tasks'][1]['title'] == 'Second Task'
    assert data['tasks'][2]['title'] == 'First Task'

def test_get_tasks_with_pagination_first_page(client, auth_header):
    for i in range(15):
        client.post('/tasks', json={'title': f'Task {i+1}', 'description': f'Description {i+1}'}, headers=auth_header)
    
    response = client.get('/tasks?page_no=1&limit=10', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 10
    assert data['pagination']['page_no'] == 1
    assert data['pagination']['limit'] == 10
    assert data['pagination']['total'] == 15
    assert data['pagination']['total_pages'] == 2
    assert data['pagination']['has_next'] == True
    assert data['pagination']['has_prev'] == False

def test_get_tasks_with_pagination_second_page(client, auth_header):
    for i in range(15):
        client.post('/tasks', json={'title': f'Task {i+1}', 'description': f'Description {i+1}'}, headers=auth_header)
    
    response = client.get('/tasks?page_no=2&limit=10', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 5
    assert data['pagination']['page_no'] == 2
    assert data['pagination']['limit'] == 10
    assert data['pagination']['total'] == 15
    assert data['pagination']['total_pages'] == 2
    assert data['pagination']['has_next'] == False
    assert data['pagination']['has_prev'] == True

def test_get_tasks_with_combined_filtering_sorting_pagination(client, auth_header):
    tasks_data = [
        {'title': 'Work Alpha', 'description': 'Important work'},
        {'title': 'Work Beta', 'description': 'Important work'},
        {'title': 'Personal Task', 'description': 'Personal stuff'},
        {'title': 'Work Gamma', 'description': 'Important work'},
        {'title': 'Meeting Task', 'description': 'Team meeting'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=Work&sort_by=title&sort_order=asc&page_no=1&limit=2', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 2
    assert data['tasks'][0]['title'] == 'Work Alpha'
    assert data['tasks'][1]['title'] == 'Work Beta'
    assert data['pagination']['total'] == 3
    assert data['pagination']['total_pages'] == 2

def test_get_tasks_with_invalid_sort_by_parameter(client, auth_header):
    response = client.get('/tasks?sort_by=invalid_field', headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data

def test_get_tasks_with_invalid_sort_order_parameter(client, auth_header):
    response = client.get('/tasks?sort_order=invalid_order', headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data

def test_get_tasks_with_invalid_page_parameter(client, auth_header):
    response = client.get('/tasks?page_no=0', headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data

def test_get_tasks_with_invalid_limit_parameter(client, auth_header):
    response = client.get('/tasks?limit=101', headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data

def test_get_tasks_with_negative_limit_parameter(client, auth_header):
    response = client.get('/tasks?limit=-1', headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data

def test_get_tasks_empty_with_pagination(client, auth_header):
    response = client.get('/tasks?page_no=1&limit=10', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0
    assert data['pagination']['page_no'] == 1
    assert data['pagination']['limit'] == 10
    assert data['pagination']['total'] == 0
    assert data['pagination']['total_pages'] == 0
    assert data['pagination']['has_next'] == False
    assert data['pagination']['has_prev'] == False

def test_get_tasks_page_out_of_range(client, auth_header):
    for i in range(5):
        client.post('/tasks', json={'title': f'Task {i+1}'}, headers=auth_header)
    
    response = client.get('/tasks?page_no=3&limit=10', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0
    assert data['pagination']['page_no'] == 3
    assert data['pagination']['total'] == 5
    assert data['pagination']['total_pages'] == 1

def test_get_tasks_filter_by_nonexistent_title(client, auth_header):
    tasks_data = [
        {'title': 'Work Task', 'description': 'Important work'},
        {'title': 'Personal Task', 'description': 'Personal stuff'},
        {'title': 'Meeting Task', 'description': 'Team meeting'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=NonExistentTask', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0
    assert data['pagination']['total'] == 0
    assert data['pagination']['total_pages'] == 0

def test_get_tasks_filter_by_nonexistent_description(client, auth_header):
    tasks_data = [
        {'title': 'Task 1', 'description': 'Important work'},
        {'title': 'Task 2', 'description': 'Personal stuff'},
        {'title': 'Task 3', 'description': 'Team meeting'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?description=NonExistentDescription', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0
    assert data['pagination']['total'] == 0
    assert data['pagination']['total_pages'] == 0

def test_get_tasks_filter_by_partial_title_no_match(client, auth_header):
    tasks_data = [
        {'title': 'Work Task', 'description': 'Important work'},
        {'title': 'Personal Task', 'description': 'Personal stuff'},
        {'title': 'Meeting Task', 'description': 'Team meeting'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=xyz', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0
    assert data['pagination']['total'] == 0

def test_get_tasks_filter_by_partial_description_no_match(client, auth_header):
    tasks_data = [
        {'title': 'Task 1', 'description': 'Important work'},
        {'title': 'Task 2', 'description': 'Personal stuff'},
        {'title': 'Task 3', 'description': 'Team meeting'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?description=xyz', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0
    assert data['pagination']['total'] == 0

def test_get_tasks_filter_by_empty_title(client, auth_header):
    tasks_data = [
        {'title': 'Work Task', 'description': 'Important work'},
        {'title': 'Personal Task', 'description': 'Personal stuff'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 2

def test_get_tasks_filter_by_empty_description(client, auth_header):
    tasks_data = [
        {'title': 'Task 1', 'description': 'Important work'},
        {'title': 'Task 2', 'description': 'Personal stuff'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?description=', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 2

def test_get_tasks_filter_by_case_sensitive_title(client, auth_header):
    tasks_data = [
        {'title': 'Work Task', 'description': 'Important work'},
        {'title': 'WORK MEETING', 'description': 'Team meeting'},
        {'title': 'work project', 'description': 'Project work'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=work', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 3
    assert all('work' in task['title'].lower() for task in data['tasks'])

def test_get_tasks_filter_by_case_sensitive_description(client, auth_header):
    tasks_data = [
        {'title': 'Task 1', 'description': 'Important work'},
        {'title': 'Task 2', 'description': 'IMPORTANT MEETING'},
        {'title': 'Task 3', 'description': 'important project'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?description=important', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 3
    assert all('important' in task['description'].lower() for task in data['tasks'])

def test_get_tasks_filter_by_special_characters_in_title(client, auth_header):
    tasks_data = [
        {'title': 'Task with @ symbol', 'description': 'Special task'},
        {'title': 'Task with # hashtag', 'description': 'Hashtag task'},
        {'title': 'Task with $ dollar', 'description': 'Money task'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=@', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert '@' in data['tasks'][0]['title']

def test_get_tasks_filter_by_special_characters_in_description(client, auth_header):
    tasks_data = [
        {'title': 'Task 1', 'description': 'Description with @ symbol'},
        {'title': 'Task 2', 'description': 'Description with # hashtag'},
        {'title': 'Task 3', 'description': 'Description with $ dollar'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?description=@', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert '@' in data['tasks'][0]['description']

def test_get_tasks_filter_by_numbers_in_title(client, auth_header):
    tasks_data = [
        {'title': 'Task 123', 'description': 'Number task'},
        {'title': 'Task 456', 'description': 'Another number task'},
        {'title': 'Task ABC', 'description': 'Letter task'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?title=123', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert '123' in data['tasks'][0]['title']

def test_get_tasks_filter_by_numbers_in_description(client, auth_header):
    tasks_data = [
        {'title': 'Task 1', 'description': 'Description with 123'},
        {'title': 'Task 2', 'description': 'Description with 456'},
        {'title': 'Task 3', 'description': 'Description with ABC'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    response = client.get('/tasks?description=456', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert '456' in data['tasks'][0]['description']

def test_get_tasks_filter_by_very_long_search_term(client, auth_header):
    tasks_data = [
        {'title': 'Short Task', 'description': 'Short description'},
        {'title': 'Long Task', 'description': 'Long description'}
    ]
    
    for task_data in tasks_data:
        client.post('/tasks', json=task_data, headers=auth_header)
    
    long_search_term = 'a' * 1000
    response = client.get(f'/tasks?title={long_search_term}', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 0
    assert data['pagination']['total'] == 0

def test_create_task_with_status_todo(client, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description', 'status': 'todo'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['title'] == 'Test Task'
    assert data['description'] == 'Test Description'
    assert data['status'] == 'todo'
    assert 'id' in data

def test_create_task_with_status_inprogress(client, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description', 'status': 'inprogress'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'inprogress'

def test_create_task_with_status_done(client, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description', 'status': 'done'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'done'

def test_create_task_without_status_defaults_to_todo(client, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description'}, headers=auth_header)
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'todo'

def test_create_task_invalid_status(client, auth_header):
    response = client.post('/tasks', json={'title': 'Test Task', 'description': 'Test Description', 'status': 'invalid'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['status']
    assert 'Input should be' in error_detail['msg']

def test_update_task_status(client, seeded_task, auth_header):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 'Updated Task', 'description': 'Updated Description', 'status': 'inprogress'}, headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Updated Task'
    assert data['description'] == 'Updated Description'
    assert data['status'] == 'inprogress'

def test_update_task_status_to_done(client, seeded_task, auth_header):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 'Updated Task', 'description': 'Updated Description', 'status': 'done'}, headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'done'

def test_update_task_invalid_status(client, seeded_task, auth_header):
    response = client.put(f'/tasks/{seeded_task.id}', json={'title': 'Updated Task', 'description': 'Updated Description', 'status': 'invalid'}, headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'validation_error' in data
    error_detail = data['validation_error']['body_params'][0]
    assert error_detail['loc'] == ['status']
    assert 'Input should be' in error_detail['msg']

def test_get_tasks_filter_by_status_todo(client, auth_header):
    client.post('/tasks', json={'title': 'Todo Task', 'status': 'todo'}, headers=auth_header)
    client.post('/tasks', json={'title': 'In Progress Task', 'status': 'inprogress'}, headers=auth_header)
    client.post('/tasks', json={'title': 'Done Task', 'status': 'done'}, headers=auth_header)
    
    response = client.get('/tasks?status=todo', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert data['tasks'][0]['status'] == 'todo'
    assert data['tasks'][0]['title'] == 'Todo Task'

def test_get_tasks_filter_by_status_inprogress(client, auth_header):
    client.post('/tasks', json={'title': 'Todo Task', 'status': 'todo'}, headers=auth_header)
    client.post('/tasks', json={'title': 'In Progress Task', 'status': 'inprogress'}, headers=auth_header)
    client.post('/tasks', json={'title': 'Done Task', 'status': 'done'}, headers=auth_header)
    
    response = client.get('/tasks?status=inprogress', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert data['tasks'][0]['status'] == 'inprogress'
    assert data['tasks'][0]['title'] == 'In Progress Task'

def test_get_tasks_filter_by_status_done(client, auth_header):
    client.post('/tasks', json={'title': 'Todo Task', 'status': 'todo'}, headers=auth_header)
    client.post('/tasks', json={'title': 'In Progress Task', 'status': 'inprogress'}, headers=auth_header)
    client.post('/tasks', json={'title': 'Done Task', 'status': 'done'}, headers=auth_header)
    
    response = client.get('/tasks?status=done', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 1
    assert data['tasks'][0]['status'] == 'done'
    assert data['tasks'][0]['title'] == 'Done Task'

def test_get_tasks_filter_by_invalid_status(client, auth_header):
    response = client.get('/tasks?status=invalid', headers=auth_header)
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Invalid status parameter' in data['validation_error']['message']

def test_get_tasks_sort_by_status(client, auth_header):
    client.post('/tasks', json={'title': 'Todo Task', 'status': 'todo'}, headers=auth_header)
    client.post('/tasks', json={'title': 'In Progress Task', 'status': 'inprogress'}, headers=auth_header)
    client.post('/tasks', json={'title': 'Done Task', 'status': 'done'}, headers=auth_header)
    
    response = client.get('/tasks?sort_by=status&sort_order=asc', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 3
    # Should be sorted by status: done, inprogress, todo
    assert data['tasks'][0]['status'] == 'done'
    assert data['tasks'][1]['status'] == 'inprogress'
    assert data['tasks'][2]['status'] == 'todo'

def test_get_tasks_sort_by_status_desc(client, auth_header):
    client.post('/tasks', json={'title': 'Todo Task', 'status': 'todo'}, headers=auth_header)
    client.post('/tasks', json={'title': 'In Progress Task', 'status': 'inprogress'}, headers=auth_header)
    client.post('/tasks', json={'title': 'Done Task', 'status': 'done'}, headers=auth_header)
    
    response = client.get('/tasks?sort_by=status&sort_order=desc', headers=auth_header)
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['tasks']) == 3

    assert data['tasks'][0]['status'] == 'todo'
    assert data['tasks'][1]['status'] == 'inprogress'
    assert data['tasks'][2]['status'] == 'done'

def test_task_to_json_with_status(user):
    task = Task(title='Test Task', user_id=user.id, description='Test Description')
    task.status = TaskStatus.INPROGRESS
    task_json = task.to_json()
    assert task_json['title'] == 'Test Task'
    assert task_json['description'] == 'Test Description'
    assert task_json['user_id'] == user.id
    assert task_json['status'] == 'inprogress'
