import React from 'react';
import { Compass, Mail, User, Gift, BookOpen, Cpu, ShieldAlert, Phone } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Cpu size={28} color="var(--primary)" />
        <h2 className="brand" style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-light)', fontFamily: '"Permanent Marker", cursive' }}>
          {userRole === 'student' ? 'Quirk Portal' : 'Admin Console'}
        </h2>
      </div>
      
      <div className="nav-links">
        <div 
          className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          title="Registration & Overview"
        >
          <User size={20} />
          Overview
        </div>
        
        <div 
          className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
          title="Course Catalog"
        >
          <Compass size={20} />
          Courses
        </div>
        
        <div 
          className={`nav-link ${activeTab === 'merch' ? 'active' : ''}`}
          onClick={() => setActiveTab('merch')}
          title="Rewards & Store"
        >
          <Gift size={20} />
          Rewards
        </div>

        <div 
          className={`nav-link ${activeTab === 'courses_dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses_dashboard')}
          title="My Progress"
        >
          <BookOpen size={20} />
          Progress
        </div>

        <div 
          className={`nav-link ${activeTab === 'outbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('outbox')}
          title="Messages"
        >
          <Mail size={20} />
          Messages
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* Helpdesk Contact Us Block */}
        <div className="glass-panel" style={{ padding: '1rem', background: '#f8fafc', borderStyle: 'solid', borderColor: 'var(--panel-border)', borderRadius: '8px', fontSize: '0.75rem', textAlign: 'center', fontFamily: 'var(--font-main)' }}>
          <Phone size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
            SUPPORT
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            <Mail size={12} /> support@academy.edu
          </div>
        </div>

        <div style={{ textAlign: 'center', fontFamily: 'var(--font-main)' }}>
          <ShieldAlert size={20} color="var(--primary)" />
          <p style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {userRole === 'student' ? 'STUDENT' : 'ADMIN'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
