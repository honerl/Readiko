from enum import Enum
from pydantic import BaseModel, Field


class ChatFlowType(str, Enum):
    explore = "explore"
    teacher = "teacher"


class SessionStatus(str, Enum):
    in_progress = "in_progress"
    completed = "completed"


class ExploreSessionStartRequest(BaseModel):
    user_id: str
    topic: str | None = None


class ExploreSessionStartResponse(BaseModel):
    session_id: str
    flow_type: ChatFlowType = ChatFlowType.explore
    status: SessionStatus = SessionStatus.in_progress
    passage_title: str
    passage_content: str
    ai_message: str
    process_focus: str | None = None
    subskill: str | None = None
    difficulty: str | None = None
    current_turn: int = 0
    max_turns: int


class ExploreSessionAnswerRequest(BaseModel):
    user_id: str
    answer: str = Field(min_length=1)


class ExploreEvaluationSummary(BaseModel):
    average_score: float
    mastery_threshold: float
    skill_level: str
    skill_reason: str
    turns_used: int
    max_turns: int


class ExploreSessionAnswerResponse(BaseModel):
    session_id: str
    flow_type: ChatFlowType = ChatFlowType.explore
    status: SessionStatus
    ai_message: str
    score: int
    is_correct: bool | None = None
    feedback: str | None = None
    follow_up_question: str | None = None
    hint: str | None = None
    process_focus: str | None = None
    subskill: str | None = None
    error_type: str | None = None
    difficulty: str | None = None
    current_turn: int
    should_continue: bool
    summary: ExploreEvaluationSummary | None = None


class TeacherSessionStartRequest(BaseModel):
    user_id: str
    classroom_id: int
    lesson_id: int


class ChatNotImplementedResponse(BaseModel):
    detail: str
