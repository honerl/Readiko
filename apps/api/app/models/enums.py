from enum import Enum

class UserRole(str, Enum):
    student = "Student"
    teacher = "Teacher"
    parent = "Parent"

class UnderstandingLevel(str, Enum):
    beginner = "Beginner"
    developing = "Developing"
    proficient = "Proficient"
    advanced = "Advanced"