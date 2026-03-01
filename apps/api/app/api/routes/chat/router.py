from fastapi import APIRouter, HTTPException
from app.core.chat_service import ChatService
from app.models.chat import (
    ChatNotImplementedResponse,
    ExploreSessionAnswerRequest,
    ExploreSessionAnswerResponse,
    ExploreSessionStartRequest,
    ExploreSessionStartResponse,
    TeacherSessionStartRequest,
)

router = APIRouter()
chat_service = ChatService()


@router.post(
    "/chat/explore/start",
    response_model=ExploreSessionStartResponse,
)
async def start_explore_session(
    request: ExploreSessionStartRequest,
) -> ExploreSessionStartResponse:
    return chat_service.start_explore_session(
        user_id=request.user_id,
        topic=request.topic,
    )


@router.post(
    "/chat/explore/{session_id}/answer",
    response_model=ExploreSessionAnswerResponse,
)
async def answer_explore_session(
    session_id: str,
    request: ExploreSessionAnswerRequest,
) -> ExploreSessionAnswerResponse:
    try:
        return chat_service.submit_explore_answer(
            session_id=session_id,
            user_id=request.user_id,
            answer=request.answer,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post(
    "/chat/teacher/start",
    response_model=ChatNotImplementedResponse,
)
async def start_teacher_session(
    request: TeacherSessionStartRequest,
) -> ChatNotImplementedResponse:
    _ = request
    return ChatNotImplementedResponse(
        detail="Teacher chat flow is scaffolded but not implemented yet."
    )
