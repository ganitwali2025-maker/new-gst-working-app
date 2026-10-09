const fs = require('fs');
const path = require('path');

function fixFile(filepath, type) {
  let c = fs.readFileSync(filepath, 'utf8');
  let original = c;

  if (type === 'generic') {
    c = c.replace(
      /<div>\s*<div style=\{\{\s*display: 'flex',\s*alignItems: 'center',\s*gap: '14px',\s*marginBottom: '4px'\s*\}\}>\s*<div className="sheet-icon-box">\s*(<svg[\s\S]*?<\/svg>)\s*<\/div>\s*<h3 className="sheet-title">\s*([\s\S]*?)\s*<\/h3>\s*<\/div>\s*<div className="hint">(.*?)<\/div>\s*<\/div>/,
      `<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sheet-icon-box">
              $1
            </div>
            <div>
              <h3 className="sheet-title">
                $2
              </h3>
              <div className="sheet-subtitle">$3</div>
            </div>
          </div>`
    );
  } else if (type === 'rcm') {
    c = c.replace(
      /<div>\s*<div style=\{\{\s*display: 'flex',\s*alignItems: 'center',\s*gap: '14px',\s*marginBottom: '4px'\s*\}\}>\s*<div className="sheet-icon-box">\s*(<svg[\s\S]*?<\/svg>)\s*<\/div>\s*<h3 className="sheet-title">([\s\S]*?)<\/h3>\s*<\/div>\s*<div className="hint">(.*?)<\/div>\s*<\/div>/,
      `<div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="sheet-icon-box">
              $1
            </div>
            <div>
              <h3 className="sheet-title">$2</h3>
              <div className="sheet-subtitle">$3</div>
            </div>
          </div>`
    );
  } else if (type === 'gstr2b') {
    c = c.replace(
      /<div className="hint" style=\{\{\s*marginTop: '4px',\s*fontSize: '13px'\s*\}\}>(.*?)<\/div>/,
      `<div className="sheet-subtitle">$1</div>`
    );
  }

  if (c !== original) {
    fs.writeFileSync(filepath, c);
    console.log('Fixed', filepath);
  } else {
    console.log('No changes in', filepath);
  }
}

fixFile('c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/GenericTablePage.tsx', 'generic');
fixFile('c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/RcmView.tsx', 'rcm');
fixFile('c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/GSTR2B.tsx', 'gstr2b');
