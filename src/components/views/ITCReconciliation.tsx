import React, { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../../context/AppContext';
import { getDashboardReconData } from '../../utils/booksReconciliation';
import { fmtNum } from '../../utils/format';
import ReconTable from '../common/ReconTable';
import EmptyState from '../common/EmptyState';
import { useToast } from '../common/Toast';

export default function Reconciliation() {
  const { currentBooks = [], currentGstr2b = [], fyGstr2b = [], activeCompany, month, financialYear, settings, resolutions } = useAppContext() as any;
  const { showToast } = useToast() as any;
  
  const [filter, setFilter] = useState('Matched');
  const [searchQuery, setSearchQuery] = useState('');
  const rows = useMemo(() => 
    getDashboardReconData(currentBooks, currentGstr2b, fyGstr2b, settings.tolerance, settings.normalizeInvoice),
    [currentBooks, currentGstr2b, fyGstr2b, settings]
  );
  
  const sum = useMemo(() => {
    const counts: Record<string, number> = {
      Matched: 0,
      Mismatch: 0,
      'Not in 2B': 0,
      'Not in Books': 0,
      Duplicate: 0
    };
    rows.forEach(r => {
      if (r.status.startsWith('Matched')) counts['Matched']++;
      else if (r.status === 'Not in 2B') counts['Not in 2B']++;
      else if (r.status === 'Not in Books') counts['Not in Books']++;
      else counts['Mismatch']++;
    });
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    let base = filter === 'all' ? rows : rows.filter(r => {
      if (filter === 'Amount Mismatch') {
        return !r.status.startsWith('Matched') && r.status !== 'Not in 2B' && r.status !== 'Not in Books';
      }
      if (filter === 'Matched') {
        return r.status.startsWith('Matched');
      }
      return r.status === filter;
    });
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(r => 
        (r.invoiceNo || '').toLowerCase().includes(q) || 
        (r.gstin || '').toLowerCase().includes(q) || 
        (r.supplierName || '').toLowerCase().includes(q)
      );
    }
    return base;
  }, [rows, filter, searchQuery]);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const reconSheet = rows.map(r => ({
      Status: r.status, 'Invoice No': r.invoiceNo, Date: r.invoiceDate, GSTIN: r.gstin, Supplier: r.supplierName,
      'Books Taxable': r.booksTaxable, '2B Taxable': r.g2bTaxable, 'Books Tax': r.booksTax, '2B Tax': r.g2bTax, 'Diff (Tax)': r.diffTax,
      Remark: r.remark || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reconSheet), 'Reconciliation');
    XLSX.writeFile(wb, `ReconIQ_${(activeCompany?.name || 'Company').replace(/\s+/g, '_')}_${month}_FY${financialYear}_Recon.xlsx`);
    showToast('Export saved');
  };



  const Chip = ({ val, label, count }: any) => (
    <button 
      className={`chip ${filter === val ? 'active' : ''}`} 
      onClick={() => setFilter(val)}
    >
      {label} · {fmtNum(count)}
    </button>
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Match result</h3>
          <div className="hint">{activeCompany?.name || ''} · {month} FY{financialYear} · {fmtNum(rows.length)} total lines</div>
        </div>
        <div className="flex gap8">
          <div className="searchbox">
            <Search size={14} />
            <input 
              className="ctrl" 
              placeholder="Search invoice / GSTIN / supplier"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn ghost" onClick={handleExport}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>
      <div className="filter-row">
        <Chip val="Matched" label="Matched" count={sum['Matched'] || 0} />
        <Chip val="Amount Mismatch" label="Mismatch" count={sum['Mismatch'] || 0} />
        <Chip val="Not in 2B" label="Not in 2B" count={sum['Not in 2B'] || 0} />
        <Chip val="Not in Books" label="Not in Books" count={sum['Not in Books'] || 0} />
      </div>
      
      <ReconTable rows={filteredRows} />
    </div>
  );
}
