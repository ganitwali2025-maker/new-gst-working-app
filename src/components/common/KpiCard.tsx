import React from 'react';
import { ShoppingCart, FileText, FileDown, CheckCircle, AlertCircle, FileX, FileMinus, Copy, Activity, IndianRupee, Globe2, Landmark, MapPin, Receipt, Calculator, Banknote, BarChart2 } from 'lucide-react';

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

  let hex = '#7C3AED';

  const badgeSize = small ? '34px' : '44px';
  const iconSize = small ? 16 : 22;

  return (
    <div 
      className={`kpi ${small ? 'small' : ''} ${active ? 'active' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        background: '#ffffff',
        border: `1px solid ${hex}40`,
        borderRadius: '12px',
        transform: active ? 'scale(1.02)' : undefined,
        boxShadow: active ? `0 8px 24px ${hex}30` : `0 2px 8px ${hex}15`,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
      }}
    >


      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: badgeSize, height: badgeSize, borderRadius: '50%',
          background: hex,
          color: '#ffffff',
          boxShadow: `0 4px 10px ${hex}40`
        }}>
          <Icon size={iconSize} strokeWidth={2.5} />
        </div>
        
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '28px', height: '28px', borderRadius: '8px',
          background: `${hex}15`,
          color: hex
        }}>
          <BarChart2 size={16} />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="lbl" style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px', marginBottom: '4px' }}>{label}</div>
        <div className="val" style={{ color: hex, fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em', marginBottom: '4px' }}>{val}</div>
        <div className="delta" style={{ color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{sub}</div>
      </div>
    </div>
  );
}

