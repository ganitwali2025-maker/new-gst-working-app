import React from 'react';
import { X, Printer, Download, FileText, Calendar, Building2 } from 'lucide-react';
import { fmtINR } from '../../utils/format';
import { useAppContext } from '../../context/AppContext';

export default function InvoiceViewModal({ row, type, onClose }: { row: any, type: string, onClose: () => void }) {
  const { activeCompany } = useAppContext() as any;

  if (!row) return null;

  const isGstr1 = type === 'gstr1';
  
  // Determine Seller and Buyer based on type
  const seller = isGstr1 
    ? { name: activeCompany?.name || 'Your Company', gstin: activeCompany?.gstin || '23AAAAA1234A1Z5', address: 'Madhya Pradesh, India' } 
    : { name: row.supplierName || 'Unknown Supplier', gstin: row.gstin || 'Unregistered', address: 'As per invoice' };
    
  const buyer = isGstr1 
    ? { name: row.supplierName || 'Unknown Buyer', gstin: row.gstin || 'Unregistered', address: 'As per invoice' } 
    : { name: activeCompany?.name || 'Your Company', gstin: activeCompany?.gstin || '23AAAAA1234A1Z5', address: 'Madhya Pradesh, India' };

  const taxable = Number(row.taxable) || 0;
  const igst = Number(row.igst) || 0;
  const cgst = Number(row.cgst) || 0;
  const sgst = Number(row.sgst) || 0;
  const cess = Number(row.cess) || 0;
  const totalTax = igst + cgst + sgst + cess;
  const totalInvoice = taxable + totalTax;


  // Function to convert number to words (simple version)
  const numberToWords = (num: number) => {
    if (num === 0) return 'Zero';
    // Very simple placeholder, usually requires a dedicated library for Indian numbering system
    return 'Rupees ' + fmtINR(num) + ' Only'; 
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '900px',
        maxHeight: '95vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)', background: 'var(--panel)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '8px', borderRadius: '8px' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text)', fontWeight: 600 }}>Invoice View</h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                {isGstr1 ? 'GSTR-1 Sales Register' : 'Books ITC Purchase Register'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn ghost" style={{ color: 'var(--accent)', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
            <button className="btn ghost" style={{ color: 'var(--accent)', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={16} /> Download
            </button>
            <button className="btn ghost" style={{ padding: '8px', color: '#1e1b4b' }} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '30px 40px', background: '#fff' }} className="print-area">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: 'var(--accent)', fontWeight: 600 }}>{seller.name}</h1>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px', lineHeight: '1.5' }}>
                {seller.address}
              </p>
            </div>
            <div style={{ background: 'var(--panel-2)', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 2px 0', color: 'var(--accent)', fontSize: '16px', fontWeight: 600 }}>TAX INVOICE</h3>
              <p style={{ margin: 0, color: 'var(--text)', fontSize: '11px' }}>Original for Recipient</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--panel-2)', borderRadius: '8px', border: '1px solid var(--accent-soft)' }}>
              <div style={{ color: 'var(--accent)' }}><Building2 size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>GSTIN</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{seller.gstin}</p>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--panel-2)', borderRadius: '8px', border: '1px solid var(--accent-soft)' }}>
              <div style={{ color: 'var(--accent)' }}><FileText size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Invoice No</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{row.invoiceNo || 'N/A'}</p>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--panel-2)', borderRadius: '8px', border: '1px solid var(--accent-soft)' }}>
              <div style={{ color: 'var(--accent)' }}><Calendar size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>Invoice Date</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{row.invoiceDate || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{ width: '100%' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>Taxable Value</span>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{fmtINR(taxable)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>IGST</span>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{fmtINR(igst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>CGST</span>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{fmtINR(cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>SGST</span>
                  <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{fmtINR(sgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--panel-2)', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: 600 }}>Total Tax</span>
                  <span style={{ fontSize: '15px', color: 'var(--accent)', fontWeight: 600 }}>{fmtINR(totalTax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--accent-soft)' }}>
                  <span style={{ fontSize: '16px', color: 'var(--accent)', fontWeight: 500 }}>Total Invoice Value</span>
                  <span style={{ fontSize: '18px', color: 'var(--accent)', fontWeight: 600 }}>{fmtINR(totalInvoice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>Amount in Words</p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>{numberToWords(totalInvoice)}</p>
            </div>
            <button className="btn" style={{ padding: '10px 24px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
