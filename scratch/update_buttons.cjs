const fs = require('fs');
const path1 = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/GenericTablePage.tsx';
let content = fs.readFileSync(path1, 'utf8');

content = content.replace(
  /<button\s+className="btn"\s+onClick={\(\) => toggleLock\(type\)}\s*>\s*\{isLocked \? <><Lock size={14} \/> Locked<\/> : <><Unlock size={14} \/> Lock Sheet<\/>\}\s*<\/button>/g,
  '<button className="btn-action btn-lock" onClick={() => toggleLock(type)}><span className="icon-wrapper">{isLocked ? <Lock size={16} /> : <Unlock size={16} />}</span><span>{isLocked ? "Locked" : "Lock Sheet"}</span></button>'
);

content = content.replace(
  /<button\s+className="btn"\s+onClick={\(\) => \{\s*if \(window\.confirm\(`Are you sure you want to clear data for \$\{month\} \$\{financialYear\}\?`\)\) \{\s*clearCurrentPeriod\(type\);\s*\}\s*\}\}\s*>\s*Clear Data\s*<\/button>/g,
  '<button className="btn-action btn-clear" onClick={() => { if (window.confirm(`Are you sure you want to clear data for ${month} ${financialYear}?`)) { clearCurrentPeriod(type); } }}><span className="icon-wrapper"><Trash2 size={16} /></span><span>Clear Data</span></button>'
);

content = content.replace(
  /<button\s+className="btn"\s+onClick={handlePullFromSheets}\s+disabled={isSyncing}\s*>\s*\{isSyncing \? "Refreshing\.\.\." : "Refresh"\}\s*<\/button>/g,
  '<button className="btn-action btn-refresh" onClick={handlePullFromSheets} disabled={isSyncing}><span className="icon-wrapper"><RefreshCw size={16} /></span><span>{isSyncing ? "Refreshing..." : "Refresh"}</span></button>'
);

fs.writeFileSync(path1, content);
console.log("Updated GenericTablePage.tsx");

const path2 = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/common/ImportBox.tsx';
let content2 = fs.readFileSync(path2, 'utf8');

content2 = content2.replace(
  /<button className="btn primary" onClick={\(\) => setIsOpen\(true\)}>\s*<Upload size={14} \/> Import\s*<\/button>/g,
  '<button className="btn-action btn-import" onClick={() => setIsOpen(true)}><span className="icon-wrapper"><Upload size={16} /></span><span>Import</span></button>'
);

fs.writeFileSync(path2, content2);
console.log("Updated ImportBox.tsx");
