from typing import Any
from fastapi import APIRouter

from app.core.supabase import supabase

router = APIRouter(prefix="/db", tags=["db"])


@router.get("/ping")
def db_ping() -> dict[str, Any]:
    """
    Test connection to Supabase.
    Attempts to query the database to verify connectivity.
    """
    try:
        # Try a simple query to verify Supabase connection
        _ = supabase.table("users").select("count").limit(1).execute()
        return {
            "connected": True,
            "message": "Successfully connected to Supabase",
        }
    except Exception as e:
        return {
            "connected": False,
            "message": f"Failed to connect to Supabase: {str(e)}",
        }
