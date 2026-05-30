import React, { useState, useEffect } from 'react';
import { Shield, Key, User, Calendar, BookOpen, Mail, Users, ArrowRight, UserPlus } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const WATERMARKS = Array.from({ length: 48 }).map((_, i) => ({
  id: i,
  type: ['rasengan', 'ichigo', 'straw_hat'][i % 3],
  top: `${Math.floor(Math.random() * 100)}%`,
  left: `${Math.floor(Math.random() * 100)}%`,
  rotate: `${Math.floor(Math.random() * 360)}deg`,
  size: `${Math.floor(Math.random() * 5) + 6}rem`,
}));

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  // Registration Form States
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    codename: '',
    first_name: '',
    last_name: '',
    dob: '',
    stream: 'Engineering & Tech (Science)',
    hobbies: '',
    parent_name: '',
    parent_email: '',
    secret_pass: ''
  });

  // Sync back button for the Registration form
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#register') {
        setIsRegistering(true);
        setError(false);
      } else {
        setIsRegistering(false);
        setError(false);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash(); // init
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    const uLower = username.trim().toLowerCase();
    const pLower = password.trim();

    // Foolproof local developer bypass
    if (uLower === 'admin' && pLower === 'admin') {
      onLoginSuccess('admin', 'admin');
      return;
    }

    if (!username.trim() || !password) {
      setErrorText('Credentials missing.');
      setError(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Credentials rejected.');
      }
      
      onLoginSuccess(data.role, data.codename);
    } catch (err) {
      setErrorText(err.message || 'Verification failed.');
      setError(true);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    if (!registerForm.codename.trim() || !registerForm.first_name.trim() || !registerForm.last_name.trim() || !registerForm.secret_pass) {
      setErrorText('Core credentials must be completed.');
      setError(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/phase1/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codename: registerForm.codename.trim(),
          first_name: registerForm.first_name.trim(),
          last_name: registerForm.last_name.trim(),
          dob: registerForm.dob,
          stream: registerForm.stream,
          hobbies: registerForm.hobbies,
          secret_pass: registerForm.secret_pass,
          parent_name: registerForm.parent_name.trim(),
          parent_email: registerForm.parent_email.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed.');
      }

      onLoginSuccess('student', data.codename);
    } catch (err) {
      setErrorText(err.message || 'Academy registration failed.');
      setError(true);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Watermarks */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {WATERMARKS.map(wm => (
          <img 
            key={wm.id}
            src={`/images/${wm.type}.png`} 
            alt={wm.type} 
            style={{ 
              position: 'absolute', 
              top: wm.top, 
              left: wm.left, 
              width: wm.size, 
              opacity: 0.12, 
              transform: `rotate(${wm.rotate})`, 
              mixBlendMode: 'multiply' 
            }} 
          />
        ))}
      </div>

      {/* Main Login Card */}
      <div 
        className="glass-panel"
        style={{ position: 'relative', zIndex: 1, maxWidth: isRegistering ? '680px' : '440px', width: '100%', padding: '3rem', background: 'rgba(240, 248, 255, 0.95)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid var(--panel-border)', textAlign: 'center', backdropFilter: 'blur(10px)' }}
      >
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '2rem', fontFamily: '"Permanent Marker", cursive', letterSpacing: '2px', transform: 'rotate(-2deg)' }}>
          QUIRK PORTAL
        </h1>

        {!isRegistering ? (
          /* LOGIN FORM */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Student ID (Codename)
              </label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="cyber-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '0.2rem 0', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>
                {errorText}
              </div>
            )}

            <button type="submit" className="theme-btn" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              Login <ArrowRight size={16} />
            </button>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => { window.location.hash = 'register'; }}
                className="theme-btn secondary"
                style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Initialize Student Registration
              </button>
              
              <button 
                type="button" 
                onClick={() => onLoginSuccess('admin', 'admin')}
                className="theme-btn secondary"
                style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
              >
                Admin Access
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM (RESPONSIVE GRID) */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Student Registration
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
              {/* Codename */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Student ID / Codename
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    name="codename"
                    value={registerForm.codename}
                    onChange={handleRegisterChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* First Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  First Name
                </label>
                <input 
                  type="text" 
                  name="first_name"
                  value={registerForm.first_name}
                  onChange={handleRegisterChange}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Last Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Last Name
                </label>
                <input 
                  type="text" 
                  name="last_name"
                  value={registerForm.last_name}
                  onChange={handleRegisterChange}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Date of Birth
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="date" 
                    name="dob"
                    value={registerForm.dob}
                    onChange={handleRegisterChange}
                    className="cyber-input" 
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Academic Focus Stream
                </label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <select 
                    name="stream"
                    value={registerForm.stream}
                    onChange={handleRegisterChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem', cursor: 'pointer' }}
                  >
                    <option value="Arts/Creative Design">Arts, Design & Creative Industries</option>
                    <option value="Business/Management/Commerce">Business Management & Civil Services</option>
                    <option value="Engineering & Tech (Science)">Engineering, AI & Prime Technologies</option>
                  </select>
                </div>
              </div>

              {/* Hobbies */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Hobbies & Core Interests
                </label>
                <input 
                  type="text" 
                  name="hobbies"
                  value={registerForm.hobbies}
                  onChange={handleRegisterChange}
                  className="cyber-input"
                  required
                />
              </div>

              {/* Parent Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Guardian Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    name="parent_name"
                    value={registerForm.parent_name}
                    onChange={handleRegisterChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Parent Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Contact Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    name="parent_email"
                    value={registerForm.parent_email}
                    onChange={handleRegisterChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Secret Pass */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="password" 
                    name="secret_pass"
                    value={registerForm.secret_pass}
                    onChange={handleRegisterChange}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', textAlign: 'center', margin: '0.2rem 0', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>
                {errorText}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="theme-btn" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={16} /> Complete Registration
              </button>
              
              <button 
                type="button" 
                onClick={() => { window.location.hash = ''; }}
                className="theme-btn secondary"
                style={{ flex: 1 }}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
