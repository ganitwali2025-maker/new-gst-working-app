import React from 'react';
import { Sliders } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../common/Toast';
import UserManagement from './UserManagement';

export default function Settings() {
  const { settings, updateSettings } = useAppContext() as any;
  const { showToast } = (useToast() || {}) as any;

  const handleToleranceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ tolerance: Number(e.target.value) });
    showToast?.('Tolerance updated');
  };

  const handleNormToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ normalizeInvoice: e.target.checked });
    showToast?.('Setting updated');
  };

  return (
    <div className="settings-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 2. MATCHING RULES CARD */}
      <div 
        className="panel" 
        style={{ 
          background: '#ffffff', 
          borderRadius: '12px', 
          border: '1px solid var(--border)', 
          boxShadow: 'var(--shadow-sm)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ 
            background: '#f5f3ff', 
            color: '#7c3aed', 
            padding: '10px', 
            borderRadius: '10px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sliders size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
              Matching Rules
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
              Differences within tolerance threshold still count as Matched
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rounding Tolerance */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '14px 18px',
              borderRadius: '8px',
              background: 'var(--panel-2)',
              border: '1px solid var(--border-soft)'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Rounding Tolerance</div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                Differences within this amount still count as Matched.
              </div>
            </div>
            <select 
              className="ctrl" 
              value={settings?.tolerance ?? 2} 
              onChange={handleToleranceChange}
              style={{ minWidth: '120px', fontWeight: 600, cursor: 'pointer' }}
            >
              {[0, 1, 2, 5, 10].map(v => (
                <option key={v} value={v}>₹{v}</option>
              ))}
            </select>
          </div>

          {/* Normalize Invoice Numbers */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '14px 18px',
              borderRadius: '8px',
              background: 'var(--panel-2)',
              border: '1px solid var(--border-soft)'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>Normalize Invoice Numbers</div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                Ignore special characters and zeroes when matching.
              </div>
            </div>
            <label className="toggle" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={!!settings?.normalizeInvoice} 
                onChange={handleNormToggle} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. USER MANAGEMENT & ACCESS PERMISSIONS */}
      <UserManagement />
    </div>
  );
}
