from pydantic import BaseModel, EmailStr
from datetime import date
from .enums import UserRole

class UserBase(BaseModel):
    fname: str
    lnmae: str
    birthday: date
    email: EmailStr
    role: UserRole

class User(UserBase):
    uid: int

class UserCreate(UserBase):
    """Body when creating a user (uid might be generate by auth)."""
    pass

class UserUpdate(BaseModel):
    fname: str | None = None
    lname: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None
    