import React from 'react';
import { ShoppingCart, FileText, FileDown, CheckCircle, AlertCircle, FileX, FileMinus, Copy, Activity, IndianRupee, Globe2, Landmark, MapPin, Receipt, Calculator, Banknote, BarChart2, LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  val: string | number;
  sub?: string;
  color?: string;
  icon?: LucideIcon;
  small?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export default function KpiCard({ label, val, sub, color = 'var(--accent)', icon: CustomIcon, small, onClick, active }: KpiCardProps) {
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

  // Theme constants
  const hex = 'var(--accent)';
  // Use a very soft, barely visible background instead of a bright color
  const lightHex = 'rgba(124, 58, 237, 0.05)';

  return (
    <div 
      className={`kpi ${active ? 'active' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        background: '#ffffff',
        border: active ? `1px solid ${hex}` : '1px solid #E2E8F0',
        borderRadius: '8px',
        boxShadow: active ? `0 0 0 1px ${hex}20` : '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        height: '100%',
        minHeight: '120px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px', borderRadius: '50%',
          background: lightHex,
          color: hex
        }}>
          <Icon size={16} strokeWidth={2} />
        </div>
        
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94A3B8'
        }}>
          <BarChart2 size={16} strokeWidth={2} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'flex-end' }}>
        <div style={{ fontWeight: 500, color: '#334155', fontSize: '13px', lineHeight: '1.2' }}>{label}</div>
        <div style={{ color: '#3B0764', fontWeight: 600, fontSize: '20px', lineHeight: '1.2' }}>{val}</div>
        <div style={{ color: '#64748B', fontWeight: 400, fontSize: '12px', lineHeight: '1.2' }}>{sub}</div>
      </div>
    </div>
  );
}

