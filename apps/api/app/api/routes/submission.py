from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.adaptive_engine import process_submission

router = APIRouter()

# Mock Data
# MOCK DATA
students = {
    1: {
        "name": "Alice",
        "mastery": {"Rizal": 0.5},
        "current_difficulty": 1,   # Changed from "easy" to 1
        "streak": 0,
        "progress": 45.0,          # Added so update_average_score has a baseline
        "submission_count": 5      # Added to calculate the new average properly
    },
    2: {
        "name": "Jose",
        "mastery": {"Rizal": 0.8},
        "current_difficulty": 2,   # Changed from "medium" to 2
        "streak": 3,
        "progress": 75.0,
        "submission_count": 12
    }
}

questions = [
    {"id": 1, "topic": "Rizal", "difficulty": 1, "text": "Who wrote Noli Me Tangere?"},
    {"id": 2, "topic": "Rizal", "difficulty": 2, "text": "When was Noli Me Tangere published?"},
    {"id": 3, "topic": "Rizal", "difficulty": 3, "text": "Analyze the political themes of Noli Me Tangere."},
    {"id": 4, "topic": "Rizal", "difficulty": 1, "text": "Where was Jose Rizal born?"} # Added an extra so random.choice has options
]

difficulty_order = [1, 2, 3] # Changed from ["easy", "medium", "hard"]

class SubmissionRequest(BaseModel):
    student_id: int
    topic: str
    score: float

@router.post("/submit")
def submit(data: SubmissionRequest):
    if data.student_id not in students:
        # Place holder for an error
        raise HTTPException(status_code=404, detail="Student not found")
    
    student = students[data.student_id]

    # Call the adaptive engine here
    try:
        result = process_submission(
            student=student,
            topic=data.topic,
            score=data.score,
            question_pool=questions
        )
        return result
    except Exception as e:
        # Return the actual error for debugging
        raise HTTPException(status_code=500, detail=str(e))