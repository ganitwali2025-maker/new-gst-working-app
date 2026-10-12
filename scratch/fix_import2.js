const fs = require('fs');
let content = fs.readFileSync('src/components/common/ImportBox.tsx', 'utf8');

const correctBlock = \
    let updatedData = replace ? newRows : [...currentData, ...newRows];
    
    if (target === 'gstr1') {
      syncGstr1ToSheets(updatedData, "SYNC_ALL").catch(() => {
         showToast("Background sync failed. Please refresh and try again.", "error");
      });
    } else if (target === 'rcm') {
      if(syncRcmToSheets) {
        syncRcmToSheets(updatedData, "SYNC_ALL").catch(() => {
          showToast("Background sync failed. Please refresh and try again.", "error");
        });
      }
    } else if (target === 'books') {
      syncBooksToSheets(updatedData, "SYNC_ALL").catch(() => {
         showToast("Background sync failed. Please refresh and try again.", "error");
      });
    } else if (target === 'g2b_gov') {
      if (typeof syncGstr2bGovToSheets === 'function') {
        syncGstr2bGovToSheets(updatedData, "SYNC_ALL").catch(() => {
          showToast("Background sync failed. Please refresh and try again.", "error");
        });
      }
      let currentG2b = gstr2b || [];
      if (replace) {
        currentG2b = currentG2b.filter(r => !(r.companyId === activeCompanyId && r.fy === importFy && r.month === importMonth));
      }
      const updatedG2b = [...currentG2b, ...newRows.map(r => Object.assign({}, r, { id: String(Math.random()) }))];
      updateState({ gstr2b: updatedG2b });
    }
    
    updateState({ [storeKey]: updatedData, month: importMonth, financialYear: importFy });
    setImporting(false);
\;

content = content.replace(/let updatedData = replace \? newRows : \[\.\.\.currentData, \.\.\.newRows\];[\s\S]*?setImporting\(false\);/, correctBlock.trim());
fs.writeFileSync('src/components/common/ImportBox.tsx', content);
console.log('Fixed clean import box');
