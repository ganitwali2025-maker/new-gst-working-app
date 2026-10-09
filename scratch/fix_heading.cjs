const fs = require('fs');
const files = ['GenericTablePage.tsx', 'RcmView.tsx', 'GSTR2B.tsx'];
files.forEach(f => {
  const p = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/' + f;
  let c = fs.readFileSync(p, 'utf8');
  
  // Replace the icon div
  c = c.replace(/<div\s+style=\{\{\s*width:\s*'46px',\s*height:\s*'46px',\s*borderRadius:\s*'12px',\s*background:\s*'var\(--accent-soft\)',\s*color:\s*'var\(--accent\)',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'center'\s*\}\}>/g, '<div className="sheet-icon-box">');

  // Replace the h3 title
  c = c.replace(/<h3\s+style=\{\{\s*margin:\s*0,\s*fontSize:\s*'20px',\s*fontWeight:\s*600,\s*color:\s*'var\(--text\)',\s*letterSpacing:\s*'-0\.02em'\s*\}\}>/g, '<h3 className="sheet-title">');
  
  fs.writeFileSync(p, c);
});
console.log('Replaced headings in files');
