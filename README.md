# AI-Based Resume Analyzer and Job-Fit Scorer

[![Live Demo](https://img.shields.io/badge/Live%20Website-Visit%20Site-10b981?style=for-the-badge&logo=render&logoColor=white)](https://ai-resume-analyzer-f2vw.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-6366f1?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tarunkakara/Ai-resume-analyzer)

> 🚀 **LIVE DEPLOYED WEBSITE:** [https://ai-resume-analyzer-f2vw.onrender.com](https://ai-resume-analyzer-f2vw.onrender.com/)  
> 👉 **Click the link above to open and interact with the live web application!**

---

> **Codegnan Hackathon — Data Mavericks Team Submission**  
> **Domain:** Artificial Intelligence / Recruitment Technology  
> **Team Lead:** kakara tarun & Team

---

## 📌 Executive Summary & Problem Statement

Recruiters during hiring hackathons and placement drives receive hundreds of resumes and spend limited seconds scanning each one, often missing highly qualified candidates whose resumes are formatted poorly. Conversely, students and job seekers lack clear, explainable feedback on how well their resumes match target job descriptions or where critical skill gaps lie.

**Our Solution:** An end-to-end AI-powered web platform that accepts resumes (PDF, DOCX, TXT) and target job descriptions, computes an explainable **Job-Fit Score (0–100)** using Natural Language Processing (NLP), highlights matched vs. missing skills, inspects ATS formatting compliance, ranks applicants on recruiter dashboards, and features an interactive **ATS 96%+ Resume Optimization Engine**.

---

## 🔥 Key Platform Capabilities

### 1. 🎓 Student / Job Seeker Portal
- **Multi-Format Parsing Engine:** Fast text extraction from `.pdf`, `.docx`, and plain text files.
- **Explainable Job-Fit Score:** Evaluates match percentage (0–100) combining TF-IDF vectorization, cosine semantic similarity, and skill taxonomy dictionary coverage.
- **Skill Gap & Learning Roadmap:** Highlights matched skills alongside missing skills, suggesting specific online courses to bridge technical gaps.
- **ATS Formatting Inspector:** Detects word count deficiencies, missing contact details, and non-standard section headings.
- **🚀 One-Click ATS 96%+ Resume Optimizer:** Intelligently incorporates missing skills into candidate experience bullet points and technical skill sections, generating an upgraded resume draft with a verified **96%+ ATS score**.

### 2. 💼 Recruiter Triage & Candidate Ranking Portal
- **Job Description Management:** Create, store, and manage benchmark job roles.
- **Bulk Resume Upload:** Upload and evaluate multiple applicant resumes simultaneously.
- **Candidate Leaderboard:** Automatically ranks candidates sorted by fit score with matched/missing skill badges.
- **Batch Skill Shortage Analytics:** Identifies the most common missing skills across applicant batches and plots match score distributions.

### 3. 🛡️ System Admin Analytics
- **Platform Usage Metrics:** Real-time stats on total users, total parsed resumes, total analyses executed, and average system match scores.
- **User Management Log:** Monitors account registrations across Student, Recruiter, and Admin roles.

---

## 🏗️ Technical Architecture & Stack

```
           +-------------------------------------------------+
           |           React + Vite Modern UI                |
           |   (Glassmorphic High-Contrast Dark Theme)       |
           +------------------------+------------------------+
                                    |
                                    v
           +-------------------------------------------------+
           |                 FastAPI Backend                 |
           |       (CORS, JWT Auth, Role-Based Access)       |
           +------------------------+------------------------+
                                    |
           +------------------------+------------------------+
           |                                                 |
           v                                                 v
+-----------------------+                         +-----------------------+
|  NLP Scorer & Engine  |                         |  SQLAlchemy (SQLite)  |
|  - TF-IDF Vectorizer  |                         |  - Users              |
|  - Cosine Similarity  |                         |  - Resumes            |
|  - ATS 96%+ Booster   |                         |  - JobDescriptions    |
+-----------------------+                         |  - AnalysisResults    |
                                                  +-----------------------+
```

- **Frontend:** React 18, Vite, Custom CSS Tokens, Glassmorphism UI Components.
- **Backend:** Python 3.11+, FastAPI, Uvicorn, SQLAlchemy, SQLite, Scikit-Learn, PyPDF, Python-Docx, Passlib/Bcrypt, Python-Jose (JWT).
- **Deployment:** Single-service architecture hosted on Render.

---

## 💾 Database Entity Schema

1. **`Users`**: `id`, `email`, `password_hash`, `full_name`, `role` (`student`, `recruiter`, `admin`), `created_at`
2. **`Resumes`**: `id`, `user_id`, `filename`, `raw_text`, `file_type`, `uploaded_at`
3. **`ParsedProfiles`**: `id`, `resume_id`, `candidate_name`, `contact_info`, `skills`, `education`, `experience`
4. **`JobDescriptions`**: `id`, `user_id`, `title`, `department`, `raw_text`, `required_skills`, `min_experience`
5. **`AnalysisResults`**: `id`, `resume_id`, `job_description_id`, `overall_fit_score`, `matched_skills`, `missing_skills`, `section_scores`, `ats_formatting_issues`, `suggestions`, `optimized_resume_text`

---

## ⚙️ Installation & Developer Guide

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 👥 Project Credits & Submission Info

- **Hackathon:** Codegnan Data Mavericks Hackathon (Vizag)
- **Project Title:** AI-Based Resume Analyzer and Job-Fit Scorer
- **Team Name:** Data Mavericks
- **Lead Developer:** kakara tarun & Team
