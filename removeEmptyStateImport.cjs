const fs = require('fs');
let code = fs.readFileSync('src/components/EmptyState.jsx', 'utf8');
code = code.replace(/<button className="btn primary" onClick=\{.*?navigate\('\/import'\).*?>\s*<Upload size=\{14\} \/> Import data\s*<\/button>/g, '');
code = code.replace(/, Upload/g, '');
code = code.replace(/Upload, /g, '');
fs.writeFileSync('src/components/EmptyState.jsx', code);
console.log('Removed from empty state');
