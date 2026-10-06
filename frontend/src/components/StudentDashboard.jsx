import React, { useState } from 'react';
import { api } from '../api/client';
import ResumeOptimizerModal from './ResumeOptimizerModal';

// Sample presets for quick testing during hackathon demo
const SAMPLE_JDS = [
  {
    title: "Python Full-Stack Developer",
    text: "We are seeking a Python Full-Stack Developer proficient in Python, FastAPI, React.js, JavaScript, PostgreSQL, Docker, Git, RESTful APIs, and CI/CD pipelines. Experience in building scalable microservices and implementing Agile methodologies is required."
  },
  {
    title: "AI & Machine Learning Engineer",
    text: "Looking for an AI/ML Engineer with expertise in Python, Machine Learning, Deep Learning, NLP, Scikit-Learn, PyTorch, TensorFlow, Pandas, NumPy, SQL, and Cloud deployments on AWS or GCP. Strong mathematical foundations and problem solving skills required."
  },
  {
    title: "Data Analyst & Business Intelligence",
    text: "Hiring Data Analyst with strong hands-on experience in SQL, Python, Pandas, Power BI, Tableau, Data Analysis, Statistics, Predictive Modeling, and Excel. Must have excellent communication skills and ability to translate data into business insights."
  }
];

const SAMPLE_RESUME = `PRIYA SHARMA
Email: priya.sharma@gmail.com | Phone: +91 98765 43210 | Location: Hyderabad, India
LinkedIn: linkedin.com/in/priyasharma

PROFESSIONAL SUMMARY
Passionate Software Developer with 2 years of experience building web applications and backend systems using Python, Django, HTML, CSS, JavaScript, and MySQL. Eager to leverage skills in developing high-impact scalable software solutions.

TECHNICAL SKILLS
• Programming: Python, JavaScript, SQL, HTML5, CSS3
• Frameworks & Tools: Django, Flask, Git, GitHub, MySQL, SQLite
• Methodologies: Agile, Scrum, Problem Solving

WORK EXPERIENCE
Software Developer | TechWave Labs (2023 - Present)
• Developed responsive web applications using Python, Django, and JavaScript.
• Integrated REST APIs and database models using MySQL, improving data query speeds by 20%.
• Collaborated in weekly Agile sprint cycles, conducting code reviews and unit testing.

PROJECTS
E-Commerce Web Portal
• Built a full-featured e-commerce web platform with user authentication, product catalog, and checkout flow using Python Django and MySQL.

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science
JNTU University | GPA: 8.5 / 10.0 (2019 - 2023)`;

