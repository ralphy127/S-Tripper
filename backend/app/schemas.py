from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    nickname: str

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

class MemberResponse(BaseModel):
    class Config:
        from_attributes = True

    id: int
    nickname: str

class TripResponse(TripBase):
    class Config:
        from_attributes = True

    id: int
    name: str
    description: str | None
    organizer_id: int
    members: list[MemberResponse] = []

class AddMemberRequest(BaseModel):
    nickname: str
