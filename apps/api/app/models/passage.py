from pydantic import BaseModel

class PassageBase(BaseModel):
    title: str
    content: str
    lexile_level: int
    topic: str

class Passage(PassageBase):
    p_id: int

class PassageCreate(PassageBase):
    pass

class PassageUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    lexile_level: int | None = None
    topic: str | None = None
    