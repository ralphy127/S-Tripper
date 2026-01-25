from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    email: EmailStr
    nickname: str

class UserCreate(UserBase):
    password: str

class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    nickname: str

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_admin: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    message: str
    user: UserResponse

class TripBase(BaseModel):
    name: str
    description: str | None = None
    budget: float | None = 0.0

class TripCreate(TripBase):
    pass

class TripMembershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    joined_at: datetime
    user: UserPublic

class TripResponse(TripBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organizer: UserPublic
    memberships: List[TripMembershipResponse] = []

class AddMemberRequest(BaseModel):
    nickname: str