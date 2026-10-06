import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AuthModal({ isOpen, mode, initialRole, onClose, onAuthSuccess }) {
  const [authMode, setAuthMode] = useState(mode || 'login'); // 'login' or 'register'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole || 'student');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode) setAuthMode(mode);
    if (initialRole) setRole(initialRole);
    setErrorMsg('');
  }, [isOpen, mode, initialRole]);

  if (!isOpen) return null;

  // Real-time Name / Username validation logic (Strictly String Characters Only, NO Numbers)
  const isNameLengthValid = fullName.trim().length >= 2 && fullName.trim().length <= 50;
  const isNameNoNumbers = !/\d/.test(fullName);
  const isNameOnlyLetters = /^[a-zA-Z\s.'-]+$/.test(fullName.trim());
  const isNameValid = isNameLengthValid && isNameNoNumbers && isNameOnlyLetters;

  // Real-time Gmail validation logic
  const isGmailEnd = email.toLowerCase().endsWith('@gmail.com');
  const prefix = isGmailEnd ? email.slice(0, -10) : '';
  const isLengthValid = prefix.length >= 6 && prefix.length <= 30;
  const isCharValid = /^[a-z0-9.]+$/i.test(prefix);
  const isNotOnlyNumbers = /[a-zA-Z]/.test(prefix);
  
  const isEmailValid = isGmailEnd && isLengthValid && isCharValid && isNotOnlyNumbers;

  // Real-time Password validation logic
  const hasLength = password.length >= 8 && password.length <= 32;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]]/.test(password);
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSymbol;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        if (!isNameValid) {
          throw new Error('Full Name / Username must contain only string letters (no numbers or digits allowed).');
        }
        if (!isEmailValid) {
          throw new Error('Please ensure your Gmail matches all length and character requirements (6-30 chars, letters & numbers, @gmail.com).');
        }
        if (!isPasswordValid) {
          throw new Error('Please ensure your password satisfies all security criteria (8-32 chars, uppercase, lowercase, numbers, symbols).');
        }
        const data = await api.register({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role
        });
        localStorage.setItem('token', data.access_token);
        onAuthSuccess(data.user);
        onClose();
      } else {
        const data = await api.login({ email: email.trim().toLowerCase(), password });
        localStorage.setItem('token', data.access_token);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '490px', padding: '32px', position: 'relative', background: '#0f172a', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.4rem', cursor: 'pointer' }}>
          ✕
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#ffffff' }}>
          {authMode === 'login' ? 'Sign In to Your Account' : `Create New ${role.toUpperCase()} Account`}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '20px' }}>
          {authMode === 'login' ? 'Enter your credentials to access your portal' : 'Register to unlock AI resume scoring, ATS optimization, or candidate analytics'}
        </p>

        {errorMsg && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '20px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {authMode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
                Full Name / Username <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Enter your name (letters only, no numbers)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {fullName.length > 0 && (
                <div style={{ marginTop: '6px', padding: '8px 10px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.76rem' }}>
                  <div style={{ color: isNameOnlyLetters ? '#34d399' : '#fb7185' }}>• Must contain only alphabetical letters (a-z, A-Z)</div>
                  <div style={{ color: isNameNoNumbers ? '#34d399' : '#fb7185' }}>• Numbers are NOT allowed ({isNameNoNumbers ? 'Pass' : 'Contains Numbers!'})</div>
                </div>
              )}
            </div>
          )}


          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
              Gmail Address {authMode === 'register' && <span style={{ color: '#f43f5e' }}>*</span>}
            </label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {authMode === 'register' && email.length > 0 && (
              <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>Gmail Requirements:</div>
                <div style={{ color: isGmailEnd ? '#34d399' : '#fb7185' }}>• Must end with @gmail.com</div>
                <div style={{ color: isLengthValid ? '#34d399' : '#fb7185' }}>• Username length: 6 to 30 characters</div>
                <div style={{ color: isCharValid ? '#34d399' : '#fb7185' }}>• Allowed chars: letters, numbers, dots (.)</div>
                <div style={{ color: isNotOnlyNumbers ? '#34d399' : '#fb7185' }}>• Cannot be numbers only (must contain letters)</div>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
              Password {authMode === 'register' && <span style={{ color: '#f43f5e' }}>*</span>}
            </label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {authMode === 'register' && password.length > 0 && (
              <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>Password Security Requirements:</div>
                <div style={{ color: hasLength ? '#34d399' : '#fb7185' }}>• Length: 8 to 32 characters</div>
                <div style={{ color: (hasUpper && hasLower) ? '#34d399' : '#fb7185' }}>• Mix of uppercase & lowercase letters</div>
                <div style={{ color: (hasNumber && hasSymbol) ? '#34d399' : '#fb7185' }}>• Include at least one number & special symbol</div>
              </div>
            )}
          </div>

          {authMode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>Account Role</label>
              <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student / Job Seeker</option>
                <option value="recruiter">Recruiter / Hiring Manager</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}>
            {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Register Account')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af' }}>
          {authMode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => { setAuthMode('register'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontWeight: 600 }}>
                Register here
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button onClick={() => { setAuthMode('login'); setErrorMsg(''); }} style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontWeight: 600 }}>
                Sign in here
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
