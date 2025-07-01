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
        
        assert response.json["message"] == "User registered successfully!"
        assert "user" in response.json
        assert response.json["user"]["username"] == valid_user_data["username"]


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
        


def test_register_user_missing_fields():
    
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


def test_register_invalid_request():
    
    with app.test_client() as client:
        invalid_json = "invalid json"

        response = client.post("/register", json=invalid_json, content_type="text/plain")

        assert response.status_code == 415


def test_register_invalid_request_method():

    with app.test_client() as client:

        response = client.get("/register")

        assert response.status_code == 405