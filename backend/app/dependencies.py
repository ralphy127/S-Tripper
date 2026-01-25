from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from .database import get_database_session
from .models import User
from .session_service import SessionService, get_session_service

def get_current_user(
    session: Optional[str] = Cookie(None),
    database: Session = Depends(get_database_session),
    session_service: SessionService = Depends(get_session_service)
) -> User:
    if not session:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = 'Not authenticated'
        )
    
    user_id = session_service.verify_token(session)
    if user_id is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = 'Invalid or expired session'
        )
    
    user = database.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = 'User not found'
        )
    
    return user