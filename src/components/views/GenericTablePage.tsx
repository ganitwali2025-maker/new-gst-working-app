import React, { useState } from 'react';
import { Upload, Save, Lock, Unlock, Trash2, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import DataTable from '../common/DataTable';
import KpiCard from '../common/KpiCard';
import ImportBox from '../common/ImportBox';
import { fmtINR } from '../../utils/format';
import { taxTotal } from '../../utils/invoice';

export default function GenericTablePage({ title, hint, type = 'books' }) {
      const { activeCompany, month, financialYear, currentBooks, currentGstr2b, currentGstr2bGov, currentGstr1, updateState, gstr1, activeCompanyId, checkIsLocked, toggleLock, clearCurrentPeriod, fetchGstr1FromSheets, fetchBooksFromSheets, fetchGstr2bGovFromSheets, syncGstr1ToSheets, syncBooksToSheets, syncGstr2bGovToSheets } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  
    React.useEffect(() => {
    if (type === 'gstr1') fetchGstr1FromSheets(); else if (type === 'books') fetchBooksFromSheets(); else if (type === 'g2b_gov') fetchGstr2bGovFromSheets();
  }, [type, activeCompanyId]);
  
  const isLocked = checkIsLocked(type);
  
  let rows = [];
    if (type === 'books') rows = currentBooks;
  else if (type === 'g2b') rows = currentGstr2b; else if (type === 'g2b_gov') rows = currentGstr2bGov || [];
  else if (type === 'gstr1') rows = currentGstr1;
  rows = rows || [];

  const totalTaxable = rows.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const totalIgst = rows.reduce((a, r) => a + Number(r.igst || 0), 0);
  const totalCgst = rows.reduce((a, r) => a + Number(r.cgst || 0), 0);
  const totalSgst = rows.reduce((a, r) => a + Number(r.sgst || 0), 0);
  const totalGst = rows.reduce((a, r) => a + taxTotal(r), 0);

      const handlePullFromSheets = async () => {
    setIsSyncing(true);
    try {
      if (type === 'gstr1') await fetchGstr1FromSheets(); if (type === 'books') await fetchBooksFromSheets(); if (type === 'g2b_gov') await fetchGstr2bGovFromSheets();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <KpiCard small label="Total Taxable" val={fmtINR(totalTaxable)} sub={"Sum for " + (month || "this period")} color="var(--accent)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub={"Integrated GST (" + month + ")"} color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub={"Central GST (" + month + ")"} color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub={"State GST (" + month + ")"} color="var(--yellow)" />
        <KpiCard small label="Total GST" val={fmtINR(totalGst)} sub="All taxes combined" color="var(--accent)" />
      </div>

      <div className="panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sheet-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>
            </div>
            <div>
              <h3 className="sheet-title">
                {title} {isLocked && <Lock size={16} color="var(--accent)" style={{marginLeft: '8px'}}/>}
              </h3>
              <div className="sheet-subtitle">{hint || `${activeCompany?.name || 'Company'} | ${month} FY${financialYear}`}</div>
            </div>
          </div>
          <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
            <button className="btn-action btn-lock" onClick={() => toggleLock(type)}>
              <span className="icon-wrapper">
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </span>
              <span>{isLocked ? "Locked" : "Lock Sheet"}</span>
            </button>
            {['gstr1', 'books', 'g2b_gov'].includes(type) && !isLocked && (
              <button className="btn-action btn-clear" onClick={() => { if (window.confirm(`Are you sure you want to clear data for ${month} ${financialYear}?`)) { clearCurrentPeriod(type); } }}><span className="icon-wrapper"><Trash2 size={16} /></span><span>Clear Data</span></button>
            )}
            {['gstr1', 'books', 'g2b_gov'].includes(type) && (
              <button className="btn-action btn-refresh" onClick={handlePullFromSheets} disabled={isSyncing}><span className="icon-wrapper"><RefreshCw size={16} /></span><span>{isSyncing ? "Refreshing..." : "Refresh"}</span></button>
            )}
            {['gstr1', 'books', 'g2b_gov'].includes(type) && !isLocked && (
              <ImportBox target={type} />
            )}
          </div>
        </div>
        <DataTable rows={rows} isBooks={type === 'books'} type={type} dataType={!isLocked ? type : null} />
      </div>
    </>
  );
}








