import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CourseList from './components/CourseList';
import MerchUnlock from './components/MerchUnlock';
import TransponderOutbox from './components/TransponderOutbox';
import CourseDashboard from './components/CourseDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // 'admin' or 'student'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [registeredCodename, setRegisteredCodename] = useState('');

  // Sync back button for the internal dashboard tabs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'courses', 'merch', 'outbox', 'courses_dashboard'].includes(hash)) {
        setActiveTab(hash);
      } else if (!hash && isLoggedIn) {
        // If there's no hash but we are logged in, default to dashboard and fix the hash
        window.location.hash = 'dashboard';
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    if (isLoggedIn) handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoggedIn]);

  const handleSetTab = (tab) => {
    window.location.hash = tab;
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLoginSuccess={(role, codename) => {
          setUserRole(role || 'admin');
          setRegisteredCodename(codename || '');
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div className="app-container animate-pop-in">
      <Sidebar activeTab={activeTab} setActiveTab={handleSetTab} userRole={userRole} />
      
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard 
            registeredCodename={registeredCodename} 
            setRegisteredCodename={setRegisteredCodename}
            setActiveTab={handleSetTab}
            userRole={userRole}
          />
        )}
        {activeTab === 'courses' && (
          <CourseList 
            registeredCodename={registeredCodename} 
            setRegisteredCodename={setRegisteredCodename}
            setActiveTab={handleSetTab}
            userRole={userRole}
          />
        )}
        {activeTab === 'merch' && (
          <MerchUnlock 
            registeredCodename={registeredCodename} 
            userRole={userRole}
            setActiveTab={handleSetTab}
          />
        )}
        {activeTab === 'courses_dashboard' && (
          <CourseDashboard 
            registeredCodename={registeredCodename} 
            userRole={userRole}
          />
        )}
        {activeTab === 'outbox' && (
          <TransponderOutbox 
            registeredCodename={registeredCodename} 
            userRole={userRole}
          />
        )}
      </main>
    </div>
  );
}

export default App;
