from fastapi import APIRouter, HTTPException
from app.core.supabase import supabase
from app.models.passage import PassageCreate, PassageUpdate

router = APIRouter()

@router.post("/")
def create_passage(data: PassageCreate):

    content = {
        "title": data.title,
        "content": data.content,
        "lexile_level": data.lexile_level,
        "topic": data.topic
    }

    response = supabase.table("passage").insert(content).execute()

    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to create passage")
  
    return response.data[0]


@router.get("/")
def get_passages():
    response = supabase.table("passage").select("*").execute()
    return response.data

@router.get("/{p_id}")
def get_passage(p_id: int):
    response = supabase.table("passage").select("*").eq("p_id", p_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Passage not found")

    return response.data[0]

@router.put("/{p_id}")
def update_passage(p_id: int, data: PassageUpdate):

    update_data = data.model_dump(exclude_unset=True)

    response = supabase.table("passage") \
        .update(update_data) \
        .eq("p_id", p_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Passage not found")

    return response.data[0]

@router.delete("/{p_id}")
def delete_passage(p_id: int):
    response = supabase.table("passage") \
        .delete() \
        .eq("p_id", p_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Passage not found")

    return {"message": "Passage deleted successfully"}