import React, { useState } from 'react';
import { Upload, Clipboard, X, Info, Database } from 'lucide-react';
import Papa from 'papaparse';
import { useAppContext } from '../../context/AppContext';
import { useToast } from './Toast';
import { uid } from '../../utils/storage';

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
  {key:'invoiceValue', label:'Invoice Value (?)', req:false},
  {key:'remark', label:'Remark', req:false},
];

const TARGET_FIELDS_RCM = [
  {key:'entryDate', label:'Entry Date', req:true},
  {key:'transporterName', label:'Transporter Name', req:false},
  {key:'lrNo', label:'Transporter L.R. No.', req:false},
  {key:'taxable', label:'Amount', req:true},
  {key:'igst', label:'IGST', req:false},
  {key:'cgst', label:'CGST', req:false},
  {key:'sgst', label:'SGST', req:false},
];

    const GUESS = {
    invoiceNo:['invoice no','invoice number','inv no','invno','invoice_no'],
    invoiceDate:['invoice date','date','inv date','invoice_date'],
    gstin:['gstin','supplier gstin','gst no','gst no.','supplier gst'],
    supplierName:['supplier name','name of supplier','vendor','vendor name','party name','trade / legal name', 'trade name', 'legal name', 'trade/legal name'],
    taxable:['taxable value','taxable','taxable amt','taxable_value', 'besic as per book', 'basic as per book', 'amount'],
    igst:['igst', 'integrated tax', 'igst 5%'], 
    cgst:['cgst', 'central tax', 'cgst 2.5%'], 
    sgst:['sgst', 'state tax', 'sgst 2.5%'], 
    cess:['cess'],
    remark:['remark','remarks'],
    invoiceValue:['invoice value','total invoice value','invoice value (\u20b9)'],
    entryDate:['entry date', 'date'],
    transporterName:['transporter name', 'transporter', 'party name', 'name of supplier'],
    lrNo:['transporter l.r. no.', 'l.r. no', 'lr no', 'lr number', 'receipt no'],
    supplierType:['supplier type','type','category','govt','government'],
    gstr1Filed:['gstr-1 filed','gstr1 filed','filing status','filed'],
  };

function parseNum(v: any){ const n = parseFloat(String(v).replace(/[,?Rs]/g,'')); return isNaN(n) ? 0 : n; }

