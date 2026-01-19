from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    class Config:
        from_attributes = True

    id: int
    is_admin: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    user: UserResponse

class TripBase(BaseModel):
    pass

class TripCreate(TripBase):
    name: str
    description: str | None
    pass

class TripResponse(TripBase):
    class Config:
        from_attributes = True

    id: int
    organizer_id: int
