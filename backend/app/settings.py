from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    class Config:
        env_file = '.env'
        case_sensitive = False
        env_file_encoding = 'utf-8'
        
    database_url: str = 'postgresql://postgres:postgres@localhost:5432/trip_manager'
    secret_key: str = 'dev-secret-key'
    frontend_url: str = 'http://localhost:5173'
    environment: str = 'development'

def get_settings() -> Settings:
    return Settings()