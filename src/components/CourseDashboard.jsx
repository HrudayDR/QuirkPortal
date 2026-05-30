import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Gift, MapPin, Sparkles, AlertCircle, ShoppingBag, Truck, Cpu } from 'lucide-react';
import { COURSES_BY_TRACK } from './CourseList';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const CourseDashboard = ({ registeredCodename, userRole }) => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reward Modal States
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardToClaim, setRewardToClaim] = useState(null); // 'keychain' or 'hoodie'
  const [hoodieChoice, setHoodieChoice] = useState('luffy'); // 'luffy', 'rasengan', 'deku'
  
  // Shipping details
  const [shippingAddress, setShippingAddress] = useState({
    home: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [claiming, setClaiming] = useState(false);

  // Admin States
  const [allStudents, setAllStudents] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  // Module Progress & Celebration States
  const [moduleProgress, setModuleProgress] = useState({}); // { courseId: count }
  const [celebrating, setCelebrating] = useState(false);
  const TOTAL_MODULES = 4;
  const DUMMY_MODULES = [
    "Module 1: Orientation & Theory",
    "Module 2: Practical Drills",
    "Module 3: Advanced Simulation",
    "Module 4: Final Certification"
  ];

  useEffect(() => {
    if (userRole === 'student') {
      fetchStudentData();
    } else {
      fetchAdminData();
    }
  }, [registeredCodename, userRole]);

  const fetchAdminData = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch(`${API_BASE}/phase1/students`);
      if (!res.ok) throw new Error('Failed to load admin tracking data.');
      const data = await res.json();
      setAllStudents(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchStudentData = async () => {
    if (!registeredCodename || userRole !== 'student') return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/phase1/student/${registeredCodename}`);
      if (!res.ok) throw new Error('Failed to load courses dashboard.');
      const data = await res.json();
      setStudentProfile(data);
      if (data.shipping_address && Object.keys(data.shipping_address).length > 0) {
        setShippingAddress({
          home: data.shipping_address.home || '',
          city: data.shipping_address.city || '',
          state: data.shipping_address.state || '',
          pincode: data.shipping_address.pincode || ''
        });
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCourseDetails = (courseId) => {
    for (const track in COURSES_BY_TRACK) {
      for (const course of COURSES_BY_TRACK[track]) {
        if (course.id === courseId) return course;
      }
    }
    return { title: 'Unknown Course', description: '' };
  };

  const handleCompleteCourse = async (courseId) => {
    if (!registeredCodename) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/phase4/complete_course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codename: registeredCodename, course_id: courseId })
      });
      if (!res.ok) throw new Error('Failed to mark course as completed.');
      
      setSuccessMsg('Course marked as completed successfully! +100 EXP');
      await fetchStudentData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteNextModule = (courseId) => {
    const currentProgress = moduleProgress[courseId] || 0;
    const nextProgress = currentProgress + 1;
    setModuleProgress(prev => ({ ...prev, [courseId]: nextProgress }));

    if (nextProgress === TOTAL_MODULES) {
      // Course is fully completed via modules
      setCelebrating(true);
      setTimeout(() => {
        setCelebrating(false);
        handleCompleteCourse(courseId);
      }, 3500); // Wait for balloon animation
    }
  };

  const handleClaimRewardClick = (rewardType) => {
    setRewardToClaim(rewardType);
    setShowRewardModal(true);
  };

  const submitRewardClaim = async (e) => {
    e.preventDefault();
    if (!shippingAddress.home || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setErrorMsg('All shipping fields are required.');
      return;
    }
    
    setClaiming(true);
    setErrorMsg('');
    
    // Format the reward ID. If hoodie, append the choice.
    const finalRewardId = rewardToClaim === 'hoodie' ? `hoodie_${hoodieChoice}` : rewardToClaim;
    
    try {
      const res = await fetch(`${API_BASE}/phase4/claim_reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          codename: registeredCodename, 
          reward_id: finalRewardId,
          address: shippingAddress
        })
      });
      if (!res.ok) throw new Error('Failed to claim reward.');
      
      setSuccessMsg(`Reward claimed! Your ${finalRewardId.replace('_', ' ')} will be shipped soon.`);
      setShowRewardModal(false);
      await fetchStudentData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setClaiming(false);
    }
  };

  if (userRole !== 'student') {
    return (
      <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Cpu size={32} color="var(--primary)" /> Course Administration
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
            Monitor student course completions and dispatch merchandise orders.
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(255, 60, 0, 0.1)', border: '1px solid var(--secondary)', color: 'var(--text-light)', padding: '1rem', borderRadius: '8px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {adminLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h3 className="animate-pulse" style={{ color: 'var(--primary)' }}>LOADING SECURE ARCHIVES...</h3>
          </div>
        ) : allStudents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No student archives found.</p>
          </div>
        ) : (
          <>
            {/* Aggregated Metrics Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#ffffff', borderLeft: '4px solid var(--accent)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>TOTAL STUDENTS</div>
                <div style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{allStudents.length}</div>
              </div>
              <div style={{ background: '#ffffff', borderLeft: '4px solid var(--primary)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>COURSES COMPLETED</div>
                <div style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                  {allStudents.reduce((sum, s) => sum + (s.completed_courses || []).length, 0)}
                </div>
              </div>
              <div style={{ background: '#ffffff', borderLeft: '4px solid #bb86fc', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>ORDERS TO SHIP</div>
                <div style={{ fontSize: '2rem', color: '#bb86fc', fontWeight: 'bold' }}>
                  {allStudents.reduce((sum, s) => sum + (s.claimed_rewards || []).length, 0)}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', margin: 0, fontWeight: 'bold' }}>Logistics & Course Completions</h3>
                <input 
                  type="text" 
                  value={adminSearchTerm}
                  onChange={(e) => setAdminSearchTerm(e.target.value)}
                  className="cyber-input"
                  style={{ maxWidth: '250px' }}
                />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: 'var(--text-main)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Student ID</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Completed Courses</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Claimed Rewards</th>
                      <th style={{ padding: '1rem', border: '1px solid var(--panel-border)' }}>Shipping Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents.filter(s => s.codename.toLowerCase().includes(adminSearchTerm.toLowerCase()) || s.full_name?.toLowerCase().includes(adminSearchTerm.toLowerCase())).map(student => {
                      const completed = (student.completed_courses || []).length;
                      const total = (student.enrolled_courses || []).length;
                      const percent = total > 0 ? (completed / total) * 100 : 0;
                      const rewards = student.claimed_rewards || [];
                      
                      return (
                        <tr key={student.codename} style={{ background: '#ffffff', borderBottom: '1px solid var(--panel-border)' }}>
                          <td style={{ padding: '1rem', borderRight: 'none', borderLeft: 'none' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{student.codename}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{student.full_name}</div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-main)', minWidth: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                              <span>{completed} / {total} Finished</span>
                              <span style={{ color: 'var(--primary)' }}>{Math.round(percent)}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)' }}></div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {rewards.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {rewards.map((r, i) => (
                                  <span key={i} style={{ background: '#f3e8ff', color: '#9333ea', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #d8b4fe', display: 'inline-block', width: 'fit-content' }}>
                                    📦 {r.replace('hoodie_', 'Backpack: ')} (Pending Ship)
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>None Claimed</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                            {student.shipping_address && Object.keys(student.shipping_address).length > 0 ? (
                              <div style={{ lineHeight: '1.4' }}>
                                <strong style={{ color: 'var(--text-main)' }}>{student.shipping_address.home}</strong><br />
                                {student.shipping_address.city}, {student.shipping_address.state} - {student.shipping_address.pincode}
                              </div>
                            ) : 'Not Provided'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (!studentProfile && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h3 className="animate-pulse" style={{ color: 'var(--primary)' }}>LOADING DASHBOARD...</h3>
      </div>
    );
  }

  const enrolled = studentProfile?.enrolled_courses || [];
  const completed = studentProfile?.completed_courses || [];
  const claimedRewards = studentProfile?.claimed_rewards || [];
  
  // Logic for Rewards
  const completedCount = completed.length;
  const isKeychainEligible = completedCount >= 1;
  const isHoodieEligible = completedCount >= 4;
  const coursesNeededForHoodie = Math.max(0, 4 - completedCount);
  
  const hasClaimedKeychain = claimedRewards.includes('keychain');
  const hasClaimedHoodie = claimedRewards.some(r => r.startsWith('hoodie_'));

  return (
    <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Balloon Celebration Overlay */}
      {celebrating && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#ffffff', padding: '2rem 4rem', borderRadius: '16px', border: '2px solid var(--primary)', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary)', fontWeight: 'bold' }}>CONGRATULATIONS! 🎉</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Course Completed! Claim your merchandise!</p>
          </div>
          {/* Render random balloons */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="balloon" style={{ 
              left: `${Math.random() * 90}%`, 
              animationDelay: `${Math.random() * 0.5}s`,
              backgroundColor: ['var(--primary)', 'var(--accent)', '#bb86fc', '#ffeb3b'][i % 4]
            }}></div>
          ))}
        </div>
      )}

      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '2.2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
          <BookOpen size={32} color="var(--primary)" /> My Courses
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
          Track active enrollments, complete modules, and claim exclusive Academy merchandise.
        </p>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(0, 255, 170, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '1rem', borderRadius: '8px' }}>
          <CheckCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: 'rgba(255, 60, 0, 0.1)', border: '1px solid var(--secondary)', color: 'var(--text-light)', padding: '1rem', borderRadius: '8px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Rewards Progress Banner */}
      <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff', border: '1px solid var(--panel-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
          <Gift size={24} color="var(--primary)" /> Rewards Tracker
        </h3>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Keychain Reward Tier */}
          <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', background: '#f8fafc', borderLeft: isKeychainEligible ? '4px solid var(--primary)' : '4px solid var(--panel-border)', opacity: isKeychainEligible ? 1 : 0.6, borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tier 1: Premium Notebook</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Unlock after completing 1 course.</p>
            {hasClaimedKeychain ? (
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>✓ Claimed</span>
            ) : isKeychainEligible ? (
              <button onClick={() => handleClaimRewardClick('keychain')} className="theme-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Claim Reward 🎁
              </button>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Locked (0/1)</span>
            )}
          </div>

          {/* Hoodie Reward Tier */}
          <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', background: '#f8fafc', borderLeft: isHoodieEligible ? '4px solid #8b5cf6' : '4px solid var(--panel-border)', opacity: isHoodieEligible ? 1 : 0.6, borderRadius: '8px' }}>
            <h4 style={{ color: '#8b5cf6', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tier 2: Premium Backpack</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Unlock after completing 4 courses.</p>
            {hasClaimedHoodie ? (
              <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>✓ Claimed ({claimedRewards.find(r => r.startsWith('hoodie_'))?.split('_')[1]})</span>
            ) : isHoodieEligible ? (
              <button onClick={() => handleClaimRewardClick('hoodie')} className="theme-btn" style={{ background: '#8b5cf6', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Claim Backpack 🎒
              </button>
            ) : (
              <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Locked 🔒 (Need {coursesNeededForHoodie} more course{coursesNeededForHoodie > 1 ? 's' : ''})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Active Courses List */}
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Enrolled Courses</h3>
        {enrolled.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You are not enrolled in any courses yet. Go to Phase 2 to calibrate and enroll.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {enrolled.map(courseId => {
              const details = getCourseDetails(courseId);
              const isCompleted = completed.includes(courseId);
              const currentModCount = moduleProgress[courseId] || 0;
              const progressPercent = isCompleted ? 100 : (currentModCount / TOTAL_MODULES) * 100;
              const currentModName = isCompleted ? "All Modules Cleared" : DUMMY_MODULES[currentModCount];
              
              return (
                <div key={courseId} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                  {isCompleted && (
                    <div style={{ position: 'absolute', top: '15px', right: '15px', color: 'var(--primary)' }}>
                      <CheckCircle size={24} />
                    </div>
                  )}
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', paddingRight: '2rem', fontWeight: 'bold' }}>
                    {details.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {details.description.substring(0, 80)}...
                  </p>
                  
                  {/* Progress Bar & Dummy Modules */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
                      <span>{currentModName}</span>
                      <span>{isCompleted ? 4 : currentModCount}/4</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
                      <div style={{ width: `${progressPercent}%`, height: '100%', background: isCompleted ? 'var(--primary)' : 'var(--accent)', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                  
                  {isCompleted ? (
                    <div style={{ background: '#ecfdf5', padding: '0.6rem', textAlign: 'center', borderRadius: '6px', color: '#059669', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      COURSE GRADUATED 🎓
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCompleteNextModule(courseId)}
                      className="theme-btn secondary" 
                      style={{ width: '100%', padding: '0.6rem' }}
                      disabled={loading || celebrating}
                    >
                      {currentModCount === TOTAL_MODULES - 1 ? 'Take Final Exam 📝' : 'Complete Next Module ➔'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reward Claim Modal */}
      {showRewardModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-panel animate-pop-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative' }}>
            <button 
              onClick={() => setShowRewardModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <Truck size={24} color="var(--primary)" /> Shipping Details
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Provide your shipping details to receive your exclusive merchandise.
            </p>

            <form onSubmit={submitRewardClaim} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* If claiming a hoodie, let them pick which one */}
              {rewardToClaim === 'hoodie' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 'bold' }}>SELECT BACKPACK COLOR</label>
                  <select 
                    value={hoodieChoice}
                    onChange={(e) => setHoodieChoice(e.target.value)}
                    className="cyber-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="grey">Grey Edition</option>
                    <option value="navy">Navy Blue Edition</option>
                    <option value="black">Black Edition</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOME ADDRESS</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    required
                    value={shippingAddress.home}
                    onChange={(e) => setShippingAddress({...shippingAddress, home: e.target.value})}
                    className="cyber-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CITY</label>
                  <input 
                    type="text" 
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="cyber-input"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>STATE</label>
                  <input 
                    type="text" 
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="cyber-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PINCODE</label>
                <input 
                  type="text" 
                  required
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                  className="cyber-input"
                />
              </div>

              <button 
                type="submit" 
                className="theme-btn"
                disabled={claiming}
                style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }}
              >
                {claiming ? 'Transmitting Data...' : 'Confirm Shipping Details'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseDashboard;
