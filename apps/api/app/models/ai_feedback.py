from pydantic import BaseModel

class AIFeedbackBase(BaseModel):
    a_id: int
    reasoning_score: int
    strengths: str
    improvement_area: str
    socratic_hint: str
    referenced_passage_segment: str

class AIFeedback(AIFeedbackBase):
    ai_id: int

class AIFeedbackCreate(AIFeedbackBase):
    pass 