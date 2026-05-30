import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, Award, FileText, CalendarRange, ArrowRight, Zap, CheckCircle, Database } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const MerchUnlock = ({ registeredCodename, userRole, setActiveTab }) => {
  const [codenameSearch, setCodenameSearch] = useState(registeredCodename || '');
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin candidates lists and editing states
  const [studentsList, setStudentsList] = useState([]);
  const [selectedAdminStudent, setSelectedAdminStudent] = useState(null);
  const [vaultNotesInput, setVaultNotesInput] = useState('');
  const [adminSaveSuccess, setAdminSaveSuccess] = useState('');
  const [adminSaveError, setAdminSaveError] = useState('');
  const [supportMessages, setSupportMessages] = useState([]);
  const [activeAdminSubTab, setActiveAdminSubTab] = useState('bookings'); // 'bookings' or 'messages'

  // Appointment Scheduler Booking States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('2026-06-01');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [bookingCompleted, setBookingCompleted] = useState(false);

  // Fetch registered candidates list on mount if Admin
  useEffect(() => {
    if (userRole === 'admin') {
      setLoading(true);
      fetch(`${API_BASE}/phase1/students`)
        .then(res => res.json())
        .then(data => {
          setStudentsList(data);
          if (data.length > 0) {
            setSelectedAdminStudent(data[0]);
            handleUnlock(data[0].codename);
          }
          setLoading(false);
        })
        .catch(err => {
          setErrorMsg('Failed to load candidate directories.');
          setLoading(false);
        });
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'admin') {
      const fetchSupportMessages = async () => {
        try {
          const res = await fetch(`${API_BASE}/support/messages`);
          if (res.ok) {
            const data = await res.json();
            setSupportMessages(data);
          }
        } catch (err) {
          console.error('Failed to sync helpdesk messages:', err);
        }
      };
      fetchSupportMessages();
      const interval = setInterval(fetchSupportMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  // Auto-fetch if student is authenticated
  useEffect(() => {
    if (userRole === 'student' && registeredCodename) {
      setCodenameSearch(registeredCodename);
      handleUnlock(registeredCodename);
    }
  }, [userRole, registeredCodename]);

  // Prefill scheduling fields from database record once vaultData is resolved
  useEffect(() => {
    if (vaultData) {
      setParentName(vaultData.parent_name || '');
      setParentEmail(vaultData.parent_email || '');
      
      const rawDate = vaultData.booking_date || '2026-06-01';
      setBookingDate(rawDate.includes('-') ? rawDate : '2026-06-01');
      
      const rawTime = vaultData.booking_time || '10:00';
      setBookingTime(rawTime.includes(':') ? rawTime : '10:00');
      
      if (vaultData.parent_name && vaultData.parent_email) {
        setBookingCompleted(true);
      } else {
        setBookingCompleted(false);
      }
    }
  }, [vaultData]);

  const handleUnlock = async (overrideCodename) => {
    const targetCodename = overrideCodename || codenameSearch;
    if (!targetCodename.trim()) {
      setErrorMsg('Candidate Codename is required to access the vault archives.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setVaultData(null);

    try {
      const response = await fetch(`${API_BASE}/phase3/vault/${targetCodename}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Access denied. Candidates must be sorted before entering.');
      }

      setVaultData(data);
      setVaultNotesInput(data.vault_notes || '');
    } catch (err) {
      setErrorMsg(err.message || 'Vault connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminStudentSelect = (e) => {
    const codename = e.target.value;
    const stuObj = studentsList.find(s => s.codename === codename);
    if (stuObj) {
      setSelectedAdminStudent(stuObj);
      handleUnlock(codename);
      setAdminSaveSuccess('');
      setAdminSaveError('');
    }
  };

  const handleSaveVaultNotes = async () => {
    if (!selectedAdminStudent) return;
    setLoading(true);
    setAdminSaveSuccess('');
    setAdminSaveError('');

    try {
      const res = await fetch(`${API_BASE}/phase3/vault/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codename: selectedAdminStudent.codename,
          vault_notes: vaultNotesInput
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to synchronize directives.');
      }

      setAdminSaveSuccess(`Secret Vault Notes for ${selectedAdminStudent.codename.toUpperCase()} synchronized successfully!`);
      setVaultData(prev => prev ? { ...prev, vault_notes: vaultNotesInput } : null);
    } catch (err) {
      setAdminSaveError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const getTalentProfile = (logic, creativity, leadership, grit) => {
    const maxVal = Math.max(logic, creativity, leadership, grit);
    if (maxVal === logic) {
      return {
        title: "The Analytical Architect",
        strength: "Technical Precision (Complex algorithms, software debugging, and logic optimization).",
        weakness: "Delegation and team coordination. Practice delegating operational roles.",
        desc: "Your cognitive flow processes tactical equations rapidly. Your profile bridges mathematical stability with elite programmatic execution."
      };
    } else if (maxVal === creativity) {
      return {
        title: "The Concept Innovator",
        strength: "Concept Synthesis (Abstract storytelling, design branding, and strategic pivots).",
        weakness: "Mathematical Calibration. Ensure structural optimizations are validated.",
        desc: "You thrive in abstract aesthetic configurations. Your profile unlocks game-changing visual branding and revolutionary design models."
      };
    } else if (maxVal === leadership) {
      return {
        title: "The Operations Commander",
        strength: "Crisis Logistics & Command (Organizational alignments, strategic negotiations, and tactical leadership).",
        weakness: "Individual Creative Sparks. Allow auxiliary agents to pioneer aesthetic liberties under your supervision.",
        desc: "You are a natural structural anchor. Your profile dictates crisis stability and organizational leadership."
      };
    } else {
      return {
        title: "The Cohesion Anchor",
        strength: "Team Cohesion (Team emotional anchoring, resilience, and support diagnostics).",
        weakness: "Calculated Operations. Work on setting objective logical KPIs.",
        desc: "Your strength lies in resilience. Your profile anchors team motivation and client consultations."
      };
    }
  };

  const handleDownloadManifesto = () => {
    if (!vaultData) return;
    
    const { full_name, codename, stream, allocated_department, logic, creativity, leadership, grit, counseling_summary, vault_notes } = vaultData;
    
    const safeFullName = full_name || "Unknown Candidate";
    const safeCodename = codename || "unknown";
    const safeStream = stream || "Not Specified";
    const safeDept = allocated_department || "Not Allocated";
    const safeSummary = (counseling_summary || "No official career assessment digest compiled in the archives.").replace(/`/g, "\\`").replace(/\$/g, "\\$");
    const safeNotes = (vault_notes || "No supplementary directives recorded in candidate record.").replace(/`/g, "\\`").replace(/\$/g, "\\$");
    
    const lVal = logic || 0;
    const cVal = creativity || 0;
    const leVal = leadership || 0;
    const gVal = grit || 0;
    
    const talentInfo = getTalentProfile(lVal, cVal, leVal, gVal);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Academy_Career_Report_${safeCodename}</title>
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { background: #fff !important; color: #000 !important; }
              .cyber-container { border: 2px solid #000 !important; }
            }
            body {
              background: #080a0f;
              color: #e2e8f0;
              font-family: 'Space Grotesk', sans-serif;
              padding: 2rem;
              margin: 0;
            }
            .cyber-container {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #00ffaa;
              border-radius: 16px;
              padding: 3rem;
              background: radial-gradient(circle at 10% 20%, #0d1220 0%, #080a0f 90%);
              box-shadow: 0 0 30px rgba(0, 255, 170, 0.1);
              position: relative;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #1f2e4d;
              padding-bottom: 2rem;
              margin-bottom: 2rem;
            }
            .logo {
              font-family: 'Orbitron', sans-serif;
              font-size: 2rem;
              font-weight: bold;
              color: #00ffaa;
              text-shadow: 0 0 10px rgba(0, 255, 170, 0.4);
              letter-spacing: 3px;
            }
            .sub-logo {
              font-family: 'Orbitron', sans-serif;
              font-size: 0.9rem;
              color: #8a99ad;
              letter-spacing: 2px;
              margin-top: 5px;
            }
            .sec-seal {
              display: inline-block;
              border: 1px solid #ff3c00;
              color: #ff3c00;
              padding: 0.25rem 1rem;
              font-size: 0.75rem;
              font-family: 'Orbitron', sans-serif;
              letter-spacing: 2px;
              margin-top: 10px;
              text-transform: uppercase;
              font-weight: bold;
            }
            .dossier-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1.5rem;
              margin-bottom: 2.5rem;
              font-size: 0.95rem;
            }
            .dossier-item span {
              color: #8a99ad;
              display: block;
              margin-bottom: 4px;
            }
            .dossier-item strong {
              color: #fff;
              font-size: 1.1rem;
            }
            .score-card {
              border: 1px solid #1f2e4d;
              border-radius: 8px;
              padding: 1.5rem;
              background: rgba(0,0,0,0.3);
              margin-bottom: 2.5rem;
            }
            .score-title {
              font-family: 'Orbitron', sans-serif;
              color: #00ffaa;
              font-size: 1.1rem;
              margin-bottom: 1.25rem;
              letter-spacing: 1px;
            }
            .score-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 1rem;
              text-align: center;
            }
            .score-bar {
              background: rgba(255,255,255,0.05);
              border: 1px solid #1f2e4d;
              border-radius: 4px;
              height: 120px;
              position: relative;
              margin: 10px 0;
              display: flex;
              align-items: flex-end;
              justify-content: center;
              overflow: hidden;
            }
            .score-fill {
              width: 100%;
              border-radius: 2px 2px 0 0;
            }
            .score-label {
              font-size: 0.8rem;
              color: #8a99ad;
              font-weight: bold;
            }
            .score-value {
              font-size: 1rem;
              font-weight: bold;
              color: #fff;
            }
            .section {
              margin-bottom: 2.5rem;
            }
            .section-title {
              font-family: 'Orbitron', sans-serif;
              color: #00ffaa;
              font-size: 1.25rem;
              border-bottom: 1px solid #1f2e4d;
              padding-bottom: 0.5rem;
              margin-bottom: 1rem;
              letter-spacing: 1px;
            }
            .text-block {
              line-height: 1.7;
              color: #e2e8f0;
              font-size: 0.95rem;
            }
            .highlight-block {
              border-left: 3px solid #00bfff;
              background: rgba(0, 191, 255, 0.02);
              padding: 1.25rem;
              border-radius: 0 8px 8px 0;
              margin-top: 1rem;
            }
            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
              margin-top: 4rem;
              text-align: center;
              font-size: 0.85rem;
              color: #8a99ad;
            }
            .sig-line {
              border-top: 1px dashed #1f2e4d;
              padding-top: 0.75rem;
              font-family: 'Orbitron', sans-serif;
              font-weight: bold;
              color: #e2e8f0;
            }
            .motto {
              text-align: center;
              font-family: 'Orbitron', sans-serif;
              font-size: 1.5rem;
              font-weight: 900;
              color: #ff3c00;
              margin-top: 3rem;
              letter-spacing: 3px;
              text-shadow: 0 0 10px rgba(255, 60, 0, 0.3);
            }
          </style>
        </head>
        <body>
          <div class="cyber-container">
            <div class="header">
              <div class="logo">ACADEMY</div>
              <div class="sub-logo">OFFICIAL TALENT & CAREER CALIBRATION REPORT</div>
              <div class="sec-seal">SECURITY GRANT: DECRYPTED // STUDENT ID: ${safeCodename.toUpperCase()}</div>
            </div>
            
            <div class="dossier-grid">
              <div class="dossier-item">
                <span>CANDIDATE FULL NAME</span>
                <strong>${safeFullName}</strong>
              </div>
              <div class="dossier-item">
                <span>ACADEMIC FOCUS STREAM</span>
                <strong>${safeStream}</strong>
              </div>
              <div class="dossier-item">
                <span>ALLOCATED STRATEGIC DEPARTMENT</span>
                <strong>${safeDept}</strong>
              </div>
              <div class="dossier-item">
                <span>APTITUDE OVERALL QUOTIENT</span>
                <strong>${vaultData.assessment_completion}</strong>
              </div>
            </div>
            
            <div class="score-card">
              <div class="score-title">CALIBRATED COGNITIVE VECTORS</div>
              <div class="score-grid">
                <div>
                  <span class="score-value">${lVal}%</span>
                  <div class="score-bar">
                    <div class="score-fill" style="height: ${lVal}%; background: linear-gradient(180deg, #00bfff 0%, #0055ff 100%);"></div>
                  </div>
                  <span class="score-label">LOGIC</span>
                </div>
                <div>
                  <span class="score-value">${cVal}%</span>
                  <div class="score-bar">
                    <div class="score-fill" style="height: ${cVal}%; background: linear-gradient(180deg, #ff007f 0%, #aa00ff 100%);"></div>
                  </div>
                  <span class="score-label">CREATIVE</span>
                </div>
                <div>
                  <span class="score-value">${leVal}%</span>
                  <div class="score-bar">
                    <div class="score-fill" style="height: ${leVal}%; background: linear-gradient(180deg, #ff3c00 0%, #ff7700 100%);"></div>
                  </div>
                  <span class="score-label">LEADER</span>
                </div>
                <div>
                  <span class="score-value">${gVal}%</span>
                  <div class="score-bar">
                    <div class="score-fill" style="height: ${gVal}%; background: linear-gradient(180deg, #00ffaa 0%, #00b377 100%);"></div>
                  </div>
                  <span class="score-label">GRIT</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">TALENT CLASSIFICATION REPORT</div>
              <div class="text-block">
                <strong>Profile Title:</strong> ${talentInfo.title}<br><br>
                <em>"${talentInfo.desc}"</em>
                <div class="highlight-block">
                  <strong>Elite Vector Strength:</strong> ${talentInfo.strength}<br><br>
                  <strong>Strategic Development Sector:</strong> ${talentInfo.weakness}
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">CHIEF AGENT CAREER ASSESSMENT DIGEST</div>
              <div class="text-block" style="text-align: justify; font-style: italic;">
                "${safeSummary}"
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">ACADEMY COMMANDMENTS & SECRETS</div>
              <div class="text-block" style="white-space: pre-wrap; font-style: italic;">
                "${safeNotes}"
              </div>
            </div>
            
            <div class="signatures">
              <div>
                <div style="height: 50px;"></div>
                <div class="sig-line">ALL MIGHT</div>
                <span>Chief Counselor</span>
              </div>
              <div>
                <div style="height: 50px;"></div>
                <div class="sig-line">PRINCIPAL NEZU</div>
                <span>Academy Superintendent</span>
              </div>
            </div>
            
            <div class="motto">ONWARDS!</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!parentName.trim() || !parentEmail.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      const response = await fetch(`${API_BASE}/phase3/vault/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codename: vaultData.codename,
          parent_name: parentName,
          parent_email: parentEmail,
          booking_date: bookingDate,
          booking_time: bookingTime
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to persist booking slot.');
      }
      
      setBookingCompleted(true);
      setVaultData(prev => prev ? {
        ...prev,
        parent_name: parentName,
        parent_email: parentEmail,
        booking_date: bookingDate,
        booking_time: bookingTime
      } : null);
    } catch (err) {
      setErrorMsg(err.message || 'Booking synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
  };

  const getScoreNumber = (scoreStr) => {
    if (!scoreStr) return 0;
    return parseInt(scoreStr.replace('%', ''));
  };

  const scoreNumber = vaultData ? getScoreNumber(vaultData.assessment_completion) : 0;

  return (
    <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>Student Archive</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
            {userRole === 'admin' ? 'Administrative Student Records and Assessment Archive' : 'Access Your Professional Assessment Records'}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ==========================================
         STUDENT LOCKED STATE: LINKED TO PHASE 2 SCORE
         ========================================== */}
      {userRole === 'student' && scoreNumber === 0 && (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', background: '#ffffff' }}>
          <Lock size={64} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
            RECORDS PENDING
          </h3>
          
          <p style={{ color: 'var(--text-muted)', maxWidth: '550px', lineHeight: '1.6' }}>
            Student <strong style={{ color: 'var(--text-main)' }}>{registeredCodename?.toUpperCase()}</strong>, your assessment coordinates are not yet calibrated!
          </p>

          <div className="glass-panel" style={{ padding: '1.2rem', background: '#f8fafc', border: '1px solid var(--panel-border)', maxWidth: '500px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              ⚠️ You must complete your assessment in <strong>The Aptitude Assessment</strong> section to unlock your records and personalized directives!
            </p>
          </div>

          <button 
            onClick={() => setActiveTab('courses')}
            className="theme-btn" 
            style={{ padding: '1rem 3rem', marginTop: '1rem' }}
          >
            Go to Assessment
          </button>
        </div>
      )}

      {/* ==========================================
         STUDENT UNLOCKED REWARDS & NOTES VIEW
         ========================================== */}
      {userRole === 'student' && scoreNumber > 0 && vaultData && (
        <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* SECURITY DECRYPTION SUCCESS BANNER */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', textAlign: 'left', background: '#ffffff' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', letterSpacing: '2px', fontWeight: 'bold' }}>
                ACCESS GRANTED
              </div>
              <h3 style={{ fontSize: '2.2rem', color: 'var(--text-main)', marginTop: '0.5rem', letterSpacing: '2px' }}>
                {vaultData.codename.toUpperCase()}'s RECORDS
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                Allocated Track: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{vaultData.allocated_department}</span>
              </p>
            </div>
            
            <div className="glass-panel" style={{ padding: '1rem 2rem', background: '#f8fafc', border: '1px solid var(--panel-border)', textAlign: 'center', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                CALIBRATED APTITUDE LEVEL
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.2rem' }}>
                {vaultData.assessment_completion}
              </div>
            </div>
          </div>

          {/* DYNAMIC COUNSELOR SECRETS / DIRECTIVES PANEL */}
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <Award size={22} color="var(--primary)" /> Counselor Assessment Notes
            </h3>
            {vaultData.vault_notes && vaultData.vault_notes.trim() ? (
              <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                "{vaultData.vault_notes}"
              </p>
            ) : (
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', fontStyle: 'italic' }}>
                "The counselors are currently analyzing your aptitude matrix results and preparing your personalized directives. Check back soon!"
              </p>
            )}
          </div>

          {/* PERKS CARDS LIST */}
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
              Records & Resources
            </h3>

            <div className="grid-container" style={{ margin: 0 }}>
              
              {/* PERK 1: CAREER MANIFESTO */}
              <div 
                className={`glass-panel`}
                style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s', background: '#ffffff' }}
              >
                <div style={{ 
                  height: '120px', 
                  background: scoreNumber > 0 ? '#f0fdf4' : '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--panel-border)'
                }}>
                  {scoreNumber > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <Unlock size={44} color="#10b981" />
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', letterSpacing: '1px' }}>AVAILABLE</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={44} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>LOCKED (ASSESSMENT REQUIRED)</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Career Analysis Report
                  </h3>
                  <span style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#eff6ff', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                    OFFICIAL DOCUMENT
                  </span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>
                    Contains the comprehensive PDF analysis mapping your competencies directly to professional leadership sectors.
                  </p>
                  
                  {scoreNumber > 0 ? (
                    <button 
                      onClick={handleDownloadManifesto}
                      className="theme-btn" 
                      style={{ width: '100%', padding: '0.8rem' }}
                    >
                      Download Report PDF
                    </button>
                  ) : (
                    <div style={{ 
                      background: '#f8fafc', border: '1px solid var(--panel-border)',
                      padding: '0.8rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)'
                    }}>
                      🔒 LOCKED (Complete Assessment)
                    </div>
                  )}
                </div>
              </div>

              {/* PERK 2: PREMIUM PARENT CONSULTATION */}
              <div 
                className={`glass-panel`}
                style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'all 0.3s', background: '#ffffff', borderColor: scoreNumber > 0 ? 'var(--primary)' : 'var(--panel-border)' }}
              >
                <div style={{ 
                  height: '120px', 
                  background: scoreNumber > 0 ? '#eff6ff' : '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--panel-border)'
                }}>
                  {scoreNumber > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={44} color="var(--primary)" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px' }}>
                        {vaultData.parent_name ? 'BOOKING ACTIVE' : 'AVAILABLE'}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={44} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>LOCKED (ASSESSMENT REQUIRED)</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Counseling Appointment
                  </h3>
                  <span style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#eff6ff', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                    PARENT ACCESS
                  </span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>
                    {vaultData.parent_name 
                      ? `Your consultation slot is confirmed on ${vaultData.booking_date} at ${vaultData.booking_time} for Parent/Guardian ${vaultData.parent_name}.` 
                      : 'Assessment completion unlocks a complimentary consultation call with our career counseling team.'}
                  </p>
                  
                  {scoreNumber > 0 ? (
                    <button 
                      onClick={() => setIsBookingOpen(true)}
                      className="theme-btn secondary" 
                      style={{ width: '100%', padding: '0.8rem' }}
                    >
                      {vaultData.parent_name ? 'Manage Appointment' : 'Schedule Appointment'}
                    </button>
                  ) : (
                    <div style={{ 
                      background: '#f8fafc', border: '1px solid var(--panel-border)',
                      padding: '0.8rem', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)'
                    }}>
                      🔒 LOCKED (Complete Assessment)
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ==========================================
         ADMIN VIEW: CUSTOM VAULT PAYLOAD COMMAND
         ========================================== */}
      {userRole === 'admin' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Selector & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Candidates selector dropdown */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                SELECT ACTIVE CANDIDATE RECORD
              </label>
              <select 
                onChange={handleAdminStudentSelect} 
                className="cyber-input"
                style={{ cursor: 'pointer' }}
                value={selectedAdminStudent?.codename || ''}
              >
                {studentsList.map((stu) => (
                  <option key={stu.codename} value={stu.codename}>
                    {stu.codename.toUpperCase()} ({stu.full_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected student status card */}
            {selectedAdminStudent && vaultData ? (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', background: '#ffffff' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', letterSpacing: '2px', fontWeight: 'bold' }}>
                  // STUDENT RECORD ANALYSIS
                </div>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.75rem' }}>
                  {selectedAdminStudent.full_name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Student ID: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{selectedAdminStudent.codename.toUpperCase()}</span>
                </p>

                <div style={{ margin: '1.5rem 0', height: '1px', borderBottom: '1px solid var(--panel-border)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Department:</span>
                    <p style={{ color: 'var(--text-main)', fontWeight: 'bold', marginTop: '0.1rem' }}>{vaultData.allocated_department}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Aptitude Calibration Progress:</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      <span>Progress Quotient</span>
                      <span>{vaultData.assessment_completion}</span>
                    </div>
                    <div className="progress-bar-container" style={{ height: '10px', marginTop: '0.25rem' }}>
                      <div className="progress-bar-fill" style={{ width: `${scoreNumber}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Active booking panel inside admin view */}
                {vaultData.parent_name ? (
                  <div className="glass-panel" style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid var(--primary)', borderRadius: '8px', marginTop: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <CalendarRange size={14} /> ACTIVE CONSULTATION APPOINTMENT
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      <strong>Guardian:</strong> {vaultData.parent_name}<br />
                      <strong>Email:</strong> {vaultData.parent_email}<br />
                      <strong>Slot:</strong> {vaultData.booking_date} at {vaultData.booking_time}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel" style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--panel-border)', borderRadius: '8px', marginTop: '1.5rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No consultation appointment scheduled
                    </span>
                  </div>
                )}

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                    AVAILABLE RESOURCES
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: scoreNumber > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {scoreNumber > 0 ? <Unlock size={14} /> : <Lock size={14} />} Career Analysis PDF (Assessment Completed)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: scoreNumber > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {scoreNumber > 0 ? <Unlock size={14} /> : <Lock size={14} />} Counseling Consultation (Assessment Completed)
                    </div>
                  </div>
                  {scoreNumber > 0 && (
                    <button 
                      onClick={handleDownloadManifesto}
                      className="theme-btn"
                      style={{ width: '100%', padding: '0.8rem' }}
                    >
                      Download Student PDF Report 📥
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <Database size={32} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h4 style={{ color: 'var(--text-muted)' }}>Record Loader Standing By</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Select a student record to query metrics.</p>
              </div>
            )}

          </div>

          {/* Right Column: Counselor Directives Editor Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {selectedAdminStudent ? (
              <div className="glass-panel animate-pop-in" style={{ padding: '2.5rem', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
                  <Database size={20} /> Counselor Assessment Notes
                </h3>

                {adminSaveSuccess && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#10b981', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> {adminSaveSuccess}
                  </div>
                )}

                {adminSaveError && (
                  <div style={{ background: '#fee2e2', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    ⚠️ {adminSaveError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ADD CUSTOM NOTES & DIRECTIVES
                  </label>
                  <textarea 
                    value={vaultNotesInput}
                    onChange={(e) => setVaultNotesInput(e.target.value)}
                    className="cyber-input"
                    rows={8}
                    style={{ resize: 'vertical', fontSize: '0.95rem', lineHeight: '1.6' }}
                  />
                </div>

                <button 
                  onClick={handleSaveVaultNotes}
                  className="theme-btn"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '2rem' }}
                >
                  {loading ? 'Saving...' : 'Save Assessment Notes'}
                </button>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <Database size={32} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h4 style={{ color: 'var(--text-muted)' }}>Notes Editor Inactive</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Select a candidate on the left to write and save notes into their record.</p>
              </div>
            )}
          </div>

        </div>

        {/* ==========================================
           ADMIN SCHEDULING LEDGER & HELPDESK INBOX
           ========================================== */}
        <div className="glass-panel animate-pop-in" style={{ marginTop: '3rem', padding: '2.5rem', textAlign: 'left', border: '1px solid var(--panel-border)', background: '#ffffff' }}>
          
          {/* Section Sub-Tabs */}
          <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => setActiveAdminSubTab('bookings')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeAdminSubTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: activeAdminSubTab === 'bookings' ? '2px solid var(--primary)' : 'none',
                paddingBottom: '0.5rem',
                transition: 'all 0.25s'
              }}
            >
              Consultation Schedule
            </button>
            
            <button 
              onClick={() => setActiveAdminSubTab('messages')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeAdminSubTab === 'messages' ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                borderBottom: activeAdminSubTab === 'messages' ? '2px solid var(--primary)' : 'none',
                paddingBottom: '0.5rem',
                transition: 'all 0.25s'
              }}
            >
              Support Messages ({supportMessages.length})
            </button>
          </div>

          {/* Tab Content 1: Bookings Schedule Ledger */}
          {activeAdminSubTab === 'bookings' && (
            <div className="animate-pop-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Central Scheduled Student Consultations</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Track and organize chronological date/time allocations for student consultations
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--panel-border)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Student ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Guardian Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Contact Email</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Scheduled Slot</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((stu) => {
                      const hasBooked = stu.booking_date && stu.booking_time;
                      return (
                        <tr 
                          key={stu.codename} 
                          style={{ 
                            borderBottom: '1px solid var(--panel-border)',
                            background: hasBooked ? '#f8fafc' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {stu.codename.toUpperCase()}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                            {stu.full_name}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                            {hasBooked ? stu.parent_name : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                            {hasBooked ? stu.parent_email : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {hasBooked ? (
                              <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                                📅 {stu.booking_date} at ⏰ {stu.booking_time}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Unscheduled</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {hasBooked ? (
                              <span style={{ background: '#ecfdf5', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                SCHEDULED
                              </span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: 'var(--text-muted)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                PENDING
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {studentsList.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No candidates registered in archives.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content 2: Helpdesk Support Messages */}
          {activeAdminSubTab === 'messages' && (
            <div className="animate-pop-in">
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Incoming Support Messages</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Acknowledge and inspect queries sent in real time by students
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {supportMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className="glass-panel" 
                    style={{ 
                      padding: '1.5rem', 
                      textAlign: 'left', 
                      background: '#f8fafc',
                      borderColor: 'var(--panel-border)',
                      margin: 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      <span>SENDER: {msg.codename.toUpperCase()}</span>
                      <span>📅 {msg.timestamp.replace('T', ' ').substring(0, 16)}</span>
                    </div>
                    
                    <h5 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Subject: {msg.subject}
                    </h5>
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', fontStyle: 'italic', background: '#ffffff', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '6px' }}>
                      "{msg.message}"
                    </p>

                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          alert(`Simulating dispatch to student ${msg.codename.toUpperCase()}...`);
                        }}
                        className="theme-btn secondary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                      >
                        Respond via Email
                      </button>
                    </div>
                  </div>
                ))}
                
                {supportMessages.length === 0 && (
                  <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No support transmissions pending in logs.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
        </>
      )}

      {/* ==========================================
         POPUP CONSULTATION APPOINTMENT MODAL
         ========================================== */}
      {isBookingOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-panel animate-pop-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', background: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            
            <button 
              onClick={closeBookingModal}
              style={{
                position: 'absolute', top: '15px', right: '15px', background: 'transparent',
                border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer'
              }}
            >
              &times;
            </button>

            {!bookingCompleted ? (
              <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <Award size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
                    Schedule Consultation
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Lock your direct career consultation with our Counselors
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PARENT/GUARDIAN FULL NAME</label>
                  <input 
                    type="text" 
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="cyber-input"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CONTACT EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="cyber-input"
                  />
                </div>

                <div style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', display: 'grid' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CONSULTING DATE</label>
                    <input 
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="cyber-input"
                      style={{ cursor: 'pointer' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AVAILABLE TIME SLOT</label>
                    <input 
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="cyber-input"
                      style={{ cursor: 'pointer' }}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="theme-btn"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.9rem', marginTop: '1rem' }}
                >
                  {loading ? 'Scheduling...' : 'Confirm Appointment'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', padding: '1rem 0' }}>
                <CheckCircle size={56} color="var(--primary)" />
                
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  CONSULTATION CONFIRMED
                </h3>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '400px' }}>
                  Greetings <strong style={{ color: 'var(--text-main)' }}>{parentName}</strong>, your career consultation has been scheduled on <strong style={{ color: 'var(--primary)' }}>{bookingDate}</strong> at <strong style={{ color: 'var(--primary)' }}>{bookingTime}</strong>.
                </p>

                <div className="glass-panel" style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--panel-border)', fontSize: '0.8rem', color: 'var(--text-main)', width: '100%' }}>
                  An encrypted invite with secure access links has been sent to <strong>{parentEmail}</strong>. Our counselors will be ready.
                </div>

                {/* Visual Simulated Email Preview Card */}
                <div className="glass-panel" style={{ width: '100%', border: '1px solid var(--panel-border)', padding: '1.2rem', textAlign: 'left', background: '#ffffff', fontSize: '0.8rem' }}>
                  <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px' }}>✉️ SECURE MAIL DISPATCHED</div>
                    <div style={{ color: 'var(--text-main)', marginTop: '4px' }}><strong>To:</strong> {parentEmail}</div>
                    <div style={{ color: 'var(--text-main)' }}><strong>Subject:</strong> [Academy] Consultation Appointment Confirmed - {registeredCodename?.toUpperCase()}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.5', maxHeight: '120px', overflowY: 'auto' }}>
                    Dear {parentName},<br /><br />
                    We are pleased to inform you that your secure parental career consultation slot has been <strong>successfully scheduled</strong>.<br /><br />
                    <strong>APPOINTMENT DETAILS:</strong><br />
                    📅 <strong>Date:</strong> {bookingDate}<br />
                    ⏰ <strong>Time:</strong> {bookingTime}<br /><br />
                    During this session, our academy staff will present the deep-dive diagnostic career matrices and tactical industry leadership paths engineered for your student's professional ascent.
                  </div>
                </div>

                {userRole === 'student' && (
                  <button 
                    onClick={() => setBookingCompleted(false)}
                    className="theme-btn secondary"
                    style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}
                  >
                    Reschedule Consultation Slot
                  </button>
                )}

                <button 
                  onClick={closeBookingModal}
                  className="theme-btn"
                  style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default MerchUnlock;
