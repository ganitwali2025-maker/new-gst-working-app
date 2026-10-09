const fs = require('fs');
const path = require('path');

const viewsDir = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views';
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));

let changedFiles = 0;

files.forEach(f => {
  const p = path.join(viewsDir, f);
  let c = fs.readFileSync(p, 'utf8');
  let original = c;

  // Icon box
  c = c.replace(/<div\s+style=\{\{\s*width:\s*'(40|46)px',\s*height:\s*'\1px',\s*borderRadius:\s*'(10|12)px',\s*background:\s*'var\(--accent-soft\)',\s*color:\s*'var\(--accent\)',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'center'\s*\}\}>/g, '<div className="sheet-icon-box">');

  // Title
  c = c.replace(/<h3\s+style=\{\{\s*margin:\s*0,\s*fontSize:\s*'20px',\s*fontWeight:\s*600,\s*color:\s*'var\(--text\)',\s*letterSpacing:\s*'-0\.0[12]em'\s*\}\}>/g, '<h3 className="sheet-title">');

  if (c !== original) {
    fs.writeFileSync(p, c);
    changedFiles++;
    console.log('Updated', f);
  }
});

console.log('Total files updated:', changedFiles);
