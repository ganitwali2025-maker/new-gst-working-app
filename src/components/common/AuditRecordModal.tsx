import React from 'react';
import { X, ClipboardList, FileText, Calendar, User, Building2, Trash2, Save } from 'lucide-react';

export default function AuditRecordModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '650px',
        maxHeight: '95vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.15)', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '24px 32px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ 
              background: '#10b981', color: '#fff', width: '48px', height: '48px', 
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1e293b', fontWeight: 700 }}>Audit Record</h1>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Enter the details of the invoice for audit tracking</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', 
            borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '8px 32px 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="#10b981" /> Invoice No <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="INV-260908" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#10b981" /> Date <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="10/09/2026" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="#10b981" /> GSTIN <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="29HIJKL8901N1ZC" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="#10b981" /> Supplier Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="Krishna Enterprises" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>₹</span> Taxable Value <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="200000" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#10b981', fontSize: '16px', fontWeight: 'bold' }}>%</span> IGST <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="200000" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="#10b981" /> CGST <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="200000" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="#10b981" /> SGST <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input type="text" defaultValue="200000" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', outline: 'none' }} />
          </div>

        </div>

        {/* Footer */}
        <div style={{ 
          background: '#f8fafc', padding: '16px 32px', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
        }}>
          <button style={{ 
            background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 16px', borderRadius: '8px', 
            fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
          }}>
            <Trash2 size={16} /> Delete Record
          </button>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onClose} style={{ 
              background: 'transparent', color: '#1e293b', border: 'none', padding: '10px 16px', 
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
            }}>
              <X size={16} /> Cancel
            </button>
            <button style={{ 
              background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', 
              fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
            }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
