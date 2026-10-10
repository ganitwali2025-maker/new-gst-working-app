// @ts-nocheck
import React, { useState } from 'react';
import { Badge } from './Badge';
import { fmtNum, esc } from '../../utils/format';
import { taxTotal, rowDataIssues } from '../../utils/invoice';
import { Edit2, Trash2, X, ClipboardList, Save, FileText, Calendar, User, Building, IndianRupee, Percent, Check, Undo, Eye, BookOpen, Landmark, CalendarDays, IdCard, Calculator, Link } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import InvoiceViewModal from './InvoiceViewModal';

const STATUS_META = {
  'Matched': { cls: 'green', dot: 'green' },
  'Amount Mismatch': { cls: 'yellow', dot: 'yellow' },
  'GST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Date Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Taxable Value Mismatch': { cls: 'yellow', dot: 'yellow' },
  'IGST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'CGST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'SGST Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Cess Mismatch': { cls: 'yellow', dot: 'yellow' },
  'Not in 2B': { cls: 'red', dot: 'red' },
  'Not in Books': { cls: 'blue', dot: 'blue' },
  'Duplicate Invoice': { cls: 'purple', dot: 'purple' },
  'Multiple Match / Possible Match': { cls: 'yellow', dot: 'yellow' },
};

const ResolveModal = ({ row, onResolve, onClose }) => {
  const [remark, setRemark] = useState('');
  const [action, setAction] = useState('Accept Match / Move to Final');

  const ACTIONS = [
    'Accept Match / Move to Final',
    'Mark as Mismatch',
    'Keep Pending',
    'Ignore / Duplicate',
  ];

  const handleSave = () => {
    onResolve(row.id, { action, remark });
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: 'var(--bg)', width: '400px', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Resolve Mismatch</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Resolution Action</label>
          <select className="ctrl" value={action} onChange={e => setAction(e.target.value)} style={{ width: '100%' }}>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Remark (Optional)</label>
          <input className="ctrl" style={{ width: '100%' }} value={remark} onChange={e => setRemark(e.target.value)} placeholder="e.g., Verified with supplier..." />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave}>Save Resolution</button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, isMismatch, isTotal, color }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: isTotal ? 'none' : '1px solid var(--border-soft)', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isTotal ? color : 'var(--muted)' }}>
        {Icon && <Icon size={16} color={isTotal ? color : 'var(--muted)'} />}
        <span style={{ fontSize: '13px', fontWeight: isTotal ? '600' : '400' }}>{label}</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: isTotal ? '700' : '600', color: isMismatch ? 'var(--red)' : (isTotal ? color : 'var(--text)'), fontFamily: label === 'GSTIN' ? 'monospace' : 'inherit' }}>
        {value}
      </div>
    </div>
  );
};

const checkMismatch = (b, g) => {
  if (b === undefined || b === null || g === undefined || g === null) return false;
  if (typeof b === 'number' && typeof g === 'number') {
    return Math.abs(b - g) > 1;
  }
  return String(b).trim().toLowerCase() !== String(g).trim().toLowerCase();
};

