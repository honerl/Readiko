from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ActivityBase(BaseModel):
    classroom_id: int
    topic: str
    open_date: datetime
    close_date: datetime
    type_of_activity: str

class Activity(ActivityBase):
    id: int

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(ActivityBase):
    topic: Optional[str] = None
    open_date: Optional[datetime] = None
    close_date: Optional[datetime] = None
    type_of_activity: Optional[str] = None
