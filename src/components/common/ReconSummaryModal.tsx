import React from 'react';
import { 
  X, Link2, Calculator, Landmark, Calendar, BookOpen, 
  User, CreditCard, FileText, IndianRupee, Percent, Info, CalendarDays
} from 'lucide-react';

interface ReconSummaryModalProps {
  row: any;
  onClose: () => void;
}

function NotFoundDocIcon() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
        <div style={{ width: '12px', height: '3px', background: '#c4b5fd', borderRadius: '2px' }} />
        <div style={{ width: '18px', height: '3px', background: '#c4b5fd', borderRadius: '2px' }} />
      </div>
      <div style={{
        width: '76px',
        height: '76px',
        borderRadius: '50%',
        background: '#ede9fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7c3aed'
      }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <circle cx="11.5" cy="14.5" r="3" />
          <path d="m13.7 16.7 2.8 2.8" />
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
        <div style={{ width: '18px', height: '3px', background: '#c4b5fd', borderRadius: '2px' }} />
        <div style={{ width: '12px', height: '3px', background: '#c4b5fd', borderRadius: '2px' }} />
      </div>
    </div>
  );
}

const fmtCurrency = (n: any, forceDecimals = false) => {
  if (n === null || n === undefined || isNaN(Number(n))) return '—';
  const num = Number(n);
  if (num === 0) return '₹ 0';
  const hasDec = num % 1 !== 0 || forceDecimals;
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: hasDec ? 2 : 0
  });
  return `₹ ${formatted}`;
};

const checkNumberMismatch = (b: any, g: any, tolerance = 1) => {
  if (b === undefined || b === null || g === undefined || g === null) return false;
  return Math.abs((Number(b) || 0) - (Number(g) || 0)) > tolerance;
};

const checkStringMismatch = (b: any, g: any) => {
  if (!b || !g || b === '—' || g === '—') return false;
  return String(b).trim().toLowerCase() !== String(g).trim().toLowerCase();
};

const checkDateMismatch = (bDate: any, gDate: any) => {
  if (!bDate || !gDate || bDate === '—' || gDate === '—') return false;
  const cleanB = String(bDate).trim().replace(/[^0-9]/g, '');
  const cleanG = String(gDate).trim().replace(/[^0-9]/g, '');
  if (!cleanB || !cleanG) return false;
  return cleanB !== cleanG;
};

const DetailRow = ({ 
  icon: Icon, 
  label, 
  value, 
  isMismatch = false, 
  isMonospace = false 
}: { 
  icon: any; 
  label: string; 
  value: React.ReactNode; 
  isMismatch?: boolean; 
  isMonospace?: boolean; 
}) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9.5px 18px',
    borderBottom: '1px solid #f8fafc',
    fontSize: '13px',
    gap: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', flexShrink: 0 }}>
      {Icon && <Icon size={15} strokeWidth={2} style={{ color: '#94a3b8' }} />}
      <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
    <div style={{
      fontSize: '13px',
      fontWeight: 700,
      color: isMismatch ? '#ef4444' : '#0f172a',
      fontFamily: isMonospace ? 'monospace' : 'inherit',
      textAlign: 'right',
      lineHeight: 1.3
    }}>
      {value}
    </div>
  </div>
);

