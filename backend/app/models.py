from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, ForeignKey, DateTime
from app.database import Base
from typing import List
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    email: Mapped[str] = mapped_column(String, unique = True, index = True, nullable = False)
    nickname: Mapped[str] = mapped_column(String, unique = True, index = True, nullable = False)
    hashed_password: Mapped[str] = mapped_column(nullable = False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default = False, nullable = False)
    organized_trips: Mapped[List["Trip"]] = relationship(
        back_populates = "organizer",
        cascade = "all, delete-orphan"
    )
    trip_memberships: Mapped[List["TripMember"]] = relationship(
        back_populates = "user",
        cascade = "all, delete-orphan"
    )
    member_trips: Mapped[List["Trip"]] = relationship(
        secondary = "trip_members",
        viewonly = True,
        back_populates = "members"
    )

class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key = True, index = True)
    name: Mapped[str] = mapped_column(String, nullable = False)
    description: Mapped[str | None] = mapped_column(nullable = True)
    organizer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable = False
    )
    organizer: Mapped["User"] = relationship(
        back_populates = "organized_trips"
    )
    memberships: Mapped[List["TripMember"]] = relationship(
        back_populates = "trip",
        cascade = "all, delete-orphan"
    )
    members: Mapped[List["User"]] = relationship(
        secondary = "trip_members",
        viewonly = True,
        back_populates = "member_trips"
    )

class TripMember(Base):
    __tablename__ = "trip_members"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete = "CASCADE"),
        primary_key = True
    )
    trip_id: Mapped[int] = mapped_column(
        ForeignKey("trips.id", ondelete = "CASCADE"),
        primary_key = True
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime,
        default = lambda: datetime.now(timezone.utc)
    )
    user: Mapped["User"] = relationship(back_populates = "trip_memberships")
    trip: Mapped["Trip"] = relationship(back_populates = "memberships")