export default function StudentDashboard({ currentUser, onOpenAuth }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [optimizedData, setOptimizedData] = useState(null);

  const handleLoadSampleJd = (sample) => {
    setJobTitle(sample.title);
    setJobDescription(sample.text);
  };

  const handleLoadSampleResume = () => {
    setResumeFile(null);
    setResumeText(SAMPLE_RESUME);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      setErrorMsg('Please Sign In or Create an Account first to analyze your resume.');
      return;
    }

    if (!jobTitle.trim()) {
      setErrorMsg('Please enter a Target Job Title (e.g. Python Developer, Data Analyst).');
      return;
    }

    if (!jobDescription.trim()) {
      setErrorMsg('Please paste the Target Job Description text.');
      return;
    }

    if (!resumeFile && !resumeText.trim()) {
      setErrorMsg('Please upload your resume file (.pdf / .docx) or paste your resume text.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("custom_job_title", jobTitle.trim());
      formData.append("custom_job_text", jobDescription.trim());

      if (resumeFile) {
        formData.append("file", resumeFile);
      } else {
        formData.append("resume_text", resumeText.trim());
      }

      const res = await api.analyzeResume(formData);
      setAnalysisResult(res);
    } catch (err) {
      setErrorMsg(err.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleBoostResumeScore = async () => {
    if (!analysisResult) return;
    try {
      setLoading(true);
      const res = await api.optimizeResume(analysisResult.analysis_id);
      setOptimizedData({
        ...res,
        job_title: jobTitle || analysisResult.job_title || 'Target Role'
      });
      setShowOptimizerModal(true);
    } catch (err) {
      alert(err.message || "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Hero Header */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
              ⚡ AI-Powered Resume Scoring & Optimization
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Student & Job Seeker Portal</h2>
            <p style={{ color: '#9ca3af', maxWidth: '680px', fontSize: '0.95rem' }}>
              Enter your target job title & job description, upload your resume, and let our NLP AI calculate your ATS match score, detect missing skills, and auto-generate an <strong>ATS 96%+ Boosted Resume</strong>!
            </p>
          </div>
          {analysisResult && (
            <button onClick={handleBoostResumeScore} className="btn-emerald" style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
              🚀 Auto-Boost ATS Score to 96%+
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        {/* Input Form Column */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📄</span> Enter Job Details & Upload Resume
          </h3>

          {errorMsg && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Quick Demo Fillers */}
          <div style={{ marginBottom: '20px', padding: '12px 14px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
              💡 Quick-Fill Sample Job Descriptions (1-Click Test):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SAMPLE_JDS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSampleJd(sample)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ {sample.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Target Job Title Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
                Target Job Title <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Enter Job Title (e.g. Python Developer, Data Analyst, Software Engineer)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            {/* Target Job Description Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
                Target Job Description Requirements <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <textarea
                required
                className="textarea-field"
                placeholder="Paste the full Job Description text, required technical skills, and responsibilities here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ minHeight: '130px' }}
              />
            </div>

            {/* Upload File / Paste Resume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#d1d5db' }}>
                  Upload Resume File (.pdf, .docx, .txt)
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleResume}
                  style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  💡 Load Sample Resume
                </button>
              </div>

              <div style={{ border: '2px dashed rgba(99, 102, 241, 0.4)', borderRadius: '12px', padding: '18px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer' }}>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                      setResumeText('');
                    }
                  }}
                  style={{ display: 'none' }}
                  id="resume-file-upload"
                />
                <label htmlFor="resume-file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>📁</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#6366f1' }}>
                    {resumeFile ? `Selected: ${resumeFile.name}` : 'Click to Browse PDF or DOCX File'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>Supported formats: .pdf, .docx, .txt</div>
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
                Or Paste Resume Text
              </label>
              <textarea
                className="textarea-field"
                placeholder="Paste raw resume text here if you don't have a file ready..."
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  if (e.target.value) setResumeFile(null);
                }}
                style={{ minHeight: '110px' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', justifyContent: 'center', fontSize: '1rem', marginTop: '4px' }}>
              {loading ? 'Analyzing Fit Score & NLP Keywords...' : '🔍 Analyze Resume Fit Score'}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {analysisResult ? (
            <>
              {/* Score Meter Card */}
              <div className="glass-card" style={{ padding: '28px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af', marginBottom: '16px' }}>
                  OVERALL MATCH FIT SCORE
                </div>
                
                <div className="score-circle" style={{ '--score-pct': analysisResult.overall_fit_score }}>
                  <div className="score-circle-inner">
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
                      {analysisResult.overall_fit_score}%
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ATS Fit</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginTop: '16px', color: '#ffffff' }}>
                  Target Role: <span style={{ color: '#06b6d4' }}>{analysisResult.job_title}</span>
                </h3>

                <div style={{ marginTop: '16px' }}>
                  <button onClick={handleBoostResumeScore} className="btn-emerald" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}>
                    🚀 Optimize Resume to 96%+ ATS Score
                  </button>
                </div>
              </div>

              {/* Matched & Missing Skills Card */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Skill Analysis & Gap Report</h4>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✅</span> Matched Skills ({analysisResult.matched_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysisResult.matched_skills.length > 0 ? (
                      analysisResult.matched_skills.map((skill, i) => (
                        <span key={i} className="badge badge-emerald">{skill}</span>
                      ))
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No exact skill matches detected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fb7185', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>❌</span> Missing / Skill Gaps ({analysisResult.missing_skills.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysisResult.missing_skills.length > 0 ? (
                      analysisResult.missing_skills.map((skill, i) => (
                        <span key={i} className="badge badge-rose">{skill}</span>
                      ))
                    ) : (
                      <span style={{ color: '#34d399', fontSize: '0.85rem' }}>Great job! No major skill gaps detected.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggestions & Action Plan */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>🎓 Skill Gap Learning Recommendations</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analysisResult.suggestions && analysisResult.suggestions.length > 0 ? (
                    analysisResult.suggestions.map((s, idx) => (
                      <div key={idx} style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div style={{ fontWeight: 700, color: '#06b6d4', fontSize: '0.9rem', marginBottom: '4px' }}>
                          Skill Focus: {s.skill}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#d1d5db', marginBottom: '4px' }}>{s.recommendation}</p>
                        <span style={{ fontSize: '0.78rem', color: '#a5b4fc' }}>{s.course}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No specific course recommendations required.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: '48px 28px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '8px' }}>No Analysis Generated Yet</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                Enter your target job title & description, upload your resume, and click "Analyze Resume Fit Score" to generate your detailed report.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Optimizer Modal */}
      {showOptimizerModal && (
        <ResumeOptimizerModal
          isOpen={showOptimizerModal}
          data={optimizedData}
          onClose={() => setShowOptimizerModal(false)}
        />
      )}
    </div>
  );
}
