import React, { useState } from 'react';
import { Upload, Save, Lock, Unlock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import KpiCard from '../components/KpiCard';
import ImportBox from '../components/ImportBox';
import { fmtINR } from '../utils/format';
import { taxTotal } from '../utils/invoice';

export default function GenericTablePage({ title, hint, type = 'books' }) {
  const { activeCompany, month, financialYear, currentBooks, currentGstr2b, currentGstr1, updateState, gstr1, activeCompanyId, checkIsLocked, toggleLock } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const isLocked = checkIsLocked(type);
  
  let rows = [];
  if (type === 'books') rows = currentBooks;
  else if (type === 'g2b') rows = currentGstr2b;
  else if (type === 'gstr1') rows = currentGstr1;

  const totalTaxable = rows.reduce((a, r) => a + Number(r.taxable || 0), 0);
  const totalIgst = rows.reduce((a, r) => a + Number(r.igst || 0), 0);
  const totalCgst = rows.reduce((a, r) => a + Number(r.cgst || 0), 0);
  const totalSgst = rows.reduce((a, r) => a + Number(r.sgst || 0), 0);
  const totalGst = rows.reduce((a, r) => a + taxTotal(r), 0);

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPN-BdSxYQ_QHA1JazBwYXUXSt8d505s2HknrX65VFEfRWii7McdYn_nquTSk2ipoz/exec";

  const handlePullFromSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(SCRIPT_URL);
      const sheetData = await res.json();
      
      if (Array.isArray(sheetData)) {
        const mappedData = sheetData.map(r => ({
          id: r["ID"] || String(Math.random()),
          companyId: activeCompanyId,
          fy: financialYear,
          month: month,
          quarter: r["Quarter"] || "",
          invoiceDate: r["Invoice Date"] || "",
          supplierName: r["Supplier / Party Name"] || "",
          gstin: r["GST No"] || "",
          invoiceNo: r["Invoice No"] || "",
          taxable: Number(r["Taxable Value"]) || 0,
          igst: Number(r["IGST"]) || 0,
          cgst: Number(r["CGST"]) || 0,
          sgst: Number(r["SGST"]) || 0,
          cess: 0
        }));
        
        const otherData = gstr1.filter(r => r.companyId !== activeCompanyId);
        updateState({ gstr1: [...otherData, ...mappedData] });
      }
    } catch (e) {
      console.error("Failed to pull from Google Sheets.", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
        <KpiCard small label="Total Taxable" val={fmtINR(totalTaxable)} sub="Sum for this period" color="var(--accent)" />
        <KpiCard small label="Total IGST" val={fmtINR(totalIgst)} sub="Integrated GST" color="var(--blue)" />
        <KpiCard small label="Total CGST" val={fmtINR(totalCgst)} sub="Central GST" color="var(--green)" />
        <KpiCard small label="Total SGST" val={fmtINR(totalSgst)} sub="State GST" color="var(--yellow)" />
        <KpiCard small label="Total GST" val={fmtINR(totalGst)} sub="All taxes combined" color="var(--purple)" />
      </div>

      <div className="panel">
        <div className="panel-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>{title} {isLocked && <Lock size={16} color="var(--purple)" style={{marginLeft: '8px'}}/>}</h3>
            <div className="hint">{hint || `${activeCompany?.name || 'Company'} · ${month} FY${financialYear}`}</div>
          </div>
          <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
            <button 
              className={`btn outline ${isLocked ? 'primary' : ''}`}
              onClick={() => toggleLock(type)}
            >
              {isLocked ? <><Lock size={14} /> Locked</> : <><Unlock size={14} /> Lock Sheet</>}
            </button>
            
            {type === 'gstr1' && !isLocked && (
              <button 
                className="btn outline" 
                style={{ color: '#EF4444', borderColor: '#EF4444' }}
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all data? This will also clear the Google Sheet.")) {
                    updateState({ gstr1: [] });
                    // Sending an empty array to Google Apps Script will clear the rows!
                    fetch(SCRIPT_URL, {
                      method: "POST",
                      headers: { "Content-Type": "text/plain;charset=utf-8" },
                      body: JSON.stringify({ action: "SYNC_ALL", data: [] })
                    }).catch(e => console.error("Auto-sync clear error:", e));
                  }
                }}
              >
                Clear Data
              </button>
            )}
            {type === 'gstr1' && (
              <button className="btn primary" onClick={handlePullFromSheets} disabled={isSyncing}>
                {isSyncing ? "Refreshing..." : "Refresh"}
              </button>
            )}
            {type === 'gstr1' && !isLocked && (
              <ImportBox target={type} />
            )}
          </div>
        </div>
        <DataTable rows={rows} isBooks={type === 'books'} type={type} dataType={!isLocked ? type : null} />
      </div>
    </>
  );
}
