const fs = require('fs');
let lines = fs.readFileSync('src/pages/Import.jsx', 'utf8').split('\n');

const newUI = `        {/* HIDING MAPPING UI AS REQUESTED BY USER */}
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
        </div>`;

// Replace lines 259 to 289
lines.splice(258, 31, newUI);

fs.writeFileSync('src/pages/Import.jsx', lines.join('\n'));
console.log('Replaced mapping UI successfully');
