from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityBase(BaseModel):
    classroom_id: int
    topic: str
    open_date: datetime
    close_date: datetime
    type_of_activity: str  # 'exam' or 'lesson'

class ActivityCreate(ActivityBase):
    pass

class Activity(ActivityBase):
    a_id: int

    model_config = {
        "from_attributes": True
    }
class ActivityUpdate(BaseModel):
    topic: str | None = None
    open_date: datetime | None = None
    close_date: datetime | None = None
    type_of_activity: str | None = None
