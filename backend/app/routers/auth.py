from fastapi import APIRouter, Depends, HTTPException, status, Response
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import get_database_session
from app.models import User
from app.schemas import UserCreate, UserResponse, LoginRequest, LoginResponse
from app.session_service import SessionService
from app.dependencies import get_current_user
from app.settings import get_settings

session_service = SessionService(get_settings().secret_key)

def hash_password(
    password: str,
    hasher: CryptContext = CryptContext(schemes = ['bcrypt'], deprecated = 'auto')
) -> str:
    return hasher.hash(password)

def verify_password(
    password: str,
    hashed_password: str,
    hasher: CryptContext = CryptContext(schemes = ['bcrypt'], deprecated = 'auto')) -> bool:
    return hasher.verify(password, hashed_password)

def create_auth_router() -> APIRouter:
    router = APIRouter(prefix = '/auth', tags = ['authentication'])

    @router.post('/register', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
    def register(user_data: UserCreate, db: Session = Depends(get_database_session)) -> User:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user is not None:
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail = 'Email already registered')
        
        new_user = User(
            email = user_data.email,
            hashed_password = hash_password(user_data.password))
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
                status_code = status.HTTP_401_UNAUTHORIZED,
                detail = 'Invalid email or password')
        
        session_token = session_service.create_token(user.id)
        response.set_cookie(
            key = 'session',
            value = session_token,
            httponly = True,
            samesite = 'lax',
            secure = False,
            max_age = 3600)
        return LoginResponse(message='Login successful', user=UserResponse.model_validate(user))

    @router.post('/logout')
    def logout(response: Response):
        response.delete_cookie(key='session')
        return {'message': 'Logout successful'}

    @router.get('/me', response_model=UserResponse)
    def get_me(current_user: User = Depends(get_current_user)):
        return current_user

    return router