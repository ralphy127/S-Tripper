from fastapi import Depends
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from .settings import Settings, get_settings


def create_db_engine(settings: Settings) -> Engine:
    return create_engine(
        settings.database_url,
        pool_pre_ping=True
    )

class Database:
    def __init__(self, engine: Engine):
        self._session_factory = sessionmaker(
            bind = engine,
            autocommit = False,
            autoflush = False
        )

    def create_session(self) -> Session:
        return self._session_factory()

def get_database(settings: Settings = Depends(get_settings)) -> Database:
    return Database(create_db_engine(settings))

def get_database_session(database: Database = Depends(get_database)):
    session = database.create_session()
    try:
        yield session
    finally:
        session.close()

class Base(DeclarativeBase):
    pass
