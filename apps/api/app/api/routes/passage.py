from typing import Any, cast
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.supabase import supabase
from app.core.security import JWTClaims, get_current_claims

router = APIRouter(prefix="/passages", tags=["passages"])


@router.get("/{activity_id}")
async def get_passages(
    activity_id: int, claims: JWTClaims = Depends(get_current_claims)
) -> list[dict[str, Any]]:
    try:
        print(f"[get_passages] fetching passages for activity: {activity_id}")
        result = cast(
            Any,
            supabase.table("passage")
            .select("*")
            .eq("activity_id", activity_id)
            .execute(),
        )
        print(f"[get_passages] result: {result.data}")
        return result.data or []
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("")
async def create_passage(
    body: dict[str, Any], claims: JWTClaims = Depends(get_current_claims)
) -> dict[str, Any]:
    try:
        print(f"[create_passage] creating passage: {body}")
        result = cast(
            Any,
            supabase.table("passage").insert({
                "activity_id": body.get("activity_id"),
                "title": body.get("title"),
                "content": body.get("content"),
                "lexile_level": body.get("lexile_level"),
                "topic": body.get("topic"),
            }).execute(),
        )
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create passage")
        print(f"[create_passage] created: {result.data[0]}")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{p_id}", status_code=204)
async def delete_passage(
    p_id: int, claims: JWTClaims = Depends(get_current_claims)
) -> None:
    try:
        result = cast(
            Any,
            supabase.table("passage")
            .delete()
            .eq("p_id", p_id)
            .execute(),
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Passage not found")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))