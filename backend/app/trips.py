from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from .database import get_database_session
from .models import User, Trip, TripMember
from .schemas import TripCreate, TripResponse, AddMemberRequest
from .dependencies import get_current_user
from .session_service import SessionService
from .settings import get_settings

session_service = SessionService(get_settings().secret_key)

def create_trips_router() -> APIRouter:
    router = APIRouter(prefix='/trips', tags=['trips'])

    @router.post('/', response_model=TripResponse, status_code=status.HTTP_201_CREATED)
    def create_trip(
        trip_data: TripCreate,
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ) -> Trip:
        new_trip = Trip(
            name=trip_data.name,
            description=trip_data.description,
            budget=trip_data.budget,
            organizer_id=current_user.id
        )
        database.add(new_trip)
        database.commit()
        database.refresh(new_trip)
        return new_trip
    
    @router.get('/', response_model=List[TripResponse])
    def get_my_trips(
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ) -> List[Trip]:
        organized_trips = database.query(Trip).filter(Trip.organizer_id == current_user.id).all()
        member_trips = [m.trip for m in current_user.trip_memberships]
        
        all_trips_dict = {t.id: t for t in organized_trips + member_trips}
        return list(all_trips_dict.values())
    
    @router.get('/{trip_id}', response_model=TripResponse)
    def get_trip(
        trip_id: int,
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ) -> Trip:
        trip = database.query(Trip).filter(Trip.id == trip_id).first()

        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found"
            )

        is_organizer = trip.organizer_id == current_user.id
        is_member = any(m.user_id == current_user.id for m in trip.memberships)

        if not (is_organizer or is_member):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return trip

    @router.put('/{trip_id}', response_model=TripResponse)
    def update_trip(
        trip_id: int,
        trip_data: TripCreate,
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ) -> Trip:
        trip = database.query(Trip).filter(Trip.id == trip_id).first()

        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found"
            )

        if trip.organizer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the organizer can edit the trip"
            )

        trip.name = trip_data.name
        trip.description = trip_data.description
        trip.budget = trip_data.budget

        database.commit()
        database.refresh(trip)
        return trip

    @router.delete('/{trip_id}', status_code=status.HTTP_204_NO_CONTENT)
    def delete_trip(
        trip_id: int,
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ):
        trip = database.query(Trip).filter(Trip.id == trip_id).first()

        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found"
            )

        if trip.organizer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the organizer can delete the trip"
            )

        database.delete(trip)
        database.commit()
        
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @router.post('/{trip_id}/members', status_code=status.HTTP_201_CREATED)
    def add_member(
        trip_id: int,
        request: AddMemberRequest,
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ):
        trip = database.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trip not found"
            )
            
        if trip.organizer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the organizer can add members"
            )
            
        user_to_add = database.query(User).filter(User.nickname == request.nickname).first()
        if user_to_add is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        if user_to_add.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot add yourself as a member"
            )
            
        existing_member = database.query(TripMember).filter(
            TripMember.trip_id == trip_id,
            TripMember.user_id == user_to_add.id
        ).first()
        
        if existing_member:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member"
            )
            
        new_member = TripMember(trip_id=trip_id, user_id=user_to_add.id)
        database.add(new_member)
        database.commit()
        
        return {"message": "Member added successfully"}

    return router