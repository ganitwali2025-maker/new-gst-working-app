const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../src/components/views');
const commonDir = path.join(__dirname, '../src/components/common');

// 1. Revert fix_ui.js changes
const viewFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));
for (const file of viewFiles) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Revert KPI card colors
  content = content.replace(/color="var\(--accent\)"\s*\/>/g, 'color="var(--purple)" />');
  
  // Revert headers
  // The structure to revert:
  // <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>\s*<div style={{ width: '40px'.*?<\/svg>\s*<\/div>\s*<h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var\(--text\)', letterSpacing: '-0.01em' }}>(.*?)<\/h3>\s*<\/div>
  const headerRegex = /<div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>\s*<div style={{ width: '40px'[\s\S]*?<\/svg>\s*<\/div>\s*<h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var\(--text\)', letterSpacing: '-0.01em' }}>([\s\S]*?)<\/h3>\s*<\/div>/g;
  content = content.replace(headerRegex, `<h3 style={{ color: 'var(--purple)', fontSize: '24px', fontWeight: 'bold' }}>$1</h3>`);

  // Revert buttons
  // lock buttons
  content = content.replace(
    /background: 'var\(--accent\)'/g,
    "background: isLocked ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #10B981, #059669)'"
  );
  // clear buttons
  content = content.replace(
    /background: '#ffffff',\s*color: 'var\(--red\)',\s*border: '1px solid var\(--border\)'/g,
    "background: 'linear-gradient(90deg, #EF4444, #DC2626)', color: '#fff', border: 'none'"
  );
  // refresh buttons
  content = content.replace(
    /background: '#ffffff',\s*color: 'var\(--text\)',\s*border: '1px solid var\(--border\)'/g,
    "background: 'linear-gradient(90deg, var(--purple), #6D28D9)', color: '#fff', border: 'none'"
  );
  // books purchase import refresh button
  content = content.replace(
    /background: '#ffffff',\s*color: 'var\(--blue\)',\s*border: '1px solid var\(--border\)'/g,
    "background: 'linear-gradient(90deg, #3B82F6, #2563EB)', color: '#fff', border: 'none'"
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Reverted ${file}`);
  }
}

// 2. Revert common components
const importBoxPath = path.join(commonDir, 'ImportBox.tsx');
if (fs.existsSync(importBoxPath)) {
  let content = fs.readFileSync(importBoxPath, 'utf-8');
  content = content.replace(
    /background: "var\(--accent\)", color: "#fff", border: "none", boxShadow: "0 2px 4px rgba\(234, 88, 12, 0.15\)"/,
    'background: "linear-gradient(90deg, #3B82F6, #2563EB)", color: "#fff", border: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"'
  );
  content = content.replace(
    /background: '#ffffff', borderBottom: '1px solid #EAE6E1'/,
    "background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'"
  );
  content = content.replace(/color: 'var\(--text\)',\s*position: 'relative'/g, "color: 'white',\n              position: 'relative'");
  fs.writeFileSync(importBoxPath, content, 'utf-8');
}

const dtPath = path.join(commonDir, 'DataTable.tsx');
if (fs.existsSync(dtPath)) {
  let content = fs.readFileSync(dtPath, 'utf-8');
  content = content.replace(
    /background: '#F8F9FA', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #EAE6E1'/,
    "background: 'linear-gradient(to right, #e8f7f0, #fff)', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #e8f7f0'"
  );
  content = content.replace(
    /background: 'var\(--accent-soft\)', color: 'var\(--accent\)'/,
    "background: '#0fa958', color: '#fff'"
  );
  fs.writeFileSync(dtPath, content, 'utf-8');
}

const invoicePath = path.join(commonDir, 'InvoiceViewModal.tsx');
if (fs.existsSync(invoicePath)) {
  let content = fs.readFileSync(invoicePath, 'utf-8');
  content = content.replace(
    /borderBottom: '1px solid #EAE6E1', background: '#F8F9FA'/,
    "borderBottom: '1px solid #eee', background: 'linear-gradient(to right, #f5f3ff, #fff)'"
  );
  content = content.replace(
    /background: 'var\(--accent-soft\)', color: 'var\(--accent\)'/,
    "background: '#7C3AED', color: '#fff'"
  );
  fs.writeFileSync(invoicePath, content, 'utf-8');
}
