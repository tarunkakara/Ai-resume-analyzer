import React from 'react';

export default function Navbar({ currentUser, onOpenAuth, onLogout }) {
  const currentRole = currentUser?.role;

  return (
    <header className="glass-header">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', lineHeight: '1.2' }}>
              Data Mavericks <span style={{ color: '#06b6d4', fontSize: '0.9rem', fontWeight: 600, marginLeft: '6px' }}>AI Scorer</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Codegnan Hackathon Edition</p>
          </div>
        </div>

        {/* Center: Shows ONLY the current user's dedicated portal indicator */}
        <div>
          {currentUser ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '24px',
              background: currentRole === 'admin' ? 'rgba(244, 63, 94, 0.18)' : currentRole === 'recruiter' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(99, 102, 241, 0.2)',
              border: `1px solid ${currentRole === 'admin' ? 'rgba(244, 63, 94, 0.4)' : currentRole === 'recruiter' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
              color: currentRole === 'admin' ? '#fda4af' : currentRole === 'recruiter' ? '#67e8f9' : '#a5b4fc',
              fontWeight: 700,
              fontSize: '0.92rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              {currentRole === 'student' && '🎓 Student & Job Seeker Portal'}
              {currentRole === 'recruiter' && '💼 Recruiter Command Portal'}
              {currentRole === 'admin' && '🛡️ System Administrator Workspace'}
            </div>
          ) : (
            <div style={{ color: '#9ca3af', fontSize: '0.88rem', fontWeight: 500 }}>
              AI-Based Resume Analyzer & Job-Fit Scorer
            </div>
          )}
        </div>

        {/* User Account / Auth Actions */}
        <div>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>{currentUser.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: currentRole === 'admin' ? '#fb7185' : currentRole === 'recruiter' ? '#38bdf8' : '#34d399', textTransform: 'capitalize', fontWeight: 600 }}>
                  ● {currentUser.role} Account Logged In
                </div>
              </div>
              <button onClick={onLogout} className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onOpenAuth('login')} className="btn-secondary">
                Sign In
              </button>
              <button onClick={() => onOpenAuth('register')} className="btn-primary">
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


