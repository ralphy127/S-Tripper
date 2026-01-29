from typing import List
from datetime import datetime
from sqlalchemy import ForeignKey, Column, func, Float, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    nickname: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]
    is_admin: Mapped[bool] = mapped_column(default=False)

    organized_trips: Mapped[List["Trip"]] = relationship(
        back_populates="organizer",
        cascade="all, delete-orphan"
    )

    trip_memberships: Mapped[List["TripMember"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    trip_id = Column(Integer, ForeignKey("trips.id"))
    payer_id = Column(Integer, ForeignKey("users.id"))

    trip = relationship("Trip", back_populates="expenses")
    payer = relationship("User")

class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str]
    description: Mapped[str | None]
    
    organizer_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    organizer: Mapped["User"] = relationship(back_populates="organized_trips")
    
    memberships: Mapped[List["TripMember"]] = relationship(
        back_populates="trip",
        cascade="all, delete-orphan"
    )

    budget = Column(Float, default=0.0)

    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")

class TripMember(Base):
    __tablename__ = "trip_members"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        primary_key=True
    )
    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"), 
        primary_key=True
    )
    joined_at: Mapped[datetime] = mapped_column(server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="trip_memberships")
    trip: Mapped["Trip"] = relationship(back_populates="memberships")