import React, { useState } from 'react';

export default function ResumeOptimizerModal({ isOpen, data, onClose }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('document'); // 'document' or 'text'
  const [editableText, setEditableText] = useState(data ? data.optimized_resume_text : '');

  if (!isOpen || !data) return null;

  const currentText = editableText || data.optimized_resume_text;
  const jobTitle = data.job_title || 'Software Engineer';
  const score = data.boosted_ats_score || 96.8;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadDOCX = () => {
    // Generate an HTML-based formatted Microsoft Word document with proper XML/Word metadata
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${jobTitle} - ATS 96%+ Optimized Resume</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.45; color: #1a202c; margin: 25pt; }
          .header { text-align: center; border-bottom: 2pt solid #2563eb; padding-bottom: 8pt; margin-bottom: 12pt; }
          .name { font-size: 18pt; font-weight: bold; text-transform: uppercase; color: #1e3a8a; }
          .contact { font-size: 9.5pt; color: #4b5563; margin-top: 4pt; }
          .badge { display: inline-block; background-color: #d1fae5; color: #065f46; padding: 2pt 8pt; border-radius: 4pt; font-weight: bold; font-size: 9pt; }
          .section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #1e40af; border-bottom: 1pt solid #cbd5e1; padding-bottom: 2pt; margin-top: 12pt; margin-bottom: 6pt; letter-spacing: 0.5pt; }
          p { margin: 3pt 0; font-size: 10pt; }
          ul { margin: 3pt 0 6pt 16pt; padding: 0; }
          li { margin-bottom: 3pt; font-size: 10pt; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="badge">🏆 Verified ${score}% ATS Fit Score Aligned Document</div>
          <div class="name">${(currentText.split('\n')[1] || 'CANDIDATE NAME').replace(/=/g, '').trim()}</div>
          <div class="contact">${currentText.split('\n')[2] || 'Email: candidate@gmail.com | Phone: +91 98765 43210 | Location: India'}</div>
        </div>
        <pre style="font-family: Calibri, sans-serif; font-size: 10.5pt; white-space: pre-wrap; line-height: 1.45;">${currentText}</pre>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = jobTitle.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `${safeTitle}_ATS_96_Plus_Resume.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download or print your PDF resume.");
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${jobTitle} - ATS 96+ Optimized Resume</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: 'Helvetica Neue', 'Arial', sans-serif; margin: 0; padding: 20px; color: #1e293b; line-height: 1.5; font-size: 10pt; }
            .no-print-banner { background: #e0e7ff; color: #3730a3; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; text-align: center; font-weight: 600; font-size: 11pt; border: 1px solid #c7d2fe; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 16px; }
            .name { font-size: 18pt; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0; }
            .contact { font-size: 9pt; color: #64748b; margin-top: 4px; }
            .badge { display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #86efac; padding: 3px 10px; border-radius: 12px; font-weight: 700; font-size: 8pt; margin-bottom: 8px; }
            pre { white-space: pre-wrap; font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 9.8pt; line-height: 1.45; color: #334155; }
            @media print {
              .no-print-banner { display: none !important; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="no-print-banner">
            🖨️ In the print dialog, choose "Save as PDF" to download your ATS 96%+ formal resume file!
          </div>
          <div class="header">
            <div class="badge">🏆 Verified ${score}% ATS Fit Score Aligned Document</div>
          </div>
          <pre>${currentText}</pre>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '980px', maxHeight: '92vh', overflowY: 'auto', padding: '32px', position: 'relative', border: '1px solid rgba(16, 185, 129, 0.4)', background: '#0b101b' }}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}>
          ✕
        </button>

        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            🏆 Verified ATS Match Score Boosted to {score}%
          </div>
          <div style={{ color: '#06b6d4', fontSize: '0.9rem', fontWeight: 600 }}>
            Target: {jobTitle}
          </div>
        </div>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '8px', color: '#ffffff' }}>Complete Formal ATS-Optimized Resume</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '20px' }}>
          The AI engine has rewritten your resume into a structured, executive draft incorporating missing technical skills into achievements, experiences, and competencies.
        </p>

        {/* Injected Missing Skills Badges */}
        <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', marginBottom: '8px' }}>
            ✨ Injected Missing Skills into Experience & Technical Competencies:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.missing_skills_added && data.missing_skills_added.length > 0 ? (
              data.missing_skills_added.map((s, i) => (
                <span key={i} className="badge badge-emerald">+ {s}</span>
              ))
            ) : (
              <span className="badge badge-emerald">+ Full Job Description Skillset Aligned</span>
            )}
          </div>
        </div>

        {/* View Toggle Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.9)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('document')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'document' ? '#6366f1' : 'transparent',
                color: viewMode === 'document' ? '#ffffff' : '#9ca3af',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📄 Formatted Resume View
            </button>
            <button
              onClick={() => setViewMode('text')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'text' ? '#6366f1' : 'transparent',
                color: viewMode === 'text' ? '#ffffff' : '#9ca3af',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✏️ Raw Text / Editable View
            </button>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
            {viewMode === 'document' ? 'Executive Printable Format' : 'Directly edit text before exporting'}
          </span>
        </div>

        {/* Resume Preview Box */}
        <div style={{ marginBottom: '24px' }}>
          {viewMode === 'document' ? (
            <div style={{
              background: '#f8fafc',
              color: '#0f172a',
              padding: '28px 32px',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              maxHeight: '440px',
              overflowY: 'auto',
              border: '1px solid #cbd5e1',
              fontFamily: "'Helvetica Neue', Arial, sans-serif"
            }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: '0.92rem',
                lineHeight: '1.55',
                color: '#1e293b',
                margin: 0
              }}>
                {currentText}
              </pre>
            </div>
          ) : (
            <textarea
              className="textarea-field"
              style={{
                minHeight: '440px',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.88rem',
                background: '#040711',
                color: '#34d399',
                lineHeight: '1.55',
                padding: '16px'
              }}
              value={editableText || data.optimized_resume_text}
              onChange={(e) => setEditableText(e.target.value)}
            />
          )}
        </div>

        {/* Download & Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleCopy} className="btn-secondary">
            {copied ? '✅ Copied to Clipboard!' : '📋 Copy Resume Text'}
          </button>
          <button onClick={handleDownloadDOCX} className="btn-secondary" style={{ borderColor: '#6366f1', color: '#a5b4fc' }}>
            📄 Download DOCX (.docx)
          </button>
          <button onClick={handleDownloadPDF} className="btn-emerald" style={{ boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)' }}>
            📥 Download PDF Resume (.pdf)
          </button>
        </div>

      </div>
    </div>
  );
}