export default function ImportBox({ target = 'books' }: { target?: string }) {
  const { activeCompanyId, month, financialYear, updateState, books, gstr2b, gstr2b_gov, rcm, gstr1, syncGstr1ToSheets, syncBooksToSheets, syncRcmToSheets, syncGstr2bGovToSheets, syncGstr2bToSheets, MONTHS, FY_LIST } = useAppContext() as any;
  const { showToast } = useToast() as any;
  
  const [importing, setImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pastedData, setPastedData] = useState<{ headers: string[], rawRows: any[] }>({ headers: [], rawRows: [] });
  const [pasteText, setPasteText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [replace, setReplace] = useState(false);
  
  const [importMonth, setImportMonth] = useState(month || '');
  const [importQuarter, setImportQuarter] = useState('');
  const [importFy, setImportFy] = useState(financialYear || '');

  const getTargetFields = (kind: string) => (kind === 'gstr2b' || kind === 'gstr2b_gov' || kind === 'g2b_gov') ? [...TARGET_FIELDS_BASE, ...TARGET_FIELDS_G2B_EXTRA] : (kind === 'rcm' ? TARGET_FIELDS_RCM : TARGET_FIELDS_BASE);

        const autoGuessMapping = (headers: string[], kind: string) => {
    const mapping: Record<string, string> = {};
    getTargetFields(kind).forEach((f: any) => {
      const guesses = (GUESS as any)[f.key] || [];
      const found = headers.find((h: any) => {
        const cleanH = String(h).trim().toLowerCase().replace(/\s+/g, ' ');
        return guesses.includes(cleanH) || guesses.some((g: any) => cleanH.includes(g.replace(/\s+/g, ' ')));
      });
      mapping[f.key] = found || '';
    });
    return mapping;
  };

  const parseInvoiceDate = (dateStr: any) => {
    if (!dateStr) return null;
    let d;
    const parts = String(dateStr).trim().split(/[-/]/);
    if (parts.length === 3) {
       if (parts[0].length === 4) {
         d = new Date(Number(parts[0]), parseInt(parts[1])-1, Number(parts[2]));
       } else if (parts[2].length === 4) {
         if (isNaN(parseInt(parts[1]))) {
            d = new Date(dateStr); 
         } else {
            d = new Date(Number(parts[2]), parseInt(parts[1])-1, Number(parts[0])); 
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

  const mapRow = (row: any, mapping: any) => {
    const g = (key: string) => key ? row[key] : '';
    const rawDate = g(mapping.invoiceDate) || g(mapping.entryDate);
    const dateInfo = parseInvoiceDate(rawDate) || { month: '', quarter: '', fy: '' };
    return {
      invoiceNo: g(mapping.invoiceNo), 
      invoiceDate: rawDate, 
      entryDate: g(mapping.entryDate),
      transporterName: g(mapping.transporterName) || g(mapping.supplierName),
      lrNo: g(mapping.lrNo) || g(mapping.invoiceNo),
      gstin: g(mapping.gstin), 
      supplierName: g(mapping.supplierName) || g(mapping.transporterName),
      taxable: parseNum(g(mapping.taxable)), 
      amount: parseNum(g(mapping.taxable)),
      igst: parseNum(g(mapping.igst)), 
      cgst: parseNum(g(mapping.cgst)), 
      sgst: parseNum(g(mapping.sgst)), 
      cess: parseNum(g(mapping.cess)),
      invoiceValue: parseNum(g(mapping.invoiceValue)),
      remark: g(mapping.remark),
      month: importMonth || dateInfo.month, 
      quarter: importQuarter || dateInfo.quarter, 
      fy: importFy || dateInfo.fy
    };
  };

  
  const parseCustomFormat = (text: string) => {
    // 1. Flatten all whitespace and newlines into single spaces
    const flatText = text.replace(/\s+/g, ' ').trim();
    
    // 2. Split by Date pattern. To avoid splitting on invoice numbers like RABE/26-27/0013, 
    // we strictly require a space before the date (or it being the start of the string).
    const chunks = flatText.split(/(?= \d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b)/).map(s => s.trim()).filter(s => s);
    
    const parsedRows: any[] = [];
    
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
        if (/^[?Rs\s]*[\d,]+(\.\d+)?$/.test(allTokens[i]) || /^-\d+/.test(allTokens[i])) {
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

  const handlePaste = (e: any) => {
    e.preventDefault();
    const text = e.clipboardData.getData('Text');
    if (!text) return;
    
    setPasteText(text);
    setErrorMsg('');
    
    Papa.parse(text, {
      header: true, skipEmptyLines: true,
      complete: (res: any) => {
        const fields = res.meta.fields || [];
        const mapping = autoGuessMapping(fields, target || '');
        const missing = getTargetFields(target || '').filter((f: any) => f.req).filter((f: any) => !mapping[f.key]);
        
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
    const mapping = autoGuessMapping(headers, target || '');
    
    const fields = getTargetFields(target || '');
    const required = fields.filter((f: any) => f.req);
    const missing = required.filter((f: any) => !mapping[f.key]);
    
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
    }).filter(r => target === 'rcm' ? (r.lrNo || r.transporterName || r.entryDate || r.taxable || r.amount) : r.invoiceNo);

    const storeKey = target === 'books' ? 'books' : target === 'rcm' ? 'rcm' : target === 'gstr1' ? 'gstr1' : target === 'g2b_gov' ? 'gstr2b_gov' : 'gstr2b';
    
    let currentData = storeKey === 'books' ? books : storeKey === 'rcm' ? rcm : storeKey === 'gstr1' ? gstr1 : storeKey === 'gstr2b_gov' ? gstr2b_gov : gstr2b;
    let updatedData = replace ? newRows : [...currentData, ...newRows];
    
    if (target === 'gstr1') {
      syncGstr1ToSheets(updatedData, "SYNC_ALL").catch(() => {
         showToast("Background sync failed. Please refresh and try again.", "error");
      });
    } else if (target === 'rcm') {
      if(syncRcmToSheets) {
        syncRcmToSheets(updatedData, "SYNC_ALL").catch(() => {
          showToast("Background sync failed. Please refresh and try again.", "error");
        });
      }
    } else if (target === 'books') {
      syncBooksToSheets(updatedData, "SYNC_ALL").catch(() => {
         showToast("Background sync failed. Please refresh and try again.", "error");
      });
    } else if (target === 'g2b_gov') {
      if (typeof syncGstr2bGovToSheets === 'function') {
        syncGstr2bGovToSheets(updatedData, "SYNC_ALL").catch(() => {
          showToast("Background sync failed. Please refresh and try again.", "error");
        });
      }
      let currentG2b = gstr2b || [];
      if (replace) {
        currentG2b = currentG2b.filter((r: any) => !(r.companyId === activeCompanyId && r.fy === importFy && r.month === importMonth));
      }
      const updatedG2b = [...currentG2b, ...newRows.map((r: any) => Object.assign({}, r, { id: String(Math.random()) }))];
      updateState({ gstr2b: updatedG2b });
      
      if (typeof syncGstr2bToSheets === 'function') {
        syncGstr2bToSheets(updatedG2b, "SYNC_ALL").catch(() => {
          console.error("Failed to sync GSTR2B All Months");
        });
      }
    }
    
    updateState({ [storeKey]: updatedData, month: importMonth, financialYear: importFy });
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
      <button className="btn-action btn-import" onClick={() => setIsOpen(true)}>
        <span className="icon-wrapper"><Upload size={16} /></span>
        <span>Import</span>
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
              background: 'var(--accent)', // Use exact theme purple
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e3cc9e',
                  border: '1px solid rgba(227, 204, 158, 0.3)'
                }}>
                  <Clipboard size={24} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '600', letterSpacing: '-0.5px', color: '#ffffff' }}>Import Data</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', opacity: 0.9 }}>Paste your Excel data from clipboard (Ctrl+V)</p>
                </div>
              </div>
              <button 
                onClick={closeBox}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  transition: '0.2s'
                }}
                  onMouseOver={(e: any) => e.currentTarget.style.color = '#ffffff'}
                  onMouseOut={(e: any) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              
              {/* Select Options */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 4px', fontSize: '11px', color: 'var(--accent)', fontWeight: '600', zIndex: 2 }}>Financial Year</div>
                  <select 
                    value={importFy} onChange={e => {
                      setImportFy(e.target.value);
                      updateState({ financialYear: e.target.value });
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--accent)', fontSize: '14px', fontWeight: '600', outline: 'none', color: 'var(--accent)', cursor: 'pointer', backgroundColor: '#fff' }}
                  >
                    <option value="">Select FY</option>
                    {FY_LIST && FY_LIST.map((f: any) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 4px', fontSize: '11px', color: 'var(--accent)', fontWeight: '600', zIndex: 2 }}>Current Quarter</div>
                  <select 
                    value={importQuarter} onChange={e => setImportQuarter(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--accent)', fontSize: '14px', fontWeight: '600', outline: 'none', color: 'var(--accent)', cursor: 'pointer', backgroundColor: '#fff' }}
                  >
                    <option value="">Select Quarter</option>
                    <option value="Q1">Q1 (Apr-Jun)</option>
                    <option value="Q2">Q2 (Jul-Sep)</option>
                    <option value="Q3">Q3 (Oct-Dec)</option>
                    <option value="Q4">Q4 (Jan-Mar)</option>
                  </select>
                </div>

                <div style={{ position: 'relative', flex: 1 }}>
                  <div style={{ position: 'absolute', top: '-8px', left: '10px', background: 'white', padding: '0 4px', fontSize: '11px', color: 'var(--accent)', fontWeight: '600', zIndex: 2 }}>Select Month</div>
                  <select 
                    value={importMonth} onChange={e => {
                      setImportMonth(e.target.value);
                      updateState({ month: e.target.value });
                    }}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--accent)', fontSize: '14px', fontWeight: '600', outline: 'none', color: 'var(--accent)', cursor: 'pointer', backgroundColor: '#fff' }}
                  >
                    <option value="">Month</option>
                    {MONTHS && MONTHS.map((m: any) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  backgroundColor: 'var(--red-soft)',
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
                backgroundColor: 'white',
                border: '1px dashed var(--accent)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '0',
                  right: '0',
                  pointerEvents: 'none',
                  opacity: pasteText ? 0 : 1
                }}>
                  <div style={{ color: 'var(--accent)', fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>Click here and press Ctrl+V</div>
                  <div style={{ color: 'var(--accent)', fontSize: '14px', marginBottom: '12px' }}>Paste Excel data from your clipboard</div>
                  <div style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 'bold' }}>**Important: Please copy & paste the data ALONG WITH the header row. ⚠</div>
                </div>
                
                <div style={{
                  position: 'absolute',
                  left: '0',
                  right: '0',
                  bottom: '16px',
                  pointerEvents: 'none',
                  color: pastedData.rawRows.length > 0 ? 'var(--accent)' : 'var(--accent)',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: 0.8
                }}>
                  {pastedData.rawRows.length > 0 ? `${pastedData.rawRows.length} rows ready` : 'No rows pasted yet'}
                </div>

                <textarea
                  style={{
                    width: '100%',
                    height: '160px',
                    padding: '16px',
                    border: 'none',
                    resize: 'vertical',
                    minHeight: '160px',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    color: 'var(--text)',
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
              borderTop: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fff'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#111', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={replace} 
                  onChange={e => setReplace(e.target.checked)} 
                  style={{ cursor: 'pointer', accentColor: '#a88c56', width: '16px', height: '16px' }}
                />
                Replace existing data
              </label>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn"
                  style={{ padding: '0 16px', height: '38px', borderColor: 'var(--red)', color: 'var(--red)' }}
                  onClick={closeBox}
                >
                  Cancel
                </button>
                <button 
                  className="btn-action btn-import"
                  style={{
                    opacity: pastedData.rawRows.length > 0 && importFy && importQuarter && importMonth ? 1 : 0.6
                  }}
                  onClick={handleImportClick}
                  disabled={importing || pastedData.rawRows.length === 0 || !importFy || !importQuarter || !importMonth}
                >
                  <span className="icon-wrapper"><Database size={16} /></span>
                  <span>{importing ? 'Importing...' : 'Import Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}









