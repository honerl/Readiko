from fastapi import APIRouter, HTTPException
from app.core.supabase import supabase
# AI wrapper
from app.models.activity import ActivityCreate, ActivityUpdate, ActivityBase, Activity
from pydantic import BaseModel

router = APIRouter(prefix="/activity", tags=["activity"])

# --------------------------
# CRUD Endpoints
# --------------------------

# CREATE
@router.post("/", response_model=Activity)
def create_activity(data: ActivityCreate):
    payload = {
        "classroom_id": data.classroom_id,
        "topic": data.topic,
        "type_of_activity": data.type_of_activity,
        "open_date": data.open_date,
        "close_date": data.close_date
    }
    response = supabase.table("activity").insert(payload).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Insert Failed")
    return response.data[0]

# READ ALL
@router.get("/", response_model=list[Activity])
def get_activities():
    response = supabase.table("activity").select("*").execute()
    return response.data

# READ ONE
@router.get("/{a_id}", response_model=Activity)
def get_activity(a_id: int):
    response = supabase.table("activity").select("*").eq("id", a_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return response.data[0]

# UPDATE
@router.put("/{a_id}", response_model=Activity)
def update_activity(a_id: int, data: ActivityUpdate):
    update_payload = {}
    if data.topic is not None:
        update_payload["topic"] = data.topic
    if data.type_of_activity is not None:
        update_payload["type_of_activity"] = data.type_of_activity
    if data.open_date is not None:
        update_payload["open_date"] = data.open_date
    if data.close_date is not None:
        update_payload["close_date"] = data.close_date

    if not update_payload:
        raise HTTPException(status_code=400, detail="No fields to update")

    response = supabase.table("activity").update(update_payload).eq("id", a_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return response.data[0]

# DELETE
@router.delete("/{a_id}")
def delete_activity(a_id: int):
    response = supabase.table("activity").delete().eq("id", a_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"message": "Activity deleted successfully"}

# --------------------------
# Adaptive Student Answer Endpoint
# --------------------------

class StudentAnswer(BaseModel):
    student_uid: str
    question_id: int
    answer: str
    attempt_number: int = 1

@router.post("/answer")
def submit_answer(data: StudentAnswer):
    """
    Handles student answering:
    - AI evaluates the answer
    - If score >= 0.9 → mastered
    - Else → returns guiding question
    """
    # 1️⃣ Get question
    question_res = supabase.table("question").select("*").eq("q_id", data.question_id).execute()
    if not question_res.data:
        raise HTTPException(status_code=404, detail="Question not found")
    question = question_res.data[0]

    # 2️⃣ Get passage
    passage_res = supabase.table("passage").select("*").eq("p_id", question["passage_id"]).execute()
    if not passage_res.data:
        raise HTTPException(status_code=404, detail="Passage not found")
    passage = passage_res.data[0]

    # 3️⃣ AI evaluation
    ai_result = evaluate_answer(passage["content"], question["question_text"], data.answer)
    score = ai_result["score"]

    # 4️⃣ Update student_progress
    progress_res = supabase.table("student_progress").select("*").eq("student_uid", data.student_uid).execute()
    if progress_res.data:
        current_level = progress_res.data[0]["understanding_level"]
        new_level = max(current_level, score)
        supabase.table("student_progress").update({"understanding_level": new_level}).eq("student_uid", data.student_uid).execute()
    else:
        supabase.table("student_progress").insert({"student_uid": data.student_uid, "understanding_level": score}).execute()

    # 5️⃣ Return feedback + guiding question if score < 0.9
    return {
        "status": "mastered" if score >= 0.9 else "needs_improvement",
        "score": score,
        "feedback": ai_result["feedback"],
        "guiding_question": ai_result.get("guiding_question") if score < 0.9 else None
    }