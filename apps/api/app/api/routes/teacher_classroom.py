from fastapi import APIRouter, HTTPException
from typing import List
from app.models.classroom import Classroom, ClassroomCreate, ClassroomUpdate
from app.core.supabase import supabase

router = APIRouter(prefix="/teacher", tags=["classrooms"])


@router.post("/create", response_model=Classroom)
def create_classroom(data: ClassroomCreate):

    response = supabase.table("classrooms").insert({
        "name": data.name,
        "description": data.description,
        "subject": data.subject,
        "grade_level": data.grade_level,
        "teacher_id": str(data.teacher_id)
    }).execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="Insert Failed")
    return response.data[0]


@router.get("/", response_model=List[Classroom])
def get_all_classrooms():
    response = supabase.table("classrooms").select("*").execute()
    return response.data


@router.get("/by-teacher/{teacher_id}", response_model=List[Classroom])
def get_classrooms_by_teacher(teacher_id: str):
    response = supabase.table("classrooms") \
        .select("*") \
        .eq("teacher_id", teacher_id) \
        .execute()

    return response.data


@router.get("/{c_id}", response_model=Classroom)
def get_classroom(c_id: int):
    response = supabase.table("classrooms") \
        .select("*") \
        .eq("id", c_id) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Classroom not found")

    return response.data


@router.patch("/{c_id}", response_model=Classroom)
def update_classroom(c_id: int, data: ClassroomUpdate):

    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided")

    response = supabase.table("classrooms") \
        .update(update_data) \
        .eq("id", c_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Update failed")

    return response.data[0]


@router.delete("/{c_id}", status_code=204)
def delete_classroom(c_id: int):

    response = supabase.table("classrooms") \
        .delete() \
        .eq("id", c_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Not found")

    return