from fastapi import APIRouter
from app.api.routes import health, dbdebug, submission

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dbdebug.router, tags=["router"])
api_router.include_router(submission.router, tags=["adaptive"])