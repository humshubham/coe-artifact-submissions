from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class TaskStatus(str, Enum):
    TODO = "todo"
    INPROGRESS = "inprogress"
    DONE = "done"

class TaskRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=50)
    description: str = Field('', max_length=200)
    status: TaskStatus = Field(TaskStatus.TODO)

class TaskFilterParams(BaseModel):
    title: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    status: Optional[TaskStatus] = Field(None)
    sort_by: Optional[str] = Field(None, pattern='^(title|description|status|created_at)$')
    sort_order: Optional[str] = Field(None, pattern='^(asc|desc)$')

class TaskPaginationParams(BaseModel):
    page_no: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100) 