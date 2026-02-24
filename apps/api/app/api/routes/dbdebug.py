from typing import Any
from fastapi import APIRouter

from app.core.supabase import supabase

router = APIRouter(prefix="/db", tags=["db"])


@router.get("/ping")
def db_ping() -> dict[str, Any]:
    supabase.auth.get_session()
    return {"connected": True}
