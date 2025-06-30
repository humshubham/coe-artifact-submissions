from flask import Flask, request, jsonify

from pydantic import BaseModel, Field, EmailStr, ValidationError

app = Flask(__name__)

class UserRegistration(BaseModel):

    username: str = Field(..., min_length=3, max_length=15,
                          description="Unique username for the user.")
    email: EmailStr = Field(..., description="Valid email address for the user.")
    password: str = Field(..., min_length=8, max_length=100,
                          description="Password for the user. Must be at least 8 characters long.")

@app.route("/register", methods=["POST"])
def register():

    if not request.is_json:
        return jsonify({"error":"Request must be a valid JSON"}), 400
    
    try:
        user_data = UserRegistration.model_validate(request.json)

        print(f"User '{user_data.username}' with email '{user_data.email}' validated successfully.")
        
        return jsonify({"message": "User registered successfully!"}), 201

    except ValidationError as e:
        print(f"Validation Error: {e.errors()}")
        return jsonify({"detail": e.errors()}), 400
    except Exception as e:
        
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500


if __name__=="__main__":
    app.run(debug=True)