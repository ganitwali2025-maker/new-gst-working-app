import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  FileSpreadsheet, 
  Database, 
  RotateCw, 
  Building2, 
  ArrowRight,
  LogIn,
  X
} from 'lucide-react';
import './Introduction.css';

interface FeatureCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  badgeClass: string;
}

// Exactly 4 Feature Cards per user requirement
const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'itc-recon',
    title: 'ITC Reconciliation',
    icon: <FileText size={18} strokeWidth={2.2} />,
    badgeClass: 'badge-purple'
  },
  {
    id: 'gstr1-sales',
    title: 'GSTR-1 Sales',
    icon: <FileSpreadsheet size={18} strokeWidth={2.2} />,
    badgeClass: 'badge-green'
  },
  {
    id: '2b-data',
    title: '2B Data Management',
    icon: <Database size={18} strokeWidth={2.2} />,
    badgeClass: 'badge-orange'
  },
  {
    id: 'rcm-itc',
    title: 'RCM & Reverse ITC',
    icon: <RotateCw size={18} strokeWidth={2.2} />,
    badgeClass: 'badge-yellow'
  }
];

export default function Introduction() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="reco-start-container">
      <div className="reco-start-card">
        
        {/* Background Visuals: Laptop Workspace + Geometric Pattern */}
        <div className="reco-start-bg-laptop" />
        <div className="reco-start-pattern" />

        {/* Decorative Bottom Wave SVG */}
        <svg 
          className="reco-start-bottom-waves" 
          viewBox="0 0 400 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0 60C100 10 240 100 400 30V120H0V60Z" 
            fill="rgba(192, 132, 252, 0.08)" 
          />
          <path 
            d="M0 90C120 40 280 110 400 60V120H0V90Z" 
            fill="rgba(168, 85, 247, 0.12)" 
          />
        </svg>

        {/* ================= 1. TOP BRAND HEADER & NAVIGATION ================= */}
        <div className="reco-start-header">
          {/* Left Branding */}
          <div className="reco-start-logo-group">
            <div className="reco-start-logo-box">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div className="reco-start-titles">
              <h1 className="reco-start-title">
                GST <span className="reco-highlight">Reco</span>Manager
              </h1>
              <p className="reco-start-tagline">
                Next-generation GST reconciliation system
              </p>
            </div>
          </div>

          {/* Top Navigation: Home, About, Login */}
          <nav className="reco-start-nav">
            <button 
              type="button" 
              className="reco-start-nav-link active" 
              onClick={() => navigate('/intro')}
            >
              Home
            </button>
            <button 
              type="button" 
              className="reco-start-nav-link" 
              onClick={() => setShowAbout(true)}
            >
              About
            </button>
            <button 
              type="button" 
              className="reco-start-nav-btn" 
              onClick={() => navigate('/login')}
              title="Proceed to Login"
            >
              <LogIn size={15} />
              <span>Login</span>
            </button>
          </nav>
        </div>

        {/* ================= 2. CENTER CONTENT: HERO & 4 FEATURE CARDS ================= */}
        <div className="reco-start-center">
          {/* Welcome Text */}
          <div className="reco-start-welcome-box">
            <div className="reco-start-welcome-sub">Welcome to</div>
            <h2 className="reco-start-welcome-title">
              GST <span className="reco-highlight">Reco</span>Manager
            </h2>
            <p className="reco-start-welcome-desc">
              Accurate Reconciliation &nbsp;|&nbsp; Better Compliance &nbsp;|&nbsp; Smarter Business
            </p>
          </div>

          {/* 4 Feature Cards (in 1 Row) */}
          <div className="reco-start-features-row">
            {FEATURE_CARDS.map((card) => (
              <div key={card.id} className="reco-start-feat-card">
                <div className={`reco-start-feat-icon ${card.badgeClass}`}>
                  {card.icon}
                </div>
                <div className="reco-start-feat-title">{card.title}</div>
              </div>
            ))}
          </div>

          {/* Professional Normal-Sized Start Button */}
          <div className="reco-start-action-wrap">
            <button 
              type="button" 
              className="reco-start-btn"
              onClick={() => navigate('/login')}
              title="Click to continue to login"
            >
              <span className="reco-start-btn-icon-circle">
                <ArrowRight size={14} strokeWidth={2.8} />
              </span>
              <span>Start</span>
              <span className="reco-start-btn-chevrons">&gt;&gt;</span>
            </button>
            <div className="reco-start-click-hint">
              Click to continue to login
            </div>
          </div>
        </div>

        {/* ================= 3. BOTTOM FOOTER SECTION ================= */}
        <div className="reco-start-footer">
          {/* Passary Group Branding */}
          <div className="reco-start-company">
            <div className="reco-start-company-badge">
              <Building2 size={22} strokeWidth={1.8} />
            </div>
            <div className="reco-start-company-info">
              <span className="reco-start-company-name">Passary Group</span>
              <span className="reco-start-company-tagline">
                Accurate Data &nbsp;|&nbsp; Better Compliance &nbsp;|&nbsp; Smarter Business
              </span>
            </div>
          </div>

          {/* Slogan & Decorative Chart Graphic */}
          <div className="reco-start-right-slogan">
            <span className="reco-start-cursive-text">
              Smarter GST for Stronger Business
            </span>
            <div className="reco-start-bars">
              <div className="reco-start-bar" style={{ height: '12px' }} />
              <div className="reco-start-bar" style={{ height: '20px' }} />
              <div className="reco-start-bar" style={{ height: '28px' }} />
              <div className="reco-start-bar" style={{ height: '38px' }} />
            </div>
          </div>
        </div>

      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="reco-modal-backdrop" onClick={() => setShowAbout(false)}>
          <div className="reco-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="reco-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#7c3aed" />
                <h3 className="reco-modal-title">About GST RecoManager</h3>
              </div>
              <button 
                type="button" 
                className="reco-modal-close" 
                onClick={() => setShowAbout(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="reco-modal-body">
              <p>
                <strong>GST RecoManager</strong> is a next-generation GST reconciliation and ITC compliance platform built for <strong>Passary Group</strong>.
              </p>
              <p>
                It streamlines invoice matching between purchase registers and GSTR-2B government filings, monitors RCM and reversal ITC, and ensures accurate tax filings.
              </p>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="reco-start-btn"
                  style={{ width: '120px', height: '40px', fontSize: '14px' }}
                  onClick={() => setShowAbout(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
