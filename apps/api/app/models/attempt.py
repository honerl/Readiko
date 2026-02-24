from pydantic import BaseModel
from datetime import datetime

class AttemptBase(BaseModel):
    uid: str
    q_id: int
    student_response: str

class Attempt(AttemptBase):
    a_id: int
    created_at: datetime | None = None

class AttemptCreate(AttemptBase):
    pass