import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Scale, Book, FileText, Landmark,
  ArrowRightLeft, FileBarChart, Building2, Settings, Banknote,
  ChevronDown, ChevronRight, ChevronLeft, LucideIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type NavItem = {
  id: string;
  moduleId?: string;
  path?: string;
  label: string;
  icon?: LucideIcon;
  isHeading?: boolean;
};

const NAV: NavItem[] = [
  { id: 'dashboard', moduleId: 'dashboard', path: '/dashboard', label: 'ITC Dashboard', icon: LayoutDashboard },
  { id: 'liability', moduleId: 'summary', path: '/liability', label: 'Liability Dashboard', icon: Scale },
  { id: 'payment', moduleId: 'summary', path: '/payment', label: 'Payment Dashboard', icon: Banknote },
  { id: 'reports', moduleId: 'reports', path: '/reports', label: 'GST Summary', icon: FileBarChart },
  
  { id: 'head-reco', isHeading: true, label: 'GST RECO STEP' },
  { id: 'reconciliation', moduleId: 'itc_reconciliation', path: '/reconciliation', label: 'Final Reconciliation Report', icon: ArrowRightLeft },
  { id: 'rcm-itc', moduleId: 'rcm_itc', path: '/rcm-itc', label: 'RCM ITC', icon: Landmark },
  
  { id: 'head-books', isHeading: true, label: 'BOOKS RECO' },
  { id: 'books', moduleId: 'book_itc', path: '/books', label: 'Books Reco with 2B', icon: Book },
  { id: 'old-itc', moduleId: 'old_itc', path: '/old-itc', label: 'Old ITC', icon: Book },
  { id: 'itc-not-claimed', moduleId: 'not_claimed_itc', path: '/itc-not-claimed', label: 'ITC Not Claimed', icon: Book },
  
  { id: 'head-2b', isHeading: true, label: 'GSTR-2B' },
  { id: 'gstr2b', moduleId: 'all_month_2b', path: '/gstr2b', label: 'GSTR-2B All Months', icon: FileText },
  { id: 'gstr2b-gov', moduleId: 'current_month_2b', path: '/gstr2b-gov', label: 'GSTR-2B Current Month', icon: FileText },
  
  { id: 'head-tax', isHeading: true, label: 'GST & TAX' },
  { id: 'rcmdata', moduleId: 'reverse_itc', path: '/rcmdata', label: 'RCM Invoices', icon: Landmark },
  { id: 'books-itc', moduleId: 'book_itc', path: '/books-itc', label: 'Books ITC', icon: Landmark },
  { id: 'gstr1', moduleId: 'gstr1_sales', path: '/gstr1', label: 'GST R-1', icon: Landmark },

  { id: 'head-settings', isHeading: true, label: 'SETTINGS' },
  { id: 'company', moduleId: 'settings', path: '/company', label: 'Company / GSTIN', icon: Building2 },
  { id: 'settings', moduleId: 'settings', path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const { hasModuleAccess } = useAuth();

  return (
    <aside id="sidebar">
      <button 
        onClick={toggleSidebar} 
        style={{ 
          position: 'absolute', 
          top: '27px', 
          right: isOpen ? '14px' : '20px', 
          width: '24px', 
          height: '24px', 
          background: 'transparent', 
          border: '1px solid var(--border)',
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer', 
          zIndex: 100, 
          color: 'var(--muted)', 
          boxShadow: 'none',
          transition: 'right 0.2s ease'
        }} 
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isOpen ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
      </button>
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div>
          <div className="brand-name" style={{ fontSize: '15px' }}>GST RecoManager</div>
          
        </div>
      </div>

      <nav className="navlist" id="navlist" style={{ overflowY: 'auto' }}>
        {(() => {
          // Filter items based on user's view permission
          const visibleItems = NAV.filter(item => {
            if (item.isHeading) return true;
            if (!item.moduleId) return true;
            return hasModuleAccess(item.moduleId, 'view');
          });

          // Filter out section headings if they have no visible child links under them
          const finalItems: NavItem[] = [];
          for (let idx = 0; idx < visibleItems.length; idx++) {
            const current = visibleItems[idx];
            if (current.isHeading) {
              // Check if any subsequent non-heading item exists before the next heading
              let hasChildren = false;
              for (let next = idx + 1; next < visibleItems.length; next++) {
                if (visibleItems[next].isHeading) break;
                hasChildren = true;
                break;
              }
              if (hasChildren) {
                finalItems.push(current);
              }
            } else {
              finalItems.push(current);
            }
          }

          return finalItems.map((n, i) => {
            if (n.isHeading) {
              return <div key={'head-' + i} className="nav-group-label">{n.label}</div>;
            }
            return (
              <NavLink 
                key={n.id} 
                to={n.path as string} 
                className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
              >
                {n.icon && <n.icon size={16} />}
                <span>{n.label}</span>
              </NavLink>
            );
          });
        })()}
      </nav>

    </aside>
  );
}
