from fastapi import APIRouter, HTTPException
from typing import List
from app.models.classroom import Classroom, ClassroomCreate, ClassroomUpdate
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/classrooms", tags=["classrooms"])

@router.post("/", response_model=Classroom)
def create_classroom(data: ClassroomCreate):

    response = get_supabase_client.table("classrooms").insert({
        "name":data.name,
        "description":data.description,
        "subject": data.subject,
        "grade_level": data.grade_level,
        "teacher_uid": str(data.teacher_uid)
    }).execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="Insert Failed")
    return response.data[0]


@router.get("/", response_model=List[Classroom])
def get_classrooms():
    response = get_supabase_client.table("classrooms").select("*").execute()

    return response.data

@router.get("/{c_id}", response_model=Classroom)
def get_classroom(c_id: int):
    response = get_supabase_client.table("classrooms").select("*").eq("id", c_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    return response.data[0]


@router.get("/teacher/{teacher_uid}", response_model=List[Classroom])
def get_classroom_by_teacher(teacher_uid: str):
    response = get_supabase_client.table("classrooms").select("*").eq("teacher_uid", teacher_uid).execute()
    return response.data

@router.patch("/{c_id}", response_model=Classroom)
def update_classroom(c_id: int, data: ClassroomUpdate):
    update_data = data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    
    response = get_supabase_client.table("classrooms").update(update_data).eq("id", c_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Classroom not found or update failed")
    
    return response.data[0]

@router.delete("/{c_id}", status_code=204)
def delete_classroom(c_id: int):
    response = get_supabase_client.table("classrooms").delete().eq("id", c_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Classroom not found")
    return