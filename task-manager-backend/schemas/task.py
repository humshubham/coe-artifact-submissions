from pydantic import BaseModel, Field

class TaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=50)
    description: str = Field('', max_length=200) 