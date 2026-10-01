import React, { useState } from 'react';
import { Upload, Clipboard, X, Info, Database } from 'lucide-react';
import Papa from 'papaparse';
import { useAppContext } from '../context/AppContext';
import { useToast } from './Toast';
import { uid } from '../utils/storage';

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

export default function ImportBox({ target = 'books' }) {
  const { activeCompanyId, month, financialYear, updateState, books, gstr2b, gstr2b_gov, rcm, gstr1, syncGstr1ToSheets, MONTHS, FY_LIST } = useAppContext();
  const { showToast } = useToast();
  
  const [importing, setImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pastedData, setPastedData] = useState({ headers: [], rawRows: [] });
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [replace, setReplace] = useState(true);
  
  const [importMonth, setImportMonth] = useState(month || '');
  const [importQuarter, setImportQuarter] = useState('');
  const [importFy, setImportFy] = useState(financialYear || '');

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
      month: importMonth || dateInfo.month, 
      quarter: importQuarter || dateInfo.quarter, 
      fy: importFy || dateInfo.fy
    };
  };
  
  const parseCustomFormat = (text) => {
    // 1. Flatten all whitespace and newlines into single spaces
    const flatText = text.replace(/\s+/g, ' ').trim();
    
    // 2. Split by Date pattern. To avoid splitting on invoice numbers like RABE/26-27/0013, 
    // we strictly require a space before the date (or it being the start of the string).
    const chunks = flatText.split(/(?= \d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/).map(s => s.trim()).filter(s => s);
    
    const parsedRows = [];
    
    for (let chunk of chunks) {
      // Find Date
      const dateMatch = chunk.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.*)$/);
      if (!dateMatch) continue; // skip if it doesn't start with a date
      
      const invoiceDate = dateMatch[1];
      let rest = dateMatch[2];
      
      const allTokens = rest.split(' ');
      
      // Extract numbers from the end
      let numbers = [];
      let i = allTokens.length - 1;
      while (i >= 0) {
        // match numbers with optional commas and decimals
        if (/^[\d,]+(\.\d+)?$/.test(allTokens[i]) || /^-\d+/.test(allTokens[i])) {
          numbers.unshift(allTokens[i]);
          i--;
        } else {
          break; // hit text
        }
      }
      
      if (numbers.length < 4) continue; // Need at least Taxable, IGST, CGST, SGST
      
      let taxable, igst, cgst, sgst;
      if (numbers.length >= 6) {
        // Taxable, IGST, CGST, SGST, Total Tax, Total Invoice
        taxable = numbers[numbers.length - 6];
        igst = numbers[numbers.length - 5];
        cgst = numbers[numbers.length - 4];
        sgst = numbers[numbers.length - 3];
      } else {
        // Fallback
        taxable = numbers[0];
        igst = numbers[1];
        cgst = numbers[2];
        sgst = numbers[3];
      }
      
      // Text part contains Supplier Name + GSTIN + Invoice No
      const textPart = allTokens.slice(0, i + 1).join(' ');
      
      // GSTIN Regex
      const gstinMatch = textPart.match(/\b(\d{2}[A-Z]{5}\d{4}[A-Z][0-9A-Z]{3})\b/i);
      let gstin = '';
      let supplierName = '';
      let invoiceNo = '';
      
      if (gstinMatch) {
        gstin = gstinMatch[1];
        const parts = textPart.split(gstin);
        supplierName = parts[0].trim();
        invoiceNo = parts[1].trim();
      } else {
        supplierName = textPart;
        invoiceNo = 'UNKNOWN'; 
      }
      
      parsedRows.push({
        'invoice date': invoiceDate,
        'supplier name': supplierName,
        'gstin': gstin,
        'invoice no': invoiceNo,
        'taxable value': taxable,
        'igst': igst,
        'cgst': cgst,
        'sgst': sgst,
        'cess': '0'
      });
    }
    
    if (parsedRows.length > 0) {
      const fakeHeaders = ['invoice date', 'supplier name', 'gstin', 'invoice no', 'taxable value', 'igst', 'cgst', 'sgst', 'cess'];
      setPastedData({ headers: fakeHeaders, rawRows: parsedRows });
      return true;
    }
    return false;
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('Text');
    if (!text) return;
    
    setPasteText(text);
    setErrorMsg('');
    
    Papa.parse(text, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const fields = res.meta.fields || [];
        const mapping = autoGuessMapping(fields, target);
        const missing = getTargetFields(target).filter(f => f.req).filter(f => !mapping[f.key]);
        
        // If standard header parsing fails (because there are no headers), try custom parsing
        if (missing.length > 0 || fields.length === 0) {
          const success = parseCustomFormat(text);
          if (!success) {
            setErrorMsg('Missing columns: ' + missing.map(f => f.label).join(', ') + '. Did you forget to copy the header row from Excel?');
            setPastedData({ headers: [], rawRows: [] });
          }
        } else {
          setPastedData({ headers: fields, rawRows: res.data });
        }
      },
      error: () => {
        const success = parseCustomFormat(text);
        if (!success) {
          setErrorMsg('Could not read pasted data.');
        }
      }
    });
  };

  const handleImportClick = () => {
    if (!pastedData.rawRows.length) {
      setErrorMsg('Please paste some data first.');
      return;
    }
    
    if (!importFy || !importQuarter || !importMonth) {
      setErrorMsg('Please select Financial Year, Quarter, and Month above.');
      return;
    }

    setImporting(true);
    setErrorMsg('');
    
    const { headers, rawRows } = pastedData;
    const mapping = autoGuessMapping(headers, target);
    
    const fields = getTargetFields(target);
    const required = fields.filter(f => f.req);
    const missing = required.filter(f => !mapping[f.key]);
    
    if (missing.length) {
      setErrorMsg('Missing columns: ' + missing.map(f => f.label).join(', ') + '. Did you forget to copy the header row from Excel?');
      setImporting(false);
      return;
    }

    const newRows = rawRows.map(row => {
      const mapped = mapRow(row, mapping);
      return { 
        id: uid(), 
        companyId: activeCompanyId, 
        ...mapped,
        fy: importFy, 
        month: importMonth, 
        quarter: importQuarter
      };
    }).filter(r => r.invoiceNo);

    const storeKey = target === 'books' ? 'books' : target === 'rcm' ? 'rcm' : target === 'gstr1' ? 'gstr1' : target === 'gstr2b_gov' ? 'gstr2b_gov' : 'gstr2b';
    
    let currentData = storeKey === 'books' ? books : storeKey === 'rcm' ? rcm : storeKey === 'gstr1' ? gstr1 : storeKey === 'gstr2b_gov' ? gstr2b_gov : gstr2b;
    let updatedData = replace ? newRows : [...currentData, ...newRows];
    
    if (target === 'gstr1') {
      syncGstr1ToSheets(updatedData);
    }
    
    updateState({ [storeKey]: updatedData });
    setImporting(false);
    
    // Reset state and close
    setPasteText('');
    setPastedData({ headers: [], rawRows: [] });
    setIsOpen(false);
    setErrorMsg('');
    
    showToast(`Imported ${newRows.length} rows successfully`);
  };

  const closeBox = () => {
    setPasteText('');
    setPastedData({ headers: [], rawRows: [] });
    setIsOpen(false);
    setErrorMsg('');
  };

  return (
    <>
      <button className="btn outline" onClick={() => setIsOpen(true)}>
        <Upload size={14} /> Import
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            width: '600px',
            maxWidth: '95vw',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative shapes for header background */}
              <div style={{ position: 'absolute', top: '-10px', left: '-30px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: '-40px', right: '10%', width: '300px', height: '250px', background: 'radial-gradient(ellipse, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 60%)', borderRadius: '50%', transform: 'rotate(-20deg)' }}></div>
              <div style={{ position: 'absolute', top: '0', right: '0', width: '100%', height: '100%', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 1000 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'rgba(255,255,255,0.05)\' d=\'M0,50 C300,150 400,-50 1000,100 L1000,0 L0,0 Z\'/%3E%3Cpath fill=\'rgba(0,0,0,0.05)\' d=\'M0,200 C400,100 600,250 1000,150 L1000,200 L0,200 Z\'/%3E%3C/svg%3E")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.8 }}></div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7C3AED',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                  <Clipboard size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600', letterSpacing: '-0.5px', color: '#ffffff' }}>Import Data</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#ffffff', opacity: 0.9 }}>Paste your Excel data from clipboard (Ctrl+V)</p>
                </div>
              </div>
              <button 
                onClick={closeBox}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  opacity: 0.8,
                  transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0.8}
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              
              {/* Select Options */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select 
                  value={importFy} onChange={e => setImportFy(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', outline: 'none', color: '#374151', cursor: 'pointer' }}
                >
                  <option value="">Select FY</option>
                  {FY_LIST && FY_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                <select 
                  value={importQuarter} onChange={e => setImportQuarter(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', outline: 'none', color: '#374151', cursor: 'pointer' }}
                >
                  <option value="">Select Quarter</option>
                  <option value="Q1">Q1 (Apr-Jun)</option>
                  <option value="Q2">Q2 (Jul-Sep)</option>
                  <option value="Q3">Q3 (Oct-Dec)</option>
                  <option value="Q4">Q4 (Jan-Mar)</option>
                </select>

                <select 
                  value={importMonth} onChange={e => setImportMonth(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', outline: 'none', color: '#374151', cursor: 'pointer' }}
                >
                  <option value="">Select Month</option>
                  {MONTHS && MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {errorMsg && (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #F87171',
                  color: '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <strong>Error:</strong> {errorMsg}
                </div>
              )}

              {/* Textarea Container */}
              <div style={{
                border: '1px solid #A78BFA',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  pointerEvents: 'none',
                  opacity: pasteText ? 0 : 1
                }}>
                  <div style={{ color: '#4C1D95', fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>Click here and press Ctrl+V</div>
                  <div style={{ color: '#8B5CF6', fontSize: '13px' }}>Paste Excel data from your clipboard</div>
                </div>
                
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: pastedData.rawRows.length > 0 ? '#10B981' : '#A78BFA',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {pastedData.rawRows.length > 0 ? `${pastedData.rawRows.length} rows ready` : 'No rows pasted yet'}
                </div>

                <textarea
                  style={{
                    width: '100%',
                    height: '140px',
                    padding: '16px',
                    border: 'none',
                    resize: 'vertical',
                    minHeight: '100px',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    color: '#4B5563',
                    outline: 'none',
                    fontFamily: 'monospace'
                  }}
                  onPaste={handlePaste}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      setPasteText('');
                      setPastedData({ headers: [], rawRows: [] });
                      setErrorMsg('');
                    }
                  }}
                  value={pasteText}
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F9FAFB'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={replace} 
                  onChange={e => setReplace(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                Replace existing data
              </label>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onClick={closeBox}
                >
                  Cancel
                </button>
                <button 
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#7C3AED',
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    opacity: pastedData.rawRows.length > 0 && importFy && importQuarter && importMonth ? 1 : 0.6
                  }}
                  onClick={handleImportClick}
                  disabled={importing || pastedData.rawRows.length === 0 || !importFy || !importQuarter || !importMonth}
                >
                  <Database size={16} />
                  {importing ? 'Importing...' : 'Import Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