const MatchDetailsModal = ({ row, onClose }) => {
  const reconData = row.reconData;
  if (!reconData) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'var(--bg)', width: '1200px', maxWidth: '95vw', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ background: '#fff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'var(--panel)', color: 'var(--green)', padding: '10px', borderRadius: '50%' }}>
              <Link size={24} />
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: 'var(--text)' }}>Match Comparison: {reconData.invoiceNo || 'N/A'}</h2>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>Comparing Book Entry with Government 2B and All Months 2B</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={24} /></button>
        </div>
        
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px' }}>
            
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--green)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: 'var(--panel)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--green)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--green)' }}>
                  <div style={{ background: 'var(--green)', color: '#fff', padding: '8px', borderRadius: '50%' }}><BookOpen size={20} /></div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Books Entry</h3>
                </div>
                {reconData.bRowId && <Badge color="green" dot>Matched</Badge>}
              </div>
              {reconData.bRowId ? (
                <div>
                  <DetailRow icon={User} label="Supplier" value={reconData.supplierName || '—'} />
                  <DetailRow icon={IdCard} label="GSTIN" value={reconData.gstin || '—'} />
                  <DetailRow icon={Calendar} label="Date" value={reconData.invoiceDate || '—'} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtNum(reconData.booksTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtNum(reconData.booksIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtNum(reconData.booksCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtNum(reconData.booksSgst)} />
                  <div style={{ background: 'var(--green-soft)' }}>
                    <DetailRow icon={Calculator} label="Total Tax" value={fmtNum(reconData.booksTax)} isTotal color="var(--green)" />
                  </div>
                </div>
              ) : <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Not found in Books</div>}
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--accent)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: 'var(--accent-soft)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--purple)' }}>
                  <div style={{ background: 'var(--purple)', color: '#fff', padding: '8px', borderRadius: '50%' }}><Landmark size={20} /></div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Govt 2B (Current Month)</h3>
                </div>
                {reconData.g2bId && <Badge color={reconData.status === 'Matched' ? 'green' : 'orange'} dot>{reconData.status === 'Matched' ? 'Matched' : 'Mismatch'}</Badge>}
              </div>
              {reconData.g2bId ? (
                <div>
                  <DetailRow icon={User} label="Supplier" value={reconData.supplierName || '—'} />
                  <DetailRow icon={IdCard} label="GSTIN" value={reconData.gstin || '—'} />
                  <DetailRow icon={Calendar} label="Date" value={reconData.invoiceDate || '—'} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtNum(reconData.g2bTaxable)} isMismatch={checkMismatch(reconData.booksTaxable, reconData.g2bTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtNum(reconData.g2bIgst)} isMismatch={checkMismatch(reconData.booksIgst, reconData.g2bIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtNum(reconData.g2bCgst)} isMismatch={checkMismatch(reconData.booksCgst, reconData.g2bCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtNum(reconData.g2bSgst)} isMismatch={checkMismatch(reconData.booksSgst, reconData.g2bSgst)} />
                  <div style={{ background: 'var(--panel)' }}>
                    <DetailRow icon={Calculator} label="Total Tax" value={fmtNum(reconData.g2bTax)} isMismatch={checkMismatch(reconData.booksTax, reconData.g2bTax)} isTotal color="var(--purple)" />
                  </div>
                </div>
              ) : <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Not found in 2B Current Month</div>}
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--blue)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: 'var(--blue-soft)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--blue)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--blue)' }}>
                  <div style={{ background: 'var(--blue)', color: '#fff', padding: '8px', borderRadius: '50%' }}><CalendarDays size={20} /></div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Govt 2B (All Months)</h3>
                </div>
                {reconData.g2bAllId && <Badge color="green" dot>Matched</Badge>}
              </div>
              {reconData.g2bAllId ? (
                <div>
                  <DetailRow icon={User} label="Supplier" value={reconData.g2bAllSupplierName || '—'} isMismatch={checkMismatch(reconData.supplierName, reconData.g2bAllSupplierName)} />
                  <DetailRow icon={IdCard} label="GSTIN" value={reconData.g2bAllGstin || '—'} isMismatch={checkMismatch(reconData.gstin, reconData.g2bAllGstin)} />
                  <DetailRow icon={Calendar} label="Date" value={reconData.g2bAllInvoiceDate || '—'} isMismatch={checkMismatch(reconData.invoiceDate, reconData.g2bAllInvoiceDate)} />
                  <DetailRow icon={IndianRupee} label="Taxable Value" value={fmtNum(reconData.g2bAllTaxable)} isMismatch={checkMismatch(reconData.booksTaxable, reconData.g2bAllTaxable)} />
                  <DetailRow icon={Percent} label="IGST" value={fmtNum(reconData.g2bAllIgst)} isMismatch={checkMismatch(reconData.booksIgst, reconData.g2bAllIgst)} />
                  <DetailRow icon={Percent} label="CGST" value={fmtNum(reconData.g2bAllCgst)} isMismatch={checkMismatch(reconData.booksCgst, reconData.g2bAllCgst)} />
                  <DetailRow icon={Percent} label="SGST" value={fmtNum(reconData.g2bAllSgst)} isMismatch={checkMismatch(reconData.booksSgst, reconData.g2bAllSgst)} />
                  <div style={{ background: 'var(--panel)' }}>
                    <DetailRow icon={Calculator} label="Total Tax" value={fmtNum(reconData.g2bAllTax)} isMismatch={checkMismatch(reconData.booksTax, reconData.g2bAllTax)} isTotal color="var(--blue)" />
                  </div>
                </div>
              ) : <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Not found in 2B All Months</div>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const AuditModal = ({ row, type, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(row);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const Field = ({ icon: Icon, label, name, type="text" }) => (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--panel)', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ background: 'var(--panel)', color: 'var(--green)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <label style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 600 }}>
          {label} <span style={{ color: '#ef4444' }}>*</span>
        </label>
      </div>
      <input 
        name={name} 
        value={formData[name] || ''} 
        onChange={handleChange} 
        type={type}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '14px', outline: 'none' }} 
      />
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '640px', maxWidth: '95%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(to right, var(--panel), #fff)', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--panel)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ background: 'var(--green)', color: '#fff', padding: '12px', borderRadius: '12px' }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '20px', fontWeight: 500 }}>Audit Record</h3>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '2px' }}>Enter the details of the invoice for audit tracking</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#fff', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}><X size={20} /></button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', overflowY: 'auto' }}>
          <Field icon={FileText} label="Invoice No" name="invoiceNo" />
          <Field icon={Calendar} label="Date" name="invoiceDate" />
          <Field icon={User} label="GSTIN" name="gstin" />
          <Field icon={Building} label="Supplier Name" name="supplierName" />
          <Field icon={IndianRupee} label="Taxable Value" name="taxable" type="number" />
          <Field icon={Percent} label="IGST" name="igst" type="number" />
          <Field icon={FileText} label="CGST" name="cgst" type="number" />
          <Field icon={FileText} label="SGST" name="sgst" type="number" />
        </div>
        
        {/* Footer */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', background: 'var(--panel-2)' }}>
          <button onClick={() => { if (window.confirm('Are you sure you want to delete this record?')) { onDelete(type, row.id); onClose(); } }} style={{ background: 'var(--red-soft)', color: 'var(--red)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} /> Delete Record
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ background: 'var(--panel-2)', color: 'var(--text)', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <X size={18} /> Cancel
            </button>
            <button onClick={() => { onSave(type, row.id, formData); onClose(); }} style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(15, 169, 88, 0.2)' }}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function DataTable({ rows, isBooks, isRcm, opts = {}, dataType, type }) {
  const [auditRow, setAuditRow] = useState(null);
  const [invoiceViewRow, setInvoiceViewRow] = useState(null);
  const [resolveRow, setResolveRow] = useState(null);
  const [viewMatchRow, setViewMatchRow] = useState(null);
  const { updateRow, deleteRow, resolveMismatch, undoResolve, resolutions } = useAppContext();

  const safeRows = rows || [];
  const totalTaxable = safeRows.reduce((sum, r) => sum + (Number(r.taxable) || 0), 0);
  const totalIgst = safeRows.reduce((sum, r) => sum + (Number(r.igst) || 0), 0);
  const totalCgst = safeRows.reduce((sum, r) => sum + (Number(r.cgst) || 0), 0);
  const totalSgst = safeRows.reduce((sum, r) => sum + (Number(r.sgst) || 0), 0);
  const totalCess = safeRows.reduce((sum, r) => sum + (Number(r.cess) || 0), 0);
  const totalTax = safeRows.reduce((sum, r) => sum + taxTotal(r), 0);
  const totalInvoice = totalTaxable + totalTax;

  const getPriorityBadge = (r) => {
    const issues = rowDataIssues(r);
    const attention = !!opts.forceAttention || issues.length > 0;
    const title = opts.forceAttention 
      ? (opts.attentionReason || 'Needs attention') 
      : (issues.join('; ') || 'Looks complete');
    
    return (
      <Badge color={attention ? 'orange' : 'green'} dot title={title}>
        {attention ? 'Review' : 'OK'}
      </Badge>
    );
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
                        {isRcm || dataType === 'rcm' ? (
              <>
                <th>Month</th>
                <th>Quarter</th>
                <th style={{textAlign: "center"}}>Financial Year</th>
                <th>Entry Date</th>
                <th>Transporter Name</th>
                <th style={{textAlign: "center"}}>Transporter L.R. No.</th>
                <th className="num" style={{textAlign: "center"}}>Amount</th>
                <th className="num" style={{textAlign: "center"}}>IGST 5%</th>
                <th className="num" style={{textAlign: "center"}}>CGST 2.5%</th>
                <th className="num" style={{textAlign: "center"}}>SGST 2.5%</th>
                <th className="num" style={{textAlign: "center"}}>TOTAL TAX</th>
              </>
                        ) : ['gstr2b', 'g2b_gov'].includes(type || dataType) ? (
              <>
                <th>Month</th>
                <th>Quarter</th>
                <th style={{textAlign: "center"}}>Financial Year</th>
                <th>Date</th>
                <th>GSTIN of Supplier</th>
                <th>Trade / Legal Name</th>
                <th style={{textAlign: "center"}}>Invoice No</th>
                <th className="num" style={{textAlign: "center"}}>Invoice Value</th>
                <th className="num" style={{textAlign: "center"}}>Taxable Value</th>
                <th className="num" style={{textAlign: "center"}}>IGST</th>
                <th className="num" style={{textAlign: "center"}}>CGST</th>
                <th className="num" style={{textAlign: "center"}}>SGST</th>
                <th className="num no-print" style={{textAlign: "center"}}>CESS</th>
                <th className="num" style={{textAlign: "center"}}>Total Tax</th>
              </>
            ) : ['gstr1', 'books'].includes(type) ? (
              <>
                <th>Month</th>
                <th>Quarter</th>
                <th style={{textAlign: "center"}}>Financial Year</th>
                <th>Invoice Date</th>
                <th>{type === 'books' ? 'Name of Supplier' : 'Supplier / Party Name'}</th>
                <th>{type === 'books' ? 'GST No.' : 'GST No'}</th>
                <th style={{textAlign: "center"}}>Invoice No</th>
                <th className="num" style={{textAlign: "center"}}>{type === 'books' ? 'BESIC AS PER BOOK' : 'Taxable Value'}</th>
                <th className="num" style={{textAlign: "center"}}>{type === 'books' ? 'Integrated Tax (₹)' : 'IGST'}</th>
                <th className="num" style={{textAlign: "center"}}>{type === 'books' ? 'Central Tax (₹)' : 'CGST'}</th>
                <th className="num" style={{textAlign: "center"}}>{type === 'books' ? 'State Tax (₹)' : 'SGST'}</th>
                {type === 'books' && <th className="num no-print" style={{textAlign: "center"}}>Cess</th>}
                <th className="num" style={{textAlign: "center"}}>{type === 'books' ? 'Total Tax Amount (₹)' : 'Total Tax'}</th>
                <th className="num" style={{textAlign: "center"}}>{type === 'books' ? 'Total Invoice Value (₹)' : 'Total Invoice Value'}</th>
              </>
            ) : (
              <>

                <th>Status</th>
                <th style={{textAlign: "center"}}>Invoice No.</th>
                <th>Date</th>
                <th>{isBooks ? 'Supplier' : 'Supplier'} GSTIN</th>
                <th>Supplier Name</th>
                <th className="num" style={{textAlign: "center"}}>Taxable</th>
                <th className="num" style={{textAlign: "center"}}>IGST</th>
                <th className="num" style={{textAlign: "center"}}>CGST</th>
                <th className="num" style={{textAlign: "center"}}>SGST</th>
                <th className="num no-print" style={{textAlign: "center"}}>Cess</th>
                <th className="num" style={{textAlign: "center"}}>Total</th>
              </>
            )}
            {dataType && <th className="no-print" style={{ width: '60px', textAlign: 'center' }}>ACTION</th>}
          </tr>
        </thead>
        <tbody>
          {(!rows || rows.length === 0) ? (
            <tr>
              <td colSpan={100} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontSize: '15px' }}>
                No rows found.
              </td>
            </tr>
          ) : rows.map((r, i) => {
            let meta = STATUS_META[r.recoStatus];
            if (!meta && r.recoStatus) {
              if (r.recoStatus.startsWith('Matched')) meta = { cls: 'green', dot: 'green' };
              else if (r.recoStatus.includes('Invoice No. Not Match') || r.recoStatus === 'Not in 2B') meta = { cls: 'red', dot: 'red' };
              else if (r.recoStatus === 'Not in Book') meta = { cls: 'blue', dot: 'blue' };
              else meta = { cls: 'yellow', dot: 'yellow' };
            }
            meta = meta || { cls: 'grey', dot: 'grey' };
            if (isRcm || dataType === 'rcm') {
              return (
                <tr key={r.id || i}>
                  <td>{esc(r.month)}</td>
                  <td>{esc(r.quarter) === 'Q1' ? 'Q1 (Apr-Jun)' : esc(r.quarter) === 'Q2' ? 'Q2 (Jul-Sep)' : esc(r.quarter) === 'Q3' ? 'Q3 (Oct-Dec)' : esc(r.quarter) === 'Q4' ? 'Q4 (Jan-Mar)' : esc(r.quarter) || 'Q'}</td>
                  <td style={{textAlign: "center"}}>{esc(r.fy)}</td>
                  <td>{esc(r.entryDate || r.invoiceDate)}</td>
                  <td>{esc(r.transporterName || r.supplierName)}</td>
                  <td style={{textAlign: "center"}}>{esc(r.lrNo || r.invoiceNo)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.amount || r.taxable)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.igst)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.cgst)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.sgst)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(Number(r.igst || 0) + Number(r.cgst || 0) + Number(r.sgst || 0))}</td>
                  {dataType && (
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--purple)' }} onClick={() => setInvoiceViewRow(r)} title="View Row">
                          <Eye size={15} />
                        </button>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--blue)' }} onClick={() => setAuditRow(r)} title="Audit/Edit Row">
                          <Edit2 size={15} />
                        </button>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--red)' }} onClick={() => { if (window.confirm('Are you sure you want to delete this row?')) deleteRow(dataType, r.id); }} title="Delete Row">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            }
            if (['gstr2b', 'g2b_gov'].includes(type || dataType)) {
              return (
                <tr key={r.id || i}>
                  <td>{esc(r.month)}</td>
                  <td>{esc(r.quarter) === 'Q1' ? 'Q1 (Apr-Jun)' : esc(r.quarter) === 'Q2' ? 'Q2 (Jul-Sep)' : esc(r.quarter) === 'Q3' ? 'Q3 (Oct-Dec)' : esc(r.quarter) === 'Q4' ? 'Q4 (Jan-Mar)' : esc(r.quarter) || 'Q'}</td>
                  <td style={{textAlign: "center"}}>{esc(r.fy)}</td>
                  <td>{esc(r.invoiceDate)}</td>
                  <td className="mono">{esc(r.gstin)}</td>
                  <td>{esc(r.supplierName)}</td>
                  <td style={{textAlign: "center"}}>{esc(r.invoiceNo)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(Number(r.taxable || 0) + taxTotal(r))}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.taxable)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.igst)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.cgst)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.sgst)}</td>
                  <td className="num no-print" style={{textAlign: "center"}}>{fmtNum(r.cess)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(taxTotal(r))}</td>
                  {dataType && (
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--purple)' }} onClick={() => setInvoiceViewRow(r)} title="View Row">
                          <Eye size={15} />
                        </button>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--blue)' }} onClick={() => setAuditRow(r)} title="Audit/Edit Row">
                          <Edit2 size={15} />
                        </button>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--red)' }} onClick={() => { if (window.confirm('Are you sure you want to delete this row?')) deleteRow(dataType, r.id); }} title="Delete Row">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            }
            if (['gstr1', 'books'].includes(type)) {
              return (
                <tr key={r.id || i}>
                  <td>{esc(r.month)}</td>
                  <td>{esc(r.quarter) === 'Q1' ? 'Q1 (Apr-Jun)' : esc(r.quarter) === 'Q2' ? 'Q2 (Jul-Sep)' : esc(r.quarter) === 'Q3' ? 'Q3 (Oct-Dec)' : esc(r.quarter) === 'Q4' ? 'Q4 (Jan-Mar)' : esc(r.quarter) || 'Q'}</td>
                  <td style={{textAlign: "center"}}>{esc(r.fy)}</td>
                  <td>{esc(r.invoiceDate)}</td>
                  <td>{esc(r.supplierName)}</td>
                  <td className="mono">{esc(r.gstin)}</td>
                  <td style={{textAlign: "center"}}>{esc(r.invoiceNo)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.taxable)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.igst)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.cgst)}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(r.sgst)}</td>
                  {type === 'books' && <td className="num no-print" style={{textAlign: "center"}}>{fmtNum(r.cess)}</td>}
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(taxTotal(r))}</td>
                  <td className="num" style={{textAlign: "center"}}>{fmtNum(Number(r.taxable || 0) + taxTotal(r))}</td>
                  {dataType && (
                    <td className="no-print" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--purple)' }} onClick={() => setInvoiceViewRow(r)} title="View Row">
                          <Eye size={15} />
                        </button>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--blue)' }} onClick={() => setAuditRow(r)} title="Audit/Edit Row">
                          <Edit2 size={15} />
                        </button>
                        <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--red)' }} onClick={() => { if (window.confirm('Are you sure you want to delete this row?')) deleteRow(dataType, r.id); }} title="Delete Row">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            }
            return (
            <tr key={r.id || i}>

              <td>
                {r.recoStatus ? (
                  <Badge color={meta.cls} dot>
                    {r.recoStatus}
                  </Badge>
                ) : (
                  '—'
                )}
              </td>
              <td style={{textAlign: "center"}}>{esc(r.invoiceNo)}</td>
              <td>{esc(r.invoiceDate)}</td>
              <td className="mono">{esc(r.gstin)}</td>
              <td>{esc(r.supplierName)}</td>
              <td className="num" style={{textAlign: "center"}}>{fmtNum(r.taxable)}</td>
              <td className="num" style={{textAlign: "center"}}>{fmtNum(r.igst)}</td>
              <td className="num" style={{textAlign: "center"}}>{fmtNum(r.cgst)}</td>
              <td className="num" style={{textAlign: "center"}}>{fmtNum(r.sgst)}</td>
              <td className="num no-print" style={{textAlign: "center"}}>{fmtNum(r.cess)}</td>
              <td className="num" style={{textAlign: "center"}}>{fmtNum(Number(r.taxable || 0) + taxTotal(r))}</td>
              {dataType && (
                <td className="no-print" style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    {r.reconData && (r.reconData.bRowId || r.reconData.g2bId) && (
                      <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--purple)' }} onClick={() => setViewMatchRow(r)} title="View Match Details">
                        <Eye size={15} />
                      </button>
                    )}
                    <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--blue)' }} onClick={() => setAuditRow(r)} title="Edit Row">
                      <Edit2 size={15} />
                    </button>
                    <button className="btn ghost" style={{ padding: '6px', height: 'auto', minHeight: '0', color: 'var(--red)' }} onClick={() => { if (window.confirm('Are you sure you want to delete this row?')) deleteRow(dataType, r.id); }} title="Delete Row">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>

      </table>
      
      {invoiceViewRow && dataType && (
        <InvoiceViewModal
          row={invoiceViewRow}
          type={dataType}
          onClose={() => setInvoiceViewRow(null)}
        />
      )}

      {auditRow && dataType && (
        <AuditModal 
          row={auditRow} 
          type={dataType} 
          onClose={() => setAuditRow(null)} 
          onSave={updateRow} 
          onDelete={deleteRow} 
        />
      )}

      {resolveRow && (
        <ResolveModal
          row={resolveRow}
          onClose={() => setResolveRow(null)}
          onResolve={(id, res) => {
            resolveMismatch(id, res);
            setResolveRow(null);
          }}
        />
      )}

      {viewMatchRow && (
        <MatchDetailsModal
          row={viewMatchRow}
          onClose={() => setViewMatchRow(null)}
        />
      )}
    </div>
  );
}






