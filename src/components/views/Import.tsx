import React, { useState } from 'react';
import { Upload, Sparkles, Clipboard } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import { fmtNum } from '../../utils/format';
import { uid } from '../../utils/storage';
import DataTable from '../common/DataTable';

const TARGET_FIELDS_BASE = [
  {key:'invoiceNo', label:'Invoice No.', req:true},
  {key:'invoiceDate', label:'Invoice Date', req:true},
  {key:'gstin', label:'Supplier GSTIN', req:true},
  {key:'supplierName', label:'Supplier Name', req:false},
  {key:'taxable', label:'Taxable Value', req:true},
  {key:'igst', label:'IGST', req:false},
  {key:'cgst', label:'CGST', req:false},
  {key:'sgst', label:'SGST', req:false},
  {key:'cess', label:'Cess', req:false},
];

const TARGET_FIELDS_G2B_EXTRA = [
  {key:'supplierType', label:'Supplier Type (Government/Regular)', req:false},
  {key:'gstr1Filed', label:'GSTR-1 Filed (Yes/No)', req:false},
];

const GUESS = {
  invoiceNo:['invoice no','invoice number','inv no','invno','invoice_no'],
  invoiceDate:['invoice date','date','inv date','invoice_date'],
  gstin:['gstin','supplier gstin','gst no','supplier gst'],
  supplierName:['supplier name','supplier','vendor','vendor name','party name','name'],
  taxable:['taxable value','taxable','taxable amt','taxable_value'],
  igst:['igst'], cgst:['cgst'], sgst:['sgst'], cess:['cess'],
  supplierType:['supplier type','type','category','govt','government'],
  gstr1Filed:['gstr-1 filed','gstr1 filed','filing status','filed'],
};

function parseNum(v){ const n = parseFloat(String(v).replace(/,/g,'')); return isNaN(n) ? 0 : n; }

