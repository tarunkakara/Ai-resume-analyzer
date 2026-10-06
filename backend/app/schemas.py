import re
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

BANNED_PATTERNS = ["123456", "qwerty", "password", "12345678", "abc123", "admin123"]

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str
    password: str
    role: Optional[str] = Field("student", description="Role: student, recruiter, or admin")

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 100:
            raise ValueError("Full Name / Username must be between 2 and 100 characters long.")
        if re.search(r"\d", v):
            raise ValueError("Full Name / Username cannot contain numbers. Only alphabetical letters (a-z, A-Z) and spaces are allowed.")
        if not re.match(r"^[a-zA-Z\s.'-]+$", v):
            raise ValueError("Full Name / Username can only contain alphabetical letters (a-z, A-Z) and spaces.")
        return v

    @field_validator("email")
    @classmethod
    def validate_gmail(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.endswith("@gmail.com"):
            raise ValueError("Email must end strictly with '@gmail.com'.")
        
        prefix = v[:-10] # remove @gmail.com
        
        if len(prefix) < 6 or len(prefix) > 30:
            raise ValueError("Email username (before @gmail.com) must be between 6 and 30 characters long.")
        
        # Allowed characters: letters (a-z), numbers (0-9), and periods (dots)
        if not re.match(r"^[a-z0-9.]+$", prefix):
            raise ValueError("Email username can only contain letters (a-z), numbers (0-9), and periods (.). No spaces or special symbols allowed.")
        
        if prefix.startswith(".") or prefix.endswith(".") or ".." in prefix:
            raise ValueError("Email username cannot start, end, or contain consecutive periods.")
        
        # Cannot be ONLY numbers
        if prefix.isdigit():
            raise ValueError("Email username cannot consist of only numbers. It must contain letters or a combination of letters and numbers.")
        
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 32:
            raise ValueError("Password must be between 8 and 32 characters long.")
        
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter (A-Z).")
        
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter (a-z).")
        
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number (0-9).")
        
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_+=\[\]]", v):
            raise ValueError("Password must contain at least one special symbol (e.g. !@#$%^&*).")
        
        lowered = v.lower()
        for banned in BANNED_PATTERNS:
            if banned in lowered:
                raise ValueError(f"Password contains an insecure pattern '{banned}'. Please choose a stronger password.")
        
        return v


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_login_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not v.endswith("@gmail.com"):
            raise ValueError("Email must end with '@gmail.com'.")
        return v


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class JobDescriptionCreate(BaseModel):
    title: str
    department: Optional[str] = "General"
    raw_text: str
    min_experience: Optional[str] = "0-2 years"


class JobDescriptionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    department: str
    raw_text: str
    required_skills: List[str]
    min_experience: str

    class Config:
        from_attributes = True


class SingleAnalysisRequest(BaseModel):
    job_description_id: Optional[int] = None
    custom_job_title: Optional[str] = None
    custom_job_text: Optional[str] = None
    resume_text: str
    filename: Optional[str] = "candidate_resume.pdf"


class OptimizationRequest(BaseModel):
    analysis_id: int
    target_score: Optional[float] = 96.0


class CandidateRankResponse(BaseModel):
    resume_id: int
    candidate_name: str
    email: str
    filename: str
    overall_fit_score: float
    matched_skills_count: int
    missing_skills_count: int
    top_missing_skills: List[str]
    uploaded_at: str
