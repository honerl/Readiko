from pydantic import BaseModel

class QuestionBase(BaseModel):
    passage_id: int
    q_text: str
    skill_type: str
    difficulty_level: int

class Question(QuestionBase):
    q_id: int

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    q_text: str | None = None
    skill_type: str | None = None
    difficulty_level: int | None = None