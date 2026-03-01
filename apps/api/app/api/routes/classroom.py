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
        print(f"[get_classroom] fetching classrooms for student: {student_id}")
        result = cast(
            Any,
            supabase.table("student_classrooms")
            .select("classroom_id")
            .eq("student_id", student_id)
            .execute(),
        )
        print(f"[get_classroom] student_classrooms query result: {result.data}")

        if not result.data:
            print(f"[get_classroom] no classrooms found for student")
            return []

        # defensive, just in case the schema ever changes again
        # we expect each row to have a classroom_id column; log any
        # anomalous records and continue.
        class_ids: list[str] = []
        for item in result.data:
            if "classroom_id" in item:
                class_ids.append(item["classroom_id"])
            else:
                # log the offending record so we can debug quickly
                print("[get_classroom] unexpected row", item)

        print(f"[get_classroom] extracted classroom_ids: {class_ids}")

        classrooms: list[dict[str, Any]] = []
        for c_id in class_ids:
            print(f"[get_classroom] fetching classroom with c_id: {c_id}")
            classroom = cast(
                Any,
                supabase.table("classrooms")
                .select("*")
                .eq("c_id", c_id)
                .maybe_single()
                .execute(),
            )
            print(f"[get_classroom] classroom query result: {classroom.data}")
            if classroom.data:
                # fetch teacher name from users table so we can return it
                teacher_id = classroom.data.get("teacher_id")
                teacher_name = "Unknown Teacher"
                if teacher_id:
                    print(f"[get_classroom] fetching teacher with id: {teacher_id}")
                    teacher = cast(
                        Any,
                        supabase.table("users")
                        .select("fname, lname")
                        .eq("uid", teacher_id)
                        .maybe_single()
                        .execute(),
                    )
                    print(f"[get_classroom] teacher query result: {teacher.data}")
                    if teacher.data and "fname" in teacher.data and "lname" in teacher.data:
                        teacher_name = f'{teacher.data["fname"]} {teacher.data["lname"]}'

                # normalize field names for the frontend:
                # c_id -> id, name -> title
                classroom_data: dict[str, Any] = {
                    "id": classroom.data.get("c_id"),
                    "title": classroom.data.get("name"),
                    "description": classroom.data.get("description"),
                    "teacher_name": teacher_name,
                }
                print(f"[get_classroom] appending classroom: {classroom_data}")
                classrooms.append(classroom_data)

        print(f"[get_classroom] returning {len(classrooms)} classrooms")
        return classrooms

    except Exception as e:
        print(f"[get_classroom] exception: {e}")
        import traceback
        traceback.print_exc()
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
