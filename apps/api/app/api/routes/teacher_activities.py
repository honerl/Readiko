from typing import Any, cast
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.supabase import supabase
from app.core.security import JWTClaims, get_current_claims

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/{classroom_id}")
async def get_activities(
    classroom_id: int, claims: JWTClaims = Depends(get_current_claims)
) -> list[dict[str, Any]]:
    try:
        print(f"[get_activities] fetching activities for classroom: {classroom_id}")
        result = cast(
            Any,
            supabase.table("activity")
            .select("*")
            .eq("classroom_id", classroom_id)
            .execute(),
        )
        print(f"[get_activities] result: {result.data}")
        return result.data or []
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("")
async def create_activity(
    body: dict[str, Any], claims: JWTClaims = Depends(get_current_claims)
) -> dict[str, Any]:
    try:
        print(f"[create_activity] creating activity: {body}")
        result = cast(
            Any,
            supabase.table("activity").insert({
                "classroom_id": body.get("classroom_id"),
                "topic": body.get("topic"),
                "open_date": body.get("open_date"),
                "close_date": body.get("close_date"),
                "type_of_activity": body.get("type_of_activity"),
            }).execute(),
        )
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create activity")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))