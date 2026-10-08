import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fmtINR, fmtNum } from '../../utils/format';
import { taxTotal } from '../../utils/invoice';
import { useToast } from '../common/Toast';
import KpiCard from '../common/KpiCard';
import DataTable from '../common/DataTable';
import ImportBox from '../common/ImportBox';

export default function RcmData() {
  const navigate = useNavigate();
  const { currentRcm, activeCompany, activeCompanyId, month, financialYear, clearCurrentPeriod, checkIsLocked, toggleLock, fetchRcmFromSheets } = useAppContext();
  const { showToast } = useToast();
  
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (fetchRcmFromSheets) fetchRcmFromSheets();
  }, [activeCompanyId]);

  const total = currentRcm.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const totalIgst = currentRcm.reduce((a, r) => a + Number(r.igst || 0), 0);
  const totalCgst = currentRcm.reduce((a, r) => a + Number(r.cgst || 0), 0);
  const totalSgst = currentRcm.reduce((a, r) => a + Number(r.sgst || 0), 0);
  const tax = currentRcm.reduce((a, r) => a + taxTotal(r), 0);

  const isLocked = checkIsLocked('rcm');

  const handleClear = () => {
    if (!window.confirm('Remove all RCM rows for this company & period?')) return;
    clearCurrentPeriod('rcm');
    showToast('Period data cleared');
  };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <KpiCard small label="Total Taxable" val={fmtINR(total)} sub={"Sum for " + (month || "this period")} color="var(--accent)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub="Integrated GST" color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub="Central GST" color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub="State GST" color="var(--yellow)" />
        <KpiCard small label="Total Tax Payable" val={fmtINR(tax)} sub="Total RCM Tax" color="var(--accent)" />
      </div>
      
      <div className="panel">
        <div className="panel-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sheet-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>
            </div>
            <div>
              <h3 className="sheet-title">RCM Invoices {isLocked && <Lock size={16} color="var(--accent)" style={{marginLeft: '8px'}}/>}</h3>
              <div className="sheet-subtitle">{activeCompany?.name || 'No company selected'} | {month} FY{financialYear}</div>
            </div>
          </div>
          <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
            <button className="btn-action btn-lock" onClick={() => toggleLock('rcm')}>
              <span className="icon-wrapper">
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </span>
              <span>{isLocked ? 'Locked' : 'Lock Sheet'}</span>
            </button>
            
            {!isLocked && (
              <button className="btn-action btn-clear" onClick={handleClear}>
              <span className="icon-wrapper"><Trash2 size={16} /></span>
              <span>Clear Data</span>
            </button>
            )}

            <button className="btn-action btn-refresh" onClick={async () => {
              setIsSyncing(true);
              try {
                if (fetchRcmFromSheets) await fetchRcmFromSheets();
                showToast('RCM data refreshed from Sheets');
              } finally {
                setIsSyncing(false);
              }
            }} disabled={isSyncing}>
              <span className="icon-wrapper"><RefreshCw size={16} /></span>
              <span>{isSyncing ? "Refreshing..." : "Refresh"}</span>
            </button>
            
            {!isLocked && (
              <ImportBox target="rcm" />
            )}
          </div>
        </div>
        <DataTable rows={currentRcm} isBooks={false} isRcm={true} dataType={!isLocked ? "rcm" : null} />
      </div>
    </>
  );
}
