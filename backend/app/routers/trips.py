from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_database_session
from app.models import User, Trip
from app.schemas import TripCreate, TripResponse
from app.dependencies import get_current_user
from app.session_service import SessionService
from app.settings import get_settings

session_service = SessionService(get_settings().secret_key)

def create_trips_router() -> APIRouter:
    router = APIRouter(prefix = '/trips', tags = ['trips'])

    @router.post('/', response_model = TripResponse, status_code = status.HTTP_201_CREATED)
    def create_trip(
        trip_data: TripCreate,
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ) -> Trip:
        new_trip = Trip(
            name = trip_data.name,
            description = trip_data.description,
            organizer_id = current_user.id
        )
        database.add(new_trip)
        database.commit()
        database.refresh(new_trip)
        return new_trip
    
    @router.get('/', response_model = List[TripResponse])
    def get_my_trips(
        current_user = Depends(get_current_user),
        database = Depends(get_database_session)
    ) -> List[TripResponse]:
        organized_trips = organized_trips = database.query(Trip).filter(Trip.organizer_id == current_user.id).all()
        member_trips = current_user.member_trips
        all_trips = list({trip.id: trip for trip in organized_trips + member_trips}.values())
        return all_trips
    
    @router.get('/{trip_id}', response_model = TripResponse)
    def get_trip(
        trip_id: int,
        current_user: User = Depends(get_current_user),
        database: Session = Depends(get_database_session)
    ) -> Trip:
        trip = database.query(Trip).filter(Trip.id == trip_id).first()

        if trip is None:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "Trip not found"
            )
        is_organizer = trip.organizer_id == current_user.id
        is_member = current_user in trip.members

        if not (is_organizer or is_member):
            raise HTTPException(
                status_code = status.HTTP_403_FORBIDDEN,
                detail = "Access denied"
            )
        
        return trip

    return router