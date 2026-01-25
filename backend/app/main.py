from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .settings import Settings
from .database import Base, create_db_engine
from .session_service import SessionService
from .auth import create_auth_router
from .trips import create_trips_router

settings = Settings()
engine = create_db_engine(settings)

Base.metadata.create_all(bind = engine)

app = FastAPI(version = '1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins = [settings.frontend_url],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)
app.include_router(create_auth_router())
app.include_router(create_trips_router())

@app.get("/")
def root():
    return {"message": "Trip Manager API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}