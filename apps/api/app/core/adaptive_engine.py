import random

LEVEL_TO_DIFFICULTY_MAP = {
    1: 1, 2: 1, 3: 1,   
    4: 2, 5: 2, 6: 2,   
    7: 3, 8: 3, 9: 3,   
    10: 3               
}

# ++ Helper function that would take the level of understanding of the student
def get_understanding_level(current_avg: float) -> int:
    if current_avg == 0: return 1
    return min(10, max(1, int(current_avg / 10)))


# ++ This function will update the average of the student 
def update_average_score(current_avg: float, count: int, new_score: float) -> float:
    if count == 0: return new_score
    return ((current_avg * count) + new_score) / (count + 1)

# ++ Helper Function this would select the next question
# based on the difficulty level of the student    
def select_next_question(student_level_int: int, question_pool: list) -> dict:
    target_difficulty = LEVEL_TO_DIFFICULTY_MAP.get(student_level_int, 1)
    filtered_questions = [q for q in question_pool if q["difficulty"] == target_difficulty]

    if not filtered_questions:
        return random.choice([q for q in question_pool if q["difficulty" ==1]])
    
    return random.choice(filtered_questions)


# This function will return the next question and the student
def process_submission(student: dict, topic: str, score: float, question_pool: list):
    old_level = student.get("level", 1)
    submisison_count = student.get("submmision_count", 0)

    # Update student status
    new_average = update_average_score(student.get("average_score", 0), submisison_count, score)
    new_level = get_understanding_level(new_average)

    # Things to take note this should not be in the student table but in the student_progress
    student["average_score"] = new_average
    student["level"] = new_level
    student["submission_count"] = submisison_count + 1

    # Gamification Area 
    # + Things to add pa  progress bar 
    # + Experience points / Monetary points subject to change
    # Temporary
    leveled_up = new_level > old_level

    next_question = select_next_question(new_level, question_pool)

    # We will be return a structure dictionary
    return {
        "assessment": {
            "score_received": score,
            "is_correct": score > 70, # Threshold for "correct" logic
        },
        "progression": {
            "current_level": new_level,
            "leveled_up": leveled_up, # Frontend can now trigger a "Level Up!" animation
            "new_average": round(new_average, 2)
        },
        "next_step": {
            "question_id": next_question["id"],
            "question_text": next_question["text"],
            "difficulty": next_question["difficulty"]
        }
    }
