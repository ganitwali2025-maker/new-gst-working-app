// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fmtINR, fmtNum } from '../../utils/format';
import { taxTotal } from '../../utils/invoice';
import { useToast } from '../common/Toast';
import KpiCard from '../common/KpiCard';
import DataTable from '../common/DataTable';
import ImportBox from '../common/ImportBox';
import { runReconciliation } from '../../utils/reconciliation';

export default function GSTR2B() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { checkIsLocked, toggleLock, currentBooks, fyGstr2b, activeCompany, month, financialYear, clearCurrentPeriod, settings, fetchGstr2bFromSheets } = useAppContext();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGstr2bFromSheets();
    setIsRefreshing(false);
    showToast('Data refreshed successfully');
  };
  const { showToast } = useToast();

  const isLocked = checkIsLocked('gstr2b');
  const totalTaxable = fyGstr2b.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const totalIgst = fyGstr2b.reduce((a, r) => a + Number(r.igst || 0), 0);

  const reconRows = runReconciliation(currentBooks, fyGstr2b, settings.tolerance, settings.normalizeInvoice);
  const statusMap = {};
  reconRows.forEach(r => {
    if (r.g2bId) {
      statusMap[r.g2bId] = r.status;
    }
  });

  const g2bWithStatus = fyGstr2b.map(g => ({
    ...g,
    recoStatus: statusMap[g.id]
  }));
  const totalCgst = fyGstr2b.reduce((a, r) => a + Number(r.cgst || 0), 0);
  const totalSgst = fyGstr2b.reduce((a, r) => a + Number(r.sgst || 0), 0);
  const totalGst = fyGstr2b.reduce((a, r) => a + taxTotal(r), 0);

  const handleClear = () => {
    if (!window.confirm('Remove all GSTR-2B rows for this company & period?')) return;
    clearCurrentPeriod('gstr2b');
    showToast('Period data cleared');
  };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <KpiCard small label="Total Taxable" val={fmtINR(totalTaxable)} sub="Sum for financial year" color="var(--accent)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub="Integrated GST" color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub="Central GST" color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub="State GST" color="var(--yellow)" />
        <KpiCard small label="Total GST" val={fmtINR(totalGst)} sub="All taxes combined" color="var(--accent)" />
      </div>
      
      <div className="panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sheet-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line><line x1="9" y1="19" x2="11" y2="19"></line></svg>
            </div>
            <div>
              <h3 className="sheet-title">
                GSTR-2B <span style={{ color: 'var(--accent)' }}>All Months</span>
                {isLocked && <Lock size={16} color="var(--accent)" style={{marginLeft: '8px'}}/>}
              </h3>
              <div className="sheet-subtitle">Auto-drafted ITC statement from GSTN | {activeCompany?.name || ''} - FY {financialYear}</div>
            </div>
          </div>
          
          <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
            <button className="btn-action btn-lock" onClick={() => toggleLock('gstr2b')}>
              <span className="icon-wrapper">
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </span>
              <span>{isLocked ? 'Locked' : 'Lock Sheet'}</span>
            </button>
            
            <button className="btn-action btn-refresh" onClick={handleRefresh} disabled={isRefreshing}>
              <span className="icon-wrapper"><RefreshCw size={16} /></span>
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
        <DataTable rows={g2bWithStatus} isBooks={false} type="gstr2b" dataType={!isLocked ? "gstr2b" : null} />
      </div>
    </>
  );
}
