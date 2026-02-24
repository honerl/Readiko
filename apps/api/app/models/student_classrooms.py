from pydantic import BaseModel

class StudentClassroom(BaseModel):
    uid: int 
    c_id: int

class StudentClassroomCreate(StudentClassroom):
    pass