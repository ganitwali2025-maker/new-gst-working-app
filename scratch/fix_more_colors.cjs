const fs = require('fs');

function replaceMoreColors(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  let orig = c;
  
  // Grey / Border / Panel
  c = c.replace(/#e5e7eb/gi, 'var(--border)');
  c = c.replace(/#d1d5db/gi, 'var(--border)');
  c = c.replace(/#f8fafc/gi, 'var(--bg)');
  c = c.replace(/#f9fafb/gi, 'var(--panel-2)');
  c = c.replace(/#f3f4f6/gi, 'var(--panel-2)');
  c = c.replace(/#e2e8f0/gi, 'var(--border)');
  c = c.replace(/#64748b/gi, 'var(--muted)');
  c = c.replace(/#1e293b/gi, 'var(--text)');
  c = c.replace(/#eee/gi, 'var(--border)');
  c = c.replace(/#ccc/gi, 'var(--border)');

  // Import Box Purples
  c = c.replace(/#4C1D95/gi, 'var(--accent)');
  c = c.replace(/#A78BFA/gi, 'var(--accent)');
  
  // DataTable Greens
  c = c.replace(/#a3e6cd/gi, 'var(--green)');
  c = c.replace(/#f0f9f5/gi, 'var(--green-soft)');
  
  // DataTable Purples
  c = c.replace(/#d8b4e2/gi, 'var(--accent)');
  c = c.replace(/#f3e8f7/gi, 'var(--accent-soft)');
  c = c.replace(/#f7f2f9/gi, 'var(--panel)');
  
  // DataTable Blues
  c = c.replace(/#a3c2e6/gi, 'var(--blue)');
  c = c.replace(/#e8f0f7/gi, 'var(--blue-soft)');
  c = c.replace(/#f0f4f9/gi, 'var(--panel)');

  if (c !== orig) {
    fs.writeFileSync(filePath, c);
    console.log('Fixed more colors in', filePath);
  }
}

const files = [
  'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/common/DataTable.tsx',
  'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/common/ImportBox.tsx',
  'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/common/InvoiceViewModal.tsx'
];

files.forEach(replaceMoreColors);
