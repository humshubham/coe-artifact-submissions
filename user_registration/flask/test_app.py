from app import app

def test_register_user_success():

    with app.test_client() as client:
        
        valid_user_data = {
            "username": "test_user",
            "email": "test@example.com",
            "password": "StrongPassword@123"
        }
        
        response = client.post("/register", json=valid_user_data)

        assert response.status_code == 201
        response_json = response.json

        assert "message" in response_json
        assert response_json["message"] == "User registered successfully!"

        assert "user" in response_json
        user_response = response_json["user"]

        assert "id" in user_response
        assert isinstance(user_response["id"], int)
        assert user_response["id"] > 0 # Since it's a sequence, it should be positive

        assert "username" in user_response
        assert isinstance(user_response["username"], str)
        assert user_response["username"] == valid_user_data["username"]

        assert "email" in user_response
        assert isinstance(user_response["email"], str)
        assert user_response["email"] == valid_user_data["email"]

        assert len(user_response) == 3


def test_register_user_invalid_email():
   
    with app.test_client() as client:
        invalid_email_data = {
            "username": "test_user",
            "email": "invalid-email",  # Invalid email format
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=invalid_email_data)

        assert response.status_code == 400
       
        assert "validation_error" in response.json
        assert "body_params" in response.json["validation_error"]
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "value is not a valid email address" in error_detail["msg"]
        assert error_detail["loc"] == ["email"]


def test_register_user_short_password():
    
    with app.test_client() as client:
        short_password_data = {
            "username": "test_user",
            "email": "test@example.com",
            "password": "abcd" # Password too short
        }
        response = client.post("/register", json=short_password_data)

        assert response.status_code == 400
        
        assert "validation_error" in response.json
        assert "body_params" in response.json["validation_error"]
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "String should have at least 8 characters" in error_detail["msg"]
        assert error_detail["loc"] == ["password"]
   
        
def test_register_user_long_password():
    with app.test_client() as client:
        data = {
            "username": "test_user",
            "email": "test@example.com",
            "password": "a" * 101 # More than max_length=100
        }
        response = client.post("/register", json=data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "String should have at most 100 characters" in error_detail["msg"]
        assert error_detail["loc"] == ["password"]


def test_register_user_short_username():
    with app.test_client() as client:
        short_username_data = {
            "username": "ab",  # Less than min_length=3
            "email": "test@example.com",
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=short_username_data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "String should have at least 3 characters" in error_detail["msg"]
        assert error_detail["loc"] == ["username"]

    
def test_register_user_long_username():
    with app.test_client() as client:
        long_username_data = {
            "username": "a" * 16,  # More than max_length=15
            "email": "test@example.com",
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=long_username_data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "String should have at most 15 characters" in error_detail["msg"]
        assert error_detail["loc"] == ["username"]


def test_register_user_missing_username():
    
    with app.test_client() as client:
        missing_fields_data = {
            "email": "test@example.com",
            "password": "StrongPassword@123"
            # 'username' is missing
        }
        response = client.post("/register", json=missing_fields_data)

        assert response.status_code == 400
        assert "validation_error" in response.json
        assert "body_params" in response.json["validation_error"]
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "Field required" in error_detail["msg"]
        assert error_detail["loc"] == ["username"]


def test_register_user_missing_password():
    
    with app.test_client() as client:
        missing_fields_data = {
            "username": "test_user",
            "email": "test@example.com",
            # 'password' is missing
        }
        response = client.post("/register", json=missing_fields_data)

        assert response.status_code == 400
        assert "validation_error" in response.json
        assert "body_params" in response.json["validation_error"]
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "Field required" in error_detail["msg"]
        assert error_detail["loc"] == ["password"]


def test_register_user_missing_email():
    
    with app.test_client() as client:
        missing_fields_data = {
            "username": "test_user",
            # 'email' is missing
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=missing_fields_data)

        assert response.status_code == 400
        assert "validation_error" in response.json
        assert "body_params" in response.json["validation_error"]
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "Field required" in error_detail["msg"]
        assert error_detail["loc"] == ["email"]


def test_register_invalid_request_body():
    
    with app.test_client() as client:
        invalid_json = "invalid json"

        response = client.post("/register", json=invalid_json, content_type="text/plain")

        assert response.status_code == 415


def test_register_invalid_request_method():

    with app.test_client() as client:

        response = client.get("/register")

        assert response.status_code == 405


def test_register_user_username_not_string():
    with app.test_client() as client:
        data = {
            "username": 123,  # Not a string
            "email": "test@example.com",
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "Input should be a valid string" in error_detail["msg"]
        assert error_detail["loc"] == ["username"]


def test_register_user_email_not_string():
    with app.test_client() as client:
        data = {
            "username": "test_user",
            "email": 12345,  # Not a string
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "Input should be a valid string" in error_detail["msg"]
        assert error_detail["loc"] == ["email"]


def test_register_user_password_not_string():
    with app.test_client() as client:
        data = {
            "username": "test_user",
            "email": "test@example.com",
            "password": 12345678 # Not a string
        }
        response = client.post("/register", json=data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "Input should be a valid string" in error_detail["msg"]
        assert error_detail["loc"] == ["password"]


def test_register_user_empty_username():
    with app.test_client() as client:
        data = {
            "username": "",  # Empty string
            "email": "test@example.com",
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "String should have at least 3 characters" in error_detail["msg"]
        assert error_detail["loc"] == ["username"]


def test_register_user_empty_email():
    with app.test_client() as client:
        data = {
            "username": "test_user",
            "email": "",  # Empty string
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "value is not a valid email address" in error_detail["msg"]
        assert error_detail["loc"] == ["email"]


def test_register_user_empty_password():
    with app.test_client() as client:
        data = {
            "username": "test_user",
            "email": "test@example.com",
            "password": "" # Empty string
        }
        response = client.post("/register", json=data)
        assert response.status_code == 400
        assert "validation_error" in response.json
        error_detail = response.json["validation_error"]["body_params"][0]
        assert "String should have at least 8 characters" in error_detail["msg"]
        assert error_detail["loc"] == ["password"]
