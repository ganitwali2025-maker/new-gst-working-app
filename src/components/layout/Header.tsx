// @ts-nocheck
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun, Droplet, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', sub: 'Audit intelligence overview' },
  '/liability': { title: 'Liability Dashboard', sub: 'Output GST vs Input GST, at a glance' },
  '/payment': { title: 'Payment Dashboard', sub: 'Final working ITC and Liability' },
  '/books': { title: 'Books ITC', sub: 'Central reconciliation control screen' },
  '/gstr2b': { title: 'GSTR-2B All Months', sub: 'Auto-drafted ITC statement from GSTN' },
  '/gstr2b-gov': { title: 'GSTR-2B Current Month', sub: 'Current month auto-drafted ITC statement' },
  '/rcmdata': { title: 'RCM Invoices', sub: 'Reverse charge purchases tracked separately from 2B' },
  '/reconciliation': { title: 'ITC Reconciliation', sub: 'Books vs GSTR-2B, matched line by line' },
  '/old-itc': { title: 'Old ITC', sub: 'Old ITC carried forward' },
  '/itc-not-claimed': { title: 'ITC Not Claimed', sub: 'ITC not yet claimed' },
  '/reverse-itc': { title: 'Reverse ITC', sub: 'ITC reversed' },
  '/difference-data': { title: 'Difference Data', sub: 'Discrepancies' },
  '/reports': { title: 'Reports', sub: 'Summaries built from the reconciliation' },
  '/import': { title: 'Import', sub: 'Bring in your books and GSTR-2B data' },
  '/company': { title: 'Company / GSTIN', sub: 'Manage entities you audit' },
  '/settings': { title: 'Settings', sub: 'Matching rules and data controls' },
  '/gstr1': { title: 'GSTR-1 Sales Register', sub: 'Complete sales register and outward supplies for accurate GST return filing.' }
};

export default function Topbar({ toggleSidebar }) {
  const { 
    companies, activeCompanyId, activeCompany, financialYear, month, settings, 
    updateState, toggleTheme, FY_LIST, MONTHS 
  } = useAppContext();

  const { user, logout } = useAuth();
  
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || { title: 'GST RecoManager', sub: '' };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'dark': return <Sun size={14} />;
      case 'light': return <Droplet size={14} />;
      case 'blue': return <Moon size={14} />;
      default: return <Sun size={14} />;
    }
  };

  const getThemeTitle = () => {
    switch (settings.theme) {
      case 'dark': return 'Switch to light mode';
      case 'light': return 'Switch to Tally blue mode';
      case 'blue': return 'Switch to dark mode';
      default: return 'Switch mode';
    }
  };

  return (
    <header id="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
          
        
        <div>
          <div className="page-title">{activeCompany?.name || 'GST RecoManager'}</div>
          <div className="page-sub">
            <span style={{fontWeight: 600, color: 'var(--accent)'}}>{meta.title}</span> 
            <span style={{color: 'var(--muted)', margin: '0 6px'}}>•</span> 
            {meta.sub}
            {activeCompany?.gstin && (
              <>
                <span style={{color: 'var(--muted)', margin: '0 6px'}}>•</span> 
                GSTIN: <span style={{fontFamily: 'monospace', fontWeight: 500}}>{activeCompany.gstin}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="topbar-controls">
        <button className="btn ghost" onClick={toggleTheme} title={getThemeTitle()}>
          {getThemeIcon()}
        </button>
        
        
        <select 
          className="ctrl" 
          value={financialYear}
          onChange={(e) => updateState({ financialYear: e.target.value })}
        >
          {FY_LIST.map(f => (
            <option key={f} value={f}>FY {f}</option>
          ))}
        </select>
        <select 
          className="ctrl" 
          value={month}
          onChange={(e) => updateState({ month: e.target.value })}
        >
          {MONTHS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        
        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '16px', marginLeft: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
            <div style={{ background: 'var(--panel-2)', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={14} />
            </div>
            {user?.name || user?.email || 'User'}
          </div>
          <button className="btn-action btn-clear" onClick={logout} title="Logout" style={{ padding: '0', width: '38px', height: '38px', justifyContent: 'center', marginLeft: '4px' }}>
            <LogOut size={16} />
          </button>
        </div>

      </div>
    </header>
  );
}