export default function ReconSummaryModal({ row, onClose }: ReconSummaryModalProps) {
  if (!row) return null;

  const reconData = row.reconData || row;

  // 1. Books Values
  const bSupplier = row.supplierName || reconData.supplierName || '—';
  const bGstin = row.gstin || reconData.gstin || '—';
  const bDate = row.invoiceDate || row.date || reconData.invoiceDate || '—';
  const bInvNo = row.invoiceNo || reconData.invoiceNo || '—';
  const bTaxable = Number(row.taxable ?? reconData.booksTaxable ?? row.booksTaxable ?? 0);
  const bIgst = Number(row.igst ?? reconData.booksIgst ?? row.booksIgst ?? 0);
  const bCgst = Number(row.cgst ?? reconData.booksCgst ?? row.booksCgst ?? 0);
  const bSgst = Number(row.sgst ?? reconData.booksSgst ?? row.booksSgst ?? 0);
  const bCess = Number(row.cess ?? reconData.booksCess ?? row.booksCess ?? 0);
  const bTax = (row.booksTax != null) ? Number(row.booksTax) : (bIgst + bCgst + bSgst + bCess);

  // 2. Govt 2B Current Month Values
  const hasG2bCurrent = Boolean(reconData.g2bId);
  const gSupplier = reconData.g2bSupplierName || reconData.supplierName || bSupplier;
  const gGstin = reconData.g2bGstin || reconData.gstin || bGstin;
  const gDate = reconData.g2bInvoiceDate || reconData.invoiceDate || bDate;
  const gInvNo = reconData.g2bInvoiceNo || reconData.invoiceNo || bInvNo;
  const gTaxable = hasG2bCurrent ? Number(reconData.g2bTaxable ?? 0) : null;
  const gIgst = hasG2bCurrent ? Number(reconData.g2bIgst ?? 0) : null;
  const gCgst = hasG2bCurrent ? Number(reconData.g2bCgst ?? 0) : null;
  const gSgst = hasG2bCurrent ? Number(reconData.g2bSgst ?? 0) : null;
  const gTax = hasG2bCurrent ? Number(reconData.g2bTax ?? ((gIgst || 0) + (gCgst || 0) + (gSgst || 0))) : 0;

  // 3. Govt 2B All Months Values
  const hasG2bAll = Boolean(reconData.g2bAllId);
  const gAllSupplier = reconData.g2bAllSupplierName || reconData.supplierName || bSupplier;
  const gAllGstin = reconData.g2bAllGstin || reconData.gstin || bGstin;
  const gAllDate = reconData.g2bAllInvoiceDate || reconData.invoiceDate || bDate;
  const gAllInvNo = reconData.g2bAllInvoiceNo || reconData.invoiceNo || bInvNo;
  const gAllTaxable = hasG2bAll ? Number(reconData.g2bAllTaxable ?? reconData.g2bTaxable ?? 0) : null;
  const gAllIgst = hasG2bAll ? Number(reconData.g2bAllIgst ?? reconData.g2bIgst ?? 0) : null;
  const gAllCgst = hasG2bAll ? Number(reconData.g2bAllCgst ?? reconData.g2bCgst ?? 0) : null;
  const gAllSgst = hasG2bAll ? Number(reconData.g2bAllSgst ?? reconData.g2bSgst ?? 0) : null;
  const gAllTax = hasG2bAll ? Number(reconData.g2bAllTax ?? reconData.g2bTax ?? ((gAllIgst || 0) + (gAllCgst || 0) + (gAllSgst || 0))) : 0;

  // Status computation for badges
  const isMatchCurrent = hasG2bCurrent && Math.abs(bTax - gTax) <= 1;
  const isMatchAll = hasG2bAll && Math.abs(bTax - gAllTax) <= 1;

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(15, 23, 42, 0.45)', 
        zIndex: 99999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backdropFilter: 'blur(6px)',
        padding: '16px'
      }} 
      onClick={onClose}
    >
      <div 
        style={{ 
          background: '#ffffff', 
          width: '1380px', 
          maxWidth: '96vw', 
          borderRadius: '20px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '94vh', 
          border: '1px solid #e9d5ff'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* 1. Modal Top Header */}
        <div style={{ 
          padding: '22px 28px 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: '#f3e8ff', 
              color: '#7c3aed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Link2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#1e1b4b', fontWeight: 800, letterSpacing: '-0.02em' }}>
                GST Reconciliation Summary
              </h2>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '3px', fontWeight: 500 }}>
                Book Entry vs GSTR-2B &mdash; Current Month &amp; All Months
              </div>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              width: '36px',
              height: '36px',
              background: '#f5f3ff', 
              border: '1px solid #ede9fe', 
              cursor: 'pointer', 
              color: '#6b21a8',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2. Top Summary KPI Strip (3 Cards) */}
        <div style={{ padding: '0 28px 16px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px',
            background: '#fcfaff',
            padding: '12px 14px',
            borderRadius: '14px',
            border: '1px solid #f1f5f9'
          }}>
            {/* KPI 1: Book Tax */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '12px', 
              padding: '12px 16px', 
              border: '1px solid #f1f5f9',
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: '#dcfce7', 
                color: '#16a34a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Calculator size={19} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Book Tax:</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>
                  {fmtCurrency(bTax, true)}
                </div>
              </div>
            </div>

            {/* KPI 2: Current Month 2B */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '12px', 
              padding: '12px 16px', 
              border: '1px solid #f1f5f9',
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: '#ede9fe', 
                color: '#6366f1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Landmark size={19} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Current Month 2B:</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 800, 
                  color: hasG2bCurrent ? (isMatchCurrent ? '#15803d' : '#7c3aed') : '#ef4444' 
                }}>
                  {hasG2bCurrent ? fmtCurrency(gTax, true) : 'Not Found'}
                </div>
              </div>
            </div>

            {/* KPI 3: All Months 2B */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '12px', 
              padding: '12px 16px', 
              border: '1px solid #f1f5f9',
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: '#ede9fe', 
                color: '#7c3aed', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Calendar size={19} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>All Months 2B:</div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 800, 
                  color: hasG2bAll ? (isMatchAll ? '#15803d' : '#7c3aed') : '#ef4444' 
                }}>
                  {hasG2bAll ? fmtCurrency(gAllTax, true) : 'Not Found'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Main 3 Comparison Columns Grid */}
        <div style={{ padding: '0 28px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px', alignItems: 'stretch' }}>
            
            {/* Column 1: Books Entry */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '14px', 
              border: '1.5px solid #22c55e', 
              overflow: 'hidden', 
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{ 
                padding: '14px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #f1f5f9' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    background: '#16a34a', 
                    color: '#ffffff', 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <BookOpen size={17} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Books Entry</h3>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Invoice from Your Books</div>
                  </div>
                </div>

                <span style={{ 
                  background: '#dcfce7', 
                  color: '#16a34a', 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '3px 10px', 
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                  Matched in Books
                </span>
              </div>

              {/* Rows */}
              <div style={{ flex: 1, padding: '4px 0' }}>
                <DetailRow icon={User} label="Supplier" value={bSupplier} />
                <DetailRow icon={CreditCard} label="GSTIN" value={bGstin} isMonospace />
                <DetailRow icon={Calendar} label="Invoice Date" value={bDate} />
                <DetailRow icon={FileText} label="Invoice No." value={bInvNo} />
                <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtCurrency(bTaxable)} />
                <DetailRow icon={Percent} label="IGST" value={fmtCurrency(bIgst)} />
                <DetailRow icon={Percent} label="CGST" value={fmtCurrency(bCgst)} />
                <DetailRow icon={Percent} label="SGST" value={fmtCurrency(bSgst)} />
              </div>

              {/* Total Footer */}
              <div style={{ 
                background: '#f0fdf4', 
                borderTop: '1px solid #bbf7d0', 
                padding: '13px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 800, fontSize: '14.5px' }}>
                  <Calculator size={18} /> Total Tax
                </div>
                <div style={{ fontSize: '16.5px', fontWeight: 800, color: '#16a34a' }}>
                  {fmtCurrency(bTax, false)}
                </div>
              </div>
            </div>

            {/* Column 2: Govt 2B (Current Month) */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '14px', 
              border: '1.5px solid #c4b5fd', 
              overflow: 'hidden', 
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{ 
                padding: '14px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #f1f5f9' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    background: '#7c3aed', 
                    color: '#ffffff', 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Landmark size={17} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Govt 2B (Current Month)</h3>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Data from Government 2B</div>
                  </div>
                </div>

                {hasG2bCurrent ? (
                  <span style={{ 
                    background: isMatchCurrent ? '#dcfce7' : '#fef3c7', 
                    color: isMatchCurrent ? '#16a34a' : '#d97706', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 10px', 
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isMatchCurrent ? '#16a34a' : '#d97706' }}></span>
                    {isMatchCurrent ? 'Matched' : 'Mismatch'}
                  </span>
                ) : (
                  <span style={{ 
                    background: '#fee2e2', 
                    color: '#dc2626', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 10px', 
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }}></span>
                    Not Found
                  </span>
                )}
              </div>

              {/* Body */}
              {hasG2bCurrent ? (
                <div style={{ flex: 1, padding: '4px 0' }}>
                  <DetailRow icon={User} label="Supplier" value={gSupplier} isMismatch={checkStringMismatch(bSupplier, gSupplier)} />
                  <DetailRow icon={CreditCard} label="GSTIN" value={gGstin} isMonospace isMismatch={checkStringMismatch(bGstin, gGstin)} />
                  <DetailRow icon={Calendar} label="Invoice Date" value={gDate} isMismatch={checkDateMismatch(bDate, gDate)} />
                  <DetailRow icon={FileText} label="Invoice No." value={gInvNo} isMismatch={checkStringMismatch(bInvNo, gInvNo)} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtCurrency(gTaxable)} isMismatch={checkNumberMismatch(bTaxable, gTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtCurrency(gIgst)} isMismatch={checkNumberMismatch(bIgst, gIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtCurrency(gCgst)} isMismatch={checkNumberMismatch(bCgst, gCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtCurrency(gSgst)} isMismatch={checkNumberMismatch(bSgst, gSgst)} />
                </div>
              ) : (
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '28px 18px 16px' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <NotFoundDocIcon />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                      Not found in 2B Current Month
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '240px', lineHeight: 1.4 }}>
                      This invoice is not available in government 2B for the current month.
                    </div>
                  </div>

                  {/* Possible Reasons Box */}
                  <div style={{ 
                    background: '#f5f3ff', 
                    borderRadius: '10px', 
                    padding: '12px 14px', 
                    width: '100%',
                    marginTop: '20px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}>
                    <Info size={17} style={{ color: '#4f46e5', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#3730a3', marginBottom: '4px' }}>
                        Possible Reasons:
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#475569', lineHeight: 1.5 }}>
                        <li>Invoice not reported by supplier yet</li>
                        <li>Different return period</li>
                        <li>Data not available in current month 2B</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Footer */}
              <div style={{ 
                background: '#f8fafc', 
                borderTop: '1px solid #e2e8f0', 
                padding: '13px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4c1d95', fontWeight: 800, fontSize: '14.5px' }}>
                  <Calculator size={18} /> Total Tax (2B)
                </div>
                <div style={{ fontSize: '16.5px', fontWeight: 800, color: '#4c1d95' }}>
                  {hasG2bCurrent ? fmtCurrency(gTax, false) : '₹ 0'}
                </div>
              </div>
            </div>

            {/* Column 3: Govt 2B (All Months) */}
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '14px', 
              border: '1.5px solid #c4b5fd', 
              overflow: 'hidden', 
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <div style={{ 
                padding: '14px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid #f1f5f9' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    background: '#7c3aed', 
                    color: '#ffffff', 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <CalendarDays size={17} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Govt 2B (All Months)</h3>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Data from Government 2B (All Months)</div>
                  </div>
                </div>

                {hasG2bAll ? (
                  <span style={{ 
                    background: isMatchAll ? '#dcfce7' : '#fef3c7', 
                    color: isMatchAll ? '#16a34a' : '#d97706', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 10px', 
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isMatchAll ? '#16a34a' : '#d97706' }}></span>
                    {isMatchAll ? 'Matched' : 'Mismatch'}
                  </span>
                ) : (
                  <span style={{ 
                    background: '#fee2e2', 
                    color: '#dc2626', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 10px', 
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626' }}></span>
                    Not Found
                  </span>
                )}
              </div>

              {/* Body */}
              {hasG2bAll ? (
                <div style={{ flex: 1, padding: '4px 0' }}>
                  <DetailRow icon={User} label="Supplier" value={gAllSupplier} isMismatch={checkStringMismatch(bSupplier, gAllSupplier)} />
                  <DetailRow icon={CreditCard} label="GSTIN" value={gAllGstin} isMonospace isMismatch={checkStringMismatch(bGstin, gAllGstin)} />
                  <DetailRow icon={Calendar} label="Invoice Date" value={gAllDate} isMismatch={checkDateMismatch(bDate, gAllDate)} />
                  <DetailRow icon={FileText} label="Invoice No." value={gAllInvNo} isMismatch={checkStringMismatch(bInvNo, gAllInvNo)} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtCurrency(gAllTaxable)} isMismatch={checkNumberMismatch(bTaxable, gAllTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtCurrency(gAllIgst)} isMismatch={checkNumberMismatch(bIgst, gAllIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtCurrency(gAllCgst)} isMismatch={checkNumberMismatch(bCgst, gAllCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtCurrency(gAllSgst)} isMismatch={checkNumberMismatch(bSgst, gAllSgst)} />
                </div>
              ) : (
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '28px 18px 16px' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <NotFoundDocIcon />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                      Not found in 2B All Months
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '240px', lineHeight: 1.4 }}>
                      This invoice is not available in government 2B (all months).
                    </div>
                  </div>

                  {/* Possible Reasons Box */}
                  <div style={{ 
                    background: '#f5f3ff', 
                    borderRadius: '10px', 
                    padding: '12px 14px', 
                    width: '100%',
                    marginTop: '20px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start'
                  }}>
                    <Info size={17} style={{ color: '#4f46e5', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#3730a3', marginBottom: '4px' }}>
                        Possible Reasons:
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#475569', lineHeight: 1.5 }}>
                        <li>Invoice not reported by supplier yet</li>
                        <li>Different return period</li>
                        <li>Data not available in all months 2B</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Footer */}
              <div style={{ 
                background: '#f8fafc', 
                borderTop: '1px solid #e2e8f0', 
                padding: '13px 18px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4c1d95', fontWeight: 800, fontSize: '14.5px' }}>
                  <Calculator size={18} /> Total Tax (2B)
                </div>
                <div style={{ fontSize: '16.5px', fontWeight: 800, color: '#4c1d95' }}>
                  {hasG2bAll ? fmtCurrency(gAllTax, false) : '₹ 0'}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
