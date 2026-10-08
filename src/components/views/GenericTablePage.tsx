import React, { useState } from 'react';
import { Upload, Save, Lock, Unlock } from 'lucide-react';
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
        <KpiCard small label="Total Taxable" val={fmtINR(totalTaxable)} sub={"Sum for " + (month || "this period")} color="var(--purple)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub={"Integrated GST (" + month + ")"} color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub={"Central GST (" + month + ")"} color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub={"State GST (" + month + ")"} color="var(--yellow)" />
        <KpiCard small label="Total GST" val={fmtINR(totalGst)} sub="All taxes combined" color="var(--purple)" />
      </div>

      <div className="panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ color: 'var(--purple)', fontSize: '24px', fontWeight: 'bold' }}>
              {title} {isLocked && <Lock size={16} color="var(--accent)" style={{marginLeft: '8px'}}/>}
            </h3>
            <div className="hint">{hint || `${activeCompany?.name || 'Company'} | ${month} FY${financialYear}`}</div>
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
              onClick={() => toggleLock(type)}
            >
              {isLocked ? <><Lock size={14} /> Locked</> : <><Unlock size={14} /> Lock Sheet</>}
            </button>
            
            {['gstr1', 'books', 'g2b_gov'].includes(type) && !isLocked && (
              <button 
                className="btn" 
                style={{ 
                  background: 'linear-gradient(90deg, #EF4444, #DC2626)', color: '#fff', border: 'none',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                                                    onClick={() => {
                    if (window.confirm(`Are you sure you want to clear data for ${month} ${financialYear}?`)) {
                      clearCurrentPeriod(type);
                    }
                  }}
              >
                Clear Data
              </button>
            )}
            {['gstr1', 'books', 'g2b_gov'].includes(type) && (
              <button 
                className="btn" 
                style={{
                  background: 'linear-gradient(90deg, var(--purple), #6D28D9)', color: '#fff', border: 'none',
                  color: '#fff',
                  border: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  opacity: isSyncing ? 0.7 : 1
                }} 
                onClick={handlePullFromSheets} 
                disabled={isSyncing}
              >
                {isSyncing ? "Refreshing..." : "Refresh"}
              </button>
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








