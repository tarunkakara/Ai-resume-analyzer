import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import engine, Base, get_db
from .models import User, Resume, ParsedProfile, JobDescription, AnalysisResult
from .schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    JobDescriptionCreate, JobDescriptionResponse, CandidateRankResponse
)
from .auth import hash_password, verify_password, create_access_token, get_current_user, require_user
from .analyzer import (
    extract_text_from_file, calculate_job_fit_score, 
    generate_optimized_96_plus_resume, extract_skills_from_text, parse_resume_sections
)
from .seed import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="AI-Based Resume Analyzer & Job-Fit Scorer API",
    description="Codegnan Hackathon Data Mavericks Platform API",
    version="1.0.0"
)

# CORS setup for localhost & Render deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register", response_model=TokenResponse)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    # 1. Email uniqueness check
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this Gmail address already exists. Please sign in."
        )

    # 2. Hash password & save user
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role or "student"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 3. Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password. Please check your credentials."
        )

    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(require_user)):
    return user


# --- JOB DESCRIPTIONS ENDPOINTS ---

@app.get("/api/jobs", response_model=List[JobDescriptionResponse])
def get_job_descriptions(db: Session = Depends(get_db)):
    return db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()


@app.post("/api/jobs", response_model=JobDescriptionResponse)
def create_job_description(
    jd_data: JobDescriptionCreate,
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    extracted_skills = extract_skills_from_text(jd_data.raw_text)
    new_jd = JobDescription(
        user_id=user.id,
        title=jd_data.title,
        department=jd_data.department or "General",
        raw_text=jd_data.raw_text,
        required_skills=extracted_skills,
        min_experience=jd_data.min_experience or "0-2 years"
    )
    db.add(new_jd)
    db.commit()
    db.refresh(new_jd)
    return new_jd


# --- STUDENT RESUME ANALYZER ENDPOINTS ---

@app.post("/api/student/analyze")
async def analyze_resume_endpoint(
    job_description_id: Optional[int] = Form(None),
    custom_job_title: Optional[str] = Form(None),
    custom_job_text: Optional[str] = Form(None),
    resume_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Extract text from file or text string
    extracted_resume_text = ""
    filename = "Pasted_Resume.txt"

    if file:
        filename = file.filename
        file_bytes = await file.read()
        extracted_resume_text = extract_text_from_file(file_bytes, filename)
    elif resume_text:
        extracted_resume_text = resume_text.strip()

    if not extracted_resume_text or len(extracted_resume_text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume content is too short or could not be parsed. Please upload a valid PDF, DOCX, or paste resume text."
        )

    # Determine Job Description
    job_text = ""
    job_title = (custom_job_title or "").strip() or "Target Role"
    jd_id = job_description_id

    if jd_id:
        jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
        if jd:
            job_text = jd.raw_text
            job_title = jd.title
    
    if not job_text and custom_job_text:
        job_text = custom_job_text.strip()

    if not job_text:
        # Fallback default Python/AI Engineer JD
        job_text = "Python, FastAPI, SQL, Machine Learning, Scikit-learn, React, Git, Problem Solving, REST APIs."

    user_id = user.id if user else 1

    # If this was a custom entered job, persist it as a JobDescription entity
    if not jd_id:
        new_jd = JobDescription(
            user_id=user_id,
            title=job_title,
            department="Custom Target",
            raw_text=job_text,
            required_skills=extract_skills_from_text(job_text),
            min_experience="As Specified in JD"
        )
        db.add(new_jd)
        db.commit()
        db.refresh(new_jd)
        jd_id = new_jd.id

    # Compute NLP Fit Score & ATS Engine Results
    result = calculate_job_fit_score(extracted_resume_text, job_text)

    # Save Resume Record
    new_resume = Resume(
        user_id=user_id,
        filename=filename,
        raw_text=extracted_resume_text,
        file_type=filename.split(".")[-1] if "." in filename else "txt"
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Save Parsed Profile
    parsed = parse_resume_sections(extracted_resume_text)
    profile = ParsedProfile(
        resume_id=new_resume.id,
        user_id=user_id,
        candidate_name=parsed["candidate_name"],
        contact_info=parsed["contact_info"],
        skills=result["matched_skills"] + result["missing_skills"],
        education=[],
        experience=[]
    )
    db.add(profile)

    # Save Analysis Result
    analysis_record = AnalysisResult(
        user_id=user_id,
        resume_id=new_resume.id,
        job_description_id=jd_id,
        overall_fit_score=result["overall_fit_score"],
        matched_skills=result["matched_skills"],
        missing_skills=result["missing_skills"],
        section_scores=result["section_scores"],
        ats_formatting_issues=result["ats_formatting_issues"],
        suggestions=result["suggestions"],
        optimized_resume_text=None
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    return {
        "analysis_id": analysis_record.id,
        "job_title": job_title,
        "filename": filename,
        "overall_fit_score": result["overall_fit_score"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "section_scores": result["section_scores"],
        "ats_formatting_issues": result["ats_formatting_issues"],
        "suggestions": result["suggestions"],
        "parsed_profile": parsed,
        "raw_resume_text": extracted_resume_text
    }


@app.post("/api/student/optimize-resume")
def optimize_resume_endpoint(
    analysis_id: int = Form(...),
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    job = db.query(JobDescription).filter(JobDescription.id == analysis.job_description_id).first()

    job_text = job.raw_text if job else "Python, Machine Learning, SQL, FastAPI, React, Git, Cloud"
    job_title = job.title if job else "Software Engineer"

    # Generate Boosted Resume Text with 96%+ ATS Fit Score
    optimized_text, boosted_score = generate_optimized_96_plus_resume(
        resume.raw_text, job_text, analysis.missing_skills or [], job_title
    )

    analysis.optimized_resume_text = optimized_text
    analysis.overall_fit_score = boosted_score
    db.commit()

    return {
        "analysis_id": analysis.id,
        "job_title": job_title,
        "previous_score": analysis.overall_fit_score,
        "boosted_ats_score": boosted_score,
        "missing_skills_added": analysis.missing_skills or [],
        "optimized_resume_text": optimized_text
    }


@app.get("/api/student/my-analyses")
def get_user_analyses(user: User = Depends(require_user), db: Session = Depends(get_db)):
    results = db.query(AnalysisResult).filter(AnalysisResult.user_id == user.id).order_by(AnalysisResult.created_at.desc()).all()
    out = []
    for r in results:
        resume = db.query(Resume).filter(Resume.id == r.resume_id).first()
        job = db.query(JobDescription).filter(JobDescription.id == r.job_description_id).first()
        out.append({
            "id": r.id,
            "job_title": job.title if job else "Target Role",
            "filename": resume.filename if resume else "Resume.pdf",
            "overall_fit_score": r.overall_fit_score,
            "matched_count": len(r.matched_skills or []),
            "missing_count": len(r.missing_skills or []),
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return out


# --- RECRUITER BULK & RANKING ENDPOINTS ---

@app.post("/api/recruiter/bulk-upload")
async def bulk_upload_resumes(
    job_description_id: int = Form(...),
    files: List[UploadFile] = File(...),
    user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    jd = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found.")

    processed_results = []
    for file in files:
        file_bytes = await file.read()
        text = extract_text_from_file(file_bytes, file.filename)
        if not text:
            continue

        result = calculate_job_fit_score(text, jd.raw_text)
        
        # Save resume & analysis
        new_res = Resume(
            user_id=user.id,
            filename=file.filename,
            raw_text=text
        )
        db.add(new_res)
        db.commit()
        db.refresh(new_res)

        parsed = parse_resume_sections(text)
        new_analysis = AnalysisResult(
            user_id=user.id,
            resume_id=new_res.id,
            job_description_id=jd.id,
            overall_fit_score=result["overall_fit_score"],
            matched_skills=result["matched_skills"],
            missing_skills=result["missing_skills"],
            section_scores=result["section_scores"],
            ats_formatting_issues=result["ats_formatting_issues"],
            suggestions=result["suggestions"]
        )
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)

        processed_results.append({
            "resume_id": new_res.id,
            "candidate_name": parsed["candidate_name"],
            "filename": file.filename,
            "overall_fit_score": result["overall_fit_score"],
            "matched_skills_count": len(result["matched_skills"]),
            "missing_skills_count": len(result["missing_skills"])
        })

    return {
        "message": f"Successfully processed {len(processed_results)} resumes for '{jd.title}'.",
        "candidates": processed_results
    }


@app.get("/api/recruiter/rankings/{jd_id}")
def get_candidate_rankings(jd_id: int, db: Session = Depends(get_db)):
    results = db.query(AnalysisResult).filter(AnalysisResult.job_description_id == jd_id).order_by(AnalysisResult.overall_fit_score.desc()).all()
    
    candidates = []
    for r in results:
        resume = db.query(Resume).filter(Resume.id == r.resume_id).first()
        profile = db.query(ParsedProfile).filter(ParsedProfile.resume_id == r.resume_id).first() if resume else None
        
        candidate_name = profile.candidate_name if (profile and profile.candidate_name) else (resume.filename if resume else "Candidate")
        email = profile.contact_info.get("email", "N/A") if (profile and profile.contact_info) else "N/A"

        candidates.append({
            "analysis_id": r.id,
            "resume_id": r.resume_id,
            "candidate_name": candidate_name,
            "email": email,
            "filename": resume.filename if resume else "Resume.pdf",
            "overall_fit_score": r.overall_fit_score,
            "matched_skills": r.matched_skills or [],
            "missing_skills": r.missing_skills or [],
            "uploaded_at": r.created_at.strftime("%Y-%m-%d %H:%M")
        })

    return candidates


@app.get("/api/recruiter/analytics/{jd_id}")
def get_batch_analytics(jd_id: int, db: Session = Depends(get_db)):
    results = db.query(AnalysisResult).filter(AnalysisResult.job_description_id == jd_id).all()
    if not results:
        return {
            "total_candidates": 0,
            "average_fit_score": 0.0,
            "most_common_missing_skills": [],
            "score_distribution": {"high": 0, "medium": 0, "low": 0}
        }

    total_candidates = len(results)
    avg_score = round(sum(r.overall_fit_score for r in results) / total_candidates, 1)

    missing_skill_counts = {}
    high, medium, low = 0, 0, 0
    for r in results:
        if r.overall_fit_score >= 80:
            high += 1
        elif r.overall_fit_score >= 60:
            medium += 1
        else:
            low += 1

        for skill in (r.missing_skills or []):
            missing_skill_counts[skill] = missing_skill_counts.get(skill, 0) + 1

    sorted_missing = sorted(missing_skill_counts.items(), key=lambda x: x[1], reverse=True)
    top_missing = [{"skill": k, "count": v, "percentage": round((v / total_candidates) * 100, 1)} for k, v in sorted_missing[:8]]

    return {
        "total_candidates": total_candidates,
        "average_fit_score": avg_score,
        "most_common_missing_skills": top_missing,
        "score_distribution": {
            "high": high,
            "medium": medium,
            "low": low
        }
    }


# --- ADMIN DASHBOARD ENDPOINTS ---

@app.get("/api/admin/stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_resumes = db.query(Resume).count()
    total_analyses = db.query(AnalysisResult).count()
    
    avg_score_query = db.query(func.avg(AnalysisResult.overall_fit_score)).scalar()
    avg_score = round(avg_score_query, 1) if avg_score_query else 0.0

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()

    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_analyses": total_analyses,
        "average_fit_score": avg_score,
        "recent_users": [
            {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at.strftime("%Y-%m-%d")
            } for u in recent_users
        ]
    }


# --- FRONTEND STATIC FILES MOUNT (Render Single-Service Deployment Support) ---

frontend_dist_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend", "dist")

if os.path.exists(frontend_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist_path, "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found.")
        file_path = os.path.join(frontend_dist_path, full_path)
        headers = {"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"}
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path, headers=headers)
        return FileResponse(os.path.join(frontend_dist_path, "index.html"), headers=headers)
