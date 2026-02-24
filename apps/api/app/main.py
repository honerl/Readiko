from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router

app = FastAPI(title=settings.app_name)

# CORS (for React dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list(),
    allow_credentials=True,
    allow_methods=[""],
    allow_headers=[""],
)

# Register routes
app.include_router(api_router)
