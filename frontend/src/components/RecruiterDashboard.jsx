import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function RecruiterDashboard({ currentUser }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJdId, setSelectedJdId] = useState('');
  
  const [rankings, setRankings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // New Job Modal state
  const [showCreateJd, setShowCreateJd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newMinExp, setNewMinExp] = useState('1-3 years');
  const [newRawText, setNewRawText] = useState('');

  const [bulkFiles, setBulkFiles] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJdId) {
      loadRankingsAndAnalytics(selectedJdId);
    }
  }, [selectedJdId]);

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
      if (data.length > 0) {
        setSelectedJdId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRankingsAndAnalytics = async (jdId) => {
    setLoading(true);
    try {
      const [rankData, analData] = await Promise.all([
        api.getCandidateRankings(jdId),
        api.getBatchAnalytics(jdId)
      ]);
      setRankings(rankData);
      setAnalytics(analData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJd = async (e) => {
    e.preventDefault();
    try {
      const newJd = await api.createJob({
        title: newTitle,
        department: newDepartment,
        min_experience: newMinExp,
        raw_text: newRawText
      });
      setShowCreateJd(false);
      setNewTitle('');
      setNewRawText('');
      fetchJobs();
      setSelectedJdId(newJd.id);
    } catch (err) {
      alert(err.message || "Failed to create Job Description");
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFiles || bulkFiles.length === 0) {
      alert("Please select one or more candidate resumes to bulk upload.");
      return;
    }
    setUploading(true);
    setMsg('');
    try {
      const res = await api.bulkUploadResumes(selectedJdId, Array.from(bulkFiles));
      setMsg(res.message);
      setBulkFiles([]);
      loadRankingsAndAnalytics(selectedJdId);
    } catch (err) {
      alert(err.message || "Bulk upload failed");
    } finally {
      setUploading(false);
    }
  };

  const selectedJdObj = jobs.find(j => j.id === Number(selectedJdId));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
              💼 Recruiter Candidate Ranking & Triage Portal
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Recruiter Command Center</h2>
            <p style={{ color: '#9ca3af', maxWidth: '650px', fontSize: '0.95rem' }}>
              Bulk upload multiple applicant resumes for a target role, compute automated fit scores, triage candidate rankings, and analyze batch skill shortages.
            </p>
          </div>

          <button onClick={() => setShowCreateJd(true)} className="btn-primary">
            + Post New Job Role
          </button>
        </div>
      </div>

      {/* Role Selection & Bulk Upload Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>🎯 Target Job Description</h3>
          <select
            className="input-field"
            value={selectedJdId}
            onChange={(e) => setSelectedJdId(e.target.value)}
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title} ({j.department})</option>
            ))}
          </select>

          {selectedJdObj && (
            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#9ca3af' }}>
              <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Extracted Key Requirements:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedJdObj.required_skills.map((s, i) => (
                  <span key={i} className="badge badge-indigo">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>📤 Bulk Upload Resumes</h3>
          <form onSubmit={handleBulkUpload} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={(e) => setBulkFiles(e.target.files)}
              className="input-field"
            />
            <button type="submit" disabled={uploading} className="btn-emerald" style={{ justifyContent: 'center' }}>
              {uploading ? 'Processing & Scoring Resumes...' : '🚀 Process & Rank Candidates'}
            </button>
          </form>
          {msg && <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#34d399' }}>{msg}</div>}
        </div>
      </div>

      {/* Batch Analytics Stats Bar */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>TOTAL APPLICANTS</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{analytics.total_candidates}</div>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>AVERAGE FIT SCORE</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', marginTop: '4px' }}>{analytics.average_fit_score}%</div>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>HIGH FIT MATCHES (≥80%)</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{analytics.score_distribution.high}</div>
          </div>
          <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>TOP MISSING SKILL BATCH</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fb7185', marginTop: '8px' }}>
              {analytics.most_common_missing_skills[0]?.skill || 'None'}
            </div>
          </div>
        </div>
      )}

      {/* Candidate Leaderboard Table */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏆</span> Candidate Leaderboard & Application Rankings
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading ranked candidates...</div>
        ) : rankings.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Rank</th>
                  <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                  <th style={{ padding: '12px 16px' }}>Filename</th>
                  <th style={{ padding: '12px 16px' }}>ATS Fit Score</th>
                  <th style={{ padding: '12px 16px' }}>Matched Skills</th>
                  <th style={{ padding: '12px 16px' }}>Missing Skill Gaps</th>
                  <th style={{ padding: '12px 16px' }}>Date Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((c, idx) => (
                  <tr key={c.analysis_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx === 0 ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>#{idx + 1}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>
                      {c.candidate_name}
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#a5b4fc' }}>{c.filename}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${c.overall_fit_score >= 80 ? 'badge-emerald' : c.overall_fit_score >= 60 ? 'badge-indigo' : 'badge-rose'}`}>
                        {c.overall_fit_score}% Fit
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {c.matched_skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {c.missing_skills.slice(0, 4).map((s, i) => (
                          <span key={i} className="badge badge-rose" style={{ fontSize: '0.72rem' }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '0.8rem' }}>{c.uploaded_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No applicants processed for this job description yet. Use the bulk uploader above to evaluate candidate resumes!
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateJd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '540px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowCreateJd(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}>
              ✕
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Post New Job Description</h3>
            <form onSubmit={handleCreateJd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>Job Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Lead Machine Learning Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>Department</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Artificial Intelligence"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>Full Job Requirements & Responsibilities</label>
                <textarea
                  required
                  className="textarea-field"
                  placeholder="Paste job description requirements, skills, and qualifications..."
                  value={newRawText}
                  onChange={(e) => setNewRawText(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                Save Job Description
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
