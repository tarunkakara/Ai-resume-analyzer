import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function AdminDashboard({ currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Admin Banner */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px' }}>
              🛡️ System Administration & Metrics
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Admin Analytics Dashboard</h2>
            <p style={{ color: '#9ca3af', maxWidth: '650px', fontSize: '0.95rem' }}>
              Monitor system utilization, track total parsed resumes, evaluate average platform fit scores, and manage registered accounts.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading platform stats...</div>
      ) : stats ? (
        <>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>TOTAL REGISTERED USERS</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>{stats.total_users}</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>TOTAL RESUMES PARSED</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#06b6d4', marginTop: '6px' }}>{stats.total_resumes}</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>TOTAL ANALYSES RUN</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#6366f1', marginTop: '6px' }}>{stats.total_analyses}</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>AVG SYSTEM FIT SCORE</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#34d399', marginTop: '6px' }}>{stats.average_fit_score}%</div>
            </div>
          </div>

          {/* User Account Registry Table */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>👥 User Account Log & Role Registrations</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>User ID</th>
                    <th style={{ padding: '12px 16px' }}>Full Name</th>
                    <th style={{ padding: '12px 16px' }}>Gmail Address</th>
                    <th style={{ padding: '12px 16px' }}>System Role</th>
                    <th style={{ padding: '12px 16px' }}>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#9ca3af' }}>#{u.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>{u.full_name}</td>
                      <td style={{ padding: '14px 16px', color: '#06b6d4' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-rose' : u.role === 'recruiter' ? 'badge-indigo' : 'badge-emerald'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#9ca3af' }}>{u.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
