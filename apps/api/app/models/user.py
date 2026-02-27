from pydantic import BaseModel, EmailStr
from .enums import UserRole

class UserBase(BaseModel):
    fname: str
    lname: str
    email: EmailStr
    role: UserRole

class User(UserBase):
    uid: str


class UserCreate(UserBase):
    """Body when creating a user (uid is provided from auth)."""
    uid: str

class UserUpdate(BaseModel):
    fname: str | None = None
    lname: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None
    