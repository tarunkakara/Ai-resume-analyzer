import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student") # student, recruiter, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="creator")
    analysis_results = relationship("AnalysisResult", back_populates="user")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    file_type = Column(String(50), default="pdf") # pdf, docx, txt
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="resumes")
    parsed_profile = relationship("ParsedProfile", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    analysis_results = relationship("AnalysisResult", back_populates="resume", cascade="all, delete-orphan")


class ParsedProfile(Base):
    __tablename__ = "parsed_profiles"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    candidate_name = Column(String(255), nullable=True)
    contact_info = Column(JSON, nullable=True) # email, phone, linkedin
    skills = Column(JSON, nullable=True) # list of extracted skills
    education = Column(JSON, nullable=True) # list of degrees/universities
    experience = Column(JSON, nullable=True) # list of work experience details
    projects = Column(JSON, nullable=True) # list of projects

    resume = relationship("Resume", back_populates="parsed_profile")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    department = Column(String(255), default="General")
    raw_text = Column(Text, nullable=False)
    required_skills = Column(JSON, nullable=True) # extracted skills list
    min_experience = Column(String(100), default="0-2 years")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("User", back_populates="job_descriptions")
    analysis_results = relationship("AnalysisResult", back_populates="job_description", cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    
    overall_fit_score = Column(Float, nullable=False) # 0 to 100
    matched_skills = Column(JSON, nullable=False) # list of matching skills
    missing_skills = Column(JSON, nullable=False) # list of missing skills
    section_scores = Column(JSON, nullable=False) # breakdown by skills, exp, edu, etc.
    ats_formatting_issues = Column(JSON, nullable=True) # list of formatting recommendations
    suggestions = Column(JSON, nullable=True) # course/skill recommendations
    optimized_resume_text = Column(Text, nullable=True) # 96%+ ATS boosted resume draft
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="analysis_results")
    resume = relationship("Resume", back_populates="analysis_results")
    job_description = relationship("JobDescription", back_populates="analysis_results")
