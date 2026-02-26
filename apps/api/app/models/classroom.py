from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ClassroomBase(BaseModel):
    name: str
    description: Optional[str] = None
    subject: str
    grade_level:int

class Classroom(ClassroomBase):
    c_id: int
    teacher_uid: UUID

class ClassroomCreate(ClassroomBase):
    teacher_uid: UUID

class ClassroomUpdate(BaseModel):
    name: str | None = None
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[int] = None