import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fmtINR } from '../../utils/format';
import { taxTotal } from '../../utils/invoice';
import { useToast } from '../common/Toast';
import KpiCard from '../common/KpiCard';
import DataTable from '../common/DataTable';

export default function RcmITC() {
  const navigate = useNavigate();
  const { rcm, activeCompany, activeCompanyId, month, financialYear, fetchRcmFromSheets, MONTHS } = useAppContext() as any;
  const { showToast } = useToast() as any;
  
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    if (fetchRcmFromSheets) fetchRcmFromSheets();
  }, [activeCompanyId]);

  // Calculate previous month and financial year
  const monthIdx = (MONTHS || []).indexOf(month);
  let prevMonth = month;
  let prevFy = financialYear;
  
  if (monthIdx === 0) {
    prevMonth = MONTHS[11]; // Mar
    const startYear = parseInt(financialYear.slice(0, 4));
    if (!isNaN(startYear)) {
      prevFy = (startYear - 1) + '-' + (startYear).toString().slice(-2);
    }
  } else if (monthIdx > 0) {
    prevMonth = MONTHS[monthIdx - 1];
  }

  const prevRcm = (rcm || []).filter(
    (r: any) => r.companyId === activeCompanyId && r.fy === prevFy && r.month === prevMonth
  );

  const total = prevRcm.reduce((a: any, r: any) => a + Number(r.taxable || 0), 0);
  const totalIgst = prevRcm.reduce((a: any, r: any) => a + Number(r.igst || 0), 0);
  const totalCgst = prevRcm.reduce((a: any, r: any) => a + Number(r.cgst || 0), 0);
  const totalSgst = prevRcm.reduce((a: any, r: any) => a + Number(r.sgst || 0), 0);
  const tax = prevRcm.reduce((a: any, r: any) => a + taxTotal(r), 0);

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <KpiCard small label="Total Taxable" val={fmtINR(total)} sub={"Sum for " + (prevMonth || "previous period")} color="var(--accent)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub="Integrated GST" color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub="Central GST" color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub="State GST" color="var(--yellow)" />
        <KpiCard small label="Total Tax Payable" val={fmtINR(tax)} sub="Total RCM ITC" color="var(--accent)" />
      </div>
      
      <div className="panel">
        <div className="panel-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sheet-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>
            </div>
            <div>
              <h3 className="sheet-title">RCM ITC</h3>
              <div className="sheet-subtitle">
                {activeCompany?.name || 'No company selected'} | Showing data from: <strong>{prevMonth} FY{prevFy}</strong>
              </div>
            </div>
          </div>
          <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
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
          </div>
        </div>
        <DataTable rows={prevRcm} isBooks={false} isRcm={true} dataType={null} type="rcm" />
      </div>
    </>
  );
}
