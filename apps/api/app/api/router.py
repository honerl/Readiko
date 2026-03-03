from fastapi import APIRouter
from app.api.routes import (
    health,
    dbdebug,
    auth,
    classroom,
    submission,
    question,
    passage,
    teacher_classroom,
    student_activity,
    chat,
    teacher_activities,
    teacher_question,
)
api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dbdebug.router, tags=["router"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(classroom.router, tags=["classroom"])
api_router.include_router(teacher_classroom.router, tags=["teacher_classroom"])
api_router.include_router(submission.router, tags=["adaptive"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(question.router, tags=["questions"])
api_router.include_router(passage.router, tags=["passages"])
api_router.include_router(student_activity.router, tags=["student_activity"])
api_router.include_router(teacher_activities.router, tags=["teacher_activities"])
api_router.include_router(teacher_question.router, tags=["teacher_question"])