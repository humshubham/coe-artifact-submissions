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
        
        assert response.json == {"message": "User registered successfully!"}


def test_register_user_invalid_email():
   
    with app.test_client() as client:
        invalid_email_data = {
            "username": "test_user",
            "email": "invalid-email",  # Invalid email format
            "password": "StrongPassword@123"
        }
        response = client.post("/register", json=invalid_email_data)

        assert response.status_code == 400
       
        assert "value is not a valid email address" in response.json["detail"][0]["msg"]
        assert response.json["detail"][0]["loc"] == ["email"]


def test_register_user_short_password():
    
    with app.test_client() as client:
        short_password_data = {
            "username": "test_user",
            "email": "test@example.com",
            "password": "abcd" # Password too short
        }
        response = client.post("/register", json=short_password_data)

        assert response.status_code == 400
        assert "String should have at least 8 characters" in response.json["detail"][0]["msg"]
        assert response.json["detail"][0]["loc"] == ["password"]


def test_register_user_missing_fields():
    
    with app.test_client() as client:
        missing_fields_data = {
            "email": "test@example.com",
            "password": "StrongPassword@123"
            # 'username' is missing
        }
        response = client.post("/register", json=missing_fields_data)

        assert response.status_code == 400
        assert "Field required" in response.json["detail"][0]["msg"]
        assert response.json["detail"][0]["loc"] == ["username"]


