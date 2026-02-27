from typing import Any, cast
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.supabase import supabase
from app.core.security import JWTClaims, get_current_claims

router = APIRouter(prefix="/classes", tags=["classroom"])


@router.get("")
async def get_classroom(
    student_id: str, claims: JWTClaims = Depends(get_current_claims)
) -> list[dict[str, Any]]:
    """
    Get all classroom for a student.
    """
    try:
        result = cast(
            Any,
            supabase.table("student_classrooms")
            .select("classroom_id")
            .eq("student_id", student_id)
            .execute(),
        )

        if not result.data:
            return []

        class_ids = [item["c_id"] for item in result.data]

        classrooms: list[dict[str, Any]] = []
        for c_id in class_ids:
            classroom = cast(
                Any,
                supabase.table("classroom")
                .select("*")
                .eq("c_id", c_id)
                .maybe_single()
                .execute(),
            )
            if classroom.data:
                classrooms.append(classroom.data)

        return classrooms

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/join")
async def join_class(
    body: dict[str, Any], claims: JWTClaims = Depends(get_current_claims)
) -> dict[str, Any]:
    """
    Join a classroom by class code.
    """
    try:
        class_code = body.get("class_code")
        student_id = body.get("student_id")

        classrooms = cast(
            Any,
            supabase.table("classroom")
            .select("c_id")
            .eq("code", class_code)
            .maybe_single()
            .execute(),
        )

        if not classrooms.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found"
            )

        c_id = classrooms.data["c_id"]

        supabase.table("student_classrooms").insert(
            {"uid": student_id, "c_id": c_id}
        ).execute()

        return {"success": True, "classroom_id": c_id}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
