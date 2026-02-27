from fastapi import APIRouter
from app.api.routes import health, dbdebug, submission
from app.api.routes.chat.router import router as chat_router

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dbdebug.router, tags=["router"])
api_router.include_router(submission.router, tags=["adaptive"])
api_router.include_router(chat_router, tags=["chat"])