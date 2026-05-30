import React, { useState, useEffect } from 'react';
import { Mail, Trash2, ShieldAlert, Cpu, Check, Calendar, ArrowRight, Eye, Code } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const TransponderOutbox = ({ registeredCodename, userRole }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [viewMode, setViewMode] = useState('rendered'); // 'rendered' or 'source'
  const [searchTerm, setSearchTerm] = useState('');
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/emails`);
      if (!res.ok) throw new Error('Could not synchronize email outbox feed.');
      const data = await res.json();
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (err) {
      setError(err.message || 'Connection failure with mail relay servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
    // Poll every 5 seconds to capture live transmissions in real-time
    const interval = setInterval(fetchEmails, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePurge = async () => {
    if (!window.confirm('Are you sure you want to clear the simulated email outbox cache?')) return;
    try {
      const res = await fetch(`${API_BASE}/emails/clear`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Outbox purge failed.');
      setEmails([]);
      setSelectedEmail(null);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Relay cleanup failed.');
    }
  };

  // Filter emails based on search
  const filteredEmails = emails.filter(email => 
    email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Panel */}
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem' }}>Email Outbox</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
            Live Mail Relay Feed (Dummy Real-Time Simulated Outbox)
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={fetchEmails} 
            className="theme-btn secondary" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
          >
            Sync Feed 🔄
          </button>
          
          <button 
            onClick={handlePurge} 
            className="theme-btn" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', background: 'rgba(255, 60, 0, 0.1)', borderColor: 'var(--secondary)', color: 'var(--text-light)' }}
          >
            <Trash2 size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Purge Relays
          </button>
        </div>
      </div>

      {/* Real-time Email Setup Guide Banner */}
      <div 
        className="glass-panel animate-pop-in" 
        style={{ 
          padding: '1.2rem 1.8rem', 
          background: 'rgba(0, 255, 170, 0.02)', 
          border: '1px dashed var(--primary)', 
          borderRadius: '10px', 
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          boxShadow: '0 0 15px rgba(0, 255, 170, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem' }}>
          <span>💡 Real-Time Parent Email Delivery Activation Guide</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: '1.5' }}>
          Transmissions default to the official dummy email address <strong style={{ color: 'var(--primary)' }}>test@academy.org</strong>. To receive these automated reports and scheduled consultation emails in your <strong>actual personal inbox</strong> in real-time:
        </p>
        <ol style={{ margin: '0.2rem 0 0 1.2rem', padding: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          <li>Open the <strong style={{ color: '#fff' }}>.env</strong> file in the project's root folder.</li>
          <li>Set <strong style={{ color: 'var(--accent)' }}>SMTP_EMAIL</strong> to your real Gmail address (e.g., <code>your-email@gmail.com</code>).</li>
          <li>Set <strong style={{ color: 'var(--accent)' }}>SMTP_PASSWORD</strong> to a secure 16-character <strong style={{ color: '#fff' }}>Google App Password</strong> (created in Google Account &gt; Security &gt; App Passwords).</li>
        </ol>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          *Once saved, the FastAPI server will dynamically reload and begin dispatching high-fidelity parent reports instantly!
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 60, 0, 0.1)', border: '1px solid var(--secondary)', color: 'var(--text-light)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {purgeSuccess && (
        <div style={{ background: 'rgba(0, 255, 170, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} /> All simulated outgoing emails cleared from database archives.
        </div>
      )}

      {loading && emails.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Cpu size={48} className="animate-pulse" style={{ color: 'var(--primary)', marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
          <h3 style={{ fontWeight: 'bold' }}>POLLING SECURE EMAIL BUFFERS...</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Connecting to secure network mailing relay</p>
        </div>
      ) : emails.length === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <Mail size={64} color="var(--text-muted)" style={{ opacity: 0.3, animation: 'pulse 3s infinite' }} />
          <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--text-light)' }}>
            OUTBOX ARCHIVE VACANT ✉️
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6', fontSize: '0.95rem' }}>
            No outbound transmissions have been queued. To simulate a real-time email dispatch, trigger a system event:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', maxWidth: '240px', fontSize: '0.85rem', textAlign: 'left' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚡ 1. Register Candidate</div>
              Onboard a new student to sort them. The engine automatically dispatches an AI Evaluation Report to their parent.
            </div>
            <div className="glass-panel" style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', maxWidth: '240px', fontSize: '0.85rem', textAlign: 'left' }}>
              <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '0.5rem' }}>📞 2. Book Consultation</div>
              Complete Phase 2 Aptitude Quiz, unlock Phase 3, and schedule a career consultation to trigger an invitation email.
            </div>
          </div>
        </div>
      ) : (
        /* Outbox Client Interface Split View */
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'stretch', minHeight: '650px' }}>
          
          {/* Left Column: Email Thread List */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(10,13,20,0.5)', overflowY: 'auto', maxHeight: '700px' }}>
            
            {/* Search Input */}
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cyber-input"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
            />
            
            {/* Thread List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const formattedTime = email.timestamp.replace('T', ' ').substring(0, 16);
                
                return (
                  <div 
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      setViewMode('rendered');
                    }}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--panel-border)',
                      background: isSelected ? 'rgba(0, 255, 170, 0.05)' : 'rgba(0,0,0,0.25)',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      textAlign: 'left'
                    }}
                    className={isSelected ? '' : 'course-card-premium'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontFamily: 'var(--font-tech)', fontWeight: 'bold' }}>
                      <span>TO: {email.recipient.substring(0, 20)}{email.recipient.length > 20 ? '...' : ''}</span>
                      <span>#{email.id}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.4rem', fontWeight: 'bold', lineHeight: '1.3' }}>
                      {email.subject.replace('🧪 ', '').replace('⚡ ', '')}
                    </h4>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.6rem', textAlign: 'right', fontFamily: 'var(--font-tech)' }}>
                      📅 {formattedTime}
                    </div>
                  </div>
                );
              })}
              
              {filteredEmails.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No match found for search query.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Email Viewer Frame */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {selectedEmail ? (
              <div className="glass-panel animate-pop-in" style={{ padding: '2rem', background: '#0a0d14', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, border: '1px solid var(--panel-border)' }}>
                
                {/* Email Header Info */}
                <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-tech)', background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        ENCRYPTED MAIL TUNNEL
                      </span>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-tech)', color: 'var(--text-muted)' }}>
                        ID: #{selectedEmail.id}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 'bold', marginTop: '0.6rem', lineHeight: '1.4' }}>
                      {selectedEmail.subject}
                    </h3>
                    
                    <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div><strong>From:</strong> Academy Counseling Office &lt;system@academy.org&gt;</div>
                      <div><strong>To:</strong> parent &lt;<span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedEmail.recipient}</span>&gt;</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div style={{ color: 'var(--text-muted)' }}>TIMESTAMP</div>
                    <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginTop: '4px' }}>
                      {selectedEmail.timestamp.replace('T', ' ').substring(0, 16)}
                    </div>
                    
                    {/* View Mode Tabs */}
                    <div style={{ display: 'flex', border: '1px solid var(--panel-border)', borderRadius: '6px', overflow: 'hidden', marginTop: '1rem' }}>
                      <button 
                        onClick={() => setViewMode('rendered')}
                        style={{
                          background: viewMode === 'rendered' ? 'var(--primary)' : 'transparent',
                          color: viewMode === 'rendered' ? '#000' : 'var(--text-light)',
                          border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold'
                        }}
                      >
                        <Eye size={12} /> Render
                      </button>
                      <button 
                        onClick={() => setViewMode('source')}
                        style={{
                          background: viewMode === 'source' ? 'var(--primary)' : 'transparent',
                          color: viewMode === 'source' ? '#000' : 'var(--text-light)',
                          border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold'
                        }}
                      >
                        <Code size={12} /> HTML Source
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Content sandboxed rendering area */}
                {viewMode === 'rendered' ? (
                  <div style={{ flex: 1, border: '2px solid var(--panel-border)', borderRadius: '10px', overflow: 'hidden', background: '#07090e', minHeight: '500px' }}>
                    {/* Rendered HTML inside a fully sandboxed iframe */}
                    <iframe 
                      title={`mail-rendered-${selectedEmail.id}`}
                      srcDoc={selectedEmail.body_html}
                      sandbox="allow-popups allow-popups-to-escape-sandbox"
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: '#0f0f12',
                        minHeight: '500px'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ flex: 1, border: '2px solid var(--panel-border)', borderRadius: '10px', overflow: 'hidden', background: '#07090e', position: 'relative', minHeight: '500px' }}>
                    <textarea
                      readOnly
                      value={selectedEmail.body_html}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: '#07090e',
                        color: 'var(--primary)',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        padding: '1.5rem',
                        border: 'none',
                        resize: 'none',
                        outline: 'none',
                        lineHeight: '1.5',
                        minHeight: '500px'
                      }}
                    />
                  </div>
                )}
                
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Mail size={36} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h4 style={{ color: 'var(--text-muted)' }}>Email Viewer Idle</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Select an email transmission thread from the left pane to analyze.</p>
              </div>
            )}
          </div>
          
        </div>
      )}
      
    </div>
  );
};

export default TransponderOutbox;
