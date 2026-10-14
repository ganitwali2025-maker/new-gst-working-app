import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FileSpreadsheet, 
  Database, 
  RotateCw, 
  BarChart2, 
  ShieldCheck, 
  Layers, 
  Users, 
  Building2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Check, 
  AlertCircle,
  X,
  KeyRound,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './Login.css';

interface FeatureCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  badgeClass: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'itc-recon',
    title: 'ITC Reconciliation',
    icon: <FileText size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-purple'
  },
  {
    id: 'gstr1-sales',
    title: 'GSTR-1 Sales',
    icon: <FileSpreadsheet size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-green'
  },
  {
    id: '2b-data',
    title: '2B Data Management',
    icon: <Database size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-orange'
  },
  {
    id: 'rcm-itc',
    title: 'RCM & Reverse ITC',
    icon: <RotateCw size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-yellow'
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: <BarChart2 size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-blue'
  },
  {
    id: 'compliance',
    title: 'Compliance Ready',
    icon: <ShieldCheck size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-pink'
  },
  {
    id: 'multi-year',
    title: 'Multi-Year Support',
    icon: <Layers size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-teal'
  },
  {
    id: 'secure-access',
    title: 'Secure Access',
    icon: <Users size={20} strokeWidth={2.2} />,
    badgeClass: 'badge-violet'
  }
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Load remembered username on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('gst_reco_remembered_user');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const res = await login(username.trim(), password);
    setLoading(false);

    if (res.success) {
      // Manage Remember Me in localStorage
      if (rememberMe) {
        localStorage.setItem('gst_reco_remembered_user', username.trim());
      } else {
        localStorage.removeItem('gst_reco_remembered_user');
      }
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid username or password.');
    }
  };

  const handleQuickDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="reco-login-container">
      <div className="reco-split-card">
        
        {/* ================= LEFT SIDE: BRANDING & FEATURES ================= */}
        <div className="reco-left-panel">
          {/* Subtle dot grid pattern */}
          <div className="reco-pattern-overlay" />

          {/* Professional GST accounting workspace image blend */}
          <div 
            className="reco-workspace-bg" 
            style={{ backgroundImage: `url('/images/workspace-bg.jpg')` }}
          />
          <div className="reco-workspace-vignette" />

          {/* Back button to Home/Landing */}
          <button 
            type="button" 
            className="reco-back-link" 
            onClick={() => navigate('/intro')}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>

          {/* App Branding Top */}
          <div className="reco-brand-header">
            <div className="reco-logo-box">
              <svg className="reco-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="22" width="6" height="12" rx="2" fill="#818cf8" />
                <rect x="17" y="16" width="6" height="18" rx="2" fill="#a78bfa" />
                <rect x="28" y="10" width="6" height="24" rx="2" fill="#c084fc" />
                <path 
                  d="M7 19L18 10L25 15L33 6M33 6H27M33 6V12" 
                  stroke="#34d399" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
            <div className="reco-brand-titles">
              <h1 className="reco-app-title">
                GST <span className="reco-highlight">Reco</span>Manager
              </h1>
              <p className="reco-tagline">
                Next-generation GST reconciliation system
              </p>
            </div>
          </div>

          {/* 8 Feature Cards Grid (4 columns x 2 rows) */}
          <div className="reco-features-grid">
            {FEATURE_CARDS.map((card) => (
              <div key={card.id} className="reco-feat-card">
                <div className={`reco-feat-icon-badge ${card.badgeClass}`}>
                  {card.icon}
                </div>
                <div className="reco-feat-title">{card.title}</div>
              </div>
            ))}
          </div>

          {/* Company Branding Bottom */}
          <div className="reco-bottom-branding">
            <div className="reco-company-badge">
              <Building2 size={24} strokeWidth={1.8} />
            </div>
            <div className="reco-company-info">
              <span className="reco-company-name">Passary Group</span>
              <span className="reco-company-tagline">
                Accurate Data &nbsp;|&nbsp; Better Compliance &nbsp;|&nbsp; Smarter Business
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: LOGIN FORM ================= */}
        <div className="reco-right-panel">
          <div className="reco-login-white-card">
            {/* Subtle bottom decorative waves */}
            <svg 
              className="reco-card-bottom-waves" 
              viewBox="0 0 500 120" 
              preserveAspectRatio="none"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
            <path 
              d="M0 60C120 100 280 20 500 70V120H0V60Z" 
              fill="rgba(139, 92, 246, 0.07)" 
            />
            <path 
              d="M0 80C160 120 320 40 500 90V120H0V80Z" 
              fill="rgba(124, 58, 237, 0.08)" 
            />
          </svg>

          {/* Decorative chart bars on bottom right */}
          <div className="reco-bottom-chart-accent">
            <div className="reco-chart-bar" style={{ height: '14px' }} />
            <div className="reco-chart-bar" style={{ height: '24px' }} />
            <div className="reco-chart-bar" style={{ height: '36px' }} />
            <div className="reco-chart-bar" style={{ height: '48px' }} />
          </div>

          <div className="reco-login-inner">
            {/* Header / Logo */}
            <div className="reco-form-header">
              <div className="reco-form-logo-box">
                <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="19" width="5" height="12" rx="1.5" fill="#a78bfa" />
                  <rect x="15" y="14" width="5" height="17" rx="1.5" fill="#818cf8" />
                  <rect x="25" y="9" width="5" height="22" rx="1.5" fill="#6366f1" />
                  <path 
                    d="M6 16L16 8L22 13L29 5M29 5H24M29 5V10" 
                    stroke="#7c3aed" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>

              <h2 className="reco-form-app-title">
                GST <span>Reco</span>Manager
              </h2>
              <div className="reco-form-subheading">Login to your account</div>
              <p className="reco-form-desc">Access your GST reconciliation dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="reco-alert reco-alert-error">
                <AlertCircle size={16} flex-shrink={0} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="reco-form">
              {/* Username Field */}
              <div className="reco-input-group">
                <span className="reco-input-icon">
                  <User size={18} strokeWidth={1.8} />
                </span>
                <input
                  type="text"
                  className="reco-input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="reco-input-group">
                <span className="reco-input-icon">
                  <Lock size={18} strokeWidth={1.8} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="reco-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="reco-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="reco-form-options">
                <label 
                  className="reco-remember-label" 
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <span className={`reco-custom-checkbox ${rememberMe ? 'checked' : ''}`}>
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  Remember me
                </label>

                <button
                  type="button"
                  className="reco-forgot-btn"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotSubmitted(false);
                    setForgotInput(username);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="reco-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="reco-spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} strokeWidth={2.2} />
                    <span>Login</span>
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="reco-divider">
                <span>OR</span>
              </div>

              {/* Quick Demo Access Option */}
              <div className="reco-demo-access">
                <button
                  type="button"
                  className="reco-demo-btn"
                  onClick={() => handleQuickDemo('admin', '1234')}
                >
                  <span>Quick Demo Admin: <strong>admin</strong> / <strong>1234</strong></span>
                  <span className="reco-demo-badge">Auto-fill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div className="reco-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="reco-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="reco-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <KeyRound size={22} className="text-purple-600" style={{ color: '#7c3aed' }} />
                <h3 className="reco-modal-title">Password Recovery</h3>
              </div>
              <button 
                type="button" 
                className="reco-modal-close" 
                onClick={() => setShowForgotModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="reco-modal-body">
              {!forgotSubmitted ? (
                <form onSubmit={handleForgotSubmit}>
                  <p>
                    Enter your registered username or email address. We will verify your account and provide reset instructions.
                  </p>
                  <div className="reco-input-group" style={{ marginBottom: '16px' }}>
                    <span className="reco-input-icon">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      className="reco-input"
                      placeholder="Username or email"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="reco-submit-btn" style={{ height: '44px' }}>
                    Send Recovery Instructions
                  </button>
                </form>
              ) : (
                <div>
                  <div className="reco-alert reco-alert-success" style={{ marginBottom: '16px' }}>
                    <Check size={18} flex-shrink={0} />
                    <span>
                      Recovery request submitted for <strong>{forgotInput}</strong>. Please check with your system administrator or verify your registered email.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="reco-submit-btn"
                    style={{ height: '44px' }}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
