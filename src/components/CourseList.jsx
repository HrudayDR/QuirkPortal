import React, { useState, useEffect } from 'react';
import { Sliders, Cpu, Brain, Flame, Activity, Zap, CheckCircle, Award, Compass, BarChart2, Shield, Sparkles, ChevronDown, ChevronUp, Clock, GraduationCap, Star, BookOpen, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const COURSES_BY_TRACK = {
  tech: [
    {
      id: "tech_fullstack_microservices",
      title: "Full-Stack Web Development & Microservices Architecture",
      instructor: "Dr. Aris Thorne (Web Systems Lead)",
      duration: "12 Weeks",
      difficulty: "Advanced",
      rating: 5,
      description: "Master React, Node.js, distributed database scaling, and high-performance inter-service communication using gRPC and HTTP/2.",
      syllabus: [
        { week: "Weeks 1-3", topic: "REST vs gRPC Protocols & High-Performance Network Handshakes" },
        { week: "Weeks 4-6", topic: "React Concurrent Rendering, Virtual DOM & State Hydration" },
        { week: "Weeks 7-9", topic: "Distributed Database Indexing, Partitioning & ACID Transactions" },
        { week: "Weeks 10-12", topic: "Containerized Orchestration & High-Availability Microservices Deployment" }
      ]
    },
    {
      id: "tech_deep_learning",
      title: "Deep Learning, Neural Networks & Machine Learning Operations",
      instructor: "Prof. Elena Vance (AI Research Director)",
      duration: "10 Weeks",
      difficulty: "Intermediate",
      rating: 4.8,
      description: "Construct convolutional and recurrent neural networks, calibrate training model hyper-parameters, and deploy ML models using robust pipelines.",
      syllabus: [
        { week: "Weeks 1-2", topic: "Supervised Learning, Loss Gradients & Linear Regressions" },
        { week: "Weeks 3-5", topic: "Neural Network Layer Architecture, Backpropagation & Weights Tuning" },
        { week: "Weeks 6-8", topic: "Computer Vision Convolutional Matrices & Natural Language Processing" },
        { week: "Weeks 9-10", topic: "Model Optimization, Drift Analysis & Production MLOps Deployments" }
      ]
    },
    {
      id: "tech_cloud_devops",
      title: "Cloud Computing Infrastructure & DevOps Engineering",
      instructor: "Marcus Brody (Principal Cloud Architect)",
      duration: "8 Weeks",
      difficulty: "Elite",
      rating: 5,
      description: "Design highly available, fault-tolerant infrastructure on AWS and GCP using Infrastructure as Code (Terraform) and Kubernetes.",
      syllabus: [
        { week: "Weeks 1-2", topic: "Virtual Private Clouds (VPC), Subnet Masking & Load Balancing" },
        { week: "Weeks 3-4", topic: "Containerization with Docker & Multi-Node Cluster Orchestration with Kubernetes" },
        { week: "Weeks 5-6", topic: "Infrastructure as Code (IaC) Declaratives with Terraform & AWS CloudFormation" },
        { week: "Weeks 7-8", topic: "Continuous Integration & Deployment (CI/CD) pipelines with GitHub Actions" }
      ]
    }
  ],
  business: [
    {
      id: "biz_ops_supplychain",
      title: "Strategic Operations Management & Global Supply Chains",
      instructor: "Sarah Jenkins (COO, Nexus Logistics)",
      duration: "10 Weeks",
      difficulty: "Elite",
      rating: 4.9,
      description: "Coordinate large-scale operational logistics, optimize organizational pipelines, and build resilient corporate structures during crises.",
      syllabus: [
        { week: "Weeks 1-3", topic: "Operations Economics, Lean Six-Sigma Methodologies & Process Optimization" },
        { week: "Weeks 4-5", topic: "Logistical Resource Deployments & High-Speed Material Pipelines" },
        { week: "Weeks 6-8", topic: "Raid Incident Planning, Risk Mitigation & Inter-Agency Corporate Laws" },
        { week: "Weeks 9-10", topic: "Emergency Post-Disaster Supply Chain Recovery & Inventory Systems" }
      ]
    },
    {
      id: "biz_public_policy",
      title: "Public Administration, Policy Design & Constitutional Law",
      instructor: "Hon. David Vance (Public Policy Counsel)",
      duration: "8 Weeks",
      difficulty: "Intermediate",
      rating: 4.7,
      description: "Study state policy formulation, administrative law, constitutional governance frameworks, and strategic public negotiations.",
      syllabus: [
        { week: "Weeks 1-2", topic: "Constitutional Governance Codes, Legislative Powers & Administrative Law" },
        { week: "Weeks 3-4", topic: "Media Communications, Press Operations & Public Relations Under Heavy Crisis" },
        { week: "Weeks 5-6", topic: "Bilateral Diplomatic Treaty Negotiations & Global Commerce Charters" },
        { week: "Weeks 7-8", topic: "Frameworks for Under-Cover Institutional Audits & Public Ethics" }
      ]
    },
    {
      id: "biz_leadership_negotiation",
      title: "Modern Leadership, Negotiation & Conflict Resolution",
      instructor: "Dr. Catherine Ross (Leadership Analyst)",
      duration: "12 Weeks",
      difficulty: "Advanced",
      rating: 5,
      description: "Acquire executive negotiation tactics, team cohesion metrics, and structural leadership models required to manage cross-functional systems.",
      syllabus: [
        { week: "Weeks 1-3", topic: "Harvard Negotiation Methods & Mutual Gains Bargaining Strategies" },
        { week: "Weeks 4-6", topic: "Emotional Intelligence in Leadership & Team Psychological Safety" },
        { week: "Weeks 7-9", topic: "Probability Modeling of Organizational Synergy & Conflict Resolution" },
        { week: "Weeks 10-12", topic: "Crisis Management Scenarios & Multi-Stakeholder Team Alignment" }
      ]
    }
  ],
  creative: [
    {
      id: "creative_brand_identity",
      title: "Corporate Brand Identity, Color Theory & Visual Strategy",
      instructor: "Julian Cole (Chief Creative Officer)",
      duration: "8 Weeks",
      difficulty: "Intermediate",
      rating: 4.8,
      description: "Craft high-impact visual systems, master typography scales, color theory alignments, and build persuasive brand launch campaigns.",
      syllabus: [
        { week: "Weeks 1-2", topic: "Psychology of Form: Typography Scales, Hierarchies & Vector Kits" },
        { week: "Weeks 3-4", topic: "HSL Color Science & Textile Aesthetics: Fusing Function with Fashion" },
        { week: "Weeks 5-6", topic: "Multi-Channel Brand Launches & Creative Public Influence Metrics" },
        { week: "Weeks 7-8", topic: "Interactive Engagement Frameworks & Public Corporate Sponsorships" }
      ]
    },
    {
      id: "creative_uiux_prototyping",
      title: "Advanced UI/UX Design & High-Fidelity Prototyping",
      instructor: "Clara Diaz (Principal UX Architect)",
      duration: "12 Weeks",
      difficulty: "Advanced",
      rating: 4.9,
      description: "Wireframe and design responsive mobile and web interfaces, calibrate high-contrast accessibility HUD systems, and perform user research audits.",
      syllabus: [
        { week: "Weeks 1-3", topic: "Design Systems Construction & High-Fidelity Figma Wireframing" },
        { week: "Weeks 4-6", topic: "WCAG Accessibility Calibration, Contrast Ratios & Dark Mode UX" },
        { week: "Weeks 7-9", topic: "Holographic & Multi-Device Mobile Screen Telemetry Prototyping" },
        { week: "Weeks 10-12", topic: "Usability Lab Testing, Eye-Tracking Audits & Cognitive Load Verification" }
      ]
    },
    {
      id: "creative_visual_narrative",
      title: "Visual Narrative, Digital Illustration & Storyboard Design",
      instructor: "Kenji Sato (Concept Illustrator)",
      duration: "10 Weeks",
      difficulty: "Advanced",
      rating: 5,
      description: "Master digital character design, narrative structures, and storyboarding techniques for digital media and marketing campaigns.",
      syllabus: [
        { week: "Weeks 1-2", topic: "Principles of Digital Composition, Lighting Matrices & Perspective Grids" },
        { week: "Weeks 3-5", topic: "Character Anatomy, Expression & Kinetic Storyboard Illustration" },
        { week: "Weeks 6-8", topic: "Digital Painting, Texturing & Assets Integration for Cinematic Media" },
        { week: "Weeks 9-10", topic: "Creative Visual Propaganda Strategy & Safety Announcement Design" }
      ]
    }
  ]
};

const CourseList = ({ registeredCodename, setRegisteredCodename, setActiveTab, userRole }) => {
  const [codenameInput, setCodenameInput] = useState(registeredCodename || '');
  const [metrics, setMetrics] = useState({
    logic: 60,
    creativity: 70,
    leadership: 50,
    grit: 65
  });
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Student specific quiz states
  const [studentProfile, setStudentProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [quizState, setQuizState] = useState('not-started'); // 'not-started', 'in-progress', 'completed'
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  
  // Admin specific candidate selection states
  const [studentsList, setStudentsList] = useState([]);
  const [selectedAdminStudent, setSelectedAdminStudent] = useState(null);
  const [adminLoadError, setAdminLoadError] = useState('');

  // Booking states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingErrorMsg, setBookingErrorMsg] = useState('');
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  // Prefill codename
  useEffect(() => {
    if (registeredCodename) {
      setCodenameInput(registeredCodename);
    }
  }, [registeredCodename]);

  // Load database list of students if logged in as admin
  useEffect(() => {
    if (userRole === 'admin') {
      fetch(`${API_BASE}/phase1/students`)
        .then(res => res.json())
        .then(data => {
          setStudentsList(data);
          // Auto-select first student if available
          if (data.length > 0) {
            loadAdminStudentDetails(data[0].codename);
          }
        })
        .catch(err => {
          setAdminLoadError('Failed to retrieve student candidates list.');
        });
    }
  }, [userRole]);

  // Load student profile details if logged in as a student
  useEffect(() => {
    if (userRole === 'student' && registeredCodename) {
      setLoading(true);
      fetch(`${API_BASE}/phase1/student/${registeredCodename}`)
        .then(res => {
          if (!res.ok) throw new Error('Stats not loaded.');
          return res.json();
        })
        .then(data => {
          setStudentProfile(data);
          const score = data.aptitude_score || 0;
          setMetrics({
            logic: data.logic || score,
            creativity: data.creativity || score,
            leadership: data.leadership || score,
            grit: data.grit || score
          });
          if (score > 0) {
            setQuizState('completed');
          } else {
            setQuizState('not-started');
          }
          if (data.enrolled_courses) {
            setEnrolledCourses(data.enrolled_courses);
          }
          if (data.parent_name) setParentName(data.parent_name);
          if (data.parent_email) setParentEmail(data.parent_email);
          if (data.booking_date) setBookingDate(data.booking_date);
          if (data.booking_time) setBookingTime(data.booking_time);
          if (data.payment_status) setPaymentStatus(data.payment_status);

          if (data.booking_date && data.booking_time) {
            if (data.payment_status === 'unpaid') {
              setBookingCompleted(false);
              setShowPaymentUI(true);
              setIsBookingOpen(true);
            } else {
              setBookingCompleted(true);
            }
          }
          
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
        });
    }
  }, [userRole, registeredCodename]);

  const loadAdminStudentDetails = async (codename) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/phase1/student/${codename}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedAdminStudent(data);
        setMetrics({
          logic: data.logic || 0,
          creativity: data.creativity || 0,
          leadership: data.leadership || 0,
          grit: data.grit || 0
        });
      }
    } catch (e) {
      setErrorMsg('Failed to fetch from Academy servers.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e, forcePaymentStatus = 'unpaid') => {
    e?.preventDefault?.();
    if (!parentName.trim() || !parentEmail.trim()) return;
    
    setBookingLoading(true);
    setBookingErrorMsg('');
    
    try {
      const response = await fetch(`${API_BASE}/phase3/vault/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codename: registeredCodename,
          parent_name: parentName,
          parent_email: parentEmail,
          booking_date: bookingDate,
          booking_time: bookingTime,
          payment_status: forcePaymentStatus
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to persist booking slot.');
      }
      
      setPaymentStatus(forcePaymentStatus);
      setBookingCompleted(true);
      setShowPaymentUI(false);
      window.alert("Counselling Mail has been sent to the parent successfully! ⚡");
    } catch (err) {
      setBookingErrorMsg(err.message || 'Booking synchronization failure.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !parentName || !parentEmail) {
      setBookingErrorMsg("Please fill out all details before proceeding to payment.");
      return;
    }
    setShowPaymentUI(true);
  };

  const executeMockPayment = () => {
    setBookingLoading(true);
    setTimeout(() => {
      handleBookingSubmit(null, 'paid');
    }, 2000);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
  };

  const handleCreateCourse = async (e) => {
    const codename = e.target.value;
    if (codename) {
      loadAdminStudentDetails(codename);
    }
  };

  const handleAdminStudentSelect = (e) => {
    const codename = e.target.value;
    if (codename) {
      loadAdminStudentDetails(codename);
    }
  };

  const handleSliderChange = (e) => {
    if (userRole === 'student') return;
    setMetrics({
      ...metrics,
      [e.target.name]: parseInt(e.target.value)
    });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const calculatedAptitude = Math.round(
    (metrics.logic + metrics.creativity + metrics.leadership + metrics.grit) / 4
  );

  const handleSubmitScore = async () => {
    const targetCodename = userRole === 'student' ? registeredCodename : (selectedAdminStudent?.codename || '');
    if (!targetCodename.trim()) {
      setErrorMsg('Candidate Codename is required to synchronize logs.');
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    
    try {
      const response = await fetch(`${API_BASE}/phase2/update-aptitude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codename: targetCodename,
          aptitude_score: calculatedAptitude,
          logic: metrics.logic,
          creativity: metrics.creativity,
          leadership: metrics.leadership,
          grit: metrics.grit
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update student aptitude in Academy archives.');
      }
      
      setSuccessMsg(`Aptitude Metrics synchronized successfully! Skill Quotient recorded at ${calculatedAptitude}%.`);
      
      // Reload candidates if admin
      if (userRole === 'admin') {
        const listRes = await fetch(`${API_BASE}/phase1/students`);
        const listData = await listRes.json();
        setStudentsList(listData);
        // Refresh active candidate loaded info with new values
        setSelectedAdminStudent(prev => prev ? { ...prev, aptitude_score: calculatedAptitude } : null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STREAM SPECIFIC QUIZZES DATA MODEL
  // ==========================================
  const quizzesByStream = {
    tech: [
      {
        question: "Which of the following database transaction isolation levels guarantees that dirty reads, non-repeatable reads, and phantom reads are entirely prevented?",
        options: [
          { text: "Serializable", logic: 95, creativity: 30, leadership: 40, grit: 50 },
          { text: "Read Committed", logic: 60, creativity: 20, leadership: 30, grit: 30 },
          { text: "Repeatable Read", logic: 80, creativity: 25, leadership: 35, grit: 40 }
        ]
      },
      {
        question: "You are designing a high-throughput, low-latency microservices API. Which protocol is best suited for binary inter-service communication?",
        options: [
          { text: "gRPC over HTTP/2", logic: 95, creativity: 60, leadership: 50, grit: 50 },
          { text: "REST over HTTP/1.1", logic: 70, creativity: 55, leadership: 50, grit: 40 },
          { text: "SOAP over XML", logic: 50, creativity: 30, leadership: 60, grit: 60 }
        ]
      },
      {
        question: "What is the primary trade-off addressed by the CAP Theorem in distributed databases?",
        options: [
          { text: "Consistency, Availability, and Partition Tolerance", logic: 95, creativity: 50, leadership: 80, grit: 50 },
          { text: "CPU scheduling speed, RAM throughput, and Storage capacity", logic: 55, creativity: 30, leadership: 40, grit: 30 },
          { text: "Database indexing speed, Query complexity, and Write throughput", logic: 75, creativity: 40, leadership: 55, grit: 40 }
        ]
      }
    ],
    business: [
      {
        question: "A country's central bank increases the Cash Reserve Ratio (CRR). What is the direct macroeconomic impact?",
        options: [
          { text: "Decreases liquidity in the banking system", logic: 80, creativity: 40, leadership: 95, grit: 60 },
          { text: "Increases credit availability in public banks", logic: 60, creativity: 50, leadership: 70, grit: 50 },
          { text: "Devalues the domestic currency directly against foreign exchange reserves", logic: 75, creativity: 45, leadership: 60, grit: 40 }
        ]
      },
      {
        question: "Which organizational structure is best suited for modern, dynamic companies working on multiple cross-functional projects simultaneously?",
        options: [
          { text: "Matrix Structure", logic: 75, creativity: 85, leadership: 95, grit: 65 },
          { text: "Hierarchical Structure", logic: 60, creativity: 30, leadership: 80, grit: 55 },
          { text: "Flat Structure", logic: 50, creativity: 90, leadership: 70, grit: 75 }
        ]
      },
      {
        question: "What does the 'Triple Bottom Line' framework in corporate social responsibility evaluate?",
        options: [
          { text: "People, Planet, and Profit", logic: 70, creativity: 80, leadership: 95, grit: 90 },
          { text: "Revenues, Gross Margins, and Net Earnings", logic: 85, creativity: 40, leadership: 70, grit: 50 },
          { text: "Stock Price, Market Capitalization, and Dividend Yields", logic: 60, creativity: 30, leadership: 75, grit: 40 }
        ]
      }
    ],
    creative: [
      {
        question: "In graphic design and typography, what does the term 'Kerning' refer to?",
        options: [
          { text: "The adjustment of space between two specific characters to improve readability", logic: 95, creativity: 80, leadership: 50, grit: 60 },
          { text: "The vertical distance between baseline grids of text paragraphs", logic: 70, creativity: 60, leadership: 40, grit: 45 },
          { text: "The proportional scaling of images without distorting aspect ratios", logic: 60, creativity: 50, leadership: 45, grit: 40 }
        ]
      },
      {
        question: "You are designing a user interface for an elderly demographic. Which UX design principle is most critical?",
        options: [
          { text: "Accessibility & high contrast ratios", logic: 80, creativity: 70, leadership: 95, grit: 90 },
          { text: "Minimalist visual branding with micro-interactions and dark mode menus", logic: 65, creativity: 90, leadership: 60, grit: 55 },
          { text: "Dynamic parallax scrolling and three-dimensional canvas animations", logic: 40, creativity: 95, leadership: 40, grit: 60 }
        ]
      },
      {
        question: "Which color scheme combines colors that are directly opposite each other on the color wheel to create high-contrast vibrancy?",
        options: [
          { text: "Complementary Color Scheme", logic: 60, creativity: 95, leadership: 85, grit: 70 },
          { text: "Analogous Color Scheme", logic: 80, creativity: 70, leadership: 60, grit: 50 },
          { text: "Monochromatic Color Scheme", logic: 75, creativity: 65, leadership: 70, grit: 55 }
        ]
      }
    ]
  };

  const getStudentQuizList = () => {
    if (!studentProfile) return quizzesByStream.tech;
    const streamStr = studentProfile.stream.toLowerCase();
    if (streamStr.includes('art') || streamStr.includes('design') || streamStr.includes('creative')) {
      return quizzesByStream.creative;
    } else if (streamStr.includes('business') || streamStr.includes('management') || streamStr.includes('commerce') || streamStr.includes('upsc')) {
      return quizzesByStream.business;
    } else {
      return quizzesByStream.tech;
    }
  };

  const handleSelectQuizAnswer = (optIndex) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQ] = optIndex;
    setSelectedAnswers(updatedAnswers);
  };

  const handleNextQuizQuestion = () => {
    const questions = getStudentQuizList();
    if (selectedAnswers[currentQ] === undefined) {
      setErrorMsg('Please select a response to calibrate your stats.');
      return;
    }
    setErrorMsg('');
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate scores dynamically!
      let totalLogic = 0;
      let totalCreativity = 0;
      let totalLeadership = 0;
      let totalGrit = 0;

      selectedAnswers.forEach((ansIndex, qIndex) => {
        const option = questions[qIndex].options[ansIndex];
        totalLogic += option.logic;
        totalCreativity += option.creativity;
        totalLeadership += option.leadership;
        totalGrit += option.grit;
      });

      const avgLogic = Math.round(totalLogic / questions.length);
      const avgCreativity = Math.round(totalCreativity / questions.length);
      const avgLeadership = Math.round(totalLeadership / questions.length);
      const avgGrit = Math.round(totalGrit / questions.length);

      const computedAptitude = Math.round((avgLogic + avgCreativity + avgLeadership + avgGrit) / 4);

      setMetrics({
        logic: avgLogic,
        creativity: avgCreativity,
        leadership: avgLeadership,
        grit: avgGrit
      });

      // Submit score to database in background
      setLoading(true);
      fetch(`${API_BASE}/phase2/update-aptitude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codename: registeredCodename,
          aptitude_score: computedAptitude,
          logic: avgLogic,
          creativity: avgCreativity,
          leadership: avgLeadership,
          grit: avgGrit
        })
      })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setSuccessMsg(`Quiz completed! Tactical stats loaded & synchronized at ${computedAptitude}%.`);
        setQuizState('completed');
        // Re-load student profile to load track and empty enrolled courses
        fetch(`${API_BASE}/phase1/student/${registeredCodename}`)
          .then(res => res.json())
          .then(data => {
            setStudentProfile(data);
            if (data.enrolled_courses) {
              setEnrolledCourses(data.enrolled_courses);
            }
            if (data.parent_name) setParentName(data.parent_name);
            if (data.parent_email) setParentEmail(data.parent_email);
            
            // Auto open booking form if not booked yet
            if (!data.booking_date || !data.booking_time) {
              setIsBookingOpen(true);
            } else {
              setBookingDate(data.booking_date);
              setBookingTime(data.booking_time);
              if (data.payment_status) setPaymentStatus(data.payment_status);
              
              if (data.payment_status === 'unpaid') {
                setBookingCompleted(false);
                setShowPaymentUI(true);
                setIsBookingOpen(true);
              } else {
                setBookingCompleted(true);
              }
            }
          })
          .catch(() => {});
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg('Stat synchronization error.');
        setLoading(false);
      });
    }
  };

  const handleEnrollCourse = async (courseId) => {
    if (!registeredCodename) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/phase2/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codename: registeredCodename,
          course_id: courseId
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Enrollment failed.');
      }
      setEnrolledCourses(data.enrolled_courses);
      setSuccessMsg('Course enrollment locked in UA Archives successfully! 🚀');
    } catch (e) {
      setErrorMsg(e.message || 'Server connection error during enrollment.');
    } finally {
      setLoading(false);
    }
  };

  const getStudentCourseList = (profile) => {
    const prof = profile || studentProfile;
    if (!prof) return COURSES_BY_TRACK.tech;
    const streamStr = prof.stream.toLowerCase();
    if (streamStr.includes('art') || streamStr.includes('design') || streamStr.includes('creative')) {
      return COURSES_BY_TRACK.creative;
    } else if (streamStr.includes('business') || streamStr.includes('management') || streamStr.includes('commerce') || streamStr.includes('upsc')) {
      return COURSES_BY_TRACK.business;
    } else {
      return COURSES_BY_TRACK.tech;
    }
  };

  // Determine Talent Profile Class based on highest stat
  const getTalentProfile = () => {
    const maxVal = Math.max(metrics.logic, metrics.creativity, metrics.leadership, metrics.grit);
    if (maxVal === metrics.logic) {
      return {
        title: "The Analytical Architect",
        strength: "Technical Precision (Complex algorithms, software debugging, and logic optimization).",
        weakness: "Delegation and team coordination. Practice delegating operational roles.",
        desc: "Your cognitive flow processes tactical equations rapidly. Your profile bridges mathematical stability with elite programmatic execution."
      };
    } else if (maxVal === metrics.creativity) {
      return {
        title: "The Concept Innovator",
        strength: "Concept Synthesis (Abstract storytelling, design branding, and strategic pivots).",
        weakness: "Mathematical Calibration. Ensure structural optimizations are validated.",
        desc: "You thrive in abstract aesthetic configurations. Your profile unlocks game-changing visual branding and revolutionary design models."
      };
    } else if (maxVal === metrics.leadership) {
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

  const talentInfo = getTalentProfile();
  const currentQuestions = getStudentQuizList();

  return (
    <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--text-main)' }}>Aptitude Assessment</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
            {userRole === 'student' ? 'Complete your situational assessment to calibrate your learning profile' : 'Student Assessment Results & Competency Calibration'}
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ==========================================
         STUDENT VIEW: INTERACTIVE QUIZ & CHARTS
         ========================================== */}
      {userRole === 'student' && (
        <div style={{ display: 'grid', gridTemplateColumns: quizState === 'completed' ? '1.2fr 1fr' : '1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {quizState === 'not-started' && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: '#ffffff', border: '1px solid var(--panel-border)' }}>
              <Compass size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
                TALENT CALIBRATION ONBOARDING
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '550px', margin: '1rem auto 2rem auto', lineHeight: '1.6' }}>
                You have been sorted into <strong style={{ color: 'var(--accent)' }}>{studentProfile?.allocated_department}</strong>. You must complete the stream-specific situational assessment to calibrate your core Logic, Creativity, Leadership, and Grit metrics.
              </p>
              <button 
                onClick={() => setQuizState('in-progress')}
                className="theme-btn" 
                style={{ margin: '0 auto', padding: '1rem 3rem' }}
              >
                Start Assessment
              </button>
            </div>
          )}

          {quizState === 'in-progress' && (
            <div className="glass-panel" style={{ padding: '2.5rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <span>ASSESSMENT STATUS</span>
                <span>QUESTION {currentQ + 1} OF {currentQuestions.length}</span>
              </div>

              <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '2rem' }}>
                {currentQuestions[currentQ].question}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentQuestions[currentQ].options.map((opt, oIdx) => (
                  <div 
                    key={oIdx}
                    onClick={() => handleSelectQuizAnswer(oIdx)}
                    className="glass-panel"
                    style={{ 
                      padding: '1.2rem', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      borderColor: selectedAnswers[currentQ] === oIdx ? 'var(--primary)' : 'var(--panel-border)',
                      background: selectedAnswers[currentQ] === oIdx ? '#f8fafc' : '#ffffff'
                    }}
                  >
                    <p style={{ fontSize: '1rem', color: selectedAnswers[currentQ] === oIdx ? 'var(--primary)' : 'var(--text-main)' }}>
                      {opt.text}
                    </p>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleNextQuizQuestion}
                className="theme-btn"
                disabled={loading}
                style={{ marginTop: '2rem', alignSelf: 'flex-start' }}
              >
                {currentQ < currentQuestions.length - 1 ? 'Analyze & Proceed ➔' : 'Complete Assessment'}
              </button>
            </div>
          )}

          {quizState === 'completed' && (
            <>
              {/* READ ONLY RESULTS & THE GRAPH CHART */}
              <div className="glass-panel" style={{ padding: '2.5rem', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
                  <BarChart2 size={22} /> Competency Assessment Results
                </h3>

                {/* GRAPH CHART */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  alignItems: 'flex-end', 
                  height: '240px', 
                  margin: '3rem 0 2rem 0',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid var(--panel-border)',
                  position: 'relative'
                }}>
                  {/* Logic Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.logic}%</span>
                    <div style={{ 
                      width: '32px', 
                      height: `${metrics.logic * 1.8}px`, // scale for visual height
                      background: 'var(--primary)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 1s ease'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>LOGIC</span>
                  </div>

                  {/* Creativity Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.creativity}%</span>
                    <div style={{ 
                      width: '32px', 
                      height: `${metrics.creativity * 1.8}px`,
                      background: 'var(--accent)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 1s ease'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>CREATIVE</span>
                  </div>

                  {/* Leadership Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.leadership}%</span>
                    <div style={{ 
                      width: '32px', 
                      height: `${metrics.leadership * 1.8}px`,
                      background: 'var(--secondary)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 1s ease'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>LEADER</span>
                  </div>

                  {/* Grit Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.grit}%</span>
                    <div style={{ 
                      width: '32px', 
                      height: `${metrics.grit * 1.8}px`,
                      background: 'var(--primary)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 1s ease'
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>GRIT</span>
                  </div>
                </div>

                {/* TAILORED STRENGTHS & WEAKNESSES GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '3px solid var(--primary)', background: '#f8fafc' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                      Core Strength
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {talentInfo.strength}
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '3px solid var(--secondary)', background: '#f8fafc' }}>
                    <h4 style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                      Growth Sector
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {talentInfo.weakness}
                    </p>
                  </div>
                </div>
              </div>

              {/* READ ONLY TACTICAL CARD */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', background: '#ffffff' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 'bold' }}>
                    // ASSESSMENT SUMMARY
                  </div>
                  
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '0.75rem' }}>
                    {talentInfo.title}
                  </h3>

                  <div style={{ margin: '1rem 0', height: '1px', borderBottom: '1px solid var(--panel-border)' }}></div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {talentInfo.desc}
                  </p>

                  <div className="glass-panel pulse-unlocked" style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>APTITUDE RATING</span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.2rem' }}>
                      {calculatedAptitude}%
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('merch')}
                    className="theme-btn"
                    style={{ width: '100%', marginTop: '1.5rem' }}
                  >
                    View Available Rewards
                  </button>
                </div>
              </div>

              {/* DYNAMICALLY UNLOCKED COURSES SECTION - FULL WIDTH SPAN */}
              <div className="animate-pop-in glass-panel" style={{ gridColumn: 'span 2', marginTop: '2rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.25rem', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)' }}>
                      <GraduationCap size={32} /> Academy Courses
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                      Enrollment Portal - Curricula calibrated to your stream
                    </p>
                  </div>
                  
                  {/* Dynamic Student ID Badge Info */}
                  <div className="glass-panel pulse-unlocked" style={{ padding: '0.75rem 1.5rem', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CREDENTIALS</div>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{studentProfile?.full_name?.toUpperCase()}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--panel-border)', paddingLeft: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold' }}>ENROLLMENTS</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {enrolledCourses.length} / {getStudentCourseList().length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid-container" style={{ margin: 0, gap: '2rem' }}>
                  {getStudentCourseList().map(course => {
                    const isEnrolled = enrolledCourses.includes(course.id);
                    const isExpanded = expandedCourseId === course.id;
                    
                    return (
                      <div 
                        key={course.id} 
                        className={`glass-panel ${isEnrolled ? 'pulse-unlocked' : ''}`}
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                          borderColor: isEnrolled ? 'var(--primary)' : 'var(--panel-border)',
                          transform: isExpanded ? 'scale(1.01)' : 'scale(1)',
                          background: '#ffffff'
                        }}
                      >
                        {/* Course Card Banner */}
                        <div style={{ 
                          height: '90px', 
                          background: isEnrolled ? '#f0fdf4' : '#f8fafc',
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '1.2rem',
                          borderBottom: '1px solid var(--panel-border)',
                          justifyContent: 'space-between'
                        }}>
                          <BookOpen size={36} color={isEnrolled ? 'var(--primary)' : 'var(--text-muted)'} />
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 'bold',
                            color: course.difficulty === 'Elite' ? 'var(--secondary)' : (course.difficulty === 'Advanced' ? 'var(--accent)' : 'var(--primary)'),
                            border: '1px solid currentColor',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px'
                          }}>
                            {course.difficulty.toUpperCase()}
                          </span>
                        </div>

                        {/* Course Card Body */}
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                          <h4 style={{ fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: '1.4', minHeight: '44px' }}>
                            {course.title}
                          </h4>
                          
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', flex: 1 }}>
                            {course.description}
                          </p>

                          {/* Specifications Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--panel-border)' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Instructor:</span>
                              <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <User size={12} /> {course.instructor.split('/')[0].trim()}
                              </div>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                              <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Clock size={12} /> {course.duration}
                              </div>
                            </div>
                          </div>

                          {/* Ratings */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', gap: '0.1rem', color: '#eab308' }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={14} fill={star <= Math.floor(course.rating) ? '#eab308' : 'transparent'} />
                              ))}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                              ({course.rating.toFixed(1)})
                            </span>
                          </div>

                          {/* Syllabus Expand/Accordion Panel */}
                          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                            <button 
                              type="button"
                              onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--primary)', 
                                fontSize: '0.8rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.3rem', 
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              {isExpanded ? (
                                <>Hide Syllabus <ChevronUp size={14} /></>
                              ) : (
                                <>View Syllabus <ChevronDown size={14} /></>
                              )}
                            </button>

                            {/* Animated syllabus box */}
                            <div style={{ 
                              maxHeight: isExpanded ? '300px' : '0px', 
                              opacity: isExpanded ? 1 : 0,
                              overflow: 'hidden', 
                              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                              marginTop: isExpanded ? '0.75rem' : '0rem'
                            }}>
                              <div className="glass-panel" style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid var(--panel-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                  {course.syllabus.map((s, idx) => (
                                    <div key={idx} style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                      <strong style={{ color: 'var(--text-main)', display: 'block' }}>{s.week}:</strong>
                                      <span style={{ color: 'var(--text-muted)' }}>{s.topic}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Enrollment Button */}
                          <div style={{ marginTop: '0.5rem' }}>
                            {isEnrolled ? (
                              <div style={{ 
                                width: '100%', 
                                padding: '0.8rem', 
                                borderRadius: '6px', 
                                border: '1px solid var(--primary)', 
                                background: '#ecfdf5', 
                                color: '#047857', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '0.5rem',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}>
                                <CheckCircle size={16} /> ENROLLED
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleEnrollCourse(course.id)}
                                className="theme-btn" 
                                style={{ width: '100%', padding: '0.8rem' }}
                                disabled={loading}
                              >
                                Enroll
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      )}

      {/* ==========================================
         ADMIN VIEW: REVIEW PANEL
         ========================================== */}
      {userRole === 'admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Left Column: Sliders, Dropdown, Summary, Sync */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Candidate Selector Dropdown */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                SELECT ACTIVE CANDIDATE
              </label>
              
              <select 
                onChange={handleAdminStudentSelect} 
                className="cyber-input"
                style={{ cursor: 'pointer', background: '#f8fafc' }}
                value={selectedAdminStudent?.codename || ''}
              >
                {studentsList.map((stu) => (
                  <option key={stu.codename} value={stu.codename}>
                    {stu.codename.toUpperCase()} ({stu.full_name})
                  </option>
                ))}
              </select>
            </div>

            {/* MARKS CALIBRATOR CARD */}
            <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
                <Sliders size={20} /> Administrator Override
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                {/* Logic Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                      <Cpu size={16} /> Logic & Math
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{metrics.logic}%</span>
                  </div>
                  <input 
                    type="range" 
                    name="logic"
                    min="0" 
                    max="100" 
                    value={metrics.logic} 
                    onChange={handleSliderChange}
                    className="cyber-slider"
                  />
                </div>

                {/* Creativity Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                      <Brain size={16} /> Creativity & Design
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{metrics.creativity}%</span>
                  </div>
                  <input 
                    type="range" 
                    name="creativity"
                    min="0" 
                    max="100" 
                    value={metrics.creativity} 
                    onChange={handleSliderChange}
                    className="cyber-slider"
                  />
                </div>

                {/* Leadership Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                      <Flame size={16} /> Leadership
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{metrics.leadership}%</span>
                  </div>
                  <input 
                    type="range" 
                    name="leadership"
                    min="0" 
                    max="100" 
                    value={metrics.leadership} 
                    onChange={handleSliderChange}
                    className="cyber-slider"
                  />
                </div>

                {/* Grit Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                      <Activity size={16} /> Interpersonal Skills
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{metrics.grit}%</span>
                  </div>
                  <input 
                    type="range" 
                    name="grit"
                    min="0" 
                    max="100" 
                    value={metrics.grit} 
                    onChange={handleSliderChange}
                    className="cyber-slider"
                  />
                </div>
              </div>
            </div>

            {/* Candidate Details Summary card */}
            {selectedAdminStudent && (
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', background: '#ffffff' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 'bold' }}>
                  // STUDENT SUMMARY
                </div>
                
                <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginTop: '0.75rem' }}>
                  {selectedAdminStudent.full_name}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Student ID: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{selectedAdminStudent.codename}</span>
                </p>

                <div style={{ margin: '1rem 0', height: '1px', borderBottom: '1px solid var(--panel-border)' }}></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Focus Area:</span>
                    <p style={{ color: 'var(--text-main)', fontWeight: 'bold', marginTop: '0.2rem' }}>{selectedAdminStudent.stream}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Track:</span>
                    <p style={{ color: 'var(--text-main)', fontWeight: 'bold', marginTop: '0.2rem' }}>{selectedAdminStudent.allocated_department}</p>
                  </div>
                </div>

                {/* Score rating summary */}
                <div className="glass-panel" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-main)' }}>Aptitude Score Rating</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{calculatedAptitude}%</span>
                  </div>
                  <div className="progress-bar-container" style={{ height: '10px', marginTop: '0.5rem', background: '#e2e8f0' }}>
                    <div className="progress-bar-fill" style={{ width: `${calculatedAptitude}%`, background: 'var(--primary)' }}></div>
                  </div>
                </div>

                <button 
                  onClick={handleSubmitScore} 
                  className="theme-btn" 
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? 'Syncing...' : 'Save Override'}
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Visual Diagnostic Panel */}
          <div>
            {selectedAdminStudent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Talent Analysis Chart */}
                <div className="glass-panel" style={{ padding: '2.5rem', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
                    <BarChart2 size={22} /> Candidate Competency Analysis
                  </h3>

                  {/* GRAPH CHART */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    alignItems: 'flex-end', 
                    height: '240px', 
                    margin: '3rem 0 2rem 0',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid var(--panel-border)',
                    position: 'relative'
                  }}>
                    {/* Logic Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.logic}%</span>
                      <div style={{ 
                        width: '32px', 
                        height: `${metrics.logic * 1.8}px`, // scale for visual height
                        background: 'var(--primary)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease'
                      }}></div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>LOGIC</span>
                    </div>

                    {/* Creativity Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.creativity}%</span>
                      <div style={{ 
                        width: '32px', 
                        height: `${metrics.creativity * 1.8}px`,
                        background: 'var(--accent)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease'
                      }}></div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>CREATIVE</span>
                    </div>

                    {/* Leadership Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.leadership}%</span>
                      <div style={{ 
                        width: '32px', 
                        height: `${metrics.leadership * 1.8}px`,
                        background: 'var(--secondary)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease'
                      }}></div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>LEADER</span>
                    </div>

                    {/* Grit Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{metrics.grit}%</span>
                      <div style={{ 
                        width: '32px', 
                        height: `${metrics.grit * 1.8}px`,
                        background: 'var(--primary)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease'
                      }}></div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>GRIT</span>
                    </div>
                  </div>

                  {/* Tailored class details */}
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                      // ASSIGNED PROFILE
                    </span>
                    <h4 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                      {talentInfo.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      {talentInfo.desc}
                    </p>
                  </div>
                </div>

                {/* TAILORED STRENGTHS & WEAKNESSES GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '3px solid var(--primary)', background: '#f8fafc' }}>
                    <h4 style={{ color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                      Core Strength
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {talentInfo.strength}
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.2rem', borderLeft: '3px solid var(--secondary)', background: '#f8fafc' }}>
                    <h4 style={{ color: 'var(--secondary)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                      Growth Sector
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {talentInfo.weakness}
                    </p>
                  </div>
                </div>

                {/* COUNSELOR SYSTEM: PERSISTENT ENROLLED COURSES REVIEW */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GraduationCap size={20} /> Course Enrollments
                  </h4>
                  {selectedAdminStudent.enrolled_courses && selectedAdminStudent.enrolled_courses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedAdminStudent.enrolled_courses.map(courseId => {
                        const course = [...COURSES_BY_TRACK.tech, ...COURSES_BY_TRACK.business, ...COURSES_BY_TRACK.creative].find(c => c.id === courseId);
                        return (
                          <div 
                            key={courseId} 
                            className="glass-panel" 
                            style={{ 
                              padding: '0.8rem 1.2rem', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              background: '#f8fafc', 
                              border: '1px solid var(--panel-border)' 
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                {course ? course.title : courseId}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Instructor: {course ? course.instructor : 'Academy Staff'}
                              </div>
                            </div>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--primary)', 
                              background: 'rgba(79, 70, 229, 0.1)', 
                              padding: '0.2rem 0.6rem', 
                              borderRadius: '4px', 
                              border: '1px solid rgba(79, 70, 229, 0.2)', 
                              fontWeight: '500'
                            }}>
                              ENROLLED
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
                      Candidate has not enrolled in any courses yet.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                <Shield size={32} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h4 style={{ color: 'var(--text-muted)' }}>No Active Profile Selected</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Select a candidate to view diagnostic charts.</p>
              </div>
            )}
          </div>

        </div>
      )}
      
      {/* ==========================================
         POPUP CONSULTATION APPOINTMENT MODAL (AFTER QUIZ)
         ========================================== */}
      {isBookingOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
        }}>
          <div className="glass-panel animate-pop-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', border: '1px solid var(--primary)', boxShadow: '0 0 35px var(--primary-glow)' }}>
            
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
              showPaymentUI ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
                  <Award size={48} color="var(--accent)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>Payment Gateway</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Counseling Appointment Fee: <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>200/-</strong></p>
                  
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <button onClick={executeMockPayment} disabled={bookingLoading} className="theme-btn" style={{ flex: 1, padding: '1rem' }}>
                      {bookingLoading ? 'Processing...' : 'Pay 200/- (UPI)'}
                    </button>
                    <button onClick={executeMockPayment} disabled={bookingLoading} className="theme-btn secondary" style={{ flex: 1, padding: '1rem' }}>
                      {bookingLoading ? 'Processing...' : 'Pay 200/- (Card)'}
                    </button>
                  </div>
                  <button onClick={() => setShowPaymentUI(false)} className="theme-btn secondary" style={{ marginTop: '1rem', border: 'none' }}>
                    Back to Schedule Form
                  </button>
                </div>
              ) : (
              <form onSubmit={handleProceedToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <Award size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)' }}>
                    Schedule Professional Consultation
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Book your direct career consultation with our Chief Counselors
                  </p>
                </div>

                {bookingErrorMsg && (
                  <div style={{ background: '#fee2e2', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    ⚠️ {bookingErrorMsg}
                  </div>
                )}

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
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CONSULTATION DATE</label>
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
                  style={{ width: '100%', padding: '0.9rem', marginTop: '1rem' }}
                >
                  Proceed to Payment (200/-)
                </button>
              </form>
              )
            ) : (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', padding: '1rem 0' }}>
                <CheckCircle size={56} color="var(--primary)" />
                
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                  CONSULTATION CONFIRMED
                </h3>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '400px' }}>
                  Greetings <strong style={{ color: 'var(--text-main)' }}>{parentName}</strong>, your career consultation has been scheduled for <strong style={{ color: 'var(--primary)' }}>{bookingDate}</strong> at <strong style={{ color: 'var(--primary)' }}>{bookingTime}</strong>.
                </p>
                
                {paymentStatus === 'paid' && (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    ✅ Payment Verified (200/-)
                  </div>
                )}

                <div className="glass-panel" style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--panel-border)', fontSize: '0.8rem', color: 'var(--text-main)', width: '100%' }}>
                  A confirmation invite with meeting details has been sent to <strong>{parentEmail}</strong>. Our counselors will be ready to assist you.
                </div>

                {userRole === 'student' && (
                  <button 
                    onClick={() => setBookingCompleted(false)}
                    className="theme-btn secondary"
                    style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}
                  >
                    Reschedule Consultation
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
export default CourseList; 
