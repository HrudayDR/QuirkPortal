import React, { useState, useEffect } from 'react';
import { User, Cpu, Sparkles, Calendar, BookOpen, Compass, RotateCcw, Key, Mail, Users, Phone } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const Dashboard = ({ registeredCodename, setRegisteredCodename, setActiveTab, userRole }) => {
  const [formData, setFormData] = useState({
    codename: '',
    first_name: '',
    last_name: '',
    dob: '',
    stream: 'Engineering & Tech',
    hobbies: '',
    secret_pass: '',
    parent_name: '',
    parent_email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  // Admin states
  const [allStudents, setAllStudents] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrack, setFilterTrack] = useState('All');

  // Reschedule states
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  const handleOpenReschedule = (student) => {
    setRescheduleTarget(student);
    setRescheduleDate(student.booking_date || '');
    setRescheduleTime(student.booking_time || '');
    setRescheduleError('');
    setRescheduleModalOpen(true);
  };

  const submitReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Date and Time are required.');
      return;
    }
    setRescheduleLoading(true);
    setRescheduleError('');
    try {
      const res = await fetch(`${API_BASE}/admin/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codename: rescheduleTarget.codename,
          new_date: rescheduleDate,
          new_time: rescheduleTime
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Reschedule failed');
      
      setAllStudents(prev => prev.map(s => 
        s.codename === rescheduleTarget.codename ? { ...s, booking_date: rescheduleDate, booking_time: rescheduleTime } : s
      ));
      setRescheduleModalOpen(false);
      window.alert("Successfully rescheduled and notified parent!");
    } catch (err) {
      setRescheduleError(err.message);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleDeleteStudent = async (codename) => {
    if (!window.confirm(`Are you sure you want to permanently delete student ${codename}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/student/${codename}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Delete failed');
      
      setAllStudents(prev => prev.filter(s => s.codename !== codename));
      window.alert(data.message || `Student ${codename} removed.`);
    } catch (err) {
      window.alert(`Error deleting student: ${err.message}`);
    }
  };

  // Contact Support States
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState('');
  const [supportError, setSupportError] = useState('');

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    const targetCodename = registeredCodename || formData.codename || 'GuestCandidate';
    if (!supportSubject.trim() || !supportMessage.trim()) {
      setSupportError('Transmission subject and message are required.');
      return;
    }
    setSupportSending(true);
    setSupportSuccess('');
    setSupportError('');
    try {
      const res = await fetch(`${API_BASE}/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codename: targetCodename,
          subject: supportSubject,
          message: supportMessage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Transmission relay offline.');
      setSupportSuccess(data.message || 'Transmission dispatched to Principal Counselors!');
      setSupportSubject('');
      setSupportMessage('');
    } catch (err) {
      setSupportError(err.message || 'Support relay communication error.');
    } finally {
      setSupportSending(false);
    }
  };

  // If codename is already registered in this session, attempt to fetch the profile to show it, or keep session state
  useEffect(() => {
    if (userRole !== 'student') {
      setAdminLoading(true);
      fetch(`${API_BASE}/phase1/students`)
        .then(res => res.json())
        .then(data => {
          setAllStudents(data);
          setAdminLoading(false);
        })
        .catch(err => {
          console.error(err);
          setAdminLoading(false);
        });
    }

    if (registeredCodename && !successData) {
      setLoading(true);
      fetch(`${API_BASE}/phase1/student/${registeredCodename}`)
        .then(res => {
          if (!res.ok) throw new Error('Student profile not loaded.');
          return res.json();
        })
        .then(data => {
          setSuccessData({
            codename: data.codename,
            first_name: data.first_name,
            last_name: data.last_name,
            full_name: data.full_name,
            allocated_department: data.allocated_department,
            counseling_summary: data.counseling_summary,
            stream: data.stream,
            hobbies: data.hobbies
          });
          setLoading(false)
        })
        .catch(err => {
          setLoading(false);
        });
    }
  }, [registeredCodename]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codename.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Codename, First Name, and Last Name are required to begin sorting.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/phase1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Sorting Ceremony server connection failed. Please ensure the backend is running.');
      }
      
      const data = await response.json();
      setSuccessData(data);
      setRegisteredCodename(data.codename);
    } catch (err) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setRegisteredCodename('');
    setFormData({
      codename: '',
      first_name: '',
      last_name: '',
      dob: '',
      stream: 'Engineering & Tech',
      hobbies: '',
      secret_pass: '',
      parent_name: '',
      parent_email: ''
    });
  };

  // Determine track colors for premium visual feedback
  const getTrackStyle = (track) => {
    if (!track) return {};
    if (track.includes('Design') || track.includes('Strategy')) {
      return {
        borderColor: '#bb86fc',
        color: '#bb86fc',
        background: 'rgba(187, 134, 252, 0.1)'
      };
    } else if (track.includes('Commander') || track.includes('Grand')) {
      return {
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
        background: 'rgba(255, 122, 0, 0.1)'
      };
    } else {
      return {
        borderColor: 'var(--primary)',
        color: 'var(--primary)',
        background: 'rgba(79, 70, 229, 0.1)'
      };
    }
  };

  return (
    <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-light)' }}>Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
            Student Registration and Assessment Overview
          </p>
        </div>
        {successData && userRole !== 'student' && (
          <button onClick={handleReset} className="theme-btn secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <RotateCcw size={16} /> New Registration
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ display: 'inline', marginRight: '8px' }} />
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
          <Cpu size={48} className="animate-pulse" style={{ color: 'var(--primary)', marginBottom: '1.5rem', animation: 'spin 2s linear infinite' }} />
          <h3 style={{ color: 'var(--text-main)' }}>Processing Registration...</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Evaluating candidate profile.</p>
        </div>
      ) : successData ? (
        /* SUCCESS CARD */
        <div className="wanted-poster animate-pop-in">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
            Registration Complete
          </div>
          
          <h2 style={{ fontSize: '2rem', marginTop: '1rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>
            {successData.full_name || successData.codename}
          </h2>
          
          <div style={{ display: 'inline-block', margin: '0.5rem 0 1.5rem 0', background: 'rgba(0,0,0,0.05)', padding: '0.2rem 1rem', borderRadius: '20px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold', textTransform: 'uppercase' }}>{successData.codename}</span>
          </div>

          <div style={{ 
            maxWidth: '550px', 
            margin: '1.5rem auto', 
            border: '1px solid',
            borderRadius: '8px',
            padding: '1.5rem',
            ...getTrackStyle(successData.allocated_department)
          }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '0.5rem' }}>
              Assigned Track
            </div>
            <h3 style={{ color: 'inherit', fontSize: '1.4rem', lineHeight: '1.4', margin: 0 }}>
              {successData.allocated_department}
            </h3>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', margin: '2rem auto', maxWidth: '650px', background: '#f8fafc', textAlign: 'left', borderLeft: '4px solid var(--primary)' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Summary
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              {successData.counseling_summary}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={() => setActiveTab('courses')} className="theme-btn" style={{ padding: '0.8rem 2rem' }}>
              <Compass size={18} /> View Courses
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM */
        <div className="glass-panel animate-pop-in" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
            New Registration
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Student ID
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    name="codename"
                    value={formData.codename}
                    onChange={handleChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  First Name
                </label>
                <input 
                  type="text" 
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="cyber-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Last Name
                </label>
                <input 
                  type="text" 
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="cyber-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Date of Birth
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="date" 
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="cyber-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Department Focus
                </label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <select 
                    name="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem', cursor: 'pointer' }}
                  >
                    <option value="Arts/Creative Design">Arts & Design</option>
                    <option value="Business/Management/Commerce">Business & Management</option>
                    <option value="Engineering & Tech (Science)">Engineering & Technology</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Interests
                </label>
                <input 
                  type="text" 
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleChange}
                  className="cyber-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Emergency Contact Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Users size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Contact Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    name="parent_email"
                    value={formData.parent_email}
                    onChange={handleChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Account Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    name="secret_pass"
                    value={formData.secret_pass}
                    onChange={handleChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="theme-btn" style={{ alignSelf: 'flex-start', marginTop: '1.5rem', padding: '0.8rem 2rem' }}>
              <Sparkles size={18} /> Submit Registration
            </button>
          </form>
        </div>
      )}

      {/* ==========================================
          ADMIN PHASE 1 TRACKING (SORTING CEREMONY)
         ========================================== */}
      {userRole !== 'student' && (
        <div className="glass-panel animate-pop-in" style={{ marginTop: '2rem', padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={24} /> Admin Overview: Registrations
          </h3>
          
          {adminLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
          ) : (
            <>
              {/* Top Metrics & Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ background: '#f8fafc', borderLeft: '4px solid var(--accent)', padding: '1rem 2rem', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>TOTAL REGISTERED STUDENTS</div>
                  <div style={{ fontSize: '2.5rem', color: 'var(--text-light)', fontWeight: 'bold' }}>{allStudents.length}</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, maxWidth: '250px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Search Name/ID</label>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="cyber-input"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, maxWidth: '250px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter by Track</label>
                    <select 
                      value={filterTrack}
                      onChange={(e) => setFilterTrack(e.target.value)}
                      className="cyber-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="All">All Tracks</option>
                      {Array.from(new Set(allStudents.map(s => s.allocated_department).filter(Boolean))).map(track => (
                        <option key={track} value={track}>{track}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Student Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: 'var(--text-main)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>ID / Name</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Contact Email</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Focus Area</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Assigned Track</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Booking & Payment</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents
                      .filter(s => filterTrack === 'All' || s.allocated_department === filterTrack)
                      .filter(s => 
                        s.codename.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (s.full_name && s.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map(student => (
                      <tr key={student.codename} style={{ background: '#ffffff' }}>
                        <td style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>
                          <strong style={{ color: 'var(--text-light)', fontSize: '1rem', textTransform: 'uppercase' }}>{student.codename}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{student.full_name}</div>
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}>
                          {student.parent_email}
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid var(--panel-border)', color: 'var(--text-main)', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                          {student.stream}
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>
                          <span style={{ background: 'rgba(234, 88, 12, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(234, 88, 12, 0.2)', display: 'inline-block', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            {student.allocated_department}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid var(--panel-border)', fontSize: '0.85rem' }}>
                          {student.booking_date && student.booking_time ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <strong style={{ color: 'var(--primary)' }}>{student.booking_date} @ {student.booking_time}</strong>
                              {student.payment_status === 'paid' ? (
                                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ Paid</span>
                              ) : (
                                <span style={{ color: '#dc2626', fontWeight: 'bold' }}>❌ Unpaid</span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Not booked</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {student.booking_date && (
                              <button 
                                onClick={() => handleOpenReschedule(student)}
                                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Reschedule
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteStudent(student.codename)}
                              style={{ background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allStudents.length > 0 && allStudents
                      .filter(s => filterTrack === 'All' || s.allocated_department === filterTrack)
                      .filter(s => 
                        s.codename.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (s.full_name && s.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
                      ).length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No recruits matched your search parameters.
                          </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {rescheduleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Reschedule Appointment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Student: <strong style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{rescheduleTarget?.codename}</strong>
            </p>
            
            {rescheduleError && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {rescheduleError}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NEW DATE</label>
                <input 
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="cyber-input"
                  style={{ cursor: 'pointer', width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NEW TIME</label>
                <input 
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="cyber-input"
                  style={{ cursor: 'pointer', width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={submitReschedule} disabled={rescheduleLoading} className="theme-btn" style={{ flex: 1, padding: '0.8rem' }}>
                  {rescheduleLoading ? 'Saving...' : 'Confirm'}
                </button>
                <button onClick={() => setRescheduleModalOpen(false)} disabled={rescheduleLoading} className="theme-btn secondary" style={{ flex: 1, padding: '0.8rem' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
         CONTACT SUPPORT & DUMMY CONTACT INFO
         ========================================== */}
      <div 
        className="glass-panel animate-pop-in" 
        style={{ 
          marginTop: '3.5rem', 
          padding: '2.5rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2.5rem',
          textAlign: 'left'
        }}
      >
        {/* Left Grid: Dummy Contact Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-light)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              <Phone size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Helpdesk
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Phone size={32} color="var(--primary)" />
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem', textTransform: 'uppercase' }}>HOTLINE</strong>
                <p style={{ color: 'var(--primary)', fontSize: '1.2rem', marginTop: '0.2rem', fontWeight: 'bold' }}>
                  1-800-ACADEMY
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Mail size={32} color="var(--text-muted)" />
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.8rem', textTransform: 'uppercase' }}>EMAIL</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.2rem', fontWeight: '500' }}>
                  support@academy.edu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Grid: Interactive Message Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-light)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              <Mail size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              MESSAGE
            </h3>
          </div>

          {supportSuccess && (
            <div className="animate-pop-in" style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              ✓ {supportSuccess}
            </div>
          )}

          {supportError && (
            <div className="animate-pop-in" style={{ background: '#fee2e2', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              ⚠️ {supportError}
            </div>
          )}

          <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subject</label>
              <input 
                type="text" 
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                className="cyber-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Message</label>
              <textarea 
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="cyber-input" 
                rows={4}
                style={{ resize: 'none', background: '#ffffff' }}
                required
              />
            </div>

            <button 
              type="submit" 
              className="theme-btn" 
              disabled={supportSending}
              style={{ padding: '0.8rem 2rem', alignSelf: 'flex-start', fontSize: '0.9rem' }}
            >
              {supportSending ? 'Sending...' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
