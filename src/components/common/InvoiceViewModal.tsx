import React from 'react';
import { X, FileText, BarChart3, CloudDownload, Repeat, Calendar, Building2, Info } from 'lucide-react';
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

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#faf8fc', borderRadius: '16px', width: '100%', maxWidth: '950px',
        maxHeight: '95vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)', position: 'relative',
        border: '1px solid #e9d5ff'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', background: '#f3f0ff',
          border: '1px solid #e9d5ff', cursor: 'pointer', color: '#4c1d95', zIndex: 10,
          borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Top Header */}
        <div style={{ 
          padding: '24px 32px 20px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <h1 style={{ margin: '0 0 2px 0', fontSize: '26px', color: '#312e81', fontWeight: 800, letterSpacing: '-0.5px' }}>GST RecoManager</h1>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Smart GST Reconciliation & Reporting</p>
              
              {/* Feature Pill */}
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '12px', 
                background: '#f3f0ff', padding: '6px 16px', borderRadius: '20px',
                fontSize: '12px', color: '#4c1d95', fontWeight: 600
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CloudDownload size={14} /> Import</div>
                <div style={{ width: '1px', height: '12px', background: '#d8b4fe' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Repeat size={14} /> Reconcile</div>
                <div style={{ width: '1px', height: '12px', background: '#d8b4fe' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Generate Report</div>
              </div>
            </div>
          </div>
          
          <div style={{ width: '310px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d8b4fe', boxShadow: '0 4px 6px rgba(76, 29, 149, 0.05)', marginTop: '12px', marginRight: '32px' }}>
            <div style={{ display: 'flex', background: '#f3f0ff', borderBottom: '1px solid #d8b4fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', width: '130px', color: '#4c1d95', fontSize: '13px', fontWeight: 600, borderRight: '1px solid #d8b4fe', whiteSpace: 'nowrap' }}>
                <Calendar size={16} /> Invoice Date
              </div>
              <div style={{ padding: '8px 14px', color: '#1e293b', fontSize: '13px', fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.invoiceDate || 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', background: '#4c1d95' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', width: '130px', color: '#fff', fontSize: '13px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
                <FileText size={16} /> Invoice No.
              </div>
              <div style={{ padding: '8px 14px', color: '#fff', fontSize: '13px', fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.invoiceNo || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '0 32px 24px 32px' }}>
          
          {/* Seller / Buyer Box */}
          <div style={{ 
            display: 'flex', background: '#fff', border: '1px solid #e9d5ff', 
            borderRadius: '12px', padding: '24px', marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(76, 29, 149, 0.03)'
          }}>
            <div style={{ flex: 1, display: 'flex', gap: '16px', paddingRight: '24px' }}>
              <div style={{ background: '#f3f0ff', color: '#4c1d95', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={24} />
              </div>
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#4c1d95', fontWeight: 700 }}>{seller.name}</h2>
                <p style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '13px', lineHeight: '1.5' }}>{seller.address}</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '13px' }}>GSTIN: <span style={{ fontWeight: 700, color: '#1e293b' }}>{seller.gstin}</span></p>
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', gap: '16px', paddingLeft: '24px', borderLeft: '1px solid #e9d5ff' }}>
              <div style={{ background: '#ecfdf5', color: '#059669', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#4c1d95', fontWeight: 800, textTransform: 'uppercase' }}>BILL TO</p>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e293b', fontWeight: 700 }}>{buyer.name}</h2>
                <p style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '13px', lineHeight: '1.5' }}>{buyer.address}</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '13px' }}>GSTIN: <span style={{ fontWeight: 700, color: '#1e293b' }}>{buyer.gstin}</span></p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ border: '1px solid #e9d5ff', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: '#5b21b6', color: '#fff' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.1)' }}>GST No.</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.1)' }}>Taxable Amount (₹)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.1)' }}>IGST (₹)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.1)' }}>CGST (₹)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.1)' }}>SGST (₹)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.1)' }}>Total GST (₹)</th>
                  <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600 }}>Total Value (₹)</th>
                </tr>
              </thead>
              <tbody style={{ background: '#fff' }}>
                <tr>
                  <td style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>{buyer.gstin}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#1e293b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>{fmtINR(taxable).replace('₹', '').trim()}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#334155', borderRight: '1px solid #f1f5f9' }}>{fmtINR(igst).replace('₹', '').trim()}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#1e293b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>{fmtINR(cgst).replace('₹', '').trim()}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#1e293b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>{fmtINR(sgst).replace('₹', '').trim()}</td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#1e293b', fontWeight: 700, borderRight: '1px solid #f1f5f9', background: '#faf5ff' }}>{fmtINR(totalTax).replace('₹', '').trim()}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#4c1d95', fontWeight: 800, background: '#f3f0ff' }}>{fmtINR(totalInvoice).replace('₹', '').trim()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left Area - Bank & Notes */}
            <div style={{ flex: 1, paddingRight: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* GST Notes */}
              <div style={{ padding: '16px', background: '#fff', border: '1px dashed #d8b4fe', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4c1d95', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>GST Declarations</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Tax Payable on RCM:</span>
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>No</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>ITC Eligibility:</span>
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>Eligible</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Place of Supply:</span>
                    <span style={{ color: '#1e293b', fontWeight: 600 }}>As per GSTIN</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', background: '#f8f6ff', borderRadius: '8px' }}>
                <div style={{ background: '#4c1d95', color: '#fff', borderRadius: '50%', padding: '2px', display: 'flex', marginTop: '2px' }}>
                  <Info size={14} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                    <span style={{ fontWeight: 700, color: '#334155' }}>Terms & Conditions:</span><br/>
                    1. Goods once sold will not be taken back.<br/>
                    2. Interest @ 18% p.a. will be charged if payment is delayed.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Summary */}
            <div style={{ width: '320px', background: '#fff', borderRadius: '12px', border: '1px solid #e9d5ff', overflow: 'hidden', boxShadow: '0 2px 8px rgba(76, 29, 149, 0.03)' }}>
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Taxable Amount</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{fmtINR(taxable)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>IGST (0%)</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{fmtINR(igst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>CGST (9%)</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{fmtINR(cgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>SGST (9%)</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{fmtINR(sgst)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 700 }}>Total GST</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>{fmtINR(totalTax)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#f3f0ff', borderTop: '1px solid #e9d5ff' }}>
                <span style={{ fontSize: '16px', color: '#4c1d95', fontWeight: 800 }}>Total Value (₹)</span>
                <span style={{ fontSize: '18px', color: '#4c1d95', fontWeight: 800 }}>{fmtINR(totalInvoice)}</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div style={{ 
          background: 'linear-gradient(to right, #e9d5ff, #f8f6ff)', 
          padding: '16px 32px', 
          borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px',
          display: 'flex', alignItems: 'center', gap: '16px', color: '#4c1d95'
        }}>
          <div style={{ background: '#4c1d95', color: '#fff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px' }}>GST RecoManager</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b21a8', fontWeight: 500, opacity: 0.9 }}>Smart GST Reconciliation &nbsp;|&nbsp; Accurate Reports &nbsp;|&nbsp; Business Ready</p>
          </div>
        </div>

      </div>
    </div>
  );
}
