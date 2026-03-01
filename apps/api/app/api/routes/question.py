from app.models.question import QuestionCreate, QuestionUpdate
from fastapi import APIRouter, HTTPException
from app.core.supabase import supabase

router = APIRouter()

@router.post("/")
def create_question(data: QuestionCreate):
    response = supabase.table("question").insert(data.model_dump()).execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create question")

    return response.data[0]

@router.get("/passage/{passage_id}")
def get_questions_by_passage(passage_id: int):
    response = supabase.table("question") \
        .select("*") \
        .eq("passage_id", passage_id) \
        .execute()

    return response.data

@router.put("/{q_id}")
def update_question(q_id: int, data: QuestionUpdate):
    update_data = data.dict(exclude_unset=True)

    response = supabase.table("question") \
        .update(update_data) \
        .eq("q_id", q_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Question not found")

    return response.data[0]

@router.delete("/{q_id}")
def delete_question(q_id: int):
    response = supabase.table("question") \
        .delete() \
        .eq("q_id", q_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Question not found")

    return {"message": "Question deleted successfully"}