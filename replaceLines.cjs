const fs = require('fs');
let lines = fs.readFileSync('src/pages/Import.jsx', 'utf8').split('\n');

const newUI = `          <div className="dropzone" style={{ display: 'flex', flexDirection: 'column', padding: '20px', alignItems: 'center' }}>
            <Clipboard size={26} style={{ color: 'var(--muted)', marginBottom: '10px' }} />
            <div className="t1">Paste your Excel data here</div>
            <textarea 
              placeholder="Click here and press Ctrl+V"
              style={{ width: '100%', height: '120px', resize: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', fontSize: '13px', marginTop: '15px' }}
              onPaste={handlePaste}
            />
          </div>`;

// Replace lines 329 to 343 (indices 329 to 343)
lines.splice(329, 15, newUI);

fs.writeFileSync('src/pages/Import.jsx', lines.join('\n'));
console.log('Replaced by line numbers successfully');
