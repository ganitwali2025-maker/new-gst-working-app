import React, { useState } from 'react';
import { FileText, FileDown, Layers, Search, Check, Printer, FileSpreadsheet } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fmtINR, fmtNum } from '../../utils/format';
import { useToast } from '../common/Toast';
import KpiCard from '../common/KpiCard';
import DataTable from '../common/DataTable';
import { runBooksReconciliation } from '../../utils/booksReconciliation';

export default function BooksPurchase() {
  const { currentBooks = [], currentGstr2b = [], currentGstr2bGov = [], fyGstr2b = [], settings = { tolerance: 1, normalizeInvoice: true } } = useAppContext() as any;
  const { showToast } = useToast() as any;

  const [activeTab, setActiveTab] = useState('Books Reco with 2B');
  const [searchTerm, setSearchTerm] = useState('');

  const effectiveCurrentGstr2b = (currentGstr2bGov && currentGstr2bGov.length > 0)
    ? currentGstr2bGov
    : (currentGstr2b && currentGstr2b.length > 0 ? currentGstr2b : []);

  const effectiveAllMonthsGstr2b = React.useMemo(() => {
    const map = new Map<string, any>();
    (fyGstr2b || []).forEach((r: any) => map.set(r.id, r));
    effectiveCurrentGstr2b.forEach((r: any) => map.set(r.id, r));
    return Array.from(map.values());
  }, [fyGstr2b, effectiveCurrentGstr2b]);

  const { reconRows, statusCounts, gstr2bWithStatus, allMonthsWithStatus } = runBooksReconciliation(
    currentBooks,
    effectiveCurrentGstr2b,
    effectiveAllMonthsGstr2b,
    settings.tolerance,
    settings.normalizeInvoice
  );

  // Calculate card counts
  const tallyBookCount = currentBooks.length;
  const gstr2bCount = effectiveCurrentGstr2b.length;
  let matchedCount = 0;
  let notIn2BCount = 0;
  let notMatchCount = 0;
  let reversalItcCount = 0;
  let totalReversalAmount = 0;
  let totalMatchedAmount = 0;

  const isDebitOrReversal = (r: any) => {
    const s = String(r.recoStatus || '').toLowerCase();
    const t = String(r.type || '').toLowerCase();
    const vt = String(r.voucherType || '').toLowerCase();
    const it = String(r.invoiceType || '').toLowerCase();
    const dt = String(r.docType || '').toLowerCase();
    return s.includes('reversal') || s.includes('debit') || 
      t.includes('debit') || vt.includes('debit') || it.includes('debit') || dt.includes('debit') ||
      (Number(r.taxable) < 0);
  };

  const isMatched = (r: any) => {
    const s = String(r.recoStatus || '').toLowerCase();
    return s.startsWith('match');
  };

  reconRows.forEach((r: any) => {
    if (isDebitOrReversal(r)) {
      reversalItcCount++;
      totalReversalAmount += Math.abs((Number(r.igst)||0) + (Number(r.cgst)||0) + (Number(r.sgst)||0) + (Number(r.cess)||0));
    }
  });

  Object.entries(statusCounts).forEach(([status, count]) => {
    if (status.startsWith('Matched')) {
      matchedCount += count;
    } else if (status === 'Not in 2B') {
      notIn2BCount += count;
    } else if (!status.toLowerCase().includes('reversal')) {
      notMatchCount += count;
    }
  });

  reconRows.forEach((r: any) => {
    if (r.recoStatus && r.recoStatus.startsWith('Matched')) {
      totalMatchedAmount += (Number(r.igst)||0) + (Number(r.cgst)||0) + (Number(r.sgst)||0) + (Number(r.cess)||0);
    }
  });

  const notInBookCount = gstr2bWithStatus.filter((g: any) => g.recoStatus === 'Not in Book').length;

  const applySearch = (rows: any[]) => {
    if (!searchTerm || !searchTerm.trim()) return rows;
    const lower = searchTerm.trim().toLowerCase();
    return rows.filter((r: any) => 
      (r.invoiceNo && String(r.invoiceNo).toLowerCase().includes(lower)) ||
      (r.gstin && String(r.gstin).toLowerCase().includes(lower)) ||
      (r.supplierName && String(r.supplierName).toLowerCase().includes(lower))
    );
  };

  const getCurrentTableData = () => {
    switch(activeTab) {
      case 'Books Reco with 2B': return applySearch(reconRows.filter((b: any) => !isMatched(b) && !isDebitOrReversal(b)));
      case 'Books ITC': return applySearch(currentBooks);
      case 'Government 2B': return applySearch(gstr2bWithStatus);
      case '2B All Months': return applySearch(allMonthsWithStatus);
      case 'Debit Note': return applySearch(reconRows.filter((b: any) => isDebitOrReversal(b)));
      case 'Not in Book': return applySearch(gstr2bWithStatus.filter((g: any) => g.recoStatus === 'Not in Book'));
      case 'Not in 2B': return applySearch(reconRows.filter((b: any) => b.recoStatus === 'Not in 2B'));
      case 'Match Invoice': return applySearch(reconRows.filter((b: any) => isMatched(b)));
      case 'Not Match Invoice': return applySearch(reconRows.filter((b: any) => !isMatched(b) && !isDebitOrReversal(b) && b.recoStatus !== 'Not in 2B'));
      default: return [];
    }
  };

  const handleExcelExport = () => {
    const data = getCurrentTableData();
    if (!data.length) {
      showToast('No data to export');
      return;
    }
    const headers = ['Status', 'Invoice No.', 'Date', 'Supplier GSTIN', 'Supplier Name', 'Taxable', 'IGST', 'CGST', 'SGST', 'Total'];
    const csvRows = [headers.join(',')];
    data.forEach((r: any) => {
      const status = `"${(r.recoStatus || r.status || '').replace(/"/g, '""')}"`;
      const invNo = `"${(r.invoiceNo || '').replace(/"/g, '""')}"`;
      const date = `"${(r.invoiceDate || '').replace(/"/g, '""')}"`;
      const gstin = `"${(r.gstin || '').replace(/"/g, '""')}"`;
      const supplier = `"${(r.supplierName || '').replace(/"/g, '""')}"`;
      const taxable = r.taxable || 0;
      const igst = r.igst || 0;
      const cgst = r.cgst || 0;
      const sgst = r.sgst || 0;
      const total = Number(taxable) + Number(igst) + Number(cgst) + Number(sgst) + Number(r.cess || 0);
      csvRows.push([status, invNo, date, gstin, supplier, taxable, igst, cgst, sgst, total].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 5mm; }
        @media print {
          body * { visibility: hidden !important; }
          .print-section, .print-section * { visibility: visible !important; }
          .print-section { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-header { display: block !important; margin-bottom: 10px; font-size: 16px; font-weight: bold; color: #000; text-align: center; }
          .no-print, .no-print * { display: none !important; }
          
          /* Force table to fit */
          table { width: 100% !important; border-collapse: collapse; font-size: 9px !important; table-layout: auto; }
          th, td { border: 1px solid #000 !important; padding: 3px 4px !important; text-align: left; color: #000 !important; white-space: normal !important; word-wrap: break-word !important; }
          th { background: #f0f0f0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          
          /* Special widths for long columns */
          th:nth-child(5), td:nth-child(5) { max-width: 150px; } /* Supplier Name */
        }
        .print-header { display: none; }
      `}</style>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '16px' }}>
            <KpiCard small label="Books / 2B Invoices" val={`${fmtNum(tallyBookCount)} / ${fmtNum(gstr2bCount)}`} sub="Total records" color="var(--blue)" />
            <KpiCard small label="Match / Not Match" val={`${fmtNum(matchedCount)} / ${fmtNum(notMatchCount)}`} sub="Mismatches excluded" color="var(--yellow)" />
            <KpiCard small label="Not in Book / Not in 2B" val={`${fmtNum(notInBookCount)} / ${fmtNum(notIn2BCount)}`} sub="Missing records" color="var(--purple)" />
            <KpiCard small label="Reversal ITC (Debit Note)" val={fmtNum(reversalItcCount)} sub={`Amount: -${fmtINR(totalReversalAmount)}`} color="var(--red)" />
            <KpiCard small label="Net Eligible ITC" val={fmtINR(totalMatchedAmount - totalReversalAmount)} sub="Matched - Reversals" color="var(--green)" />
          </div>
          

      <div className="sticky-dashboard-header" style={{ 
        background: '#fff', 
        border: '1px solid #e2e8f0', 
        borderBottom: 'none',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        marginBottom: 0,
        overflow: 'hidden'
      }}>
        {/* Top Banner Area */}
        <div style={{
          background: '#f8f4ff',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          height: '92px',
          boxSizing: 'border-box'
        }}>
          <div style={{ position: 'absolute', right: '10%', top: '0', width: '200px', height: '100%', background: 'linear-gradient(135deg, transparent 40%, rgba(139,92,246,0.1) 50%, transparent 60%)', transform: 'skewX(-20deg)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              background: '#5a189a', 
              width: '52px', height: '52px', borderRadius: '12px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              position: 'relative',
              boxShadow: '0 4px 10px rgba(109, 40, 217, 0.3)'
            }}>
              <FileText size={26} strokeWidth={1.5} />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#10b981', borderRadius: '50%', padding: '3px', color: '#fff', border: '2px solid #fdfcff' }}>
                <Check size={14} strokeWidth={3} />
              </div>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#310d6e', letterSpacing: '0.2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                GST <span style={{ color: '#a855f7' }}>RECO</span> MANAGER
              </h1>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginTop: '2px' }}>
                Automated Reconciliation of Purchase Books with GSTR-2B to Maximize Eligible ITC Claims
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '0 12px', gap: '8px' }}>
              <Search size={16} color="#7b2cbf" />
              <input 
                type="text" 
                placeholder="Search invoice / GSTIN..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ border: 'none', outline: 'none', padding: '9px 0', fontSize: '13px', width: '200px', color: '#1f2937' }} 
              />
            </div>
            <button onClick={() => window.print()} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px',
              background: '#5a189a', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(90, 24, 154, 0.3)', fontSize: '14px', transition: 'all 0.2s'
            }}>
              <Printer size={16} /> Print
            </button>
            <button onClick={handleExcelExport} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px',
              background: '#5a189a', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(90, 24, 154, 0.3)', fontSize: '14px', transition: 'all 0.2s'
            }}>
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>
        </div>
        
        {/* Bottom Tabs Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#fff', borderTop: '1px solid #f1f5f9', height: '61px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'Books Reco with 2B', icon: Layers, label: 'Books Reco with 2B' },
              { id: 'Books ITC', icon: FileText, label: 'Books ITC' },
              { id: 'Government 2B', icon: FileDown, label: 'Government 2B' },
              { id: '2B All Months', icon: Layers, label: '2B All Months' },
              { id: 'Debit Note', icon: FileText, label: 'Debit Note' },
              { id: 'Not in Book', icon: FileDown, label: 'Not in Book' },
              { id: 'Not in 2B', icon: Layers, label: 'Not in 2B' },
              { id: 'Match Invoice', icon: Check, label: 'Match Invoice' },
              { id: 'Not Match Invoice', icon: Layers, label: 'Not Match Invoice' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #7b2cbf' : '1px solid #e9d5ff',
                    background: isActive ? '#7b2cbf' : '#fff',
                    color: isActive ? '#fff' : '#7b2cbf',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px',
                    boxShadow: isActive ? '0 4px 6px -1px rgba(123, 44, 191, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} /> {tab.label}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-7px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '7px solid transparent',
                      borderRight: '7px solid transparent',
                      borderTop: '7px solid #6d28d9'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel reco-table-container" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
        <div className="print-section">
          <div className="print-header">GST RECO MANAGER - {activeTab}</div>
          {activeTab === 'Books Reco with 2B' && <DataTable rows={getCurrentTableData()} isBooks={true} isRcm={false} type={undefined} dataType="books" />}
          {activeTab === 'Books ITC' && <DataTable rows={getCurrentTableData()} isBooks={true} isRcm={false} type="books" dataType="books" />}
          {activeTab === 'Government 2B' && <DataTable rows={getCurrentTableData()} isBooks={false} isRcm={false} type={undefined} dataType="g2b" />}
          {activeTab === '2B All Months' && <DataTable rows={getCurrentTableData()} isBooks={false} isRcm={false} type={undefined} dataType="g2b" />}
          {activeTab === 'Debit Note' && <DataTable rows={getCurrentTableData()} isBooks={true} isRcm={false} type={undefined} dataType="books" />}
          {activeTab === 'Not in Book' && <DataTable rows={getCurrentTableData()} isBooks={false} isRcm={false} type={undefined} dataType="g2b" />}
          {activeTab === 'Not in 2B' && <DataTable rows={getCurrentTableData()} isBooks={true} isRcm={false} type={undefined} dataType="books" />}
          {activeTab === 'Match Invoice' && <DataTable rows={getCurrentTableData()} isBooks={true} isRcm={false} type={undefined} dataType="books" />}
          {activeTab === 'Not Match Invoice' && <DataTable rows={getCurrentTableData()} isBooks={true} isRcm={false} type={undefined} dataType="books" />}
        </div>
      </div>
    </>
  );
}