export default function Import() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTarget = queryParams.get('target') || 'books';

  const { activeCompany, month, financialYear, activeCompanyId, updateState, loadSample, books, gstr2b, gstr2b_gov, rcm, gstr1, syncGstr1ToSheets } = useAppContext();
  const { showToast } = useToast();

  const [target, setTarget] = useState(initialTarget);
  const [importState, setImportState] = useState({
    headers: [], rawRows: [], mapping: {}, replace: false
  });

  const getTargetFields = (kind) => (kind === 'gstr2b' || kind === 'gstr2b_gov') ? [...TARGET_FIELDS_BASE, ...TARGET_FIELDS_G2B_EXTRA] : TARGET_FIELDS_BASE;

  const autoGuessMapping = (headers, kind) => {
    const mapping = {};
    getTargetFields(kind).forEach(f => {
      const guesses = GUESS[f.key] || [];
      const found = headers.find(h => guesses.includes(String(h).trim().toLowerCase()));
      mapping[f.key] = found || '';
    });
    return mapping;
  };

  const handleFile = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (res) => {
          setImportState({
            headers: res.meta.fields || [],
            rawRows: res.data,
            mapping: autoGuessMapping(res.meta.fields || [], target),
            replace: false
          });
        },
        error: () => showToast('Could not read that CSV file.')
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false, dateNF: 'dd/mm/yyyy' });
          const headers = json.length ? Object.keys(json[0]) : [];
          setImportState({
            headers,
            rawRows: json,
            mapping: autoGuessMapping(headers, target),
            replace: false
          });
        } catch (err) {
          showToast('Could not read that Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const parseInvoiceDate = (dateStr) => {
    if (!dateStr) return null;
    let d;
    const parts = String(dateStr).trim().split(/[-/]/);
    if (parts.length === 3) {
       if (parts[0].length === 4) {
         d = new Date(parts[0], parseInt(parts[1])-1, parts[2]);
       } else if (parts[2].length === 4) {
         if (isNaN(parseInt(parts[1]))) {
            d = new Date(dateStr); 
         } else {
            d = new Date(parts[2], parseInt(parts[1])-1, parts[0]); 
         }
       } else {
         d = new Date(dateStr);
       }
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return null;
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[m];
    let quarter = '';
    let fyStr = '';
    if (m >= 3) { 
      if (m >= 3 && m <= 5) quarter = 'Q1';
      else if (m >= 6 && m <= 8) quarter = 'Q2';
      else quarter = 'Q3';
      fyStr = 'FY ' + y + '-' + (y+1).toString().slice(-2);
    } else { 
      quarter = 'Q4';
      fyStr = 'FY ' + (y-1) + '-' + y.toString().slice(-2);
    }
    return { month: monthName, quarter, fy: fyStr };
  };

  const mapRow = (row, mapping) => {
    const g = key => key ? row[key] : '';
    const rawDate = g(mapping.invoiceDate);
    const dateInfo = parseInvoiceDate(rawDate) || { month: '', quarter: '', fy: '' };
    return {
      invoiceNo: g(mapping.invoiceNo), invoiceDate: rawDate, gstin: g(mapping.gstin), supplierName: g(mapping.supplierName),
      taxable: parseNum(g(mapping.taxable)), igst: parseNum(g(mapping.igst)), cgst: parseNum(g(mapping.cgst)), sgst: parseNum(g(mapping.sgst)), cess: parseNum(g(mapping.cess)),
      supplierType: mapping.supplierType ? g(mapping.supplierType) : '', gstr1Filed: mapping.gstr1Filed ? g(mapping.gstr1Filed) : '',
      month: dateInfo.month, quarter: dateInfo.quarter, fy: dateInfo.fy
    };
  };

  const confirmImport = () => {
    const { rawRows, mapping, replace } = importState;
    const fields = getTargetFields(target);
    const required = fields.filter(f => f.req);
    const missing = required.filter(f => !mapping[f.key]);
    
    if (missing.length) {
      showToast('Please map: ' + missing.map(f => f.label).join(', '));
      return;
    }

    const newRows = rawRows.map(row => {
      const mapped = mapRow(row, mapping);
      return { 
        id: uid(), 
        companyId: activeCompanyId, 
        fy: mapped.fy || financialYear, 
        month: mapped.month || month, 
        quarter: mapped.quarter || '',
        ...mapped 
      };
    }).filter(r => target === 'rcm' ? (r.lrNo || r.entryDate || r.transporterName || r.taxable || r.amount) : r.invoiceNo);

    const storeKey = target === 'books' ? 'books' : target === 'rcm' ? 'rcm' : target === 'gstr1' ? 'gstr1' : target === 'gstr2b_gov' ? 'gstr2b_gov' : 'gstr2b';
    let updatedData = [];
    
    if (replace) {
      let currentData = storeKey === 'books' ? books : storeKey === 'rcm' ? rcm : storeKey === 'gstr1' ? gstr1 : storeKey === 'gstr2b_gov' ? gstr2b_gov : gstr2b;
      updatedData = currentData.filter(r => !(r.companyId === activeCompanyId && r.fy === financialYear && r.month === month));
    } else {
      updatedData = storeKey === 'books' ? [...books] : storeKey === 'rcm' ? [...rcm] : storeKey === 'gstr1' ? [...gstr1] : storeKey === 'gstr2b_gov' ? [...gstr2b_gov] : [...gstr2b];
    }
    
    updatedData = [...updatedData, ...newRows];
    
    // Add Google sheets sync if GSTR-1
    if (target === 'gstr1') {
      syncGstr1ToSheets(updatedData);
    }
    
    updateState({ [storeKey]: updatedData });
    setImportState({ headers: [], rawRows: [], mapping: {}, replace: false });
    
    const getKindLabel = (t) => {
      if (t === 'books') return 'Books ITC';
      if (t === 'gstr2b') return '2B All Months';
      if (t === 'gstr2b_gov') return '2B GOV';
      if (t === 'rcm') return 'RCM';
      if (t === 'gstr1') return 'GST R-1';
      return '';
    };
    
    const kindLabel = getKindLabel(target);
    showToast(`Imported ${newRows.length} rows into ${kindLabel}`);
    
    navigate(target === 'books' ? '/books' : target === 'rcm' ? '/rcmdata' : target === 'gstr1' ? '/gstr1' : target === 'gstr2b_gov' ? '/gstr2b-gov' : '/gstr2b');
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('Text');
    if (!text) return;
    Papa.parse(text, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        if (!res.data.length || !res.meta.fields) {
          showToast('Could not read pasted data. Make sure to copy headers too.');
          return;
        }
        setImportState({
          headers: res.meta.fields,
          rawRows: res.data,
          mapping: autoGuessMapping(res.meta.fields, target),
          replace: false
        });
      },
      error: () => showToast('Could not read pasted data.')
    });
  };

  const renderMapping = () => {
    const { headers, rawRows, mapping, replace } = importState;
    const fields = getTargetFields(target);
    const getKindLabel = (t) => {
      if (t === 'books') return 'Books ITC';
      if (t === 'gstr2b') return '2B All Months Data';
      if (t === 'gstr2b_gov') return '2B GOV Data';
      if (t === 'rcm') return 'RCM Invoices';
      if (t === 'gstr1') return 'GST R-1 Data';
      return '';
    };
    const kindLabel = getKindLabel(target);
    
    const sample = rawRows.slice(0, 5).map(row => mapRow(row, mapping));

    return (
      <div id="mappingArea">
        {/* HIDING MAPPING UI AS REQUESTED BY USER */}
        <div style={{ display: 'none' }}>
          <div className="section-title">Map columns — {kindLabel}</div>
          <div className="map-grid">
            {fields.map(f => (
              <div className="map-row" key={f.key}>
                <label className={f.req ? 'field-req' : ''}>{f.label}</label>
                <select 
                  className="ctrl" 
                  value={mapping[f.key] || ''}
                  onChange={(e) => setImportState({ ...importState, mapping: { ...mapping, [f.key]: e.target.value } })}
                >
                  <option value="">— not in file —</option>
                  {headers.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          <div className="flex" style={{ alignItems: 'center', gap: '8px', margin: '12px 0' }}>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={replace} 
                onChange={(e) => setImportState({ ...importState, replace: e.target.checked })}
              />
              <span className="slider-tog"></span>
            </label>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Replace existing {kindLabel} rows for this period before importing</span>
          </div>
        </div>
        <div className="panel-head">
          <h3 style={{ fontSize: '13.5px' }}>Preview (first 5 rows)</h3>
          <div className="hint">{fmtNum(rawRows.length)} rows detected in file</div>
        </div>
        
        <div id="previewWrap">
          <DataTable rows={sample} isBooks={target !== 'gstr2b'} isRcm={target === 'rcm'} type={target} />
        </div>
        
        <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
          <button className="btn primary" onClick={confirmImport}>
            <Upload size={14} /> Import {fmtNum(rawRows.length)} rows
          </button>
          <button className="btn ghost" onClick={() => setImportState({ headers: [], rawRows: [], mapping: {}, replace: false })}>
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>Import purchase data</h3>
          <div className="hint">Applies to {activeCompany?.name || 'the active company'} · {month} FY{financialYear}</div>
        </div>
      </div>
      
      <div className="tabs">
        <div className={`tab ${target === 'books' ? 'active' : ''}`} onClick={() => setTarget('books')}>Books ITC</div>
        <div className={`tab ${target === 'gstr2b' ? 'active' : ''}`} onClick={() => setTarget('gstr2b')}>2B All Months</div>
        <div className={`tab ${target === 'gstr2b_gov' ? 'active' : ''}`} onClick={() => setTarget('gstr2b_gov')}>2B GOV</div>
        <div className={`tab ${target === 'rcm' ? 'active' : ''}`} onClick={() => setTarget('rcm')}>RCM</div>
        <div className={`tab ${target === 'gstr1' ? 'active' : ''}`} onClick={() => setTarget('gstr1')}>GST R-1</div>
      </div>
      
      {!importState.headers.length && (
        <div className="import-grid">
          <div className="dropzone" style={{ display: 'flex', flexDirection: 'column', padding: '20px', alignItems: 'center' }}>
            <Clipboard size={26} style={{ color: 'var(--muted)', marginBottom: '10px' }} />
            <div className="t1">Paste your Excel data here</div>
            <textarea 
              placeholder="Click here and press Ctrl+V"
              style={{ width: '100%', height: '120px', resize: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', fontSize: '13px', marginTop: '15px' }}
              onPaste={handlePaste}
            />
          </div>
          <div className="panel" style={{ margin: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>What happens next</div>
            <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--muted)', fontSize: '12.5px', lineHeight: 1.9 }}>
              <li>We read the column headers from your file</li>
              <li>You match each column to the right field</li>
              <li>Preview the first rows before confirming</li>
              <li>Rows are tagged to {month} FY{financialYear} and imported</li>
            </ol>
            <div style={{ marginTop: '12px' }}>
              <button className="btn ghost" onClick={loadSample}>
                <Sparkles size={14} /> Or just load sample data
              </button>
            </div>
          </div>
        </div>
      )}
      
      {importState.headers.length > 0 && renderMapping()}
    </div>
  );
}
