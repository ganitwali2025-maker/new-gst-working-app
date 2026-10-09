const fs = require('fs');

function updateFile(p) {
  let content = fs.readFileSync(p, 'utf8');

  // Replace Lock Sheet button
  content = content.replace(
    /<button\s+className="btn"\s+style=\{\{[\s\S]*?\}\}\s*onClick=\{\(\) => toggleLock\('.*?'\)\}\s*>\s*\{isLocked \? <><Lock size=\{14\} \/> Locked<\/> : <><Unlock size=\{14\} \/> Lock Sheet<\/>\}\s*<\/button>/g,
    (match) => {
      const typeMatch = match.match(/toggleLock\('(.*?)'\)/);
      const type = typeMatch ? typeMatch[1] : 'rcm';
      return `<button className="btn-action btn-lock" onClick={() => toggleLock('${type}')}>
              <span className="icon-wrapper">
                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              </span>
              <span>{isLocked ? 'Locked' : 'Lock Sheet'}</span>
            </button>`;
    }
  );

  // Replace Clear Data button in RcmView
  content = content.replace(
    /<button\s+className="btn"\s+style=\{\{[\s\S]*?\}\}\s*onClick=\{handleClear\}\s*>\s*Clear Data\s*<\/button>/g,
    `<button className="btn-action btn-clear" onClick={handleClear}>
              <span className="icon-wrapper"><Trash2 size={16} /></span>
              <span>Clear Data</span>
            </button>`
  );

  // Replace Refresh button in RcmView (fetchRcmFromSheets)
  content = content.replace(
    /<button\s+className="btn"\s+style=\{\{[\s\S]*?\}\}\s*onClick=\{async \(\) => \{\s*setIsSyncing\(true\);\s*try \{\s*if \(fetchRcmFromSheets\) await fetchRcmFromSheets\(\);\s*showToast\('RCM data refreshed from Sheets'\);\s*\} finally \{\s*setIsSyncing\(false\);\s*\}\s*\}\}\s*disabled=\{isSyncing\}\s*>\s*\{isSyncing \? "Refreshing\.\.\." : "Refresh"\}\s*<\/button>/g,
    `<button className="btn-action btn-refresh" onClick={async () => {
              setIsSyncing(true);
              try {
                if (fetchRcmFromSheets) await fetchRcmFromSheets();
                showToast('RCM data refreshed from Sheets');
              } finally {
                setIsSyncing(false);
              }
            }} disabled={isSyncing}>
              <span className="icon-wrapper"><RefreshCw size={16} /></span>
              <span>{isSyncing ? "Refreshing..." : "Refresh"}</span>
            </button>`
  );

  // Replace Refresh button in GSTR2B (handlePullFromSheets)
  content = content.replace(
    /<button\s+className="btn"\s+style=\{\{[\s\S]*?\}\}\s*onClick=\{handlePullFromSheets\}\s*disabled=\{isSyncing\}\s*>\s*\{isSyncing \? "Refreshing\.\.\." : "Refresh"\}\s*<\/button>/g,
    `<button className="btn-action btn-refresh" onClick={handlePullFromSheets} disabled={isSyncing}>
              <span className="icon-wrapper"><RefreshCw size={16} /></span>
              <span>{isSyncing ? "Refreshing..." : "Refresh"}</span>
            </button>`
  );

  // Ensure Trash2 and RefreshCw are imported from lucide-react if not present
  if (!content.includes('Trash2') && content.includes('<Trash2')) {
    content = content.replace("import { Lock, Unlock", "import { Lock, Unlock, Trash2, RefreshCw");
    content = content.replace("import { Download, Upload", "import { Download, Upload, Trash2, RefreshCw");
  }

  fs.writeFileSync(p, content);
}

const rcmPath = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/RcmView.tsx';
const gstr2bPath = 'c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views/GSTR2B.tsx';

updateFile(rcmPath);
updateFile(gstr2bPath);
console.log("Updated RCM and 2B All Month");
