from fastapi import APIRouter, HTTPException
from typing import List
from app.models.activity import Activity
from app.core.supabase import supabase

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/", response_model=List[Activity])
def get_activities(classroom_id: int):
    try:
        result = (
            supabase.table("activity") \
            .select("*") \
            .eq("classroom_id", classroom_id) \
            .execute()
        )

        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
