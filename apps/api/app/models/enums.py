from enum import Enum

class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    parent = "parent"

class UnderstandingLevel(str, Enum):
    beginner = "Beginner"
    developing = "Developing"
    proficient = "Proficient"
    advanced = "Advanced"