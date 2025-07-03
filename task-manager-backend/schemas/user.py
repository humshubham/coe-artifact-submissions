from pydantic import BaseModel, Field, EmailStr

class UserRequest(BaseModel):
    email: EmailStr = Field(..., max_length=120)
    username: str = Field(..., min_length=3, max_length=15)
    password: str = Field(..., min_length=8, max_length=100)

class LoginRequest(BaseModel):
    username: str
    password: str 