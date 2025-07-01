from flask import Flask, request, jsonify

from pydantic import BaseModel, Field, EmailStr

from flask_pydantic import validate 

app = Flask(__name__)

class UserRegistrationRequest(BaseModel):

    username: str = Field(..., min_length=3, max_length=15,
                          description="Unique username for the user.")
    email: EmailStr = Field(..., description="Valid email address for the user.")
    password: str = Field(..., min_length=8, max_length=100,
                          description="Password for the user. Must be at least 8 characters long.")
    
class UserRegistrationResponse(BaseModel):

    id: int
    username: str 
    email: EmailStr


# Simulate db sequence
user_id_sequence = 1 

@app.route("/register", methods=["POST"])
@validate(body=UserRegistrationRequest)
def register():

    global user_id_sequence

    user_data: UserRegistrationRequest = request.body_params

    new_user = {"id" : user_id_sequence, "username" : user_data.username, "email": user_data.email}

    return jsonify({"message": "User registered successfully!", "user": UserRegistrationResponse(**new_user).model_dump()}), 201


if __name__=="__main__":
    app.run(debug=True)