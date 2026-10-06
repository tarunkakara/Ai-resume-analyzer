import datetime
import hashlib
import hmac
import os
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from .database import get_db
from .models import User

SECRET_KEY = "HACKATHON_DATA_MAVERICKS_AI_RESUME_ANALYZER_SECRET_KEY_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days expiration

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return f"{salt}${hashed}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, stored_hash = hashed_password.split('$')
        computed_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        return hmac.compare_digest(stored_hash, computed_hash)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.email == email).first()
    return user

def require_user(current_user: Optional[User] = Depends(get_current_user)) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
