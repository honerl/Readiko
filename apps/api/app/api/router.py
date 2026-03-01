from fastapi import APIRouter
from app.api.routes import health, dbdebug, auth, classroom, submission, teacher_classroom

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dbdebug.router, tags=["router"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(classroom.router, tags=["classroom"])
api_router.include_router(submission.router, tags=["submission"])
api_router.include_router(teacher_classroom.router, tags=["teacher_classroom"])