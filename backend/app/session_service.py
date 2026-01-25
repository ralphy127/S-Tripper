from fastapi import Depends
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from .settings import Settings, get_settings

class SessionService:
    def __init__(self, secret_key : str):
        self._serializer = URLSafeTimedSerializer(secret_key)

    def create_token(self, user_id: int) -> str:
        return self._serializer.dumps({"user_id": user_id})

    def verify_token(self, token: str, max_age: int = 3600) -> int | None:
        try:
            data = self._serializer.loads(token, max_age = max_age)
            return data.get('user_id')
        except (Exception):
            return None
        
def get_session_service(settings: Settings = Depends(get_settings)):
    return SessionService(settings.secret_key)
