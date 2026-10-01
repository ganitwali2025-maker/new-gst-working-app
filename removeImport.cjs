const fs = require('fs');
let code = fs.readFileSync('src/pages/GenericTablePage.jsx', 'utf8');
code = code.replace(/<button className="btn ghost">\s*<Upload size=\{14\} \/> Import Data\s*<\/button>/g, '');
fs.writeFileSync('src/pages/GenericTablePage.jsx', code);
console.log('Removed successfully');
