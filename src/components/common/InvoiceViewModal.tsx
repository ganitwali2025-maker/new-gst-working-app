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
          borderBottom: '1px solid #eee', background: 'linear-gradient(to right, #f5f3ff, #fff)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#7C3AED', color: '#fff', padding: '8px', borderRadius: '8px' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#1e1b4b', fontWeight: 700 }}>Invoice View</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                {isGstr1 ? 'GSTR-1 Sales Register' : 'Books ITC Purchase Register'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn ghost" style={{ color: '#7C3AED', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
            <button className="btn ghost" style={{ color: '#7C3AED', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#6D28D9', fontWeight: 800 }}>{seller.name}</h1>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '13px', lineHeight: '1.5' }}>
                {seller.address}
              </p>
            </div>
            <div style={{ background: '#f5f3ff', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 2px 0', color: '#6D28D9', fontSize: '16px', fontWeight: 800 }}>TAX INVOICE</h3>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '11px' }}>Original for Recipient</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
              <div style={{ color: '#9333ea' }}><Building2 size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>GSTIN</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#111827', fontWeight: 700 }}>{seller.gstin}</p>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
              <div style={{ color: '#9333ea' }}><FileText size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Invoice No</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#111827', fontWeight: 700 }}>{row.invoiceNo || 'N/A'}</p>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #f3e8ff' }}>
              <div style={{ color: '#9333ea' }}><Calendar size={20} /></div>
              <div>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Invoice Date</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', color: '#111827', fontWeight: 700 }}>{row.invoiceDate || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <div style={{ width: '100%' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>Taxable Value</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: 700 }}>{fmtINR(taxable)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>IGST</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: 700 }}>{fmtINR(igst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>CGST</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: 700 }}>{fmtINR(cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>SGST</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: 700 }}>{fmtINR(sgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#faf5ff', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '15px', color: '#6D28D9', fontWeight: 600 }}>Total Tax</span>
                  <span style={{ fontSize: '15px', color: '#6D28D9', fontWeight: 800 }}>{fmtINR(totalTax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: '#f3e8ff' }}>
                  <span style={{ fontSize: '16px', color: '#6D28D9', fontWeight: 700 }}>Total Invoice Value</span>
                  <span style={{ fontSize: '18px', color: '#6D28D9', fontWeight: 800 }}>{fmtINR(totalInvoice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#111827', fontWeight: 700 }}>Amount in Words</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>{numberToWords(totalInvoice)}</p>
            </div>
            <button className="btn" style={{ padding: '10px 24px', background: '#fff', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
