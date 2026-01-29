from fastapi import APIRouter, Depends, HTTPException, status, Response
import bcrypt
from sqlalchemy.orm import Session
from .database import get_database_session
from .models import User
from .schemas import UserCreate, UserResponse, LoginRequest, LoginResponse
from .session_service import SessionService
from .dependencies import get_current_user
from .settings import get_settings

settings = get_settings()
session_service = SessionService(settings.secret_key)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_auth_router() -> APIRouter:
    router = APIRouter(prefix='/auth', tags=['authentication'])

    @router.post('/register', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
    def register(user_data: UserCreate, db: Session = Depends(get_database_session)) -> User:
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Email already registered'
            )
        
        if db.query(User).filter(User.nickname == user_data.nickname).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Nickname already taken'
            )
        
        new_user = User(
            email=user_data.email,
            nickname=user_data.nickname,
            hashed_password=hash_password(user_data.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @router.post('/login', response_model=LoginResponse)
    def login(
        credentials: LoginRequest,
        response: Response,
        db: Session = Depends(get_database_session)
    ) -> LoginResponse:
        user = db.query(User).filter(User.email == credentials.email).first()
        
        if user is None or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid email or password'
            )
        
        session_token = session_service.create_token(user.id)
        
        is_production = settings.environment == 'production'
        
        response.set_cookie(
            key='session',
            value=session_token,
            httponly=True,
            samesite='None' if is_production else 'lax',
            secure=is_production,
            max_age=3600
        )
        
        return LoginResponse(message='Login successful', user=user)

    @router.post('/logout')
    def logout(response: Response):
        is_production = settings.environment == 'production'

        response.delete_cookie(
            key='session',
            samesite='None' if is_production else 'lax',
            secure=is_production
        )
        return {'message': 'Logout successful'}

    @router.get('/me', response_model=UserResponse)
    def get_me(current_user: User = Depends(get_current_user)) -> User:
        return current_user

    return router