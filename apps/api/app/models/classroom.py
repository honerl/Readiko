from pydantic import BaseModel

class ClassroomBase(BaseModel):
    name: str

class Classroom(ClassroomBase):
    c_id: int

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomUpdate(BaseModel):
    name: str | None = None