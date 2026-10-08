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
        <KpiCard small label="Total Taxable" val={fmtINR(total)} sub={"Sum for " + (month || "this period")} color="var(--purple)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub="Integrated GST" color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub="Central GST" color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub="State GST" color="var(--yellow)" />
        <KpiCard small label="Total Tax Payable" val={fmtINR(tax)} sub="Total RCM Tax" color="var(--purple)" />
      </div>
      
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 style={{ color: 'var(--purple)', fontSize: '24px', fontWeight: 'bold' }}>RCM Invoices {isLocked && <Lock size={16} color="var(--accent)" style={{marginLeft: '8px'}}/>}</h3>
            <div className="hint">{activeCompany?.name || 'No company selected'} | {month} FY{financialYear}</div>
          </div>
          <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
            <button 
              className="btn"
              style={{
                background: isLocked ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #10B981, #059669)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onClick={() => toggleLock('rcm')}
            >
              {isLocked ? <><Lock size={14} /> Locked</> : <><Unlock size={14} /> Lock Sheet</>}
            </button>
            
            {!isLocked && (
              <button 
                className="btn" 
                style={{ 
                  background: 'linear-gradient(90deg, #EF4444, #DC2626)', color: '#fff', border: 'none',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onClick={handleClear}
              >
                Clear Data
              </button>
            )}

            <button 
              className="btn" 
              style={{
                background: 'linear-gradient(90deg, var(--purple), #6D28D9)', color: '#fff', border: 'none',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                opacity: isSyncing ? 0.7 : 1
              }} 
              onClick={async () => {
                setIsSyncing(true);
                try {
                  if (fetchRcmFromSheets) await fetchRcmFromSheets();
                  showToast('RCM data refreshed from Sheets');
                } finally {
                  setIsSyncing(false);
                }
              }} 
              disabled={isSyncing}
            >
              {isSyncing ? "Refreshing..." : "Refresh"}
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
