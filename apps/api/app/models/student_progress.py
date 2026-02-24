from pydantic import BaseModel
from datetime import datetime
from .enums import UnderstandingLevel


class StudentProgressBase(BaseModel):
    uid: str
    understanding_level: UnderstandingLevel
    average_reasoning_score: float
    total_attempts: int
    last_updated: datetime


class StudentProgress(StudentProgressBase):
    sp_id: int


class StudentProgressCreate(StudentProgressBase):
    pass


class StudentProgressUpdate(BaseModel):
    understanding_level: UnderstandingLevel | None = None
    average_reasoning_score: float | None = None
    total_attempts: int | None = None
    last_updated: datetime | None = None