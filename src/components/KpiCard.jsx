import React from 'react';
import { ShoppingCart, FileText, FileDown, CheckCircle, AlertCircle, FileX, FileMinus, Copy, Activity, IndianRupee, Globe2, Landmark, MapPin, Receipt, Calculator, Banknote } from 'lucide-react';

export default function KpiCard({ label, val, sub, color = 'var(--accent)', icon: CustomIcon, small, onClick, active }) {
  let Icon = CustomIcon;
  if (!Icon) {
    const l = (label || '').toLowerCase();
    if (l.includes('taxable')) Icon = Calculator;
    else if (l.includes('igst')) Icon = Globe2;
    else if (l.includes('cgst')) Icon = Landmark;
    else if (l.includes('sgst')) Icon = MapPin;
    else if (l === 'total gst' || l === 'gst') Icon = IndianRupee;
    else if (l.includes('purchase')) Icon = ShoppingCart;
    else if (l.includes('matched')) Icon = CheckCircle;
    else if (l.includes('mismatch')) Icon = AlertCircle;
    else if (l.includes('missing in 2b') || l.includes('not in 2b')) Icon = FileMinus;
    else if (l.includes('missing in books') || l.includes('not in books')) Icon = FileX;
    else if (l.includes('duplicate')) Icon = Copy;
    else if (l.includes('gstr-2b')) Icon = FileDown;
    else if (l.includes('books')) Icon = FileText;
    else Icon = Activity;
  }

  const getGradient = (c) => {
    if(c.includes('accent')) return 'linear-gradient(135deg, #f5f3ff, #ede9fe)';
    if(c.includes('blue')) return 'linear-gradient(135deg, #eff6ff, #dbeafe)';
    if(c.includes('green')) return 'linear-gradient(135deg, #ecfdf5, #d1fae5)';
    if(c.includes('yellow')) return 'linear-gradient(135deg, #fffbeb, #fef3c7)';
    if(c.includes('purple')) return 'linear-gradient(135deg, #faf5ff, #f3e8ff)';
    if(c.includes('red')) return 'linear-gradient(135deg, #fef2f2, #fee2e2)';
    return 'var(--panel)';
  }

  const getIconGradient = (c) => {
    if(c.includes('accent')) return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    if(c.includes('blue')) return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    if(c.includes('green')) return 'linear-gradient(135deg, #10b981, #059669)';
    if(c.includes('yellow')) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    if(c.includes('purple')) return 'linear-gradient(135deg, #a855f7, #9333ea)';
    if(c.includes('red')) return 'linear-gradient(135deg, #ef4444, #dc2626)';
    return c;
  }

  const getGlow = (c) => {
    if(c.includes('accent') || c.includes('purple')) return '0 8px 24px rgba(124, 58, 237, 0.2)';
    if(c.includes('blue')) return '0 8px 24px rgba(59, 130, 246, 0.2)';
    if(c.includes('green')) return '0 8px 24px rgba(16, 185, 129, 0.2)';
    if(c.includes('yellow')) return '0 8px 24px rgba(245, 158, 11, 0.2)';
    if(c.includes('red')) return '0 8px 24px rgba(239, 68, 68, 0.2)';
    return '0 8px 24px rgba(0,0,0,0.08)';
  }

  const badgeSize = small ? '34px' : '44px';
  const iconSize = small ? 16 : 22;

  return (
    <div 
      className={`kpi ${small ? 'small' : ''} ${active ? 'active' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        background: 'var(--panel)',
        border: 'none',
        borderTop: `4px solid ${color.includes('var(') ? color : 'var(--accent)'}`,
        transform: active ? 'scale(1.02)' : undefined,
        boxShadow: getGlow(color),
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: badgeSize, height: badgeSize, borderRadius: '12px',
          background: getIconGradient(color),
          color: '#ffffff',
          marginBottom: small ? '10px' : '14px',
          boxShadow: getGlow(color)
        }}>
          <Icon size={iconSize} strokeWidth={2.5} />
        </div>
        <div className="lbl" style={{ fontWeight: 600, color: 'var(--text-main)' }}>{label}</div>
        <div className="val" style={{ color: color.includes('var(') ? color : 'var(--accent)', textShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>{val}</div>
        <div className="delta" style={{ color: 'var(--muted)', fontWeight: 500 }}>{sub}</div>
      </div>
    </div>
  );
}
