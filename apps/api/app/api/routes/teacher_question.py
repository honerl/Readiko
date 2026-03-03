from typing import Any, cast
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.supabase import supabase
from app.core.security import JWTClaims, get_current_claims

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("/{passage_id}")
async def get_questions(
    passage_id: int, claims: JWTClaims = Depends(get_current_claims)
) -> list[dict[str, Any]]:
    try:
        print(f"[get_questions] fetching questions for passage: {passage_id}")
        result = cast(
            Any,
            supabase.table("question")
            .select("*")
            .eq("passage_id", passage_id)
            .execute(),
        )
        print(f"[get_questions] result: {result.data}")
        return result.data or []
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("")
async def create_question(
    body: dict[str, Any], claims: JWTClaims = Depends(get_current_claims)
) -> dict[str, Any]:
    try:
        print(f"[create_question] creating question: {body}")
        result = cast(
            Any,
            supabase.table("question").insert({
                "passage_id": body.get("passage_id"),
                "q_text": body.get("q_text"),
                "skill_type": body.get("skill_type"),
                "difficulty_level": body.get("difficulty_level"),
            }).execute(),
        )
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create question")
        print(f"[create_question] created: {result.data[0]}")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{q_id}", status_code=204)
async def delete_question(
    q_id: int, claims: JWTClaims = Depends(get_current_claims)
) -> None:
    try:
        result = cast(
            Any,
            supabase.table("question")
            .delete()
            .eq("q_id", q_id)
            .execute(),
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Question not found")
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))